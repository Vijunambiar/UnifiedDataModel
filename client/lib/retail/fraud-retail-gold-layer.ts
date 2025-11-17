/**
 * FRAUD-RETAIL GOLD LAYER - Complete Implementation
 * 
 * Dimensional model (Kimball methodology) with:
 * - 8 Dimensions
 * - 5 Fact Tables
 * 
 * Grade A Target: Analytics-ready star schema for fraud analytics
 */

export const fraudRetailGoldDimensions = [
  // Dimension 1: Fraud Alert Type
  {
    name: 'gold.dim_fraud_alert_type',
    description: 'Fraud alert type taxonomy',
    type: 'SCD Type 1',
    grain: 'One row per alert type',
    
    primaryKey: 'alert_type_key',
    naturalKey: 'alert_type_code',
    
    schema: {
      alert_type_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      alert_type_code: "STRING UNIQUE",
      alert_type_name: "STRING COMMENT 'Card Fraud|Identity Theft|Account Takeover|Transaction Fraud|Application Fraud|Wire Fraud'",
      alert_category: "STRING COMMENT 'Transaction|Behavioral|Identity|Application|Digital'",
      alert_subcategory: "STRING",
      
      typical_risk_level: "STRING",
      avg_fraud_amount: "DECIMAL(18,2)",
      
      typical_detection_method: "STRING",
      
      requires_immediate_action: "BOOLEAN",
      requires_customer_contact: "BOOLEAN",
      
      historical_false_positive_rate: "DECIMAL(5,4)",
      historical_confirmation_rate: "DECIMAL(5,4)",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 2: Fraud Case Type
  {
    name: 'gold.dim_fraud_case_type',
    description: 'Fraud case type dimension',
    type: 'SCD Type 1',
    grain: 'One row per case type',
    
    primaryKey: 'case_type_key',
    naturalKey: 'case_type_code',
    
    schema: {
      case_type_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      case_type_code: "STRING UNIQUE",
      case_type_name: "STRING",
      case_category: "STRING",
      
      fraud_method: "STRING COMMENT 'Lost/Stolen Card|Counterfeit|CNP|Phishing|etc.'",
      
      avg_investigation_hours: "INTEGER",
      avg_loss_amount: "DECIMAL(18,2)",
      avg_recovery_rate: "DECIMAL(5,4)",
      
      requires_law_enforcement: "BOOLEAN",
      requires_sar_filing: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 3: Merchant
  {
    name: 'gold.dim_merchant',
    description: 'Merchant dimension for fraud analysis',
    type: 'SCD Type 2',
    grain: 'One row per merchant per effective period',
    
    primaryKey: 'merchant_key',
    naturalKey: 'merchant_id',
    
    schema: {
      merchant_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      merchant_id: "STRING",
      
      merchant_name: "STRING",
      merchant_category_code: "STRING",
      merchant_category_description: "STRING",
      
      merchant_country: "STRING",
      merchant_state: "STRING",
      merchant_city: "STRING",
      
      merchant_risk_level: "STRING COMMENT 'Low|Medium|High'",
      merchant_fraud_score: "INTEGER",
      
      is_high_risk_merchant: "BOOLEAN",
      is_blocked: "BOOLEAN",
      
      effective_start_date: "DATE",
      effective_end_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 4: Fraud Detection Method
  {
    name: 'gold.dim_fraud_detection_method',
    description: 'Fraud detection method taxonomy',
    type: 'SCD Type 1',
    grain: 'One row per detection method',
    
    primaryKey: 'detection_method_key',
    naturalKey: 'detection_method_code',
    
    schema: {
      detection_method_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      detection_method_code: "STRING UNIQUE",
      detection_method_name: "STRING COMMENT 'Rules Engine|ML Model|Manual Review|Customer Report|External Source'",
      
      detection_category: "STRING COMMENT 'Automated|Manual|External'",
      
      is_real_time: "BOOLEAN",
      is_machine_learning: "BOOLEAN",
      
      avg_detection_accuracy: "DECIMAL(5,4)",
      avg_false_positive_rate: "DECIMAL(5,4)",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 5: Risk Level
  {
    name: 'gold.dim_risk_level',
    description: 'Risk level categorization',
    type: 'SCD Type 1',
    grain: 'One row per risk level',
    
    primaryKey: 'risk_level_key',
    naturalKey: 'risk_level_code',
    
    schema: {
      risk_level_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      risk_level_code: "STRING UNIQUE",
      risk_level_name: "STRING COMMENT 'Low|Medium|High|Critical'",
      
      risk_score_min: "INTEGER",
      risk_score_max: "INTEGER",
      
      requires_immediate_review: "BOOLEAN",
      auto_block_enabled: "BOOLEAN",
      
      sla_response_hours: "INTEGER",
      
      color_code: "STRING",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 6: Fraud Analyst
  {
    name: 'gold.dim_fraud_analyst',
    description: 'Fraud analyst dimension',
    type: 'SCD Type 2',
    grain: 'One row per analyst per effective period',
    
    primaryKey: 'analyst_key',
    naturalKey: 'analyst_id',
    
    schema: {
      analyst_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      analyst_id: "BIGINT",
      
      analyst_name: "STRING",
      analyst_role: "STRING COMMENT 'Junior Analyst|Senior Analyst|Lead|Manager'",
      
      team_name: "STRING",
      supervisor_analyst_key: "BIGINT",
      
      location: "STRING",
      
      specialization: "STRING COMMENT 'Card Fraud|Identity Theft|ATO|All'",
      
      is_active: "BOOLEAN",
      hire_date: "DATE",
      
      performance_tier: "STRING COMMENT 'Top|Above Avg|Average|Below Avg'",
      
      effective_start_date: "DATE",
      effective_end_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 7: Channel
  {
    name: 'gold.dim_fraud_channel',
    description: 'Transaction channel dimension',
    type: 'SCD Type 1',
    grain: 'One row per channel',
    
    primaryKey: 'channel_key',
    naturalKey: 'channel_code',
    
    schema: {
      channel_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      channel_code: "STRING UNIQUE",
      channel_name: "STRING COMMENT 'ATM|POS|Online|Mobile|Branch|Wire'",
      
      channel_category: "STRING COMMENT 'In-Person|Remote|Digital'",
      
      is_card_present: "BOOLEAN",
      is_digital: "BOOLEAN",
      
      fraud_risk_level: "STRING",
      avg_fraud_rate: "DECIMAL(5,4)",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 8: Device
  {
    name: 'gold.dim_device',
    description: 'Device dimension for fraud analysis',
    type: 'SCD Type 2',
    grain: 'One row per device per effective period',
    
    primaryKey: 'device_key',
    naturalKey: 'device_id',
    
    schema: {
      device_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      device_id: "STRING",
      
      device_type: "STRING COMMENT 'Desktop|Mobile|Tablet'",
      operating_system: "STRING",
      browser_name: "STRING",
      
      device_trust_score: "INTEGER",
      is_trusted: "BOOLEAN",
      
      first_seen_date: "DATE",
      transaction_count: "INTEGER",
      fraud_count: "INTEGER",
      
      is_blacklisted: "BOOLEAN",
      
      effective_start_date: "DATE",
      effective_end_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
];

export const fraudRetailGoldFacts = [
  // Fact 1: Fraud Alerts
  {
    name: 'gold.fact_fraud_alerts',
    description: 'Fraud alert fact table',
    factType: 'Transaction',
    grain: 'One row per fraud alert',
    
    dimensions: [
      'alert_type_key',
      'customer_key',
      'account_key',
      'card_key',
      'merchant_key',
      'channel_key',
      'detection_method_key',
      'risk_level_key',
      'analyst_key (assigned)',
      'alert_date_key',
      'resolution_date_key',
    ],
    
    schema: {
      fraud_alert_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      alert_type_key: "BIGINT",
      customer_key: "BIGINT",
      account_key: "BIGINT",
      card_key: "BIGINT",
      merchant_key: "BIGINT",
      channel_key: "BIGINT",
      detection_method_key: "BIGINT",
      risk_level_key: "BIGINT",
      analyst_key: "BIGINT",
      
      alert_date_key: "INTEGER",
      investigation_date_key: "INTEGER",
      resolution_date_key: "INTEGER",
      
      alert_id: "BIGINT UNIQUE",
      alert_timestamp: "TIMESTAMP",
      
      // COUNTS
      alert_count: "INTEGER DEFAULT 1",
      
      // SCORES
      risk_score: "INTEGER",
      confidence_score: "DECIMAL(5,4)",
      
      // AMOUNTS
      transaction_amount: "DECIMAL(18,2)",
      fraud_amount: "DECIMAL(18,2)",
      recovered_amount: "DECIMAL(18,2)",
      loss_amount: "DECIMAL(18,2)",
      
      // TIME MEASURES
      time_to_investigation_hours: "DECIMAL(10,2)",
      time_to_resolution_hours: "DECIMAL(10,2)",
      
      // FLAGS
      is_confirmed_fraud: "BOOLEAN",
      is_false_positive: "BOOLEAN",
      
      card_blocked: "BOOLEAN",
      account_frozen: "BOOLEAN",
      
      customer_contacted: "BOOLEAN",
      customer_confirmed_fraud: "BOOLEAN",
      
      sar_filed: "BOOLEAN",
      police_report_filed: "BOOLEAN",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 200000000,
    estimatedSize: '40GB',
  },
  
  // Fact 2: Fraud Cases
  {
    name: 'gold.fact_fraud_cases',
    description: 'Fraud investigation case fact table',
    factType: 'Accumulating Snapshot',
    grain: 'One row per fraud case',
    
    dimensions: [
      'case_type_key',
      'customer_key',
      'account_key',
      'analyst_key',
      'case_opened_date_key',
      'investigation_date_key',
      'resolution_date_key',
      'closed_date_key',
    ],
    
    schema: {
      fraud_case_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      case_type_key: "BIGINT",
      customer_key: "BIGINT",
      account_key: "BIGINT",
      analyst_key: "BIGINT",
      
      case_opened_date_key: "INTEGER",
      investigation_date_key: "INTEGER",
      resolution_date_key: "INTEGER",
      closed_date_key: "INTEGER",
      
      case_id: "BIGINT UNIQUE",
      case_number: "STRING UNIQUE",
      
      // COUNTS
      case_count: "INTEGER DEFAULT 1",
      related_alert_count: "INTEGER",
      related_transaction_count: "INTEGER",
      
      // AMOUNTS
      total_fraud_amount: "DECIMAL(18,2)",
      bank_liable_amount: "DECIMAL(18,2)",
      customer_liable_amount: "DECIMAL(18,2)",
      recovered_amount: "DECIMAL(18,2)",
      net_loss_amount: "DECIMAL(18,2)",
      
      provisional_credit_amount: "DECIMAL(18,2)",
      
      // TIME MEASURES
      time_to_investigation_hours: "DECIMAL(10,2)",
      time_to_resolution_hours: "DECIMAL(10,2)",
      total_case_duration_hours: "DECIMAL(10,2)",
      
      // FLAGS
      is_fraud_confirmed: "BOOLEAN",
      
      affidavit_received: "BOOLEAN",
      police_report_filed: "BOOLEAN",
      sar_filed: "BOOLEAN",
      
      is_part_of_fraud_ring: "BOOLEAN",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 10000000,
    estimatedSize: '4GB',
  },
  
  // Fact 3: Fraud Transactions
  {
    name: 'gold.fact_fraud_transactions',
    description: 'Fraudulent transaction fact table',
    factType: 'Transaction',
    grain: 'One row per fraudulent transaction',
    
    dimensions: [
      'customer_key',
      'account_key',
      'card_key',
      'merchant_key',
      'channel_key',
      'device_key',
      'transaction_date_key',
      'transaction_time_key',
    ],
    
    schema: {
      fraud_transaction_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      customer_key: "BIGINT",
      account_key: "BIGINT",
      card_key: "BIGINT",
      merchant_key: "BIGINT",
      channel_key: "BIGINT",
      device_key: "BIGINT",
      
      transaction_date_key: "INTEGER",
      transaction_time_key: "INTEGER",
      
      transaction_id: "BIGINT UNIQUE",
      transaction_timestamp: "TIMESTAMP",
      
      // COUNTS
      transaction_count: "INTEGER DEFAULT 1",
      
      // AMOUNTS
      transaction_amount: "DECIMAL(18,2)",
      transaction_amount_usd: "DECIMAL(18,2)",
      
      // FRAUD SCORES
      fraud_score: "INTEGER",
      fraud_risk_level: "STRING",
      
      // FLAGS
      authorization_approved: "BOOLEAN",
      
      card_present: "BOOLEAN",
      chip_transaction: "BOOLEAN",
      
      is_unusual_amount: "BOOLEAN",
      is_unusual_location: "BOOLEAN",
      is_unusual_time: "BOOLEAN",
      
      is_confirmed_fraud: "BOOLEAN",
      is_disputed: "BOOLEAN",
      
      // BEHAVIORAL
      distance_from_home_miles: "DECIMAL(10,2)",
      transaction_velocity_1h: "INTEGER",
      transaction_velocity_24h: "INTEGER",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 500000000,
    estimatedSize: '80GB',
  },
  
  // Fact 4: Fraud Detection Performance
  {
    name: 'gold.fact_fraud_detection_performance',
    description: 'Daily fraud detection performance metrics',
    factType: 'Periodic Snapshot',
    grain: 'One row per detection method per day',
    
    dimensions: [
      'detection_method_key',
      'alert_type_key',
      'date_key',
    ],
    
    schema: {
      detection_method_key: "BIGINT",
      alert_type_key: "BIGINT",
      date_key: "INTEGER",
      
      snapshot_date: "DATE",
      
      // VOLUME
      total_alerts_generated: "INTEGER",
      total_transactions_monitored: "INTEGER",
      
      // ACCURACY
      true_positives: "INTEGER COMMENT 'Confirmed fraud'",
      false_positives: "INTEGER COMMENT 'False alarms'",
      true_negatives: "INTEGER COMMENT 'Correctly identified legitimate'",
      false_negatives: "INTEGER COMMENT 'Missed fraud'",
      
      // METRICS
      precision: "DECIMAL(5,4) COMMENT 'TP / (TP + FP)'",
      recall: "DECIMAL(5,4) COMMENT 'TP / (TP + FN)'",
      f1_score: "DECIMAL(5,4)",
      accuracy: "DECIMAL(5,4)",
      
      false_positive_rate: "DECIMAL(5,4)",
      
      // FINANCIAL IMPACT
      total_fraud_detected_amount: "DECIMAL(18,2)",
      total_fraud_prevented_amount: "DECIMAL(18,2)",
      total_fraud_missed_amount: "DECIMAL(18,2)",
      
      // EFFICIENCY
      avg_detection_time_seconds: "INTEGER",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 500000,
    estimatedSize: '2GB',
  },
  
  // Fact 5: Analyst Performance
  {
    name: 'gold.fact_analyst_performance_daily',
    description: 'Daily fraud analyst performance snapshot',
    factType: 'Periodic Snapshot',
    grain: 'One row per analyst per day',
    
    dimensions: [
      'analyst_key',
      'date_key',
    ],
    
    schema: {
      analyst_key: "BIGINT",
      date_key: "INTEGER",
      
      snapshot_date: "DATE",
      
      // VOLUME
      alerts_reviewed: "INTEGER",
      cases_investigated: "INTEGER",
      cases_closed: "INTEGER",
      
      // QUALITY
      fraud_confirmed_count: "INTEGER",
      false_positive_count: "INTEGER",
      
      accuracy_rate: "DECIMAL(5,4)",
      
      // TIME
      avg_time_to_review_hours: "DECIMAL(10,2)",
      avg_case_resolution_hours: "DECIMAL(10,2)",
      
      total_hours_worked: "DECIMAL(5,2)",
      
      // FINANCIAL
      total_fraud_amount_identified: "DECIMAL(18,2)",
      total_loss_prevented: "DECIMAL(18,2)",
      
      // PRODUCTIVITY
      cases_per_hour: "DECIMAL(5,2)",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 365000,
    estimatedSize: '1GB',
  },
];

export const fraudRetailGoldLayerComplete = {
  description: 'Complete gold layer for retail fraud domain with dimensional model',
  layer: 'GOLD',
  dimensions: fraudRetailGoldDimensions,
  facts: fraudRetailGoldFacts,
  totalDimensions: 8,
  totalFacts: 5,
  estimatedSize: '127GB',
  refreshFrequency: 'Daily for snapshots, Real-time for transactions and alerts',
  methodology: 'Kimball Dimensional Modeling',
  
  keyFeatures: [
    'Real-time fraud alert tracking with risk scoring',
    'Fraud case investigation lifecycle management',
    'Fraudulent transaction analysis with behavioral signals',
    'Fraud detection performance measurement',
    'Analyst productivity and accuracy tracking',
    'Merchant fraud risk profiling',
    'Device trust scoring and anomaly detection',
    'Financial impact and loss analysis',
    'Recovery and remediation tracking',
    'ML model and rules engine performance monitoring',
  ],
  
  analyticsCapabilities: [
    'Fraud detection accuracy analysis (precision, recall, F1)',
    'False positive rate optimization',
    'Fraud loss trending and forecasting',
    'Channel-specific fraud pattern analysis',
    'Merchant fraud risk assessment',
    'Geographic fraud hot spot identification',
    'Fraud ring detection and network analysis',
    'Customer fraud victimization patterns',
    'Analyst performance benchmarking',
    'ROI of fraud prevention systems',
  ],
};
