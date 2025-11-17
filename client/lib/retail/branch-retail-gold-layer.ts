/**
 * BRANCH-RETAIL GOLD LAYER - Complete Implementation
 * 
 * Dimensional model (Kimball methodology) with:
 * - 9 Dimensions
 * - 5 Fact Tables
 * 
 * Grade A Target: Analytics-ready star schema for branch analytics
 */

export const branchRetailGoldDimensions = [
  // Dimension 1: Branch
  {
    name: 'gold.dim_retail_branch',
    description: 'Branch location dimension with full attributes',
    type: 'SCD Type 2',
    grain: 'One row per branch',
    
    primaryKey: 'branch_key',
    naturalKey: 'branch_id',
    
    sourceTables: ['silver.retail_branch_master_golden'],
    
    schema: {
      branch_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      branch_id: "BIGINT",
      branch_code: "STRING",
      
      branch_name: "STRING",
      branch_type: "STRING COMMENT 'Full Service|Limited Service|Drive-Through Only'",
      branch_category: "STRING COMMENT 'Flagship|Regional Hub|Community'",
      
      branch_status: "STRING",
      is_active: "BOOLEAN",
      is_closed: "BOOLEAN",
      
      opening_date: "DATE",
      branch_age_band: "STRING COMMENT '<1yr|1-3yr|3-5yr|5-10yr|10+yr'",
      
      // LOCATION HIERARCHY
      street_address: "STRING",
      city: "STRING",
      state: "STRING",
      state_name: "STRING",
      postal_code: "STRING",
      county: "STRING",
      country: "STRING",
      
      region_code: "STRING",
      region_name: "STRING",
      district_code: "STRING",
      district_name: "STRING",
      market_code: "STRING",
      market_name: "STRING",
      
      latitude: "DECIMAL(10,8)",
      longitude: "DECIMAL(11,8)",
      
      // DEMOGRAPHICS
      urban_rural: "STRING COMMENT 'Urban|Suburban|Rural'",
      median_hh_income_band: "STRING COMMENT '<$50K|$50K-$75K|$75K-$100K|$100K+'",
      population_density_tier: "STRING COMMENT 'High|Medium|Low'",
      
      // FACILITIES
      has_drive_through: "BOOLEAN",
      has_atm: "BOOLEAN",
      has_itm: "BOOLEAN",
      has_safe_deposit_boxes: "BOOLEAN",
      
      square_footage_tier: "STRING COMMENT '<2000|2000-4000|4000-6000|6000+'",
      
      // SERVICES
      offers_mortgages: "BOOLEAN",
      offers_business_banking: "BOOLEAN",
      offers_wealth_management: "BOOLEAN",
      
      service_level: "STRING COMMENT 'Full|Standard|Basic'",
      
      // PERFORMANCE
      performance_tier: "STRING COMMENT 'Tier 1|Tier 2|Tier 3'",
      branch_segment: "STRING COMMENT 'High Volume|Medium Volume|Low Volume'",
      
      // BUILDING
      building_ownership: "STRING COMMENT 'Owned|Leased'",
      
      // SCD2
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
      updated_date: "DATE",
    },
    
    hierarchies: [
      {
        name: 'Geographic Hierarchy',
        levels: [
          { level: 1, attribute: 'country', description: 'Country' },
          { level: 2, attribute: 'state', description: 'State/Province' },
          { level: 3, attribute: 'market_name', description: 'Market/MSA' },
          { level: 4, attribute: 'city', description: 'City' },
          { level: 5, attribute: 'branch_name', description: 'Branch' },
        ],
      },
      {
        name: 'Organizational Hierarchy',
        levels: [
          { level: 1, attribute: 'region_name', description: 'Region' },
          { level: 2, attribute: 'district_name', description: 'District' },
          { level: 3, attribute: 'branch_name', description: 'Branch' },
        ],
      },
    ],
  },
  
  // Dimension 2: ATM
  {
    name: 'gold.dim_retail_atm',
    description: 'ATM machine dimension',
    type: 'SCD Type 2',
    grain: 'One row per ATM',
    
    primaryKey: 'atm_key',
    naturalKey: 'atm_id',
    
    schema: {
      atm_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      atm_id: "BIGINT",
      atm_terminal_id: "STRING",
      
      branch_key: "BIGINT COMMENT 'FK to dim_retail_branch'",
      
      atm_location_type: "STRING COMMENT 'On-Premise|Off-Premise|Drive-Through'",
      
      city: "STRING",
      state: "STRING",
      postal_code: "STRING",
      
      atm_manufacturer: "STRING",
      atm_model: "STRING",
      
      atm_status: "STRING",
      is_active: "BOOLEAN",
      
      atm_age_band: "STRING COMMENT '<2yr|2-4yr|4-7yr|7+yr'",
      
      supports_deposits: "BOOLEAN",
      supports_check_deposits: "BOOLEAN",
      supports_cardless: "BOOLEAN",
      has_contactless: "BOOLEAN",
      
      capability_level: "STRING COMMENT 'Basic|Standard|Advanced'",
      
      atm_network: "STRING",
      
      has_surcharge_fee: "BOOLEAN",
      surcharge_fee_tier: "STRING COMMENT 'None|$1-$3|$3-$5|$5+'",
      
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 3: Teller Transaction Type
  {
    name: 'gold.dim_teller_transaction_type',
    description: 'Teller transaction type taxonomy',
    type: 'SCD Type 1',
    grain: 'One row per transaction type',
    
    primaryKey: 'teller_transaction_type_key',
    naturalKey: 'transaction_type_code',
    
    schema: {
      teller_transaction_type_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      transaction_type_code: "STRING UNIQUE",
      transaction_type_name: "STRING",
      transaction_type_description: "STRING",
      
      transaction_category: "STRING COMMENT 'Cash|Check|Transfer|Service|Account Maintenance'",
      transaction_direction: "STRING COMMENT 'Inbound|Outbound|Neutral'",
      
      is_cash_transaction: "BOOLEAN",
      is_check_transaction: "BOOLEAN",
      is_account_service: "BOOLEAN",
      
      requires_id_verification: "BOOLEAN",
      requires_signature: "BOOLEAN",
      
      average_service_time_minutes: "INTEGER",
      complexity_level: "STRING COMMENT 'Simple|Standard|Complex'",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 4: Branch Service Type
  {
    name: 'gold.dim_branch_service_type',
    description: 'Branch service type dimension',
    type: 'SCD Type 1',
    grain: 'One row per service type',
    
    primaryKey: 'service_type_key',
    naturalKey: 'service_type_code',
    
    schema: {
      service_type_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      service_type_code: "STRING UNIQUE",
      service_type_name: "STRING",
      service_category: "STRING COMMENT 'Transactional|Advisory|Account Management|Problem Resolution'",
      
      typical_duration_minutes: "INTEGER",
      requires_appointment: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 5: ATM Transaction Type
  {
    name: 'gold.dim_atm_transaction_type',
    description: 'ATM transaction type taxonomy',
    type: 'SCD Type 1',
    grain: 'One row per ATM transaction type',
    
    primaryKey: 'atm_transaction_type_key',
    naturalKey: 'atm_transaction_type_code',
    
    schema: {
      atm_transaction_type_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      atm_transaction_type_code: "STRING UNIQUE",
      atm_transaction_type_name: "STRING",
      
      transaction_category: "STRING COMMENT 'Withdrawal|Deposit|Inquiry|Transfer'",
      
      is_cash_withdrawal: "BOOLEAN",
      is_deposit: "BOOLEAN",
      is_balance_inquiry: "BOOLEAN",
      is_transfer: "BOOLEAN",
      
      requires_card: "BOOLEAN",
      supports_cardless: "BOOLEAN",
      
      created_date: "DATE",
    },
  },
  
  // Dimension 6: Branch Employee
  {
    name: 'gold.dim_branch_employee',
    description: 'Branch employees (tellers, bankers, managers)',
    type: 'SCD Type 2',
    grain: 'One row per employee per effective period',

    schema: {
      employee_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      employee_id: "BIGINT",
      employee_code: "STRING",
      employee_name: "STRING",
      employee_type: "STRING COMMENT 'Teller|Banker|Manager|Specialist'",
      employee_role: "STRING",
      employee_title: "STRING",
      hire_date: "DATE",
      termination_date: "DATE",
      employee_status: "STRING COMMENT 'Active|On Leave|Terminated'",
      is_active: "BOOLEAN",
      branch_key: "BIGINT COMMENT 'Current branch assignment'",
      years_of_service_band: "STRING COMMENT '<1yr|1-3yr|3-5yr|5-10yr|10+yr'",
      performance_tier: "STRING COMMENT 'Top Performer|Above Average|Average|Below Average'",
      sales_certified: "BOOLEAN",
      certifications: "STRING COMMENT 'JSON array'",
      effective_date: "DATE",
      expiration_date: "DATE",
      is_current: "BOOLEAN",
      created_date: "DATE",
    },
  },

  // Dimension 7: Appointment Type
  {
    name: 'gold.dim_appointment_type',
    description: 'Types of branch appointments',
    type: 'SCD Type 1',
    grain: 'One row per appointment type',

    schema: {
      appointment_type_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      appointment_type_code: "STRING UNIQUE",
      appointment_type_name: "STRING",
      appointment_category: "STRING COMMENT 'Sales|Service|Advisory|Problem Resolution'",
      typical_duration_minutes: "INTEGER",
      requires_specialist: "BOOLEAN",
      is_revenue_generating: "BOOLEAN",
      priority_level: "STRING COMMENT 'Standard|High Priority|VIP'",
      created_date: "DATE",
    },
  },

  // Dimension 8: Branch Channel
  {
    name: 'gold.dim_branch_channel',
    description: 'Branch service channels',
    type: 'SCD Type 1',
    grain: 'One row per channel',

    schema: {
      channel_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      channel_code: "STRING UNIQUE",
      channel_name: "STRING COMMENT 'Lobby|Drive-Through|ATM|ITM|Video Banking|Phone'",
      channel_category: "STRING COMMENT 'In-Person|Self-Service|Remote'",
      is_automated: "BOOLEAN",
      is_assisted: "BOOLEAN",
      requires_staff: "BOOLEAN",
      supports_transactions: "BOOLEAN",
      supports_account_opening: "BOOLEAN",
      created_date: "DATE",
    },
  },

  // Dimension 9: Time of Day
  {
    name: 'gold.dim_time_of_day',
    description: 'Time dimension for intraday analysis',
    type: 'SCD Type 1',
    grain: 'One row per hour',

    schema: {
      time_key: "INTEGER PRIMARY KEY COMMENT 'HHMM format'",
      hour_24: "INTEGER COMMENT '0-23'",
      hour_12: "INTEGER COMMENT '1-12'",
      am_pm: "STRING COMMENT 'AM|PM'",
      time_period: "STRING COMMENT 'Early Morning|Morning|Midday|Afternoon|Evening|Night'",
      is_business_hours: "BOOLEAN COMMENT '9AM-5PM'",
      is_peak_hours: "BOOLEAN COMMENT '11AM-2PM for branches'",
      is_lunch_hour: "BOOLEAN COMMENT '12PM-1PM'",
      time_display: "STRING COMMENT 'Formatted time string'",
    },
  },
];

export const branchRetailGoldFacts = [
  // Fact 1: Teller Transactions
  {
    name: 'gold.fact_retail_teller_transaction',
    description: 'Teller transaction fact table',
    factType: 'Transaction',
    grain: 'One row per teller transaction',
    
    dimensions: [
      'branch_key',
      'teller_key (dim_employee)',
      'customer_key',
      'account_key',
      'transaction_date_key',
      'transaction_time_key',
      'teller_transaction_type_key',
    ],
    
    schema: {
      teller_transaction_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      branch_key: "BIGINT",
      teller_key: "BIGINT",
      customer_key: "BIGINT",
      account_key: "BIGINT",
      transaction_date_key: "INTEGER",
      transaction_time_key: "INTEGER",
      teller_transaction_type_key: "BIGINT",
      
      teller_transaction_id: "BIGINT UNIQUE",
      
      transaction_timestamp: "TIMESTAMP",
      
      transaction_amount: "DECIMAL(18,2)",
      cash_in_amount: "DECIMAL(18,2)",
      cash_out_amount: "DECIMAL(18,2)",
      net_cash_amount: "DECIMAL(18,2) COMMENT 'Cash out - cash in'",
      
      check_count: "INTEGER",
      check_amount: "DECIMAL(18,2)",
      
      wait_time_minutes: "INTEGER",
      service_time_minutes: "INTEGER",
      total_time_minutes: "INTEGER",
      
      customer_satisfaction_score: "INTEGER",
      
      is_structured_transaction: "BOOLEAN",
      requires_ctr: "BOOLEAN",
      ctr_filed: "BOOLEAN",
      requires_sar: "BOOLEAN",
      
      is_error: "BOOLEAN",
      is_reversal: "BOOLEAN",
      requires_override: "BOOLEAN",
      
      cross_sell_offered: "BOOLEAN",
      cross_sell_accepted: "BOOLEAN",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 2000000000,
    estimatedSize: '400GB',
  },
  
  // Fact 2: ATM Transactions
  {
    name: 'gold.fact_retail_atm_transaction',
    description: 'ATM transaction fact table',
    factType: 'Transaction',
    grain: 'One row per ATM transaction',
    
    dimensions: [
      'atm_key',
      'branch_key',
      'customer_key',
      'account_key',
      'transaction_date_key',
      'transaction_time_key',
      'atm_transaction_type_key',
    ],
    
    schema: {
      atm_transaction_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      
      atm_key: "BIGINT",
      branch_key: "BIGINT",
      customer_key: "BIGINT",
      account_key: "BIGINT",
      transaction_date_key: "INTEGER",
      transaction_time_key: "INTEGER",
      atm_transaction_type_key: "BIGINT",
      
      transaction_timestamp: "TIMESTAMP",
      
      transaction_amount: "DECIMAL(18,2)",
      
      surcharge_fee: "DECIMAL(18,2)",
      network_fee: "DECIMAL(18,2)",
      
      is_own_customer: "BOOLEAN",
      is_on_us_transaction: "BOOLEAN",
      
      is_cardless: "BOOLEAN",
      is_contactless: "BOOLEAN",
      
      transaction_approved: "BOOLEAN",
      decline_reason: "STRING",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 5000000000,
    estimatedSize: '800GB',
  },
  
  // Fact 3: Branch Daily Snapshot
  {
    name: 'gold.fact_retail_branch_daily_snapshot',
    description: 'Daily branch performance snapshot',
    factType: 'Periodic Snapshot',
    grain: 'One row per branch per day',
    
    dimensions: [
      'branch_key',
      'date_key',
    ],
    
    schema: {
      branch_key: "BIGINT",
      date_key: "INTEGER",
      
      snapshot_date: "DATE",
      
      // TRAFFIC
      customer_visits: "INTEGER",
      transactions_count: "INTEGER",
      
      lobby_traffic: "INTEGER",
      drive_through_traffic: "INTEGER",
      
      // APPOINTMENTS
      appointments_scheduled: "INTEGER",
      appointments_completed: "INTEGER",
      appointments_no_show: "INTEGER",
      
      // SALES
      new_accounts_opened: "INTEGER",
      accounts_closed: "INTEGER",
      
      credit_cards_issued: "INTEGER",
      loans_originated: "INTEGER",
      
      cross_sell_count: "INTEGER",
      cross_sell_revenue: "DECIMAL(18,2)",
      
      // STAFFING
      teller_count: "INTEGER",
      banker_count: "INTEGER",
      staff_hours: "DECIMAL(10,2)",
      
      // CASH MANAGEMENT
      cash_on_hand: "DECIMAL(18,2)",
      cash_replenished: "DECIMAL(18,2)",
      
      // SERVICE QUALITY
      avg_wait_time_minutes: "DECIMAL(10,2)",
      avg_service_time_minutes: "DECIMAL(10,2)",
      avg_satisfaction_score: "DECIMAL(5,2)",
      
      // ERRORS & COMPLIANCE
      teller_errors: "INTEGER",
      overrides_required: "INTEGER",
      ctr_filed: "INTEGER",
      sar_filed: "INTEGER",
      
      created_timestamp: "TIMESTAMP",
    },
    
    estimatedRows: 3650000,
    estimatedSize: '10GB',
  },
  
  // Fact 4: Branch Appointments
  {
    name: 'gold.fact_retail_branch_appointments',
    description: 'Customer appointments at branches',
    factType: 'Transaction',
    grain: 'One row per appointment',

    dimensions: [
      'branch_key',
      'customer_key',
      'employee_key (banker)',
      'appointment_type_key',
      'appointment_date_key',
      'appointment_time_key',
    ],

    schema: {
      appointment_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",

      branch_key: "BIGINT",
      customer_key: "BIGINT",
      employee_key: "BIGINT COMMENT 'Banker/Advisor'",
      appointment_type_key: "BIGINT",
      appointment_date_key: "INTEGER",
      appointment_time_key: "INTEGER",

      appointment_id: "BIGINT UNIQUE",

      // MEASURES
      appointment_duration_minutes: "INTEGER",

      appointment_count: "INTEGER DEFAULT 1",

      products_sold_count: "INTEGER",
      products_sold_value: "DECIMAL(18,2)",

      // FLAGS
      is_completed: "BOOLEAN",
      is_no_show: "BOOLEAN",
      is_cancelled: "BOOLEAN",
      is_successful_sale: "BOOLEAN",

      // CATEGORIZATION
      appointment_channel: "STRING COMMENT 'In-Person|Video|Phone'",
      appointment_outcome: "STRING",

      created_timestamp: "TIMESTAMP",
    },

    estimatedRows: 50000000,
    estimatedSize: '8GB',
  },

  // Fact 5: Branch Service Requests
  {
    name: 'gold.fact_retail_branch_service_requests',
    description: 'Customer service requests at branches',
    factType: 'Transaction',
    grain: 'One row per service request',

    dimensions: [
      'branch_key',
      'customer_key',
      'employee_key (assigned)',
      'request_date_key',
      'resolution_date_key',
    ],

    schema: {
      service_request_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",

      branch_key: "BIGINT",
      customer_key: "BIGINT",
      employee_key: "BIGINT COMMENT 'Assigned employee'",
      request_date_key: "INTEGER",
      resolution_date_key: "INTEGER COMMENT 'Null if not resolved'",

      request_id: "BIGINT UNIQUE",

      // MEASURES
      request_count: "INTEGER DEFAULT 1",

      days_to_resolve: "INTEGER",

      satisfaction_score: "INTEGER COMMENT '1-5 scale'",

      // CATEGORIZATION
      request_type: "STRING",
      request_category: "STRING",
      request_priority: "STRING COMMENT 'Low|Medium|High|Urgent'",
      request_status: "STRING",

      // FLAGS
      is_resolved: "BOOLEAN",
      is_escalated: "BOOLEAN",
      is_satisfied: "BOOLEAN COMMENT 'Score >= 4'",

      created_timestamp: "TIMESTAMP",
    },

    estimatedRows: 80000000,
    estimatedSize: '12GB',
  },
];

export const branchRetailGoldLayerComplete = {
  description: 'Complete gold layer for retail branch domain with dimensional model',
  layer: 'GOLD',
  dimensions: branchRetailGoldDimensions,
  facts: branchRetailGoldFacts,
  totalDimensions: 9,
  totalFacts: 5,
  estimatedSize: '1.3TB',
  refreshFrequency: 'Daily for snapshots, Real-time for transactions',
  methodology: 'Kimball Dimensional Modeling',
};
