/**
 * TREASURY-COMMERCIAL BRONZE LAYER
 * Raw data layer for commercial treasury and financial markets
 * 
 * Domain: Treasury-Commercial
 * Area: Commercial Banking
 * Layer: BRONZE (Raw/Landing Zone)
 * Tables: 18
 * 
 * Coverage:
 * - Foreign Exchange (FX) Trading
 * - Interest Rate Derivatives (Swaps, Caps, Floors, Swaptions)
 * - Hedging Instruments
 * - Liquidity Management
 * - Investment Portfolios
 * - Debt Issuance
 * - Cash Flow Forecasting
 * - Interest Rate Risk Management
 */

export const treasuryCommercialBronzeTables = [
  // Table 1: FX Spot Transactions
  {
    name: 'bronze.commercial_fx_spot_transactions',
    description: 'Foreign exchange spot transactions (settlement T+2 or immediate)',
    sourceSystem: 'FX_TRADING_PLATFORM',
    sourceTable: 'FX_SPOT_TRADES',
    loadType: 'STREAMING',
    
    grain: 'One row per FX spot transaction',
    primaryKey: ['fx_spot_transaction_id', 'source_system'],
    
    schema: {
      // Primary Identifiers
      fx_spot_transaction_id: "STRING PRIMARY KEY COMMENT 'Unique FX spot trade ID'",
      source_system: "STRING PRIMARY KEY COMMENT 'FX_TRADING_PLATFORM|TREASURY_WORKSTATION'",
      trade_reference: "STRING COMMENT 'External trade reference number'",
      company_id: "STRING COMMENT 'Commercial customer company ID'",
      
      // Trade Classification
      trade_type: "STRING COMMENT 'SPOT|TOD (Today)|TOM (Tomorrow)'",
      transaction_direction: "STRING COMMENT 'BUY|SELL from customer perspective'",
      
      // Currency Pair
      currency_pair: "STRING COMMENT 'e.g., EUR/USD, GBP/JPY'",
      base_currency: "STRING COMMENT 'Base currency (ISO 4217)'",
      quote_currency: "STRING COMMENT 'Quote currency (ISO 4217)'",
      
      // Trade Details
      trade_date: "DATE COMMENT 'Date trade was executed'",
      trade_timestamp: "TIMESTAMP COMMENT 'Exact execution time'",
      settlement_date: "DATE COMMENT 'T+0, T+1, or T+2'",
      value_date: "DATE COMMENT 'Value date for settlement'",
      
      // Amounts
      base_currency_amount: "DECIMAL(18,2) COMMENT 'Amount in base currency'",
      quote_currency_amount: "DECIMAL(18,2) COMMENT 'Amount in quote currency'",
      usd_equivalent_amount: "DECIMAL(18,2) COMMENT 'USD notional equivalent'",
      
      // Exchange Rate
      fx_rate: "DECIMAL(12,6) COMMENT 'Spot exchange rate'",
      fx_rate_direction: "STRING COMMENT 'DIRECT|INDIRECT'",
      market_rate_at_trade: "DECIMAL(12,6) COMMENT 'Market mid-rate at execution'",
      customer_rate: "DECIMAL(12,6) COMMENT 'Rate provided to customer'",
      spread_bps: "INTEGER COMMENT 'Bank spread in basis points'",
      
      // Counterparty Information
      counterparty_name: "STRING COMMENT 'Customer legal name'",
      counterparty_account_base: "STRING COMMENT 'Customer account for base currency'",
      counterparty_account_quote: "STRING COMMENT 'Customer account for quote currency'",
      
      // Bank Account Settlement
      bank_nostro_account_base: "STRING COMMENT 'Bank nostro account (base currency)'",
      bank_nostro_account_quote: "STRING COMMENT 'Bank nostro account (quote currency)'",
      settlement_method: "STRING COMMENT 'WIRE|ACH|INTERNAL_TRANSFER'",
      
      // Trade Status
      trade_status: "STRING COMMENT 'PENDING|CONFIRMED|SETTLED|CANCELLED|FAILED'",
      confirmation_timestamp: "TIMESTAMP",
      settlement_timestamp: "TIMESTAMP",
      
      // Pricing Source
      pricing_source: "STRING COMMENT 'BLOOMBERG|REUTERS|INTERNAL'",
      pricing_timestamp: "TIMESTAMP COMMENT 'When rate was sourced'",
      
      // Purpose & Context
      trade_purpose: "STRING COMMENT 'HEDGING|SPECULATION|OPERATIONAL|INVESTMENT'",
      hedge_designation: "STRING COMMENT 'CASH_FLOW_HEDGE|FAIR_VALUE_HEDGE|NET_INVESTMENT_HEDGE|NONE'",
      related_transaction_id: "STRING COMMENT 'Link to hedged transaction/exposure'",
      
      // Trader/User Information
      trader_id: "STRING COMMENT 'Bank trader who executed the trade'",
      sales_person_id: "STRING COMMENT 'Sales person covering customer'",
      customer_user_id: "STRING COMMENT 'Customer user who requested trade'",
      
      // Settlement Instructions
      settlement_instructions: "JSON COMMENT 'Wire instructions, beneficiary details'",
      
      // Regulatory
      large_exposure_flag: "BOOLEAN COMMENT 'Exceeds large exposure threshold'",
      regulatory_reporting_required: "BOOLEAN",
      
      // Profit & Loss
      bank_revenue: "DECIMAL(18,2) COMMENT 'Bank P&L on trade (spread)'",
      
      // Audit
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING COMMENT 'INSERT|UPDATE|DELETE'",
      record_hash: "STRING",
    },
  },

  // Table 2: FX Forward Contracts
  {
    name: 'bronze.commercial_fx_forward_contracts',
    description: 'Foreign exchange forward contracts (settlement > T+2, typically 1 week to 12 months)',
    sourceSystem: 'FX_TRADING_PLATFORM',
    sourceTable: 'FX_FORWARD_CONTRACTS',
    loadType: 'STREAMING',
    
    grain: 'One row per FX forward contract',
    primaryKey: ['fx_forward_contract_id'],
    
    schema: {
      fx_forward_contract_id: "STRING PRIMARY KEY",
      source_system: "STRING",
      contract_reference: "STRING COMMENT 'External contract reference'",
      company_id: "STRING",
      
      // Contract Classification
      contract_type: "STRING COMMENT 'OUTRIGHT_FORWARD|FX_SWAP|NON_DELIVERABLE_FORWARD'",
      deliverable_flag: "BOOLEAN COMMENT 'TRUE = deliverable, FALSE = NDF'",
      
      // Currency Pair
      currency_pair: "STRING",
      base_currency: "STRING COMMENT 'ISO 4217'",
      quote_currency: "STRING",
      
      // Trade Details
      trade_date: "DATE",
      trade_timestamp: "TIMESTAMP",
      maturity_date: "DATE COMMENT 'Forward settlement date'",
      tenor_days: "INTEGER COMMENT 'Days from trade date to maturity'",
      tenor_description: "STRING COMMENT '1M|3M|6M|12M|Custom'",
      
      // Contract Amounts
      notional_base_currency: "DECIMAL(18,2) COMMENT 'Notional in base currency'",
      notional_quote_currency: "DECIMAL(18,2) COMMENT 'Notional in quote currency'",
      usd_equivalent_notional: "DECIMAL(18,2)",
      
      // Forward Rate
      forward_rate: "DECIMAL(12,6) COMMENT 'Contracted forward rate'",
      spot_rate_at_trade: "DECIMAL(12,6) COMMENT 'Spot rate when forward was booked'",
      forward_points: "DECIMAL(8,6) COMMENT 'Forward premium/discount in points'",
      annualized_forward_premium_pct: "DECIMAL(7,4) COMMENT 'Annualized premium/discount %'",
      
      // Pricing Components
      interest_rate_differential: "DECIMAL(7,4) COMMENT 'Interest rate differential between currencies'",
      customer_forward_rate: "DECIMAL(12,6)",
      bank_margin_bps: "INTEGER COMMENT 'Bank margin in basis points'",
      
      // Counterparty
      counterparty_name: "STRING",
      counterparty_account_base: "STRING",
      counterparty_account_quote: "STRING",
      
      // Settlement Details
      settlement_method: "STRING COMMENT 'PHYSICAL_DELIVERY|NET_SETTLEMENT|CASH_SETTLEMENT'",
      settlement_account_base: "STRING",
      settlement_account_quote: "STRING",
      fixing_date: "DATE COMMENT 'Rate fixing date for NDFs'",
      fixing_rate: "DECIMAL(12,6) COMMENT 'Actual rate on fixing date'",
      
      // Contract Status
      contract_status: "STRING COMMENT 'ACTIVE|MATURED|EARLY_TERMINATED|ROLLED_OVER|CANCELLED'",
      settlement_status: "STRING COMMENT 'PENDING|SETTLED|FAILED'",
      maturity_timestamp: "TIMESTAMP",
      settlement_timestamp: "TIMESTAMP",
      
      // Early Termination
      early_termination_flag: "BOOLEAN",
      early_termination_date: "DATE",
      early_termination_value: "DECIMAL(18,2) COMMENT 'MTM value at termination'",
      early_termination_reason: "STRING",
      
      // Hedge Accounting
      hedge_designation: "STRING COMMENT 'CASH_FLOW_HEDGE|FAIR_VALUE_HEDGE|NONE'",
      hedge_effectiveness_test: "STRING COMMENT 'PASS|FAIL|NOT_TESTED'",
      hedged_item_description: "STRING COMMENT 'Description of hedged exposure'",
      hedged_transaction_id: "STRING",
      
      // Mark-to-Market
      current_mtm_value: "DECIMAL(18,2) COMMENT 'Current mark-to-market value'",
      mtm_valuation_date: "DATE",
      mtm_currency: "STRING DEFAULT 'USD'",
      unrealized_gain_loss: "DECIMAL(18,2)",
      
      // Credit & Collateral
      credit_limit_utilization: "DECIMAL(18,2) COMMENT 'Portion of credit line used'",
      collateral_required_flag: "BOOLEAN",
      collateral_posted: "DECIMAL(18,2)",
      
      // Regulatory
      reportable_transaction_flag: "BOOLEAN COMMENT 'Regulatory reporting required'",
      dodd_frank_reportable: "BOOLEAN COMMENT 'Dodd-Frank swap reporting'",
      emir_reportable: "BOOLEAN COMMENT 'EU EMIR reporting'",
      
      // Audit
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      record_hash: "STRING",
    },
  },

  // Table 3: FX Options
  {
    name: 'bronze.commercial_fx_options',
    description: 'Foreign exchange option contracts (vanilla and exotic options)',
    sourceSystem: 'FX_DERIVATIVES_SYSTEM',
    sourceTable: 'FX_OPTION_CONTRACTS',
    loadType: 'BATCH',
    
    grain: 'One row per FX option contract',
    primaryKey: ['fx_option_id'],
    
    schema: {
      fx_option_id: "STRING PRIMARY KEY",
      contract_reference: "STRING",
      company_id: "STRING",
      
      // Option Classification
      option_type: "STRING COMMENT 'CALL|PUT'",
      option_style: "STRING COMMENT 'EUROPEAN|AMERICAN|BERMUDIAN'",
      option_category: "STRING COMMENT 'VANILLA|BARRIER|DIGITAL|ASIAN|COMPOUND'",
      
      // Barrier Option Details (if applicable)
      barrier_type: "STRING COMMENT 'KNOCK_IN|KNOCK_OUT|DOUBLE_BARRIER|NULL'",
      barrier_level: "DECIMAL(12,6) COMMENT 'Barrier FX rate'",
      barrier_observation: "STRING COMMENT 'CONTINUOUS|DISCRETE'",
      
      // Currency Pair
      currency_pair: "STRING",
      base_currency: "STRING",
      quote_currency: "STRING",
      
      // Trade & Expiry Details
      trade_date: "DATE",
      expiry_date: "DATE COMMENT 'Option expiration date'",
      settlement_date: "DATE COMMENT 'Settlement if exercised'",
      tenor_description: "STRING COMMENT '1M|3M|6M|12M'",
      
      // Strike & Notional
      strike_rate: "DECIMAL(12,6) COMMENT 'Option strike price (FX rate)'",
      notional_amount: "DECIMAL(18,2) COMMENT 'Notional in base currency'",
      usd_equivalent_notional: "DECIMAL(18,2)",
      
      // Premium
      premium_amount: "DECIMAL(18,2) COMMENT 'Option premium paid'",
      premium_currency: "STRING",
      premium_payment_date: "DATE",
      premium_as_pct_of_notional: "DECIMAL(7,4) COMMENT 'Premium as % of notional'",
      
      // Pricing & Greeks
      spot_rate_at_trade: "DECIMAL(12,6)",
      implied_volatility: "DECIMAL(7,4) COMMENT 'Implied vol at pricing'",
      delta: "DECIMAL(7,4) COMMENT 'Option delta (0 to 1 for calls, -1 to 0 for puts)'",
      gamma: "DECIMAL(10,8) COMMENT 'Option gamma'",
      vega: "DECIMAL(10,4) COMMENT 'Option vega (sensitivity to vol)'",
      theta: "DECIMAL(10,4) COMMENT 'Option theta (time decay)'",
      rho: "DECIMAL(10,4) COMMENT 'Option rho (sensitivity to interest rates)'",
      
      // Exercise Details
      exercise_type: "STRING COMMENT 'AUTOMATIC|MANUAL'",
      exercise_flag: "BOOLEAN COMMENT 'TRUE if option was exercised'",
      exercise_date: "DATE",
      exercise_rate: "DECIMAL(12,6) COMMENT 'Spot rate at exercise'",
      intrinsic_value_at_exercise: "DECIMAL(18,2)",
      
      // Settlement
      settlement_method: "STRING COMMENT 'PHYSICAL_DELIVERY|CASH_SETTLEMENT'",
      settlement_amount: "DECIMAL(18,2)",
      settlement_currency: "STRING",
      
      // Contract Status
      option_status: "STRING COMMENT 'ACTIVE|EXPIRED_UNEXERCISED|EXERCISED|CANCELLED'",
      
      // Counterparty
      counterparty_name: "STRING",
      
      // Hedge Accounting
      hedge_designation: "STRING",
      hedged_exposure_description: "STRING",
      
      // Mark-to-Market
      current_mtm_value: "DECIMAL(18,2)",
      mtm_valuation_date: "DATE",
      unrealized_gain_loss: "DECIMAL(18,2)",
      
      // Regulatory
      regulatory_reporting_required: "BOOLEAN",
      
      // Audit
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 4: Interest Rate Swaps
  {
    name: 'bronze.commercial_interest_rate_swaps',
    description: 'Interest rate swap contracts (fixed-to-floating, basis swaps)',
    sourceSystem: 'DERIVATIVES_SYSTEM',
    sourceTable: 'IRS_CONTRACTS',
    loadType: 'BATCH',
    
    grain: 'One row per interest rate swap contract',
    primaryKey: ['irs_contract_id'],
    
    schema: {
      irs_contract_id: "STRING PRIMARY KEY",
      swap_reference: "STRING",
      company_id: "STRING",
      
      // Swap Classification
      swap_type: "STRING COMMENT 'FIXED_TO_FLOATING|FLOATING_TO_FIXED|BASIS_SWAP|OVERNIGHT_INDEX_SWAP'",
      swap_direction: "STRING COMMENT 'PAY_FIXED_RECEIVE_FLOATING|PAY_FLOATING_RECEIVE_FIXED'",
      
      // Trade Details
      trade_date: "DATE",
      effective_date: "DATE COMMENT 'Swap start date'",
      maturity_date: "DATE COMMENT 'Swap end date'",
      tenor_years: "DECIMAL(5,2) COMMENT 'Swap tenor in years (e.g., 5.0, 10.0)'",
      
      // Notional
      notional_amount: "DECIMAL(18,2) COMMENT 'Swap notional principal'",
      notional_currency: "STRING DEFAULT 'USD'",
      amortizing_flag: "BOOLEAN COMMENT 'TRUE if notional amortizes over time'",
      amortization_schedule: "JSON COMMENT 'Array of notional reductions if amortizing'",
      
      // Fixed Leg Details
      fixed_rate: "DECIMAL(7,4) COMMENT 'Fixed interest rate (e.g., 0.0350 = 3.50%)'",
      fixed_leg_payment_frequency: "STRING COMMENT 'QUARTERLY|SEMI_ANNUAL|ANNUAL'",
      fixed_leg_day_count: "STRING COMMENT 'ACT/360|ACT/365|30/360'",
      
      // Floating Leg Details
      floating_rate_index: "STRING COMMENT 'SOFR|LIBOR|EURIBOR|Fed_Funds'",
      floating_rate_tenor: "STRING COMMENT '3M|6M|1M|OVERNIGHT'",
      floating_rate_spread: "DECIMAL(7,4) COMMENT 'Spread over index (bps)'",
      floating_leg_payment_frequency: "STRING COMMENT 'QUARTERLY|SEMI_ANNUAL|MONTHLY'",
      floating_leg_day_count: "STRING COMMENT 'ACT/360|ACT/365'",
      
      // Reset & Payment Dates
      reset_frequency: "STRING COMMENT 'Frequency of floating rate reset'",
      next_reset_date: "DATE",
      next_payment_date: "DATE",
      payment_dates_schedule: "JSON COMMENT 'Array of all payment dates'",
      
      // Current Floating Rate
      current_floating_rate: "DECIMAL(7,4) COMMENT 'Current floating rate (index + spread)'",
      floating_rate_observation_date: "DATE",
      
      // Swap Valuation
      current_mtm_value: "DECIMAL(18,2) COMMENT 'Current mark-to-market value'",
      mtm_valuation_date: "DATE",
      pv01: "DECIMAL(18,2) COMMENT 'Present value of 1 basis point (DV01)'",
      duration: "DECIMAL(6,2) COMMENT 'Swap duration in years'",
      
      // Cash Flows
      cumulative_cash_flows_paid: "DECIMAL(18,2) COMMENT 'Total cash paid to date'",
      cumulative_cash_flows_received: "DECIMAL(18,2) COMMENT 'Total cash received to date'",
      net_cash_flow_to_date: "DECIMAL(18,2) COMMENT 'Net cumulative cash flow'",
      
      // Counterparty & Credit
      counterparty_name: "STRING COMMENT 'Swap counterparty (usually a bank)'",
      counterparty_credit_rating: "STRING COMMENT 'S&P/Moody credit rating'",
      credit_valuation_adjustment: "DECIMAL(18,2) COMMENT 'CVA for counterparty risk'",
      collateral_agreement_flag: "BOOLEAN COMMENT 'CSA in place'",
      collateral_posted: "DECIMAL(18,2)",
      collateral_received: "DECIMAL(18,2)",
      
      // Hedge Accounting
      hedge_designation: "STRING COMMENT 'CASH_FLOW_HEDGE|FAIR_VALUE_HEDGE|NONE'",
      hedge_effectiveness_test: "STRING COMMENT 'PASS|FAIL|NOT_TESTED'",
      hedged_item_description: "STRING COMMENT 'e.g., Floating rate debt, forecasted issuance'",
      hedged_debt_instrument_id: "STRING COMMENT 'Link to hedged debt'",
      
      // Termination
      early_termination_flag: "BOOLEAN",
      early_termination_date: "DATE",
      termination_payment: "DECIMAL(18,2) COMMENT 'Breakage fee paid/received'",
      termination_reason: "STRING",
      
      // Status
      swap_status: "STRING COMMENT 'ACTIVE|MATURED|TERMINATED|CANCELLED'",
      
      // Regulatory
      cleared_flag: "BOOLEAN COMMENT 'TRUE if centrally cleared'",
      clearing_house: "STRING COMMENT 'CME|LCH|ICE|NULL'",
      dodd_frank_reportable: "BOOLEAN",
      emir_reportable: "BOOLEAN",
      trade_repository: "STRING COMMENT 'DTCC|Bloomberg SDR|NULL'",
      uti: "STRING COMMENT 'Unique Transaction Identifier'",
      
      // Audit
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 5: Interest Rate Caps & Floors
  {
    name: 'bronze.commercial_interest_rate_caps_floors',
    description: 'Interest rate cap and floor contracts for rate protection',
    sourceSystem: 'DERIVATIVES_SYSTEM',
    sourceTable: 'IR_CAPS_FLOORS',
    loadType: 'BATCH',
    
    grain: 'One row per cap/floor contract',
    primaryKey: ['cap_floor_id'],
    
    schema: {
      cap_floor_id: "STRING PRIMARY KEY",
      contract_reference: "STRING",
      company_id: "STRING",
      
      // Contract Type
      contract_type: "STRING COMMENT 'CAP|FLOOR|COLLAR (cap + floor)'",
      
      // Trade Details
      trade_date: "DATE",
      effective_date: "DATE",
      maturity_date: "DATE",
      tenor_years: "DECIMAL(5,2)",
      
      // Notional
      notional_amount: "DECIMAL(18,2)",
      notional_currency: "STRING DEFAULT 'USD'",
      
      // Strike Rates
      cap_strike_rate: "DECIMAL(7,4) COMMENT 'Cap strike (if cap or collar)'",
      floor_strike_rate: "DECIMAL(7,4) COMMENT 'Floor strike (if floor or collar)'",
      
      // Floating Rate Index
      floating_rate_index: "STRING COMMENT 'SOFR|LIBOR|Fed_Funds'",
      floating_rate_tenor: "STRING COMMENT '3M|1M'",
      
      // Premium
      total_premium: "DECIMAL(18,2) COMMENT 'Upfront premium paid'",
      premium_payment_date: "DATE",
      annualized_premium_pct: "DECIMAL(7,4) COMMENT 'Premium as % of notional annualized'",
      
      // Payment Frequency
      payment_frequency: "STRING COMMENT 'QUARTERLY|MONTHLY|SEMI_ANNUAL'",
      day_count_convention: "STRING COMMENT 'ACT/360|ACT/365'",
      
      // Current State
      current_floating_rate: "DECIMAL(7,4)",
      in_the_money_flag: "BOOLEAN COMMENT 'TRUE if cap/floor is paying out'",
      
      // Cash Flows
      cumulative_payouts: "DECIMAL(18,2) COMMENT 'Total payouts received to date'",
      
      // Valuation
      current_mtm_value: "DECIMAL(18,2)",
      mtm_valuation_date: "DATE",
      
      // Hedge Accounting
      hedge_designation: "STRING",
      hedged_debt_instrument_id: "STRING",
      
      // Status
      contract_status: "STRING COMMENT 'ACTIVE|EXPIRED|TERMINATED'",
      
      // Audit
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 6: Liquidity Positions
  {
    name: 'bronze.commercial_liquidity_positions',
    description: 'Daily liquidity position snapshots by currency and account',
    sourceSystem: 'TREASURY_MANAGEMENT_SYSTEM',
    sourceTable: 'LIQUIDITY_POSITION_SNAPSHOT',
    loadType: 'BATCH',
    
    grain: 'One row per account per currency per day',
    primaryKey: ['account_id', 'currency', 'business_date'],
    
    schema: {
      account_id: "STRING PRIMARY KEY COMMENT 'Bank account or nostro account'",
      currency: "STRING PRIMARY KEY COMMENT 'ISO 4217 currency code'",
      business_date: "DATE PRIMARY KEY",
      company_id: "STRING",
      
      // Opening Position
      opening_balance: "DECIMAL(18,2) COMMENT 'Opening ledger balance'",
      opening_available_balance: "DECIMAL(18,2) COMMENT 'Opening available balance (net of holds)'",
      
      // Intraday Activity
      total_credits_posted: "DECIMAL(18,2) COMMENT 'Total credits during day'",
      total_debits_posted: "DECIMAL(18,2) COMMENT 'Total debits during day'",
      total_holds_placed: "DECIMAL(18,2) COMMENT 'New holds placed'",
      total_holds_released: "DECIMAL(18,2) COMMENT 'Holds released'",
      
      // Closing Position
      closing_balance: "DECIMAL(18,2) COMMENT 'End-of-day ledger balance'",
      closing_available_balance: "DECIMAL(18,2) COMMENT 'End-of-day available balance'",
      total_holds_outstanding: "DECIMAL(18,2) COMMENT 'Holds not yet released'",
      
      // Intraday High/Low
      intraday_high_balance: "DECIMAL(18,2) COMMENT 'Highest balance during day'",
      intraday_low_balance: "DECIMAL(18,2) COMMENT 'Lowest balance during day'",
      intraday_overdraft_flag: "BOOLEAN COMMENT 'TRUE if account went negative'",
      max_overdraft_amount: "DECIMAL(18,2) COMMENT 'Maximum overdraft during day'",
      overdraft_duration_minutes: "INTEGER COMMENT 'Minutes in overdraft'",
      
      // Forecasted Activity (next day)
      forecasted_credits_next_day: "DECIMAL(18,2)",
      forecasted_debits_next_day: "DECIMAL(18,2)",
      forecasted_closing_balance_next_day: "DECIMAL(18,2)",
      
      // Investment/Borrowing
      overnight_investment_amount: "DECIMAL(18,2) COMMENT 'Overnight investment of excess cash'",
      overnight_borrowing_amount: "DECIMAL(18,2) COMMENT 'Overnight borrowing to cover shortfall'",
      overnight_rate: "DECIMAL(7,4) COMMENT 'Overnight rate (Fed Funds, SOFR, etc.)'",
      
      // Target Balance
      target_balance: "DECIMAL(18,2) COMMENT 'Target balance per treasury policy'",
      excess_above_target: "DECIMAL(18,2) COMMENT 'Amount above target'",
      shortfall_below_target: "DECIMAL(18,2) COMMENT 'Amount below target'",
      
      // Funding Sources
      funding_from_parent: "DECIMAL(18,2) COMMENT 'Intercompany funding received'",
      funding_to_subsidiaries: "DECIMAL(18,2) COMMENT 'Intercompany funding provided'",
      
      // Audit
      snapshot_timestamp: "TIMESTAMP COMMENT 'When snapshot was captured'",
      source_system: "STRING DEFAULT 'TREASURY_MANAGEMENT_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 7: Cash Flow Forecasts
  {
    name: 'bronze.commercial_cash_flow_forecasts',
    description: 'Cash flow forecasts by day, week, or month',
    sourceSystem: 'TREASURY_MANAGEMENT_SYSTEM',
    sourceTable: 'CASH_FORECAST',
    loadType: 'BATCH',
    
    grain: 'One row per forecast period per currency',
    primaryKey: ['forecast_id', 'forecast_period_start'],
    
    schema: {
      forecast_id: "STRING PRIMARY KEY COMMENT 'Unique forecast ID'",
      forecast_period_start: "DATE PRIMARY KEY COMMENT 'Start of forecast period'",
      forecast_period_end: "DATE COMMENT 'End of forecast period'",
      forecast_period_type: "STRING COMMENT 'DAILY|WEEKLY|MONTHLY'",
      forecast_version: "INTEGER COMMENT 'Version number (for revisions)'",
      forecast_creation_date: "DATE",
      forecast_created_by: "STRING",
      company_id: "STRING",
      currency: "STRING COMMENT 'ISO 4217'",
      
      // Opening Position
      opening_cash_balance: "DECIMAL(18,2) COMMENT 'Cash balance at period start'",
      
      // Forecasted Inflows
      forecasted_customer_receipts: "DECIMAL(18,2) COMMENT 'Expected customer payments'",
      forecasted_investment_income: "DECIMAL(18,2) COMMENT 'Interest, dividends'",
      forecasted_loan_disbursements_received: "DECIMAL(18,2) COMMENT 'Loan fundings'",
      forecasted_asset_sales: "DECIMAL(18,2) COMMENT 'Asset sales proceeds'",
      forecasted_other_inflows: "DECIMAL(18,2)",
      total_forecasted_inflows: "DECIMAL(18,2) COMMENT 'Sum of all inflows'",
      
      // Forecasted Outflows
      forecasted_vendor_payments: "DECIMAL(18,2) COMMENT 'AP payments'",
      forecasted_payroll: "DECIMAL(18,2)",
      forecasted_debt_service: "DECIMAL(18,2) COMMENT 'Principal + interest payments'",
      forecasted_capex: "DECIMAL(18,2) COMMENT 'Capital expenditures'",
      forecasted_tax_payments: "DECIMAL(18,2)",
      forecasted_dividends: "DECIMAL(18,2)",
      forecasted_other_outflows: "DECIMAL(18,2)",
      total_forecasted_outflows: "DECIMAL(18,2) COMMENT 'Sum of all outflows'",
      
      // Net Forecast
      net_cash_flow_forecast: "DECIMAL(18,2) COMMENT 'Inflows - Outflows'",
      forecasted_closing_cash_balance: "DECIMAL(18,2) COMMENT 'Opening + Net'",
      
      // Variance from Target
      target_cash_balance: "DECIMAL(18,2) COMMENT 'Target balance per policy'",
      forecasted_surplus_deficit: "DECIMAL(18,2) COMMENT 'Closing - Target'",
      
      // Funding Plan
      planned_borrowing: "DECIMAL(18,2) COMMENT 'Planned borrowing to cover deficit'",
      planned_investment: "DECIMAL(18,2) COMMENT 'Planned investment of surplus'",
      
      // Confidence & Scenario
      forecast_confidence_level: "STRING COMMENT 'HIGH|MEDIUM|LOW'",
      scenario_type: "STRING COMMENT 'BASE_CASE|OPTIMISTIC|PESSIMISTIC'",
      
      // Actual Results (populated after period ends)
      actual_closing_cash_balance: "DECIMAL(18,2) COMMENT 'Actual closing balance'",
      forecast_variance: "DECIMAL(18,2) COMMENT 'Actual - Forecast'",
      forecast_accuracy_pct: "DECIMAL(5,2) COMMENT 'Accuracy percentage'",
      
      // Audit
      source_system: "STRING DEFAULT 'TREASURY_MANAGEMENT_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 8: Investment Securities
  {
    name: 'bronze.commercial_investment_securities',
    description: 'Investment securities portfolio (bonds, notes, commercial paper, money market funds)',
    sourceSystem: 'INVESTMENT_ACCOUNTING_SYSTEM',
    sourceTable: 'SECURITIES_MASTER',
    loadType: 'BATCH',
    
    grain: 'One row per security holding',
    primaryKey: ['security_id', 'company_id'],
    
    schema: {
      security_id: "STRING PRIMARY KEY COMMENT 'CUSIP|ISIN|Ticker'",
      company_id: "STRING PRIMARY KEY COMMENT 'Investor company ID'",
      
      // Security Classification
      security_type: "STRING COMMENT 'TREASURY_BOND|CORPORATE_BOND|MUNICIPAL_BOND|COMMERCIAL_PAPER|CD|MONEY_MARKET_FUND|EQUITY'",
      security_subtype: "STRING COMMENT 'GOVERNMENT|AGENCY|INVESTMENT_GRADE|HIGH_YIELD'",
      asset_class: "STRING COMMENT 'FIXED_INCOME|EQUITY|CASH_EQUIVALENT'",
      
      // Identifiers
      cusip: "STRING COMMENT '9-character CUSIP'",
      isin: "STRING COMMENT '12-character ISIN'",
      sedol: "STRING",
      ticker: "STRING",
      
      // Issuer Information
      issuer_name: "STRING COMMENT 'Security issuer'",
      issuer_country: "STRING COMMENT 'ISO 3166 country code'",
      issuer_sector: "STRING COMMENT 'GOVERNMENT|FINANCIAL|CORPORATE|MUNICIPAL'",
      issuer_credit_rating: "STRING COMMENT 'S&P/Moody/Fitch rating'",
      
      // Security Details
      security_description: "STRING",
      currency: "STRING COMMENT 'ISO 4217'",
      face_value: "DECIMAL(18,2) COMMENT 'Par value'",
      
      // Fixed Income Details
      coupon_rate: "DECIMAL(7,4) COMMENT 'Annual coupon rate (e.g., 0.0425 = 4.25%)'",
      coupon_frequency: "STRING COMMENT 'ANNUAL|SEMI_ANNUAL|QUARTERLY|MONTHLY|ZERO_COUPON'",
      issue_date: "DATE",
      maturity_date: "DATE",
      days_to_maturity: "INTEGER",
      call_flag: "BOOLEAN COMMENT 'Callable bond'",
      call_date: "DATE COMMENT 'First call date'",
      call_price: "DECIMAL(18,2)",
      
      // Purchase Details
      purchase_date: "DATE",
      purchase_price: "DECIMAL(18,4) COMMENT 'Purchase price per unit'",
      purchase_yield: "DECIMAL(7,4) COMMENT 'Yield to maturity at purchase'",
      quantity_purchased: "DECIMAL(18,4) COMMENT 'Number of units/shares'",
      total_purchase_cost: "DECIMAL(18,2) COMMENT 'Total cost including fees'",
      accrued_interest_at_purchase: "DECIMAL(18,2)",
      
      // Current Holdings
      current_quantity: "DECIMAL(18,4) COMMENT 'Current number of units held'",
      current_book_value: "DECIMAL(18,2) COMMENT 'Book value (amortized cost)'",
      
      // Current Market Value
      current_market_price: "DECIMAL(18,4) COMMENT 'Current market price per unit'",
      market_price_date: "DATE",
      current_market_value: "DECIMAL(18,2) COMMENT 'Current market value of position'",
      unrealized_gain_loss: "DECIMAL(18,2) COMMENT 'Market value - Book value'",
      
      // Current Yield
      current_yield: "DECIMAL(7,4) COMMENT 'Current yield to maturity'",
      effective_duration: "DECIMAL(6,2) COMMENT 'Modified duration'",
      convexity: "DECIMAL(8,4)",
      
      // Income & Distributions
      last_coupon_payment_date: "DATE",
      next_coupon_payment_date: "DATE",
      accrued_interest: "DECIMAL(18,2) COMMENT 'Accrued interest to date'",
      year_to_date_interest_income: "DECIMAL(18,2)",
      
      // Accounting Treatment
      accounting_classification: "STRING COMMENT 'HELD_TO_MATURITY|AVAILABLE_FOR_SALE|TRADING'",
      
      // Maturity/Sale
      matured_flag: "BOOLEAN",
      maturity_proceeds: "DECIMAL(18,2)",
      sold_flag: "BOOLEAN",
      sale_date: "DATE",
      sale_price: "DECIMAL(18,4)",
      sale_proceeds: "DECIMAL(18,2)",
      realized_gain_loss: "DECIMAL(18,2)",
      
      // Custodian
      custodian_name: "STRING COMMENT 'Custodian bank or broker'",
      custodian_account: "STRING",
      
      // Audit
      source_system: "STRING DEFAULT 'INVESTMENT_ACCOUNTING_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 9: Debt Instruments Issued
  {
    name: 'bronze.commercial_debt_instruments_issued',
    description: 'Debt instruments issued by the company (bonds, notes, commercial paper, term loans)',
    sourceSystem: 'DEBT_MANAGEMENT_SYSTEM',
    sourceTable: 'DEBT_MASTER',
    loadType: 'BATCH',
    
    grain: 'One row per debt instrument',
    primaryKey: ['debt_instrument_id'],
    
    schema: {
      debt_instrument_id: "STRING PRIMARY KEY",
      company_id: "STRING COMMENT 'Issuing company'",
      
      // Debt Classification
      debt_type: "STRING COMMENT 'TERM_LOAN|REVOLVING_CREDIT|BOND|NOTE|COMMERCIAL_PAPER|LINE_OF_CREDIT'",
      debt_subtype: "STRING COMMENT 'SENIOR_SECURED|SENIOR_UNSECURED|SUBORDINATED|CONVERTIBLE'",
      seniority: "STRING COMMENT 'SENIOR|SUBORDINATED|JUNIOR'",
      secured_flag: "BOOLEAN",
      
      // Identifiers
      isin: "STRING COMMENT 'For bonds/notes'",
      cusip: "STRING",
      loan_identifier: "STRING COMMENT 'For term loans'",
      
      // Issuance Details
      issue_date: "DATE",
      maturity_date: "DATE",
      original_principal: "DECIMAL(18,2) COMMENT 'Original principal amount'",
      currency: "STRING DEFAULT 'USD'",
      
      // Interest Rate
      interest_rate_type: "STRING COMMENT 'FIXED|FLOATING|ZERO_COUPON'",
      fixed_rate: "DECIMAL(7,4) COMMENT 'Fixed rate if applicable'",
      floating_rate_index: "STRING COMMENT 'SOFR|LIBOR|Prime if floating'",
      floating_rate_spread: "DECIMAL(7,4) COMMENT 'Spread over index (bps)'",
      current_all_in_rate: "DECIMAL(7,4) COMMENT 'Current effective rate'",
      
      // Payment Terms
      payment_frequency: "STRING COMMENT 'MONTHLY|QUARTERLY|SEMI_ANNUAL|ANNUAL|AT_MATURITY'",
      day_count_convention: "STRING COMMENT 'ACT/360|ACT/365|30/360'",
      
      // Current Balance
      current_outstanding_principal: "DECIMAL(18,2) COMMENT 'Current principal balance'",
      accrued_interest: "DECIMAL(18,2) COMMENT 'Accrued interest payable'",
      
      // Amortization
      amortizing_flag: "BOOLEAN COMMENT 'TRUE if principal amortizes'",
      amortization_schedule: "JSON COMMENT 'Principal payment schedule'",
      
      // Prepayment
      prepayment_allowed_flag: "BOOLEAN",
      prepayment_penalty_pct: "DECIMAL(5,2) COMMENT 'Prepayment penalty %'",
      
      // Covenants
      financial_covenants: "JSON COMMENT 'Debt covenants (Debt/EBITDA, Interest Coverage, etc.)'",
      covenant_compliance_status: "STRING COMMENT 'IN_COMPLIANCE|WAIVER_OBTAINED|BREACH'",
      
      // Collateral
      collateral_description: "STRING COMMENT 'Description of collateral if secured'",
      collateral_value: "DECIMAL(18,2)",
      
      // Credit Rating
      sp_rating: "STRING COMMENT 'S&P credit rating'",
      moody_rating: "STRING COMMENT 'Moody credit rating'",
      fitch_rating: "STRING COMMENT 'Fitch credit rating'",
      
      // Guarantees
      guarantee_flag: "BOOLEAN COMMENT 'TRUE if guaranteed by parent/affiliate'",
      guarantor_name: "STRING",
      
      // Debt Status
      debt_status: "STRING COMMENT 'ACTIVE|MATURED|PREPAID|REFINANCED|DEFAULTED'",
      
      // Maturity/Repayment
      maturity_proceeds_required: "DECIMAL(18,2)",
      refinancing_plan_flag: "BOOLEAN",
      
      // Interest Rate Hedging
      hedged_flag: "BOOLEAN COMMENT 'TRUE if hedged with swaps/caps'",
      hedge_instrument_id: "STRING COMMENT 'FK to interest rate swap/cap'",
      
      // Year-to-Date Payments
      ytd_principal_paid: "DECIMAL(18,2)",
      ytd_interest_paid: "DECIMAL(18,2)",
      
      // Lender/Investor
      lender_name: "STRING COMMENT 'Lead lender or underwriter'",
      syndicated_flag: "BOOLEAN COMMENT 'TRUE if syndicated loan'",
      
      // Audit
      source_system: "STRING DEFAULT 'DEBT_MANAGEMENT_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 10: Interest Rate Risk Exposures
  {
    name: 'bronze.commercial_ir_risk_exposures',
    description: 'Interest rate risk exposure summary by currency and rate type',
    sourceSystem: 'RISK_MANAGEMENT_SYSTEM',
    sourceTable: 'IR_RISK_EXPOSURE',
    loadType: 'BATCH',
    
    grain: 'One row per currency per rate type per day',
    primaryKey: ['company_id', 'currency', 'rate_type', 'business_date'],
    
    schema: {
      company_id: "STRING PRIMARY KEY",
      currency: "STRING PRIMARY KEY COMMENT 'ISO 4217'",
      rate_type: "STRING PRIMARY KEY COMMENT 'FIXED|FLOATING|MIXED'",
      business_date: "DATE PRIMARY KEY",
      
      // Asset Exposures
      total_floating_rate_assets: "DECIMAL(18,2) COMMENT 'Assets with floating rates'",
      total_fixed_rate_assets: "DECIMAL(18,2) COMMENT 'Assets with fixed rates'",
      
      // Liability Exposures
      total_floating_rate_liabilities: "DECIMAL(18,2) COMMENT 'Liabilities with floating rates'",
      total_fixed_rate_liabilities: "DECIMAL(18,2) COMMENT 'Liabilities with fixed rates'",
      
      // Net Exposures
      net_floating_rate_exposure: "DECIMAL(18,2) COMMENT 'Floating assets - Floating liabilities'",
      net_fixed_rate_exposure: "DECIMAL(18,2) COMMENT 'Fixed assets - Fixed liabilities'",
      
      // Gap Analysis
      repricing_gap_0_to_3_months: "DECIMAL(18,2) COMMENT 'Assets - Liabilities repricing in 0-3 months'",
      repricing_gap_3_to_6_months: "DECIMAL(18,2)",
      repricing_gap_6_to_12_months: "DECIMAL(18,2)",
      repricing_gap_1_to_5_years: "DECIMAL(18,2)",
      repricing_gap_over_5_years: "DECIMAL(18,2)",
      
      // Rate Sensitivity (DV01)
      dv01: "DECIMAL(18,2) COMMENT 'Dollar value of 1 basis point rate change'",
      
      // Duration
      asset_duration: "DECIMAL(6,2) COMMENT 'Weighted average duration of assets'",
      liability_duration: "DECIMAL(6,2) COMMENT 'Weighted average duration of liabilities'",
      duration_gap: "DECIMAL(6,2) COMMENT 'Asset duration - Liability duration'",
      
      // Hedge Positions
      total_ir_swaps_notional: "DECIMAL(18,2) COMMENT 'Total notional of interest rate swaps'",
      total_caps_floors_notional: "DECIMAL(18,2) COMMENT 'Total notional of caps/floors'",
      hedge_ratio: "DECIMAL(5,2) COMMENT 'Hedged exposure / Total exposure'",
      
      // Audit
      source_system: "STRING DEFAULT 'RISK_MANAGEMENT_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 11: FX Risk Exposures
  {
    name: 'bronze.commercial_fx_risk_exposures',
    description: 'Foreign exchange risk exposure by currency pair',
    sourceSystem: 'RISK_MANAGEMENT_SYSTEM',
    sourceTable: 'FX_RISK_EXPOSURE',
    loadType: 'BATCH',
    
    grain: 'One row per currency pair per day',
    primaryKey: ['company_id', 'currency_pair', 'business_date'],
    
    schema: {
      company_id: "STRING PRIMARY KEY",
      currency_pair: "STRING PRIMARY KEY COMMENT 'e.g., EUR/USD'",
      base_currency: "STRING COMMENT 'Base currency'",
      quote_currency: "STRING COMMENT 'Quote currency'",
      business_date: "DATE PRIMARY KEY",
      
      // Exposures
      total_fx_asset_exposure: "DECIMAL(18,2) COMMENT 'Assets denominated in base currency'",
      total_fx_liability_exposure: "DECIMAL(18,2) COMMENT 'Liabilities denominated in base currency'",
      net_fx_exposure: "DECIMAL(18,2) COMMENT 'Assets - Liabilities'",
      usd_equivalent_net_exposure: "DECIMAL(18,2) COMMENT 'Net exposure in USD'",
      
      // Forecasted Cash Flows
      forecasted_fx_inflows_30d: "DECIMAL(18,2) COMMENT 'Expected FX inflows next 30 days'",
      forecasted_fx_outflows_30d: "DECIMAL(18,2) COMMENT 'Expected FX outflows next 30 days'",
      net_forecasted_fx_exposure_30d: "DECIMAL(18,2)",
      
      // Hedge Positions
      total_fx_forward_notional: "DECIMAL(18,2) COMMENT 'Total FX forwards outstanding'",
      total_fx_option_notional: "DECIMAL(18,2) COMMENT 'Total FX options outstanding'",
      total_hedged_exposure: "DECIMAL(18,2) COMMENT 'Total hedged amount'",
      hedge_ratio: "DECIMAL(5,2) COMMENT 'Hedged / Total exposure'",
      
      // VaR (Value at Risk)
      var_1_day_99pct: "DECIMAL(18,2) COMMENT '1-day VaR at 99% confidence'",
      var_10_day_99pct: "DECIMAL(18,2) COMMENT '10-day VaR at 99% confidence'",
      
      // Current Market Rate
      current_spot_rate: "DECIMAL(12,6)",
      rate_observation_timestamp: "TIMESTAMP",
      
      // Audit
      source_system: "STRING DEFAULT 'RISK_MANAGEMENT_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 12: Commodity Hedges
  {
    name: 'bronze.commercial_commodity_hedges',
    description: 'Commodity hedging contracts (oil, gas, metals, agriculture)',
    sourceSystem: 'COMMODITY_TRADING_SYSTEM',
    sourceTable: 'COMMODITY_HEDGE_CONTRACTS',
    loadType: 'BATCH',
    
    grain: 'One row per commodity hedge contract',
    primaryKey: ['commodity_hedge_id'],
    
    schema: {
      commodity_hedge_id: "STRING PRIMARY KEY",
      company_id: "STRING",
      
      // Commodity Details
      commodity_type: "STRING COMMENT 'OIL|NATURAL_GAS|GOLD|SILVER|COPPER|WHEAT|CORN|COFFEE'",
      commodity_subtype: "STRING COMMENT 'WTI_CRUDE|BRENT_CRUDE|HENRY_HUB_GAS|COMEX_GOLD'",
      
      // Instrument Type
      instrument_type: "STRING COMMENT 'FUTURES|SWAP|OPTION|COLLAR'",
      
      // Trade Details
      trade_date: "DATE",
      maturity_date: "DATE",
      
      // Quantity
      quantity: "DECIMAL(18,4) COMMENT 'Quantity hedged'",
      unit_of_measure: "STRING COMMENT 'BARRELS|MMBtu|TROY_OUNCES|BUSHELS'",
      
      // Price
      strike_price: "DECIMAL(12,4) COMMENT 'Hedged price per unit'",
      currency: "STRING DEFAULT 'USD'",
      
      // Notional Value
      notional_value: "DECIMAL(18,2) COMMENT 'Quantity * Strike price'",
      
      // Current Market Price
      current_market_price: "DECIMAL(12,4)",
      market_price_date: "DATE",
      
      // MTM
      current_mtm_value: "DECIMAL(18,2)",
      unrealized_gain_loss: "DECIMAL(18,2)",
      
      // Hedge Accounting
      hedge_designation: "STRING",
      hedged_production_volume: "DECIMAL(18,4) COMMENT 'Expected production volume being hedged'",
      
      // Status
      contract_status: "STRING COMMENT 'ACTIVE|MATURED|TERMINATED'",
      
      // Audit
      source_system: "STRING DEFAULT 'COMMODITY_TRADING_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 13: Nostro Account Balances
  {
    name: 'bronze.commercial_nostro_account_balances',
    description: 'Daily nostro account balances (bank accounts held at correspondent banks)',
    sourceSystem: 'NOSTRO_RECONCILIATION_SYSTEM',
    sourceTable: 'NOSTRO_BALANCES',
    loadType: 'BATCH',
    
    grain: 'One row per nostro account per day',
    primaryKey: ['nostro_account_id', 'business_date'],
    
    schema: {
      nostro_account_id: "STRING PRIMARY KEY COMMENT 'Nostro account identifier'",
      business_date: "DATE PRIMARY KEY",
      
      // Account Details
      currency: "STRING COMMENT 'ISO 4217'",
      correspondent_bank_name: "STRING COMMENT 'Bank where nostro account is held'",
      correspondent_bank_swift_bic: "STRING",
      account_number: "STRING",
      
      // Balances
      opening_ledger_balance: "DECIMAL(18,2) COMMENT 'Opening balance per our books'",
      closing_ledger_balance: "DECIMAL(18,2) COMMENT 'Closing balance per our books'",
      bank_statement_balance: "DECIMAL(18,2) COMMENT 'Balance per correspondent bank statement'",
      
      // Reconciliation
      reconciliation_difference: "DECIMAL(18,2) COMMENT 'Ledger - Bank statement'",
      reconciled_flag: "BOOLEAN COMMENT 'TRUE if reconciled'",
      outstanding_items_count: "INTEGER COMMENT 'Number of outstanding items'",
      outstanding_items_amount: "DECIMAL(18,2) COMMENT 'Total amount of outstanding items'",
      
      // Intraday Activity
      total_credits: "DECIMAL(18,2)",
      total_debits: "DECIMAL(18,2)",
      net_activity: "DECIMAL(18,2)",
      
      // Utilization
      target_balance: "DECIMAL(18,2) COMMENT 'Target balance per treasury policy'",
      excess_balance: "DECIMAL(18,2) COMMENT 'Amount above target'",
      
      // Audit
      source_system: "STRING DEFAULT 'NOSTRO_RECONCILIATION_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 14: Treasury Transactions
  {
    name: 'bronze.commercial_treasury_transactions',
    description: 'All treasury transaction activity (FX, derivatives, investments, funding)',
    sourceSystem: 'TREASURY_MANAGEMENT_SYSTEM',
    sourceTable: 'TREASURY_TRANSACTION_LOG',
    loadType: 'STREAMING',
    
    grain: 'One row per treasury transaction',
    primaryKey: ['treasury_transaction_id'],
    
    schema: {
      treasury_transaction_id: "STRING PRIMARY KEY",
      company_id: "STRING",
      
      // Transaction Classification
      transaction_type: "STRING COMMENT 'FX_SPOT|FX_FORWARD|IR_SWAP|INVESTMENT|FUNDING|HEDGE'",
      transaction_category: "STRING COMMENT 'TRADING|HEDGING|LIQUIDITY_MANAGEMENT|INVESTMENT'",
      
      // Referenced Contract
      contract_id: "STRING COMMENT 'FK to underlying contract (swap, forward, etc.)'",
      contract_type: "STRING",
      
      // Transaction Details
      transaction_date: "DATE",
      transaction_timestamp: "TIMESTAMP",
      settlement_date: "DATE",
      
      // Amounts
      transaction_amount: "DECIMAL(18,2)",
      transaction_currency: "STRING",
      usd_equivalent_amount: "DECIMAL(18,2)",
      
      // Counterparty
      counterparty_name: "STRING",
      
      // Transaction Direction
      direction: "STRING COMMENT 'INFLOW|OUTFLOW'",
      
      // GL Impact
      gl_account_debit: "STRING",
      gl_account_credit: "STRING",
      gl_posting_date: "DATE",
      
      // Audit
      created_by_user_id: "STRING",
      approved_by_user_id: "STRING",
      source_system: "STRING DEFAULT 'TREASURY_MANAGEMENT_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 15: Hedge Effectiveness Tests
  {
    name: 'bronze.commercial_hedge_effectiveness_tests',
    description: 'Hedge effectiveness testing results for hedge accounting (ASC 815 / IFRS 9)',
    sourceSystem: 'HEDGE_ACCOUNTING_SYSTEM',
    sourceTable: 'HEDGE_EFFECTIVENESS_LOG',
    loadType: 'BATCH',
    
    grain: 'One row per hedge relationship per test date',
    primaryKey: ['hedge_relationship_id', 'test_date'],
    
    schema: {
      hedge_relationship_id: "STRING PRIMARY KEY COMMENT 'Unique hedge relationship ID'",
      test_date: "DATE PRIMARY KEY",
      company_id: "STRING",
      
      // Hedge Details
      hedge_instrument_id: "STRING COMMENT 'FK to derivative (swap, forward, option)'",
      hedge_instrument_type: "STRING COMMENT 'SWAP|FORWARD|OPTION|CAP'",
      hedged_item_id: "STRING COMMENT 'FK to hedged asset/liability'",
      hedged_item_description: "STRING",
      hedge_designation: "STRING COMMENT 'CASH_FLOW_HEDGE|FAIR_VALUE_HEDGE|NET_INVESTMENT_HEDGE'",
      
      // Test Method
      test_method: "STRING COMMENT 'DOLLAR_OFFSET|REGRESSION_ANALYSIS|CRITICAL_TERMS_MATCH'",
      test_frequency: "STRING COMMENT 'QUARTERLY|MONTHLY'",
      
      // Test Results
      test_result: "STRING COMMENT 'HIGHLY_EFFECTIVE|INEFFECTIVE'",
      effectiveness_ratio: "DECIMAL(7,4) COMMENT 'Hedge effectiveness ratio (80%-125% = effective)'",
      
      // Change in Value
      change_in_hedge_instrument_value: "DECIMAL(18,2) COMMENT 'Change in derivative value'",
      change_in_hedged_item_value: "DECIMAL(18,2) COMMENT 'Change in hedged item value'",
      
      // Ineffectiveness
      ineffective_portion: "DECIMAL(18,2) COMMENT 'Amount of ineffectiveness to be recognized in P&L'",
      
      // Cumulative Performance
      cumulative_gain_loss_hedge_instrument: "DECIMAL(18,2)",
      cumulative_gain_loss_hedged_item: "DECIMAL(18,2)",
      
      // Discontinuation
      hedge_discontinued_flag: "BOOLEAN",
      discontinuation_reason: "STRING",
      
      // Audit
      tested_by_user_id: "STRING",
      reviewed_by_user_id: "STRING",
      source_system: "STRING DEFAULT 'HEDGE_ACCOUNTING_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 16: Credit Ratings
  {
    name: 'bronze.commercial_credit_ratings',
    description: 'Credit ratings assigned to the company by rating agencies',
    sourceSystem: 'CREDIT_RATING_SYSTEM',
    sourceTable: 'CREDIT_RATING_HISTORY',
    loadType: 'BATCH',
    
    grain: 'One row per rating agency per rating date',
    primaryKey: ['company_id', 'rating_agency', 'rating_date'],
    
    schema: {
      company_id: "STRING PRIMARY KEY",
      rating_agency: "STRING PRIMARY KEY COMMENT 'SP|MOODY|FITCH'",
      rating_date: "DATE PRIMARY KEY",
      
      // Credit Ratings
      long_term_issuer_rating: "STRING COMMENT 'Long-term issuer credit rating'",
      short_term_issuer_rating: "STRING COMMENT 'Short-term issuer credit rating'",
      outlook: "STRING COMMENT 'POSITIVE|STABLE|NEGATIVE|DEVELOPING'",
      
      // Rating Change
      previous_long_term_rating: "STRING",
      rating_action: "STRING COMMENT 'UPGRADE|DOWNGRADE|AFFIRMED|NEW_RATING'",
      
      // Rationale
      rating_rationale: "STRING COMMENT 'Summary of rating rationale'",
      
      // Watch Status
      credit_watch_flag: "BOOLEAN COMMENT 'TRUE if on credit watch'",
      credit_watch_direction: "STRING COMMENT 'POSITIVE|NEGATIVE|NULL'",
      
      // Audit
      source_system: "STRING DEFAULT 'CREDIT_RATING_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 17: Treasury KPIs
  {
    name: 'bronze.commercial_treasury_kpis',
    description: 'Treasury key performance indicators (daily/monthly snapshots)',
    sourceSystem: 'TREASURY_REPORTING_SYSTEM',
    sourceTable: 'TREASURY_KPI_SNAPSHOT',
    loadType: 'BATCH',
    
    grain: 'One row per company per day',
    primaryKey: ['company_id', 'business_date'],
    
    schema: {
      company_id: "STRING PRIMARY KEY",
      business_date: "DATE PRIMARY KEY",
      
      // Liquidity KPIs
      total_cash_and_equivalents: "DECIMAL(18,2) COMMENT 'Consolidated cash position'",
      available_liquidity: "DECIMAL(18,2) COMMENT 'Cash + undrawn credit lines'",
      days_cash_on_hand: "INTEGER COMMENT 'Cash / (Annual opex / 365)'",
      
      // Debt KPIs
      total_debt: "DECIMAL(18,2) COMMENT 'Short-term + long-term debt'",
      net_debt: "DECIMAL(18,2) COMMENT 'Total debt - Cash'",
      debt_to_ebitda_ratio: "DECIMAL(5,2)",
      interest_coverage_ratio: "DECIMAL(5,2) COMMENT 'EBITDA / Interest expense'",
      
      // FX Exposure
      total_fx_exposure_usd: "DECIMAL(18,2) COMMENT 'Total FX exposure in USD equivalent'",
      fx_hedge_ratio: "DECIMAL(5,2) COMMENT '% of FX exposure hedged'",
      
      // Interest Rate Exposure
      total_ir_exposure_usd: "DECIMAL(18,2) COMMENT 'Total interest rate exposure'",
      ir_hedge_ratio: "DECIMAL(5,2) COMMENT '% of IR exposure hedged'",
      
      // Investment Portfolio
      total_investment_portfolio_value: "DECIMAL(18,2)",
      investment_portfolio_yield: "DECIMAL(7,4) COMMENT 'Weighted average yield'",
      
      // Treasury Revenue
      fx_trading_revenue_mtd: "DECIMAL(18,2) COMMENT 'Month-to-date FX trading revenue'",
      investment_income_mtd: "DECIMAL(18,2)",
      
      // Audit
      source_system: "STRING DEFAULT 'TREASURY_REPORTING_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },

  // Table 18: Treasury Counterparties
  {
    name: 'bronze.commercial_treasury_counterparties',
    description: 'Treasury counterparties (banks, dealers, clearinghouses)',
    sourceSystem: 'COUNTERPARTY_MANAGEMENT_SYSTEM',
    sourceTable: 'COUNTERPARTY_MASTER',
    loadType: 'BATCH',
    
    grain: 'One row per counterparty',
    primaryKey: ['counterparty_id'],
    
    schema: {
      counterparty_id: "STRING PRIMARY KEY",
      
      // Counterparty Information
      counterparty_name: "STRING COMMENT 'Legal name'",
      counterparty_type: "STRING COMMENT 'BANK|BROKER_DEALER|CLEARING_HOUSE|CORPORATE'",
      counterparty_country: "STRING COMMENT 'ISO 3166'",
      
      // Identifiers
      lei_code: "STRING COMMENT 'Legal Entity Identifier'",
      swift_bic: "STRING",
      
      // Credit Rating
      sp_rating: "STRING",
      moody_rating: "STRING",
      internal_credit_rating: "STRING",
      
      // Credit Limit
      credit_limit: "DECIMAL(18,2) COMMENT 'Maximum exposure allowed'",
      current_exposure: "DECIMAL(18,2) COMMENT 'Current mark-to-market exposure'",
      available_credit: "DECIMAL(18,2) COMMENT 'Limit - Current exposure'",
      
      // Collateral Agreement
      csa_in_place_flag: "BOOLEAN COMMENT 'Credit Support Annex (collateral agreement)'",
      threshold_amount: "DECIMAL(18,2) COMMENT 'Collateral threshold'",
      minimum_transfer_amount: "DECIMAL(18,2)",
      
      // ISDA Master Agreement
      isda_agreement_flag: "BOOLEAN",
      isda_agreement_date: "DATE",
      
      // Active Status
      active_flag: "BOOLEAN",
      relationship_start_date: "DATE",
      relationship_end_date: "DATE",
      
      // Audit
      source_system: "STRING DEFAULT 'COUNTERPARTY_MANAGEMENT_SYSTEM'",
      load_timestamp: "TIMESTAMP",
    },
  },
];

export const treasuryCommercialBronzeLayer = {
  name: 'Treasury-Commercial Bronze Layer',
  totalTables: treasuryCommercialBronzeTables.length,
  tables: treasuryCommercialBronzeTables,
};
