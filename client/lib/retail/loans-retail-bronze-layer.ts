/**
 * LOANS-RETAIL BRONZE LAYER - Complete Implementation
 * 
 * Domain: Loans Retail
 * Area: Retail Banking
 * Purpose: Personal loans, auto loans, student loans, HELOC
 * 
 * All 22 bronze tables for retail lending domain
 * Industry-accurate, comprehensive, enterprise-ready
 */

export const loansRetailBronzeTables = [
  // Table 1: Loan Master
  {
    name: 'bronze.retail_loan_master',
    description: 'Core loan account data including personal, auto, student loans, and HELOC',
    sourceSystem: 'FIS_LOAN_SYSTEM',
    sourceTable: 'LOAN_MASTER',
    loadType: 'CDC',
    
    grain: 'One row per loan account',
    primaryKey: ['loan_id', 'source_system'],
    
    partitioning: {
      type: 'HASH',
      column: 'loan_id',
      buckets: 100,
    },
    
    estimatedRows: 50000000,
    avgRowSize: 3072,
    estimatedSize: '150GB',
    
    schema: {
      // PRIMARY KEYS
      loan_id: "BIGINT PRIMARY KEY COMMENT 'Unique loan identifier'",
      source_system: "STRING PRIMARY KEY COMMENT 'Source system (FIS_LOAN_SYSTEM, TEMENOS_LOAN)'",
      
      // NATURAL KEYS
      loan_number: "STRING UNIQUE COMMENT 'Customer-facing loan number'",
      loan_uuid: "STRING UNIQUE COMMENT 'Global UUID for loan'",
      application_id: "BIGINT COMMENT 'FK to loan application'",
      
      // LOAN TYPE & CLASSIFICATION
      loan_type: "STRING COMMENT 'Personal|Auto|Student|HELOC|Installment|Revolving'",
      loan_subtype: "STRING COMMENT 'Unsecured Personal|Secured Personal|New Auto|Used Auto|etc.'",
      loan_purpose: "STRING COMMENT 'Debt Consolidation|Home Improvement|Auto Purchase|Education|Medical|Other'",
      
      product_code: "STRING COMMENT 'Internal product SKU'",
      product_name: "STRING COMMENT 'Product marketing name'",
      
      loan_category: "STRING COMMENT 'Secured|Unsecured'",
      collateral_type: "STRING COMMENT 'Vehicle|Real Estate|Securities|None'",
      
      // LOAN STATUS & LIFECYCLE
      loan_status: "STRING COMMENT 'Active|Paid Off|Charged Off|Bankruptcy|Foreclosure|Modification'",
      loan_status_date: "DATE COMMENT 'Date of current status'",
      loan_status_reason: "STRING",
      
      loan_stage: "STRING COMMENT 'Origination|Active|Delinquent|Default|Collection|Recovery|Closed'",
      
      origination_date: "DATE COMMENT 'Loan funding date'",
      first_payment_date: "DATE COMMENT 'Date of first scheduled payment'",
      maturity_date: "DATE COMMENT 'Final payment due date'",
      paid_off_date: "DATE COMMENT 'Date loan fully paid'",
      
      loan_age_months: "INTEGER COMMENT 'Months since origination'",
      remaining_term_months: "INTEGER COMMENT 'Months remaining to maturity'",
      
      // BORROWER INFORMATION
      primary_borrower_id: "BIGINT COMMENT 'FK to primary borrower (customer)'",
      co_borrower_id: "BIGINT COMMENT 'FK to co-borrower if applicable'",
      guarantor_id: "BIGINT COMMENT 'FK to guarantor if applicable'",
      
      borrower_count: "INTEGER COMMENT 'Number of borrowers on loan'",
      
      // LOAN AMOUNTS
      original_loan_amount: "DECIMAL(18,2) COMMENT 'Original principal amount'",
      current_principal_balance: "DECIMAL(18,2) COMMENT 'Current outstanding principal'",
      current_interest_balance: "DECIMAL(18,2) COMMENT 'Accrued unpaid interest'",
      current_fee_balance: "DECIMAL(18,2) COMMENT 'Outstanding fees'",
      total_payoff_amount: "DECIMAL(18,2) COMMENT 'Total to pay off loan today'",
      
      principal_paid_to_date: "DECIMAL(18,2) COMMENT 'Cumulative principal payments'",
      interest_paid_to_date: "DECIMAL(18,2) COMMENT 'Cumulative interest payments'",
      fees_paid_to_date: "DECIMAL(18,2) COMMENT 'Cumulative fees paid'",
      
      available_credit: "DECIMAL(18,2) COMMENT 'Available to draw (HELOC/revolving)'",
      credit_limit: "DECIMAL(18,2) COMMENT 'Maximum credit limit (HELOC/revolving)'",
      
      // INTEREST RATE
      interest_rate_type: "STRING COMMENT 'Fixed|Variable|Adjustable'",
      current_interest_rate: "DECIMAL(10,6) COMMENT 'Current interest rate (APR decimal)'",
      original_interest_rate: "DECIMAL(10,6) COMMENT 'Interest rate at origination'",
      
      interest_rate_index: "STRING COMMENT 'Prime|LIBOR|SOFR|Treasury (for variable)'",
      interest_rate_margin: "DECIMAL(10,6) COMMENT 'Margin over index'",
      interest_rate_floor: "DECIMAL(10,6) COMMENT 'Minimum interest rate'",
      interest_rate_ceiling: "DECIMAL(10,6) COMMENT 'Maximum interest rate (cap)'",
      
      last_rate_change_date: "DATE COMMENT 'Date of last rate adjustment'",
      next_rate_change_date: "DATE COMMENT 'Next scheduled rate adjustment'",
      
      apr: "DECIMAL(10,6) COMMENT 'Annual Percentage Rate (includes fees)'",
      
      // PAYMENT TERMS
      payment_frequency: "STRING COMMENT 'Monthly|Bi-Weekly|Weekly|Quarterly'",
      scheduled_payment_amount: "DECIMAL(18,2) COMMENT 'Regular payment amount'",
      minimum_payment_amount: "DECIMAL(18,2) COMMENT 'Minimum payment (revolving loans)'",
      
      payment_due_day: "INTEGER COMMENT 'Day of month payment due (1-31)'",
      next_payment_due_date: "DATE COMMENT 'Next scheduled payment date'",
      last_payment_date: "DATE COMMENT 'Date of last payment received'",
      last_payment_amount: "DECIMAL(18,2) COMMENT 'Amount of last payment'",
      
      total_number_of_payments: "INTEGER COMMENT 'Total payments over loan life'",
      payments_made: "INTEGER COMMENT 'Number of payments made to date'",
      payments_remaining: "INTEGER COMMENT 'Payments remaining'",
      
      // DELINQUENCY
      days_past_due: "INTEGER COMMENT 'Current days past due'",
      delinquency_status: "STRING COMMENT 'Current|30DPD|60DPD|90DPD|120+DPD'",
      delinquent_amount: "DECIMAL(18,2) COMMENT 'Total delinquent amount'",
      
      missed_payment_count_ltd: "INTEGER COMMENT 'Lifetime missed payments'",
      missed_payment_count_12mo: "INTEGER COMMENT 'Missed payments last 12 months'",
      
      last_delinquency_date: "DATE COMMENT 'Date loan last became delinquent'",
      delinquent_since_date: "DATE COMMENT 'Date entered current delinquency'",
      
      // FEES & CHARGES
      origination_fee: "DECIMAL(18,2) COMMENT 'Loan origination fee'",
      late_fee_amount: "DECIMAL(18,2) COMMENT 'Standard late fee'",
      prepayment_penalty_flag: "BOOLEAN COMMENT 'Prepayment penalty applies'",
      prepayment_penalty_amount: "DECIMAL(18,2) COMMENT 'Penalty for early payoff'",
      
      fees_charged_ytd: "DECIMAL(18,2) COMMENT 'Fees charged year-to-date'",
      late_fees_charged_ytd: "DECIMAL(18,2) COMMENT 'Late fees YTD'",
      
      // AUTO LOAN SPECIFIC
      vehicle_vin: "STRING COMMENT 'Vehicle Identification Number'",
      vehicle_make: "STRING COMMENT 'Vehicle manufacturer'",
      vehicle_model: "STRING COMMENT 'Vehicle model'",
      vehicle_year: "INTEGER COMMENT 'Model year'",
      vehicle_mileage: "INTEGER COMMENT 'Odometer reading at origination'",
      vehicle_value: "DECIMAL(18,2) COMMENT 'Vehicle value (at origination)'",
      vehicle_condition: "STRING COMMENT 'New|Used|Certified Pre-Owned'",
      
      // STUDENT LOAN SPECIFIC
      school_name: "STRING COMMENT 'Educational institution'",
      school_code: "STRING COMMENT 'Federal school code'",
      academic_level: "STRING COMMENT 'Undergraduate|Graduate|Professional'",
      graduation_date: "DATE COMMENT 'Expected/actual graduation'",
      
      deferment_flag: "BOOLEAN COMMENT 'In deferment status'",
      deferment_end_date: "DATE COMMENT 'Deferment expiration'",
      forbearance_flag: "BOOLEAN COMMENT 'In forbearance status'",
      forbearance_end_date: "DATE",
      
      // HELOC SPECIFIC
      property_address: "STRING COMMENT 'Property address (HELOC)'",
      property_value: "DECIMAL(18,2) COMMENT 'Property appraised value'",
      first_lien_amount: "DECIMAL(18,2) COMMENT 'First mortgage amount'",
      combined_ltv: "DECIMAL(5,2) COMMENT 'Combined loan-to-value ratio %'",
      
      draw_period_end_date: "DATE COMMENT 'End of HELOC draw period'",
      repayment_period_start_date: "DATE COMMENT 'HELOC repayment period start'",
      
      // UNDERWRITING
      underwriting_decision: "STRING COMMENT 'Approved|Declined|Conditional'",
      underwriting_score: "INTEGER COMMENT 'Internal underwriting score'",
      
      credit_score_at_origination: "INTEGER COMMENT 'FICO score when loan originated'",
      debt_to_income_ratio: "DECIMAL(5,2) COMMENT 'DTI at origination %'",
      loan_to_value_ratio: "DECIMAL(5,2) COMMENT 'LTV at origination %'",
      
      // SERVICING
      servicing_branch_id: "BIGINT COMMENT 'Branch servicing the loan'",
      loan_officer_id: "BIGINT COMMENT 'Originating loan officer'",
      servicing_rep_id: "BIGINT COMMENT 'Current servicing representative'",
      
      // PAYMENT PROTECTION & INSURANCE
      payment_protection_insurance: "BOOLEAN COMMENT 'Payment protection enrolled'",
      credit_life_insurance: "BOOLEAN COMMENT 'Credit life insurance'",
      disability_insurance: "BOOLEAN COMMENT 'Disability insurance'",
      unemployment_insurance: "BOOLEAN COMMENT 'Unemployment insurance'",
      
      insurance_premium_monthly: "DECIMAL(18,2) COMMENT 'Total insurance premium'",
      
      // AUTOPAY
      autopay_enrolled: "BOOLEAN COMMENT 'Automatic payment enrolled'",
      autopay_account_id: "BIGINT COMMENT 'Account for autopay'",
      autopay_discount_rate: "DECIMAL(5,2) COMMENT 'Rate discount for autopay %'",
      
      // MODIFICATION & WORKOUT
      modification_flag: "BOOLEAN COMMENT 'Loan has been modified'",
      modification_date: "DATE COMMENT 'Date of last modification'",
      modification_type: "STRING COMMENT 'Rate Reduction|Term Extension|Principal Reduction|etc.'",
      
      // COLLECTION & RECOVERY
      collection_status: "STRING COMMENT 'None|Internal|External|Legal'",
      collection_agency_id: "BIGINT COMMENT 'External collection agency'",
      collection_referral_date: "DATE COMMENT 'Date referred to collections'",
      
      charge_off_date: "DATE COMMENT 'Date loan charged off'",
      charge_off_amount: "DECIMAL(18,2) COMMENT 'Amount charged off'",
      recovery_amount: "DECIMAL(18,2) COMMENT 'Amount recovered post charge-off'",
      
      bankruptcy_flag: "BOOLEAN COMMENT 'Borrower filed bankruptcy'",
      bankruptcy_chapter: "STRING COMMENT 'Chapter 7|Chapter 11|Chapter 13'",
      bankruptcy_filing_date: "DATE",
      bankruptcy_discharge_date: "DATE",
      
      // REGULATORY & COMPLIANCE
      regulation_z_compliant: "BOOLEAN COMMENT 'Reg Z (Truth in Lending) compliant'",
      tila_disclosure_date: "DATE COMMENT 'TILA disclosure provided'",
      
      ecoa_monitoring_info: "STRING COMMENT 'ECOA demographic data (optional)'",
      hmda_reportable: "BOOLEAN COMMENT 'HMDA reporting required'",
      
      // STATEMENTS & COMMUNICATIONS
      statement_frequency: "STRING COMMENT 'Monthly|Quarterly|None'",
      statement_delivery_method: "STRING COMMENT 'Paper|Email|Online'",
      last_statement_date: "DATE",
      
      // PERFORMANCE INDICATORS
      ever_30dpd: "BOOLEAN COMMENT 'Ever 30+ days past due'",
      ever_60dpd: "BOOLEAN COMMENT 'Ever 60+ days past due'",
      ever_90dpd: "BOOLEAN COMMENT 'Ever 90+ days past due'",
      
      payment_to_income_ratio: "DECIMAL(5,2) COMMENT 'Payment as % of income'",
      
      // AUDIT TRAIL (REQUIRED)
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING COMMENT 'INSERT|UPDATE|DELETE'",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 2: Loan Applications
  {
    name: 'bronze.retail_loan_applications',
    description: 'Loan application data from origination system',
    sourceSystem: 'LOAN_ORIGINATION_SYSTEM',
    sourceTable: 'LOAN_APPLICATIONS',
    loadType: 'CDC',
    
    grain: 'One row per loan application',
    primaryKey: ['application_id', 'source_system'],
    
    schema: {
      application_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      application_date: "DATE COMMENT 'Date application submitted'",
      application_channel: "STRING COMMENT 'Branch|Online|Mobile|Phone|Mail'",
      
      applicant_customer_id: "BIGINT COMMENT 'Primary applicant'",
      co_applicant_customer_id: "BIGINT COMMENT 'Co-applicant if joint'",
      
      loan_type_requested: "STRING",
      loan_amount_requested: "DECIMAL(18,2)",
      loan_purpose: "STRING",
      
      application_status: "STRING COMMENT 'Pending|Under Review|Approved|Declined|Withdrawn'",
      application_status_date: "DATE",
      
      decision_date: "DATE COMMENT 'Underwriting decision date'",
      decision: "STRING COMMENT 'Approved|Declined|Conditional Approval'",
      decline_reason: "STRING COMMENT 'Insufficient Income|Poor Credit|High DTI|etc.'",
      
      approved_amount: "DECIMAL(18,2) COMMENT 'Amount approved if different from requested'",
      approved_rate: "DECIMAL(10,6) COMMENT 'Approved interest rate'",
      approved_term_months: "INTEGER",
      
      funded_date: "DATE COMMENT 'Date loan funded'",
      funded_loan_id: "BIGINT COMMENT 'FK to loan_master if funded'",
      
      // Income & Employment
      stated_annual_income: "DECIMAL(18,2)",
      verified_annual_income: "DECIMAL(18,2)",
      employer_name: "STRING",
      employment_length_years: "DECIMAL(5,2)",
      
      // Credit Information
      credit_score_at_application: "INTEGER",
      credit_report_pull_date: "DATE",
      credit_bureau: "STRING COMMENT 'Equifax|Experian|TransUnion'",
      
      // Collateral (if applicable)
      collateral_type: "STRING",
      collateral_value: "DECIMAL(18,2)",
      ltv_ratio: "DECIMAL(5,2)",
      
      // Underwriting Metrics
      debt_to_income_ratio: "DECIMAL(5,2)",
      housing_expense_ratio: "DECIMAL(5,2)",
      
      underwriter_id: "BIGINT COMMENT 'Employee who underwrote'",
      loan_officer_id: "BIGINT COMMENT 'Originating loan officer'",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 3: Loan Payments
  {
    name: 'bronze.retail_loan_payments',
    description: 'All loan payment transactions',
    sourceSystem: 'FIS_LOAN_SYSTEM',
    sourceTable: 'LOAN_PAYMENTS',
    loadType: 'CDC',
    
    grain: 'One row per payment transaction',
    primaryKey: ['payment_id', 'source_system'],
    
    partitioning: {
      type: 'RANGE',
      column: 'payment_date',
      ranges: ['Monthly partitions'],
    },
    
    schema: {
      payment_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      loan_id: "BIGINT COMMENT 'FK to loan'",
      
      payment_date: "DATE COMMENT 'Date payment received'",
      payment_due_date: "DATE COMMENT 'Original due date'",
      posting_date: "DATE COMMENT 'Date payment posted to account'",
      payment_timestamp: "TIMESTAMP",
      
      payment_amount: "DECIMAL(18,2) COMMENT 'Total payment amount'",
      principal_portion: "DECIMAL(18,2) COMMENT 'Amount applied to principal'",
      interest_portion: "DECIMAL(18,2) COMMENT 'Amount applied to interest'",
      fee_portion: "DECIMAL(18,2) COMMENT 'Amount applied to fees'",
      escrow_portion: "DECIMAL(18,2) COMMENT 'Amount to escrow (mortgages)'",
      
      payment_type: "STRING COMMENT 'Regular|Extra|Payoff|Partial Prepayment'",
      payment_method: "STRING COMMENT 'ACH|Check|Wire|Cash|Debit Card|Online|Mobile'",
      payment_channel: "STRING COMMENT 'Branch|ATM|Online|Mobile|Mail|Phone'",
      
      payment_status: "STRING COMMENT 'Posted|Pending|Returned|Reversed'",
      
      payment_number: "INTEGER COMMENT 'Payment sequence number'",
      
      late_payment_flag: "BOOLEAN COMMENT 'Payment made after due date'",
      days_late: "INTEGER COMMENT 'Days past due when paid'",
      late_fee_assessed: "DECIMAL(18,2)",
      
      autopay_flag: "BOOLEAN COMMENT 'Automatic payment'",
      
      // Payment reversals
      reversed_flag: "BOOLEAN",
      reversal_date: "DATE",
      reversal_reason: "STRING COMMENT 'NSF|Stop Payment|Customer Request|Error'",
      
      // Running balances after payment
      principal_balance_after: "DECIMAL(18,2)",
      interest_balance_after: "DECIMAL(18,2)",
      
      // Audit
      source_system: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 4: Loan Collateral
  {
    name: 'bronze.retail_loan_collateral',
    description: 'Collateral details for secured loans',
    sourceSystem: 'FIS_LOAN_SYSTEM',
    sourceTable: 'LOAN_COLLATERAL',
    loadType: 'CDC',
    grain: 'One row per collateral item per loan',
    primaryKey: ['collateral_id', 'source_system'],
    schema: {
      collateral_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      collateral_type: "STRING COMMENT 'Vehicle|Real Estate|Securities|Equipment'",
      collateral_description: "STRING",
      collateral_value: "DECIMAL(18,2)",
      appraisal_date: "DATE",
      appraisal_value: "DECIMAL(18,2)",
      lien_position: "STRING COMMENT 'First|Second|Third'",
      perfection_date: "DATE COMMENT 'Date lien perfected'",
      ucc_filing_number: "STRING COMMENT 'UCC filing reference'",
      insurance_required: "BOOLEAN",
      insurance_policy_number: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 5: Delinquency Events
  {
    name: 'bronze.retail_loan_delinquency_events',
    description: 'Delinquency tracking and status changes',
    sourceSystem: 'FIS_LOAN_SYSTEM',
    sourceTable: 'DELINQUENCY_EVENTS',
    loadType: 'CDC',
    grain: 'One row per delinquency event',
    primaryKey: ['delinquency_event_id', 'source_system'],
    schema: {
      delinquency_event_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      event_date: "DATE",
      delinquency_status: "STRING COMMENT 'Current|30DPD|60DPD|90DPD|120+DPD'",
      days_past_due: "INTEGER",
      delinquent_amount: "DECIMAL(18,2)",
      missed_payment_count: "INTEGER",
      cure_date: "DATE COMMENT 'Date returned to current'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 6: Loan Modifications
  {
    name: 'bronze.retail_loan_modifications',
    description: 'Loan modification and workout history',
    sourceSystem: 'FIS_LOAN_SYSTEM',
    sourceTable: 'LOAN_MODIFICATIONS',
    loadType: 'CDC',
    grain: 'One row per modification',
    primaryKey: ['modification_id', 'source_system'],
    schema: {
      modification_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      modification_date: "DATE",
      modification_type: "STRING COMMENT 'Rate Reduction|Term Extension|Principal Reduction|Payment Reduction'",
      modification_reason: "STRING COMMENT 'Hardship|Retention|Workout'",
      previous_rate: "DECIMAL(10,6)",
      new_rate: "DECIMAL(10,6)",
      previous_payment: "DECIMAL(18,2)",
      new_payment: "DECIMAL(18,2)",
      previous_term_months: "INTEGER",
      new_term_months: "INTEGER",
      principal_forgiveness: "DECIMAL(18,2)",
      effective_date: "DATE",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 7: Interest Accruals
  {
    name: 'bronze.retail_loan_interest_accruals',
    description: 'Daily interest accrual calculations',
    sourceSystem: 'FIS_LOAN_SYSTEM',
    sourceTable: 'INTEREST_ACCRUALS',
    loadType: 'DAILY',
    grain: 'One row per loan per day',
    primaryKey: ['loan_id', 'accrual_date', 'source_system'],
    schema: {
      loan_id: "BIGINT PRIMARY KEY",
      accrual_date: "DATE PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      principal_balance: "DECIMAL(18,2)",
      interest_rate: "DECIMAL(10,6)",
      daily_interest_amount: "DECIMAL(18,2)",
      accrued_interest_balance: "DECIMAL(18,2)",
      days_in_period: "INTEGER",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 8: Loan Fees
  {
    name: 'bronze.retail_loan_fees',
    description: 'Fee assessments and charges',
    sourceSystem: 'FIS_LOAN_SYSTEM',
    sourceTable: 'LOAN_FEES',
    loadType: 'CDC',
    grain: 'One row per fee charged',
    primaryKey: ['fee_id', 'source_system'],
    schema: {
      fee_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      fee_date: "DATE",
      fee_type: "STRING COMMENT 'Late|NSF|Origination|Annual|Prepayment|Legal'",
      fee_amount: "DECIMAL(18,2)",
      fee_waived: "BOOLEAN",
      waiver_reason: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 9: Credit Pulls
  {
    name: 'bronze.retail_loan_credit_pulls',
    description: 'Credit bureau inquiries for loans',
    sourceSystem: 'CREDIT_BUREAU_SYSTEM',
    sourceTable: 'CREDIT_PULLS',
    loadType: 'CDC',
    grain: 'One row per credit pull',
    primaryKey: ['credit_pull_id', 'source_system'],
    schema: {
      credit_pull_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      application_id: "BIGINT",
      customer_id: "BIGINT",
      pull_date: "DATE",
      pull_type: "STRING COMMENT 'Hard Pull|Soft Pull'",
      credit_bureau: "STRING COMMENT 'Equifax|Experian|TransUnion'",
      credit_score: "INTEGER",
      credit_report_path: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 10: Underwriting Decisions
  {
    name: 'bronze.retail_loan_underwriting_decisions',
    description: 'Detailed underwriting decision data',
    sourceSystem: 'LOAN_ORIGINATION_SYSTEM',
    sourceTable: 'UNDERWRITING_DECISIONS',
    loadType: 'CDC',
    grain: 'One row per underwriting decision',
    primaryKey: ['decision_id', 'source_system'],
    schema: {
      decision_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      application_id: "BIGINT",
      decision_date: "DATE",
      decision: "STRING COMMENT 'Approved|Declined|Refer|Conditional'",
      decision_method: "STRING COMMENT 'Automated|Manual|Hybrid'",
      underwriter_id: "BIGINT",
      credit_score: "INTEGER",
      dti_ratio: "DECIMAL(5,2)",
      ltv_ratio: "DECIMAL(5,2)",
      decline_reasons: "STRING COMMENT 'JSON array of reasons'",
      conditions: "STRING COMMENT 'JSON array of approval conditions'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 11: Loan Insurance
  {
    name: 'bronze.retail_loan_insurance',
    description: 'Payment protection and credit life insurance',
    sourceSystem: 'FIS_LOAN_SYSTEM',
    sourceTable: 'LOAN_INSURANCE',
    loadType: 'CDC',
    grain: 'One row per loan per insurance type',
    primaryKey: ['insurance_id', 'source_system'],
    schema: {
      insurance_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      insurance_type: "STRING COMMENT 'Credit Life|Disability|Unemployment|Payment Protection'",
      coverage_amount: "DECIMAL(18,2)",
      premium_amount: "DECIMAL(18,2)",
      premium_frequency: "STRING COMMENT 'Monthly|Single Premium'",
      enrollment_date: "DATE",
      cancellation_date: "DATE",
      insurance_carrier: "STRING",
      policy_number: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 12: Collection Activities
  {
    name: 'bronze.retail_loan_collection_activities',
    description: 'Collection calls, letters, and contacts',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'COLLECTION_ACTIVITIES',
    loadType: 'CDC',
    grain: 'One row per collection activity',
    primaryKey: ['activity_id', 'source_system'],
    schema: {
      activity_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      customer_id: "BIGINT",
      activity_date: "DATE",
      activity_type: "STRING COMMENT 'Phone Call|Email|Letter|SMS|In-Person'",
      contact_result: "STRING COMMENT 'Spoke to Borrower|Left Message|No Answer|Payment Promise'",
      promised_payment_amount: "DECIMAL(18,2)",
      promised_payment_date: "DATE",
      collector_id: "BIGINT",
      notes: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 13: Charge-Offs
  {
    name: 'bronze.retail_loan_charge_offs',
    description: 'Loan charge-off events',
    sourceSystem: 'FIS_LOAN_SYSTEM',
    sourceTable: 'CHARGE_OFFS',
    loadType: 'CDC',
    grain: 'One row per charge-off',
    primaryKey: ['charge_off_id', 'source_system'],
    schema: {
      charge_off_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      charge_off_date: "DATE",
      charge_off_reason: "STRING COMMENT 'Delinquency|Bankruptcy|Fraud|Death'",
      principal_charged_off: "DECIMAL(18,2)",
      interest_charged_off: "DECIMAL(18,2)",
      fees_charged_off: "DECIMAL(18,2)",
      total_charge_off_amount: "DECIMAL(18,2)",
      days_past_due_at_charge_off: "INTEGER",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 14: Recoveries
  {
    name: 'bronze.retail_loan_recoveries',
    description: 'Post charge-off recovery collections',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'RECOVERIES',
    loadType: 'CDC',
    grain: 'One row per recovery payment',
    primaryKey: ['recovery_id', 'source_system'],
    schema: {
      recovery_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      charge_off_id: "BIGINT",
      recovery_date: "DATE",
      recovery_amount: "DECIMAL(18,2)",
      recovery_method: "STRING COMMENT 'Payment|Collateral Sale|Settlement|Legal Judgment'",
      collection_agency_id: "BIGINT",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 15: Bankruptcies
  {
    name: 'bronze.retail_loan_bankruptcies',
    description: 'Bankruptcy filings by borrowers',
    sourceSystem: 'LEGAL_SYSTEM',
    sourceTable: 'BANKRUPTCIES',
    loadType: 'CDC',
    grain: 'One row per bankruptcy filing',
    primaryKey: ['bankruptcy_id', 'source_system'],
    schema: {
      bankruptcy_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      customer_id: "BIGINT",
      filing_date: "DATE",
      bankruptcy_chapter: "STRING COMMENT 'Chapter 7|Chapter 11|Chapter 13'",
      case_number: "STRING",
      court_jurisdiction: "STRING",
      discharge_date: "DATE",
      dismissal_date: "DATE",
      reaffirmation_flag: "BOOLEAN COMMENT 'Loan reaffirmed'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 16: Loan Payoffs
  {
    name: 'bronze.retail_loan_payoffs',
    description: 'Loan payoff transactions',
    sourceSystem: 'FIS_LOAN_SYSTEM',
    sourceTable: 'LOAN_PAYOFFS',
    loadType: 'CDC',
    grain: 'One row per payoff',
    primaryKey: ['payoff_id', 'source_system'],
    schema: {
      payoff_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      payoff_date: "DATE",
      payoff_quote_date: "DATE",
      payoff_amount: "DECIMAL(18,2)",
      principal_paid: "DECIMAL(18,2)",
      interest_paid: "DECIMAL(18,2)",
      fees_paid: "DECIMAL(18,2)",
      prepayment_penalty: "DECIMAL(18,2)",
      payoff_method: "STRING COMMENT 'Refinance|Sale|Voluntary Payoff'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 17: Loan Statements
  {
    name: 'bronze.retail_loan_statements',
    description: 'Loan statement history',
    sourceSystem: 'FIS_LOAN_SYSTEM',
    sourceTable: 'LOAN_STATEMENTS',
    loadType: 'MONTHLY',
    grain: 'One row per loan per statement period',
    primaryKey: ['loan_id', 'statement_date', 'source_system'],
    schema: {
      loan_id: "BIGINT PRIMARY KEY",
      statement_date: "DATE PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      statement_period_start: "DATE",
      statement_period_end: "DATE",
      beginning_principal_balance: "DECIMAL(18,2)",
      ending_principal_balance: "DECIMAL(18,2)",
      interest_charged: "DECIMAL(18,2)",
      principal_paid: "DECIMAL(18,2)",
      fees_charged: "DECIMAL(18,2)",
      payment_due_date: "DATE",
      minimum_payment_due: "DECIMAL(18,2)",
      statement_pdf_path: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 18: Rate Changes
  {
    name: 'bronze.retail_loan_rate_changes',
    description: 'Interest rate adjustment history for variable rate loans',
    sourceSystem: 'FIS_LOAN_SYSTEM',
    sourceTable: 'RATE_CHANGES',
    loadType: 'CDC',
    grain: 'One row per rate change',
    primaryKey: ['rate_change_id', 'source_system'],
    schema: {
      rate_change_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      rate_change_date: "DATE",
      previous_rate: "DECIMAL(10,6)",
      new_rate: "DECIMAL(10,6)",
      rate_change_reason: "STRING COMMENT 'Index Change|Periodic Adjustment|Modification'",
      index_value: "DECIMAL(10,6) COMMENT 'PRIME, LIBOR, SOFR value'",
      margin: "DECIMAL(10,6)",
      effective_date: "DATE",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 19: Vehicle Details (Auto Loans)
  {
    name: 'bronze.retail_loan_vehicle_details',
    description: 'Detailed vehicle information for auto loans',
    sourceSystem: 'AUTO_LOAN_SYSTEM',
    sourceTable: 'VEHICLE_DETAILS',
    loadType: 'SCD2',
    grain: 'One row per vehicle per loan',
    primaryKey: ['vehicle_id', 'source_system'],
    schema: {
      vehicle_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      vin: "STRING UNIQUE COMMENT 'Vehicle Identification Number'",
      make: "STRING",
      model: "STRING",
      year: "INTEGER",
      trim: "STRING",
      body_style: "STRING COMMENT 'Sedan|SUV|Truck|Coupe|etc.'",
      color: "STRING",
      mileage_at_purchase: "INTEGER",
      current_mileage: "INTEGER",
      vehicle_condition: "STRING COMMENT 'New|Used|Certified Pre-Owned'",
      purchase_price: "DECIMAL(18,2)",
      appraised_value: "DECIMAL(18,2)",
      msrp: "DECIMAL(18,2)",
      title_state: "STRING",
      title_number: "STRING",
      lien_holder: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 20: Property Details (HELOC)
  {
    name: 'bronze.retail_loan_property_details',
    description: 'Property information for HELOC and home equity loans',
    sourceSystem: 'HELOC_SYSTEM',
    sourceTable: 'PROPERTY_DETAILS',
    loadType: 'SCD2',
    grain: 'One row per property per loan',
    primaryKey: ['property_id', 'source_system'],
    schema: {
      property_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      property_address: "STRING",
      property_city: "STRING",
      property_state: "STRING",
      property_zip: "STRING",
      property_type: "STRING COMMENT 'Single Family|Condo|Townhouse|Multi-Family'",
      property_use: "STRING COMMENT 'Primary Residence|Secondary Home|Investment'",
      appraised_value: "DECIMAL(18,2)",
      appraisal_date: "DATE",
      square_footage: "INTEGER",
      year_built: "INTEGER",
      bedrooms: "INTEGER",
      bathrooms: "DECIMAL(3,1)",
      first_lien_amount: "DECIMAL(18,2)",
      combined_ltv: "DECIMAL(5,2)",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 21: Escrow
  {
    name: 'bronze.retail_loan_escrow',
    description: 'Escrow account details for loans with property taxes and insurance',
    sourceSystem: 'FIS_LOAN_SYSTEM',
    sourceTable: 'ESCROW_ACCOUNTS',
    loadType: 'CDC',
    grain: 'One row per loan with escrow',
    primaryKey: ['escrow_id', 'source_system'],
    schema: {
      escrow_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      escrow_balance: "DECIMAL(18,2)",
      monthly_escrow_payment: "DECIMAL(18,2)",
      property_tax_annual: "DECIMAL(18,2)",
      homeowners_insurance_annual: "DECIMAL(18,2)",
      flood_insurance_annual: "DECIMAL(18,2)",
      pmi_monthly: "DECIMAL(18,2) COMMENT 'Private Mortgage Insurance'",
      last_tax_payment_date: "DATE",
      last_insurance_payment_date: "DATE",
      escrow_analysis_date: "DATE",
      escrow_shortage: "DECIMAL(18,2)",
      escrow_surplus: "DECIMAL(18,2)",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 22: Deferments (Student Loans)
  {
    name: 'bronze.retail_loan_deferments',
    description: 'Student loan deferments and forbearance periods',
    sourceSystem: 'STUDENT_LOAN_SYSTEM',
    sourceTable: 'DEFERMENTS',
    loadType: 'CDC',
    grain: 'One row per deferment period',
    primaryKey: ['deferment_id', 'source_system'],
    schema: {
      deferment_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      loan_id: "BIGINT",
      deferment_type: "STRING COMMENT 'In-School|Economic Hardship|Unemployment|Military|Forbearance'",
      deferment_start_date: "DATE",
      deferment_end_date: "DATE",
      deferment_status: "STRING COMMENT 'Active|Expired|Cancelled'",
      interest_accrual_flag: "BOOLEAN COMMENT 'Interest accrues during deferment'",
      interest_capitalization_flag: "BOOLEAN COMMENT 'Interest capitalized at end'",
      approval_date: "DATE",
      documentation_path: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // ========================================
  // IFRS9 / CECL COMPLIANCE TABLES (P0)
  // ========================================

  // Table 23: PD/LGD/EAD Credit Risk Parameters (IFRS9/CECL)
  {
    name: 'bronze.retail_loan_pd_lgd_ead_scores',
    description: 'Probability of Default, Loss Given Default, and Exposure at Default scores for IFRS9/CECL compliance',
    sourceSystem: 'CREDIT_RISK_MODELS',
    sourceTable: 'LOAN_RISK_PARAMETERS',
    loadType: 'DAILY',

    grain: 'One row per loan per as_of_date',
    primaryKey: ['loan_id', 'as_of_date', 'source_system'],

    partitioning: {
      type: 'RANGE',
      column: 'as_of_date',
      ranges: ['Monthly partitions'],
    },

    estimatedRows: 100000000,
    avgRowSize: 512,
    estimatedSize: '50GB',

    schema: {
      // PRIMARY KEYS
      loan_id: "BIGINT PRIMARY KEY COMMENT 'FK to loan_master'",
      as_of_date: "DATE PRIMARY KEY COMMENT 'Calculation date'",
      source_system: "STRING PRIMARY KEY",

      // IFRS9 STAGING
      ifrs9_stage: "STRING COMMENT 'Stage 1|Stage 2|Stage 3 - IFRS9 classification'",
      ifrs9_stage_entry_date: "DATE COMMENT 'Date loan entered current IFRS9 stage'",
      ifrs9_stage_transition_count: "INTEGER COMMENT 'Number of stage transitions'",

      significant_increase_in_credit_risk_flag: "BOOLEAN COMMENT 'SICR flag - triggers Stage 2'",
      sicr_trigger_reason: "STRING COMMENT 'Delinquency|Rating Downgrade|Macro Factors|Forbearance'",
      sicr_trigger_date: "DATE COMMENT 'Date SICR was triggered'",

      credit_impaired_flag: "BOOLEAN COMMENT 'Credit impaired - triggers Stage 3'",
      default_flag: "BOOLEAN COMMENT 'Default flag (typically 90+ DPD)'",
      default_date: "DATE COMMENT 'Date of default'",

      // PROBABILITY OF DEFAULT (PD)
      pd_12_month: "DECIMAL(10,6) COMMENT 'Probability of default over next 12 months (Stage 1)'",
      pd_lifetime: "DECIMAL(10,6) COMMENT 'Probability of default over remaining life (Stage 2/3)'",
      pd_marginal_1yr: "DECIMAL(10,6) COMMENT 'Marginal PD for year 1'",
      pd_marginal_2yr: "DECIMAL(10,6) COMMENT 'Marginal PD for year 2'",
      pd_marginal_3yr: "DECIMAL(10,6) COMMENT 'Marginal PD for year 3'",
      pd_marginal_4yr: "DECIMAL(10,6) COMMENT 'Marginal PD for year 4'",
      pd_marginal_5yr: "DECIMAL(10,6) COMMENT 'Marginal PD for year 5'",

      pd_model_version: "STRING COMMENT 'PD model version identifier'",
      pd_model_type: "STRING COMMENT 'Scorecard|Regression|ML|Transition Matrix'",
      pd_calculation_date: "DATE COMMENT 'Date PD was calculated'",

      // LOSS GIVEN DEFAULT (LGD)
      lgd: "DECIMAL(5,2) COMMENT 'Loss given default % (0-100)'",
      lgd_downturn: "DECIMAL(5,2) COMMENT 'LGD under stress/downturn scenario'",
      lgd_model_version: "STRING COMMENT 'LGD model version identifier'",
      lgd_calculation_date: "DATE",

      // EXPOSURE AT DEFAULT (EAD)
      ead_amount: "DECIMAL(18,2) COMMENT 'Exposure at default (principal + accrued interest)'",
      ead_commitment_amount: "DECIMAL(18,2) COMMENT 'Undrawn commitment (for revolving/HELOC)'",
      ead_conversion_factor: "DECIMAL(5,2) COMMENT 'CCF % for undrawn amounts'",
      ead_total: "DECIMAL(18,2) COMMENT 'Total EAD (drawn + undrawn * CCF)'",
      ead_calculation_date: "DATE",

      // EXPECTED CREDIT LOSS (ECL)
      ecl_12_month: "DECIMAL(18,2) COMMENT '12-month expected credit loss (Stage 1)'",
      ecl_lifetime: "DECIMAL(18,2) COMMENT 'Lifetime expected credit loss (Stage 2/3)'",
      ecl_methodology: "STRING COMMENT 'IFRS9|CECL|Basel IRB'",

      // DISCOUNT RATE
      effective_interest_rate: "DECIMAL(10,6) COMMENT 'EIR for discounting future cash flows'",
      discount_rate: "DECIMAL(10,6) COMMENT 'Discount rate for ECL calculation'",

      // MACROECONOMIC SCENARIO
      scenario_type: "STRING COMMENT 'Base|Optimistic|Pessimistic|Stress'",
      scenario_weight: "DECIMAL(5,2) COMMENT 'Probability weight for scenario %'",
      gdp_forecast: "DECIMAL(10,6) COMMENT 'GDP growth forecast for scenario'",
      unemployment_forecast: "DECIMAL(5,2) COMMENT 'Unemployment rate forecast %'",
      hpi_forecast: "DECIMAL(10,6) COMMENT 'Home Price Index forecast'",

      // CREDIT RATING
      internal_risk_rating: "STRING COMMENT 'Internal risk grade/rating'",
      risk_rating_date: "DATE COMMENT 'Date of risk rating'",
      previous_risk_rating: "STRING COMMENT 'Prior risk rating'",
      rating_migration_flag: "BOOLEAN COMMENT 'Risk rating changed'",

      // COLLATERAL IMPACT
      collateral_value: "DECIMAL(18,2) COMMENT 'Current collateral value'",
      collateral_haircut: "DECIMAL(5,2) COMMENT 'Haircut % applied to collateral'",
      net_collateral_value: "DECIMAL(18,2) COMMENT 'Collateral value after haircut'",
      unsecured_exposure: "DECIMAL(18,2) COMMENT 'Exposure not covered by collateral'",

      // DELINQUENCY IMPACT
      days_past_due: "INTEGER COMMENT 'Current days past due'",
      ever_30dpd: "BOOLEAN COMMENT 'Ever 30+ days past due'",
      ever_60dpd: "BOOLEAN COMMENT 'Ever 60+ days past due'",
      ever_90dpd: "BOOLEAN COMMENT 'Ever 90+ days past due'",

      // FORBEARANCE / MODIFICATION
      forbearance_flag: "BOOLEAN COMMENT 'Currently in forbearance'",
      covid_forbearance_flag: "BOOLEAN COMMENT 'COVID-19 related forbearance'",
      modification_flag: "BOOLEAN COMMENT 'Loan has been modified'",

      // MODEL GOVERNANCE
      model_run_id: "BIGINT COMMENT 'Batch run identifier'",
      model_override_flag: "BOOLEAN COMMENT 'Model output was manually overridden'",
      override_reason: "STRING COMMENT 'Reason for manual override'",
      override_approved_by: "STRING COMMENT 'Approver of override'",

      // AUDIT TRAIL
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP COMMENT 'ETL load timestamp'",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 24: Collateral Valuations (Enhanced for IFRS9)
  {
    name: 'bronze.retail_loan_collateral_valuations',
    description: 'Collateral valuation history for secured loans - required for LGD calculation',
    sourceSystem: 'COLLATERAL_VALUATION_SYSTEM',
    sourceTable: 'COLLATERAL_VALUATIONS',
    loadType: 'CDC',

    grain: 'One row per collateral item per valuation event',
    primaryKey: ['valuation_id', 'source_system'],

    partitioning: {
      type: 'RANGE',
      column: 'valuation_date',
      ranges: ['Monthly partitions'],
    },

    estimatedRows: 20000000,
    avgRowSize: 1024,
    estimatedSize: '20GB',

    schema: {
      // PRIMARY KEYS
      valuation_id: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      source_system: "STRING PRIMARY KEY",

      // FOREIGN KEYS
      loan_id: "BIGINT COMMENT 'FK to loan_master'",
      collateral_id: "BIGINT COMMENT 'FK to loan_collateral'",

      // VALUATION DETAILS
      valuation_date: "DATE COMMENT 'Date of valuation'",
      valuation_type: "STRING COMMENT 'Appraisal|AVM|BPO|Market Index|Model-based|Forced Sale'",
      valuation_source: "STRING COMMENT 'Professional Appraiser|AVMVendor|Internal Model|Market Data'",

      appraiser_name: "STRING COMMENT 'Name of appraiser/vendor'",
      appraiser_license_number: "STRING",
      appraisal_report_number: "STRING COMMENT 'Appraisal report reference'",

      // VALUATION AMOUNTS
      current_market_value: "DECIMAL(18,2) COMMENT 'Current market/fair value'",
      forced_sale_value: "DECIMAL(18,2) COMMENT 'Estimated forced sale value (distressed)'",
      liquidation_value: "DECIMAL(18,2) COMMENT 'Estimated liquidation value'",

      original_cost_basis: "DECIMAL(18,2) COMMENT 'Original purchase price'",
      prior_valuation_amount: "DECIMAL(18,2) COMMENT 'Previous valuation'",
      valuation_change_amount: "DECIMAL(18,2) COMMENT 'Change from prior valuation'",
      valuation_change_pct: "DECIMAL(10,6) COMMENT 'Percent change from prior'",

      // COLLATERAL ATTRIBUTES
      collateral_type: "STRING COMMENT 'Vehicle|Real Estate|Securities|Equipment'",
      collateral_subtype: "STRING COMMENT 'Single Family Home|Condo|Auto|Boat|etc.'",
      collateral_description: "STRING",

      // VEHICLE SPECIFIC
      vehicle_vin: "STRING COMMENT 'Vehicle Identification Number'",
      vehicle_make: "STRING",
      vehicle_model: "STRING",
      vehicle_year: "INTEGER",
      vehicle_mileage: "INTEGER COMMENT 'Odometer reading at valuation'",
      vehicle_condition: "STRING COMMENT 'Excellent|Good|Fair|Poor'",
      nada_book_value: "DECIMAL(18,2) COMMENT 'NADA book value'",
      kelley_blue_book_value: "DECIMAL(18,2) COMMENT 'KBB value'",

      // REAL ESTATE SPECIFIC
      property_address: "STRING",
      property_city: "STRING",
      property_state: "STRING",
      property_zip: "STRING",
      property_type: "STRING COMMENT 'Single Family|Condo|Townhouse|Multi-Family'",
      square_footage: "INTEGER",
      year_built: "INTEGER",
      bedrooms: "INTEGER",
      bathrooms: "DECIMAL(3,1)",
      lot_size_sqft: "INTEGER",

      property_condition: "STRING COMMENT 'Excellent|Good|Fair|Poor'",
      comparable_sales_count: "INTEGER COMMENT 'Number of comps used'",

      // LOCATION & MARKET DATA
      market_zip_median_price: "DECIMAL(18,2) COMMENT 'Median price in ZIP'",
      market_trend: "STRING COMMENT 'Appreciating|Stable|Declining'",
      days_on_market_avg: "INTEGER COMMENT 'Avg days on market in area'",

      // LIEN & OWNERSHIP
      lien_position: "STRING COMMENT 'First|Second|Third'",
      lien_amount: "DECIMAL(18,2) COMMENT 'Lien/loan amount'",
      ltv_ratio: "DECIMAL(5,2) COMMENT 'Loan-to-value ratio %'",
      cltv_ratio: "DECIMAL(5,2) COMMENT 'Combined LTV (all liens) %'",

      senior_liens_amount: "DECIMAL(18,2) COMMENT 'Amount of senior liens'",
      junior_liens_amount: "DECIMAL(18,2) COMMENT 'Amount of junior liens'",

      // VALUATION CONFIDENCE
      confidence_level: "STRING COMMENT 'High|Medium|Low'",
      valuation_variance: "DECIMAL(18,2) COMMENT 'Confidence interval variance'",
      data_quality_score: "DECIMAL(5,2) COMMENT 'Quality score for valuation data'",

      // INSURANCE
      insurance_coverage_amount: "DECIMAL(18,2) COMMENT 'Insurance coverage'",
      insurance_carrier: "STRING",
      insurance_policy_number: "STRING",
      insurance_expiration_date: "DATE",
      insurance_current_flag: "BOOLEAN COMMENT 'Insurance is current'",

      // TITLE & LEGAL
      title_status: "STRING COMMENT 'Clear|Clouded|Disputed'",
      title_insurance_flag: "BOOLEAN",
      perfection_status: "STRING COMMENT 'Perfected|Not Perfected|Pending'",
      ucc_filing_number: "STRING COMMENT 'UCC filing reference'",
      ucc_filing_date: "DATE",
      ucc_expiration_date: "DATE",

      // VALUATION TRIGGERS
      valuation_trigger: "STRING COMMENT 'Scheduled|Delinquency|Annual Review|Covenant|Regulatory|Loan Mod'",
      trigger_date: "DATE",

      // NEXT VALUATION
      next_valuation_due_date: "DATE COMMENT 'Next scheduled valuation'",
      valuation_frequency: "STRING COMMENT 'Annual|Semi-Annual|Quarterly|As Needed'",

      // HAIRCUT & RECOVERY
      collateral_haircut_pct: "DECIMAL(5,2) COMMENT 'Haircut % for LGD calculation'",
      net_recovery_value: "DECIMAL(18,2) COMMENT 'Value after haircut'",
      estimated_disposal_costs: "DECIMAL(18,2) COMMENT 'Costs to liquidate'",
      estimated_time_to_liquidate_days: "INTEGER COMMENT 'Expected days to sell'",

      // AUDIT TRAIL
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 25: Loan Reserves (CECL/IFRS9)
  {
    name: 'bronze.retail_loan_reserves',
    description: 'CECL/IFRS9 allowance for credit losses calculations',
    sourceSystem: 'CREDIT_RISK_MODELS',
    sourceTable: 'LOAN_RESERVES',
    loadType: 'DAILY',

    grain: 'One row per loan per as_of_date',
    primaryKey: ['loan_id', 'as_of_date', 'source_system'],

    partitioning: {
      type: 'RANGE',
      column: 'as_of_date',
      ranges: ['Monthly partitions'],
    },

    estimatedRows: 100000000,
    avgRowSize: 768,
    estimatedSize: '75GB',

    schema: {
      // PRIMARY KEYS
      loan_id: "BIGINT PRIMARY KEY",
      as_of_date: "DATE PRIMARY KEY COMMENT 'Reserve calculation date'",
      source_system: "STRING PRIMARY KEY",

      // LOAN ATTRIBUTES
      loan_type: "STRING COMMENT 'Personal|Auto|Student|HELOC'",
      loan_status: "STRING",

      // EXPOSURE
      outstanding_principal_balance: "DECIMAL(18,2) COMMENT 'Principal balance'",
      accrued_interest: "DECIMAL(18,2) COMMENT 'Accrued unpaid interest'",
      total_exposure: "DECIMAL(18,2) COMMENT 'Total exposure amount'",

      undrawn_commitment: "DECIMAL(18,2) COMMENT 'Undrawn credit (HELOC/revolving)'",

      // IFRS9 STAGING
      ifrs9_stage: "STRING COMMENT 'Stage 1|Stage 2|Stage 3'",

      // EXPECTED CREDIT LOSS COMPONENTS
      pd_12_month: "DECIMAL(10,6) COMMENT 'Probability of default - 12 month'",
      pd_lifetime: "DECIMAL(10,6) COMMENT 'Probability of default - lifetime'",
      lgd: "DECIMAL(5,2) COMMENT 'Loss given default %'",
      ead: "DECIMAL(18,2) COMMENT 'Exposure at default'",

      // ECL CALCULATIONS
      ecl_12_month: "DECIMAL(18,2) COMMENT '12-month ECL (Stage 1)'",
      ecl_lifetime: "DECIMAL(18,2) COMMENT 'Lifetime ECL (Stage 2/3)'",
      ecl_amount: "DECIMAL(18,2) COMMENT 'Total ECL for this loan'",

      // CECL SPECIFIC
      cecl_reserve_amount: "DECIMAL(18,2) COMMENT 'CECL allowance (US GAAP)'",
      cecl_methodology: "STRING COMMENT 'Discounted Cash Flow|Loss Rate|Roll Rate|Vintage'",

      // SCENARIO-BASED RESERVES
      base_scenario_ecl: "DECIMAL(18,2) COMMENT 'ECL under base scenario'",
      optimistic_scenario_ecl: "DECIMAL(18,2) COMMENT 'ECL under optimistic scenario'",
      pessimistic_scenario_ecl: "DECIMAL(18,2) COMMENT 'ECL under pessimistic scenario'",
      weighted_average_ecl: "DECIMAL(18,2) COMMENT 'Probability-weighted ECL'",

      base_scenario_weight: "DECIMAL(5,2) COMMENT 'Base scenario probability %'",
      optimistic_scenario_weight: "DECIMAL(5,2) COMMENT 'Optimistic probability %'",
      pessimistic_scenario_weight: "DECIMAL(5,2) COMMENT 'Pessimistic probability %'",

      // DISCOUNT FACTORS
      effective_interest_rate: "DECIMAL(10,6) COMMENT 'EIR for discounting'",
      discount_factor: "DECIMAL(10,6) COMMENT 'Present value discount factor'",

      // COLLATERAL ADJUSTMENT
      collateral_value: "DECIMAL(18,2) COMMENT 'Current collateral value'",
      collateral_haircut: "DECIMAL(5,2) COMMENT 'Haircut %'",
      net_collateral_coverage: "DECIMAL(18,2) COMMENT 'Net collateral after haircut'",
      unsecured_exposure: "DECIMAL(18,2) COMMENT 'Exposure not covered by collateral'",

      // PRIOR PERIOD COMPARISON
      prior_period_ecl: "DECIMAL(18,2) COMMENT 'ECL from prior period'",
      ecl_change: "DECIMAL(18,2) COMMENT 'Change in ECL'",
      ecl_change_pct: "DECIMAL(10,6) COMMENT 'Percent change in ECL'",

      // RESERVE MOVEMENTS
      reserve_opening_balance: "DECIMAL(18,2) COMMENT 'Reserve at period start'",
      reserve_provision: "DECIMAL(18,2) COMMENT 'Provision expense (P&L impact)'",
      reserve_charge_offs: "DECIMAL(18,2) COMMENT 'Charge-offs (utilization)'",
      reserve_recoveries: "DECIMAL(18,2) COMMENT 'Recoveries (post charge-off)'",
      reserve_closing_balance: "DECIMAL(18,2) COMMENT 'Reserve at period end'",

      // RESERVE ADEQUACY
      reserve_to_exposure_ratio: "DECIMAL(10,6) COMMENT 'Reserve % of exposure'",
      reserve_coverage_ratio: "DECIMAL(10,6) COMMENT 'Reserve / NPL ratio'",

      // DELINQUENCY STATUS
      days_past_due: "INTEGER",
      delinquency_status: "STRING",
      is_non_performing: "BOOLEAN COMMENT 'Non-performing loan flag'",

      // QUALITATIVE ADJUSTMENTS
      qualitative_adjustment: "DECIMAL(18,2) COMMENT 'Management overlay/adjustment'",
      qualitative_adjustment_reason: "STRING COMMENT 'Reason for adjustment'",

      // MODEL METADATA
      model_version: "STRING COMMENT 'Reserve model version'",
      model_run_id: "BIGINT COMMENT 'Model execution batch ID'",
      calculation_timestamp: "TIMESTAMP COMMENT 'When reserve was calculated'",

      // REGULATORY REPORTING
      regulatory_classification: "STRING COMMENT 'Pass|Special Mention|Substandard|Doubtful|Loss'",
      basel_risk_weight: "DECIMAL(5,2) COMMENT 'Basel risk weight %'",
      risk_weighted_assets: "DECIMAL(18,2) COMMENT 'RWA amount'",

      // STRESS TESTING
      stress_scenario_id: "STRING COMMENT 'CCAR/DFAST scenario identifier'",
      stress_ecl: "DECIMAL(18,2) COMMENT 'ECL under stress scenario'",

      // AUDIT TRAIL
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
];

export const loansRetailBronzeLayerComplete = {
  description: 'Complete bronze layer for retail loans domain with IFRS9/CECL compliance',
  layer: 'BRONZE',
  tables: loansRetailBronzeTables,
  totalTables: 25,
  estimatedSize: '1.15TB',
  refreshFrequency: 'Real-time CDC + Daily risk calculations',
  retention: '7 years',
  complianceFrameworks: ['IFRS9', 'CECL (ASC 326)', 'Basel III', 'BCBS 239'],
};
