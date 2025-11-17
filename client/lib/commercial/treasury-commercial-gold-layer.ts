/**
 * TREASURY-COMMERCIAL GOLD LAYER
 * Dimensional model for treasury and financial markets analytics
 * 
 * Domain: Treasury-Commercial
 * Area: Commercial Banking
 * Layer: GOLD (Dimensional/Star Schema)
 * Dimensions: 10
 * Facts: 7
 * 
 * Conformed Dimensions:
 * - dim_date (shared across all banking areas)
 * - dim_commercial_customer (shared with other commercial domains)
 * - dim_currency (shared dimension for multi-currency)
 * 
 * Treasury-Specific Dimensions:
 * - dim_derivative_instrument
 * - dim_investment_security
 * - dim_debt_instrument
 * - dim_counterparty
 * - dim_hedge_relationship
 * - dim_commodity
 * - dim_interest_rate_index
 * 
 * Facts:
 * - fact_fx_transactions (Transaction-grain)
 * - fact_derivative_positions (Daily snapshot)
 * - fact_investment_portfolio (Daily snapshot)
 * - fact_liquidity_position (Daily snapshot)
 * - fact_debt_service (Transaction-grain)
 * - fact_hedge_effectiveness (Periodic snapshot - quarterly)
 * - fact_treasury_pnl (Daily snapshot)
 */

export const treasuryCommercialGoldDimensions = [
  // Dimension 1: Derivative Instrument
  {
    name: 'gold.dim_derivative_instrument',
    description: 'Type 2 slowly changing dimension for derivative instruments',
    dimensionType: 'SCD_TYPE_2',
    grain: 'One row per derivative instrument version',
    primaryKey: ['derivative_instrument_key'],
    
    schema: {
      derivative_instrument_key: "INTEGER PRIMARY KEY COMMENT 'Surrogate key'",
      
      // Natural Key
      derivative_instrument_id: "STRING COMMENT 'Business instrument ID'",
      
      // Instrument Classification
      derivative_type: "STRING COMMENT 'FX_SPOT|FX_FORWARD|FX_OPTION|IR_SWAP|IR_CAP|IR_FLOOR|COMMODITY_FUTURE|COMMODITY_SWAP'",
      derivative_category: "STRING COMMENT 'FX|INTEREST_RATE|COMMODITY|EQUITY|CREDIT'",
      asset_class: "STRING COMMENT 'CURRENCY|RATES|COMMODITIES|EQUITIES'",
      
      // Product Details
      product_name: "STRING COMMENT 'Plain Vanilla Swap|Barrier Option|Exotic Option'",
      product_complexity: "STRING COMMENT 'VANILLA|COMPLEX|EXOTIC'",
      deliverable_flag: "BOOLEAN COMMENT 'Physical delivery vs cash settlement'",
      
      // Contract Terms
      notional_amount: "DECIMAL(18,2)",
      notional_currency: "STRING",
      
      // FX-Specific
      currency_pair: "STRING COMMENT 'EUR/USD|GBP/JPY|NULL if not FX'",
      base_currency: "STRING",
      quote_currency: "STRING",
      
      // IR-Specific
      fixed_rate: "DECIMAL(7,4) COMMENT 'NULL if not fixed leg'",
      floating_rate_index: "STRING COMMENT 'SOFR|LIBOR|EURIBOR|NULL'",
      payment_frequency: "STRING COMMENT 'MONTHLY|QUARTERLY|SEMI_ANNUAL'",
      
      // Option-Specific
      option_type: "STRING COMMENT 'CALL|PUT|NULL'",
      option_style: "STRING COMMENT 'EUROPEAN|AMERICAN|BERMUDIAN|NULL'",
      strike_price_rate: "DECIMAL(12,6)",
      barrier_type: "STRING COMMENT 'KNOCK_IN|KNOCK_OUT|NULL'",
      
      // Counterparty
      counterparty_id: "STRING COMMENT 'FK to dim_counterparty'",
      
      // Dates
      trade_date: "DATE",
      effective_date: "DATE",
      maturity_date: "DATE",
      tenor_description: "STRING COMMENT '1M|3M|6M|1Y|5Y|10Y'",
      
      // Hedge Designation
      hedge_flag: "BOOLEAN COMMENT 'TRUE if used for hedging'",
      hedge_designation: "STRING COMMENT 'CASH_FLOW_HEDGE|FAIR_VALUE_HEDGE|NULL'",
      
      // Regulatory
      cleared_flag: "BOOLEAN COMMENT 'Centrally cleared'",
      clearing_house: "STRING COMMENT 'CME|LCH|ICE|NULL'",
      dodd_frank_reportable: "BOOLEAN",
      emir_reportable: "BOOLEAN",
      
      // Active Status
      active_flag: "BOOLEAN",
      matured_flag: "BOOLEAN",
      
      // SCD Type 2
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP",
      is_current: "BOOLEAN NOT NULL DEFAULT TRUE",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_derivative_id ON gold.dim_derivative_instrument(derivative_instrument_id, is_current)",
      "CREATE INDEX idx_dim_derivative_type ON gold.dim_derivative_instrument(derivative_type)",
    ],
  },

  // Dimension 2: Investment Security
  {
    name: 'gold.dim_investment_security',
    description: 'Type 2 dimension for investment securities (bonds, stocks, funds)',
    dimensionType: 'SCD_TYPE_2',
    grain: 'One row per security version',
    primaryKey: ['investment_security_key'],
    
    schema: {
      investment_security_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      security_id: "STRING COMMENT 'CUSIP|ISIN|Ticker'",
      
      // Security Identifiers
      cusip: "STRING COMMENT '9-character CUSIP'",
      isin: "STRING COMMENT '12-character ISIN'",
      ticker: "STRING",
      
      // Security Classification
      security_type: "STRING COMMENT 'TREASURY_BOND|CORPORATE_BOND|MUNICIPAL_BOND|COMMERCIAL_PAPER|CD|MONEY_MARKET_FUND|EQUITY'",
      security_subtype: "STRING COMMENT 'GOVERNMENT|AGENCY|INVESTMENT_GRADE|HIGH_YIELD'",
      asset_class: "STRING COMMENT 'FIXED_INCOME|EQUITY|CASH_EQUIVALENT|ALTERNATIVE'",
      
      // Issuer Information
      issuer_name: "STRING",
      issuer_country: "STRING COMMENT 'ISO 3166'",
      issuer_sector: "STRING COMMENT 'GOVERNMENT|FINANCIAL|INDUSTRIAL|TECHNOLOGY|UTILITIES'",
      issuer_credit_rating: "STRING COMMENT 'AAA|AA|A|BBB|BB|B|CCC|D'",
      issuer_rating_agency: "STRING COMMENT 'SP|MOODY|FITCH'",
      
      // Security Details
      security_description: "STRING",
      currency: "STRING",
      face_value: "DECIMAL(18,2)",
      
      // Fixed Income Details
      coupon_rate: "DECIMAL(7,4)",
      coupon_frequency: "STRING COMMENT 'ANNUAL|SEMI_ANNUAL|QUARTERLY|ZERO_COUPON'",
      issue_date: "DATE",
      maturity_date: "DATE",
      callable_flag: "BOOLEAN",
      call_date: "DATE",
      call_price: "DECIMAL(18,2)",
      
      // Maturity Bucket
      maturity_bucket: "STRING COMMENT '0-1Y|1-3Y|3-5Y|5-10Y|10Y+'",
      
      // Credit Quality
      investment_grade_flag: "BOOLEAN COMMENT 'TRUE if rated BBB- or higher'",
      credit_quality_tier: "STRING COMMENT 'HIGH_GRADE|UPPER_MEDIUM|LOWER_MEDIUM|SPECULATIVE|DEFAULT'",
      
      // Active Status
      active_flag: "BOOLEAN",
      matured_flag: "BOOLEAN",
      
      // SCD Type 2
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP",
      is_current: "BOOLEAN NOT NULL DEFAULT TRUE",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_security_id ON gold.dim_investment_security(security_id, is_current)",
      "CREATE INDEX idx_dim_security_type ON gold.dim_investment_security(security_type)",
    ],
  },

  // Dimension 3: Debt Instrument
  {
    name: 'gold.dim_debt_instrument',
    description: 'Type 2 dimension for debt instruments issued by company',
    dimensionType: 'SCD_TYPE_2',
    grain: 'One row per debt instrument version',
    primaryKey: ['debt_instrument_key'],
    
    schema: {
      debt_instrument_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      debt_instrument_id: "STRING COMMENT 'Business debt ID'",
      
      // Debt Classification
      debt_type: "STRING COMMENT 'TERM_LOAN|REVOLVING_CREDIT|BOND|NOTE|COMMERCIAL_PAPER|LINE_OF_CREDIT'",
      debt_subtype: "STRING COMMENT 'SENIOR_SECURED|SENIOR_UNSECURED|SUBORDINATED|CONVERTIBLE'",
      seniority: "STRING COMMENT 'SENIOR|SUBORDINATED|JUNIOR'",
      secured_flag: "BOOLEAN",
      
      // Identifiers
      isin: "STRING",
      cusip: "STRING",
      loan_identifier: "STRING",
      
      // Debt Terms
      original_principal: "DECIMAL(18,2)",
      currency: "STRING",
      issue_date: "DATE",
      maturity_date: "DATE",
      tenor_years: "DECIMAL(5,2)",
      
      // Interest Rate
      interest_rate_type: "STRING COMMENT 'FIXED|FLOATING|ZERO_COUPON'",
      fixed_rate: "DECIMAL(7,4)",
      floating_rate_index: "STRING COMMENT 'SOFR|LIBOR|Prime'",
      floating_rate_spread: "DECIMAL(7,4)",
      payment_frequency: "STRING COMMENT 'MONTHLY|QUARTERLY|SEMI_ANNUAL|ANNUAL|AT_MATURITY'",
      
      // Amortization
      amortizing_flag: "BOOLEAN",
      
      // Prepayment
      prepayment_allowed_flag: "BOOLEAN",
      prepayment_penalty_pct: "DECIMAL(5,2)",
      
      // Covenants
      covenant_count: "INTEGER COMMENT 'Number of financial covenants'",
      covenant_types: "STRING COMMENT 'DEBT_TO_EBITDA|INTEREST_COVERAGE|MIN_LIQUIDITY'",
      
      // Collateral
      collateral_description: "STRING",
      
      // Credit Rating
      sp_rating: "STRING",
      moody_rating: "STRING",
      
      // Guarantees
      guarantee_flag: "BOOLEAN",
      guarantor_name: "STRING",
      
      // Hedging
      hedged_flag: "BOOLEAN",
      
      // Maturity Bucket
      maturity_bucket: "STRING COMMENT '0-1Y|1-3Y|3-5Y|5-10Y|10Y+'",
      
      // Lender
      lender_name: "STRING",
      syndicated_flag: "BOOLEAN",
      
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
      "CREATE INDEX idx_dim_debt_id ON gold.dim_debt_instrument(debt_instrument_id, is_current)",
      "CREATE INDEX idx_dim_debt_type ON gold.dim_debt_instrument(debt_type)",
    ],
  },

  // Dimension 4: Counterparty
  {
    name: 'gold.dim_counterparty',
    description: 'Type 2 dimension for treasury counterparties (banks, dealers)',
    dimensionType: 'SCD_TYPE_2',
    grain: 'One row per counterparty version',
    primaryKey: ['counterparty_key'],
    
    schema: {
      counterparty_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      counterparty_id: "STRING COMMENT 'Business counterparty ID'",
      
      // Counterparty Information
      counterparty_name: "STRING",
      counterparty_type: "STRING COMMENT 'BANK|BROKER_DEALER|CLEARING_HOUSE|CORPORATE|INVESTMENT_FUND'",
      counterparty_category: "STRING COMMENT 'FINANCIAL_INSTITUTION|NON_FINANCIAL|GOVERNMENT'",
      
      // Identifiers
      lei_code: "STRING COMMENT 'Legal Entity Identifier (20 chars)'",
      swift_bic: "STRING COMMENT '8 or 11-character SWIFT BIC'",
      
      // Location
      country: "STRING COMMENT 'ISO 3166 country code'",
      country_name: "STRING",
      region: "STRING COMMENT 'NORTH_AMERICA|EUROPE|ASIA_PACIFIC|LATIN_AMERICA|MIDDLE_EAST_AFRICA'",
      
      // Credit Rating
      sp_rating: "STRING COMMENT 'S&P long-term issuer rating'",
      moody_rating: "STRING COMMENT 'Moody long-term issuer rating'",
      fitch_rating: "STRING",
      internal_credit_rating: "STRING COMMENT 'Internal credit assessment'",
      investment_grade_flag: "BOOLEAN COMMENT 'TRUE if rated BBB- or higher'",
      
      // Credit Limit
      assigned_credit_limit: "DECIMAL(18,2)",
      credit_limit_currency: "STRING DEFAULT 'USD'",
      
      // Relationship
      relationship_tier: "STRING COMMENT 'PRIMARY|SECONDARY|TERTIARY'",
      relationship_start_date: "DATE",
      primary_relationship_manager: "STRING",
      
      // Agreements
      isda_master_agreement_flag: "BOOLEAN",
      isda_agreement_date: "DATE",
      csa_in_place_flag: "BOOLEAN COMMENT 'Credit Support Annex (collateral agreement)'",
      csa_threshold: "DECIMAL(18,2)",
      
      // Regulatory
      systemically_important_flag: "BOOLEAN COMMENT 'SIFI designation'",
      
      // Active Status
      active_flag: "BOOLEAN",
      relationship_end_date: "DATE",
      
      // SCD Type 2
      effective_start_date: "TIMESTAMP NOT NULL",
      effective_end_date: "TIMESTAMP",
      is_current: "BOOLEAN NOT NULL DEFAULT TRUE",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_counterparty_id ON gold.dim_counterparty(counterparty_id, is_current)",
      "CREATE INDEX idx_dim_counterparty_name ON gold.dim_counterparty(counterparty_name)",
    ],
  },

  // Dimension 5: Currency
  {
    name: 'gold.dim_currency',
    description: 'Type 1 conformed dimension for currencies',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per currency',
    primaryKey: ['currency_key'],
    
    schema: {
      currency_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      currency_code: "STRING UNIQUE COMMENT 'ISO 4217 3-letter code (USD, EUR, GBP)'",
      
      // Currency Details
      currency_name: "STRING COMMENT 'United States Dollar|Euro|British Pound'",
      currency_symbol: "STRING COMMENT '$|€|£'",
      currency_numeric_code: "STRING COMMENT 'ISO 4217 numeric code (840|978|826)'",
      
      // Country
      country_code: "STRING COMMENT 'Primary country (ISO 3166)'",
      country_name: "STRING",
      region: "STRING COMMENT 'NORTH_AMERICA|EUROPE|ASIA_PACIFIC|LATIN_AMERICA|MIDDLE_EAST_AFRICA'",
      
      // Currency Characteristics
      decimal_places: "INTEGER DEFAULT 2 COMMENT 'Number of decimal places (JPY=0, USD=2)'",
      major_unit_name: "STRING COMMENT 'Dollar|Euro|Pound'",
      minor_unit_name: "STRING COMMENT 'Cent|Cent|Pence'",
      
      // Classification
      currency_type: "STRING COMMENT 'MAJOR|MINOR|EXOTIC|CRYPTOCURRENCY'",
      reserve_currency_flag: "BOOLEAN COMMENT 'TRUE for USD, EUR, GBP, JPY, CHF'",
      freely_convertible_flag: "BOOLEAN COMMENT 'TRUE if freely convertible'",
      
      // Forex Market
      fx_market_liquidity: "STRING COMMENT 'HIGH|MEDIUM|LOW'",
      typical_daily_volume_usd: "DECIMAL(18,2) COMMENT 'Average daily FX volume in USD'",
      
      // Central Bank
      central_bank_name: "STRING COMMENT 'Federal Reserve|ECB|Bank of England'",
      benchmark_interest_rate_name: "STRING COMMENT 'Fed Funds|ECB Deposit Rate|BoE Base Rate'",
      
      // Active Status
      active_flag: "BOOLEAN",
      obsolete_flag: "BOOLEAN COMMENT 'TRUE for obsolete currencies (e.g., legacy currencies before Euro)'",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_currency_code ON gold.dim_currency(currency_code)",
    ],
  },

  // Dimension 6: Hedge Relationship
  {
    name: 'gold.dim_hedge_relationship',
    description: 'Type 2 dimension for hedge accounting relationships',
    dimensionType: 'SCD_TYPE_2',
    grain: 'One row per hedge relationship version',
    primaryKey: ['hedge_relationship_key'],
    
    schema: {
      hedge_relationship_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      hedge_relationship_id: "STRING COMMENT 'Business hedge relationship ID'",
      
      // Hedge Classification
      hedge_designation: "STRING COMMENT 'CASH_FLOW_HEDGE|FAIR_VALUE_HEDGE|NET_INVESTMENT_HEDGE'",
      hedge_category: "STRING COMMENT 'INTEREST_RATE|FX|COMMODITY|EQUITY'",
      
      // Hedge Instrument
      hedge_instrument_id: "STRING COMMENT 'FK to derivative instrument'",
      hedge_instrument_type: "STRING COMMENT 'SWAP|FORWARD|OPTION|CAP|FLOOR'",
      hedge_instrument_notional: "DECIMAL(18,2)",
      
      // Hedged Item
      hedged_item_id: "STRING COMMENT 'ID of hedged asset/liability/forecast'",
      hedged_item_type: "STRING COMMENT 'DEBT|ASSET|FORECASTED_TRANSACTION|NET_INVESTMENT'",
      hedged_item_description: "STRING COMMENT 'Floating rate debt|Forecasted EUR revenue|Net investment in subsidiary'",
      
      // Hedge Inception
      hedge_inception_date: "DATE COMMENT 'Date hedge relationship established'",
      
      // Accounting Standard
      accounting_standard: "STRING COMMENT 'ASC_815|IFRS_9|IAS_39'",
      
      // Effectiveness Testing
      test_method: "STRING COMMENT 'DOLLAR_OFFSET|REGRESSION_ANALYSIS|CRITICAL_TERMS_MATCH'",
      test_frequency: "STRING COMMENT 'QUARTERLY|MONTHLY|INCEPTION_AND_ONGOING'",
      qualitative_assessment_allowed: "BOOLEAN COMMENT 'TRUE if qualitative assessment permitted'",
      
      // Hedged Risk
      hedged_risk: "STRING COMMENT 'INTEREST_RATE_RISK|FX_RISK|COMMODITY_PRICE_RISK|CREDIT_RISK'",
      
      // Hedge Ratio
      hedge_ratio: "DECIMAL(7,4) COMMENT 'Hedge notional / Hedged exposure'",
      
      // Discontinuation
      discontinued_flag: "BOOLEAN",
      discontinuation_date: "DATE",
      discontinuation_reason: "STRING COMMENT 'INEFFECTIVE|HEDGED_ITEM_SOLD|MATURITY|VOLUNTARY'",
      
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
      "CREATE INDEX idx_dim_hedge_rel_id ON gold.dim_hedge_relationship(hedge_relationship_id, is_current)",
      "CREATE INDEX idx_dim_hedge_designation ON gold.dim_hedge_relationship(hedge_designation)",
    ],
  },

  // Dimension 7: Commodity
  {
    name: 'gold.dim_commodity',
    description: 'Type 1 dimension for commodity types',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per commodity',
    primaryKey: ['commodity_key'],
    
    schema: {
      commodity_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      commodity_code: "STRING UNIQUE COMMENT 'WTI|BRENT|NATGAS|GOLD|SILVER|COPPER|CORN|WHEAT'",
      
      // Commodity Details
      commodity_name: "STRING COMMENT 'West Texas Intermediate Crude|Brent Crude|Natural Gas|Gold|Silver'",
      commodity_type: "STRING COMMENT 'ENERGY|PRECIOUS_METAL|BASE_METAL|AGRICULTURE|LIVESTOCK'",
      commodity_subtype: "STRING COMMENT 'CRUDE_OIL|NATURAL_GAS|GOLD|GRAIN|SOFT_COMMODITY'",
      
      // Unit of Measure
      standard_unit: "STRING COMMENT 'BARRELS|MMBtu|TROY_OUNCES|BUSHELS|POUNDS'",
      contract_size: "DECIMAL(18,4) COMMENT 'Standard futures contract size'",
      
      // Exchange
      primary_exchange: "STRING COMMENT 'NYMEX|ICE|COMEX|CBOT|CME'",
      exchange_ticker: "STRING COMMENT 'CL (WTI)|BZ (Brent)|GC (Gold)'",
      
      // Trading Characteristics
      trading_hours: "STRING COMMENT 'Exchange trading hours'",
      settlement_type: "STRING COMMENT 'PHYSICAL_DELIVERY|CASH_SETTLEMENT'",
      
      // Volatility
      typical_volatility_range: "STRING COMMENT 'LOW|MEDIUM|HIGH'",
      
      // Active Status
      active_flag: "BOOLEAN",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_commodity_code ON gold.dim_commodity(commodity_code)",
    ],
  },

  // Dimension 8: Interest Rate Index
  {
    name: 'gold.dim_interest_rate_index',
    description: 'Type 1 dimension for interest rate benchmarks',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per interest rate index',
    primaryKey: ['interest_rate_index_key'],
    
    schema: {
      interest_rate_index_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      index_code: "STRING UNIQUE COMMENT 'SOFR|LIBOR_USD_3M|EURIBOR_3M|Fed_Funds|Prime'",
      
      // Index Details
      index_name: "STRING COMMENT 'Secured Overnight Financing Rate|3-Month USD LIBOR|3-Month EURIBOR'",
      index_category: "STRING COMMENT 'OVERNIGHT|TERM|ADMINISTERED'",
      
      // Currency & Tenor
      currency: "STRING COMMENT 'USD|EUR|GBP|JPY'",
      tenor: "STRING COMMENT 'OVERNIGHT|1M|3M|6M|12M|NULL (for overnight rates)'",
      
      // Administrator
      index_administrator: "STRING COMMENT 'Federal Reserve|ICE|EMMI|Prime Rate Committee'",
      
      // Calculation Method
      calculation_methodology: "STRING COMMENT 'TRANSACTION_BASED|SUBMISSION_BASED|ADMINISTERED'",
      publication_time: "TIME COMMENT 'Time rate is published daily'",
      
      // Rate Type
      rate_type: "STRING COMMENT 'RISK_FREE|UNSECURED|SECURED|PRIME'",
      
      // Benchmark Status
      benchmark_regulation_compliant: "BOOLEAN COMMENT 'Compliant with IOSCO/EU Benchmark Regulation'",
      
      // Transition (LIBOR Replacement)
      libor_replacement_flag: "BOOLEAN COMMENT 'TRUE for SOFR, SONIA, etc.'",
      replaced_index_code: "STRING COMMENT 'LIBOR_USD_3M if this is SOFR (replacement)'",
      
      // Active Status
      active_flag: "BOOLEAN",
      discontinuation_date: "DATE COMMENT 'Date index was discontinued (e.g., LIBOR)'",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_rate_index_code ON gold.dim_interest_rate_index(index_code)",
    ],
  },

  // Dimension 9: Treasury Transaction Type
  {
    name: 'gold.dim_treasury_transaction_type',
    description: 'Type 1 dimension for treasury transaction classifications',
    dimensionType: 'SCD_TYPE_1',
    grain: 'One row per transaction type',
    primaryKey: ['treasury_transaction_type_key'],
    
    schema: {
      treasury_transaction_type_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      transaction_type_code: "STRING UNIQUE COMMENT 'FX_SPOT|FX_FORWARD|FX_OPTION|IR_SWAP|IR_CAP|INVESTMENT|DEBT_ISSUANCE'",
      
      // Transaction Details
      transaction_type_name: "STRING",
      transaction_category: "STRING COMMENT 'FX|INTEREST_RATE|INVESTMENT|DEBT|HEDGE|CASH_MANAGEMENT'",
      
      // Financial Impact
      impacts_liquidity_flag: "BOOLEAN",
      impacts_pnl_flag: "BOOLEAN",
      impacts_balance_sheet_flag: "BOOLEAN",
      
      // Regulatory
      regulatory_reporting_required: "BOOLEAN",
      regulatory_framework: "STRING COMMENT 'DODD_FRANK|EMIR|MiFID_II|NULL'",
      
      // Accounting
      accounting_treatment: "STRING COMMENT 'FAIR_VALUE|AMORTIZED_COST|OCI|HELD_TO_MATURITY'",
      
      // Active Status
      active_flag: "BOOLEAN",
      
      // Metadata
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
    
    indexes: [
      "CREATE INDEX idx_dim_treas_txn_type_code ON gold.dim_treasury_transaction_type(transaction_type_code)",
    ],
  },

  // Dimension 10: Portfolio
  {
    name: 'gold.dim_portfolio',
    description: 'Type 2 dimension for investment portfolios',
    dimensionType: 'SCD_TYPE_2',
    grain: 'One row per portfolio version',
    primaryKey: ['portfolio_key'],
    
    schema: {
      portfolio_key: "INTEGER PRIMARY KEY",
      
      // Natural Key
      portfolio_id: "STRING COMMENT 'Business portfolio ID'",
      
      // Portfolio Details
      portfolio_name: "STRING COMMENT 'Operating Cash|Pension Fund|Strategic Reserve|Endowment'",
      portfolio_type: "STRING COMMENT 'OPERATING_CASH|PENSION|ENDOWMENT|STRATEGIC_RESERVE|INSURANCE'",
      portfolio_purpose: "STRING COMMENT 'LIQUIDITY|INCOME_GENERATION|GROWTH|HEDGING'",
      
      // Investment Strategy
      investment_strategy: "STRING COMMENT 'CONSERVATIVE|BALANCED|GROWTH|AGGRESSIVE'",
      investment_policy: "STRING COMMENT 'High-level investment policy description'",
      
      // Asset Allocation Targets
      target_fixed_income_pct: "DECIMAL(5,2)",
      target_equity_pct: "DECIMAL(5,2)",
      target_cash_pct: "DECIMAL(5,2)",
      target_alternative_pct: "DECIMAL(5,2)",
      
      // Risk Parameters
      risk_tolerance: "STRING COMMENT 'LOW|MEDIUM|HIGH'",
      max_single_issuer_concentration_pct: "DECIMAL(5,2)",
      max_sector_concentration_pct: "DECIMAL(5,2)",
      minimum_credit_rating: "STRING COMMENT 'BBB-|A-|AA-'",
      
      // Benchmark
      benchmark_index: "STRING COMMENT 'Bloomberg Aggregate Bond|S&P 500|60/40 Blend'",
      
      // Management
      portfolio_manager: "STRING",
      management_type: "STRING COMMENT 'INTERNAL|EXTERNAL|HYBRID'",
      external_manager_name: "STRING",
      
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
      "CREATE INDEX idx_dim_portfolio_id ON gold.dim_portfolio(portfolio_id, is_current)",
    ],
  },
];

// ============================================================================
// FACT TABLES
// ============================================================================

export const treasuryCommercialGoldFacts = [
  // Fact 1: FX Transactions (Transaction Grain)
  {
    name: 'gold.fact_fx_transactions',
    description: 'Transaction-grain fact for FX spot, forward, and option transactions',
    factType: 'TRANSACTION',
    grain: 'One row per FX transaction',
    primaryKey: ['fx_transaction_key'],
    foreignKeys: [
      'trade_date_key',
      'settlement_date_key',
      'company_key',
      'derivative_instrument_key',
      'counterparty_key',
      'base_currency_key',
      'quote_currency_key',
      'hedge_relationship_key',
    ],
    
    schema: {
      // Surrogate Key
      fx_transaction_key: "BIGINT PRIMARY KEY",
      
      // Degenerate Dimensions
      fx_transaction_id: "STRING COMMENT 'Business transaction ID'",
      trade_reference: "STRING",
      
      // Foreign Keys
      trade_date_key: "INTEGER COMMENT 'FK to dim_date'",
      settlement_date_key: "INTEGER COMMENT 'FK to dim_date'",
      maturity_date_key: "INTEGER COMMENT 'FK to dim_date (for forwards/options)'",
      company_key: "INTEGER COMMENT 'FK to dim_commercial_customer'",
      derivative_instrument_key: "INTEGER COMMENT 'FK to dim_derivative_instrument'",
      counterparty_key: "INTEGER COMMENT 'FK to dim_counterparty'",
      base_currency_key: "INTEGER COMMENT 'FK to dim_currency'",
      quote_currency_key: "INTEGER COMMENT 'FK to dim_currency'",
      hedge_relationship_key: "INTEGER COMMENT 'FK to dim_hedge_relationship (NULL if not hedge)'",
      
      // Transaction Type
      transaction_type: "STRING COMMENT 'SPOT|FORWARD|OPTION|SWAP'",
      transaction_direction: "STRING COMMENT 'BUY|SELL'",
      
      // Measures - Amounts
      notional_base_currency: "DECIMAL(18,2)",
      notional_quote_currency: "DECIMAL(18,2)",
      usd_equivalent_notional: "DECIMAL(18,2)",
      
      // Measures - Rates
      contracted_fx_rate: "DECIMAL(12,6)",
      market_rate_at_trade: "DECIMAL(12,6)",
      bank_spread_bps: "INTEGER",
      
      // Measures - Revenue & P&L
      bank_revenue: "DECIMAL(18,2) COMMENT 'Revenue from spread'",
      current_mtm_value: "DECIMAL(18,2)",
      unrealized_pnl: "DECIMAL(18,2)",
      realized_pnl: "DECIMAL(18,2) COMMENT 'For settled transactions'",
      
      // Measures - Timing (days)
      days_to_maturity: "INTEGER",
      days_to_settlement: "INTEGER",
      
      // Flags
      deliverable_flag: "BOOLEAN",
      hedge_flag: "BOOLEAN",
      settled_flag: "BOOLEAN",
      
      // Option-Specific Measures
      option_premium: "DECIMAL(18,2)",
      option_delta: "DECIMAL(7,4)",
      option_gamma: "DECIMAL(10,8)",
      intrinsic_value: "DECIMAL(18,2)",
      time_value: "DECIMAL(18,2)",
      
      // Timestamps
      trade_timestamp: "TIMESTAMP",
      settlement_timestamp: "TIMESTAMP",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_fx_trade_date ON gold.fact_fx_transactions(trade_date_key)",
      "CREATE INDEX idx_fact_fx_company ON gold.fact_fx_transactions(company_key)",
      "CREATE INDEX idx_fact_fx_type ON gold.fact_fx_transactions(transaction_type)",
    ],
    
    partitioning: "PARTITION BY RANGE(trade_date_key)",
  },

  // Fact 2: Derivative Positions (Daily Snapshot)
  {
    name: 'gold.fact_derivative_positions',
    description: 'Daily periodic snapshot of derivative positions with MTM and risk metrics',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per derivative instrument per day',
    primaryKey: ['derivative_instrument_key', 'business_date_key'],
    foreignKeys: [
      'business_date_key',
      'company_key',
      'derivative_instrument_key',
      'counterparty_key',
      'hedge_relationship_key',
    ],
    
    schema: {
      // Foreign Keys (Composite Primary Key)
      business_date_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_date'",
      derivative_instrument_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_derivative_instrument'",
      company_key: "INTEGER COMMENT 'FK to dim_commercial_customer'",
      counterparty_key: "INTEGER COMMENT 'FK to dim_counterparty'",
      hedge_relationship_key: "INTEGER COMMENT 'FK to dim_hedge_relationship'",
      
      // Derivative Type
      derivative_type: "STRING COMMENT 'FX_FORWARD|IR_SWAP|OPTION|CAP|FLOOR'",
      
      // Measures - Notional
      notional_amount: "DECIMAL(18,2)",
      notional_currency: "STRING",
      usd_equivalent_notional: "DECIMAL(18,2)",
      
      // Measures - Mark-to-Market
      mtm_value: "DECIMAL(18,2)",
      mtm_currency: "STRING DEFAULT 'USD'",
      mtm_change_from_prior_day: "DECIMAL(18,2)",
      cumulative_mtm_gain_loss: "DECIMAL(18,2) COMMENT 'Cumulative since inception'",
      
      // Measures - Risk Metrics
      dv01: "DECIMAL(18,2) COMMENT 'For IR derivatives'",
      duration: "DECIMAL(6,2) COMMENT 'For IR derivatives'",
      fx_delta: "DECIMAL(7,4) COMMENT 'For FX options'",
      gamma: "DECIMAL(10,8) COMMENT 'For options'",
      vega: "DECIMAL(10,4) COMMENT 'For options'",
      theta: "DECIMAL(10,4) COMMENT 'For options'",
      
      // Measures - Value at Risk
      var_1d_99pct: "DECIMAL(18,2)",
      
      // Measures - Cash Flows (for swaps)
      accrued_interest: "DECIMAL(18,2)",
      next_payment_amount: "DECIMAL(18,2)",
      
      // Measures - Days to Maturity
      days_to_maturity: "INTEGER",
      
      // Measures - Collateral
      collateral_posted: "DECIMAL(18,2)",
      collateral_required: "DECIMAL(18,2)",
      collateral_shortfall: "DECIMAL(18,2)",
      
      // Flags
      hedge_flag: "BOOLEAN",
      in_the_money_flag: "BOOLEAN COMMENT 'MTM > 0'",
      active_flag: "BOOLEAN",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_deriv_pos_date ON gold.fact_derivative_positions(business_date_key)",
      "CREATE INDEX idx_fact_deriv_pos_company ON gold.fact_derivative_positions(company_key)",
    ],
    
    partitioning: "PARTITION BY RANGE(business_date_key)",
  },

  // Fact 3: Investment Portfolio (Daily Snapshot)
  {
    name: 'gold.fact_investment_portfolio',
    description: 'Daily snapshot of investment portfolio holdings with valuations',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per security per portfolio per day',
    primaryKey: ['portfolio_key', 'investment_security_key', 'business_date_key'],
    foreignKeys: [
      'business_date_key',
      'company_key',
      'portfolio_key',
      'investment_security_key',
      'currency_key',
    ],
    
    schema: {
      // Foreign Keys (Composite Primary Key)
      business_date_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_date'",
      portfolio_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_portfolio'",
      investment_security_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_investment_security'",
      company_key: "INTEGER COMMENT 'FK to dim_commercial_customer'",
      currency_key: "INTEGER COMMENT 'FK to dim_currency'",
      
      // Security Details
      security_type: "STRING COMMENT 'BOND|STOCK|FUND|CD'",
      
      // Measures - Quantity
      quantity_held: "DECIMAL(18,4) COMMENT 'Shares|units|bonds'",
      
      // Measures - Cost Basis
      total_book_value: "DECIMAL(18,2) COMMENT 'Amortized cost basis'",
      average_cost_per_unit: "DECIMAL(18,4)",
      
      // Measures - Market Value
      current_market_price: "DECIMAL(18,4)",
      total_market_value: "DECIMAL(18,2)",
      market_value_change_from_prior_day: "DECIMAL(18,2)",
      
      // Measures - Unrealized Gain/Loss
      total_unrealized_gain_loss: "DECIMAL(18,2) COMMENT 'Market value - Book value'",
      unrealized_gain_loss_pct: "DECIMAL(7,4)",
      
      // Measures - Income
      accrued_interest: "DECIMAL(18,2) COMMENT 'Accrued interest to date'",
      ytd_interest_income: "DECIMAL(18,2)",
      ytd_dividend_income: "DECIMAL(18,2)",
      
      // Measures - Fixed Income Metrics
      current_yield: "DECIMAL(7,4) COMMENT 'Coupon / Market price'",
      yield_to_maturity: "DECIMAL(7,4)",
      effective_duration: "DECIMAL(6,2)",
      
      // Measures - Days to Maturity
      days_to_maturity: "INTEGER",
      
      // Measures - Weight in Portfolio
      portfolio_weight_pct: "DECIMAL(5,2) COMMENT '% of portfolio market value'",
      
      // Flags
      investment_grade_flag: "BOOLEAN",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_inv_port_date ON gold.fact_investment_portfolio(business_date_key)",
      "CREATE INDEX idx_fact_inv_port_company ON gold.fact_investment_portfolio(company_key)",
    ],
    
    partitioning: "PARTITION BY RANGE(business_date_key)",
  },

  // Fact 4: Liquidity Position (Daily Snapshot)
  {
    name: 'gold.fact_liquidity_position',
    description: 'Daily liquidity position snapshot with cash and available funding',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per company per currency per day',
    primaryKey: ['company_key', 'currency_key', 'business_date_key'],
    foreignKeys: ['business_date_key', 'company_key', 'currency_key'],
    
    schema: {
      // Foreign Keys (Composite Primary Key)
      business_date_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_date'",
      company_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_commercial_customer'",
      currency_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_currency'",
      
      // Measures - Cash Position
      total_cash_and_equivalents: "DECIMAL(18,2)",
      restricted_cash: "DECIMAL(18,2)",
      unrestricted_cash: "DECIMAL(18,2)",
      
      // Measures - Available Liquidity
      undrawn_credit_facilities: "DECIMAL(18,2)",
      total_available_liquidity: "DECIMAL(18,2) COMMENT 'Cash + Undrawn facilities'",
      
      // Measures - Intraday Metrics
      intraday_high_balance: "DECIMAL(18,2)",
      intraday_low_balance: "DECIMAL(18,2)",
      intraday_overdraft_amount: "DECIMAL(18,2)",
      
      // Measures - Forecasted Cash Flows
      forecasted_inflows_30d: "DECIMAL(18,2)",
      forecasted_outflows_30d: "DECIMAL(18,2)",
      forecasted_net_cash_flow_30d: "DECIMAL(18,2)",
      forecasted_cash_balance_30d: "DECIMAL(18,2)",
      
      // Measures - Liquidity Ratios
      current_ratio: "DECIMAL(7,4)",
      quick_ratio: "DECIMAL(7,4)",
      days_cash_on_hand: "INTEGER",
      
      // Measures - Liquidity Gap
      target_cash_balance: "DECIMAL(18,2)",
      liquidity_surplus_deficit: "DECIMAL(18,2) COMMENT 'Cash - Target'",
      
      // Measures - Investment/Borrowing
      overnight_investment: "DECIMAL(18,2)",
      overnight_borrowing: "DECIMAL(18,2)",
      overnight_rate: "DECIMAL(7,4)",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_liq_date ON gold.fact_liquidity_position(business_date_key)",
      "CREATE INDEX idx_fact_liq_company ON gold.fact_liquidity_position(company_key)",
    ],
    
    partitioning: "PARTITION BY RANGE(business_date_key)",
  },

  // Fact 5: Debt Service (Transaction Grain)
  {
    name: 'gold.fact_debt_service',
    description: 'Transaction-grain fact for debt principal and interest payments',
    factType: 'TRANSACTION',
    grain: 'One row per debt payment',
    primaryKey: ['debt_service_key'],
    foreignKeys: [
      'payment_date_key',
      'company_key',
      'debt_instrument_key',
      'currency_key',
    ],
    
    schema: {
      // Surrogate Key
      debt_service_key: "BIGINT PRIMARY KEY",
      
      // Degenerate Dimensions
      debt_service_id: "STRING COMMENT 'Business payment ID'",
      
      // Foreign Keys
      payment_date_key: "INTEGER COMMENT 'FK to dim_date'",
      company_key: "INTEGER COMMENT 'FK to dim_commercial_customer'",
      debt_instrument_key: "INTEGER COMMENT 'FK to dim_debt_instrument'",
      currency_key: "INTEGER COMMENT 'FK to dim_currency'",
      
      // Debt Type
      debt_type: "STRING COMMENT 'TERM_LOAN|BOND|REVOLVING_CREDIT'",
      
      // Measures - Payment Breakdown
      principal_payment: "DECIMAL(18,2)",
      interest_payment: "DECIMAL(18,2)",
      fee_payment: "DECIMAL(18,2) COMMENT 'Commitment fees, etc.'",
      total_payment: "DECIMAL(18,2)",
      
      // Measures - Interest Rate
      interest_rate: "DECIMAL(7,4) COMMENT 'Effective interest rate for this period'",
      
      // Measures - Outstanding Balance
      principal_balance_before: "DECIMAL(18,2)",
      principal_balance_after: "DECIMAL(18,2)",
      
      // Payment Type
      payment_type: "STRING COMMENT 'SCHEDULED|PREPAYMENT|MATURITY|REFINANCING'",
      
      // Prepayment
      prepayment_flag: "BOOLEAN",
      prepayment_penalty: "DECIMAL(18,2)",
      
      // Flags
      scheduled_flag: "BOOLEAN COMMENT 'TRUE if scheduled payment'",
      missed_payment_flag: "BOOLEAN",
      late_payment_flag: "BOOLEAN",
      
      // Timestamps
      payment_timestamp: "TIMESTAMP",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_debt_service_date ON gold.fact_debt_service(payment_date_key)",
      "CREATE INDEX idx_fact_debt_service_company ON gold.fact_debt_service(company_key)",
    ],
    
    partitioning: "PARTITION BY RANGE(payment_date_key)",
  },

  // Fact 6: Hedge Effectiveness (Periodic Snapshot - Quarterly)
  {
    name: 'gold.fact_hedge_effectiveness',
    description: 'Quarterly periodic snapshot of hedge effectiveness testing results',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per hedge relationship per quarter',
    primaryKey: ['hedge_relationship_key', 'quarter_end_date_key'],
    foreignKeys: [
      'quarter_end_date_key',
      'company_key',
      'hedge_relationship_key',
      'derivative_instrument_key',
    ],
    
    schema: {
      // Foreign Keys (Composite Primary Key)
      quarter_end_date_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_date (quarter end)'",
      hedge_relationship_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_hedge_relationship'",
      company_key: "INTEGER COMMENT 'FK to dim_commercial_customer'",
      derivative_instrument_key: "INTEGER COMMENT 'FK to dim_derivative_instrument (hedge instrument)'",
      
      // Hedge Details
      hedge_designation: "STRING COMMENT 'CASH_FLOW_HEDGE|FAIR_VALUE_HEDGE'",
      test_method: "STRING COMMENT 'DOLLAR_OFFSET|REGRESSION_ANALYSIS'",
      
      // Measures - Change in Value (Quarter)
      change_hedge_instrument_value_qtd: "DECIMAL(18,2)",
      change_hedged_item_value_qtd: "DECIMAL(18,2)",
      
      // Measures - Effectiveness
      effectiveness_ratio: "DECIMAL(7,4) COMMENT '0.80 to 1.25 = highly effective'",
      effective_portion: "DECIMAL(18,2) COMMENT 'Amount qualifying for hedge accounting'",
      ineffective_portion: "DECIMAL(18,2) COMMENT 'Amount to recognize in P&L'",
      
      // Measures - Cumulative (Since Inception)
      cumulative_hedge_instrument_gain_loss: "DECIMAL(18,2)",
      cumulative_hedged_item_gain_loss: "DECIMAL(18,2)",
      cumulative_ineffectiveness: "DECIMAL(18,2)",
      
      // Measures - OCI (Other Comprehensive Income)
      effective_portion_in_oci: "DECIMAL(18,2) COMMENT 'For cash flow hedges'",
      amount_reclassified_oci_to_earnings_qtd: "DECIMAL(18,2)",
      
      // Measures - Regression (if applicable)
      r_squared: "DECIMAL(5,4) COMMENT 'Regression R-squared'",
      regression_slope: "DECIMAL(7,4)",
      
      // Flags
      highly_effective_flag: "BOOLEAN COMMENT 'TRUE if 80%-125%'",
      discontinuation_flag: "BOOLEAN",
      
      // Test Result
      test_result: "STRING COMMENT 'PASS|FAIL'",
      
      // Audit
      tested_by: "STRING",
      test_date: "DATE",
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_hedge_eff_date ON gold.fact_hedge_effectiveness(quarter_end_date_key)",
      "CREATE INDEX idx_fact_hedge_eff_company ON gold.fact_hedge_effectiveness(company_key)",
    ],
    
    partitioning: "PARTITION BY RANGE(quarter_end_date_key)",
  },

  // Fact 7: Treasury P&L (Daily Snapshot)
  {
    name: 'gold.fact_treasury_pnl',
    description: 'Daily treasury profit & loss summary by activity type',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per company per activity type per day',
    primaryKey: ['company_key', 'treasury_activity_type', 'business_date_key'],
    foreignKeys: ['business_date_key', 'company_key'],
    
    schema: {
      // Foreign Keys (Composite Primary Key)
      business_date_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_date'",
      company_key: "INTEGER PRIMARY KEY COMMENT 'FK to dim_commercial_customer'",
      treasury_activity_type: "STRING PRIMARY KEY COMMENT 'FX_TRADING|IR_DERIVATIVES|INVESTMENTS|DEBT|HEDGE_INEFFECTIVENESS'",
      
      // Measures - Realized P&L
      realized_gain_loss: "DECIMAL(18,2) COMMENT 'Settled transactions'",
      
      // Measures - Unrealized P&L (MTM Change)
      unrealized_gain_loss_mtd: "DECIMAL(18,2) COMMENT 'Month-to-date unrealized'",
      unrealized_gain_loss_ytd: "DECIMAL(18,2) COMMENT 'Year-to-date unrealized'",
      mtm_change_from_prior_day: "DECIMAL(18,2)",
      
      // Measures - Revenue
      fee_revenue: "DECIMAL(18,2) COMMENT 'Fees earned (e.g., FX spread)'",
      interest_income: "DECIMAL(18,2) COMMENT 'Interest from investments'",
      dividend_income: "DECIMAL(18,2)",
      
      // Measures - Expenses
      interest_expense: "DECIMAL(18,2) COMMENT 'Interest on debt'",
      hedging_costs: "DECIMAL(18,2) COMMENT 'Option premiums, etc.'",
      transaction_costs: "DECIMAL(18,2) COMMENT 'Broker fees, commissions'",
      
      // Measures - Net Treasury Contribution
      net_treasury_pnl: "DECIMAL(18,2) COMMENT 'Total revenue - Total expenses'",
      
      // Measures - Hedge Ineffectiveness
      hedge_ineffectiveness_pnl: "DECIMAL(18,2) COMMENT 'Ineffective portion recognized in P&L'",
      
      // Audit
      created_timestamp: "TIMESTAMP",
      etl_batch_id: "BIGINT",
    },
    
    indexes: [
      "CREATE INDEX idx_fact_treas_pnl_date ON gold.fact_treasury_pnl(business_date_key)",
      "CREATE INDEX idx_fact_treas_pnl_company ON gold.fact_treasury_pnl(company_key)",
    ],
    
    partitioning: "PARTITION BY RANGE(business_date_key)",
  },
];

export const treasuryCommercialGoldLayer = {
  name: 'Treasury-Commercial Gold Layer',
  totalDimensions: treasuryCommercialGoldDimensions.length,
  totalFacts: treasuryCommercialGoldFacts.length,
  dimensions: treasuryCommercialGoldDimensions,
  facts: treasuryCommercialGoldFacts,
};
