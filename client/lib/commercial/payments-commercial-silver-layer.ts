/**
 * PAYMENTS-COMMERCIAL SILVER LAYER
 * Cleansed, conformed, and enriched payment data
 * 
 * Domain: Payments-Commercial
 * Area: Commercial Banking
 * Layer: SILVER (Cleansed/Conformed)
 * Tables: 18
 * 
 * Transformations:
 * - Payment transaction deduplication and golden record creation
 * - NACHA return code enrichment
 * - SWIFT message parsing and normalization
 * - Fraud score aggregation
 * - Payment status standardization
 * - Settlement reconciliation
 * - Compliance screening enrichment
 */

export const paymentsCommercialSilverTables = [
  // Table 1: ACH Golden Record
  {
    name: 'silver.commercial_ach_transactions_golden',
    description: 'Deduplicated and enriched ACH transaction golden records combining originations, returns, and NOCs',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per ACH transaction (current and historical versions)',
    primaryKey: ['ach_transaction_id', 'effective_start_date'],
    foreignKeys: ['company_id', 'originator_account_number', 'receiver_routing_number'],
    
    transformations: [
      'Deduplicate ACH transactions across source systems using trace number matching',
      'Enrich with return and NOC information by joining on original trace number',
      'Standardize SEC codes and transaction codes to business-friendly descriptions',
      'Calculate settlement timing metrics (submission to settlement duration)',
      'Enrich with NACHA return code descriptions and return type classifications',
      'Apply business rules for same-day ACH identification',
      'Aggregate addenda records into structured JSON',
      'Enrich with company master data (company name, segment, risk rating)',
      'Calculate return rates by company, SEC code, and RDFI',
      'Identify prenote transactions and link to subsequent live transactions',
    ],
    
    dataQualityRules: [
      'Trace number must be unique per effective entry date',
      'Transaction amount must be >= 0.01 (except prenotes)',
      'Originator and receiver routing numbers must be valid 9-digit ABA numbers',
      'SEC code must be in approved NACHA list (CCD, CTP, CTX, PPD, WEB, TEL, etc.)',
      'Effective entry date must be within 2 business days of submission date (standard ACH)',
      'Same-day ACH amounts must be <= $1,000,000',
      'Return transactions must have valid R01-R99 return reason code',
      'NOC transactions must have valid C01-C13 change code',
      'Settlement date must be >= effective entry date',
      'Batch totals must reconcile with individual transaction sums',
    ],
    
    schema: {
      // Primary Identifiers
      ach_transaction_id: "STRING PRIMARY KEY COMMENT 'Golden record ACH transaction ID'",
      source_system: "STRING COMMENT 'Source system of origin'",
      trace_number: "STRING UNIQUE COMMENT 'ACH trace number'",
      company_id: "STRING COMMENT 'FK to commercial customer'",
      batch_id: "STRING",
      
      // Transaction Classification (Enriched)
      transaction_type: "STRING COMMENT 'CREDIT|DEBIT'",
      sec_code: "STRING",
      sec_code_description: "STRING COMMENT 'Business-friendly SEC code description'",
      transaction_purpose: "STRING COMMENT 'PAYROLL|VENDOR_PAYMENT|CUSTOMER_REFUND|TAX_PAYMENT'",
      
      // Amount
      transaction_amount: "DECIMAL(18,2)",
      transaction_currency: "STRING DEFAULT 'USD'",
      fee_amount: "DECIMAL(10,2)",
      
      // Originator (Enriched)
      originator_name: "STRING",
      originator_account_number: "STRING",
      originator_routing_number: "STRING",
      originator_account_type: "STRING",
      originating_dfi_name: "STRING COMMENT 'Enriched from bank master data'",
      
      // Receiver (Enriched)
      receiver_name: "STRING",
      receiver_account_number: "STRING",
      receiver_routing_number: "STRING",
      receiver_account_type: "STRING",
      receiving_dfi_name: "STRING COMMENT 'Enriched from bank master data'",
      
      // Timing Metrics
      submission_date: "DATE",
      submission_timestamp: "TIMESTAMP",
      effective_entry_date: "DATE",
      settlement_date: "DATE",
      submission_to_settlement_days: "INTEGER COMMENT 'Calculated metric'",
      
      // Same-Day ACH
      same_day_ach_flag: "BOOLEAN",
      same_day_processing_window: "STRING",
      
      // Status (Standardized)
      transaction_status: "STRING COMMENT 'SUBMITTED|SETTLED|RETURNED|REVERSED'",
      final_status_timestamp: "TIMESTAMP",
      
      // Return Information (Enriched)
      return_flag: "BOOLEAN",
      return_reason_code: "STRING",
      return_reason_description: "STRING COMMENT 'Enriched from NACHA code table'",
      return_type: "STRING COMMENT 'CUSTOMER|ADMINISTRATIVE|BANK'",
      return_date: "DATE",
      return_settlement_date: "DATE",
      dishonored_return_flag: "BOOLEAN",
      return_fee_assessed: "DECIMAL(10,2)",
      
      // NOC Information (Enriched)
      noc_flag: "BOOLEAN",
      noc_code: "STRING",
      noc_description: "STRING COMMENT 'Enriched from NACHA code table'",
      noc_corrected_field: "STRING COMMENT 'ROUTING|ACCOUNT|NAME'",
      noc_corrected_value: "STRING",
      noc_auto_applied_flag: "BOOLEAN",
      
      // Prenote Tracking
      prenote_flag: "BOOLEAN",
      prenote_validated_flag: "BOOLEAN",
      linked_live_transaction_id: "STRING COMMENT 'FK to first live transaction after prenote'",
      
      // Business Context (Enriched)
      company_name: "STRING COMMENT 'Enriched from customer master'",
      customer_segment: "STRING COMMENT 'Small Business|Middle Market|Enterprise'",
      customer_risk_rating: "STRING",
      invoice_number: "STRING",
      customer_reference: "STRING",
      
      // Addenda Information
      addenda_flag: "BOOLEAN",
      addenda_records: "JSON COMMENT 'Structured array of addenda records'",
      
      // Calculated Metrics
      is_high_value_ach: "BOOLEAN COMMENT 'Amount > $25,000'",
      is_international_ach: "BOOLEAN",
      is_reversal: "BOOLEAN",
      
      // Data Quality Flags
      duplicate_trace_number_flag: "BOOLEAN",
      routing_number_validation_status: "STRING COMMENT 'VALID|INVALID|NOT_CHECKED'",
      data_quality_score: "DECIMAL(5,2) COMMENT 'Overall data quality (0-100)'",
      
      // SCD Type 2 Fields
      effective_start_date: "TIMESTAMP NOT NULL COMMENT 'When this version became effective'",
      effective_end_date: "TIMESTAMP COMMENT 'NULL = current version'",
      is_current: "BOOLEAN NOT NULL DEFAULT TRUE",
      row_hash: "STRING COMMENT 'SHA-256 hash for change detection'",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 2: Wire Transfer Golden Record
  {
    name: 'silver.commercial_wire_transactions_golden',
    description: 'Deduplicated and enriched wire transfer golden records (domestic and international)',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per wire transfer (current and historical versions)',
    primaryKey: ['wire_transaction_id', 'effective_start_date'],
    foreignKeys: ['company_id', 'originator_account_number'],
    
    transformations: [
      'Deduplicate wire transfers using IMAD/OMAD matching',
      'Enrich domestic wires with ABA routing information',
      'Enrich international wires with SWIFT BIC information and country data',
      'Parse and normalize SWIFT MT message fields',
      'Standardize wire type classification (domestic vs international, network)',
      'Calculate FX rates and settlement amounts for multi-currency wires',
      'Enrich with OFAC/sanctions screening results',
      'Aggregate intermediary bank information',
      'Calculate wire processing time metrics (submission to settlement)',
      'Identify recall and return events',
    ],
    
    dataQualityRules: [
      'IMAD must be unique and 16 characters for Fedwire',
      'Wire amount must be > 0',
      'Originator and beneficiary names must not be null',
      'Domestic wires must have valid 9-digit ABA routing numbers',
      'International wires must have valid 8 or 11-character SWIFT BIC',
      'OFAC screening must be completed before transmission',
      'Value date must be >= submission date',
      'FX rate must be > 0 for multi-currency wires',
      'Fee allocation must be OUR, BEN, or SHA for international wires',
      'Settlement timestamp must be >= transmission timestamp',
    ],
    
    schema: {
      wire_transaction_id: "STRING PRIMARY KEY",
      source_system: "STRING",
      imad: "STRING UNIQUE COMMENT 'Fedwire IMAD'",
      omad: "STRING",
      company_id: "STRING COMMENT 'FK to commercial customer'",
      
      // Wire Classification (Enriched)
      wire_type: "STRING COMMENT 'DOMESTIC|INTERNATIONAL'",
      wire_network: "STRING COMMENT 'FEDWIRE|SWIFT|CHIPS'",
      wire_priority: "STRING COMMENT 'NORMAL|URGENT|SAME_DAY'",
      repetitive_wire_flag: "BOOLEAN",
      
      // Amount (Enriched with FX)
      wire_amount: "DECIMAL(18,2)",
      wire_currency: "STRING",
      foreign_exchange_flag: "BOOLEAN",
      fx_rate: "DECIMAL(12,6)",
      settlement_amount: "DECIMAL(18,2)",
      settlement_currency: "STRING DEFAULT 'USD'",
      fx_spread_bps: "INTEGER COMMENT 'FX spread in basis points (enriched)'",
      
      // Originator (Enriched)
      originator_name: "STRING",
      originator_account_number: "STRING",
      originator_routing_number: "STRING",
      originator_country: "STRING COMMENT 'ISO 3166 country code'",
      originator_country_name: "STRING COMMENT 'Enriched country name'",
      
      // Beneficiary (Enriched)
      beneficiary_name: "STRING",
      beneficiary_account_number: "STRING",
      beneficiary_bank_name: "STRING",
      beneficiary_bank_routing: "STRING",
      beneficiary_bank_swift_bic: "STRING",
      beneficiary_bank_country: "STRING",
      beneficiary_bank_country_name: "STRING COMMENT 'Enriched'",
      beneficiary_country: "STRING",
      
      // Intermediary Bank (Enriched)
      intermediary_bank_flag: "BOOLEAN",
      intermediary_bank_name: "STRING",
      intermediary_bank_swift_bic: "STRING",
      intermediary_bank_country: "STRING",
      
      // SWIFT-Specific (Parsed & Enriched)
      swift_message_type: "STRING",
      swift_reference: "STRING",
      uetr: "STRING COMMENT 'Unique End-to-end Transaction Reference'",
      swift_gpi_flag: "BOOLEAN COMMENT 'SWIFT gpi enabled wire'",
      
      // Payment Purpose
      payment_purpose: "STRING",
      payment_details: "STRING",
      invoice_number: "STRING",
      regulatory_reporting_code: "STRING",
      
      // Timing Metrics
      submission_date: "DATE",
      submission_timestamp: "TIMESTAMP",
      value_date: "DATE",
      execution_timestamp: "TIMESTAMP",
      settlement_timestamp: "TIMESTAMP",
      submission_to_settlement_hours: "DECIMAL(6,2) COMMENT 'Calculated processing time'",
      
      // Status (Standardized)
      wire_status: "STRING COMMENT 'APPROVED|TRANSMITTED|SETTLED|REJECTED|RECALLED|RETURNED'",
      final_status_timestamp: "TIMESTAMP",
      
      // Approval Workflow
      dual_approval_required_flag: "BOOLEAN",
      dual_approval_completed_flag: "BOOLEAN",
      approval_time_minutes: "INTEGER COMMENT 'Time from creation to final approval'",
      
      // Fees (Enriched)
      total_fees: "DECIMAL(10,2) COMMENT 'Sum of all fees'",
      originator_fee: "DECIMAL(10,2)",
      correspondent_fee: "DECIMAL(10,2)",
      beneficiary_fee: "DECIMAL(10,2)",
      fee_allocation: "STRING COMMENT 'OUR|BEN|SHA'",
      
      // Compliance (Enriched)
      ofac_screening_status: "STRING COMMENT 'PASSED|FAILED|MANUAL_REVIEW'",
      ofac_screening_timestamp: "TIMESTAMP",
      sanctions_hit_flag: "BOOLEAN",
      sanctions_country_flag: "BOOLEAN COMMENT 'Beneficiary in sanctioned country'",
      aml_screening_status: "STRING",
      high_risk_country_flag: "BOOLEAN",
      pep_match_flag: "BOOLEAN COMMENT 'Politically Exposed Person match'",
      
      // Recall/Return
      recall_flag: "BOOLEAN",
      recall_reason: "STRING",
      recall_timestamp: "TIMESTAMP",
      recall_successful_flag: "BOOLEAN",
      return_flag: "BOOLEAN",
      return_reason: "STRING",
      
      // Business Context (Enriched)
      company_name: "STRING COMMENT 'Enriched from customer master'",
      customer_segment: "STRING",
      relationship_manager: "STRING COMMENT 'Enriched RM name'",
      
      // Calculated Metrics
      is_high_value_wire: "BOOLEAN COMMENT 'Amount >= $100,000'",
      is_cross_border: "BOOLEAN COMMENT 'Originator and beneficiary in different countries'",
      is_sanctioned_country: "BOOLEAN",
      
      // Data Quality
      data_quality_score: "DECIMAL(5,2)",
      
      // SCD Type 2
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP",
      is_current: "BOOLEAN NOT NULL DEFAULT TRUE",
      row_hash: "STRING",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 3: RTP Transactions Enriched
  {
    name: 'silver.commercial_rtp_transactions_enriched',
    description: 'Real-Time Payments with enrichment and ISO 20022 parsing',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per RTP transaction',
    primaryKey: ['rtp_transaction_id', 'effective_start_date'],
    
    transformations: [
      'Parse ISO 20022 messages (pacs.008, pain.013, pain.014)',
      'Enrich with Request for Payment (RFP) response details',
      'Calculate real-time performance metrics (response time)',
      'Standardize payment status across message types',
      'Enrich with fraud scores and risk assessments',
      'Link RFP requests to payment responses',
      'Calculate velocity metrics by account and payee',
      'Enrich with bank routing information',
    ],
    
    dataQualityRules: [
      'End-to-end ID must be unique',
      'Transaction amount must be <= $1,000,000 (RTP network limit)',
      'Response time must be < 60 seconds (RTP SLA)',
      'Routing numbers must be RTP-enabled banks',
      'ISO 20022 message must be valid XML',
      'RFP expiration timestamp must be > initiation timestamp',
    ],
    
    schema: {
      rtp_transaction_id: "STRING PRIMARY KEY",
      clearing_system_reference: "STRING",
      end_to_end_id: "STRING UNIQUE",
      
      // Message Type (Parsed)
      message_type: "STRING COMMENT 'pacs.008|pain.013|pain.014'",
      transaction_purpose: "STRING COMMENT 'PAYMENT|REQUEST_FOR_PAYMENT'",
      request_for_payment_flag: "BOOLEAN",
      
      // Amount
      transaction_amount: "DECIMAL(18,2) COMMENT 'Max $1M'",
      transaction_currency: "STRING DEFAULT 'USD'",
      
      // Debtor (Payer) - Enriched
      debtor_name: "STRING",
      debtor_account_number: "STRING",
      debtor_routing_number: "STRING",
      debtor_bank_name: "STRING COMMENT 'Enriched'",
      
      // Creditor (Payee) - Enriched
      creditor_name: "STRING",
      creditor_account_number: "STRING",
      creditor_routing_number: "STRING",
      creditor_bank_name: "STRING COMMENT 'Enriched'",
      
      // Remittance Information (Parsed)
      remittance_information: "STRING",
      remittance_type: "STRING COMMENT 'STRUCTURED|UNSTRUCTURED'",
      invoice_number: "STRING",
      
      // Timing Metrics (Real-Time)
      initiation_timestamp: "TIMESTAMP",
      clearing_timestamp: "TIMESTAMP",
      settlement_timestamp: "TIMESTAMP",
      response_time_ms: "INTEGER COMMENT '<15000ms typical'",
      initiation_to_settlement_seconds: "INTEGER COMMENT 'Calculated'",
      
      // Status
      payment_status: "STRING COMMENT 'INITIATED|ACCEPTED|SETTLED|REJECTED|RETURNED'",
      status_reason_code: "STRING",
      status_reason_description: "STRING COMMENT 'Enriched'",
      
      // Request for Payment (RFP) - Enriched
      rfp_id: "STRING",
      rfp_expiration_timestamp: "TIMESTAMP",
      rfp_response: "STRING COMMENT 'ACCEPT|DECLINE|PARTIAL'",
      rfp_response_timestamp: "TIMESTAMP",
      rfp_response_time_minutes: "INTEGER COMMENT 'Time to respond to RFP'",
      
      // Fraud & Risk (Enriched)
      fraud_score: "DECIMAL(5,2) COMMENT '0-100'",
      fraud_risk_level: "STRING COMMENT 'LOW|MEDIUM|HIGH'",
      velocity_check_flag: "BOOLEAN",
      velocity_check_result: "STRING",
      real_time_fraud_flag: "BOOLEAN COMMENT 'Flagged for fraud in real-time'",
      
      // Fees
      rtp_network_fee: "DECIMAL(5,2)",
      bank_processing_fee: "DECIMAL(5,2)",
      total_fees: "DECIMAL(5,2) COMMENT 'Calculated'",
      
      // Performance Flags
      within_sla_flag: "BOOLEAN COMMENT 'Settled within 15 seconds'",
      instant_settlement_flag: "BOOLEAN COMMENT 'Settled < 10 seconds'",
      
      // SCD Type 2
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP",
      is_current: "BOOLEAN NOT NULL DEFAULT TRUE",
      row_hash: "STRING",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 4: Payment Fraud Analysis
  {
    name: 'silver.commercial_payment_fraud_analysis',
    description: 'Aggregated fraud detection analysis across all payment types',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per fraud alert with enriched investigation data',
    primaryKey: ['fraud_alert_id'],
    foreignKeys: ['account_number', 'transaction_id'],
    
    transformations: [
      'Link fraud alerts to underlying payment transactions (ACH, wire, RTP, check)',
      'Enrich with historical fraud pattern data',
      'Calculate customer fraud history and propensity scores',
      'Aggregate triggered fraud rules into risk categories',
      'Enrich with ML model predictions and confidence scores',
      'Link to SAR (Suspicious Activity Report) filings',
      'Calculate time-to-resolution metrics',
      'Enrich with customer behavioral baselines',
    ],
    
    dataQualityRules: [
      'Fraud score must be between 0 and 100',
      'Alert severity must be CRITICAL|HIGH|MEDIUM|LOW',
      'Transaction ID must link to valid payment transaction',
      'Resolution status must progress logically (OPEN → RESOLVED)',
      'If confirmed fraud, account frozen flag should be TRUE',
      'SAR filing date must be within 30 days of confirmed fraud',
    ],
    
    schema: {
      fraud_alert_id: "STRING PRIMARY KEY",
      transaction_id: "STRING COMMENT 'FK to payment transaction'",
      transaction_type: "STRING COMMENT 'ACH|WIRE|RTP|CHECK|BILL_PAYMENT'",
      transaction_amount: "DECIMAL(18,2)",
      transaction_timestamp: "TIMESTAMP",
      
      account_number: "STRING",
      company_id: "STRING",
      company_name: "STRING COMMENT 'Enriched'",
      
      // Alert Classification (Enriched)
      alert_type: "STRING",
      alert_severity: "STRING",
      fraud_score: "DECIMAL(5,2) COMMENT 'Composite fraud score'",
      fraud_category: "STRING COMMENT 'ACCOUNT_TAKEOVER|PAYMENT_FRAUD|CHECK_FRAUD|WIRE_FRAUD|IDENTITY_THEFT'",
      
      // Alert Details
      alert_timestamp: "TIMESTAMP",
      alert_description: "STRING",
      triggered_rules: "JSON COMMENT 'Array of fraud rules triggered'",
      triggered_rules_count: "INTEGER COMMENT 'Calculated'",
      
      // Risk Factors (Enriched)
      velocity_anomaly_flag: "BOOLEAN",
      new_payee_flag: "BOOLEAN",
      large_amount_flag: "BOOLEAN",
      unusual_time_flag: "BOOLEAN",
      geolocation_mismatch_flag: "BOOLEAN",
      device_fingerprint_mismatch_flag: "BOOLEAN",
      behavioral_anomaly_flag: "BOOLEAN COMMENT 'Deviation from customer baseline'",
      total_risk_factors: "INTEGER COMMENT 'Count of TRUE risk flags'",
      
      // Machine Learning (Enriched)
      ml_model_name: "STRING",
      ml_model_version: "STRING",
      ml_confidence_score: "DECIMAL(5,2)",
      ml_prediction: "STRING COMMENT 'FRAUD|LEGITIMATE|UNCERTAIN'",
      ml_feature_importance: "JSON COMMENT 'Top contributing features'",
      
      // Historical Context (Enriched)
      customer_fraud_history_count: "INTEGER COMMENT 'Prior fraud incidents for this customer'",
      customer_fraud_propensity_score: "DECIMAL(5,2) COMMENT 'Historical fraud likelihood'",
      days_since_last_fraud_alert: "INTEGER",
      account_age_days: "INTEGER COMMENT 'Age of account'",
      
      // Alert Status & Resolution
      alert_status: "STRING COMMENT 'OPEN|UNDER_REVIEW|CONFIRMED_FRAUD|FALSE_POSITIVE|RESOLVED'",
      resolution_timestamp: "TIMESTAMP",
      resolution_notes: "STRING",
      resolved_by_user_id: "STRING",
      time_to_resolution_hours: "DECIMAL(8,2) COMMENT 'Calculated'",
      
      // Actions Taken
      transaction_blocked_flag: "BOOLEAN",
      transaction_block_timestamp: "TIMESTAMP",
      account_frozen_flag: "BOOLEAN",
      account_freeze_timestamp: "TIMESTAMP",
      customer_notified_flag: "BOOLEAN",
      customer_notification_timestamp: "TIMESTAMP",
      customer_notification_method: "STRING COMMENT 'EMAIL|PHONE|SMS|PORTAL'",
      
      // Investigation (Enriched)
      assigned_to_user_id: "STRING",
      assigned_to_user_name: "STRING COMMENT 'Enriched'",
      investigation_notes: "STRING",
      investigation_priority: "STRING COMMENT 'URGENT|HIGH|NORMAL|LOW'",
      
      // SAR Filing
      sar_filed_flag: "BOOLEAN",
      sar_filing_date: "DATE",
      sar_reference_number: "STRING",
      finCEN_filing_id: "STRING",
      
      // Financial Impact
      potential_loss_amount: "DECIMAL(18,2) COMMENT 'Potential financial impact if fraud'",
      actual_loss_amount: "DECIMAL(18,2) COMMENT 'Actual loss if confirmed fraud'",
      recovery_amount: "DECIMAL(18,2) COMMENT 'Amount recovered'",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 5: Payment Settlement Reconciliation
  {
    name: 'silver.commercial_payment_settlement_recon',
    description: 'Reconciled payment settlement data matching internal and external systems',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per reconciled payment item',
    primaryKey: ['reconciliation_id'],
    
    transformations: [
      'Match internal payment transactions to external settlement files using fuzzy matching',
      'Calculate variance amounts and timing differences',
      'Enrich with GL account information',
      'Categorize variances by root cause',
      'Calculate reconciliation confidence scores',
      'Aggregate reconciliation metrics by payment type and date',
      'Identify systematic reconciliation issues (patterns)',
      'Link to GL adjustment entries',
    ],
    
    dataQualityRules: [
      'Match status must be MATCHED|UNMATCHED|VARIANCE|EXCEPTION',
      'Amount variance should be $0.00 for MATCHED status',
      'External transaction ID must not be null',
      'Reconciliation date must be >= transaction date',
      'GL adjustment amount must equal variance amount if adjustment required',
    ],
    
    schema: {
      reconciliation_id: "STRING PRIMARY KEY",
      reconciliation_date: "DATE",
      reconciliation_batch_id: "STRING",
      
      // Reconciliation Type
      reconciliation_type: "STRING COMMENT 'ACH_SETTLEMENT|WIRE_SETTLEMENT|CHECK_CLEARING|RTP_SETTLEMENT|GATEWAY_SETTLEMENT'",
      payment_network: "STRING COMMENT 'FEDACH|FEDWIRE|RTP_NETWORK|SWIFT|CHECK_CLEARING'",
      
      // Internal System Record
      internal_transaction_id: "STRING",
      internal_amount: "DECIMAL(18,2)",
      internal_timestamp: "TIMESTAMP",
      internal_status: "STRING",
      internal_reference: "STRING COMMENT 'Trace number, IMAD, check number'",
      
      // External System Record
      external_transaction_id: "STRING",
      external_reference: "STRING",
      external_amount: "DECIMAL(18,2)",
      external_timestamp: "TIMESTAMP",
      external_status: "STRING",
      external_file_name: "STRING COMMENT 'Settlement file name'",
      
      // Matching Results
      match_status: "STRING COMMENT 'MATCHED|UNMATCHED|VARIANCE|EXCEPTION'",
      match_method: "STRING COMMENT 'EXACT|FUZZY|MANUAL'",
      match_confidence_score: "DECIMAL(5,2) COMMENT '0-100, based on matching algorithm'",
      match_timestamp: "TIMESTAMP",
      
      // Variance Analysis
      amount_variance: "DECIMAL(18,2) COMMENT 'Internal - External'",
      amount_variance_abs: "DECIMAL(18,2) COMMENT 'Absolute value of variance'",
      amount_variance_pct: "DECIMAL(7,4) COMMENT 'Variance as percentage of amount'",
      time_variance_minutes: "INTEGER COMMENT 'Timing difference between systems'",
      
      variance_reason: "STRING COMMENT 'TIMING_DIFFERENCE|AMOUNT_MISMATCH|MISSING_RECORD|DUPLICATE|FEE_DIFFERENCE|FX_DIFFERENCE'",
      variance_root_cause: "STRING COMMENT 'Enriched root cause category'",
      variance_explanation: "STRING",
      
      // Resolution
      resolution_status: "STRING COMMENT 'PENDING|RESOLVED|ESCALATED|WAIVED'",
      resolution_action: "STRING COMMENT 'AUTO_MATCHED|MANUAL_MATCH|ADJUSTMENT|INVESTIGATION_REQUIRED|NO_ACTION'",
      resolution_timestamp: "TIMESTAMP",
      resolved_by_user_id: "STRING",
      resolution_notes: "STRING",
      time_to_resolve_hours: "DECIMAL(8,2) COMMENT 'Calculated'",
      
      // GL Impact (Enriched)
      gl_adjustment_required_flag: "BOOLEAN",
      gl_adjustment_amount: "DECIMAL(18,2)",
      gl_debit_account: "STRING COMMENT 'GL account to debit'",
      gl_credit_account: "STRING COMMENT 'GL account to credit'",
      gl_posting_date: "DATE",
      gl_posting_status: "STRING COMMENT 'PENDING|POSTED|FAILED'",
      gl_journal_entry_id: "STRING COMMENT 'FK to GL system'",
      
      // Exception Handling
      exception_flag: "BOOLEAN COMMENT 'Material variance requiring escalation'",
      materiality_threshold_breached: "BOOLEAN COMMENT 'Variance > threshold'",
      escalation_required_flag: "BOOLEAN",
      escalated_to_user_id: "STRING",
      
      // Business Context (Enriched)
      company_id: "STRING",
      company_name: "STRING COMMENT 'Enriched'",
      account_number: "STRING",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 6: Check Positive Pay Exceptions
  {
    name: 'silver.commercial_positive_pay_exceptions_enriched',
    description: 'Enriched check positive pay exceptions with decision analytics',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per positive pay exception',
    primaryKey: ['positive_pay_item_id'],
    
    transformations: [
      'Enrich with check issue file details',
      'Calculate variance metrics (amount, payee)',
      'Link to customer decision history and patterns',
      'Enrich with fraud risk scores',
      'Calculate time-to-decision metrics',
      'Identify duplicate presentments',
      'Enrich with historical exception rates by customer',
    ],
    
    dataQualityRules: [
      'Exception type must be valid (AMOUNT_MISMATCH|PAYEE_MISMATCH|DUPLICATE|NOT_ON_FILE|VOID_CHECK)',
      'Decision must be PAY|RETURN|PENDING',
      'Decision timestamp must be <= decision deadline',
      'Amount variance must equal |issue_amount - presentment_amount|',
      'If decision is RETURN, return_reason_code must not be null',
    ],
    
    schema: {
      positive_pay_item_id: "STRING PRIMARY KEY",
      check_serial_number: "STRING",
      account_number: "STRING",
      company_id: "STRING",
      company_name: "STRING COMMENT 'Enriched'",
      
      // Issue Information (Enriched from issue file)
      issue_date: "DATE",
      issue_amount: "DECIMAL(18,2)",
      issued_payee_name: "STRING",
      issued_by_user: "STRING COMMENT 'Enriched'",
      
      // Presentment Information
      presentment_date: "DATE",
      presentment_amount: "DECIMAL(18,2)",
      presented_payee_name: "STRING",
      presenting_bank_routing: "STRING",
      presenting_bank_name: "STRING COMMENT 'Enriched'",
      
      // Exception Analysis (Calculated)
      exception_type: "STRING COMMENT 'AMOUNT_MISMATCH|PAYEE_MISMATCH|DUPLICATE|NOT_ON_FILE|VOID_CHECK'",
      amount_variance: "DECIMAL(18,2) COMMENT 'presentment - issue'",
      amount_variance_abs: "DECIMAL(18,2)",
      amount_variance_pct: "DECIMAL(7,4)",
      payee_name_match_score: "DECIMAL(5,2) COMMENT 'Fuzzy match score (0-100)'",
      
      // Void Check Handling
      void_flag: "BOOLEAN",
      void_date: "DATE",
      void_reason: "STRING",
      
      // Duplicate Detection (Enriched)
      duplicate_presentment_flag: "BOOLEAN",
      original_presentment_id: "STRING COMMENT 'FK to first presentment'",
      duplicate_presentment_count: "INTEGER COMMENT 'Number of times presented'",
      
      // Decision Analytics
      decision: "STRING COMMENT 'PAY|RETURN|PENDING'",
      decision_date: "DATE",
      decision_timestamp: "TIMESTAMP",
      decision_maker: "STRING COMMENT 'AUTO|user_id'",
      decision_reason: "STRING",
      decision_deadline: "TIMESTAMP",
      decision_time_minutes: "INTEGER COMMENT 'Time from presentment to decision'",
      sla_met_flag: "BOOLEAN COMMENT 'Decision made before deadline'",
      
      // Auto-Decision Logic
      auto_decision_flag: "BOOLEAN",
      auto_decision_rule: "STRING COMMENT 'Rule that triggered auto-pay/return'",
      manual_override_flag: "BOOLEAN COMMENT 'Manual override of auto-decision'",
      
      // Customer Decision History (Enriched)
      customer_exception_rate_30d: "DECIMAL(7,4) COMMENT 'Exception rate last 30 days'",
      customer_auto_pay_rate_30d: "DECIMAL(7,4) COMMENT 'Auto-pay rate'",
      customer_return_rate_30d: "DECIMAL(7,4) COMMENT 'Return rate'",
      
      // Fraud Risk (Enriched)
      fraud_risk_score: "DECIMAL(5,2) COMMENT 'Check fraud risk (0-100)'",
      fraud_risk_level: "STRING COMMENT 'LOW|MEDIUM|HIGH'",
      counterfeit_flag: "BOOLEAN COMMENT 'Suspected counterfeit check'",
      
      // Payment/Return Details
      payment_date: "DATE",
      return_reason_code: "STRING",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 7: ACH Positive Pay (Debit Filter) Enriched
  {
    name: 'silver.commercial_ach_positive_pay_enriched',
    description: 'Enriched ACH positive pay debit filter analysis',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per ACH debit filter event',
    primaryKey: ['ach_filter_id'],
    
    transformations: [
      'Match incoming ACH debits to authorized company filter files',
      'Calculate authorization match scores',
      'Enrich with company authorization history',
      'Calculate decision time metrics',
      'Identify unauthorized debit patterns',
      'Enrich with customer authorization preferences',
    ],
    
    dataQualityRules: [
      'Authorization status must be AUTHORIZED|UNAUTHORIZED|PENDING_DECISION|AUTO_APPROVED',
      'If filter match status is NO_MATCH, authorization status should be UNAUTHORIZED',
      'Decision must be ACCEPT|REJECT|RETURN',
      'If return flag is TRUE, return reason code must be R29 (Corporate Customer Advises Not Authorized)',
    ],
    
    schema: {
      ach_filter_id: "STRING PRIMARY KEY",
      ach_transaction_id: "STRING COMMENT 'FK to incoming ACH debit'",
      account_number: "STRING",
      company_id: "STRING",
      company_name: "STRING COMMENT 'Enriched'",
      
      // Incoming Debit Details
      debit_amount: "DECIMAL(18,2)",
      debit_date: "DATE",
      debit_company_id: "STRING COMMENT 'ACH company ID originating debit'",
      debit_company_name: "STRING",
      sec_code: "STRING",
      
      // Authorization Analysis (Enriched)
      authorization_status: "STRING COMMENT 'AUTHORIZED|UNAUTHORIZED|PENDING_DECISION|AUTO_APPROVED'",
      filter_match_status: "STRING COMMENT 'MATCHED|NO_MATCH|PARTIAL_MATCH'",
      filter_match_score: "DECIMAL(5,2) COMMENT 'Match confidence (0-100)'",
      
      // Filter Rules (from authorization file)
      authorized_company_id: "STRING",
      authorized_company_name: "STRING COMMENT 'Enriched'",
      authorized_amount_min: "DECIMAL(18,2)",
      authorized_amount_max: "DECIMAL(18,2)",
      authorized_sec_codes: "JSON COMMENT 'Array of allowed SEC codes'",
      amount_within_range_flag: "BOOLEAN COMMENT 'Calculated'",
      sec_code_authorized_flag: "BOOLEAN COMMENT 'Calculated'",
      
      // Decision
      decision: "STRING COMMENT 'ACCEPT|REJECT|RETURN'",
      decision_timestamp: "TIMESTAMP",
      decision_maker: "STRING COMMENT 'AUTO|user_id'",
      decision_reason: "STRING",
      auto_decision_flag: "BOOLEAN",
      decision_time_minutes: "INTEGER COMMENT 'Time from presentment to decision'",
      
      // Return Information
      return_flag: "BOOLEAN",
      return_reason_code: "STRING DEFAULT 'R29' COMMENT 'Corporate Customer Advises Not Authorized'",
      return_date: "DATE",
      
      // Customer Authorization Patterns (Enriched)
      company_authorization_count: "INTEGER COMMENT 'Number of authorized companies'",
      company_unauthorized_debit_count_30d: "INTEGER COMMENT 'Unauthorized attempts last 30 days'",
      company_auto_accept_rate_30d: "DECIMAL(7,4) COMMENT 'Auto-acceptance rate'",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 8: Payroll File Processing Summary
  {
    name: 'silver.commercial_payroll_file_summary',
    description: 'Aggregated and enriched payroll file processing metrics',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per payroll file',
    primaryKey: ['payroll_file_id'],
    
    transformations: [
      'Aggregate employee-level payroll details to file-level totals',
      'Calculate payroll processing metrics (processing time, error rate)',
      'Enrich with company master data',
      'Validate payroll file totals against employee details',
      'Calculate funding requirements',
      'Identify payroll file anomalies (unusual amounts, employee counts)',
      'Enrich with historical payroll patterns',
    ],
    
    dataQualityRules: [
      'Total credit amount must equal sum of employee net pay',
      'Total employees must match employee detail record count',
      'Funding amount must equal total credit amount',
      'Pay date must be >= file submission date',
      'File status must progress logically (RECEIVED → COMPLETED)',
    ],
    
    schema: {
      payroll_file_id: "STRING PRIMARY KEY",
      company_id: "STRING",
      company_name: "STRING COMMENT 'Enriched'",
      customer_segment: "STRING COMMENT 'Enriched'",
      
      // File Details
      file_name: "STRING",
      file_submission_timestamp: "TIMESTAMP",
      file_format: "STRING",
      total_file_records: "INTEGER",
      
      // Payroll Cycle
      payroll_period_start_date: "DATE",
      payroll_period_end_date: "DATE",
      payroll_period_days: "INTEGER COMMENT 'Calculated'",
      payroll_frequency: "STRING COMMENT 'WEEKLY|BIWEEKLY|SEMIMONTHLY|MONTHLY'",
      pay_date: "DATE",
      
      // Financial Totals (Validated against employee details)
      total_gross_pay: "DECIMAL(18,2) COMMENT 'Sum from employee records'",
      total_tax_withholdings: "DECIMAL(18,2)",
      total_benefit_deductions: "DECIMAL(18,2)",
      total_net_pay: "DECIMAL(18,2)",
      average_net_pay_per_employee: "DECIMAL(10,2) COMMENT 'Calculated'",
      
      // Employee Distribution
      total_employees: "INTEGER",
      direct_deposit_count: "INTEGER",
      direct_deposit_pct: "DECIMAL(5,2) COMMENT 'Calculated'",
      paper_check_count: "INTEGER",
      paycard_count: "INTEGER",
      new_employee_count: "INTEGER COMMENT 'Employees not in previous payroll'",
      terminated_employee_count: "INTEGER COMMENT 'Employees in previous but not current'",
      
      // Processing Metrics
      file_status: "STRING COMMENT 'RECEIVED|VALIDATED|PROCESSING|COMPLETED|FAILED|REJECTED'",
      validation_status: "STRING",
      validation_error_count: "INTEGER COMMENT 'Count of validation errors'",
      validation_errors: "JSON",
      processing_timestamp: "TIMESTAMP",
      completion_timestamp: "TIMESTAMP",
      processing_time_minutes: "INTEGER COMMENT 'Calculated'",
      
      // Funding
      funding_account_number: "STRING",
      funding_amount: "DECIMAL(18,2)",
      funding_date: "DATE",
      funding_status: "STRING COMMENT 'PENDING|FUNDED|INSUFFICIENT_FUNDS'",
      prefunding_flag: "BOOLEAN",
      
      // Delivery
      ach_batch_id: "STRING COMMENT 'Generated ACH batch'",
      ach_transmission_timestamp: "TIMESTAMP",
      check_batch_id: "STRING",
      
      // Historical Comparison (Enriched)
      previous_payroll_total_net_pay: "DECIMAL(18,2) COMMENT 'Prior payroll total'",
      net_pay_variance_pct: "DECIMAL(7,4) COMMENT 'Change from prior payroll'",
      previous_payroll_employee_count: "INTEGER",
      employee_count_variance: "INTEGER COMMENT 'Change from prior payroll'",
      
      // Anomaly Detection
      unusual_amount_flag: "BOOLEAN COMMENT 'Total outside expected range'",
      unusual_employee_count_flag: "BOOLEAN",
      unusual_average_pay_flag: "BOOLEAN",
      
      // Audit
      submitted_by_user_id: "STRING",
      approved_by_user_id: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 9: Bulk Payment Batch Summary
  {
    name: 'silver.commercial_bulk_payment_batch_summary',
    description: 'Aggregated bulk payment batch processing with success/failure analytics',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per bulk payment batch',
    primaryKey: ['bulk_payment_batch_id'],
    
    transformations: [
      'Aggregate payment-level details to batch-level summaries',
      'Calculate success/failure rates',
      'Enrich with payment method distribution',
      'Calculate batch processing time metrics',
      'Identify batch anomalies and validation issues',
      'Enrich with funding status',
    ],
    
    dataQualityRules: [
      'Total batch amount must equal sum of individual payment amounts',
      'Total payment count must match payment detail record count',
      'Successful + failed + pending payments must equal total payment count',
      'Batch status must progress logically',
    ],
    
    schema: {
      bulk_payment_batch_id: "STRING PRIMARY KEY",
      company_id: "STRING",
      company_name: "STRING COMMENT 'Enriched'",
      
      // Batch Classification
      batch_type: "STRING",
      batch_name: "STRING",
      batch_description: "STRING",
      
      // File Details
      file_name: "STRING",
      file_submission_timestamp: "TIMESTAMP",
      total_records: "INTEGER",
      
      // Financial Totals (Validated)
      total_batch_amount: "DECIMAL(18,2)",
      average_payment_amount: "DECIMAL(10,2) COMMENT 'Calculated'",
      median_payment_amount: "DECIMAL(10,2) COMMENT 'Calculated'",
      largest_payment_amount: "DECIMAL(18,2)",
      smallest_payment_amount: "DECIMAL(18,2)",
      
      // Payment Method Distribution (Calculated)
      total_payment_count: "INTEGER",
      ach_payment_count: "INTEGER",
      ach_payment_amount: "DECIMAL(18,2)",
      ach_payment_pct: "DECIMAL(5,2) COMMENT 'Calculated'",
      wire_payment_count: "INTEGER",
      wire_payment_amount: "DECIMAL(18,2)",
      wire_payment_pct: "DECIMAL(5,2)",
      check_payment_count: "INTEGER",
      check_payment_amount: "DECIMAL(18,2)",
      check_payment_pct: "DECIMAL(5,2)",
      
      // Timing
      scheduled_processing_date: "DATE",
      actual_processing_date: "DATE",
      estimated_completion_date: "DATE",
      actual_completion_date: "DATE",
      processing_time_hours: "DECIMAL(8,2) COMMENT 'Calculated'",
      
      // Status & Validation
      batch_status: "STRING",
      validation_status: "STRING",
      validation_error_count: "INTEGER COMMENT 'Count of validation errors'",
      validation_errors: "JSON",
      
      // Approval
      approval_required_flag: "BOOLEAN",
      approval_status: "STRING",
      approved_by_user_id: "STRING",
      approved_timestamp: "TIMESTAMP",
      approval_time_minutes: "INTEGER COMMENT 'Calculated'",
      
      // Funding
      funding_account_number: "STRING",
      funding_amount_required: "DECIMAL(18,2)",
      funding_status: "STRING",
      funding_shortfall_amount: "DECIMAL(18,2) COMMENT 'If insufficient funds'",
      
      // Processing Results (Aggregated)
      successful_payments: "INTEGER",
      successful_payment_amount: "DECIMAL(18,2)",
      success_rate_pct: "DECIMAL(5,2) COMMENT 'Calculated'",
      failed_payments: "INTEGER",
      failed_payment_amount: "DECIMAL(18,2)",
      failure_rate_pct: "DECIMAL(5,2)",
      pending_payments: "INTEGER",
      
      // Audit
      created_by_user_id: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 10: Wire Transfer Compliance Summary
  {
    name: 'silver.commercial_wire_compliance_summary',
    description: 'Wire transfer compliance screening summary with OFAC/sanctions analysis',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per wire transfer with comprehensive compliance assessment',
    primaryKey: ['wire_transaction_id'],
    
    transformations: [
      'Aggregate OFAC, sanctions, and AML screening results',
      'Enrich with country risk ratings',
      'Calculate compliance hold times',
      'Link to sanctioned entity lists',
      'Identify high-risk jurisdictions',
      'Enrich with PEP (Politically Exposed Person) screening',
      'Calculate compliance processing metrics',
    ],
    
    dataQualityRules: [
      'OFAC screening status must be PASSED|FAILED|MANUAL_REVIEW',
      'All international wires must have OFAC screening completed',
      'Wires to high-risk countries must have manual review',
      'If sanctions hit, wire must not be transmitted',
      'Compliance cleared timestamp must be >= wire submission timestamp',
    ],
    
    schema: {
      wire_transaction_id: "STRING PRIMARY KEY",
      wire_type: "STRING COMMENT 'DOMESTIC|INTERNATIONAL'",
      wire_amount: "DECIMAL(18,2)",
      originator_country: "STRING",
      beneficiary_country: "STRING",
      
      // OFAC Screening (Enriched)
      ofac_screening_status: "STRING COMMENT 'PASSED|FAILED|MANUAL_REVIEW'",
      ofac_screening_timestamp: "TIMESTAMP",
      ofac_match_count: "INTEGER COMMENT 'Number of OFAC list matches'",
      ofac_match_score: "DECIMAL(5,2) COMMENT 'Highest match confidence score'",
      ofac_match_details: "JSON COMMENT 'Array of matched SDN list entries'",
      
      // Sanctions Screening (Enriched)
      sanctions_screening_status: "STRING",
      sanctions_hit_flag: "BOOLEAN",
      sanctions_list_matched: "STRING COMMENT 'OFAC SDN|EU Sanctions|UN Sanctions'",
      sanctioned_entity_name: "STRING",
      
      // Country Risk Assessment (Enriched)
      beneficiary_country_risk_rating: "STRING COMMENT 'LOW|MEDIUM|HIGH|PROHIBITED'",
      beneficiary_country_is_sanctioned: "BOOLEAN",
      beneficiary_country_is_high_risk: "BOOLEAN",
      correspondent_bank_country: "STRING",
      correspondent_bank_country_risk: "STRING",
      
      // AML Screening
      aml_screening_status: "STRING",
      aml_risk_score: "DECIMAL(5,2) COMMENT '0-100'",
      aml_risk_level: "STRING COMMENT 'LOW|MEDIUM|HIGH'",
      
      // PEP Screening (Enriched)
      pep_screening_completed_flag: "BOOLEAN",
      pep_match_flag: "BOOLEAN",
      pep_match_details: "JSON COMMENT 'PEP database matches'",
      
      // Adverse Media Screening
      adverse_media_screening_flag: "BOOLEAN",
      adverse_media_hit_flag: "BOOLEAN",
      adverse_media_summary: "STRING",
      
      // Compliance Hold
      compliance_hold_flag: "BOOLEAN",
      compliance_hold_reason: "STRING COMMENT 'OFAC_HIT|SANCTIONS_COUNTRY|PEP_MATCH|HIGH_RISK_COUNTRY|MANUAL_REVIEW'",
      compliance_hold_timestamp: "TIMESTAMP",
      compliance_cleared_timestamp: "TIMESTAMP",
      compliance_hold_duration_hours: "DECIMAL(8,2) COMMENT 'Calculated'",
      
      // Manual Review
      manual_review_required_flag: "BOOLEAN",
      manual_review_assigned_to: "STRING",
      manual_review_completed_flag: "BOOLEAN",
      manual_review_decision: "STRING COMMENT 'APPROVED|REJECTED|ESCALATED'",
      manual_review_notes: "STRING",
      
      // Regulatory Reporting
      ctr_filing_required_flag: "BOOLEAN COMMENT 'Currency Transaction Report (>$10k)'",
      ctr_filed_flag: "BOOLEAN",
      ctr_filing_date: "DATE",
      sar_filing_required_flag: "BOOLEAN COMMENT 'Suspicious Activity Report'",
      sar_filed_flag: "BOOLEAN",
      
      // Wire Status Impact
      wire_status: "STRING COMMENT 'Wire transmission status'",
      wire_blocked_flag: "BOOLEAN COMMENT 'Wire blocked due to compliance'",
      wire_transmission_delay_hours: "DECIMAL(6,2) COMMENT 'Delay due to compliance review'",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 11: Payment Volume Analytics
  {
    name: 'silver.commercial_payment_volume_analytics',
    description: 'Aggregated payment volume metrics by customer, payment type, and time period',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per company per payment type per day',
    primaryKey: ['company_id', 'payment_type', 'business_date'],
    
    transformations: [
      'Aggregate payment transactions by company, type, and date',
      'Calculate daily, weekly, monthly volume metrics',
      'Calculate average transaction amounts',
      'Identify volume trends and anomalies',
      'Calculate velocity metrics',
      'Enrich with prior period comparisons',
    ],
    
    dataQualityRules: [
      'Total transaction count must equal sum of individual transactions',
      'Total amount must equal sum of individual amounts',
      'Business date must be valid business day',
      'Metrics must be >= 0',
    ],
    
    schema: {
      company_id: "STRING PRIMARY KEY",
      company_name: "STRING COMMENT 'Enriched'",
      customer_segment: "STRING COMMENT 'Enriched'",
      payment_type: "STRING PRIMARY KEY COMMENT 'ACH|WIRE|RTP|CHECK|BILL_PAYMENT|PAYROLL'",
      business_date: "DATE PRIMARY KEY",
      
      // Volume Metrics
      transaction_count: "INTEGER COMMENT 'Total transactions for the day'",
      credit_count: "INTEGER",
      debit_count: "INTEGER",
      
      // Amount Metrics
      total_amount: "DECIMAL(18,2)",
      total_credit_amount: "DECIMAL(18,2)",
      total_debit_amount: "DECIMAL(18,2)",
      average_transaction_amount: "DECIMAL(10,2) COMMENT 'Calculated'",
      median_transaction_amount: "DECIMAL(10,2)",
      largest_transaction_amount: "DECIMAL(18,2)",
      
      // Success Metrics
      successful_transactions: "INTEGER",
      failed_transactions: "INTEGER",
      returned_transactions: "INTEGER",
      success_rate_pct: "DECIMAL(5,2) COMMENT 'Calculated'",
      return_rate_pct: "DECIMAL(5,2)",
      
      // Unique Payees
      unique_payee_count: "INTEGER COMMENT 'Distinct payees/receivers'",
      new_payee_count: "INTEGER COMMENT 'First-time payees'",
      
      // Fees
      total_fees: "DECIMAL(10,2)",
      average_fee_per_transaction: "DECIMAL(5,2)",
      
      // Prior Period Comparisons (Enriched)
      prior_day_transaction_count: "INTEGER",
      transaction_count_change_pct: "DECIMAL(7,4) COMMENT 'Day-over-day change'",
      prior_week_avg_transaction_count: "INTEGER",
      prior_month_avg_transaction_count: "INTEGER",
      
      prior_day_total_amount: "DECIMAL(18,2)",
      amount_change_pct: "DECIMAL(7,4)",
      prior_week_avg_amount: "DECIMAL(18,2)",
      
      // Velocity Metrics
      hourly_transaction_rate: "DECIMAL(8,2) COMMENT 'Transactions per hour'",
      peak_hour: "INTEGER COMMENT 'Hour with most transactions (0-23)'",
      peak_hour_transaction_count: "INTEGER",
      
      // Anomaly Flags
      volume_anomaly_flag: "BOOLEAN COMMENT 'Unusual volume detected'",
      amount_anomaly_flag: "BOOLEAN COMMENT 'Unusual amount detected'",
      anomaly_score: "DECIMAL(5,2) COMMENT 'Anomaly detection score (0-100)'",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 12: Payment Exception Summary
  {
    name: 'silver.commercial_payment_exception_summary',
    description: 'Aggregated payment exception metrics with resolution analytics',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per exception queue per day',
    primaryKey: ['queue_name', 'business_date'],
    
    transformations: [
      'Aggregate exceptions by queue, type, and severity',
      'Calculate exception resolution metrics',
      'Calculate SLA compliance rates',
      'Identify exception trends and patterns',
      'Enrich with queue capacity and backlog metrics',
    ],
    
    dataQualityRules: [
      'Total exceptions must equal sum by status',
      'SLA met count + SLA missed count must equal total exceptions',
      'Average time to resolve must be >= 0',
    ],
    
    schema: {
      queue_name: "STRING PRIMARY KEY COMMENT 'FRAUD_REVIEW|COMPLIANCE_REVIEW|OPERATIONS_REVIEW'",
      business_date: "DATE PRIMARY KEY",
      
      // Exception Volume
      total_exceptions: "INTEGER",
      new_exceptions: "INTEGER COMMENT 'Opened today'",
      resolved_exceptions: "INTEGER COMMENT 'Closed today'",
      open_exceptions: "INTEGER COMMENT 'Still open at end of day'",
      backlog_exceptions: "INTEGER COMMENT 'Aging backlog (>3 days old)'",
      
      // Exception by Status
      open_count: "INTEGER",
      under_review_count: "INTEGER",
      resolved_count: "INTEGER",
      escalated_count: "INTEGER",
      
      // Exception by Severity
      critical_count: "INTEGER",
      high_count: "INTEGER",
      medium_count: "INTEGER",
      low_count: "INTEGER",
      
      // Exception by Type
      validation_failure_count: "INTEGER",
      compliance_hold_count: "INTEGER",
      fraud_alert_count: "INTEGER",
      insufficient_funds_count: "INTEGER",
      limit_exceeded_count: "INTEGER",
      
      // Resolution Metrics
      average_time_to_resolve_minutes: "DECIMAL(10,2)",
      median_time_to_resolve_minutes: "DECIMAL(10,2)",
      longest_resolution_time_minutes: "INTEGER",
      
      // SLA Compliance
      sla_met_count: "INTEGER",
      sla_missed_count: "INTEGER",
      sla_compliance_rate_pct: "DECIMAL(5,2) COMMENT 'Calculated'",
      
      // Financial Impact
      total_exception_amount: "DECIMAL(18,2) COMMENT 'Total $ value of exceptions'",
      average_exception_amount: "DECIMAL(10,2)",
      
      // Staffing Metrics
      assigned_exceptions: "INTEGER",
      unassigned_exceptions: "INTEGER",
      unique_reviewers: "INTEGER COMMENT 'Number of staff who worked exceptions'",
      average_exceptions_per_reviewer: "DECIMAL(6,2)",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 13: Lockbox Processing Summary
  {
    name: 'silver.commercial_lockbox_processing_summary',
    description: 'Aggregated lockbox receipt processing metrics',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per lockbox per day',
    primaryKey: ['lockbox_id', 'processing_date'],
    
    transformations: [
      'Aggregate lockbox receipts by lockbox and date',
      'Calculate processing efficiency metrics (OCR success rate)',
      'Calculate deposit turnaround time',
      'Identify processing exceptions',
      'Enrich with customer master data',
    ],
    
    dataQualityRules: [
      'Total receipts must equal sum of payment methods',
      'Total amount must equal sum of individual receipts',
      'OCR extraction rate must be between 0 and 1',
    ],
    
    schema: {
      lockbox_id: "STRING PRIMARY KEY",
      company_id: "STRING COMMENT 'Customer using lockbox'",
      company_name: "STRING COMMENT 'Enriched'",
      processing_date: "DATE PRIMARY KEY",
      
      // Receipt Volume
      total_receipts: "INTEGER",
      check_receipts: "INTEGER",
      money_order_receipts: "INTEGER",
      cash_receipts: "INTEGER",
      
      // Amount Totals
      total_amount: "DECIMAL(18,2)",
      average_receipt_amount: "DECIMAL(10,2)",
      largest_receipt_amount: "DECIMAL(18,2)",
      
      // Processing Efficiency
      ocr_extraction_success_count: "INTEGER",
      ocr_extraction_success_rate: "DECIMAL(5,2) COMMENT 'Success rate %'",
      manual_keying_required_count: "INTEGER",
      manual_keying_rate: "DECIMAL(5,2)",
      average_ocr_confidence_score: "DECIMAL(5,2)",
      
      // Processing Status
      processed_receipts: "INTEGER",
      exception_receipts: "INTEGER",
      exception_rate_pct: "DECIMAL(5,2)",
      
      // Turnaround Time
      average_receipt_to_deposit_hours: "DECIMAL(6,2)",
      average_deposit_to_delivery_hours: "DECIMAL(6,2)",
      same_day_processing_count: "INTEGER",
      same_day_processing_rate: "DECIMAL(5,2)",
      
      // Exception Types
      unreadable_count: "INTEGER",
      missing_invoice_count: "INTEGER",
      amount_mismatch_count: "INTEGER",
      
      // Fees
      total_lockbox_fees: "DECIMAL(10,2)",
      average_fee_per_receipt: "DECIMAL(5,2)",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 14: Payment Gateway Performance
  {
    name: 'silver.commercial_payment_gateway_performance',
    description: 'Payment gateway API performance and reliability metrics',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per merchant per day',
    primaryKey: ['merchant_id', 'business_date'],
    
    transformations: [
      'Aggregate gateway API transactions by merchant and date',
      'Calculate API performance metrics (response time, success rate)',
      'Calculate settlement metrics',
      'Identify gateway performance issues',
      'Calculate fraud rates',
    ],
    
    dataQualityRules: [
      'Total transactions must equal sum by status',
      'Success rate must be between 0 and 1',
      'Average response time must be > 0',
    ],
    
    schema: {
      merchant_id: "STRING PRIMARY KEY",
      merchant_name: "STRING COMMENT 'Enriched'",
      business_date: "DATE PRIMARY KEY",
      
      // Transaction Volume
      total_transactions: "INTEGER",
      payment_count: "INTEGER",
      refund_count: "INTEGER",
      authorization_count: "INTEGER",
      void_count: "INTEGER",
      
      // Transaction Status
      successful_transactions: "INTEGER",
      failed_transactions: "INTEGER",
      declined_transactions: "INTEGER",
      success_rate_pct: "DECIMAL(5,2)",
      decline_rate_pct: "DECIMAL(5,2)",
      
      // Amount Metrics
      total_payment_amount: "DECIMAL(18,2)",
      total_refund_amount: "DECIMAL(18,2)",
      net_settlement_amount: "DECIMAL(18,2) COMMENT 'Payments - Refunds - Fees'",
      average_transaction_amount: "DECIMAL(10,2)",
      
      // API Performance Metrics
      average_response_time_ms: "DECIMAL(8,2)",
      p50_response_time_ms: "INTEGER COMMENT '50th percentile'",
      p95_response_time_ms: "INTEGER COMMENT '95th percentile'",
      p99_response_time_ms: "INTEGER COMMENT '99th percentile'",
      max_response_time_ms: "INTEGER",
      slow_transaction_count: "INTEGER COMMENT 'Response time > 3000ms'",
      slow_transaction_rate_pct: "DECIMAL(5,2)",
      
      // API Errors
      http_error_count: "INTEGER",
      http_500_count: "INTEGER COMMENT 'Server errors'",
      http_400_count: "INTEGER COMMENT 'Client errors'",
      timeout_count: "INTEGER",
      error_rate_pct: "DECIMAL(5,2)",
      
      // Fraud Metrics
      total_fraud_score_avg: "DECIMAL(5,2)",
      high_risk_transaction_count: "INTEGER",
      high_risk_rate_pct: "DECIMAL(5,2)",
      
      // Fees
      total_gateway_fees: "DECIMAL(10,2)",
      total_interchange_fees: "DECIMAL(10,2)",
      total_fees: "DECIMAL(10,2)",
      average_fee_per_transaction: "DECIMAL(5,2)",
      
      // Settlement
      settled_transaction_count: "INTEGER",
      pending_settlement_count: "INTEGER",
      settlement_rate_pct: "DECIMAL(5,2)",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 15: SWIFT Message Analytics
  {
    name: 'silver.commercial_swift_message_analytics',
    description: 'SWIFT message processing analytics with GPI tracking',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per SWIFT message',
    primaryKey: ['swift_message_id'],
    
    transformations: [
      'Parse SWIFT MT and MX messages into structured fields',
      'Enrich with SWIFT BIC information (bank name, country)',
      'Calculate message processing times',
      'Track SWIFT gpi end-to-end status',
      'Identify message exceptions and repairs',
      'Enrich with correspondent bank data',
    ],
    
    dataQualityRules: [
      'Message type must be valid (MT103, MT202, etc.)',
      'Sender and receiver BIC must be 8 or 11 characters',
      'Transaction amount must be > 0',
      'Value date must be valid',
      'If message direction is OUTBOUND, acknowledgement timestamp must not be null',
    ],
    
    schema: {
      swift_message_id: "STRING PRIMARY KEY",
      
      // Message Classification
      message_type: "STRING",
      message_category: "STRING COMMENT 'PAYMENT|CONFIRMATION|STATEMENT|FREE_FORMAT'",
      message_direction: "STRING COMMENT 'INBOUND|OUTBOUND'",
      
      // SWIFT References
      sender_reference: "STRING",
      related_reference: "STRING",
      uetr: "STRING COMMENT 'Unique End-to-end Transaction Reference'",
      
      // Sender & Receiver (Enriched)
      sender_bic: "STRING",
      sender_bank_name: "STRING COMMENT 'Enriched from BIC master'",
      sender_country: "STRING COMMENT 'Enriched'",
      receiver_bic: "STRING",
      receiver_bank_name: "STRING COMMENT 'Enriched'",
      receiver_country: "STRING COMMENT 'Enriched'",
      
      // Transaction Details
      transaction_amount: "DECIMAL(18,2)",
      transaction_currency: "STRING",
      value_date: "DATE",
      
      // Message Timing
      message_timestamp: "TIMESTAMP",
      acknowledgement_timestamp: "TIMESTAMP",
      settlement_timestamp: "TIMESTAMP",
      message_to_settlement_hours: "DECIMAL(6,2) COMMENT 'Calculated'",
      
      // SWIFT gpi Tracking (Enriched)
      gpi_enabled_flag: "BOOLEAN",
      gpi_tracker_status: "STRING COMMENT 'SENT|IN_TRANSIT|SETTLED|RETURNED'",
      gpi_unique_id: "STRING",
      gpi_hop_count: "INTEGER COMMENT 'Number of intermediary banks'",
      gpi_stop_and_recall_flag: "BOOLEAN",
      
      // Message Status
      message_status: "STRING COMMENT 'SENT|RECEIVED|ACKNOWLEDGED|SETTLED|REJECTED|RETURNED'",
      final_status_timestamp: "TIMESTAMP",
      
      // Beneficiary & Ordering Customer
      ordering_customer: "STRING",
      beneficiary_customer: "STRING",
      beneficiary_account: "STRING COMMENT 'IBAN or account number'",
      
      // Intermediary Banks (Enriched)
      intermediary_bank_count: "INTEGER COMMENT 'Count of intermediary banks'",
      intermediary_bank_bic_1: "STRING",
      intermediary_bank_name_1: "STRING COMMENT 'Enriched'",
      intermediary_bank_bic_2: "STRING",
      intermediary_bank_name_2: "STRING COMMENT 'Enriched'",
      
      // Payment Details
      remittance_info: "STRING",
      details_of_charges: "STRING COMMENT 'OUR|BEN|SHA'",
      regulatory_reporting: "STRING",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 16: Controlled Disbursement Daily Summary
  {
    name: 'silver.commercial_controlled_disbursement_summary',
    description: 'Daily controlled disbursement account summaries with funding analytics',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per controlled disbursement account per day',
    primaryKey: ['account_number', 'business_date'],
    
    transformations: [
      'Aggregate daily presentments and returns',
      'Calculate funding requirements',
      'Calculate notification timing metrics',
      'Identify funding shortfalls',
      'Enrich with historical presentment patterns',
    ],
    
    dataQualityRules: [
      'Net disbursement amount must equal presentment amount - return amount',
      'Funding required must equal net disbursement amount',
      'Notification time must be before presentment cutoff',
      'Business date must be valid business day',
    ],
    
    schema: {
      account_number: "STRING PRIMARY KEY",
      company_id: "STRING",
      company_name: "STRING COMMENT 'Enriched'",
      business_date: "DATE PRIMARY KEY",
      
      // Presentment Totals
      total_presentment_amount: "DECIMAL(18,2)",
      total_presentment_count: "INTEGER",
      average_check_amount: "DECIMAL(10,2)",
      largest_check_amount: "DECIMAL(18,2)",
      
      // Return Totals
      total_return_amount: "DECIMAL(18,2)",
      total_return_count: "INTEGER",
      return_rate_pct: "DECIMAL(5,2)",
      
      // Net Disbursement
      net_disbursement_amount: "DECIMAL(18,2) COMMENT 'Presentment - Returns'",
      
      // Notification
      notification_time: "TIME",
      notification_method: "STRING",
      early_presentment_amount: "DECIMAL(18,2) COMMENT 'Before early cutoff'",
      late_presentment_amount: "DECIMAL(18,2) COMMENT 'After early cutoff'",
      
      // Funding
      funding_required: "DECIMAL(18,2)",
      funding_source_account: "STRING",
      funding_transfer_timestamp: "TIMESTAMP",
      funding_status: "STRING COMMENT 'FUNDED|INSUFFICIENT_FUNDS|PENDING'",
      funding_shortfall_amount: "DECIMAL(18,2)",
      
      // Account Balances
      opening_balance: "DECIMAL(18,2)",
      closing_balance: "DECIMAL(18,2)",
      target_balance: "DECIMAL(18,2)",
      
      // Historical Comparison (Enriched)
      prior_day_presentment_amount: "DECIMAL(18,2)",
      presentment_variance_pct: "DECIMAL(7,4)",
      avg_presentment_last_30d: "DECIMAL(18,2)",
      
      // Fees
      controlled_disbursement_fee: "DECIMAL(10,2)",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 17: ZBA Sweep Analytics
  {
    name: 'silver.commercial_zba_sweep_analytics',
    description: 'Zero Balance Account sweep analytics and master account liquidity',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per ZBA sweep transaction',
    primaryKey: ['zba_sweep_id'],
    
    transformations: [
      'Calculate sweep efficiency metrics',
      'Aggregate sweeps by master account',
      'Calculate subsidiary account balance trends',
      'Identify sweep timing patterns',
      'Enrich with account relationships',
    ],
    
    dataQualityRules: [
      'Sweep type must be TO_MASTER or FROM_MASTER',
      'If true ZBA, subsidiary closing balance should be $0.00',
      'Sweep amount must be > 0',
      'Master account balance must be updated after sweep',
    ],
    
    schema: {
      zba_sweep_id: "STRING PRIMARY KEY",
      business_date: "DATE",
      
      // Account Relationships (Enriched)
      subsidiary_account_number: "STRING",
      master_account_number: "STRING",
      company_id: "STRING",
      company_name: "STRING COMMENT 'Enriched'",
      zba_structure_name: "STRING COMMENT 'Name of ZBA structure (e.g., Operations ZBA)'",
      
      // Sweep Details
      sweep_type: "STRING COMMENT 'TO_MASTER|FROM_MASTER'",
      sweep_trigger: "STRING COMMENT 'END_OF_DAY|THRESHOLD|ON_DEMAND'",
      sweep_amount: "DECIMAL(18,2)",
      
      // Subsidiary Account Balances
      subsidiary_opening_balance: "DECIMAL(18,2)",
      subsidiary_closing_balance: "DECIMAL(18,2) COMMENT 'Should be $0.00 for true ZBA'",
      subsidiary_variance_from_target: "DECIMAL(18,2) COMMENT 'Difference from $0 target'",
      
      // Master Account Impact
      master_opening_balance: "DECIMAL(18,2)",
      master_closing_balance: "DECIMAL(18,2)",
      master_balance_change: "DECIMAL(18,2)",
      
      // Timing
      sweep_timestamp: "TIMESTAMP",
      effective_date: "DATE",
      sweep_processing_time_seconds: "INTEGER COMMENT 'Time to complete sweep'",
      
      // Configuration
      target_balance: "DECIMAL(18,2) DEFAULT 0.00",
      threshold_amount: "DECIMAL(18,2)",
      
      // Audit
      sweep_transaction_id: "STRING COMMENT 'Internal transfer transaction ID'",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 18: Payment Limit Breach Analysis
  {
    name: 'silver.commercial_payment_limit_breach_analysis',
    description: 'Payment limit breach detection and analysis',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per limit breach event',
    primaryKey: ['limit_breach_id'],
    
    transformations: [
      'Match payment transactions to configured limits',
      'Identify limit breaches (amount, count, velocity)',
      'Calculate breach severity',
      'Enrich with override/approval details',
      'Aggregate breach patterns by customer',
    ],
    
    dataQualityRules: [
      'Breach type must be AMOUNT|COUNT|VELOCITY',
      'Limit breached amount must be > configured limit',
      'If override approved, override approver must not be null',
    ],
    
    schema: {
      limit_breach_id: "STRING PRIMARY KEY COMMENT 'Generated breach event ID'",
      
      // Payment Transaction
      transaction_id: "STRING COMMENT 'FK to payment transaction'",
      transaction_type: "STRING COMMENT 'ACH|WIRE|RTP|CHECK'",
      transaction_amount: "DECIMAL(18,2)",
      transaction_timestamp: "TIMESTAMP",
      
      // Account & Customer
      company_id: "STRING",
      company_name: "STRING COMMENT 'Enriched'",
      account_number: "STRING",
      user_id: "STRING COMMENT 'User who initiated payment'",
      
      // Limit Configuration
      limit_id: "STRING COMMENT 'FK to payment limit master'",
      limit_type: "STRING COMMENT 'TRANSACTION|DAILY|WEEKLY|MONTHLY'",
      limit_scope: "STRING COMMENT 'ACCOUNT|USER|PAYMENT_TYPE|PAYEE'",
      
      // Breach Details
      breach_type: "STRING COMMENT 'AMOUNT|COUNT|VELOCITY|TIME_RESTRICTION|GEOGRAPHIC'",
      breach_severity: "STRING COMMENT 'CRITICAL|HIGH|MEDIUM|LOW'",
      breach_timestamp: "TIMESTAMP",
      
      // Limit Thresholds & Breach Amounts
      configured_limit: "DECIMAL(18,2) COMMENT 'Configured limit amount'",
      current_usage: "DECIMAL(18,2) COMMENT 'Current cumulative amount/count'",
      breach_amount: "DECIMAL(18,2) COMMENT 'Amount over limit'",
      breach_pct: "DECIMAL(7,4) COMMENT 'Percentage over limit'",
      
      // Count-Based Breaches
      configured_count_limit: "INTEGER",
      current_transaction_count: "INTEGER",
      
      // Velocity Breaches
      velocity_window_minutes: "INTEGER",
      transactions_in_window: "INTEGER",
      velocity_limit: "INTEGER",
      
      // Action Taken
      transaction_blocked_flag: "BOOLEAN",
      override_allowed_flag: "BOOLEAN",
      override_requested_flag: "BOOLEAN",
      override_approved_flag: "BOOLEAN",
      override_approver_user_id: "STRING",
      override_approval_timestamp: "TIMESTAMP",
      override_reason: "STRING",
      
      // Customer Breach History (Enriched)
      customer_breach_count_30d: "INTEGER COMMENT 'Breaches in last 30 days'",
      customer_override_approval_rate: "DECIMAL(5,2) COMMENT 'Historical approval rate'",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },
];

export const paymentsCommercialSilverLayer = {
  name: 'Payments-Commercial Silver Layer',
  totalTables: paymentsCommercialSilverTables.length,
  tables: paymentsCommercialSilverTables,
};
