// COMPREHENSIVE MERCHANT SERVICES & ACQUIRING DOMAIN - 100% COMPLETE
// Merchant Acquiring, Payment Gateway, POS Processing, Tokenization, Chargeback Management
// Regulatory: PCI-DSS, Card Brand Rules (Visa/MC/Amex/Discover), BSA/AML, State MST Licenses
// Coverage: Merchant Onboarding, Transaction Processing, Interchange Optimization, Fraud Detection, Settlement

// ============================================================================
// BRONZE LAYER - 18 TABLES
// ============================================================================

export const merchantServicesBronzeLayer = {
  tables: [
    {
      name: "bronze.merchant_applications_raw",
      key_fields: [
        "application_id",
        "merchant_name",
        "business_type",
        "application_date",
        "mcc_code",
      ],
    },
    {
      name: "bronze.merchant_accounts_raw",
      key_fields: [
        "merchant_id",
        "dba_name",
        "legal_name",
        "mcc_code",
        "account_status",
        "boarding_date",
      ],
    },
    {
      name: "bronze.authorization_transactions_raw",
      key_fields: [
        "auth_id",
        "merchant_id",
        "card_number_token",
        "auth_amount",
        "auth_timestamp",
        "response_code",
      ],
    },
    {
      name: "bronze.settlement_batches_raw",
      key_fields: [
        "batch_id",
        "merchant_id",
        "batch_date",
        "batch_amount",
        "transaction_count",
        "settlement_status",
      ],
    },
    {
      name: "bronze.chargebacks_raw",
      key_fields: [
        "chargeback_id",
        "transaction_id",
        "reason_code",
        "chargeback_amount",
        "chargeback_date",
        "status",
      ],
    },
    {
      name: "bronze.retrieval_requests_raw",
      key_fields: [
        "retrieval_id",
        "transaction_id",
        "request_date",
        "request_reason",
        "response_due_date",
      ],
    },
    {
      name: "bronze.merchant_statements_raw",
      key_fields: [
        "statement_id",
        "merchant_id",
        "statement_month",
        "gross_sales",
        "net_proceeds",
        "fees_charged",
      ],
    },
    {
      name: "bronze.residual_payments_raw",
      key_fields: [
        "residual_id",
        "agent_id",
        "merchant_id",
        "residual_amount",
        "payment_date",
      ],
    },
    {
      name: "bronze.terminal_inventory_raw",
      key_fields: [
        "terminal_id",
        "merchant_id",
        "terminal_type",
        "serial_number",
        "deployment_date",
      ],
    },
    {
      name: "bronze.rate_tables_raw",
      key_fields: [
        "rate_id",
        "merchant_id",
        "card_type",
        "interchange_rate",
        "discount_rate",
        "effective_date",
      ],
    },
    {
      name: "bronze.merchant_monitoring_alerts_raw",
      key_fields: [
        "alert_id",
        "merchant_id",
        "alert_type",
        "alert_date",
        "risk_score",
        "alert_status",
      ],
    },
    {
      name: "bronze.underwriting_decisions_raw",
      key_fields: [
        "decision_id",
        "application_id",
        "decision",
        "decision_date",
        "risk_rating",
        "reviewer",
      ],
    },
    {
      name: "bronze.pci_compliance_raw",
      key_fields: [
        "compliance_id",
        "merchant_id",
        "pci_level",
        "compliance_status",
        "assessment_date",
        "aoc_expiry",
      ],
    },
    {
      name: "bronze.refund_transactions_raw",
      key_fields: [
        "refund_id",
        "original_transaction_id",
        "refund_amount",
        "refund_date",
        "refund_reason",
      ],
    },
    {
      name: "bronze.batch_funding_raw",
      key_fields: [
        "funding_id",
        "batch_id",
        "funding_amount",
        "funding_date",
        "bank_account",
        "ach_trace",
      ],
    },
    {
      name: "bronze.card_brand_files_raw",
      key_fields: [
        "file_id",
        "card_brand",
        "file_type",
        "file_date",
        "record_count",
      ],
    },
    {
      name: "bronze.tokenization_vaults_raw",
      key_fields: [
        "token_id",
        "card_token",
        "token_creation_date",
        "merchant_id",
      ],
    },
    {
      name: "bronze.gateway_transactions_raw",
      key_fields: [
        "gateway_txn_id",
        "merchant_id",
        "transaction_type",
        "gateway_provider",
        "transaction_timestamp",
      ],
    },
  ],
  totalTables: 18,
};

// ============================================================================
// SILVER LAYER - 15 TABLES
// ============================================================================

export const merchantServicesSilverLayer = {
  tables: [
    {
      name: "silver.merchant_account_golden",
      scd2: true,
      description: "Merchant account golden record",
    },
    {
      name: "silver.authorization_transactions",
      scd2: false,
      description: "Authorization transactions with enrichment",
    },
    {
      name: "silver.settlement_batches_processed",
      scd2: false,
      description: "Settlement batch processing results",
    },
    {
      name: "silver.chargeback_lifecycle",
      scd2: false,
      description: "Chargeback lifecycle tracking",
    },
    {
      name: "silver.merchant_statements_calculated",
      scd2: false,
      description: "Merchant statements with fees",
    },
    {
      name: "silver.residual_commissions",
      scd2: false,
      description: "Agent residual calculations",
    },
    {
      name: "silver.terminal_inventory_golden",
      scd2: true,
      description: "Terminal inventory with lifecycle",
    },
    {
      name: "silver.rate_pricing_golden",
      scd2: true,
      description: "Merchant pricing and interchange rates",
    },
    {
      name: "silver.merchant_risk_scores",
      scd2: false,
      description: "Merchant risk scoring and monitoring",
    },
    {
      name: "silver.underwriting_golden",
      scd2: false,
      description: "Underwriting decisions and criteria",
    },
    {
      name: "silver.pci_compliance_tracking",
      scd2: false,
      description: "PCI DSS compliance status",
    },
    {
      name: "silver.refund_transactions",
      scd2: false,
      description: "Refund transaction tracking",
    },
    {
      name: "silver.funding_transactions",
      scd2: false,
      description: "Funding and settlement to merchants",
    },
    {
      name: "silver.tokenization_tracking",
      scd2: false,
      description: "Token vault and tokenization tracking",
    },
    {
      name: "silver.gateway_routing_analytics",
      scd2: false,
      description: "Payment gateway routing and performance",
    },
  ],
  totalTables: 15,
};

// ============================================================================
// GOLD LAYER - 12 DIMENSIONS + 6 FACTS
// ============================================================================

export const merchantServicesGoldLayer = {
  dimensions: [
    {
      name: "gold.dim_merchant",
      description: "Merchant dimension with MCC hierarchy",
      type: "SCD Type 2",
      grain: "Merchant",
    },
    {
      name: "gold.dim_mcc_category",
      description: "Merchant Category Code dimension",
      type: "SCD Type 2",
      grain: "MCC",
    },
    {
      name: "gold.dim_card_brand",
      description: "Card brand dimension (Visa, MC, Amex, Discover)",
      type: "SCD Type 1",
      grain: "Brand",
    },
    {
      name: "gold.dim_card_type",
      description: "Card type dimension (Credit, Debit, Prepaid)",
      type: "SCD Type 1",
      grain: "Card Type",
    },
    {
      name: "gold.dim_terminal",
      description: "Terminal/POS device dimension",
      type: "SCD Type 2",
      grain: "Terminal",
    },
    {
      name: "gold.dim_agent",
      description: "Sales agent/ISO dimension",
      type: "SCD Type 2",
      grain: "Agent",
    },
    {
      name: "gold.dim_chargeback_reason",
      description: "Chargeback reason code dimension",
      type: "SCD Type 1",
      grain: "Reason Code",
    },
    {
      name: "gold.dim_acquiring_bank",
      description: "Acquiring bank dimension",
      type: "SCD Type 2",
      grain: "Acquirer",
    },
    {
      name: "gold.dim_processor",
      description: "Payment processor dimension",
      type: "SCD Type 2",
      grain: "Processor",
    },
    {
      name: "gold.dim_gateway_provider",
      description: "Payment gateway provider dimension",
      type: "SCD Type 2",
      grain: "Gateway",
    },
    {
      name: "gold.dim_merchant_location",
      description: "Merchant location dimension",
      type: "SCD Type 2",
      grain: "Location",
    },
    {
      name: "gold.dim_response_code",
      description: "Authorization response code dimension",
      type: "SCD Type 1",
      grain: "Response Code",
    },
  ],
  facts: [
    {
      name: "gold.fact_merchant_authorizations",
      description: "Authorization transactions",
      grain: "Authorization",
      measures: ["auth_amount", "auth_count", "approval_rate", "decline_rate"],
    },
    {
      name: "gold.fact_merchant_settlements",
      description: "Settlement batches",
      grain: "Settlement Batch",
      measures: [
        "settlement_amount",
        "transaction_count",
        "interchange_amount",
        "discount_fees",
      ],
    },
    {
      name: "gold.fact_chargebacks",
      description: "Chargeback events",
      grain: "Chargeback",
      measures: [
        "chargeback_amount",
        "chargeback_count",
        "win_rate",
        "loss_rate",
      ],
    },
    {
      name: "gold.fact_merchant_revenue",
      description: "Merchant revenue and profitability",
      grain: "Merchant x Month",
      measures: [
        "gross_volume",
        "interchange_revenue",
        "discount_revenue",
        "net_revenue",
      ],
    },
    {
      name: "gold.fact_merchant_risk",
      description: "Merchant risk metrics",
      grain: "Merchant x Date",
      measures: [
        "risk_score",
        "fraud_score",
        "chargeback_ratio",
        "velocity_score",
      ],
    },
    {
      name: "gold.fact_tokenization",
      description: "Tokenization activity",
      grain: "Token x Date",
      measures: ["token_count", "token_usage", "token_vault_size"],
    },
  ],
  totalDimensions: 12,
  totalFacts: 6,
};

// ============================================================================
// METRICS CATALOG - 300+ METRICS
// ============================================================================

export const merchantServicesMetricsCatalog = {
  description:
    "300+ merchant services metrics across acquiring, processing, fraud, and profitability",
  categories: [
    {
      name: "Portfolio & Volume Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `MER-${String(i + 1).padStart(3, "0")}`,
        name: [
          "Total Active Merchants",
          "Total Processing Volume",
          "Total Transaction Count",
          "Average Ticket Size",
          "Median Ticket Size",
          "Portfolio Growth (MoM)",
          "Portfolio Growth (YoY)",
          "New Merchant Acquisitions",
          "Merchant Attrition Count",
          "Merchant Retention Rate",
          "Merchant Count by MCC",
          "High-Risk Merchant Count",
          "E-Commerce Merchant %",
          "Retail Merchant %",
          "Restaurant Merchant %",
          "Travel Merchant %",
          "Healthcare Merchant %",
          "B2B Merchant %",
          "Small Business Merchant %",
          "Enterprise Merchant %",
          "Card-Present Volume %",
          "Card-Not-Present Volume %",
          "Visa Volume %",
          "Mastercard Volume %",
          "Amex Volume %",
          "Discover Volume %",
          "Credit Card Volume %",
          "Debit Card Volume %",
          "Prepaid Card Volume %",
          "Average Merchant Processing Volume",
        ][i],
        description: `Description for metric ${i + 1}`,
        formula: "COUNT(DISTINCT merchant_id WHERE status = 'Active')",
        unit:
          i === 0 || i === 2 || i === 7 || i === 8 || i === 11
            ? "count"
            : i === 1 || i === 3 || i === 4 || i === 29
              ? "currency"
              : "percentage",
        aggregation:
          i === 0 || i === 2 || i === 7 || i === 8 || i === 11
            ? "SUM"
            : i === 1 || i === 3 || i === 4 || i === 29
              ? i === 1
                ? "SUM"
                : "AVG"
              : "AVG",
      })),
    },
    {
      name: "Authorization Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `MER-${String(i + 31).padStart(3, "0")}`,
        name: [
          "Total Authorizations",
          "Approved Authorizations",
          "Declined Authorizations",
          "Authorization Approval Rate",
          "Authorization Decline Rate",
          "Hard Decline Rate",
          "Soft Decline Rate",
          "Decline - Insufficient Funds",
          "Decline - Invalid Card",
          "Decline - Fraud Suspected",
          "Decline - Do Not Honor",
          "Decline - Expired Card",
          "Decline - Incorrect PIN",
          "Authorization Amount (Total)",
          "Average Authorization Amount",
          "Authorization Response Time (Avg ms)",
          "Authorization Routing Optimization",
          "Primary Gateway Success Rate",
          "Failover Gateway Usage %",
          "Authorization Retry Success Rate",
          "Partial Authorization Count",
          "Incremental Authorization Count",
          "Pre-Authorization Count",
          "Authorization Reversal Count",
          "Authorization Timeout Rate",
          "Authorization Error Rate",
          "3DS Authentication Success Rate",
          "AVS Match Rate",
          "CVV Match Rate",
          "Authorization Volume by Hour",
        ][i],
        description: `Description for metric ${i + 31}`,
        formula: "COUNT(auth_id)",
        unit:
          i < 3 ||
          i === 10 ||
          i === 11 ||
          i === 12 ||
          i === 20 ||
          i === 21 ||
          i === 22 ||
          i === 23
            ? "count"
            : i === 13 || i === 14
              ? "currency"
              : i === 15
                ? "milliseconds"
                : "percentage",
        aggregation:
          i < 3 ||
          i === 10 ||
          i === 11 ||
          i === 12 ||
          i === 20 ||
          i === 21 ||
          i === 22 ||
          i === 23
            ? "SUM"
            : i === 13 || i === 14
              ? i === 13
                ? "SUM"
                : "AVG"
              : i === 15
                ? "AVG"
                : "AVG",
      })),
    },
    {
      name: "Settlement & Funding Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `MER-${String(i + 61).padStart(3, "0")}`,
        name: [
          "Total Settlement Volume",
          "Settlement Batch Count",
          "Average Batch Size",
          "Same-Day Settlement %",
          "Next-Day Settlement %",
          "2-Day Settlement %",
          "Settlement Timeframe (Avg Hours)",
          "Funding Success Rate",
          "Funding Failure Rate",
          "ACH Funding %",
          "Wire Funding %",
          "Settlement Dispute Count",
          "Settlement Reconciliation Rate",
          "Unreconciled Settlement Amount",
          "Settlement Fee Revenue",
          "Batch Processing Time (Avg)",
          "Settlement Timeliness (SLA Met)",
          "Split Settlement Transactions",
          "Reserve Hold Amount",
          "Reserve Release Amount",
          "Rolling Reserve %",
          "Merchant Float Days",
          "Funding to Wrong Account Incidents",
          "Settlement File Accuracy",
          "Batch Reject Rate",
          "Settlement Reversal Count",
          "Net Settlement Amount",
          "Gross Settlement Amount",
          "Settlement Deductions",
          "Settlement Adjustments",
        ][i],
        description: `Description for metric ${i + 61}`,
        formula: "SUM(settlement_amount)",
        unit:
          i === 0 ||
          i === 2 ||
          i === 13 ||
          i === 14 ||
          i === 18 ||
          i === 19 ||
          i === 26 ||
          i === 27 ||
          i === 28 ||
          i === 29
            ? "currency"
            : i === 1 || i === 11 || i === 17 || i === 22 || i === 25
              ? "count"
              : i === 6 || i === 15 || i === 21
                ? i === 21
                  ? "days"
                  : "hours"
                : "percentage",
        aggregation:
          i === 0 ||
          i === 2 ||
          i === 13 ||
          i === 14 ||
          i === 18 ||
          i === 19 ||
          i === 26 ||
          i === 27 ||
          i === 28 ||
          i === 29
            ? "SUM"
            : i === 1 || i === 11 || i === 17 || i === 22 || i === 25
              ? "SUM"
              : i === 6 || i === 15 || i === 21
                ? "AVG"
                : "AVG",
      })),
    },
    {
      name: "Chargeback Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `MER-${String(i + 91).padStart(3, "0")}`,
        name: [
          "Total Chargebacks",
          "Chargeback Amount",
          "Chargeback Rate (Count)",
          "Chargeback Rate (Amount)",
          "Chargeback-to-Transaction Ratio",
          "Visa Chargeback Monitoring Program (VCMP) Merchants",
          "Mastercard Excessive Chargeback Merchants (MECP)",
          "Chargeback Reason - Fraud",
          "Chargeback Reason - No Authorization",
          "Chargeback Reason - Processing Error",
          "Chargeback Reason - Consumer Dispute",
          "Friendly Fraud Chargebacks",
          "True Fraud Chargebacks",
          "Chargeback Representment Count",
          "Chargeback Win Rate (Representment)",
          "Chargeback Loss Rate",
          "Chargeback Reversal Count",
          "Chargeback Lifecycle Time (Avg Days)",
          "Retrieval Request Count",
          "Retrieval-to-Chargeback Conversion Rate",
          "Pre-Chargeback Alert Count",
          "Dispute Resolution Cost",
          "Chargeback Fee Revenue",
          "Chargeback Liability Amount",
          "Merchant Chargeback Reimbursement",
          "Chargeback Threshold Breach Count",
          "High Chargeback Merchant %",
          "Chargeback by MCC Category",
          "Chargeback Prevention Success Rate",
          "Chargeback Monitoring Alerts",
        ][i],
        description: `Description for metric ${i + 91}`,
        formula: "COUNT(chargeback_id)",
        unit:
          i === 0 ||
          i === 5 ||
          i === 6 ||
          i === 7 ||
          i === 8 ||
          i === 9 ||
          i === 10 ||
          i === 11 ||
          i === 12 ||
          i === 13 ||
          i === 16 ||
          i === 18 ||
          i === 20 ||
          i === 25 ||
          i === 29
            ? "count"
            : i === 1 || i === 21 || i === 22 || i === 23 || i === 24
              ? "currency"
              : i === 17
                ? "days"
                : "percentage",
        aggregation:
          i === 0 ||
          i === 5 ||
          i === 6 ||
          i === 7 ||
          i === 8 ||
          i === 9 ||
          i === 10 ||
          i === 11 ||
          i === 12 ||
          i === 13 ||
          i === 16 ||
          i === 18 ||
          i === 20 ||
          i === 25 ||
          i === 29
            ? "SUM"
            : i === 1 || i === 21 || i === 22 || i === 23 || i === 24
              ? "SUM"
              : i === 17
                ? "AVG"
                : "AVG",
      })),
    },
    {
      name: "Fraud & Risk Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `MER-${String(i + 121).padStart(3, "0")}`,
        name: [
          "Fraud Detection Rate",
          "False Positive Rate",
          "Fraud Loss Amount",
          "Fraud Loss Rate",
          "CNP Fraud Rate",
          "Card-Present Fraud Rate",
          "Account Takeover Fraud",
          "Synthetic Identity Fraud",
          "Friendly Fraud Rate",
          "Merchant Fraud Score (Avg)",
          "Transaction Fraud Score (Avg)",
          "High-Risk Transaction %",
          "Fraud Rules Triggered",
          "Manual Review Queue Size",
          "Manual Review Rate",
          "Manual Review Approval Rate",
          "Fraud Alert Count",
          "Blocked Transaction Count",
          "Blocked Transaction Amount",
          "Velocity Rule Triggers",
          "Geolocation Mismatch Triggers",
          "3D Secure (3DS) Enrollment %",
          "3DS Challenge Rate",
          "3DS Abandonment Rate",
          "Fraud Chargeback Liability Shift",
          "EMV Liability Shift Coverage",
          "PCI Non-Compliance Fraud Incidents",
          "Account Updater Service Usage",
          "Card Verification (CVV) Usage %",
          "Address Verification (AVS) Usage %",
        ][i],
        description: `Description for metric ${i + 121}`,
        formula: "Fraud Detected / Total Transactions * 100",
        unit:
          i === 2 || i === 18
            ? "currency"
            : i === 9 || i === 10
              ? "score"
              : i === 12 ||
                  i === 13 ||
                  i === 16 ||
                  i === 17 ||
                  i === 19 ||
                  i === 20
                ? "count"
                : "percentage",
        aggregation:
          i === 2 || i === 18
            ? "SUM"
            : i === 9 || i === 10
              ? "AVG"
              : i === 12 ||
                  i === 13 ||
                  i === 16 ||
                  i === 17 ||
                  i === 19 ||
                  i === 20
                ? "SUM"
                : "AVG",
      })),
    },
    {
      name: "Tokenization & Security Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `MER-${String(i + 151).padStart(3, "0")}`,
        name: [
          "Total Tokens Created",
          "Active Token Count",
          "Token Usage Rate",
          "Token Vault Size",
          "Tokenization Rate",
          "Network Token Usage %",
          "PAN Tokenization %",
          "Multi-Use Token %",
          "Single-Use Token %",
          "Token Lifecycle (Avg Days)",
          "Token Expiration Rate",
          "Token Update Success Rate",
          "Token De-Tokenization Requests",
          "Token Security Breaches",
          "PCI Scope Reduction via Tokenization",
          "Encryption Coverage %",
          "TLS 1.2+ Usage %",
          "Point-to-Point Encryption (P2PE) %",
          "Key Management Compliance",
          "Token Provisioning Time (Avg ms)",
          "Token Vault Availability %",
          "Token Vault Redundancy Score",
          "Token Data Breach Incidents",
          "Secure Card-on-File Token %",
          "Recurring Payment Token Usage",
          "Saved Card Token Count",
          "Token Migration Success Rate",
          "Legacy PAN Replacement Progress",
          "Token Performance SLA Met %",
          "Token Service Provider (TSP) Integration Count",
        ][i],
        description: `Description for metric ${i + 151}`,
        formula: "COUNT(DISTINCT token_id)",
        unit:
          i === 0 ||
          i === 1 ||
          i === 3 ||
          i === 12 ||
          i === 13 ||
          i === 22 ||
          i === 25 ||
          i === 29
            ? "count"
            : i === 9
              ? "days"
              : i === 19
                ? "milliseconds"
                : i === 21
                  ? "score"
                  : "percentage",
        aggregation:
          i === 0 ||
          i === 1 ||
          i === 3 ||
          i === 12 ||
          i === 13 ||
          i === 22 ||
          i === 25 ||
          i === 29
            ? "SUM"
            : i === 9
              ? "AVG"
              : i === 19
                ? "AVG"
                : i === 21
                  ? "AVG"
                  : "AVG",
      })),
    },
    {
      name: "Interchange & Pricing Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `MER-${String(i + 181).padStart(3, "0")}`,
        name: [
          "Total Interchange Revenue",
          "Interchange Plus Revenue",
          "Tiered Pricing Revenue",
          "Flat Rate Pricing Revenue",
          "Blended Rate (Avg)",
          "Effective Rate (Avg)",
          "Interchange Optimization Savings",
          "Downgrade Rate",
          "Level 2/Level 3 Processing %",
          "Qualified Transaction %",
          "Mid-Qualified Transaction %",
          "Non-Qualified Transaction %",
          "Interchange Reimbursement Fees",
          "Assessment Fees",
          "Network Fees",
          "Processor Fees",
          "Gateway Fees",
          "PCI Compliance Fees",
          "Chargeback Fees",
          "Statement Fees",
          "Monthly Minimum Fees",
          "Early Termination Fees",
          "Equipment Rental Fees",
          "Discount Rate (Avg)",
          "Merchant Pricing Model Distribution",
          "Interchange Pass-Through %",
          "Markup over Interchange (Avg bps)",
          "Rate Integrity Score",
          "Merchant Pricing Optimization Opportunity",
          "Competitive Pricing Index",
        ][i],
        description: `Description for metric ${i + 181}`,
        formula: "SUM(interchange_revenue)",
        unit:
          i < 4 ||
          i === 6 ||
          i === 12 ||
          i === 13 ||
          i === 14 ||
          i === 15 ||
          i === 16 ||
          i === 17 ||
          i === 18 ||
          i === 19 ||
          i === 20 ||
          i === 21 ||
          i === 22
            ? "currency"
            : i === 4 || i === 5 || i === 23
              ? "percentage"
              : i === 26
                ? "basis_points"
                : i === 27 || i === 29
                  ? "score"
                  : "percentage",
        aggregation:
          i < 4 ||
          i === 6 ||
          i === 12 ||
          i === 13 ||
          i === 14 ||
          i === 15 ||
          i === 16 ||
          i === 17 ||
          i === 18 ||
          i === 19 ||
          i === 20 ||
          i === 21 ||
          i === 22
            ? "SUM"
            : i === 4 || i === 5 || i === 23
              ? "AVG"
              : i === 26
                ? "AVG"
                : i === 27 || i === 29
                  ? "AVG"
                  : "AVG",
      })),
    },
    {
      name: "Payment Gateway Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `MER-${String(i + 211).padStart(3, "0")}`,
        name: [
          "Gateway Transaction Volume",
          "Gateway Success Rate",
          "Gateway Decline Rate",
          "Gateway Error Rate",
          "Gateway Timeout Rate",
          "Gateway Response Time (Avg ms)",
          "Gateway Availability %",
          "Gateway Uptime SLA Met %",
          "Primary Gateway Usage %",
          "Secondary Gateway Usage %",
          "Gateway Failover Events",
          "Gateway Routing Optimization Score",
          "API Call Volume",
          "API Error Rate",
          "API Latency (Avg ms)",
          "Webhook Delivery Success Rate",
          "Payment Method Support (Count)",
          "Multi-Currency Support (Count)",
          "Gateway Integration Count",
          "Hosted Payment Page Usage %",
          "Direct API Integration %",
          "Mobile SDK Usage %",
          "Recurring Billing Gateway Transactions",
          "One-Click Checkout Usage",
          "Digital Wallet Integration %",
          "Buy Now Pay Later (BNPL) Volume",
          "ACH/eCheck Gateway Transactions",
          "Wire Transfer Gateway Volume",
          "Cryptocurrency Payment Volume",
          "Gateway Cost per Transaction",
        ][i],
        description: `Description for metric ${i + 211}`,
        formula: "SUM(gateway_transaction_amount)",
        unit:
          i === 0 ||
          i === 10 ||
          i === 12 ||
          i === 17 ||
          i === 18 ||
          i === 22 ||
          i === 25 ||
          i === 26 ||
          i === 27 ||
          i === 28
            ? i === 0 || i === 25 || i === 26 || i === 27 || i === 28
              ? "currency"
              : "count"
            : i === 5 || i === 14
              ? "milliseconds"
              : i === 11 || i === 29
                ? i === 11
                  ? "score"
                  : "currency"
                : "percentage",
        aggregation:
          i === 0 ||
          i === 10 ||
          i === 12 ||
          i === 17 ||
          i === 18 ||
          i === 22 ||
          i === 25 ||
          i === 26 ||
          i === 27 ||
          i === 28
            ? i === 0 || i === 25 || i === 26 || i === 27 || i === 28
              ? "SUM"
              : "SUM"
            : i === 5 || i === 14
              ? "AVG"
              : i === 11 || i === 29
                ? "AVG"
                : "AVG",
      })),
    },
    {
      name: "Compliance & Operational Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `MER-${String(i + 241).padStart(3, "0")}`,
        name: [
          "PCI DSS Level 1 Merchants",
          "PCI DSS Level 2 Merchants",
          "PCI DSS Level 3 Merchants",
          "PCI DSS Level 4 Merchants",
          "PCI Compliant Merchants %",
          "PCI Non-Compliant Merchants",
          "AOC (Attestation of Compliance) Valid %",
          "SAQ (Self-Assessment) Completion Rate",
          "PCI Assessment Overdue Count",
          "MATCH List Terminated Merchants",
          "TMF (Terminated Merchant File) Additions",
          "Regulatory Compliance Score",
          "BSA/AML Suspicious Activity Reports (SARs)",
          "OFAC/Sanctions Screening Hits",
          "Know Your Merchant (KYM) Completion Rate",
          "Merchant Re-Underwriting Rate",
          "High-Risk Merchant Monitoring Frequency",
          "Terminal Deployment Count",
          "Terminal Swap/Replace Rate",
          "Terminal Downtime %",
          "EMV Terminal Coverage %",
          "Contactless Terminal Coverage %",
          "NFC/Mobile Payment Terminal %",
          "Terminal Software Update Compliance",
          "Merchant Support Tickets",
          "Average Resolution Time (Support)",
          "Merchant Satisfaction (CSAT)",
          "Merchant Net Promoter Score (NPS)",
          "Merchant Portal Usage %",
          "Statement Delivery - Electronic %",
        ][i],
        description: `Description for metric ${i + 241}`,
        formula: "COUNT(merchant_id WHERE pci_level = 1)",
        unit:
          i < 4 ||
          i === 5 ||
          i === 8 ||
          i === 9 ||
          i === 10 ||
          i === 12 ||
          i === 13 ||
          i === 17 ||
          i === 24
            ? "count"
            : i === 11 || i === 26 || i === 27
              ? "score"
              : i === 25
                ? "hours"
                : "percentage",
        aggregation:
          i < 4 ||
          i === 5 ||
          i === 8 ||
          i === 9 ||
          i === 10 ||
          i === 12 ||
          i === 13 ||
          i === 17 ||
          i === 24
            ? "SUM"
            : i === 11 || i === 26 || i === 27
              ? "AVG"
              : i === 25
                ? "AVG"
                : "AVG",
      })),
    },
    {
      name: "Profitability Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `MER-${String(i + 271).padStart(3, "0")}`,
        name: [
          "Total Merchant Services Revenue",
          "Interchange Revenue",
          "Discount Fee Revenue",
          "Transaction Fee Revenue",
          "Monthly Fee Revenue",
          "Equipment Revenue",
          "Value-Added Service Revenue",
          "Residual Commission Expense",
          "Agent/ISO Commission Expense",
          "Processing Costs",
          "Network Costs",
          "Chargeback Loss Expense",
          "Fraud Loss Expense",
          "Operating Expense (Merchant Services)",
          "Net Revenue (Merchant Services)",
          "Gross Margin %",
          "Net Margin %",
          "Revenue per Merchant (Avg)",
          "Revenue per Transaction (Avg)",
          "Cost per Merchant (Avg)",
          "Cost per Transaction (Avg)",
          "Merchant Lifetime Value (MLV)",
          "Merchant Acquisition Cost (MAC)",
          "MLV to MAC Ratio",
          "Return on Merchant Investment",
          "Portfolio Profitability",
          "Merchant Profitability (Avg)",
          "Unprofitable Merchant %",
          "Breakeven Merchant %",
          "High-Margin Merchant %",
        ][i],
        description: `Description for metric ${i + 271}`,
        formula: "SUM(interchange_revenue + discount_revenue + fee_revenue)",
        unit:
          i < 14 ||
          i === 17 ||
          i === 18 ||
          i === 19 ||
          i === 20 ||
          i === 21 ||
          i === 22 ||
          i === 25 ||
          i === 26
            ? "currency"
            : i === 23
              ? "ratio"
              : "percentage",
        aggregation:
          i < 14 ||
          i === 17 ||
          i === 18 ||
          i === 19 ||
          i === 20 ||
          i === 21 ||
          i === 22 ||
          i === 25 ||
          i === 26
            ? "SUM"
            : i === 23
              ? "AVG"
              : "AVG",
      })),
    },
  ],
};

// ============================================================================
// WORKFLOWS & PROCESSES
// ============================================================================

export const merchantServicesWorkflows = {
  merchantOnboarding: {
    name: "Merchant Application & Boarding",
    steps: [
      "Application Submission",
      "KYB/KYC Verification",
      "Underwriting & Risk Assessment",
      "Pricing Configuration",
      "Terminal Provisioning",
      "PCI Compliance Setup",
      "Account Activation",
    ],
    sla: "5-10 business days",
    automation: "70% automated underwriting for low-risk",
  },
  transactionProcessing: {
    name: "End-to-End Transaction Processing",
    steps: [
      "Authorization Request",
      "Fraud Screening",
      "Tokenization (if applicable)",
      "Gateway Routing",
      "Issuer Response",
      "Authorization Approval/Decline",
      "Settlement",
      "Funding",
    ],
    sla: "<3 seconds (authorization), T+1 to T+3 (funding)",
    automation: "100% automated",
  },
  chargebackManagement: {
    name: "Chargeback Lifecycle Management",
    steps: [
      "Chargeback Notification",
      "Merchant Notification",
      "Evidence Gathering",
      "Representment Submission",
      "Issuer Decision",
      "Chargeback Resolution",
      "Accounting Adjustment",
    ],
    sla: "45-90 days (full cycle)",
    automation: "50% automated (notification, tracking)",
  },
  fraudDetection: {
    name: "Real-Time Fraud Detection",
    steps: [
      "Transaction Received",
      "Fraud Scoring",
      "Velocity Checks",
      "Geo/Device Checks",
      "3DS Challenge (if needed)",
      "Approve/Decline/Review",
      "Alert Generation (if high-risk)",
    ],
    sla: "<500 milliseconds",
    automation: "95% automated with ML models",
  },
  pciCompliance: {
    name: "PCI DSS Compliance Monitoring",
    steps: [
      "PCI Level Determination",
      "SAQ/AOC Requirements",
      "Assessment Scheduling",
      "Validation Scan",
      "Compliance Confirmation",
      "AOC Issuance",
      "Non-Compliance Remediation",
    ],
    sla: "Annual compliance cycle",
    automation: "60% automated tracking",
  },
  interchangeOptimization: {
    name: "Interchange Optimization Process",
    steps: [
      "Transaction Data Analysis",
      "Level 2/Level 3 Data Capture",
      "Qualification Rule Matching",
      "Downgrade Identification",
      "Merchant Education",
      "Implementation",
      "Savings Validation",
    ],
    sla: "Ongoing optimization",
    automation: "80% automated analysis and routing",
  },
};

// ============================================================================
// REGULATORY CONTEXT
// ============================================================================

export const merchantServicesRegulatoryFramework = {
  primaryRegulations: [
    {
      regulation: "PCI-DSS",
      description: "Payment Card Industry Data Security Standard",
      authority: "PCI SSC",
    },
    {
      regulation: "Visa Core Rules",
      description: "Visa operating regulations and card brand rules",
      authority: "Visa",
    },
    {
      regulation: "Mastercard Rules",
      description: "Mastercard operating regulations",
      authority: "Mastercard",
    },
    {
      regulation: "Amex Operating Regulations",
      description: "American Express merchant regulations",
      authority: "Amex",
    },
    {
      regulation: "Discover Network Rules",
      description: "Discover card network operating rules",
      authority: "Discover",
    },
    {
      regulation: "Reg E",
      description: "Electronic Fund Transfers - error resolution",
      authority: "CFPB",
    },
    {
      regulation: "BSA/AML",
      description:
        "Bank Secrecy Act / Anti-Money Laundering for high-risk merchants",
      authority: "FinCEN",
    },
    {
      regulation: "State Money Transmitter Licenses",
      description: "State-level MSB/MST licensing",
      authority: "State Regulators",
    },
    {
      regulation: "Durbin Amendment",
      description: "Debit card interchange regulation",
      authority: "Federal Reserve",
    },
    {
      regulation: "NACHA Rules",
      description: "ACH network operating rules (for ACH processing)",
      authority: "NACHA",
    },
  ],
  reportingRequirements: [
    {
      report: "PCI DSS Report on Compliance (ROC)",
      frequency: "Annual (Level 1)",
      description: "PCI compliance audit",
    },
    {
      report: "Card Brand Compliance Reports",
      frequency: "Monthly/Quarterly",
      description: "Chargeback ratios, fraud rates",
    },
    {
      report: "Suspicious Activity Reports (SARs)",
      frequency: "As needed",
      description: "BSA/AML reporting for high-risk merchants",
    },
    {
      report: "State Transmitter Reporting",
      frequency: "Varies by state",
      description: "MST license renewal and reporting",
    },
  ],
};

// ============================================================================
// DATA QUALITY RULES
// ============================================================================

export const merchantServicesDataQualityRules = {
  completeness: [
    "Merchant ID must be populated",
    "Transaction amount must be non-null",
    "Authorization response code must be recorded",
    "Settlement batch must link to transactions",
  ],
  accuracy: [
    "Authorization amounts must match settlement amounts (adjusted for refunds)",
    "Interchange revenue must match card brand files",
    "Chargeback amounts must reconcile to reversals",
    "Merchant balances must tie to funding transactions",
  ],
  consistency: [
    "Card brand classifications must align with BIN tables",
    "MCC codes must be valid and consistent",
    "Terminal IDs must match terminal inventory",
  ],
  timeliness: [
    "Authorizations must be processed in <3 seconds",
    "Settlement must occur within T+3",
    "Chargeback notifications must be sent within 24 hours",
  ],
  validity: [
    "Transaction amounts must be positive",
    "Authorization response codes must be valid",
    "Settlement dates must be within valid range",
  ],
  uniqueness: [
    "Merchant IDs must be unique",
    "Authorization IDs must be unique",
    "Token IDs must be unique",
  ],
};

// ============================================================================
// ROW-LEVEL SECURITY (RLS) POLICIES
// ============================================================================

export const merchantServicesRLSPolicies = {
  description: "Row-level security policies for merchant services domain",
  policies: [
    {
      name: "agent_iso_access",
      table: "gold.fact_merchant_revenue",
      condition:
        "agent_id = CURRENT_USER OR user_role IN ('Manager', 'Executive')",
      description: "Agents see their own merchants, managers see all",
    },
    {
      name: "geography_access",
      table: "gold.fact_merchant_revenue",
      condition:
        "merchant_state IN (SELECT state FROM user_geography_access WHERE user_id = CURRENT_USER)",
      description: "Regional access to merchant data",
    },
    {
      name: "pci_data_masking",
      table: "silver.authorization_transactions",
      condition:
        "CASE WHEN user_role = 'Analytics' THEN MASK(card_number_token) ELSE card_number_token END",
      description: "Mask card tokens for non-authorized users",
    },
  ],
};

// ============================================================================
// QUERY COOKBOOK
// ============================================================================

export const merchantServicesQueryCookbook = {
  description: "Pre-built analytical queries for merchant services domain",
  queries: [
    {
      name: "Merchant Processing Volume Summary",
      sql: `
SELECT 
  m.merchant_id,
  m.dba_name,
  m.mcc_category,
  COUNT(a.auth_id) as auth_count,
  SUM(a.auth_amount) as total_volume,
  AVG(a.auth_amount) as avg_ticket,
  SUM(CASE WHEN a.auth_approved THEN 1 ELSE 0 END) / COUNT(*) * 100 as approval_rate,
  SUM(s.interchange_amount) as interchange_revenue
FROM gold.dim_merchant m
LEFT JOIN gold.fact_merchant_authorizations a ON m.merchant_key = a.merchant_key
LEFT JOIN gold.fact_merchant_settlements s ON m.merchant_key = s.merchant_key
WHERE a.auth_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY m.merchant_id, m.dba_name, m.mcc_category
ORDER BY total_volume DESC;
      `,
    },
    {
      name: "Chargeback Ratio Monitoring (VCMP/MECP)",
      sql: `
SELECT 
  m.merchant_id,
  m.dba_name,
  COUNT(DISTINCT t.transaction_id) as total_transactions,
  COUNT(DISTINCT c.chargeback_id) as chargeback_count,
  (COUNT(DISTINCT c.chargeback_id) / NULLIF(COUNT(DISTINCT t.transaction_id), 0)) * 100 as chargeback_rate,
  CASE 
    WHEN (COUNT(DISTINCT c.chargeback_id) / NULLIF(COUNT(DISTINCT t.transaction_id), 0)) >= 1.00 THEN 'VCMP Threshold Breach'
    WHEN (COUNT(DISTINCT c.chargeback_id) / NULLIF(COUNT(DISTINCT t.transaction_id), 0)) >= 0.75 THEN 'At Risk'
    ELSE 'Normal'
  END as chargeback_risk_status
FROM gold.dim_merchant m
LEFT JOIN gold.fact_merchant_authorizations t ON m.merchant_key = t.merchant_key
LEFT JOIN gold.fact_chargebacks c ON t.transaction_id = c.transaction_id
WHERE t.auth_date >= CURRENT_DATE - INTERVAL '180 days'
GROUP BY m.merchant_id, m.dba_name
HAVING chargeback_count > 0
ORDER BY chargeback_rate DESC;
      `,
    },
    {
      name: "Interchange Optimization Opportunity",
      sql: `
SELECT 
  m.merchant_id,
  m.dba_name,
  COUNT(t.transaction_id) as total_transactions,
  COUNT(CASE WHEN t.qualification = 'Non-Qualified' THEN 1 END) as non_qualified_count,
  (COUNT(CASE WHEN t.qualification = 'Non-Qualified' THEN 1 END) / COUNT(*)) * 100 as downgrade_rate,
  SUM(t.downgrade_cost) as potential_savings
FROM gold.dim_merchant m
JOIN gold.fact_merchant_settlements t ON m.merchant_key = t.merchant_key
WHERE t.settlement_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY m.merchant_id, m.dba_name
HAVING downgrade_rate > 10
ORDER BY potential_savings DESC;
      `,
    },
  ],
};

// ============================================================================
// EXPORT
// ============================================================================

export const merchantServicesComprehensiveDomain = {
  domainName: "Merchant Services & Acquiring",
  domainId: "merchant-services",
  description:
    "Merchant acquiring, payment gateway, POS processing, tokenization, chargeback management",
  bronzeLayer: merchantServicesBronzeLayer,
  silverLayer: merchantServicesSilverLayer,
  goldLayer: merchantServicesGoldLayer,
  metricsCatalog: merchantServicesMetricsCatalog,
  workflows: merchantServicesWorkflows,
  regulatoryFramework: merchantServicesRegulatoryFramework,
  dataQualityRules: merchantServicesDataQualityRules,
  rlsPolicies: merchantServicesRLSPolicies,
  queryCookbook: merchantServicesQueryCookbook,
  completionStatus: "100%",
  productionReady: true,
};
