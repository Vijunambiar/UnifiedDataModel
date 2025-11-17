// dbt Model Generators
// Generates dbt YAML configurations and SQL models

export interface dbtModelConfig {
  modelName: string;
  modelType: "staging" | "transformation";
  sql?: string;
  yamlConfig: Record<string, any>;
}

export function generateStagingYAML(domain: string, sourceTable: string): string {
  return `# models/staging/${domain}/stg_${domain}_${sourceTable}.yml
version: 2

models:
  - name: stg_${domain}_${sourceTable}
    description: "Bronze → Staging: ${domain} data from FIS ${sourceTable} table"
    
    config:
      materialized: view
      schema: staging
      tags: ["staging", "${domain}", "critical"]
      
    source_config:
      source_name: fis_staging
      source_table: raw_${domain}
      
    column_mappings:
      # Define column transformations here
      # Example: 
      # - fis_column: CUSTOMER_ID
      #   target_column: customer_id
      #   data_type: varchar
      #   nullable: false
      #   transformation: "TRIM(UPPER(source))"
    
    audit_columns:
      - _load_timestamp
      - _source_system: "FIS"
      - _load_id
    
    validation_rules:
      - rule: unique_key_check
        columns: ["customer_id"]
      - rule: not_null_check
        columns: ["customer_id", "customer_name"]
    
    columns:
      - name: customer_id
        tests:
          - unique
          - not_null
`;
}

export function generateTransformationSQL(
  domain: string,
  modelName: string
): string {
  const sqlTemplates: Record<string, string> = {
    customer_dim: `
-- models/transformation/${domain}/dim_${domain}_customer.sql
{{
  config(
    materialized='table',
    tags=['gold', 'dimension', '${domain}'],
    unique_key='customer_key',
    on_schema_change='fail'
  )
}}

with source_data as (
  select
    {{ dbt_utils.surrogate_key(['silver.customer_id', 'silver.valid_from']) }} as customer_key,
    
    silver.customer_id,
    silver.customer_name,
    silver.date_of_birth,
    silver.customer_type,
    silver.country_code,
    silver.email,
    silver.phone,
    
    -- Calculated fields
    {{ calculate_age('silver.date_of_birth') }} as age,
    {{ segment_customer('silver.customer_type') }} as segment,
    {{ calculate_clv('silver.customer_id') }} as clv_usd,
    
    -- SCD Type 2 tracking
    silver._load_timestamp as valid_from,
    cast(null as timestamp_ntz) as valid_to,
    true as is_current,
    
    current_timestamp() as dbt_created_at,
    cast(null as timestamp_ntz) as dbt_updated_at
    
  from {{ ref('silver_customer_cleaned') }} as silver
)

select *
from source_data

{% if execute %}
  {% do log("Loaded " ~ rows_returned | int ~ " customer dimension records", info=true) %}
{% endif %}
    `,
    deposits_fact: `
-- models/transformation/${domain}/fct_${domain}_daily.sql
{{
  config(
    materialized='table',
    tags=['gold', 'fact', '${domain}'],
    unique_key=['date_key', 'account_key'],
    partition_by={
      "field": "date_key",
      "data_type": "int",
      "granularity": "day"
    }
  )
}}

with source_data as (
  select
    {{ dbt_utils.surrogate_key(['date_id']) }} as date_key,
    {{ dbt_utils.surrogate_key(['silver.account_id']) }} as account_key,
    {{ dbt_utils.surrogate_key(['silver.customer_id']) }} as customer_key,
    
    silver.account_id,
    silver.customer_id,
    silver.product_type,
    
    -- Numeric measures
    silver.opening_balance_usd,
    silver.deposits_in_usd,
    silver.withdrawals_out_usd,
    silver.closing_balance_usd,
    silver.interest_accrued,
    
    -- Metadata
    current_timestamp() as dbt_created_at
    
  from {{ ref('silver_deposit_accounts_daily') }} as silver
  join {{ ref('dim_date') }} using (date_id)
)

select *
from source_data
    `,
  };

  return sqlTemplates[modelName] || `-- dbt model SQL for ${modelName}`;
}

export function generateSchemaYAML(domain: string): string {
  return `# models/${domain}/schema.yml
version: 2

models:
  - name: dim_${domain}
    description: "${domain} dimension table"
    columns:
      - name: ${domain}_key
        description: "Surrogate key"
        tests:
          - unique
          - not_null
  
  - name: fct_${domain}_daily
    description: "${domain} fact table at daily grain"
    columns:
      - name: date_key
        tests:
          - not_null
          - relationships:
              to: ref('dim_date')
              field: date_key
    
    tests:
      - dbt_expectations.expect_table_row_count_to_be_between:
          min_value: 1000
          max_value: 10000000
`;
}

export function generatedbtProjectYAML(): string {
  return `# dbt_project.yml (ROOT LEVEL)
name: 'banking_data_models'
version: '1.0.0'
config-version: 2

profile: 'snowflake_production'

model-paths: ["models"]
analysis-paths: ["analysis"]
test-paths: ["tests"]
data-paths: ["data"]
macro-paths: ["macros"]
snapshot-paths: ["snapshots"]
target-path: "target"
clean-targets:
  - "target"
  - "dbt_modules"
  - "logs"

vars:
  dbt_database: "analytics_db"
  snowflake_warehouse: "transforming"
  audit_schema: "metadata_db"

models:
  banking_data_models:
    staging:
      materialized: view
      schema: staging
      tags: ["staging"]
      
    transformation:
      materialized: table
      schema: transformation
      tags: ["gold"]
      +pre-hook: "{{ audit_columns() }}"
      +post-hook: "{{ run_quality_checks() }}"
      
      customer:
        materialized: table
      
      deposits:
        materialized: table
      
      transactions:
        materialized: table

seeds:
  banking_data_models:
    +schema: seeds
    +column_types:
      product_id: varchar
      product_name: varchar

on-run-start:
  - "{{ log('Starting dbt run', info=true) }}"

on-run-end:
  - "{{ log('Completed dbt run', info=true) }}"
`;
}

export function generateTestYAML(domain: string): string {
  return `# tests/${domain}/${domain}_data_quality.yml
version: 2

models:
  - name: fct_${domain}_daily
    tests:
      - dbt_expectations.expect_table_row_count_to_equal_other_table:
          compare_model: ref('stg_${domain}_staging')
      - dbt_expectations.expect_table_columns_to_match_ordered_list:
          column_list: [date_key, customer_key, amount_usd]
    
    columns:
      - name: date_key
        tests:
          - unique
          - not_null
      
      - name: amount_usd
        tests:
          - not_null
          - dbt_expectations.expect_column_values_to_be_between:
              min_value: 0
              max_value: 1000000000

generic_tests:
  - dbt_expectations.expect_column_mean_to_be_between:
      column: amount_usd
      min_value: 100
      max_value: 50000
`;
}

export function exportdbtModel(config: dbtModelConfig): string {
  return JSON.stringify(config, null, 2);
}
