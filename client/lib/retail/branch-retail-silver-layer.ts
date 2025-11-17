/**
 * BRANCH-RETAIL SILVER LAYER - Complete Implementation
 * 
 * Domain: Branch Retail
 * Area: Retail Banking
 * Purpose: Golden records for branches, tellers, ATMs
 * 
 * All 14 silver tables for retail branch domain
 * MDM, SCD Type 2, data quality standards applied
 */

export const branchRetailSilverTables = [
  // Table 1: Branch Master Golden
  {
    name: 'silver.retail_branch_master_golden',
    description: 'Golden record for branch locations with MDM',
    grain: 'One current row per branch',
    scdType: 'Type 2',
    
    primaryKey: ['branch_sk'],
    naturalKey: ['branch_id'],
    
    sourceTables: ['bronze.retail_branch_master'],
    
    schema: {
      branch_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Surrogate key'",
      
      branch_id: "BIGINT",
      branch_code: "STRING UNIQUE",
      branch_uuid: "STRING UNIQUE",
      
      branch_name: "STRING",
      branch_dba_name: "STRING",
      
      branch_type: "STRING COMMENT 'Full Service|Limited Service|Drive-Through Only'",
      branch_category: "STRING COMMENT 'Flagship|Regional Hub|Community'",
      
      branch_status: "STRING COMMENT 'Active|Temporarily Closed|Permanently Closed'",
      branch_status_date: "DATE",
      
      opening_date: "DATE",
      closing_date: "DATE",
      branch_age_years: "INTEGER",
      
      // LOCATION
      street_address: "STRING",
      address_line2: "STRING",
      city: "STRING",
      state: "STRING",
      postal_code: "STRING",
      county: "STRING",
      country: "STRING",
      
      latitude: "DECIMAL(10,8)",
      longitude: "DECIMAL(11,8)",
      
      // HIERARCHY
      region_code: "STRING",
      region_name: "STRING",
      district_code: "STRING",
      district_name: "STRING",
      market_code: "STRING",
      market_name: "STRING",
      
      // DEMOGRAPHICS
      msa_code: "STRING",
      cbsa_code: "STRING",
      census_tract: "STRING",
      
      median_household_income: "DECIMAL(18,2)",
      population_density: "DECIMAL(10,2)",
      urban_rural_classification: "STRING",
      
      // FACILITIES
      total_square_footage: "INTEGER",
      has_drive_through: "BOOLEAN",
      drive_through_lanes: "INTEGER",
      has_atm: "BOOLEAN",
      atm_count: "INTEGER",
      has_itm: "BOOLEAN",
      has_safe_deposit_boxes: "BOOLEAN",
      
      parking_spaces: "INTEGER",
      handicap_accessible: "BOOLEAN",
      
      // STAFFING
      manager_employee_sk: "BIGINT",
      teller_count: "INTEGER",
      banker_count: "INTEGER",
      total_staff_count: "INTEGER",
      
      // HOURS
      lobby_hours_per_week: "DECIMAL(5,2)",
      drive_through_hours_per_week: "DECIMAL(5,2)",
      
      // SERVICES
      offers_mortgages: "BOOLEAN",
      offers_business_banking: "BOOLEAN",
      offers_wealth_management: "BOOLEAN",
      offers_foreign_currency: "BOOLEAN",
      
      // PERFORMANCE
      performance_tier: "STRING",
      branch_segment: "STRING",
      
      customer_count: "INTEGER",
      primary_customer_count: "INTEGER",
      
      // BUILDING
      building_ownership: "STRING COMMENT 'Owned|Leased'",
      lease_expiration_date: "DATE",
      monthly_rent_amount: "DECIMAL(18,2)",
      
      // COMPLIANCE
      fdic_insured: "BOOLEAN",
      cra_assessment_area: "STRING",
      
      // SCD TYPE 2 (REQUIRED)
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      record_version: "INTEGER",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      accuracy_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      created_by: "STRING",
      updated_by: "STRING",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 2: Teller Transactions Golden
  {
    name: 'silver.retail_teller_transactions_golden',
    description: 'Golden record of teller transactions',
    grain: 'One row per teller transaction',
    scdType: 'Type 1',
    
    primaryKey: ['teller_transaction_sk'],
    naturalKey: ['teller_transaction_id'],
    
    sourceTables: ['bronze.retail_teller_transactions'],
    
    schema: {
      teller_transaction_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      teller_transaction_id: "BIGINT UNIQUE",
      teller_transaction_uuid: "STRING UNIQUE",
      
      branch_sk: "BIGINT COMMENT 'FK to branch golden'",
      branch_id: "BIGINT",
      
      teller_sk: "BIGINT COMMENT 'FK to employee dim'",
      teller_id: "BIGINT",
      teller_station_number: "STRING",
      
      customer_sk: "BIGINT COMMENT 'FK to customer golden'",
      customer_id: "BIGINT",
      
      account_sk: "BIGINT COMMENT 'FK to account golden'",
      account_id: "BIGINT",
      
      transaction_date: "DATE",
      transaction_date_key: "INTEGER COMMENT 'FK to dim_date'",
      transaction_timestamp: "TIMESTAMP",
      transaction_time: "TIME",
      
      transaction_type: "STRING",
      transaction_category: "STRING COMMENT 'Cash|Check|Transfer|Service'",
      
      transaction_amount: "DECIMAL(18,2)",
      cash_in_amount: "DECIMAL(18,2)",
      cash_out_amount: "DECIMAL(18,2)",
      
      check_count: "INTEGER",
      check_total_amount: "DECIMAL(18,2)",
      
      is_structured_transaction: "BOOLEAN",
      requires_ctr: "BOOLEAN",
      ctr_filed: "BOOLEAN",
      requires_sar: "BOOLEAN",
      sar_filed: "BOOLEAN",
      
      wait_time_minutes: "INTEGER",
      service_time_minutes: "INTEGER",
      total_time_minutes: "INTEGER",
      
      customer_satisfaction_rating: "INTEGER",
      
      is_error: "BOOLEAN",
      is_reversal: "BOOLEAN",
      requires_supervisor_override: "BOOLEAN",
      
      cross_sell_offered: "BOOLEAN",
      cross_sell_accepted: "BOOLEAN",
      cross_sell_product_type: "STRING",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
      source_load_timestamp: "TIMESTAMP",
      silver_processing_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 3: ATM Master Golden
  {
    name: 'silver.retail_atm_master_golden',
    description: 'Golden record for ATM machines',
    grain: 'One current row per ATM',
    scdType: 'Type 2',
    
    primaryKey: ['atm_sk'],
    naturalKey: ['atm_id'],
    
    sourceTables: ['bronze.retail_atm_master'],
    
    schema: {
      atm_sk: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      atm_id: "BIGINT",
      atm_serial_number: "STRING UNIQUE",
      atm_terminal_id: "STRING UNIQUE",
      
      branch_sk: "BIGINT COMMENT 'FK to branch (NULL if off-premise)'",
      branch_id: "BIGINT",
      
      atm_location_type: "STRING",
      
      street_address: "STRING",
      city: "STRING",
      state: "STRING",
      postal_code: "STRING",
      latitude: "DECIMAL(10,8)",
      longitude: "DECIMAL(11,8)",
      
      atm_manufacturer: "STRING",
      atm_model: "STRING",
      
      install_date: "DATE",
      atm_age_years: "INTEGER",
      
      atm_status: "STRING",
      
      supports_deposits: "BOOLEAN",
      supports_check_deposits: "BOOLEAN",
      supports_cash_withdrawal: "BOOLEAN",
      supports_cardless_withdrawal: "BOOLEAN",
      has_contactless_reader: "BOOLEAN",
      
      max_cash_capacity: "DECIMAL(18,2)",
      
      atm_network: "STRING",
      
      surcharge_fee_amount: "DECIMAL(18,2)",
      
      // SCD2
      effective_date: "DATE",
      expiration_date: "DATE DEFAULT '9999-12-31'",
      is_current: "BOOLEAN DEFAULT TRUE",
      record_version: "INTEGER",
      
      // DATA QUALITY
      data_quality_score: "DECIMAL(5,2)",
      completeness_score: "DECIMAL(5,2)",
      source_system_of_record: "STRING",
      
      // AUDIT
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 4: ATM Transactions Golden
  {
    name: 'silver.retail_atm_transactions_golden',
    description: 'Conformed ATM transaction data',
    scd2: false,
    grain: 'One row per ATM transaction',
    key_fields: ['atm_transaction_id'],
    schema: {
      atm_transaction_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      atm_transaction_id: "BIGINT UNIQUE",
      atm_key: "BIGINT",
      branch_key: "BIGINT",
      customer_key: "BIGINT",
      transaction_date: "DATE",
      transaction_timestamp: "TIMESTAMP",
      transaction_hour: "INTEGER COMMENT '0-23'",
      transaction_day_of_week: "STRING",
      transaction_type: "STRING",
      transaction_type_category: "STRING COMMENT 'Cash|Inquiry|Transfer'",
      transaction_amount: "DECIMAL(18,2)",
      transaction_fee: "DECIMAL(18,2)",
      surcharge_flag: "BOOLEAN",
      is_own_network: "BOOLEAN COMMENT 'Own bank ATM vs foreign'",
      transaction_status: "STRING",
      decline_reason: "STRING",
      decline_category: "STRING COMMENT 'Insufficient Funds|Invalid PIN|Card Issue|System Error'",
      is_approved: "BOOLEAN",
      is_declined: "BOOLEAN",
      row_created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 5: Branch Appointments Golden
  {
    name: 'silver.retail_branch_appointments_golden',
    description: 'Conformed customer appointment data',
    scd2: false,
    grain: 'One row per appointment',
    key_fields: ['appointment_id'],
    schema: {
      appointment_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      appointment_id: "BIGINT UNIQUE",
      branch_key: "BIGINT",
      customer_key: "BIGINT",
      banker_key: "BIGINT",
      appointment_date: "DATE",
      appointment_time: "TIME",
      appointment_datetime: "TIMESTAMP",
      appointment_duration_minutes: "INTEGER",
      appointment_type: "STRING",
      appointment_type_category: "STRING COMMENT 'Sales|Service|Advisory'",
      appointment_channel: "STRING",
      appointment_status: "STRING",
      is_completed: "BOOLEAN",
      is_no_show: "BOOLEAN",
      is_cancelled: "BOOLEAN",
      cancellation_reason: "STRING",
      outcome: "STRING",
      products_sold_count: "INTEGER",
      products_sold_value: "DECIMAL(18,2)",
      is_successful_sale: "BOOLEAN",
      row_created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 6: Branch Traffic Golden
  {
    name: 'silver.retail_branch_traffic_golden',
    description: 'Conformed branch foot traffic metrics',
    scd2: false,
    grain: 'One row per branch per hour',
    key_fields: ['branch_id', 'traffic_date', 'traffic_hour'],
    schema: {
      traffic_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      branch_key: "BIGINT",
      traffic_date: "DATE",
      traffic_hour: "INTEGER",
      traffic_datetime: "TIMESTAMP",
      day_of_week: "STRING",
      is_weekend: "BOOLEAN",
      is_holiday: "BOOLEAN",
      visitor_count: "INTEGER",
      customer_count: "INTEGER",
      new_customer_count: "INTEGER",
      customer_percentage: "DECIMAL(5,2) COMMENT 'Customers as % of total visitors'",
      avg_wait_time_minutes: "DECIMAL(10,2)",
      max_wait_time_minutes: "DECIMAL(10,2)",
      avg_service_time_minutes: "DECIMAL(10,2)",
      wait_time_band: "STRING COMMENT '<5min|5-10min|10-20min|20+min'",
      is_peak_hour: "BOOLEAN COMMENT 'Peak traffic hour flag'",
      row_created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 7: Teller Balancing Golden
  {
    name: 'silver.retail_teller_balancing_golden',
    description: 'Conformed teller balancing data',
    scd2: false,
    grain: 'One row per teller per business day',
    key_fields: ['teller_id', 'business_date'],
    schema: {
      balancing_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      teller_key: "BIGINT",
      branch_key: "BIGINT",
      business_date: "DATE",
      beginning_cash_balance: "DECIMAL(18,2)",
      cash_received: "DECIMAL(18,2)",
      cash_dispensed: "DECIMAL(18,2)",
      expected_ending_balance: "DECIMAL(18,2)",
      actual_ending_balance: "DECIMAL(18,2)",
      variance_amount: "DECIMAL(18,2)",
      variance_percentage: "DECIMAL(10,4)",
      variance_reason: "STRING",
      variance_category: "STRING COMMENT 'Overage|Shortage|Balanced'",
      transaction_count: "INTEGER",
      is_balanced: "BOOLEAN COMMENT 'No variance'",
      is_over: "BOOLEAN",
      is_short: "BOOLEAN",
      is_material_variance: "BOOLEAN COMMENT 'Variance exceeds threshold'",
      row_created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 8: Branch Sales Golden
  {
    name: 'silver.retail_branch_sales_golden',
    description: 'Conformed branch product sales',
    scd2: false,
    grain: 'One row per sale',
    key_fields: ['sale_id'],
    schema: {
      sale_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      sale_id: "BIGINT UNIQUE",
      branch_key: "BIGINT",
      customer_key: "BIGINT",
      banker_key: "BIGINT",
      product_key: "BIGINT",
      sale_date: "DATE",
      product_code: "STRING",
      product_category: "STRING",
      product_name: "STRING",
      sale_amount: "DECIMAL(18,2)",
      commission_amount: "DECIMAL(18,2)",
      sale_channel: "STRING",
      sale_channel_category: "STRING COMMENT 'In-Person|Remote'",
      is_cross_sell: "BOOLEAN",
      is_upsell: "BOOLEAN",
      is_new_customer: "BOOLEAN",
      customer_tenure_months: "INTEGER",
      row_created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 9: Branch Service Requests Golden
  {
    name: 'silver.retail_branch_service_requests_golden',
    description: 'Conformed customer service requests',
    scd2: false,
    grain: 'One row per service request',
    key_fields: ['request_id'],
    schema: {
      request_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      request_id: "BIGINT UNIQUE",
      branch_key: "BIGINT",
      customer_key: "BIGINT",
      employee_key: "BIGINT",
      request_date: "DATE",
      request_timestamp: "TIMESTAMP",
      request_type: "STRING",
      request_category: "STRING",
      request_priority: "STRING COMMENT 'Low|Medium|High|Urgent'",
      request_status: "STRING",
      resolution_date: "DATE",
      resolution_timestamp: "TIMESTAMP",
      resolution_description: "STRING",
      days_to_resolve: "INTEGER",
      is_resolved: "BOOLEAN",
      is_escalated: "BOOLEAN",
      satisfaction_score: "INTEGER COMMENT '1-5'",
      satisfaction_tier: "STRING COMMENT 'Very Dissatisfied|Dissatisfied|Neutral|Satisfied|Very Satisfied'",
      row_created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 10: Safe Deposit Boxes Golden
  {
    name: 'silver.retail_safe_deposit_boxes_golden',
    description: 'Golden record for safe deposit boxes',
    scd2: true,
    grain: 'One row per box per effective period',
    key_fields: ['box_id', 'effective_start_date'],
    schema: {
      box_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      box_id: "BIGINT",
      branch_key: "BIGINT",
      customer_key: "BIGINT",
      box_number: "STRING",
      box_size: "STRING",
      box_size_category: "STRING COMMENT 'Small|Medium|Large'",
      box_location: "STRING",
      rental_status: "STRING",
      rental_start_date: "DATE",
      rental_end_date: "DATE",
      rental_duration_months: "INTEGER",
      annual_rental_fee: "DECIMAL(18,2)",
      last_payment_date: "DATE",
      days_since_payment: "INTEGER",
      last_access_date: "DATE",
      days_since_access: "INTEGER",
      access_count_ytd: "INTEGER",
      is_active: "BOOLEAN",
      is_delinquent: "BOOLEAN",
      effective_start_date: "DATE",
      effective_end_date: "DATE",
      is_current: "BOOLEAN",
      row_created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 11: Branch Expenses Golden
  {
    name: 'silver.retail_branch_expenses_golden',
    description: 'Conformed branch operating expenses',
    scd2: false,
    grain: 'One row per branch per month per expense category',
    key_fields: ['branch_id', 'expense_month', 'expense_category'],
    schema: {
      expense_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      branch_key: "BIGINT",
      expense_date: "DATE COMMENT 'First day of month'",
      expense_month: "INTEGER COMMENT '1-12'",
      expense_quarter: "INTEGER COMMENT '1-4'",
      expense_year: "INTEGER",
      expense_category: "STRING",
      expense_type: "STRING COMMENT 'Fixed|Variable'",
      expense_amount: "DECIMAL(18,2)",
      budget_amount: "DECIMAL(18,2)",
      variance_amount: "DECIMAL(18,2)",
      variance_percentage: "DECIMAL(10,2)",
      is_over_budget: "BOOLEAN",
      is_under_budget: "BOOLEAN",
      expense_subcategory: "STRING",
      row_created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 12: Branch Security Incidents Golden
  {
    name: 'silver.retail_branch_security_incidents_golden',
    description: 'Conformed branch security incidents',
    scd2: false,
    grain: 'One row per security incident',
    key_fields: ['incident_id'],
    schema: {
      incident_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      incident_id: "BIGINT UNIQUE",
      branch_key: "BIGINT",
      reporting_employee_key: "BIGINT",
      incident_date: "DATE",
      incident_timestamp: "TIMESTAMP",
      incident_hour: "INTEGER",
      incident_day_of_week: "STRING",
      incident_type: "STRING",
      incident_category: "STRING COMMENT 'Criminal|Fraud|Safety|Operational'",
      incident_severity: "STRING",
      incident_severity_score: "INTEGER COMMENT '1-5 scale'",
      law_enforcement_notified: "BOOLEAN",
      case_number: "STRING",
      incident_status: "STRING",
      resolution_date: "DATE",
      days_to_resolve: "INTEGER",
      financial_loss: "DECIMAL(18,2)",
      is_resolved: "BOOLEAN",
      row_created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 13: Branch Compliance Audits Golden
  {
    name: 'silver.retail_branch_compliance_audits_golden',
    description: 'Conformed compliance audit results',
    scd2: false,
    grain: 'One row per audit',
    key_fields: ['audit_id'],
    schema: {
      audit_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      audit_id: "BIGINT UNIQUE",
      branch_key: "BIGINT",
      audit_date: "DATE",
      audit_type: "STRING",
      audit_category: "STRING COMMENT 'Regulatory|Operational|Financial'",
      audit_period_start: "DATE",
      audit_period_end: "DATE",
      audit_duration_days: "INTEGER",
      auditor_name: "STRING",
      audit_result: "STRING",
      findings_count: "INTEGER",
      critical_findings_count: "INTEGER",
      high_findings_count: "INTEGER",
      medium_findings_count: "INTEGER",
      low_findings_count: "INTEGER",
      remediation_required: "BOOLEAN",
      remediation_due_date: "DATE",
      remediation_completion_date: "DATE",
      days_to_remediate: "INTEGER",
      audit_score: "INTEGER COMMENT '0-100'",
      audit_grade: "STRING COMMENT 'A|B|C|D|F'",
      is_passed: "BOOLEAN",
      row_created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },

  // Table 14: Branch Performance Metrics Golden
  {
    name: 'silver.retail_branch_performance_metrics_golden',
    description: 'Consolidated branch performance KPIs',
    scd2: false,
    grain: 'One row per branch per month',
    key_fields: ['branch_id', 'performance_month'],
    schema: {
      performance_key: "BIGINT PRIMARY KEY AUTO_INCREMENT",
      branch_key: "BIGINT",
      performance_date: "DATE COMMENT 'First day of month'",
      performance_month: "INTEGER",
      performance_quarter: "INTEGER",
      performance_year: "INTEGER",
      total_customers: "INTEGER",
      new_customers: "INTEGER",
      lost_customers: "INTEGER",
      net_new_customers: "INTEGER",
      total_deposits: "DECIMAL(18,2)",
      total_loans: "DECIMAL(18,2)",
      total_revenue: "DECIMAL(18,2)",
      total_expenses: "DECIMAL(18,2)",
      net_income: "DECIMAL(18,2)",
      accounts_opened: "INTEGER",
      accounts_closed: "INTEGER",
      credit_cards_issued: "INTEGER",
      loans_originated: "INTEGER",
      cross_sell_count: "INTEGER",
      cross_sell_revenue: "DECIMAL(18,2)",
      teller_count: "INTEGER",
      banker_count: "INTEGER",
      staff_hours: "DECIMAL(10,2)",
      avg_wait_time_minutes: "DECIMAL(10,2)",
      avg_service_time_minutes: "DECIMAL(10,2)",
      avg_satisfaction_score: "DECIMAL(5,2)",
      teller_errors: "INTEGER",
      ctr_filed: "INTEGER",
      sar_filed: "INTEGER",
      row_created_timestamp: "TIMESTAMP",
      source_system: "STRING",
    },
  },
];

export const branchRetailSilverLayerComplete = {
  description: 'Complete silver layer for retail branch domain with MDM and SCD2',
  layer: 'SILVER',
  tables: branchRetailSilverTables,
  totalTables: 14,
  estimatedSize: '1.5TB',
  refreshFrequency: 'Hourly',
  dataQuality: {
    completenessTarget: 95,
    accuracyTarget: 99,
    consistencyTarget: 98,
    timelinessTarget: 99.5,
  },
  retention: '7 years',
};
