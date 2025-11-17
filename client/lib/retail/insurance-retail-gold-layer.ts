export const insuranceRetailGoldDimensions = [
  // Dimension 1: Insurance Policy
  {
    name: 'gold.dim_insurance_policy',
    description: 'Insurance policy dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per policy per validity period',
    primaryKey: ['policy_key'],
    schema: {
      policy_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      policy_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      policy_number: "STRING NOT NULL",
      policy_type: "STRING NOT NULL COMMENT 'LIFE, AUTO, HOME, HEALTH, TRAVEL'",
      product_code: "STRING",
      product_name: "STRING",
      policy_status: "STRING NOT NULL",
      coverage_amount: "DECIMAL(18,2)",
      premium_amount: "DECIMAL(18,2)",
      premium_frequency: "STRING",
      deductible_amount: "DECIMAL(18,2)",
      agent_key: "BIGINT COMMENT 'FK to dim_insurance_agent'",
      effective_date: "DATE NOT NULL",
      expiration_date: "DATE",
      issue_date: "DATE",
      policy_term_months: "INT",
      scd_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      scd_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 2: Insurance Product
  {
    name: 'gold.dim_insurance_product',
    description: 'Insurance product dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per product per validity period',
    primaryKey: ['product_key'],
    schema: {
      product_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      product_code: "STRING NOT NULL COMMENT 'Business key'",
      product_name: "STRING NOT NULL",
      product_type: "STRING NOT NULL COMMENT 'LIFE, AUTO, HOME, HEALTH, TRAVEL, CREDIT_PROTECTION'",
      product_category: "STRING COMMENT 'PERSONAL, COMMERCIAL'",
      coverage_type: "STRING COMMENT 'TERM, WHOLE_LIFE, UNIVERSAL, VARIABLE'",
      is_term_product: "BOOLEAN",
      default_coverage_amount: "DECIMAL(18,2)",
      min_coverage_amount: "DECIMAL(18,2)",
      max_coverage_amount: "DECIMAL(18,2)",
      default_deductible: "DECIMAL(18,2)",
      base_premium_rate: "DECIMAL(5,4)",
      risk_tier: "STRING COMMENT 'LOW, MEDIUM, HIGH'",
      is_active: "BOOLEAN",
      launch_date: "DATE",
      discontinue_date: "DATE",
      scd_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      scd_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 3: Insurance Agent
  {
    name: 'gold.dim_insurance_agent',
    description: 'Insurance agent dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per agent per validity period',
    primaryKey: ['agent_key'],
    schema: {
      agent_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      agent_id: "BIGINT NOT NULL COMMENT 'Business key'",
      agent_code: "STRING NOT NULL",
      full_name: "STRING NOT NULL",
      agent_type: "STRING COMMENT 'CAPTIVE, INDEPENDENT, BROKER'",
      license_number: "STRING",
      license_state: "STRING",
      license_expiry_date: "DATE",
      specialization: "STRING",
      commission_rate: "DECIMAL(5,4)",
      branch_key: "BIGINT COMMENT 'FK to dim_branch'",
      is_active: "BOOLEAN",
      hire_date: "DATE",
      termination_date: "DATE",
      scd_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      scd_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 4: Claim Adjuster
  {
    name: 'gold.dim_claim_adjuster',
    description: 'Claim adjuster dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per adjuster per validity period',
    primaryKey: ['adjuster_key'],
    schema: {
      adjuster_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      adjuster_id: "BIGINT NOT NULL COMMENT 'Business key'",
      adjuster_code: "STRING NOT NULL",
      full_name: "STRING NOT NULL",
      adjuster_type: "STRING COMMENT 'STAFF, INDEPENDENT, PUBLIC'",
      license_number: "STRING",
      specialization: "STRING COMMENT 'AUTO, PROPERTY, HEALTH, LIFE'",
      certification: "STRING",
      is_active: "BOOLEAN",
      hire_date: "DATE",
      scd_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      scd_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 5: Claim Type
  {
    name: 'gold.dim_claim_type',
    description: 'Claim type dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per claim type',
    primaryKey: ['claim_type_key'],
    schema: {
      claim_type_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      claim_type_code: "STRING NOT NULL COMMENT 'Business key'",
      claim_type_name: "STRING NOT NULL",
      claim_category: "STRING COMMENT 'HEALTH, ACCIDENT, DEATH, PROPERTY_DAMAGE, LIABILITY'",
      typical_severity: "STRING COMMENT 'LOW, MEDIUM, HIGH'",
      average_settlement_days: "INT",
      requires_investigation: "BOOLEAN",
      is_frequently_fraudulent: "BOOLEAN",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 6: Policy Status
  {
    name: 'gold.dim_policy_status',
    description: 'Policy status dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per policy status',
    primaryKey: ['policy_status_key'],
    schema: {
      policy_status_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      status_code: "STRING NOT NULL COMMENT 'Business key - ACTIVE, PENDING, LAPSED, CANCELLED, EXPIRED'",
      status_name: "STRING NOT NULL",
      status_category: "STRING COMMENT 'IN_FORCE, NOT_IN_FORCE'",
      is_premium_paying: "BOOLEAN",
      is_coverage_active: "BOOLEAN",
      allows_claims: "BOOLEAN",
      allows_renewal: "BOOLEAN",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 7: Coverage Type
  {
    name: 'gold.dim_coverage_type',
    description: 'Coverage type dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per coverage type',
    primaryKey: ['coverage_type_key'],
    schema: {
      coverage_type_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      coverage_type_code: "STRING NOT NULL COMMENT 'Business key'",
      coverage_type_name: "STRING NOT NULL",
      coverage_category: "STRING COMMENT 'PRIMARY, SUPPLEMENTAL, RIDER'",
      is_mandatory: "BOOLEAN",
      is_customizable: "BOOLEAN",
      typical_limit_amount: "DECIMAL(18,2)",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 8: Risk Classification
  {
    name: 'gold.dim_risk_classification',
    description: 'Risk classification dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per risk classification',
    primaryKey: ['risk_classification_key'],
    schema: {
      risk_classification_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      risk_class_code: "STRING NOT NULL COMMENT 'Business key'",
      risk_class_name: "STRING NOT NULL",
      risk_level: "STRING NOT NULL COMMENT 'PREFERRED, STANDARD, SUBSTANDARD, DECLINED'",
      premium_multiplier: "DECIMAL(5,2) COMMENT 'Multiplier for base premium'",
      requires_medical_exam: "BOOLEAN",
      requires_additional_underwriting: "BOOLEAN",
      min_health_score: "DECIMAL(5,2)",
      max_health_score: "DECIMAL(5,2)",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 9: Payment Method
  {
    name: 'gold.dim_payment_method',
    description: 'Payment method dimension for insurance',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_1',
    grain: 'One row per payment method',
    primaryKey: ['payment_method_key'],
    schema: {
      payment_method_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      payment_method_code: "STRING NOT NULL COMMENT 'Business key'",
      payment_method_name: "STRING NOT NULL",
      payment_category: "STRING COMMENT 'ELECTRONIC, PAPER, IN_PERSON'",
      is_automatic: "BOOLEAN",
      processing_days: "INT",
      has_fees: "BOOLEAN",
      is_preferred: "BOOLEAN",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  },

  // Dimension 10: Beneficiary
  {
    name: 'gold.dim_beneficiary',
    description: 'Beneficiary dimension',
    layer: 'GOLD',
    type: 'DIMENSION',
    scdType: 'SCD_TYPE_2',
    grain: 'One row per beneficiary per validity period',
    primaryKey: ['beneficiary_key'],
    schema: {
      beneficiary_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      beneficiary_id: "BIGINT NOT NULL COMMENT 'Business key'",
      policy_key: "BIGINT COMMENT 'FK to dim_insurance_policy'",
      full_name: "STRING NOT NULL",
      beneficiary_type: "STRING COMMENT 'PRIMARY, CONTINGENT, REVOCABLE, IRREVOCABLE'",
      relationship: "STRING",
      date_of_birth: "DATE",
      allocation_percentage: "DECIMAL(5,2)",
      is_active: "BOOLEAN",
      scd_start_date: "DATE NOT NULL COMMENT 'SCD Type 2'",
      scd_end_date: "DATE COMMENT 'SCD Type 2'",
      is_current: "BOOLEAN DEFAULT TRUE COMMENT 'SCD Type 2'",
      created_date: "DATE NOT NULL",
      updated_date: "DATE NOT NULL"
    }
  }
];

export const insuranceRetailGoldFacts = [
  // Fact 1: Insurance Policies
  {
    name: 'gold.fact_insurance_policies',
    description: 'Insurance policy fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'ACCUMULATING_SNAPSHOT',
    grain: 'One row per policy',
    primaryKey: ['policy_fact_key'],
    foreignKeys: [
      { column: 'policy_key', references: 'gold.dim_insurance_policy' },
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'product_key', references: 'gold.dim_insurance_product' },
      { column: 'agent_key', references: 'gold.dim_insurance_agent' },
      { column: 'policy_status_key', references: 'gold.dim_policy_status' },
      { column: 'issue_date_key', references: 'gold.dim_date' },
      { column: 'effective_date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'coverage_amount',
      'annual_premium',
      'total_premiums_paid',
      'total_claims_paid',
      'policy_tenure_days'
    ],
    schema: {
      policy_fact_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      policy_key: "BIGINT NOT NULL COMMENT 'FK to dim_insurance_policy'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      product_key: "BIGINT NOT NULL COMMENT 'FK to dim_insurance_product'",
      agent_key: "BIGINT COMMENT 'FK to dim_insurance_agent'",
      policy_status_key: "BIGINT NOT NULL COMMENT 'FK to dim_policy_status'",
      issue_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      effective_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      expiration_date_key: "INT COMMENT 'FK to dim_date'",
      coverage_amount: "DECIMAL(18,2)",
      annual_premium: "DECIMAL(18,2)",
      deductible_amount: "DECIMAL(18,2)",
      total_premiums_paid: "DECIMAL(18,2)",
      total_claims_paid: "DECIMAL(18,2)",
      policy_tenure_days: "INT",
      beneficiary_count: "INT",
      is_active: "BOOLEAN",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 2: Insurance Claims
  {
    name: 'gold.fact_insurance_claims',
    description: 'Insurance claims fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'TRANSACTION',
    grain: 'One row per claim',
    primaryKey: ['claim_key'],
    foreignKeys: [
      { column: 'policy_key', references: 'gold.dim_insurance_policy' },
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'claim_type_key', references: 'gold.dim_claim_type' },
      { column: 'adjuster_key', references: 'gold.dim_claim_adjuster' },
      { column: 'claim_date_key', references: 'gold.dim_date' },
      { column: 'incident_date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'claimed_amount',
      'approved_amount',
      'paid_amount',
      'deductible_applied',
      'days_to_approval',
      'days_to_payment'
    ],
    schema: {
      claim_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      claim_id: "BIGINT NOT NULL COMMENT 'Business key'",
      policy_key: "BIGINT NOT NULL COMMENT 'FK to dim_insurance_policy'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      claim_type_key: "BIGINT NOT NULL COMMENT 'FK to dim_claim_type'",
      adjuster_key: "BIGINT COMMENT 'FK to dim_claim_adjuster'",
      claim_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      incident_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      approval_date_key: "INT COMMENT 'FK to dim_date'",
      payment_date_key: "INT COMMENT 'FK to dim_date'",
      claim_number: "STRING NOT NULL",
      claim_status: "STRING NOT NULL",
      claimed_amount: "DECIMAL(18,2) NOT NULL",
      approved_amount: "DECIMAL(18,2)",
      paid_amount: "DECIMAL(18,2)",
      deductible_applied: "DECIMAL(18,2)",
      days_to_approval: "INT",
      days_to_payment: "INT",
      is_fraud_flagged: "BOOLEAN",
      is_approved: "BOOLEAN",
      is_paid: "BOOLEAN",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 3: Premium Payments
  {
    name: 'gold.fact_premium_payments',
    description: 'Premium payment transactions fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'TRANSACTION',
    grain: 'One row per premium payment',
    primaryKey: ['premium_payment_key'],
    foreignKeys: [
      { column: 'policy_key', references: 'gold.dim_insurance_policy' },
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'payment_method_key', references: 'gold.dim_payment_method' },
      { column: 'payment_date_key', references: 'gold.dim_date' },
      { column: 'due_date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'payment_amount',
      'premium_amount',
      'late_fee',
      'discount_amount',
      'days_late'
    ],
    schema: {
      premium_payment_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      payment_id: "BIGINT NOT NULL COMMENT 'Business key'",
      policy_key: "BIGINT NOT NULL COMMENT 'FK to dim_insurance_policy'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      payment_method_key: "BIGINT COMMENT 'FK to dim_payment_method'",
      payment_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      due_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      payment_amount: "DECIMAL(18,2) NOT NULL",
      premium_amount: "DECIMAL(18,2) NOT NULL",
      late_fee: "DECIMAL(18,2)",
      discount_amount: "DECIMAL(18,2)",
      payment_status: "STRING NOT NULL",
      is_late_payment: "BOOLEAN",
      days_late: "INT",
      payment_channel: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 4: Policy Quotes
  {
    name: 'gold.fact_policy_quotes',
    description: 'Policy quotes fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'TRANSACTION',
    grain: 'One row per quote',
    primaryKey: ['quote_key'],
    foreignKeys: [
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'product_key', references: 'gold.dim_insurance_product' },
      { column: 'agent_key', references: 'gold.dim_insurance_agent' },
      { column: 'quote_date_key', references: 'gold.dim_date' }
    ],
    measures: [
      'coverage_amount',
      'quoted_premium',
      'deductible_amount',
      'risk_score',
      'days_to_conversion'
    ],
    schema: {
      quote_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      quote_id: "BIGINT NOT NULL COMMENT 'Business key'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      product_key: "BIGINT COMMENT 'FK to dim_insurance_product'",
      agent_key: "BIGINT COMMENT 'FK to dim_insurance_agent'",
      quote_date_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      conversion_date_key: "INT COMMENT 'FK to dim_date'",
      quote_number: "STRING NOT NULL",
      coverage_amount: "DECIMAL(18,2)",
      quoted_premium: "DECIMAL(18,2) NOT NULL",
      premium_frequency: "STRING",
      deductible_amount: "DECIMAL(18,2)",
      quote_status: "STRING NOT NULL",
      risk_score: "DECIMAL(5,2)",
      is_converted: "BOOLEAN",
      days_to_conversion: "INT",
      channel: "STRING",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 5: Policy Performance
  {
    name: 'gold.fact_policy_performance',
    description: 'Policy performance metrics fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per policy per month',
    primaryKey: ['policy_performance_key'],
    foreignKeys: [
      { column: 'policy_key', references: 'gold.dim_insurance_policy' },
      { column: 'customer_key', references: 'gold.dim_customer' },
      { column: 'product_key', references: 'gold.dim_insurance_product' },
      { column: 'month_key', references: 'gold.dim_date' }
    ],
    measures: [
      'premiums_collected',
      'claims_paid',
      'loss_ratio',
      'policy_value'
    ],
    schema: {
      policy_performance_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      policy_key: "BIGINT NOT NULL COMMENT 'FK to dim_insurance_policy'",
      customer_key: "BIGINT NOT NULL COMMENT 'FK to dim_customer'",
      product_key: "BIGINT NOT NULL COMMENT 'FK to dim_insurance_product'",
      month_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      premiums_collected: "DECIMAL(18,2)",
      claims_paid: "DECIMAL(18,2)",
      claims_count: "INT",
      loss_ratio: "DECIMAL(5,2) COMMENT 'Claims paid / Premiums collected'",
      policy_value: "DECIMAL(18,2)",
      policy_age_months: "INT",
      is_in_force: "BOOLEAN",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Fact 6: Agent Performance
  {
    name: 'gold.fact_agent_performance',
    description: 'Agent performance metrics fact table',
    layer: 'GOLD',
    type: 'FACT',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per agent per month',
    primaryKey: ['agent_performance_key'],
    foreignKeys: [
      { column: 'agent_key', references: 'gold.dim_insurance_agent' },
      { column: 'month_key', references: 'gold.dim_date' }
    ],
    measures: [
      'new_policies_sold',
      'total_premium_written',
      'total_commission_earned',
      'retention_rate'
    ],
    schema: {
      agent_performance_key: "BIGINT PRIMARY KEY COMMENT 'Surrogate key'",
      agent_key: "BIGINT NOT NULL COMMENT 'FK to dim_insurance_agent'",
      month_key: "INT NOT NULL COMMENT 'FK to dim_date'",
      new_policies_sold: "INT",
      renewals_processed: "INT",
      total_premium_written: "DECIMAL(18,2)",
      total_commission_earned: "DECIMAL(18,2)",
      active_policies_count: "INT",
      cancellation_count: "INT",
      retention_rate: "DECIMAL(5,2)",
      average_policy_size: "DECIMAL(18,2)",
      created_timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  }
];

export const insuranceRetailGoldLayerComplete = {
  description: 'Gold layer for retail insurance domain - dimensional model',
  layer: 'GOLD',
  dimensions: insuranceRetailGoldDimensions,
  facts: insuranceRetailGoldFacts,
  totalDimensions: insuranceRetailGoldDimensions.length,
  totalFacts: insuranceRetailGoldFacts.length
};

export default insuranceRetailGoldLayerComplete;
