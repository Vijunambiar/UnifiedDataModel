export const collectionsRetailGoldDimensions = [
  // Dimension 1: Delinquency Status
  {
    name: 'gold.dim_delinquency_status',
    description: 'Delinquency status dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per delinquency status',
    primaryKey: ['delinquency_status_key'],
    schema: {
      delinquency_status_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      status_code: "STRING NOT NULL COMMENT 'Business key - 30_DAYS, 60_DAYS, 90_DAYS, 120_PLUS_DAYS, CHARGED_OFF'",
      status_name: "STRING NOT NULL",
      severity_level: "STRING COMMENT 'LOW, MEDIUM, HIGH, CRITICAL'",
      days_past_due_min: "INT",
      days_past_due_max: "INT",
      is_charge_off: "BOOLEAN",
      requires_legal_action: "BOOLEAN",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 2: Collection Stage
  {
    name: 'gold.dim_collection_stage',
    description: 'Collection stage dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per collection stage',
    primaryKey: ['collection_stage_key'],
    schema: {
      collection_stage_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      stage_code: "STRING NOT NULL COMMENT 'Business key - EARLY, MID, LATE, LEGAL, RECOVERY'",
      stage_name: "STRING NOT NULL",
      stage_sequence: "INT COMMENT 'Order of stages'",
      typical_dpd_range: "STRING",
      primary_tactics: "STRING",
      escalation_criteria: "STRING",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 3: Collector
  {
    name: 'gold.dim_collector',
    description: 'Collector dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per collector per validity period',
    primaryKey: ['collector_key'],
    schema: {
      collector_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      collector_id: "BIGINT NOT NULL COMMENT 'Business key'",
      collector_code: "STRING NOT NULL",
      full_name: "STRING NOT NULL",
      collector_type: "STRING COMMENT 'INTERNAL, EXTERNAL, AGENCY'",
      team_id: "BIGINT",
      specialization: "STRING",
      license_number: "STRING",
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

  // Dimension 4: Collection Agency
  {
    name: 'gold.dim_collection_agency',
    description: 'Collection agency dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per agency per validity period',
    primaryKey: ['agency_key'],
    schema: {
      agency_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      agency_id: "BIGINT NOT NULL COMMENT 'Business key'",
      agency_name: "STRING NOT NULL",
      agency_code: "STRING NOT NULL",
      agency_type: "STRING COMMENT 'CONTINGENCY, FLAT_FEE, DEBT_BUYER'",
      specialization: "STRING",
      commission_rate: "DECIMAL(5,4)",
      contract_start_date: "DATE",
      contract_end_date: "DATE",
      is_active: "BOOLEAN",
      effective_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      effective_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 5: Activity Type
  {
    name: 'gold.dim_activity_type',
    description: 'Collection activity type dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per activity type',
    primaryKey: ['activity_type_key'],
    schema: {
      activity_type_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      activity_type_code: "STRING NOT NULL COMMENT 'Business key - CALL, EMAIL, SMS, LETTER, VISIT'",
      activity_type_name: "STRING NOT NULL",
      activity_category: "STRING COMMENT 'CONTACT_ATTEMPT, PROMISE_TO_PAY, PAYMENT_ARRANGEMENT'",
      channel: "STRING COMMENT 'PHONE, DIGITAL, MAIL, IN_PERSON'",
      is_automated: "BOOLEAN",
      typical_cost: "DECIMAL(18,2)",
      effectiveness_score: "DECIMAL(5,2)",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 6: Payment Arrangement Type
  {
    name: 'gold.dim_payment_arrangement_type',
    description: 'Payment arrangement type dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per arrangement type',
    primaryKey: ['arrangement_type_key'],
    schema: {
      arrangement_type_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      arrangement_type_code: "STRING NOT NULL COMMENT 'Business key - INSTALLMENT, SETTLEMENT, FORBEARANCE'",
      arrangement_type_name: "STRING NOT NULL",
      arrangement_category: "STRING COMMENT 'MODIFICATION, TEMPORARY_RELIEF, FINAL_SETTLEMENT'",
      typical_duration_months: "INT",
      requires_approval: "BOOLEAN",
      min_discount_pct: "DECIMAL(5,2)",
      max_discount_pct: "DECIMAL(5,2)",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 7: Legal Action Type
  {
    name: 'gold.dim_legal_action_type',
    description: 'Legal action type dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per legal action type',
    primaryKey: ['legal_action_type_key'],
    schema: {
      legal_action_type_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      action_type_code: "STRING NOT NULL COMMENT 'Business key - LAWSUIT, JUDGMENT, GARNISHMENT, LIEN'",
      action_type_name: "STRING NOT NULL",
      action_category: "STRING COMMENT 'PRE_JUDGMENT, POST_JUDGMENT, COLLECTION'",
      typical_cost: "DECIMAL(18,2)",
      typical_duration_days: "INT",
      success_rate: "DECIMAL(5,2)",
      requires_attorney: "BOOLEAN",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 8: Recovery Strategy
  {
    name: 'gold.dim_recovery_strategy',
    description: 'Recovery strategy dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per recovery strategy',
    primaryKey: ['recovery_strategy_key'],
    schema: {
      recovery_strategy_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      strategy_code: "STRING NOT NULL COMMENT 'Business key - LEGAL, AGENCY, SALE, WRITE_OFF'",
      strategy_name: "STRING NOT NULL",
      strategy_category: "STRING COMMENT 'ACTIVE_PURSUIT, PASSIVE, LIQUIDATION'",
      typical_recovery_rate: "DECIMAL(5,2)",
      typical_timeframe_months: "INT",
      is_active_strategy: "BOOLEAN",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 9: Hardship Type
  {
    name: 'gold.dim_hardship_type',
    description: 'Hardship type dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per hardship type',
    primaryKey: ['hardship_type_key'],
    schema: {
      hardship_type_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      hardship_type_code: "STRING NOT NULL COMMENT 'Business key'",
      hardship_type_name: "STRING NOT NULL",
      hardship_category: "STRING COMMENT 'FINANCIAL, HEALTH, DISASTER, EMPLOYMENT'",
      typical_duration_months: "INT",
      requires_documentation: "BOOLEAN",
      typical_relief_pct: "DECIMAL(5,2)",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 10: Contact Result
  {
    name: 'gold.dim_contact_result',
    description: 'Contact result dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per contact result',
    primaryKey: ['contact_result_key'],
    schema: {
      contact_result_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      result_code: "STRING NOT NULL COMMENT 'Business key - SUCCESSFUL, NO_ANSWER, BUSY, DISCONNECTED'",
      result_name: "STRING NOT NULL",
      result_category: "STRING COMMENT 'SUCCESS, TEMPORARY_FAILURE, PERMANENT_FAILURE'",
      is_successful: "BOOLEAN",
      requires_follow_up: "BOOLEAN",
      typical_next_action: "STRING",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  }
];

export const collectionsRetailGoldFacts = [
  // Fact 1: Collection Activities
  {
    name: 'gold.fact_collection_activities',
    description: 'Collection activities fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'TRANSACTION',
    grain: 'One row per collection activity',
    primaryKey: ['activity_key'],
    foreignKeys: [
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'account_key', references: 'gold.dim_account' },
      { column: 'collector_key', references: 'gold.dim_collector' },
      { column: 'activity_type_key', references: 'gold.dim_activity_type' },
      { column: 'contact_result_key', references: 'gold.dim_contact_result' },
      { column: 'activity_date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'duration_seconds'
    ],
    schema: {
      activity_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      activity_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      account_key: "BIGINT NOT NULL COMMENT 'FK to dim_account'",
      collector_key: "BIGINT COMMENT 'FK to dim_collector'",
      activity_type_key: "BIGINT NOT NULL COMMENT 'FK to dim_activity_type'",
      contact_result_key: "BIGINT COMMENT 'FK to dim_contact_result'",
      activity_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      activity_timestamp: "TIMESTAMP NOT NULL",
      duration_seconds: "INT",
      is_successful_contact: "BOOLEAN",
      next_action_date: "DATE",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 2: Delinquency Status
  {
    name: 'gold.fact_delinquency_status',
    description: 'Delinquency status fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per account per day',
    primaryKey: ['delinquency_status_key'],
    foreignKeys: [
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'account_key', references: 'gold.dim_account' },
      { column: 'delinquency_status_key', references: 'gold.dim_delinquency_status' },
      { column: 'collection_stage_key', references: 'gold.dim_collection_stage' },
      { column: 'collector_key', references: 'gold.dim_collector' },
      { column: 'date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'days_past_due',
      'past_due_amount',
      'total_balance',
      'minimum_payment_due',
      'missed_payments_count'
    ],
    schema: {
      delinquency_status_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      account_key: "BIGINT NOT NULL COMMENT 'FK to dim_account'",
      delinquency_status_key: "BIGINT NOT NULL COMMENT 'FK to dim_delinquency_status'",
      collection_stage_key: "BIGINT COMMENT 'FK to dim_collection_stage'",
      collector_key: "BIGINT COMMENT 'FK to dim_collector'",
      date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      days_past_due: "INT NOT NULL",
      past_due_amount: "DECIMAL(18,2) NOT NULL",
      total_balance: "DECIMAL(18,2)",
      minimum_payment_due: "DECIMAL(18,2)",
      missed_payments_count: "INT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 3: Collection Payments
  {
    name: 'gold.fact_collection_payments',
    description: 'Collection payments fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'TRANSACTION',
    grain: 'One row per payment',
    primaryKey: ['collection_payment_key'],
    foreignKeys: [
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'account_key', references: 'gold.dim_account' },
      { column: 'collector_key', references: 'gold.dim_collector' },
      { column: 'payment_date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'payment_amount'
    ],
    schema: {
      collection_payment_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      payment_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      account_key: "BIGINT NOT NULL COMMENT 'FK to dim_account'",
      collector_key: "BIGINT COMMENT 'FK to dim_collector'",
      payment_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      payment_amount: "DECIMAL(18,2) NOT NULL",
      payment_method: "STRING",
      payment_type: "STRING",
      payment_status: "STRING NOT NULL",
      is_promise_related: "BOOLEAN",
      is_arrangement_related: "BOOLEAN",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 4: Charge-Offs and Recoveries
  {
    name: 'gold.fact_charge_offs_recoveries',
    description: 'Charge-offs and recoveries fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'ACCUMULATING_SNAPSHOT',
    grain: 'One row per charged-off account',
    primaryKey: ['charge_off_key'],
    foreignKeys: [
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'account_key', references: 'gold.dim_account' },
      { column: 'recovery_strategy_key', references: 'gold.dim_recovery_strategy' },
      { column: 'charge_off_date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'charge_off_amount',
      'total_recovered',
      'recovery_rate',
      'days_to_first_recovery'
    ],
    schema: {
      charge_off_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      charge_off_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      account_key: "BIGINT NOT NULL COMMENT 'FK to dim_account'",
      recovery_strategy_key: "BIGINT COMMENT 'FK to dim_recovery_strategy'",
      charge_off_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      charge_off_amount: "DECIMAL(18,2) NOT NULL",
      outstanding_principal: "DECIMAL(18,2)",
      outstanding_interest: "DECIMAL(18,2)",
      outstanding_fees: "DECIMAL(18,2)",
      days_delinquent: "INT",
      total_recovered: "DECIMAL(18,2)",
      recovery_count: "INT",
      recovery_rate: "DECIMAL(5,2)",
      days_to_first_recovery: "INT",
      last_recovery_date: "DATE",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 5: Payment Arrangements
  {
    name: 'gold.fact_payment_arrangements',
    description: 'Payment arrangements fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'ACCUMULATING_SNAPSHOT',
    grain: 'One row per payment arrangement',
    primaryKey: ['arrangement_key'],
    foreignKeys: [
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'account_key', references: 'gold.dim_account' },
      { column: 'collector_key', references: 'gold.dim_collector' },
      { column: 'arrangement_type_key', references: 'gold.dim_payment_arrangement_type' },
      { column: 'arrangement_date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'total_amount_owed',
      'settlement_amount',
      'installment_count',
      'installment_amount',
      'payments_made',
      'total_paid'
    ],
    schema: {
      arrangement_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      arrangement_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      account_key: "BIGINT NOT NULL COMMENT 'FK to dim_account'",
      collector_key: "BIGINT COMMENT 'FK to dim_collector'",
      arrangement_type_key: "BIGINT NOT NULL COMMENT 'FK to dim_payment_arrangement_type'",
      arrangement_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      completion_date_key: "INT COMMENT 'FK to dim_date'",
      total_amount_owed: "DECIMAL(18,2) NOT NULL",
      settlement_amount: "DECIMAL(18,2)",
      installment_count: "INT",
      installment_amount: "DECIMAL(18,2)",
      payment_frequency: "STRING",
      arrangement_status: "STRING NOT NULL",
      payments_made: "INT",
      total_paid: "DECIMAL(18,2)",
      is_completed: "BOOLEAN",
      is_defaulted: "BOOLEAN",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 6: Collector Performance
  {
    name: 'gold.fact_collector_performance',
    description: 'Collector performance metrics fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per collector per month',
    primaryKey: ['collector_performance_key'],
    foreignKeys: [
      { column: 'collector_key', references: 'gold.dim_collector' },
      { column: 'month_key', references: 'gold.dim_date' }
    ],
    measures: [
      'total_activities',
      'successful_contacts',
      'contact_rate',
      'total_collected',
      'accounts_resolved'
    ],
    schema: {
      collector_performance_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      collector_key: "BIGINT NOT NULL COMMENT 'FK to dim_collector'",
      month_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      total_activities: "INT",
      successful_contacts: "INT",
      contact_rate: "DECIMAL(5,2)",
      promises_obtained: "INT",
      promise_to_pay_rate: "DECIMAL(5,2)",
      total_collected: "DECIMAL(18,2)",
      accounts_resolved: "INT",
      average_resolution_days: "INT",
      active_accounts_end: "INT",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  }
];

export const collectionsRetailGoldLayerComplete = {
  description: 'Gold layer for retail collections domain - dimensional model',
  layer: 'GOLD',
  dimensions: collectionsRetailGoldDimensions,
  facts: collectionsRetailGoldFacts,
  totalDimensions: collectionsRetailGoldDimensions.length,
  totalFacts: collectionsRetailGoldFacts.length
};

export default collectionsRetailGoldLayerComplete;
