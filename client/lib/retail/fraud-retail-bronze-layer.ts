/**
 * FRAUD-RETAIL BRONZE LAYER - Complete Implementation
 * 
 * Domain: Fraud Retail
 * Area: Retail Banking
 * Purpose: Fraud detection, prevention, investigation, and recovery
 * 
 * All 14 bronze tables for retail fraud domain
 * Industry-accurate, comprehensive, enterprise-ready
 */

export const fraudRetailBronzeTables = [
  // Table 1: Fraud Alerts
  {
    name: 'bronze.retail_fraud_alerts',
    description: 'Real-time fraud alert events',
    sourceSystem: 'FRAUD_DETECTION_SYSTEM',
    sourceTable: 'FRAUD_ALERTS',
    loadType: 'STREAMING',
    
    grain: 'One row per fraud alert',
    primaryKey: ['alert_id', 'source_system'],
    
    estimatedRows: 200000000,
    avgRowSize: 2048,
    estimatedSize: '400GB',
    
    schema: {
      // PRIMARY KEYS
      alert_id: "BIGINT PRIMARY KEY COMMENT 'Unique alert identifier'",
      source_system: "STRING PRIMARY KEY",
      
      // NATURAL KEYS
      alert_uuid: "STRING UNIQUE",
      alert_number: "STRING UNIQUE",
      
      // ALERT DETAILS
      alert_timestamp: "TIMESTAMP",
      alert_date: "DATE",
      
      alert_type: "STRING COMMENT 'Card Fraud|Identity Theft|Account Takeover|Transaction Fraud|Application Fraud|Wire Fraud'",
      alert_category: "STRING COMMENT 'Transaction|Behavioral|Identity|Application|Digital'",
      alert_subcategory: "STRING",
      
      fraud_scenario: "STRING COMMENT 'Specific fraud pattern detected'",
      fraud_scenario_id: "STRING",
      
      // RISK SCORING
      risk_score: "INTEGER COMMENT '0-1000'",
      risk_level: "STRING COMMENT 'Low|Medium|High|Critical'",
      
      confidence_score: "DECIMAL(5,4) COMMENT 'ML model confidence 0-1'",
      
      // ENTITY INVOLVED
      customer_id: "BIGINT COMMENT 'FK to customer'",
      account_id: "BIGINT COMMENT 'Affected account'",
      card_id: "BIGINT COMMENT 'Affected card'",
      
      // TRANSACTION
      transaction_id: "BIGINT COMMENT 'Triggering transaction'",
      transaction_amount: "DECIMAL(18,2)",
      transaction_currency: "STRING",
      transaction_timestamp: "TIMESTAMP",
      
      merchant_name: "STRING",
      merchant_category_code: "STRING COMMENT 'MCC'",
      merchant_country: "STRING",
      merchant_city: "STRING",
      
      // DETECTION
      detection_method: "STRING COMMENT 'Rules Engine|ML Model|Manual Review|Customer Report|External Source'",
      detection_model_id: "STRING COMMENT 'ML model version'",
      
      triggered_rules: "STRING COMMENT 'JSON array of rule IDs'",
      rule_violations_count: "INTEGER",
      
      // DEVICE & CHANNEL
      channel: "STRING COMMENT 'ATM|POS|Online|Mobile|Branch'",
      
      device_id: "STRING COMMENT 'Device fingerprint'",
      device_type: "STRING",
      ip_address: "STRING",
      geolocation: "STRING COMMENT 'Lat/Long'",
      
      is_device_trusted: "BOOLEAN",
      is_location_anomaly: "BOOLEAN",
      
      // BEHAVIORAL SIGNALS
      is_unusual_transaction_amount: "BOOLEAN",
      is_unusual_merchant: "BOOLEAN",
      is_unusual_location: "BOOLEAN",
      is_unusual_time: "BOOLEAN",
      is_unusual_velocity: "BOOLEAN COMMENT 'Too many transactions in short time'",
      
      transaction_velocity_1h: "INTEGER COMMENT 'Transactions in last 1 hour'",
      transaction_velocity_24h: "INTEGER",
      
      // ALERT STATUS
      alert_status: "STRING COMMENT 'New|Under Review|Confirmed Fraud|False Positive|Pending Customer Contact|Closed'",
      status_change_timestamp: "TIMESTAMP",
      
      // ASSIGNMENT
      assigned_to_analyst_id: "BIGINT",
      assigned_to_team: "STRING",
      assignment_timestamp: "TIMESTAMP",
      
      // INVESTIGATION
      investigation_started_timestamp: "TIMESTAMP",
      investigation_completed_timestamp: "TIMESTAMP",
      
      investigator_id: "BIGINT",
      
      // RESOLUTION
      resolution_code: "STRING",
      resolution_timestamp: "TIMESTAMP",
      
      is_confirmed_fraud: "BOOLEAN",
      is_false_positive: "BOOLEAN",
      
      fraud_type_confirmed: "STRING COMMENT 'Final fraud classification'",
      
      // CUSTOMER CONTACT
      customer_contacted: "BOOLEAN",
      customer_contact_method: "STRING COMMENT 'Phone|SMS|Email|App Notification'",
      customer_contact_timestamp: "TIMESTAMP",
      
      customer_confirmed_fraud: "BOOLEAN COMMENT 'Customer confirmed transaction as fraud'",
      customer_confirmed_legitimate: "BOOLEAN",
      
      // ACTIONS TAKEN
      card_blocked: "BOOLEAN",
      card_block_timestamp: "TIMESTAMP",
      
      account_frozen: "BOOLEAN",
      account_freeze_timestamp: "TIMESTAMP",
      
      transaction_declined: "BOOLEAN",
      transaction_reversed: "BOOLEAN",
      
      // FINANCIAL IMPACT
      fraud_amount: "DECIMAL(18,2) COMMENT 'Confirmed fraud amount'",
      recovered_amount: "DECIMAL(18,2)",
      loss_amount: "DECIMAL(18,2) COMMENT 'Net loss after recovery'",
      
      // REPORTING
      reported_to_law_enforcement: "BOOLEAN",
      law_enforcement_agency: "STRING",
      police_report_number: "STRING",
      
      sar_filed: "BOOLEAN COMMENT 'Suspicious Activity Report'",
      sar_file_date: "DATE",
      sar_id: "STRING",
      
      // RELATED ALERTS
      parent_alert_id: "BIGINT COMMENT 'If part of fraud ring'",
      related_alert_ids: "STRING COMMENT 'JSON array'",
      
      is_part_of_fraud_ring: "BOOLEAN",
      fraud_ring_id: "STRING",
      
      // AUDIT TRAIL (REQUIRED)
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 2: Card Transactions (for Fraud Analysis)
  {
    name: 'bronze.retail_fraud_card_transactions',
    description: 'Card transaction log for fraud analysis',
    sourceSystem: 'CARD_PROCESSOR',
    sourceTable: 'CARD_TRANSACTIONS',
    loadType: 'STREAMING',
    
    grain: 'One row per card transaction',
    primaryKey: ['transaction_id', 'source_system'],
    
    estimatedRows: 5000000000,
    avgRowSize: 1024,
    estimatedSize: '5TB',
    
    schema: {
      transaction_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      // CARD & CUSTOMER
      card_id: "BIGINT",
      card_number_hash: "STRING COMMENT 'Hashed PAN'",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      
      // TRANSACTION DETAILS
      transaction_timestamp: "TIMESTAMP",
      transaction_date: "DATE",
      transaction_time: "TIME",
      
      transaction_type: "STRING COMMENT 'Purchase|Cash Advance|Refund|Reversal'",
      
      transaction_amount: "DECIMAL(18,2)",
      transaction_currency: "STRING",
      
      transaction_amount_usd: "DECIMAL(18,2) COMMENT 'Converted to USD'",
      
      // AUTHORIZATION
      authorization_code: "STRING",
      authorization_timestamp: "TIMESTAMP",
      
      authorization_status: "STRING COMMENT 'Approved|Declined|Pending'",
      decline_reason_code: "STRING",
      decline_reason: "STRING",
      
      // MERCHANT
      merchant_id: "STRING",
      merchant_name: "STRING",
      merchant_category_code: "STRING COMMENT 'MCC'",
      merchant_category_description: "STRING",
      
      merchant_street_address: "STRING",
      merchant_city: "STRING",
      merchant_state: "STRING",
      merchant_postal_code: "STRING",
      merchant_country: "STRING COMMENT 'ISO 3166-1'",
      
      // TERMINAL
      terminal_id: "STRING",
      terminal_type: "STRING COMMENT 'ATM|POS|Online|Mobile|Contactless'",
      
      pos_entry_mode: "STRING COMMENT 'Chip|Swipe|Manual|Contactless|Card Not Present'",
      
      // CARD PRESENT FLAGS
      card_present: "BOOLEAN",
      cardholder_present: "BOOLEAN",
      
      chip_transaction: "BOOLEAN",
      contactless_transaction: "BOOLEAN",
      
      pin_verified: "BOOLEAN",
      cvv_verified: "BOOLEAN",
      avs_result: "STRING COMMENT 'Address Verification Service result'",
      
      // ONLINE TRANSACTION DETAILS
      is_online_transaction: "BOOLEAN",
      ecommerce_indicator: "STRING",
      
      ip_address: "STRING",
      device_fingerprint: "STRING",
      
      // GEOLOCATION
      transaction_latitude: "DECIMAL(10,8)",
      transaction_longitude: "DECIMAL(11,8)",
      
      distance_from_home_miles: "DECIMAL(10,2) COMMENT 'Distance from customer home address'",
      distance_from_last_transaction_miles: "DECIMAL(10,2)",
      
      // BEHAVIORAL SIGNALS
      is_first_transaction_with_merchant: "BOOLEAN",
      is_first_transaction_in_country: "BOOLEAN",
      is_first_transaction_in_state: "BOOLEAN",
      
      transaction_count_last_1h: "INTEGER COMMENT 'Velocity signal'",
      transaction_count_last_24h: "INTEGER",
      transaction_count_last_7d: "INTEGER",
      
      time_since_last_transaction_minutes: "INTEGER",
      
      is_unusual_time: "BOOLEAN COMMENT 'Transaction at unusual time for customer'",
      is_unusual_amount: "BOOLEAN COMMENT 'Amount outside normal range'",
      
      // FRAUD INDICATORS
      fraud_score: "INTEGER COMMENT '0-1000'",
      fraud_risk_level: "STRING COMMENT 'Low|Medium|High|Critical'",
      
      is_flagged_for_fraud: "BOOLEAN",
      fraud_alert_id: "BIGINT COMMENT 'FK to fraud alerts if flagged'",
      
      // 3D SECURE
      three_d_secure_attempted: "BOOLEAN",
      three_d_secure_authenticated: "BOOLEAN",
      three_d_secure_version: "STRING COMMENT '1.0|2.0'",
      
      // DISPUTE
      is_disputed: "BOOLEAN",
      dispute_timestamp: "TIMESTAMP",
      dispute_reason: "STRING",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 3: Fraud Cases
  {
    name: 'bronze.retail_fraud_cases',
    description: 'Fraud investigation case records',
    sourceSystem: 'FRAUD_CASE_MANAGEMENT',
    sourceTable: 'FRAUD_CASES',
    loadType: 'CDC',
    
    grain: 'One row per fraud case',
    primaryKey: ['case_id', 'source_system'],
    
    schema: {
      case_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      case_number: "STRING UNIQUE",
      
      customer_id: "BIGINT",
      account_id: "BIGINT",
      
      // CASE DETAILS
      case_opened_date: "DATE",
      case_opened_timestamp: "TIMESTAMP",
      
      case_type: "STRING COMMENT 'Card Fraud|Identity Theft|Account Takeover|Check Fraud|ACH Fraud|Wire Fraud|Application Fraud'",
      case_category: "STRING",
      
      fraud_method: "STRING COMMENT 'Lost/Stolen Card|Counterfeit|Card Not Present|Phishing|Social Engineering|Skimming|Account Takeover'",
      
      // DISCOVERY
      discovery_method: "STRING COMMENT 'Fraud Detection System|Customer Report|Merchant Report|Law Enforcement|Internal Audit'",
      discovery_timestamp: "TIMESTAMP",
      
      // INVESTIGATION
      case_status: "STRING COMMENT 'Open|Under Investigation|Pending Customer Response|Confirmed|Not Confirmed|Closed'",
      
      assigned_to_analyst_id: "BIGINT",
      investigation_start_timestamp: "TIMESTAMP",
      investigation_complete_timestamp: "TIMESTAMP",
      
      // RESOLUTION
      case_resolution: "STRING COMMENT 'Confirmed Fraud|False Positive|Inconclusive|Customer Liability'",
      case_closed_timestamp: "TIMESTAMP",
      
      is_fraud_confirmed: "BOOLEAN",
      
      // FINANCIAL IMPACT
      total_fraud_amount: "DECIMAL(18,2)",
      customer_liable_amount: "DECIMAL(18,2)",
      bank_liable_amount: "DECIMAL(18,2)",
      
      provisional_credit_amount: "DECIMAL(18,2) COMMENT 'Provisional credit given to customer'",
      final_credit_amount: "DECIMAL(18,2)",
      
      recovered_amount: "DECIMAL(18,2)",
      net_loss_amount: "DECIMAL(18,2)",
      
      // CUSTOMER
      customer_notification_timestamp: "TIMESTAMP",
      customer_response_timestamp: "TIMESTAMP",
      
      affidavit_received: "BOOLEAN",
      affidavit_received_timestamp: "TIMESTAMP",
      
      // RELATED ENTITIES
      related_alert_ids: "STRING COMMENT 'JSON array of alert IDs'",
      related_transaction_ids: "STRING COMMENT 'JSON array'",
      
      related_case_ids: "STRING COMMENT 'Other cases for same customer/fraud ring'",
      
      // LAW ENFORCEMENT
      police_report_filed: "BOOLEAN",
      police_report_number: "STRING",
      police_department: "STRING",
      
      // REGULATORY REPORTING
      sar_filed: "BOOLEAN",
      sar_file_date: "DATE",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 4: Card Compromises
  {
    name: 'bronze.retail_card_compromises',
    description: 'Card compromise events (lost, stolen, compromised)',
    sourceSystem: 'CARD_MANAGEMENT',
    sourceTable: 'CARD_COMPROMISES',
    loadType: 'CDC',
    
    grain: 'One row per card compromise event',
    primaryKey: ['compromise_id', 'source_system'],
    
    schema: {
      compromise_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      card_id: "BIGINT",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      
      // COMPROMISE DETAILS
      compromise_timestamp: "TIMESTAMP",
      compromise_date: "DATE",
      
      compromise_type: "STRING COMMENT 'Lost|Stolen|Skimmed|Data Breach|Counterfeit|Account Takeover'",
      compromise_reason: "STRING",
      
      reported_by: "STRING COMMENT 'Customer|Bank|Merchant|Card Network|Law Enforcement'",
      report_timestamp: "TIMESTAMP",
      
      // COMPROMISE SOURCE
      compromise_source: "STRING COMMENT 'Merchant Breach|ATM Skimming|Phishing|Physical Theft|Unknown'",
      compromise_location: "STRING",
      
      suspected_merchant_id: "STRING COMMENT 'If merchant breach'",
      suspected_merchant_name: "STRING",
      
      // CARD ACTIONS
      card_status_before: "STRING",
      card_status_after: "STRING COMMENT 'Blocked|Cancelled|Replaced'",
      
      card_blocked_timestamp: "TIMESTAMP",
      replacement_card_issued: "BOOLEAN",
      replacement_card_issued_timestamp: "TIMESTAMP",
      replacement_card_id: "BIGINT",
      
      // FRAUD ACTIVITY
      fraudulent_transaction_count: "INTEGER COMMENT 'Number of fraud transactions'",
      total_fraud_amount: "DECIMAL(18,2)",
      
      first_fraud_transaction_timestamp: "TIMESTAMP",
      last_fraud_transaction_timestamp: "TIMESTAMP",
      
      // RELATED
      fraud_case_id: "BIGINT COMMENT 'FK to fraud case'",
      
      // BREACH INFORMATION
      is_part_of_data_breach: "BOOLEAN",
      data_breach_id: "STRING",
      data_breach_name: "STRING COMMENT 'e.g., Target 2013, Equifax 2017'",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 5: Identity Theft Cases
  {
    name: 'bronze.retail_identity_theft_cases',
    description: 'Identity theft and synthetic identity fraud',
    sourceSystem: 'FRAUD_CASE_MANAGEMENT',
    sourceTable: 'IDENTITY_THEFT_CASES',
    loadType: 'CDC',
    
    grain: 'One row per identity theft case',
    primaryKey: ['identity_theft_case_id', 'source_system'],
    
    schema: {
      identity_theft_case_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      case_number: "STRING UNIQUE",
      
      victim_customer_id: "BIGINT COMMENT 'Legitimate customer whose identity was stolen'",
      fraudster_customer_id: "BIGINT COMMENT 'Fraudulent account created'",
      
      // CASE DETAILS
      case_opened_date: "DATE",
      case_opened_timestamp: "TIMESTAMP",
      
      identity_theft_type: "STRING COMMENT 'True Identity Theft|Synthetic Identity|Account Takeover'",
      
      // DISCOVERY
      discovery_method: "STRING COMMENT 'Credit Monitoring|Customer Report|Application Fraud Detection|Account Activity'",
      
      // COMPROMISED INFO
      ssn_compromised: "BOOLEAN",
      drivers_license_compromised: "BOOLEAN",
      date_of_birth_compromised: "BOOLEAN",
      address_compromised: "BOOLEAN",
      
      compromised_data_elements: "STRING COMMENT 'JSON array'",
      
      // FRAUDULENT ACTIVITY
      fraudulent_accounts_opened_count: "INTEGER",
      fraudulent_loan_applications_count: "INTEGER",
      fraudulent_credit_card_applications_count: "INTEGER",
      
      total_fraud_amount: "DECIMAL(18,2)",
      total_approved_credit: "DECIMAL(18,2)",
      
      // RESOLUTION
      case_status: "STRING",
      case_resolution: "STRING",
      case_closed_timestamp: "TIMESTAMP",
      
      // VICTIM ASSISTANCE
      victim_notified: "BOOLEAN",
      victim_notification_timestamp: "TIMESTAMP",
      
      identity_theft_affidavit_received: "BOOLEAN",
      police_report_received: "BOOLEAN",
      
      credit_monitoring_offered: "BOOLEAN",
      credit_freeze_placed: "BOOLEAN",
      
      // LAW ENFORCEMENT
      reported_to_law_enforcement: "BOOLEAN",
      ftc_identity_theft_report_number: "STRING COMMENT 'Federal Trade Commission'",
      
      // FINANCIAL IMPACT
      bank_loss_amount: "DECIMAL(18,2)",
      victim_loss_amount: "DECIMAL(18,2)",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 6: Account Takeover Events
  {
    name: 'bronze.retail_account_takeover_events',
    description: 'Account takeover (ATO) fraud events',
    sourceSystem: 'SECURITY_SYSTEM',
    sourceTable: 'ACCOUNT_TAKEOVER_EVENTS',
    loadType: 'STREAMING',
    
    grain: 'One row per ATO event',
    primaryKey: ['ato_event_id', 'source_system'],
    
    schema: {
      ato_event_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      customer_id: "BIGINT",
      account_id: "BIGINT",
      
      // EVENT DETAILS
      event_timestamp: "TIMESTAMP",
      event_date: "DATE",
      
      ato_type: "STRING COMMENT 'Credential Stuffing|Phishing|SIM Swap|Social Engineering|Malware'",
      
      // DETECTION
      detection_method: "STRING COMMENT 'Behavioral Analysis|Device Fingerprint|Login Pattern|Transaction Pattern'",
      detection_timestamp: "TIMESTAMP",
      
      risk_score: "INTEGER COMMENT '0-1000'",
      
      // SUSPICIOUS ACTIVITY
      suspicious_login: "BOOLEAN",
      suspicious_login_timestamp: "TIMESTAMP",
      
      login_ip_address: "STRING",
      login_geolocation: "STRING",
      login_device_id: "STRING",
      
      is_new_device: "BOOLEAN",
      is_new_location: "BOOLEAN",
      
      // ACCOUNT CHANGES
      profile_changes_made: "BOOLEAN",
      profile_changes: "STRING COMMENT 'JSON array of changes (email, phone, address)'",
      
      beneficiary_added: "BOOLEAN",
      beneficiary_details: "STRING",
      
      // FRAUDULENT TRANSACTIONS
      fraudulent_transactions_count: "INTEGER",
      total_fraud_amount: "DECIMAL(18,2)",
      
      unauthorized_transfers_count: "INTEGER",
      unauthorized_bill_payments_count: "INTEGER",
      unauthorized_card_transactions_count: "INTEGER",
      
      // CUSTOMER AUTHENTICATION
      mfa_bypassed: "BOOLEAN COMMENT 'Multi-factor authentication'",
      mfa_bypass_method: "STRING",
      
      password_changed: "BOOLEAN",
      password_change_timestamp: "TIMESTAMP",
      
      security_questions_answered_incorrectly: "INTEGER",
      
      // REMEDIATION
      account_locked: "BOOLEAN",
      account_lock_timestamp: "TIMESTAMP",
      
      customer_contacted: "BOOLEAN",
      customer_contact_timestamp: "TIMESTAMP",
      
      customer_confirmed_ato: "BOOLEAN",
      
      // RECOVERY
      account_restored: "BOOLEAN",
      account_restore_timestamp: "TIMESTAMP",
      
      password_reset_required: "BOOLEAN",
      mfa_enrollment_required: "BOOLEAN",
      
      // RELATED
      fraud_case_id: "BIGINT",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 7: Dispute Cases
  {
    name: 'bronze.retail_dispute_cases',
    description: 'Transaction dispute and chargeback cases',
    sourceSystem: 'DISPUTE_MANAGEMENT',
    sourceTable: 'DISPUTE_CASES',
    loadType: 'CDC',
    
    grain: 'One row per dispute case',
    primaryKey: ['dispute_id', 'source_system'],
    
    schema: {
      dispute_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      dispute_number: "STRING UNIQUE",
      
      customer_id: "BIGINT",
      account_id: "BIGINT",
      card_id: "BIGINT",
      
      transaction_id: "BIGINT",
      transaction_amount: "DECIMAL(18,2)",
      transaction_date: "DATE",
      
      merchant_name: "STRING",
      
      // DISPUTE DETAILS
      dispute_filed_date: "DATE",
      dispute_filed_timestamp: "TIMESTAMP",
      
      dispute_reason: "STRING COMMENT 'Fraudulent Transaction|Unauthorized Charge|Service Not Received|Defective Product|Duplicate Charge|Incorrect Amount'",
      dispute_reason_code: "STRING COMMENT 'Visa/MC reason code'",
      
      dispute_category: "STRING COMMENT 'Fraud|Authorization|Processing Error|Consumer Dispute'",
      
      // WORKFLOW
      dispute_status: "STRING COMMENT 'Filed|Under Review|Provisional Credit Issued|Merchant Response|Arbitration|Resolved|Closed'",
      
      provisional_credit_issued: "BOOLEAN",
      provisional_credit_amount: "DECIMAL(18,2)",
      provisional_credit_date: "DATE",
      
      // INVESTIGATION
      assigned_to_analyst_id: "BIGINT",
      investigation_start_timestamp: "TIMESTAMP",
      
      merchant_contacted: "BOOLEAN",
      merchant_response_received: "BOOLEAN",
      merchant_response_timestamp: "TIMESTAMP",
      merchant_response_code: "STRING",
      
      // RESOLUTION
      resolution_date: "DATE",
      resolution_code: "STRING COMMENT 'Customer Win|Merchant Win|Split Decision'",
      
      final_credit_amount: "DECIMAL(18,2) COMMENT 'Final amount credited to customer'",
      
      chargeback_filed: "BOOLEAN",
      chargeback_amount: "DECIMAL(18,2)",
      
      // REPRESENTMENT
      representment_received: "BOOLEAN COMMENT 'Merchant disputes the chargeback'",
      representment_timestamp: "TIMESTAMP",
      
      arbitration_required: "BOOLEAN",
      arbitration_result: "STRING",
      
      // CASE CLOSURE
      case_closed_date: "DATE",
      case_closed_timestamp: "TIMESTAMP",
      
      // FRAUD INDICATORS
      is_suspected_fraud: "BOOLEAN",
      fraud_case_id: "BIGINT",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 8: Fraud Rules
  {
    name: 'bronze.retail_fraud_rules',
    description: 'Fraud detection rule definitions and configuration',
    sourceSystem: 'FRAUD_DETECTION_SYSTEM',
    sourceTable: 'FRAUD_RULES',
    loadType: 'DAILY',
    
    grain: 'One row per rule per day',
    primaryKey: ['rule_id', 'snapshot_date', 'source_system'],
    
    schema: {
      rule_id: "STRING PRIMARY KEY",
      snapshot_date: "DATE PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      rule_name: "STRING",
      rule_description: "STRING",
      
      rule_type: "STRING COMMENT 'Velocity|Behavioral|Geographic|Amount|Merchant|Device'",
      rule_category: "STRING",
      
      rule_logic: "STRING COMMENT 'Rule expression/SQL'",
      
      // SCORING
      rule_weight: "INTEGER COMMENT 'Contribution to overall fraud score'",
      risk_score_contribution: "INTEGER",
      
      // THRESHOLDS
      threshold_value: "DECIMAL(18,2) COMMENT 'Rule threshold'",
      threshold_operator: "STRING COMMENT 'Greater Than|Less Than|Equal|Between'",
      
      // STATUS
      rule_status: "STRING COMMENT 'Active|Inactive|Testing'",
      is_active: "BOOLEAN",
      
      effective_date: "DATE",
      expiration_date: "DATE",
      
      // PERFORMANCE
      daily_trigger_count: "INTEGER COMMENT 'How many times rule triggered today'",
      true_positive_count: "INTEGER COMMENT 'Confirmed fraud'",
      false_positive_count: "INTEGER",
      
      precision: "DECIMAL(5,4) COMMENT 'TP / (TP + FP)'",
      recall: "DECIMAL(5,4) COMMENT 'TP / (TP + FN)'",
      
      // AUDIT
      created_by: "STRING",
      created_timestamp: "TIMESTAMP",
      last_modified_by: "STRING",
      last_modified_timestamp: "TIMESTAMP",
      
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 9: Fraud Models
  {
    name: 'bronze.retail_fraud_ml_models',
    description: 'Machine learning fraud detection model metadata',
    sourceSystem: 'ML_MODEL_REGISTRY',
    sourceTable: 'FRAUD_ML_MODELS',
    loadType: 'DAILY',
    
    grain: 'One row per model version per day',
    primaryKey: ['model_id', 'model_version', 'snapshot_date', 'source_system'],
    
    schema: {
      model_id: "STRING PRIMARY KEY",
      model_version: "STRING PRIMARY KEY",
      snapshot_date: "DATE PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      model_name: "STRING",
      model_description: "STRING",
      
      model_type: "STRING COMMENT 'Random Forest|XGBoost|Neural Network|Logistic Regression|Ensemble'",
      model_algorithm: "STRING",
      
      // USE CASE
      use_case: "STRING COMMENT 'Card Transaction Fraud|Account Takeover|Application Fraud|Transaction Monitoring'",
      
      // MODEL PERFORMANCE
      accuracy: "DECIMAL(5,4)",
      precision: "DECIMAL(5,4)",
      recall: "DECIMAL(5,4)",
      f1_score: "DECIMAL(5,4)",
      auc_roc: "DECIMAL(5,4) COMMENT 'Area Under ROC Curve'",
      
      false_positive_rate: "DECIMAL(5,4)",
      false_negative_rate: "DECIMAL(5,4)",
      
      // DEPLOYMENT
      model_status: "STRING COMMENT 'Development|Testing|Production|Retired'",
      is_production: "BOOLEAN",
      
      deployment_date: "DATE",
      retirement_date: "DATE",
      
      // TRAINING
      training_date: "DATE",
      training_dataset_size: "INTEGER",
      training_dataset_period_start: "DATE",
      training_dataset_period_end: "DATE",
      
      features_count: "INTEGER COMMENT 'Number of input features'",
      top_features: "STRING COMMENT 'JSON array of most important features'",
      
      // MONITORING
      daily_prediction_count: "INTEGER",
      daily_fraud_detected_count: "INTEGER",
      
      model_drift_score: "DECIMAL(5,4) COMMENT 'Indication of model degradation'",
      
      // AUDIT
      created_by: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 10: Fraud Recovery Actions
  {
    name: 'bronze.retail_fraud_recovery_actions',
    description: 'Fraud loss recovery and remediation actions',
    sourceSystem: 'FRAUD_CASE_MANAGEMENT',
    sourceTable: 'FRAUD_RECOVERY',
    loadType: 'CDC',
    
    grain: 'One row per recovery action',
    primaryKey: ['recovery_action_id', 'source_system'],
    
    schema: {
      recovery_action_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      fraud_case_id: "BIGINT COMMENT 'FK to fraud case'",
      customer_id: "BIGINT",
      
      // ACTION DETAILS
      action_date: "DATE",
      action_timestamp: "TIMESTAMP",
      
      recovery_action_type: "STRING COMMENT 'Chargeback|Insurance Claim|Legal Action|Write-Off|Customer Reimbursement|Collection'",
      
      recovery_method: "STRING COMMENT 'Card Network Dispute|Insurance Recovery|Legal Settlement|Customer Payment|Asset Seizure'",
      
      // AMOUNTS
      fraud_loss_amount: "DECIMAL(18,2) COMMENT 'Total fraud loss'",
      recovery_amount: "DECIMAL(18,2) COMMENT 'Amount recovered'",
      recovery_costs: "DECIMAL(18,2) COMMENT 'Cost of recovery efforts'",
      net_recovery_amount: "DECIMAL(18,2) COMMENT 'Recovery minus costs'",
      
      // STATUS
      recovery_status: "STRING COMMENT 'Initiated|In Progress|Successful|Unsuccessful|Partial Recovery|Closed'",
      
      recovery_complete_timestamp: "TIMESTAMP",
      
      // INSURANCE
      insurance_claim_filed: "BOOLEAN",
      insurance_claim_number: "STRING",
      insurance_payout_amount: "DECIMAL(18,2)",
      
      // LEGAL
      legal_action_taken: "BOOLEAN",
      legal_case_number: "STRING",
      legal_settlement_amount: "DECIMAL(18,2)",
      
      // CHARGEBACK
      chargeback_filed: "BOOLEAN",
      chargeback_reference_number: "STRING",
      chargeback_won: "BOOLEAN",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 11: Device Fingerprints
  {
    name: 'bronze.retail_device_fingerprints',
    description: 'Device fingerprinting data for fraud detection',
    sourceSystem: 'DEVICE_INTELLIGENCE',
    sourceTable: 'DEVICE_FINGERPRINTS',
    loadType: 'STREAMING',
    
    grain: 'One row per device fingerprint event',
    primaryKey: ['fingerprint_id', 'source_system'],
    
    schema: {
      fingerprint_id: "STRING PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      device_id: "STRING COMMENT 'Unique device identifier'",
      customer_id: "BIGINT",
      
      // TIMESTAMP
      fingerprint_timestamp: "TIMESTAMP",
      
      // DEVICE ATTRIBUTES
      device_type: "STRING COMMENT 'Desktop|Mobile|Tablet'",
      operating_system: "STRING",
      os_version: "STRING",
      
      browser_name: "STRING",
      browser_version: "STRING",
      
      device_manufacturer: "STRING",
      device_model: "STRING",
      
      screen_resolution: "STRING",
      screen_size: "STRING",
      
      // NETWORK
      ip_address: "STRING",
      ip_country: "STRING",
      ip_city: "STRING",
      ip_region: "STRING",
      
      isp_name: "STRING COMMENT 'Internet Service Provider'",
      
      is_vpn: "BOOLEAN",
      is_proxy: "BOOLEAN",
      is_tor: "BOOLEAN",
      
      // LOCATION
      geolocation_latitude: "DECIMAL(10,8)",
      geolocation_longitude: "DECIMAL(11,8)",
      
      // TRUST SIGNALS
      device_trust_score: "INTEGER COMMENT '0-100'",
      
      is_trusted_device: "BOOLEAN",
      first_seen_timestamp: "TIMESTAMP",
      last_seen_timestamp: "TIMESTAMP",
      
      transaction_count_from_device: "INTEGER",
      
      // FRAUD SIGNALS
      associated_fraud_cases_count: "INTEGER",
      is_blacklisted: "BOOLEAN",
      blacklist_reason: "STRING",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 12: Fraud Analyst Activity
  {
    name: 'bronze.retail_fraud_analyst_activity',
    description: 'Fraud analyst actions and decisions',
    sourceSystem: 'FRAUD_CASE_MANAGEMENT',
    sourceTable: 'ANALYST_ACTIVITY',
    loadType: 'STREAMING',
    
    grain: 'One row per analyst action',
    primaryKey: ['activity_id', 'source_system'],
    
    schema: {
      activity_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      analyst_id: "BIGINT",
      analyst_name: "STRING",
      
      // ACTIVITY DETAILS
      activity_timestamp: "TIMESTAMP",
      activity_date: "DATE",
      
      activity_type: "STRING COMMENT 'Review Alert|Update Case|Contact Customer|Block Card|Escalate|Close Case'",
      
      // CASE/ALERT
      fraud_alert_id: "BIGINT",
      fraud_case_id: "BIGINT",
      
      customer_id: "BIGINT",
      
      // DECISION
      decision_made: "STRING COMMENT 'Confirm Fraud|Mark False Positive|Escalate|Request More Info'",
      decision_notes: "STRING",
      
      decision_confidence: "STRING COMMENT 'High|Medium|Low'",
      
      // TIME SPENT
      time_spent_minutes: "INTEGER COMMENT 'Time spent on this activity'",
      
      // ACTIONS TAKEN
      card_blocked: "BOOLEAN",
      account_frozen: "BOOLEAN",
      customer_contacted: "BOOLEAN",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 13: Merchant Fraud Risk
  {
    name: 'bronze.retail_merchant_fraud_risk',
    description: 'Merchant-level fraud risk scores and statistics',
    sourceSystem: 'FRAUD_ANALYTICS',
    sourceTable: 'MERCHANT_FRAUD_RISK',
    loadType: 'DAILY',
    
    grain: 'One row per merchant per day',
    primaryKey: ['merchant_id', 'risk_date', 'source_system'],
    
    schema: {
      merchant_id: "STRING PRIMARY KEY",
      risk_date: "DATE PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      merchant_name: "STRING",
      merchant_category_code: "STRING",
      merchant_country: "STRING",
      
      // FRAUD STATISTICS
      total_transactions_count: "INTEGER",
      fraud_transactions_count: "INTEGER",
      fraud_rate: "DECIMAL(5,4) COMMENT 'Fraud transactions / Total transactions'",
      
      total_transaction_amount: "DECIMAL(18,2)",
      total_fraud_amount: "DECIMAL(18,2)",
      
      // RISK SCORE
      merchant_fraud_risk_score: "INTEGER COMMENT '0-1000'",
      merchant_risk_level: "STRING COMMENT 'Low|Medium|High|Critical'",
      
      // TRENDS
      fraud_rate_7d_avg: "DECIMAL(5,4)",
      fraud_rate_30d_avg: "DECIMAL(5,4)",
      
      fraud_rate_trend: "STRING COMMENT 'Increasing|Stable|Decreasing'",
      
      // ACTIONS
      is_blocked: "BOOLEAN COMMENT 'Merchant blocked due to high fraud'",
      is_flagged_for_review: "BOOLEAN",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
  
  // Table 14: External Fraud Intelligence
  {
    name: 'bronze.retail_external_fraud_intelligence',
    description: 'External fraud intelligence feeds (card networks, bureaus)',
    sourceSystem: 'EXTERNAL_FRAUD_FEED',
    sourceTable: 'EXTERNAL_FRAUD_INTEL',
    loadType: 'STREAMING',
    
    grain: 'One row per external fraud alert',
    primaryKey: ['external_alert_id', 'source_system'],
    
    schema: {
      external_alert_id: "STRING PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      // SOURCE
      intelligence_source: "STRING COMMENT 'Visa|Mastercard|Experian|LexisNexis|Law Enforcement|Dark Web Monitoring'",
      alert_type: "STRING",
      
      alert_timestamp: "TIMESTAMP",
      alert_date: "DATE",
      
      // COMPROMISED DATA
      compromised_card_bin: "STRING COMMENT 'Bank Identification Number (first 6 digits)'",
      compromised_card_count: "INTEGER COMMENT 'Number of cards potentially compromised'",
      
      compromised_data_type: "STRING COMMENT 'Card Numbers|CVV|Expiration Dates|Cardholder Names|Full Magnetic Stripe'",
      
      // BREACH DETAILS
      breach_name: "STRING",
      breach_merchant_id: "STRING",
      breach_merchant_name: "STRING",
      
      breach_date: "DATE",
      breach_method: "STRING COMMENT 'Malware|Skimming|Phishing|Hacking|Physical Theft'",
      
      // GEOGRAPHICAL SCOPE
      affected_countries: "STRING COMMENT 'JSON array'",
      affected_regions: "STRING",
      
      // SEVERITY
      risk_level: "STRING COMMENT 'Low|Medium|High|Critical'",
      
      // RECOMMENDED ACTIONS
      recommended_action: "STRING COMMENT 'Monitor|Reissue Cards|Block Transactions|Customer Notification'",
      
      // MATCHING
      matching_cards_count: "INTEGER COMMENT 'Number of our cards affected'",
      matching_customer_ids: "STRING COMMENT 'JSON array of affected customer IDs'",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
];

export const fraudRetailBronzeLayerComplete = {
  description: 'Complete bronze layer for retail fraud domain',
  layer: 'BRONZE',
  tables: fraudRetailBronzeTables,
  totalTables: 14,
  estimatedSize: '6.8TB',
  refreshFrequency: 'Real-time streaming for alerts and transactions, Daily for analytics and risk scores',
  retention: '7 years (regulatory requirement)',
  
  keyFeatures: [
    'Real-time fraud alert generation and tracking',
    'Card transaction monitoring with fraud indicators',
    'Fraud case investigation lifecycle',
    'Card compromise and breach tracking',
    'Identity theft and synthetic identity fraud detection',
    'Account takeover (ATO) detection and prevention',
    'Dispute and chargeback management',
    'Fraud detection rules and ML model tracking',
    'Fraud recovery and loss mitigation',
    'Device fingerprinting and trust scoring',
    'Analyst activity and decision tracking',
    'Merchant fraud risk scoring',
    'External fraud intelligence integration',
    'Regulatory compliance (SAR filing)',
  ],
};
