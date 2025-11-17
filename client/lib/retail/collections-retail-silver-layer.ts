export const collectionsRetailSilverTables = [
  // Table 1: Delinquent Accounts Cleansed
  {
    name: 'silver.retail_delinquent_accounts_cleansed',
    description: 'Cleansed delinquent account data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_delinquent_accounts'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per delinquent account per validity period',
    primaryKey: ['delinquency_sk'],
    partitionBy: ['delinquency_date'],
    clusterBy: ['customer_id', 'account_id', 'delinquency_status'],
    dataQualityMetrics: {
      completeness: 99.8,
      accuracy: 99.9,
      consistency: 99.8,
      timeliness: 99.9,
      validity: 99.7
    },
    schema: {
      delinquency_sk: "BIGINT PRIMARY KEY",
      delinquency_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_id: "BIGINT NOT NULL",
      account_id: "BIGINT NOT NULL",
      account_type: "STRING NOT NULL",
      delinquency_date: "DATE NOT NULL",
      delinquency_status: "STRING NOT NULL",
      days_past_due: "INT NOT NULL",
      past_due_amount: "DECIMAL(18,2) NOT NULL",
      total_balance: "DECIMAL(18,2)",
      minimum_payment_due: "DECIMAL(18,2)",
      missed_payments_count: "INT",
      collection_stage: "STRING",
      collector_id: "BIGINT",
      assigned_date: "DATE",
      effective_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      effective_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 2: Collection Activities Cleansed
  {
    name: 'silver.retail_collection_activities_cleansed',
    description: 'Cleansed collection activity data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_collection_activities'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per collection activity',
    primaryKey: ['activity_sk'],
    partitionBy: ['activity_date'],
    clusterBy: ['customer_id', 'activity_type', 'contact_result'],
    dataQualityMetrics: {
      completeness: 99.7,
      accuracy: 99.8,
      consistency: 99.7,
      timeliness: 99.9,
      validity: 99.6
    },
    schema: {
      activity_sk: "BIGINT PRIMARY KEY",
      activity_id: "BIGINT NOT NULL COMMENT 'Business key'",
      delinquency_id: "BIGINT",
      customer_id: "BIGINT NOT NULL",
      account_id: "BIGINT NOT NULL",
      activity_date: "DATE NOT NULL",
      activity_timestamp: "TIMESTAMP NOT NULL",
      activity_type: "STRING NOT NULL",
      activity_category: "STRING",
      contact_result: "STRING",
      collector_id: "BIGINT",
      duration_seconds: "INT",
      next_action_date: "DATE",
      is_successful_contact: "BOOLEAN",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 3: Payment Promises Cleansed
  {
    name: 'silver.retail_payment_promises_cleansed',
    description: 'Cleansed payment promise data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_payment_promises'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per payment promise',
    primaryKey: ['promise_sk'],
    partitionBy: ['promise_date'],
    clusterBy: ['customer_id', 'promise_status'],
    dataQualityMetrics: {
      completeness: 99.7,
      accuracy: 99.8,
      consistency: 99.7,
      timeliness: 99.8,
      validity: 99.6
    },
    schema: {
      promise_sk: "BIGINT PRIMARY KEY",
      promise_id: "BIGINT NOT NULL COMMENT 'Business key'",
      delinquency_id: "BIGINT",
      customer_id: "BIGINT NOT NULL",
      account_id: "BIGINT NOT NULL",
      promise_date: "DATE NOT NULL",
      promised_payment_date: "DATE NOT NULL",
      promised_amount: "DECIMAL(18,2) NOT NULL",
      promise_status: "STRING NOT NULL",
      actual_payment_date: "DATE",
      actual_payment_amount: "DECIMAL(18,2)",
      collector_id: "BIGINT",
      payment_method: "STRING",
      is_kept: "BOOLEAN",
      days_variance: "INT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 4: Payment Arrangements Cleansed
  {
    name: 'silver.retail_payment_arrangements_cleansed',
    description: 'Cleansed payment arrangement data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_payment_arrangements'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per payment arrangement',
    primaryKey: ['arrangement_sk'],
    partitionBy: ['arrangement_date'],
    clusterBy: ['customer_id', 'arrangement_status'],
    dataQualityMetrics: {
      completeness: 99.7,
      accuracy: 99.8,
      consistency: 99.7,
      timeliness: 99.8,
      validity: 99.6
    },
    schema: {
      arrangement_sk: "BIGINT PRIMARY KEY",
      arrangement_id: "BIGINT NOT NULL COMMENT 'Business key'",
      delinquency_id: "BIGINT",
      customer_id: "BIGINT NOT NULL",
      account_id: "BIGINT NOT NULL",
      arrangement_date: "DATE NOT NULL",
      arrangement_type: "STRING NOT NULL",
      total_amount_owed: "DECIMAL(18,2) NOT NULL",
      settlement_amount: "DECIMAL(18,2)",
      installment_count: "INT",
      installment_amount: "DECIMAL(18,2)",
      first_payment_date: "DATE",
      payment_frequency: "STRING",
      arrangement_status: "STRING NOT NULL",
      completion_date: "DATE",
      collector_id: "BIGINT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 5: Collection Payments Cleansed
  {
    name: 'silver.retail_collection_payments_cleansed',
    description: 'Cleansed collection payment data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_collection_payments'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per payment',
    primaryKey: ['collection_payment_sk'],
    partitionBy: ['payment_date'],
    clusterBy: ['customer_id', 'payment_type'],
    dataQualityMetrics: {
      completeness: 99.8,
      accuracy: 99.9,
      consistency: 99.8,
      timeliness: 99.9,
      validity: 99.7
    },
    schema: {
      collection_payment_sk: "BIGINT PRIMARY KEY",
      payment_id: "BIGINT NOT NULL COMMENT 'Business key'",
      delinquency_id: "BIGINT",
      customer_id: "BIGINT NOT NULL",
      account_id: "BIGINT NOT NULL",
      arrangement_id: "BIGINT",
      promise_id: "BIGINT",
      payment_date: "DATE NOT NULL",
      payment_amount: "DECIMAL(18,2) NOT NULL",
      payment_method: "STRING",
      payment_type: "STRING",
      transaction_id: "STRING",
      payment_status: "STRING NOT NULL",
      collector_id: "BIGINT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 6: Charge-Offs Cleansed
  {
    name: 'silver.retail_charge_offs_cleansed',
    description: 'Cleansed charge-off data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_charge_offs'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per charge-off',
    primaryKey: ['charge_off_sk'],
    partitionBy: ['charge_off_date'],
    clusterBy: ['customer_id', 'recovery_strategy'],
    dataQualityMetrics: {
      completeness: 99.8,
      accuracy: 99.9,
      consistency: 99.8,
      timeliness: 99.8,
      validity: 99.7
    },
    schema: {
      charge_off_sk: "BIGINT PRIMARY KEY",
      charge_off_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_id: "BIGINT NOT NULL",
      account_id: "BIGINT NOT NULL",
      delinquency_id: "BIGINT",
      charge_off_date: "DATE NOT NULL",
      charge_off_amount: "DECIMAL(18,2) NOT NULL",
      outstanding_principal: "DECIMAL(18,2)",
      outstanding_interest: "DECIMAL(18,2)",
      outstanding_fees: "DECIMAL(18,2)",
      days_delinquent: "INT",
      charge_off_reason: "STRING",
      recovery_strategy: "STRING",
      assigned_agency: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 7: Recoveries Cleansed
  {
    name: 'silver.retail_recoveries_cleansed',
    description: 'Cleansed recovery data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_recoveries'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per recovery payment',
    primaryKey: ['recovery_sk'],
    partitionBy: ['recovery_date'],
    clusterBy: ['charge_off_id', 'recovery_method'],
    dataQualityMetrics: {
      completeness: 99.7,
      accuracy: 99.8,
      consistency: 99.7,
      timeliness: 99.8,
      validity: 99.6
    },
    schema: {
      recovery_sk: "BIGINT PRIMARY KEY",
      recovery_id: "BIGINT NOT NULL COMMENT 'Business key'",
      charge_off_id: "BIGINT NOT NULL",
      customer_id: "BIGINT NOT NULL",
      account_id: "BIGINT NOT NULL",
      recovery_date: "DATE NOT NULL",
      recovery_amount: "DECIMAL(18,2) NOT NULL",
      recovery_method: "STRING",
      recovery_type: "STRING",
      collector_id: "BIGINT",
      agency_name: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 8: Legal Actions Cleansed
  {
    name: 'silver.retail_legal_actions_cleansed',
    description: 'Cleansed legal action data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_legal_actions'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per legal action',
    primaryKey: ['legal_action_sk'],
    partitionBy: ['action_date'],
    clusterBy: ['customer_id', 'action_type'],
    dataQualityMetrics: {
      completeness: 99.7,
      accuracy: 99.8,
      consistency: 99.7,
      timeliness: 99.8,
      validity: 99.6
    },
    schema: {
      legal_action_sk: "BIGINT PRIMARY KEY",
      legal_action_id: "BIGINT NOT NULL COMMENT 'Business key'",
      delinquency_id: "BIGINT",
      customer_id: "BIGINT NOT NULL",
      account_id: "BIGINT NOT NULL",
      action_date: "DATE NOT NULL",
      action_type: "STRING NOT NULL",
      filing_date: "DATE",
      court_name: "STRING",
      case_number: "STRING",
      judgment_amount: "DECIMAL(18,2)",
      judgment_date: "DATE",
      action_status: "STRING",
      attorney_name: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 9: Settlement Offers Cleansed
  {
    name: 'silver.retail_settlement_offers_cleansed',
    description: 'Cleansed settlement offer data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_settlement_offers'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per settlement offer',
    primaryKey: ['settlement_sk'],
    partitionBy: ['offer_date'],
    clusterBy: ['customer_id', 'offer_status'],
    dataQualityMetrics: {
      completeness: 99.7,
      accuracy: 99.8,
      consistency: 99.7,
      timeliness: 99.8,
      validity: 99.6
    },
    schema: {
      settlement_sk: "BIGINT PRIMARY KEY",
      settlement_id: "BIGINT NOT NULL COMMENT 'Business key'",
      delinquency_id: "BIGINT",
      customer_id: "BIGINT NOT NULL",
      account_id: "BIGINT NOT NULL",
      offer_date: "DATE NOT NULL",
      total_balance: "DECIMAL(18,2) NOT NULL",
      settlement_amount: "DECIMAL(18,2) NOT NULL",
      settlement_percentage: "DECIMAL(5,2)",
      offer_expiry_date: "DATE",
      offer_status: "STRING NOT NULL",
      acceptance_date: "DATE",
      payment_due_date: "DATE",
      actual_payment_date: "DATE",
      collector_id: "BIGINT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 10: Agency Placements Cleansed
  {
    name: 'silver.retail_agency_placements_cleansed',
    description: 'Cleansed agency placement data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_agency_placements'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per agency placement',
    primaryKey: ['placement_sk'],
    partitionBy: ['placement_date'],
    clusterBy: ['agency_id', 'placement_status'],
    dataQualityMetrics: {
      completeness: 99.7,
      accuracy: 99.8,
      consistency: 99.7,
      timeliness: 99.8,
      validity: 99.6
    },
    schema: {
      placement_sk: "BIGINT PRIMARY KEY",
      placement_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_id: "BIGINT NOT NULL",
      account_id: "BIGINT NOT NULL",
      delinquency_id: "BIGINT",
      agency_id: "BIGINT NOT NULL",
      placement_date: "DATE NOT NULL",
      placement_amount: "DECIMAL(18,2) NOT NULL",
      placement_status: "STRING NOT NULL",
      recall_date: "DATE",
      recall_reason: "STRING",
      total_collected: "DECIMAL(18,2)",
      commission_paid: "DECIMAL(18,2)",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 11: Collection Metrics Aggregated
  {
    name: 'silver.retail_collection_metrics_agg',
    description: 'Aggregated collection metrics',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_delinquent_accounts', 'bronze.retail_collection_payments'],
    transformationType: 'AGGREGATION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per account per month',
    primaryKey: ['collection_metrics_sk'],
    partitionBy: ['metric_month'],
    clusterBy: ['account_id'],
    dataQualityMetrics: {
      completeness: 99.6,
      accuracy: 99.7,
      consistency: 99.6,
      timeliness: 99.7,
      validity: 99.5
    },
    schema: {
      collection_metrics_sk: "BIGINT PRIMARY KEY",
      account_id: "BIGINT NOT NULL",
      customer_id: "BIGINT NOT NULL",
      metric_month: "DATE NOT NULL COMMENT 'First day of month'",
      total_activities: "INT",
      successful_contacts: "INT",
      promises_made: "INT",
      promises_kept: "INT",
      total_payments: "INT",
      total_collected: "DECIMAL(18,2)",
      ending_balance: "DECIMAL(18,2)",
      ending_dpd: "INT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 12: Collector Performance Aggregated
  {
    name: 'silver.retail_collector_performance_agg',
    description: 'Aggregated collector performance metrics',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_collectors', 'bronze.retail_collection_payments'],
    transformationType: 'AGGREGATION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per collector per month',
    primaryKey: ['collector_performance_sk'],
    partitionBy: ['performance_month'],
    clusterBy: ['collector_id'],
    dataQualityMetrics: {
      completeness: 99.6,
      accuracy: 99.7,
      consistency: 99.6,
      timeliness: 99.7,
      validity: 99.5
    },
    schema: {
      collector_performance_sk: "BIGINT PRIMARY KEY",
      collector_id: "BIGINT NOT NULL",
      performance_month: "DATE NOT NULL COMMENT 'First day of month'",
      total_activities: "INT",
      successful_contacts: "INT",
      contact_rate: "DECIMAL(5,2)",
      promises_obtained: "INT",
      promise_to_pay_rate: "DECIMAL(5,2)",
      total_collected: "DECIMAL(18,2)",
      accounts_resolved: "INT",
      average_resolution_days: "INT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 13: Hardship Programs Cleansed
  {
    name: 'silver.retail_hardship_programs_cleansed',
    description: 'Cleansed hardship program enrollment data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_hardship_programs'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per hardship enrollment',
    primaryKey: ['hardship_sk'],
    partitionBy: ['enrollment_date'],
    clusterBy: ['customer_id', 'program_status'],
    dataQualityMetrics: {
      completeness: 99.6,
      accuracy: 99.7,
      consistency: 99.6,
      timeliness: 99.7,
      validity: 99.5
    },
    schema: {
      hardship_sk: "BIGINT PRIMARY KEY",
      hardship_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_id: "BIGINT NOT NULL",
      account_id: "BIGINT NOT NULL",
      delinquency_id: "BIGINT",
      enrollment_date: "DATE NOT NULL",
      hardship_type: "STRING NOT NULL",
      program_type: "STRING NOT NULL",
      original_payment: "DECIMAL(18,2)",
      modified_payment: "DECIMAL(18,2)",
      program_duration_months: "INT",
      program_status: "STRING NOT NULL",
      completion_date: "DATE",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 14: Skip Trace Activities Cleansed
  {
    name: 'silver.retail_skip_trace_activities_cleansed',
    description: 'Cleansed skip trace activity data',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_skip_trace_activities'],
    transformationType: 'CLEANSING',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per skip trace activity',
    primaryKey: ['skip_trace_sk'],
    partitionBy: ['skip_trace_date'],
    clusterBy: ['customer_id', 'result_status'],
    dataQualityMetrics: {
      completeness: 99.6,
      accuracy: 99.7,
      consistency: 99.6,
      timeliness: 99.7,
      validity: 99.5
    },
    schema: {
      skip_trace_sk: "BIGINT PRIMARY KEY",
      skip_trace_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_id: "BIGINT NOT NULL",
      account_id: "BIGINT NOT NULL",
      delinquency_id: "BIGINT",
      skip_trace_date: "DATE NOT NULL",
      skip_reason: "STRING",
      vendor_used: "STRING",
      vendor_cost: "DECIMAL(18,2)",
      result_status: "STRING",
      new_address_found: "BOOLEAN",
      new_phone_found: "BOOLEAN",
      new_employer_found: "BOOLEAN",
      collector_id: "BIGINT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 15: Recovery Metrics Aggregated
  {
    name: 'silver.retail_recovery_metrics_agg',
    description: 'Aggregated recovery metrics from charged-off accounts',
    layer: 'SILVER',
    sourceLayer: 'BRONZE',
    sourceTables: ['bronze.retail_charge_offs', 'bronze.retail_recoveries'],
    transformationType: 'AGGREGATION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per charged-off account per month',
    primaryKey: ['recovery_metrics_sk'],
    partitionBy: ['metric_month'],
    clusterBy: ['charge_off_id'],
    dataQualityMetrics: {
      completeness: 99.6,
      accuracy: 99.7,
      consistency: 99.6,
      timeliness: 99.7,
      validity: 99.5
    },
    schema: {
      recovery_metrics_sk: "BIGINT PRIMARY KEY",
      charge_off_id: "BIGINT NOT NULL",
      customer_id: "BIGINT NOT NULL",
      account_id: "BIGINT NOT NULL",
      metric_month: "DATE NOT NULL COMMENT 'First day of month'",
      total_recoveries: "INT",
      total_recovered: "DECIMAL(18,2)",
      recovery_rate: "DECIMAL(5,2)",
      months_since_charge_off: "INT",
      recovery_method_primary: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  }
];

export const collectionsRetailSilverLayerComplete = {
  description: 'Silver layer for retail collections domain - cleansed and aggregated data',
  layer: 'SILVER',
  tables: collectionsRetailSilverTables,
  totalTables: collectionsRetailSilverTables.length
};

export default collectionsRetailSilverLayerComplete;
