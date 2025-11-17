export const collectionsRetailBronzeTables = [
  // Table 1: Delinquent Accounts
  {
    name: 'bronze.retail_delinquent_accounts',
    description: 'Raw delinquent account data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'DELINQUENT_ACCOUNTS',
    loadType: 'BATCH',
    grain: 'One row per delinquent account snapshot',
    primaryKey: ['delinquency_id', 'source_system', 'load_timestamp'],
    schema: {
      delinquency_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP PRIMARY KEY",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      account_type: "STRING COMMENT 'LOAN, CREDIT_CARD, MORTGAGE, LINE_OF_CREDIT'",
      delinquency_date: "DATE",
      delinquency_status: "STRING COMMENT '30_DAYS, 60_DAYS, 90_DAYS, 120_PLUS_DAYS, CHARGED_OFF'",
      days_past_due: "INT",
      past_due_amount: "DECIMAL(18,2)",
      total_balance: "DECIMAL(18,2)",
      minimum_payment_due: "DECIMAL(18,2)",
      last_payment_date: "DATE",
      last_payment_amount: "DECIMAL(18,2)",
      missed_payments_count: "INT",
      collection_stage: "STRING COMMENT 'EARLY, MID, LATE, LEGAL, RECOVERY'",
      collector_id: "BIGINT",
      assigned_date: "DATE",
      created_date: "TIMESTAMP",
      updated_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 2: Collection Activities
  {
    name: 'bronze.retail_collection_activities',
    description: 'Raw collection activity data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'ACTIVITIES',
    loadType: 'STREAMING',
    grain: 'One row per collection activity',
    primaryKey: ['activity_id', 'source_system'],
    schema: {
      activity_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      delinquency_id: "BIGINT",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      activity_date: "DATE",
      activity_timestamp: "TIMESTAMP",
      activity_type: "STRING COMMENT 'CALL, EMAIL, SMS, LETTER, VISIT'",
      activity_category: "STRING COMMENT 'CONTACT_ATTEMPT, PROMISE_TO_PAY, PAYMENT_ARRANGEMENT, SKIP_TRACE'",
      contact_result: "STRING COMMENT 'SUCCESSFUL, NO_ANSWER, BUSY, DISCONNECTED, WRONG_NUMBER'",
      collector_id: "BIGINT",
      duration_seconds: "INT",
      notes: "STRING",
      next_action_date: "DATE",
      created_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 3: Payment Promises
  {
    name: 'bronze.retail_payment_promises',
    description: 'Raw payment promise data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'PAYMENT_PROMISES',
    loadType: 'STREAMING',
    grain: 'One row per payment promise',
    primaryKey: ['promise_id', 'source_system'],
    schema: {
      promise_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      delinquency_id: "BIGINT",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      promise_date: "DATE",
      promised_payment_date: "DATE",
      promised_amount: "DECIMAL(18,2)",
      promise_status: "STRING COMMENT 'PENDING, KEPT, BROKEN, PARTIAL'",
      actual_payment_date: "DATE",
      actual_payment_amount: "DECIMAL(18,2)",
      collector_id: "BIGINT",
      payment_method: "STRING",
      created_date: "TIMESTAMP",
      updated_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 4: Payment Arrangements
  {
    name: 'bronze.retail_payment_arrangements',
    description: 'Raw payment arrangement data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'PAYMENT_ARRANGEMENTS',
    loadType: 'BATCH',
    grain: 'One row per payment arrangement',
    primaryKey: ['arrangement_id', 'source_system'],
    schema: {
      arrangement_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      delinquency_id: "BIGINT",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      arrangement_date: "DATE",
      arrangement_type: "STRING COMMENT 'INSTALLMENT, SETTLEMENT, FORBEARANCE, MODIFICATION'",
      total_amount_owed: "DECIMAL(18,2)",
      settlement_amount: "DECIMAL(18,2)",
      installment_count: "INT",
      installment_amount: "DECIMAL(18,2)",
      first_payment_date: "DATE",
      payment_frequency: "STRING COMMENT 'WEEKLY, BI_WEEKLY, MONTHLY'",
      arrangement_status: "STRING COMMENT 'ACTIVE, COMPLETED, DEFAULTED, CANCELLED'",
      completion_date: "DATE",
      collector_id: "BIGINT",
      approval_date: "DATE",
      created_date: "TIMESTAMP",
      updated_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 5: Collection Payments
  {
    name: 'bronze.retail_collection_payments',
    description: 'Raw payments made through collections',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'PAYMENTS',
    loadType: 'STREAMING',
    grain: 'One row per payment',
    primaryKey: ['payment_id', 'source_system'],
    schema: {
      payment_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      delinquency_id: "BIGINT",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      arrangement_id: "BIGINT",
      promise_id: "BIGINT",
      payment_date: "DATE",
      payment_amount: "DECIMAL(18,2)",
      payment_method: "STRING COMMENT 'ACH, DEBIT_CARD, CREDIT_CARD, CHECK, CASH'",
      payment_type: "STRING COMMENT 'ONE_TIME, INSTALLMENT, SETTLEMENT, FULL_BALANCE'",
      transaction_id: "STRING",
      payment_status: "STRING COMMENT 'PENDING, PROCESSED, FAILED, REVERSED'",
      collector_id: "BIGINT",
      created_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 6: Collectors
  {
    name: 'bronze.retail_collectors',
    description: 'Raw collector/agent data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'COLLECTORS',
    loadType: 'BATCH',
    grain: 'One row per collector snapshot',
    primaryKey: ['collector_id', 'source_system', 'load_timestamp'],
    schema: {
      collector_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP PRIMARY KEY",
      collector_code: "STRING",
      full_name: "STRING",
      collector_type: "STRING COMMENT 'INTERNAL, EXTERNAL, AGENCY'",
      team_id: "BIGINT",
      specialization: "STRING COMMENT 'EARLY_STAGE, LATE_STAGE, LEGAL, SKIP_TRACE'",
      license_number: "STRING",
      active_accounts: "INT",
      total_collected_mtd: "DECIMAL(18,2)",
      collection_rate: "DECIMAL(5,2)",
      hire_date: "DATE",
      termination_date: "DATE",
      is_active: "BOOLEAN",
      created_date: "TIMESTAMP",
      updated_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 7: Charge-Offs
  {
    name: 'bronze.retail_charge_offs',
    description: 'Raw charge-off data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'CHARGE_OFFS',
    loadType: 'BATCH',
    grain: 'One row per charge-off',
    primaryKey: ['charge_off_id', 'source_system'],
    schema: {
      charge_off_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      delinquency_id: "BIGINT",
      charge_off_date: "DATE",
      charge_off_amount: "DECIMAL(18,2)",
      outstanding_principal: "DECIMAL(18,2)",
      outstanding_interest: "DECIMAL(18,2)",
      outstanding_fees: "DECIMAL(18,2)",
      days_delinquent: "INT",
      charge_off_reason: "STRING",
      recovery_strategy: "STRING COMMENT 'LEGAL, AGENCY, SALE, WRITE_OFF'",
      assigned_agency: "STRING",
      created_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 8: Recoveries
  {
    name: 'bronze.retail_recoveries',
    description: 'Raw recovery data from charged-off accounts',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'RECOVERIES',
    loadType: 'STREAMING',
    grain: 'One row per recovery payment',
    primaryKey: ['recovery_id', 'source_system'],
    schema: {
      recovery_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      charge_off_id: "BIGINT",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      recovery_date: "DATE",
      recovery_amount: "DECIMAL(18,2)",
      recovery_method: "STRING COMMENT 'VOLUNTARY_PAYMENT, GARNISHMENT, ASSET_SALE, LEGAL_SETTLEMENT'",
      recovery_type: "STRING COMMENT 'PRINCIPAL, INTEREST, FEES, COSTS'",
      collector_id: "BIGINT",
      agency_name: "STRING",
      created_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 9: Legal Actions
  {
    name: 'bronze.retail_legal_actions',
    description: 'Raw legal action data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'LEGAL_ACTIONS',
    loadType: 'BATCH',
    grain: 'One row per legal action',
    primaryKey: ['legal_action_id', 'source_system'],
    schema: {
      legal_action_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      delinquency_id: "BIGINT",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      action_date: "DATE",
      action_type: "STRING COMMENT 'LAWSUIT, JUDGMENT, GARNISHMENT, LIEN, BANKRUPTCY'",
      filing_date: "DATE",
      court_name: "STRING",
      case_number: "STRING",
      judgment_amount: "DECIMAL(18,2)",
      judgment_date: "DATE",
      action_status: "STRING COMMENT 'FILED, PENDING, JUDGMENT_OBTAINED, DISMISSED'",
      attorney_name: "STRING",
      created_date: "TIMESTAMP",
      updated_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 10: Bankruptcies
  {
    name: 'bronze.retail_bankruptcies',
    description: 'Raw bankruptcy filing data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'BANKRUPTCIES',
    loadType: 'BATCH',
    grain: 'One row per bankruptcy filing',
    primaryKey: ['bankruptcy_id', 'source_system'],
    schema: {
      bankruptcy_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      customer_id: "BIGINT",
      filing_date: "DATE",
      bankruptcy_chapter: "STRING COMMENT 'CHAPTER_7, CHAPTER_11, CHAPTER_13'",
      case_number: "STRING",
      court_name: "STRING",
      bankruptcy_status: "STRING COMMENT 'FILED, DISMISSED, DISCHARGED, CONVERTED'",
      discharge_date: "DATE",
      total_liabilities: "DECIMAL(18,2)",
      bank_debt_included: "DECIMAL(18,2)",
      affected_accounts_count: "INT",
      trustee_name: "STRING",
      created_date: "TIMESTAMP",
      updated_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 11: Skip Trace Activities
  {
    name: 'bronze.retail_skip_trace_activities',
    description: 'Raw skip trace activity data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'SKIP_TRACE',
    loadType: 'BATCH',
    grain: 'One row per skip trace activity',
    primaryKey: ['skip_trace_id', 'source_system'],
    schema: {
      skip_trace_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      delinquency_id: "BIGINT",
      skip_trace_date: "DATE",
      skip_reason: "STRING COMMENT 'BAD_ADDRESS, BAD_PHONE, NO_CONTACT'",
      vendor_used: "STRING",
      vendor_cost: "DECIMAL(18,2)",
      result_status: "STRING COMMENT 'LOCATED, NOT_LOCATED, DECEASED'",
      new_address_found: "BOOLEAN",
      new_phone_found: "BOOLEAN",
      new_employer_found: "BOOLEAN",
      collector_id: "BIGINT",
      created_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 12: Dispute Records
  {
    name: 'bronze.retail_dispute_records',
    description: 'Raw customer dispute data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'DISPUTES',
    loadType: 'STREAMING',
    grain: 'One row per dispute',
    primaryKey: ['dispute_id', 'source_system'],
    schema: {
      dispute_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      delinquency_id: "BIGINT",
      dispute_date: "DATE",
      dispute_type: "STRING COMMENT 'BILLING_ERROR, FRAUD, IDENTITY_THEFT, NOT_MY_DEBT'",
      dispute_amount: "DECIMAL(18,2)",
      dispute_status: "STRING COMMENT 'SUBMITTED, INVESTIGATING, RESOLVED, VALIDATED'",
      resolution_date: "DATE",
      resolution_outcome: "STRING COMMENT 'VALID, INVALID, PARTIAL'",
      adjusted_amount: "DECIMAL(18,2)",
      collector_id: "BIGINT",
      created_date: "TIMESTAMP",
      updated_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 13: Hardship Programs
  {
    name: 'bronze.retail_hardship_programs',
    description: 'Raw hardship program enrollment data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'HARDSHIP_PROGRAMS',
    loadType: 'BATCH',
    grain: 'One row per hardship enrollment',
    primaryKey: ['hardship_id', 'source_system'],
    schema: {
      hardship_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      delinquency_id: "BIGINT",
      enrollment_date: "DATE",
      hardship_type: "STRING COMMENT 'UNEMPLOYMENT, MEDICAL, DISASTER, MILITARY_DEPLOYMENT'",
      program_type: "STRING COMMENT 'PAYMENT_REDUCTION, PAYMENT_DEFERRAL, INTEREST_REDUCTION'",
      original_payment: "DECIMAL(18,2)",
      modified_payment: "DECIMAL(18,2)",
      program_duration_months: "INT",
      program_status: "STRING COMMENT 'ACTIVE, COMPLETED, DEFAULTED'",
      completion_date: "DATE",
      created_date: "TIMESTAMP",
      updated_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 14: Cease and Desist Requests
  {
    name: 'bronze.retail_cease_desist_requests',
    description: 'Raw cease and desist request data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'CEASE_DESIST',
    loadType: 'BATCH',
    grain: 'One row per cease and desist request',
    primaryKey: ['cease_desist_id', 'source_system'],
    schema: {
      cease_desist_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      request_date: "DATE",
      request_type: "STRING COMMENT 'PHONE, WRITTEN, ALL_CONTACT'",
      request_method: "STRING COMMENT 'LETTER, EMAIL, VERBAL'",
      request_status: "STRING COMMENT 'ACTIVE, RESCINDED'",
      rescind_date: "DATE",
      created_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 15: Collection Agencies
  {
    name: 'bronze.retail_collection_agencies',
    description: 'Raw third-party collection agency data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'AGENCIES',
    loadType: 'BATCH',
    grain: 'One row per agency',
    primaryKey: ['agency_id', 'source_system'],
    schema: {
      agency_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      agency_name: "STRING",
      agency_code: "STRING",
      agency_type: "STRING COMMENT 'CONTINGENCY, FLAT_FEE, DEBT_BUYER'",
      specialization: "STRING COMMENT 'CONSUMER, COMMERCIAL, MEDICAL'",
      commission_rate: "DECIMAL(5,4)",
      active_placements: "INT",
      total_placement_value: "DECIMAL(18,2)",
      total_recovered_mtd: "DECIMAL(18,2)",
      recovery_rate: "DECIMAL(5,2)",
      contract_start_date: "DATE",
      contract_end_date: "DATE",
      is_active: "BOOLEAN",
      created_date: "TIMESTAMP",
      updated_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 16: Agency Placements
  {
    name: 'bronze.retail_agency_placements',
    description: 'Raw agency placement data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'PLACEMENTS',
    loadType: 'BATCH',
    grain: 'One row per agency placement',
    primaryKey: ['placement_id', 'source_system'],
    schema: {
      placement_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      delinquency_id: "BIGINT",
      agency_id: "BIGINT",
      placement_date: "DATE",
      placement_amount: "DECIMAL(18,2)",
      placement_status: "STRING COMMENT 'ACTIVE, RECALLED, CLOSED, PAID_IN_FULL'",
      recall_date: "DATE",
      recall_reason: "STRING",
      total_collected: "DECIMAL(18,2)",
      commission_paid: "DECIMAL(18,2)",
      created_date: "TIMESTAMP",
      updated_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 17: Credit Bureau Reporting
  {
    name: 'bronze.retail_credit_bureau_reporting',
    description: 'Raw credit bureau reporting data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'CREDIT_REPORTING',
    loadType: 'BATCH',
    grain: 'One row per credit report update',
    primaryKey: ['reporting_id', 'source_system'],
    schema: {
      reporting_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      reporting_date: "DATE",
      bureau_name: "STRING COMMENT 'EQUIFAX, EXPERIAN, TRANSUNION'",
      account_status: "STRING COMMENT 'CURRENT, 30_DAYS_LATE, 60_DAYS_LATE, 90_DAYS_LATE, CHARGE_OFF'",
      days_past_due: "INT",
      balance_reported: "DECIMAL(18,2)",
      payment_status: "STRING",
      reporting_code: "STRING",
      created_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 18: Compliance Violations
  {
    name: 'bronze.retail_compliance_violations',
    description: 'Raw compliance violation data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'COMPLIANCE_VIOLATIONS',
    loadType: 'BATCH',
    grain: 'One row per violation',
    primaryKey: ['violation_id', 'source_system'],
    schema: {
      violation_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      collector_id: "BIGINT",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      violation_date: "DATE",
      violation_type: "STRING COMMENT 'FDCPA, TCPA, STATE_LAW, INTERNAL_POLICY'",
      violation_description: "STRING",
      severity: "STRING COMMENT 'LOW, MEDIUM, HIGH, CRITICAL'",
      violation_status: "STRING COMMENT 'REPORTED, INVESTIGATING, RESOLVED, ESCALATED'",
      resolution_date: "DATE",
      penalty_amount: "DECIMAL(18,2)",
      created_date: "TIMESTAMP",
      updated_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 19: Settlement Offers
  {
    name: 'bronze.retail_settlement_offers',
    description: 'Raw settlement offer data',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'SETTLEMENTS',
    loadType: 'BATCH',
    grain: 'One row per settlement offer',
    primaryKey: ['settlement_id', 'source_system'],
    schema: {
      settlement_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      delinquency_id: "BIGINT",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      offer_date: "DATE",
      total_balance: "DECIMAL(18,2)",
      settlement_amount: "DECIMAL(18,2)",
      settlement_percentage: "DECIMAL(5,2)",
      offer_expiry_date: "DATE",
      offer_status: "STRING COMMENT 'PENDING, ACCEPTED, REJECTED, EXPIRED, PAID'",
      acceptance_date: "DATE",
      payment_due_date: "DATE",
      actual_payment_date: "DATE",
      collector_id: "BIGINT",
      approval_required: "BOOLEAN",
      created_date: "TIMESTAMP",
      updated_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  },

  // Table 20: Collection Costs
  {
    name: 'bronze.retail_collection_costs',
    description: 'Raw collection-related costs and expenses',
    sourceSystem: 'COLLECTIONS_SYSTEM',
    sourceTable: 'COSTS',
    loadType: 'BATCH',
    grain: 'One row per cost entry',
    primaryKey: ['cost_id', 'source_system'],
    schema: {
      cost_id: "BIGINT PRIMARY KEY",
      source_system: "STRING PRIMARY KEY",
      load_timestamp: "TIMESTAMP",
      customer_id: "BIGINT",
      account_id: "BIGINT",
      delinquency_id: "BIGINT",
      cost_date: "DATE",
      cost_type: "STRING COMMENT 'LEGAL_FEE, COURT_COST, AGENCY_FEE, SKIP_TRACE, CREDIT_REPORT'",
      cost_amount: "DECIMAL(18,2)",
      vendor_name: "STRING",
      is_recoverable: "BOOLEAN",
      amount_recovered: "DECIMAL(18,2)",
      collector_id: "BIGINT",
      created_date: "TIMESTAMP",
      record_source: "STRING",
      load_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }
  }
];

export const collectionsRetailBronzeLayerComplete = {
  description: 'Bronze layer for retail collections domain - raw data from source systems',
  layer: 'BRONZE',
  tables: collectionsRetailBronzeTables,
  totalTables: collectionsRetailBronzeTables.length
};

export default collectionsRetailBronzeLayerComplete;
