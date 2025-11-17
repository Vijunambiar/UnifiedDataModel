/**
 * FIS ACH TRACKER - COMPREHENSIVE DATA MODEL
 * 
 * Domain: Commercial Payments - ACH Exception Management
 * System: FIS Corporate ACH Tracker
 * Purpose: Real-time ACH transaction monitoring, exception management, and reconciliation
 * 
 * Coverage:
 * - ACH transaction lifecycle tracking (Submitted → Settled/Returned)
 * - Exception management (Returns, NOCs, Reversals)
 * - Same-day ACH monitoring
 * - Return code analysis (R01-R99)
 * - Reconciliation and settlement tracking
 */

// ============================================================================
// BRONZE LAYER - FIS ACH Tracker Raw Data
// ============================================================================

export const fisACHTrackerBronzeTables = [
  {
    name: 'bronze.fis_ach_tracker_transactions',
    description: 'Real-time ACH transaction tracking data from FIS ACH Tracker',
    sourceSystem: 'FIS_ACH_TRACKER',
    sourceTable: 'ACH_TRANSACTION_LOG',
    loadType: 'STREAMING',
    grain: 'One row per ACH transaction tracking event',
    
    schema: {
      // Transaction Identifiers
      tracker_transaction_id: "STRING PRIMARY KEY COMMENT 'FIS ACH Tracker unique transaction ID'",
      core_ach_id: "STRING COMMENT 'Link to core banking ACH transaction ID'",
      batch_id: "STRING COMMENT 'ACH batch file ID'",
      trace_number: "STRING COMMENT 'ACH trace number (8 digits)'",
      company_id: "STRING COMMENT 'Company identification number'",
      
      // Transaction Details
      transaction_type: "STRING COMMENT 'CREDIT|DEBIT'",
      sec_code: "STRING COMMENT 'CCD|CTP|CTX|PPD|WEB|TEL'",
      transaction_amount: "DECIMAL(18,2)",
      transaction_currency: "STRING DEFAULT 'USD'",
      effective_entry_date: "DATE COMMENT 'ACH effective date'",
      
      // Originator Information
      originator_company_name: "STRING",
      originator_account_number: "STRING",
      originator_routing_number: "STRING",
      originator_account_type: "STRING COMMENT 'CHECKING|SAVINGS|GL'",
      
      // Receiver Information
      receiver_name: "STRING",
      receiver_account_number: "STRING",
      receiver_routing_number: "STRING",
      receiver_account_type: "STRING COMMENT 'CHECKING|SAVINGS'",
      
      // Status Tracking
      current_status: "STRING COMMENT 'SUBMITTED|VALIDATED|BATCHED|TRANSMITTED|SETTLED|RETURNED|REVERSED'",
      previous_status: "STRING",
      status_timestamp: "TIMESTAMP",
      status_updated_by: "STRING COMMENT 'System or user who updated status'",
      
      // Same-Day ACH
      same_day_ach_flag: "BOOLEAN",
      same_day_settlement_date: "DATE",
      
      // Exception Flags
      exception_flag: "BOOLEAN",
      exception_type: "STRING COMMENT 'RETURN|NOC|REVERSAL|REJECT'",
      exception_timestamp: "TIMESTAMP",
      
      // Return Information
      return_code: "STRING COMMENT 'R01-R99 ACH return reason code'",
      return_description: "STRING",
      return_date: "DATE",
      return_settlement_date: "DATE",
      
      // NOC (Notification of Change)
      noc_flag: "BOOLEAN",
      noc_code: "STRING COMMENT 'C01-C13'",
      noc_corrected_value: "STRING COMMENT 'Corrected routing/account from NOC'",
      
      // Settlement Tracking
      settlement_status: "STRING COMMENT 'PENDING|SETTLED|FAILED'",
      settlement_date: "DATE",
      settlement_amount: "DECIMAL(18,2)",
      settlement_file_id: "STRING",
      
      // Reconciliation
      reconciliation_status: "STRING COMMENT 'MATCHED|UNMATCHED|EXCEPTION'",
      reconciliation_date: "DATE",
      reconciliation_notes: "STRING",
      
      // Transmission Details
      transmission_timestamp: "TIMESTAMP",
      transmission_file_name: "STRING",
      nacha_file_id: "STRING COMMENT 'NACHA file identification'",
      odfi_routing: "STRING COMMENT 'Originating DFI routing number'",
      rdfi_routing: "STRING COMMENT 'Receiving DFI routing number'",
      
      // Reversal Information
      reversal_flag: "BOOLEAN",
      reversal_reason: "STRING",
      reversal_timestamp: "TIMESTAMP",
      original_trace_number: "STRING COMMENT 'Trace number of reversed transaction'",
      
      // Validation
      validation_status: "STRING COMMENT 'PASSED|FAILED|WARNING'",
      validation_errors: "JSON COMMENT 'Array of validation error messages'",
      prenote_flag: "BOOLEAN COMMENT 'Prenote (zero-dollar) transaction'",
      
      // Business Context
      payment_purpose: "STRING COMMENT 'PAYROLL|VENDOR_PAYMENT|CUSTOMER_REFUND|TAX_PAYMENT'",
      invoice_number: "STRING",
      customer_reference: "STRING",
      internal_memo: "STRING",
      
      // FIS Tracker Metadata
      tracker_created_timestamp: "TIMESTAMP COMMENT 'When record created in FIS Tracker'",
      tracker_updated_timestamp: "TIMESTAMP COMMENT 'Last update in FIS Tracker'",
      tracker_session_id: "STRING",
      tracker_user_id: "STRING COMMENT 'User who initiated/reviewed transaction'",
      
      // Audit Trail
      source_system: "STRING DEFAULT 'FIS_ACH_TRACKER'",
      source_file_name: "STRING",
      load_timestamp: "TIMESTAMP",
      cdc_operation: "STRING COMMENT 'INSERT|UPDATE|DELETE'",
      record_hash: "STRING",
    },
  },
  
  {
    name: 'bronze.fis_ach_tracker_exceptions',
    description: 'ACH exception events captured by FIS Tracker',
    sourceSystem: 'FIS_ACH_TRACKER',
    sourceTable: 'EXCEPTION_LOG',
    loadType: 'STREAMING',
    grain: 'One row per exception event',
    
    schema: {
      exception_id: "STRING PRIMARY KEY",
      tracker_transaction_id: "STRING COMMENT 'FK to tracker transactions'",
      exception_type: "STRING COMMENT 'RETURN|NOC|REJECT|DUPLICATE|LIMIT_EXCEEDED'",
      exception_code: "STRING COMMENT 'R01-R99 or C01-C13'",
      exception_description: "STRING",
      exception_timestamp: "TIMESTAMP",
      exception_severity: "STRING COMMENT 'CRITICAL|HIGH|MEDIUM|LOW'",
      
      // Exception Details
      root_cause: "STRING",
      affected_amount: "DECIMAL(18,2)",
      business_impact: "STRING COMMENT 'REVENUE_LOSS|CUSTOMER_IMPACT|COMPLIANCE_RISK'",
      
      // Resolution
      resolution_status: "STRING COMMENT 'PENDING|IN_PROGRESS|RESOLVED|ESCALATED'",
      resolution_action: "STRING COMMENT 'AUTO_RETRY|MANUAL_REVIEW|CUSTOMER_CONTACT|CANCEL'",
      resolution_timestamp: "TIMESTAMP",
      resolved_by_user: "STRING",
      resolution_notes: "STRING",
      
      // SLA Tracking
      sla_deadline: "TIMESTAMP",
      sla_met_flag: "BOOLEAN",
      time_to_resolve_minutes: "INTEGER",
      
      // Audit
      source_system: "STRING DEFAULT 'FIS_ACH_TRACKER'",
      load_timestamp: "TIMESTAMP",
    },
  },
  
  {
    name: 'bronze.fis_ach_tracker_batches',
    description: 'ACH batch file tracking from FIS',
    sourceSystem: 'FIS_ACH_TRACKER',
    sourceTable: 'BATCH_LOG',
    loadType: 'STREAMING',
    grain: 'One row per ACH batch file',
    
    schema: {
      batch_id: "STRING PRIMARY KEY",
      batch_sequence_number: "INTEGER",
      batch_creation_timestamp: "TIMESTAMP",
      batch_submission_timestamp: "TIMESTAMP",
      
      // Batch Summary
      total_transactions: "INTEGER",
      total_debits: "INTEGER",
      total_credits: "INTEGER",
      total_amount: "DECIMAL(18,2)",
      total_debit_amount: "DECIMAL(18,2)",
      total_credit_amount: "DECIMAL(18,2)",
      
      // Batch Status
      batch_status: "STRING COMMENT 'CREATED|VALIDATED|SUBMITTED|TRANSMITTED|SETTLED|FAILED'",
      validation_status: "STRING COMMENT 'PASSED|FAILED'",
      validation_errors: "JSON",
      
      // Transmission
      transmission_timestamp: "TIMESTAMP",
      nacha_file_name: "STRING",
      fed_reference_number: "STRING",
      
      // Settlement
      settlement_date: "DATE",
      settlement_status: "STRING COMMENT 'PENDING|PARTIAL|COMPLETE'",
      settled_transactions: "INTEGER",
      failed_transactions: "INTEGER",
      returned_transactions: "INTEGER",
      
      // Audit
      source_system: "STRING DEFAULT 'FIS_ACH_TRACKER'",
      load_timestamp: "TIMESTAMP",
    },
  },
  
  {
    name: 'bronze.fis_ach_tracker_return_codes',
    description: 'ACH return code master data from FIS',
    sourceSystem: 'FIS_ACH_TRACKER',
    sourceTable: 'RETURN_CODE_MASTER',
    loadType: 'BATCH',
    grain: 'One row per return code',
    
    schema: {
      return_code: "STRING PRIMARY KEY COMMENT 'R01-R99'",
      return_code_category: "STRING COMMENT 'INSUFFICIENT_FUNDS|INVALID_ACCOUNT|AUTHORIZATION_REVOKED'",
      return_description: "STRING",
      retry_allowed_flag: "BOOLEAN",
      correctable_flag: "BOOLEAN",
      requires_customer_contact_flag: "BOOLEAN",
      nacha_time_frame_days: "INTEGER COMMENT 'NACHA deadline for return (2, 60, or 180 days)'",
      business_action: "STRING COMMENT 'AUTO_RETRY|MANUAL_REVIEW|CANCEL_TRANSACTION|UPDATE_INFO'",
      
      // Audit
      source_system: "STRING DEFAULT 'FIS_ACH_TRACKER'",
      load_timestamp: "TIMESTAMP",
    },
  },
  
  {
    name: 'bronze.fis_ach_tracker_noc_codes',
    description: 'ACH Notification of Change code master data',
    sourceSystem: 'FIS_ACH_TRACKER',
    sourceTable: 'NOC_CODE_MASTER',
    loadType: 'BATCH',
    grain: 'One row per NOC code',
    
    schema: {
      noc_code: "STRING PRIMARY KEY COMMENT 'C01-C13'",
      noc_description: "STRING",
      corrected_field: "STRING COMMENT 'ROUTING_NUMBER|ACCOUNT_NUMBER|ACCOUNT_TYPE|NAME'",
      auto_apply_flag: "BOOLEAN COMMENT 'Auto-apply correction to future transactions'",
      requires_approval_flag: "BOOLEAN",
      
      // Audit
      source_system: "STRING DEFAULT 'FIS_ACH_TRACKER'",
      load_timestamp: "TIMESTAMP",
    },
  },
];

// ============================================================================
// SILVER LAYER - Cleansed and Conformed ACH Tracker Data
// ============================================================================

export const fisACHTrackerSilverTables = [
  {
    name: 'silver.fis_ach_tracker_transactions_cleansed',
    description: 'Cleansed ACH tracker transaction data with deduplication and standardization',
    grain: 'One row per unique ACH transaction',
    transformations: [
      'Deduplicate on tracker_transaction_id and trace_number',
      'Standardize status values',
      'Enrich with return code descriptions',
      'Calculate business days to settlement',
      'Flag high-risk transactions',
    ],
    scdType: 'SCD_TYPE_2',
  },
  
  {
    name: 'silver.fis_ach_exception_summary',
    description: 'Aggregated exception summary by transaction, batch, and date',
    grain: 'One row per transaction-date-exception_type',
    transformations: [
      'Aggregate exceptions by type and severity',
      'Calculate time-to-resolution',
      'Calculate SLA compliance percentage',
      'Identify repeat exceptions',
    ],
    scdType: 'SCD_TYPE_1',
  },
  
  {
    name: 'silver.fis_ach_reconciliation',
    description: 'ACH transaction reconciliation between FIS Tracker and core banking',
    grain: 'One row per transaction with reconciliation status',
    transformations: [
      'Match FIS Tracker transactions to core banking ACH transactions',
      'Identify unmatched transactions',
      'Calculate settlement timing variances',
      'Flag reconciliation breaks',
    ],
    scdType: 'SCD_TYPE_1',
  },
];

// ============================================================================
// GOLD LAYER - Dimensional Model for ACH Tracker Analytics
// ============================================================================

export const fisACHTrackerGoldDimensions = [
  {
    name: 'gold.dim_ach_status',
    description: 'ACH transaction status dimension',
    scdType: 'SCD_TYPE_1',
    attributes: [
      'status_code',
      'status_name',
      'status_category (In-Flight|Completed|Exception)',
      'is_terminal_status',
      'display_order',
    ],
  },
  
  {
    name: 'gold.dim_ach_return_code',
    description: 'ACH return reason code dimension',
    scdType: 'SCD_TYPE_1',
    attributes: [
      'return_code (R01-R99)',
      'return_description',
      'return_category',
      'retry_allowed_flag',
      'correctable_flag',
      'nacha_time_frame_days',
      'business_action',
    ],
  },
  
  {
    name: 'gold.dim_noc_code',
    description: 'ACH Notification of Change code dimension',
    scdType: 'SCD_TYPE_1',
    attributes: [
      'noc_code (C01-C13)',
      'noc_description',
      'corrected_field',
      'auto_apply_flag',
    ],
  },
  
  {
    name: 'gold.dim_exception_type',
    description: 'ACH exception type dimension',
    scdType: 'SCD_TYPE_1',
    attributes: [
      'exception_type',
      'exception_severity',
      'default_resolution_action',
      'sla_hours',
    ],
  },
];

export const fisACHTrackerGoldFacts = [
  {
    name: 'gold.fact_ach_tracker_transactions',
    description: 'ACH transaction tracking fact table',
    factType: 'TRANSACTION',
    grain: 'One row per ACH transaction',
    
    dimensions: [
      'dim_date (effective_entry_date)',
      'dim_customer',
      'dim_account',
      'dim_ach_status',
      'dim_payment_method',
      'dim_sec_code',
    ],
    
    measures: {
      transaction_amount: 'DECIMAL(18,2)',
      business_days_to_settle: 'INTEGER',
      processing_time_minutes: 'INTEGER',
      exception_count: 'INTEGER',
      same_day_ach_flag: 'BOOLEAN',
      settled_flag: 'BOOLEAN',
      returned_flag: 'BOOLEAN',
    },
  },
  
  {
    name: 'gold.fact_ach_exceptions',
    description: 'ACH exception event fact table',
    factType: 'TRANSACTION',
    grain: 'One row per exception event',
    
    dimensions: [
      'dim_date (exception_date)',
      'dim_customer',
      'dim_account',
      'dim_exception_type',
      'dim_ach_return_code',
      'dim_noc_code',
    ],
    
    measures: {
      exception_amount: 'DECIMAL(18,2)',
      time_to_resolve_minutes: 'INTEGER',
      sla_met_flag: 'BOOLEAN',
      auto_resolved_flag: 'BOOLEAN',
      customer_contacted_flag: 'BOOLEAN',
    },
  },
  
  {
    name: 'gold.fact_ach_batch_performance',
    description: 'ACH batch processing performance fact',
    factType: 'PERIODIC_SNAPSHOT',
    grain: 'One row per batch per day',
    
    dimensions: [
      'dim_date (batch_date)',
      'dim_company',
      'dim_batch_type',
    ],
    
    measures: {
      total_transactions: 'INTEGER',
      total_amount: 'DECIMAL(18,2)',
      settled_transactions: 'INTEGER',
      returned_transactions: 'INTEGER',
      exception_transactions: 'INTEGER',
      success_rate_pct: 'DECIMAL(5,2)',
      return_rate_pct: 'DECIMAL(5,2)',
      avg_processing_time_minutes: 'DECIMAL(10,2)',
    },
  },
];

// ============================================================================
// METRICS CATALOG
// ============================================================================

export const fisACHTrackerMetrics = {
  categoryName: 'FIS ACH Tracker Metrics',
  totalMetrics: 50,
  
  categories: [
    {
      name: 'Transaction Tracking Metrics',
      count: 12,
      metrics: [
        { id: 'ACH-TRK-001', name: 'Total ACH Transactions Tracked', type: 'Volume', calculation: 'COUNT(tracker_transaction_id)' },
        { id: 'ACH-TRK-002', name: 'ACH Transaction Success Rate', type: 'Percentage', calculation: 'COUNT(settled) / COUNT(total) * 100' },
        { id: 'ACH-TRK-003', name: 'Same-Day ACH Volume', type: 'Volume', calculation: 'COUNT(same_day_ach_flag = TRUE)' },
        { id: 'ACH-TRK-004', name: 'Average Settlement Time (Days)', type: 'Duration', calculation: 'AVG(DATEDIFF(settlement_date, effective_entry_date))' },
        { id: 'ACH-TRK-005', name: 'In-Flight Transactions', type: 'Volume', calculation: 'COUNT(status IN (SUBMITTED, TRANSMITTED, BATCHED))' },
        { id: 'ACH-TRK-006', name: 'Settled Transactions Today', type: 'Volume', calculation: 'COUNT(settlement_date = CURRENT_DATE)' },
        { id: 'ACH-TRK-007', name: 'ACH Volume by SEC Code', type: 'Volume', calculation: 'COUNT(*) GROUP BY sec_code' },
        { id: 'ACH-TRK-008', name: 'Average Transaction Amount', type: 'Currency', calculation: 'AVG(transaction_amount)' },
        { id: 'ACH-TRK-009', name: 'Largest Transaction Amount', type: 'Currency', calculation: 'MAX(transaction_amount)' },
        { id: 'ACH-TRK-010', name: 'ACH Debit vs Credit Ratio', type: 'Ratio', calculation: 'SUM(debits) / SUM(credits)' },
        { id: 'ACH-TRK-011', name: 'Prenote Transaction Count', type: 'Volume', calculation: 'COUNT(prenote_flag = TRUE)' },
        { id: 'ACH-TRK-012', name: 'Weekend/Holiday ACH Volume', type: 'Volume', calculation: 'COUNT(is_business_day = FALSE)' },
      ],
    },
    {
      name: 'Exception Management Metrics',
      count: 15,
      metrics: [
        { id: 'ACH-EXC-001', name: 'Total ACH Exceptions', type: 'Volume', calculation: 'COUNT(exception_flag = TRUE)' },
        { id: 'ACH-EXC-002', name: 'Exception Rate', type: 'Percentage', calculation: 'COUNT(exceptions) / COUNT(total_transactions) * 100' },
        { id: 'ACH-EXC-003', name: 'Critical Exceptions Count', type: 'Volume', calculation: 'COUNT(exception_severity = CRITICAL)' },
        { id: 'ACH-EXC-004', name: 'Avg Time to Resolve (Minutes)', type: 'Duration', calculation: 'AVG(time_to_resolve_minutes)' },
        { id: 'ACH-EXC-005', name: 'SLA Compliance Rate', type: 'Percentage', calculation: 'COUNT(sla_met = TRUE) / COUNT(*) * 100' },
        { id: 'ACH-EXC-006', name: 'Auto-Resolved Exceptions', type: 'Volume', calculation: 'COUNT(resolution_action = AUTO_RETRY AND resolved = TRUE)' },
        { id: 'ACH-EXC-007', name: 'Exceptions Requiring Manual Review', type: 'Volume', calculation: 'COUNT(resolution_action = MANUAL_REVIEW)' },
        { id: 'ACH-EXC-008', name: 'Escalated Exceptions', type: 'Volume', calculation: 'COUNT(resolution_status = ESCALATED)' },
        { id: 'ACH-EXC-009', name: 'Unresolved Exceptions (>24hr)', type: 'Volume', calculation: 'COUNT(resolution_status = PENDING AND age_hours > 24)' },
        { id: 'ACH-EXC-010', name: 'Exception Resolution Rate', type: 'Percentage', calculation: 'COUNT(resolved) / COUNT(total) * 100' },
        { id: 'ACH-EXC-011', name: 'Repeat Exceptions (Same Customer)', type: 'Volume', calculation: 'COUNT(customer_id with > 1 exception in 30 days)' },
        { id: 'ACH-EXC-012', name: 'Exceptions by Type', type: 'Volume', calculation: 'COUNT(*) GROUP BY exception_type' },
        { id: 'ACH-EXC-013', name: 'High-Impact Exceptions (>$10K)', type: 'Volume', calculation: 'COUNT(affected_amount > 10000)' },
        { id: 'ACH-EXC-014', name: 'Customer-Impacting Exceptions', type: 'Volume', calculation: 'COUNT(business_impact = CUSTOMER_IMPACT)' },
        { id: 'ACH-EXC-015', name: 'Exception Rate by Company', type: 'Percentage', calculation: 'COUNT(exceptions) / COUNT(transactions) * 100 GROUP BY company_id' },
      ],
    },
    {
      name: 'Return Analysis Metrics',
      count: 10,
      metrics: [
        { id: 'ACH-RET-001', name: 'Total ACH Returns', type: 'Volume', calculation: 'COUNT(return_code IS NOT NULL)' },
        { id: 'ACH-RET-002', name: 'ACH Return Rate', type: 'Percentage', calculation: 'COUNT(returned) / COUNT(total) * 100' },
        { id: 'ACH-RET-003', name: 'R01 Returns (Insufficient Funds)', type: 'Volume', calculation: 'COUNT(return_code = R01)' },
        { id: 'ACH-RET-004', name: 'R03 Returns (No Account)', type: 'Volume', calculation: 'COUNT(return_code = R03)' },
        { id: 'ACH-RET-005', name: 'R10 Returns (Not Authorized)', type: 'Volume', calculation: 'COUNT(return_code = R10)' },
        { id: 'ACH-RET-006', name: 'Returns by Code Category', type: 'Volume', calculation: 'COUNT(*) GROUP BY return_code_category' },
        { id: 'ACH-RET-007', name: 'Returned Amount Total', type: 'Currency', calculation: 'SUM(transaction_amount WHERE returned = TRUE)' },
        { id: 'ACH-RET-008', name: 'Correctable Returns', type: 'Volume', calculation: 'COUNT(return_code WHERE correctable_flag = TRUE)' },
        { id: 'ACH-RET-009', name: 'Uncorrectable Returns', type: 'Volume', calculation: 'COUNT(return_code WHERE correctable_flag = FALSE)' },
        { id: 'ACH-RET-010', name: 'Late Returns (>2 days)', type: 'Volume', calculation: 'COUNT(DATEDIFF(return_date, effective_date) > 2)' },
      ],
    },
    {
      name: 'NOC (Notification of Change) Metrics',
      count: 6,
      metrics: [
        { id: 'ACH-NOC-001', name: 'Total NOCs Received', type: 'Volume', calculation: 'COUNT(noc_flag = TRUE)' },
        { id: 'ACH-NOC-002', name: 'NOC Rate', type: 'Percentage', calculation: 'COUNT(NOCs) / COUNT(total) * 100' },
        { id: 'ACH-NOC-003', name: 'Auto-Applied NOCs', type: 'Volume', calculation: 'COUNT(noc_code WHERE auto_apply_flag = TRUE)' },
        { id: 'ACH-NOC-004', name: 'NOCs Pending Approval', type: 'Volume', calculation: 'COUNT(noc_code WHERE requires_approval_flag = TRUE AND approved = FALSE)' },
        { id: 'ACH-NOC-005', name: 'C01 NOCs (Incorrect Account Number)', type: 'Volume', calculation: 'COUNT(noc_code = C01)' },
        { id: 'ACH-NOC-006', name: 'C03 NOCs (Incorrect Routing Number)', type: 'Volume', calculation: 'COUNT(noc_code = C03)' },
      ],
    },
    {
      name: 'Reconciliation Metrics',
      count: 7,
      metrics: [
        { id: 'ACH-REC-001', name: 'Reconciliation Match Rate', type: 'Percentage', calculation: 'COUNT(matched) / COUNT(total) * 100' },
        { id: 'ACH-REC-002', name: 'Unmatched Transactions', type: 'Volume', calculation: 'COUNT(reconciliation_status = UNMATCHED)' },
        { id: 'ACH-REC-003', name: 'Reconciliation Exceptions', type: 'Volume', calculation: 'COUNT(reconciliation_status = EXCEPTION)' },
        { id: 'ACH-REC-004', name: 'Amount Variance Total', type: 'Currency', calculation: 'SUM(ABS(tracker_amount - core_amount))' },
        { id: 'ACH-REC-005', name: 'Timing Variance (Days)', type: 'Duration', calculation: 'AVG(ABS(DATEDIFF(tracker_settlement, core_settlement)))' },
        { id: 'ACH-REC-006', name: 'Auto-Reconciled Transactions', type: 'Volume', calculation: 'COUNT(auto_reconciled = TRUE)' },
        { id: 'ACH-REC-007', name: 'Manual Reconciliation Required', type: 'Volume', calculation: 'COUNT(requires_manual_reconciliation = TRUE)' },
      ],
    },
  ],
};

// ============================================================================
// DATA SOURCES
// ============================================================================

export const fisACHTrackerDataSources = [
  {
    id: 'fis-ach-tracker',
    name: 'FIS Corporate ACH Tracker',
    vendor: 'FIS (Fidelity Information Services)',
    type: 'ACH Monitoring & Exception Management',
    description: 'Real-time ACH transaction tracking, exception management, and reconciliation platform',
    coverage: [
      'ACH transaction lifecycle monitoring',
      'Exception event tracking (Returns, NOCs, Reversals)',
      'Same-day ACH processing',
      'Batch file management',
      'Settlement reconciliation',
      'Return code analysis',
      'NOC management',
    ],
    integration: 'API + File-based',
    refreshFrequency: 'Real-time streaming + Daily batch',
    dataVolume: '500K - 5M transactions/day',
    feeds: [
      'ACH transaction log (real-time)',
      'Exception events (real-time)',
      'Batch file metadata (real-time)',
      'Return code master (daily)',
      'NOC code master (daily)',
      'Reconciliation reports (daily)',
    ],
  },
];

// ============================================================================
// USE CASES
// ============================================================================

export const fisACHTrackerUseCases = [
  'Real-time ACH transaction monitoring and status tracking',
  'Proactive exception detection and alerting',
  'Automated exception resolution workflows',
  'Return code analysis and trending',
  'NOC management and account correction automation',
  'ACH reconciliation between FIS Tracker and core banking',
  'Same-day ACH performance monitoring',
  'SLA compliance tracking for exception resolution',
  'Fraud detection via unusual return patterns',
  'Customer communication triggers for payment failures',
  'Batch processing performance analytics',
  'Regulatory reporting (NACHA compliance)',
];

// ============================================================================
// EXPORT
// ============================================================================

export default {
  bronze: fisACHTrackerBronzeTables,
  silver: fisACHTrackerSilverTables,
  goldDimensions: fisACHTrackerGoldDimensions,
  goldFacts: fisACHTrackerGoldFacts,
  metrics: fisACHTrackerMetrics,
  dataSources: fisACHTrackerDataSources,
  useCases: fisACHTrackerUseCases,
  
  summary: {
    bronzeTables: fisACHTrackerBronzeTables.length,
    silverTables: fisACHTrackerSilverTables.length,
    goldDimensions: fisACHTrackerGoldDimensions.length,
    goldFacts: fisACHTrackerGoldFacts.length,
    totalMetrics: fisACHTrackerMetrics.totalMetrics,
    domain: 'Commercial Payments',
    area: 'Commercial Banking',
    system: 'FIS ACH Tracker',
  },
};
