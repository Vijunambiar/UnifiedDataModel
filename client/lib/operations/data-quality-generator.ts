// Data Quality Generator
// Generates dbt test YAML configurations and Great Expectations rules

export interface QualityTestDefinition {
  testName: string;
  testType: string;
  columns: string[];
  severity: "error" | "warning";
  config: Record<string, any>;
}

export function generateQualityTestsYAML(domain: string): string {
  return `# tests/${domain}/${domain}_data_quality.yml
version: 2

models:
  - name: dim_${domain}
    description: "${domain} dimension"
    
    # Schema tests
    tests:
      - dbt_utils.recency:
          datepart: day
          interval: 1
          
      - dbt_expectations.expect_table_row_count_to_be_between:
          min_value: 100
          max_value: 100000000
          
      - dbt_expectations.expect_table_columns_to_match_ordered_list:
          column_list: [${domain}_key, ${domain}_id, created_at]
    
    columns:
      - name: ${domain}_key
        description: "Surrogate key"
        tests:
          - unique:
              config:
                severity: error
          - not_null:
              config:
                severity: error
      
      - name: ${domain}_id
        description: "Natural key from source"
        tests:
          - unique:
              where: "is_current = true"
          - not_null

  - name: fct_${domain}_daily
    description: "${domain} fact table"
    
    tests:
      - dbt_expectations.expect_table_row_count_to_equal_other_table:
          compare_model: ref('stg_${domain}_staging')
          tolerance_percent: 5
          
      - dbt_expectations.expect_table_columns_to_match_ordered_list:
          column_list: [date_key, ${domain}_key, amount_usd, transaction_count]
    
    columns:
      - name: date_key
        tests:
          - not_null
          - relationships:
              to: ref('dim_date')
              field: date_key
      
      - name: amount_usd
        tests:
          - not_null
          - dbt_expectations.expect_column_values_to_be_between:
              min_value: 0
              max_value: 10000000000
              config:
                severity: warning
          
          - dbt_expectations.expect_column_mean_to_be_between:
              min_value: 100
              max_value: 500000
      
      - name: transaction_count
        tests:
          - dbt_expectations.expect_column_values_to_be_of_type:
              column_type: int
          
          - dbt_expectations.expect_column_values_to_be_between:
              min_value: 0
              max_value: 1000000

# Generic tests applied across all models in this domain
generic_tests:
  - no_nulls_in_id_columns:
      column_name: "${domain}_id"
      
  - positive_amounts:
      column_name: "amount_usd"
      
  - valid_dates:
      date_column: "transaction_date"
      max_date_offset: 30  # Not more than 30 days in future
`;
}

export function generateGreatExpectationsConfig(domain: string): string {
  return `# great_expectations/expectations/${domain}_expectations.json
{
  "data_asset_type": "Dataset",
  "expectation_suite_name": "${domain}_suite",
  "meta": {
    "domain": "${domain}",
    "owner": "data-team@bank.com"
  },
  "expectations": [
    {
      "expectation_type": "expect_table_columns_to_match_set",
      "kwargs": {
        "column_set": [
          "${domain}_key",
          "${domain}_id",
          "created_at",
          "updated_at"
        ]
      }
    },
    {
      "expectation_type": "expect_column_values_to_not_be_null",
      "kwargs": {
        "column": "${domain}_id"
      }
    },
    {
      "expectation_type": "expect_column_distinct_count_to_be_between",
      "kwargs": {
        "column": "${domain}_id",
        "min_value": 1000,
        "max_value": 100000000
      }
    },
    {
      "expectation_type": "expect_column_proportion_of_unique_values_to_be_between",
      "kwargs": {
        "column": "${domain}_id",
        "min_value": 0.9,
        "max_value": 1.0
      }
    },
    {
      "expectation_type": "expect_column_value_lengths_to_be_between",
      "kwargs": {
        "column": "${domain}_id",
        "min_value": 1,
        "max_value": 20
      }
    }
  ]
}
`;
}

export function generateAnomalyDetectionSQL(domain: string): string {
  return `-- Anomaly Detection Query for ${domain} Domain
-- Identifies statistical outliers and unexpected patterns

SELECT
  'Mean Shift' as anomaly_type,
  ${domain}_key,
  measurement_date,
  amount_usd,
  AVG(amount_usd) OVER (
    ORDER BY measurement_date 
    ROWS BETWEEN 30 PRECEDING AND CURRENT ROW
  ) as rolling_avg_30d,
  STDDEV_POP(amount_usd) OVER (
    ORDER BY measurement_date 
    ROWS BETWEEN 30 PRECEDING AND CURRENT ROW
  ) as rolling_stddev_30d,
  ABS(amount_usd - rolling_avg_30d) / NULLIF(rolling_stddev_30d, 0) as z_score,
  CASE 
    WHEN ABS(z_score) > 3 THEN 'Critical'
    WHEN ABS(z_score) > 2 THEN 'High'
    WHEN ABS(z_score) > 1 THEN 'Medium'
    ELSE 'Normal'
  END as severity
FROM ANALYTICS_DB.${domain.toUpperCase()}_ANALYTICS.FCT_${domain.toUpperCase()}_DAILY
WHERE measurement_date >= CURRENT_DATE - 90
  AND z_score > 2
ORDER BY measurement_date DESC, z_score DESC;

-- Freshness Check
SELECT
  'Data Freshness' as check_type,
  '${domain}' as domain,
  CURRENT_TIMESTAMP() - MAX(created_at) as time_since_last_load,
  CASE 
    WHEN time_since_last_load > INTERVAL '24 HOURS' THEN 'CRITICAL'
    WHEN time_since_last_load > INTERVAL '12 HOURS' THEN 'WARNING'
    ELSE 'OK'
  END as status
FROM ANALYTICS_DB.${domain.toUpperCase()}_ANALYTICS.DIM_${domain.toUpperCase()}
GROUP BY 1, 2;

-- Row Count Validation
SELECT
  'Row Count Variance' as check_type,
  table_name,
  row_count,
  LAG(row_count) OVER (ORDER BY check_date) as previous_row_count,
  ABS(row_count - previous_row_count) / previous_row_count * 100 as pct_change,
  CASE 
    WHEN pct_change > 50 THEN 'Critical Variance'
    WHEN pct_change > 20 THEN 'High Variance'
    WHEN pct_change > 5 THEN 'Medium Variance'
    ELSE 'Normal'
  END as variance_level
FROM METADATA_DB.DOCUMENTATION.TABLE_ROW_COUNT_HISTORY
WHERE domain = '${domain}'
  AND check_date >= CURRENT_DATE - 30
ORDER BY check_date DESC;
`;
}

export function generateDataProfilingSQL(domain: string): string {
  return `-- Data Profiling Report for ${domain} Domain
-- Comprehensive data quality baseline

SELECT
  '${domain}' as domain,
  column_name,
  data_type,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE column_value IS NULL) as null_count,
  ROUND(100.0 * null_count / total_records, 2) as null_percentage,
  COUNT(DISTINCT column_value) as distinct_count,
  ROUND(100.0 * distinct_count / total_records, 2) as cardinality_pct,
  
  -- For numeric columns
  TRY_CAST(MIN(column_value) AS DECIMAL(15,2)) as min_value,
  TRY_CAST(MAX(column_value) AS DECIMAL(15,2)) as max_value,
  TRY_CAST(AVG(CAST(column_value AS DECIMAL(15,2))) AS DECIMAL(15,2)) as avg_value,
  TRY_CAST(MEDIAN(CAST(column_value AS DECIMAL(15,2))) AS DECIMAL(15,2)) as median_value,
  TRY_CAST(STDDEV(CAST(column_value AS DECIMAL(15,2))) AS DECIMAL(15,2)) as stddev_value,
  
  -- For string columns
  MIN(LENGTH(CAST(column_value AS VARCHAR))) as min_length,
  MAX(LENGTH(CAST(column_value AS VARCHAR))) as max_length,
  AVG(LENGTH(CAST(column_value AS VARCHAR))) as avg_length,
  
  CURRENT_TIMESTAMP() as profile_timestamp
FROM ANALYTICS_DB.${domain.toUpperCase()}_ANALYTICS.DIM_${domain.toUpperCase()}
GROUP BY column_name, data_type
ORDER BY column_name;
`;
}

export const qualityTestSeverities = {
  CRITICAL: {
    description: "Data quality issue that blocks analytics and reporting",
    action: "Stop pipeline, escalate to data team immediately",
    slackChannel: "#data-alerts-critical",
  },
  HIGH: {
    description: "Significant data quality issue, but pipeline can continue",
    action: "Log warning, notify data team, include in daily report",
    slackChannel: "#data-alerts",
  },
  MEDIUM: {
    description: "Moderate data quality concern, monitor trend",
    action: "Log to data quality dashboard, review weekly",
    slackChannel: "#data-quality-monitoring",
  },
  LOW: {
    description: "Minor data quality issue, may indicate future problems",
    action: "Log to dashboard for trending analysis",
    slackChannel: "#data-quality-monitoring",
  },
};

export function generateDataQualityDashboardConfig(domain: string): string {
  return `{
  "dashboard_name": "${domain}_Data_Quality",
  "domain": "${domain}",
  "refresh_frequency": "Daily",
  "charts": [
    {
      "name": "Data Freshness",
      "type": "gauge",
      "query": "SELECT DATEDIFF(HOUR, MAX(created_at), CURRENT_TIMESTAMP()) as hours_late FROM gold_${domain}",
      "threshold_warning": 12,
      "threshold_critical": 24
    },
    {
      "name": "Quality Score Trend",
      "type": "time_series",
      "query": "SELECT check_date, AVG(quality_score) FROM quality_results WHERE domain='${domain}' GROUP BY check_date"
    },
    {
      "name": "Row Count vs Expected",
      "type": "bar_chart",
      "query": "SELECT table_name, row_count, expected_row_count FROM table_metrics WHERE domain='${domain}'"
    },
    {
      "name": "Null Percentage by Column",
      "type": "bar_chart",
      "query": "SELECT column_name, null_percentage FROM column_profiles WHERE domain='${domain}' ORDER BY null_percentage DESC LIMIT 20"
    },
    {
      "name": "Test Pass Rate",
      "type": "gauge",
      "query": "SELECT COUNT(*) FILTER (WHERE status='PASS') / COUNT(*) * 100 as pass_rate FROM dbt_test_results WHERE domain='${domain}'"
    }
  ]
}
`;
}
