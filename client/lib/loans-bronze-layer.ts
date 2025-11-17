// COMPREHENSIVE BRONZE LAYER - LOANS & LENDING DOMAIN
// Raw landing zone for all loan-related source data
// Covers: Mortgage, Personal, Auto, Commercial, Student, Home Equity loans

// ============================================================================
// BRONZE LAYER PRINCIPLES
// ============================================================================

export const loansBronzeLayerPrinciples = {
  purpose: "Raw landing zone for source data with full history and lineage",
  characteristics: [
    "1:1 mapping to source systems",
    "No transformations or cleansing",
    "Full CDC (Change Data Capture) support",
    "Complete audit trail",
    "Retention: 7 years for compliance",
  ],
  dataIngestion: {
    frequency: "Real-time CDC + Daily full snapshots",
    sources: [
      "Core Banking System",
      "LOS (Loan Origination)",
      "Servicing Platform",
      "Collections System",
    ],
    format: "Parquet with Snappy compression",
  },
};

// ============================================================================
// BRONZE TABLE 1: LOAN APPLICATION MASTER
// ============================================================================

export const bronzeLoanApplicationMaster = {
  table_name: "bronze.loan_application_master_raw",
  description: "Raw loan application data from loan origination system",
  source_system: "Loan Origination System (LOS)",
  update_frequency: "Real-time CDC",

  ddl: `
CREATE TABLE bronze.loan_application_master_raw (
  -- Source Keys
  application_id VARCHAR(50) NOT NULL COMMENT 'Source application identifier',
  external_application_id VARCHAR(50) COMMENT 'Third-party application ID',
  
  -- Applicant Information
  primary_applicant_customer_id VARCHAR(50) COMMENT 'Primary borrower customer ID',
  co_applicant_customer_id VARCHAR(50) COMMENT 'Co-borrower customer ID',
  
  -- Application Details
  application_date DATE COMMENT 'Application submission date',
  application_timestamp TIMESTAMP COMMENT 'Precise submission time',
  application_channel VARCHAR(20) COMMENT 'BRANCH, ONLINE, MOBILE, DEALER, BROKER',
  application_status VARCHAR(20) COMMENT 'PENDING, APPROVED, DENIED, WITHDRAWN, EXPIRED',
  application_sub_status VARCHAR(50) COMMENT 'Detailed status',
  
  -- Loan Request
  loan_type VARCHAR(30) COMMENT 'MORTGAGE, AUTO, PERSONAL, COMMERCIAL, HELOC, STUDENT',
  loan_purpose VARCHAR(50) COMMENT 'PURCHASE, REFINANCE, DEBT_CONSOLIDATION, HOME_IMPROVEMENT',
  requested_amount DECIMAL(18,2) COMMENT 'Requested loan amount',
  requested_term_months INTEGER COMMENT 'Requested term in months',
  requested_rate DECIMAL(7,4) COMMENT 'Requested interest rate',
  
  -- Property/Collateral (for secured loans)
  property_address VARCHAR(500) COMMENT 'Collateral address',
  property_city VARCHAR(100),
  property_state VARCHAR(2),
  property_zip VARCHAR(10),
  property_type VARCHAR(30) COMMENT 'SINGLE_FAMILY, CONDO, MULTI_FAMILY, etc.',
  property_value DECIMAL(18,2) COMMENT 'Appraised value',
  purchase_price DECIMAL(18,2) COMMENT 'Purchase price (if applicable)',
  down_payment DECIMAL(18,2) COMMENT 'Down payment amount',
  ltv_ratio DECIMAL(7,4) COMMENT 'Loan-to-value ratio',
  
  -- Financial Information
  stated_annual_income DECIMAL(18,2) COMMENT 'Applicant stated income',
  verified_annual_income DECIMAL(18,2) COMMENT 'Verified income',
  employment_status VARCHAR(30) COMMENT 'EMPLOYED, SELF_EMPLOYED, RETIRED',
  employer_name VARCHAR(200),
  years_at_employer DECIMAL(5,2),
  monthly_debt_payments DECIMAL(18,2) COMMENT 'Existing debt obligations',
  dti_ratio DECIMAL(7,4) COMMENT 'Debt-to-income ratio',
  
  -- Credit Information
  credit_score INTEGER COMMENT 'Primary applicant FICO score',
  co_credit_score INTEGER COMMENT 'Co-applicant FICO score',
  credit_bureau VARCHAR(20) COMMENT 'EQUIFAX, EXPERIAN, TRANSUNION',
  credit_pull_date DATE COMMENT 'When credit was pulled',
  
  -- Decision Information
  decision_date DATE COMMENT 'Underwriting decision date',
  decision_timestamp TIMESTAMP,
  decision_by_user VARCHAR(50) COMMENT 'Underwriter user ID',
  denial_reason_code VARCHAR(50),
  denial_reason_description VARCHAR(500),
  adverse_action_notice_sent_flag BOOLEAN,
  adverse_action_notice_date DATE,
  
  -- Approved Terms (if approved)
  approved_amount DECIMAL(18,2),
  approved_term_months INTEGER,
  approved_rate DECIMAL(7,4),
  approved_payment DECIMAL(18,2),
  approval_conditions VARCHAR(2000) COMMENT 'Stipulations',
  approval_expiration_date DATE,
  
  -- Regulatory & Compliance
  hmda_reportable_flag BOOLEAN COMMENT 'HMDA reporting required',
  fair_lending_monitored_flag BOOLEAN,
  community_reinvestment_act_flag BOOLEAN COMMENT 'CRA credit',
  
  -- Broker/Dealer Information
  broker_id VARCHAR(50),
  broker_name VARCHAR(200),
  broker_commission_amount DECIMAL(18,2),
  dealer_id VARCHAR(50),
  dealer_name VARCHAR(200),
  dealer_participation_rate DECIMAL(7,4),
  
  -- CDC Metadata
  cdc_operation VARCHAR(10) COMMENT 'INSERT, UPDATE, DELETE',
  cdc_timestamp TIMESTAMP COMMENT 'Source system CDC timestamp',
  cdc_sequence_number BIGINT COMMENT 'CDC ordering',
  
  -- Audit Trail
  source_system_id VARCHAR(50) COMMENT 'Source system identifier',
  source_file_name VARCHAR(500),
  ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  ingestion_batch_id VARCHAR(100),
  record_hash VARCHAR(64) COMMENT 'MD5 hash for change detection'
)
PARTITIONED BY (DATE_TRUNC('month', application_date))
CLUSTER BY (application_status, loan_type);
  `,

  row_count_estimate: "500K applications/year",
  retention_policy: "7 years",
};

// ============================================================================
// BRONZE TABLE 2: LOAN ACCOUNT MASTER
// ============================================================================

export const bronzeLoanAccountMaster = {
  table_name: "bronze.loan_account_master_raw",
  description: "Raw loan account master data (booked loans)",
  source_system: "Core Banking System",
  update_frequency: "Real-time CDC",

  ddl: `
CREATE TABLE bronze.loan_account_master_raw (
  -- Account Keys
  loan_account_id VARCHAR(50) NOT NULL COMMENT 'Loan account number',
  application_id VARCHAR(50) COMMENT 'FK to application',
  
  -- Borrower Information
  customer_id VARCHAR(50) COMMENT 'Primary borrower',
  co_borrower_customer_id VARCHAR(50),
  
  -- Account Status
  account_status VARCHAR(20) COMMENT 'ACTIVE, PAID_OFF, CHARGED_OFF, FORECLOSED, BANKRUPT',
  account_sub_status VARCHAR(50),
  status_date DATE COMMENT 'When status last changed',
  
  -- Loan Characteristics
  loan_type VARCHAR(30),
  loan_sub_type VARCHAR(50) COMMENT 'CONVENTIONAL, FHA, VA, JUMBO for mortgages',
  loan_purpose VARCHAR(50),
  
  -- Booking Information
  origination_date DATE COMMENT 'Loan funding/booking date',
  first_payment_date DATE,
  maturity_date DATE,
  
  -- Terms & Amounts
  original_principal DECIMAL(18,2) COMMENT 'Original loan amount',
  current_principal DECIMAL(18,2) COMMENT 'Current principal balance',
  original_term_months INTEGER,
  remaining_term_months INTEGER,
  interest_rate DECIMAL(7,4) COMMENT 'Current rate',
  original_rate DECIMAL(7,4) COMMENT 'Original rate',
  rate_type VARCHAR(20) COMMENT 'FIXED, VARIABLE, HYBRID',
  payment_amount DECIMAL(18,2) COMMENT 'Current P&I payment',
  
  -- Variable Rate Details (if applicable)
  index_type VARCHAR(30) COMMENT 'PRIME, LIBOR, SOFR, etc.',
  margin DECIMAL(7,4),
  adjustment_frequency_months INTEGER,
  next_rate_adjustment_date DATE,
  rate_cap_periodic DECIMAL(7,4),
  rate_cap_lifetime DECIMAL(7,4),
  rate_floor DECIMAL(7,4),
  
  -- Collateral (for secured loans)
  collateral_type VARCHAR(30) COMMENT 'REAL_ESTATE, VEHICLE, EQUIPMENT, etc.',
  collateral_value DECIMAL(18,2),
  collateral_id VARCHAR(50),
  lien_position INTEGER COMMENT '1=First lien, 2=Second lien',
  
  -- Property Details (for real estate loans)
  property_address VARCHAR(500),
  property_city VARCHAR(100),
  property_state VARCHAR(2),
  property_zip VARCHAR(10),
  property_type VARCHAR(30),
  property_value DECIMAL(18,2),
  
  -- Servicing Information
  servicing_branch_id VARCHAR(50),
  loan_officer_id VARCHAR(50),
  relationship_manager_id VARCHAR(50),
  servicing_status VARCHAR(20) COMMENT 'PORTFOLIO, SOLD, PARTICIPATED',
  servicer_name VARCHAR(200) COMMENT 'If sold/serviced externally',
  
  -- Delinquency & Risk
  days_past_due INTEGER,
  delinquency_status VARCHAR(20) COMMENT 'CURRENT, 30DPD, 60DPD, 90DPD, 120DPD+',
  last_payment_date DATE,
  last_payment_amount DECIMAL(18,2),
  missed_payments_count INTEGER COMMENT 'Total missed payments',
  
  -- Loss Mitigation
  forbearance_flag BOOLEAN,
  forbearance_start_date DATE,
  forbearance_end_date DATE,
  modification_flag BOOLEAN,
  modification_date DATE,
  bankruptcy_flag BOOLEAN,
  bankruptcy_filing_date DATE,
  bankruptcy_chapter VARCHAR(10) COMMENT 'CHAPTER_7, CHAPTER_13',
  
  -- Financial Performance
  total_interest_paid_ytd DECIMAL(18,2),
  total_fees_collected_ytd DECIMAL(18,2),
  total_principal_paid_ytd DECIMAL(18,2),
  
  -- Regulatory Classifications
  regulatory_loan_type VARCHAR(30) COMMENT 'COMMERCIAL, CONSUMER, MORTGAGE',
  call_report_code VARCHAR(20),
  risk_rating VARCHAR(10) COMMENT 'PASS, SPECIAL_MENTION, SUBSTANDARD, DOUBTFUL, LOSS',
  risk_rating_date DATE,
  
  -- CECL (Credit Losses)
  cecl_pool_id VARCHAR(50),
  probability_of_default DECIMAL(7,4),
  loss_given_default DECIMAL(7,4),
  expected_loss DECIMAL(18,2),
  allowance_allocation DECIMAL(18,2),
  
  -- Participations & Secondary Market
  participation_flag BOOLEAN COMMENT 'Participated out',
  participation_pct DECIMAL(7,4),
  sold_to_secondary_market_flag BOOLEAN,
  investor_name VARCHAR(200),
  investor_loan_number VARCHAR(50),
  
  -- CDC Metadata
  cdc_operation VARCHAR(10),
  cdc_timestamp TIMESTAMP,
  cdc_sequence_number BIGINT,
  
  -- Audit
  source_system_id VARCHAR(50),
  ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  record_hash VARCHAR(64)
)
PARTITIONED BY (DATE_TRUNC('month', origination_date))
CLUSTER BY (account_status, loan_type, delinquency_status);
  `,

  row_count_estimate: "2M active loans",
};

// ============================================================================
// BRONZE TABLE 3: LOAN PAYMENT TRANSACTIONS
// ============================================================================

export const bronzeLoanPaymentTransactions = {
  table_name: "bronze.loan_payment_transactions_raw",
  description: "Raw payment transaction history",
  source_system: "Loan Servicing Platform",
  update_frequency: "Real-time CDC",

  ddl: `
CREATE TABLE bronze.loan_payment_transactions_raw (
  -- Transaction Keys
  payment_transaction_id VARCHAR(50) NOT NULL,
  loan_account_id VARCHAR(50) NOT NULL,
  
  -- Payment Details
  payment_date DATE,
  payment_timestamp TIMESTAMP,
  effective_date DATE COMMENT 'Accounting effective date',
  payment_amount DECIMAL(18,2),
  
  -- Payment Allocation
  principal_amount DECIMAL(18,2),
  interest_amount DECIMAL(18,2),
  escrow_amount DECIMAL(18,2),
  fee_amount DECIMAL(18,2),
  late_charge_amount DECIMAL(18,2),
  other_amount DECIMAL(18,2),
  
  -- Payment Method
  payment_method VARCHAR(30) COMMENT 'ACH, CHECK, WIRE, CARD, AUTO_DRAFT',
  payment_channel VARCHAR(20) COMMENT 'ONLINE, MOBILE, BRANCH, MAIL, PHONE',
  ach_transaction_id VARCHAR(50),
  check_number VARCHAR(20),
  
  -- Payment Type
  payment_type VARCHAR(30) COMMENT 'REGULAR, EXTRA_PRINCIPAL, PAYOFF, CURTAILMENT',
  scheduled_payment_flag BOOLEAN COMMENT 'Scheduled vs ad-hoc',
  auto_pay_flag BOOLEAN,
  
  -- Payment Status
  payment_status VARCHAR(20) COMMENT 'POSTED, PENDING, REVERSED, NSF, RETURNED',
  reversal_flag BOOLEAN,
  reversal_reason VARCHAR(200),
  nsf_flag BOOLEAN COMMENT 'Non-sufficient funds',
  
  -- Application to Periods
  billing_cycle_date DATE,
  due_date DATE,
  days_late INTEGER COMMENT 'Days past due at payment',
  
  -- Suspense Handling
  suspense_flag BOOLEAN COMMENT 'Payment in suspense',
  suspense_reason VARCHAR(200),
  suspense_cleared_date DATE,
  
  -- CDC Metadata
  cdc_operation VARCHAR(10),
  cdc_timestamp TIMESTAMP,
  cdc_sequence_number BIGINT,
  
  -- Audit
  source_system_id VARCHAR(50),
  ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  record_hash VARCHAR(64)
)
PARTITIONED BY (DATE_TRUNC('month', payment_date))
CLUSTER BY (loan_account_id, payment_status);
  `,

  row_count_estimate: "200M transactions/year",
};

// Continue with remaining Bronze tables...
// (I'll create abbreviated versions to save space)

export const additionalBronzeTables = [
  {
    table_name: "bronze.loan_balance_daily_raw",
    description: "Daily loan balance snapshots",
    key_fields: [
      "loan_account_id",
      "balance_date",
      "principal_balance",
      "interest_balance",
      "escrow_balance",
    ],
  },
  {
    table_name: "bronze.loan_interest_accruals_raw",
    description: "Daily interest accrual details",
    key_fields: [
      "loan_account_id",
      "accrual_date",
      "accrued_amount",
      "rate_applied",
    ],
  },
  {
    table_name: "bronze.loan_fee_transactions_raw",
    description: "Fee assessments and waivers",
    key_fields: [
      "fee_transaction_id",
      "loan_account_id",
      "fee_type",
      "fee_amount",
    ],
  },
  {
    table_name: "bronze.collateral_master_raw",
    description: "Collateral/property details",
    key_fields: [
      "collateral_id",
      "collateral_type",
      "appraised_value",
      "lien_position",
    ],
  },
  {
    table_name: "bronze.underwriting_decisions_raw",
    description: "Underwriting decision audit trail",
    key_fields: [
      "application_id",
      "decision_date",
      "decision_outcome",
      "credit_score",
    ],
  },
  {
    table_name: "bronze.collections_activities_raw",
    description: "Collections contacts and actions",
    key_fields: [
      "activity_id",
      "loan_account_id",
      "activity_type",
      "contact_date",
    ],
  },
  {
    table_name: "bronze.loan_modifications_raw",
    description: "Loan modification history",
    key_fields: [
      "modification_id",
      "loan_account_id",
      "modification_type",
      "effective_date",
    ],
  },
  {
    table_name: "bronze.escrow_transactions_raw",
    description: "Escrow deposits and disbursements",
    key_fields: [
      "escrow_transaction_id",
      "loan_account_id",
      "transaction_type",
      "amount",
    ],
  },
  {
    table_name: "bronze.credit_bureau_data_raw",
    description: "Credit bureau pulls and scores",
    key_fields: [
      "credit_pull_id",
      "customer_id",
      "bureau",
      "fico_score",
      "pull_date",
    ],
  },
  {
    table_name: "bronze.rate_master_raw",
    description: "Interest rate tables and indices",
    key_fields: ["rate_id", "rate_type", "effective_date", "rate_value"],
  },
  {
    table_name: "bronze.loan_documents_raw",
    description: "Loan document metadata",
    key_fields: [
      "document_id",
      "loan_account_id",
      "document_type",
      "document_date",
    ],
  },
  {
    table_name: "bronze.foreclosure_events_raw",
    description: "Foreclosure process tracking",
    key_fields: [
      "foreclosure_id",
      "loan_account_id",
      "foreclosure_stage",
      "event_date",
    ],
  },
];

// ============================================================================
// BRONZE LAYER CATALOG
// ============================================================================

export const loansBronzeLayerCatalog = {
  totalTables: 18,
  totalColumns: 450,
  estimatedDailyVolume: "5M rows/day",
  estimatedTotalRows: "2B rows (across all tables)",

  tables: [
    bronzeLoanApplicationMaster,
    bronzeLoanAccountMaster,
    bronzeLoanPaymentTransactions,
    ...additionalBronzeTables,
  ],

  dataFlows: {
    realTimeCDC: [
      "loan_application_master_raw",
      "loan_account_master_raw",
      "loan_payment_transactions_raw",
    ],
    dailyBatch: [
      "loan_balance_daily_raw",
      "loan_interest_accruals_raw",
      "collateral_master_raw",
    ],
    weeklyBatch: ["credit_bureau_data_raw", "rate_master_raw"],
  },

  qualityChecks: [
    "Primary key uniqueness validation",
    "Foreign key referential integrity",
    "Mandatory field completeness (>99%)",
    "Date sequence validation",
    "Amount field range validation",
    "Enum value validation",
  ],

  retentionPolicies: {
    applications: "7 years (compliance requirement)",
    accounts: "Lifetime + 7 years after payoff",
    transactions: "7 years",
    documents: "Lifetime + 7 years",
  },
};
