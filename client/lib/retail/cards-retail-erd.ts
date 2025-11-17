/**
 * CARDS-RETAIL ERD DEFINITIONS
 * 
 * Logical and Physical ERD definitions for credit/debit cards
 * Sources: TSYS, FIS Card Processing, Visa/Mastercard network data
 */

// LOGICAL ERD - Business Model
export const cardsRetailLogicalERD = {
  entities: [
    {
      name: 'Card Account',
      type: 'core',
      description: 'Credit and debit card accounts',
      attributes: [
        { name: 'card_account_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'card_account_number', type: 'STRING', description: 'Last 4 digits visible' },
        { name: 'card_type', type: 'STRING', description: 'Credit|Debit|Prepaid|Charge' },
        { name: 'card_network', type: 'STRING', description: 'Visa|Mastercard|Amex|Discover' },
        { name: 'card_product', type: 'STRING', description: 'Rewards|Cash Back|Travel|Secured|Student' },
        { name: 'card_status', type: 'STRING', description: 'Active|Suspended|Closed|Frozen|Lost/Stolen' },
        { name: 'account_open_date', type: 'DATE' },
        { name: 'primary_cardholder_id', type: 'BIGINT', isForeignKey: true },
        { name: 'credit_limit', type: 'DECIMAL(18,2)', description: 'Credit limit (for credit cards)' },
        { name: 'current_balance', type: 'DECIMAL(18,2)', description: 'Outstanding balance' },
        { name: 'available_credit', type: 'DECIMAL(18,2)', description: 'Available to spend' },
        { name: 'apr', type: 'DECIMAL(10,6)', description: 'Annual Percentage Rate' },
        { name: 'minimum_payment_due', type: 'DECIMAL(18,2)' },
        { name: 'payment_due_date', type: 'DATE' },
        { name: 'days_past_due', type: 'INTEGER' },
        { name: 'rewards_balance', type: 'DECIMAL(18,2)', description: 'Points/cash back balance' },
      ],
    },
    {
      name: 'Card',
      type: 'core',
      description: 'Physical/virtual cards (multiple per account)',
      attributes: [
        { name: 'card_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'card_account_id', type: 'BIGINT', isForeignKey: true },
        { name: 'card_number_last_4', type: 'STRING', description: 'Last 4 digits' },
        { name: 'card_token', type: 'STRING', description: 'Tokenized card number' },
        { name: 'card_status', type: 'STRING', description: 'Active|Blocked|Expired|Lost|Stolen|Damaged' },
        { name: 'cardholder_id', type: 'BIGINT', isForeignKey: true },
        { name: 'cardholder_type', type: 'STRING', description: 'Primary|Authorized User|Employee' },
        { name: 'card_format', type: 'STRING', description: 'Physical|Virtual|Digital Wallet' },
        { name: 'issue_date', type: 'DATE' },
        { name: 'expiration_date', type: 'DATE', description: 'MM/YY expiration' },
        { name: 'activation_date', type: 'DATE' },
        { name: 'pin_set_date', type: 'DATE' },
      ],
    },
    {
      name: 'Card Transaction',
      type: 'event',
      description: 'Card purchase, ATM, cash advance transactions',
      attributes: [
        { name: 'transaction_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'card_account_id', type: 'BIGINT', isForeignKey: true },
        { name: 'card_id', type: 'BIGINT', isForeignKey: true },
        { name: 'transaction_timestamp', type: 'TIMESTAMP' },
        { name: 'transaction_date', type: 'DATE' },
        { name: 'post_date', type: 'DATE', description: 'Settlement date' },
        { name: 'transaction_type', type: 'STRING', description: 'Purchase|ATM Withdrawal|Cash Advance|Fee|Payment|Refund' },
        { name: 'transaction_amount', type: 'DECIMAL(18,2)', description: 'Transaction amount' },
        { name: 'transaction_currency', type: 'STRING', description: 'ISO 4217' },
        { name: 'merchant_name', type: 'STRING', description: 'Merchant name' },
        { name: 'merchant_category_code', type: 'STRING', description: 'MCC (e.g., 5411 Grocery)' },
        { name: 'merchant_city', type: 'STRING' },
        { name: 'merchant_state', type: 'STRING' },
        { name: 'merchant_country', type: 'STRING' },
        { name: 'authorization_code', type: 'STRING', description: 'Auth code from network' },
        { name: 'transaction_status', type: 'STRING', description: 'Authorized|Posted|Declined|Pending|Reversed' },
        { name: 'decline_reason', type: 'STRING', description: 'Insufficient Funds|Suspected Fraud|Expired Card' },
      ],
    },
    {
      name: 'Card Payment',
      type: 'event',
      description: 'Credit card payments',
      attributes: [
        { name: 'payment_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'card_account_id', type: 'BIGINT', isForeignKey: true },
        { name: 'payment_date', type: 'DATE' },
        { name: 'payment_amount', type: 'DECIMAL(18,2)' },
        { name: 'payment_type', type: 'STRING', description: 'Minimum|Statement Balance|Full|Extra' },
        { name: 'payment_method', type: 'STRING', description: 'ACH|Check|Wire|Online|Auto-Pay' },
        { name: 'payment_status', type: 'STRING', description: 'Posted|Pending|Returned|Reversed' },
      ],
    },
    {
      name: 'Rewards Activity',
      type: 'event',
      description: 'Rewards points/cash back earned and redeemed',
      attributes: [
        { name: 'rewards_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'card_account_id', type: 'BIGINT', isForeignKey: true },
        { name: 'transaction_id', type: 'BIGINT', isForeignKey: true, description: 'Transaction that earned/redeemed' },
        { name: 'activity_date', type: 'DATE' },
        { name: 'activity_type', type: 'STRING', description: 'Earned|Redeemed|Expired|Adjusted' },
        { name: 'points_amount', type: 'DECIMAL(18,2)', description: 'Points/cash back amount' },
        { name: 'points_balance_after', type: 'DECIMAL(18,2)' },
        { name: 'redemption_type', type: 'STRING', description: 'Statement Credit|Gift Card|Travel|Merchandise' },
      ],
    },
  ],
  relationships: [
    {
      from: 'Card',
      to: 'Card Account',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'card_account_id',
      description: 'Multiple cards per account',
    },
    {
      from: 'Card Transaction',
      to: 'Card Account',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'card_account_id',
    },
    {
      from: 'Card Transaction',
      to: 'Card',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'card_id',
    },
    {
      from: 'Card Payment',
      to: 'Card Account',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'card_account_id',
    },
    {
      from: 'Rewards Activity',
      to: 'Card Account',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'card_account_id',
    },
  ],
};

// PHYSICAL ERD - Bronze Layer
export const cardsRetailPhysicalERD = {
  tables: [
    {
      name: 'bronze.retail_card_account_master',
      description: 'Credit/debit card account data from TSYS/FIS',
      estimatedRows: 80000000,
      avgRowSize: 2560,
      schema: {
        // Primary Keys
        card_account_id: 'BIGINT PRIMARY KEY',
        source_system: 'STRING PRIMARY KEY',
        
        // Natural Keys
        card_account_number: 'STRING COMMENT Masked PAN (last 4 visible)',
        card_account_token: 'STRING UNIQUE COMMENT Tokenized account',
        card_account_uuid: 'STRING UNIQUE',
        
        // Card Type
        card_type: 'STRING COMMENT Credit|Debit|Prepaid|Charge|Secured',
        card_network: 'STRING COMMENT Visa|Mastercard|Amex|Discover',
        card_product: 'STRING COMMENT Rewards|Cash Back|Travel|Balance Transfer|Secured|Student',
        product_code: 'STRING',
        product_name: 'STRING',
        
        // Status & Lifecycle
        card_status: 'STRING COMMENT Active|Suspended|Closed|Frozen|Blocked|Lost/Stolen',
        card_status_date: 'DATE',
        card_status_reason: 'STRING COMMENT Customer Request|Fraud|Delinquency|Lost/Stolen',
        account_open_date: 'DATE',
        account_close_date: 'DATE',
        account_age_months: 'INTEGER',
        
        // Cardholder
        primary_cardholder_id: 'BIGINT FK to customer',
        total_cardholders: 'INTEGER COMMENT Primary + authorized users',
        
        // Credit Limits (for credit cards)
        credit_limit: 'DECIMAL(18,2)',
        cash_advance_limit: 'DECIMAL(18,2)',
        credit_limit_currency: 'STRING COMMENT ISO 4217',
        original_credit_limit: 'DECIMAL(18,2)',
        last_credit_limit_increase_date: 'DATE',
        last_credit_limit_decrease_date: 'DATE',
        credit_limit_utilization: 'DECIMAL(5,4) COMMENT Balance/Limit ratio',
        
        // Balances (credit cards)
        current_balance: 'DECIMAL(18,2) COMMENT Outstanding balance',
        available_credit: 'DECIMAL(18,2) COMMENT Credit limit - current balance',
        pending_transactions: 'DECIMAL(18,2) COMMENT Pending auth amount',
        cash_advance_balance: 'DECIMAL(18,2)',
        
        statement_balance: 'DECIMAL(18,2) COMMENT Last statement balance',
        last_statement_date: 'DATE',
        last_statement_balance: 'DECIMAL(18,2)',
        
        // Interest Rates (credit cards)
        purchase_apr: 'DECIMAL(10,6) COMMENT Purchase APR',
        cash_advance_apr: 'DECIMAL(10,6)',
        balance_transfer_apr: 'DECIMAL(10,6)',
        penalty_apr: 'DECIMAL(10,6) COMMENT Penalty rate if delinquent',
        promotional_apr: 'DECIMAL(10,6)',
        promotional_apr_end_date: 'DATE',
        
        apr_type: 'STRING COMMENT Fixed|Variable',
        variable_apr_index: 'STRING COMMENT Prime Rate',
        variable_apr_margin: 'DECIMAL(10,6)',
        
        interest_accrued_mtd: 'DECIMAL(18,2)',
        interest_charged_ytd: 'DECIMAL(18,2)',
        
        // Payment Info (credit cards)
        minimum_payment_due: 'DECIMAL(18,2)',
        payment_due_date: 'DATE',
        last_payment_date: 'DATE',
        last_payment_amount: 'DECIMAL(18,2)',
        
        days_past_due: 'INTEGER',
        delinquency_status: 'STRING COMMENT Current|30DPD|60DPD|90DPD|120+DPD|Charge Off',
        
        autopay_enrolled: 'BOOLEAN',
        autopay_type: 'STRING COMMENT Minimum|Statement Balance|Full Balance|Fixed Amount',
        autopay_amount: 'DECIMAL(18,2)',
        autopay_account_id: 'BIGINT COMMENT Funding account',
        
        // Fees
        annual_fee: 'DECIMAL(18,2)',
        annual_fee_waived: 'BOOLEAN',
        annual_fee_next_date: 'DATE',
        foreign_transaction_fee_rate: 'DECIMAL(5,4) COMMENT % of transaction',
        balance_transfer_fee_rate: 'DECIMAL(5,4)',
        cash_advance_fee_amount: 'DECIMAL(18,2)',
        late_fee_amount: 'DECIMAL(18,2)',
        over_limit_fee_amount: 'DECIMAL(18,2)',
        
        fees_charged_ytd: 'DECIMAL(18,2)',
        
        // Rewards
        rewards_program: 'STRING COMMENT Points|Cash Back|Miles',
        rewards_balance: 'DECIMAL(18,2) COMMENT Points/cash back balance',
        rewards_earned_ytd: 'DECIMAL(18,2)',
        rewards_redeemed_ytd: 'DECIMAL(18,2)',
        rewards_expiration_date: 'DATE',
        
        // Debit Card Specific
        linked_deposit_account_id: 'BIGINT COMMENT For debit cards',
        overdraft_protection_enrolled: 'BOOLEAN',
        
        // Digital Features
        contactless_enabled: 'BOOLEAN',
        digital_wallet_enrolled: 'BOOLEAN COMMENT Apple Pay, Google Pay',
        alerts_enabled: 'BOOLEAN',
        
        // Fraud Controls
        fraud_alert_enabled: 'BOOLEAN',
        travel_notification_on_file: 'BOOLEAN',
        card_locked_by_customer: 'BOOLEAN',
        
        // Audit
        load_timestamp: 'TIMESTAMP',
        cdc_operation: 'STRING',
        record_hash: 'STRING',
      },
    },
    {
      name: 'bronze.retail_card_details',
      description: 'Physical/virtual card inventory (multiple cards per account)',
      estimatedRows: 120000000,
      avgRowSize: 768,
      schema: {
        card_id: 'BIGINT PRIMARY KEY',
        card_account_id: 'BIGINT FK to card account',
        
        // Card Identifiers
        card_number_token: 'STRING UNIQUE COMMENT Tokenized PAN',
        card_number_last_4: 'STRING COMMENT Last 4 digits',
        card_number_first_6: 'STRING COMMENT BIN (Bank Identification Number)',
        
        // Card Type
        card_format: 'STRING COMMENT Physical|Virtual|Digital Wallet Token',
        card_embossing_name: 'STRING COMMENT Name on card',
        
        // Status
        card_status: 'STRING COMMENT Active|Blocked|Expired|Lost|Stolen|Damaged|Cancelled',
        card_status_date: 'DATE',
        block_code: 'STRING COMMENT Reason for block',
        
        // Cardholder
        cardholder_id: 'BIGINT FK to customer',
        cardholder_type: 'STRING COMMENT Primary|Authorized User|Employee|Business',
        relationship_to_primary: 'STRING COMMENT Self|Spouse|Child|Employee',
        
        // Card Dates
        issue_date: 'DATE',
        activation_date: 'DATE',
        expiration_date: 'DATE COMMENT MM/YY',
        last_used_date: 'DATE',
        
        // Security
        pin_set_date: 'DATE',
        cvv_verification_failures: 'INTEGER COMMENT Failed CVV attempts',
        
        // Features
        contactless_enabled: 'BOOLEAN',
        international_enabled: 'BOOLEAN',
        online_purchases_enabled: 'BOOLEAN',
        atm_enabled: 'BOOLEAN',
        
        // Digital Wallets
        apple_pay_provisioned: 'BOOLEAN',
        apple_pay_provision_date: 'DATE',
        google_pay_provisioned: 'BOOLEAN',
        samsung_pay_provisioned: 'BOOLEAN',
        
        // Replacement History
        is_replacement: 'BOOLEAN',
        previous_card_id: 'BIGINT COMMENT Card being replaced',
        replacement_reason: 'STRING COMMENT Expired|Lost|Stolen|Damaged|Upgrade',
        
        // Delivery
        card_delivery_method: 'STRING COMMENT Mail|Branch Pickup|Courier',
        card_delivered_date: 'DATE',
        tracking_number: 'STRING',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
    {
      name: 'bronze.retail_card_transactions',
      description: 'Card purchase, ATM, cash advance transactions from Visa/MC networks',
      estimatedRows: 10000000000,
      avgRowSize: 896,
      schema: {
        transaction_id: 'BIGINT PRIMARY KEY',
        card_account_id: 'BIGINT FK to card account',
        card_id: 'BIGINT FK to card',
        
        // Transaction Timing
        transaction_timestamp: 'TIMESTAMP COMMENT Local transaction time',
        transaction_date: 'DATE',
        post_date: 'DATE COMMENT Settlement date',
        authorization_timestamp: 'TIMESTAMP',
        
        // Transaction Type
        transaction_type: 'STRING COMMENT Purchase|ATM Withdrawal|Cash Advance|Fee|Payment|Refund|Reversal',
        transaction_subtype: 'STRING COMMENT Signature|PIN|Contactless|E-Commerce|Mail/Phone',
        
        // Amounts
        transaction_amount: 'DECIMAL(18,2)',
        transaction_currency: 'STRING COMMENT ISO 4217',
        billing_amount: 'DECIMAL(18,2) COMMENT Amount in card currency',
        billing_currency: 'STRING',
        exchange_rate: 'DECIMAL(12,8)',
        foreign_transaction_fee: 'DECIMAL(18,2)',
        
        // Merchant Info
        merchant_name: 'STRING',
        merchant_id: 'STRING COMMENT Merchant ID',
        merchant_category_code: 'STRING COMMENT MCC (e.g., 5411 Grocery Stores)',
        merchant_category_description: 'STRING COMMENT Human-readable MCC',
        merchant_dba: 'STRING COMMENT Doing Business As',
        
        merchant_street: 'STRING',
        merchant_city: 'STRING',
        merchant_state: 'STRING',
        merchant_postal_code: 'STRING',
        merchant_country: 'STRING COMMENT ISO 3166-1',
        
        // Authorization
        authorization_code: 'STRING COMMENT 6-char auth code',
        authorization_amount: 'DECIMAL(18,2)',
        authorization_status: 'STRING COMMENT Approved|Declined|Partial Approval',
        
        // Transaction Status
        transaction_status: 'STRING COMMENT Authorized|Posted|Pending|Declined|Reversed|Disputed',
        settlement_status: 'STRING COMMENT Pending|Settled|Failed',
        
        decline_reason: 'STRING COMMENT Insufficient Funds|Suspected Fraud|Expired Card|Invalid PIN|Exceeds Limit',
        decline_reason_code: 'STRING',
        
        // Reversal Info
        reversal_flag: 'BOOLEAN',
        original_transaction_id: 'BIGINT COMMENT If reversal/refund',
        reversal_reason: 'STRING COMMENT Duplicate|Merchant Reversal|Dispute',
        
        // Card Present/Not Present
        card_present_flag: 'BOOLEAN COMMENT Card physically present',
        card_entry_mode: 'STRING COMMENT Chip|Swipe|Contactless|Manual|E-Commerce|Recurring',
        
        // Digital Wallet
        digital_wallet_type: 'STRING COMMENT Apple Pay|Google Pay|Samsung Pay|None',
        
        // ATM Specific
        atm_id: 'STRING',
        atm_network: 'STRING COMMENT Allpoint|MoneyPass|Proprietary',
        atm_fee_amount: 'DECIMAL(18,2)',
        
        // Fraud Indicators
        fraud_score: 'INTEGER COMMENT 0-100 fraud risk score',
        fraud_flag: 'BOOLEAN',
        fraud_reason: 'STRING COMMENT Velocity|Geography|Amount|Merchant Type',
        
        // Rewards
        rewards_earned: 'DECIMAL(18,2) COMMENT Points/cash back earned',
        rewards_category: 'STRING COMMENT Bonus category (e.g., 3X Dining)',
        
        // Network Data
        network: 'STRING COMMENT Visa|Mastercard|Amex|Discover',
        network_reference_number: 'STRING COMMENT Trace ID',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
    {
      name: 'bronze.retail_card_payments',
      description: 'Credit card payment transactions',
      estimatedRows: 500000000,
      avgRowSize: 384,
      schema: {
        payment_id: 'BIGINT PRIMARY KEY',
        card_account_id: 'BIGINT FK to card account',
        
        payment_date: 'DATE',
        payment_timestamp: 'TIMESTAMP',
        post_date: 'DATE',
        
        payment_amount: 'DECIMAL(18,2)',
        
        payment_type: 'STRING COMMENT Minimum|Statement Balance|Full Balance|Extra|Other',
        payment_method: 'STRING COMMENT ACH|Check|Wire|Online|Mobile|Auto-Pay|Branch|Phone',
        
        payment_status: 'STRING COMMENT Posted|Pending|Processing|Returned|NSF|Reversed',
        
        funding_account_type: 'STRING COMMENT Checking|Savings|External Bank',
        funding_account_number: 'STRING COMMENT Masked account number',
        funding_routing_number: 'STRING',
        
        autopay_flag: 'BOOLEAN',
        
        return_reason: 'STRING COMMENT NSF|Account Closed|Stop Payment',
        return_date: 'DATE',
        
        allocation_to_principal: 'DECIMAL(18,2)',
        allocation_to_interest: 'DECIMAL(18,2)',
        allocation_to_fees: 'DECIMAL(18,2)',
        
        balance_after_payment: 'DECIMAL(18,2)',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
    {
      name: 'bronze.retail_card_rewards',
      description: 'Rewards points/cash back earned and redeemed',
      estimatedRows: 800000000,
      schema: {
        rewards_id: 'BIGINT PRIMARY KEY',
        card_account_id: 'BIGINT FK to card account',
        transaction_id: 'BIGINT FK to transaction COMMENT Transaction that earned/redeemed',
        
        activity_date: 'DATE',
        activity_timestamp: 'TIMESTAMP',
        
        activity_type: 'STRING COMMENT Earned|Redeemed|Expired|Adjusted|Bonus|Clawback',
        
        points_amount: 'DECIMAL(18,2) COMMENT Points or cash back amount',
        points_balance_before: 'DECIMAL(18,2)',
        points_balance_after: 'DECIMAL(18,2)',
        
        earn_rate: 'DECIMAL(8,4) COMMENT Points per dollar (e.g., 1.5)',
        earn_category: 'STRING COMMENT Dining|Travel|Gas|Grocery|General',
        bonus_flag: 'BOOLEAN COMMENT Bonus category earnings',
        
        redemption_type: 'STRING COMMENT Statement Credit|Gift Card|Travel|Merchandise|Transfer',
        redemption_value: 'DECIMAL(18,2) COMMENT Cash value of redemption',
        redemption_rate: 'DECIMAL(8,4) COMMENT Value per point',
        
        expiration_date: 'DATE COMMENT When points expire',
        
        adjustment_reason: 'STRING COMMENT Returned Purchase|Dispute|Correction',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
    {
      name: 'bronze.retail_card_authorizations',
      description: 'Real-time authorization requests (holds)',
      estimatedRows: 12000000000,
      avgRowSize: 512,
      schema: {
        authorization_id: 'BIGINT PRIMARY KEY',
        card_account_id: 'BIGINT FK to card account',
        card_id: 'BIGINT FK to card',
        
        authorization_timestamp: 'TIMESTAMP',
        authorization_date: 'DATE',
        
        authorization_amount: 'DECIMAL(18,2)',
        authorization_currency: 'STRING',
        
        authorization_code: 'STRING COMMENT 6-char approval code',
        authorization_status: 'STRING COMMENT Approved|Declined|Partial Approval',
        
        decline_reason: 'STRING',
        decline_reason_code: 'STRING',
        
        merchant_name: 'STRING',
        merchant_id: 'STRING',
        merchant_category_code: 'STRING',
        
        card_entry_mode: 'STRING COMMENT Chip|Swipe|Contactless|E-Commerce',
        
        hold_amount: 'DECIMAL(18,2) COMMENT Amount placed on hold',
        hold_release_date: 'DATE COMMENT When hold releases',
        
        matched_transaction_id: 'BIGINT COMMENT FK to settled transaction',
        
        fraud_score: 'INTEGER',
        fraud_check_result: 'STRING COMMENT Pass|Fail|Review',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
  ],
  relationships: [
    {
      from: 'bronze.retail_card_details',
      to: 'bronze.retail_card_account_master',
      type: 'many-to-one',
      foreignKey: 'card_account_id',
    },
    {
      from: 'bronze.retail_card_transactions',
      to: 'bronze.retail_card_account_master',
      type: 'many-to-one',
      foreignKey: 'card_account_id',
    },
    {
      from: 'bronze.retail_card_transactions',
      to: 'bronze.retail_card_details',
      type: 'many-to-one',
      foreignKey: 'card_id',
    },
    {
      from: 'bronze.retail_card_payments',
      to: 'bronze.retail_card_account_master',
      type: 'many-to-one',
      foreignKey: 'card_account_id',
    },
    {
      from: 'bronze.retail_card_rewards',
      to: 'bronze.retail_card_account_master',
      type: 'many-to-one',
      foreignKey: 'card_account_id',
    },
    {
      from: 'bronze.retail_card_authorizations',
      to: 'bronze.retail_card_account_master',
      type: 'many-to-one',
      foreignKey: 'card_account_id',
    },
  ],
};

export default {
  cardsRetailLogicalERD,
  cardsRetailPhysicalERD,
};
