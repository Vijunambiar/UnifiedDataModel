/**
 * LOANS-RETAIL ERD DEFINITIONS
 * 
 * Logical and Physical ERD definitions for retail lending
 * Sources: FIS Loan IQ, Temenos T24 Loans, Black Knight LoanSphere
 */

// LOGICAL ERD - Business Model
export const loansRetailLogicalERD = {
  entities: [
    {
      name: 'Loan',
      type: 'core',
      description: 'Personal loans, auto loans, student loans, HELOC',
      attributes: [
        { name: 'loan_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'loan_number', type: 'STRING', description: 'Customer-facing loan number' },
        { name: 'loan_type', type: 'STRING', description: 'Personal|Auto|Student|HELOC|Installment' },
        { name: 'loan_subtype', type: 'STRING', description: 'Unsecured Personal|New Auto|Used Auto' },
        { name: 'loan_purpose', type: 'STRING', description: 'Debt Consolidation|Auto Purchase|Education' },
        { name: 'loan_status', type: 'STRING', description: 'Active|Paid Off|Charged Off|Bankruptcy' },
        { name: 'origination_date', type: 'DATE', description: 'Loan funding date' },
        { name: 'maturity_date', type: 'DATE', description: 'Final payment due date' },
        { name: 'primary_borrower_id', type: 'BIGINT', isForeignKey: true },
        { name: 'original_loan_amount', type: 'DECIMAL(18,2)', description: 'Original principal' },
        { name: 'current_principal_balance', type: 'DECIMAL(18,2)', description: 'Outstanding principal' },
        { name: 'interest_rate_type', type: 'STRING', description: 'Fixed|Variable|Adjustable' },
        { name: 'current_interest_rate', type: 'DECIMAL(10,6)', description: 'Current APR' },
        { name: 'scheduled_payment_amount', type: 'DECIMAL(18,2)', description: 'Regular payment' },
        { name: 'next_payment_due_date', type: 'DATE' },
        { name: 'days_past_due', type: 'INTEGER', description: 'Current DPD' },
        { name: 'delinquency_status', type: 'STRING', description: 'Current|30DPD|60DPD|90DPD|120+DPD' },
        { name: 'collateral_type', type: 'STRING', description: 'Vehicle|Real Estate|None' },
      ],
    },
    {
      name: 'Loan Payment',
      type: 'event',
      description: 'Loan payment transactions',
      attributes: [
        { name: 'payment_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'loan_id', type: 'BIGINT', isForeignKey: true },
        { name: 'payment_date', type: 'DATE' },
        { name: 'payment_amount', type: 'DECIMAL(18,2)', description: 'Total payment' },
        { name: 'principal_paid', type: 'DECIMAL(18,2)', description: 'Principal portion' },
        { name: 'interest_paid', type: 'DECIMAL(18,2)', description: 'Interest portion' },
        { name: 'escrow_paid', type: 'DECIMAL(18,2)', description: 'Escrow portion' },
        { name: 'fees_paid', type: 'DECIMAL(18,2)', description: 'Fees/penalties' },
        { name: 'payment_type', type: 'STRING', description: 'Scheduled|Extra|Payoff|Late' },
        { name: 'payment_method', type: 'STRING', description: 'ACH|Check|Wire|Online|Auto-Pay' },
        { name: 'payment_status', type: 'STRING', description: 'Posted|Pending|Returned|Reversed' },
      ],
    },
    {
      name: 'Loan Application',
      type: 'event',
      description: 'Loan application and origination',
      attributes: [
        { name: 'application_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'loan_id', type: 'BIGINT', isForeignKey: true, description: 'NULL until approved' },
        { name: 'application_date', type: 'DATE' },
        { name: 'applicant_customer_id', type: 'BIGINT', isForeignKey: true },
        { name: 'requested_amount', type: 'DECIMAL(18,2)' },
        { name: 'requested_term_months', type: 'INTEGER' },
        { name: 'application_status', type: 'STRING', description: 'Pending|Approved|Denied|Withdrawn' },
        { name: 'decision_date', type: 'DATE' },
        { name: 'denial_reason', type: 'STRING', description: 'Insufficient Income|Poor Credit|DTI Too High' },
        { name: 'fico_score_at_application', type: 'INTEGER' },
        { name: 'stated_income', type: 'DECIMAL(18,2)' },
        { name: 'debt_to_income_ratio', type: 'DECIMAL(5,4)', description: 'DTI ratio' },
        { name: 'application_channel', type: 'STRING', description: 'Branch|Online|Phone|Partner' },
      ],
    },
    {
      name: 'Collateral',
      type: 'core',
      description: 'Loan collateral (vehicles, property)',
      attributes: [
        { name: 'collateral_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'loan_id', type: 'BIGINT', isForeignKey: true },
        { name: 'collateral_type', type: 'STRING', description: 'Vehicle|Real Estate|Equipment|Securities' },
        { name: 'vehicle_vin', type: 'STRING', description: 'VIN for auto loans' },
        { name: 'vehicle_make', type: 'STRING' },
        { name: 'vehicle_model', type: 'STRING' },
        { name: 'vehicle_year', type: 'INTEGER' },
        { name: 'vehicle_mileage', type: 'INTEGER' },
        { name: 'collateral_value', type: 'DECIMAL(18,2)', description: 'Appraised value' },
        { name: 'loan_to_value_ratio', type: 'DECIMAL(5,4)', description: 'LTV ratio' },
        { name: 'valuation_date', type: 'DATE' },
      ],
    },
    {
      name: 'Delinquency Event',
      type: 'event',
      description: 'Delinquency tracking and collection activity',
      attributes: [
        { name: 'delinquency_id', type: 'BIGINT', isPrimaryKey: true },
        { name: 'loan_id', type: 'BIGINT', isForeignKey: true },
        { name: 'event_date', type: 'DATE' },
        { name: 'event_type', type: 'STRING', description: 'Became Delinquent|Cured|Charge Off|Bankruptcy' },
        { name: 'days_past_due', type: 'INTEGER' },
        { name: 'delinquent_amount', type: 'DECIMAL(18,2)' },
        { name: 'collection_status', type: 'STRING', description: 'Early Stage|Late Stage|Legal|Charge Off' },
        { name: 'collection_action', type: 'STRING', description: 'Letter Sent|Call Made|Legal Action' },
      ],
    },
  ],
  relationships: [
    {
      from: 'Loan Payment',
      to: 'Loan',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'loan_id',
    },
    {
      from: 'Loan Application',
      to: 'Loan',
      type: 'one-to-one',
      cardinality: '1:1',
      foreignKey: 'loan_id',
    },
    {
      from: 'Collateral',
      to: 'Loan',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'loan_id',
    },
    {
      from: 'Delinquency Event',
      to: 'Loan',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'loan_id',
    },
  ],
};

// PHYSICAL ERD - Bronze Layer
export const loansRetailPhysicalERD = {
  tables: [
    {
      name: 'bronze.retail_loan_master',
      description: 'Core loan account data',
      estimatedRows: 50000000,
      avgRowSize: 3072,
      schema: {
        // Primary Keys
        loan_id: 'BIGINT PRIMARY KEY',
        source_system: 'STRING PRIMARY KEY',
        
        // Natural Keys
        loan_number: 'STRING UNIQUE',
        loan_uuid: 'STRING UNIQUE',
        application_id: 'BIGINT FK to application',
        
        // Loan Type
        loan_type: 'STRING COMMENT Personal|Auto|Student|HELOC|Installment|Revolving',
        loan_subtype: 'STRING COMMENT Unsecured Personal|Secured Personal|New Auto|Used Auto',
        loan_purpose: 'STRING COMMENT Debt Consolidation|Home Improvement|Auto Purchase|Education',
        product_code: 'STRING',
        product_name: 'STRING',
        loan_category: 'STRING COMMENT Secured|Unsecured',
        collateral_type: 'STRING COMMENT Vehicle|Real Estate|Securities|None',
        
        // Status & Lifecycle
        loan_status: 'STRING COMMENT Active|Paid Off|Charged Off|Bankruptcy|Foreclosure|Modification',
        loan_status_date: 'DATE',
        loan_stage: 'STRING COMMENT Origination|Active|Delinquent|Default|Collection|Recovery|Closed',
        origination_date: 'DATE',
        first_payment_date: 'DATE',
        maturity_date: 'DATE',
        paid_off_date: 'DATE',
        loan_age_months: 'INTEGER',
        remaining_term_months: 'INTEGER',
        
        // Borrowers
        primary_borrower_id: 'BIGINT FK to customer',
        co_borrower_id: 'BIGINT',
        guarantor_id: 'BIGINT',
        borrower_count: 'INTEGER',
        
        // Loan Amounts
        original_loan_amount: 'DECIMAL(18,2)',
        current_principal_balance: 'DECIMAL(18,2)',
        current_interest_balance: 'DECIMAL(18,2)',
        current_fee_balance: 'DECIMAL(18,2)',
        total_payoff_amount: 'DECIMAL(18,2)',
        principal_paid_to_date: 'DECIMAL(18,2)',
        interest_paid_to_date: 'DECIMAL(18,2)',
        fees_paid_to_date: 'DECIMAL(18,2)',
        available_credit: 'DECIMAL(18,2) COMMENT For HELOC/revolving',
        credit_limit: 'DECIMAL(18,2)',
        
        // Interest Rate
        interest_rate_type: 'STRING COMMENT Fixed|Variable|Adjustable',
        current_interest_rate: 'DECIMAL(10,6) COMMENT APR decimal',
        original_interest_rate: 'DECIMAL(10,6)',
        interest_rate_index: 'STRING COMMENT Prime|LIBOR|SOFR|Treasury',
        interest_rate_margin: 'DECIMAL(10,6)',
        interest_rate_floor: 'DECIMAL(10,6)',
        interest_rate_ceiling: 'DECIMAL(10,6)',
        last_rate_change_date: 'DATE',
        next_rate_change_date: 'DATE',
        apr: 'DECIMAL(10,6) COMMENT Annual Percentage Rate',
        
        // Payment Terms
        payment_frequency: 'STRING COMMENT Monthly|Bi-Weekly|Weekly|Quarterly',
        scheduled_payment_amount: 'DECIMAL(18,2)',
        minimum_payment_amount: 'DECIMAL(18,2)',
        payment_due_day: 'INTEGER COMMENT 1-31',
        next_payment_due_date: 'DATE',
        last_payment_date: 'DATE',
        last_payment_amount: 'DECIMAL(18,2)',
        total_number_of_payments: 'INTEGER',
        payments_made: 'INTEGER',
        payments_remaining: 'INTEGER',
        
        // Delinquency
        days_past_due: 'INTEGER',
        delinquency_status: 'STRING COMMENT Current|30DPD|60DPD|90DPD|120+DPD',
        delinquent_amount: 'DECIMAL(18,2)',
        missed_payment_count_ltd: 'INTEGER',
        missed_payment_count_12mo: 'INTEGER',
        last_delinquency_date: 'DATE',
        
        // Fees
        origination_fee: 'DECIMAL(18,2)',
        late_fee_amount: 'DECIMAL(18,2)',
        prepayment_penalty_flag: 'BOOLEAN',
        prepayment_penalty_amount: 'DECIMAL(18,2)',
        fees_charged_ytd: 'DECIMAL(18,2)',
        
        // Auto Loan Specific
        vehicle_vin: 'STRING',
        vehicle_make: 'STRING',
        vehicle_model: 'STRING',
        vehicle_year: 'INTEGER',
        vehicle_mileage: 'INTEGER',
        vehicle_value: 'DECIMAL(18,2)',
        vehicle_condition: 'STRING COMMENT New|Used|Certified Pre-Owned',
        
        // Audit
        load_timestamp: 'TIMESTAMP',
        cdc_operation: 'STRING',
        record_hash: 'STRING',
      },
    },
    {
      name: 'bronze.retail_loan_payments',
      description: 'Loan payment history',
      estimatedRows: 1000000000,
      avgRowSize: 384,
      schema: {
        payment_id: 'BIGINT PRIMARY KEY',
        loan_id: 'BIGINT FK to loan',
        
        payment_date: 'DATE',
        payment_timestamp: 'TIMESTAMP',
        due_date: 'DATE COMMENT Original due date',
        
        payment_amount: 'DECIMAL(18,2) COMMENT Total payment',
        principal_paid: 'DECIMAL(18,2)',
        interest_paid: 'DECIMAL(18,2)',
        escrow_paid: 'DECIMAL(18,2) COMMENT For mortgage escrow',
        fees_paid: 'DECIMAL(18,2)',
        late_fee_paid: 'DECIMAL(18,2)',
        prepayment_penalty_paid: 'DECIMAL(18,2)',
        
        principal_balance_after: 'DECIMAL(18,2)',
        
        payment_number: 'INTEGER COMMENT Payment sequence number',
        payment_type: 'STRING COMMENT Scheduled|Extra|Partial|Payoff|Late|Returned',
        payment_method: 'STRING COMMENT ACH|Check|Wire|Online|Auto-Pay|Payroll Deduction',
        payment_status: 'STRING COMMENT Posted|Pending|Returned|NSF|Reversed',
        
        days_late: 'INTEGER COMMENT Days late at payment',
        
        autopay_flag: 'BOOLEAN',
        reversal_flag: 'BOOLEAN',
        original_payment_id: 'BIGINT COMMENT If reversed',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
    {
      name: 'bronze.retail_loan_applications',
      description: 'Loan applications and underwriting decisions',
      estimatedRows: 75000000,
      avgRowSize: 2048,
      schema: {
        application_id: 'BIGINT PRIMARY KEY',
        loan_id: 'BIGINT FK to loan COMMENT NULL until funded',
        
        application_date: 'DATE',
        application_timestamp: 'TIMESTAMP',
        application_number: 'STRING UNIQUE',
        
        applicant_customer_id: 'BIGINT FK to customer',
        co_applicant_customer_id: 'BIGINT',
        
        requested_loan_type: 'STRING',
        requested_amount: 'DECIMAL(18,2)',
        requested_term_months: 'INTEGER',
        loan_purpose: 'STRING',
        
        application_status: 'STRING COMMENT Pending|Under Review|Approved|Conditionally Approved|Denied|Withdrawn|Cancelled',
        application_stage: 'STRING COMMENT Submitted|Credit Check|Income Verification|Underwriting|Closing',
        
        decision_date: 'DATE',
        decision_timestamp: 'TIMESTAMP',
        approved_amount: 'DECIMAL(18,2)',
        approved_rate: 'DECIMAL(10,6)',
        approved_term_months: 'INTEGER',
        
        denial_reason: 'STRING COMMENT Insufficient Income|Poor Credit|DTI Too High|Insufficient Collateral',
        denial_reason_code: 'STRING COMMENT Adverse action code',
        
        // Applicant Financials
        stated_income: 'DECIMAL(18,2)',
        verified_income: 'DECIMAL(18,2)',
        employment_status: 'STRING',
        employer_name: 'STRING',
        years_at_employer: 'DECIMAL(5,2)',
        
        // Credit Metrics
        fico_score_at_application: 'INTEGER',
        credit_bureau: 'STRING COMMENT Equifax|Experian|TransUnion',
        total_monthly_debt: 'DECIMAL(18,2)',
        debt_to_income_ratio: 'DECIMAL(5,4)',
        
        // Collateral (Auto)
        collateral_type: 'STRING',
        vehicle_vin: 'STRING',
        vehicle_value: 'DECIMAL(18,2)',
        loan_to_value_ratio: 'DECIMAL(5,4)',
        
        application_channel: 'STRING COMMENT Branch|Online|Mobile|Phone|Dealer Partner',
        referral_source: 'STRING',
        
        underwriter_id: 'STRING',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
    {
      name: 'bronze.retail_loan_collateral',
      description: 'Loan collateral details (vehicles, property)',
      estimatedRows: 30000000,
      schema: {
        collateral_id: 'BIGINT PRIMARY KEY',
        loan_id: 'BIGINT FK to loan',
        
        collateral_type: 'STRING COMMENT Vehicle|Real Estate|Equipment|Securities|None',
        collateral_status: 'STRING COMMENT Active|Released|Repossessed|Liquidated',
        
        // Vehicle Collateral
        vehicle_vin: 'STRING COMMENT Vehicle Identification Number',
        vehicle_make: 'STRING',
        vehicle_model: 'STRING',
        vehicle_year: 'INTEGER',
        vehicle_trim: 'STRING',
        vehicle_mileage: 'INTEGER',
        vehicle_color: 'STRING',
        vehicle_condition: 'STRING COMMENT New|Used|Certified Pre-Owned',
        
        // Valuation
        original_value: 'DECIMAL(18,2)',
        current_value: 'DECIMAL(18,2)',
        valuation_source: 'STRING COMMENT KBB|NADA|Appraisal|Carfax',
        last_valuation_date: 'DATE',
        
        loan_to_value_ratio: 'DECIMAL(5,4) COMMENT LTV',
        
        // Title & Lien
        title_state: 'STRING',
        lien_holder_name: 'STRING COMMENT Bank name',
        lien_date: 'DATE',
        lien_release_date: 'DATE',
        
        // Insurance
        insurance_company: 'STRING',
        insurance_policy_number: 'STRING',
        insurance_expiration_date: 'DATE',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
    {
      name: 'bronze.retail_loan_delinquency_events',
      description: 'Delinquency tracking and collection activity',
      estimatedRows: 100000000,
      schema: {
        delinquency_id: 'BIGINT PRIMARY KEY',
        loan_id: 'BIGINT FK to loan',
        
        event_date: 'DATE',
        event_timestamp: 'TIMESTAMP',
        event_type: 'STRING COMMENT Became Delinquent|Payment Made|Cured|Progressed|Charge Off|Bankruptcy',
        
        days_past_due: 'INTEGER',
        delinquency_bucket: 'STRING COMMENT Current|30DPD|60DPD|90DPD|120+DPD',
        delinquent_amount: 'DECIMAL(18,2)',
        
        previous_dpd: 'INTEGER',
        previous_delinquency_bucket: 'STRING',
        
        collection_status: 'STRING COMMENT Early Stage|Late Stage|Pre-Legal|Legal|Charge Off',
        collection_action: 'STRING COMMENT Letter Sent|Call Made|Promise to Pay|Payment Plan|Legal Action',
        collection_agent_id: 'STRING',
        
        promise_to_pay_date: 'DATE',
        promise_to_pay_amount: 'DECIMAL(18,2)',
        
        payment_plan_flag: 'BOOLEAN',
        payment_plan_id: 'BIGINT',
        
        bankruptcy_flag: 'BOOLEAN',
        bankruptcy_chapter: 'STRING COMMENT Chapter 7|Chapter 13',
        bankruptcy_filing_date: 'DATE',
        
        load_timestamp: 'TIMESTAMP',
      },
    },
  ],
  relationships: [
    {
      from: 'bronze.retail_loan_payments',
      to: 'bronze.retail_loan_master',
      type: 'many-to-one',
      foreignKey: 'loan_id',
    },
    {
      from: 'bronze.retail_loan_applications',
      to: 'bronze.retail_loan_master',
      type: 'one-to-one',
      foreignKey: 'loan_id',
    },
    {
      from: 'bronze.retail_loan_collateral',
      to: 'bronze.retail_loan_master',
      type: 'many-to-one',
      foreignKey: 'loan_id',
    },
    {
      from: 'bronze.retail_loan_delinquency_events',
      to: 'bronze.retail_loan_master',
      type: 'many-to-one',
      foreignKey: 'loan_id',
    },
  ],
};

export default {
  loansRetailLogicalERD,
  loansRetailPhysicalERD,
};
