/**
 * PAYMENTS-RETAIL BRONZE LAYER - Complete Implementation
 * 
 * Domain: Payments Retail
 * Area: Retail Banking
 * Purpose: P2P payments, bill pay, ACH, wires, transfers
 * 
 * All 22 bronze tables for retail payments domain
 * Industry-accurate, comprehensive, enterprise-ready
 */

export const paymentsRetailBronzeTables = [
  // Table 1: P2P Payment Transactions
  {
    name: 'bronze.retail_p2p_payment_transactions',
    description: 'Peer-to-peer payment transactions (Zelle, Venmo-like)',
    sourceSystem: 'P2P_PLATFORM',
    sourceTable: 'P2P_TRANSACTIONS',
    loadType: 'CDC',
    
    grain: 'One row per P2P payment transaction',
    primaryKey: ['p2p_transaction_id', 'source_system'],
    
    estimatedRows: 500000000,
    avgRowSize: 1280,
    estimatedSize: '640GB',
    
    schema: {
      // PRIMARY KEYS
      p2p_transaction_id: "BIGINT PRIMARY KEY COMMENT 'Unique P2P transaction identifier'",
      source_system: "STRING PRIMARY KEY COMMENT 'ZELLE|CLEARXCHANGE|INTERNAL'",
      
      // NATURAL KEYS
      p2p_transaction_uuid: "STRING UNIQUE COMMENT 'Global UUID'",
      external_reference_id: "STRING COMMENT 'External network reference (e.g., Zelle transaction ID)'",
      
      // SENDER INFORMATION
      sender_customer_id: "BIGINT COMMENT 'FK to sender customer'",
      sender_account_id: "BIGINT COMMENT 'Sender deposit account'",
      sender_name: "STRING COMMENT 'Sender display name'",
      sender_email: "STRING COMMENT 'Sender email'",
      sender_phone: "STRING COMMENT 'Sender mobile phone'",
      
      // RECEIVER INFORMATION
      receiver_customer_id: "BIGINT COMMENT 'FK to receiver customer (NULL if external)'",
      receiver_account_id: "BIGINT COMMENT 'Receiver deposit account'",
      receiver_name: "STRING COMMENT 'Receiver display name'",
      receiver_email: "STRING COMMENT 'Receiver email or token'",
      receiver_phone: "STRING COMMENT 'Receiver mobile phone'",
      
      receiver_type: "STRING COMMENT 'Internal|External|Cross-Bank'",
      is_internal_transfer: "BOOLEAN COMMENT 'Both parties are bank customers'",
      
      // TRANSACTION DETAILS
      transaction_date: "DATE",
      transaction_timestamp: "TIMESTAMP COMMENT 'Exact transaction time'",
      
      transaction_amount: "DECIMAL(18,2)",
      transaction_currency: "STRING COMMENT 'ISO 4217 currency code (typically USD)'",
      
      transaction_status: "STRING COMMENT 'Pending|Processing|Completed|Failed|Cancelled|Reversed'",
      transaction_status_date: "TIMESTAMP",
      
      // PAYMENT METHOD
      payment_method: "STRING COMMENT 'P2P|Zelle|Venmo|CashApp|PayPal|Internal'",
      payment_network: "STRING COMMENT 'Zelle|RTP|FedNow|ACH'",
      payment_rail: "STRING COMMENT 'Real-Time|Same-Day ACH|Next-Day ACH'",
      
      // INITIATION
      initiated_channel: "STRING COMMENT 'Mobile|Online|SMS|API'",
      initiated_device_type: "STRING COMMENT 'iOS|Android|Web'",
      initiated_ip_address: "STRING COMMENT 'Initiating IP address'",
      initiated_location: "STRING COMMENT 'Geolocation if available'",
      
      // TIMING
      requested_delivery_date: "DATE COMMENT 'When sender wants funds delivered'",
      actual_delivery_date: "DATE COMMENT 'When funds actually delivered'",
      settlement_date: "DATE COMMENT 'Settlement date'",
      
      // FEES
      sender_fee_amount: "DECIMAL(18,2) COMMENT 'Fee charged to sender'",
      receiver_fee_amount: "DECIMAL(18,2) COMMENT 'Fee charged to receiver (rare)'",
      network_fee_amount: "DECIMAL(18,2) COMMENT 'Fee paid to network (Zelle, etc.)'",
      
      fee_waived: "BOOLEAN",
      fee_waiver_reason: "STRING",
      
      // MESSAGE & MEMO
      payment_memo: "STRING COMMENT 'Payment description/memo from sender'",
      request_message: "STRING COMMENT 'Payment request message if applicable'",
      
      // PAYMENT REQUEST (if applicable)
      is_payment_request: "BOOLEAN COMMENT 'Payment initiated via request'",
      payment_request_id: "BIGINT COMMENT 'FK to payment request if applicable'",
      
      // RECURRING
      is_recurring: "BOOLEAN",
      recurring_schedule_id: "BIGINT COMMENT 'FK to recurring schedule'",
      recurrence_number: "INTEGER COMMENT 'Sequence number in recurring series'",
      
      // LIMITS & CONTROLS
      daily_limit_at_transaction: "DECIMAL(18,2) COMMENT 'Daily P2P limit at time of transaction'",
      transaction_limit_at_transaction: "DECIMAL(18,2) COMMENT 'Per-transaction limit'",
      
      // FRAUD & RISK
      fraud_score: "INTEGER COMMENT 'Fraud risk score (0-100)'",
      fraud_flag: "BOOLEAN",
      fraud_reason: "STRING",
      
      risk_score: "INTEGER COMMENT 'Risk assessment score (0-100)'",
      risk_level: "STRING COMMENT 'Low|Medium|High|Critical'",
      
      velocity_check_result: "STRING COMMENT 'Pass|Fail|Warning'",
      velocity_breach_count: "INTEGER COMMENT 'Number of velocity rules breached'",
      
      // AUTHENTICATION
      authentication_method: "STRING COMMENT 'Biometric|PIN|Password|2FA|Token'",
      authentication_status: "STRING COMMENT 'Authenticated|Failed|Bypassed'",
      
      multi_factor_auth_used: "BOOLEAN",
      device_fingerprint: "STRING COMMENT 'Unique device identifier'",
      
      // PROCESSING
      processing_network: "STRING COMMENT 'Zelle|Early Warning|RTP|FedNow'",
      clearing_house: "STRING COMMENT 'Federal Reserve|TCH|Zelle Network'",
      
      batch_id: "STRING COMMENT 'Batch identifier for batch processing'",
      
      // REVERSALS & CANCELLATIONS
      is_reversal: "BOOLEAN",
      reversal_reason: "STRING COMMENT 'Duplicate|Fraud|Customer Request|Error'",
      reversal_timestamp: "TIMESTAMP",
      original_transaction_id: "BIGINT COMMENT 'If reversal, FK to original transaction'",
      
      is_cancelled: "BOOLEAN",
      cancellation_reason: "STRING",
      cancellation_timestamp: "TIMESTAMP",
      
      // FAILURE DETAILS
      failure_reason: "STRING COMMENT 'Insufficient Funds|Invalid Account|Blocked|Fraud'",
      failure_code: "STRING COMMENT 'System failure/error code'",
      
      // NOTIFICATION
      sender_notification_sent: "BOOLEAN",
      sender_notification_method: "STRING COMMENT 'Email|SMS|Push|In-App'",
      sender_notification_timestamp: "TIMESTAMP",
      
      receiver_notification_sent: "BOOLEAN",
      receiver_notification_method: "STRING",
      receiver_notification_timestamp: "TIMESTAMP",
      
      // CLAIMS & DISPUTES
      disputed: "BOOLEAN",
      dispute_id: "BIGINT COMMENT 'FK to dispute case'",
      
      // COMPLIANCE
      ofac_check_status: "STRING COMMENT 'Clear|Match|Manual Review'",
      aml_flag: "BOOLEAN",
      ctr_reportable: "BOOLEAN COMMENT '>$10K cash equivalent'",
      sar_filed: "BOOLEAN",
      
      // REGULATORY
      reg_e_applicable: "BOOLEAN COMMENT 'Regulation E consumer protection'",
      
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
  
  // Table 2: Bill Pay Transactions
  {
    name: 'bronze.retail_bill_pay_transactions',
    description: 'Bill payment transactions to payees',
    sourceSystem: 'BILL_PAY_PLATFORM',
    sourceTable: 'BILL_PAYMENTS',
    loadType: 'CDC',
    
    grain: 'One row per bill payment',
    primaryKey: ['bill_payment_id', 'source_system'],
    
    estimatedRows: 800000000,
    avgRowSize: 1536,
    estimatedSize: '1.2TB',
    
    schema: {
      bill_payment_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      bill_payment_uuid: "STRING UNIQUE",
      
      // PAYER (Customer)
      payer_customer_id: "BIGINT COMMENT 'FK to customer'",
      payer_account_id: "BIGINT COMMENT 'Source account for payment'",
      
      // PAYEE
      payee_id: "BIGINT COMMENT 'FK to payee master'",
      payee_name: "STRING COMMENT 'Payee business name'",
      payee_category: "STRING COMMENT 'Utility|Credit Card|Mortgage|Insurance|Other'",
      payee_type: "STRING COMMENT 'Electronic|Check'",
      
      payee_account_number: "STRING COMMENT 'Customer account number with payee'",
      
      // PAYEE ADDRESS (for check payments)
      payee_address_line1: "STRING",
      payee_address_line2: "STRING",
      payee_city: "STRING",
      payee_state: "STRING",
      payee_postal_code: "STRING",
      
      // PAYMENT DETAILS
      payment_date: "DATE COMMENT 'Date payment scheduled'",
      payment_timestamp: "TIMESTAMP",
      
      payment_amount: "DECIMAL(18,2)",
      payment_currency: "STRING",
      
      payment_status: "STRING COMMENT 'Scheduled|Processing|Sent|Delivered|Paid|Failed|Cancelled'",
      payment_status_date: "TIMESTAMP",
      
      // PAYMENT METHOD
      payment_method: "STRING COMMENT 'Electronic|Check|Debit Card'",
      delivery_method: "STRING COMMENT 'ACH|Wire|Check|RTP|Card Payment'",
      
      // TIMING
      scheduled_delivery_date: "DATE",
      actual_delivery_date: "DATE",
      payee_credit_date: "DATE COMMENT 'Date payee received funds'",
      
      lead_days: "INTEGER COMMENT 'Days in advance payment scheduled'",
      
      // CHECK-SPECIFIC
      check_number: "STRING COMMENT 'Check number if check payment'",
      check_mailed_date: "DATE",
      check_cashed_date: "DATE",
      
      // FEES
      payment_fee: "DECIMAL(18,2)",
      expedite_fee: "DECIMAL(18,2) COMMENT 'Fee for rush delivery'",
      
      fee_waived: "BOOLEAN",
      
      // RECURRING
      is_recurring: "BOOLEAN",
      recurring_schedule_id: "BIGINT",
      recurrence_frequency: "STRING COMMENT 'Weekly|Bi-Weekly|Monthly|Quarterly|Annually'",
      recurrence_number: "INTEGER",
      next_payment_date: "DATE",
      
      is_autopay: "BOOLEAN COMMENT 'Automatic payment from e-bill'",
      autopay_type: "STRING COMMENT 'Full Amount|Minimum Due|Fixed Amount'",
      
      // E-BILL INTEGRATION
      ebill_id: "BIGINT COMMENT 'FK to electronic bill if paying from e-bill'",
      ebill_amount: "DECIMAL(18,2) COMMENT 'Amount from e-bill'",
      ebill_due_date: "DATE",
      
      // MEMO
      payment_memo: "STRING",
      
      // CONFIRMATION
      confirmation_number: "STRING COMMENT 'Bill pay confirmation number'",
      payee_confirmation_number: "STRING COMMENT 'Confirmation from payee if available'",
      
      // PROCESSING
      processing_date: "DATE",
      cutoff_time_met: "BOOLEAN COMMENT 'Payment submitted before cutoff'",
      
      // CANCELLATION
      is_cancelled: "BOOLEAN",
      cancellation_date: "TIMESTAMP",
      cancellation_reason: "STRING",
      cancellable: "BOOLEAN COMMENT 'Can still be cancelled'",
      
      // FAILURE
      failure_reason: "STRING COMMENT 'Insufficient Funds|Invalid Account|Payee Refused'",
      
      // CHANNEL
      initiated_channel: "STRING COMMENT 'Mobile|Online|Phone|Branch'",
      
      // NOTIFICATIONS
      confirmation_email_sent: "BOOLEAN",
      payment_sent_notification: "BOOLEAN",
      delivery_confirmation_notification: "BOOLEAN",
      
      // AUDIT
      source_system: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 3: ACH Origination Transactions
  {
    name: 'bronze.retail_ach_origination',
    description: 'ACH payments originated by retail customers',
    sourceSystem: 'ACH_PROCESSOR',
    sourceTable: 'ACH_ORIGINATIONS',
    loadType: 'CDC',
    
    grain: 'One row per ACH transaction',
    primaryKey: ['ach_transaction_id', 'source_system'],
    
    schema: {
      ach_transaction_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      ach_trace_number: "STRING UNIQUE COMMENT 'NACHA trace number'",
      
      // ORIGINATOR
      originator_customer_id: "BIGINT",
      originator_account_id: "BIGINT",
      originator_name: "STRING",
      originator_routing_number: "STRING COMMENT 'ABA routing number'",
      
      // RECEIVER
      receiver_name: "STRING",
      receiver_account_number: "STRING COMMENT 'Encrypted'",
      receiver_routing_number: "STRING COMMENT 'ABA routing number'",
      receiver_account_type: "STRING COMMENT 'Checking|Savings'",
      
      // TRANSACTION
      transaction_date: "DATE",
      effective_date: "DATE COMMENT 'Settlement date'",
      
      transaction_amount: "DECIMAL(18,2)",
      
      transaction_code: "STRING COMMENT 'NACHA transaction code (22, 23, 27, 28, etc.)'",
      transaction_type: "STRING COMMENT 'Debit|Credit'",
      
      sec_code: "STRING COMMENT 'SEC code (PPD|CCD|WEB|TEL|etc.)'",
      sec_code_description: "STRING COMMENT 'Prearranged|Corporate|Web|Telephone'",
      
      company_entry_description: "STRING COMMENT 'Payment description'",
      individual_id_number: "STRING COMMENT 'Receiver identifier'",
      
      // STATUS
      ach_status: "STRING COMMENT 'Pending|Transmitted|Settled|Returned|Rejected'",
      ach_status_date: "DATE",
      
      // RETURN
      is_return: "BOOLEAN",
      return_reason_code: "STRING COMMENT 'NACHA return reason code (R01-R33)'",
      return_reason_description: "STRING COMMENT 'NSF|Account Closed|etc.'",
      return_date: "DATE",
      
      // NOTIFICATION OF CHANGE (NOC)
      is_noc: "BOOLEAN COMMENT 'Notification of Change received'",
      noc_code: "STRING",
      corrected_routing_number: "STRING",
      corrected_account_number: "STRING",
      
      // BATCH
      batch_number: "STRING COMMENT 'ACH batch identifier'",
      batch_date: "DATE",
      
      // AUDIT
      source_system: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 4: Wire Transfers
  {
    name: 'bronze.retail_wire_transfer_transactions',
    description: 'Domestic and international wire transfer transactions',
    sourceSystem: 'WIRE_SYSTEM',
    sourceTable: 'WIRE_TRANSFERS',
    loadType: 'CDC',
    grain: 'One row per wire transfer',
    primaryKey: ['wire_transfer_id', 'source_system'],
    schema: {
      wire_transfer_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      from_account_id: "BIGINT",
      wire_type: "STRING COMMENT 'Domestic|International|Incoming|Outgoing'",
      wire_date: "DATE",
      wire_amount: "DECIMAL(18,2)",
      wire_currency: "STRING",
      wire_fee: "DECIMAL(18,2)",
      beneficiary_name: "STRING",
      beneficiary_account: "STRING",
      beneficiary_bank: "STRING",
      beneficiary_bank_routing: "STRING",
      swift_code: "STRING",
      intermediary_bank: "STRING",
      purpose_of_payment: "STRING",
      wire_status: "STRING COMMENT 'Pending|Sent|Received|Failed|Cancelled'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 5: Internal Transfers
  {
    name: 'bronze.retail_internal_transfers',
    description: 'Transfers between own accounts within same bank',
    sourceSystem: 'CORE_BANKING',
    sourceTable: 'INTERNAL_TRANSFERS',
    loadType: 'CDC',
    grain: 'One row per internal transfer',
    primaryKey: ['transfer_id', 'source_system'],
    schema: {
      transfer_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      from_account_id: "BIGINT",
      to_account_id: "BIGINT",
      transfer_date: "DATE",
      transfer_amount: "DECIMAL(18,2)",
      transfer_type: "STRING COMMENT 'One-Time|Scheduled|Recurring'",
      transfer_channel: "STRING COMMENT 'Online|Mobile|Branch|ATM|Phone'",
      transfer_status: "STRING COMMENT 'Completed|Pending|Failed|Cancelled'",
      memo: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 6: External Transfers
  {
    name: 'bronze.retail_external_transfers',
    description: 'Transfers to external bank accounts',
    sourceSystem: 'PAYMENT_HUB',
    sourceTable: 'EXTERNAL_TRANSFERS',
    loadType: 'CDC',
    grain: 'One row per external transfer',
    primaryKey: ['transfer_id', 'source_system'],
    schema: {
      transfer_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      from_account_id: "BIGINT",
      to_external_account_id: "BIGINT COMMENT 'FK to linked external account'",
      transfer_date: "DATE",
      transfer_amount: "DECIMAL(18,2)",
      transfer_method: "STRING COMMENT 'ACH|Same-Day ACH|Wire'",
      external_bank_name: "STRING",
      external_routing_number: "STRING",
      external_account_number: "STRING ENCRYPTED",
      transfer_status: "STRING COMMENT 'Initiated|Processing|Completed|Failed|Returned'",
      expected_delivery_date: "DATE",
      actual_delivery_date: "DATE",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 7: Payee Master
  {
    name: 'bronze.retail_payee_master',
    description: 'Bill pay payee directory',
    sourceSystem: 'BILL_PAY_SYSTEM',
    sourceTable: 'PAYEES',
    loadType: 'SCD2',
    grain: 'One row per customer per payee',
    primaryKey: ['payee_id', 'source_system'],
    schema: {
      payee_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      payee_name: "STRING",
      payee_nickname: "STRING",
      payee_type: "STRING COMMENT 'Individual|Business|Utility|Government'",
      payee_account_number: "STRING",
      payee_address: "STRING",
      payee_phone: "STRING",
      payment_method: "STRING COMMENT 'Electronic|Check'",
      is_active: "BOOLEAN",
      date_added: "DATE",
      date_modified: "DATE",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 8: Payment Requests
  {
    name: 'bronze.retail_payment_requests',
    description: 'Payment requests sent or received (P2P)',
    sourceSystem: 'P2P_SYSTEM',
    sourceTable: 'PAYMENT_REQUESTS',
    loadType: 'CDC',
    grain: 'One row per payment request',
    primaryKey: ['request_id', 'source_system'],
    schema: {
      request_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      requester_customer_id: "BIGINT",
      payee_customer_id: "BIGINT",
      request_date: "DATE",
      request_amount: "DECIMAL(18,2)",
      request_reason: "STRING",
      request_status: "STRING COMMENT 'Pending|Paid|Declined|Expired|Cancelled'",
      payment_due_date: "DATE",
      payment_date: "DATE",
      payment_id: "BIGINT COMMENT 'FK to payment if paid'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 9: Recurring Payment Schedules
  {
    name: 'bronze.retail_recurring_payment_schedules',
    description: 'Recurring and scheduled payment setup',
    sourceSystem: 'BILL_PAY_SYSTEM',
    sourceTable: 'RECURRING_SCHEDULES',
    loadType: 'CDC',
    grain: 'One row per recurring schedule',
    primaryKey: ['schedule_id', 'source_system'],
    schema: {
      schedule_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      from_account_id: "BIGINT",
      payee_id: "BIGINT",
      schedule_type: "STRING COMMENT 'Recurring|One-Time Scheduled'",
      frequency: "STRING COMMENT 'Weekly|Bi-Weekly|Monthly|Quarterly'",
      payment_amount: "DECIMAL(18,2)",
      amount_type: "STRING COMMENT 'Fixed|Minimum Due|Full Balance|Other'",
      start_date: "DATE",
      end_date: "DATE",
      next_payment_date: "DATE",
      schedule_status: "STRING COMMENT 'Active|Paused|Completed|Cancelled'",
      autopay_flag: "BOOLEAN",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 10: Payment Limits
  {
    name: 'bronze.retail_payment_limits',
    description: 'Customer payment limits by transaction type',
    sourceSystem: 'PAYMENT_HUB',
    sourceTable: 'PAYMENT_LIMITS',
    loadType: 'SCD2',
    grain: 'One row per customer per limit type',
    primaryKey: ['customer_id', 'limit_type', 'effective_date', 'source_system'],
    schema: {
      customer_id: "BIGINT PRIMARY KEY",
      limit_type: "STRING PRIMARY KEY COMMENT 'ACH|Wire|P2P|Bill Pay|External Transfer'",
      effective_date: "DATE PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      expiration_date: "DATE",
      daily_limit: "DECIMAL(18,2)",
      weekly_limit: "DECIMAL(18,2)",
      monthly_limit: "DECIMAL(18,2)",
      per_transaction_limit: "DECIMAL(18,2)",
      current_daily_usage: "DECIMAL(18,2)",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 11: Payment Beneficiaries
  {
    name: 'bronze.retail_payment_beneficiaries',
    description: 'Saved beneficiaries for transfers and payments',
    sourceSystem: 'PAYMENT_HUB',
    sourceTable: 'BENEFICIARIES',
    loadType: 'SCD2',
    grain: 'One row per customer per beneficiary',
    primaryKey: ['beneficiary_id', 'source_system'],
    schema: {
      beneficiary_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      beneficiary_name: "STRING",
      beneficiary_nickname: "STRING",
      beneficiary_type: "STRING COMMENT 'Individual|Business'",
      relationship: "STRING",
      beneficiary_account_number: "STRING ENCRYPTED",
      beneficiary_routing_number: "STRING",
      beneficiary_bank_name: "STRING",
      beneficiary_email: "STRING",
      beneficiary_phone: "STRING",
      is_verified: "BOOLEAN",
      verification_method: "STRING COMMENT 'Micro-Deposit|Instant Verification|Manual'",
      date_added: "DATE",
      is_active: "BOOLEAN",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 12: Payment Templates
  {
    name: 'bronze.retail_payment_templates',
    description: 'Saved payment templates for quick payments',
    sourceSystem: 'PAYMENT_HUB',
    sourceTable: 'PAYMENT_TEMPLATES',
    loadType: 'CDC',
    grain: 'One row per template',
    primaryKey: ['template_id', 'source_system'],
    schema: {
      template_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      template_name: "STRING",
      from_account_id: "BIGINT",
      to_account_id: "BIGINT",
      beneficiary_id: "BIGINT",
      payment_type: "STRING COMMENT 'ACH|Wire|Internal|Bill Pay'",
      default_amount: "DECIMAL(18,2)",
      memo: "STRING",
      date_created: "DATE",
      last_used_date: "DATE",
      usage_count: "INTEGER",
      is_active: "BOOLEAN",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 13: Payment Approvals
  {
    name: 'bronze.retail_payment_approvals',
    description: 'Multi-party approval workflow for business accounts',
    sourceSystem: 'PAYMENT_HUB',
    sourceTable: 'PAYMENT_APPROVALS',
    loadType: 'CDC',
    grain: 'One row per approval request',
    primaryKey: ['approval_id', 'source_system'],
    schema: {
      approval_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      payment_id: "BIGINT",
      approval_level: "INTEGER COMMENT '1st approver, 2nd approver, etc.'",
      approver_customer_id: "BIGINT",
      approval_status: "STRING COMMENT 'Pending|Approved|Rejected'",
      approval_date: "DATE",
      approval_timestamp: "TIMESTAMP",
      rejection_reason: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 14: Payment Reversals
  {
    name: 'bronze.retail_payment_reversals',
    description: 'Payment reversal transactions',
    sourceSystem: 'PAYMENT_HUB',
    sourceTable: 'PAYMENT_REVERSALS',
    loadType: 'CDC',
    grain: 'One row per reversal',
    primaryKey: ['reversal_id', 'source_system'],
    schema: {
      reversal_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      original_payment_id: "BIGINT",
      reversal_date: "DATE",
      reversal_amount: "DECIMAL(18,2)",
      reversal_reason: "STRING COMMENT 'Customer Request|Fraud|Error|Return|NSF'",
      reversal_type: "STRING COMMENT 'Full|Partial'",
      reversal_status: "STRING COMMENT 'Completed|Failed|Pending'",
      initiated_by: "STRING COMMENT 'Customer|Bank|System'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 15: Payment Exceptions
  {
    name: 'bronze.retail_payment_exceptions',
    description: 'Failed or exceptional payment transactions',
    sourceSystem: 'PAYMENT_HUB',
    sourceTable: 'PAYMENT_EXCEPTIONS',
    loadType: 'CDC',
    grain: 'One row per exception',
    primaryKey: ['exception_id', 'source_system'],
    schema: {
      exception_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      payment_id: "BIGINT",
      exception_date: "DATE",
      exception_type: "STRING COMMENT 'Insufficient Funds|Invalid Account|Limit Exceeded|Fraud Hold|System Error'",
      exception_code: "STRING",
      exception_description: "STRING",
      exception_status: "STRING COMMENT 'Open|Resolved|Escalated'",
      resolution_date: "DATE",
      resolution_action: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 16: Payment Fees
  {
    name: 'bronze.retail_payment_fees',
    description: 'Payment fee schedule and assessments',
    sourceSystem: 'FEE_SYSTEM',
    sourceTable: 'PAYMENT_FEES',
    loadType: 'CDC',
    grain: 'One row per fee charged',
    primaryKey: ['fee_id', 'source_system'],
    schema: {
      fee_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      payment_id: "BIGINT",
      customer_id: "BIGINT",
      fee_date: "DATE",
      fee_type: "STRING COMMENT 'Wire Fee|Same-Day ACH|International|Stop Payment|Return Item'",
      fee_amount: "DECIMAL(18,2)",
      fee_waived: "BOOLEAN",
      waiver_reason: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 17: Payment Notifications
  {
    name: 'bronze.retail_payment_notifications',
    description: 'Payment alerts and notifications sent to customers',
    sourceSystem: 'NOTIFICATION_SYSTEM',
    sourceTable: 'PAYMENT_NOTIFICATIONS',
    loadType: 'CDC',
    grain: 'One row per notification',
    primaryKey: ['notification_id', 'source_system'],
    schema: {
      notification_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      payment_id: "BIGINT",
      customer_id: "BIGINT",
      notification_type: "STRING COMMENT 'Payment Sent|Payment Received|Payment Failed|Payment Scheduled|Limit Alert'",
      notification_message: "STRING",
      notification_timestamp: "TIMESTAMP",
      delivery_channel: "STRING COMMENT 'Email|SMS|Push|In-App'",
      delivery_status: "STRING COMMENT 'Sent|Delivered|Failed|Bounced'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 18: RTP Transactions
  {
    name: 'bronze.retail_rtp_transactions',
    description: 'Real-time payment (RTP) network transactions',
    sourceSystem: 'RTP_SYSTEM',
    sourceTable: 'RTP_TRANSACTIONS',
    loadType: 'STREAMING',
    grain: 'One row per RTP transaction',
    primaryKey: ['rtp_transaction_id', 'source_system'],
    schema: {
      rtp_transaction_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      transaction_timestamp: "TIMESTAMP",
      transaction_type: "STRING COMMENT 'Send|Receive'",
      transaction_amount: "DECIMAL(18,2)",
      counterparty_name: "STRING",
      counterparty_bank: "STRING",
      payment_purpose: "STRING",
      rtp_message_id: "STRING UNIQUE",
      settlement_status: "STRING COMMENT 'Settled|Pending|Failed'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 19: FedNow Transactions
  {
    name: 'bronze.retail_fednow_transactions',
    description: 'FedNow instant payment service transactions',
    sourceSystem: 'FEDNOW_SYSTEM',
    sourceTable: 'FEDNOW_TRANSACTIONS',
    loadType: 'STREAMING',
    grain: 'One row per FedNow transaction',
    primaryKey: ['fednow_transaction_id', 'source_system'],
    schema: {
      fednow_transaction_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      transaction_timestamp: "TIMESTAMP",
      transaction_type: "STRING COMMENT 'Credit|Debit'",
      transaction_amount: "DECIMAL(18,2)",
      originating_bank: "STRING",
      receiving_bank: "STRING",
      payment_reference: "STRING",
      settlement_timestamp: "TIMESTAMP",
      settlement_status: "STRING COMMENT 'Final|Pending|Returned'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 20: Mobile Wallet Payments
  {
    name: 'bronze.retail_mobile_wallet_payments',
    description: 'Mobile wallet payments (Apple Pay, Google Pay, etc.)',
    sourceSystem: 'MOBILE_WALLET_SYSTEM',
    sourceTable: 'WALLET_PAYMENTS',
    loadType: 'STREAMING',
    grain: 'One row per wallet payment',
    primaryKey: ['wallet_payment_id', 'source_system'],
    schema: {
      wallet_payment_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      wallet_type: "STRING COMMENT 'Apple Pay|Google Pay|Samsung Pay|Venmo|PayPal|Cash App'",
      payment_timestamp: "TIMESTAMP",
      payment_amount: "DECIMAL(18,2)",
      merchant_name: "STRING",
      merchant_category: "STRING",
      payment_method: "STRING COMMENT 'P2P|Merchant Payment'",
      payment_status: "STRING COMMENT 'Completed|Pending|Failed'",
      device_id: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 21: Payment Fraud Alerts
  {
    name: 'bronze.retail_payment_fraud_alerts',
    description: 'Fraud detection alerts for payment transactions',
    sourceSystem: 'FRAUD_DETECTION',
    sourceTable: 'PAYMENT_FRAUD_ALERTS',
    loadType: 'STREAMING',
    grain: 'One row per fraud alert',
    primaryKey: ['alert_id', 'source_system'],
    schema: {
      alert_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      payment_id: "BIGINT",
      customer_id: "BIGINT",
      alert_timestamp: "TIMESTAMP",
      fraud_score: "INTEGER COMMENT '0-100 risk score'",
      fraud_reason: "STRING COMMENT 'Unusual Recipient|Velocity|Amount|Location|Pattern'",
      alert_action: "STRING COMMENT 'Blocked|Hold for Review|Allowed'",
      review_status: "STRING COMMENT 'Pending Review|Cleared|Confirmed Fraud'",
      confirmed_fraud: "BOOLEAN",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 22: Payment Audit Log
  {
    name: 'bronze.retail_payment_audit_log',
    description: 'Comprehensive payment system audit trail',
    sourceSystem: 'PAYMENT_HUB',
    sourceTable: 'AUDIT_LOG',
    loadType: 'STREAMING',
    grain: 'One row per audit event',
    primaryKey: ['audit_id', 'source_system'],
    schema: {
      audit_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      payment_id: "BIGINT",
      event_timestamp: "TIMESTAMP",
      event_type: "STRING COMMENT 'Created|Modified|Approved|Rejected|Sent|Received|Failed|Cancelled'",
      event_description: "STRING",
      user_id: "BIGINT COMMENT 'User/system that triggered event'",
      user_type: "STRING COMMENT 'Customer|Employee|System'",
      ip_address: "STRING",
      device_info: "STRING",
      before_value: "STRING COMMENT 'JSON of state before change'",
      after_value: "STRING COMMENT 'JSON of state after change'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // ========================================
  // ISO 20022 & AML COMPLIANCE TABLES (P0)
  // ========================================

  // Table 23: ISO 20022 Payment Messages
  {
    name: 'bronze.retail_payment_iso20022_messages',
    description: 'ISO 20022 XML payment messages for cross-border and domestic payments (pain.001, pain.002, pacs.008)',
    sourceSystem: 'PAYMENT_GATEWAY',
    sourceTable: 'ISO20022_MESSAGES',
    loadType: 'STREAMING',

    grain: 'One row per ISO 20022 message',
    primaryKey: ['message_id', 'source_system'],

    partitioning: {
      type: 'RANGE',
      column: 'message_timestamp',
      ranges: ['Daily partitions'],
    },

    estimatedRows: 50000000,
    avgRowSize: 8192,
    estimatedSize: '400GB',

    schema: {
      // PRIMARY KEYS
      message_id: "BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique message identifier'",
      source_system: "STRING PRIMARY KEY COMMENT 'Source payment system'",

      // MESSAGE IDENTIFICATION
      message_uuid: "STRING UNIQUE COMMENT 'Global UUID'",
      message_reference: "STRING COMMENT 'Message reference (MsgId from ISO 20022)'",
      end_to_end_id: "STRING COMMENT 'End-to-end transaction ID (unique across institutions)'",
      uetr: "STRING COMMENT 'Unique End-to-end Transaction Reference (SWIFT gpi)'",

      // MESSAGE TYPE (ISO 20022)
      message_type: "STRING COMMENT 'pain.001|pain.002|pacs.008|pacs.002|pacs.004|pacs.009|camt.053|camt.054'",
      message_type_description: "STRING COMMENT 'Customer Credit Transfer Initiation|Payment Status Report|etc.'",
      message_version: "STRING COMMENT 'ISO 20022 version (e.g., pain.001.001.09)'",

      message_direction: "STRING COMMENT 'Inbound|Outbound'",

      // MESSAGE CONTENT
      message_xml: "STRING COMMENT 'Full ISO 20022 XML message'",
      message_json: "STRING COMMENT 'Parsed message as JSON for easier querying'",
      message_hash: "STRING COMMENT 'Hash of message for integrity'",

      // MESSAGE TIMING
      message_timestamp: "TIMESTAMP COMMENT 'Message creation timestamp'",
      message_date: "DATE COMMENT 'Business date of message'",
      creation_datetime: "TIMESTAMP COMMENT 'CreDtTm from ISO 20022'",

      received_timestamp: "TIMESTAMP COMMENT 'When we received the message'",
      sent_timestamp: "TIMESTAMP COMMENT 'When we sent the message (outbound)'",

      // RELATED PAYMENT
      payment_id: "BIGINT COMMENT 'FK to internal payment transaction'",
      payment_type: "STRING COMMENT 'Wire|ACH|RTP|Cross-Border'",

      // PARTIES (Extracted from ISO 20022)

      // Debtor (Payer/Originator)
      debtor_name: "STRING COMMENT 'Debtor name (Dbtr/Nm)'",
      debtor_account_iban: "STRING COMMENT 'Debtor IBAN (DbtrAcct/Id/IBAN)'",
      debtor_account_bban: "STRING COMMENT 'Debtor BBAN (Basic Bank Account Number)'",
      debtor_account_other: "STRING COMMENT 'Other account ID scheme'",
      debtor_address: "STRING COMMENT 'Debtor postal address'",
      debtor_country: "STRING COMMENT 'Debtor country code (ISO 3166)'",

      debtor_agent_bic: "STRING COMMENT 'Debtor agent BIC/SWIFT code (DbtrAgt/FinInstnId/BICFI)'",
      debtor_agent_name: "STRING COMMENT 'Debtor agent institution name'",
      debtor_agent_clearing_code: "STRING COMMENT 'Routing number/sort code'",

      // Creditor (Payee/Beneficiary)
      creditor_name: "STRING COMMENT 'Creditor name (Cdtr/Nm)'",
      creditor_account_iban: "STRING COMMENT 'Creditor IBAN (CdtrAcct/Id/IBAN)'",
      creditor_account_bban: "STRING COMMENT 'Creditor BBAN'",
      creditor_account_other: "STRING COMMENT 'Other account ID scheme'",
      creditor_address: "STRING COMMENT 'Creditor postal address'",
      creditor_country: "STRING COMMENT 'Creditor country code (ISO 3166)'",

      creditor_agent_bic: "STRING COMMENT 'Creditor agent BIC/SWIFT code (CdtrAgt/FinInstnId/BICFI)'",
      creditor_agent_name: "STRING COMMENT 'Creditor agent institution name'",
      creditor_agent_clearing_code: "STRING COMMENT 'Routing number/sort code'",

      // INTERMEDIARY AGENTS
      intermediary_agent_1_bic: "STRING COMMENT 'First intermediary BIC'",
      intermediary_agent_1_name: "STRING COMMENT 'First intermediary name'",
      intermediary_agent_2_bic: "STRING COMMENT 'Second intermediary BIC'",
      intermediary_agent_2_name: "STRING COMMENT 'Second intermediary name'",

      // AMOUNTS
      instructed_amount: "DECIMAL(18,2) COMMENT 'Instructed amount (InstdAmt)'",
      instructed_currency: "STRING COMMENT 'ISO 4217 currency code'",

      interbank_settlement_amount: "DECIMAL(18,2) COMMENT 'Settlement amount (IntrBkSttlmAmt)'",
      interbank_settlement_currency: "STRING COMMENT 'Settlement currency'",

      exchange_rate: "DECIMAL(15,8) COMMENT 'FX rate if currency conversion'",

      charge_bearer: "STRING COMMENT 'DEBT|CRED|SHAR|SLEV - who pays charges (ChrgBr)'",

      // PAYMENT PURPOSE & REMITTANCE
      payment_purpose_code: "STRING COMMENT 'Purpose code (Purp/Cd) - e.g., SALA, PENS, SUPP'",
      payment_purpose_proprietary: "STRING COMMENT 'Proprietary purpose code'",

      remittance_information_unstructured: "STRING COMMENT 'Free text remittance info'",
      remittance_information_structured: "STRING COMMENT 'Structured remittance (JSON)'",

      invoice_number: "STRING COMMENT 'Invoice number if present in structured remittance'",
      invoice_date: "DATE COMMENT 'Invoice date'",

      // REGULATORY REPORTING
      regulatory_reporting_code: "STRING COMMENT 'Regulatory reporting code'",
      regulatory_reporting_details: "STRING COMMENT 'Regulatory reporting details (JSON)'",

      // SERVICE LEVEL
      service_level_code: "STRING COMMENT 'SEPA|URGP|NURG - service level (SvcLvl/Cd)'",
      local_instrument_code: "STRING COMMENT 'Local instrument code (e.g., CORE, B2B for SEPA)'",
      category_purpose_code: "STRING COMMENT 'Category purpose (CtgyPurp/Cd)'",

      // CLEARING SYSTEM
      clearing_system_code: "STRING COMMENT 'Clearing system (e.g., FedACH, CHIPS, TARGET2)'",
      clearing_system_member_id: "STRING COMMENT 'Member ID in clearing system'",

      // PAYMENT SCHEME
      payment_scheme: "STRING COMMENT 'SWIFT|FedWire|SEPA|RTP|FedNow|CHIPS|CHAPS|BACS|TARGET2'",

      // MESSAGE STATUS
      message_status: "STRING COMMENT 'Pending|Accepted|Rejected|In Flight|Settled|Failed'",
      message_status_reason: "STRING COMMENT 'Status reason code (StsRsnInf)'",
      message_status_additional_info: "STRING COMMENT 'Additional status information'",

      // TIMESTAMPS (Payment Lifecycle)
      acceptance_datetime: "TIMESTAMP COMMENT 'When payment was accepted (AccptncDtTm)'",
      settlement_datetime: "TIMESTAMP COMMENT 'Interbank settlement date/time'",
      value_date: "DATE COMMENT 'Value date for beneficiary (ValDt)'",

      // TRACKING & CONFIRMATION
      instruction_id: "STRING COMMENT 'Instruction ID (InstrId)'",
      transaction_id: "STRING COMMENT 'Transaction ID (TxId)'",
      clearing_system_reference: "STRING COMMENT 'Clearing system reference'",

      original_message_id: "STRING COMMENT 'Original message ID (for status/return messages)'",
      original_message_type: "STRING COMMENT 'Original message type (for status/return messages)'",
      original_end_to_end_id: "STRING COMMENT 'Original end-to-end ID'",

      // RETURN/CANCELLATION (if applicable)
      return_flag: "BOOLEAN COMMENT 'Message is a return/reversal'",
      return_reason_code: "STRING COMMENT 'Return reason code (e.g., AC01 - Incorrect Account Number)'",
      return_reason_description: "STRING COMMENT 'Return reason description'",

      cancellation_request_flag: "BOOLEAN COMMENT 'Message is a cancellation request'",
      cancellation_reason: "STRING",

      // SWIFT GPI (Global Payments Innovation)
      swift_gpi_uetr: "STRING COMMENT 'SWIFT gpi Unique End-to-end Transaction Reference'",
      swift_gpi_tracker_status: "STRING COMMENT 'gpi tracker status'",
      swift_gpi_sla_expiry: "TIMESTAMP COMMENT 'gpi SLA expiry time'",
      swift_gpi_charge_details: "STRING COMMENT 'Detailed charge breakdown (JSON)'",

      // COMPLIANCE & AML
      sanctions_screening_status: "STRING COMMENT 'Passed|Failed|Pending Review'",
      sanctions_screening_timestamp: "TIMESTAMP",
      sanctions_hit_count: "INTEGER COMMENT 'Number of sanctions list matches'",

      aml_risk_score: "INTEGER COMMENT 'AML risk score 0-100'",
      aml_review_required: "BOOLEAN",
      aml_review_status: "STRING COMMENT 'Pending|Cleared|Escalated|SAR Filed'",

      pep_flag: "BOOLEAN COMMENT 'Politically Exposed Person flag'",
      high_risk_country_flag: "BOOLEAN COMMENT 'High-risk jurisdiction involved'",

      // VALIDATION & ERRORS
      schema_validation_status: "STRING COMMENT 'Valid|Invalid'",
      schema_validation_errors: "STRING COMMENT 'JSON array of validation errors'",

      business_validation_status: "STRING COMMENT 'Passed|Failed'",
      business_validation_errors: "STRING COMMENT 'Business rule validation errors'",

      // MESSAGE ROUTING
      routing_path: "STRING COMMENT 'JSON array of routing hops'",
      correspondent_bank_bic: "STRING COMMENT 'Correspondent bank BIC if routed'",

      // FEES & CHARGES
      charge_amount: "DECIMAL(18,2) COMMENT 'Total charges'",
      charge_currency: "STRING",
      charge_details: "STRING COMMENT 'JSON breakdown of charges'",

      // RECONCILIATION
      reconciliation_status: "STRING COMMENT 'Reconciled|Unreconciled|Exception'",
      reconciliation_timestamp: "TIMESTAMP",

      bank_accounting_entry_id: "BIGINT COMMENT 'FK to GL entry'",
      nostro_vostro_account_id: "BIGINT COMMENT 'Nostro/Vostro account affected'",

      // PRIORITY
      priority_code: "STRING COMMENT 'HIGH|NORM - payment priority'",
      sla_deadline: "TIMESTAMP COMMENT 'SLA deadline for processing'",
      sla_met: "BOOLEAN",

      // AUDIT TRAIL
      message_creator: "STRING COMMENT 'System/user who created message'",
      message_modifier: "STRING COMMENT 'Last modifier'",
      modification_history: "STRING COMMENT 'JSON array of modifications'",

      // ARCHIVAL & RETENTION
      archive_flag: "BOOLEAN COMMENT 'Message archived'",
      archive_date: "DATE",
      retention_expiry_date: "DATE COMMENT 'Date message can be purged'",

      // METADATA
      source_record_id: "STRING",
      source_file_name: "STRING COMMENT 'Source file if batch processed'",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 24: AML Party Network (Graph Model)
  {
    name: 'bronze.retail_payment_aml_party_network',
    description: 'Party-to-party payment network for AML graph analytics and pattern detection',
    sourceSystem: 'AML_SYSTEM',
    sourceTable: 'PARTY_NETWORK',
    loadType: 'STREAMING',

    grain: 'One row per party-to-party payment edge',
    primaryKey: ['network_edge_id', 'source_system'],

    partitioning: {
      type: 'RANGE',
      column: 'edge_date',
      ranges: ['Monthly partitions'],
    },

    estimatedRows: 1000000000,
    avgRowSize: 1024,
    estimatedSize: '1TB',

    schema: {
      // PRIMARY KEYS
      network_edge_id: "BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique edge identifier'",
      source_system: "STRING PRIMARY KEY",

      // GRAPH EDGE (Directional: FROM -> TO)
      from_party_id: "BIGINT COMMENT 'Sender party ID (node)'",
      to_party_id: "BIGINT COMMENT 'Receiver party ID (node)'",

      edge_type: "STRING COMMENT 'Payment|Wire|P2P|ACH|Check|Cash|Asset Transfer'",
      edge_date: "DATE COMMENT 'Date of transaction'",
      edge_timestamp: "TIMESTAMP COMMENT 'Exact time of transaction'",

      // EDGE WEIGHT (Transaction)
      transaction_id: "BIGINT COMMENT 'FK to underlying payment transaction'",
      transaction_amount: "DECIMAL(18,2) COMMENT 'Transaction amount'",
      transaction_currency: "STRING COMMENT 'ISO 4217 currency code'",
      transaction_amount_usd: "DECIMAL(18,2) COMMENT 'Amount in USD for normalization'",

      // PARTY ATTRIBUTES (FROM)
      from_party_type: "STRING COMMENT 'Individual|Entity|Government|NPO|PEP'",
      from_party_name: "STRING COMMENT 'Party name (masked if PII)'",
      from_party_customer_id: "BIGINT COMMENT 'FK to customer if internal'",
      from_party_account_id: "BIGINT COMMENT 'Account used for payment'",
      from_party_country: "STRING COMMENT 'ISO 3166 country code'",
      from_party_risk_rating: "STRING COMMENT 'Low|Medium|High|Critical'",

      from_party_is_customer: "BOOLEAN COMMENT 'From party is our customer'",
      from_party_pep_flag: "BOOLEAN COMMENT 'Politically Exposed Person'",
      from_party_sanctioned_flag: "BOOLEAN COMMENT 'On sanctions list'",

      // PARTY ATTRIBUTES (TO)
      to_party_type: "STRING COMMENT 'Individual|Entity|Government|NPO|PEP'",
      to_party_name: "STRING COMMENT 'Party name (masked if PII)'",
      to_party_customer_id: "BIGINT COMMENT 'FK to customer if internal'",
      to_party_account_id: "BIGINT COMMENT 'Account receiving payment'",
      to_party_country: "STRING COMMENT 'ISO 3166 country code'",
      to_party_risk_rating: "STRING COMMENT 'Low|Medium|High|Critical'",

      to_party_is_customer: "BOOLEAN COMMENT 'To party is our customer'",
      to_party_pep_flag: "BOOLEAN COMMENT 'Politically Exposed Person'",
      to_party_sanctioned_flag: "BOOLEAN COMMENT 'On sanctions list'",

      // RELATIONSHIP CHARACTERISTICS
      is_cross_border: "BOOLEAN COMMENT 'Payment crosses international borders'",
      is_high_risk_corridor: "BOOLEAN COMMENT 'High-risk country pairing (FATF)'",
      is_internal_transfer: "BOOLEAN COMMENT 'Both parties are customers'",
      is_first_time_payee: "BOOLEAN COMMENT 'First payment to this payee'",

      relationship_age_days: "INTEGER COMMENT 'Days since first transaction between parties'",
      prior_transaction_count: "INTEGER COMMENT 'Number of prior transactions'",
      prior_transaction_total_amount: "DECIMAL(18,2) COMMENT 'Sum of all prior transactions'",

      // VELOCITY & FREQUENCY
      transaction_count_24hr: "INTEGER COMMENT 'Transactions in last 24 hours'",
      transaction_count_7day: "INTEGER COMMENT 'Transactions in last 7 days'",
      transaction_count_30day: "INTEGER COMMENT 'Transactions in last 30 days'",

      transaction_amount_24hr: "DECIMAL(18,2) COMMENT 'Total amount in last 24 hours'",
      transaction_amount_7day: "DECIMAL(18,2) COMMENT 'Total amount in last 7 days'",
      transaction_amount_30day: "DECIMAL(18,2) COMMENT 'Total amount in last 30 days'",

      // PATTERN DETECTION
      pattern_type: "STRING COMMENT 'Structuring|Layering|Round-Robin|Fan-In|Fan-Out|Normal'",
      pattern_confidence: "DECIMAL(5,2) COMMENT 'Pattern detection confidence %'",

      structuring_flag: "BOOLEAN COMMENT 'Potential structuring (amounts just below threshold)'",
      layering_flag: "BOOLEAN COMMENT 'Potential layering (complex routing)'",
      smurfing_flag: "BOOLEAN COMMENT 'Multiple small transactions'",

      // NETWORK CENTRALITY (Graph Metrics)
      from_party_degree_centrality: "INTEGER COMMENT 'Number of unique parties FROM party transacts with'",
      to_party_degree_centrality: "INTEGER COMMENT 'Number of unique parties TO party transacts with'",

      from_party_betweenness_score: "DECIMAL(10,6) COMMENT 'Betweenness centrality score'",
      to_party_betweenness_score: "DECIMAL(10,6) COMMENT 'Betweenness centrality score'",

      // ANOMALY DETECTION
      anomaly_flag: "BOOLEAN COMMENT 'Transaction flagged as anomalous'",
      anomaly_score: "INTEGER COMMENT 'Anomaly score 0-100'",
      anomaly_reason: "STRING COMMENT 'Reason for anomaly flag'",

      deviation_from_baseline_pct: "DECIMAL(10,6) COMMENT '% deviation from normal behavior'",

      // AML SCREENING
      sanctions_screening_result: "STRING COMMENT 'Clear|Match|Potential Match'",
      sanctions_list_matches: "STRING COMMENT 'JSON array of sanctions list hits'",

      ofac_screening_result: "STRING COMMENT 'Clear|Match|Potential Match'",
      ofac_sdn_hit: "BOOLEAN COMMENT 'OFAC SDN list hit'",

      pep_screening_result: "STRING COMMENT 'Clear|Match|Potential Match'",

      // RISK SCORING
      transaction_risk_score: "INTEGER COMMENT 'Overall risk score 0-100'",
      risk_factors: "STRING COMMENT 'JSON array of risk factors contributing to score'",

      risk_category: "STRING COMMENT 'Low Risk|Medium Risk|High Risk|Critical'",

      // ALERT & INVESTIGATION
      alert_generated_flag: "BOOLEAN COMMENT 'AML alert generated'",
      alert_id: "BIGINT COMMENT 'FK to AML alert if generated'",
      alert_type: "STRING COMMENT 'Suspicious Activity|Threshold Breach|Pattern Match'",

      investigation_status: "STRING COMMENT 'None|Pending|In Progress|Closed|SAR Filed'",
      investigation_id: "BIGINT COMMENT 'FK to investigation case'",

      sar_filed: "BOOLEAN COMMENT 'Suspicious Activity Report filed'",
      sar_filing_date: "DATE",

      // COUNTERPARTY INFORMATION
      intermediary_banks: "STRING COMMENT 'JSON array of intermediary banks (for wires)'",
      correspondent_relationships: "STRING COMMENT 'Correspondent banking relationships involved'",

      // BUSINESS CONTEXT
      payment_purpose: "STRING COMMENT 'Stated purpose of payment'",
      payment_category: "STRING COMMENT 'Payroll|Invoice|Personal|Gift|Loan|Investment|etc.'",

      expected_activity_flag: "BOOLEAN COMMENT 'Payment matches expected profile'",
      business_justification: "STRING COMMENT 'Business justification if available'",

      // GEOGRAPHIC ANALYSIS
      from_country_risk_level: "STRING COMMENT 'Low|Medium|High (FATF)'",
      to_country_risk_level: "STRING COMMENT 'Low|Medium|High (FATF)'",

      fatf_high_risk_jurisdiction: "BOOLEAN COMMENT 'FATF high-risk or non-cooperative jurisdiction'",
      us_embargo_country: "BOOLEAN COMMENT 'US embargoed country'",

      // TIME-BASED ANALYSIS
      is_off_hours: "BOOLEAN COMMENT 'Transaction outside normal business hours'",
      is_weekend: "BOOLEAN COMMENT 'Transaction on weekend'",
      is_holiday: "BOOLEAN COMMENT 'Transaction on holiday'",

      hour_of_day: "INTEGER COMMENT 'Hour transaction initiated (0-23)'",
      day_of_week: "INTEGER COMMENT 'Day of week (1=Monday, 7=Sunday)'",

      // CHANNEL & DEVICE
      initiation_channel: "STRING COMMENT 'Mobile|Online|Branch|ATM|Phone'",
      initiation_device_id: "STRING COMMENT 'Device identifier'",
      initiation_ip_address: "STRING COMMENT 'IP address'",
      initiation_geolocation: "STRING COMMENT 'Lat/long if available'",

      // GRAPH COMMUNITY DETECTION
      community_id: "STRING COMMENT 'Community/cluster ID from graph analysis'",
      community_size: "INTEGER COMMENT 'Number of nodes in community'",
      community_risk_level: "STRING COMMENT 'Overall risk level of community'",

      // METADATA
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
];

export const paymentsRetailBronzeLayerComplete = {
  description: 'Complete bronze layer for retail payments domain with ISO 20022 and AML graph analytics',
  layer: 'BRONZE',
  tables: paymentsRetailBronzeTables,
  totalTables: 24,
  estimatedSize: '3.9TB',
  refreshFrequency: 'Real-time streaming + CDC',
  retention: '7 years',

  complianceFrameworks: [
    'ISO 20022',
    'SWIFT gpi',
    'Bank Secrecy Act (BSA)',
    'USA PATRIOT Act',
    'FinCEN AML requirements',
    'OFAC sanctions screening',
    'NACHA Operating Rules',
    'Reg E (Electronic Fund Transfers)',
  ],

  keyFeatures: [
    'P2P payments (Zelle, Venmo-like)',
    'Bill pay (electronic and check)',
    'ACH origination',
    'Wire transfers (domestic/international)',
    'Internal and external account transfers',
    'Real-time payments (RTP, FedNow)',
    'Mobile wallet payments',
    'Recurring payment schedules',
    'Payment requests',
    'Multi-party approvals',
    'Fraud detection',
    'NACHA compliance',
    'OFAC/AML screening',
    'ISO 20022 payment messaging (pain.001, pacs.008, camt.053)',
    'Cross-border payment reconciliation',
    'AML graph analytics (party-to-party network)',
    'Sanctions screening and PEP detection',
    'Transaction monitoring and suspicious activity detection',
  ],
};
