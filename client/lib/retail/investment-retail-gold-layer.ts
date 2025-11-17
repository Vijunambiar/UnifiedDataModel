export const investmentRetailGoldDimensions = [
  // Dimension 1: Investment Account
  {
    name: 'gold.dim_investment_account',
    description: 'Investment account dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per account per validity period',
    primaryKey: ['investment_account_key'],
    schema: {
      investment_account_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      account_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      account_number: "STRING NOT NULL",
      account_type: "STRING NOT NULL COMMENT 'BROKERAGE, IRA, ROTH_IRA, 401K, 529_PLAN'",
      account_status: "STRING NOT NULL",
      tax_status: "STRING COMMENT 'TAXABLE, TAX_DEFERRED, TAX_FREE'",
      is_managed_account: "BOOLEAN",
      is_margin_enabled: "BOOLEAN",
      advisor_key: "BIGINT COMMENT 'FK to dim_advisor'",
      account_open_date: "DATE NOT NULL",
      account_close_date: "DATE",
      effective_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      effective_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 2: Investment Security
  {
    name: 'gold.dim_investment_security',
    description: 'Investment security dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per security per validity period',
    primaryKey: ['security_key'],
    schema: {
      security_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      security_id: "BIGINT NOT NULL COMMENT 'Business key'",
      symbol: "STRING NOT NULL",
      cusip: "STRING",
      isin: "STRING",
      security_name: "STRING NOT NULL",
      security_type: "STRING NOT NULL COMMENT 'STOCK, BOND, MUTUAL_FUND, ETF, OPTION'",
      asset_class: "STRING NOT NULL COMMENT 'EQUITY, FIXED_INCOME, ALTERNATIVE, CASH'",
      exchange: "STRING",
      country_code: "STRING",
      currency_code: "STRING",
      sector: "STRING",
      industry: "STRING",
      issuer: "STRING",
      issue_date: "DATE",
      maturity_date: "DATE",
      coupon_rate: "DECIMAL(5,4)",
      dividend_yield: "DECIMAL(5,4)",
      expense_ratio: "DECIMAL(5,4)",
      is_active: "BOOLEAN",
      effective_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      effective_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 3: Trade Type
  {
    name: 'gold.dim_trade_type',
    description: 'Trade type dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per trade type',
    primaryKey: ['trade_type_key'],
    schema: {
      trade_type_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      trade_type_code: "STRING NOT NULL COMMENT 'Business key - BUY, SELL, SHORT, COVER'",
      trade_type_name: "STRING NOT NULL",
      trade_category: "STRING COMMENT 'EQUITY, FIXED_INCOME, DERIVATIVE'",
      is_opening_position: "BOOLEAN",
      is_closing_position: "BOOLEAN",
      affects_cost_basis: "BOOLEAN",
      is_taxable_event: "BOOLEAN",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 4: Order Type
  {
    name: 'gold.dim_order_type',
    description: 'Order type dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per order type',
    primaryKey: ['order_type_key'],
    schema: {
      order_type_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      order_type_code: "STRING NOT NULL COMMENT 'Business key - MARKET, LIMIT, STOP, STOP_LIMIT'",
      order_type_name: "STRING NOT NULL",
      order_category: "STRING COMMENT 'MARKET_ORDER, LIMIT_ORDER, STOP_ORDER'",
      requires_limit_price: "BOOLEAN",
      requires_stop_price: "BOOLEAN",
      is_guaranteed_execution: "BOOLEAN",
      typical_use_case: "STRING",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 5: Investment Goal
  {
    name: 'gold.dim_investment_goal',
    description: 'Investment goal dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per goal per validity period',
    primaryKey: ['goal_key'],
    schema: {
      goal_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      goal_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      account_key: "BIGINT COMMENT 'FK to dim_investment_account'",
      goal_name: "STRING NOT NULL",
      goal_type: "STRING NOT NULL COMMENT 'RETIREMENT, EDUCATION, HOME, WEALTH_BUILDING'",
      target_amount: "DECIMAL(18,2) NOT NULL",
      target_date: "DATE",
      risk_tolerance: "STRING COMMENT 'CONSERVATIVE, MODERATE, AGGRESSIVE'",
      effective_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      effective_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 6: Investment Advisor
  {
    name: 'gold.dim_investment_advisor',
    description: 'Investment advisor dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per advisor per validity period',
    primaryKey: ['advisor_key'],
    schema: {
      advisor_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      advisor_id: "BIGINT NOT NULL COMMENT 'Business key'",
      advisor_name: "STRING NOT NULL",
      advisor_type: "STRING COMMENT 'FINANCIAL_ADVISOR, PORTFOLIO_MANAGER, ROBO_ADVISOR'",
      license_number: "STRING",
      specialization: "STRING",
      years_experience: "INT",
      aum_total: "DECIMAL(18,2) COMMENT 'Assets Under Management'",
      client_count: "INT",
      branch_key: "BIGINT COMMENT 'FK to dim_branch'",
      is_active: "BOOLEAN",
      hire_date: "DATE",
      termination_date: "DATE",
      effective_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      effective_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 7: Asset Class
  {
    name: 'gold.dim_asset_class',
    description: 'Asset class dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per asset class',
    primaryKey: ['asset_class_key'],
    schema: {
      asset_class_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      asset_class_code: "STRING NOT NULL COMMENT 'Business key - EQUITY, FIXED_INCOME, ALTERNATIVE, CASH'",
      asset_class_name: "STRING NOT NULL",
      asset_category: "STRING COMMENT 'TRADITIONAL, ALTERNATIVE'",
      typical_risk_level: "STRING COMMENT 'LOW, MEDIUM, HIGH'",
      typical_liquidity: "STRING COMMENT 'HIGH, MEDIUM, LOW'",
      is_taxable: "BOOLEAN",
      is_income_generating: "BOOLEAN",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 8: Income Type
  {
    name: 'gold.dim_income_type',
    description: 'Investment income type dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per income type',
    primaryKey: ['income_type_key'],
    schema: {
      income_type_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      income_type_code: "STRING NOT NULL COMMENT 'Business key'",
      income_type_name: "STRING NOT NULL",
      income_category: "STRING COMMENT 'DIVIDEND, INTEREST, CAPITAL_GAIN'",
      tax_treatment: "STRING COMMENT 'ORDINARY, QUALIFIED, TAX_FREE'",
      reporting_form: "STRING COMMENT '1099-DIV, 1099-INT, 1099-B'",
      is_qualified: "BOOLEAN",
      is_reinvestable: "BOOLEAN",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 9: Fee Type
  {
    name: 'gold.dim_fee_type',
    description: 'Investment fee type dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per fee type',
    primaryKey: ['fee_type_key'],
    schema: {
      fee_type_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      fee_type_code: "STRING NOT NULL COMMENT 'Business key'",
      fee_type_name: "STRING NOT NULL",
      fee_category: "STRING COMMENT 'MANAGEMENT, ADVISORY, TRADING, ACCOUNT_MAINTENANCE'",
      fee_frequency: "STRING COMMENT 'ONE_TIME, MONTHLY, QUARTERLY, ANNUAL, PER_TRANSACTION'",
      is_aum_based: "BOOLEAN",
      is_waivable: "BOOLEAN",
      is_tax_deductible: "BOOLEAN",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 10: Execution Venue
  {
    name: 'gold.dim_execution_venue',
    description: 'Trade execution venue dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per venue per validity period',
    primaryKey: ['execution_venue_key'],
    schema: {
      execution_venue_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      venue_code: "STRING NOT NULL COMMENT 'Business key - NYSE, NASDAQ, etc.'",
      venue_name: "STRING NOT NULL",
      venue_type: "STRING COMMENT 'EXCHANGE, ECN, DARK_POOL, OTC'",
      country_code: "STRING",
      operating_hours: "STRING",
      primary_asset_classes: "STRING",
      is_regulated: "BOOLEAN",
      is_active: "BOOLEAN",
      effective_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      effective_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  }
];

export const investmentRetailGoldFacts = [
  // Fact 1: Investment Trades
  {
    name: 'gold.fact_investment_trades',
    description: 'Investment trade transactions fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'TRANSACTION',
    grain: 'One row per trade',
    primaryKey: ['trade_key'],
    foreignKeys: [
      { column: 'account_key', references: 'gold.dim_investment_account' },
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'security_key', references: 'gold.dim_investment_security' },
      { column: 'trade_type_key', references: 'gold.dim_trade_type' },
      { column: 'order_type_key', references: 'gold.dim_order_type' },
      { column: 'execution_venue_key', references: 'gold.dim_execution_venue' },
      { column: 'trade_date_key', references: 'gold.dim_date' },
      { column: 'settlement_date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'quantity',
      'price',
      'gross_amount',
      'commission',
      'sec_fee',
      'other_fees',
      'net_amount'
    ],
    schema: {
      trade_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      trade_id: "BIGINT NOT NULL COMMENT 'Business key'",
      account_key: "BIGINT NOT NULL COMMENT 'FK to dim_investment_account'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      security_key: "BIGINT NOT NULL COMMENT 'FK to dim_investment_security'",
      trade_type_key: "BIGINT NOT NULL COMMENT 'FK to dim_trade_type'",
      order_type_key: "BIGINT NOT NULL COMMENT 'FK to dim_order_type'",
      execution_venue_key: "BIGINT COMMENT 'FK to dim_execution_venue'",
      trade_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      settlement_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      trade_timestamp: "TIMESTAMP NOT NULL",
      quantity: "DECIMAL(18,6) NOT NULL",
      price: "DECIMAL(18,6) NOT NULL",
      gross_amount: "DECIMAL(18,2) NOT NULL",
      commission: "DECIMAL(18,2)",
      sec_fee: "DECIMAL(18,2)",
      other_fees: "DECIMAL(18,2)",
      net_amount: "DECIMAL(18,2) NOT NULL",
      currency_code: "STRING NOT NULL",
      trade_status: "STRING",
      is_solicited: "BOOLEAN",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 2: Investment Holdings
  {
    name: 'gold.fact_investment_holdings',
    description: 'Investment holdings fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per account-security per day',
    primaryKey: ['holding_key'],
    foreignKeys: [
      { column: 'account_key', references: 'gold.dim_investment_account' },
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'security_key', references: 'gold.dim_investment_security' },
      { column: 'asset_class_key', references: 'gold.dim_asset_class' },
      { column: 'date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'quantity',
      'market_price',
      'market_value',
      'cost_basis',
      'unrealized_gain_loss',
      'unrealized_gain_loss_pct'
    ],
    schema: {
      holding_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      account_key: "BIGINT NOT NULL COMMENT 'FK to dim_investment_account'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      security_key: "BIGINT NOT NULL COMMENT 'FK to dim_investment_security'",
      asset_class_key: "BIGINT COMMENT 'FK to dim_asset_class'",
      date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      quantity: "DECIMAL(18,6) NOT NULL",
      market_price: "DECIMAL(18,6)",
      market_value: "DECIMAL(18,2)",
      cost_basis: "DECIMAL(18,2)",
      average_cost_per_share: "DECIMAL(18,6)",
      unrealized_gain_loss: "DECIMAL(18,2)",
      unrealized_gain_loss_pct: "DECIMAL(5,2)",
      currency_code: "STRING NOT NULL",
      holding_period_days: "INT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 3: Account Balances
  {
    name: 'gold.fact_account_balances',
    description: 'Daily investment account balances fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per account per day',
    primaryKey: ['account_balance_key'],
    foreignKeys: [
      { column: 'account_key', references: 'gold.dim_investment_account' },
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'advisor_key', references: 'gold.dim_investment_advisor' },
      { column: 'date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'cash_balance',
      'market_value',
      'total_balance',
      'total_cost_basis',
      'unrealized_gain_loss',
      'margin_balance',
      'buying_power'
    ],
    schema: {
      account_balance_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      account_key: "BIGINT NOT NULL COMMENT 'FK to dim_investment_account'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      advisor_key: "BIGINT COMMENT 'FK to dim_investment_advisor'",
      date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      cash_balance: "DECIMAL(18,2)",
      market_value: "DECIMAL(18,2)",
      total_balance: "DECIMAL(18,2)",
      total_cost_basis: "DECIMAL(18,2)",
      unrealized_gain_loss: "DECIMAL(18,2)",
      unrealized_gain_loss_pct: "DECIMAL(5,2)",
      margin_balance: "DECIMAL(18,2)",
      buying_power: "DECIMAL(18,2)",
      total_holdings_count: "INT",
      currency_code: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 4: Investment Income
  {
    name: 'gold.fact_investment_income',
    description: 'Investment income (dividends and interest) fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'TRANSACTION',
    grain: 'One row per income event',
    primaryKey: ['income_key'],
    foreignKeys: [
      { column: 'account_key', references: 'gold.dim_investment_account' },
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'security_key', references: 'gold.dim_investment_security' },
      { column: 'income_type_key', references: 'gold.dim_income_type' },
      { column: 'payment_date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'gross_amount',
      'withholding_tax',
      'net_amount',
      'per_share_amount',
      'shares_held'
    ],
    schema: {
      income_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      event_id: "BIGINT NOT NULL COMMENT 'Business key'",
      account_key: "BIGINT NOT NULL COMMENT 'FK to dim_investment_account'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      security_key: "BIGINT COMMENT 'FK to dim_investment_security'",
      income_type_key: "BIGINT NOT NULL COMMENT 'FK to dim_income_type'",
      payment_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      payment_timestamp: "TIMESTAMP NOT NULL",
      gross_amount: "DECIMAL(18,2) NOT NULL",
      withholding_tax: "DECIMAL(18,2)",
      net_amount: "DECIMAL(18,2) NOT NULL",
      per_share_amount: "DECIMAL(18,6)",
      shares_held: "DECIMAL(18,6)",
      currency_code: "STRING NOT NULL",
      is_reinvested: "BOOLEAN",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 5: Portfolio Performance
  {
    name: 'gold.fact_portfolio_performance',
    description: 'Portfolio performance metrics fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per account per period',
    primaryKey: ['performance_key'],
    foreignKeys: [
      { column: 'account_key', references: 'gold.dim_investment_account' },
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'advisor_key', references: 'gold.dim_investment_advisor' },
      { column: 'period_start_date_key', references: 'gold.dim_date' },
      { column: 'period_end_date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'beginning_value',
      'ending_value',
      'total_return',
      'total_return_pct',
      'time_weighted_return_pct',
      'alpha',
      'beta',
      'sharpe_ratio'
    ],
    schema: {
      performance_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      account_key: "BIGINT NOT NULL COMMENT 'FK to dim_investment_account'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      advisor_key: "BIGINT COMMENT 'FK to dim_investment_advisor'",
      period_start_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      period_end_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      period_type: "STRING NOT NULL",
      beginning_value: "DECIMAL(18,2)",
      ending_value: "DECIMAL(18,2)",
      net_contributions: "DECIMAL(18,2)",
      net_withdrawals: "DECIMAL(18,2)",
      total_return: "DECIMAL(18,2)",
      total_return_pct: "DECIMAL(5,2)",
      time_weighted_return_pct: "DECIMAL(5,2)",
      money_weighted_return_pct: "DECIMAL(5,2)",
      benchmark_return_pct: "DECIMAL(5,2)",
      alpha: "DECIMAL(5,2)",
      beta: "DECIMAL(5,2)",
      sharpe_ratio: "DECIMAL(5,2)",
      volatility: "DECIMAL(5,2)",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 6: Investment Fees
  {
    name: 'gold.fact_investment_fees',
    description: 'Investment fees fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'TRANSACTION',
    grain: 'One row per fee charge',
    primaryKey: ['fee_key'],
    foreignKeys: [
      { column: 'account_key', references: 'gold.dim_investment_account' },
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'advisor_key', references: 'gold.dim_investment_advisor' },
      { column: 'fee_type_key', references: 'gold.dim_fee_type' },
      { column: 'date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'fee_amount',
      'fee_rate',
      'basis_amount'
    ],
    schema: {
      fee_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      fee_id: "BIGINT NOT NULL COMMENT 'Business key'",
      account_key: "BIGINT NOT NULL COMMENT 'FK to dim_investment_account'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      advisor_key: "BIGINT COMMENT 'FK to dim_investment_advisor'",
      fee_type_key: "BIGINT NOT NULL COMMENT 'FK to dim_fee_type'",
      date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      fee_timestamp: "TIMESTAMP NOT NULL",
      fee_amount: "DECIMAL(18,2) NOT NULL",
      fee_rate: "DECIMAL(5,4)",
      basis_amount: "DECIMAL(18,2)",
      currency_code: "STRING NOT NULL",
      is_waived: "BOOLEAN",
      waiver_reason: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  }
];

export const investmentRetailGoldLayerComplete = {
  description: 'Gold layer for retail investment domain - dimensional model',
  layer: 'GOLD',
  dimensions: investmentRetailGoldDimensions,
  facts: investmentRetailGoldFacts,
  totalDimensions: investmentRetailGoldDimensions.length,
  totalFacts: investmentRetailGoldFacts.length
};

export default investmentRetailGoldLayerComplete;
