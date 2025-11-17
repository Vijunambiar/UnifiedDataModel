/**
 * PAYMENTS-RETAIL SILVER LAYER - Complete Implementation
 * 
 * Domain: Payments Retail
 * Area: Retail Banking
 * Purpose: Golden records for payments, transfers, bill pay
 * 
 * All 16 silver tables for retail payments domain
 * MDM, SCD Type 2, data quality standards applied
 */

export const paymentsRetailSilverTables = [
  // Table 1: P2P Payment Transactions Golden
  {
    name: 'silver.retail_p2p_payment_transactions_golden',
    description: 'Golden record of peer-to-peer payment transactions',
    grain: 'One row per P2P payment transaction',
    scdType: 'Type 1',
    
    primaryKey: ['p2p_transaction_sk'],
    naturalKey: ['p2p_transaction_id'],
    
    sourceTables: ['bronze.retail_p2p_payment_transactions'],
    
    schema: {
      p2p_transaction_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Surrogate key'",
      
      // NATURAL KEYS
      p2p_transaction_id: "BIGINT UNIQUE",
      p2p_transaction_uuid: "STRING UNIQUE",
      external_reference_id: "STRING",
      
      // SENDER
      sender_customer_sk: "BIGINT COMMENT 'FK to dim_customer'",
      sender_customer_id: "BIGINT",
      sender_account_sk: "BIGINT COMMENT 'FK to dim_deposit_account'",
      sender_account_id: "BIGINT",
      sender_name: "STRING",
      sender_email: "STRING",
      sender_phone: "STRING",
      
      // RECEIVER
      receiver_customer_sk: "BIGINT COMMENT 'FK to dim_customer (NULL if external)'",
      receiver_customer_id: "BIGINT",
      receiver_account_sk: "BIGINT",
      receiver_account_id: "BIGINT",
      receiver_name: "STRING",
      receiver_email: "STRING",
      receiver_phone: "STRING",
      
      receiver_type: "STRING COMMENT 'Internal|External|Cross-Bank'",
      is_internal_transfer: "BOOLEAN",
      
      // TRANSACTION
      transaction_date: "DATE",
      transaction_date_key: "INTEGER COMMENT 'FK to dim_date'",
      transaction_timestamp: "TIMESTAMP",
      
      transaction_amount: "DECIMAL(18,2)",
      transaction_currency: "STRING",
      
      transaction_status: "STRING COMMENT 'Pending|Processing|Completed|Failed|Cancelled|Reversed'",
      transaction_status_date: "TIMESTAMP",
      
      // PAYMENT METHOD
      payment_method: "STRING COMMENT 'P2P|Zelle|Internal'",
      payment_network: "STRING COMMENT 'Zelle|RTP|FedNow|ACH'",
      payment_rail: "STRING COMMENT 'Real-Time|Same-Day ACH|Next-Day ACH'",
      
      // CHANNEL
      initiated_channel: "STRING COMMENT 'Mobile|Online|SMS|API'",
      initiated_device_type: "STRING COMMENT 'iOS|Android|Web'",
      
      // TIMING
      requested_delivery_date: "DATE",
      actual_delivery_date: "DATE",
      settlement_date: "DATE",
      
      days_to_delivery: "INTEGER COMMENT 'Days from initiation to delivery'",
      
      // FEES
      sender_fee_amount: "DECIMAL(18,2)",
      receiver_fee_amount: "DECIMAL(18,2)",
      network_fee_amount: "DECIMAL(18,2)",
      total_fees: "DECIMAL(18,2)",
      
      fee_waived: "BOOLEAN",
      
      // MESSAGE
      payment_memo: "STRING",
      
      // RECURRING
      is_recurring: "BOOLEAN",
      recurring_schedule_id: "BIGINT",
      recurrence_number: "INTEGER",
      
      // FRAUD & RISK
      fraud_score: "INTEGER COMMENT '0-100'",
      fraud_flag: "BOOLEAN",
      risk_level: "STRING COMMENT 'Low|Medium|High|Critical'",
      
      // AUTHENTICATION
      authentication_method: "STRING COMMENT 'Biometric|PIN|Password|2FA'",
      multi_factor_auth_used: "BOOLEAN",
      
      // PROCESSING
      processing_network: "STRING",
      clearing_house: "STRING",
      
      // REVERSALS
      is_reversal: "BOOLEAN",
      reversal_reason: "STRING",
      original_transaction_sk: "BIGINT",
      
      is_cancelled: "BOOLEAN",
      cancellation_reason: "STRING",
      
      // FAILURE
      is_failed: "BOOLEAN",
      failure_reason: "STRING",
      
      // COMPLIANCE
      ofac_check_status: "STRING",
      aml_flag: "BOOLEAN",
      ctr_reportable: "BOOLEAN",
      sar_filed: "BOOLEAN",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      accuracy_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 2: Bill Pay Transactions Golden
  {
    name: 'silver.retail_bill_pay_transactions_golden',
    description: 'Golden record of bill payment transactions',
    grain: 'One row per bill payment',
    scdType: 'Type 1',
    
    primaryKey: ['bill_payment_sk'],
    naturalKey: ['bill_payment_id'],
    
    sourceTables: ['bronze.retail_bill_pay_transactions'],
    
    schema: {
      bill_payment_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      bill_payment_id: "BIGINT UNIQUE",
      bill_payment_uuid: "STRING UNIQUE",
      
      // PAYER
      payer_customer_sk: "BIGINT COMMENT 'FK to dim_customer'",
      payer_customer_id: "BIGINT",
      payer_account_sk: "BIGINT COMMENT 'FK to dim_deposit_account'",
      payer_account_id: "BIGINT",
      
      // PAYEE
      payee_sk: "BIGINT COMMENT 'FK to dim_payee'",
      payee_id: "BIGINT",
      payee_name: "STRING",
      payee_category: "STRING COMMENT 'Utility|Credit Card|Mortgage|Insurance'",
      payee_type: "STRING COMMENT 'Electronic|Check'",
      
      // PAYMENT
      payment_date: "DATE",
      payment_date_key: "INTEGER",
      payment_timestamp: "TIMESTAMP",
      
      payment_amount: "DECIMAL(18,2)",
      payment_currency: "STRING",
      
      payment_status: "STRING COMMENT 'Scheduled|Processing|Sent|Delivered|Paid|Failed|Cancelled'",
      payment_status_date: "TIMESTAMP",
      
      // METHOD
      payment_method: "STRING COMMENT 'Electronic|Check|Debit Card'",
      delivery_method: "STRING COMMENT 'ACH|Wire|Check|RTP|Card Payment'",
      
      // TIMING
      scheduled_delivery_date: "DATE",
      actual_delivery_date: "DATE",
      payee_credit_date: "DATE",
      
      days_in_advance: "INTEGER COMMENT 'Days payment scheduled before due date'",
      days_to_delivery: "INTEGER",
      
      // CHECK
      check_number: "STRING",
      check_mailed_date: "DATE",
      check_cashed_date: "DATE",
      
      // FEES
      payment_fee: "DECIMAL(18,2)",
      expedite_fee: "DECIMAL(18,2)",
      total_fees: "DECIMAL(18,2)",
      
      fee_waived: "BOOLEAN",
      
      // RECURRING
      is_recurring: "BOOLEAN",
      recurring_schedule_id: "BIGINT",
      recurrence_frequency: "STRING",
      recurrence_number: "INTEGER",
      
      is_autopay: "BOOLEAN",
      autopay_type: "STRING",
      
      // E-BILL
      ebill_id: "BIGINT",
      ebill_amount: "DECIMAL(18,2)",
      ebill_due_date: "DATE",
      
      // CONFIRMATION
      confirmation_number: "STRING",
      payee_confirmation_number: "STRING",
      
      // CHANNEL
      initiated_channel: "STRING COMMENT 'Mobile|Online|Phone|Branch'",
      
      // CANCELLATION
      is_cancelled: "BOOLEAN",
      cancellation_reason: "STRING",
      cancellable: "BOOLEAN",
      
      // FAILURE
      is_failed: "BOOLEAN",
      failure_reason: "STRING",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 3: ACH Origination Golden
  {
    name: 'silver.retail_ach_origination_golden',
    description: 'Golden record of ACH payments originated by customers',
    grain: 'One row per ACH transaction',
    scdType: 'Type 1',
    
    primaryKey: ['ach_transaction_sk'],
    naturalKey: ['ach_transaction_id'],
    
    sourceTables: ['bronze.retail_ach_origination'],
    
    schema: {
      ach_transaction_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      ach_transaction_id: "BIGINT UNIQUE",
      ach_trace_number: "STRING UNIQUE COMMENT 'NACHA trace number'",
      
      // ORIGINATOR
      originator_customer_sk: "BIGINT",
      originator_customer_id: "BIGINT",
      originator_account_sk: "BIGINT",
      originator_account_id: "BIGINT",
      originator_name: "STRING",
      originator_routing_number: "STRING",
      
      // RECEIVER
      receiver_name: "STRING",
      receiver_routing_number: "STRING",
      receiver_account_type: "STRING COMMENT 'Checking|Savings'",
      
      // TRANSACTION
      transaction_date: "DATE",
      transaction_date_key: "INTEGER",
      effective_date: "DATE COMMENT 'Settlement date'",
      effective_date_key: "INTEGER",
      
      transaction_amount: "DECIMAL(18,2)",
      
      transaction_code: "STRING COMMENT 'NACHA transaction code'",
      transaction_type: "STRING COMMENT 'Debit|Credit'",
      
      sec_code: "STRING COMMENT 'PPD|CCD|WEB|TEL|etc.'",
      sec_code_description: "STRING",
      
      company_entry_description: "STRING",
      
      // STATUS
      ach_status: "STRING COMMENT 'Pending|Transmitted|Settled|Returned|Rejected'",
      ach_status_date: "DATE",
      
      // RETURN
      is_return: "BOOLEAN",
      return_reason_code: "STRING COMMENT 'R01-R33'",
      return_reason_description: "STRING",
      return_date: "DATE",
      
      // NOC
      is_noc: "BOOLEAN COMMENT 'Notification of Change'",
      noc_code: "STRING",
      corrected_routing_number: "STRING",
      corrected_account_number_last4: "STRING",
      
      // BATCH
      batch_number: "STRING",
      batch_date: "DATE",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 4: Wire Transfer Transactions Golden
  {
    name: 'silver.retail_wire_transfer_transactions_golden',
    description: 'Golden record of domestic and international wire transfers',
    grain: 'One row per wire transfer',
    scdType: 'Type 1',
    
    primaryKey: ['wire_transfer_sk'],
    naturalKey: ['wire_transfer_id'],
    
    schema: {
      wire_transfer_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      wire_transfer_id: "BIGINT UNIQUE",
      wire_reference_number: "STRING UNIQUE COMMENT 'Wire confirmation number'",
      
      // ORIGINATOR
      originator_customer_sk: "BIGINT",
      originator_customer_id: "BIGINT",
      originator_account_sk: "BIGINT",
      originator_account_id: "BIGINT",
      originator_name: "STRING",
      
      // BENEFICIARY
      beneficiary_name: "STRING",
      beneficiary_account_number: "STRING",
      beneficiary_bank_name: "STRING",
      beneficiary_bank_routing_number: "STRING COMMENT 'ABA/SWIFT'",
      beneficiary_bank_swift_code: "STRING",
      beneficiary_address: "STRING",
      beneficiary_country: "STRING",
      
      // INTERMEDIARY BANK (if international)
      intermediary_bank_name: "STRING",
      intermediary_bank_swift_code: "STRING",
      
      // WIRE TYPE
      wire_type: "STRING COMMENT 'Domestic|International'",
      wire_category: "STRING COMMENT 'Outgoing|Incoming'",
      
      // TRANSACTION
      transaction_date: "DATE",
      transaction_date_key: "INTEGER",
      value_date: "DATE COMMENT 'Settlement date'",
      
      wire_amount: "DECIMAL(18,2)",
      wire_currency: "STRING",
      
      exchange_rate: "DECIMAL(12,6) COMMENT 'If currency conversion'",
      beneficiary_amount: "DECIMAL(18,2) COMMENT 'Amount in beneficiary currency'",
      beneficiary_currency: "STRING",
      
      // STATUS
      wire_status: "STRING COMMENT 'Pending|Processing|Sent|Delivered|Recalled|Failed'",
      wire_status_date: "TIMESTAMP",
      
      // FEES
      wire_fee: "DECIMAL(18,2)",
      correspondent_bank_fee: "DECIMAL(18,2)",
      beneficiary_bank_fee: "DECIMAL(18,2)",
      total_fees: "DECIMAL(18,2)",
      
      // PURPOSE
      payment_purpose: "STRING COMMENT 'Purpose of wire transfer'",
      reference_for_beneficiary: "STRING",
      
      // CHANNEL
      initiated_channel: "STRING COMMENT 'Branch|Online|Phone'",
      
      // COMPLIANCE
      ofac_check_status: "STRING",
      ofac_match_details: "STRING",
      aml_risk_score: "INTEGER",
      ctr_reportable: "BOOLEAN",
      sar_filed: "BOOLEAN",
      
      // RECALL
      is_recalled: "BOOLEAN",
      recall_reason: "STRING",
      recall_date: "DATE",
      recall_successful: "BOOLEAN",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
    },
  },
  
  // Table 5: Internal Transfers Golden
  {
    name: 'silver.retail_internal_transfers_golden',
    description: 'Golden record of transfers between customer own accounts',
    grain: 'One row per internal transfer',
    scdType: 'Type 1',
    
    primaryKey: ['internal_transfer_sk'],
    naturalKey: ['internal_transfer_id'],
    
    schema: {
      internal_transfer_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      internal_transfer_id: "BIGINT UNIQUE",
      
      customer_sk: "BIGINT COMMENT 'FK to dim_customer'",
      customer_id: "BIGINT",
      
      from_account_sk: "BIGINT",
      from_account_id: "BIGINT",
      from_account_type: "STRING COMMENT 'Checking|Savings|Money Market'",
      
      to_account_sk: "BIGINT",
      to_account_id: "BIGINT",
      to_account_type: "STRING",
      
      transfer_date: "DATE",
      transfer_date_key: "INTEGER",
      transfer_timestamp: "TIMESTAMP",
      
      transfer_amount: "DECIMAL(18,2)",
      
      transfer_type: "STRING COMMENT 'One-Time|Recurring'",
      transfer_status: "STRING COMMENT 'Pending|Completed|Failed|Cancelled'",
      
      is_recurring: "BOOLEAN",
      recurring_schedule_id: "BIGINT",
      
      initiated_channel: "STRING COMMENT 'Mobile|Online|Phone|Branch|ATM'",
      
      memo: "STRING",
      
      is_overdraft_protection: "BOOLEAN COMMENT 'Automatic transfer for overdraft'",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
    },
  },
  
  // Table 6: External Transfers Golden
  {
    name: 'silver.retail_external_transfers_golden',
    description: 'Golden record of transfers to/from external bank accounts',
    grain: 'One row per external transfer',
    scdType: 'Type 1',
    
    primaryKey: ['external_transfer_sk'],
    naturalKey: ['external_transfer_id'],
    
    schema: {
      external_transfer_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      external_transfer_id: "BIGINT UNIQUE",
      
      customer_sk: "BIGINT",
      customer_id: "BIGINT",
      
      internal_account_sk: "BIGINT",
      internal_account_id: "BIGINT",
      
      external_account_name: "STRING",
      external_account_last_four: "STRING",
      external_bank_name: "STRING",
      external_routing_number: "STRING",
      
      transfer_direction: "STRING COMMENT 'Inbound|Outbound'",
      
      transfer_date: "DATE",
      transfer_date_key: "INTEGER",
      
      transfer_amount: "DECIMAL(18,2)",
      
      transfer_method: "STRING COMMENT 'ACH|Wire|RTP'",
      transfer_status: "STRING",
      
      estimated_delivery_date: "DATE",
      actual_delivery_date: "DATE",
      
      transfer_fee: "DECIMAL(18,2)",
      
      is_recurring: "BOOLEAN",
      
      initiated_channel: "STRING",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 7: Payee Master Golden
  {
    name: 'silver.retail_payee_master_golden',
    description: 'Golden record for bill pay payees',
    scd2: true,
    grain: 'One row per payee per effective period',
    key_fields: ['payee_id', 'customer_id', 'effective_start_date'],

    schema: {
      payee_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      payee_id: "BIGINT",
      customer_id: "BIGINT",

      payee_name: "STRING",
      payee_nickname: "STRING",
      payee_type: "STRING",
      payee_category: "STRING COMMENT 'Utilities|Mortgage|Insurance|Credit Card|etc.'",

      payee_account_number: "STRING",
      payee_address_line1: "STRING",
      payee_address_line2: "STRING",
      payee_city: "STRING",
      payee_state: "STRING",
      payee_zip: "STRING",
      payee_phone: "STRING",
      payee_email: "STRING",

      payment_method: "STRING COMMENT 'Electronic|Check'",
      expected_delivery_days: "INTEGER",

      is_active: "BOOLEAN",
      date_added: "DATE",
      last_payment_date: "DATE",
      total_payments_count: "INTEGER",
      total_payments_amount: "DECIMAL(18,2)",

      data_quality_score: "DECIMAL(5,2)",
      is_verified: "BOOLEAN",

      effective_start_date: "DATE",
      effective_end_date: "DATE",
      is_current: "BOOLEAN",
      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 8: Payment Requests Golden
  {
    name: 'silver.retail_payment_requests_golden',
    description: 'Conformed P2P payment requests',
    scd2: false,
    grain: 'One row per payment request',
    key_fields: ['request_id'],

    schema: {
      request_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      request_id: "BIGINT UNIQUE",

      requester_customer_key: "BIGINT",
      payee_customer_key: "BIGINT",

      request_date: "DATE",
      request_timestamp: "TIMESTAMP",
      request_amount: "DECIMAL(18,2)",
      request_reason: "STRING",

      request_status: "STRING",
      request_status_date: "DATE",

      payment_due_date: "DATE",
      payment_date: "DATE",
      payment_key: "BIGINT COMMENT 'FK to payment if paid'",

      days_to_payment: "INTEGER COMMENT 'Days from request to payment'",
      is_paid: "BOOLEAN",
      is_expired: "BOOLEAN",

      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 9: Recurring Payment Schedules Golden
  {
    name: 'silver.retail_recurring_payment_schedules_golden',
    description: 'Golden record for recurring payment schedules',
    scd2: true,
    grain: 'One row per schedule per effective period',
    key_fields: ['schedule_id', 'effective_start_date'],

    schema: {
      schedule_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      schedule_id: "BIGINT",

      customer_key: "BIGINT",
      from_account_key: "BIGINT",
      payee_key: "BIGINT",

      schedule_type: "STRING",
      frequency: "STRING",
      frequency_normalized: "STRING COMMENT 'Standardized: WEEKLY|BIWEEKLY|MONTHLY|QUARTERLY'",

      payment_amount: "DECIMAL(18,2)",
      amount_type: "STRING",

      start_date: "DATE",
      end_date: "DATE",
      next_payment_date: "DATE",
      last_payment_date: "DATE",

      schedule_status: "STRING",
      autopay_flag: "BOOLEAN",

      total_payments_count: "INTEGER",
      total_payments_amount: "DECIMAL(18,2)",
      failed_payments_count: "INTEGER",

      effective_start_date: "DATE",
      effective_end_date: "DATE",
      is_current: "BOOLEAN",
      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 10: Payment Beneficiaries Golden
  {
    name: 'silver.retail_payment_beneficiaries_golden',
    description: 'Golden record for payment beneficiaries',
    scd2: true,
    grain: 'One row per beneficiary per effective period',
    key_fields: ['beneficiary_id', 'customer_id', 'effective_start_date'],

    schema: {
      beneficiary_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      beneficiary_id: "BIGINT",
      customer_id: "BIGINT",

      beneficiary_name: "STRING",
      beneficiary_nickname: "STRING",
      beneficiary_type: "STRING",
      relationship: "STRING",

      beneficiary_account_number_hash: "STRING COMMENT 'Hashed for privacy'",
      beneficiary_routing_number: "STRING",
      beneficiary_bank_name: "STRING",

      beneficiary_email: "STRING",
      beneficiary_phone: "STRING",

      is_verified: "BOOLEAN",
      verification_method: "STRING",
      verification_date: "DATE",

      date_added: "DATE",
      last_payment_date: "DATE",
      total_payments_count: "INTEGER",
      total_payments_amount: "DECIMAL(18,2)",

      is_active: "BOOLEAN",

      effective_start_date: "DATE",
      effective_end_date: "DATE",
      is_current: "BOOLEAN",
      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 11: Payment Reversals Golden
  {
    name: 'silver.retail_payment_reversals_golden',
    description: 'Conformed payment reversal transactions',
    scd2: false,
    grain: 'One row per reversal',
    key_fields: ['reversal_id'],

    schema: {
      reversal_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      reversal_id: "BIGINT UNIQUE",

      original_payment_key: "BIGINT",
      original_payment_id: "BIGINT",

      reversal_date: "DATE",
      reversal_timestamp: "TIMESTAMP",
      reversal_amount: "DECIMAL(18,2)",

      reversal_reason: "STRING",
      reversal_reason_category: "STRING COMMENT 'Customer|Fraud|Error|Return'",
      reversal_type: "STRING",
      reversal_status: "STRING",

      initiated_by: "STRING",
      initiated_by_customer_key: "BIGINT",

      days_since_original_payment: "INTEGER",

      is_full_reversal: "BOOLEAN",
      reversal_fee: "DECIMAL(18,2)",

      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 12: Payment Exceptions Golden
  {
    name: 'silver.retail_payment_exceptions_golden',
    description: 'Conformed payment exception events',
    scd2: false,
    grain: 'One row per exception',
    key_fields: ['exception_id'],

    schema: {
      exception_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      exception_id: "BIGINT UNIQUE",

      payment_key: "BIGINT",
      payment_id: "BIGINT",

      exception_date: "DATE",
      exception_timestamp: "TIMESTAMP",

      exception_type: "STRING",
      exception_category: "STRING COMMENT 'Funds|Account|Limit|Fraud|System'",
      exception_code: "STRING",
      exception_description: "STRING",

      exception_status: "STRING",
      exception_severity: "STRING COMMENT 'Low|Medium|High|Critical'",

      resolution_date: "DATE",
      resolution_action: "STRING",
      days_to_resolve: "INTEGER",

      is_resolved: "BOOLEAN",
      is_escalated: "BOOLEAN",

      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 13: Payment Fees Golden
  {
    name: 'silver.retail_payment_fees_golden',
    description: 'Conformed payment fee transactions',
    scd2: false,
    grain: 'One row per fee charged',
    key_fields: ['fee_id'],

    schema: {
      fee_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      fee_id: "BIGINT UNIQUE",

      payment_key: "BIGINT",
      customer_key: "BIGINT",
      account_key: "BIGINT",

      fee_date: "DATE",
      fee_type: "STRING",
      fee_category: "STRING COMMENT 'Wire|ACH|Expedited|Return|Stop Payment'",

      fee_amount: "DECIMAL(18,2)",
      fee_waived: "BOOLEAN",
      waiver_reason: "STRING",
      waiver_reason_category: "STRING COMMENT 'Loyalty|Error|Complaint|Retention'",

      net_fee_amount: "DECIMAL(18,2) COMMENT 'Amount after waiver'",

      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 14: RTP Transactions Golden
  {
    name: 'silver.retail_rtp_transactions_golden',
    description: 'Conformed real-time payment transactions',
    scd2: false,
    grain: 'One row per RTP transaction',
    key_fields: ['rtp_transaction_id'],

    schema: {
      rtp_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      rtp_transaction_id: "BIGINT UNIQUE",

      customer_key: "BIGINT",
      account_key: "BIGINT",

      transaction_date: "DATE",
      transaction_timestamp: "TIMESTAMP",
      transaction_hour: "INTEGER COMMENT '0-23'",

      transaction_type: "STRING COMMENT 'Send|Receive'",
      transaction_amount: "DECIMAL(18,2)",

      counterparty_name: "STRING",
      counterparty_bank: "STRING",
      payment_purpose: "STRING",

      rtp_message_id: "STRING UNIQUE",
      settlement_status: "STRING",
      settlement_timestamp: "TIMESTAMP",
      settlement_duration_seconds: "INTEGER",

      is_outbound: "BOOLEAN",
      is_inbound: "BOOLEAN",
      is_settled: "BOOLEAN",

      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 15: FedNow Transactions Golden
  {
    name: 'silver.retail_fednow_transactions_golden',
    description: 'Conformed FedNow instant payment transactions',
    scd2: false,
    grain: 'One row per FedNow transaction',
    key_fields: ['fednow_transaction_id'],

    schema: {
      fednow_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      fednow_transaction_id: "BIGINT UNIQUE",

      customer_key: "BIGINT",
      account_key: "BIGINT",

      transaction_date: "DATE",
      transaction_timestamp: "TIMESTAMP",
      transaction_hour: "INTEGER",

      transaction_type: "STRING COMMENT 'Credit|Debit'",
      transaction_amount: "DECIMAL(18,2)",

      originating_bank: "STRING",
      receiving_bank: "STRING",
      payment_reference: "STRING",

      settlement_timestamp: "TIMESTAMP",
      settlement_status: "STRING",
      settlement_duration_seconds: "INTEGER",

      is_credit: "BOOLEAN",
      is_debit: "BOOLEAN",
      is_final: "BOOLEAN",
      is_24x7_processing: "BOOLEAN COMMENT 'FedNow operates 24/7/365'",

      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 16: Payment Fraud Alerts Golden
  {
    name: 'silver.retail_payment_fraud_alerts_golden',
    description: 'Conformed payment fraud detection alerts',
    scd2: false,
    grain: 'One row per fraud alert',
    key_fields: ['alert_id'],

    schema: {
      alert_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      alert_id: "BIGINT UNIQUE",

      payment_key: "BIGINT",
      customer_key: "BIGINT",

      alert_date: "DATE",
      alert_timestamp: "TIMESTAMP",
      alert_hour: "INTEGER",

      fraud_score: "INTEGER COMMENT '0-100'",
      fraud_risk_band: "STRING COMMENT 'Low|Medium|High|Critical'",

      fraud_reason: "STRING",
      fraud_category: "STRING COMMENT 'Recipient|Velocity|Amount|Location|Pattern'",

      alert_action: "STRING COMMENT 'Blocked|Hold|Allowed'",
      review_status: "STRING",

      confirmed_fraud: "BOOLEAN",
      false_positive: "BOOLEAN",

      fraud_loss_amount: "DECIMAL(18,2) COMMENT 'Actual loss if confirmed fraud'",
      fraud_prevented_amount: "DECIMAL(18,2) COMMENT 'Loss prevented if blocked'",

      review_date: "DATE",
      days_to_review: "INTEGER",

      row_created_timestamp: "TIMESTAMP",
      row_updated_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },
];

export const paymentsRetailSilverLayerComplete = {
  description: 'Complete silver layer for retail payments domain with MDM and SCD2',
  layer: 'SILVER',
  tables: paymentsRetailSilverTables,
  totalTables: 16,
  estimatedSize: '1.5TB',
  refreshFrequency: 'Hourly',
  dataQuality: {
    completenessTarget: 95,
    accuracyTarget: 99,
    consistencyTarget: 98,
    timelinessTarget: 99.5,
  },
  retention: '7 years',
};
