/**
 * PAYMENTS-RETAIL ERD DEFINITIONS
 * 
 * Logical and Physical ERD definitions for retail payments
 * Sources: Zelle/Early Warning, FedNow, RTP Network, ACH processors
 */

// LOGICAL ERD - Business Model
export const paymentsRetailLogicalERD = {
  entities: [
    {
      name: 'P2P Payment',
      type: 'event',
      description: 'Peer-to-peer payments (Zelle, etc.)',
      attributes: [
        { name: 'p2p_transaction_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'transaction_timestamp', type: 'TIMESTAMP' },
        { name: 'sender_customer_id', type: 'BIGINT', isForeignKey: true },
        { name: 'receiver_customer_id', type: 'BIGINT', isForeignKey: true },
        { name: 'transaction_amount', type: 'DECIMAL(18,2)' },
        { name: 'transaction_status', type: 'STRING', description: 'Pending|Completed|Failed|Cancelled' },
        { name: 'payment_method', type: 'STRING', description: 'Zelle|Internal|RTP|FedNow' },
        { name: 'payment_rail', type: 'STRING', description: 'Real-Time|Same-Day ACH|Next-Day ACH' },
        { name: 'is_internal_transfer', type: 'BOOLEAN', description: 'Both parties are customers' },
        { name: 'fraud_score', type: 'INTEGER', description: 'Fraud risk score 0-100' },
      ],
    },
    {
      name: 'Bill Payment',
      type: 'event',
      description: 'Bill pay transactions',
      attributes: [
        { name: 'bill_payment_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'customer_id', type: 'BIGINT', isForeignKey: true },
        { name: 'payee_id', type: 'BIGINT', isForeignKey: true },
        { name: 'payment_date', type: 'DATE' },
        { name: 'payment_amount', type: 'DECIMAL(18,2)' },
        { name: 'payment_status', type: 'STRING', description: 'Scheduled|Processing|Sent|Delivered|Failed' },
        { name: 'payment_method', type: 'STRING', description: 'Electronic|Check|Same-Day' },
        { name: 'is_recurring', type: 'BOOLEAN' },
        { name: 'recurring_frequency', type: 'STRING', description: 'Weekly|Bi-Weekly|Monthly|Quarterly' },
      ],
    },
    {
      name: 'ACH Transaction',
      type: 'event',
      description: 'ACH credits and debits',
      attributes: [
        { name: 'ach_transaction_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'account_id', type: 'BIGINT', isForeignKey: true },
        { name: 'transaction_date', type: 'DATE' },
        { name: 'transaction_amount', type: 'DECIMAL(18,2)' },
        { name: 'transaction_type', type: 'STRING', description: 'Credit|Debit' },
        { name: 'sec_code', type: 'STRING', description: 'PPD|CCD|WEB|TEL' },
        { name: 'company_name', type: 'STRING', description: 'Originating company' },
        { name: 'company_id', type: 'STRING', description: 'Company ID' },
        { name: 'transaction_status', type: 'STRING', description: 'Pending|Posted|Returned' },
        { name: 'return_reason_code', type: 'STRING', description: 'R01-R33 return codes' },
      ],
    },
    {
      name: 'Wire Transfer',
      type: 'event',
      description: 'Domestic and international wire transfers',
      attributes: [
        { name: 'wire_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'sender_account_id', type: 'BIGINT', isForeignKey: true },
        { name: 'transaction_timestamp', type: 'TIMESTAMP' },
        { name: 'wire_amount', type: 'DECIMAL(18,2)' },
        { name: 'wire_currency', type: 'STRING', description: 'ISO 4217' },
        { name: 'wire_type', type: 'STRING', description: 'Domestic|International|Book Transfer' },
        { name: 'wire_network', type: 'STRING', description: 'Fedwire|SWIFT|CHIPS' },
        { name: 'wire_status', type: 'STRING', description: 'Pending|Sent|Delivered|Returned|Cancelled' },
        { name: 'beneficiary_name', type: 'STRING' },
        { name: 'beneficiary_account_number', type: 'STRING' },
        { name: 'beneficiary_bank_name', type: 'STRING' },
        { name: 'swift_code', type: 'STRING', description: 'For international wires' },
        { name: 'wire_fee_amount', type: 'DECIMAL(18,2)' },
      ],
    },
    {
      name: 'Internal Transfer',
      type: 'event',
      description: 'Transfers between customer accounts',
      attributes: [
        { name: 'transfer_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'customer_id', type: 'BIGINT', isForeignKey: true },
        { name: 'from_account_id', type: 'BIGINT', isForeignKey: true },
        { name: 'to_account_id', type: 'BIGINT', isForeignKey: true },
        { name: 'transfer_timestamp', type: 'TIMESTAMP' },
        { name: 'transfer_amount', type: 'DECIMAL(18,2)' },
        { name: 'transfer_status', type: 'STRING', description: 'Completed|Pending|Failed|Cancelled' },
        { name: 'is_scheduled', type: 'BOOLEAN' },
        { name: 'is_recurring', type: 'BOOLEAN' },
      ],
    },
  ],
  relationships: [
    {
      from: 'P2P Payment',
      to: 'Customer',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'sender_customer_id',
    },
    {
      from: 'Bill Payment',
      to: 'Customer',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'customer_id',
    },
    {
      from: 'ACH Transaction',
      to: 'Account',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'account_id',
    },
    {
      from: 'Wire Transfer',
      to: 'Account',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'sender_account_id',
    },
    {
      from: 'Internal Transfer',
      to: 'Account',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'from_account_id',
    },
  ],
};

// PHYSICAL ERD - Bronze Layer
export const paymentsRetailPhysicalERD = {
  tables: [
    {
      name: 'bronze.retail_p2p_payment_transactions',
      description: 'Peer-to-peer payments from Zelle/Early Warning',
      estimatedRows: 500000000,
      avgRowSize: 1280,
      schema: {
        // Primary Keys
        p2p_transaction_id: 'BIGINT PRIMARY KEY',
        source_system: 'STRING PRIMARY KEY COMMENT ZELLE|CLEARXCHANGE|INTERNAL',
        
        // Natural Keys
        p2p_transaction_uuid: 'STRING UNIQUE',
        external_reference_id: 'STRING COMMENT Zelle transaction ID',
        
        // Sender Info
        sender_customer_id: 'BIGINT FK to customer',
        sender_account_id: 'BIGINT FK to account',
        sender_name: 'STRING',
        sender_email: 'STRING',
        sender_phone: 'STRING COMMENT E.164 format',
        
        // Receiver Info
        receiver_customer_id: 'BIGINT COMMENT NULL if external',
        receiver_account_id: 'BIGINT',
        receiver_name: 'STRING',
        receiver_email: 'STRING COMMENT Email or token',
        receiver_phone: 'STRING',
        receiver_type: 'STRING COMMENT Internal|External|Cross-Bank',
        is_internal_transfer: 'BOOLEAN',
        
        // Transaction Details
        transaction_date: 'DATE',
        transaction_timestamp: 'TIMESTAMP',
        transaction_amount: 'DECIMAL(18,2)',
        transaction_currency: 'STRING COMMENT ISO 4217 (USD)',
        transaction_status: 'STRING COMMENT Pending|Processing|Completed|Failed|Cancelled|Reversed',
        
        // Payment Method
        payment_method: 'STRING COMMENT P2P|Zelle|Venmo|CashApp|Internal',
        payment_network: 'STRING COMMENT Zelle|RTP|FedNow|ACH',
        payment_rail: 'STRING COMMENT Real-Time|Same-Day ACH|Next-Day ACH',
        
        // Initiation
        initiated_channel: 'STRING COMMENT Mobile|Online|SMS|API',
        initiated_device_type: 'STRING COMMENT iOS|Android|Web',
        initiated_ip_address: 'STRING',
        
        // Timing
        requested_delivery_date: 'DATE',
        actual_delivery_date: 'DATE',
        settlement_date: 'DATE',
        
        // Fees
        sender_fee_amount: 'DECIMAL(18,2)',
        receiver_fee_amount: 'DECIMAL(18,2)',
        network_fee_amount: 'DECIMAL(18,2)',
        fee_waived: 'BOOLEAN',
        
        // Message
        payment_memo: 'STRING COMMENT Payment memo from sender',
        
        // Fraud & Risk
        fraud_score: 'INTEGER COMMENT 0-100',
        fraud_flag: 'BOOLEAN',
        risk_level: 'STRING COMMENT Low|Medium|High|Critical',
        velocity_check_result: 'STRING COMMENT Pass|Fail|Warning',
        
        // Authentication
        authentication_method: 'STRING COMMENT Biometric|PIN|Password|2FA',
        multi_factor_auth_used: 'BOOLEAN',
        device_fingerprint: 'STRING',
        
        // Reversals
        is_reversal: 'BOOLEAN',
        reversal_reason: 'STRING COMMENT Duplicate|Fraud|Customer Request|Error',
        original_transaction_id: 'BIGINT',
        
        // Failure
        failure_reason: 'STRING COMMENT Insufficient Funds|Invalid Account|Blocked|Fraud',
        failure_code: 'STRING',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
    {
      name: 'bronze.retail_bill_payments',
      description: 'Bill pay transactions from bill pay processor',
      estimatedRows: 1200000000,
      avgRowSize: 896,
      schema: {
        bill_payment_id: 'BIGINT PRIMARY KEY',
        customer_id: 'BIGINT FK to customer',
        funding_account_id: 'BIGINT FK to account',
        payee_id: 'BIGINT FK to payee',
        
        // Payment Details
        payment_date: 'DATE COMMENT Scheduled payment date',
        process_date: 'DATE COMMENT Date processed',
        delivery_date: 'DATE COMMENT Estimated delivery to payee',
        actual_delivery_date: 'DATE',
        
        payment_amount: 'DECIMAL(18,2)',
        
        payment_status: 'STRING COMMENT Scheduled|Processing|Sent|Delivered|Returned|Failed|Cancelled',
        
        // Payment Method
        payment_method: 'STRING COMMENT Electronic|Check|Same-Day|Overnight',
        delivery_method: 'STRING COMMENT ACH|Check|Wire|Card Network',
        
        // Check Info
        check_number: 'STRING COMMENT If check payment',
        check_serial_number: 'STRING',
        check_cleared_date: 'DATE',
        
        // Recurring
        is_recurring: 'BOOLEAN',
        recurring_schedule_id: 'BIGINT',
        recurring_frequency: 'STRING COMMENT Weekly|Bi-Weekly|Monthly|Quarterly',
        
        // E-Bill
        is_ebill: 'BOOLEAN COMMENT Electronic bill',
        ebill_id: 'STRING',
        bill_amount: 'DECIMAL(18,2) COMMENT Full bill amount',
        
        // Fees
        expedite_fee: 'DECIMAL(18,2) COMMENT Expedited delivery fee',
        
        // Cancellation
        cancelled_flag: 'BOOLEAN',
        cancellation_date: 'DATE',
        cancellation_reason: 'STRING',
        
        // Return
        returned_flag: 'BOOLEAN',
        return_date: 'DATE',
        return_reason: 'STRING COMMENT Invalid Account|NSF|Stop Payment',
        
        // Audit
        initiated_channel: 'STRING COMMENT Online|Mobile|Phone|Auto-Pay',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
    {
      name: 'bronze.retail_bill_payees',
      description: 'Bill pay payee master file',
      estimatedRows: 50000000,
      schema: {
        payee_id: 'BIGINT PRIMARY KEY',
        customer_id: 'BIGINT FK to customer',
        
        payee_name: 'STRING',
        payee_nickname: 'STRING COMMENT Customer-defined nickname',
        
        payee_type: 'STRING COMMENT Merchant|Individual|Utility|Government|Other',
        payee_category: 'STRING COMMENT Mortgage|Utilities|Credit Card|Insurance|Loan',
        
        // Merchant Payee
        merchant_id: 'STRING COMMENT For electronic payees',
        account_number_with_payee: 'STRING COMMENT Customer account at payee',
        
        // Address (for check payments)
        payee_address_line1: 'STRING',
        payee_address_line2: 'STRING',
        payee_city: 'STRING',
        payee_state: 'STRING',
        payee_postal_code: 'STRING',
        
        payee_phone: 'STRING',
        
        electronic_payment_capable: 'BOOLEAN',
        
        // Status
        payee_status: 'STRING COMMENT Active|Inactive|Deleted',
        added_date: 'DATE',
        last_payment_date: 'DATE',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
    {
      name: 'bronze.retail_ach_transactions',
      description: 'ACH debit/credit transactions',
      estimatedRows: 3000000000,
      avgRowSize: 640,
      schema: {
        ach_transaction_id: 'BIGINT PRIMARY KEY',
        account_id: 'BIGINT FK to account',
        
        // ACH Identifiers
        trace_number: 'STRING UNIQUE COMMENT 15-digit ACH trace number',
        batch_number: 'STRING',
        
        // Transaction Details
        transaction_date: 'DATE',
        effective_date: 'DATE COMMENT Effective entry date',
        settlement_date: 'DATE',
        
        transaction_amount: 'DECIMAL(18,2)',
        
        transaction_type: 'STRING COMMENT Credit|Debit',
        transaction_direction: 'STRING COMMENT Inbound|Outbound',
        
        // ACH Codes
        sec_code: 'STRING COMMENT PPD|CCD|WEB|TEL|POP|ARC|BOC|RCK',
        sec_code_description: 'STRING COMMENT Prearranged Payment|Corporate|Web|Telephone',
        
        transaction_code: 'STRING COMMENT 22 (Checking Credit)|27 (Checking Debit)|32 (Savings Credit)|37 (Savings Debit)',
        
        // Originator (Company)
        company_name: 'STRING COMMENT Originating company name',
        company_id: 'STRING COMMENT 10-digit company ID',
        company_entry_description: 'STRING COMMENT Payroll|Vendor Payment|etc.',
        company_discretionary_data: 'STRING',
        
        // Receiver (Customer)
        receiver_name: 'STRING',
        receiver_account_number: 'STRING COMMENT DDA account',
        receiver_routing_number: 'STRING COMMENT ABA routing',
        
        // Addenda
        addenda_record_indicator: 'BOOLEAN',
        addenda_information: 'STRING',
        
        // Status
        transaction_status: 'STRING COMMENT Pending|Posted|Returned|NOC|Corrected',
        
        // Returns
        returned_flag: 'BOOLEAN',
        return_date: 'DATE',
        return_reason_code: 'STRING COMMENT R01-R33',
        return_reason_description: 'STRING COMMENT Insufficient Funds|Account Closed|etc.',
        
        // NOC (Notification of Change)
        noc_flag: 'BOOLEAN',
        noc_code: 'STRING COMMENT C01-C07',
        corrected_routing_number: 'STRING',
        corrected_account_number: 'STRING',
        
        // Same-Day ACH
        same_day_flag: 'BOOLEAN COMMENT Same-day ACH',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
    {
      name: 'bronze.retail_wire_transfers',
      description: 'Domestic and international wire transfers',
      estimatedRows: 50000000,
      avgRowSize: 1536,
      schema: {
        wire_id: 'BIGINT PRIMARY KEY',
        
        // Sender Info
        sender_customer_id: 'BIGINT FK to customer',
        sender_account_id: 'BIGINT FK to account',
        sender_name: 'STRING',
        sender_address: 'STRING',
        
        // Wire Details
        wire_reference_number: 'STRING UNIQUE COMMENT Internal reference',
        imad: 'STRING COMMENT Input Message Accountability Data (Fedwire)',
        omad: 'STRING COMMENT Output Message Accountability Data',
        
        transaction_date: 'DATE',
        transaction_timestamp: 'TIMESTAMP',
        value_date: 'DATE',
        
        wire_amount: 'DECIMAL(18,2)',
        wire_currency: 'STRING COMMENT ISO 4217',
        
        // Wire Type
        wire_type: 'STRING COMMENT Domestic|International|Book Transfer',
        wire_subtype: 'STRING COMMENT Customer|Bank|Drawdown|Cover',
        wire_network: 'STRING COMMENT Fedwire|SWIFT|CHIPS|Internal',
        
        // Beneficiary (Receiver)
        beneficiary_name: 'STRING',
        beneficiary_account_number: 'STRING',
        beneficiary_address: 'STRING',
        beneficiary_city: 'STRING',
        beneficiary_country: 'STRING',
        
        // Beneficiary Bank
        beneficiary_bank_name: 'STRING',
        beneficiary_bank_aba: 'STRING COMMENT For domestic',
        beneficiary_bank_swift: 'STRING COMMENT BIC/SWIFT code for international',
        beneficiary_bank_address: 'STRING',
        
        // Intermediary Bank (if applicable)
        intermediary_bank_name: 'STRING',
        intermediary_bank_swift: 'STRING',
        
        // Purpose & Details
        wire_purpose: 'STRING COMMENT Invoice Payment|Personal Transfer|Investment|Real Estate',
        originator_to_beneficiary_info: 'STRING COMMENT Free-form wire instructions',
        
        // Status
        wire_status: 'STRING COMMENT Pending Approval|Sent|In Transit|Delivered|Returned|Cancelled|Rejected',
        status_date: 'TIMESTAMP',
        
        // Fees
        wire_fee_amount: 'DECIMAL(18,2)',
        intermediary_bank_fee: 'DECIMAL(18,2)',
        beneficiary_bank_fee: 'DECIMAL(18,2)',
        
        // Initiation
        initiated_channel: 'STRING COMMENT Branch|Online|Phone',
        initiated_by_user_id: 'STRING',
        
        // Approval
        approval_required: 'BOOLEAN',
        approved_flag: 'BOOLEAN',
        approved_by: 'STRING',
        approved_timestamp: 'TIMESTAMP',
        
        // Return/Rejection
        returned_flag: 'BOOLEAN',
        return_reason: 'STRING COMMENT Invalid Account|Compliance Hold|Customer Request',
        
        // Compliance
        ofac_checked: 'BOOLEAN',
        ofac_check_result: 'STRING COMMENT Clear|Match|Review',
        sanctions_checked: 'BOOLEAN',
        
        // Recurring
        is_recurring: 'BOOLEAN',
        recurring_schedule_id: 'BIGINT',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
    {
      name: 'bronze.retail_internal_transfers',
      description: 'Transfers between customer own accounts',
      estimatedRows: 2000000000,
      avgRowSize: 384,
      schema: {
        transfer_id: 'BIGINT PRIMARY KEY',
        customer_id: 'BIGINT FK to customer',
        
        from_account_id: 'BIGINT FK to account',
        from_account_type: 'STRING COMMENT Checking|Savings|Money Market',
        
        to_account_id: 'BIGINT FK to account',
        to_account_type: 'STRING',
        
        transfer_date: 'DATE',
        transfer_timestamp: 'TIMESTAMP',
        effective_date: 'DATE',
        
        transfer_amount: 'DECIMAL(18,2)',
        
        transfer_type: 'STRING COMMENT One-Time|Recurring|Scheduled',
        transfer_status: 'STRING COMMENT Completed|Pending|Scheduled|Failed|Cancelled',
        
        // Scheduling
        is_scheduled: 'BOOLEAN',
        scheduled_date: 'DATE',
        
        is_recurring: 'BOOLEAN',
        recurring_frequency: 'STRING COMMENT Weekly|Bi-Weekly|Monthly|Quarterly',
        recurring_end_date: 'DATE',
        recurring_schedule_id: 'BIGINT',
        
        // Initiation
        initiated_channel: 'STRING COMMENT Online|Mobile|Branch|Phone|Auto',
        initiated_device: 'STRING',
        
        // Failure
        failure_reason: 'STRING COMMENT Insufficient Funds|Account Closed|Limit Exceeded',
        
        // Memo
        transfer_memo: 'STRING COMMENT Customer-entered description',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
    {
      name: 'bronze.retail_payment_limits',
      description: 'Customer payment limits and velocity controls',
      estimatedRows: 100000000,
      schema: {
        limit_id: 'BIGINT PRIMARY KEY',
        customer_id: 'BIGINT FK to customer',
        account_id: 'BIGINT COMMENT NULL for customer-level',
        
        limit_type: 'STRING COMMENT P2P|Bill Pay|Wire|ACH|Internal Transfer',
        
        // Daily Limits
        daily_transaction_limit: 'DECIMAL(18,2)',
        daily_count_limit: 'INTEGER',
        daily_amount_used: 'DECIMAL(18,2)',
        daily_count_used: 'INTEGER',
        
        // Weekly Limits
        weekly_transaction_limit: 'DECIMAL(18,2)',
        weekly_amount_used: 'DECIMAL(18,2)',
        
        // Monthly Limits
        monthly_transaction_limit: 'DECIMAL(18,2)',
        monthly_amount_used: 'DECIMAL(18,2)',
        
        // Single Transaction
        single_transaction_max: 'DECIMAL(18,2)',
        
        limit_effective_date: 'DATE',
        limit_expiration_date: 'DATE',
        
        limit_status: 'STRING COMMENT Active|Suspended|Expired',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
  ],
  relationships: [
    {
      from: 'bronze.retail_p2p_payment_transactions',
      to: 'bronze.retail_customer_master',
      type: 'many-to-one',
      foreignKey: 'sender_customer_id',
    },
    {
      from: 'bronze.retail_bill_payments',
      to: 'bronze.retail_bill_payees',
      type: 'many-to-one',
      foreignKey: 'payee_id',
    },
    {
      from: 'bronze.retail_ach_transactions',
      to: 'bronze.retail_deposit_account_master',
      type: 'many-to-one',
      foreignKey: 'account_id',
    },
    {
      from: 'bronze.retail_wire_transfers',
      to: 'bronze.retail_deposit_account_master',
      type: 'many-to-one',
      foreignKey: 'sender_account_id',
    },
    {
      from: 'bronze.retail_internal_transfers',
      to: 'bronze.retail_deposit_account_master',
      type: 'many-to-one',
      foreignKey: 'from_account_id',
    },
  ],
};

export default {
  paymentsRetailLogicalERD,
  paymentsRetailPhysicalERD,
};
