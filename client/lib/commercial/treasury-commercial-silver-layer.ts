/**
 * TREASURY-COMMERCIAL SILVER LAYER
 * Cleansed, conformed, and enriched treasury data
 * 
 * Domain: Treasury-Commercial
 * Area: Commercial Banking
 * Layer: SILVER (Cleansed/Conformed)
 * Tables: 14
 * 
 * Transformations:
 * - FX and derivatives golden record creation
 * - Mark-to-market (MTM) valuation enrichment
 * - Hedge effectiveness calculation
 * - Risk metric aggregation (VaR, DV01, duration)
 * - Liquidity ratio calculation
 * - Credit exposure netting
 * - Portfolio position aggregation
 */

export const treasuryCommercialSilverTables = [
  // Table 1: FX Transactions Golden Record
  {
    name: 'silver.commercial_fx_transactions_golden',
    description: 'Deduplicated and enriched FX transactions (spot, forward, options) with MTM valuation',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per FX transaction (current and historical versions)',
    primaryKey: ['fx_transaction_key', 'effective_start_date'],
    foreignKeys: ['company_id', 'currency_pair', 'counterparty_id'],
    
    transformations: [
      'Consolidate FX spot, forward, and option transactions into unified view',
      'Enrich with daily mark-to-market valuations',
      'Calculate unrealized P&L by currency pair',
      'Link to hedge accounting designations',
      'Enrich with market rate benchmarks (Bloomberg, Reuters)',
      'Calculate bank spread and customer all-in rate',
      'Aggregate FX exposure by currency and maturity bucket',
      'Identify broken trades and settlement failures',
      'Calculate days to maturity for forwards',
      'Enrich with counterparty credit ratings',
    ],
    
    dataQualityRules: [
      'FX rate must be > 0',
      'Settlement date must be >= trade date',
      'Currency pair must follow ISO 4217 format',
      'For forwards, maturity date must be > T+2',
      'Notional amount must be > 0',
      'MTM valuation must be updated daily for active positions',
      'Hedge designation must be valid if populated (CASH_FLOW_HEDGE|FAIR_VALUE_HEDGE|NET_INVESTMENT_HEDGE)',
      'Counterparty must exist in counterparty master',
    ],
    
    schema: {
      // Primary Key
      fx_transaction_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      
      // Natural Key
      fx_transaction_id: "STRING COMMENT 'Business transaction ID'",
      source_system: "STRING",
      
      // Transaction Classification (Enriched)
      transaction_type: "STRING COMMENT 'SPOT|FORWARD|OPTION|SWAP'",
      transaction_direction: "STRING COMMENT 'BUY|SELL'",
      deliverable_flag: "BOOLEAN COMMENT 'FALSE for NDFs'",
      
      // Currency Pair (Enriched)
      currency_pair: "STRING",
      base_currency: "STRING",
      quote_currency: "STRING",
      base_currency_name: "STRING COMMENT 'Enriched currency name'",
      quote_currency_name: "STRING COMMENT 'Enriched currency name'",
      
      // Trade Dates
      trade_date: "DATE",
      settlement_date: "DATE",
      maturity_date: "DATE COMMENT 'For forwards/options'",
      days_to_maturity: "INTEGER COMMENT 'Calculated, NULL if spot'",
      tenor_bucket: "STRING COMMENT '0-30D|30-90D|90-180D|180D-1Y|1Y+ for forwards'",
      
      // Amounts
      notional_base_currency: "DECIMAL(18,2)",
      notional_quote_currency: "DECIMAL(18,2)",
      usd_equivalent_notional: "DECIMAL(18,2)",
      
      // Rates (Enriched with Market Data)
      contracted_fx_rate: "DECIMAL(12,6) COMMENT 'Customer rate'",
      market_mid_rate_at_trade: "DECIMAL(12,6) COMMENT 'Market mid-rate at execution'",
      bank_spread_bps: "INTEGER COMMENT 'Bank spread in basis points'",
      bank_revenue: "DECIMAL(18,2) COMMENT 'Revenue from spread'",
      
      // Current Market Rate
      current_market_rate: "DECIMAL(12,6) COMMENT 'Latest market rate'",
      market_rate_timestamp: "TIMESTAMP",
      market_rate_source: "STRING COMMENT 'BLOOMBERG|REUTERS'",
      
      // Mark-to-Market Valuation (Enriched)
      current_mtm_value: "DECIMAL(18,2) COMMENT 'Current mark-to-market value'",
      mtm_valuation_date: "DATE",
      mtm_currency: "STRING DEFAULT 'USD'",
      unrealized_pnl: "DECIMAL(18,2) COMMENT 'Unrealized profit/loss'",
      unrealized_pnl_pct: "DECIMAL(7,4) COMMENT 'Unrealized P&L as % of notional'",
      
      // For Options (Enriched)
      option_type: "STRING COMMENT 'CALL|PUT|NULL'",
      strike_rate: "DECIMAL(12,6)",
      premium_amount: "DECIMAL(18,2)",
      implied_volatility: "DECIMAL(7,4)",
      option_delta: "DECIMAL(7,4)",
      option_gamma: "DECIMAL(10,8)",
      option_vega: "DECIMAL(10,4)",
      option_theta: "DECIMAL(10,4)",
      in_the_money_flag: "BOOLEAN",
      intrinsic_value: "DECIMAL(18,2)",
      time_value: "DECIMAL(18,2)",
      
      // Settlement (Enriched)
      settlement_status: "STRING COMMENT 'PENDING|SETTLED|FAILED'",
      settlement_timestamp: "TIMESTAMP",
      broken_trade_flag: "BOOLEAN COMMENT 'Settlement failure'",
      
      // Counterparty (Enriched)
      counterparty_id: "STRING",
      counterparty_name: "STRING",
      counterparty_credit_rating: "STRING COMMENT 'Enriched from counterparty master'",
      counterparty_country: "STRING",
      
      // Hedge Accounting (Enriched)
      hedge_designation: "STRING",
      hedge_effectiveness_status: "STRING COMMENT 'HIGHLY_EFFECTIVE|INEFFECTIVE|NOT_TESTED'",
      hedged_item_id: "STRING COMMENT 'Link to hedged exposure'",
      hedged_item_description: "STRING",
      hedge_accounting_treatment: "STRING COMMENT 'OCI|P&L'",
      
      // Risk Metrics (Calculated)
      fx_exposure_amount: "DECIMAL(18,2) COMMENT 'Net FX exposure from this transaction'",
      value_at_risk_1d: "DECIMAL(18,2) COMMENT '1-day VaR at 99%'",
      
      // Business Context (Enriched)
      company_id: "STRING",
      company_name: "STRING COMMENT 'Enriched'",
      trade_purpose: "STRING COMMENT 'HEDGING|SPECULATION|OPERATIONAL'",
      
      // Status
      position_status: "STRING COMMENT 'OPEN|MATURED|EARLY_TERMINATED|ROLLED'",
      active_flag: "BOOLEAN",
      
      // Data Quality
      data_quality_score: "DECIMAL(5,2)",
      
      // SCD Type 2
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP",
      is_current: "BOOLEAN NOT NULL DEFAULT TRUE",
      row_hash: "STRING",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 2: Interest Rate Derivatives Golden Record
  {
    name: 'silver.commercial_ir_derivatives_golden',
    description: 'Consolidated interest rate swaps, caps, floors, and swaptions with valuation',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per IR derivative contract',
    primaryKey: ['ir_derivative_key', 'effective_start_date'],
    
    transformations: [
      'Consolidate IR swaps, caps, floors, and swaptions',
      'Calculate mark-to-market using discounted cash flow models',
      'Calculate DV01 (dollar value of 1 basis point)',
      'Calculate duration and convexity',
      'Enrich with current floating rates (SOFR, LIBOR replacements)',
      'Link to hedged debt instruments',
      'Calculate cumulative net cash flows',
      'Assess hedge effectiveness',
      'Calculate credit valuation adjustment (CVA)',
    ],
    
    dataQualityRules: [
      'Notional amount must be > 0',
      'Fixed rate must be between 0 and 20%',
      'Maturity date must be > effective date',
      'Payment frequency must be valid (MONTHLY|QUARTERLY|SEMI_ANNUAL|ANNUAL)',
      'Floating rate index must be valid (SOFR|EURIBOR|Fed_Funds)',
      'If hedge designated, hedged item must exist',
      'MTM must be updated daily',
      'DV01 must be calculated for risk management',
    ],
    
    schema: {
      ir_derivative_key: "BIGINT PRIMARY KEY",
      ir_contract_id: "STRING COMMENT 'Business contract ID'",
      source_system: "STRING",
      
      // Contract Type (Enriched)
      derivative_type: "STRING COMMENT 'SWAP|CAP|FLOOR|COLLAR|SWAPTION'",
      swap_direction: "STRING COMMENT 'PAY_FIXED|RECEIVE_FIXED|BASIS_SWAP'",
      
      // Dates
      trade_date: "DATE",
      effective_date: "DATE",
      maturity_date: "DATE",
      tenor_years: "DECIMAL(5,2)",
      tenor_bucket: "STRING COMMENT '0-1Y|1-3Y|3-5Y|5-10Y|10Y+'",
      days_to_maturity: "INTEGER",
      
      // Notional
      notional_amount: "DECIMAL(18,2)",
      notional_currency: "STRING",
      amortizing_flag: "BOOLEAN",
      current_notional: "DECIMAL(18,2) COMMENT 'Current notional if amortizing'",
      
      // Fixed Leg (Enriched)
      fixed_rate: "DECIMAL(7,4)",
      fixed_leg_payment_frequency: "STRING",
      fixed_leg_day_count: "STRING",
      
      // Floating Leg (Enriched)
      floating_rate_index: "STRING",
      floating_rate_tenor: "STRING COMMENT '3M|1M|OVERNIGHT'",
      floating_rate_spread: "DECIMAL(7,4)",
      current_floating_rate: "DECIMAL(7,4) COMMENT 'Index + spread'",
      floating_rate_observation_date: "DATE",
      floating_leg_payment_frequency: "STRING",
      
      // Cap/Floor Strike
      cap_strike_rate: "DECIMAL(7,4)",
      floor_strike_rate: "DECIMAL(7,4)",
      premium_paid: "DECIMAL(18,2)",
      
      // Valuation (Enriched with Models)
      current_mtm_value: "DECIMAL(18,2)",
      mtm_valuation_date: "DATE",
      mtm_model: "STRING COMMENT 'DISCOUNTED_CASH_FLOW|BLACK_SCHOLES|BINOMIAL'",
      discount_curve_used: "STRING COMMENT 'SOFR_CURVE|TREASURY_CURVE'",
      
      // Risk Metrics (Calculated)
      dv01: "DECIMAL(18,2) COMMENT 'Dollar value of 1 basis point'",
      pv01: "DECIMAL(18,2) COMMENT 'Present value of 1bp'",
      duration: "DECIMAL(6,2) COMMENT 'Modified duration'",
      convexity: "DECIMAL(8,4)",
      
      // Cash Flows (Aggregated)
      cumulative_cash_paid: "DECIMAL(18,2)",
      cumulative_cash_received: "DECIMAL(18,2)",
      net_cumulative_cash_flow: "DECIMAL(18,2)",
      next_payment_date: "DATE",
      next_payment_amount_estimate: "DECIMAL(18,2)",
      
      // Counterparty (Enriched)
      counterparty_id: "STRING",
      counterparty_name: "STRING",
      counterparty_credit_rating: "STRING",
      credit_valuation_adjustment: "DECIMAL(18,2) COMMENT 'CVA for credit risk'",
      
      // Collateral
      collateral_agreement_flag: "BOOLEAN",
      collateral_posted: "DECIMAL(18,2)",
      collateral_required: "DECIMAL(18,2)",
      collateral_shortfall: "DECIMAL(18,2)",
      
      // Hedge Accounting (Enriched)
      hedge_designation: "STRING",
      hedge_effectiveness_test_result: "STRING COMMENT 'PASS|FAIL'",
      hedge_effectiveness_ratio: "DECIMAL(7,4)",
      hedged_debt_id: "STRING",
      hedged_debt_description: "STRING",
      ineffective_portion: "DECIMAL(18,2) COMMENT 'To be recognized in P&L'",
      
      // Clearing (Enriched)
      cleared_flag: "BOOLEAN",
      clearing_house: "STRING COMMENT 'CME|LCH|NULL'",
      uti: "STRING COMMENT 'Unique Transaction Identifier'",
      
      // Status
      contract_status: "STRING COMMENT 'ACTIVE|MATURED|TERMINATED'",
      early_termination_flag: "BOOLEAN",
      termination_payment: "DECIMAL(18,2)",
      
      // Business Context
      company_id: "STRING",
      company_name: "STRING COMMENT 'Enriched'",
      
      // SCD Type 2
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP",
      is_current: "BOOLEAN NOT NULL DEFAULT TRUE",
      row_hash: "STRING",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 3: Portfolio Position Summary
  {
    name: 'silver.commercial_portfolio_position_summary',
    description: 'Daily aggregated portfolio positions by instrument type and currency',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per company per instrument type per currency per day',
    primaryKey: ['company_id', 'instrument_type', 'currency', 'business_date'],
    
    transformations: [
      'Aggregate all treasury positions (FX, IR derivatives, investments)',
      'Calculate total notional exposure by instrument type',
      'Calculate total mark-to-market value',
      'Calculate net unrealized P&L',
      'Aggregate risk metrics (VaR, DV01)',
      'Calculate portfolio concentration ratios',
    ],
    
    dataQualityRules: [
      'Total notional must equal sum of individual positions',
      'MTM must be updated daily',
      'Position count must match underlying transaction count',
    ],
    
    schema: {
      company_id: "STRING PRIMARY KEY",
      instrument_type: "STRING PRIMARY KEY COMMENT 'FX_SPOT|FX_FORWARD|FX_OPTION|IR_SWAP|IR_CAP|IR_FLOOR|BOND|EQUITY'",
      currency: "STRING PRIMARY KEY COMMENT 'ISO 4217'",
      business_date: "DATE PRIMARY KEY",
      
      // Position Counts
      total_position_count: "INTEGER COMMENT 'Number of open positions'",
      long_position_count: "INTEGER",
      short_position_count: "INTEGER",
      
      // Notional Exposure
      total_notional: "DECIMAL(18,2)",
      long_notional: "DECIMAL(18,2)",
      short_notional: "DECIMAL(18,2)",
      net_notional: "DECIMAL(18,2) COMMENT 'Long - Short'",
      usd_equivalent_notional: "DECIMAL(18,2)",
      
      // Mark-to-Market
      total_mtm_value: "DECIMAL(18,2)",
      long_mtm_value: "DECIMAL(18,2)",
      short_mtm_value: "DECIMAL(18,2)",
      net_mtm_value: "DECIMAL(18,2)",
      
      // Unrealized P&L
      total_unrealized_pnl: "DECIMAL(18,2)",
      unrealized_gains: "DECIMAL(18,2)",
      unrealized_losses: "DECIMAL(18,2)",
      
      // Risk Metrics
      aggregate_var_1d_99pct: "DECIMAL(18,2) COMMENT 'Aggregated 1-day VaR'",
      aggregate_dv01: "DECIMAL(18,2) COMMENT 'Total DV01 for IR positions'",
      weighted_avg_duration: "DECIMAL(6,2) COMMENT 'For fixed income'",
      
      // Concentration
      largest_position_notional: "DECIMAL(18,2)",
      largest_position_pct_of_total: "DECIMAL(5,2)",
      top_5_positions_pct: "DECIMAL(5,2) COMMENT '% of total notional in top 5 positions'",
      
      // Maturity Profile
      maturing_0_to_30_days: "DECIMAL(18,2) COMMENT 'Notional maturing in 0-30 days'",
      maturing_30_to_90_days: "DECIMAL(18,2)",
      maturing_90_to_180_days: "DECIMAL(18,2)",
      maturing_180_to_365_days: "DECIMAL(18,2)",
      maturing_over_1_year: "DECIMAL(18,2)",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 4: Liquidity Analysis
  {
    name: 'silver.commercial_liquidity_analysis',
    description: 'Daily liquidity analysis with forecasting and stress scenarios',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per company per currency per day',
    primaryKey: ['company_id', 'currency', 'business_date'],
    
    transformations: [
      'Aggregate cash positions across all accounts',
      'Calculate liquidity ratios (current ratio, quick ratio)',
      'Forecast short-term liquidity needs (30/60/90 days)',
      'Assess available funding sources',
      'Identify liquidity gaps',
      'Apply stress scenarios to cash forecasts',
    ],
    
    dataQualityRules: [
      'Total cash must equal sum of account balances',
      'Available liquidity must include cash + undrawn credit facilities',
      'Days cash on hand must be >= 0',
      'Liquidity surplus/deficit must reconcile with cash and forecasted flows',
    ],
    
    schema: {
      company_id: "STRING PRIMARY KEY",
      currency: "STRING PRIMARY KEY",
      business_date: "DATE PRIMARY KEY",
      
      // Current Cash Position
      total_cash_and_equivalents: "DECIMAL(18,2)",
      restricted_cash: "DECIMAL(18,2)",
      unrestricted_cash: "DECIMAL(18,2)",
      
      // Available Liquidity
      undrawn_credit_facilities: "DECIMAL(18,2) COMMENT 'Available undrawn lines'",
      total_available_liquidity: "DECIMAL(18,2) COMMENT 'Cash + Undrawn facilities'",
      
      // Liquidity Ratios (Calculated)
      current_ratio: "DECIMAL(7,4) COMMENT 'Current assets / Current liabilities'",
      quick_ratio: "DECIMAL(7,4) COMMENT '(Cash + Marketable securities) / Current liabilities'",
      cash_ratio: "DECIMAL(7,4) COMMENT 'Cash / Current liabilities'",
      days_cash_on_hand: "INTEGER COMMENT 'Cash / (Annual opex / 365)'",
      
      // Short-Term Forecast
      forecasted_inflows_30d: "DECIMAL(18,2)",
      forecasted_outflows_30d: "DECIMAL(18,2)",
      net_cash_flow_30d: "DECIMAL(18,2)",
      forecasted_cash_balance_30d: "DECIMAL(18,2)",
      
      forecasted_inflows_60d: "DECIMAL(18,2)",
      forecasted_outflows_60d: "DECIMAL(18,2)",
      forecasted_cash_balance_60d: "DECIMAL(18,2)",
      
      forecasted_inflows_90d: "DECIMAL(18,2)",
      forecasted_outflows_90d: "DECIMAL(18,2)",
      forecasted_cash_balance_90d: "DECIMAL(18,2)",
      
      // Liquidity Gap Analysis
      minimum_target_cash: "DECIMAL(18,2) COMMENT 'Minimum cash policy requirement'",
      liquidity_surplus_deficit_30d: "DECIMAL(18,2) COMMENT 'Forecast 30d cash - Target'",
      liquidity_surplus_deficit_60d: "DECIMAL(18,2)",
      liquidity_surplus_deficit_90d: "DECIMAL(18,2)",
      
      // Funding Plan
      required_funding_30d: "DECIMAL(18,2) COMMENT 'Funding needed if deficit'",
      planned_funding_source: "STRING COMMENT 'CREDIT_LINE|CP_ISSUANCE|TERM_LOAN|ASSET_SALE'",
      
      // Stress Scenarios (Calculated)
      stress_scenario_revenue_down_20pct: "DECIMAL(18,2) COMMENT 'Cash balance with 20% revenue drop'",
      stress_scenario_major_customer_loss: "DECIMAL(18,2)",
      survival_days_under_stress: "INTEGER COMMENT 'Days company can operate with no revenue'",
      
      // Intraday Liquidity
      intraday_overdraft_occurrences: "INTEGER COMMENT 'Number of overdraft instances today'",
      max_intraday_overdraft: "DECIMAL(18,2)",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 5: Interest Rate Risk Summary
  {
    name: 'silver.commercial_ir_risk_summary',
    description: 'Interest rate risk exposure summary with gap analysis and sensitivity',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per company per currency per day',
    primaryKey: ['company_id', 'currency', 'business_date'],
    
    transformations: [
      'Aggregate interest-sensitive assets and liabilities',
      'Calculate repricing gaps by time bucket',
      'Calculate net DV01 across all IR positions',
      'Calculate duration gap (asset duration - liability duration)',
      'Calculate earnings at risk (EaR) and economic value of equity (EVE)',
      'Assess hedge coverage ratio',
      'Simulate parallel and non-parallel rate shocks (+100bp, -100bp)',
    ],
    
    dataQualityRules: [
      'Total assets must equal sum of fixed + floating rate assets',
      'Total liabilities must equal sum of fixed + floating rate liabilities',
      'Repricing gaps must sum to zero across all buckets',
      'DV01 must be calculated for all rate-sensitive instruments',
      'Hedge ratio must be between 0 and 1',
    ],
    
    schema: {
      company_id: "STRING PRIMARY KEY",
      currency: "STRING PRIMARY KEY",
      business_date: "DATE PRIMARY KEY",
      
      // Asset Breakdown
      total_rate_sensitive_assets: "DECIMAL(18,2)",
      fixed_rate_assets: "DECIMAL(18,2)",
      floating_rate_assets: "DECIMAL(18,2)",
      asset_weighted_avg_rate: "DECIMAL(7,4)",
      asset_weighted_avg_duration: "DECIMAL(6,2)",
      
      // Liability Breakdown
      total_rate_sensitive_liabilities: "DECIMAL(18,2)",
      fixed_rate_liabilities: "DECIMAL(18,2)",
      floating_rate_liabilities: "DECIMAL(18,2)",
      liability_weighted_avg_rate: "DECIMAL(7,4)",
      liability_weighted_avg_duration: "DECIMAL(6,2)",
      
      // Net Position
      net_rate_sensitive_position: "DECIMAL(18,2) COMMENT 'Assets - Liabilities'",
      duration_gap: "DECIMAL(6,2) COMMENT 'Asset duration - Liability duration'",
      
      // Repricing Gap Analysis (Time Buckets)
      repricing_gap_0_to_3m: "DECIMAL(18,2) COMMENT 'Assets - Liabilities repricing in 0-3M'",
      repricing_gap_3m_to_6m: "DECIMAL(18,2)",
      repricing_gap_6m_to_12m: "DECIMAL(18,2)",
      repricing_gap_1y_to_3y: "DECIMAL(18,2)",
      repricing_gap_3y_to_5y: "DECIMAL(18,2)",
      repricing_gap_over_5y: "DECIMAL(18,2)",
      cumulative_gap_1y: "DECIMAL(18,2) COMMENT 'Cumulative gap through 1 year'",
      
      // Risk Metrics
      aggregate_dv01: "DECIMAL(18,2) COMMENT 'Total DV01 across all IR positions'",
      pvbp: "DECIMAL(18,2) COMMENT 'Present value of a basis point'",
      
      // Interest Rate Shock Scenarios (Calculated)
      impact_parallel_up_100bp: "DECIMAL(18,2) COMMENT 'P&L impact of +100bp parallel shift'",
      impact_parallel_down_100bp: "DECIMAL(18,2) COMMENT 'P&L impact of -100bp parallel shift'",
      impact_steepening_50bp: "DECIMAL(18,2) COMMENT 'Long rates +50bp, short rates flat'",
      impact_flattening_50bp: "DECIMAL(18,2) COMMENT 'Short rates +50bp, long rates flat'",
      
      // Earnings at Risk (EaR)
      ear_1_year: "DECIMAL(18,2) COMMENT 'Earnings at risk over 1 year at 99% confidence'",
      
      // Economic Value of Equity (EVE)
      eve_current: "DECIMAL(18,2) COMMENT 'Current economic value of equity'",
      eve_shock_up_200bp: "DECIMAL(18,2) COMMENT 'EVE after +200bp shock'",
      eve_shock_down_200bp: "DECIMAL(18,2)",
      eve_sensitivity_pct: "DECIMAL(7,4) COMMENT 'EVE change % for 100bp shock'",
      
      // Hedging
      total_ir_hedge_notional: "DECIMAL(18,2) COMMENT 'Total notional of IR hedges'",
      hedge_coverage_ratio: "DECIMAL(5,2) COMMENT 'Hedged / Total exposure'",
      unhedged_exposure: "DECIMAL(18,2)",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 6: FX Risk Summary
  {
    name: 'silver.commercial_fx_risk_summary',
    description: 'Foreign exchange risk exposure summary by currency pair with VaR',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per company per currency pair per day',
    primaryKey: ['company_id', 'currency_pair', 'business_date'],
    
    transformations: [
      'Aggregate FX-denominated assets and liabilities by currency',
      'Calculate net FX exposure by currency pair',
      'Calculate value at risk (VaR) using historical simulation and parametric methods',
      'Assess hedge coverage by currency',
      'Simulate FX rate shock scenarios (+10%, -10%)',
      'Calculate FX sensitivity (delta equivalent)',
    ],
    
    dataQualityRules: [
      'Net FX exposure must equal assets - liabilities',
      'VaR must be recalculated daily',
      'Hedge ratio must be between 0 and 1',
      'Spot rate must be current (< 1 day old)',
    ],
    
    schema: {
      company_id: "STRING PRIMARY KEY",
      currency_pair: "STRING PRIMARY KEY",
      base_currency: "STRING",
      quote_currency: "STRING",
      business_date: "DATE PRIMARY KEY",
      
      // Exposure
      fx_assets: "DECIMAL(18,2) COMMENT 'Assets in base currency'",
      fx_liabilities: "DECIMAL(18,2) COMMENT 'Liabilities in base currency'",
      net_fx_exposure: "DECIMAL(18,2) COMMENT 'Assets - Liabilities'",
      usd_equivalent_exposure: "DECIMAL(18,2)",
      
      // Forecasted Exposures
      forecasted_inflows_30d: "DECIMAL(18,2)",
      forecasted_outflows_30d: "DECIMAL(18,2)",
      net_forecasted_exposure_30d: "DECIMAL(18,2)",
      
      forecasted_inflows_90d: "DECIMAL(18,2)",
      forecasted_outflows_90d: "DECIMAL(18,2)",
      net_forecasted_exposure_90d: "DECIMAL(18,2)",
      
      // Current Market Rate
      current_spot_rate: "DECIMAL(12,6)",
      spot_rate_timestamp: "TIMESTAMP",
      historical_avg_rate_30d: "DECIMAL(12,6) COMMENT '30-day moving average'",
      historical_avg_rate_90d: "DECIMAL(12,6)",
      
      // Volatility
      implied_volatility_30d: "DECIMAL(7,4) COMMENT 'Implied vol from options market'",
      historical_volatility_30d: "DECIMAL(7,4) COMMENT 'Realized historical vol'",
      
      // Hedging
      total_fx_hedge_notional: "DECIMAL(18,2) COMMENT 'Total FX hedges (forwards + options)'",
      fx_forward_notional: "DECIMAL(18,2)",
      fx_option_notional: "DECIMAL(18,2)",
      hedge_coverage_ratio: "DECIMAL(5,2) COMMENT 'Hedged / Total exposure'",
      unhedged_exposure: "DECIMAL(18,2)",
      
      // Value at Risk (VaR)
      var_1d_95pct: "DECIMAL(18,2) COMMENT '1-day VaR at 95% confidence'",
      var_1d_99pct: "DECIMAL(18,2) COMMENT '1-day VaR at 99% confidence'",
      var_10d_99pct: "DECIMAL(18,2) COMMENT '10-day VaR at 99% confidence'",
      var_method: "STRING COMMENT 'HISTORICAL_SIMULATION|PARAMETRIC|MONTE_CARLO'",
      
      // Stress Scenarios (Calculated)
      impact_fx_rate_up_10pct: "DECIMAL(18,2) COMMENT 'P&L impact if FX rate rises 10%'",
      impact_fx_rate_down_10pct: "DECIMAL(18,2) COMMENT 'P&L impact if FX rate falls 10%'",
      impact_historical_worst_day: "DECIMAL(18,2) COMMENT 'Impact of worst historical 1-day move'",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 7: Investment Portfolio Performance
  {
    name: 'silver.commercial_investment_portfolio_performance',
    description: 'Investment portfolio performance metrics with returns and benchmarking',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per company per portfolio per day',
    primaryKey: ['company_id', 'portfolio_id', 'business_date'],
    
    transformations: [
      'Aggregate securities by portfolio',
      'Calculate total market value and book value',
      'Calculate total return (capital gains + income)',
      'Calculate yield to maturity for fixed income',
      'Compare to benchmark index performance',
      'Calculate Sharpe ratio and alpha',
      'Assess portfolio concentration and diversification',
    ],
    
    dataQualityRules: [
      'Total market value must equal sum of individual security market values',
      'Total return must include realized + unrealized gains/losses + income',
      'Yield must be calculated using market value weights',
      'Benchmark comparison must use appropriate index',
    ],
    
    schema: {
      company_id: "STRING PRIMARY KEY",
      portfolio_id: "STRING PRIMARY KEY COMMENT 'Portfolio identifier (e.g., OPERATING_CASH|PENSION|ENDOWMENT)'",
      business_date: "DATE PRIMARY KEY",
      
      // Portfolio Composition
      total_securities_count: "INTEGER",
      total_book_value: "DECIMAL(18,2) COMMENT 'Amortized cost basis'",
      total_market_value: "DECIMAL(18,2) COMMENT 'Current market value'",
      total_unrealized_gain_loss: "DECIMAL(18,2) COMMENT 'Market - Book'",
      
      // Asset Allocation
      fixed_income_pct: "DECIMAL(5,2) COMMENT '% in bonds, notes, etc.'",
      equity_pct: "DECIMAL(5,2) COMMENT '% in stocks'",
      cash_equivalents_pct: "DECIMAL(5,2) COMMENT '% in money market'",
      alternative_investments_pct: "DECIMAL(5,2)",
      
      // Fixed Income Metrics
      weighted_avg_yield: "DECIMAL(7,4) COMMENT 'Weighted average yield to maturity'",
      weighted_avg_duration: "DECIMAL(6,2) COMMENT 'Portfolio duration'",
      weighted_avg_maturity_years: "DECIMAL(6,2)",
      
      // Performance (Returns)
      total_return_mtd: "DECIMAL(7,4) COMMENT 'Month-to-date total return %'",
      total_return_qtd: "DECIMAL(7,4) COMMENT 'Quarter-to-date total return %'",
      total_return_ytd: "DECIMAL(7,4) COMMENT 'Year-to-date total return %'",
      total_return_1y: "DECIMAL(7,4) COMMENT 'Trailing 1-year return %'",
      
      // Return Attribution
      capital_gains_ytd: "DECIMAL(18,2) COMMENT 'Realized + unrealized gains'",
      interest_income_ytd: "DECIMAL(18,2)",
      dividend_income_ytd: "DECIMAL(18,2)",
      total_income_ytd: "DECIMAL(18,2)",
      
      // Benchmark Comparison
      benchmark_index: "STRING COMMENT 'Bloomberg Aggregate Bond|S&P 500|Custom'",
      benchmark_return_ytd: "DECIMAL(7,4) COMMENT 'Benchmark YTD return %'",
      excess_return_ytd: "DECIMAL(7,4) COMMENT 'Portfolio return - Benchmark return'",
      tracking_error: "DECIMAL(7,4) COMMENT 'Std dev of excess returns'",
      information_ratio: "DECIMAL(7,4) COMMENT 'Excess return / Tracking error'",
      
      // Risk Metrics
      portfolio_volatility_1y: "DECIMAL(7,4) COMMENT 'Annualized standard deviation'",
      sharpe_ratio_1y: "DECIMAL(7,4) COMMENT '(Return - Risk-free rate) / Volatility'",
      sortino_ratio_1y: "DECIMAL(7,4) COMMENT 'Downside risk-adjusted return'",
      max_drawdown_1y: "DECIMAL(7,4) COMMENT 'Maximum peak-to-trough decline %'",
      
      // Concentration & Diversification
      largest_holding_pct: "DECIMAL(5,2) COMMENT '% of portfolio in largest holding'",
      top_10_holdings_pct: "DECIMAL(5,2) COMMENT '% in top 10 holdings'",
      number_of_issuers: "INTEGER COMMENT 'Unique issuers in portfolio'",
      herfindahl_index: "DECIMAL(7,4) COMMENT 'Concentration index (0-1)'",
      
      // Credit Quality (for fixed income)
      weighted_avg_credit_rating: "STRING COMMENT 'Portfolio weighted avg rating'",
      investment_grade_pct: "DECIMAL(5,2) COMMENT '% rated BBB- or higher'",
      high_yield_pct: "DECIMAL(5,2)",
      unrated_pct: "DECIMAL(5,2)",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 8: Debt Service Schedule
  {
    name: 'silver.commercial_debt_service_schedule',
    description: 'Forward-looking debt service schedule with principal and interest payments',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per debt instrument per payment date',
    primaryKey: ['debt_instrument_id', 'payment_date'],
    
    transformations: [
      'Generate future payment schedule from debt amortization',
      'Calculate principal and interest components',
      'Aggregate debt service by month/quarter/year',
      'Identify refinancing needs (upcoming maturities)',
      'Calculate debt service coverage ratio',
      'Link to interest rate hedges',
    ],
    
    dataQualityRules: [
      'Payment date must be >= current date for future payments',
      'Principal + interest must equal total payment',
      'Sum of scheduled principal must equal outstanding principal',
      'Payment dates must align with payment frequency',
    ],
    
    schema: {
      debt_instrument_id: "STRING PRIMARY KEY",
      payment_date: "DATE PRIMARY KEY",
      company_id: "STRING",
      
      // Debt Details
      debt_type: "STRING COMMENT 'TERM_LOAN|BOND|REVOLVING_CREDIT'",
      debt_description: "STRING",
      currency: "STRING",
      
      // Payment Breakdown
      scheduled_principal_payment: "DECIMAL(18,2)",
      scheduled_interest_payment: "DECIMAL(18,2)",
      total_payment: "DECIMAL(18,2) COMMENT 'Principal + Interest'",
      
      // Interest Rate
      interest_rate_type: "STRING COMMENT 'FIXED|FLOATING'",
      current_interest_rate: "DECIMAL(7,4)",
      forecasted_interest_rate: "DECIMAL(7,4) COMMENT 'Forecasted rate for floating debt'",
      
      // Outstanding Balance
      principal_balance_before_payment: "DECIMAL(18,2)",
      principal_balance_after_payment: "DECIMAL(18,2)",
      
      // Payment Status (for historical payments)
      payment_status: "STRING COMMENT 'SCHEDULED|PAID|MISSED|DEFERRED'",
      actual_payment_date: "DATE COMMENT 'Actual date paid (if different from scheduled)'",
      actual_payment_amount: "DECIMAL(18,2)",
      
      // Hedging
      hedged_flag: "BOOLEAN COMMENT 'TRUE if interest rate is hedged'",
      hedge_instrument_id: "STRING COMMENT 'FK to IR swap/cap'",
      
      // Days to Payment
      days_to_payment: "INTEGER COMMENT 'Days from today to payment date'",
      payment_period: "STRING COMMENT 'CURRENT_MONTH|NEXT_MONTH|CURRENT_QUARTER|NEXT_QUARTER'",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 9: Credit Exposure Summary
  {
    name: 'silver.commercial_credit_exposure_summary',
    description: 'Counterparty credit exposure summary with netting and collateral',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per counterparty per day',
    primaryKey: ['counterparty_id', 'business_date'],
    
    transformations: [
      'Aggregate mark-to-market exposure across all derivatives with each counterparty',
      'Apply ISDA master agreement netting',
      'Net collateral held vs posted',
      'Calculate potential future exposure (PFE)',
      'Calculate credit valuation adjustment (CVA)',
      'Assess credit limit utilization',
    ],
    
    dataQualityRules: [
      'Gross positive exposure must be >= 0',
      'Net exposure must equal gross exposure - collateral',
      'Credit limit utilization must be <= credit limit',
      'CVA must be calculated for all counterparties with positive exposure',
    ],
    
    schema: {
      counterparty_id: "STRING PRIMARY KEY",
      counterparty_name: "STRING",
      business_date: "DATE PRIMARY KEY",
      
      // Counterparty Details
      counterparty_type: "STRING COMMENT 'BANK|BROKER_DEALER|CLEARING_HOUSE|CORPORATE'",
      counterparty_country: "STRING",
      counterparty_credit_rating: "STRING COMMENT 'S&P/Moody rating'",
      
      // Gross Exposure (Before Netting)
      gross_positive_exposure: "DECIMAL(18,2) COMMENT 'Sum of positive MTM positions'",
      gross_negative_exposure: "DECIMAL(18,2) COMMENT 'Sum of negative MTM positions'",
      
      // Netting (ISDA Master Agreement)
      isda_netting_agreement_flag: "BOOLEAN",
      net_mtm_exposure: "DECIMAL(18,2) COMMENT 'Gross positive - Gross negative (if ISDA)'",
      
      // Collateral
      collateral_held: "DECIMAL(18,2) COMMENT 'Collateral we hold from counterparty'",
      collateral_posted: "DECIMAL(18,2) COMMENT 'Collateral we posted to counterparty'",
      net_collateral: "DECIMAL(18,2) COMMENT 'Held - Posted'",
      
      // Net Credit Exposure
      net_credit_exposure: "DECIMAL(18,2) COMMENT 'Net MTM - Net collateral'",
      net_credit_exposure_after_haircut: "DECIMAL(18,2) COMMENT 'After applying collateral haircuts'",
      
      // Potential Future Exposure (PFE)
      potential_future_exposure: "DECIMAL(18,2) COMMENT 'Potential exposure at 95% confidence'",
      expected_positive_exposure: "DECIMAL(18,2) COMMENT 'Average expected exposure'",
      
      // Credit Limit
      assigned_credit_limit: "DECIMAL(18,2)",
      credit_limit_utilization: "DECIMAL(18,2)",
      credit_limit_utilization_pct: "DECIMAL(5,2) COMMENT 'Utilization / Limit * 100'",
      available_credit: "DECIMAL(18,2) COMMENT 'Limit - Utilization'",
      
      // Credit Valuation Adjustment (CVA)
      cva: "DECIMAL(18,2) COMMENT 'Credit valuation adjustment for counterparty default risk'",
      cva_charge: "DECIMAL(18,2) COMMENT 'CVA P&L impact'",
      
      // Wrong-Way Risk
      wrong_way_risk_flag: "BOOLEAN COMMENT 'TRUE if exposure increases when counterparty credit quality deteriorates'",
      
      // Number of Trades
      total_trades_count: "INTEGER COMMENT 'Number of open trades with counterparty'",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 10: Cash Flow Forecast Accuracy
  {
    name: 'silver.commercial_cash_flow_forecast_accuracy',
    description: 'Analysis of cash flow forecast accuracy with variance tracking',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per forecast period',
    primaryKey: ['forecast_id', 'forecast_period_start'],
    
    transformations: [
      'Compare forecasted cash flows to actual results',
      'Calculate forecast variance (actual - forecast)',
      'Calculate forecast accuracy percentage',
      'Identify sources of variance (inflows vs outflows)',
      'Track forecast accuracy trends over time',
      'Identify systematic forecast biases',
    ],
    
    dataQualityRules: [
      'Forecast variance must equal actual - forecast',
      'Forecast accuracy must be between -100% and 100%',
      'Actuals must be populated after forecast period ends',
    ],
    
    schema: {
      forecast_id: "STRING PRIMARY KEY",
      forecast_period_start: "DATE PRIMARY KEY",
      forecast_period_end: "DATE",
      forecast_period_type: "STRING COMMENT 'DAILY|WEEKLY|MONTHLY'",
      company_id: "STRING",
      currency: "STRING",
      
      // Forecasted Values
      forecasted_total_inflows: "DECIMAL(18,2)",
      forecasted_total_outflows: "DECIMAL(18,2)",
      forecasted_net_cash_flow: "DECIMAL(18,2)",
      forecasted_closing_balance: "DECIMAL(18,2)",
      
      // Actual Values
      actual_total_inflows: "DECIMAL(18,2)",
      actual_total_outflows: "DECIMAL(18,2)",
      actual_net_cash_flow: "DECIMAL(18,2)",
      actual_closing_balance: "DECIMAL(18,2)",
      
      // Variance (Calculated)
      inflows_variance: "DECIMAL(18,2) COMMENT 'Actual - Forecast'",
      inflows_variance_pct: "DECIMAL(7,4)",
      outflows_variance: "DECIMAL(18,2)",
      outflows_variance_pct: "DECIMAL(7,4)",
      net_cash_flow_variance: "DECIMAL(18,2)",
      closing_balance_variance: "DECIMAL(18,2)",
      
      // Accuracy Metrics (Calculated)
      forecast_accuracy_pct: "DECIMAL(5,2) COMMENT '100% - |Variance %|'",
      mean_absolute_percentage_error: "DECIMAL(5,2) COMMENT 'MAPE'",
      
      // Variance Attribution
      variance_due_to_customer_receipts: "DECIMAL(18,2)",
      variance_due_to_vendor_payments: "DECIMAL(18,2)",
      variance_due_to_payroll: "DECIMAL(18,2)",
      variance_due_to_debt_service: "DECIMAL(18,2)",
      variance_due_to_other: "DECIMAL(18,2)",
      
      // Forecast Quality
      forecast_confidence_level: "STRING COMMENT 'HIGH|MEDIUM|LOW'",
      forecast_bias: "STRING COMMENT 'OPTIMISTIC|PESSIMISTIC|NEUTRAL (based on pattern)'",
      
      // Audit
      forecast_created_date: "DATE",
      forecast_created_by: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 11: Treasury Performance Metrics
  {
    name: 'silver.commercial_treasury_performance_metrics',
    description: 'Treasury department performance metrics and KPIs',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per company per month',
    primaryKey: ['company_id', 'month_end_date'],
    
    transformations: [
      'Aggregate treasury trading revenues',
      'Calculate cost of funds',
      'Calculate return on investment portfolio',
      'Calculate treasury operating costs',
      'Calculate liquidity cost/benefit',
      'Calculate hedge effectiveness metrics',
    ],
    
    dataQualityRules: [
      'Total treasury revenue must equal sum of revenue sources',
      'Cost of funds must be >= 0',
      'ROI must be calculated using time-weighted returns',
    ],
    
    schema: {
      company_id: "STRING PRIMARY KEY",
      month_end_date: "DATE PRIMARY KEY COMMENT 'Last day of month'",
      
      // Treasury Revenue
      fx_trading_revenue: "DECIMAL(18,2) COMMENT 'Revenue from FX spread'",
      interest_rate_hedging_revenue: "DECIMAL(18,2) COMMENT 'Fees from hedging services'",
      investment_income: "DECIMAL(18,2) COMMENT 'Interest + dividends'",
      realized_gains_on_investments: "DECIMAL(18,2)",
      other_treasury_revenue: "DECIMAL(18,2)",
      total_treasury_revenue: "DECIMAL(18,2)",
      
      // Treasury Costs
      interest_expense_on_debt: "DECIMAL(18,2)",
      hedging_costs: "DECIMAL(18,2) COMMENT 'Premiums paid for options, caps'",
      banking_fees: "DECIMAL(18,2) COMMENT 'Bank service fees'",
      treasury_operating_costs: "DECIMAL(18,2) COMMENT 'Salaries, systems, etc.'",
      total_treasury_costs: "DECIMAL(18,2)",
      
      // Net Treasury Performance
      net_treasury_contribution: "DECIMAL(18,2) COMMENT 'Revenue - Costs'",
      
      // Cost of Funds
      weighted_avg_cost_of_debt: "DECIMAL(7,4) COMMENT 'Weighted average interest rate on debt'",
      all_in_cost_of_funds: "DECIMAL(7,4) COMMENT 'Including fees and hedging costs'",
      
      // Investment Returns
      investment_portfolio_return_mtd: "DECIMAL(7,4) COMMENT 'Month total return %'",
      investment_portfolio_return_ytd: "DECIMAL(7,4)",
      benchmark_return_ytd: "DECIMAL(7,4)",
      excess_return_vs_benchmark: "DECIMAL(7,4)",
      
      // Liquidity Management
      average_cash_balance: "DECIMAL(18,2) COMMENT 'Average daily cash balance'",
      target_cash_balance: "DECIMAL(18,2)",
      excess_cash_invested: "DECIMAL(18,2) COMMENT 'Average excess cash invested'",
      return_on_excess_cash: "DECIMAL(7,4) COMMENT 'Yield on invested excess cash'",
      opportunity_cost_of_idle_cash: "DECIMAL(18,2) COMMENT 'Lost income from uninvested cash'",
      
      // Risk Management
      total_hedged_exposure: "DECIMAL(18,2)",
      total_unhedged_exposure: "DECIMAL(18,2)",
      overall_hedge_ratio: "DECIMAL(5,2) COMMENT 'Hedged / Total exposure'",
      number_of_hedge_ineffectiveness_instances: "INTEGER",
      total_ineffectiveness_amount: "DECIMAL(18,2)",
      
      // Operational Efficiency
      number_of_fx_trades: "INTEGER",
      average_fx_trade_size: "DECIMAL(18,2)",
      fx_revenue_per_trade: "DECIMAL(10,2)",
      treasury_staff_count: "INTEGER",
      revenue_per_treasury_employee: "DECIMAL(18,2)",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 12: Hedge Effectiveness Summary
  {
    name: 'silver.commercial_hedge_effectiveness_summary',
    description: 'Summary of hedge effectiveness testing results by hedge relationship',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per hedge relationship per quarter',
    primaryKey: ['hedge_relationship_id', 'test_quarter_end_date'],
    
    transformations: [
      'Aggregate hedge effectiveness test results',
      'Calculate cumulative effectiveness ratios',
      'Identify ineffective hedge relationships',
      'Calculate ineffective portions for P&L recognition',
      'Track hedge discontinuations',
      'Assess compliance with ASC 815 / IFRS 9',
    ],
    
    dataQualityRules: [
      'Effectiveness ratio must be between 0 and 2 (80%-125% = highly effective)',
      'Ineffective portion must be calculated if ratio < 0.80 or > 1.25',
      'Testing must be performed at least quarterly for cash flow hedges',
      'Hedge designation must be CASH_FLOW_HEDGE|FAIR_VALUE_HEDGE|NET_INVESTMENT_HEDGE',
    ],
    
    schema: {
      hedge_relationship_id: "STRING PRIMARY KEY",
      test_quarter_end_date: "DATE PRIMARY KEY",
      company_id: "STRING",
      
      // Hedge Details
      hedge_instrument_id: "STRING",
      hedge_instrument_type: "STRING COMMENT 'SWAP|FORWARD|OPTION|CAP'",
      hedged_item_id: "STRING",
      hedged_item_description: "STRING",
      hedge_designation: "STRING",
      hedge_inception_date: "DATE",
      
      // Hedge Effectiveness Test
      test_date: "DATE",
      test_method: "STRING COMMENT 'DOLLAR_OFFSET|REGRESSION_ANALYSIS|CRITICAL_TERMS_MATCH'",
      test_result: "STRING COMMENT 'HIGHLY_EFFECTIVE|INEFFECTIVE'",
      effectiveness_ratio: "DECIMAL(7,4) COMMENT '0.80 to 1.25 = highly effective'",
      
      // Change in Value (Quarter)
      change_in_hedge_instrument_value_qtd: "DECIMAL(18,2)",
      change_in_hedged_item_value_qtd: "DECIMAL(18,2)",
      ineffective_portion_qtd: "DECIMAL(18,2) COMMENT 'Amount to recognize in P&L'",
      
      // Cumulative Performance (Inception to Date)
      cumulative_gain_loss_hedge_instrument: "DECIMAL(18,2)",
      cumulative_gain_loss_hedged_item: "DECIMAL(18,2)",
      cumulative_ineffectiveness: "DECIMAL(18,2)",
      
      // Accounting Treatment
      effective_portion_in_oci: "DECIMAL(18,2) COMMENT 'Amount in Other Comprehensive Income'",
      amount_reclassified_from_oci_to_earnings: "DECIMAL(18,2) COMMENT 'For cash flow hedges'",
      
      // Discontinuation
      hedge_discontinued_flag: "BOOLEAN",
      discontinuation_date: "DATE",
      discontinuation_reason: "STRING COMMENT 'INEFFECTIVE|HEDGED_ITEM_SOLD|VOLUNTARY'",
      oci_balance_at_discontinuation: "DECIMAL(18,2)",
      oci_reclassification_approach: "STRING COMMENT 'IMMEDIATE|AMORTIZED'",
      
      // Regression Analysis (if applicable)
      r_squared: "DECIMAL(5,4) COMMENT 'R-squared from regression (> 0.80 = good fit)'",
      slope: "DECIMAL(7,4) COMMENT 'Regression slope (near 1.0 expected)'",
      
      // Audit
      tested_by_user_id: "STRING",
      reviewed_by_user_id: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 13: Nostro Reconciliation Summary
  {
    name: 'silver.commercial_nostro_reconciliation_summary',
    description: 'Nostro account reconciliation summary with break analysis',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per nostro account per day',
    primaryKey: ['nostro_account_id', 'business_date'],
    
    transformations: [
      'Compare internal ledger balance to bank statement balance',
      'Identify and categorize reconciliation breaks',
      'Age outstanding items',
      'Calculate reconciliation coverage ratio',
      'Identify systematic reconciliation issues',
    ],
    
    dataQualityRules: [
      'Reconciliation difference must equal ledger - statement',
      'Outstanding items must explain difference',
      'Reconciled flag should be TRUE if difference = 0 or explained',
    ],
    
    schema: {
      nostro_account_id: "STRING PRIMARY KEY",
      business_date: "DATE PRIMARY KEY",
      currency: "STRING",
      correspondent_bank_name: "STRING",
      
      // Balances
      internal_ledger_balance: "DECIMAL(18,2) COMMENT 'Balance per our books'",
      bank_statement_balance: "DECIMAL(18,2) COMMENT 'Balance per correspondent bank'",
      reconciliation_difference: "DECIMAL(18,2) COMMENT 'Ledger - Statement'",
      
      // Reconciliation Status
      reconciled_flag: "BOOLEAN COMMENT 'TRUE if fully reconciled'",
      auto_reconciled_flag: "BOOLEAN COMMENT 'TRUE if auto-matched'",
      manual_review_required_flag: "BOOLEAN",
      
      // Outstanding Items
      outstanding_items_count: "INTEGER",
      outstanding_debit_items_count: "INTEGER",
      outstanding_credit_items_count: "INTEGER",
      outstanding_debit_amount: "DECIMAL(18,2)",
      outstanding_credit_amount: "DECIMAL(18,2)",
      net_outstanding_amount: "DECIMAL(18,2)",
      
      // Aging of Outstanding Items
      outstanding_0_to_1_days: "DECIMAL(18,2)",
      outstanding_2_to_5_days: "DECIMAL(18,2)",
      outstanding_6_to_10_days: "DECIMAL(18,2)",
      outstanding_over_10_days: "DECIMAL(18,2) COMMENT 'Require investigation'",
      
      // Break Categories
      timing_differences: "DECIMAL(18,2) COMMENT 'In-transit items'",
      bank_errors: "DECIMAL(18,2) COMMENT 'Errors made by correspondent bank'",
      internal_errors: "DECIMAL(18,2) COMMENT 'Errors in our ledger'",
      unidentified_items: "DECIMAL(18,2) COMMENT 'Items under investigation'",
      
      // Reconciliation Quality
      reconciliation_rate_pct: "DECIMAL(5,2) COMMENT '(Matched items / Total items) * 100'",
      average_days_to_clear: "DECIMAL(6,2) COMMENT 'Average days for items to clear'",
      
      // Exceptions
      exception_items_count: "INTEGER COMMENT 'Items requiring resolution'",
      exception_items_amount: "DECIMAL(18,2)",
      
      // Audit
      reconciled_by_user_id: "STRING",
      reconciliation_timestamp: "TIMESTAMP",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },

  // Table 14: Commodity Hedge Performance
  {
    name: 'silver.commercial_commodity_hedge_performance',
    description: 'Commodity hedge performance tracking with effectiveness and MTM',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per commodity hedge per day',
    primaryKey: ['commodity_hedge_id', 'business_date'],
    
    transformations: [
      'Enrich with current commodity market prices',
      'Calculate mark-to-market valuations',
      'Link to forecasted production/consumption volumes',
      'Calculate hedge effectiveness',
      'Compare locked-in price to current market price',
    ],
    
    dataQualityRules: [
      'Current market price must be updated daily',
      'MTM must be recalculated daily',
      'Hedge effectiveness must be tested quarterly',
      'Locked-in price must equal strike/contract price',
    ],
    
    schema: {
      commodity_hedge_id: "STRING PRIMARY KEY",
      business_date: "DATE PRIMARY KEY",
      company_id: "STRING",
      
      // Commodity Details
      commodity_type: "STRING COMMENT 'OIL|NATURAL_GAS|GOLD|COPPER|WHEAT|CORN'",
      commodity_subtype: "STRING",
      
      // Hedge Details
      instrument_type: "STRING COMMENT 'FUTURES|SWAP|OPTION|COLLAR'",
      trade_date: "DATE",
      maturity_date: "DATE",
      days_to_maturity: "INTEGER",
      
      // Quantity & Price
      hedged_quantity: "DECIMAL(18,4)",
      unit_of_measure: "STRING",
      locked_in_price: "DECIMAL(12,4) COMMENT 'Hedged price per unit'",
      
      // Current Market Price (Enriched)
      current_market_price: "DECIMAL(12,4)",
      market_price_date: "DATE",
      market_price_source: "STRING COMMENT 'NYMEX|ICE|Bloomberg'",
      
      // Mark-to-Market
      current_mtm_value: "DECIMAL(18,2)",
      unrealized_pnl: "DECIMAL(18,2) COMMENT '(Market price - Locked price) * Quantity'",
      unrealized_pnl_per_unit: "DECIMAL(12,4)",
      
      // Price Comparison
      price_advantage_disadvantage: "DECIMAL(12,4) COMMENT 'Locked - Market (positive = favorable)'",
      price_advantage_pct: "DECIMAL(7,4) COMMENT '% better/worse than market'",
      
      // Hedged Production/Consumption
      forecasted_production_volume: "DECIMAL(18,4) COMMENT 'Expected production being hedged'",
      hedge_coverage_pct: "DECIMAL(5,2) COMMENT '% of production hedged'",
      
      // Hedge Effectiveness
      hedge_designation: "STRING",
      hedge_effectiveness_test_result: "STRING COMMENT 'PASS|FAIL'",
      
      // Contract Status
      contract_status: "STRING COMMENT 'ACTIVE|MATURED|TERMINATED'",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
  },
];

export const treasuryCommercialSilverLayer = {
  name: 'Treasury-Commercial Silver Layer',
  totalTables: treasuryCommercialSilverTables.length,
  tables: treasuryCommercialSilverTables,
};
