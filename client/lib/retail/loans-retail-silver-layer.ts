/**
 * LOANS-RETAIL SILVER LAYER - Complete Implementation
 * 
 * Domain: Loans Retail  
 * Area: Retail Banking
 * Purpose: Conformed retail loan data (personal, auto, student, HELOC) with MDM and SCD2
 * 
 * All 16 silver tables for retail loans domain
 */

export const loansRetailSilverTables = [
  // Table 1: Loan Account Golden Record (Enhanced with IFRS9/CECL)
  {
    name: 'silver.retail_loan_account_golden',
    description: 'Golden record for retail loans with MDM, SCD Type 2, and IFRS9/CECL compliance fields',
    grain: 'One row per loan account per effective date',
    scdType: 'Type 2',
    primaryKey: ['loan_account_sk'],
    naturalKey: ['loan_account_id'],
    sourceTables: ['bronze.retail_loan_account_master', 'bronze.retail_loan_pd_lgd_ead_scores'],
    schema: {
      loan_account_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      loan_account_id: "BIGINT",
      loan_number: "STRING",

      loan_type: "STRING COMMENT 'Personal|Auto|Student|HELOC|Home Improvement'",
      loan_subtype: "STRING",
      loan_purpose: "STRING",

      borrower_customer_id: "BIGINT",
      coborrower_customer_id: "BIGINT",

      loan_status: "STRING COMMENT 'Active|Paid Off|Charged Off|Defaulted'",
      loan_origination_date: "DATE",
      loan_maturity_date: "DATE",
      loan_close_date: "DATE",

      original_loan_amount: "DECIMAL(18,2)",
      current_principal_balance: "DECIMAL(18,2)",
      current_interest_balance: "DECIMAL(18,2)",
      total_balance: "DECIMAL(18,2)",

      interest_rate: "DECIMAL(10,6)",
      apr: "DECIMAL(10,6)",

      monthly_payment_amount: "DECIMAL(18,2)",
      remaining_payments: "INTEGER",

      delinquency_status: "STRING",
      days_past_due: "INTEGER",

      // ========================================
      // IFRS9 / CECL COMPLIANCE FIELDS (P0)
      // ========================================

      // IFRS9 Staging
      ifrs9_stage: "STRING COMMENT 'Stage 1|Stage 2|Stage 3 - IFRS9 ECL classification'",
      ifrs9_stage_entry_date: "DATE COMMENT 'Date loan entered current IFRS9 stage'",
      ifrs9_stage_prior: "STRING COMMENT 'Previous IFRS9 stage'",
      ifrs9_stage_transition_count: "INTEGER COMMENT 'Number of stage transitions lifetime'",

      significant_increase_in_credit_risk_flag: "BOOLEAN COMMENT 'SICR flag - triggers Stage 2'",
      sicr_trigger_date: "DATE COMMENT 'Date SICR was first identified'",
      sicr_trigger_reason: "STRING COMMENT 'Delinquency|Rating Downgrade|Macro Factors|Forbearance|Qualitative'",

      credit_impaired_flag: "BOOLEAN COMMENT 'Credit impaired flag - triggers Stage 3'",
      default_flag: "BOOLEAN COMMENT 'Default flag (typically 90+ DPD or unlikely to pay)'",
      default_date: "DATE COMMENT 'Date loan entered default'",

      // Credit Risk Parameters
      pd_12_month: "DECIMAL(10,6) COMMENT 'Probability of default - next 12 months (Stage 1)'",
      pd_lifetime: "DECIMAL(10,6) COMMENT 'Probability of default - remaining life (Stage 2/3)'",
      lgd: "DECIMAL(5,2) COMMENT 'Loss given default percentage'",
      ead: "DECIMAL(18,2) COMMENT 'Exposure at default'",

      // Expected Credit Loss
      ecl_12_month: "DECIMAL(18,2) COMMENT '12-month expected credit loss (Stage 1)'",
      ecl_lifetime: "DECIMAL(18,2) COMMENT 'Lifetime expected credit loss (Stage 2/3)'",
      ecl_allowance: "DECIMAL(18,2) COMMENT 'Current ECL allowance/reserve'",

      // Model Metadata
      pd_model_version: "STRING COMMENT 'PD model version'",
      lgd_model_version: "STRING COMMENT 'LGD model version'",
      ecl_calculation_date: "DATE COMMENT 'Date ECL was last calculated'",

      // Risk Rating
      internal_risk_rating: "STRING COMMENT 'Internal risk grade'",
      risk_rating_date: "DATE COMMENT 'Date of current risk rating'",
      regulatory_classification: "STRING COMMENT 'Pass|Special Mention|Substandard|Doubtful|Loss'",

      // Forbearance & Modification Flags
      forbearance_flag: "BOOLEAN COMMENT 'Currently in forbearance'",
      forbearance_type: "STRING COMMENT 'COVID-19|Economic Hardship|Disaster|Other'",
      forbearance_start_date: "DATE",
      forbearance_end_date: "DATE",

      modification_flag: "BOOLEAN COMMENT 'Loan has been modified'",
      modification_date: "DATE COMMENT 'Date of most recent modification'",
      modification_type: "STRING COMMENT 'Rate Reduction|Term Extension|Principal Forgiveness|Payment Reduction'",

      // Performance Indicators
      ever_30dpd: "BOOLEAN COMMENT 'Ever 30+ days past due'",
      ever_60dpd: "BOOLEAN COMMENT 'Ever 60+ days past due'",
      ever_90dpd: "BOOLEAN COMMENT 'Ever 90+ days past due'",

      missed_payment_count_ltd: "INTEGER COMMENT 'Lifetime missed payment count'",
      missed_payment_count_12mo: "INTEGER COMMENT 'Missed payments in last 12 months'",

      // ========================================
      // METADATA & AUDIT
      // ========================================

      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      data_quality_score: "DECIMAL(5,2)",

      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 2: Loan Applications Conformed
  {
    name: 'silver.retail_loan_applications_conformed',
    description: 'Loan application data with decisioning',
    grain: 'One row per loan application',
    scdType: 'Type 1',
    primaryKey: ['application_id'],
    naturalKey: ['application_id'],
    sourceTables: ['bronze.retail_loan_applications'],
    schema: {
      application_id: "BIGINT PRIMARY KEY",
      customer_id: "BIGINT",
      
      application_date: "DATE",
      application_channel: "STRING",
      
      requested_amount: "DECIMAL(18,2)",
      requested_term_months: "INTEGER",
      loan_purpose: "STRING",
      
      application_status: "STRING COMMENT 'Submitted|Under Review|Approved|Denied|Withdrawn'",
      decision_date: "DATE",
      decision_reason: "STRING",
      
      approved_amount: "DECIMAL(18,2)",
      approved_rate: "DECIMAL(10,6)",
      approved_term: "INTEGER",
      
      credit_score_at_application: "INTEGER",
      dti_ratio: "DECIMAL(5,2)",
      ltv_ratio: "DECIMAL(5,2)",
      
      underwriter_id: "BIGINT",
      
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 3: Loan Payments Conformed
  {
    name: 'silver.retail_loan_payments_conformed',
    description: 'Loan payment transactions',
    grain: 'One row per payment',
    scdType: 'Type 1',
    primaryKey: ['payment_id'],
    naturalKey: ['payment_id'],
    sourceTables: ['bronze.retail_loan_payments'],
    schema: {
      payment_id: "BIGINT PRIMARY KEY",
      loan_account_id: "BIGINT",
      
      payment_date: "DATE",
      payment_due_date: "DATE",
      payment_received_date: "DATE",
      
      payment_amount: "DECIMAL(18,2)",
      principal_paid: "DECIMAL(18,2)",
      interest_paid: "DECIMAL(18,2)",
      fees_paid: "DECIMAL(18,2)",
      
      payment_method: "STRING COMMENT 'ACH|Check|Wire|Online|Auto-Pay'",
      payment_channel: "STRING",
      
      payment_status: "STRING COMMENT 'Scheduled|Processed|Failed|Reversed'",
      
      is_extra_payment: "BOOLEAN",
      is_late_payment: "BOOLEAN",
      late_fee_assessed: "DECIMAL(10,2)",
      
      data_quality_score: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 4: Loan Delinquencies Golden
  {
    name: 'silver.retail_loan_delinquencies_golden',
    description: 'Delinquency tracking and aging',
    grain: 'One row per loan per delinquency status change',
    scdType: 'Type 2',
    primaryKey: ['delinquency_sk'],
    naturalKey: ['loan_account_id', 'status_date'],
    sourceTables: ['bronze.retail_loan_delinquency'],
    schema: {
      delinquency_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      loan_account_id: "BIGINT",
      
      status_date: "DATE",
      delinquency_status: "STRING COMMENT 'Current|30 DPD|60 DPD|90 DPD|120+ DPD'",
      days_past_due: "INTEGER",
      
      past_due_amount: "DECIMAL(18,2)",
      payments_missed: "INTEGER",
      
      last_payment_date: "DATE",
      last_payment_amount: "DECIMAL(18,2)",
      
      collection_status: "STRING",
      assigned_to_collections: "BOOLEAN",
      collections_agency: "STRING",
      
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 5: Loan Collateral Golden
  {
    name: 'silver.retail_loan_collateral_golden',
    description: 'Collateral securing loans (auto, home)',
    grain: 'One row per collateral item per effective date',
    scdType: 'Type 2',
    primaryKey: ['collateral_sk'],
    naturalKey: ['loan_account_id', 'collateral_id'],
    sourceTables: ['bronze.retail_loan_collateral'],
    schema: {
      collateral_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      loan_account_id: "BIGINT",
      collateral_id: "BIGINT",
      
      collateral_type: "STRING COMMENT 'Vehicle|Property|Equipment'",
      
      vehicle_vin: "STRING",
      vehicle_make: "STRING",
      vehicle_model: "STRING",
      vehicle_year: "INTEGER",
      
      property_address: "STRING",
      property_type: "STRING",
      
      appraised_value: "DECIMAL(18,2)",
      appraisal_date: "DATE",
      
      current_market_value: "DECIMAL(18,2)",
      ltv_ratio: "DECIMAL(5,2)",
      
      lien_position: "STRING COMMENT 'First|Second|Third'",
      
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 6: Loan Modifications Golden
  {
    name: 'silver.retail_loan_modifications_golden',
    description: 'Loan modification and restructuring events',
    grain: 'One row per modification',
    scdType: 'Type 1',
    primaryKey: ['modification_id'],
    naturalKey: ['modification_id'],
    sourceTables: ['bronze.retail_loan_modifications'],
    schema: {
      modification_id: "BIGINT PRIMARY KEY",
      loan_account_id: "BIGINT",
      
      modification_date: "DATE",
      modification_type: "STRING COMMENT 'Rate Reduction|Term Extension|Principal Forgiveness|Payment Deferral'",
      modification_reason: "STRING",
      
      prior_balance: "DECIMAL(18,2)",
      new_balance: "DECIMAL(18,2)",
      
      prior_rate: "DECIMAL(10,6)",
      new_rate: "DECIMAL(10,6)",
      
      prior_term: "INTEGER",
      new_term: "INTEGER",
      
      prior_payment: "DECIMAL(18,2)",
      new_payment: "DECIMAL(18,2)",
      
      principal_forgiven: "DECIMAL(18,2)",
      
      approved_by: "STRING",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 7: Loan Charge-Offs Conformed
  {
    name: 'silver.retail_loan_chargeoffs_conformed',
    description: 'Charged-off loans',
    grain: 'One row per charge-off',
    scdType: 'Type 1',
    primaryKey: ['chargeoff_id'],
    naturalKey: ['chargeoff_id'],
    sourceTables: ['bronze.retail_loan_chargeoffs'],
    schema: {
      chargeoff_id: "BIGINT PRIMARY KEY",
      loan_account_id: "BIGINT",
      
      chargeoff_date: "DATE",
      chargeoff_amount: "DECIMAL(18,2)",
      
      days_delinquent_at_chargeoff: "INTEGER",
      
      principal_charged_off: "DECIMAL(18,2)",
      interest_charged_off: "DECIMAL(18,2)",
      fees_charged_off: "DECIMAL(18,2)",
      
      recovery_expected: "DECIMAL(18,2)",
      recovery_actual: "DECIMAL(18,2)",
      
      chargeoff_reason: "STRING",
      
      sent_to_collections: "BOOLEAN",
      collections_agency: "STRING",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 8: Loan Underwriting Data
  {
    name: 'silver.retail_loan_underwriting_data',
    description: 'Underwriting decisions and risk factors',
    grain: 'One row per loan origination',
    scdType: 'Type 1',
    primaryKey: ['loan_account_id'],
    naturalKey: ['loan_account_id'],
    sourceTables: ['bronze.retail_loan_underwriting'],
    schema: {
      loan_account_id: "BIGINT PRIMARY KEY",
      
      credit_score: "INTEGER",
      credit_bureau: "STRING",
      
      annual_income: "DECIMAL(18,2)",
      employment_status: "STRING",
      employment_length_years: "INTEGER",
      
      dti_ratio: "DECIMAL(5,2)",
      housing_expense_ratio: "DECIMAL(5,2)",
      
      ltv_ratio: "DECIMAL(5,2)",
      cltv_ratio: "DECIMAL(5,2)",
      
      bankruptcy_flag: "BOOLEAN",
      foreclosure_flag: "BOOLEAN",
      
      underwriting_decision: "STRING COMMENT 'Approve|Deny|Refer'",
      risk_tier: "STRING COMMENT 'A|B|C|D|E'",
      
      underwriter_id: "BIGINT",
      underwriting_date: "DATE",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 9: Loan Servicing Events
  {
    name: 'silver.retail_loan_servicing_events',
    description: 'Loan servicing lifecycle events',
    grain: 'One row per servicing event',
    scdType: 'Type 1',
    primaryKey: ['event_id'],
    naturalKey: ['event_id'],
    sourceTables: ['bronze.retail_loan_servicing'],
    schema: {
      event_id: "BIGINT PRIMARY KEY",
      loan_account_id: "BIGINT",
      
      event_date: "DATE",
      event_type: "STRING COMMENT 'Originated|Modified|Refinanced|Paid Off|Charged Off'",
      event_description: "STRING",
      
      prior_servicer: "STRING",
      new_servicer: "STRING",
      
      related_loan_id: "BIGINT",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 10: Loan Interest Accruals
  {
    name: 'silver.retail_loan_interest_accruals',
    description: 'Daily interest accrual tracking',
    grain: 'One row per loan per day',
    scdType: 'Type 1',
    primaryKey: ['loan_account_id', 'accrual_date'],
    naturalKey: ['loan_account_id', 'accrual_date'],
    sourceTables: ['bronze.retail_loan_interest_accruals'],
    schema: {
      loan_account_id: "BIGINT",
      accrual_date: "DATE",
      
      principal_balance: "DECIMAL(18,2)",
      interest_rate: "DECIMAL(10,6)",
      
      interest_accrued: "DECIMAL(18,2)",
      interest_accrued_mtd: "DECIMAL(18,2)",
      interest_accrued_ytd: "DECIMAL(18,2)",
      
      days_in_period: "INTEGER",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 11: Loan Fees Assessed
  {
    name: 'silver.retail_loan_fees_assessed',
    description: 'Fees charged on loans',
    grain: 'One row per fee',
    scdType: 'Type 1',
    primaryKey: ['fee_id'],
    naturalKey: ['fee_id'],
    sourceTables: ['bronze.retail_loan_fees'],
    schema: {
      fee_id: "BIGINT PRIMARY KEY",
      loan_account_id: "BIGINT",
      
      fee_date: "DATE",
      fee_type: "STRING COMMENT 'Late Fee|NSF|Prepayment Penalty|Annual Fee'",
      fee_amount: "DECIMAL(10,2)",
      
      fee_waived: "BOOLEAN",
      waiver_reason: "STRING",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 12: Loan Insurance
  {
    name: 'silver.retail_loan_insurance',
    description: 'Loan insurance coverage',
    grain: 'One row per insurance policy per effective date',
    scdType: 'Type 2',
    primaryKey: ['insurance_sk'],
    naturalKey: ['loan_account_id', 'policy_number'],
    sourceTables: ['bronze.retail_loan_insurance'],
    schema: {
      insurance_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      loan_account_id: "BIGINT",
      
      policy_number: "STRING",
      insurance_type: "STRING COMMENT 'PMI|Credit Life|Disability|Property'",
      
      insurance_provider: "STRING",
      coverage_amount: "DECIMAL(18,2)",
      
      premium_amount: "DECIMAL(10,2)",
      premium_frequency: "STRING",
      
      policy_start_date: "DATE",
      policy_end_date: "DATE",
      
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 13: Loan Deferments
  {
    name: 'silver.retail_loan_deferments',
    description: 'Payment deferment periods',
    grain: 'One row per deferment',
    scdType: 'Type 1',
    primaryKey: ['deferment_id'],
    naturalKey: ['deferment_id'],
    sourceTables: ['bronze.retail_loan_deferments'],
    schema: {
      deferment_id: "BIGINT PRIMARY KEY",
      loan_account_id: "BIGINT",
      
      deferment_start_date: "DATE",
      deferment_end_date: "DATE",
      deferment_type: "STRING COMMENT 'Forbearance|Hardship|COVID-19|Student'",
      
      deferment_reason: "STRING",
      
      payments_deferred: "INTEGER",
      interest_capitalized: "DECIMAL(18,2)",
      
      approved_by: "STRING",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 14: Loan Payoff Quotes
  {
    name: 'silver.retail_loan_payoff_quotes',
    description: 'Payoff quote requests and amounts',
    grain: 'One row per payoff quote',
    scdType: 'Type 1',
    primaryKey: ['payoff_quote_id'],
    naturalKey: ['payoff_quote_id'],
    sourceTables: ['bronze.retail_loan_payoffs'],
    schema: {
      payoff_quote_id: "BIGINT PRIMARY KEY",
      loan_account_id: "BIGINT",
      
      quote_date: "DATE",
      good_through_date: "DATE",
      
      principal_balance: "DECIMAL(18,2)",
      interest_to_payoff: "DECIMAL(18,2)",
      fees_due: "DECIMAL(18,2)",
      total_payoff_amount: "DECIMAL(18,2)",
      
      per_diem_interest: "DECIMAL(18,2)",
      
      requested_by: "STRING",
      request_channel: "STRING",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 15: Loan Statements
  {
    name: 'silver.retail_loan_statements',
    description: 'Monthly loan statements',
    grain: 'One row per loan per statement period',
    scdType: 'Type 1',
    primaryKey: ['statement_id'],
    naturalKey: ['loan_account_id', 'statement_date'],
    sourceTables: ['bronze.retail_loan_statements'],
    schema: {
      statement_id: "BIGINT PRIMARY KEY",
      loan_account_id: "BIGINT",
      
      statement_date: "DATE",
      statement_period_start: "DATE",
      statement_period_end: "DATE",
      
      beginning_balance: "DECIMAL(18,2)",
      ending_balance: "DECIMAL(18,2)",
      
      payments_received: "DECIMAL(18,2)",
      interest_charged: "DECIMAL(18,2)",
      fees_charged: "DECIMAL(18,2)",
      
      next_payment_due_date: "DATE",
      next_payment_amount: "DECIMAL(18,2)",
      
      ytd_interest_paid: "DECIMAL(18,2)",
      ytd_principal_paid: "DECIMAL(18,2)",
      
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 16: Loan Refinance History
  {
    name: 'silver.retail_loan_refinance_history',
    description: 'Refinancing activity tracking',
    grain: 'One row per refinance',
    scdType: 'Type 1',
    primaryKey: ['refinance_id'],
    naturalKey: ['refinance_id'],
    sourceTables: ['bronze.retail_loan_refinancing'],
    schema: {
      refinance_id: "BIGINT PRIMARY KEY",
      original_loan_id: "BIGINT",
      new_loan_id: "BIGINT",

      refinance_date: "DATE",

      original_balance: "DECIMAL(18,2)",
      original_rate: "DECIMAL(10,6)",
      original_term_remaining: "INTEGER",

      new_loan_amount: "DECIMAL(18,2)",
      new_rate: "DECIMAL(10,6)",
      new_term: "INTEGER",

      cash_out_amount: "DECIMAL(18,2)",
      closing_costs: "DECIMAL(18,2)",

      rate_savings_percent: "DECIMAL(5,2)",
      monthly_savings: "DECIMAL(18,2)",

      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // ========================================
  // IFRS9 / CECL COMPLIANCE TABLES (P0)
  // ========================================

  // Table 17: Credit Risk Parameters (IFRS9/CECL)
  {
    name: 'silver.retail_loan_credit_risk_parameters',
    description: 'PD/LGD/EAD scores and IFRS9 staging with data quality validation',
    grain: 'One row per loan per as_of_date',
    scdType: 'Type 1',
    primaryKey: ['loan_account_id', 'as_of_date'],
    naturalKey: ['loan_account_id', 'as_of_date'],
    sourceTables: ['bronze.retail_loan_pd_lgd_ead_scores'],
    schema: {
      loan_account_id: "BIGINT",
      as_of_date: "DATE",

      // IFRS9 Staging
      ifrs9_stage: "STRING COMMENT 'Stage 1|Stage 2|Stage 3'",
      ifrs9_stage_entry_date: "DATE",
      significant_increase_in_credit_risk_flag: "BOOLEAN",
      sicr_trigger_reason: "STRING",
      credit_impaired_flag: "BOOLEAN",
      default_flag: "BOOLEAN",

      // Probability of Default
      pd_12_month: "DECIMAL(10,6)",
      pd_lifetime: "DECIMAL(10,6)",
      pd_marginal_1yr: "DECIMAL(10,6)",
      pd_marginal_2yr: "DECIMAL(10,6)",
      pd_marginal_3yr: "DECIMAL(10,6)",
      pd_model_version: "STRING",
      pd_model_type: "STRING",

      // Loss Given Default
      lgd: "DECIMAL(5,2)",
      lgd_downturn: "DECIMAL(5,2)",
      lgd_model_version: "STRING",

      // Exposure at Default
      ead_amount: "DECIMAL(18,2)",
      ead_commitment_amount: "DECIMAL(18,2)",
      ead_conversion_factor: "DECIMAL(5,2)",
      ead_total: "DECIMAL(18,2)",

      // Expected Credit Loss
      ecl_12_month: "DECIMAL(18,2)",
      ecl_lifetime: "DECIMAL(18,2)",
      ecl_methodology: "STRING",

      // Scenario Analysis
      scenario_type: "STRING COMMENT 'Base|Optimistic|Pessimistic|Stress'",
      scenario_weight: "DECIMAL(5,2)",

      // Risk Rating
      internal_risk_rating: "STRING",
      risk_rating_date: "DATE",
      rating_migration_flag: "BOOLEAN",

      // Collateral
      collateral_value: "DECIMAL(18,2)",
      net_collateral_value: "DECIMAL(18,2)",
      unsecured_exposure: "DECIMAL(18,2)",

      // Model Governance
      model_run_id: "BIGINT",
      model_override_flag: "BOOLEAN",
      override_reason: "STRING",

      // Data Quality
      data_quality_score: "DECIMAL(5,2)",

      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 18: Collateral Valuations Conformed
  {
    name: 'silver.retail_loan_collateral_valuations_conformed',
    description: 'Collateral valuation history with data quality checks',
    grain: 'One row per collateral per valuation event',
    scdType: 'Type 1',
    primaryKey: ['valuation_id'],
    naturalKey: ['valuation_id'],
    sourceTables: ['bronze.retail_loan_collateral_valuations'],
    schema: {
      valuation_id: "BIGINT PRIMARY KEY",
      loan_account_id: "BIGINT",
      collateral_id: "BIGINT",

      valuation_date: "DATE",
      valuation_type: "STRING COMMENT 'Appraisal|AVM|BPO|Market Index|Model-based|Forced Sale'",
      valuation_source: "STRING",

      // Valuation Amounts
      current_market_value: "DECIMAL(18,2)",
      forced_sale_value: "DECIMAL(18,2)",
      liquidation_value: "DECIMAL(18,2)",

      prior_valuation_amount: "DECIMAL(18,2)",
      valuation_change_amount: "DECIMAL(18,2)",
      valuation_change_pct: "DECIMAL(10,6)",

      // Collateral Details
      collateral_type: "STRING",
      collateral_subtype: "STRING",
      collateral_description: "STRING",

      // Vehicle Specific
      vehicle_vin: "STRING",
      vehicle_make: "STRING",
      vehicle_model: "STRING",
      vehicle_year: "INTEGER",
      vehicle_condition: "STRING",

      // Real Estate Specific
      property_address: "STRING",
      property_type: "STRING",
      property_condition: "STRING",
      square_footage: "INTEGER",

      // Lien & LTV
      lien_position: "STRING",
      lien_amount: "DECIMAL(18,2)",
      ltv_ratio: "DECIMAL(5,2)",
      cltv_ratio: "DECIMAL(5,2)",

      // Recovery Estimates
      collateral_haircut_pct: "DECIMAL(5,2)",
      net_recovery_value: "DECIMAL(18,2)",
      estimated_disposal_costs: "DECIMAL(18,2)",
      estimated_time_to_liquidate_days: "INTEGER",

      // Insurance
      insurance_coverage_amount: "DECIMAL(18,2)",
      insurance_current_flag: "BOOLEAN",

      // Confidence
      confidence_level: "STRING",
      data_quality_score: "DECIMAL(5,2)",

      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },

  // Table 19: Loan Reserves Conformed (CECL/IFRS9)
  {
    name: 'silver.retail_loan_reserves_conformed',
    description: 'CECL/IFRS9 allowance for credit losses with validation',
    grain: 'One row per loan per as_of_date',
    scdType: 'Type 1',
    primaryKey: ['loan_account_id', 'as_of_date'],
    naturalKey: ['loan_account_id', 'as_of_date'],
    sourceTables: ['bronze.retail_loan_reserves'],
    schema: {
      loan_account_id: "BIGINT",
      as_of_date: "DATE",

      loan_type: "STRING",
      loan_status: "STRING",

      // Exposure
      outstanding_principal_balance: "DECIMAL(18,2)",
      total_exposure: "DECIMAL(18,2)",
      undrawn_commitment: "DECIMAL(18,2)",

      // IFRS9 Staging
      ifrs9_stage: "STRING",

      // Risk Parameters
      pd_12_month: "DECIMAL(10,6)",
      pd_lifetime: "DECIMAL(10,6)",
      lgd: "DECIMAL(5,2)",
      ead: "DECIMAL(18,2)",

      // ECL Calculations
      ecl_12_month: "DECIMAL(18,2)",
      ecl_lifetime: "DECIMAL(18,2)",
      ecl_amount: "DECIMAL(18,2)",

      // CECL
      cecl_reserve_amount: "DECIMAL(18,2)",
      cecl_methodology: "STRING",

      // Scenario-Based
      base_scenario_ecl: "DECIMAL(18,2)",
      optimistic_scenario_ecl: "DECIMAL(18,2)",
      pessimistic_scenario_ecl: "DECIMAL(18,2)",
      weighted_average_ecl: "DECIMAL(18,2)",

      // Collateral Adjustment
      collateral_value: "DECIMAL(18,2)",
      net_collateral_coverage: "DECIMAL(18,2)",
      unsecured_exposure: "DECIMAL(18,2)",

      // Reserve Movements
      reserve_opening_balance: "DECIMAL(18,2)",
      reserve_provision: "DECIMAL(18,2)",
      reserve_charge_offs: "DECIMAL(18,2)",
      reserve_recoveries: "DECIMAL(18,2)",
      reserve_closing_balance: "DECIMAL(18,2)",

      // Adequacy Ratios
      reserve_to_exposure_ratio: "DECIMAL(10,6)",
      reserve_coverage_ratio: "DECIMAL(10,6)",

      // Qualitative Adjustments
      qualitative_adjustment: "DECIMAL(18,2)",
      qualitative_adjustment_reason: "STRING",

      // Model Metadata
      model_version: "STRING",
      model_run_id: "BIGINT",

      // Regulatory
      regulatory_classification: "STRING",
      basel_risk_weight: "DECIMAL(5,2)",
      risk_weighted_assets: "DECIMAL(18,2)",

      // Data Quality
      data_quality_score: "DECIMAL(5,2)",

      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
];

export const loansRetailSilverLayerComplete = {
  description: 'Complete silver layer for retail loans domain with MDM, SCD2, and IFRS9/CECL compliance',
  layer: 'SILVER',
  tables: loansRetailSilverTables,
  totalTables: 19,
  estimatedSize: '850GB',
  dataQualityTargets: {
    completeness: '95%+',
    accuracy: '99%+',
    consistency: '98%+',
    timeliness: '99%+ (regulatory cutoff compliance)',
  },
  complianceFrameworks: ['IFRS9', 'CECL (ASC 326)', 'Basel III', 'BCBS 239'],
};
