// REVENUE & PROFITABILITY - SEMANTIC LAYER
// Business-friendly metrics and attributes for self-service BI and reporting
// Supports: P&L Analysis, Product Profitability, Customer Profitability, NIM, ROA, ROE, FTP

export type SemanticMeasure = {
  name: string;
  technical_name: string;
  aggregation:
    | "SUM"
    | "AVG"
    | "COUNT"
    | "COUNT DISTINCT"
    | "MIN"
    | "MAX"
    | "CALCULATED";
  format: "currency" | "percent" | "number" | "integer" | "date" | "datetime";
  description: string;
  sql: string;
  folder: string;
  type?: "additive" | "semi-additive" | "non-additive";
  hidden?: boolean;
};

export type SemanticAttribute = {
  name: string;
  technical_name: string;
  field: string;
  description: string;
  datatype?: "string" | "number" | "date" | "boolean";
  folder?: string;
  hidden?: boolean;
};

export type SemanticFolder = {
  name: string;
  description: string;
  measures: string[];
  icon?: string;
};

export type SemanticDrillPath = {
  name: string;
  levels: string[];
  description: string;
};

export const semanticRevenueLayer = {
  domain: "revenue",
  version: "1.0",
  last_updated: "2024-11-08",
  description:
    "Semantic layer for Revenue & Profitability - supporting P&L, product/customer profitability, and key financial ratios",

  measures: [
    // ========== INTEREST INCOME METRICS ==========
    {
      name: "Total Interest Income",
      technical_name: "total_interest_income",
      aggregation: "SUM",
      format: "currency",
      description: "Total interest income from all sources",
      sql: "SUM(fact_revenue.interest_income)",
      folder: "Interest Income",
      type: "additive",
    },
    {
      name: "Loan Interest Income",
      technical_name: "loan_interest_income",
      aggregation: "SUM",
      format: "currency",
      description: "Interest income from loan portfolio",
      sql: "SUM(fact_revenue.interest_income) WHERE dim_revenue_source.revenue_category = 'LOAN_INTEREST'",
      folder: "Interest Income",
      type: "additive",
    },
    {
      name: "Investment Interest Income",
      technical_name: "investment_interest_income",
      aggregation: "SUM",
      format: "currency",
      description: "Interest income from investment securities",
      sql: "SUM(fact_revenue.interest_income) WHERE dim_revenue_source.revenue_category = 'INVESTMENT_INTEREST'",
      folder: "Interest Income",
      type: "additive",
    },
    {
      name: "Average Yield on Earning Assets",
      technical_name: "avg_yield_earning_assets",
      aggregation: "CALCULATED",
      format: "percent",
      description:
        "Interest income as % of average earning assets (annualized)",
      sql: "(SUM(fact_revenue.interest_income) * 12 / AVG(fact_balances.earning_assets)) * 100",
      folder: "Interest Income",
      type: "non-additive",
    },

    // ========== INTEREST EXPENSE METRICS ==========
    {
      name: "Total Interest Expense",
      technical_name: "total_interest_expense",
      aggregation: "SUM",
      format: "currency",
      description: "Total interest expense on deposits and borrowings",
      sql: "SUM(fact_revenue.interest_expense)",
      folder: "Interest Expense",
      type: "additive",
    },
    {
      name: "Deposit Interest Expense",
      technical_name: "deposit_interest_expense",
      aggregation: "SUM",
      format: "currency",
      description: "Interest expense on customer deposits",
      sql: "SUM(fact_revenue.interest_expense) WHERE dim_expense_source.expense_category = 'DEPOSIT_INTEREST'",
      folder: "Interest Expense",
      type: "additive",
    },
    {
      name: "Average Cost of Funds",
      technical_name: "avg_cost_of_funds",
      aggregation: "CALCULATED",
      format: "percent",
      description:
        "Interest expense as % of interest-bearing liabilities (annualized)",
      sql: "(SUM(fact_revenue.interest_expense) * 12 / AVG(fact_balances.interest_bearing_liabilities)) * 100",
      folder: "Interest Expense",
      type: "non-additive",
    },

    // ========== NET INTEREST INCOME METRICS ==========
    {
      name: "Net Interest Income (NII)",
      technical_name: "net_interest_income",
      aggregation: "SUM",
      format: "currency",
      description: "Interest income minus interest expense",
      sql: "SUM(fact_revenue.interest_income - fact_revenue.interest_expense)",
      folder: "Net Interest Income",
      type: "additive",
    },
    {
      name: "Net Interest Margin (NIM)",
      technical_name: "net_interest_margin",
      aggregation: "CALCULATED",
      format: "percent",
      description: "NII as % of average earning assets (annualized)",
      sql: "((SUM(interest_income - interest_expense) * 12) / NULLIF(AVG(earning_assets), 0)) * 100",
      folder: "Net Interest Income",
      type: "non-additive",
    },
    {
      name: "Interest Rate Spread",
      technical_name: "interest_rate_spread",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Yield on earning assets minus cost of funds",
      sql: "((SUM(interest_income) * 12 / AVG(earning_assets)) - (SUM(interest_expense) * 12 / AVG(interest_bearing_liabilities))) * 100",
      folder: "Net Interest Income",
      type: "non-additive",
    },

    // ========== NON-INTEREST INCOME METRICS ==========
    {
      name: "Total Non-Interest Income",
      technical_name: "total_noninterest_income",
      aggregation: "SUM",
      format: "currency",
      description: "Total fee and other non-interest income",
      sql: "SUM(fact_revenue.noninterest_income)",
      folder: "Non-Interest Income",
      type: "additive",
    },
    {
      name: "Service Fee Income",
      technical_name: "service_fee_income",
      aggregation: "SUM",
      format: "currency",
      description: "Fees from deposit and account services",
      sql: "SUM(fact_revenue.noninterest_income) WHERE dim_revenue_source.revenue_category = 'SERVICE_FEES'",
      folder: "Non-Interest Income",
      type: "additive",
    },
    {
      name: "Interchange Income",
      technical_name: "interchange_income",
      aggregation: "SUM",
      format: "currency",
      description: "Interchange revenue from card transactions",
      sql: "SUM(fact_revenue.noninterest_income) WHERE dim_revenue_source.revenue_category = 'INTERCHANGE'",
      folder: "Non-Interest Income",
      type: "additive",
    },
    {
      name: "Wealth Management Fees",
      technical_name: "wealth_management_fees",
      aggregation: "SUM",
      format: "currency",
      description: "Fees from wealth management and advisory services",
      sql: "SUM(fact_revenue.noninterest_income) WHERE dim_revenue_source.revenue_category = 'WEALTH_FEES'",
      folder: "Non-Interest Income",
      type: "additive",
    },
    {
      name: "Gain on Sale of Loans",
      technical_name: "gain_on_sale_loans",
      aggregation: "SUM",
      format: "currency",
      description: "Gain on sale of mortgage and other loans",
      sql: "SUM(fact_revenue.noninterest_income) WHERE dim_revenue_source.revenue_category = 'GAIN_ON_SALE'",
      folder: "Non-Interest Income",
      type: "additive",
    },

    // ========== TOTAL REVENUE & PROFITABILITY ==========
    {
      name: "Total Revenue",
      technical_name: "total_revenue",
      aggregation: "SUM",
      format: "currency",
      description: "Total revenue (NII + non-interest income)",
      sql: "SUM(fact_revenue.interest_income - fact_revenue.interest_expense + fact_revenue.noninterest_income)",
      folder: "Total Revenue",
      type: "additive",
    },
    {
      name: "Total Non-Interest Expense",
      technical_name: "total_noninterest_expense",
      aggregation: "SUM",
      format: "currency",
      description: "Total operating expenses",
      sql: "SUM(fact_expenses.noninterest_expense)",
      folder: "Expenses",
      type: "additive",
    },
    {
      name: "Provision for Credit Losses",
      technical_name: "provision_credit_losses",
      aggregation: "SUM",
      format: "currency",
      description: "Provision expense for credit losses (CECL)",
      sql: "SUM(fact_expenses.provision_expense)",
      folder: "Expenses",
      type: "additive",
    },
    {
      name: "Pre-Tax Net Income",
      technical_name: "pre_tax_net_income",
      aggregation: "SUM",
      format: "currency",
      description: "Net income before taxes",
      sql: "SUM(fact_profitability.pre_tax_income)",
      folder: "Profitability",
      type: "additive",
    },
    {
      name: "Net Income",
      technical_name: "net_income",
      aggregation: "SUM",
      format: "currency",
      description: "Net income after taxes",
      sql: "SUM(fact_profitability.net_income)",
      folder: "Profitability",
      type: "additive",
    },

    // ========== EFFICIENCY & PROFITABILITY RATIOS ==========
    {
      name: "Efficiency Ratio",
      technical_name: "efficiency_ratio",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Non-interest expense as % of total revenue",
      sql: "(SUM(fact_expenses.noninterest_expense) / NULLIF(SUM(fact_revenue.interest_income - fact_revenue.interest_expense + fact_revenue.noninterest_income), 0)) * 100",
      folder: "Ratios",
      type: "non-additive",
    },
    {
      name: "Return on Assets (ROA)",
      technical_name: "return_on_assets",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Net income as % of average total assets (annualized)",
      sql: "(SUM(fact_profitability.net_income) * 12 / AVG(fact_balances.total_assets)) * 100",
      folder: "Ratios",
      type: "non-additive",
    },
    {
      name: "Return on Equity (ROE)",
      technical_name: "return_on_equity",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Net income as % of average total equity (annualized)",
      sql: "(SUM(fact_profitability.net_income) * 12 / AVG(fact_balances.total_equity)) * 100",
      folder: "Ratios",
      type: "non-additive",
    },
    {
      name: "Fee Income Ratio",
      technical_name: "fee_income_ratio",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Non-interest income as % of total revenue",
      sql: "(SUM(fact_revenue.noninterest_income) / NULLIF(SUM(fact_revenue.interest_income - fact_revenue.interest_expense + fact_revenue.noninterest_income), 0)) * 100",
      folder: "Ratios",
      type: "non-additive",
    },

    // ========== PRODUCT PROFITABILITY ==========
    {
      name: "Product Net Revenue",
      technical_name: "product_net_revenue",
      aggregation: "SUM",
      format: "currency",
      description: "Net revenue by product line",
      sql: "SUM(fact_product_profitability.net_revenue)",
      folder: "Product Profitability",
      type: "additive",
    },
    {
      name: "Product ROA",
      technical_name: "product_roa",
      aggregation: "CALCULATED",
      format: "percent",
      description: "Product net income as % of product assets",
      sql: "(SUM(fact_product_profitability.net_income) / NULLIF(AVG(fact_product_profitability.product_assets), 0)) * 100",
      folder: "Product Profitability",
      type: "non-additive",
    },
  ],

  attributes: [
    {
      name: "Revenue Source",
      technical_name: "revenue_source",
      field: "dim_revenue_source.source_desc",
      description:
        "Revenue source (Loan Interest, Deposit Fees, Interchange, etc.)",
      datatype: "string",
      folder: "Revenue",
    },
    {
      name: "Revenue Category",
      technical_name: "revenue_category",
      field: "dim_revenue_source.revenue_category",
      description: "High-level revenue category (Interest, Non-Interest)",
      datatype: "string",
      folder: "Revenue",
    },
    {
      name: "Expense Category",
      technical_name: "expense_category",
      field: "dim_expense_category.category_desc",
      description:
        "Expense category (Compensation, Occupancy, Technology, etc.)",
      datatype: "string",
      folder: "Expense",
    },
    {
      name: "Product Line",
      technical_name: "product_line",
      field: "dim_product_line.product_line_desc",
      description: "Product line (Deposits, Loans, Cards, Wealth, etc.)",
      datatype: "string",
      folder: "Product",
    },
    {
      name: "Business Line",
      technical_name: "business_line",
      field: "dim_business_line.business_line_desc",
      description: "Business line (Retail, Commercial, Treasury, Wealth)",
      datatype: "string",
      folder: "Organization",
    },
    {
      name: "Customer Segment",
      technical_name: "customer_segment",
      field: "dim_customer_segment.segment_desc",
      description: "Customer segment for profitability analysis",
      datatype: "string",
      folder: "Customer",
    },
    {
      name: "Geography",
      technical_name: "geography",
      field: "dim_geography.region_name",
      description: "Geographic region",
      datatype: "string",
      folder: "Geography",
    },
    {
      name: "Branch",
      technical_name: "branch",
      field: "dim_branch.branch_name",
      description: "Branch location",
      datatype: "string",
      folder: "Geography",
    },
    {
      name: "GL Account",
      technical_name: "gl_account",
      field: "dim_gl_account.account_number",
      description: "General ledger account number",
      datatype: "string",
      folder: "Accounting",
    },
  ],

  folders: [
    {
      name: "Interest Income",
      description:
        "Interest income from loans, investments, and other earning assets",
      measures: [
        "total_interest_income",
        "loan_interest_income",
        "investment_interest_income",
        "avg_yield_earning_assets",
      ],
      icon: "💵",
    },
    {
      name: "Interest Expense",
      description: "Interest expense on deposits and borrowings",
      measures: [
        "total_interest_expense",
        "deposit_interest_expense",
        "avg_cost_of_funds",
      ],
      icon: "💸",
    },
    {
      name: "Net Interest Income",
      description: "Net interest income and margin metrics",
      measures: [
        "net_interest_income",
        "net_interest_margin",
        "interest_rate_spread",
      ],
      icon: "💰",
    },
    {
      name: "Non-Interest Income",
      description: "Fee income, interchange, and other non-interest revenue",
      measures: [
        "total_noninterest_income",
        "service_fee_income",
        "interchange_income",
        "wealth_management_fees",
        "gain_on_sale_loans",
      ],
      icon: "🎫",
    },
    {
      name: "Total Revenue",
      description: "Total revenue combining interest and non-interest income",
      measures: ["total_revenue"],
      icon: "💎",
    },
    {
      name: "Expenses",
      description: "Operating expenses and provisions",
      measures: ["total_noninterest_expense", "provision_credit_losses"],
      icon: "📉",
    },
    {
      name: "Profitability",
      description: "Net income and pre-tax income",
      measures: ["pre_tax_net_income", "net_income"],
      icon: "📈",
    },
    {
      name: "Ratios",
      description: "Key financial ratios (Efficiency, ROA, ROE, NIM)",
      measures: [
        "efficiency_ratio",
        "return_on_assets",
        "return_on_equity",
        "fee_income_ratio",
      ],
      icon: "📊",
    },
    {
      name: "Product Profitability",
      description: "Profitability by product line",
      measures: ["product_net_revenue", "product_roa"],
      icon: "🏦",
    },
  ],

  drillPaths: [
    {
      name: "Revenue Hierarchy",
      levels: ["Revenue Category", "Revenue Source", "Product Line"],
      description: "Drill down by revenue source",
    },
    {
      name: "Product Hierarchy",
      levels: ["Business Line", "Product Line", "Product"],
      description: "Drill down by product for profitability analysis",
    },
    {
      name: "Geographic Hierarchy",
      levels: ["Region", "State", "Branch"],
      description: "Drill down by geography",
    },
    {
      name: "Customer Hierarchy",
      levels: ["Customer Segment", "Customer"],
      description: "Drill down by customer segment",
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month"],
      description: "Drill down by time period",
    },
  ],

  keyMetricSQL: {
    nimTrend: `
-- Net Interest Margin Trend with Components
SELECT 
  DATE_TRUNC('month', r.reporting_date) as month,
  SUM(r.interest_income) as total_interest_income,
  SUM(r.interest_expense) as total_interest_expense,
  SUM(r.interest_income - r.interest_expense) as net_interest_income,
  AVG(b.earning_assets) as avg_earning_assets,
  ((SUM(r.interest_income - r.interest_expense) * 12) / NULLIF(AVG(b.earning_assets), 0)) * 100 as nim_pct
FROM gold.fact_revenue r
JOIN gold.fact_balances b ON r.date_sk = b.date_sk
WHERE r.reporting_date >= DATE_TRUNC('month', CURRENT_DATE()) - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', r.reporting_date)
ORDER BY month DESC;
`,

    productProfitability: `
-- Product Line Profitability Analysis
SELECT 
  pl.product_line_desc,
  SUM(pp.interest_income + pp.noninterest_income) as total_revenue,
  SUM(pp.interest_expense) as interest_expense,
  SUM(pp.noninterest_expense) as operating_expense,
  SUM(pp.provision_expense) as provision_expense,
  SUM(pp.net_income) as net_income,
  (SUM(pp.net_income) / NULLIF(AVG(pp.product_assets), 0)) * 100 as roa_pct,
  (SUM(pp.noninterest_expense) / NULLIF(SUM(pp.interest_income + pp.noninterest_income - pp.interest_expense), 0)) * 100 as efficiency_ratio_pct
FROM gold.fact_product_profitability pp
JOIN gold.dim_product_line pl ON pp.product_line_sk = pl.product_line_sk
WHERE pp.reporting_date = DATE_TRUNC('month', CURRENT_DATE())
GROUP BY pl.product_line_desc
ORDER BY net_income DESC;
`,
  },
};

export default semanticRevenueLayer;
