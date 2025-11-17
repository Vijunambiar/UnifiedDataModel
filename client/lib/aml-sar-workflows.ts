// AML/SAR WORKFLOW TRACKING - ANTI-MONEY LAUNDERING & SUSPICIOUS ACTIVITY REPORTING
// Comprehensive monitoring, case management, and regulatory reporting
// Aligned with: FinCEN SAR requirements, BSA/AML regulations, OFAC screening

// ============================================================================
// SILVER LAYER: AML MONITORING & ENRICHMENT
// ============================================================================

export const silverAMLMonitoring = {
  table_name: "silver.aml_transaction_monitoring",
  description:
    "Transaction-level AML screening with risk scores and rule triggers",
  source_bronze_tables: [
    "bronze.deposit_transactions_raw",
    "bronze.aml_alerts_raw",
  ],
  transformation_logic:
    "AML rule execution, OFAC screening, pattern detection, risk scoring",

  schema: [
    // Primary Keys
    {
      field: "aml_monitoring_sk",
      datatype: "BIGINT",
      description: "Surrogate key",
      primary_key: true,
    },
    {
      field: "transaction_sk",
      datatype: "BIGINT",
      description: "FK to silver.transaction_master",
    },
    {
      field: "account_sk",
      datatype: "BIGINT",
      description: "FK to silver.account_master_golden",
    },
    {
      field: "customer_sk",
      datatype: "BIGINT",
      description: "FK to silver.customer_golden",
    },

    // Transaction Context
    {
      field: "transaction_id",
      datatype: "STRING",
      description: "Natural transaction key",
    },
    {
      field: "transaction_date",
      datatype: "DATE",
      description: "Transaction date",
    },
    {
      field: "transaction_amount",
      datatype: "DECIMAL(18,2)",
      description: "Transaction amount",
    },
    {
      field: "transaction_type",
      datatype: "STRING",
      description: "Transaction type code",
    },

    // AML Screening Results
    {
      field: "aml_overall_risk_score",
      datatype: "DECIMAL(5,2)",
      description: "Composite risk score (0-100)",
    },
    {
      field: "aml_risk_level",
      datatype: "STRING",
      description: "LOW, MEDIUM, HIGH, CRITICAL",
    },
    {
      field: "aml_screening_timestamp",
      datatype: "TIMESTAMP",
      description: "When screening was performed",
    },

    // OFAC/Sanctions Screening
    {
      field: "ofac_screening_flag",
      datatype: "BOOLEAN",
      description: "OFAC screening performed",
    },
    {
      field: "ofac_match_flag",
      datatype: "BOOLEAN",
      description: "Potential OFAC match found",
    },
    {
      field: "ofac_match_confidence",
      datatype: "DECIMAL(5,2)",
      description: "Match confidence %",
    },
    {
      field: "ofac_list_name",
      datatype: "STRING",
      description: "SDN, Consolidated, etc.",
    },
    {
      field: "ofac_match_entity",
      datatype: "STRING",
      description: "Matched entity name",
    },
    {
      field: "sanctions_jurisdiction",
      datatype: "STRING",
      description: "US, UN, EU, etc.",
    },

    // Structuring Detection (Breaking $10K threshold)
    {
      field: "structuring_flag",
      datatype: "BOOLEAN",
      description: "Potential structuring detected",
    },
    {
      field: "structuring_pattern",
      datatype: "STRING",
      description: "BELOW_THRESHOLD, RAPID_SEQUENCE, SMURFING",
    },
    {
      field: "related_transactions_24h_count",
      datatype: "INTEGER",
      description: "Related txns in 24h",
    },
    {
      field: "related_transactions_24h_amount",
      datatype: "DECIMAL(18,2)",
      description: "Total amount in 24h",
    },
    {
      field: "cumulative_amount_7d",
      datatype: "DECIMAL(18,2)",
      description: "7-day cumulative",
    },
    {
      field: "cumulative_amount_30d",
      datatype: "DECIMAL(18,2)",
      description: "30-day cumulative",
    },

    // Unusual Activity Patterns
    {
      field: "unusual_activity_flag",
      datatype: "BOOLEAN",
      description: "Deviates from customer profile",
    },
    {
      field: "amount_deviation_score",
      datatype: "DECIMAL(5,2)",
      description: "Deviation from avg amount",
    },
    {
      field: "frequency_deviation_score",
      datatype: "DECIMAL(5,2)",
      description: "Deviation from avg frequency",
    },
    {
      field: "geography_anomaly_flag",
      datatype: "BOOLEAN",
      description: "Unusual location",
    },
    {
      field: "velocity_anomaly_flag",
      datatype: "BOOLEAN",
      description: "Rapid transactions",
    },
    {
      field: "time_of_day_anomaly_flag",
      datatype: "BOOLEAN",
      description: "Unusual timing",
    },

    // High-Risk Indicators
    {
      field: "high_risk_country_flag",
      datatype: "BOOLEAN",
      description: "Transaction to/from high-risk country",
    },
    {
      field: "high_risk_country_list",
      datatype: "STRING",
      description: "FATF, FinCEN, etc.",
    },
    {
      field: "cash_intensive_business_flag",
      datatype: "BOOLEAN",
      description: "Cash-intensive merchant",
    },
    {
      field: "politically_exposed_person_flag",
      datatype: "BOOLEAN",
      description: "PEP indicator",
    },
    {
      field: "adverse_media_flag",
      datatype: "BOOLEAN",
      description: "Negative news",
    },

    // Transaction Pattern Indicators
    {
      field: "round_amount_flag",
      datatype: "BOOLEAN",
      description: "Round dollar amount (e.g., $5000.00)",
    },
    {
      field: "just_below_threshold_flag",
      datatype: "BOOLEAN",
      description: "Just below CTR threshold ($9,999)",
    },
    {
      field: "rapid_movement_flag",
      datatype: "BOOLEAN",
      description: "Quick in-and-out",
    },
    {
      field: "layering_pattern_flag",
      datatype: "BOOLEAN",
      description: "Multiple intermediate transfers",
    },
    {
      field: "funnel_account_flag",
      datatype: "BOOLEAN",
      description: "Many deposits, single withdrawal",
    },
    {
      field: "shell_company_indicator",
      datatype: "BOOLEAN",
      description: "Possible shell company",
    },

    // Rule Triggers
    {
      field: "triggered_rules_count",
      datatype: "INTEGER",
      description: "Number of AML rules triggered",
    },
    {
      field: "triggered_rule_codes",
      datatype: "STRING",
      description: "Comma-separated rule codes",
    },
    {
      field: "highest_severity_rule",
      datatype: "STRING",
      description: "Most severe rule triggered",
    },
    {
      field: "rule_severity_level",
      datatype: "INTEGER",
      description: "1=Low, 5=Critical",
    },

    // CTR Reporting ($10K+ cash transactions)
    {
      field: "ctr_reportable_flag",
      datatype: "BOOLEAN",
      description: "Requires CTR filing",
    },
    {
      field: "ctr_filing_status",
      datatype: "STRING",
      description: "PENDING, FILED, NOT_REQUIRED",
    },
    {
      field: "ctr_reference_number",
      datatype: "STRING",
      description: "BSA E-Filing reference",
    },
    {
      field: "ctr_filing_date",
      datatype: "DATE",
      description: "When CTR was filed",
    },

    // SAR Indicators
    {
      field: "sar_indicator_flag",
      datatype: "BOOLEAN",
      description: "Meets SAR criteria",
    },
    {
      field: "sar_case_created_flag",
      datatype: "BOOLEAN",
      description: "SAR case initiated",
    },
    {
      field: "sar_case_id",
      datatype: "STRING",
      description: "FK to aml_sar_cases",
    },

    // Investigator Notes
    {
      field: "requires_review_flag",
      datatype: "BOOLEAN",
      description: "Needs analyst review",
    },
    {
      field: "review_priority",
      datatype: "STRING",
      description: "LOW, MEDIUM, HIGH, URGENT",
    },
    {
      field: "assigned_to_analyst",
      datatype: "STRING",
      description: "Analyst user ID",
    },
    {
      field: "review_status",
      datatype: "STRING",
      description: "PENDING, IN_PROGRESS, CLEARED, ESCALATED",
    },
    {
      field: "review_timestamp",
      datatype: "TIMESTAMP",
      description: "When reviewed",
    },
    {
      field: "analyst_notes",
      datatype: "STRING",
      description: "Analyst comments",
    },

    // Audit Trail
    {
      field: "created_timestamp",
      datatype: "TIMESTAMP",
      description: "Record creation",
    },
    {
      field: "updated_timestamp",
      datatype: "TIMESTAMP",
      description: "Last update",
    },
    {
      field: "screening_version",
      datatype: "STRING",
      description: "AML engine version",
    },
  ],

  partitioning: "PARTITION BY DATE_TRUNC('month', transaction_date)",
  clustering: "CLUSTER BY (aml_risk_level, sar_indicator_flag, review_status)",

  indexes: [
    "CREATE INDEX idx_aml_high_risk ON silver.aml_transaction_monitoring (aml_risk_level) WHERE aml_risk_level IN ('HIGH', 'CRITICAL');",
    "CREATE INDEX idx_aml_sar_indicators ON silver.aml_transaction_monitoring (sar_indicator_flag, sar_case_id);",
    "CREATE INDEX idx_aml_ofac_matches ON silver.aml_transaction_monitoring (ofac_match_flag) WHERE ofac_match_flag = TRUE;",
    "CREATE INDEX idx_aml_review_queue ON silver.aml_transaction_monitoring (review_status, review_priority, assigned_to_analyst);",
  ],
};

// ============================================================================
// SILVER TABLE: SAR CASE MANAGEMENT
// ============================================================================

export const silverSARCaseManagement = {
  table_name: "silver.aml_sar_cases",
  description: "SAR case tracking from detection through filing with FinCEN",

  schema: [
    // Case Identification
    {
      field: "sar_case_sk",
      datatype: "BIGINT",
      description: "Surrogate key",
      primary_key: true,
    },
    {
      field: "sar_case_id",
      datatype: "STRING",
      description: "Natural case ID",
      unique: true,
    },
    {
      field: "case_open_date",
      datatype: "DATE",
      description: "When case was opened",
    },
    {
      field: "case_status",
      datatype: "STRING",
      description: "OPEN, UNDER_REVIEW, ESCALATED, FILED, CLOSED, NO_SAR_FILED",
    },

    // Subject Information
    {
      field: "subject_type",
      datatype: "STRING",
      description: "CUSTOMER, ACCOUNT, TRANSACTION, RELATIONSHIP",
    },
    {
      field: "subject_customer_sk",
      datatype: "BIGINT",
      description: "FK to customer (if applicable)",
    },
    {
      field: "subject_account_sk",
      datatype: "BIGINT",
      description: "FK to account (if applicable)",
    },
    { field: "subject_name", datatype: "STRING", description: "Subject name" },
    {
      field: "subject_tax_id",
      datatype: "STRING",
      description: "SSN/EIN (encrypted)",
    },
    {
      field: "subject_address",
      datatype: "STRING",
      description: "Subject address",
    },

    // Suspicious Activity Details
    {
      field: "suspicious_activity_type",
      datatype: "STRING",
      description: "STRUCTURING, LAYERING, SMURFING, FRAUD, etc.",
    },
    {
      field: "suspicious_activity_category",
      datatype: "STRING",
      description: "FinCEN SAR category code",
    },
    {
      field: "suspicious_activity_description",
      datatype: "STRING",
      description: "Detailed narrative",
    },
    {
      field: "activity_start_date",
      datatype: "DATE",
      description: "When suspicious activity began",
    },
    {
      field: "activity_end_date",
      datatype: "DATE",
      description: "When suspicious activity ended",
    },
    {
      field: "total_suspicious_amount",
      datatype: "DECIMAL(18,2)",
      description: "Total dollar amount",
    },

    // Related Transactions
    {
      field: "related_transactions_count",
      datatype: "INTEGER",
      description: "Number of flagged transactions",
    },
    {
      field: "related_transaction_ids",
      datatype: "STRING",
      description: "Comma-separated transaction IDs",
    },
    {
      field: "earliest_transaction_date",
      datatype: "DATE",
      description: "First flagged transaction",
    },
    {
      field: "latest_transaction_date",
      datatype: "DATE",
      description: "Last flagged transaction",
    },

    // Investigation
    {
      field: "assigned_investigator",
      datatype: "STRING",
      description: "Primary investigator user ID",
    },
    {
      field: "investigation_start_date",
      datatype: "DATE",
      description: "Investigation started",
    },
    {
      field: "investigation_priority",
      datatype: "STRING",
      description: "LOW, MEDIUM, HIGH, CRITICAL",
    },
    {
      field: "investigation_status",
      datatype: "STRING",
      description: "PENDING, IN_PROGRESS, COMPLETED",
    },
    {
      field: "investigation_findings",
      datatype: "STRING",
      description: "Investigation summary",
    },

    // Decision & Filing
    {
      field: "sar_filing_decision",
      datatype: "STRING",
      description: "FILE_SAR, NO_SAR_NEEDED, INSUFFICIENT_EVIDENCE",
    },
    {
      field: "sar_filing_decision_date",
      datatype: "DATE",
      description: "When decision was made",
    },
    {
      field: "sar_filing_decision_by",
      datatype: "STRING",
      description: "Decision maker user ID",
    },
    {
      field: "sar_decision_rationale",
      datatype: "STRING",
      description: "Reason for decision",
    },

    // FinCEN Filing
    {
      field: "fincen_filing_status",
      datatype: "STRING",
      description: "NOT_FILED, PENDING, SUBMITTED, ACKNOWLEDGED",
    },
    {
      field: "fincen_bsa_id",
      datatype: "STRING",
      description: "BSA E-Filing identifier",
    },
    {
      field: "fincen_filing_date",
      datatype: "DATE",
      description: "When SAR was filed",
    },
    {
      field: "fincen_acknowledgement_date",
      datatype: "DATE",
      description: "FinCEN acknowledgement",
    },
    {
      field: "fincen_sar_narrative",
      datatype: "STRING",
      description: "SAR narrative text",
    },

    // Regulatory Compliance
    {
      field: "filing_deadline_date",
      datatype: "DATE",
      description: "30-day SAR filing deadline",
    },
    {
      field: "days_to_deadline",
      datatype: "INTEGER",
      description: "Days remaining to file",
    },
    {
      field: "deadline_breach_flag",
      datatype: "BOOLEAN",
      description: "Filed after deadline",
    },
    {
      field: "exemption_flag",
      datatype: "BOOLEAN",
      description: "Exemption applied",
    },
    {
      field: "exemption_reason",
      datatype: "STRING",
      description: "Why exemption was granted",
    },

    // Law Enforcement Referral
    {
      field: "law_enforcement_referred_flag",
      datatype: "BOOLEAN",
      description: "Referred to law enforcement",
    },
    {
      field: "law_enforcement_agency",
      datatype: "STRING",
      description: "FBI, Secret Service, etc.",
    },
    {
      field: "law_enforcement_referral_date",
      datatype: "DATE",
      description: "Referral date",
    },
    {
      field: "law_enforcement_case_number",
      datatype: "STRING",
      description: "Agency case number",
    },

    // Continuing Activity
    {
      field: "continuing_activity_flag",
      datatype: "BOOLEAN",
      description: "Ongoing suspicious activity",
    },
    {
      field: "previous_sar_case_id",
      datatype: "STRING",
      description: "Prior SAR for same subject",
    },
    {
      field: "continuing_sar_sequence",
      datatype: "INTEGER",
      description: "Sequence number for continuing SARs",
    },

    // Quality Review
    {
      field: "qc_review_required_flag",
      datatype: "BOOLEAN",
      description: "Needs QC review",
    },
    {
      field: "qc_reviewed_by",
      datatype: "STRING",
      description: "QC reviewer user ID",
    },
    {
      field: "qc_review_date",
      datatype: "DATE",
      description: "QC review date",
    },
    {
      field: "qc_review_status",
      datatype: "STRING",
      description: "APPROVED, REJECTED, NEEDS_REVISION",
    },
    {
      field: "qc_review_notes",
      datatype: "STRING",
      description: "QC comments",
    },

    // Audit & Compliance
    {
      field: "case_closed_date",
      datatype: "DATE",
      description: "Case closure date",
    },
    {
      field: "case_duration_days",
      datatype: "INTEGER",
      description: "Days from open to close",
    },
    {
      field: "created_timestamp",
      datatype: "TIMESTAMP",
      description: "Record creation",
    },
    {
      field: "updated_timestamp",
      datatype: "TIMESTAMP",
      description: "Last update",
    },
    {
      field: "updated_by_user",
      datatype: "STRING",
      description: "Last modifier",
    },
  ],

  indexes: [
    "CREATE INDEX idx_sar_status ON silver.aml_sar_cases (case_status, investigation_priority);",
    "CREATE INDEX idx_sar_filing_deadline ON silver.aml_sar_cases (filing_deadline_date, fincen_filing_status);",
    "CREATE INDEX idx_sar_subject ON silver.aml_sar_cases (subject_customer_sk, case_status);",
  ],
};

// ============================================================================
// SILVER TABLE: CUSTOMER RISK PROFILES
// ============================================================================

export const silverCustomerRiskProfiles = {
  table_name: "silver.aml_customer_risk_profiles",
  description: "Customer-level AML risk assessment and profile",

  schema: [
    {
      field: "risk_profile_sk",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    {
      field: "customer_sk",
      datatype: "BIGINT",
      description: "FK to customer_golden",
    },
    {
      field: "profile_effective_date",
      datatype: "DATE",
      description: "Profile version date",
    },

    // Overall Risk Assessment
    {
      field: "overall_risk_rating",
      datatype: "STRING",
      description: "LOW, MEDIUM, HIGH, PROHIBITED",
    },
    {
      field: "risk_score",
      datatype: "DECIMAL(5,2)",
      description: "Composite risk score (0-100)",
    },
    {
      field: "risk_rating_date",
      datatype: "DATE",
      description: "When risk was assessed",
    },
    {
      field: "next_review_date",
      datatype: "DATE",
      description: "Next scheduled review",
    },

    // Risk Factors
    {
      field: "customer_type_risk",
      datatype: "STRING",
      description: "INDIVIDUAL, BUSINESS, NON_PROFIT",
    },
    {
      field: "industry_risk_level",
      datatype: "STRING",
      description: "Industry risk (CASH_INTENSIVE, etc.)",
    },
    {
      field: "geographic_risk_level",
      datatype: "STRING",
      description: "Location risk",
    },
    {
      field: "product_risk_level",
      datatype: "STRING",
      description: "Product mix risk",
    },
    {
      field: "channel_risk_level",
      datatype: "STRING",
      description: "Channel usage risk",
    },

    // Enhanced Due Diligence (EDD) Flags
    {
      field: "edd_required_flag",
      datatype: "BOOLEAN",
      description: "Requires enhanced due diligence",
    },
    {
      field: "edd_reason",
      datatype: "STRING",
      description: "Why EDD is required",
    },
    {
      field: "edd_completed_date",
      datatype: "DATE",
      description: "EDD completion date",
    },
    {
      field: "pep_flag",
      datatype: "BOOLEAN",
      description: "Politically Exposed Person",
    },
    {
      field: "pep_category",
      datatype: "STRING",
      description: "FOREIGN, DOMESTIC, INTERNATIONAL_ORG",
    },
    {
      field: "adverse_media_flag",
      datatype: "BOOLEAN",
      description: "Negative news",
    },

    // Transaction Behavior
    {
      field: "expected_monthly_transactions",
      datatype: "INTEGER",
      description: "Expected txn volume",
    },
    {
      field: "expected_monthly_amount",
      datatype: "DECIMAL(18,2)",
      description: "Expected txn amount",
    },
    {
      field: "actual_monthly_transactions_avg",
      datatype: "INTEGER",
      description: "Actual avg txn count",
    },
    {
      field: "actual_monthly_amount_avg",
      datatype: "DECIMAL(18,2)",
      description: "Actual avg amount",
    },
    {
      field: "behavior_deviation_score",
      datatype: "DECIMAL(5,2)",
      description: "Deviation from expected",
    },

    // Historical SAR Activity
    {
      field: "total_sar_filings",
      datatype: "INTEGER",
      description: "Total SARs filed for customer",
    },
    {
      field: "sar_filings_12m",
      datatype: "INTEGER",
      description: "SARs filed in last 12 months",
    },
    {
      field: "last_sar_filing_date",
      datatype: "DATE",
      description: "Most recent SAR",
    },

    // Monitoring Parameters
    {
      field: "monitoring_intensity",
      datatype: "STRING",
      description: "STANDARD, ENHANCED, INTENSIVE",
    },
    {
      field: "alert_threshold_multiplier",
      datatype: "DECIMAL(5,2)",
      description: "Alert sensitivity adjustment",
    },
    {
      field: "manual_review_required",
      datatype: "BOOLEAN",
      description: "All txns need review",
    },

    {
      field: "created_timestamp",
      datatype: "TIMESTAMP",
      description: "Record creation",
    },
    {
      field: "updated_timestamp",
      datatype: "TIMESTAMP",
      description: "Last update",
    },
  ],
};

// ============================================================================
// GOLD FACT TABLE: AML METRICS
// ============================================================================

export const goldFactAMLMetrics = {
  table_name: "gold.fact_aml_metrics_daily",
  description: "Daily AML monitoring metrics and KPIs",
  grain: "One row per day",

  schema: [
    {
      field: "aml_metrics_key",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    { field: "date_key", datatype: "INTEGER", description: "FK to dim_date" },
    { field: "metrics_date", datatype: "DATE", description: "Reporting date" },

    // Transaction Volume Metrics
    {
      field: "total_transactions_screened",
      datatype: "INTEGER",
      description: "Total txns screened",
    },
    {
      field: "total_amount_screened",
      datatype: "DECIMAL(18,2)",
      description: "Total dollar amount",
    },

    // Alert Metrics
    {
      field: "total_alerts_generated",
      datatype: "INTEGER",
      description: "AML alerts generated",
    },
    {
      field: "high_risk_alerts",
      datatype: "INTEGER",
      description: "High/critical alerts",
    },
    { field: "ofac_matches", datatype: "INTEGER", description: "OFAC hits" },
    {
      field: "structuring_alerts",
      datatype: "INTEGER",
      description: "Structuring detected",
    },
    {
      field: "unusual_activity_alerts",
      datatype: "INTEGER",
      description: "Unusual patterns",
    },

    // SAR Metrics
    {
      field: "sar_cases_opened",
      datatype: "INTEGER",
      description: "New SAR cases",
    },
    {
      field: "sar_cases_closed",
      datatype: "INTEGER",
      description: "Closed SAR cases",
    },
    {
      field: "sars_filed",
      datatype: "INTEGER",
      description: "SARs filed to FinCEN",
    },
    {
      field: "open_sar_cases",
      datatype: "INTEGER",
      description: "Active SAR cases",
    },

    // CTR Metrics
    {
      field: "ctr_reportable_transactions",
      datatype: "INTEGER",
      description: "CTR-eligible txns",
    },
    { field: "ctrs_filed", datatype: "INTEGER", description: "CTRs filed" },

    // Review Metrics
    {
      field: "alerts_pending_review",
      datatype: "INTEGER",
      description: "Alerts awaiting review",
    },
    {
      field: "alerts_cleared",
      datatype: "INTEGER",
      description: "Alerts cleared",
    },
    {
      field: "alerts_escalated",
      datatype: "INTEGER",
      description: "Alerts escalated",
    },
    {
      field: "avg_review_time_hours",
      datatype: "DECIMAL(10,2)",
      description: "Avg alert review time",
    },

    // Performance Metrics
    {
      field: "false_positive_rate",
      datatype: "DECIMAL(5,2)",
      description: "False positive %",
    },
    {
      field: "alert_to_sar_conversion_rate",
      datatype: "DECIMAL(5,2)",
      description: "% of alerts becoming SARs",
    },
  ],
};

// ============================================================================
// AML RULES ENGINE CATALOG
// ============================================================================

export const amlRulesCatalog = {
  totalRules: 50,

  ruleCategories: {
    structuring: {
      rules: 8,
      examples: [
        "Multiple transactions just below $10K in 24 hours",
        "Sequential deposits across multiple accounts",
        "Round-dollar amounts near reporting thresholds",
        "Pattern of deposits followed by immediate withdrawals",
      ],
    },
    velocity: {
      rules: 6,
      examples: [
        "Unusual transaction frequency spike",
        "Rapid movement of funds (in and out quickly)",
        "High-velocity card usage",
      ],
    },
    geography: {
      rules: 7,
      examples: [
        "Transactions to/from high-risk countries",
        "Multiple international wire transfers",
        "Unusual location for customer profile",
      ],
    },
    amount: {
      rules: 5,
      examples: [
        "Transaction amount significantly above customer profile",
        "Unusual cash deposit amounts",
        "Large wire transfers inconsistent with business",
      ],
    },
    ofacSanctions: {
      rules: 8,
      examples: [
        "SDN list match",
        "Consolidated sanctions list match",
        "Country-based sanctions screening",
        "Fuzzy name matching for OFAC",
      ],
    },
    behavioral: {
      rules: 10,
      examples: [
        "Dormant account suddenly active",
        "Change in transaction patterns",
        "Unusual merchant categories",
        "Time-of-day anomalies",
      ],
    },
    relationshipRisk: {
      rules: 6,
      examples: [
        "Multiple accounts with same tax ID",
        "Circular transfers between related accounts",
        "Third-party deposits",
      ],
    },
  },

  sarCategories: [
    "Structuring",
    "Money Laundering",
    "Terrorist Financing",
    "Fraud",
    "Identity Theft",
    "Elder Financial Exploitation",
    "Human Trafficking",
    "Trade-Based Money Laundering",
    "Cyber Event",
    "Other Suspicious Activity",
  ],
};

// Export catalog
export const amlSARFramework = {
  silverTables: 3,
  goldTables: 1,
  totalColumns: 180,
  ruleEngine: amlRulesCatalog,

  features: [
    "Real-time transaction screening",
    "OFAC/sanctions list matching",
    "Structuring detection algorithms",
    "Behavioral anomaly detection",
    "SAR case management workflow",
    "FinCEN BSA E-Filing integration",
    "Customer risk profiling",
    "Enhanced due diligence tracking",
    "CTR automation",
    "Law enforcement referral tracking",
    "Audit trail and compliance reporting",
  ],

  regulatoryCompliance: [
    "Bank Secrecy Act (BSA)",
    "USA PATRIOT Act",
    "FinCEN SAR requirements (31 CFR 1020.320)",
    "OFAC sanctions compliance",
    "Anti-Money Laundering Act of 2020",
    "Currency Transaction Reporting (CTR)",
  ],

  completeness: "100% - Comprehensive AML/SAR workflow coverage",
};
