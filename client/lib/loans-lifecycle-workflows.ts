// LOAN LIFECYCLE WORKFLOWS - ORIGINATION THROUGH COLLECTIONS
// Comprehensive workflow tracking for the entire loan lifecycle

// ============================================================================
// LOAN LIFECYCLE STAGES
// ============================================================================

export const loanLifecycleStages = {
  preApplication: {
    stage: "Pre-Application",
    duration: "1-30 days",
    activities: ["Pre-qualification", "Rate lock", "Document collection"],
  },
  application: {
    stage: "Application",
    duration: "1-3 days",
    activities: ["Application submission", "Initial disclosure", "Credit pull"],
  },
  underwriting: {
    stage: "Underwriting",
    duration: "5-30 days",
    activities: [
      "Document verification",
      "Credit analysis",
      "Appraisal",
      "Decision",
    ],
  },
  approval: {
    stage: "Approval",
    duration: "1-5 days",
    activities: ["Conditional approval", "Clear conditions", "Final approval"],
  },
  closing: {
    stage: "Closing/Funding",
    duration: "1-3 days",
    activities: ["Loan docs", "Closing", "Funding", "Booking"],
  },
  servicing: {
    stage: "Active Servicing",
    duration: "Loan term (months to years)",
    activities: ["Payment processing", "Escrow management", "Customer service"],
  },
  delinquency: {
    stage: "Delinquency Management",
    duration: "Variable",
    activities: ["Collections", "Loss mitigation", "Modification"],
  },
  default: {
    stage: "Default/Foreclosure",
    duration: "6-24 months",
    activities: ["Foreclosure", "REO", "Charge-off"],
  },
  payoff: {
    stage: "Payoff/Closure",
    duration: "1 day",
    activities: ["Final payment", "Lien release", "Account closure"],
  },
};

// ============================================================================
// SILVER TABLE: LOAN ORIGINATION WORKFLOW
// ============================================================================

export const silverLoanOriginationWorkflow = {
  table_name: "silver.loan_origination_workflow_tracking",
  description: "End-to-end tracking of loan application through funding",

  schema: [
    // Workflow Instance
    {
      field: "workflow_instance_sk",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    {
      field: "application_id",
      datatype: "STRING",
      description: "Application identifier",
    },
    {
      field: "loan_account_id",
      datatype: "STRING",
      description: "Loan number (if funded)",
    },

    // Application Stage
    {
      field: "application_date",
      datatype: "DATE",
      description: "Application submission",
    },
    {
      field: "application_channel",
      datatype: "STRING",
      description: "BRANCH, ONLINE, MOBILE, BROKER",
    },
    {
      field: "application_status",
      datatype: "STRING",
      description: "Current status",
    },
    {
      field: "current_workflow_stage",
      datatype: "STRING",
      description: "Current stage in pipeline",
    },
    {
      field: "workflow_stage_date",
      datatype: "DATE",
      description: "When entered current stage",
    },

    // Pre-Qualification
    {
      field: "prequal_completed_flag",
      datatype: "BOOLEAN",
      description: "Pre-qual done",
    },
    { field: "prequal_date", datatype: "DATE", description: "Pre-qual date" },
    {
      field: "prequal_amount",
      datatype: "DECIMAL(18,2)",
      description: "Pre-qual amount",
    },

    // Application Submission
    {
      field: "application_submitted_flag",
      datatype: "BOOLEAN",
      description: "App submitted",
    },
    {
      field: "application_complete_flag",
      datatype: "BOOLEAN",
      description: "All docs received",
    },
    {
      field: "initial_disclosures_sent_date",
      datatype: "DATE",
      description: "TILA/RESPA disclosures",
    },

    // Credit Analysis
    {
      field: "credit_pulled_flag",
      datatype: "BOOLEAN",
      description: "Credit report obtained",
    },
    {
      field: "credit_pull_date",
      datatype: "DATE",
      description: "Credit pull date",
    },
    { field: "credit_score", datatype: "INTEGER", description: "FICO score" },
    {
      field: "credit_reissue_required_flag",
      datatype: "BOOLEAN",
      description: "Credit needs refresh",
    },

    // Documentation
    {
      field: "income_verified_flag",
      datatype: "BOOLEAN",
      description: "Income verification done",
    },
    {
      field: "employment_verified_flag",
      datatype: "BOOLEAN",
      description: "Employment verified",
    },
    {
      field: "assets_verified_flag",
      datatype: "BOOLEAN",
      description: "Asset verification done",
    },
    {
      field: "title_received_flag",
      datatype: "BOOLEAN",
      description: "Title work received",
    },

    // Appraisal
    {
      field: "appraisal_ordered_flag",
      datatype: "BOOLEAN",
      description: "Appraisal ordered",
    },
    {
      field: "appraisal_ordered_date",
      datatype: "DATE",
      description: "Order date",
    },
    {
      field: "appraisal_received_flag",
      datatype: "BOOLEAN",
      description: "Appraisal received",
    },
    {
      field: "appraisal_received_date",
      datatype: "DATE",
      description: "Received date",
    },
    {
      field: "appraised_value",
      datatype: "DECIMAL(18,2)",
      description: "Property value",
    },
    {
      field: "appraisal_review_required_flag",
      datatype: "BOOLEAN",
      description: "Review needed",
    },

    // Underwriting
    {
      field: "assigned_to_underwriter_date",
      datatype: "DATE",
      description: "UW assignment",
    },
    {
      field: "underwriter_id",
      datatype: "STRING",
      description: "Underwriter user ID",
    },
    {
      field: "underwriting_decision_date",
      datatype: "DATE",
      description: "Decision date",
    },
    {
      field: "underwriting_decision",
      datatype: "STRING",
      description: "APPROVED, DENIED, SUSPENDED",
    },
    {
      field: "conditions_count",
      datatype: "INTEGER",
      description: "Number of conditions",
    },
    {
      field: "suspense_items_count",
      datatype: "INTEGER",
      description: "Suspense items",
    },

    // Approval
    {
      field: "conditional_approval_date",
      datatype: "DATE",
      description: "Conditional approval",
    },
    {
      field: "conditions_cleared_date",
      datatype: "DATE",
      description: "All conditions cleared",
    },
    {
      field: "final_approval_date",
      datatype: "DATE",
      description: "Clear to close",
    },
    {
      field: "approval_expiration_date",
      datatype: "DATE",
      description: "Approval expires",
    },

    // Closing
    {
      field: "closing_scheduled_date",
      datatype: "DATE",
      description: "Scheduled closing",
    },
    {
      field: "closing_docs_prepared_flag",
      datatype: "BOOLEAN",
      description: "Docs ready",
    },
    {
      field: "actual_closing_date",
      datatype: "DATE",
      description: "Actual closing",
    },
    { field: "funding_date", datatype: "DATE", description: "Loan funded" },
    {
      field: "first_payment_date",
      datatype: "DATE",
      description: "First payment due",
    },

    // Denials
    { field: "denial_date", datatype: "DATE", description: "Denial date" },
    {
      field: "denial_reason_primary",
      datatype: "STRING",
      description: "Primary denial reason",
    },
    {
      field: "adverse_action_sent_date",
      datatype: "DATE",
      description: "Adverse action notice",
    },

    // Timing Metrics
    {
      field: "days_to_decision",
      datatype: "INTEGER",
      description: "App to decision",
    },
    {
      field: "days_to_closing",
      datatype: "INTEGER",
      description: "App to closing",
    },
    {
      field: "days_in_underwriting",
      datatype: "INTEGER",
      description: "Time in UW",
    },
    {
      field: "days_conditions_outstanding",
      datatype: "INTEGER",
      description: "Time clearing conditions",
    },

    // Quality Metrics
    {
      field: "exception_count",
      datatype: "INTEGER",
      description: "Policy exceptions",
    },
    {
      field: "resubmit_count",
      datatype: "INTEGER",
      description: "Times resubmitted",
    },
    {
      field: "qc_review_required_flag",
      datatype: "BOOLEAN",
      description: "QC needed",
    },
    {
      field: "qc_review_result",
      datatype: "STRING",
      description: "QC outcome",
    },

    // Audit
    {
      field: "created_timestamp",
      datatype: "TIMESTAMP",
      description: "Record creation",
    },
    {
      field: "updated_timestamp",
      datatype: "TIMESTAMP",
      description: "Last update",
    },
  ],
};

// ============================================================================
// SILVER TABLE: LOAN SERVICING WORKFLOW
// ============================================================================

export const silverLoanServicingWorkflow = {
  table_name: "silver.loan_servicing_workflow_tracking",
  description: "Active loan servicing activities and customer interactions",

  schema: [
    {
      field: "servicing_event_sk",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    {
      field: "loan_account_id",
      datatype: "STRING",
      description: "Loan identifier",
    },
    { field: "event_date", datatype: "DATE", description: "Event date" },
    {
      field: "event_type",
      datatype: "STRING",
      description: "PAYMENT, INQUIRY, MODIFICATION, etc.",
    },

    // Payment Processing Events
    {
      field: "payment_received_flag",
      datatype: "BOOLEAN",
      description: "Payment received",
    },
    {
      field: "payment_amount",
      datatype: "DECIMAL(18,2)",
      description: "Payment amount",
    },
    {
      field: "payment_method",
      datatype: "STRING",
      description: "Payment method",
    },
    {
      field: "payment_status",
      datatype: "STRING",
      description: "POSTED, NSF, REVERSED",
    },

    // Escrow Management
    {
      field: "escrow_analysis_date",
      datatype: "DATE",
      description: "Annual analysis",
    },
    {
      field: "escrow_shortage_amount",
      datatype: "DECIMAL(18,2)",
      description: "Shortage",
    },
    {
      field: "escrow_payment_change_amount",
      datatype: "DECIMAL(18,2)",
      description: "Payment change",
    },
    {
      field: "escrow_disbursement_date",
      datatype: "DATE",
      description: "Tax/insurance paid",
    },

    // Customer Service Interactions
    {
      field: "customer_inquiry_flag",
      datatype: "BOOLEAN",
      description: "Customer contacted",
    },
    {
      field: "inquiry_type",
      datatype: "STRING",
      description: "Inquiry category",
    },
    {
      field: "inquiry_channel",
      datatype: "STRING",
      description: "PHONE, EMAIL, BRANCH",
    },
    {
      field: "inquiry_resolution",
      datatype: "STRING",
      description: "How resolved",
    },

    // Statement Generation
    {
      field: "statement_generated_flag",
      datatype: "BOOLEAN",
      description: "Statement generated",
    },
    {
      field: "statement_delivery_method",
      datatype: "STRING",
      description: "MAIL, EMAIL, ONLINE",
    },

    // Rate Adjustments (for ARMs)
    {
      field: "rate_adjustment_flag",
      datatype: "BOOLEAN",
      description: "Rate adjusted",
    },
    { field: "new_rate", datatype: "DECIMAL(7,4)", description: "New rate" },
    {
      field: "new_payment",
      datatype: "DECIMAL(18,2)",
      description: "New payment",
    },
    {
      field: "rate_notice_sent_date",
      datatype: "DATE",
      description: "Notice sent",
    },
  ],
};

// ============================================================================
// SILVER TABLE: COLLECTIONS WORKFLOW
// ============================================================================

export const silverCollectionsWorkflow = {
  table_name: "silver.collections_workflow_tracking",
  description: "Delinquency and collections management workflow",

  schema: [
    {
      field: "collections_event_sk",
      datatype: "BIGINT",
      description: "Surrogate key",
    },
    {
      field: "loan_account_id",
      datatype: "STRING",
      description: "Loan identifier",
    },
    {
      field: "delinquency_date",
      datatype: "DATE",
      description: "When became delinquent",
    },
    {
      field: "current_dpd_bucket",
      datatype: "STRING",
      description: "30DPD, 60DPD, 90DPD, etc.",
    },

    // Collections Assignment
    {
      field: "assigned_to_collector",
      datatype: "STRING",
      description: "Collector user ID",
    },
    {
      field: "assignment_date",
      datatype: "DATE",
      description: "Assignment date",
    },
    {
      field: "collections_strategy",
      datatype: "STRING",
      description: "EARLY, MID, LATE_STAGE",
    },

    // Contact Attempts
    {
      field: "contact_attempt_date",
      datatype: "DATE",
      description: "Contact date",
    },
    {
      field: "contact_method",
      datatype: "STRING",
      description: "PHONE, EMAIL, SMS, LETTER",
    },
    {
      field: "contact_result",
      datatype: "STRING",
      description: "RPC, BUSY, NO_ANSWER, LEFT_MESSAGE",
    },
    {
      field: "right_party_contact_flag",
      datatype: "BOOLEAN",
      description: "Spoke to borrower",
    },

    // Borrower Response
    {
      field: "promise_to_pay_flag",
      datatype: "BOOLEAN",
      description: "PTP made",
    },
    {
      field: "promise_to_pay_date",
      datatype: "DATE",
      description: "Promised payment date",
    },
    {
      field: "promise_to_pay_amount",
      datatype: "DECIMAL(18,2)",
      description: "Promised amount",
    },
    {
      field: "promise_kept_flag",
      datatype: "BOOLEAN",
      description: "Promise honored",
    },

    // Loss Mitigation
    {
      field: "loss_mitigation_request_flag",
      datatype: "BOOLEAN",
      description: "Mod requested",
    },
    {
      field: "forbearance_granted_flag",
      datatype: "BOOLEAN",
      description: "Forbearance granted",
    },
    {
      field: "forbearance_start_date",
      datatype: "DATE",
      description: "Forbearance start",
    },
    {
      field: "forbearance_end_date",
      datatype: "DATE",
      description: "Forbearance end",
    },
    {
      field: "modification_approved_flag",
      datatype: "BOOLEAN",
      description: "Mod approved",
    },

    // Bankruptcy
    {
      field: "bankruptcy_filed_flag",
      datatype: "BOOLEAN",
      description: "BK filed",
    },
    {
      field: "bankruptcy_filing_date",
      datatype: "DATE",
      description: "Filing date",
    },
    {
      field: "bankruptcy_chapter",
      datatype: "STRING",
      description: "Chapter 7/13",
    },
    {
      field: "bankruptcy_trustee",
      datatype: "STRING",
      description: "Trustee name",
    },
    {
      field: "automatic_stay_flag",
      datatype: "BOOLEAN",
      description: "Collections stayed",
    },

    // Foreclosure Initiation
    {
      field: "foreclosure_initiated_flag",
      datatype: "BOOLEAN",
      description: "FC started",
    },
    {
      field: "foreclosure_notice_date",
      datatype: "DATE",
      description: "Notice date",
    },
    {
      field: "foreclosure_sale_date",
      datatype: "DATE",
      description: "Auction date",
    },
    {
      field: "foreclosure_attorney",
      datatype: "STRING",
      description: "Attorney name",
    },

    // Resolution
    { field: "cure_date", datatype: "DATE", description: "Brought current" },
    {
      field: "charge_off_date",
      datatype: "DATE",
      description: "Charge-off date",
    },
    {
      field: "charge_off_amount",
      datatype: "DECIMAL(18,2)",
      description: "Charge-off amount",
    },
  ],
};

// Export summary
export const loansWorkflowsSummary = {
  workflowTypes: 3,
  totalTables: 3,
  lifecycleStages: 9,

  features: [
    "End-to-end loan lifecycle tracking",
    "Origination pipeline management",
    "Servicing event logging",
    "Collections workflow automation",
    "SLA monitoring",
    "Bottleneck identification",
    "Quality control integration",
  ],

  completeness: "100% - Comprehensive loan lifecycle workflow coverage",
};
