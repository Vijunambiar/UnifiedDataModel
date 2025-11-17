/**
 * FRAUD-RETAIL SILVER LAYER - Complete Implementation
 * 
 * Domain: Fraud Retail
 * Area: Retail Banking
 * Purpose: Cleansed, deduplicated, and enriched fraud data
 * 
 * All 11 silver tables for retail fraud domain
 * MDM, SCD Type 2, data quality standards applied
 */

export const fraudRetailSilverTables = [
  // Table 1: Fraud Alerts Golden
  {
    name: 'silver.retail_fraud_alerts_golden',
    description: 'Golden record for fraud alerts with enrichment',
    grain: 'One current row per fraud alert',
    scdType: 'Type 2',
    
    primaryKey: ['alert_sk'],
    naturalKey: ['alert_id'],
    
    sourceTables: ['bronze.retail_fraud_alerts'],
    
    transformations: [
      'Deduplicate alerts from multiple systems',
      'Standardize alert types and categories',
      'Calculate time-to-resolution metrics',
      'Enrich with customer and account master data',
      'Calculate false positive rate by alert type',
      'Assign data quality scores',
    ],
    
    schema: {
      alert_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      alert_id: "BIGINT UNIQUE",
      alert_number: "STRING",
      
      customer_id: "BIGINT",
      account_id: "BIGINT",
      card_id: "BIGINT",
      
      alert_timestamp: "TIMESTAMP",
      alert_date: "DATE",
      
      alert_type_standardized: "STRING",
      alert_category_standardized: "STRING",
      fraud_scenario_standardized: "STRING",
      
      risk_score: "INTEGER",
      risk_level: "STRING",
      confidence_score: "DECIMAL(5,4)",
      
      transaction_id: "BIGINT",
      transaction_amount: "DECIMAL(18,2)",
      
      detection_method: "STRING",
      channel: "STRING",
      
      alert_status: "STRING",
      
      time_to_investigation_hours: "DECIMAL(10,2)",
      time_to_resolution_hours: "DECIMAL(10,2)",
      
      is_confirmed_fraud: "BOOLEAN",
      is_false_positive: "BOOLEAN",
      
      fraud_amount: "DECIMAL(18,2)",
      recovered_amount: "DECIMAL(18,2)",
      loss_amount: "DECIMAL(18,2)",
      
      card_blocked: "BOOLEAN",
      account_frozen: "BOOLEAN",
      
      sar_filed: "BOOLEAN",
      
      data_quality_score: "INTEGER",
      
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
  },
  
  // Table 2: Fraud Cases Golden
  {
    name: 'silver.retail_fraud_cases_golden',
    description: 'Golden record for fraud investigation cases',
    grain: 'One current row per fraud case',
    scdType: 'Type 2',
    
    primaryKey: ['case_sk'],
    naturalKey: ['case_id'],
    
    sourceTables: ['bronze.retail_fraud_cases'],
    
    schema: {
      case_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      case_id: "BIGINT UNIQUE",
      case_number: "STRING UNIQUE",
      
      customer_id: "BIGINT",
      account_id: "BIGINT",
      
      case_opened_timestamp: "TIMESTAMP",
      case_type_standardized: "STRING",
      fraud_method_standardized: "STRING",
      
      case_status: "STRING",
      
      time_to_investigation_hours: "DECIMAL(10,2)",
      time_to_resolution_hours: "DECIMAL(10,2)",
      total_case_duration_hours: "DECIMAL(10,2)",
      
      is_fraud_confirmed: "BOOLEAN",
      
      total_fraud_amount: "DECIMAL(18,2)",
      bank_liable_amount: "DECIMAL(18,2)",
      customer_liable_amount: "DECIMAL(18,2)",
      recovered_amount: "DECIMAL(18,2)",
      net_loss_amount: "DECIMAL(18,2)",
      
      sar_filed: "BOOLEAN",
      police_report_filed: "BOOLEAN",
      
      data_quality_score: "INTEGER",
      
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
  },
  
  // Table 3: Card Transactions with Fraud Scores
  {
    name: 'silver.retail_fraud_card_transactions_enriched',
    description: 'Card transactions enriched with fraud risk scores',
    grain: 'One row per transaction',
    scdType: 'Type 1',
    
    primaryKey: ['transaction_sk'],
    naturalKey: ['transaction_id'],
    
    sourceTables: ['bronze.retail_fraud_card_transactions'],
    
    schema: {
      transaction_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      transaction_id: "BIGINT UNIQUE",
      
      card_id: "BIGINT",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      
      transaction_timestamp: "TIMESTAMP",
      transaction_date: "DATE",
      
      transaction_type: "STRING",
      transaction_amount: "DECIMAL(18,2)",
      transaction_amount_usd: "DECIMAL(18,2)",
      
      authorization_status: "STRING",
      
      merchant_name: "STRING",
      merchant_category_code: "STRING",
      merchant_country: "STRING",
      
      terminal_type: "STRING",
      pos_entry_mode: "STRING",
      
      card_present: "BOOLEAN",
      cardholder_present: "BOOLEAN",
      chip_transaction: "BOOLEAN",
      
      is_online_transaction: "BOOLEAN",
      
      distance_from_home_miles: "DECIMAL(10,2)",
      
      transaction_velocity_1h: "INTEGER",
      transaction_velocity_24h: "INTEGER",
      
      fraud_score: "INTEGER",
      fraud_risk_level: "STRING",
      
      is_flagged_for_fraud: "BOOLEAN",
      fraud_alert_id: "BIGINT",
      
      is_disputed: "BOOLEAN",
      is_confirmed_fraud: "BOOLEAN",
      
      data_quality_score: "INTEGER",
      
      created_date: "DATE",
    },
  },
  
  // Table 4: Card Compromises Aggregated
  {
    name: 'silver.retail_card_compromises_aggregated',
    description: 'Aggregated card compromise events',
    grain: 'One row per compromise event',
    scdType: 'Type 1',
    
    primaryKey: ['compromise_sk'],
    naturalKey: ['compromise_id'],
    
    sourceTables: ['bronze.retail_card_compromises'],
    
    schema: {
      compromise_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      compromise_id: "BIGINT UNIQUE",
      
      card_id: "BIGINT",
      customer_id: "BIGINT",
      
      compromise_timestamp: "TIMESTAMP",
      compromise_type_standardized: "STRING",
      
      reported_by: "STRING",
      
      fraudulent_transaction_count: "INTEGER",
      total_fraud_amount: "DECIMAL(18,2)",
      
      card_status_after: "STRING",
      replacement_card_issued: "BOOLEAN",
      
      is_part_of_data_breach: "BOOLEAN",
      data_breach_name: "STRING",
      
      fraud_case_id: "BIGINT",
      
      data_quality_score: "INTEGER",
      
      created_date: "DATE",
    },
  },
  
  // Table 5: Identity Theft Cases Aggregated
  {
    name: 'silver.retail_identity_theft_cases_aggregated',
    description: 'Aggregated identity theft cases',
    grain: 'One row per identity theft case',
    scdType: 'Type 1',
    
    primaryKey: ['identity_theft_case_sk'],
    naturalKey: ['identity_theft_case_id'],
    
    sourceTables: ['bronze.retail_identity_theft_cases'],
    
    schema: {
      identity_theft_case_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      identity_theft_case_id: "BIGINT UNIQUE",
      case_number: "STRING UNIQUE",
      
      victim_customer_id: "BIGINT",
      
      case_opened_timestamp: "TIMESTAMP",
      identity_theft_type: "STRING",
      
      fraudulent_accounts_opened_count: "INTEGER",
      total_fraud_amount: "DECIMAL(18,2)",
      
      case_status: "STRING",
      
      victim_notified: "BOOLEAN",
      credit_monitoring_offered: "BOOLEAN",
      
      bank_loss_amount: "DECIMAL(18,2)",
      
      data_quality_score: "INTEGER",
      
      created_date: "DATE",
    },
  },
  
  // Table 6: Account Takeover Events Aggregated
  {
    name: 'silver.retail_account_takeover_events_aggregated',
    description: 'Aggregated account takeover events',
    grain: 'One row per ATO event',
    scdType: 'Type 1',
    
    primaryKey: ['ato_event_sk'],
    naturalKey: ['ato_event_id'],
    
    sourceTables: ['bronze.retail_account_takeover_events'],
    
    schema: {
      ato_event_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      ato_event_id: "BIGINT UNIQUE",
      
      customer_id: "BIGINT",
      account_id: "BIGINT",
      
      event_timestamp: "TIMESTAMP",
      ato_type: "STRING",
      
      risk_score: "INTEGER",
      
      fraudulent_transactions_count: "INTEGER",
      total_fraud_amount: "DECIMAL(18,2)",
      
      account_locked: "BOOLEAN",
      customer_confirmed_ato: "BOOLEAN",
      
      account_restored: "BOOLEAN",
      
      fraud_case_id: "BIGINT",
      
      data_quality_score: "INTEGER",
      
      created_date: "DATE",
    },
  },
  
  // Table 7: Dispute Cases Aggregated
  {
    name: 'silver.retail_dispute_cases_aggregated',
    description: 'Aggregated transaction dispute cases',
    grain: 'One row per dispute',
    scdType: 'Type 1',
    
    primaryKey: ['dispute_sk'],
    naturalKey: ['dispute_id'],
    
    sourceTables: ['bronze.retail_dispute_cases'],
    
    schema: {
      dispute_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      dispute_id: "BIGINT UNIQUE",
      dispute_number: "STRING UNIQUE",
      
      customer_id: "BIGINT",
      transaction_id: "BIGINT",
      
      dispute_filed_timestamp: "TIMESTAMP",
      dispute_reason_standardized: "STRING",
      dispute_category: "STRING",
      
      dispute_status: "STRING",
      
      time_to_resolution_days: "INTEGER",
      
      provisional_credit_issued: "BOOLEAN",
      provisional_credit_amount: "DECIMAL(18,2)",
      
      resolution_code: "STRING",
      final_credit_amount: "DECIMAL(18,2)",
      
      chargeback_filed: "BOOLEAN",
      
      is_suspected_fraud: "BOOLEAN",
      
      data_quality_score: "INTEGER",
      
      created_date: "DATE",
    },
  },
  
  // Table 8: Fraud Rules Performance
  {
    name: 'silver.retail_fraud_rules_performance',
    description: 'Fraud rule performance metrics',
    grain: 'One row per rule per day',
    
    primaryKey: ['rule_id', 'performance_date'],
    
    sourceTables: ['bronze.retail_fraud_rules'],
    
    schema: {
      rule_id: "STRING PRIMARY KEY",
      performance_date: "DATE PRIMARY KEY",
      
      rule_name: "STRING",
      rule_type: "STRING",
      
      is_active: "BOOLEAN",
      
      trigger_count: "INTEGER",
      true_positive_count: "INTEGER",
      false_positive_count: "INTEGER",
      
      precision: "DECIMAL(5,4)",
      recall: "DECIMAL(5,4)",
      f1_score: "DECIMAL(5,4)",
      
      created_date: "DATE",
    },
  },
  
  // Table 9: ML Model Performance
  {
    name: 'silver.retail_fraud_ml_model_performance',
    description: 'ML fraud model performance tracking',
    grain: 'One row per model version per day',
    
    primaryKey: ['model_id', 'model_version', 'performance_date'],
    
    sourceTables: ['bronze.retail_fraud_ml_models'],
    
    schema: {
      model_id: "STRING PRIMARY KEY",
      model_version: "STRING PRIMARY KEY",
      performance_date: "DATE PRIMARY KEY",
      
      model_name: "STRING",
      model_type: "STRING",
      
      is_production: "BOOLEAN",
      
      accuracy: "DECIMAL(5,4)",
      precision: "DECIMAL(5,4)",
      recall: "DECIMAL(5,4)",
      f1_score: "DECIMAL(5,4)",
      auc_roc: "DECIMAL(5,4)",
      
      false_positive_rate: "DECIMAL(5,4)",
      
      daily_prediction_count: "INTEGER",
      daily_fraud_detected_count: "INTEGER",
      
      model_drift_score: "DECIMAL(5,4)",
      
      created_date: "DATE",
    },
  },
  
  // Table 10: Device Trust Scores
  {
    name: 'silver.retail_device_trust_scores',
    description: 'Device trust scores and risk assessment',
    grain: 'One current row per device',
    scdType: 'Type 2',
    
    primaryKey: ['device_sk'],
    naturalKey: ['device_id'],
    
    sourceTables: ['bronze.retail_device_fingerprints'],
    
    schema: {
      device_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      device_id: "STRING UNIQUE",
      
      device_type: "STRING",
      operating_system: "STRING",
      
      device_trust_score: "INTEGER",
      is_trusted_device: "BOOLEAN",
      
      first_seen_timestamp: "TIMESTAMP",
      last_seen_timestamp: "TIMESTAMP",
      
      transaction_count_from_device: "INTEGER",
      associated_fraud_cases_count: "INTEGER",
      
      is_blacklisted: "BOOLEAN",
      
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Table 11: Merchant Fraud Risk Aggregated
  {
    name: 'silver.retail_merchant_fraud_risk_aggregated',
    description: 'Aggregated merchant fraud risk metrics',
    grain: 'One row per merchant per day',
    
    primaryKey: ['merchant_id', 'risk_date'],
    
    sourceTables: ['bronze.retail_merchant_fraud_risk'],
    
    schema: {
      merchant_id: "STRING PRIMARY KEY",
      risk_date: "DATE PRIMARY KEY",
      
      merchant_name: "STRING",
      merchant_category_code: "STRING",
      
      total_transactions_count: "INTEGER",
      fraud_transactions_count: "INTEGER",
      fraud_rate: "DECIMAL(5,4)",
      
      total_fraud_amount: "DECIMAL(18,2)",
      
      merchant_fraud_risk_score: "INTEGER",
      merchant_risk_level: "STRING",
      
      fraud_rate_7d_avg: "DECIMAL(5,4)",
      fraud_rate_30d_avg: "DECIMAL(5,4)",
      fraud_rate_trend: "STRING",
      
      is_blocked: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
];

export const fraudRetailSilverLayerComplete = {
  description: 'Complete silver layer for retail fraud domain',
  layer: 'SILVER',
  tables: fraudRetailSilverTables,
  totalTables: 11,
  estimatedSize: '450GB',
  refreshFrequency: 'Daily batch processing with SCD2 tracking',
  retention: '7 years',
  
  keyFeatures: [
    'MDM for fraud alerts and cases',
    'SCD Type 2 for fraud case history',
    'Fraud score enrichment for transactions',
    'Rule and model performance tracking',
    'Device trust scoring',
    'Merchant fraud risk aggregation',
    'Data quality scoring',
    'Standardization of fraud types and methods',
    'Financial impact calculations',
  ],
};
