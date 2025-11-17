// Matillion Job Template Generators
// Generates Matillion job JSON configurations for ETL pipelines

export interface MatillionJobConfig {
  jobName: string;
  jobType: "SQL" | "Orchestration";
  description: string;
  schedule?: {
    frequency: "Daily" | "Hourly" | "Weekly";
    time?: string;
  };
  components: any[];
  errorHandling: {
    onFailure: "SEND_ALERT" | "STOP_PIPELINE" | "RETRY";
    retryCount?: number;
  };
}

export function generateExtractJob(domain: string): MatillionJobConfig {
  return {
    jobName: `Extract_${domain}_FIS`,
    jobType: "SQL",
    description: `Extract ${domain} domain data from FIS source system`,
    schedule: {
      frequency: "Daily",
      time: "05:00 UTC",
    },
    components: [
      {
        id: "source_fis",
        type: "FISSourceConnector",
        config: {
          connection: "FIS_PRODUCTION",
          sourceTable: getSourceTableForDomain(domain),
          incremental: false,
          columns: ["*"],
        },
      },
      {
        id: "add_metadata",
        type: "DataTransformation",
        config: {
          sql: `SELECT 
            *,
            CURRENT_TIMESTAMP() as _LOAD_TIMESTAMP,
            '${domain.toUpperCase()}' as _DOMAIN,
            'FIS' as _SOURCE_SYSTEM
          FROM source_fis`,
        },
      },
      {
        id: "validate_data",
        type: "DataValidation",
        config: {
          checks: [
            "NOT_NULL_KEYS",
            "DATA_TYPE_MATCH",
            "DUPLICATE_CHECK",
          ],
        },
      },
      {
        id: "target_staging",
        type: "SnowflakeTarget",
        config: {
          connection: "SNOWFLAKE_PRODUCTION",
          database: "STAGING_DB",
          schema: `${domain.toUpperCase()}_STAGING`,
          table: `RAW_${domain.toUpperCase()}`,
          mode: "REPLACE",
          createTableIfNotExists: true,
        },
      },
      {
        id: "error_handler",
        type: "ConditionalLogic",
        config: {
          condition: "validation_failed",
          action: "SEND_ALERT",
          alertEmail: "data-team@bank.com",
        },
      },
    ],
    errorHandling: {
      onFailure: "SEND_ALERT",
      retryCount: 2,
    },
  };
}

export function generateTransformationJob(domain: string): MatillionJobConfig {
  return {
    jobName: `Transform_${domain}_Silver`,
    jobType: "SQL",
    description: `Transform ${domain} domain from Bronze to Silver layer`,
    components: [
      {
        id: "read_bronze",
        type: "SnowflakeSource",
        config: {
          connection: "SNOWFLAKE_PRODUCTION",
          database: "STAGING_DB",
          schema: `${domain.toUpperCase()}_STAGING`,
          table: `RAW_${domain.toUpperCase()}`,
        },
      },
      {
        id: "clean_data",
        type: "DataTransformation",
        config: {
          sql: getCleaningSQL(domain),
        },
      },
      {
        id: "enrich_data",
        type: "DataTransformation",
        config: {
          sql: getEnrichmentSQL(domain),
        },
      },
      {
        id: "conform_data",
        type: "DataTransformation",
        config: {
          sql: getConformanceSQL(domain),
        },
      },
      {
        id: "target_silver",
        type: "SnowflakeTarget",
        config: {
          connection: "SNOWFLAKE_PRODUCTION",
          database: "TRANSFORMATION_DB",
          schema: `${domain.toUpperCase()}_TRANSFORMED`,
          table: `${domain.toUpperCase()}_CONFORMED`,
          mode: "REPLACE",
        },
      },
      {
        id: "log_metadata",
        type: "MetadataLogger",
        config: {
          logTable: "METADATA_DB.DOCUMENTATION.TRANSFORMATION_LOG",
          fields: ["domain", "record_count", "columns_processed", "timestamp"],
        },
      },
    ],
    errorHandling: {
      onFailure: "STOP_PIPELINE",
    },
  };
}

export function generateOrchestrationJob(domain: string): MatillionJobConfig {
  return {
    jobName: `${domain}_Daily_Pipeline`,
    jobType: "Orchestration",
    description: `Complete daily ETL pipeline for ${domain} domain`,
    schedule: {
      frequency: "Daily",
      time: "05:00 UTC",
    },
    components: [
      {
        id: "extract_task",
        type: "JobCall",
        config: {
          jobName: `Extract_${domain}_FIS`,
          waitForCompletion: true,
        },
      },
      {
        id: "transform_task",
        type: "JobCall",
        config: {
          jobName: `Transform_${domain}_Silver`,
          waitForCompletion: true,
          dependsOn: ["extract_task"],
        },
      },
      {
        id: "dbt_task",
        type: "dbtCoreOperator",
        config: {
          command: `dbt run --selector transformation_${domain}`,
          projectDir: "/opt/dbt_project",
          dependsOn: ["transform_task"],
        },
      },
      {
        id: "quality_task",
        type: "dbtCoreOperator",
        config: {
          command: `dbt test --selector ${domain}`,
          projectDir: "/opt/dbt_project",
          dependsOn: ["dbt_task"],
        },
      },
      {
        id: "refresh_pbi",
        type: "PowerBIRefresh",
        config: {
          datasetName: `${domain}_analytics`,
          dependsOn: ["quality_task"],
        },
      },
      {
        id: "success_notification",
        type: "Notification",
        config: {
          type: "SUCCESS",
          email: "data-team@bank.com",
          dependsOn: ["refresh_pbi"],
        },
      },
    ],
    errorHandling: {
      onFailure: "SEND_ALERT",
    },
  };
}

function getSourceTableForDomain(domain: string): string {
  const mapping: Record<string, string> = {
    customer: "CUST_MASTER",
    deposits: "DEP_ACCOUNTS",
    transactions: "TXN_HISTORY",
  };
  return mapping[domain] || "UNKNOWN_TABLE";
}

function getCleaningSQL(domain: string): string {
  const sqlTemplates: Record<string, string> = {
    customer: `
      SELECT 
        TRIM(UPPER(CUSTOMER_ID)) as customer_id,
        TRIM(PROPER_CASE(CUSTOMER_NAME)) as customer_name,
        TRY_TO_DATE(DOB, 'YYYY-MM-DD') as date_of_birth,
        CASE WHEN CUST_TYPE='I' THEN 'Individual' WHEN CUST_TYPE='C' THEN 'Corporate' ELSE 'Partnership' END as customer_type,
        LOWER(TRIM(EMAIL)) as email,
        REGEX_REPLACE(PHONE, '[^0-9+]', '') as phone,
        UPPER(COUNTRY) as country_code,
        CAST(ANNUAL_INCOME AS NUMERIC(15,2)) as annual_income,
        CAST(CREATION_DATE AS TIMESTAMP_NTZ) as created_at,
        _LOAD_TIMESTAMP
      FROM source_data
      WHERE CUSTOMER_ID IS NOT NULL
    `,
    deposits: `
      SELECT 
        TRIM(UPPER(ACCOUNT_ID)) as account_id,
        TRIM(UPPER(CUSTOMER_ID)) as customer_id,
        CASE WHEN PRODUCT_CODE='SAVE' THEN 'Savings' WHEN PRODUCT_CODE='CHCK' THEN 'Checking' ELSE 'Other' END as product_type,
        CAST(CLOSING_BALANCE AS NUMERIC(15,2)) as closing_balance_usd,
        CAST(INTEREST_RATE AS NUMERIC(5,3)) as interest_rate_pct,
        CAST(INTEREST_ACCRUED AS NUMERIC(15,4)) as interest_accrued,
        CASE WHEN ACCOUNT_STATUS='A' THEN 'Active' WHEN ACCOUNT_STATUS='I' THEN 'Inactive' ELSE 'Closed' END as account_status,
        TRY_TO_DATE(OPENING_DATE, 'YYYY-MM-DD') as opening_date,
        _LOAD_TIMESTAMP
      FROM source_data
      WHERE ACCOUNT_ID IS NOT NULL
    `,
    transactions: `
      SELECT 
        TRIM(UPPER(TRANSACTION_ID)) as transaction_id,
        TRIM(UPPER(CUSTOMER_ID)) as customer_id,
        CAST(TRANSACTION_AMOUNT AS NUMERIC(15,2)) as amount_usd,
        TRY_TO_DATE(TRANSACTION_DATE, 'YYYY-MM-DD') as transaction_date,
        CAST(TRANSACTION_TIME AS TIMESTAMP_NTZ) as transaction_timestamp,
        CASE WHEN TXN_TYPE='DB' THEN 'Debit' WHEN TXN_TYPE='CR' THEN 'Credit' ELSE 'Neutral' END as transaction_type,
        CASE WHEN PAYMENT_METHOD='ACH' THEN 'ACH' WHEN PAYMENT_METHOD='WIRE' THEN 'Wire' ELSE 'Other' END as payment_type,
        CASE WHEN CHANNEL='MOB' THEN 'Mobile' WHEN CHANNEL='WEB' THEN 'Online' ELSE 'Other' END as channel,
        CASE WHEN TXN_STATUS='C' THEN 'Completed' WHEN TXN_STATUS='F' THEN 'Failed' ELSE 'Pending' END as transaction_status,
        _LOAD_TIMESTAMP
      FROM source_data
      WHERE TRANSACTION_ID IS NOT NULL
    `,
  };
  return sqlTemplates[domain] || "-- Custom cleaning SQL for domain";
}

function getEnrichmentSQL(domain: string): string {
  const sqlTemplates: Record<string, string> = {
    customer: `
      SELECT 
        *,
        DATEDIFF(YEAR, date_of_birth, CURRENT_DATE) as age,
        CASE 
          WHEN DATEDIFF(YEAR, created_at, CURRENT_DATE) <= 1 THEN 'New'
          WHEN DATEDIFF(YEAR, created_at, CURRENT_DATE) <= 3 THEN 'Growing'
          ELSE 'Established'
        END as customer_tenure_segment
      FROM cleaned_data
    `,
    deposits: `
      SELECT 
        *,
        CASE 
          WHEN closing_balance_usd >= 100000 THEN 'Large'
          WHEN closing_balance_usd >= 10000 THEN 'Medium'
          ELSE 'Small'
        END as account_size_segment,
        DATEDIFF(DAY, opening_date, CURRENT_DATE) as days_since_opening
      FROM cleaned_data
    `,
    transactions: `
      SELECT 
        *,
        CASE 
          WHEN amount_usd >= 10000 THEN 'High Value'
          WHEN amount_usd >= 1000 THEN 'Medium Value'
          ELSE 'Low Value'
        END as transaction_value_segment
      FROM cleaned_data
    `,
  };
  return sqlTemplates[domain] || "-- Custom enrichment SQL for domain";
}

function getConformanceSQL(domain: string): string {
  return `
    SELECT 
      *,
      CURRENT_TIMESTAMP() as conformed_at
    FROM enriched_data
    WHERE 1=1
  `;
}

export function exportJobAsJSON(job: MatillionJobConfig): string {
  return JSON.stringify(job, null, 2);
}
