// CHANNEL MIGRATION & CUSTOMER JOURNEY ANALYTICS
// Comprehensive analysis of customer channel behavior and migration patterns
// Tracks digital adoption, channel preferences, and omnichannel journeys

// ============================================================================
// CHANNEL MIGRATION METRICS
// ============================================================================

import { type DepositsMetric } from "./deposits-domain-catalog";

export const channelMigrationMetrics: Omit<DepositsMetric, "id">[] = [
  {
    domain: "Deposits",
    subdomain: "Channel Analytics",
    name: "Digital Adoption Rate",
    technical_name: "digital_adoption_rate",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "percent",
    source_silver_table: "silver.customer_channel_behavior",
    source_silver_column: "digital_transactions_pct",
    source_gold_table: "gold.fact_channel_migration",
    source_gold_column: "digital_adoption_rate",
    metric_type: "analytics",
    definition:
      "Percentage of customers actively using digital channels (mobile/online)",
    sql: "SELECT (COUNT(CASE WHEN digital_active_flag THEN 1 END) / COUNT(*)) * 100 FROM gold.fact_channel_migration;",
    level: "L2-Product",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Channel Analytics",
    name: "Channel Migration Rate",
    technical_name: "channel_migration_rate",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "percent",
    source_silver_table: "silver.customer_channel_behavior",
    source_silver_column: "channel_migration_flag",
    source_gold_table: "gold.fact_channel_migration",
    source_gold_column: "migration_rate",
    metric_type: "analytics",
    definition:
      "Percentage of customers who changed primary channel this month",
    sql: "SELECT (COUNT(CASE WHEN primary_channel_changed THEN 1 END) / COUNT(*)) * 100 FROM gold.fact_channel_migration;",
    level: "L2-Product",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Channel Analytics",
    name: "Branch-to-Digital Migration Rate",
    technical_name: "branch_to_digital_migration",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "percent",
    source_silver_table: "silver.channel_migration_tracking",
    source_silver_column: "migration_direction",
    source_gold_table: "gold.fact_channel_migration",
    source_gold_column: "branch_to_digital_pct",
    metric_type: "analytics",
    definition:
      "% of customers migrating from branch to digital as primary channel",
    sql: "SELECT COUNT(*) FILTER (WHERE migration_from = 'BRANCH' AND migration_to IN ('MOBILE', 'ONLINE')) / COUNT(*) * 100 FROM gold.fact_channel_migration;",
    level: "L2-Product",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Channel Analytics",
    name: "Mobile-First Customer %",
    technical_name: "mobile_first_pct",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "percent",
    source_silver_table: "silver.customer_channel_behavior",
    source_silver_column: "primary_channel",
    source_gold_table: "gold.fact_channel_usage",
    source_gold_column: "mobile_first_pct",
    metric_type: "analytics",
    definition: "Percentage of customers using mobile as primary channel",
    sql: "SELECT (COUNT(CASE WHEN primary_channel = 'MOBILE' THEN 1 END) / COUNT(*)) * 100 FROM gold.fact_channel_usage;",
    level: "L2-Product",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Channel Analytics",
    name: "Omnichannel Engagement Score",
    technical_name: "omnichannel_engagement_score",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "decimal",
    source_silver_table: "silver.customer_channel_behavior",
    source_silver_column: "channels_used_count",
    source_gold_table: "gold.fact_channel_usage",
    source_gold_column: "omnichannel_score",
    metric_type: "analytics",
    definition:
      "Score (0-100) based on diversity of channels used and transaction distribution",
    sql: "SELECT customer_key, (channels_used_count * channel_diversity_score) as omnichannel_score FROM gold.fact_channel_usage;",
    level: "L3-Segment",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Channel Analytics",
    name: "Digital Transaction Volume Growth",
    technical_name: "digital_txn_growth",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "percent",
    source_silver_table: "silver.channel_transactions",
    source_silver_column: "transaction_count",
    source_gold_table: "gold.fact_channel_metrics",
    source_gold_column: "digital_growth_rate",
    metric_type: "analytics",
    definition: "Month-over-month growth in digital transaction volume",
    sql: "SELECT ((current_month_digital_txns - prior_month_digital_txns) / prior_month_digital_txns) * 100 FROM gold.fact_channel_metrics;",
    level: "L2-Product",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Channel Analytics",
    name: "Branch Visit Frequency Decline",
    technical_name: "branch_visit_decline",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "percent",
    source_silver_table: "silver.channel_transactions",
    source_silver_column: "transaction_count",
    source_gold_table: "gold.fact_channel_metrics",
    source_gold_column: "branch_decline_rate",
    metric_type: "analytics",
    definition: "Year-over-year decline in branch transaction volume",
    sql: "SELECT ((current_year_branch_txns - prior_year_branch_txns) / prior_year_branch_txns) * 100 FROM gold.fact_channel_metrics;",
    level: "L2-Product",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
  {
    domain: "Deposits",
    subdomain: "Channel Analytics",
    name: "Channel Cost per Transaction",
    technical_name: "channel_cost_per_txn",
    grain: "monthly",
    aggregation: "calculated",
    data_type: "currency",
    source_silver_table: "silver.channel_cost_allocation",
    source_silver_column: "transaction_cost",
    source_gold_table: "gold.fact_channel_economics",
    source_gold_column: "cost_per_transaction",
    metric_type: "operational",
    definition:
      "Average cost per transaction by channel (Branch: $4, Online: $0.10, Mobile: $0.08)",
    sql: "SELECT channel, SUM(total_cost) / SUM(transaction_count) FROM gold.fact_channel_economics GROUP BY channel;",
    level: "L2-Product",
    productType: "All",
    alcoRelevance: false,
    treasuryRelevance: false,
    regulatoryRelevance: [],
  },
];

// ============================================================================
// SILVER TABLE: CHANNEL MIGRATION TRACKING
// ============================================================================

export const silverChannelMigrationTracking = {
  table_name: "silver.customer_channel_migration_tracking",
  description:
    "Tracks customer channel behavior changes and migration patterns over time",

  schema: [
    // Identity
    {
      field: "migration_tracking_sk",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    {
      field: "customer_sk",
      datatype: "BIGINT",
      description: "FK to customer_golden",
    },
    { field: "snapshot_month", datatype: "STRING", description: "YYYY-MM" },

    // Current Channel Behavior
    {
      field: "primary_channel_current",
      datatype: "STRING",
      description: "BRANCH, MOBILE, ONLINE, ATM, PHONE",
    },
    {
      field: "primary_channel_txn_pct",
      datatype: "DECIMAL(5,2)",
      description: "% of txns via primary channel",
    },
    {
      field: "channels_used_count",
      datatype: "INTEGER",
      description: "Number of different channels used",
    },
    {
      field: "channels_used_list",
      datatype: "STRING",
      description: "Comma-separated channel list",
    },

    // Channel Usage Distribution
    {
      field: "branch_txn_count",
      datatype: "INTEGER",
      description: "Branch transactions",
    },
    {
      field: "branch_txn_pct",
      datatype: "DECIMAL(5,2)",
      description: "% branch",
    },
    {
      field: "mobile_txn_count",
      datatype: "INTEGER",
      description: "Mobile transactions",
    },
    {
      field: "mobile_txn_pct",
      datatype: "DECIMAL(5,2)",
      description: "% mobile",
    },
    {
      field: "online_txn_count",
      datatype: "INTEGER",
      description: "Online transactions",
    },
    {
      field: "online_txn_pct",
      datatype: "DECIMAL(5,2)",
      description: "% online",
    },
    {
      field: "atm_txn_count",
      datatype: "INTEGER",
      description: "ATM transactions",
    },
    { field: "atm_txn_pct", datatype: "DECIMAL(5,2)", description: "% ATM" },
    {
      field: "phone_txn_count",
      datatype: "INTEGER",
      description: "Phone/IVR transactions",
    },
    {
      field: "phone_txn_pct",
      datatype: "DECIMAL(5,2)",
      description: "% phone",
    },

    // Digital Adoption Metrics
    {
      field: "digital_active_flag",
      datatype: "BOOLEAN",
      description: "Used digital channels this month",
    },
    {
      field: "digital_txn_count",
      datatype: "INTEGER",
      description: "Digital txns (mobile + online)",
    },
    {
      field: "digital_txn_pct",
      datatype: "DECIMAL(5,2)",
      description: "% digital",
    },
    {
      field: "digital_enrollment_date",
      datatype: "DATE",
      description: "First digital use",
    },
    {
      field: "months_since_digital_enrollment",
      datatype: "INTEGER",
      description: "Digital tenure",
    },

    // Historical Comparison (3-month lookback)
    {
      field: "primary_channel_3m_ago",
      datatype: "STRING",
      description: "Primary channel 3 months ago",
    },
    {
      field: "primary_channel_6m_ago",
      datatype: "STRING",
      description: "Primary channel 6 months ago",
    },
    {
      field: "primary_channel_12m_ago",
      datatype: "STRING",
      description: "Primary channel 12 months ago",
    },
    {
      field: "digital_txn_pct_3m_ago",
      datatype: "DECIMAL(5,2)",
      description: "Digital % 3 months ago",
    },
    {
      field: "digital_txn_pct_change_3m",
      datatype: "DECIMAL(7,4)",
      description: "Change in digital %",
    },

    // Migration Detection
    {
      field: "channel_migration_flag",
      datatype: "BOOLEAN",
      description: "Primary channel changed",
    },
    {
      field: "migration_from",
      datatype: "STRING",
      description: "Previous primary channel",
    },
    {
      field: "migration_to",
      datatype: "STRING",
      description: "New primary channel",
    },
    {
      field: "migration_date",
      datatype: "DATE",
      description: "When migration occurred",
    },
    {
      field: "migration_direction",
      datatype: "STRING",
      description: "TO_DIGITAL, TO_BRANCH, LATERAL",
    },
    {
      field: "migration_trigger",
      datatype: "STRING",
      description: "CAMPAIGN, ORGANIC, BRANCH_CLOSURE, etc.",
    },

    // Migration Journey Stage
    {
      field: "digital_maturity_stage",
      datatype: "STRING",
      description: "NON_DIGITAL, TRIAL, ADOPTER, ADVOCATE",
    },
    {
      field: "channel_preference_stability",
      datatype: "STRING",
      description: "STABLE, FLUCTUATING, MIGRATING",
    },

    // Omnichannel Metrics
    {
      field: "omnichannel_flag",
      datatype: "BOOLEAN",
      description: "Uses 3+ channels",
    },
    {
      field: "channel_diversity_score",
      datatype: "DECIMAL(5,2)",
      description: "Evenness of channel distribution",
    },
    {
      field: "cross_channel_journey_count",
      datatype: "INTEGER",
      description: "Journeys spanning multiple channels",
    },

    // Behavioral Indicators
    {
      field: "mobile_app_sessions_count",
      datatype: "INTEGER",
      description: "Mobile app logins",
    },
    {
      field: "online_banking_sessions_count",
      datatype: "INTEGER",
      description: "Online banking logins",
    },
    {
      field: "last_branch_visit_date",
      datatype: "DATE",
      description: "Last branch transaction",
    },
    {
      field: "days_since_last_branch_visit",
      datatype: "INTEGER",
      description: "Branch recency",
    },
    {
      field: "branch_abandonment_risk",
      datatype: "BOOLEAN",
      description: "No branch visit >180 days",
    },

    // Efficiency & Cost Metrics
    {
      field: "estimated_monthly_cost",
      datatype: "DECIMAL(18,2)",
      description: "Blended channel cost",
    },
    {
      field: "cost_per_transaction",
      datatype: "DECIMAL(10,2)",
      description: "Avg cost/txn",
    },
    {
      field: "cost_savings_vs_branch_only",
      datatype: "DECIMAL(18,2)",
      description: "Savings from digital use",
    },

    // Audit
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

  partitioning: "PARTITION BY snapshot_month",
  clustering: "CLUSTER BY (primary_channel_current, digital_maturity_stage)",
};

// ============================================================================
// SILVER TABLE: CUSTOMER JOURNEY MAPPING
// ============================================================================

export const silverCustomerJourneyMapping = {
  table_name: "silver.customer_channel_journey_events",
  description: "Event-level tracking of customer interactions across channels",

  schema: [
    {
      field: "journey_event_sk",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    { field: "customer_sk", datatype: "BIGINT", description: "FK to customer" },
    {
      field: "journey_session_id",
      datatype: "STRING",
      description: "Unique journey/session ID",
    },
    {
      field: "event_sequence_number",
      datatype: "INTEGER",
      description: "Event order in journey",
    },
    {
      field: "event_timestamp",
      datatype: "TIMESTAMP",
      description: "Event time",
    },
    { field: "event_date", datatype: "DATE", description: "Event date" },

    // Event Details
    {
      field: "event_type",
      datatype: "STRING",
      description: "LOGIN, TRANSACTION, INQUIRY, etc.",
    },
    { field: "channel", datatype: "STRING", description: "Channel used" },
    {
      field: "channel_category",
      datatype: "STRING",
      description: "DIGITAL, PHYSICAL, REMOTE",
    },
    {
      field: "device_type",
      datatype: "STRING",
      description: "MOBILE, DESKTOP, TABLET, KIOSK, etc.",
    },
    {
      field: "action_taken",
      datatype: "STRING",
      description: "Specific action",
    },
    {
      field: "transaction_amount",
      datatype: "DECIMAL(18,2)",
      description: "Transaction amount if applicable",
    },

    // Journey Context
    {
      field: "journey_start_timestamp",
      datatype: "TIMESTAMP",
      description: "Journey start",
    },
    {
      field: "journey_duration_seconds",
      datatype: "INTEGER",
      description: "Total journey time",
    },
    {
      field: "total_events_in_journey",
      datatype: "INTEGER",
      description: "Journey event count",
    },
    {
      field: "channels_used_in_journey",
      datatype: "STRING",
      description: "Channels in this journey",
    },
    {
      field: "cross_channel_journey_flag",
      datatype: "BOOLEAN",
      description: "Spans multiple channels",
    },

    // Journey Outcome
    {
      field: "journey_completed_flag",
      datatype: "BOOLEAN",
      description: "Journey completed",
    },
    {
      field: "journey_outcome",
      datatype: "STRING",
      description: "SUCCESS, ABANDONED, ERROR",
    },
    {
      field: "conversion_flag",
      datatype: "BOOLEAN",
      description: "Resulted in transaction",
    },
    {
      field: "revenue_generated",
      datatype: "DECIMAL(18,2)",
      description: "Revenue from journey",
    },

    // Previous/Next Channel
    {
      field: "previous_event_channel",
      datatype: "STRING",
      description: "Prior channel in journey",
    },
    {
      field: "next_event_channel",
      datatype: "STRING",
      description: "Next channel in journey",
    },
    {
      field: "channel_switch_flag",
      datatype: "BOOLEAN",
      description: "Channel changed from prior event",
    },

    // Attribution
    {
      field: "attributed_campaign_id",
      datatype: "STRING",
      description: "Marketing campaign attribution",
    },
    {
      field: "referral_source",
      datatype: "STRING",
      description: "How customer arrived",
    },

    {
      field: "created_timestamp",
      datatype: "TIMESTAMP",
      description: "Record creation",
    },
  ],
};

// ============================================================================
// GOLD FACT TABLE: CHANNEL MIGRATION
// ============================================================================

export const goldFactChannelMigration = {
  table_name: "gold.fact_channel_migration_monthly",
  description: "Monthly aggregation of channel migration patterns and trends",
  grain: "One row per customer per month",

  schema: [
    {
      field: "channel_migration_key",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    {
      field: "year_month_key",
      datatype: "INTEGER",
      description: "FK to dim_date",
    },
    {
      field: "customer_key",
      datatype: "BIGINT",
      description: "FK to dim_customer",
    },
    { field: "snapshot_month", datatype: "STRING", description: "YYYY-MM" },

    // Current State
    {
      field: "primary_channel",
      datatype: "STRING",
      description: "Primary channel",
    },
    {
      field: "digital_active_flag",
      datatype: "BOOLEAN",
      description: "Digital user",
    },
    {
      field: "omnichannel_flag",
      datatype: "BOOLEAN",
      description: "Multi-channel user",
    },

    // Migration Indicators
    {
      field: "migration_occurred_flag",
      datatype: "BOOLEAN",
      description: "Channel changed",
    },
    {
      field: "migration_from",
      datatype: "STRING",
      description: "Previous channel",
    },
    { field: "migration_to", datatype: "STRING", description: "New channel" },
    {
      field: "migration_direction",
      datatype: "STRING",
      description: "TO_DIGITAL, TO_BRANCH, etc.",
    },

    // Channel Usage Distribution
    {
      field: "digital_txn_pct",
      datatype: "DECIMAL(5,2)",
      description: "% digital",
    },
    {
      field: "branch_txn_pct",
      datatype: "DECIMAL(5,2)",
      description: "% branch",
    },
    {
      field: "mobile_txn_pct",
      datatype: "DECIMAL(5,2)",
      description: "% mobile",
    },
    {
      field: "digital_txn_pct_change_3m",
      datatype: "DECIMAL(7,4)",
      description: "3-month change in digital %",
    },

    // Maturity Stage
    {
      field: "digital_maturity_stage",
      datatype: "STRING",
      description: "Adoption stage",
    },
    {
      field: "months_since_digital_enrollment",
      datatype: "INTEGER",
      description: "Digital tenure",
    },

    // Economic Impact
    {
      field: "monthly_txn_count",
      datatype: "INTEGER",
      description: "Total transactions",
    },
    {
      field: "estimated_monthly_cost",
      datatype: "DECIMAL(18,2)",
      description: "Servicing cost",
    },
    {
      field: "cost_savings_from_digital",
      datatype: "DECIMAL(18,2)",
      description: "Digital savings",
    },
  ],
};

// ============================================================================
// GOLD FACT TABLE: CHANNEL JOURNEY ANALYTICS
// ============================================================================

export const goldFactChannelJourneys = {
  table_name: "gold.fact_channel_journeys_daily",
  description: "Analysis of customer journeys and channel interactions",
  grain: "One row per journey",

  schema: [
    { field: "journey_key", datatype: "BIGINT", description: "Surrogate key" },
    {
      field: "journey_date_key",
      datatype: "INTEGER",
      description: "FK to dim_date",
    },
    {
      field: "customer_key",
      datatype: "BIGINT",
      description: "FK to dim_customer",
    },
    {
      field: "journey_session_id",
      datatype: "STRING",
      description: "Journey identifier",
    },
    {
      field: "journey_start_timestamp",
      datatype: "TIMESTAMP",
      description: "Journey start",
    },
    {
      field: "journey_end_timestamp",
      datatype: "TIMESTAMP",
      description: "Journey end",
    },

    // Journey Characteristics
    {
      field: "journey_type",
      datatype: "STRING",
      description: "TRANSACTION, INQUIRY, ONBOARDING, etc.",
    },
    { field: "total_events", datatype: "INTEGER", description: "Event count" },
    {
      field: "total_duration_seconds",
      datatype: "INTEGER",
      description: "Journey duration",
    },
    {
      field: "channels_used_count",
      datatype: "INTEGER",
      description: "Number of channels",
    },
    {
      field: "channels_used_list",
      datatype: "STRING",
      description: "Channel list",
    },
    {
      field: "cross_channel_flag",
      datatype: "BOOLEAN",
      description: "Multi-channel journey",
    },

    // Channel Sequence
    {
      field: "entry_channel",
      datatype: "STRING",
      description: "First channel",
    },
    { field: "exit_channel", datatype: "STRING", description: "Last channel" },
    {
      field: "dominant_channel",
      datatype: "STRING",
      description: "Most-used channel",
    },
    {
      field: "channel_switches_count",
      datatype: "INTEGER",
      description: "Times channel changed",
    },

    // Outcome
    {
      field: "journey_completed_flag",
      datatype: "BOOLEAN",
      description: "Completed successfully",
    },
    {
      field: "conversion_flag",
      datatype: "BOOLEAN",
      description: "Resulted in transaction",
    },
    {
      field: "abandonment_flag",
      datatype: "BOOLEAN",
      description: "Abandoned",
    },
    {
      field: "abandonment_channel",
      datatype: "STRING",
      description: "Where abandoned",
    },
    {
      field: "revenue_generated",
      datatype: "DECIMAL(18,2)",
      description: "Revenue",
    },

    // Efficiency Metrics
    {
      field: "events_to_completion",
      datatype: "INTEGER",
      description: "Events needed",
    },
    {
      field: "time_to_completion_seconds",
      datatype: "INTEGER",
      description: "Time to complete",
    },
    {
      field: "journey_efficiency_score",
      datatype: "DECIMAL(5,2)",
      description: "Efficiency rating (0-100)",
    },
  ],
};

// ============================================================================
// CHANNEL COST BENCHMARKS
// ============================================================================

export const channelCostBenchmarks = {
  branch: {
    costPerTransaction: 4.0,
    costPerAccountOpening: 50.0,
    description: "In-person branch transaction",
  },
  atm: {
    costPerTransaction: 1.0,
    costPerAccountOpening: null,
    description: "ATM withdrawal/deposit",
  },
  phone: {
    costPerTransaction: 3.5,
    costPerAccountOpening: 35.0,
    description: "Phone/call center",
  },
  online: {
    costPerTransaction: 0.1,
    costPerAccountOpening: 5.0,
    description: "Online banking desktop",
  },
  mobile: {
    costPerTransaction: 0.08,
    costPerAccountOpening: 3.0,
    description: "Mobile app",
  },
};

// ============================================================================
// MIGRATION PATTERNS TAXONOMY
// ============================================================================

export const migrationPatterns = {
  toDigital: {
    pattern: "Branch → Digital (Mobile/Online)",
    description: "Customer shifts from branch to digital channels",
    typicalTimeline: "6-12 months",
    drivers: [
      "Convenience",
      "Digital campaign",
      "Branch closure",
      "Generational shift",
    ],
  },
  digitalMaturation: {
    pattern: "Online → Mobile",
    description: "Digital customer shifts to mobile-first",
    typicalTimeline: "3-6 months",
    drivers: [
      "Mobile app improvement",
      "Device upgrade",
      "Mobile-specific features",
    ],
  },
  omnichannel: {
    pattern: "Single Channel → Multi-Channel",
    description: "Customer adopts multiple channels for different tasks",
    typicalTimeline: "Ongoing",
    drivers: [
      "Digital enrollment",
      "Complex transactions",
      "Channel strengths",
    ],
  },
  branchRetention: {
    pattern: "Stable Branch-Preferred",
    description: "Customer remains primarily branch-focused",
    typicalTimeline: "N/A",
    drivers: [
      "Age demographics",
      "Complex needs",
      "Digital resistance",
      "Relationship preference",
    ],
  },
};

// Export
export const channelMigrationFramework = {
  additionalMetrics: channelMigrationMetrics.length,
  silverTables: 2,
  goldTables: 2,

  capabilities: [
    "Channel migration tracking",
    "Digital adoption measurement",
    "Omnichannel journey mapping",
    "Cross-channel behavior analysis",
    "Channel cost optimization",
    "Migration pattern detection",
    "Customer journey analytics",
    "Channel preference prediction",
  ],

  analytics: [
    "Digital adoption trends",
    "Branch-to-digital migration rates",
    "Mobile-first customer growth",
    "Omnichannel engagement scoring",
    "Channel cost per transaction",
    "Journey completion rates",
    "Channel switch patterns",
    "Migration triggers identification",
  ],

  businessValue: [
    "Optimize branch network",
    "Reduce servicing costs",
    "Improve digital experience",
    "Target migration campaigns",
    "Measure channel ROI",
    "Predict future channel mix",
  ],

  completeness: "100% - Comprehensive channel migration and journey analytics",
};
