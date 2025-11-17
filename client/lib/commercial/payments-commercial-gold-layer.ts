/**
 * PAYMENTS-COMMERCIAL GOLD LAYER
 * Dimensional model for payment analytics (Kimball methodology)
 * 
 * Domain: Payments-Commercial
 * Area: Commercial Banking
 * Layer: GOLD (Dimensional/Star Schema)
 * Dimensions: 14
 * Facts: 9
 * 
 * Conformed Dimensions:
 * - dim_date (shared across all banking areas)
 * - dim_commercial_customer (shared with other commercial domains)
 * - dim_account (shared with deposits, loans)
 * 
 * Payment-Specific Dimensions:
 * - dim_payment_type
 * - dim_payment_channel
 * - dim_payment_status
 * - dim_bank_routing
 * - dim_fraud_rule
 * - dim_compliance_screening
 * - dim_exception_type
 * - dim_settlement_network
 * 
 * Facts:
 * - fact_payment_transactions (Transaction-grain)
 * - fact_ach_returns (Transaction-grain)
 * - fact_wire_transfers (Transaction-grain)
 * - fact_payment_fraud_events (Event-grain)
 * - fact_payment_volume_daily (Periodic snapshot)
 * - fact_payment_settlement (Daily snapshot)
 * - fact_payment_exceptions (Event-grain)
 * - fact_payment_fees (Transaction-grain)
 * - fact_compliance_screening (Event-grain)
 */

export const paymentsCommercialGoldDimensions = [
  // Dimension 1: Payment Type
  {
    name: 'gold.dim_payment_type',
    description: 'Type 1 slowly changing dimension for payment method classification',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per payment type',
    primaryKey: ['payment_type_key'],
    
    schema: {
      payment_type_key: "INTEGER PRIMARY KEY COMMENT 'Surrogate key'",
      
      // Natural Key
      payment_type_code: "STRING UNIQUE COMMENT 'ACH|WIRE|RTP|CHECK|BILL_PAYMENT|PAYROLL|BULK_PAYMENT'",
      
      // Attributes
      payment_type_name: "STRING COMMENT 'Descriptive name'",
      payment_type_category: "STRING COMMENT 'ELECTRONIC|PAPER|REAL_TIME'",
      payment_network: "STRING COMMENT 'FEDACH|FEDWIRE|RTP|CLEARING_HOUSE|INTERNAL'",
      
      // Characteristics
      is_real_time: "BOOLEAN",
      is_electronic: "BOOLEAN",
      is_reversible: "BOOLEAN",
      supports_international: "BOOLEAN",
      
      // Processing Attributes
      typical_settlement_days: "INTEGER COMMENT 'Standard settlement time'",
      same_day_available_flag: "BOOLEAN",
      max_transaction_amount: "DECIMAL(18,2) COMMENT 'Network limit'",
      
      // Regulatory
      ctr_reporting_required_flag: "BOOLEAN COMMENT 'Currency Transaction Report >$10k'",
      ofac_screening_required_flag: "BOOLEAN",
      
      // Fee Structure
      standard_fee_amount: "DECIMAL(10,2)",
      fee_structure: "STRING COMMENT 'FLAT|TIERED|PERCENTAGE'",
      
      // Active Status
      active_flag: "BOOLEAN",
      effective_start_date: "DATE",
      effective_end_date: "DATE",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_payment_type_code ON gold.dim_payment_type(payment_type_code)",
      "CREATE INDEX idx_dim_payment_type_category ON gold.dim_payment_type(payment_type_category)",
    ],
  },

  // Dimension 2: Payment Channel
  {
    name: 'gold.dim_payment_channel',
    description: 'Type 1 dimension for payment origination channel',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per payment channel',
    primaryKey: ['payment_channel_key'],
    
    schema: {
      payment_channel_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      payment_channel_code: "STRING UNIQUE COMMENT 'ONLINE_BANKING|MOBILE_APP|BRANCH|API|FILE_UPLOAD|TREASURY_WORKSTATION'",
      
      // Attributes
      payment_channel_name: "STRING",
      payment_channel_category: "STRING COMMENT 'SELF_SERVICE|ASSISTED|AUTOMATED'",
      
      // Channel Characteristics
      is_self_service: "BOOLEAN",
      is_real_time: "BOOLEAN",
      requires_dual_approval: "BOOLEAN",
      
      // Security Level
      authentication_level: "STRING COMMENT 'SINGLE_FACTOR|MFA|CERTIFICATE|BIOMETRIC'",
      fraud_risk_level: "STRING COMMENT 'LOW|MEDIUM|HIGH'",
      
      // Capabilities
      supports_bulk_payments: "BOOLEAN",
      supports_recurring_payments: "BOOLEAN",
      supports_international: "BOOLEAN",
      
      // Active Status
      active_flag: "BOOLEAN",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_payment_channel_code ON gold.dim_payment_channel(payment_channel_code)",
    ],
  },

  // Dimension 3: Payment Status
  {
    name: 'gold.dim_payment_status',
    description: 'Type 1 dimension for payment lifecycle status',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per payment status',
    primaryKey: ['payment_status_key'],
    
    schema: {
      payment_status_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      payment_status_code: "STRING UNIQUE COMMENT 'PENDING|APPROVED|TRANSMITTED|SETTLED|RETURNED|REJECTED|CANCELLED'",
      
      // Attributes
      payment_status_name: "STRING",
      payment_status_category: "STRING COMMENT 'PENDING|IN_PROCESS|FINAL_SUCCESS|FINAL_FAILURE'",
      
      // Status Characteristics
      is_final_status: "BOOLEAN COMMENT 'TRUE for SETTLED, RETURNED, REJECTED, CANCELLED'",
      is_success_status: "BOOLEAN",
      is_failure_status: "BOOLEAN",
      
      // Financial Impact
      funds_released_flag: "BOOLEAN COMMENT 'Funds released to beneficiary'",
      reversible_flag: "BOOLEAN",
      
      // Display Attributes
      customer_visible_status: "STRING COMMENT 'Customer-facing status description'",
      display_color: "STRING COMMENT 'GREEN|YELLOW|RED|GRAY'",
      display_icon: "STRING",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_payment_status_code ON gold.dim_payment_status(payment_status_code)",
    ],
  },

  // Dimension 4: Bank Routing
  {
    name: 'gold.dim_bank_routing',
    description: 'Type 1 dimension for bank routing numbers (ABA, SWIFT BIC)',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per bank routing identifier',
    primaryKey: ['bank_routing_key'],
    
    schema: {
      bank_routing_key: "INTEGER PRIMARY KEY",
      
      // Natural Keys
      routing_number: "STRING UNIQUE COMMENT 'ABA routing number (9 digits) or SWIFT BIC (8/11 chars)'",
      routing_type: "STRING COMMENT 'ABA|SWIFT_BIC|CHIPS_UID'",
      
      // Bank Information
      bank_name: "STRING COMMENT 'Official bank name'",
      bank_name_short: "STRING COMMENT 'Abbreviated name'",
      
      // Address
      bank_address_line1: "STRING",
      bank_address_line2: "STRING",
      bank_city: "STRING",
      bank_state: "STRING",
      bank_postal_code: "STRING",
      bank_country: "STRING COMMENT 'ISO 3166 country code'",
      bank_country_name: "STRING",
      
      // Network Participation
      fedwire_participant_flag: "BOOLEAN",
      fedach_participant_flag: "BOOLEAN",
      rtp_participant_flag: "BOOLEAN",
      swift_member_flag: "BOOLEAN",
      chips_participant_flag: "BOOLEAN",
      
      // Bank Classification
      bank_type: "STRING COMMENT 'COMMERCIAL|SAVINGS|CREDIT_UNION|INVESTMENT|CENTRAL_BANK'",
      bank_size: "STRING COMMENT 'LARGE|REGIONAL|COMMUNITY'",
      
      // Risk Rating
      bank_risk_rating: "STRING COMMENT 'LOW|MEDIUM|HIGH'",
      country_risk_rating: "STRING COMMENT 'Country risk (LOW|MEDIUM|HIGH|PROHIBITED)'",
      sanctioned_country_flag: "BOOLEAN",
      
      // Active Status
      active_flag: "BOOLEAN",
      last_updated_date: "DATE",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_bank_routing_number ON gold.dim_bank_routing(routing_number)",
      "CREATE INDEX idx_dim_bank_routing_country ON gold.dim_bank_routing(bank_country)",
    ],
  },

  // Dimension 5: Fraud Rule
  {
    name: 'gold.dim_fraud_rule',
    description: 'Type 2 slowly changing dimension for fraud detection rules',
    dimensionType: 'SCD_TYPE_2',
    grain: 'One row per fraud rule version',
    primaryKey: ['fraud_rule_key'],
    
    schema: {
      fraud_rule_key: "INTEGER PRIMARY KEY COMMENT 'Surrogate key'",
      
      // Natural Key
      fraud_rule_id: "STRING COMMENT 'Business key for fraud rule'",
      
      // Rule Definition
      fraud_rule_name: "STRING",
      fraud_rule_description: "STRING",
      fraud_rule_category: "STRING COMMENT 'VELOCITY|AMOUNT_ANOMALY|NEW_PAYEE|ACCOUNT_TAKEOVER|LOCATION_ANOMALY|BEHAVIOR_CHANGE'",
      
      // Rule Configuration
      rule_type: "STRING COMMENT 'DETERMINISTIC|ML_MODEL|HYBRID'",
      ml_model_name: "STRING COMMENT 'Machine learning model if applicable'",
      ml_model_version: "STRING",
      
      // Thresholds
      threshold_amount: "DECIMAL(18,2) COMMENT 'Amount threshold if applicable'",
      threshold_count: "INTEGER COMMENT 'Transaction count threshold'",
      threshold_time_window_minutes: "INTEGER COMMENT 'Time window for velocity checks'",
      
      // Severity & Action
      default_severity: "STRING COMMENT 'CRITICAL|HIGH|MEDIUM|LOW'",
      default_action: "STRING COMMENT 'BLOCK|ALERT|REVIEW|LOG'",
      
      // Rule Performance Metrics
      false_positive_rate: "DECIMAL(5,4) COMMENT 'Historical false positive rate'",
      true_positive_rate: "DECIMAL(5,4) COMMENT 'Historical detection rate'",
      
      // Active Status
      active_flag: "BOOLEAN",
      
      // SCD Type 2 Fields
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP COMMENT 'NULL = current version'",
      is_current: "BOOLEAN NOT NULL DEFAULT TRUE",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_fraud_rule_id ON gold.dim_fraud_rule(fraud_rule_id, is_current)",
      "CREATE INDEX idx_dim_fraud_rule_category ON gold.dim_fraud_rule(fraud_rule_category)",
    ],
  },

  // Dimension 6: Compliance Screening
  {
    name: 'gold.dim_compliance_screening',
    description: 'Type 1 dimension for compliance screening types (OFAC, sanctions, AML)',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per compliance screening type',
    primaryKey: ['compliance_screening_key'],
    
    schema: {
      compliance_screening_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      screening_type_code: "STRING UNIQUE COMMENT 'OFAC_SDN|EU_SANCTIONS|UN_SANCTIONS|AML_WATCHLIST|PEP_SCREENING|ADVERSE_MEDIA'",
      
      // Attributes
      screening_type_name: "STRING",
      screening_category: "STRING COMMENT 'SANCTIONS|AML|PEP|REPUTATION'",
      
      // Screening Authority
      regulatory_authority: "STRING COMMENT 'OFAC|EU|UN|FATF|NATIONAL'",
      authority_country: "STRING COMMENT 'US|EU|UN|MULTI'",
      
      // Screening Characteristics
      real_time_screening_flag: "BOOLEAN",
      manual_review_required_flag: "BOOLEAN",
      auto_block_on_match_flag: "BOOLEAN",
      
      // Risk Level
      default_risk_level: "STRING COMMENT 'CRITICAL|HIGH|MEDIUM|LOW'",
      
      // Regulatory Requirements
      mandatory_for_domestic_flag: "BOOLEAN",
      mandatory_for_international_flag: "BOOLEAN",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_compliance_screening_type ON gold.dim_compliance_screening(screening_type_code)",
    ],
  },

  // Dimension 7: Exception Type
  {
    name: 'gold.dim_exception_type',
    description: 'Type 1 dimension for payment exception classifications',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per exception type',
    primaryKey: ['exception_type_key'],
    
    schema: {
      exception_type_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      exception_type_code: "STRING UNIQUE COMMENT 'VALIDATION_FAILURE|COMPLIANCE_HOLD|FRAUD_ALERT|INSUFFICIENT_FUNDS|LIMIT_EXCEEDED|RETURN|NOC'",
      
      // Attributes
      exception_type_name: "STRING",
      exception_category: "STRING COMMENT 'TECHNICAL|OPERATIONAL|COMPLIANCE|FRAUD|CUSTOMER'",
      
      // Exception Characteristics
      exception_severity: "STRING COMMENT 'CRITICAL|HIGH|MEDIUM|LOW'",
      requires_manual_review: "BOOLEAN",
      auto_resolvable_flag: "BOOLEAN",
      
      // SLA
      sla_resolution_hours: "INTEGER COMMENT 'Target resolution time'",
      escalation_hours: "INTEGER COMMENT 'When to escalate if unresolved'",
      
      // Handling Queue
      default_queue_name: "STRING COMMENT 'FRAUD_REVIEW|COMPLIANCE_REVIEW|OPERATIONS_REVIEW'",
      
      // Financial Impact
      customer_impacting_flag: "BOOLEAN COMMENT 'Customer visible/impacting'",
      transaction_blocked_flag: "BOOLEAN COMMENT 'Transaction blocked by default'",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_exception_type_code ON gold.dim_exception_type(exception_type_code)",
    ],
  },

  // Dimension 8: Settlement Network
  {
    name: 'gold.dim_settlement_network',
    description: 'Type 1 dimension for payment settlement networks',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per settlement network',
    primaryKey: ['settlement_network_key'],
    
    schema: {
      settlement_network_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      network_code: "STRING UNIQUE COMMENT 'FEDACH|FEDWIRE|RTP|SWIFT|CHIPS|CLEARING_HOUSE|INTERNAL'",
      
      // Attributes
      network_name: "STRING COMMENT 'Federal Reserve ACH, Fedwire, TCH RTP, SWIFT, etc.'",
      network_operator: "STRING COMMENT 'Federal Reserve|The Clearing House|SWIFT|Internal'",
      
      // Network Characteristics
      network_type: "STRING COMMENT 'ACH|WIRE|REAL_TIME|CARD|CLEARING'",
      settlement_speed: "STRING COMMENT 'REAL_TIME|SAME_DAY|NEXT_DAY|T+2'",
      is_real_time_settlement: "BOOLEAN",
      
      // Geographic Scope
      domestic_flag: "BOOLEAN",
      international_flag: "BOOLEAN",
      supported_countries: "JSON COMMENT 'Array of ISO country codes'",
      
      // Operational Hours
      operates_24x7: "BOOLEAN",
      cutoff_times: "JSON COMMENT 'Array of daily cutoff times'",
      
      // Transaction Limits
      max_transaction_amount: "DECIMAL(18,2)",
      min_transaction_amount: "DECIMAL(10,2)",
      
      // Fees
      network_fee_structure: "STRING COMMENT 'FLAT|TIERED|PERCENTAGE'",
      typical_network_fee: "DECIMAL(10,2)",
      
      // Active Status
      active_flag: "BOOLEAN",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_settlement_network_code ON gold.dim_settlement_network(network_code)",
    ],
  },

  // Dimension 9: ACH Return Reason
  {
    name: 'gold.dim_ach_return_reason',
    description: 'Type 1 dimension for NACHA ACH return reason codes',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per ACH return reason code',
    primaryKey: ['return_reason_key'],
    
    schema: {
      return_reason_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      return_code: "STRING UNIQUE COMMENT 'R01-R99 NACHA return codes'",
      
      // Attributes
      return_code_description: "STRING COMMENT 'Official NACHA description'",
      return_type: "STRING COMMENT 'CUSTOMER|ADMINISTRATIVE|BANK'",
      
      // Return Characteristics
      return_severity: "STRING COMMENT 'CRITICAL|HIGH|MEDIUM|LOW'",
      reversible_flag: "BOOLEAN COMMENT 'Can be reversed/corrected'",
      resubmit_allowed_flag: "BOOLEAN COMMENT 'Transaction can be resubmitted'",
      
      // Timeframe
      return_timeframe_days: "INTEGER COMMENT 'Window for return (e.g., R01 = 2 days)'",
      
      // Common Reasons
      common_root_cause: "STRING COMMENT 'NSF|Closed Account|Invalid Account|Authorization Issue'",
      preventable_flag: "BOOLEAN COMMENT 'Preventable with prenote/validation'",
      
      // Regulatory
      regulation_reference: "STRING COMMENT 'NACHA Operating Rules reference'",
      
      // Fee Impact
      return_fee_applicable_flag: "BOOLEAN",
      typical_return_fee: "DECIMAL(10,2)",
      
      // Active Status
      active_flag: "BOOLEAN",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_ach_return_code ON gold.dim_ach_return_reason(return_code)",
    ],
  },

  // Dimension 10: ACH NOC Code
  {
    name: 'gold.dim_ach_noc_code',
    description: 'Type 1 dimension for NACHA ACH Notification of Change codes',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per NOC code',
    primaryKey: ['noc_code_key'],
    
    schema: {
      noc_code_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      noc_code: "STRING UNIQUE COMMENT 'C01-C13 NACHA NOC codes'",
      
      // Attributes
      noc_code_description: "STRING COMMENT 'Official NACHA description'",
      change_field: "STRING COMMENT 'ROUTING_NUMBER|ACCOUNT_NUMBER|ACCOUNT_TYPE|NAME'",
      
      // NOC Characteristics
      auto_update_recommended_flag: "BOOLEAN COMMENT 'Safe to auto-update customer record'",
      manual_verification_required_flag: "BOOLEAN",
      
      // Processing
      customer_notification_required_flag: "BOOLEAN",
      customer_consent_required_flag: "BOOLEAN",
      
      // Common Scenarios
      common_reason: "STRING COMMENT 'Account number change, routing number change, etc.'",
      
      // Regulatory
      regulation_reference: "STRING COMMENT 'NACHA Operating Rules reference'",
      
      // Active Status
      active_flag: "BOOLEAN",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_ach_noc_code ON gold.dim_ach_noc_code(noc_code)",
    ],
  },

  // Dimension 11: Wire Transfer Purpose
  {
    name: 'gold.dim_wire_purpose',
    description: 'Type 1 dimension for wire transfer payment purposes',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per wire purpose code',
    primaryKey: ['wire_purpose_key'],
    
    schema: {
      wire_purpose_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      purpose_code: "STRING UNIQUE COMMENT 'VENDOR_PAYMENT|PAYROLL|LOAN_PAYMENT|INVESTMENT|TRADE_SETTLEMENT|REAL_ESTATE|INTERCOMPANY'",
      
      // Attributes
      purpose_name: "STRING",
      purpose_category: "STRING COMMENT 'OPERATIONAL|INVESTMENT|FINANCING|TRADE'",
      
      // Regulatory Classification
      regulatory_reporting_required_flag: "BOOLEAN COMMENT 'Special reporting requirements'",
      regulatory_code: "STRING COMMENT 'Regulatory reporting code for international wires'",
      
      // Compliance Requirements
      enhanced_due_diligence_flag: "BOOLEAN",
      source_of_funds_verification_flag: "BOOLEAN",
      
      // Common Characteristics
      typical_wire_type: "STRING COMMENT 'DOMESTIC|INTERNATIONAL'",
      typical_amount_range: "STRING COMMENT '<$10k|$10k-$100k|$100k-$1M|>$1M'",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_wire_purpose_code ON gold.dim_wire_purpose(purpose_code)",
    ],
  },

  // Dimension 12: Payment Approval Workflow
  {
    name: 'gold.dim_payment_approval_workflow',
    description: 'Type 2 dimension for payment approval workflow configurations',
    dimensionType: 'SCD_TYPE_2',
    grain: 'One row per approval workflow version',
    primaryKey: ['approval_workflow_key'],
    
    schema: {
      approval_workflow_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      workflow_id: "STRING COMMENT 'Business key'",
      
      // Workflow Definition
      workflow_name: "STRING",
      workflow_type: "STRING COMMENT 'SINGLE_APPROVAL|DUAL_APPROVAL|MULTI_LEVEL_APPROVAL'",
      
      // Approval Levels
      approval_level_count: "INTEGER COMMENT 'Number of approval levels required'",
      parallel_approval_flag: "BOOLEAN COMMENT 'Approvals can be parallel vs sequential'",
      
      // Thresholds
      amount_threshold_min: "DECIMAL(18,2) COMMENT 'Minimum amount requiring this workflow'",
      amount_threshold_max: "DECIMAL(18,2) COMMENT 'Maximum amount for this workflow'",
      
      // Approver Requirements
      approver_role_level1: "STRING COMMENT 'Role required for level 1 approval'",
      approver_role_level2: "STRING COMMENT 'Role required for level 2 approval'",
      approver_role_level3: "STRING COMMENT 'Role required for level 3 approval'",
      
      // SLA
      approval_sla_hours: "INTEGER COMMENT 'Expected approval time'",
      auto_approve_on_timeout_flag: "BOOLEAN",
      escalation_hours: "INTEGER",
      
      // Active Status
      active_flag: "BOOLEAN",
      
      // SCD Type 2
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP",
      is_current: "BOOLEAN NOT NULL DEFAULT TRUE",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_approval_workflow_id ON gold.dim_payment_approval_workflow(workflow_id, is_current)",
    ],
  },

  // Dimension 13: Payee
  {
    name: 'gold.dim_payee',
    description: 'Type 2 slowly changing dimension for payment recipients/beneficiaries',
    dimensionType: 'SCD_TYPE_2',
    grain: 'One row per payee version',
    primaryKey: ['payee_key'],
    
    schema: {
      payee_key: "INTEGER PRIMARY KEY COMMENT 'Surrogate key'",
      
      // Natural Key
      payee_id: "STRING COMMENT 'Business key for payee'",
      
      // Payee Information
      payee_name: "STRING",
      payee_type: "STRING COMMENT 'INDIVIDUAL|BUSINESS|GOVERNMENT|INTERNAL'",
      
      // Banking Details
      payee_account_number: "STRING",
      payee_routing_number: "STRING COMMENT 'FK to dim_bank_routing'",
      payee_account_type: "STRING COMMENT 'CHECKING|SAVINGS'",
      
      // International Payee
      payee_iban: "STRING COMMENT 'International Bank Account Number'",
      payee_swift_bic: "STRING",
      payee_country: "STRING COMMENT 'ISO 3166 country code'",
      
      // Address
      payee_address_line1: "STRING",
      payee_address_line2: "STRING",
      payee_city: "STRING",
      payee_state: "STRING",
      payee_postal_code: "STRING",
      
      // Payee Classification
      payee_category: "STRING COMMENT 'VENDOR|EMPLOYEE|CUSTOMER|TAX_AUTHORITY|LENDER|INVESTOR'",
      vendor_id: "STRING COMMENT 'Vendor master ID if applicable'",
      employee_id: "STRING COMMENT 'Employee ID if payroll'",
      
      // Validation Status
      payee_validated_flag: "BOOLEAN COMMENT 'Banking details validated'",
      validation_date: "DATE",
      prenote_completed_flag: "BOOLEAN",
      prenote_date: "DATE",
      
      // Risk Rating
      payee_risk_rating: "STRING COMMENT 'LOW|MEDIUM|HIGH'",
      ofac_screening_status: "STRING COMMENT 'PASSED|MANUAL_REVIEW|FAILED'",
      sanctions_flag: "BOOLEAN",
      
      // Relationship
      first_payment_date: "DATE COMMENT 'Date of first payment to this payee'",
      last_payment_date: "DATE COMMENT 'Date of most recent payment'",
      total_payments_count: "INTEGER COMMENT 'Lifetime payment count'",
      total_payments_amount: "DECIMAL(18,2) COMMENT 'Lifetime payment amount'",
      
      // Active Status
      active_flag: "BOOLEAN",
      
      // SCD Type 2
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP",
      is_current: "BOOLEAN NOT NULL DEFAULT TRUE",
      row_hash: "STRING",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_payee_id ON gold.dim_payee(payee_id, is_current)",
      "CREATE INDEX idx_dim_payee_name ON gold.dim_payee(payee_name)",
    ],
  },

  // Dimension 14: Payment User
  {
    name: 'gold.dim_payment_user',
    description: 'Type 2 dimension for users who initiate/approve payments',
    dimensionType: 'SCD_TYPE_2',
    grain: 'One row per user version',
    primaryKey: ['payment_user_key'],
    
    schema: {
      payment_user_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      user_id: "STRING COMMENT 'Business key'",
      
      // User Information
      user_name: "STRING",
      user_email: "STRING",
      user_role: "STRING COMMENT 'INITIATOR|APPROVER|ADMIN|VIEWER'",
      user_department: "STRING COMMENT 'AP|AR|TREASURY|PAYROLL|ADMIN'",
      
      // Permissions
      can_initiate_payments: "BOOLEAN",
      can_approve_payments: "BOOLEAN",
      approval_limit_amount: "DECIMAL(18,2) COMMENT 'Maximum amount user can approve'",
      
      // Payment Method Permissions
      can_initiate_ach: "BOOLEAN",
      can_initiate_wire: "BOOLEAN",
      can_initiate_rtp: "BOOLEAN",
      can_approve_international: "BOOLEAN",
      
      // MFA & Security
      mfa_enabled_flag: "BOOLEAN",
      certificate_authentication_flag: "BOOLEAN",
      last_login_date: "DATE",
      
      // Active Status
      active_flag: "BOOLEAN",
      termination_date: "DATE",
      
      // SCD Type 2
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP",
      is_current: "BOOLEAN NOT NULL DEFAULT TRUE",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_payment_user_id ON gold.dim_payment_user(user_id, is_current)",
    ],
  },
];

// ============================================================================
// FACT TABLES
// ============================================================================

export const paymentsCommercialGoldFacts = [
  // Fact 1: Payment Transactions (Transaction Grain)
  {
    name: 'gold.fact_payment_transactions',
    description: 'Transaction-grain fact table for all payment types (ACH, wire, RTP, check, bill pay)',
    factType: 'TRANSACTION',
    grain: 'One row per payment transaction',
    primaryKey: ['payment_transaction_key'],
    foreignKeys: [
      'date_key',
      'company_key',
      'account_key',
      'payment_type_key',
      'payment_channel_key',
      'payment_status_key',
      'payee_key',
      'originating_bank_routing_key',
      'receiving_bank_routing_key',
      'payment_user_key',
      'approval_workflow_key',
      'settlement_network_key',
    ],
    
    schema: {
      // Surrogate Key
      payment_transaction_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      
      // Degenerate Dimensions (Transaction IDs)
      payment_transaction_id: "STRING COMMENT 'Business transaction ID'",
      trace_number: "STRING COMMENT 'ACH trace number or wire IMAD'",
      batch_id: "STRING COMMENT 'Batch ID if part of batch'",
      
      // Foreign Keys to Dimensions
      submission_date_key: "INTEGER COMMENT 'FK to dim_date (submission date)'",
      settlement_date_key: "INTEGER COMMENT 'FK to dim_date (settlement date)'",
      company_key: "INTEGER COMMENT 'FK to dim_commercial_customer'",
      account_key: "INTEGER COMMENT 'FK to dim_account'",
      payment_type_key: "INTEGER COMMENT 'FK to dim_payment_type'",
      payment_channel_key: "INTEGER COMMENT 'FK to dim_payment_channel'",
      payment_status_key: "INTEGER COMMENT 'FK to dim_payment_status'",
      payee_key: "INTEGER COMMENT 'FK to dim_payee'",
      originating_bank_routing_key: "INTEGER COMMENT 'FK to dim_bank_routing'",
      receiving_bank_routing_key: "INTEGER COMMENT 'FK to dim_bank_routing'",
      payment_user_key: "INTEGER COMMENT 'FK to dim_payment_user (initiator)'",
      approver_user_key: "INTEGER COMMENT 'FK to dim_payment_user (approver)'",
      approval_workflow_key: "INTEGER COMMENT 'FK to dim_payment_approval_workflow'",
      settlement_network_key: "INTEGER COMMENT 'FK to dim_settlement_network'",
      
      // Transaction Direction
      transaction_direction: "STRING COMMENT 'DEBIT|CREDIT'",
      
      // Measures - Amount
      transaction_amount: "DECIMAL(18,2) COMMENT 'Payment amount'",
      transaction_currency: "STRING DEFAULT 'USD'",
      fee_amount: "DECIMAL(10,2) COMMENT 'Total fees'",
      net_amount: "DECIMAL(18,2) COMMENT 'transaction_amount - fee_amount'",
      
      // Measures - Timing (in minutes/hours)
      submission_to_approval_minutes: "INTEGER COMMENT 'Time to approve'",
      approval_to_transmission_minutes: "INTEGER COMMENT 'Time to transmit'",
      transmission_to_settlement_hours: "DECIMAL(8,2) COMMENT 'Settlement time'",
      total_processing_hours: "DECIMAL(8,2) COMMENT 'End-to-end time'",
      
      // Flags
      same_day_ach_flag: "BOOLEAN",
      high_value_payment_flag: "BOOLEAN COMMENT 'Amount >= $100,000'",
      international_flag: "BOOLEAN",
      recurring_payment_flag: "BOOLEAN",
      prenote_flag: "BOOLEAN",
      dual_approval_flag: "BOOLEAN",
      
      // Success/Failure
      successful_flag: "BOOLEAN COMMENT 'Payment settled successfully'",
      returned_flag: "BOOLEAN",
      rejected_flag: "BOOLEAN",
      cancelled_flag: "BOOLEAN",
      
      // Timestamps (for detailed analysis)
      submission_timestamp: "TIMESTAMP",
      approval_timestamp: "TIMESTAMP",
      transmission_timestamp: "TIMESTAMP",
      settlement_timestamp: "TIMESTAMP",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_payment_txn_date ON gold.fact_payment_transactions(submission_date_key)",
      "CREATE INDEX idx_fact_payment_txn_company ON gold.fact_payment_transactions(company_key)",
      "CREATE INDEX idx_fact_payment_txn_type ON gold.fact_payment_transactions(payment_type_key)",
      "CREATE INDEX idx_fact_payment_txn_status ON gold.fact_payment_transactions(payment_status_key)",
    ],
    
    partitioning: "PARTITION BY RANGE(submission_date_key) -- Monthly partitions",
  },

  // Fact 2: ACH Returns (Transaction Grain)
  {
    name: 'gold.fact_ach_returns',
    description: 'Transaction-grain fact for ACH return transactions',
    factType: 'TRANSACTION',
    grain: 'One row per ACH return',
    primaryKey: ['ach_return_key'],
    foreignKeys: [
      'return_date_key',
      'original_payment_transaction_key',
      'company_key',
      'return_reason_key',
    ],
    
    schema: {
      ach_return_key: "BIGINT PRIMARY KEY",
      
      // Degenerate Dimensions
      return_id: "STRING COMMENT 'Return transaction ID'",
      original_trace_number: "STRING",
      return_trace_number: "STRING",
      
      // Foreign Keys
      return_date_key: "INTEGER COMMENT 'FK to dim_date'",
      original_submission_date_key: "INTEGER COMMENT 'FK to dim_date (original payment date)'",
      original_payment_transaction_key: "BIGINT COMMENT 'FK to fact_payment_transactions'",
      company_key: "INTEGER COMMENT 'FK to dim_commercial_customer'",
      return_reason_key: "INTEGER COMMENT 'FK to dim_ach_return_reason'",
      
      // Measures
      return_amount: "DECIMAL(18,2)",
      original_amount: "DECIMAL(18,2)",
      return_fee_assessed: "DECIMAL(10,2)",
      
      // Return Characteristics
      return_type: "STRING COMMENT 'CUSTOMER|ADMINISTRATIVE|BANK'",
      dishonored_return_flag: "BOOLEAN",
      resubmitted_flag: "BOOLEAN",
      resubmit_count: "INTEGER",
      
      // Timing
      days_from_settlement_to_return: "INTEGER COMMENT 'Calculated metric'",
      return_timestamp: "TIMESTAMP",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_ach_return_date ON gold.fact_ach_returns(return_date_key)",
      "CREATE INDEX idx_fact_ach_return_company ON gold.fact_ach_returns(company_key)",
      "CREATE INDEX idx_fact_ach_return_reason ON gold.fact_ach_returns(return_reason_key)",
    ],
    
    partitioning: "PARTITION BY RANGE(return_date_key)",
  },

  // Fact 3: Wire Transfers (Transaction Grain)
  {
    name: 'gold.fact_wire_transfers',
    description: 'Transaction-grain fact for wire transfer details (domestic and international)',
    factType: 'TRANSACTION',
    grain: 'One row per wire transfer',
    primaryKey: ['wire_transfer_key'],
    foreignKeys: [
      'submission_date_key',
      'value_date_key',
      'company_key',
      'originating_bank_key',
      'beneficiary_bank_key',
      'wire_purpose_key',
    ],
    
    schema: {
      wire_transfer_key: "BIGINT PRIMARY KEY",
      
      // Degenerate Dimensions
      wire_transaction_id: "STRING",
      imad: "STRING COMMENT 'Fedwire IMAD'",
      omad: "STRING",
      swift_reference: "STRING",
      uetr: "STRING COMMENT 'SWIFT gpi reference'",
      
      // Foreign Keys
      submission_date_key: "INTEGER COMMENT 'FK to dim_date'",
      value_date_key: "INTEGER COMMENT 'FK to dim_date'",
      settlement_date_key: "INTEGER COMMENT 'FK to dim_date'",
      company_key: "INTEGER COMMENT 'FK to dim_commercial_customer'",
      originating_bank_key: "INTEGER COMMENT 'FK to dim_bank_routing'",
      beneficiary_bank_key: "INTEGER COMMENT 'FK to dim_bank_routing'",
      intermediary_bank_key: "INTEGER COMMENT 'FK to dim_bank_routing (NULL if none)'",
      wire_purpose_key: "INTEGER COMMENT 'FK to dim_wire_purpose'",
      payment_user_key: "INTEGER COMMENT 'FK to dim_payment_user'",
      approver_user_key: "INTEGER COMMENT 'FK to dim_payment_user'",
      
      // Wire Classification
      wire_type: "STRING COMMENT 'DOMESTIC|INTERNATIONAL'",
      wire_network: "STRING COMMENT 'FEDWIRE|SWIFT|CHIPS'",
      wire_priority: "STRING COMMENT 'NORMAL|URGENT'",
      
      // Measures - Amount
      wire_amount: "DECIMAL(18,2)",
      wire_currency: "STRING",
      fx_rate: "DECIMAL(12,6) COMMENT 'NULL if domestic'",
      settlement_amount: "DECIMAL(18,2)",
      settlement_currency: "STRING DEFAULT 'USD'",
      
      // Measures - Fees
      originator_fee: "DECIMAL(10,2)",
      correspondent_fee: "DECIMAL(10,2)",
      beneficiary_fee: "DECIMAL(10,2)",
      total_fees: "DECIMAL(10,2)",
      
      // Measures - Timing
      submission_to_settlement_hours: "DECIMAL(8,2)",
      approval_time_minutes: "INTEGER",
      
      // Flags
      international_flag: "BOOLEAN",
      swift_gpi_flag: "BOOLEAN",
      dual_approval_flag: "BOOLEAN",
      intermediary_bank_flag: "BOOLEAN",
      high_value_wire_flag: "BOOLEAN COMMENT 'Amount >= $100,000'",
      
      // Success/Status
      successful_flag: "BOOLEAN",
      recalled_flag: "BOOLEAN",
      returned_flag: "BOOLEAN",
      
      // Timestamps
      submission_timestamp: "TIMESTAMP",
      approval_timestamp: "TIMESTAMP",
      transmission_timestamp: "TIMESTAMP",
      settlement_timestamp: "TIMESTAMP",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_wire_date ON gold.fact_wire_transfers(submission_date_key)",
      "CREATE INDEX idx_fact_wire_company ON gold.fact_wire_transfers(company_key)",
      "CREATE INDEX idx_fact_wire_type ON gold.fact_wire_transfers(wire_type)",
    ],
    
    partitioning: "PARTITION BY RANGE(submission_date_key)",
  },

  // Fact 4: Payment Fraud Events (Event Grain)
  {
    name: 'gold.fact_payment_fraud_events',
    description: 'Event-grain fact for payment fraud detection events and alerts',
    factType: 'TRANSACTION',
    grain: 'One row per fraud alert event',
    primaryKey: ['fraud_event_key'],
    foreignKeys: [
      'alert_date_key',
      'payment_transaction_key',
      'company_key',
      'fraud_rule_key',
    ],
    
    schema: {
      fraud_event_key: "BIGINT PRIMARY KEY",
      
      // Degenerate Dimensions
      fraud_alert_id: "STRING",
      transaction_id: "STRING",
      
      // Foreign Keys
      alert_date_key: "INTEGER COMMENT 'FK to dim_date'",
      resolution_date_key: "INTEGER COMMENT 'FK to dim_date (NULL if unresolved)'",
      payment_transaction_key: "BIGINT COMMENT 'FK to fact_payment_transactions'",
      company_key: "INTEGER COMMENT 'FK to dim_commercial_customer'",
      fraud_rule_key: "INTEGER COMMENT 'FK to dim_fraud_rule (primary rule triggered)'",
      
      // Alert Classification
      alert_type: "STRING COMMENT 'ACCOUNT_TAKEOVER|PAYMENT_FRAUD|CHECK_FRAUD|VELOCITY|AMOUNT_ANOMALY'",
      alert_severity: "STRING COMMENT 'CRITICAL|HIGH|MEDIUM|LOW'",
      
      // Measures - Risk Scores
      fraud_score: "DECIMAL(5,2) COMMENT 'Composite fraud score (0-100)'",
      ml_confidence_score: "DECIMAL(5,2) COMMENT 'ML model confidence'",
      
      // Measures - Counts
      triggered_rules_count: "INTEGER COMMENT 'Number of fraud rules triggered'",
      risk_factors_count: "INTEGER COMMENT 'Number of risk factors present'",
      
      // Measures - Financial Impact
      transaction_amount: "DECIMAL(18,2)",
      potential_loss_amount: "DECIMAL(18,2)",
      actual_loss_amount: "DECIMAL(18,2) COMMENT '0 if prevented'",
      recovery_amount: "DECIMAL(18,2)",
      
      // Measures - Resolution Time
      time_to_resolution_hours: "DECIMAL(8,2)",
      
      // Flags - Risk Factors
      velocity_anomaly_flag: "BOOLEAN",
      new_payee_flag: "BOOLEAN",
      large_amount_flag: "BOOLEAN",
      geolocation_mismatch_flag: "BOOLEAN",
      device_fingerprint_mismatch_flag: "BOOLEAN",
      
      // Flags - Actions
      transaction_blocked_flag: "BOOLEAN",
      account_frozen_flag: "BOOLEAN",
      customer_notified_flag: "BOOLEAN",
      
      // Alert Status
      alert_status: "STRING COMMENT 'OPEN|CONFIRMED_FRAUD|FALSE_POSITIVE|RESOLVED'",
      confirmed_fraud_flag: "BOOLEAN",
      false_positive_flag: "BOOLEAN",
      
      // SAR Filing
      sar_filed_flag: "BOOLEAN",
      sar_filing_date: "DATE",
      
      // Timestamps
      alert_timestamp: "TIMESTAMP",
      resolution_timestamp: "TIMESTAMP",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_fraud_date ON gold.fact_payment_fraud_events(alert_date_key)",
      "CREATE INDEX idx_fact_fraud_company ON gold.fact_payment_fraud_events(company_key)",
      "CREATE INDEX idx_fact_fraud_severity ON gold.fact_payment_fraud_events(alert_severity)",
    ],
    
    partitioning: "PARTITION BY RANGE(alert_date_key)",
  },

  // Fact 5: Payment Volume Daily (Periodic Snapshot)
  {
    name: 'gold.fact_payment_volume_daily',
    description: 'Daily periodic snapshot of payment volume metrics by customer and payment type',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per company per payment type per day',
    primaryKey: ['company_key', 'payment_type_key', 'date_key'],
    foreignKeys: ['date_key', 'company_key', 'payment_type_key'],
    
    schema: {
      // Foreign Keys (Composite Primary Key)
      date_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_date'",
      company_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_commercial_customer'",
      payment_type_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_payment_type'",
      
      // Measures - Transaction Counts
      total_transaction_count: "INTEGER",
      credit_transaction_count: "INTEGER",
      debit_transaction_count: "INTEGER",
      successful_transaction_count: "INTEGER",
      failed_transaction_count: "INTEGER",
      returned_transaction_count: "INTEGER",
      
      // Measures - Amounts
      total_transaction_amount: "DECIMAL(18,2)",
      total_credit_amount: "DECIMAL(18,2)",
      total_debit_amount: "DECIMAL(18,2)",
      average_transaction_amount: "DECIMAL(10,2)",
      median_transaction_amount: "DECIMAL(10,2)",
      largest_transaction_amount: "DECIMAL(18,2)",
      
      // Measures - Fees
      total_fee_amount: "DECIMAL(10,2)",
      average_fee_per_transaction: "DECIMAL(5,2)",
      
      // Measures - Unique Counts
      unique_payee_count: "INTEGER",
      new_payee_count: "INTEGER COMMENT 'First-time payees'",
      
      // Rates
      success_rate_pct: "DECIMAL(5,2) COMMENT 'successful / total * 100'",
      return_rate_pct: "DECIMAL(5,2) COMMENT 'returned / total * 100'",
      
      // Day-over-Day Comparisons
      prior_day_transaction_count: "INTEGER",
      transaction_count_change_pct: "DECIMAL(7,4)",
      prior_day_total_amount: "DECIMAL(18,2)",
      amount_change_pct: "DECIMAL(7,4)",
      
      // Flags
      volume_anomaly_flag: "BOOLEAN",
      amount_anomaly_flag: "BOOLEAN",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_volume_date ON gold.fact_payment_volume_daily(date_key)",
      "CREATE INDEX idx_fact_volume_company ON gold.fact_payment_volume_daily(company_key)",
    ],
    
    partitioning: "PARTITION BY RANGE(date_key)",
  },

  // Fact 6: Payment Settlement (Daily Snapshot)
  {
    name: 'gold.fact_payment_settlement',
    description: 'Daily settlement summary by network and account',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per settlement network per account per day',
    primaryKey: ['settlement_date_key', 'settlement_network_key', 'account_key'],
    foreignKeys: ['settlement_date_key', 'settlement_network_key', 'account_key', 'company_key'],
    
    schema: {
      // Foreign Keys (Composite Primary Key)
      settlement_date_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_date'",
      settlement_network_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_settlement_network'",
      account_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_account'",
      company_key: "INTEGER COMMENT 'FK to dim_commercial_customer'",
      
      // Measures - Settlement Counts
      total_settlement_count: "INTEGER",
      credit_settlement_count: "INTEGER",
      debit_settlement_count: "INTEGER",
      
      // Measures - Settlement Amounts
      total_credit_amount: "DECIMAL(18,2)",
      total_debit_amount: "DECIMAL(18,2)",
      net_settlement_amount: "DECIMAL(18,2) COMMENT 'Credits - Debits'",
      
      // Measures - Returns
      return_count: "INTEGER",
      return_amount: "DECIMAL(18,2)",
      return_rate_pct: "DECIMAL(5,2)",
      
      // Reconciliation
      reconciliation_status: "STRING COMMENT 'MATCHED|UNMATCHED|VARIANCE'",
      variance_amount: "DECIMAL(18,2)",
      variance_count: "INTEGER",
      
      // GL Posting
      gl_posting_date: "DATE",
      gl_posting_status: "STRING COMMENT 'POSTED|PENDING|FAILED'",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_settlement_date ON gold.fact_payment_settlement(settlement_date_key)",
      "CREATE INDEX idx_fact_settlement_network ON gold.fact_payment_settlement(settlement_network_key)",
    ],
    
    partitioning: "PARTITION BY RANGE(settlement_date_key)",
  },

  // Fact 7: Payment Exceptions (Event Grain)
  {
    name: 'gold.fact_payment_exceptions',
    description: 'Event-grain fact for payment exceptions and manual reviews',
    factType: 'TRANSACTION',
    grain: 'One row per exception event',
    primaryKey: ['payment_exception_key'],
    foreignKeys: [
      'exception_date_key',
      'payment_transaction_key',
      'company_key',
      'exception_type_key',
    ],
    
    schema: {
      payment_exception_key: "BIGINT PRIMARY KEY",
      
      // Degenerate Dimensions
      exception_id: "STRING",
      transaction_id: "STRING",
      
      // Foreign Keys
      exception_date_key: "INTEGER COMMENT 'FK to dim_date'",
      resolution_date_key: "INTEGER COMMENT 'FK to dim_date (NULL if unresolved)'",
      payment_transaction_key: "BIGINT COMMENT 'FK to fact_payment_transactions'",
      company_key: "INTEGER COMMENT 'FK to dim_commercial_customer'",
      exception_type_key: "INTEGER COMMENT 'FK to dim_exception_type'",
      
      // Exception Classification
      exception_category: "STRING COMMENT 'TECHNICAL|OPERATIONAL|COMPLIANCE|FRAUD'",
      exception_severity: "STRING COMMENT 'CRITICAL|HIGH|MEDIUM|LOW'",
      
      // Measures - Financial Impact
      transaction_amount: "DECIMAL(18,2)",
      
      // Measures - Resolution Time
      time_to_resolution_minutes: "INTEGER",
      sla_deadline_hours: "INTEGER",
      
      // Flags
      sla_met_flag: "BOOLEAN",
      auto_resolved_flag: "BOOLEAN",
      escalated_flag: "BOOLEAN",
      
      // Exception Status
      exception_status: "STRING COMMENT 'OPEN|RESOLVED|ESCALATED|CANCELLED'",
      resolution_action: "STRING COMMENT 'APPROVED|REJECTED|RETURNED|ESCALATED'",
      
      // Queue Assignment
      queue_name: "STRING COMMENT 'FRAUD_REVIEW|COMPLIANCE_REVIEW|OPERATIONS_REVIEW'",
      assigned_to_user_key: "INTEGER COMMENT 'FK to dim_payment_user'",
      
      // Timestamps
      exception_timestamp: "TIMESTAMP",
      resolution_timestamp: "TIMESTAMP",
      sla_deadline_timestamp: "TIMESTAMP",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_exception_date ON gold.fact_payment_exceptions(exception_date_key)",
      "CREATE INDEX idx_fact_exception_company ON gold.fact_payment_exceptions(company_key)",
      "CREATE INDEX idx_fact_exception_type ON gold.fact_payment_exceptions(exception_type_key)",
    ],
    
    partitioning: "PARTITION BY RANGE(exception_date_key)",
  },

  // Fact 8: Payment Fees (Transaction Grain)
  {
    name: 'gold.fact_payment_fees',
    description: 'Transaction-grain fact for payment fees and revenue',
    factType: 'TRANSACTION',
    grain: 'One row per fee assessed',
    primaryKey: ['payment_fee_key'],
    foreignKeys: [
      'fee_date_key',
      'payment_transaction_key',
      'company_key',
      'payment_type_key',
    ],
    
    schema: {
      payment_fee_key: "BIGINT PRIMARY KEY",
      
      // Degenerate Dimensions
      fee_id: "STRING",
      transaction_id: "STRING",
      
      // Foreign Keys
      fee_date_key: "INTEGER COMMENT 'FK to dim_date'",
      payment_transaction_key: "BIGINT COMMENT 'FK to fact_payment_transactions'",
      company_key: "INTEGER COMMENT 'FK to dim_commercial_customer'",
      payment_type_key: "INTEGER COMMENT 'FK to dim_payment_type'",
      
      // Fee Classification
      fee_type: "STRING COMMENT 'TRANSACTION_FEE|NETWORK_FEE|RETURN_FEE|EXPEDITED_FEE|FX_FEE'",
      fee_category: "STRING COMMENT 'PROCESSING|SERVICE|PENALTY'",
      
      // Measures - Fee Amount
      fee_amount: "DECIMAL(10,2) COMMENT 'Fee charged to customer'",
      network_fee_amount: "DECIMAL(10,2) COMMENT 'Fee paid to network (cost)'",
      bank_revenue: "DECIMAL(10,2) COMMENT 'fee_amount - network_fee_amount'",
      
      // Transaction Context
      transaction_amount: "DECIMAL(18,2) COMMENT 'Underlying payment amount'",
      fee_as_pct_of_transaction: "DECIMAL(7,4) COMMENT 'Fee % of transaction'",
      
      // Fee Waiver
      fee_waived_flag: "BOOLEAN",
      waiver_reason: "STRING COMMENT 'SERVICE_ISSUE|RELATIONSHIP|PROMOTION'",
      
      // GL Posting
      gl_account: "STRING",
      gl_posting_date: "DATE",
      
      // Timestamps
      fee_timestamp: "TIMESTAMP",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_fee_date ON gold.fact_payment_fees(fee_date_key)",
      "CREATE INDEX idx_fact_fee_company ON gold.fact_payment_fees(company_key)",
    ],
    
    partitioning: "PARTITION BY RANGE(fee_date_key)",
  },

  // Fact 9: Compliance Screening (Event Grain)
  {
    name: 'gold.fact_compliance_screening',
    description: 'Event-grain fact for payment compliance screening events (OFAC, sanctions, AML)',
    factType: 'TRANSACTION',
    grain: 'One row per compliance screening event',
    primaryKey: ['compliance_screening_key'],
    foreignKeys: [
      'screening_date_key',
      'payment_transaction_key',
      'company_key',
      'compliance_screening_type_key',
    ],
    
    schema: {
      compliance_screening_key: "BIGINT PRIMARY KEY",
      
      // Degenerate Dimensions
      screening_event_id: "STRING",
      transaction_id: "STRING",
      
      // Foreign Keys
      screening_date_key: "INTEGER COMMENT 'FK to dim_date'",
      payment_transaction_key: "BIGINT COMMENT 'FK to fact_payment_transactions (wire, ACH, etc.)'",
      company_key: "INTEGER COMMENT 'FK to dim_commercial_customer'",
      compliance_screening_type_key: "INTEGER COMMENT 'FK to dim_compliance_screening'",
      
      // Screening Results
      screening_status: "STRING COMMENT 'PASSED|FAILED|MANUAL_REVIEW'",
      screening_result: "STRING COMMENT 'CLEAR|MATCH|POTENTIAL_MATCH'",
      
      // Measures - Risk Scores
      screening_score: "DECIMAL(5,2) COMMENT 'Match confidence score (0-100)'",
      risk_score: "DECIMAL(5,2) COMMENT 'Overall risk score'",
      
      // Measures - Match Details
      match_count: "INTEGER COMMENT 'Number of list matches'",
      high_confidence_match_count: "INTEGER COMMENT 'Matches with score >90'",
      
      // Measures - Timing
      screening_processing_time_ms: "INTEGER COMMENT 'Screening duration in milliseconds'",
      manual_review_time_hours: "DECIMAL(8,2) COMMENT 'If manual review required'",
      
      // Flags
      sanctions_hit_flag: "BOOLEAN",
      pep_match_flag: "BOOLEAN COMMENT 'Politically Exposed Person'",
      adverse_media_flag: "BOOLEAN",
      manual_review_required_flag: "BOOLEAN",
      auto_blocked_flag: "BOOLEAN",
      
      // Compliance Hold
      compliance_hold_flag: "BOOLEAN",
      hold_duration_hours: "DECIMAL(6,2)",
      hold_released_flag: "BOOLEAN",
      
      // Regulatory Reporting
      ctr_filing_required_flag: "BOOLEAN COMMENT 'Currency Transaction Report'",
      sar_filing_required_flag: "BOOLEAN COMMENT 'Suspicious Activity Report'",
      
      // Transaction Context
      transaction_amount: "DECIMAL(18,2)",
      transaction_type: "STRING COMMENT 'WIRE|ACH|RTP'",
      beneficiary_country: "STRING COMMENT 'Beneficiary country code'",
      
      // Timestamps
      screening_timestamp: "TIMESTAMP",
      manual_review_completed_timestamp: "TIMESTAMP",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_compliance_date ON gold.fact_compliance_screening(screening_date_key)",
      "CREATE INDEX idx_fact_compliance_company ON gold.fact_compliance_screening(company_key)",
      "CREATE INDEX idx_fact_compliance_status ON gold.fact_compliance_screening(screening_status)",
    ],
    
    partitioning: "PARTITION BY RANGE(screening_date_key)",
  },
];

export const paymentsCommercialGoldLayer = {
  name: 'Payments-Commercial Gold Layer',
  totalDimensions: paymentsCommercialGoldDimensions.length,
  totalFacts: paymentsCommercialGoldFacts.length,
  dimensions: paymentsCommercialGoldDimensions,
  facts: paymentsCommercialGoldFacts,
};
