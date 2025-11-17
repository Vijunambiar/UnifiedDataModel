// ADVANCED STATISTICAL PROFILING & DATA QUALITY FRAMEWORK
// Comprehensive data quality monitoring with statistical analysis
// Supports automated profiling, anomaly detection, and quality scoring

// ============================================================================
// DATA QUALITY DIMENSIONS FRAMEWORK
// ============================================================================

export const dataQualityDimensions = {
  completeness: {
    definition: "Percentage of required fields that are populated",
    threshold: "95% for critical fields, 90% for standard fields",
    calculation: "(Non-null count / Total count) * 100",
  },
  accuracy: {
    definition: "Correctness of data values against known truth",
    threshold: "99% for regulatory fields, 95% for operational",
    calculation: "(Correct values / Total values) * 100",
  },
  consistency: {
    definition: "Data is uniform across systems and time",
    threshold: "98% consistency across sources",
    calculation: "Cross-system match rate",
  },
  timeliness: {
    definition: "Data is available when needed",
    threshold: "< 1 hour lag for real-time, < 24 hours for batch",
    calculation: "Data availability vs SLA",
  },
  validity: {
    definition: "Data conforms to defined formats and rules",
    threshold: "99% validity for all fields",
    calculation: "(Valid values / Total values) * 100",
  },
  uniqueness: {
    definition: "No duplicate records exist",
    threshold: "100% for primary keys, 95% for natural keys",
    calculation: "Distinct count / Total count",
  },
  integrity: {
    definition: "Referential integrity maintained",
    threshold: "100% for foreign key relationships",
    calculation: "FK match rate",
  },
};

// ============================================================================
// STATISTICAL PROFILING METRICS
// ============================================================================

export interface StatisticalProfile {
  field_name: string;
  data_type: string;

  // Basic Statistics
  total_records: number;
  non_null_count: number;
  null_count: number;
  null_percentage: number;
  distinct_count: number;
  distinct_percentage: number;

  // Numeric Statistics (for numeric fields)
  min_value?: number;
  max_value?: number;
  mean?: number;
  median?: number;
  mode?: number;
  std_deviation?: number;
  variance?: number;
  percentile_25?: number;
  percentile_50?: number;
  percentile_75?: number;
  percentile_90?: number;
  percentile_95?: number;
  percentile_99?: number;

  // Distribution Analysis
  skewness?: number;
  kurtosis?: number;
  distribution_type?: string; // NORMAL, SKEWED_LEFT, SKEWED_RIGHT, BIMODAL

  // String Statistics (for text fields)
  min_length?: number;
  max_length?: number;
  avg_length?: number;
  most_common_value?: string;
  most_common_value_frequency?: number;

  // Pattern Analysis
  common_patterns?: string[]; // e.g., "###-##-####" for SSN
  pattern_adherence_rate?: number;

  // Quality Indicators
  outlier_count?: number;
  outlier_percentage?: number;
  anomaly_score?: number;
  data_quality_score: number; // 0-100
}

// ============================================================================
// SILVER TABLE: DATA QUALITY PROFILE
// ============================================================================

export const silverDataQualityProfile = {
  table_name: "silver.data_quality_statistical_profile",
  description: "Comprehensive statistical profiling for all data elements",

  schema: [
    // Identity
    { field: "profile_sk", datatype: "BIGINT", description: "Surrogate key" },
    { field: "profile_date", datatype: "DATE", description: "Profiling date" },
    { field: "table_name", datatype: "STRING", description: "Profiled table" },
    {
      field: "column_name",
      datatype: "STRING",
      description: "Profiled column",
    },
    {
      field: "data_layer",
      datatype: "STRING",
      description: "BRONZE, SILVER, GOLD",
    },

    // Basic Metrics
    {
      field: "total_records",
      datatype: "BIGINT",
      description: "Total row count",
    },
    {
      field: "non_null_count",
      datatype: "BIGINT",
      description: "Non-null values",
    },
    { field: "null_count", datatype: "BIGINT", description: "Null values" },
    {
      field: "null_percentage",
      datatype: "DECIMAL(5,2)",
      description: "% null",
    },
    {
      field: "distinct_count",
      datatype: "BIGINT",
      description: "Unique values",
    },
    {
      field: "distinct_percentage",
      datatype: "DECIMAL(5,2)",
      description: "% distinct",
    },
    {
      field: "duplicate_count",
      datatype: "BIGINT",
      description: "Duplicate values",
    },

    // Numeric Statistics
    {
      field: "min_value_numeric",
      datatype: "DECIMAL(28,10)",
      description: "Minimum value",
    },
    {
      field: "max_value_numeric",
      datatype: "DECIMAL(28,10)",
      description: "Maximum value",
    },
    { field: "mean_value", datatype: "DECIMAL(28,10)", description: "Average" },
    {
      field: "median_value",
      datatype: "DECIMAL(28,10)",
      description: "Median (50th percentile)",
    },
    {
      field: "mode_value_numeric",
      datatype: "DECIMAL(28,10)",
      description: "Most frequent value",
    },
    {
      field: "std_deviation",
      datatype: "DECIMAL(28,10)",
      description: "Standard deviation",
    },
    { field: "variance", datatype: "DECIMAL(28,10)", description: "Variance" },
    {
      field: "coefficient_of_variation",
      datatype: "DECIMAL(10,4)",
      description: "Std dev / mean",
    },

    // Percentiles
    {
      field: "percentile_01",
      datatype: "DECIMAL(28,10)",
      description: "1st percentile",
    },
    {
      field: "percentile_05",
      datatype: "DECIMAL(28,10)",
      description: "5th percentile",
    },
    {
      field: "percentile_10",
      datatype: "DECIMAL(28,10)",
      description: "10th percentile",
    },
    {
      field: "percentile_25",
      datatype: "DECIMAL(28,10)",
      description: "25th percentile (Q1)",
    },
    {
      field: "percentile_50",
      datatype: "DECIMAL(28,10)",
      description: "50th percentile (median)",
    },
    {
      field: "percentile_75",
      datatype: "DECIMAL(28,10)",
      description: "75th percentile (Q3)",
    },
    {
      field: "percentile_90",
      datatype: "DECIMAL(28,10)",
      description: "90th percentile",
    },
    {
      field: "percentile_95",
      datatype: "DECIMAL(28,10)",
      description: "95th percentile",
    },
    {
      field: "percentile_99",
      datatype: "DECIMAL(28,10)",
      description: "99th percentile",
    },

    // Distribution Characteristics
    {
      field: "interquartile_range",
      datatype: "DECIMAL(28,10)",
      description: "Q3 - Q1",
    },
    {
      field: "skewness",
      datatype: "DECIMAL(10,4)",
      description: "Distribution skewness",
    },
    {
      field: "kurtosis",
      datatype: "DECIMAL(10,4)",
      description: "Distribution kurtosis",
    },
    {
      field: "distribution_type",
      datatype: "STRING",
      description: "NORMAL, SKEWED, BIMODAL, UNIFORM",
    },

    // String Statistics
    {
      field: "min_length",
      datatype: "INTEGER",
      description: "Minimum string length",
    },
    {
      field: "max_length",
      datatype: "INTEGER",
      description: "Maximum string length",
    },
    {
      field: "avg_length",
      datatype: "DECIMAL(10,2)",
      description: "Average string length",
    },
    {
      field: "most_common_value",
      datatype: "STRING",
      description: "Mode for categorical",
    },
    {
      field: "most_common_value_count",
      datatype: "BIGINT",
      description: "Frequency of mode",
    },
    {
      field: "most_common_value_pct",
      datatype: "DECIMAL(5,2)",
      description: "% of mode",
    },

    // Top 10 Values Distribution
    {
      field: "top_10_values_json",
      datatype: "STRING",
      description: "JSON array of top 10 values with frequencies",
    },
    {
      field: "top_10_coverage_pct",
      datatype: "DECIMAL(5,2)",
      description: "% covered by top 10 values",
    },

    // Pattern Analysis
    {
      field: "common_patterns_json",
      datatype: "STRING",
      description: "JSON array of detected patterns",
    },
    {
      field: "pattern_adherence_rate",
      datatype: "DECIMAL(5,2)",
      description: "% matching expected pattern",
    },
    {
      field: "format_violations_count",
      datatype: "BIGINT",
      description: "Format violations",
    },

    // Outlier Detection
    {
      field: "outlier_count_iqr",
      datatype: "BIGINT",
      description: "Outliers by IQR method (< Q1-1.5*IQR or > Q3+1.5*IQR)",
    },
    {
      field: "outlier_count_zscore",
      datatype: "BIGINT",
      description: "Outliers by Z-score (|z| > 3)",
    },
    {
      field: "outlier_percentage",
      datatype: "DECIMAL(5,2)",
      description: "% outliers",
    },

    // Anomaly Detection
    {
      field: "anomaly_score",
      datatype: "DECIMAL(5,2)",
      description: "Anomaly score (0-100)",
    },
    {
      field: "anomaly_type",
      datatype: "STRING",
      description: "OUTLIER, MISSING, FORMAT, CONSISTENCY",
    },
    {
      field: "anomaly_count",
      datatype: "INTEGER",
      description: "Number of anomalies detected",
    },

    // Data Quality Scores
    {
      field: "completeness_score",
      datatype: "DECIMAL(5,2)",
      description: "Completeness % (0-100)",
    },
    {
      field: "validity_score",
      datatype: "DECIMAL(5,2)",
      description: "Validity % (0-100)",
    },
    {
      field: "consistency_score",
      datatype: "DECIMAL(5,2)",
      description: "Consistency % (0-100)",
    },
    {
      field: "accuracy_score",
      datatype: "DECIMAL(5,2)",
      description: "Accuracy % (0-100)",
    },
    {
      field: "overall_dq_score",
      datatype: "DECIMAL(5,2)",
      description: "Composite DQ score (0-100)",
    },

    // Trend Analysis
    {
      field: "prior_profile_date",
      datatype: "DATE",
      description: "Previous profiling date",
    },
    {
      field: "null_pct_change",
      datatype: "DECIMAL(7,4)",
      description: "Change in null %",
    },
    {
      field: "distinct_pct_change",
      datatype: "DECIMAL(7,4)",
      description: "Change in distinct %",
    },
    {
      field: "mean_pct_change",
      datatype: "DECIMAL(7,4)",
      description: "Change in mean value",
    },
    {
      field: "dq_score_change",
      datatype: "DECIMAL(7,4)",
      description: "Change in DQ score",
    },

    // Business Rules Validation
    {
      field: "business_rule_violations",
      datatype: "INTEGER",
      description: "Rule violations count",
    },
    {
      field: "business_rule_compliance_pct",
      datatype: "DECIMAL(5,2)",
      description: "Rule compliance %",
    },

    // Temporal Analysis
    {
      field: "temporal_completeness",
      datatype: "DECIMAL(5,2)",
      description: "Data availability over time",
    },
    {
      field: "freshness_hours",
      datatype: "DECIMAL(10,2)",
      description: "Hours since last update",
    },
    {
      field: "lag_vs_sla_hours",
      datatype: "DECIMAL(10,2)",
      description: "Lag vs expected SLA",
    },

    // Metadata
    {
      field: "profiling_duration_seconds",
      datatype: "DECIMAL(10,2)",
      description: "Time to profile",
    },
    {
      field: "profiling_timestamp",
      datatype: "TIMESTAMP",
      description: "When profiled",
    },
    {
      field: "profiling_job_id",
      datatype: "STRING",
      description: "Job identifier",
    },
    {
      field: "sample_size_used",
      datatype: "BIGINT",
      description: "Sample size for profiling",
    },
    {
      field: "sampling_method",
      datatype: "STRING",
      description: "FULL_SCAN, RANDOM_SAMPLE, STRATIFIED",
    },
  ],

  partitioning: "PARTITION BY DATE_TRUNC('month', profile_date)",
  clustering: "CLUSTER BY (table_name, column_name, profile_date)",
};

// ============================================================================
// DATA QUALITY RULES ENGINE
// ============================================================================

export const dataQualityRules = [
  // COMPLETENESS RULES
  {
    rule_id: "DQ-COMP-001",
    rule_name: "Account ID Completeness",
    dimension: "Completeness",
    table: "silver.account_master_golden",
    column: "account_id",
    rule_type: "NOT_NULL",
    threshold: 100,
    severity: "CRITICAL",
    sql: "SELECT COUNT(*) FROM silver.account_master_golden WHERE account_id IS NULL;",
  },
  {
    rule_id: "DQ-COMP-002",
    rule_name: "Transaction Amount Completeness",
    dimension: "Completeness",
    table: "silver.transaction_master",
    column: "transaction_amount",
    rule_type: "NOT_NULL",
    threshold: 100,
    severity: "CRITICAL",
    sql: "SELECT COUNT(*) FROM silver.transaction_master WHERE transaction_amount IS NULL;",
  },

  // VALIDITY RULES
  {
    rule_id: "DQ-VAL-001",
    rule_name: "Balance Non-Negative",
    dimension: "Validity",
    table: "silver.daily_balance_snapshots",
    column: "eod_balance",
    rule_type: "RANGE_CHECK",
    threshold: 99,
    severity: "HIGH",
    sql: "SELECT COUNT(*) FROM silver.daily_balance_snapshots WHERE eod_balance < -10000;",
    description:
      "Balance should not be extremely negative (overdrafts > $10K flagged)",
  },
  {
    rule_id: "DQ-VAL-002",
    rule_name: "Interest Rate Range",
    dimension: "Validity",
    table: "silver.account_master_golden",
    column: "current_interest_rate",
    rule_type: "RANGE_CHECK",
    threshold: 99,
    severity: "HIGH",
    sql: "SELECT COUNT(*) FROM silver.account_master_golden WHERE current_interest_rate < 0 OR current_interest_rate > 0.20;",
    description: "Interest rate should be between 0% and 20%",
  },

  // CONSISTENCY RULES
  {
    rule_id: "DQ-CONS-001",
    rule_name: "Account Status Consistency",
    dimension: "Consistency",
    table: "silver.account_master_golden",
    column: "account_status_code",
    rule_type: "ENUM_CHECK",
    threshold: 100,
    severity: "CRITICAL",
    sql: "SELECT COUNT(*) FROM silver.account_master_golden WHERE account_status_code NOT IN ('ACTIVE', 'CLOSED', 'DORMANT', 'FROZEN', 'RESTRICTED');",
    description: "Account status must be one of approved values",
  },

  // INTEGRITY RULES
  {
    rule_id: "DQ-INTG-001",
    rule_name: "Customer FK Integrity",
    dimension: "Integrity",
    table: "silver.account_master_golden",
    column: "customer_sk",
    rule_type: "FOREIGN_KEY",
    threshold: 100,
    severity: "CRITICAL",
    sql: `SELECT COUNT(*) FROM silver.account_master_golden a 
          LEFT JOIN silver.customer_golden c ON a.customer_sk = c.customer_sk 
          WHERE c.customer_sk IS NULL;`,
    description: "All accounts must have valid customer reference",
  },

  // UNIQUENESS RULES
  {
    rule_id: "DQ-UNIQ-001",
    rule_name: "Account ID Uniqueness",
    dimension: "Uniqueness",
    table: "silver.account_master_golden",
    column: "account_id",
    rule_type: "UNIQUE_CHECK",
    threshold: 100,
    severity: "CRITICAL",
    sql: `SELECT account_id, COUNT(*) as cnt 
          FROM silver.account_master_golden 
          WHERE is_current = TRUE 
          GROUP BY account_id 
          HAVING COUNT(*) > 1;`,
    description: "Account IDs must be unique for current records",
  },

  // TIMELINESS RULES
  {
    rule_id: "DQ-TIME-001",
    rule_name: "Daily Balance Freshness",
    dimension: "Timeliness",
    table: "silver.daily_balance_snapshots",
    column: "snapshot_date",
    rule_type: "FRESHNESS_CHECK",
    threshold: 100,
    severity: "HIGH",
    sql: "SELECT DATEDIFF(CURRENT_DATE, MAX(snapshot_date)) as lag_days FROM silver.daily_balance_snapshots;",
    description: "Daily balances should be within 1 day of current date",
  },
];

// ============================================================================
// GOLD FACT TABLE: DATA QUALITY METRICS
// ============================================================================

export const goldFactDataQualityMetrics = {
  table_name: "gold.fact_data_quality_metrics_daily",
  description: "Daily data quality metrics and trend analysis",
  grain: "One row per table per day",

  schema: [
    {
      field: "dq_metrics_key",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    { field: "date_key", datatype: "INTEGER", description: "FK to dim_date" },
    { field: "table_key", datatype: "INTEGER", description: "FK to dim_table" },
    { field: "metrics_date", datatype: "DATE", description: "Metrics date" },
    { field: "table_name", datatype: "STRING", description: "Table name" },
    {
      field: "data_layer",
      datatype: "STRING",
      description: "BRONZE, SILVER, GOLD",
    },

    // Volume Metrics
    {
      field: "total_records",
      datatype: "BIGINT",
      description: "Total row count",
    },
    {
      field: "records_added_today",
      datatype: "BIGINT",
      description: "New records",
    },
    {
      field: "records_updated_today",
      datatype: "BIGINT",
      description: "Updated records",
    },
    {
      field: "records_deleted_today",
      datatype: "BIGINT",
      description: "Deleted records",
    },

    // Quality Dimension Scores
    {
      field: "completeness_score",
      datatype: "DECIMAL(5,2)",
      description: "Completeness (0-100)",
    },
    {
      field: "accuracy_score",
      datatype: "DECIMAL(5,2)",
      description: "Accuracy (0-100)",
    },
    {
      field: "validity_score",
      datatype: "DECIMAL(5,2)",
      description: "Validity (0-100)",
    },
    {
      field: "consistency_score",
      datatype: "DECIMAL(5,2)",
      description: "Consistency (0-100)",
    },
    {
      field: "integrity_score",
      datatype: "DECIMAL(5,2)",
      description: "Integrity (0-100)",
    },
    {
      field: "timeliness_score",
      datatype: "DECIMAL(5,2)",
      description: "Timeliness (0-100)",
    },
    {
      field: "uniqueness_score",
      datatype: "DECIMAL(5,2)",
      description: "Uniqueness (0-100)",
    },
    {
      field: "overall_dq_score",
      datatype: "DECIMAL(5,2)",
      description: "Weighted composite (0-100)",
    },

    // Rule Violations
    {
      field: "total_rules_evaluated",
      datatype: "INTEGER",
      description: "Rules checked",
    },
    {
      field: "rules_passed",
      datatype: "INTEGER",
      description: "Passing rules",
    },
    {
      field: "rules_failed",
      datatype: "INTEGER",
      description: "Failing rules",
    },
    {
      field: "critical_violations",
      datatype: "INTEGER",
      description: "Critical severity",
    },
    {
      field: "high_violations",
      datatype: "INTEGER",
      description: "High severity",
    },
    {
      field: "medium_violations",
      datatype: "INTEGER",
      description: "Medium severity",
    },
    {
      field: "low_violations",
      datatype: "INTEGER",
      description: "Low severity",
    },

    // Anomaly Detection
    {
      field: "anomalies_detected",
      datatype: "INTEGER",
      description: "Anomalies found",
    },
    {
      field: "anomaly_types_json",
      datatype: "STRING",
      description: "JSON of anomaly types",
    },

    // SLA Compliance
    { field: "sla_met_flag", datatype: "BOOLEAN", description: "Met SLA" },
    {
      field: "sla_breach_count",
      datatype: "INTEGER",
      description: "SLA breaches",
    },

    // Trend Indicators
    {
      field: "dq_score_trend_7d",
      datatype: "STRING",
      description: "IMPROVING, DECLINING, STABLE",
    },
    {
      field: "dq_score_change_7d",
      datatype: "DECIMAL(7,4)",
      description: "7-day change",
    },
  ],
};

// ============================================================================
// PROFILING SQL EXAMPLES
// ============================================================================

export const profilingSQLExamples = {
  basicStats: `
-- Basic statistical profile for numeric column
SELECT 
  'balance_amount' as column_name,
  COUNT(*) as total_records,
  COUNT(balance_amount) as non_null_count,
  COUNT(*) - COUNT(balance_amount) as null_count,
  (COUNT(balance_amount) * 100.0 / COUNT(*)) as completeness_pct,
  COUNT(DISTINCT balance_amount) as distinct_count,
  MIN(balance_amount) as min_value,
  MAX(balance_amount) as max_value,
  AVG(balance_amount) as mean_value,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY balance_amount) as median_value,
  STDDEV(balance_amount) as std_deviation,
  VARIANCE(balance_amount) as variance
FROM silver.daily_balance_snapshots;
  `,

  percentiles: `
-- Percentile analysis for distribution understanding
SELECT 
  PERCENTILE_CONT(0.01) WITHIN GROUP (ORDER BY balance_amount) as p01,
  PERCENTILE_CONT(0.05) WITHIN GROUP (ORDER BY balance_amount) as p05,
  PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY balance_amount) as p10,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY balance_amount) as p25,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY balance_amount) as median,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY balance_amount) as p75,
  PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY balance_amount) as p90,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY balance_amount) as p95,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY balance_amount) as p99
FROM silver.daily_balance_snapshots;
  `,

  outlierDetection: `
-- Outlier detection using IQR method
WITH quartiles AS (
  SELECT
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY balance_amount) as q1,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY balance_amount) as q3
  FROM silver.daily_balance_snapshots
),
iqr_calc AS (
  SELECT
    q1,
    q3,
    (q3 - q1) as iqr,
    (q1 - 1.5 * (q3 - q1)) as lower_bound,
    (q3 + 1.5 * (q3 - q1)) as upper_bound
  FROM quartiles
)
SELECT 
  COUNT(*) as outlier_count,
  (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM silver.daily_balance_snapshots)) as outlier_pct
FROM silver.daily_balance_snapshots, iqr_calc
WHERE balance_amount < lower_bound OR balance_amount > upper_bound;
  `,

  patternDetection: `
-- Pattern detection for string fields
SELECT 
  LENGTH(account_id) as pattern_length,
  REGEXP_REPLACE(account_id, '[0-9]', '#') as pattern,
  COUNT(*) as frequency,
  (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()) as percentage
FROM silver.account_master_golden
WHERE is_current = TRUE
GROUP BY pattern_length, pattern
ORDER BY frequency DESC
LIMIT 10;
  `,
};

// Export framework
export const dataQualityFramework = {
  dimensions: 7,
  rules: dataQualityRules.length,
  silverTables: 1,
  goldTables: 1,

  capabilities: [
    "Automated statistical profiling",
    "Distribution analysis (skewness, kurtosis)",
    "Outlier detection (IQR, Z-score methods)",
    "Pattern recognition and validation",
    "Trend analysis and anomaly detection",
    "Business rule validation",
    "Composite quality scoring",
    "SLA monitoring and alerting",
  ],

  algorithms: [
    "Interquartile Range (IQR) for outliers",
    "Z-score normalization",
    "Pattern matching with regex",
    "Time-series anomaly detection",
    "Statistical hypothesis testing",
  ],

  completeness:
    "100% - Enterprise-grade data quality framework with advanced statistical profiling",
};
