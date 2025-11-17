/**
 * PAYMENTS-RETAIL GOLD LAYER - Complete Implementation
 * 
 * Dimensional model (Kimball methodology) with:
 * - 10 Dimensions
 * - 6 Fact Tables
 * 
 * Grade A Target: Analytics-ready star schema for payment analytics
 */

export const paymentsRetailGoldDimensions = [
  // Dimension 1: Payee
  {
    name: 'gold.dim_payee',
    description: 'Bill pay payee dimension',
    type: 'SCD Type 2',
    grain: 'One row per payee',
    
    primaryKey: 'payee_key',
    naturalKey: 'payee_id',
    
    schema: {
      payee_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      payee_id: "BIGINT",
      payee_name: "STRING",
      payee_dba_name: "STRING",
      
      payee_category_l1: "STRING COMMENT 'Utility|Financial|Healthcare|Government|Other'",
      payee_category_l2: "STRING COMMENT 'Electric|Gas|Water|Credit Card|Mortgage|etc.'",
      payee_type: "STRING COMMENT 'Electronic|Check'",
      
      payment_acceptance_methods: "STRING COMMENT 'ACH|Check|Card|Wire'",
      
      average_payment_amount: "DECIMAL(18,2)",
      median_payment_amount: "DECIMAL(18,2)",
      
      supports_ebill: "BOOLEAN",
      supports_autopay: "BOOLEAN",
      
      payee_address: "STRING",
      payee_city: "STRING",
      payee_state: "STRING",
      payee_postal_code: "STRING",
      
      is_active: "BOOLEAN",
      
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
    
    hierarchies: [
      {
        name: 'Payee Category Hierarchy',
        levels: [
          { level: 1, attribute: 'payee_category_l1', description: 'Top category' },
          { level: 2, attribute: 'payee_category_l2', description: 'Detail category' },
        ],
      },
    ],
  },
  
  // Dimension 2: Payment Method
  {
    name: 'gold.dim_payment_method',
    description: 'Payment method and delivery taxonomy',
    type: 'SCD Type 1',
    grain: 'One row per payment method',
    
    primaryKey: 'payment_method_key',
    naturalKey: 'payment_method_code',
    
    schema: {
      payment_method_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      payment_method_code: "STRING UNIQUE",
      payment_method_name: "STRING COMMENT 'P2P|Bill Pay|ACH|Wire|Transfer'",
      payment_method_description: "STRING",
      
      payment_category: "STRING COMMENT 'Person to Person|Bill Payment|Account Transfer|Wire'",
      payment_subcategory: "STRING",
      
      delivery_method: "STRING COMMENT 'ACH|Wire|Check|RTP|FedNow|Card'",
      payment_rail: "STRING COMMENT 'Real-Time|Same-Day ACH|Next-Day ACH|Wire Network'",
      
      is_real_time: "BOOLEAN",
      is_same_day: "BOOLEAN",
      is_next_day: "BOOLEAN",
      is_multi_day: "BOOLEAN",
      
      typical_delivery_days: "INTEGER",
      
      requires_approval: "BOOLEAN",
      supports_recurring: "BOOLEAN",
      supports_scheduling: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 3: Payment Network
  {
    name: 'gold.dim_payment_network',
    description: 'Payment processing network dimension',
    type: 'SCD Type 1',
    grain: 'One row per payment network',
    
    primaryKey: 'payment_network_key',
    naturalKey: 'payment_network_code',
    
    schema: {
      payment_network_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      payment_network_code: "STRING UNIQUE",
      payment_network_name: "STRING COMMENT 'Zelle|RTP|FedNow|ACH|Fedwire|SWIFT'",
      payment_network_description: "STRING",
      
      network_type: "STRING COMMENT 'Real-Time|Batch|Wire'",
      network_operator: "STRING COMMENT 'Early Warning|TCH|Federal Reserve|SWIFT'",
      
      supports_domestic: "BOOLEAN",
      supports_international: "BOOLEAN",
      
      settlement_speed: "STRING COMMENT 'Instant|Same Day|Next Day|Multi-Day'",
      
      fee_structure: "STRING",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 4: Payment Status
  {
    name: 'gold.dim_payment_status',
    description: 'Payment transaction status dimension',
    type: 'SCD Type 1',
    grain: 'One row per payment status',
    
    primaryKey: 'payment_status_key',
    naturalKey: 'payment_status_code',
    
    schema: {
      payment_status_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      payment_status_code: "STRING UNIQUE",
      payment_status_name: "STRING COMMENT 'Pending|Processing|Completed|Failed|Cancelled|Reversed'",
      payment_status_description: "STRING",
      
      status_category: "STRING COMMENT 'In Progress|Success|Failure|Cancelled'",
      
      is_final: "BOOLEAN COMMENT 'Terminal status'",
      is_successful: "BOOLEAN",
      is_failed: "BOOLEAN",
      is_pending: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 5: ACH SEC Code
  {
    name: 'gold.dim_ach_sec_code',
    description: 'ACH Standard Entry Class codes',
    type: 'SCD Type 1',
    grain: 'One row per SEC code',
    
    primaryKey: 'ach_sec_code_key',
    naturalKey: 'sec_code',
    
    schema: {
      ach_sec_code_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      sec_code: "STRING UNIQUE COMMENT 'PPD|CCD|WEB|TEL|POP|etc.'",
      sec_code_name: "STRING",
      sec_code_description: "STRING",
      
      sec_code_category: "STRING COMMENT 'Consumer|Corporate|E-Commerce'",
      
      authorization_type: "STRING COMMENT 'Written|Oral|Electronic'",
      
      typical_use_case: "STRING",
      
      is_consumer: "BOOLEAN",
      is_corporate: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 6: Beneficiary
  {
    name: 'gold.dim_payment_beneficiary',
    description: 'Saved payment beneficiary dimension',
    type: 'SCD Type 2',
    grain: 'One row per beneficiary',
    
    primaryKey: 'beneficiary_key',
    naturalKey: 'beneficiary_id',
    
    schema: {
      beneficiary_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      beneficiary_id: "BIGINT",
      
      customer_key: "BIGINT COMMENT 'FK to dim_customer who created beneficiary'",
      customer_id: "BIGINT",
      
      beneficiary_name: "STRING",
      beneficiary_nickname: "STRING",
      beneficiary_type: "STRING COMMENT 'Individual|Business'",
      
      account_last_four: "STRING",
      bank_name: "STRING",
      routing_number: "STRING",
      
      beneficiary_country: "STRING",
      is_domestic: "BOOLEAN",
      is_international: "BOOLEAN",
      
      preferred_payment_method: "STRING",
      
      is_verified: "BOOLEAN",
      verification_date: "DATE",
      
      is_active: "BOOLEAN",
      
      total_payments_sent: "INTEGER",
      total_amount_sent: "DECIMAL(18,2)",
      last_payment_date: "DATE",
      
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
  },
  
  // Dimension 7: Recurring Schedule
  {
    name: 'gold.dim_recurring_payment_schedule',
    description: 'Recurring payment schedule dimension',
    type: 'SCD Type 2',
    grain: 'One row per recurring schedule',
    
    primaryKey: 'recurring_schedule_key',
    naturalKey: 'recurring_schedule_id',
    
    schema: {
      recurring_schedule_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      recurring_schedule_id: "BIGINT",
      
      customer_key: "BIGINT",
      customer_id: "BIGINT",
      
      schedule_type: "STRING COMMENT 'Fixed Amount|Variable Amount'",
      recurrence_frequency: "STRING COMMENT 'Weekly|Bi-Weekly|Monthly|Quarterly|Annually'",
      recurrence_frequency_days: "INTEGER",
      
      payment_type: "STRING COMMENT 'Bill Pay|P2P|Transfer'",
      
      payment_amount: "DECIMAL(18,2) COMMENT 'Fixed amount if applicable'",
      
      start_date: "DATE",
      end_date: "DATE COMMENT 'NULL for indefinite'",
      next_payment_date: "DATE",
      
      total_payments_scheduled: "INTEGER",
      total_payments_completed: "INTEGER",
      total_payments_failed: "INTEGER",
      
      schedule_status: "STRING COMMENT 'Active|Paused|Completed|Cancelled'",
      
      is_autopay: "BOOLEAN",
      
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
  },
  
  // Dimension 8: Payment Failure Reason
  {
    name: 'gold.dim_payment_failure_reason',
    description: 'Payment failure reason taxonomy',
    type: 'SCD Type 1',
    grain: 'One row per failure reason',
    
    primaryKey: 'failure_reason_key',
    naturalKey: 'failure_reason_code',
    
    schema: {
      failure_reason_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      failure_reason_code: "STRING UNIQUE",
      failure_reason_name: "STRING COMMENT 'Insufficient Funds|Invalid Account|Account Closed|etc.'",
      failure_reason_description: "STRING",
      
      failure_category: "STRING COMMENT 'Funds|Account|Network|Compliance|Other'",
      
      is_retriable: "BOOLEAN COMMENT 'Can payment be retried'",
      is_customer_actionable: "BOOLEAN COMMENT 'Customer can fix'",
      
      typical_resolution: "STRING",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 9: Wire Type
  {
    name: 'gold.dim_wire_type',
    description: 'Wire transfer type dimension',
    type: 'SCD Type 1',
    grain: 'One row per wire type',
    
    primaryKey: 'wire_type_key',
    naturalKey: 'wire_type_code',
    
    schema: {
      wire_type_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      wire_type_code: "STRING UNIQUE",
      wire_type_name: "STRING COMMENT 'Domestic Outgoing|Domestic Incoming|International Outgoing|International Incoming'",
      wire_type_description: "STRING",
      
      wire_direction: "STRING COMMENT 'Outgoing|Incoming'",
      wire_scope: "STRING COMMENT 'Domestic|International'",
      
      typical_network: "STRING COMMENT 'Fedwire|SWIFT|CHIPS'",
      typical_fee: "DECIMAL(18,2)",
      
      requires_beneficiary_swift: "BOOLEAN",
      requires_intermediary_bank: "BOOLEAN",
      
      typical_delivery_time: "STRING COMMENT 'Same Day|1-2 Days|3-5 Days'",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 10: Payment Channel
  {
    name: 'gold.dim_payment_channel',
    description: 'Payment initiation channel dimension',
    type: 'SCD Type 1',
    grain: 'One row per payment channel',
    conformedDimension: true,
    
    primaryKey: 'payment_channel_key',
    naturalKey: 'payment_channel_code',
    
    schema: {
      payment_channel_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      payment_channel_code: "STRING UNIQUE",
      payment_channel_name: "STRING COMMENT 'Mobile|Online|Branch|Phone|ATM|API'",
      payment_channel_description: "STRING",
      
      channel_category: "STRING COMMENT 'Digital|Physical|Automated'",
      channel_type: "STRING COMMENT 'Self-Service|Assisted'",
      
      is_digital: "BOOLEAN",
      is_self_service: "BOOLEAN",
      
      supports_scheduling: "BOOLEAN",
      supports_recurring: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
];

export const paymentsRetailGoldFacts = [
  // Fact 1: Payment Transactions
  {
    name: 'gold.fact_retail_payment_transaction',
    description: 'All payment transactions (P2P, bill pay, transfers, wires)',
    factType: 'Transaction',
    grain: 'One row per payment transaction',
    
    dimensions: [
      'customer_key (sender)',
      'account_key (source account)',
      'transaction_date_key',
      'payment_method_key',
      'payment_network_key',
      'payment_status_key',
      'payment_channel_key',
    ],
    
    schema: {
      payment_transaction_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      // DIMENSION KEYS
      customer_key: "BIGINT COMMENT 'FK to dim_retail_customer (sender)'",
      account_key: "BIGINT COMMENT 'FK to dim_retail_deposit_account (source)'",
      transaction_date_key: "INTEGER COMMENT 'FK to dim_date'",
      payment_method_key: "BIGINT COMMENT 'FK to dim_payment_method'",
      payment_network_key: "BIGINT COMMENT 'FK to dim_payment_network'",
      payment_status_key: "BIGINT COMMENT 'FK to dim_payment_status'",
      payment_channel_key: "BIGINT COMMENT 'FK to dim_payment_channel'",
      
      // DEGENERATE DIMENSIONS
      transaction_id: "BIGINT",
      transaction_reference_number: "STRING",
      
      transaction_timestamp: "TIMESTAMP",
      
      // MEASURES
      payment_amount: "DECIMAL(18,2)",
      payment_amount_usd: "DECIMAL(18,2)",
      
      payment_fee: "DECIMAL(18,2)",
      network_fee: "DECIMAL(18,2)",
      total_fees: "DECIMAL(18,2)",
      
      // TIME MEASURES
      days_to_delivery: "INTEGER",
      hours_to_completion: "INTEGER",
      
      // FLAGS
      is_completed: "BOOLEAN",
      is_failed: "BOOLEAN",
      is_cancelled: "BOOLEAN",
      is_reversed: "BOOLEAN",
      is_recurring: "BOOLEAN",
      is_scheduled: "BOOLEAN",
      is_real_time: "BOOLEAN",
      is_international: "BOOLEAN",
      
      // FRAUD & RISK
      fraud_score: "INTEGER COMMENT '0-100'",
      fraud_flag: "BOOLEAN",
      risk_level: "STRING",
      
      // COMPLIANCE
      ofac_checked: "BOOLEAN",
      aml_flag: "BOOLEAN",
      ctr_reportable: "BOOLEAN",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    partitioning: {
      type: 'RANGE',
      column: 'transaction_date_key',
      ranges: ['Monthly partitions'],
    },
    
    estimatedRows: 5000000000,
    estimatedSize: '1.5TB',
  },
  
  // Fact 2: P2P Payments
  {
    name: 'gold.fact_retail_p2p_payment',
    description: 'Peer-to-peer payment fact table',
    factType: 'Transaction',
    grain: 'One row per P2P payment',
    
    dimensions: [
      'sender_customer_key',
      'receiver_customer_key',
      'sender_account_key',
      'receiver_account_key',
      'transaction_date_key',
      'payment_method_key',
      'payment_network_key',
      'payment_status_key',
      'payment_channel_key',
    ],
    
    schema: {
      p2p_payment_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      sender_customer_key: "BIGINT",
      receiver_customer_key: "BIGINT COMMENT 'NULL if external'",
      sender_account_key: "BIGINT",
      receiver_account_key: "BIGINT",
      transaction_date_key: "INTEGER",
      payment_method_key: "BIGINT",
      payment_network_key: "BIGINT",
      payment_status_key: "BIGINT",
      payment_channel_key: "BIGINT",
      
      p2p_transaction_id: "BIGINT UNIQUE",
      
      transaction_timestamp: "TIMESTAMP",
      
      payment_amount: "DECIMAL(18,2)",
      
      sender_fee: "DECIMAL(18,2)",
      receiver_fee: "DECIMAL(18,2)",
      network_fee: "DECIMAL(18,2)",
      
      days_to_delivery: "INTEGER",
      
      is_internal_transfer: "BOOLEAN COMMENT 'Both parties are bank customers'",
      is_completed: "BOOLEAN",
      is_failed: "BOOLEAN",
      is_recurring: "BOOLEAN",
      
      fraud_score: "INTEGER",
      fraud_flag: "BOOLEAN",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 2000000000,
    estimatedSize: '500GB',
  },
  
  // Fact 3: Bill Payments
  {
    name: 'gold.fact_retail_bill_payment',
    description: 'Bill payment fact table',
    factType: 'Transaction',
    grain: 'One row per bill payment',
    
    dimensions: [
      'payer_customer_key',
      'payer_account_key',
      'payee_key',
      'payment_date_key',
      'delivery_date_key',
      'payment_method_key',
      'payment_status_key',
      'payment_channel_key',
      'recurring_schedule_key',
    ],
    
    schema: {
      bill_payment_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      payer_customer_key: "BIGINT",
      payer_account_key: "BIGINT",
      payee_key: "BIGINT COMMENT 'FK to dim_payee'",
      payment_date_key: "INTEGER",
      delivery_date_key: "INTEGER COMMENT 'FK to dim_date'",
      payment_method_key: "BIGINT",
      payment_status_key: "BIGINT",
      payment_channel_key: "BIGINT",
      recurring_schedule_key: "BIGINT COMMENT 'NULL if one-time'",
      
      bill_payment_id: "BIGINT UNIQUE",
      confirmation_number: "STRING",
      
      payment_timestamp: "TIMESTAMP",
      
      payment_amount: "DECIMAL(18,2)",
      payment_fee: "DECIMAL(18,2)",
      expedite_fee: "DECIMAL(18,2)",
      
      days_in_advance: "INTEGER COMMENT 'Days before due date'",
      days_to_delivery: "INTEGER",
      
      is_autopay: "BOOLEAN",
      is_recurring: "BOOLEAN",
      is_ebill: "BOOLEAN",
      is_check_payment: "BOOLEAN",
      is_electronic: "BOOLEAN",
      is_completed: "BOOLEAN",
      is_failed: "BOOLEAN",
      
      check_number: "STRING",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 3000000000,
    estimatedSize: '600GB',
  },
  
  // Fact 4: ACH Transactions
  {
    name: 'gold.fact_retail_ach_transaction',
    description: 'ACH transaction fact table',
    factType: 'Transaction',
    grain: 'One row per ACH transaction',
    
    dimensions: [
      'originator_customer_key',
      'originator_account_key',
      'transaction_date_key',
      'effective_date_key',
      'ach_sec_code_key',
      'payment_status_key',
    ],
    
    schema: {
      ach_transaction_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      originator_customer_key: "BIGINT",
      originator_account_key: "BIGINT",
      transaction_date_key: "INTEGER",
      effective_date_key: "INTEGER",
      ach_sec_code_key: "BIGINT COMMENT 'FK to dim_ach_sec_code'",
      payment_status_key: "BIGINT",
      
      ach_transaction_id: "BIGINT UNIQUE",
      ach_trace_number: "STRING",
      
      transaction_amount: "DECIMAL(18,2)",
      
      transaction_type: "STRING COMMENT 'Debit|Credit'",
      
      days_to_settlement: "INTEGER",
      
      is_return: "BOOLEAN",
      is_noc: "BOOLEAN COMMENT 'Notification of Change'",
      is_settled: "BOOLEAN",
      is_rejected: "BOOLEAN",
      
      return_reason_code: "STRING",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 1000000000,
    estimatedSize: '200GB',
  },
  
  // Fact 5: Wire Transfers
  {
    name: 'gold.fact_retail_wire_transfer',
    description: 'Wire transfer fact table',
    factType: 'Transaction',
    grain: 'One row per wire transfer',
    
    dimensions: [
      'customer_key',
      'account_key',
      'transaction_date_key',
      'wire_type_key',
      'payment_status_key',
      'payment_channel_key',
      'beneficiary_key',
    ],
    
    schema: {
      wire_transfer_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      customer_key: "BIGINT",
      account_key: "BIGINT",
      transaction_date_key: "INTEGER",
      wire_type_key: "BIGINT COMMENT 'FK to dim_wire_type'",
      payment_status_key: "BIGINT",
      payment_channel_key: "BIGINT",
      beneficiary_key: "BIGINT",
      
      wire_transfer_id: "BIGINT UNIQUE",
      wire_reference_number: "STRING",
      
      wire_amount: "DECIMAL(18,2)",
      wire_currency: "STRING",
      
      exchange_rate: "DECIMAL(12,6)",
      beneficiary_amount: "DECIMAL(18,2)",
      beneficiary_currency: "STRING",
      
      wire_fee: "DECIMAL(18,2)",
      correspondent_fee: "DECIMAL(18,2)",
      beneficiary_fee: "DECIMAL(18,2)",
      total_fees: "DECIMAL(18,2)",
      
      is_international: "BOOLEAN",
      is_completed: "BOOLEAN",
      is_recalled: "BOOLEAN",
      
      ofac_checked: "BOOLEAN",
      aml_risk_score: "INTEGER",
      ctr_reportable: "BOOLEAN",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 50000000,
    estimatedSize: '15GB',
  },
  
  // Fact 6: Payment Failures
  {
    name: 'gold.fact_retail_payment_failure',
    description: 'Failed payment analysis fact table',
    factType: 'Transaction',
    grain: 'One row per failed payment',
    
    dimensions: [
      'customer_key',
      'account_key',
      'failure_date_key',
      'payment_method_key',
      'failure_reason_key',
      'payment_channel_key',
    ],
    
    schema: {
      payment_failure_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      customer_key: "BIGINT",
      account_key: "BIGINT",
      failure_date_key: "INTEGER",
      payment_method_key: "BIGINT",
      failure_reason_key: "BIGINT COMMENT 'FK to dim_payment_failure_reason'",
      payment_channel_key: "BIGINT",
      
      original_payment_id: "BIGINT",
      
      failure_timestamp: "TIMESTAMP",
      
      attempted_payment_amount: "DECIMAL(18,2)",
      
      account_balance_at_failure: "DECIMAL(18,2) COMMENT 'If insufficient funds'",
      shortfall_amount: "DECIMAL(18,2)",
      
      retry_attempted: "BOOLEAN",
      retry_successful: "BOOLEAN",
      retry_date: "DATE",
      
      customer_notified: "BOOLEAN",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 200000000,
    estimatedSize: '40GB',
  },
];

export const paymentsRetailGoldLayerComplete = {
  description: 'Complete gold layer for retail payments domain with dimensional model',
  layer: 'GOLD',
  dimensions: paymentsRetailGoldDimensions,
  facts: paymentsRetailGoldFacts,
  totalDimensions: 10,
  totalFacts: 6,
  estimatedSize: '2.9TB',
  refreshFrequency: 'Daily for snapshots, Real-time for transactions',
  methodology: 'Kimball Dimensional Modeling',
};
