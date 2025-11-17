// BANKING AREAS TAXONOMY
// High-level business unit categorization with domain mappings

export interface BankingArea {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  domainIds: string[];
  keyCapabilities: string[];
  targetCustomers: string[];
  revenueModel: string[];
  metrics: {
    totalDomains: number;
    totalMetrics: number;
    customerSegments: number;
    annualRevenue?: string;
  };
  strategicPriority: "Core" | "Growth" | "Emerging";
}

export const bankingAreas: BankingArea[] = [
  {
    id: "retail",
    name: "Retail Banking",
    description:
      "Consumer banking services including deposits, loans, credit cards, payments, and branch operations serving individual customers",
    icon: "👤",
    color: "blue",
    gradient: "from-blue-600 via-blue-500 to-blue-400",
    domainIds: [
      "customer-retail",
      "deposits-retail",
      "loans-retail",
      "cards-retail",
      "payments-retail",
      "branch-retail",
      "digital-retail",
      "investment-retail",
      "insurance-retail",
      "collections-retail",
      "customer-service-retail",
      "marketing-retail",
      "marketing-orchestration",
      "crm-analytics",
      "fraud-retail",
      "compliance-retail",
      "open-banking-retail",
    ],
    keyCapabilities: [
      "Customer 360 & lifecycle management",
      "Personal checking & savings accounts",
      "Consumer loans (auto, personal, student)",
      "Credit & debit cards with rewards",
      "P2P payments (Zelle) & bill pay",
      "Branch & ATM network operations",
      "Digital & mobile banking experiences",
      "Investment & brokerage services",
      "Insurance products (life, auto, home)",
      "Collections & debt recovery",
      "Customer service & contact centers",
      "Marketing campaigns & personalization",
      "Marketing orchestration (PEGA NBA decisioning)",
      "Next-Best-Action (NBA) personalization",
      "Offer management and propensity scoring",
      "CRM analytics (SALESFORCE integration)",
      "Sales pipeline and opportunity management",
      "Customer engagement scoring and tracking",
      "Multi-channel campaign orchestration",
      "Fraud detection & prevention",
      "Regulatory compliance (CARD Act, TILA, EFTA)",
      "Open banking & API connectivity",
    ],
    targetCustomers: [
      "Individual consumers",
      "Mass market segment",
      "Mass affluent customers",
      "High-net-worth individuals (HNWI)",
      "Small business owners (crossover)",
    ],
    revenueModel: [
      "Net Interest Margin (NIM) on deposits & loans",
      "Fee income (overdraft, monthly fees, ATM)",
      "Credit card interchange & interest",
      "Loan origination fees",
      "Investment advisory fees",
      "Insurance commissions",
    ],
    metrics: {
      totalDomains: 17,
      totalMetrics: 3510, // 2930 (base retail) + 300 (marketing-orchestration) + 280 (crm-analytics)
      customerSegments: 5,
      annualRevenue: "$15B+ typical for large banks",
    },
    strategicPriority: "Core",
  },
  {
    id: "commercial",
    name: "Commercial Banking",
    description:
      "Business banking services for small to large enterprises including commercial lending, treasury services, trade finance, cash management, and merchant services",
    icon: "🏢",
    color: "green",
    gradient: "from-green-600 via-green-500 to-emerald-400",
    domainIds: [
      "customer-core", // Cross-area customer analytics & engagement
      "customer-commercial", // Business entity management & relationships
      "loans-commercial", // C&I, CRE, LOC, term loans
      "deposits-commercial", // DDA, analyzed accounts, sweep, ZBA
      "payments-commercial", // ACH, wire, RTP, positive pay
      "treasury-commercial", // FX, derivatives, hedging, liquidity (includes fx & cash-mgmt)
      "trade-finance-commercial", // Letters of credit, trade documentation, SWIFT
      "merchant-services-commercial", // Merchant acquiring, POS, card processing
      "leasing-commercial", // Equipment leasing & finance
      "abl-commercial", // Asset-Based Lending (AR/inventory financing)
      "risk-commercial", // Credit, market, operational, liquidity risk
      "compliance-commercial", // BSA/AML, KYB, OFAC, CTR, SAR
    ],
    keyCapabilities: [
      "Commercial & Industrial (C&I) lending",
      "Commercial Real Estate (CRE) financing",
      "Lines of credit & working capital",
      "Treasury management services",
      "Cash management & lockbox services",
      "Trade finance & letters of credit",
      "Foreign exchange & hedging",
      "Merchant acquiring & payment processing",
      "Asset-based lending (AR/inventory financing)",
      "Equipment leasing & finance",
      "Supply chain finance",
      "Remote deposit capture & positive pay",
    ],
    targetCustomers: [
      "Small businesses (< $5M revenue)",
      "Middle market ($5M - $500M revenue)",
      "Large corporates (> $500M revenue)",
      "Non-profit organizations",
      "Government entities",
    ],
    revenueModel: [
      "Interest income on commercial loans",
      "Treasury services fees",
      "FX spreads & hedging fees",
      "Trade finance fees",
      "Deposit service charges",
    ],
    metrics: {
      totalDomains: 12, // Expanded: 10 product domains + 2 cross-domain (risk, compliance)
      totalMetrics: 3800, // Expanded with 4 new domains (trade finance, merchant, ABL, leasing)
      customerSegments: 4,
      annualRevenue: "$10B+ typical for large banks",
    },
    strategicPriority: "Core",
  },
  {
    id: "wealth",
    name: "Wealth Management",
    description:
      "Investment advisory, private banking, trust services, and portfolio management for high-net-worth individuals and families",
    icon: "💎",
    color: "purple",
    gradient: "from-purple-600 via-purple-500 to-fuchsia-400",
    domainIds: [
      "customer-core", // Client analytics & personalization
      "wealth",
      "deposits", // Private banking deposits
      "loans", // Private banking lending
      "fx", // Multi-currency for HNWI
      "compliance", // Fiduciary compliance
    ],
    keyCapabilities: [
      "Investment advisory & portfolio management",
      "Private banking services",
      "Trust & estate planning",
      "Retirement planning (IRA, 401k)",
      "Tax-advantaged investing",
      "Alternative investments",
      "Philanthropic advisory",
      "Custody & brokerage services",
    ],
    targetCustomers: [
      "High-Net-Worth (HNW): $1M - $10M AUM",
      "Ultra-High-Net-Worth (UHNW): $10M+ AUM",
      "Family offices",
      "Institutional investors",
    ],
    revenueModel: [
      "Asset-based fees (% of AUM)",
      "Performance fees",
      "Advisory fees",
      "Brokerage commissions",
      "Trust administration fees",
    ],
    metrics: {
      totalDomains: 5,
      totalMetrics: 180,
      customerSegments: 3,
      annualRevenue: "$5B+ typical for large wealth managers",
    },
    strategicPriority: "Growth",
  },
  {
    id: "mortgage",
    name: "Mortgage Banking",
    description:
      "Residential and commercial mortgage origination, underwriting, servicing, and secondary market operations",
    icon: "🏠",
    color: "orange",
    gradient: "from-orange-600 via-orange-500 to-amber-400",
    domainIds: [
      "mortgages",
      "loans", // Mortgage loans
      "deposits", // Escrow accounts
      "compliance", // TRID, HMDA compliance
      "risk", // Mortgage risk
      "fraud", // Mortgage fraud
    ],
    keyCapabilities: [
      "Residential mortgage origination",
      "Commercial mortgage lending",
      "Mortgage underwriting & processing",
      "Loan servicing & payments",
      "Escrow management",
      "Secondary market sales",
      "MSR (Mortgage Servicing Rights) management",
      "Prepayment risk modeling",
    ],
    targetCustomers: [
      "Home buyers",
      "Real estate investors",
      "Commercial property owners",
      "Refinance customers",
    ],
    revenueModel: [
      "Origination fees & points",
      "Gain-on-sale (secondary market)",
      "Servicing fee income",
      "Interest income (portfolio loans)",
      "Ancillary fees",
    ],
    metrics: {
      totalDomains: 6,
      totalMetrics: 220,
      customerSegments: 3,
      annualRevenue: "$3B+ typical for large mortgage banks",
    },
    strategicPriority: "Core",
  },
  {
    id: "corporate",
    name: "Corporate & Investment Banking",
    description:
      "Capital markets, investment banking, institutional sales & trading, and corporate advisory services",
    icon: "📈",
    color: "indigo",
    gradient: "from-indigo-600 via-indigo-500 to-blue-400",
    domainIds: [
      "treasury",
      "fx",
      "risk",
      "loans", // Syndicated loans
      "compliance",
      "revenue", // Trading P&L
    ],
    keyCapabilities: [
      "Equity & debt capital markets",
      "M&A advisory",
      "Institutional sales & trading",
      "Syndicated lending",
      "Structured finance",
      "Derivatives & risk management",
      "Prime brokerage",
      "Research & analytics",
    ],
    targetCustomers: [
      "Large corporations",
      "Institutional investors",
      "Private equity firms",
      "Hedge funds",
      "Sovereign wealth funds",
    ],
    revenueModel: [
      "M&A advisory fees",
      "Underwriting fees",
      "Trading revenue",
      "Syndication fees",
      "Prime brokerage fees",
    ],
    metrics: {
      totalDomains: 6,
      totalMetrics: 260,
      customerSegments: 4,
      annualRevenue: "$8B+ typical for bulge bracket banks",
    },
    strategicPriority: "Growth",
  },
  {
    id: "operations",
    name: "Operations & Technology",
    description:
      "Core banking operations, technology infrastructure, data management, and operational risk across all business lines",
    icon: "⚙️",
    color: "slate",
    gradient: "from-slate-600 via-slate-500 to-gray-400",
    domainIds: ["operations", "channels", "fraud", "compliance", "risk"],
    keyCapabilities: [
      "Core banking platform",
      "Transaction processing",
      "Reconciliation & settlements",
      "Digital banking infrastructure",
      "Data management & analytics",
      "Cybersecurity",
      "Operational risk management",
      "Business continuity",
    ],
    targetCustomers: [
      "Internal business units",
      "All customer segments (enabler)",
    ],
    revenueModel: [
      "Cost center (enables revenue generation)",
      "Efficiency gains",
      "Risk reduction",
    ],
    metrics: {
      totalDomains: 5,
      totalMetrics: 180,
      customerSegments: 1,
    },
    strategicPriority: "Core",
  },
  {
    id: "risk-compliance",
    name: "Risk & Compliance",
    description:
      "Enterprise risk management, regulatory compliance, AML/KYC, and fraud prevention across all business lines",
    icon: "🛡️",
    color: "red",
    gradient: "from-red-600 via-red-500 to-rose-400",
    domainIds: ["risk", "compliance", "fraud", "collections"],
    keyCapabilities: [
      "Credit risk management",
      "Market risk (VaR, stress testing)",
      "Operational risk",
      "Liquidity risk",
      "AML/BSA compliance",
      "Sanctions screening (OFAC)",
      "Fraud detection & prevention",
      "Regulatory reporting (CCAR, DFAST)",
      "Model risk management",
    ],
    targetCustomers: [
      "Internal business units",
      "Regulators (Fed, OCC, FDIC)",
      "Board of Directors",
      "Executive management",
    ],
    revenueModel: [
      "Risk-adjusted returns",
      "Capital optimization",
      "Loss prevention",
      "Regulatory compliance (avoid fines)",
    ],
    metrics: {
      totalDomains: 4,
      totalMetrics: 240,
      customerSegments: 1,
    },
    strategicPriority: "Core",
  },
];

// Domain to Banking Area mapping (for reverse lookup)
export const domainToBankingAreaMap: Record<string, string[]> = {
  // Retail Banking Domains
  "customer-retail": ["retail"],
  "deposits-retail": ["retail"],
  "loans-retail": ["retail"],
  "cards-retail": ["retail"],
  "payments-retail": ["retail"],
  "branch-retail": ["retail"],
  "digital-retail": ["retail"],
  "investment-retail": ["retail"],
  "insurance-retail": ["retail"],
  "collections-retail": ["retail"],
  "customer-service-retail": ["retail"],
  "marketing-retail": ["retail"],
  "marketing-orchestration": ["retail"],
  "crm-analytics": ["retail"],
  "fraud-retail": ["retail"],
  "compliance-retail": ["retail"],
  "open-banking-retail": ["retail"],

  // Legacy/Cross-Area Domains
  deposits: ["retail", "commercial", "wealth"],
  loans: ["retail", "commercial", "mortgage", "corporate"],
  "credit-cards": ["retail"],
  payments: ["retail", "commercial"],
  treasury: ["commercial", "corporate"],
  fx: ["commercial", "wealth", "corporate"],
  fraud: ["retail", "mortgage", "operations"],
  compliance: [
    "retail",
    "commercial",
    "wealth",
    "mortgage",
    "corporate",
    "risk-compliance",
  ],
  risk: ["commercial", "corporate", "mortgage", "risk-compliance"],
  wealth: ["wealth"],
  mortgages: ["mortgage"],
  collections: ["retail", "risk-compliance"],
  channels: ["retail", "operations"],
  operations: ["operations"],
  revenue: ["corporate"],
  "trade-finance": ["commercial"],
  "cash-management": ["commercial"],
  "merchant-services": ["commercial", "retail"],
  leasing: ["commercial"],
  "asset-based-lending": ["commercial"],
};

// Banking Areas Stats
export const bankingAreasStats = {
  totalAreas: bankingAreas.length,
  coreAreas: bankingAreas.filter((a) => a.strategicPriority === "Core").length,
  growthAreas: bankingAreas.filter((a) => a.strategicPriority === "Growth")
    .length,
  totalDomainsCovered: new Set(bankingAreas.flatMap((a) => a.domainIds)).size,
  totalMetrics: bankingAreas.reduce(
    (sum, a) => sum + a.metrics.totalMetrics,
    0,
  ),

  // Area-specific progress (retail has active implementation)
  retail: {
    totalDomains: 17,
    totalMetrics: 3510, // Base 2930 + Marketing Orchestration 300 + CRM Analytics 280
    completedDomains: 17,
    completedMetrics: 3510,
    completionPercentage: 100,
  },
};

// Helper function to get banking area by ID
export function getBankingAreaById(id: string): BankingArea | undefined {
  return bankingAreas.find((area) => area.id === id);
}

// Helper function to get domains for a banking area
export function getDomainIdsForArea(areaId: string): string[] {
  const area = getBankingAreaById(areaId);
  return area ? area.domainIds : [];
}
