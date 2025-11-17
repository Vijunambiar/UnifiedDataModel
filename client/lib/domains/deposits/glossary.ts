// Deposits Domain Glossary
// Business definitions and semantic layer terminology

export interface GlossaryTerm {
  name: string;
  definition: string;
  businessMeaning: string;
  technicalDefinition: string;
  source: string;
  relatedTerms: string[];
}

export const depositsGlossary: GlossaryTerm[] = [
  {
    name: "Total Deposits (AUM)",
    definition: "Sum of all customer deposits held by the bank across all product types",
    businessMeaning:
      "Primary funding source for bank lending; growth metric for investor relations; driver of cost of funds",
    technicalDefinition:
      "SUM(fct_deposit_daily.closing_balance) where account_status='Active'",
    source: "Gold layer: agg_deposits_daily",
    relatedTerms: ["Core Deposits", "Brokered Deposits", "AUM"],
  },
  {
    name: "Cost of Funds",
    definition: "Average interest rate paid on all deposits",
    businessMeaning:
      "Critical metric for Net Interest Margin (NIM) profitability; impacts pricing competitiveness",
    technicalDefinition:
      "(SUM(interest_paid) / AVG(deposit_balance)) / 12 converted to basis points",
    source: "Gold layer: agg_deposits_monthly.cost_of_funds_bps",
    relatedTerms: ["Interest Expense", "NIM", "Pricing"],
  },
  {
    name: "Net Interest Margin (NIM)",
    definition: "Interest earned on assets minus interest expense on deposits, divided by average earning assets",
    businessMeaning:
      "Primary profitability metric for banks; targets typically 2.5-3.5%; every 10bps change = $50M annual P&L impact",
    technicalDefinition:
      "((Interest Income - Interest Expense) / Average Earning Assets) * 100",
    source: "Gold layer: fct_profitability_monthly.nim_bps",
    relatedTerms: ["Cost of Funds", "Interest Income", "ROA"],
  },
  {
    name: "Core Deposits",
    definition: "Stable, non-interest-bearing or low-rate deposits from retail customers (checking, savings)",
    businessMeaning:
      "Highly valued funding source; lower cost, more stable; strategic target for relationship managers",
    technicalDefinition:
      "WHERE product_type IN ('Checking', 'Savings') AND rate_type NOT IN ('CD', 'Money Market')",
    source: "Gold layer: dim_deposit_products.is_core_deposit",
    relatedTerms: ["Brokered Deposits", "Deposit Mix", "Funding Cost"],
  },
  {
    name: "Liquidity Coverage Ratio (LCR)",
    definition: "Basel III metric: (High-Quality Liquid Assets) / (Total Net Cash Outflows over 30 days)",
    businessMeaning:
      "Regulatory minimum 100%; measures ability to survive 30-day stress; mandatory compliance",
    technicalDefinition:
      "LCR = HQLA / (30-day assumed deposit runoff + other outflows) >= 1.0",
    source: "Gold layer: agg_regulatory_lcr_daily",
    relatedTerms: ["NSFR", "Regulatory Capital", "Stress Testing"],
  },
  {
    name: "Net Stable Funding Ratio (NSFR)",
    definition:
      "Basel III metric: (Available Stable Funding) / (Required Stable Funding) measured over 1 year",
    businessMeaning:
      "Long-term funding stability metric; minimum 100%; lower concentration risk in funding",
    technicalDefinition:
      "NSFR = Available Stable Funding / Required Stable Funding (12-month window)",
    source: "Gold layer: agg_regulatory_nsfr_daily",
    relatedTerms: ["LCR", "Funding Maturity", "Regulatory Capital"],
  },
  {
    name: "Deposit Product",
    definition: "Specific deposit offering (Savings Account, Money Market, CD, Checking, NOW Account)",
    businessMeaning: "Product mix determines cost of funds; strategic target for growth or deleveraging",
    technicalDefinition: "Dimension: product_type IN ('Savings', 'MM', 'CD', 'NOW')",
    source: "Gold layer: dim_deposit_products",
    relatedTerms: ["Product Strategy", "Pricing", "Product Mix"],
  },
  {
    name: "Deposit Runoff",
    definition: "Assumed percentage of deposits that will withdraw during stress (regulatory assumption)",
    businessMeaning:
      "Used in LCR/NSFR calculations; retail deposits typically 10% runoff, wholesale 20%",
    technicalDefinition:
      "Regulatory runoff rates: Stable retail=5%, less stable retail=10%, wholesale=25%",
    source: "Gold layer: agg_regulatory_lcr_daily.deposit_runoff_pct",
    relatedTerms: ["Stress Testing", "Regulatory Capital", "Liquidity Risk"],
  },
  {
    name: "Deposit Mix",
    definition: "Composition of deposits by product type, funding source, or customer segment",
    businessMeaning:
      "Strategic planning lever; shifting to lower-cost core deposits improves NIM",
    technicalDefinition: "% of total deposits by product/channel/segment",
    source: "Gold layer: agg_deposits_daily.deposit_mix",
    relatedTerms: ["Core Deposits", "Product Strategy", "Funding Strategy"],
  },
  {
    name: "Account Maturity",
    definition: "When a term deposit (CD) matures and can be rolled over or withdrawn",
    businessMeaning:
      "Planning horizon for deposit renewal strategy; retention opportunity at maturity",
    technicalDefinition:
      "maturity_date = opening_date + term_in_months in dim_deposit_products",
    source: "Gold layer: dim_deposit_products.maturity_date",
    relatedTerms: ["CD Ladder", "Rollover Rate", "Renewal Risk"],
  },
];
