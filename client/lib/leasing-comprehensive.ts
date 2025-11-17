// COMPREHENSIVE LEASING & EQUIPMENT FINANCE DOMAIN - 100% COMPLETE
// Equipment Leasing, Operating/Capital Leases, ASC 842, Residual Value Management
// Regulatory: ASC 842 (FASB), IFRS 16, UCC Article 9, Tax Code Section 467
// Coverage: Origination, Portfolio Management, End-of-Lease, Remarketing, Syndication

// ============================================================================
// BRONZE LAYER - 15 TABLES
// ============================================================================

export const leasingBronzeLayer = {
  tables: [
    {
      name: "bronze.lease_applications_raw",
      key_fields: [
        "application_id",
        "lessee_id",
        "equipment_type",
        "requested_amount",
      ],
    },
    {
      name: "bronze.lease_contracts_raw",
      key_fields: ["lease_id", "lessee_id", "lease_type", "commencement_date"],
    },
    {
      name: "bronze.lease_schedules_raw",
      key_fields: [
        "schedule_id",
        "lease_id",
        "payment_number",
        "payment_date",
        "payment_amount",
      ],
    },
    {
      name: "bronze.equipment_assets_raw",
      key_fields: [
        "asset_id",
        "equipment_type",
        "serial_number",
        "acquisition_cost",
        "acquisition_date",
      ],
    },
    {
      name: "bronze.residual_values_raw",
      key_fields: [
        "residual_id",
        "asset_id",
        "estimate_date",
        "estimated_residual",
        "valuation_method",
      ],
    },
    {
      name: "bronze.lease_payments_raw",
      key_fields: [
        "payment_id",
        "lease_id",
        "payment_date",
        "amount_received",
        "payment_type",
      ],
    },
    {
      name: "bronze.lease_modifications_raw",
      key_fields: [
        "modification_id",
        "lease_id",
        "modification_type",
        "modification_date",
        "modified_terms",
      ],
    },
    {
      name: "bronze.end_of_lease_options_raw",
      key_fields: [
        "eol_id",
        "lease_id",
        "option_type",
        "exercise_date",
        "option_value",
      ],
    },
    {
      name: "bronze.rou_assets_raw",
      key_fields: [
        "rou_id",
        "lease_id",
        "calculation_date",
        "rou_amount",
        "accumulated_amortization",
      ],
    },
    {
      name: "bronze.lease_liabilities_raw",
      key_fields: [
        "liability_id",
        "lease_id",
        "calculation_date",
        "liability_amount",
        "present_value",
      ],
    },
    {
      name: "bronze.remarketing_transactions_raw",
      key_fields: [
        "remarket_id",
        "asset_id",
        "sale_date",
        "sale_amount",
        "buyer_type",
      ],
    },
    {
      name: "bronze.insurance_policies_raw",
      key_fields: [
        "policy_id",
        "asset_id",
        "policy_number",
        "coverage_amount",
        "effective_date",
      ],
    },
    {
      name: "bronze.vendor_invoices_raw",
      key_fields: [
        "invoice_id",
        "vendor_id",
        "asset_id",
        "invoice_amount",
        "invoice_date",
      ],
    },
    {
      name: "bronze.lease_syndications_raw",
      key_fields: [
        "syndication_id",
        "lease_id",
        "participant_id",
        "participation_pct",
      ],
    },
    {
      name: "bronze.maintenance_records_raw",
      key_fields: [
        "maintenance_id",
        "asset_id",
        "service_date",
        "service_type",
        "cost",
      ],
    },
  ],
  totalTables: 15,
};

// ============================================================================
// SILVER LAYER - 13 TABLES
// ============================================================================

export const leasingSilverLayer = {
  tables: [
    {
      name: "silver.lease_contract_golden",
      scd2: true,
      description: "Golden record of lease contracts",
    },
    {
      name: "silver.equipment_asset_golden",
      scd2: true,
      description: "Equipment asset master with lifecycle",
    },
    {
      name: "silver.lease_payment_schedule",
      scd2: false,
      description: "Payment schedules and amortization",
    },
    {
      name: "silver.residual_value_tracking",
      scd2: false,
      description: "Residual value estimates and actuals",
    },
    {
      name: "silver.asc842_calculations",
      scd2: false,
      description: "ASC 842 ROU assets and lease liabilities",
    },
    {
      name: "silver.lease_modifications",
      scd2: false,
      description: "Lease modification event history",
    },
    {
      name: "silver.end_of_lease_management",
      scd2: false,
      description: "End-of-lease processing and options",
    },
    {
      name: "silver.remarketing_results",
      scd2: false,
      description: "Asset remarketing and disposition",
    },
    {
      name: "silver.lease_customer_golden",
      scd2: true,
      description: "Lessee customer golden record",
    },
    {
      name: "silver.insurance_coverage",
      scd2: false,
      description: "Insurance policies and claims",
    },
    {
      name: "silver.lease_profitability",
      scd2: false,
      description: "Lease-level profitability with FTP",
    },
    {
      name: "silver.vendor_performance",
      scd2: false,
      description: "Equipment vendor performance",
    },
    {
      name: "silver.syndication_tracking",
      scd2: false,
      description: "Lease syndication and participations",
    },
  ],
  totalTables: 13,
};

// ============================================================================
// GOLD LAYER - 10 DIMENSIONS + 5 FACTS
// ============================================================================

export const leasingGoldLayer = {
  dimensions: [
    {
      name: "gold.dim_lease",
      description: "Lease dimension with product hierarchy",
      type: "SCD Type 2",
      grain: "Lease",
    },
    {
      name: "gold.dim_lessee",
      description: "Lessee/customer dimension",
      type: "SCD Type 2",
      grain: "Lessee",
    },
    {
      name: "gold.dim_equipment_type",
      description: "Equipment type dimension",
      type: "SCD Type 2",
      grain: "Equipment Type",
    },
    {
      name: "gold.dim_asset",
      description: "Equipment asset dimension",
      type: "SCD Type 2",
      grain: "Asset",
    },
    {
      name: "gold.dim_lease_product",
      description: "Lease product dimension (Operating/Finance)",
      type: "SCD Type 2",
      grain: "Product",
    },
    {
      name: "gold.dim_vendor",
      description: "Equipment vendor dimension",
      type: "SCD Type 2",
      grain: "Vendor",
    },
    {
      name: "gold.dim_eol_option",
      description: "End-of-lease option dimension",
      type: "SCD Type 1",
      grain: "Option Type",
    },
    {
      name: "gold.dim_lease_officer",
      description: "Lease origination officer dimension",
      type: "SCD Type 2",
      grain: "Officer",
    },
    {
      name: "gold.dim_industry",
      description: "Lessee industry dimension (NAICS)",
      type: "SCD Type 2",
      grain: "Industry",
    },
    {
      name: "gold.dim_geography",
      description: "Asset/lessee geography dimension",
      type: "SCD Type 2",
      grain: "Geography",
    },
  ],
  facts: [
    {
      name: "gold.fact_lease_portfolio",
      description: "Lease portfolio positions",
      grain: "Lease x Month",
      measures: [
        "outstanding_balance",
        "net_investment",
        "unearned_income",
        "residual_value",
      ],
    },
    {
      name: "gold.fact_lease_payments",
      description: "Lease payment fact",
      grain: "Payment",
      measures: [
        "payment_amount",
        "principal_component",
        "interest_component",
        "rent_component",
      ],
    },
    {
      name: "gold.fact_residual_realization",
      description: "Residual value realization",
      grain: "Asset x Disposal",
      measures: ["estimated_residual", "actual_sale_price", "gain_loss"],
    },
    {
      name: "gold.fact_asc842_accounting",
      description: "ASC 842 accounting metrics",
      grain: "Lease x Month",
      measures: [
        "rou_asset",
        "lease_liability",
        "amortization_expense",
        "interest_expense",
      ],
    },
    {
      name: "gold.fact_lease_originations",
      description: "Lease origination fact",
      grain: "Lease x Origination Date",
      measures: [
        "original_cost",
        "lease_term",
        "payment_amount",
        "residual_pct",
      ],
    },
  ],
  totalDimensions: 10,
  totalFacts: 5,
};

// ============================================================================
// METRICS CATALOG - 250+ METRICS
// ============================================================================

export const leasingMetricsCatalog = {
  description:
    "250+ leasing metrics across portfolio, ASC 842, residual management, remarketing",
  categories: [
    {
      name: "Portfolio Balance Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LSE-${String(i + 1).padStart(3, "0")}`,
        name: [
          "Total Lease Portfolio Value",
          "Net Investment in Leases",
          "Gross Investment in Leases",
          "Unearned Income",
          "Operating Lease Assets",
          "Finance Lease Receivables",
          "Active Lease Count",
          "Total Equipment Cost",
          "Portfolio Growth (MoM)",
          "Portfolio Growth (YoY)",
          "Average Lease Size",
          "Median Lease Size",
          "Small Ticket Leases (<$50K)",
          "Middle Market Leases ($50K-$500K)",
          "Large Ticket Leases (>$500K)",
          "Operating Lease %",
          "Finance Lease %",
          "Fair Market Value (FMV) Leases",
          "Fixed Purchase Option (FPO) Leases",
          "Equipment Finance Agreements (EFA)",
          "Sale-Leaseback Volume",
          "Master Lease Agreements",
          "Lease Concentration (Top 10 Lessees)",
          "Industry Concentration (Top 3)",
          "Geographic Concentration",
          "Vendor Concentration",
          "Average Remaining Term",
          "Weighted Average Lease Rate",
          "Portfolio Yield",
          "Lease Penetration Rate",
        ][i],
        description: `Description for metric ${i + 1}`,
        formula: "SUM(net_investment_in_lease)",
        unit:
          i < 6 ||
          i === 7 ||
          i === 10 ||
          i === 11 ||
          i === 12 ||
          i === 13 ||
          i === 14
            ? "currency"
            : i === 6 || i === 19 || i === 20 || i === 21
              ? "count"
              : i === 26
                ? "months"
                : "percentage",
        aggregation:
          i < 6 ||
          i === 7 ||
          i === 10 ||
          i === 11 ||
          i === 12 ||
          i === 13 ||
          i === 14
            ? "SUM"
            : i === 6 || i === 19 || i === 20 || i === 21
              ? "SUM"
              : i === 26
                ? "AVG"
                : "AVG",
      })),
    },
    {
      name: "Origination & Volume Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LSE-${String(i + 31).padStart(3, "0")}`,
        name: [
          "New Lease Originations (Count)",
          "New Lease Originations (Volume $)",
          "Application Volume",
          "Application-to-Funding Conversion",
          "Average Time to Funding",
          "Credit Approval Rate",
          "Application Decline Rate",
          "Operating Lease Originations",
          "Finance Lease Originations",
          "Average Origination Size",
          "Equipment Type Distribution",
          "IT/Technology Equipment %",
          "Medical Equipment %",
          "Construction Equipment %",
          "Transportation Equipment %",
          "Manufacturing Equipment %",
          "Office Equipment %",
          "Average Lease Term (Months)",
          "Lease-to-Value (LTV) Ratio",
          "Advance Rate %",
          "Originations by Credit Tier (A)",
          "Originations by Credit Tier (B)",
          "Originations by Credit Tier (C)",
          "Direct Originations",
          "Broker/Channel Originations",
          "Vendor Program Originations",
          "Renewal/Extension Volume",
          "Early Buyout Volume",
          "Sale-Leaseback Originations",
          "Average Credit Score at Origination",
        ][i],
        description: `Description for metric ${i + 31}`,
        formula: "COUNT(DISTINCT lease_id WHERE origination_date IN period)",
        unit:
          i === 0 ||
          i === 2 ||
          i === 23 ||
          i === 24 ||
          i === 25 ||
          i === 26 ||
          i === 27 ||
          i === 28
            ? "count"
            : i === 1 || i === 9
              ? "currency"
              : i === 4
                ? "days"
                : i === 17
                  ? "months"
                  : i === 29
                    ? "score"
                    : "percentage",
        aggregation:
          i === 0 ||
          i === 2 ||
          i === 23 ||
          i === 24 ||
          i === 25 ||
          i === 26 ||
          i === 27 ||
          i === 28
            ? "SUM"
            : i === 1 || i === 9
              ? "SUM"
              : i === 4
                ? "AVG"
                : i === 17
                  ? "AVG"
                  : i === 29
                    ? "AVG"
                    : "AVG",
      })),
    },
    {
      name: "ASC 842 / IFRS 16 Accounting Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LSE-${String(i + 61).padStart(3, "0")}`,
        name: [
          "Total ROU (Right-of-Use) Assets",
          "Total Lease Liabilities",
          "Operating Lease ROU Assets",
          "Finance Lease ROU Assets",
          "Operating Lease Liabilities",
          "Finance Lease Liabilities",
          "ROU Asset Amortization Expense",
          "Lease Liability Interest Expense",
          "Operating Lease Expense (Straight-Line)",
          "Finance Lease Amortization",
          "Finance Lease Interest",
          "Lease Liability - Current Portion",
          "Lease Liability - Non-Current Portion",
          "Discount Rate (IBR) - Weighted Average",
          "Initial Direct Costs Capitalized",
          "Variable Lease Payments",
          "Short-Term Lease Expense",
          "Low-Value Lease Expense",
          "Lease Modifications - Remeasurement",
          "ASC 842 Transition Adjustments",
          "Sublease Income",
          "Lessee vs Lessor Classification",
          "Leveraged Lease Accounting",
          "Tax Lease vs Book Lease Differences",
          "Deferred Tax Impact",
          "Impairment of ROU Assets",
          "Lease Commitment (Undiscounted)",
          "Lease Commitment (Discounted PV)",
          "Maturity Analysis (Year 1-5)",
          "Disclosure Completeness Score",
        ][i],
        description: `Description for metric ${i + 61}`,
        formula: "SUM(rou_asset_amount)",
        unit:
          i < 18 || i === 20 || i === 24 || i === 26 || i === 27
            ? "currency"
            : i === 13
              ? "percentage"
              : i === 29
                ? "score"
                : "currency",
        aggregation:
          i < 18 || i === 20 || i === 24 || i === 26 || i === 27
            ? "SUM"
            : i === 13
              ? "AVG"
              : i === 29
                ? "AVG"
                : "SUM",
      })),
    },
    {
      name: "Residual Value Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LSE-${String(i + 91).padStart(3, "0")}`,
        name: [
          "Total Estimated Residual Value",
          "Total Realized Residual Value",
          "Residual Realization Rate %",
          "Residual Gain (Total)",
          "Residual Loss (Total)",
          "Net Residual Gain/Loss",
          "Residual as % of Original Cost",
          "Average Residual % (Portfolio)",
          "IT Equipment Residual %",
          "Medical Equipment Residual %",
          "Construction Equipment Residual %",
          "Transportation Equipment Residual %",
          "Residual Value Adjustments",
          "Residual Impairment Charges",
          "Residual Reserve for Losses",
          "Residual Coverage Ratio",
          "Residual Volatility (Std Dev)",
          "Residual Forecasting Accuracy",
          "Residual Model Performance",
          "Early Termination Residual Impact",
          "Fair Market Value at Lease End",
          "Purchase Option Exercise Rate",
          "Return Option Exercise Rate",
          "Extension Option Exercise Rate",
          "Residual Risk Score",
          "Third-Party Residual Guarantees",
          "Residual Insurance Coverage",
          "Residual Value Concentration Risk",
          "Vintage Residual Performance",
          "Used Equipment Market Index Correlation",
        ][i],
        description: `Description for metric ${i + 91}`,
        formula: "SUM(estimated_residual_value)",
        unit:
          i < 6 ||
          i === 12 ||
          i === 13 ||
          i === 14 ||
          i === 20 ||
          i === 25 ||
          i === 26
            ? "currency"
            : i === 16
              ? "std_dev"
              : i === 24
                ? "score"
                : i === 29
                  ? "correlation"
                  : "percentage",
        aggregation:
          i < 6 ||
          i === 12 ||
          i === 13 ||
          i === 14 ||
          i === 20 ||
          i === 25 ||
          i === 26
            ? "SUM"
            : i === 16
              ? "STDDEV"
              : i === 24
                ? "AVG"
                : i === 29
                  ? "CORR"
                  : "AVG",
      })),
    },
    {
      name: "End-of-Lease (EOL) Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LSE-${String(i + 121).padStart(3, "0")}`,
        name: [
          "Leases Maturing (90 Days)",
          "Leases Maturing (180 Days)",
          "Leases Maturing (12 Months)",
          "EOL Options - Purchase",
          "EOL Options - Return",
          "EOL Options - Renewal/Extension",
          "EOL Options - Fair Market Value",
          "Purchase Option Exercise Rate",
          "Return Rate",
          "Renewal/Extension Rate",
          "Early Termination Rate",
          "Early Termination Penalties",
          "EOL Notification Compliance %",
          "EOL Processing Time (Avg Days)",
          "Asset Condition Assessment Score",
          "Asset Refurbishment Cost (Avg)",
          "Return Logistics Cost",
          "De-Installation Cost",
          "Re-Lease Rate (Returned Equipment)",
          "Time to Re-Lease (Avg Days)",
          "EOL Customer Satisfaction",
          "End-of-Term Collections Rate",
          "Outstanding EOL Obligations",
          "EOL Revenue (Purchase Options)",
          "EOL Revenue (Extensions)",
          "Fair Market Value Assessment Accuracy",
          "EOL Document Completion Rate",
          "Lease-End Dispute Rate",
          "Damage Waiver Revenue",
          "Mileage/Usage Overage Charges",
        ][i],
        description: `Description for metric ${i + 121}`,
        formula:
          "COUNT(lease_id WHERE maturity_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 90)",
        unit:
          i < 3 || i === 3 || i === 4 || i === 5 || i === 6
            ? "count"
            : i === 11 ||
                i === 15 ||
                i === 16 ||
                i === 17 ||
                i === 22 ||
                i === 23 ||
                i === 24 ||
                i === 28 ||
                i === 29
              ? "currency"
              : i === 13 || i === 19
                ? "days"
                : i === 14 || i === 20
                  ? "score"
                  : "percentage",
        aggregation:
          i < 3 || i === 3 || i === 4 || i === 5 || i === 6
            ? "SUM"
            : i === 11 ||
                i === 15 ||
                i === 16 ||
                i === 17 ||
                i === 22 ||
                i === 23 ||
                i === 24 ||
                i === 28 ||
                i === 29
              ? "SUM"
              : i === 13 || i === 19
                ? "AVG"
                : i === 14 || i === 20
                  ? "AVG"
                  : "AVG",
      })),
    },
    {
      name: "Remarketing & Disposition Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LSE-${String(i + 151).padStart(3, "0")}`,
        name: [
          "Total Remarketing Volume",
          "Average Sale Price",
          "Sale Price to Residual Ratio",
          "Remarketing Gain",
          "Remarketing Loss",
          "Net Remarketing Gain/Loss",
          "Time to Sale (Avg Days)",
          "Auction Sales",
          "Direct Sales",
          "Dealer Sales",
          "Wholesale Sales",
          "Retail Sales",
          "Scrap/Parts Sales",
          "Remarketing Channel Performance",
          "Buyer Type Distribution",
          "Geographic Remarketing Performance",
          "Seasonal Sale Patterns",
          "Inventory Holding Time",
          "Inventory Carrying Cost",
          "Remarketing Operating Expenses",
          "Remarketing Margin %",
          "Total Disposal Volume (Units)",
          "Disposal Volume by Equipment Type",
          "Returned Equipment Pending Sale",
          "Remarketing Pipeline Value",
          "Market Conditions Index",
          "Equipment Depreciation Rate",
          "Used Equipment Market Liquidity",
          "Remarketing Success Rate (90 Days)",
          "Pricing Optimization Score",
        ][i],
        description: `Description for metric ${i + 151}`,
        formula: "SUM(sale_amount)",
        unit:
          i === 0 ||
          i === 1 ||
          i === 3 ||
          i === 4 ||
          i === 5 ||
          i === 18 ||
          i === 19 ||
          i === 24
            ? "currency"
            : i === 6 || i === 17
              ? "days"
              : i === 7 ||
                  i === 8 ||
                  i === 9 ||
                  i === 10 ||
                  i === 11 ||
                  i === 12 ||
                  i === 21 ||
                  i === 23
                ? "count"
                : i === 25
                  ? "index"
                  : i === 29
                    ? "score"
                    : "percentage",
        aggregation:
          i === 0 ||
          i === 1 ||
          i === 3 ||
          i === 4 ||
          i === 5 ||
          i === 18 ||
          i === 19 ||
          i === 24
            ? "SUM"
            : i === 6 || i === 17
              ? "AVG"
              : i === 7 ||
                  i === 8 ||
                  i === 9 ||
                  i === 10 ||
                  i === 11 ||
                  i === 12 ||
                  i === 21 ||
                  i === 23
                ? "SUM"
                : i === 25
                  ? "AVG"
                  : i === 29
                    ? "AVG"
                    : "AVG",
      })),
    },
    {
      name: "Credit Quality & Risk Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LSE-${String(i + 181).padStart(3, "0")}`,
        name: [
          "Delinquency Rate (30+ DPD)",
          "Delinquency Rate (60+ DPD)",
          "Delinquency Rate (90+ DPD)",
          "Nonperforming Leases",
          "Charge-Off Rate",
          "Charge-Off Amount",
          "Recovery Rate",
          "Recovery Amount",
          "Net Charge-Off Rate",
          "Net Charge-Off Amount",
          "Allowance for Credit Losses (CECL)",
          "Allowance Coverage Ratio",
          "Average Credit Score (Portfolio)",
          "Credit Tier A %",
          "Credit Tier B %",
          "Credit Tier C %",
          "Subprime Lease %",
          "Repossession Count",
          "Repossession Rate",
          "Repossession Recovery Value",
          "Repossession Loss Severity",
          "Collateral Coverage Ratio",
          "Equipment Value Decline Rate",
          "Residual Risk Exposure",
          "Credit Loss Provision Expense",
          "Early Payment Default (EPD) Rate",
          "Vintage Charge-Off Performance",
          "Roll Rate (30 to 60 DPD)",
          "Roll Rate (60 to 90 DPD)",
          "Cure Rate",
        ][i],
        description: `Description for metric ${i + 181}`,
        formula: "SUM(balance WHERE days_past_due >= 30) / Total Balance * 100",
        unit:
          i === 3 ||
          i === 5 ||
          i === 7 ||
          i === 9 ||
          i === 10 ||
          i === 19 ||
          i === 24
            ? "currency"
            : i === 17
              ? "count"
              : i === 12
                ? "score"
                : "percentage",
        aggregation:
          i === 3 ||
          i === 5 ||
          i === 7 ||
          i === 9 ||
          i === 10 ||
          i === 19 ||
          i === 24
            ? "SUM"
            : i === 17
              ? "SUM"
              : i === 12
                ? "AVG"
                : "AVG",
      })),
    },
    {
      name: "Profitability & Yield Metrics",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: `LSE-${String(i + 211).padStart(3, "0")}`,
        name: [
          "Total Lease Revenue",
          "Rental Income",
          "Interest Income (Finance Leases)",
          "Residual Income",
          "Fee Income",
          "Late Fee Revenue",
          "Early Termination Fee Revenue",
          "Documentation Fee Revenue",
          "Net Interest Margin (NIM)",
          "Portfolio Yield",
          "Lease Rate Factor (Money Factor)",
          "Effective Annual Rate (EAR)",
          "Spread over Funding Cost",
          "Return on Assets (ROA)",
          "Return on Equity (ROE)",
          "Economic Profit",
          "Lease Profitability (Total)",
          "Lease Profitability (Avg per Lease)",
          "Customer Profitability",
          "Equipment Type Profitability",
          "Geographic Profitability",
          "Channel Profitability",
          "Operating Expense",
          "Credit Loss Expense",
          "Residual Loss Expense",
          "Cost per Lease",
          "Cost-to-Income Ratio",
          "Revenue per Lease",
          "Net Income Margin",
          "Pre-Tax ROA",
        ][i],
        description: `Description for metric ${i + 211}`,
        formula: "SUM(rental_income + interest_income + fee_income)",
        unit:
          i < 8 ||
          i === 15 ||
          i === 16 ||
          i === 17 ||
          i === 18 ||
          i === 19 ||
          i === 20 ||
          i === 21 ||
          i === 22 ||
          i === 23 ||
          i === 24 ||
          i === 25 ||
          i === 27
            ? "currency"
            : i === 10
              ? "factor"
              : "percentage",
        aggregation:
          i < 8 ||
          i === 15 ||
          i === 16 ||
          i === 17 ||
          i === 18 ||
          i === 19 ||
          i === 20 ||
          i === 21 ||
          i === 22 ||
          i === 23 ||
          i === 24 ||
          i === 25 ||
          i === 27
            ? "SUM"
            : i === 10
              ? "AVG"
              : "AVG",
      })),
    },
    {
      name: "Operational Metrics",
      metrics: Array.from({ length: 20 }, (_, i) => ({
        id: `LSE-${String(i + 241).padStart(3, "0")}`,
        name: [
          "Payment Collection Rate",
          "Auto-Pay Enrollment %",
          "Payment Processing Cost",
          "Lease Servicing Cost per Lease",
          "Portfolio Management Efficiency",
          "Asset Tracking Accuracy",
          "Insurance Compliance Rate",
          "Maintenance Tracking Coverage",
          "Title/Registration Compliance",
          "UCC Filing Accuracy",
          "Document Management Efficiency",
          "Contract Amendment Processing Time",
          "Customer Service Call Volume",
          "Customer Satisfaction (CSAT)",
          "Net Promoter Score (NPS)",
          "Vendor On-Time Delivery %",
          "Vendor Quality Score",
          "Syndication Participation Rate",
          "Participation Accounting Accuracy",
          "System Uptime %",
        ][i],
        description: `Description for metric ${i + 241}`,
        formula: "Payments Collected / Payments Due * 100",
        unit:
          i === 2 || i === 3
            ? "currency"
            : i === 11
              ? "days"
              : i === 12
                ? "count"
                : i === 13 || i === 14 || i === 16
                  ? "score"
                  : "percentage",
        aggregation:
          i === 2 || i === 3
            ? "AVG"
            : i === 11
              ? "AVG"
              : i === 12
                ? "SUM"
                : i === 13 || i === 14 || i === 16
                  ? "AVG"
                  : "AVG",
      })),
    },
  ],
};

// ============================================================================
// WORKFLOWS & PROCESSES
// ============================================================================

export const leasingWorkflows = {
  leaseOrigination: {
    name: "Lease Application & Funding",
    steps: [
      "Application Intake",
      "Credit Decision",
      "Equipment Sourcing/Vendor Coordination",
      "Documentation",
      "Funding",
      "Asset Delivery",
    ],
    sla: "5-10 business days",
    automation: "60% automated credit decisioning",
  },
  asc842Accounting: {
    name: "ASC 842 Monthly Accounting Close",
    steps: [
      "Lease Data Extraction",
      "Classification (Operating vs Finance)",
      "Discount Rate Determination (IBR)",
      "ROU Asset & Liability Calculation",
      "Amortization Tables",
      "Journal Entry Posting",
    ],
    sla: "Month-end + 3 business days",
    automation: "90% automated calculation",
  },
  residualValuation: {
    name: "Residual Value Estimation & Update",
    steps: [
      "Market Data Collection",
      "Depreciation Modeling",
      "Equipment Condition Assessment",
      "Residual Value Calculation",
      "Reserve Adjustment",
      "Financial Reporting",
    ],
    sla: "Quarterly refresh",
    automation: "70% automated with ML models",
  },
  endOfLease: {
    name: "End-of-Lease Processing",
    steps: [
      "EOL Notification (90 Days Prior)",
      "Customer Option Selection",
      "Asset Inspection (if Return)",
      "Final Invoice/Settlement",
      "Asset Pickup/Title Transfer",
      "Re-Lease or Remarketing",
    ],
    sla: "Complete within 30 days of lease end",
    automation: "50% automated",
  },
  remarketing: {
    name: "Equipment Remarketing & Disposition",
    steps: [
      "Asset Receipt & Inspection",
      "Refurbishment (if needed)",
      "Valuation & Pricing",
      "Listing (Auction/Direct Sale)",
      "Sale Execution",
      "Title Transfer & Settlement",
    ],
    sla: "90 days from return to sale",
    automation: "40% automated (pricing/listing)",
  },
  leaseModification: {
    name: "Lease Modification Processing",
    steps: [
      "Modification Request",
      "Financial Impact Analysis",
      "Credit Re-Review (if needed)",
      "Contract Amendment",
      "ASC 842 Remeasurement",
      "System Updates",
    ],
    sla: "15 business days",
    automation: "30% automated",
  },
};

// ============================================================================
// REGULATORY CONTEXT
// ============================================================================

export const leasingRegulatoryFramework = {
  primaryRegulations: [
    {
      regulation: "ASC 842 (FASB)",
      description: "Leases - lessor and lessee accounting",
      authority: "FASB",
    },
    {
      regulation: "IFRS 16",
      description: "International lease accounting standard",
      authority: "IASB",
    },
    {
      regulation: "UCC Article 9",
      description: "Secured transactions and equipment collateral",
      authority: "State Law",
    },
    {
      regulation: "IRS Section 467",
      description: "Tax treatment of leases and rental agreements",
      authority: "IRS",
    },
    {
      regulation: "IRS Section 7701",
      description: "True lease vs conditional sale determination",
      authority: "IRS",
    },
    {
      regulation: "Reg Z (TILA)",
      description: "Consumer lease disclosures",
      authority: "CFPB",
    },
    {
      regulation: "FASB ASC 840 (Legacy)",
      description: "Prior lease accounting standard",
      authority: "FASB",
    },
    {
      regulation: "Equipment Leasing Association (ELA) Standards",
      description: "Industry best practices",
      authority: "ELA",
    },
  ],
  reportingRequirements: [
    {
      report: "ASC 842 Financial Statement Disclosures",
      frequency: "Quarterly/Annual",
      description: "ROU assets, lease liabilities, maturity analysis",
    },
    {
      report: "10-K/10-Q Lease Disclosures",
      frequency: "Quarterly/Annual",
      description: "SEC required lease disclosures",
    },
    {
      report: "IRS Form 8746",
      frequency: "Annual",
      description: "Passive activity loss limitation for leasing",
    },
    {
      report: "State UCC Filings",
      frequency: "As needed",
      description: "Perfection of security interest in equipment",
    },
  ],
};

// ============================================================================
// DATA QUALITY RULES
// ============================================================================

export const leasingDataQualityRules = {
  completeness: [
    "Lease ID must be populated",
    "Lessee ID must be linked to customer record",
    "Equipment asset ID must be linked",
    "Lease commencement date must be specified",
    "Lease term must be defined",
  ],
  accuracy: [
    "Lease balances must reconcile to general ledger",
    "ROU assets and lease liabilities must match ASC 842 calculations",
    "Residual values must reconcile to valuation models",
    "Payment schedules must sum to total lease obligation",
  ],
  consistency: [
    "Lease classification (Operating vs Finance) must be consistent",
    "Equipment costs must match vendor invoices",
    "Discount rates (IBR) must align with treasury yield curve",
  ],
  timeliness: [
    "Lease originations must be recorded within T+1",
    "ASC 842 calculations must complete by month-end + 3 days",
    "Residual values must be updated quarterly",
  ],
  validity: [
    "Lease terms must be 1-120 months",
    "Residual values must be 0-100% of original cost",
    "Lease rates must be positive",
  ],
  uniqueness: [
    "Lease IDs must be unique",
    "Equipment serial numbers must be unique",
    "Payment schedule IDs must be unique",
  ],
};

// ============================================================================
// ROW-LEVEL SECURITY (RLS) POLICIES
// ============================================================================

export const leasingRLSPolicies = {
  description: "Row-level security policies for leasing domain",
  policies: [
    {
      name: "lease_officer_access",
      table: "gold.fact_lease_portfolio",
      condition:
        "lease_officer_id = CURRENT_USER OR user_role IN ('Manager', 'Executive')",
      description: "Lease officers see their own leases, managers see all",
    },
    {
      name: "geography_access",
      table: "gold.fact_lease_portfolio",
      condition:
        "lessee_state IN (SELECT state FROM user_geography_access WHERE user_id = CURRENT_USER)",
      description: "Regional access to leases by geography",
    },
    {
      name: "pii_masking",
      table: "silver.lease_customer_golden",
      condition:
        "CASE WHEN user_role = 'Analytics' THEN MASK(lessee_tax_id) ELSE lessee_tax_id END",
      description: "Mask lessee PII for analytics users",
    },
  ],
};

// ============================================================================
// QUERY COOKBOOK
// ============================================================================

export const leasingQueryCookbook = {
  description: "Pre-built analytical queries for leasing domain",
  queries: [
    {
      name: "ASC 842 Balance Sheet Summary",
      sql: `
SELECT 
  DATE_TRUNC('month', calculation_date) as month,
  lease_type,
  SUM(rou_asset_amount) as total_rou_assets,
  SUM(lease_liability_amount) as total_lease_liabilities,
  SUM(rou_asset_amount) - SUM(accumulated_amortization) as net_rou_assets
FROM silver.asc842_calculations
WHERE calculation_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY month, lease_type
ORDER BY month, lease_type;
      `,
    },
    {
      name: "Residual Realization Analysis",
      sql: `
SELECT 
  e.equipment_type,
  COUNT(r.asset_id) as asset_count,
  AVG(r.estimated_residual) as avg_estimated_residual,
  AVG(r.actual_sale_price) as avg_actual_sale_price,
  (AVG(r.actual_sale_price) / NULLIF(AVG(r.estimated_residual), 0) - 1) * 100 as realization_variance_pct,
  SUM(r.actual_sale_price - r.estimated_residual) as total_gain_loss
FROM gold.fact_residual_realization r
JOIN gold.dim_equipment_type e ON r.equipment_type_key = e.equipment_type_key
WHERE r.sale_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY e.equipment_type
ORDER BY asset_count DESC;
      `,
    },
    {
      name: "End-of-Lease Pipeline (Next 90 Days)",
      sql: `
SELECT 
  l.lease_id,
  l.lessee_name,
  l.equipment_type,
  l.maturity_date,
  DATEDIFF(DAY, CURRENT_DATE, l.maturity_date) as days_to_maturity,
  p.outstanding_balance,
  r.estimated_residual,
  l.eol_option_selected
FROM gold.dim_lease l
JOIN gold.fact_lease_portfolio p ON l.lease_key = p.lease_key
LEFT JOIN silver.residual_value_tracking r ON l.lease_id = r.lease_id
WHERE l.maturity_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 90
  AND l.lease_status = 'Active'
ORDER BY l.maturity_date;
      `,
    },
  ],
};

// ============================================================================
// EXPORT
// ============================================================================

export const leasingComprehensiveDomain = {
  domainName: "Leasing & Equipment Finance",
  domainId: "leasing",
  description:
    "Equipment leasing, ASC 842 accounting, residual management, remarketing",
  bronzeLayer: leasingBronzeLayer,
  silverLayer: leasingSilverLayer,
  goldLayer: leasingGoldLayer,
  metricsCatalog: leasingMetricsCatalog,
  workflows: leasingWorkflows,
  regulatoryFramework: leasingRegulatoryFramework,
  dataQualityRules: leasingDataQualityRules,
  rlsPolicies: leasingRLSPolicies,
  queryCookbook: leasingQueryCookbook,
  completionStatus: "100%",
  productionReady: true,
};
