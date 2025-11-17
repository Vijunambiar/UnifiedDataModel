export const insuranceRetailSilverTables = [
  // Table 1: Insurance Policies Cleansed
  {
    name: 'silver.retail_insurance_policies_cleansed',
    description: 'Cleansed and validated insurance policy data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_insurance_policies'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per policy per validity period',
    primaryKey: ['policy_sk'],
    partitionBy: ['effective_date'],
    clusterBy: ['customer_id', 'policy_type', 'policy_status'],
    dataQualityMetrics: {
      completeness: 99.8,
      accuracy: 99.9,
      consistency: 99.8,
      timeliness: 99.9,
      validity: 99.7
    },
    schema: {
      policy_sk: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      policy_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_id: "BIGINT NOT NULL",
      policy_number: "STRING NOT NULL",
      policy_type: "STRING NOT NULL",
      product_code: "STRING",
      product_name: "STRING",
      policy_status: "STRING NOT NULL",
      effective_date: "DATE NOT NULL",
      expiration_date: "DATE",
      issue_date: "DATE",
      policy_term_months: "INT",
      coverage_amount: "DECIMAL(18,2)",
      premium_amount: "DECIMAL(18,2)",
      premium_frequency: "STRING",
      deductible_amount: "DECIMAL(18,2)",
      agent_id: "BIGINT",
      scd_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      scd_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 2: Insurance Claims Cleansed
  {
    name: 'silver.retail_insurance_claims_cleansed',
    description: 'Cleansed insurance claims data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_insurance_claims'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per claim',
    primaryKey: ['claim_sk'],
    partitionBy: ['claim_date'],
    clusterBy: ['policy_id', 'claim_status'],
    dataQualityMetrics: {
      completeness: 99.7,
      accuracy: 99.8,
      consistency: 99.7,
      timeliness: 99.9,
      validity: 99.6
    },
    schema: {
      claim_sk: "BIGINT PRIMARY KEY",
      claim_id: "BIGINT NOT NULL COMMENT 'Business key'",
      policy_id: "BIGINT NOT NULL",
      customer_id: "BIGINT NOT NULL",
      claim_number: "STRING NOT NULL",
      claim_date: "DATE NOT NULL",
      incident_date: "DATE NOT NULL",
      report_date: "DATE",
      claim_type: "STRING NOT NULL",
      claim_category: "STRING",
      claim_status: "STRING NOT NULL",
      claimed_amount: "DECIMAL(18,2) NOT NULL",
      approved_amount: "DECIMAL(18,2)",
      paid_amount: "DECIMAL(18,2)",
      deductible_applied: "DECIMAL(18,2)",
      adjuster_id: "BIGINT",
      approval_date: "DATE",
      payment_date: "DATE",
      is_fraud_flagged: "BOOLEAN",
      days_to_approval: "INT",
      days_to_payment: "INT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 3: Premium Payments Cleansed
  {
    name: 'silver.retail_premium_payments_cleansed',
    description: 'Cleansed premium payment transactions',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_premium_payments'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per premium payment',
    primaryKey: ['premium_payment_sk'],
    partitionBy: ['payment_date'],
    clusterBy: ['policy_id', 'payment_status'],
    dataQualityMetrics: {
      completeness: 99.8,
      accuracy: 99.9,
      consistency: 99.8,
      timeliness: 99.9,
      validity: 99.7
    },
    schema: {
      premium_payment_sk: "BIGINT PRIMARY KEY",
      payment_id: "BIGINT NOT NULL COMMENT 'Business key'",
      policy_id: "BIGINT NOT NULL",
      customer_id: "BIGINT NOT NULL",
      payment_date: "DATE NOT NULL",
      due_date: "DATE NOT NULL",
      payment_amount: "DECIMAL(18,2) NOT NULL",
      premium_amount: "DECIMAL(18,2) NOT NULL",
      late_fee: "DECIMAL(18,2)",
      discount_amount: "DECIMAL(18,2)",
      payment_method: "STRING",
      payment_status: "STRING NOT NULL",
      transaction_id: "STRING",
      is_late_payment: "BOOLEAN",
      days_late: "INT",
      payment_channel: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 4: Policy Quotes Cleansed
  {
    name: 'silver.retail_policy_quotes_cleansed',
    description: 'Cleansed insurance quote data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_policy_quotes'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per quote',
    primaryKey: ['quote_sk'],
    partitionBy: ['quote_date'],
    clusterBy: ['customer_id', 'quote_status'],
    dataQualityMetrics: {
      completeness: 99.6,
      accuracy: 99.7,
      consistency: 99.6,
      timeliness: 99.8,
      validity: 99.5
    },
    schema: {
      quote_sk: "BIGINT PRIMARY KEY",
      quote_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_id: "BIGINT NOT NULL",
      quote_number: "STRING NOT NULL",
      quote_date: "DATE NOT NULL",
      quote_expiry_date: "DATE",
      product_type: "STRING NOT NULL",
      coverage_amount: "DECIMAL(18,2)",
      quoted_premium: "DECIMAL(18,2) NOT NULL",
      premium_frequency: "STRING",
      deductible_amount: "DECIMAL(18,2)",
      quote_status: "STRING NOT NULL",
      is_converted: "BOOLEAN",
      conversion_date: "DATE",
      converted_policy_id: "BIGINT",
      channel: "STRING",
      agent_id: "BIGINT",
      risk_score: "DECIMAL(5,2)",
      days_to_conversion: "INT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 5: Claim Payments Cleansed
  {
    name: 'silver.retail_claim_payments_cleansed',
    description: 'Cleansed claim payment transactions',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_claim_payments'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per claim payment',
    primaryKey: ['claim_payment_sk'],
    partitionBy: ['payment_date'],
    clusterBy: ['claim_id', 'payment_status'],
    dataQualityMetrics: {
      completeness: 99.8,
      accuracy: 99.9,
      consistency: 99.8,
      timeliness: 99.9,
      validity: 99.7
    },
    schema: {
      claim_payment_sk: "BIGINT PRIMARY KEY",
      payment_id: "BIGINT NOT NULL COMMENT 'Business key'",
      claim_id: "BIGINT NOT NULL",
      policy_id: "BIGINT NOT NULL",
      customer_id: "BIGINT NOT NULL",
      payment_date: "DATE NOT NULL",
      payment_amount: "DECIMAL(18,2) NOT NULL",
      payment_method: "STRING",
      payment_status: "STRING NOT NULL",
      payee_name: "STRING",
      payee_type: "STRING",
      check_number: "STRING",
      transaction_reference: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 6: Policy Renewals Cleansed
  {
    name: 'silver.retail_policy_renewals_cleansed',
    description: 'Cleansed policy renewal data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_policy_renewals'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per renewal event',
    primaryKey: ['renewal_sk'],
    partitionBy: ['renewal_date'],
    clusterBy: ['policy_id', 'renewal_status'],
    dataQualityMetrics: {
      completeness: 99.7,
      accuracy: 99.8,
      consistency: 99.7,
      timeliness: 99.8,
      validity: 99.6
    },
    schema: {
      renewal_sk: "BIGINT PRIMARY KEY",
      renewal_id: "BIGINT NOT NULL COMMENT 'Business key'",
      policy_id: "BIGINT NOT NULL",
      customer_id: "BIGINT NOT NULL",
      renewal_date: "DATE NOT NULL",
      previous_expiration_date: "DATE",
      new_expiration_date: "DATE",
      previous_premium: "DECIMAL(18,2)",
      new_premium: "DECIMAL(18,2)",
      premium_change_pct: "DECIMAL(5,2)",
      renewal_status: "STRING NOT NULL",
      renewal_type: "STRING",
      renewal_channel: "STRING",
      agent_id: "BIGINT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 7: Policy Cancellations Cleansed
  {
    name: 'silver.retail_policy_cancellations_cleansed',
    description: 'Cleansed policy cancellation data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_policy_cancellations'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per cancellation',
    primaryKey: ['cancellation_sk'],
    partitionBy: ['cancellation_date'],
    clusterBy: ['policy_id', 'cancellation_reason'],
    dataQualityMetrics: {
      completeness: 99.7,
      accuracy: 99.8,
      consistency: 99.7,
      timeliness: 99.8,
      validity: 99.6
    },
    schema: {
      cancellation_sk: "BIGINT PRIMARY KEY",
      cancellation_id: "BIGINT NOT NULL COMMENT 'Business key'",
      policy_id: "BIGINT NOT NULL",
      customer_id: "BIGINT NOT NULL",
      cancellation_date: "DATE NOT NULL",
      effective_cancellation_date: "DATE",
      cancellation_reason: "STRING NOT NULL",
      initiated_by: "STRING",
      refund_amount: "DECIMAL(18,2)",
      penalty_amount: "DECIMAL(18,2)",
      cancellation_type: "STRING",
      is_replacement: "BOOLEAN",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 8: Underwriting Decisions Cleansed
  {
    name: 'silver.retail_underwriting_decisions_cleansed',
    description: 'Cleansed underwriting decision data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_underwriting_decisions'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per underwriting decision',
    primaryKey: ['underwriting_sk'],
    partitionBy: ['underwriting_date'],
    clusterBy: ['policy_id', 'decision'],
    dataQualityMetrics: {
      completeness: 99.7,
      accuracy: 99.8,
      consistency: 99.7,
      timeliness: 99.8,
      validity: 99.6
    },
    schema: {
      underwriting_sk: "BIGINT PRIMARY KEY",
      underwriting_id: "BIGINT NOT NULL COMMENT 'Business key'",
      policy_id: "BIGINT",
      quote_id: "BIGINT",
      customer_id: "BIGINT NOT NULL",
      underwriting_date: "DATE NOT NULL",
      underwriter_id: "BIGINT",
      decision: "STRING NOT NULL",
      risk_classification: "STRING",
      premium_adjustment_pct: "DECIMAL(5,2)",
      is_medical_exam_required: "BOOLEAN",
      medical_exam_date: "DATE",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 9: Risk Assessments Cleansed
  {
    name: 'silver.retail_risk_assessments_cleansed',
    description: 'Cleansed risk assessment data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_risk_assessments'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per risk assessment',
    primaryKey: ['risk_assessment_sk'],
    partitionBy: ['assessment_date'],
    clusterBy: ['customer_id', 'risk_category'],
    dataQualityMetrics: {
      completeness: 99.6,
      accuracy: 99.7,
      consistency: 99.6,
      timeliness: 99.7,
      validity: 99.5
    },
    schema: {
      risk_assessment_sk: "BIGINT PRIMARY KEY",
      assessment_id: "BIGINT NOT NULL COMMENT 'Business key'",
      policy_id: "BIGINT",
      quote_id: "BIGINT",
      customer_id: "BIGINT NOT NULL",
      assessment_date: "DATE NOT NULL",
      risk_score: "DECIMAL(5,2) NOT NULL",
      risk_category: "STRING NOT NULL",
      health_score: "DECIMAL(5,2)",
      lifestyle_score: "DECIMAL(5,2)",
      occupation_risk: "STRING",
      geographic_risk: "STRING",
      credit_score: "INT",
      claims_history_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 10: Policy Lapse Events Cleansed
  {
    name: 'silver.retail_policy_lapse_events_cleansed',
    description: 'Cleansed policy lapse event data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_policy_lapse_events'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per lapse event',
    primaryKey: ['lapse_sk'],
    partitionBy: ['lapse_date'],
    clusterBy: ['policy_id', 'lapse_reason'],
    dataQualityMetrics: {
      completeness: 99.7,
      accuracy: 99.8,
      consistency: 99.7,
      timeliness: 99.8,
      validity: 99.6
    },
    schema: {
      lapse_sk: "BIGINT PRIMARY KEY",
      lapse_id: "BIGINT NOT NULL COMMENT 'Business key'",
      policy_id: "BIGINT NOT NULL",
      customer_id: "BIGINT NOT NULL",
      lapse_date: "DATE NOT NULL",
      lapse_reason: "STRING NOT NULL",
      grace_period_days: "INT",
      missed_payments: "INT",
      outstanding_premium: "DECIMAL(18,2)",
      surrender_value: "DECIMAL(18,2)",
      is_reinstatement_eligible: "BOOLEAN",
      reinstatement_deadline: "DATE",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 11: Policy Metrics Aggregated
  {
    name: 'silver.retail_policy_metrics_agg',
    description: 'Aggregated policy metrics by customer',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_insurance_policies'],
    transformationType: 'AGGREGATION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per customer per date',
    primaryKey: ['policy_metrics_sk'],
    partitionBy: ['snapshot_date'],
    clusterBy: ['customer_id'],
    dataQualityMetrics: {
      completeness: 99.6,
      accuracy: 99.7,
      consistency: 99.6,
      timeliness: 99.7,
      validity: 99.5
    },
    schema: {
      policy_metrics_sk: "BIGINT PRIMARY KEY",
      customer_id: "BIGINT NOT NULL",
      snapshot_date: "DATE NOT NULL",
      total_policies: "INT",
      active_policies: "INT",
      lapsed_policies: "INT",
      cancelled_policies: "INT",
      total_coverage_amount: "DECIMAL(18,2)",
      total_annual_premium: "DECIMAL(18,2)",
      average_premium: "DECIMAL(18,2)",
      policy_tenure_days_avg: "INT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 12: Claim Metrics Aggregated
  {
    name: 'silver.retail_claim_metrics_agg',
    description: 'Aggregated claim metrics',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_insurance_claims'],
    transformationType: 'AGGREGATION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per policy per month',
    primaryKey: ['claim_metrics_sk'],
    partitionBy: ['claim_month'],
    clusterBy: ['policy_id'],
    dataQualityMetrics: {
      completeness: 99.6,
      accuracy: 99.7,
      consistency: 99.6,
      timeliness: 99.7,
      validity: 99.5
    },
    schema: {
      claim_metrics_sk: "BIGINT PRIMARY KEY",
      policy_id: "BIGINT NOT NULL",
      customer_id: "BIGINT NOT NULL",
      claim_month: "DATE NOT NULL COMMENT 'First day of month'",
      total_claims: "INT",
      approved_claims: "INT",
      denied_claims: "INT",
      total_claimed_amount: "DECIMAL(18,2)",
      total_approved_amount: "DECIMAL(18,2)",
      total_paid_amount: "DECIMAL(18,2)",
      average_days_to_settlement: "INT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 13: Agent Performance Aggregated
  {
    name: 'silver.retail_agent_performance_agg',
    description: 'Aggregated agent performance metrics',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_insurance_agents', 'bronze.retail_insurance_policies'],
    transformationType: 'AGGREGATION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per agent per month',
    primaryKey: ['agent_performance_sk'],
    partitionBy: ['performance_month'],
    clusterBy: ['agent_id'],
    dataQualityMetrics: {
      completeness: 99.6,
      accuracy: 99.7,
      consistency: 99.6,
      timeliness: 99.7,
      validity: 99.5
    },
    schema: {
      agent_performance_sk: "BIGINT PRIMARY KEY",
      agent_id: "BIGINT NOT NULL",
      performance_month: "DATE NOT NULL COMMENT 'First day of month'",
      new_policies_sold: "INT",
      renewals_processed: "INT",
      total_premium_written: "DECIMAL(18,2)",
      total_commission_earned: "DECIMAL(18,2)",
      active_policies_count: "INT",
      cancellation_count: "INT",
      retention_rate: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 14: Commission Payments Cleansed
  {
    name: 'silver.retail_commission_payments_cleansed',
    description: 'Cleansed agent commission payment data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_commission_payments'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per commission payment',
    primaryKey: ['commission_sk'],
    partitionBy: ['payment_date'],
    clusterBy: ['agent_id', 'commission_type'],
    dataQualityMetrics: {
      completeness: 99.7,
      accuracy: 99.8,
      consistency: 99.7,
      timeliness: 99.8,
      validity: 99.6
    },
    schema: {
      commission_sk: "BIGINT PRIMARY KEY",
      commission_id: "BIGINT NOT NULL COMMENT 'Business key'",
      agent_id: "BIGINT NOT NULL",
      policy_id: "BIGINT",
      commission_type: "STRING NOT NULL",
      commission_period_start: "DATE",
      commission_period_end: "DATE",
      premium_amount: "DECIMAL(18,2)",
      commission_rate: "DECIMAL(5,4)",
      commission_amount: "DECIMAL(18,2) NOT NULL",
      payment_date: "DATE",
      payment_status: "STRING NOT NULL",
      payment_method: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 15: Customer Service Interactions Cleansed
  {
    name: 'silver.retail_insurance_service_interactions_cleansed',
    description: 'Cleansed customer service interaction data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_insurance_service_interactions'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per interaction',
    primaryKey: ['interaction_sk'],
    partitionBy: ['interaction_date'],
    clusterBy: ['customer_id', 'interaction_type'],
    dataQualityMetrics: {
      completeness: 99.6,
      accuracy: 99.7,
      consistency: 99.6,
      timeliness: 99.8,
      validity: 99.5
    },
    schema: {
      interaction_sk: "BIGINT PRIMARY KEY",
      interaction_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_id: "BIGINT NOT NULL",
      policy_id: "BIGINT",
      interaction_date: "DATE NOT NULL",
      interaction_timestamp: "TIMESTAMP NOT NULL",
      interaction_type: "STRING NOT NULL",
      channel: "STRING",
      agent_id: "BIGINT",
      duration_seconds: "INT",
      resolution_status: "STRING",
      satisfaction_rating: "INT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  }
];

export const insuranceRetailSilverLayerComplete = {
  description: 'Silver layer for retail insurance domain - cleansed and aggregated data',
  layer: 'SILVER',
  tables: insuranceRetailSilverTables,
  totalTables: insuranceRetailSilverTables.length
};

export default insuranceRetailSilverLayerComplete;
