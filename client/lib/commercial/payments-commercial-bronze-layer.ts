/**
 * PAYMENTS-COMMERCIAL BRONZE LAYER
 * Raw data layer for commercial payments and treasury services
 * 
 * Domain: Payments-Commercial
 * Area: Commercial Banking
 * Layer: BRONZE (Raw/Landing Zone)
 * Tables: 25
 * 
 * Coverage:
 * - ACH Origination & Settlement
 * - Wire Transfers (Domestic & International)
 * - Real-Time Payments (RTP)
 * - Check Processing & Positive Pay
 * - Bill Payment Services
 * - Payroll Services
 * - Bulk Payment Processing
 * - Payment Fraud Prevention
 * - Treasury Workstation Integration
 */

export const paymentsCommercialBronzeTables = [
  // Table 1: ACH Origination Master
  {
    name: 'bronze.commercial_ach_originations',
    description: 'ACH origination transactions including credits and debits for commercial customers',
    sourceSystem: 'FIS_ACH_TRACKER',
    sourceTable: 'ACH_ORIGINATION_MASTER',
    loadType: 'STREAMING',
    
    grain: 'One row per ACH origination transaction',
    primaryKey: ['ach_transaction_id', 'source_system'],
    
    schema: {
      // Primary Identifiers
      ach_transaction_id: "STRING PRIMARY KEY COMMENT 'Unique ACH transaction identifier'",
      source_system: "STRING PRIMARY KEY COMMENT 'FIS_ACH_TRACKER|TREASURY_WORKSTATION|ONLINE_BANKING'",
      company_id: "STRING COMMENT 'Company identification number (10-digit)'",
      batch_id: "STRING COMMENT 'ACH batch header ID'",
      trace_number: "STRING COMMENT 'ACH trace number (15 digits)'",
      
      // Transaction Classification
      transaction_type: "STRING COMMENT 'CREDIT|DEBIT'",
      sec_code: "STRING COMMENT 'CCD|CTP|CTX|PPD|WEB|TEL|POP|ARC|BOC|RCK'",
      transaction_code: "STRING COMMENT '22|23|27|28|32|33|37|38 (NACHA transaction codes)'",
      service_class: "STRING COMMENT '200 (Mixed)|220 (Credits)|225 (Debits)'",
      
      // Amount Details
      transaction_amount: "DECIMAL(18,2) COMMENT 'Transaction amount in USD'",
      transaction_currency: "STRING DEFAULT 'USD'",
      fee_amount: "DECIMAL(10,2) COMMENT 'Processing fee charged'",
      
      // Originator Information
      originator_name: "STRING COMMENT 'Company/entity originating ACH'",
      originator_account_number: "STRING COMMENT 'Originator DDA account'",
      originator_routing_number: "STRING COMMENT '9-digit ABA routing number'",
      originator_account_type: "STRING COMMENT 'CHECKING|SAVINGS|GL'",
      originating_dfi_id: "STRING COMMENT 'ODFI identification'",
      
      // Receiver Information
      receiver_name: "STRING COMMENT 'Individual or company receiving ACH'",
      receiver_account_number: "STRING COMMENT 'Receiver account number'",
      receiver_routing_number: "STRING COMMENT '9-digit ABA routing number'",
      receiver_account_type: "STRING COMMENT 'CHECKING|SAVINGS'",
      receiver_id_number: "STRING COMMENT 'Receiver identification number'",
      receiving_dfi_id: "STRING COMMENT 'RDFI identification'",
      
      // Timing
      submission_date: "DATE COMMENT 'Date submitted to bank'",
      submission_timestamp: "TIMESTAMP COMMENT 'Exact submission time'",
      effective_entry_date: "DATE COMMENT 'Date transaction should settle'",
      settlement_date: "DATE COMMENT 'Actual settlement date'",
      
      // Same-Day ACH
      same_day_ach_flag: "BOOLEAN COMMENT 'Same-day ACH indicator'",
      same_day_processing_window: "STRING COMMENT 'MORNING|AFTERNOON|EVENING'",
      expedited_processing_flag: "BOOLEAN",
      
      // Status & Lifecycle
      transaction_status: "STRING COMMENT 'SUBMITTED|VALIDATED|BATCHED|TRANSMITTED|SETTLED|RETURNED|REVERSED'",
      validation_status: "STRING COMMENT 'PASSED|FAILED|WARNING'",
      validation_errors: "JSON COMMENT 'Array of validation error messages'",
      prenote_flag: "BOOLEAN COMMENT 'Zero-dollar prenote transaction'",
      
      // Business Context
      payment_purpose: "STRING COMMENT 'PAYROLL|VENDOR_PAYMENT|CUSTOMER_REFUND|TAX_PAYMENT|BENEFIT_PAYMENT'",
      company_entry_description: "STRING COMMENT 'Company batch description (10 chars)'",
      company_discretionary_data: "STRING COMMENT 'Optional company data'",
      invoice_number: "STRING",
      purchase_order_number: "STRING",
      customer_reference: "STRING",
      internal_memo: "STRING",
      
      // Addenda Records
      addenda_flag: "BOOLEAN COMMENT 'Addenda record present'",
      addenda_count: "INTEGER COMMENT 'Number of addenda records'",
      addenda_type: "STRING COMMENT '05 (Standard)|98 (Notification)|99 (Return)'",
      addenda_information: "STRING COMMENT 'Free-form addenda text'",
      
      // File/Batch Context
      nacha_file_id: "STRING COMMENT 'NACHA file identification'",
      file_creation_date: "DATE",
      file_creation_time: "TIME",
      batch_number: "INTEGER COMMENT 'Batch number within file'",
      entry_detail_sequence: "INTEGER COMMENT 'Entry sequence within batch'",
      
      // Reversal Information
      reversal_flag: "BOOLEAN",
      reversal_reason: "STRING",
      reversal_timestamp: "TIMESTAMP",
      original_trace_number: "STRING COMMENT 'Original transaction trace number'",
      
      // Offset Entry
      offset_account_number: "STRING COMMENT 'Offset/suspense account'",
      offset_routing_number: "STRING",
      balanced_offset_flag: "BOOLEAN COMMENT 'Auto-balanced offset entry'",
      
      // International ACH (IAT)
      iat_flag: "BOOLEAN COMMENT 'International ACH Transaction'",
      foreign_exchange_indicator: "STRING COMMENT 'FV (Variable)|FF (Fixed)'",
      foreign_exchange_rate: "DECIMAL(10,6)",
      destination_country_code: "STRING COMMENT 'ISO 3166 country code'",
      
      // Audit & Control
      created_by_user_id: "STRING",
      created_timestamp: "TIMESTAMP",
      approved_by_user_id: "STRING",
      approved_timestamp: "TIMESTAMP",
      dual_approval_flag: "BOOLEAN",
      
      // Source System Metadata
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING COMMENT 'INSERT|UPDATE|DELETE'",
      record_hash: "STRING COMMENT 'SHA-256 hash for change detection'",
    },
  },

  // Table 2: ACH Returns & Exceptions
  {
    name: 'bronze.commercial_ach_returns',
    description: 'ACH return transactions with reason codes and return details',
    sourceSystem: 'FIS_ACH_TRACKER',
    sourceTable: 'ACH_RETURN_LOG',
    loadType: 'STREAMING',
    
    grain: 'One row per ACH return',
    primaryKey: ['return_id'],
    
    schema: {
      return_id: "STRING PRIMARY KEY COMMENT 'Unique return identifier'",
      original_ach_transaction_id: "STRING COMMENT 'FK to original ACH transaction'",
      original_trace_number: "STRING COMMENT 'Trace number of returned transaction'",
      
      // Return Classification
      return_reason_code: "STRING COMMENT 'R01-R99 NACHA return reason code'",
      return_reason_description: "STRING",
      return_type: "STRING COMMENT 'CUSTOMER|ADMINISTRATIVE|BANK'",
      return_severity: "STRING COMMENT 'CRITICAL|HIGH|MEDIUM|LOW'",
      contested_return_flag: "BOOLEAN",
      
      // Return Details
      return_amount: "DECIMAL(18,2)",
      return_date: "DATE",
      return_timestamp: "TIMESTAMP",
      return_settlement_date: "DATE",
      return_trace_number: "STRING COMMENT 'Return entry trace number'",
      
      // Original Transaction Info
      original_company_id: "STRING",
      original_company_name: "STRING",
      original_entry_date: "DATE",
      original_settlement_date: "DATE",
      original_amount: "DECIMAL(18,2)",
      original_sec_code: "STRING",
      
      // Dishonored Return (R61)
      dishonored_return_flag: "BOOLEAN",
      dishonored_return_reason_code: "STRING",
      
      // Return Action
      automatic_resubmit_flag: "BOOLEAN",
      resubmit_count: "INTEGER DEFAULT 0",
      resubmit_date: "DATE",
      manual_review_required_flag: "BOOLEAN",
      customer_notification_sent_flag: "BOOLEAN",
      
      // Financial Impact
      fee_assessed: "DECIMAL(10,2) COMMENT 'Return fee charged to customer'",
      gl_posting_date: "DATE",
      gl_account_number: "STRING",
      
      // Addenda
      return_addenda: "STRING COMMENT 'Return addenda information'",
      
      // Audit
      recorded_by: "STRING",
      recorded_timestamp: "TIMESTAMP",
      source_system: "STRING DEFAULT 'FIS_ACH_TRACKER'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 3: ACH NOC (Notification of Change)
  {
    name: 'bronze.commercial_ach_noc',
    description: 'ACH Notification of Change records for account/routing corrections',
    sourceSystem: 'FIS_ACH_TRACKER',
    sourceTable: 'ACH_NOC_LOG',
    loadType: 'STREAMING',
    
    grain: 'One row per NOC received',
    primaryKey: ['noc_id'],
    
    schema: {
      noc_id: "STRING PRIMARY KEY",
      original_ach_transaction_id: "STRING COMMENT 'FK to original ACH transaction'",
      original_trace_number: "STRING",
      
      // NOC Classification
      noc_code: "STRING COMMENT 'C01-C13 NACHA NOC code'",
      noc_description: "STRING",
      noc_received_date: "DATE",
      noc_received_timestamp: "TIMESTAMP",
      
      // Changed Information
      change_field: "STRING COMMENT 'ROUTING_NUMBER|ACCOUNT_NUMBER|ACCOUNT_TYPE|NAME'",
      original_value: "STRING COMMENT 'Original incorrect value'",
      corrected_value: "STRING COMMENT 'Corrected value from RDFI'",
      
      // Original Transaction Context
      original_company_id: "STRING",
      original_receiver_name: "STRING",
      original_account_number: "STRING",
      original_routing_number: "STRING",
      
      // NOC Processing
      auto_update_flag: "BOOLEAN COMMENT 'Automatically update customer record'",
      update_applied_flag: "BOOLEAN",
      update_applied_date: "DATE",
      update_applied_by: "STRING",
      manual_review_flag: "BOOLEAN",
      
      // Customer Communication
      customer_notified_flag: "BOOLEAN",
      customer_notification_date: "DATE",
      customer_consent_flag: "BOOLEAN",
      
      // Audit
      source_system: "STRING DEFAULT 'FIS_ACH_TRACKER'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 4: Wire Transfer Originations
  {
    name: 'bronze.commercial_wire_originations',
    description: 'Domestic and international wire transfer originations',
    sourceSystem: 'TREASURY_WORKSTATION',
    sourceTable: 'WIRE_ORIGINATION_LOG',
    loadType: 'STREAMING',
    
    grain: 'One row per wire transfer',
    primaryKey: ['wire_transaction_id'],
    
    schema: {
      // Primary Identifiers
      wire_transaction_id: "STRING PRIMARY KEY COMMENT 'Unique wire transfer ID'",
      imad: "STRING COMMENT 'Input Message Accountability Data (Fedwire)'",
      omad: "STRING COMMENT 'Output Message Accountability Data'",
      
      // Wire Type
      wire_type: "STRING COMMENT 'DOMESTIC|INTERNATIONAL'",
      wire_network: "STRING COMMENT 'FEDWIRE|SWIFT|CHIPS'",
      wire_priority: "STRING COMMENT 'NORMAL|URGENT|SAME_DAY'",
      repetitive_wire_flag: "BOOLEAN COMMENT 'Template-based repetitive wire'",
      template_id: "STRING",
      
      // Amount
      wire_amount: "DECIMAL(18,2)",
      wire_currency: "STRING DEFAULT 'USD'",
      foreign_exchange_flag: "BOOLEAN",
      fx_rate: "DECIMAL(12,6)",
      settlement_amount: "DECIMAL(18,2)",
      settlement_currency: "STRING",
      
      // Originator Information
      originator_name: "STRING",
      originator_account_number: "STRING",
      originator_routing_number: "STRING COMMENT '9-digit ABA for domestic'",
      originator_address: "STRING",
      originator_city: "STRING",
      originator_state: "STRING",
      originator_country: "STRING",
      originator_reference: "STRING",
      
      // Beneficiary Information
      beneficiary_name: "STRING",
      beneficiary_account_number: "STRING COMMENT 'IBAN for international'",
      beneficiary_bank_name: "STRING",
      beneficiary_bank_routing: "STRING COMMENT 'ABA|SWIFT BIC'",
      beneficiary_bank_address: "STRING",
      beneficiary_bank_city: "STRING",
      beneficiary_bank_country: "STRING",
      beneficiary_address: "STRING",
      beneficiary_city: "STRING",
      beneficiary_state: "STRING",
      beneficiary_country: "STRING",
      
      // Intermediary Bank (for international)
      intermediary_bank_name: "STRING",
      intermediary_bank_swift_bic: "STRING",
      intermediary_bank_routing: "STRING",
      intermediary_bank_account: "STRING",
      
      // SWIFT-Specific Fields
      swift_message_type: "STRING COMMENT 'MT103|MT202|MT103+|MT202COV'",
      swift_reference: "STRING COMMENT 'SWIFT transaction reference'",
      uetr: "STRING COMMENT 'Unique End-to-end Transaction Reference (ISO 20022)'",
      
      // Payment Purpose & Details
      payment_purpose: "STRING COMMENT 'VENDOR_PAYMENT|PAYROLL|LOAN_PAYMENT|INVESTMENT|TRADE_SETTLEMENT'",
      payment_details: "STRING COMMENT 'Free-form payment description'",
      invoice_number: "STRING",
      beneficiary_reference: "STRING",
      regulatory_reporting_code: "STRING COMMENT 'For international wires'",
      
      // Timing
      submission_date: "DATE",
      submission_timestamp: "TIMESTAMP",
      value_date: "DATE COMMENT 'Value/settlement date'",
      execution_timestamp: "TIMESTAMP",
      settlement_timestamp: "TIMESTAMP",
      
      // Status
      wire_status: "STRING COMMENT 'PENDING_APPROVAL|APPROVED|TRANSMITTED|SETTLED|REJECTED|RECALLED|RETURNED'",
      transmission_status: "STRING COMMENT 'SENT|ACKNOWLEDGED|CONFIRMED|FAILED'",
      
      // Approval Workflow
      created_by_user_id: "STRING",
      created_timestamp: "TIMESTAMP",
      approved_by_user_id: "STRING",
      approved_timestamp: "TIMESTAMP",
      dual_approval_required_flag: "BOOLEAN",
      second_approver_user_id: "STRING",
      second_approval_timestamp: "TIMESTAMP",
      
      // Fees & Charges
      originator_fee: "DECIMAL(10,2) COMMENT 'Fee charged to originator'",
      correspondent_fee: "DECIMAL(10,2) COMMENT 'Correspondent bank fee'",
      beneficiary_fee: "DECIMAL(10,2) COMMENT 'Fee charged to beneficiary'",
      fee_allocation: "STRING COMMENT 'OUR|BEN|SHA (who pays fees)'",
      
      // Compliance & Screening
      ofac_screening_status: "STRING COMMENT 'PASSED|FAILED|MANUAL_REVIEW'",
      ofac_screening_timestamp: "TIMESTAMP",
      aml_screening_status: "STRING COMMENT 'PASSED|FAILED|MANUAL_REVIEW'",
      sanctions_hit_flag: "BOOLEAN",
      compliance_notes: "STRING",
      
      // Recall/Return
      recall_flag: "BOOLEAN",
      recall_reason: "STRING",
      recall_timestamp: "TIMESTAMP",
      return_flag: "BOOLEAN",
      return_reason: "STRING",
      
      // Audit
      source_system: "STRING DEFAULT 'TREASURY_WORKSTATION'",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      record_hash: "STRING",
    },
  },

  // Table 5: Real-Time Payments (RTP)
  {
    name: 'bronze.commercial_rtp_transactions',
    description: 'Real-Time Payments Network transactions (instant payments)',
    sourceSystem: 'RTP_GATEWAY',
    sourceTable: 'RTP_TRANSACTION_LOG',
    loadType: 'STREAMING',
    
    grain: 'One row per RTP transaction',
    primaryKey: ['rtp_transaction_id'],
    
    schema: {
      rtp_transaction_id: "STRING PRIMARY KEY COMMENT 'Unique RTP transaction ID'",
      clearing_system_reference: "STRING COMMENT 'TCH RTP network reference'",
      end_to_end_id: "STRING COMMENT 'ISO 20022 end-to-end ID'",
      
      // Transaction Type
      message_type: "STRING COMMENT 'pacs.008 (Credit Transfer)|pain.013 (Request for Payment)|pain.014 (RFP Response)'",
      transaction_purpose: "STRING COMMENT 'PAYMENT|REQUEST_FOR_PAYMENT'",
      request_for_payment_flag: "BOOLEAN",
      
      // Amount
      transaction_amount: "DECIMAL(18,2) COMMENT 'Maximum $1M per transaction'",
      transaction_currency: "STRING DEFAULT 'USD'",
      
      // Debtor (Payer) Information
      debtor_name: "STRING",
      debtor_account_number: "STRING",
      debtor_routing_number: "STRING",
      debtor_account_type: "STRING COMMENT 'CHECKING|SAVINGS'",
      debtor_reference: "STRING",
      
      // Creditor (Payee) Information
      creditor_name: "STRING",
      creditor_account_number: "STRING",
      creditor_routing_number: "STRING",
      creditor_account_type: "STRING",
      creditor_reference: "STRING",
      
      // Remittance Information
      remittance_information: "STRING COMMENT 'Structured or unstructured payment details'",
      remittance_type: "STRING COMMENT 'STRUCTURED|UNSTRUCTURED'",
      invoice_number: "STRING",
      
      // Timing (Real-Time Processing)
      initiation_timestamp: "TIMESTAMP COMMENT 'When payment initiated'",
      clearing_timestamp: "TIMESTAMP COMMENT 'TCH RTP clearing time'",
      settlement_timestamp: "TIMESTAMP COMMENT 'Final settlement (typically <15 seconds)'",
      response_time_ms: "INTEGER COMMENT 'Response time in milliseconds'",
      
      // Status
      payment_status: "STRING COMMENT 'INITIATED|ACCEPTED|SETTLED|REJECTED|RETURNED'",
      status_reason_code: "STRING",
      status_reason_description: "STRING",
      
      // Request for Payment (RFP)
      rfp_id: "STRING COMMENT 'Request for Payment ID if applicable'",
      rfp_expiration_timestamp: "TIMESTAMP",
      rfp_response: "STRING COMMENT 'ACCEPT|DECLINE|PARTIAL'",
      rfp_response_timestamp: "TIMESTAMP",
      
      // Return/Reject
      return_flag: "BOOLEAN",
      return_reason_code: "STRING",
      return_timestamp: "TIMESTAMP",
      
      // Fees
      rtp_network_fee: "DECIMAL(5,2) COMMENT 'TCH RTP network fee'",
      bank_processing_fee: "DECIMAL(5,2)",
      
      // Fraud & Risk
      fraud_score: "DECIMAL(5,2) COMMENT 'Real-time fraud score (0-100)'",
      fraud_risk_level: "STRING COMMENT 'LOW|MEDIUM|HIGH'",
      velocity_check_flag: "BOOLEAN",
      velocity_check_result: "STRING COMMENT 'PASS|FAIL'",
      
      // ISO 20022 Metadata
      iso20022_message_id: "STRING",
      iso20022_creation_datetime: "TIMESTAMP",
      instruction_priority: "STRING COMMENT 'HIGH|NORMAL'",
      
      // Audit
      source_system: "STRING DEFAULT 'RTP_GATEWAY'",
      load_timestamp: "TIMESTAMP",
      record_hash: "STRING",
    },
  },

  // Table 6: Check Positive Pay Items
  {
    name: 'bronze.commercial_positive_pay_items',
    description: 'Check positive pay issued items and exception items',
    sourceSystem: 'POSITIVE_PAY_SYSTEM',
    sourceTable: 'POSITIVE_PAY_MASTER',
    loadType: 'BATCH',
    
    grain: 'One row per check issued or presented',
    primaryKey: ['positive_pay_item_id'],
    
    schema: {
      positive_pay_item_id: "STRING PRIMARY KEY",
      check_serial_number: "STRING COMMENT 'Check number from issue file'",
      account_number: "STRING COMMENT 'Account check drawn on'",
      
      // Item Type
      item_type: "STRING COMMENT 'ISSUED|PRESENTED|EXCEPTION'",
      item_status: "STRING COMMENT 'MATCHED|UNMATCHED|PENDING_DECISION|PAID|RETURNED'",
      
      // Issue Information
      issue_date: "DATE COMMENT 'Date check issued'",
      issue_amount: "DECIMAL(18,2)",
      payee_name: "STRING COMMENT 'Payee name from issue file'",
      
      // Presentment Information
      presentment_date: "DATE",
      presentment_amount: "DECIMAL(18,2)",
      presented_payee_name: "STRING",
      presenting_bank_routing: "STRING",
      
      // Exception Details
      exception_flag: "BOOLEAN",
      exception_type: "STRING COMMENT 'AMOUNT_MISMATCH|PAYEE_MISMATCH|DUPLICATE|NOT_ON_FILE|VOID_CHECK'",
      amount_variance: "DECIMAL(18,2) COMMENT 'Difference between issued and presented'",
      
      // Decision
      decision: "STRING COMMENT 'PAY|RETURN|PENDING'",
      decision_date: "DATE",
      decision_timestamp: "TIMESTAMP",
      decision_maker: "STRING COMMENT 'AUTO|user_id'",
      decision_reason: "STRING",
      decision_deadline: "TIMESTAMP COMMENT 'When decision must be made'",
      
      // Payment Details
      payment_date: "DATE",
      return_reason_code: "STRING",
      
      // Void Information
      void_flag: "BOOLEAN",
      void_date: "DATE",
      void_reason: "STRING",
      
      // Audit
      source_system: "STRING DEFAULT 'POSITIVE_PAY_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 7: ACH Positive Pay (Debit Filter)
  {
    name: 'bronze.commercial_ach_positive_pay',
    description: 'ACH positive pay for debit filtering and authorization',
    sourceSystem: 'ACH_POSITIVE_PAY',
    sourceTable: 'ACH_FILTER_LOG',
    loadType: 'STREAMING',
    
    grain: 'One row per ACH debit presented for authorization',
    primaryKey: ['ach_filter_id'],
    
    schema: {
      ach_filter_id: "STRING PRIMARY KEY",
      ach_transaction_id: "STRING COMMENT 'Incoming ACH debit transaction ID'",
      account_number: "STRING",
      
      // Debit Details
      debit_amount: "DECIMAL(18,2)",
      debit_date: "DATE",
      company_id: "STRING COMMENT 'ACH company ID originating debit'",
      company_name: "STRING",
      sec_code: "STRING",
      
      // Authorization Status
      authorization_status: "STRING COMMENT 'AUTHORIZED|UNAUTHORIZED|PENDING_DECISION|AUTO_APPROVED'",
      filter_match_status: "STRING COMMENT 'MATCHED|NO_MATCH|PARTIAL_MATCH'",
      
      // Filter Rules
      authorized_company_id: "STRING COMMENT 'Pre-authorized company ID from filter file'",
      authorized_amount_min: "DECIMAL(18,2)",
      authorized_amount_max: "DECIMAL(18,2)",
      authorized_sec_codes: "JSON COMMENT 'Array of allowed SEC codes'",
      
      // Decision
      decision: "STRING COMMENT 'ACCEPT|REJECT|RETURN'",
      decision_timestamp: "TIMESTAMP",
      decision_maker: "STRING",
      decision_reason: "STRING",
      auto_decision_flag: "BOOLEAN",
      
      // Return Information
      return_flag: "BOOLEAN",
      return_reason_code: "STRING COMMENT 'R29 (Corporate Customer Advises Not Authorized)'",
      return_date: "DATE",
      
      // Audit
      source_system: "STRING DEFAULT 'ACH_POSITIVE_PAY'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 8: Bill Payment Transactions
  {
    name: 'bronze.commercial_bill_payments',
    description: 'Commercial bill payment transactions (electronic and check)',
    sourceSystem: 'BILL_PAY_PLATFORM',
    sourceTable: 'BILL_PAYMENT_TRANSACTIONS',
    loadType: 'BATCH',
    
    grain: 'One row per bill payment',
    primaryKey: ['bill_payment_id'],
    
    schema: {
      bill_payment_id: "STRING PRIMARY KEY",
      customer_account_number: "STRING",
      company_id: "STRING",
      
      // Payment Type
      payment_method: "STRING COMMENT 'ACH|CHECK|WIRE|RTP'",
      payment_category: "STRING COMMENT 'UTILITY|VENDOR|TAX|LEASE|INSURANCE|PAYROLL'",
      recurring_payment_flag: "BOOLEAN",
      recurring_payment_schedule_id: "STRING",
      
      // Amount & Timing
      payment_amount: "DECIMAL(18,2)",
      payment_currency: "STRING DEFAULT 'USD'",
      scheduled_payment_date: "DATE",
      actual_payment_date: "DATE",
      
      // Payee Information
      payee_name: "STRING",
      payee_account_number: "STRING",
      payee_address: "STRING",
      payee_city: "STRING",
      payee_state: "STRING",
      payee_zip: "STRING",
      
      // Bill Details
      invoice_number: "STRING",
      invoice_date: "DATE",
      invoice_amount: "DECIMAL(18,2)",
      discount_amount: "DECIMAL(18,2)",
      net_payment_amount: "DECIMAL(18,2)",
      
      // Payment Delivery
      delivery_method: "STRING COMMENT 'ELECTRONIC|CHECK_MAIL|EXPEDITED_CHECK|OVERNIGHT'",
      check_number: "STRING",
      tracking_number: "STRING COMMENT 'For mailed checks'",
      estimated_delivery_date: "DATE",
      actual_delivery_date: "DATE",
      
      // Status
      payment_status: "STRING COMMENT 'SCHEDULED|PROCESSING|SENT|DELIVERED|RETURNED|CANCELLED'",
      cancellation_flag: "BOOLEAN",
      cancellation_reason: "STRING",
      cancellation_timestamp: "TIMESTAMP",
      
      // Fees
      payment_processing_fee: "DECIMAL(5,2)",
      expedited_delivery_fee: "DECIMAL(10,2)",
      
      // Audit
      created_by_user_id: "STRING",
      created_timestamp: "TIMESTAMP",
      source_system: "STRING DEFAULT 'BILL_PAY_PLATFORM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 9: Payroll File Processing
  {
    name: 'bronze.commercial_payroll_files',
    description: 'Payroll file processing for commercial customers',
    sourceSystem: 'PAYROLL_PROCESSING',
    sourceTable: 'PAYROLL_FILE_MASTER',
    loadType: 'BATCH',
    
    grain: 'One row per payroll file submitted',
    primaryKey: ['payroll_file_id'],
    
    schema: {
      payroll_file_id: "STRING PRIMARY KEY",
      company_id: "STRING",
      company_name: "STRING",
      
      // File Details
      file_name: "STRING",
      file_submission_timestamp: "TIMESTAMP",
      file_format: "STRING COMMENT 'NACHA|CSV|EXCEL|API'",
      total_file_records: "INTEGER",
      
      // Payroll Cycle
      payroll_period_start_date: "DATE",
      payroll_period_end_date: "DATE",
      payroll_frequency: "STRING COMMENT 'WEEKLY|BIWEEKLY|SEMIMONTHLY|MONTHLY'",
      pay_date: "DATE COMMENT 'Employee pay date'",
      
      // Financial Totals
      total_credit_amount: "DECIMAL(18,2) COMMENT 'Total employee payments'",
      total_debit_amount: "DECIMAL(18,2) COMMENT 'Total employer debits'",
      total_tax_withholdings: "DECIMAL(18,2)",
      total_benefit_deductions: "DECIMAL(18,2)",
      net_payroll_amount: "DECIMAL(18,2)",
      
      // Employee Counts
      total_employees: "INTEGER",
      direct_deposit_count: "INTEGER",
      paper_check_count: "INTEGER",
      paycard_count: "INTEGER",
      
      // Processing Status
      file_status: "STRING COMMENT 'RECEIVED|VALIDATED|PROCESSING|COMPLETED|FAILED|REJECTED'",
      validation_status: "STRING COMMENT 'PASSED|FAILED|WARNINGS'",
      validation_errors: "JSON COMMENT 'Array of validation errors'",
      processing_timestamp: "TIMESTAMP",
      completion_timestamp: "TIMESTAMP",
      
      // Funding
      funding_account_number: "STRING",
      funding_amount: "DECIMAL(18,2)",
      funding_date: "DATE",
      prefunding_flag: "BOOLEAN",
      
      // Delivery
      ach_batch_id: "STRING COMMENT 'ACH batch generated from payroll file'",
      check_batch_id: "STRING",
      
      // Tax Filing
      tax_filing_required_flag: "BOOLEAN",
      tax_filing_status: "STRING COMMENT 'PENDING|FILED|FAILED'",
      
      // Audit
      submitted_by_user_id: "STRING",
      approved_by_user_id: "STRING",
      source_system: "STRING DEFAULT 'PAYROLL_PROCESSING'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 10: Payroll Employees
  {
    name: 'bronze.commercial_payroll_employees',
    description: 'Individual employee payroll records within payroll files',
    sourceSystem: 'PAYROLL_PROCESSING',
    sourceTable: 'PAYROLL_EMPLOYEE_DETAIL',
    loadType: 'BATCH',
    
    grain: 'One row per employee per payroll cycle',
    primaryKey: ['payroll_employee_record_id'],
    
    schema: {
      payroll_employee_record_id: "STRING PRIMARY KEY",
      payroll_file_id: "STRING COMMENT 'FK to payroll file'",
      company_id: "STRING",
      
      // Employee Information
      employee_id: "STRING COMMENT 'Company employee ID'",
      employee_name: "STRING",
      employee_ssn_last_4: "STRING COMMENT 'Last 4 digits of SSN'",
      
      // Payment Method
      payment_method: "STRING COMMENT 'DIRECT_DEPOSIT|PAPER_CHECK|PAYCARD'",
      account_number: "STRING COMMENT 'Employee bank account'",
      routing_number: "STRING",
      account_type: "STRING COMMENT 'CHECKING|SAVINGS'",
      
      // Earnings
      gross_pay: "DECIMAL(10,2)",
      regular_hours: "DECIMAL(6,2)",
      regular_pay: "DECIMAL(10,2)",
      overtime_hours: "DECIMAL(6,2)",
      overtime_pay: "DECIMAL(10,2)",
      bonus_amount: "DECIMAL(10,2)",
      commission_amount: "DECIMAL(10,2)",
      other_earnings: "DECIMAL(10,2)",
      
      // Deductions
      federal_tax_withheld: "DECIMAL(10,2)",
      state_tax_withheld: "DECIMAL(10,2)",
      fica_tax: "DECIMAL(10,2)",
      medicare_tax: "DECIMAL(10,2)",
      health_insurance_deduction: "DECIMAL(10,2)",
      retirement_401k_deduction: "DECIMAL(10,2)",
      other_deductions: "DECIMAL(10,2)",
      total_deductions: "DECIMAL(10,2)",
      
      // Net Pay
      net_pay: "DECIMAL(10,2)",
      
      // Payment Status
      payment_status: "STRING COMMENT 'PENDING|SENT|RETURNED|STOPPED'",
      payment_date: "DATE",
      ach_trace_number: "STRING",
      check_number: "STRING",
      
      // Prenote (for new accounts)
      prenote_flag: "BOOLEAN COMMENT 'Zero-dollar prenote for account validation'",
      prenote_status: "STRING COMMENT 'SENT|VALIDATED|FAILED'",
      
      // Audit
      source_system: "STRING DEFAULT 'PAYROLL_PROCESSING'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 11: Bulk Payment Batches
  {
    name: 'bronze.commercial_bulk_payment_batches',
    description: 'Bulk payment batch files (mass payments, vendor payments, distributions)',
    sourceSystem: 'BULK_PAYMENT_PLATFORM',
    sourceTable: 'BULK_PAYMENT_BATCHES',
    loadType: 'BATCH',
    
    grain: 'One row per bulk payment batch',
    primaryKey: ['bulk_payment_batch_id'],
    
    schema: {
      bulk_payment_batch_id: "STRING PRIMARY KEY",
      company_id: "STRING",
      company_name: "STRING",
      
      // Batch Classification
      batch_type: "STRING COMMENT 'VENDOR_PAYMENTS|CUSTOMER_REFUNDS|DISTRIBUTIONS|REBATES|COMMISSIONS'",
      batch_name: "STRING",
      batch_description: "STRING",
      
      // File Details
      file_name: "STRING",
      file_format: "STRING COMMENT 'CSV|EXCEL|XML|JSON|NACHA'",
      file_submission_timestamp: "TIMESTAMP",
      total_records: "INTEGER",
      
      // Financial Totals
      total_batch_amount: "DECIMAL(18,2)",
      total_payment_count: "INTEGER",
      average_payment_amount: "DECIMAL(10,2)",
      
      // Payment Methods
      ach_payment_count: "INTEGER",
      ach_payment_amount: "DECIMAL(18,2)",
      wire_payment_count: "INTEGER",
      wire_payment_amount: "DECIMAL(18,2)",
      check_payment_count: "INTEGER",
      check_payment_amount: "DECIMAL(18,2)",
      
      // Timing
      scheduled_processing_date: "DATE",
      actual_processing_date: "DATE",
      estimated_completion_date: "DATE",
      actual_completion_date: "DATE",
      
      // Status
      batch_status: "STRING COMMENT 'RECEIVED|VALIDATED|APPROVED|PROCESSING|COMPLETED|FAILED|CANCELLED'",
      validation_status: "STRING COMMENT 'PASSED|FAILED|WARNINGS'",
      validation_errors: "JSON",
      
      // Approval
      approval_required_flag: "BOOLEAN",
      approval_status: "STRING COMMENT 'PENDING|APPROVED|REJECTED'",
      approved_by_user_id: "STRING",
      approved_timestamp: "TIMESTAMP",
      
      // Funding
      funding_account_number: "STRING",
      funding_amount_required: "DECIMAL(18,2)",
      funding_status: "STRING COMMENT 'PENDING|FUNDED|INSUFFICIENT_FUNDS'",
      
      // Processing Results
      successful_payments: "INTEGER",
      failed_payments: "INTEGER",
      pending_payments: "INTEGER",
      
      // Audit
      created_by_user_id: "STRING",
      created_timestamp: "TIMESTAMP",
      source_system: "STRING DEFAULT 'BULK_PAYMENT_PLATFORM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 12: Bulk Payment Details
  {
    name: 'bronze.commercial_bulk_payment_details',
    description: 'Individual payment records within bulk payment batches',
    sourceSystem: 'BULK_PAYMENT_PLATFORM',
    sourceTable: 'BULK_PAYMENT_DETAILS',
    loadType: 'BATCH',
    
    grain: 'One row per payment within a bulk batch',
    primaryKey: ['bulk_payment_detail_id'],
    
    schema: {
      bulk_payment_detail_id: "STRING PRIMARY KEY",
      bulk_payment_batch_id: "STRING COMMENT 'FK to bulk payment batch'",
      line_number: "INTEGER COMMENT 'Line number in original file'",
      
      // Payment Method
      payment_method: "STRING COMMENT 'ACH|WIRE|CHECK|RTP'",
      
      // Amount
      payment_amount: "DECIMAL(18,2)",
      payment_currency: "STRING DEFAULT 'USD'",
      
      // Payee Information
      payee_name: "STRING",
      payee_account_number: "STRING",
      payee_routing_number: "STRING",
      payee_bank_name: "STRING",
      payee_address: "STRING",
      payee_email: "STRING",
      
      // Payment Details
      invoice_number: "STRING",
      reference_number: "STRING",
      payment_memo: "STRING",
      
      // Payment Execution
      execution_date: "DATE",
      transaction_id: "STRING COMMENT 'FK to actual payment transaction (ACH, wire, etc.)'",
      confirmation_number: "STRING",
      
      // Status
      payment_status: "STRING COMMENT 'PENDING|SENT|SETTLED|FAILED|RETURNED|CANCELLED'",
      failure_reason: "STRING",
      return_reason_code: "STRING",
      
      // Delivery (for checks)
      check_number: "STRING",
      delivery_method: "STRING COMMENT 'STANDARD_MAIL|EXPEDITED|OVERNIGHT'",
      tracking_number: "STRING",
      
      // Validation
      validation_status: "STRING COMMENT 'VALID|INVALID'",
      validation_errors: "JSON",
      
      // Fees
      payment_fee: "DECIMAL(5,2)",
      
      // Audit
      source_system: "STRING DEFAULT 'BULK_PAYMENT_PLATFORM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 13: Wire Transfer Receipts
  {
    name: 'bronze.commercial_wire_receipts',
    description: 'Incoming wire transfer receipts to commercial accounts',
    sourceSystem: 'WIRE_PROCESSING',
    sourceTable: 'WIRE_RECEIPT_LOG',
    loadType: 'STREAMING',
    
    grain: 'One row per incoming wire transfer',
    primaryKey: ['wire_receipt_id'],
    
    schema: {
      wire_receipt_id: "STRING PRIMARY KEY",
      imad: "STRING COMMENT 'Input Message Accountability Data'",
      omad: "STRING COMMENT 'Output Message Accountability Data'",
      
      // Wire Type
      wire_type: "STRING COMMENT 'DOMESTIC|INTERNATIONAL'",
      wire_network: "STRING COMMENT 'FEDWIRE|SWIFT|CHIPS'",
      
      // Amount
      wire_amount: "DECIMAL(18,2)",
      wire_currency: "STRING",
      settlement_amount: "DECIMAL(18,2)",
      settlement_currency: "STRING DEFAULT 'USD'",
      fx_rate: "DECIMAL(12,6)",
      
      // Beneficiary (Receiving Customer)
      beneficiary_account_number: "STRING",
      beneficiary_name: "STRING",
      beneficiary_bank_routing: "STRING",
      
      // Originator Information
      originator_name: "STRING",
      originator_account_number: "STRING",
      originator_bank_name: "STRING",
      originator_bank_routing: "STRING COMMENT 'ABA|SWIFT BIC'",
      originator_address: "STRING",
      originator_country: "STRING",
      
      // Payment Details
      payment_details: "STRING",
      originator_to_beneficiary_info: "STRING",
      reference_number: "STRING",
      
      // SWIFT Fields
      swift_message_type: "STRING",
      swift_reference: "STRING",
      
      // Timing
      receipt_date: "DATE",
      receipt_timestamp: "TIMESTAMP",
      value_date: "DATE",
      posting_date: "DATE",
      
      // Status
      wire_status: "STRING COMMENT 'RECEIVED|PENDING_REVIEW|POSTED|RETURNED|REJECTED'",
      hold_flag: "BOOLEAN COMMENT 'Wire on hold pending review'",
      hold_reason: "STRING",
      hold_released_timestamp: "TIMESTAMP",
      
      // Compliance Screening
      ofac_screening_status: "STRING COMMENT 'PASSED|FAILED|MANUAL_REVIEW'",
      sanctions_hit_flag: "BOOLEAN",
      aml_screening_status: "STRING",
      compliance_review_required_flag: "BOOLEAN",
      compliance_cleared_timestamp: "TIMESTAMP",
      
      // Fees
      incoming_wire_fee: "DECIMAL(10,2)",
      
      // Audit
      source_system: "STRING DEFAULT 'WIRE_PROCESSING'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 14: Payment Fraud Alerts
  {
    name: 'bronze.commercial_payment_fraud_alerts',
    description: 'Fraud detection alerts for payment transactions',
    sourceSystem: 'FRAUD_DETECTION_SYSTEM',
    sourceTable: 'FRAUD_ALERT_LOG',
    loadType: 'STREAMING',
    
    grain: 'One row per fraud alert',
    primaryKey: ['fraud_alert_id'],
    
    schema: {
      fraud_alert_id: "STRING PRIMARY KEY",
      
      // Associated Transaction
      transaction_id: "STRING COMMENT 'FK to payment transaction'",
      transaction_type: "STRING COMMENT 'ACH|WIRE|RTP|CHECK|BILL_PAYMENT'",
      transaction_amount: "DECIMAL(18,2)",
      transaction_timestamp: "TIMESTAMP",
      
      // Account Information
      account_number: "STRING",
      company_id: "STRING",
      
      // Alert Classification
      alert_type: "STRING COMMENT 'ACCOUNT_TAKEOVER|NEW_PAYEE|VELOCITY|AMOUNT_ANOMALY|LOCATION_ANOMALY|BEHAVIOR_CHANGE'",
      alert_severity: "STRING COMMENT 'CRITICAL|HIGH|MEDIUM|LOW'",
      fraud_score: "DECIMAL(5,2) COMMENT 'Fraud risk score (0-100)'",
      
      // Alert Details
      alert_timestamp: "TIMESTAMP",
      alert_description: "STRING",
      triggered_rules: "JSON COMMENT 'Array of fraud rules triggered'",
      
      // Risk Factors
      velocity_check_flag: "BOOLEAN COMMENT 'Transaction velocity exceeded'",
      new_payee_flag: "BOOLEAN COMMENT 'Payment to new/unknown payee'",
      large_amount_flag: "BOOLEAN COMMENT 'Amount exceeds threshold'",
      unusual_time_flag: "BOOLEAN COMMENT 'Transaction at unusual time'",
      geolocation_mismatch_flag: "BOOLEAN COMMENT 'Unusual geographic location'",
      device_fingerprint_mismatch_flag: "BOOLEAN",
      
      // Machine Learning Model
      ml_model_name: "STRING COMMENT 'Machine learning model used'",
      ml_model_version: "STRING",
      ml_confidence_score: "DECIMAL(5,2)",
      
      // Alert Status
      alert_status: "STRING COMMENT 'OPEN|UNDER_REVIEW|CONFIRMED_FRAUD|FALSE_POSITIVE|RESOLVED'",
      resolution_timestamp: "TIMESTAMP",
      resolution_notes: "STRING",
      resolved_by_user_id: "STRING",
      
      // Actions Taken
      transaction_blocked_flag: "BOOLEAN",
      account_frozen_flag: "BOOLEAN",
      customer_notified_flag: "BOOLEAN",
      customer_notification_timestamp: "TIMESTAMP",
      
      // Investigation
      assigned_to_user_id: "STRING",
      investigation_notes: "STRING",
      sar_filed_flag: "BOOLEAN COMMENT 'Suspicious Activity Report filed'",
      sar_filing_date: "DATE",
      
      // Audit
      source_system: "STRING DEFAULT 'FRAUD_DETECTION_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 15: Check Image Deposits
  {
    name: 'bronze.commercial_check_image_deposits',
    description: 'Remote deposit capture (RDC) and check image processing',
    sourceSystem: 'RDC_PLATFORM',
    sourceTable: 'CHECK_IMAGE_DEPOSIT_LOG',
    loadType: 'STREAMING',
    
    grain: 'One row per check image deposited',
    primaryKey: ['check_image_id'],
    
    schema: {
      check_image_id: "STRING PRIMARY KEY",
      deposit_batch_id: "STRING",
      
      // Account Information
      deposit_account_number: "STRING",
      company_id: "STRING",
      
      // Check Details
      check_number: "STRING",
      check_amount: "DECIMAL(18,2)",
      check_date: "DATE",
      payor_name: "STRING",
      payor_account_number: "STRING COMMENT 'Extracted via MICR'",
      payor_routing_number: "STRING COMMENT 'Extracted via MICR'",
      
      // Image Details
      front_image_url: "STRING COMMENT 'S3/blob storage URL for front image'",
      back_image_url: "STRING COMMENT 'S3/blob storage URL for back image'",
      image_format: "STRING COMMENT 'TIFF|PNG|JPEG'",
      image_resolution_dpi: "INTEGER DEFAULT 200",
      image_file_size_kb: "INTEGER",
      
      // Deposit Details
      deposit_timestamp: "TIMESTAMP",
      deposit_date: "DATE",
      deposit_channel: "STRING COMMENT 'BRANCH_SCANNER|REMOTE_DEPOSIT|ATM|MOBILE_APP'",
      deposit_location: "STRING",
      
      // Image Quality & Validation
      image_quality_score: "DECIMAL(5,2) COMMENT 'Image usability score (0-100)'",
      micr_read_status: "STRING COMMENT 'SUCCESS|FAILURE|MANUAL_REVIEW'",
      micr_confidence_score: "DECIMAL(5,2)",
      amount_verification_status: "STRING COMMENT 'MATCHED|MISMATCH|MANUAL_REVIEW'",
      
      // Endorsement
      endorsement_verified_flag: "BOOLEAN",
      restrictive_endorsement_flag: "BOOLEAN COMMENT 'For Deposit Only'",
      
      // Processing Status
      check_status: "STRING COMMENT 'RECEIVED|VALIDATED|CLEARING|CLEARED|RETURNED|REJECTED'",
      forward_presentment_date: "DATE COMMENT 'Date presented to payor bank'",
      settlement_date: "DATE",
      
      // Return Information
      return_flag: "BOOLEAN",
      return_reason: "STRING",
      return_date: "DATE",
      
      // Duplicate Detection
      duplicate_check_flag: "BOOLEAN",
      duplicate_check_id: "STRING COMMENT 'FK to original check deposit'",
      
      // Funds Availability
      funds_available_date: "DATE COMMENT 'Reg CC availability'",
      hold_amount: "DECIMAL(18,2)",
      hold_release_date: "DATE",
      
      // Fraud Detection
      fraud_score: "DECIMAL(5,2)",
      fraud_hold_flag: "BOOLEAN",
      
      // Device/Scanner Information
      scanner_serial_number: "STRING",
      scanner_model: "STRING",
      depositor_user_id: "STRING",
      depositor_ip_address: "STRING",
      
      // Audit
      source_system: "STRING DEFAULT 'RDC_PLATFORM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 16: Lockbox Processing
  {
    name: 'bronze.commercial_lockbox_receipts',
    description: 'Lockbox payment receipts and processing details',
    sourceSystem: 'LOCKBOX_PROCESSING',
    sourceTable: 'LOCKBOX_RECEIPT_LOG',
    loadType: 'BATCH',
    
    grain: 'One row per lockbox payment received',
    primaryKey: ['lockbox_receipt_id'],
    
    schema: {
      lockbox_receipt_id: "STRING PRIMARY KEY",
      lockbox_id: "STRING COMMENT 'Lockbox number assigned to customer'",
      batch_id: "STRING COMMENT 'Lockbox batch ID'",
      
      // Customer Information
      company_id: "STRING COMMENT 'Customer using lockbox service'",
      deposit_account_number: "STRING",
      
      // Payment Details
      payment_amount: "DECIMAL(18,2)",
      payment_method: "STRING COMMENT 'CHECK|MONEY_ORDER|CASH'",
      check_number: "STRING",
      payor_name: "STRING",
      payor_account_number: "STRING",
      payor_routing_number: "STRING",
      
      // Receipt Details
      receipt_date: "DATE COMMENT 'Date payment received at lockbox'",
      processing_date: "DATE",
      deposit_date: "DATE",
      
      // Invoice/Remittance Information
      invoice_number: "STRING COMMENT 'Extracted from remittance coupon'",
      customer_account_number: "STRING COMMENT 'Payor customer account number'",
      remittance_data: "JSON COMMENT 'Structured remittance information'",
      
      // Image Capture
      envelope_image_url: "STRING",
      check_front_image_url: "STRING",
      check_back_image_url: "STRING",
      remittance_document_image_url: "STRING",
      
      // Data Extraction
      ocr_extraction_status: "STRING COMMENT 'SUCCESS|PARTIAL|FAILED|MANUAL_KEYING'",
      ocr_confidence_score: "DECIMAL(5,2)",
      manual_keying_required_flag: "BOOLEAN",
      
      // Processing Status
      processing_status: "STRING COMMENT 'RECEIVED|SCANNED|EXTRACTED|DEPOSITED|DELIVERED|EXCEPTION'",
      exception_flag: "BOOLEAN",
      exception_type: "STRING COMMENT 'UNREADABLE|MISSING_INVOICE|AMOUNT_MISMATCH'",
      exception_notes: "STRING",
      
      // Delivery to Customer
      delivery_method: "STRING COMMENT 'EDI|FILE_TRANSFER|API|PORTAL'",
      delivery_timestamp: "TIMESTAMP",
      
      // Fees
      lockbox_processing_fee: "DECIMAL(5,2)",
      
      // Audit
      processed_by_user_id: "STRING",
      source_system: "STRING DEFAULT 'LOCKBOX_PROCESSING'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 17: Payment Gateway Transactions
  {
    name: 'bronze.commercial_payment_gateway_txns',
    description: 'Payment gateway API transactions for integrated payment processing',
    sourceSystem: 'PAYMENT_GATEWAY_API',
    sourceTable: 'GATEWAY_TRANSACTION_LOG',
    loadType: 'STREAMING',
    
    grain: 'One row per payment gateway API transaction',
    primaryKey: ['gateway_transaction_id'],
    
    schema: {
      gateway_transaction_id: "STRING PRIMARY KEY COMMENT 'Gateway unique transaction ID'",
      merchant_transaction_id: "STRING COMMENT 'Merchant-provided reference'",
      
      // Merchant Information
      merchant_id: "STRING",
      merchant_name: "STRING",
      merchant_account_number: "STRING",
      
      // Transaction Type
      transaction_type: "STRING COMMENT 'PAYMENT|REFUND|AUTHORIZATION|CAPTURE|VOID'",
      payment_method: "STRING COMMENT 'ACH|CARD|WALLET|BANK_TRANSFER'",
      
      // Amount
      transaction_amount: "DECIMAL(18,2)",
      transaction_currency: "STRING DEFAULT 'USD'",
      
      // Customer Information
      customer_id: "STRING COMMENT 'Merchant customer ID'",
      customer_email: "STRING",
      customer_ip_address: "STRING",
      
      // Payment Details
      payment_token: "STRING COMMENT 'Tokenized payment method'",
      bank_account_last_4: "STRING",
      routing_number: "STRING",
      
      // API Request/Response
      api_endpoint: "STRING",
      api_method: "STRING COMMENT 'POST|GET|PUT|DELETE'",
      api_version: "STRING",
      request_timestamp: "TIMESTAMP",
      response_timestamp: "TIMESTAMP",
      response_time_ms: "INTEGER",
      http_status_code: "INTEGER",
      
      // Transaction Status
      transaction_status: "STRING COMMENT 'PENDING|AUTHORIZED|CAPTURED|SETTLED|FAILED|DECLINED|VOIDED'",
      status_reason: "STRING",
      error_code: "STRING",
      error_message: "STRING",
      
      // Settlement
      settlement_date: "DATE",
      settlement_batch_id: "STRING",
      
      // Fees
      gateway_fee: "DECIMAL(10,2)",
      interchange_fee: "DECIMAL(10,2)",
      net_settlement_amount: "DECIMAL(18,2)",
      
      // Risk & Fraud
      fraud_score: "DECIMAL(5,2)",
      risk_level: "STRING COMMENT 'LOW|MEDIUM|HIGH'",
      avs_result: "STRING COMMENT 'Address Verification Service result'",
      
      // Webhook/Callback
      webhook_sent_flag: "BOOLEAN",
      webhook_url: "STRING",
      webhook_response_code: "INTEGER",
      
      // Audit
      source_system: "STRING DEFAULT 'PAYMENT_GATEWAY_API'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 18: Controlled Disbursement Accounts
  {
    name: 'bronze.commercial_controlled_disbursement',
    description: 'Controlled disbursement account daily presentment details',
    sourceSystem: 'CONTROLLED_DISBURSEMENT_SYSTEM',
    sourceTable: 'CONTROLLED_DISBURSEMENT_LOG',
    loadType: 'BATCH',
    
    grain: 'One row per controlled disbursement account per day',
    primaryKey: ['account_number', 'business_date'],
    
    schema: {
      account_number: "STRING PRIMARY KEY COMMENT 'Controlled disbursement account'",
      business_date: "DATE PRIMARY KEY",
      company_id: "STRING",
      
      // Daily Presentment Totals
      total_presentment_amount: "DECIMAL(18,2) COMMENT 'Total checks presented today'",
      total_presentment_count: "INTEGER",
      total_return_amount: "DECIMAL(18,2)",
      total_return_count: "INTEGER",
      net_disbursement_amount: "DECIMAL(18,2)",
      
      // Notification
      notification_time: "TIME COMMENT 'Time customer notified of presentment'",
      notification_method: "STRING COMMENT 'PHONE|FAX|EMAIL|API|PORTAL'",
      notification_recipient: "STRING",
      
      // Funding Decision
      funding_required: "DECIMAL(18,2)",
      funding_source_account: "STRING",
      funding_transfer_timestamp: "TIMESTAMP",
      funding_transfer_id: "STRING",
      funding_status: "STRING COMMENT 'PENDING|FUNDED|INSUFFICIENT_FUNDS'",
      
      // Account Balance
      opening_balance: "DECIMAL(18,2)",
      closing_balance: "DECIMAL(18,2)",
      target_balance: "DECIMAL(18,2) COMMENT 'Minimum balance to maintain'",
      
      // Presentment Timing
      early_presentment_cutoff: "TIME COMMENT 'First notification cutoff'",
      late_presentment_cutoff: "TIME COMMENT 'Final notification cutoff'",
      settlement_time: "TIME",
      
      // Fees
      controlled_disbursement_fee: "DECIMAL(10,2)",
      
      // Audit
      source_system: "STRING DEFAULT 'CONTROLLED_DISBURSEMENT_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 19: Zero Balance Accounts (ZBA)
  {
    name: 'bronze.commercial_zba_sweeps',
    description: 'Zero Balance Account sweep transactions and master account relationships',
    sourceSystem: 'ZBA_MANAGEMENT_SYSTEM',
    sourceTable: 'ZBA_SWEEP_LOG',
    loadType: 'BATCH',
    
    grain: 'One row per ZBA sweep transaction',
    primaryKey: ['zba_sweep_id'],
    
    schema: {
      zba_sweep_id: "STRING PRIMARY KEY",
      business_date: "DATE",
      
      // Account Relationships
      subsidiary_account_number: "STRING COMMENT 'ZBA subsidiary account'",
      master_account_number: "STRING COMMENT 'Master concentration account'",
      company_id: "STRING",
      
      // Sweep Type
      sweep_type: "STRING COMMENT 'TO_MASTER|FROM_MASTER'",
      sweep_trigger: "STRING COMMENT 'END_OF_DAY|THRESHOLD|ON_DEMAND'",
      
      // Sweep Amount
      sweep_amount: "DECIMAL(18,2)",
      
      // Balances
      subsidiary_opening_balance: "DECIMAL(18,2)",
      subsidiary_closing_balance: "DECIMAL(18,2) COMMENT 'Typically $0.00 for true ZBA'",
      master_opening_balance: "DECIMAL(18,2)",
      master_closing_balance: "DECIMAL(18,2)",
      
      // Timing
      sweep_timestamp: "TIMESTAMP",
      effective_date: "DATE",
      
      // Transaction Details
      sweep_transaction_id: "STRING COMMENT 'Internal transfer transaction ID'",
      memo: "STRING",
      
      // Target Balance
      target_balance: "DECIMAL(18,2) DEFAULT 0.00 COMMENT 'Target balance for subsidiary (usually $0)'",
      threshold_amount: "DECIMAL(18,2) COMMENT 'Threshold for sweep trigger'",
      
      // Audit
      source_system: "STRING DEFAULT 'ZBA_MANAGEMENT_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 20: Payment Settlement Files
  {
    name: 'bronze.commercial_payment_settlement_files',
    description: 'Payment network settlement files and reconciliation data',
    sourceSystem: 'SETTLEMENT_PROCESSING',
    sourceTable: 'SETTLEMENT_FILE_LOG',
    loadType: 'BATCH',
    
    grain: 'One row per settlement file received',
    primaryKey: ['settlement_file_id'],
    
    schema: {
      settlement_file_id: "STRING PRIMARY KEY",
      
      // File Details
      file_name: "STRING",
      file_type: "STRING COMMENT 'ACH_SETTLEMENT|FEDWIRE_SETTLEMENT|RTP_SETTLEMENT|CARD_SETTLEMENT'",
      file_format: "STRING COMMENT 'NACHA|ISO20022|PROPRIETARY'",
      file_received_timestamp: "TIMESTAMP",
      file_size_bytes: "BIGINT",
      
      // Settlement Details
      settlement_date: "DATE",
      settlement_network: "STRING COMMENT 'FEDACH|FEDWIRE|RTP_NETWORK|VISA|MASTERCARD'",
      settlement_type: "STRING COMMENT 'GROSS|NET'",
      
      // Financial Totals
      total_credits: "DECIMAL(18,2)",
      total_debits: "DECIMAL(18,2)",
      net_settlement_amount: "DECIMAL(18,2)",
      total_transaction_count: "INTEGER",
      
      // Processing Status
      file_status: "STRING COMMENT 'RECEIVED|VALIDATED|PROCESSED|RECONCILED|FAILED'",
      validation_status: "STRING COMMENT 'PASSED|FAILED'",
      validation_errors: "JSON",
      processing_timestamp: "TIMESTAMP",
      
      // Reconciliation
      reconciliation_status: "STRING COMMENT 'MATCHED|UNMATCHED|VARIANCE'",
      reconciliation_timestamp: "TIMESTAMP",
      variance_amount: "DECIMAL(18,2)",
      variance_count: "INTEGER",
      
      // GL Posting
      gl_posting_date: "DATE",
      gl_posting_status: "STRING COMMENT 'PENDING|POSTED|FAILED'",
      
      // Audit
      source_system: "STRING DEFAULT 'SETTLEMENT_PROCESSING'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 21: International Payment Messages (SWIFT)
  {
    name: 'bronze.commercial_swift_messages',
    description: 'SWIFT MT and MX message log for international payments',
    sourceSystem: 'SWIFT_GATEWAY',
    sourceTable: 'SWIFT_MESSAGE_LOG',
    loadType: 'STREAMING',
    
    grain: 'One row per SWIFT message',
    primaryKey: ['swift_message_id'],
    
    schema: {
      swift_message_id: "STRING PRIMARY KEY",
      
      // Message Classification
      message_type: "STRING COMMENT 'MT103|MT202|MT103+|MT202COV|MT199|MT299|MT900|MT910'",
      message_category: "STRING COMMENT 'PAYMENT|CONFIRMATION|STATEMENT|FREE_FORMAT'",
      message_direction: "STRING COMMENT 'INBOUND|OUTBOUND'",
      
      // SWIFT References
      sender_reference: "STRING COMMENT 'Field 20: Sender Reference'",
      related_reference: "STRING COMMENT 'Field 21: Related Reference'",
      uetr: "STRING COMMENT 'Unique End-to-end Transaction Reference (gpi)'",
      
      // Sender & Receiver
      sender_bic: "STRING COMMENT 'Sender BIC code (11 chars)'",
      receiver_bic: "STRING COMMENT 'Receiver BIC code'",
      
      // Message Timing
      message_timestamp: "TIMESTAMP",
      value_date: "DATE COMMENT 'Field 32A: Value Date'",
      
      // Amount
      transaction_amount: "DECIMAL(18,2) COMMENT 'Field 32A: Amount'",
      transaction_currency: "STRING COMMENT 'Field 32A: Currency'",
      
      // Ordering Customer
      ordering_customer: "STRING COMMENT 'Field 50: Ordering Customer'",
      ordering_customer_account: "STRING COMMENT 'Field 50: Account'",
      
      // Beneficiary Customer
      beneficiary_customer: "STRING COMMENT 'Field 59: Beneficiary'",
      beneficiary_account: "STRING COMMENT 'Field 59: Account (IBAN)'",
      
      // Beneficiary Bank
      beneficiary_bank_bic: "STRING COMMENT 'Field 57: Account With Institution'",
      
      // Intermediary Bank
      intermediary_bank_bic: "STRING COMMENT 'Field 56: Intermediary Institution'",
      
      // Payment Details
      remittance_info: "STRING COMMENT 'Field 70: Remittance Information'",
      details_of_charges: "STRING COMMENT 'Field 71A: OUR|BEN|SHA'",
      
      // Sender to Receiver Information
      sender_to_receiver_info: "STRING COMMENT 'Field 72: Sender to Receiver Info'",
      
      // Regulatory Reporting
      regulatory_reporting: "STRING COMMENT 'Field 77B: Regulatory Reporting'",
      
      // Message Status
      message_status: "STRING COMMENT 'SENT|RECEIVED|ACKNOWLEDGED|SETTLED|REJECTED|RETURNED'",
      acknowledgement_timestamp: "TIMESTAMP",
      
      // GPI Tracking
      gpi_tracker_status: "STRING COMMENT 'SWIFT gpi tracker status'",
      gpi_unique_id: "STRING",
      
      // Full Message
      raw_message_text: "STRING COMMENT 'Complete SWIFT message MT format'",
      
      // Audit
      source_system: "STRING DEFAULT 'SWIFT_GATEWAY'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 22: Payment Exception Queue
  {
    name: 'bronze.commercial_payment_exceptions',
    description: 'Payment exception queue for manual review and resolution',
    sourceSystem: 'PAYMENT_EXCEPTION_SYSTEM',
    sourceTable: 'PAYMENT_EXCEPTION_QUEUE',
    loadType: 'STREAMING',
    
    grain: 'One row per payment exception',
    primaryKey: ['exception_id'],
    
    schema: {
      exception_id: "STRING PRIMARY KEY",
      
      // Associated Payment
      payment_transaction_id: "STRING",
      payment_type: "STRING COMMENT 'ACH|WIRE|RTP|CHECK|BILL_PAYMENT'",
      payment_amount: "DECIMAL(18,2)",
      
      // Account Information
      account_number: "STRING",
      company_id: "STRING",
      
      // Exception Classification
      exception_type: "STRING COMMENT 'VALIDATION_FAILURE|COMPLIANCE_HOLD|FRAUD_ALERT|INSUFFICIENT_FUNDS|LIMIT_EXCEEDED|MANUAL_REVIEW_REQUIRED'",
      exception_category: "STRING COMMENT 'TECHNICAL|OPERATIONAL|COMPLIANCE|FRAUD'",
      exception_severity: "STRING COMMENT 'CRITICAL|HIGH|MEDIUM|LOW'",
      
      // Exception Details
      exception_timestamp: "TIMESTAMP",
      exception_description: "STRING",
      system_error_code: "STRING",
      system_error_message: "STRING",
      
      // Exception Queue
      queue_name: "STRING COMMENT 'FRAUD_REVIEW|COMPLIANCE_REVIEW|OPERATIONS_REVIEW'",
      assigned_to_user_id: "STRING",
      assigned_timestamp: "TIMESTAMP",
      priority: "STRING COMMENT 'URGENT|HIGH|NORMAL|LOW'",
      
      // Resolution
      exception_status: "STRING COMMENT 'OPEN|UNDER_REVIEW|RESOLVED|ESCALATED|CANCELLED'",
      resolution_action: "STRING COMMENT 'APPROVED|REJECTED|RETURNED|CANCELLED|ESCALATED'",
      resolution_timestamp: "TIMESTAMP",
      resolved_by_user_id: "STRING",
      resolution_notes: "STRING",
      
      // SLA Tracking
      sla_deadline: "TIMESTAMP",
      sla_met_flag: "BOOLEAN",
      time_to_resolve_minutes: "INTEGER",
      
      // Escalation
      escalation_flag: "BOOLEAN",
      escalation_level: "INTEGER DEFAULT 1",
      escalated_to_user_id: "STRING",
      escalation_timestamp: "TIMESTAMP",
      
      // Audit
      source_system: "STRING DEFAULT 'PAYMENT_EXCEPTION_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 23: Payment Limits & Controls
  {
    name: 'bronze.commercial_payment_limits',
    description: 'Payment limits and control rules for commercial customers',
    sourceSystem: 'PAYMENT_CONTROL_SYSTEM',
    sourceTable: 'PAYMENT_LIMIT_MASTER',
    loadType: 'BATCH',
    
    grain: 'One row per limit configuration',
    primaryKey: ['limit_id'],
    
    schema: {
      limit_id: "STRING PRIMARY KEY",
      company_id: "STRING",
      account_number: "STRING",
      
      // Limit Type
      limit_type: "STRING COMMENT 'TRANSACTION|DAILY|WEEKLY|MONTHLY'",
      limit_scope: "STRING COMMENT 'ACCOUNT|USER|PAYMENT_TYPE|PAYEE'",
      
      // Payment Type
      payment_type: "STRING COMMENT 'ACH|WIRE|RTP|CHECK|ALL'",
      transaction_direction: "STRING COMMENT 'DEBIT|CREDIT|BOTH'",
      
      // Limit Amounts
      single_transaction_limit: "DECIMAL(18,2)",
      daily_limit: "DECIMAL(18,2)",
      weekly_limit: "DECIMAL(18,2)",
      monthly_limit: "DECIMAL(18,2)",
      
      // Count Limits
      daily_transaction_count_limit: "INTEGER",
      monthly_transaction_count_limit: "INTEGER",
      
      // Velocity Controls
      velocity_time_window_minutes: "INTEGER COMMENT 'Time window for velocity check'",
      velocity_transaction_count_limit: "INTEGER",
      velocity_amount_limit: "DECIMAL(18,2)",
      
      // Payee Restrictions
      new_payee_limit: "DECIMAL(18,2) COMMENT 'Limit for new/unverified payees'",
      new_payee_approval_required_flag: "BOOLEAN",
      
      // Time Restrictions
      allowed_days: "JSON COMMENT 'Array of allowed days of week'",
      allowed_time_start: "TIME",
      allowed_time_end: "TIME",
      
      // Geographic Restrictions
      allowed_countries: "JSON COMMENT 'Array of ISO country codes'",
      blocked_countries: "JSON COMMENT 'Blocked countries (sanctions, etc.)'",
      
      // Approval Requirements
      dual_approval_required_flag: "BOOLEAN",
      dual_approval_threshold: "DECIMAL(18,2)",
      
      // Effective Period
      effective_start_date: "DATE",
      effective_end_date: "DATE",
      active_flag: "BOOLEAN DEFAULT TRUE",
      
      // Override Capability
      override_allowed_flag: "BOOLEAN",
      override_approver_role: "STRING",
      
      // Audit
      created_by_user_id: "STRING",
      created_timestamp: "TIMESTAMP",
      modified_by_user_id: "STRING",
      modified_timestamp: "TIMESTAMP",
      source_system: "STRING DEFAULT 'PAYMENT_CONTROL_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 24: Payment Reconciliation
  {
    name: 'bronze.commercial_payment_reconciliation',
    description: 'Payment reconciliation records matching internal and external systems',
    sourceSystem: 'RECONCILIATION_PLATFORM',
    sourceTable: 'PAYMENT_RECON_LOG',
    loadType: 'BATCH',
    
    grain: 'One row per reconciliation item',
    primaryKey: ['reconciliation_id'],
    
    schema: {
      reconciliation_id: "STRING PRIMARY KEY",
      reconciliation_date: "DATE",
      
      // Reconciliation Type
      reconciliation_type: "STRING COMMENT 'ACH_SETTLEMENT|WIRE_SETTLEMENT|CHECK_CLEARING|GATEWAY_SETTLEMENT'",
      reconciliation_scope: "STRING COMMENT 'DAILY|MONTHLY|REAL_TIME'",
      
      // Internal System Record
      internal_transaction_id: "STRING",
      internal_amount: "DECIMAL(18,2)",
      internal_timestamp: "TIMESTAMP",
      internal_status: "STRING",
      
      // External System Record
      external_transaction_id: "STRING",
      external_reference: "STRING COMMENT 'Bank reference, trace number, IMAD'",
      external_amount: "DECIMAL(18,2)",
      external_timestamp: "TIMESTAMP",
      external_status: "STRING",
      
      // Reconciliation Status
      match_status: "STRING COMMENT 'MATCHED|UNMATCHED|VARIANCE|EXCEPTION'",
      match_confidence_score: "DECIMAL(5,2) COMMENT 'Matching algorithm confidence (0-100)'",
      
      // Variance Details
      amount_variance: "DECIMAL(18,2)",
      time_variance_minutes: "INTEGER",
      variance_reason: "STRING COMMENT 'TIMING_DIFFERENCE|AMOUNT_MISMATCH|MISSING_RECORD|DUPLICATE'",
      
      // Resolution
      resolution_status: "STRING COMMENT 'PENDING|RESOLVED|ESCALATED'",
      resolution_action: "STRING COMMENT 'AUTO_MATCHED|MANUAL_MATCH|ADJUSTMENT|INVESTIGATION_REQUIRED'",
      resolution_timestamp: "TIMESTAMP",
      resolved_by_user_id: "STRING",
      resolution_notes: "STRING",
      
      // GL Impact
      gl_adjustment_required_flag: "BOOLEAN",
      gl_adjustment_amount: "DECIMAL(18,2)",
      gl_adjustment_account: "STRING",
      gl_posting_date: "DATE",
      
      // Audit
      source_system: "STRING DEFAULT 'RECONCILIATION_PLATFORM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 25: Payment Audit Trail
  {
    name: 'bronze.commercial_payment_audit_trail',
    description: 'Comprehensive audit trail for all payment activities and state changes',
    sourceSystem: 'PAYMENT_AUDIT_SYSTEM',
    sourceTable: 'PAYMENT_AUDIT_LOG',
    loadType: 'STREAMING',
    
    grain: 'One row per audit event',
    primaryKey: ['audit_event_id'],
    
    schema: {
      audit_event_id: "STRING PRIMARY KEY",
      
      // Associated Payment
      payment_transaction_id: "STRING",
      payment_type: "STRING COMMENT 'ACH|WIRE|RTP|CHECK|BILL_PAYMENT'",
      
      // Event Details
      event_type: "STRING COMMENT 'CREATE|UPDATE|DELETE|APPROVE|REJECT|TRANSMIT|SETTLE|RETURN|CANCEL'",
      event_timestamp: "TIMESTAMP",
      event_description: "STRING",
      
      // State Change
      previous_state: "STRING",
      new_state: "STRING",
      state_change_reason: "STRING",
      
      // User/System
      actor_type: "STRING COMMENT 'USER|SYSTEM|API|BATCH_JOB'",
      actor_user_id: "STRING",
      actor_system_name: "STRING",
      actor_ip_address: "STRING",
      actor_session_id: "STRING",
      
      // Changed Fields
      changed_fields: "JSON COMMENT 'Array of field names that changed'",
      field_changes: "JSON COMMENT 'Before/after values for changed fields'",
      
      // Payment Snapshot
      payment_amount: "DECIMAL(18,2)",
      payment_status: "STRING",
      payee_name: "STRING",
      
      // Security Context
      authentication_method: "STRING COMMENT 'PASSWORD|MFA|SSO|API_KEY|CERTIFICATE'",
      authorization_level: "STRING COMMENT 'User authorization level'",
      
      // Compliance
      regulatory_flag: "BOOLEAN COMMENT 'Event relevant for regulatory reporting'",
      retention_period_years: "INTEGER DEFAULT 7",
      
      // Audit
      source_system: "STRING DEFAULT 'PAYMENT_AUDIT_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },
];

export const paymentsCommercialBronzeLayer = {
  name: 'Payments-Commercial Bronze Layer',
  totalTables: paymentsCommercialBronzeTables.length,
  tables: paymentsCommercialBronzeTables,
};
