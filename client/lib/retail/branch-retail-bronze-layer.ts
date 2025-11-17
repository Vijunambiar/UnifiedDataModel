/**
 * BRANCH-RETAIL BRONZE LAYER - Complete Implementation
 * 
 * Domain: Branch Retail
 * Area: Retail Banking
 * Purpose: Branch network, teller operations, ATM network, physical channel
 * 
 * All 18 bronze tables for retail branch domain
 * Industry-accurate, comprehensive, enterprise-ready
 */

export const branchRetailBronzeTables = [
  // Table 1: Branch Master
  {
    name: 'bronze.retail_branch_master',
    description: 'Branch location master with all branch attributes',
    sourceSystem: 'BRANCH_MANAGEMENT_SYSTEM',
    sourceTable: 'BRANCH_MASTER',
    loadType: 'CDC',
    
    grain: 'One row per branch location',
    primaryKey: ['branch_id', 'source_system'],
    
    estimatedRows: 5000,
    avgRowSize: 2048,
    estimatedSize: '10MB',
    
    schema: {
      // PRIMARY KEYS
      branch_id: "BIGINT PRIMARY KEY COMMENT 'Unique branch identifier'",
      source_system: "STRING PRIMARY KEY",
      
      // NATURAL KEYS
      branch_code: "STRING UNIQUE COMMENT 'Branch code/number'",
      branch_uuid: "STRING UNIQUE",
      
      // BRANCH IDENTIFICATION
      branch_name: "STRING COMMENT 'Official branch name'",
      branch_dba_name: "STRING COMMENT 'Doing Business As name'",
      
      branch_type: "STRING COMMENT 'Full Service|Limited Service|Drive-Through Only|In-Store|Mobile'",
      branch_category: "STRING COMMENT 'Flagship|Regional Hub|Community|Satellite|Pop-Up'",
      
      // STATUS
      branch_status: "STRING COMMENT 'Active|Temporarily Closed|Permanently Closed|Under Construction'",
      branch_status_date: "DATE",
      
      opening_date: "DATE COMMENT 'Branch opening date'",
      closing_date: "DATE COMMENT 'Branch closing date if applicable'",
      
      // LOCATION
      street_address: "STRING",
      address_line2: "STRING",
      city: "STRING",
      state: "STRING COMMENT 'State/province code'",
      postal_code: "STRING",
      county: "STRING",
      country: "STRING COMMENT 'ISO 3166-1 alpha-2'",
      
      latitude: "DECIMAL(10,8) COMMENT 'Geocoded latitude'",
      longitude: "DECIMAL(11,8) COMMENT 'Geocoded longitude'",
      
      // GEOGRAPHIC HIERARCHY
      region_code: "STRING COMMENT 'Bank region'",
      region_name: "STRING",
      district_code: "STRING COMMENT 'Bank district'",
      district_name: "STRING",
      market_code: "STRING COMMENT 'Market/MSA code'",
      market_name: "STRING",
      
      // DEMOGRAPHICS
      msa_code: "STRING COMMENT 'Metropolitan Statistical Area code'",
      cbsa_code: "STRING COMMENT 'Core Based Statistical Area'",
      census_tract: "STRING",
      
      median_household_income: "DECIMAL(18,2) COMMENT 'Area median income'",
      population_density: "DECIMAL(10,2) COMMENT 'Population per sq mile'",
      
      urban_rural_classification: "STRING COMMENT 'Urban|Suburban|Rural'",
      
      // FACILITIES
      total_square_footage: "INTEGER",
      lobby_square_footage: "INTEGER",
      
      has_drive_through: "BOOLEAN",
      drive_through_lanes: "INTEGER",
      
      has_night_deposit: "BOOLEAN",
      has_safe_deposit_boxes: "BOOLEAN",
      safe_deposit_box_count: "INTEGER",
      
      has_atm: "BOOLEAN COMMENT 'On-site ATM'",
      atm_count: "INTEGER",
      
      has_itm: "BOOLEAN COMMENT 'Interactive Teller Machine'",
      itm_count: "INTEGER",
      
      has_coin_counter: "BOOLEAN",
      has_notary_service: "BOOLEAN",
      
      parking_spaces: "INTEGER",
      has_handicap_accessibility: "BOOLEAN",
      
      // STAFFING
      manager_employee_id: "BIGINT COMMENT 'Branch manager'",
      assistant_manager_employee_id: "BIGINT",
      
      teller_count: "INTEGER COMMENT 'Number of teller stations'",
      banker_count: "INTEGER COMMENT 'Number of personal bankers'",
      total_staff_count: "INTEGER",
      
      // OPERATING HOURS
      monday_open_time: "TIME",
      monday_close_time: "TIME",
      tuesday_open_time: "TIME",
      tuesday_close_time: "TIME",
      wednesday_open_time: "TIME",
      wednesday_close_time: "TIME",
      thursday_open_time: "TIME",
      thursday_close_time: "TIME",
      friday_open_time: "TIME",
      friday_close_time: "TIME",
      saturday_open_time: "TIME",
      saturday_close_time: "TIME",
      sunday_open_time: "TIME",
      sunday_close_time: "TIME",
      
      lobby_hours_per_week: "DECIMAL(5,2)",
      drive_through_hours_per_week: "DECIMAL(5,2)",
      
      // SERVICES OFFERED
      offers_mortgages: "BOOLEAN",
      offers_personal_loans: "BOOLEAN",
      offers_business_banking: "BOOLEAN",
      offers_wealth_management: "BOOLEAN",
      offers_safe_deposit_boxes: "BOOLEAN",
      offers_foreign_currency: "BOOLEAN",
      
      // PERFORMANCE TIER
      performance_tier: "STRING COMMENT 'Tier 1|Tier 2|Tier 3 based on volume'",
      branch_segment: "STRING COMMENT 'High Volume|Medium Volume|Low Volume'",
      
      // CUSTOMER BASE
      customer_count: "INTEGER COMMENT 'Number of customers assigned to branch'",
      primary_customer_count: "INTEGER COMMENT 'Customers with branch as primary'",
      
      // BUILDING DETAILS
      building_ownership: "STRING COMMENT 'Owned|Leased|Ground Lease'",
      lease_expiration_date: "DATE COMMENT 'If leased'",
      monthly_rent_amount: "DECIMAL(18,2)",
      
      // SECURITY
      has_security_guard: "BOOLEAN",
      has_vault: "BOOLEAN",
      vault_size: "STRING COMMENT 'Small|Medium|Large'",
      
      last_security_audit_date: "DATE",
      
      // COMPLIANCE
      fdic_insured: "BOOLEAN",
      cra_assessment_area: "STRING COMMENT 'Community Reinvestment Act area'",
      
      last_compliance_review_date: "DATE",
      next_compliance_review_date: "DATE",
      
      // CONTACT
      phone_number: "STRING",
      fax_number: "STRING",
      email_address: "STRING",
      
      // AUDIT TRAIL (REQUIRED)
      source_record_id: "STRING",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 2: Teller Transactions
  {
    name: 'bronze.retail_teller_transactions',
    description: 'Individual teller transaction records',
    sourceSystem: 'TELLER_SYSTEM',
    sourceTable: 'TELLER_TRANSACTIONS',
    loadType: 'CDC',
    
    grain: 'One row per teller transaction',
    primaryKey: ['teller_transaction_id', 'source_system'],
    
    estimatedRows: 2000000000,
    avgRowSize: 1024,
    estimatedSize: '2TB',
    
    schema: {
      teller_transaction_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      teller_transaction_uuid: "STRING UNIQUE",
      
      // BRANCH & TELLER
      branch_id: "BIGINT COMMENT 'FK to branch master'",
      teller_id: "BIGINT COMMENT 'Teller employee ID'",
      teller_station_number: "STRING",
      
      // CUSTOMER
      customer_id: "BIGINT COMMENT 'FK to customer'",
      account_id: "BIGINT COMMENT 'Account involved in transaction'",
      
      // TRANSACTION
      transaction_date: "DATE",
      transaction_timestamp: "TIMESTAMP",
      transaction_time: "TIME",
      
      transaction_type: "STRING COMMENT 'Deposit|Withdrawal|Check Cashing|Account Opening|Loan Payment|etc.'",
      transaction_category: "STRING COMMENT 'Cash|Check|Transfer|Service'",
      
      transaction_amount: "DECIMAL(18,2)",
      transaction_currency: "STRING",
      
      // CASH HANDLING
      cash_in_amount: "DECIMAL(18,2) COMMENT 'Cash received from customer'",
      cash_out_amount: "DECIMAL(18,2) COMMENT 'Cash given to customer'",
      
      check_count: "INTEGER COMMENT 'Number of checks in transaction'",
      check_total_amount: "DECIMAL(18,2)",
      
      // TRANSACTION DETAILS
      is_structured_transaction: "BOOLEAN COMMENT 'Multiple transactions to avoid CTR'",
      requires_ctr: "BOOLEAN COMMENT 'Currency Transaction Report required (>$10K)'",
      ctr_filed: "BOOLEAN",
      
      requires_sar: "BOOLEAN COMMENT 'Suspicious Activity Report'",
      sar_filed: "BOOLEAN",
      
      // SERVICE CODES
      gl_code: "STRING COMMENT 'General ledger code'",
      product_code: "STRING",
      
      // CUSTOMER SERVICE
      wait_time_minutes: "INTEGER COMMENT 'Time customer waited'",
      service_time_minutes: "INTEGER COMMENT 'Time to complete transaction'",
      
      customer_satisfaction_rating: "INTEGER COMMENT '1-5 scale if surveyed'",
      
      // ERRORS & EXCEPTIONS
      is_error: "BOOLEAN",
      error_code: "STRING",
      error_description: "STRING",
      
      is_reversal: "BOOLEAN",
      reversal_reason: "STRING",
      original_transaction_id: "BIGINT",
      
      requires_supervisor_override: "BOOLEAN",
      supervisor_employee_id: "BIGINT",
      
      // CROSS-SELL
      cross_sell_offered: "BOOLEAN",
      cross_sell_accepted: "BOOLEAN",
      cross_sell_product_type: "STRING",
      
      // AUDIT
      source_system: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      record_hash: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 3: ATM Master
  {
    name: 'bronze.retail_atm_master',
    description: 'ATM machine master with location and configuration',
    sourceSystem: 'ATM_MANAGEMENT_SYSTEM',
    sourceTable: 'ATM_MASTER',
    loadType: 'CDC',
    
    grain: 'One row per ATM machine',
    primaryKey: ['atm_id', 'source_system'],
    
    schema: {
      atm_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      
      atm_serial_number: "STRING UNIQUE COMMENT 'Machine serial number'",
      atm_terminal_id: "STRING UNIQUE",
      
      // LOCATION
      branch_id: "BIGINT COMMENT 'FK to branch (NULL if off-premise)'",
      
      atm_location_type: "STRING COMMENT 'On-Premise Branch|Off-Premise|Drive-Through|In-Store|Airport|etc.'",
      
      street_address: "STRING",
      city: "STRING",
      state: "STRING",
      postal_code: "STRING",
      
      latitude: "DECIMAL(10,8)",
      longitude: "DECIMAL(11,8)",
      
      // ATM CONFIGURATION
      atm_manufacturer: "STRING COMMENT 'NCR|Diebold|Hyosung|etc.'",
      atm_model: "STRING",
      
      install_date: "DATE",
      last_upgrade_date: "DATE",
      
      atm_status: "STRING COMMENT 'Active|Inactive|Out of Service|Under Maintenance'",
      
      // CAPABILITIES
      supports_deposits: "BOOLEAN",
      supports_check_deposits: "BOOLEAN COMMENT 'Check imaging capability'",
      supports_cash_withdrawal: "BOOLEAN",
      supports_balance_inquiry: "BOOLEAN",
      supports_transfers: "BOOLEAN",
      supports_bill_payment: "BOOLEAN",
      
      has_contactless_reader: "BOOLEAN COMMENT 'NFC/tap to pay'",
      has_cardless_withdrawal: "BOOLEAN COMMENT 'QR code or mobile app'",
      
      // CASH CAPACITY
      cash_cassette_count: "INTEGER",
      max_cash_capacity: "DECIMAL(18,2)",
      
      dispenses_denomination_1: "INTEGER COMMENT 'e.g., $1 bills'",
      dispenses_denomination_5: "INTEGER",
      dispenses_denomination_10: "INTEGER",
      dispenses_denomination_20: "INTEGER",
      dispenses_denomination_50: "INTEGER",
      dispenses_denomination_100: "INTEGER",
      
      // NETWORK
      atm_network: "STRING COMMENT 'Proprietary|Allpoint|MoneyPass|Plus|Cirrus|Star'",
      network_participation: "STRING COMMENT 'Networks this ATM participates in'",
      
      // OPERATING HOURS
      operating_hours: "STRING COMMENT '24/7|Business Hours|Limited'",
      
      // FEES
      surcharge_fee_amount: "DECIMAL(18,2) COMMENT 'Fee for non-customers'",
      balance_inquiry_fee: "DECIMAL(18,2)",
      
      // MAINTENANCE
      last_cash_replenishment_date: "TIMESTAMP",
      last_maintenance_date: "DATE",
      next_maintenance_date: "DATE",
      
      // AUDIT
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
      created_timestamp: "TIMESTAMP",
      updated_timestamp: "TIMESTAMP",
    },
  },
  
  // Table 4: ATM Transactions
  {
    name: 'bronze.retail_atm_transactions',
    description: 'ATM transaction log',
    sourceSystem: 'ATM_PROCESSOR',
    sourceTable: 'ATM_TRANSACTIONS',
    loadType: 'STREAMING',
    grain: 'One row per ATM transaction',
    primaryKey: ['atm_transaction_id', 'source_system'],
    schema: {
      atm_transaction_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      atm_id: "STRING",
      branch_id: "BIGINT",
      transaction_timestamp: "TIMESTAMP",
      transaction_date: "DATE",
      customer_id: "BIGINT",
      card_number_hash: "STRING",
      transaction_type: "STRING COMMENT 'Withdrawal|Deposit|Balance Inquiry|Transfer'",
      transaction_amount: "DECIMAL(18,2)",
      transaction_fee: "DECIMAL(18,2)",
      surcharge_flag: "BOOLEAN COMMENT 'Non-network ATM surcharge'",
      transaction_status: "STRING COMMENT 'Approved|Declined|Timeout|Cancelled'",
      decline_reason: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 5: ATM Cash Management
  {
    name: 'bronze.retail_atm_cash_management',
    description: 'ATM cash replenishment and balancing',
    sourceSystem: 'ATM_PROCESSOR',
    sourceTable: 'ATM_CASH_MGMT',
    loadType: 'CDC',
    grain: 'One row per ATM cash event',
    primaryKey: ['cash_event_id', 'source_system'],
    schema: {
      cash_event_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      atm_id: "STRING",
      branch_id: "BIGINT",
      event_date: "DATE",
      event_type: "STRING COMMENT 'Replenishment|Balancing|Withdrawal Adjustment'",
      cash_loaded: "DECIMAL(18,2)",
      cash_removed: "DECIMAL(18,2)",
      beginning_balance: "DECIMAL(18,2)",
      ending_balance: "DECIMAL(18,2)",
      variance_amount: "DECIMAL(18,2)",
      replenishment_vendor: "STRING",
      employee_id: "BIGINT",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 6: Branch Appointments
  {
    name: 'bronze.retail_branch_appointments',
    description: 'Customer appointments at branches',
    sourceSystem: 'APPOINTMENT_SYSTEM',
    sourceTable: 'APPOINTMENTS',
    loadType: 'CDC',
    grain: 'One row per appointment',
    primaryKey: ['appointment_id', 'source_system'],
    schema: {
      appointment_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      branch_id: "BIGINT",
      customer_id: "BIGINT",
      appointment_date: "DATE",
      appointment_time: "TIME",
      appointment_duration_minutes: "INTEGER",
      appointment_type: "STRING COMMENT 'Account Opening|Loan Consultation|Financial Planning|Problem Resolution'",
      appointment_channel: "STRING COMMENT 'In-Person|Video Call|Phone'",
      banker_id: "BIGINT",
      appointment_status: "STRING COMMENT 'Scheduled|Confirmed|Completed|Cancelled|No-Show'",
      cancellation_reason: "STRING",
      outcome: "STRING COMMENT 'Sale Made|No Sale|Follow-Up Required'",
      products_sold: "STRING COMMENT 'JSON list of products'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 7: Branch Traffic
  {
    name: 'bronze.retail_branch_traffic',
    description: 'Foot traffic and customer visit tracking',
    sourceSystem: 'TRAFFIC_COUNTER',
    sourceTable: 'BRANCH_TRAFFIC',
    loadType: 'HOURLY',
    grain: 'One row per branch per hour',
    primaryKey: ['branch_id', 'traffic_date', 'traffic_hour', 'source_system'],
    schema: {
      branch_id: "BIGINT PRIMARY KEY",
      traffic_date: "DATE PRIMARY KEY",
      traffic_hour: "INTEGER PRIMARY KEY COMMENT '0-23'",
      source_system: "STRING PRIMARY KEY",
      visitor_count: "INTEGER COMMENT 'Total visitors entering branch'",
      customer_count: "INTEGER COMMENT 'Identified customers'",
      new_customer_count: "INTEGER",
      avg_wait_time_minutes: "DECIMAL(10,2)",
      max_wait_time_minutes: "DECIMAL(10,2)",
      avg_service_time_minutes: "DECIMAL(10,2)",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 8: Teller Balancing
  {
    name: 'bronze.retail_teller_balancing',
    description: 'Teller cash drawer balancing',
    sourceSystem: 'TELLER_SYSTEM',
    sourceTable: 'TELLER_BALANCING',
    loadType: 'DAILY',
    grain: 'One row per teller per day',
    primaryKey: ['teller_id', 'business_date', 'source_system'],
    schema: {
      teller_id: "BIGINT PRIMARY KEY",
      business_date: "DATE PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      branch_id: "BIGINT",
      beginning_cash_balance: "DECIMAL(18,2)",
      cash_received: "DECIMAL(18,2)",
      cash_dispensed: "DECIMAL(18,2)",
      expected_ending_balance: "DECIMAL(18,2)",
      actual_ending_balance: "DECIMAL(18,2)",
      variance_amount: "DECIMAL(18,2)",
      variance_reason: "STRING",
      transaction_count: "INTEGER",
      over_short_flag: "BOOLEAN COMMENT 'Over or short indicator'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 9: Branch Sales
  {
    name: 'bronze.retail_branch_sales',
    description: 'Product sales by branch',
    sourceSystem: 'SALES_SYSTEM',
    sourceTable: 'BRANCH_SALES',
    loadType: 'CDC',
    grain: 'One row per sale per branch',
    primaryKey: ['sale_id', 'source_system'],
    schema: {
      sale_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      branch_id: "BIGINT",
      sale_date: "DATE",
      customer_id: "BIGINT",
      banker_id: "BIGINT",
      product_code: "STRING",
      product_category: "STRING COMMENT 'Deposit|Loan|Card|Investment|Insurance'",
      product_name: "STRING",
      sale_amount: "DECIMAL(18,2)",
      commission_amount: "DECIMAL(18,2)",
      sale_channel: "STRING COMMENT 'In-Branch|Phone|Appointment|Referral'",
      is_cross_sell: "BOOLEAN",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 10: Branch Service Requests
  {
    name: 'bronze.retail_branch_service_requests',
    description: 'Customer service requests at branches',
    sourceSystem: 'SERVICE_REQUEST_SYSTEM',
    sourceTable: 'SERVICE_REQUESTS',
    loadType: 'CDC',
    grain: 'One row per service request',
    primaryKey: ['request_id', 'source_system'],
    schema: {
      request_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      branch_id: "BIGINT",
      customer_id: "BIGINT",
      request_date: "DATE",
      request_timestamp: "TIMESTAMP",
      request_type: "STRING COMMENT 'Account Issue|Card Issue|Loan Inquiry|Payment Help|General Inquiry'",
      request_category: "STRING",
      request_description: "STRING",
      assigned_employee_id: "BIGINT",
      request_status: "STRING COMMENT 'Open|In Progress|Resolved|Escalated|Closed'",
      resolution_date: "DATE",
      resolution_description: "STRING",
      satisfaction_score: "INTEGER COMMENT '1-5 scale'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 11: Branch Complaints
  {
    name: 'bronze.retail_branch_complaints',
    description: 'Customer complaints logged at branches',
    sourceSystem: 'COMPLAINT_SYSTEM',
    sourceTable: 'COMPLAINTS',
    loadType: 'CDC',
    grain: 'One row per complaint',
    primaryKey: ['complaint_id', 'source_system'],
    schema: {
      complaint_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      branch_id: "BIGINT",
      customer_id: "BIGINT",
      complaint_date: "DATE",
      complaint_type: "STRING COMMENT 'Service Quality|Wait Time|Employee Behavior|Product Issue|Fee Dispute'",
      complaint_category: "STRING",
      complaint_description: "STRING",
      severity: "STRING COMMENT 'Low|Medium|High|Critical'",
      assigned_manager_id: "BIGINT",
      complaint_status: "STRING COMMENT 'Filed|Under Review|Resolved|Escalated|Regulatory Reported'",
      resolution_date: "DATE",
      resolution_action: "STRING",
      regulatory_reportable: "BOOLEAN",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 12: Branch Referrals
  {
    name: 'bronze.retail_branch_referrals',
    description: 'Cross-sell and product referrals from branches',
    sourceSystem: 'REFERRAL_SYSTEM',
    sourceTable: 'REFERRALS',
    loadType: 'CDC',
    grain: 'One row per referral',
    primaryKey: ['referral_id', 'source_system'],
    schema: {
      referral_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      branch_id: "BIGINT",
      referring_employee_id: "BIGINT",
      referred_employee_id: "BIGINT",
      customer_id: "BIGINT",
      referral_date: "DATE",
      product_referred: "STRING COMMENT 'Credit Card|Loan|Investment|Insurance|Wealth Management'",
      referral_reason: "STRING",
      referral_status: "STRING COMMENT 'Pending|Contacted|Converted|Declined|Expired'",
      conversion_date: "DATE",
      conversion_amount: "DECIMAL(18,2)",
      referral_bonus: "DECIMAL(18,2)",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 13: Branch Events
  {
    name: 'bronze.retail_branch_events',
    description: 'Branch marketing events and promotions',
    sourceSystem: 'EVENT_SYSTEM',
    sourceTable: 'BRANCH_EVENTS',
    loadType: 'CDC',
    grain: 'One row per branch event',
    primaryKey: ['event_id', 'source_system'],
    schema: {
      event_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      branch_id: "BIGINT",
      event_date: "DATE",
      event_type: "STRING COMMENT 'Grand Opening|Financial Literacy Seminar|Promotional Event|Community Outreach'",
      event_name: "STRING",
      event_description: "STRING",
      attendee_count: "INTEGER",
      new_accounts_opened: "INTEGER",
      total_sales: "DECIMAL(18,2)",
      event_cost: "DECIMAL(18,2)",
      event_roi: "DECIMAL(18,2)",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 14: Safe Deposit Boxes
  {
    name: 'bronze.retail_safe_deposit_boxes',
    description: 'Safe deposit box inventory and rental',
    sourceSystem: 'VAULT_SYSTEM',
    sourceTable: 'SAFE_DEPOSIT_BOXES',
    loadType: 'SCD2',
    grain: 'One row per box per rental period',
    primaryKey: ['box_id', 'source_system'],
    schema: {
      box_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      branch_id: "BIGINT",
      box_number: "STRING",
      box_size: "STRING COMMENT 'Small|Medium|Large|XL'",
      box_location: "STRING COMMENT 'Vault location identifier'",
      rental_status: "STRING COMMENT 'Available|Rented|Maintenance|Delinquent'",
      customer_id: "BIGINT",
      rental_start_date: "DATE",
      rental_end_date: "DATE",
      annual_rental_fee: "DECIMAL(18,2)",
      last_payment_date: "DATE",
      last_access_date: "DATE",
      access_count_ytd: "INTEGER",
      is_delinquent: "BOOLEAN",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 15: Branch Expenses
  {
    name: 'bronze.retail_branch_expenses',
    description: 'Branch operating expenses',
    sourceSystem: 'FINANCE_SYSTEM',
    sourceTable: 'BRANCH_EXPENSES',
    loadType: 'MONTHLY',
    grain: 'One row per branch per month per expense category',
    primaryKey: ['branch_id', 'expense_month', 'expense_category', 'source_system'],
    schema: {
      branch_id: "BIGINT PRIMARY KEY",
      expense_month: "DATE PRIMARY KEY COMMENT 'First day of month'",
      expense_category: "STRING PRIMARY KEY COMMENT 'Rent|Utilities|Salaries|Benefits|Supplies|Maintenance|Marketing'",
      source_system: "STRING PRIMARY KEY",
      expense_amount: "DECIMAL(18,2)",
      budget_amount: "DECIMAL(18,2)",
      variance_amount: "DECIMAL(18,2)",
      variance_percentage: "DECIMAL(10,2)",
      expense_subcategory: "STRING",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 16: Branch Assets
  {
    name: 'bronze.retail_branch_assets',
    description: 'Branch equipment and asset inventory',
    sourceSystem: 'ASSET_MANAGEMENT',
    sourceTable: 'BRANCH_ASSETS',
    loadType: 'SCD2',
    grain: 'One row per asset',
    primaryKey: ['asset_id', 'source_system'],
    schema: {
      asset_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      branch_id: "BIGINT",
      asset_tag: "STRING UNIQUE",
      asset_type: "STRING COMMENT 'ATM|Computer|Furniture|Safe|Security System|HVAC'",
      asset_description: "STRING",
      asset_category: "STRING COMMENT 'IT Equipment|Furniture|Security|Infrastructure'",
      purchase_date: "DATE",
      purchase_cost: "DECIMAL(18,2)",
      current_value: "DECIMAL(18,2)",
      depreciation_method: "STRING",
      useful_life_years: "INTEGER",
      asset_status: "STRING COMMENT 'Active|Maintenance|Retired|Disposed'",
      last_maintenance_date: "DATE",
      next_maintenance_date: "DATE",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 17: Security Incidents
  {
    name: 'bronze.retail_branch_security_incidents',
    description: 'Branch security events and incidents',
    sourceSystem: 'SECURITY_SYSTEM',
    sourceTable: 'SECURITY_INCIDENTS',
    loadType: 'CDC',
    grain: 'One row per security incident',
    primaryKey: ['incident_id', 'source_system'],
    schema: {
      incident_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      branch_id: "BIGINT",
      incident_date: "DATE",
      incident_timestamp: "TIMESTAMP",
      incident_type: "STRING COMMENT 'Robbery|Burglary|Fraud Attempt|Suspicious Activity|System Breach|Employee Misconduct'",
      incident_severity: "STRING COMMENT 'Low|Medium|High|Critical'",
      incident_description: "STRING",
      reported_by_employee_id: "BIGINT",
      law_enforcement_notified: "BOOLEAN",
      case_number: "STRING",
      incident_status: "STRING COMMENT 'Reported|Under Investigation|Resolved|Closed'",
      resolution_date: "DATE",
      financial_loss: "DECIMAL(18,2)",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },

  // Table 18: Compliance Audits
  {
    name: 'bronze.retail_branch_compliance_audits',
    description: 'Branch compliance audit results',
    sourceSystem: 'AUDIT_SYSTEM',
    sourceTable: 'COMPLIANCE_AUDITS',
    loadType: 'CDC',
    grain: 'One row per audit per branch',
    primaryKey: ['audit_id', 'source_system'],
    schema: {
      audit_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      branch_id: "BIGINT",
      audit_date: "DATE",
      audit_type: "STRING COMMENT 'BSA/AML|Fair Lending|Consumer Protection|Safety and Soundness|OFAC|CRA'",
      audit_period_start: "DATE",
      audit_period_end: "DATE",
      auditor_name: "STRING",
      audit_result: "STRING COMMENT 'Pass|Pass with Findings|Fail'",
      findings_count: "INTEGER",
      critical_findings_count: "INTEGER",
      remediation_required: "BOOLEAN",
      remediation_due_date: "DATE",
      remediation_completion_date: "DATE",
      audit_score: "INTEGER COMMENT '0-100'",
      source_record_id: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING",
    },
  },
];

export const branchRetailBronzeLayerComplete = {
  description: 'Complete bronze layer for retail branch domain',
  layer: 'BRONZE',
  tables: branchRetailBronzeTables,
  totalTables: 18,
  estimatedSize: '2.5TB',
  refreshFrequency: 'Real-time streaming + CDC for transactions, Daily for master data',
  retention: '7 years',
  
  keyFeatures: [
    'Branch network master data',
    'Teller transaction processing',
    'ATM network and transactions',
    'Branch traffic and appointments',
    'Cash management and balancing',
    'Service quality metrics',
    'Cross-sell tracking',
    'Compliance and security',
    'CRA (Community Reinvestment Act) reporting',
    'CTR/SAR regulatory reporting',
  ],
};
