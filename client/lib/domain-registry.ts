// DOMAIN REGISTRY - Comprehensive Integration
// Maps all 21 domains to their comprehensive implementations
// Provides unified interface for accessing domain data

import {
  creditCardsBronzeLayer,
  creditCardsSilverLayer,
  creditCardsGoldLayer,
  creditCardsMetricsCatalog,
} from "./creditcards-comprehensive";
import {
  loansBronzeLayer,
  loansSilverLayer,
  loansGoldLayer,
  loansMetricsCatalog,
} from "./loans-comprehensive";
import {
  customerCoreBronzeLayer,
  customerCoreSilverLayer,
  customerCoreGoldLayer,
  customerCoreMetricsCatalog,
} from "./customer-core-comprehensive";
import {
  paymentsBronzeLayer,
  paymentsSilverLayer,
  paymentsGoldLayer,
  paymentsMetricsCatalog,
} from "./payments-comprehensive";
import {
  riskBronzeLayer,
  riskSilverLayer,
  riskGoldLayer,
  riskMetricsCatalog,
} from "./risk-comprehensive";
import {
  treasuryBronzeLayer,
  treasurySilverLayer,
  treasuryGoldLayer,
  treasuryMetricsCatalog,
} from "./treasury-alm-comprehensive";
import {
  fraudBronzeLayer,
  fraudSilverLayer,
  fraudGoldLayer,
  fraudMetricsCatalog,
} from "./fraud-comprehensive";
import {
  complianceBronzeLayer,
  complianceSilverLayer,
  complianceGoldLayer,
  complianceMetricsCatalog,
} from "./compliance-aml-comprehensive";
import {
  mortgageBronzeLayer,
  mortgageSilverLayer,
  mortgageGoldLayer,
  mortgageMetricsCatalog,
} from "./mortgage-comprehensive";
import {
  collectionsBronzeLayer,
  collectionsSilverLayer,
  collectionsGoldLayer,
  collectionsMetricsCatalog,
} from "./collections-comprehensive";
import {
  operationsBronzeLayer,
  operationsSilverLayer,
  operationsGoldLayer,
  operationsMetricsCatalog,
} from "./operations-comprehensive";
import {
  channelsBronzeLayer,
  channelsSilverLayer,
  channelsGoldLayer,
  channelsMetricsCatalog,
} from "./channels-comprehensive";
import {
  wealthBronzeLayer,
  wealthSilverLayer,
  wealthGoldLayer,
  wealthMetricsCatalog,
} from "./wealth-comprehensive";
import {
  fxBronzeLayer,
  fxSilverLayer,
  fxGoldLayer,
  fxMetricsCatalog,
} from "./fx-comprehensive";
import {
  tradeFinanceBronzeLayer,
  tradeFinanceSilverLayer,
  tradeFinanceGoldLayer,
  tradeFinanceMetricsCatalog,
} from "./tradefinance-comprehensive";
import {
  cashManagementBronzeLayer,
  cashManagementSilverLayer,
  cashManagementGoldLayer,
  cashManagementMetricsCatalog,
} from "./cashmanagement-comprehensive";
import {
  merchantServicesBronzeLayer,
  merchantServicesSilverLayer,
  merchantServicesGoldLayer,
  merchantServicesMetricsCatalog,
} from "./merchantservices-comprehensive";
import {
  leasingBronzeLayer,
  leasingSilverLayer,
  leasingGoldLayer,
  leasingMetricsCatalog,
} from "./leasing-comprehensive";
import {
  ablBronzeLayer,
  ablSilverLayer,
  ablGoldLayer,
  ablMetricsCatalog,
} from "./abl-comprehensive";
import {
  marketingOrchestrationComplete,
} from "./retail/marketing-orchestration-complete";
import {
  crmAnalyticsComplete,
} from "./retail/crm-analytics-complete";
import {
  customerCommercialBronzeLayer,
  customerCommercialSilverLayer,
  customerCommercialGoldLayer,
  customerCommercialMetricsCatalog,
} from "./commercial/customer-commercial-comprehensive";
import {
  loansCommercialBronzeLayer,
  loansCommercialSilverLayer,
  loansCommercialGoldLayer,
  loansCommercialMetricsCatalog,
} from "./commercial/loans-commercial-comprehensive";
import {
  depositsCommercialBronzeLayer,
  depositsCommercialSilverLayer,
  depositsCommercialGoldLayer,
  depositsCommercialMetricsCatalog,
} from "./commercial/deposits-commercial-comprehensive";
import {
  paymentsCommercialBronzeLayer,
  paymentsCommercialSilverLayer,
  paymentsCommercialGoldLayer,
  paymentsCommercialMetricsCatalog,
} from "./commercial/payments-commercial-comprehensive";
import {
  treasuryCommercialBronzeLayer,
  treasuryCommercialSilverLayer,
  treasuryCommercialGoldLayer,
} from "./commercial/treasury-commercial-comprehensive";
import {
  tradeFinanceCommercialBronzeLayer,
  tradeFinanceCommercialSilverLayer,
  tradeFinanceCommercialGoldLayer,
} from "./commercial/trade-finance-commercial-comprehensive";
import {
  merchantServicesCommercialBronzeLayer,
  merchantServicesCommercialSilverLayer,
  merchantServicesCommercialGoldLayer,
} from "./commercial/merchant-services-commercial-comprehensive";
import {
  ablCommercialBronzeLayer,
  ablCommercialSilverLayer,
  ablCommercialGoldLayer,
} from "./commercial/abl-commercial-comprehensive";
import {
  leasingCommercialBronzeLayer,
  leasingCommercialSilverLayer,
  leasingCommercialGoldLayer,
} from "./commercial/leasing-commercial-comprehensive";
import {
  riskCommercialBronzeLayer,
  riskCommercialSilverLayer,
  riskCommercialGoldLayer,
} from "./commercial/risk-commercial-comprehensive";
import {
  complianceCommercialBronzeLayer,
  complianceCommercialSilverLayer,
  complianceCommercialGoldLayer,
} from "./commercial/compliance-commercial-comprehensive";
import {
  depositsBronzeLayer,
  depositsSilverLayer,
  depositsGoldLayer,
  depositsMetricsCatalog,
} from "./deposits-comprehensive";
import {
  revenueBronzeLayer,
  revenueSilverLayer,
  revenueGoldLayer,
  revenueMetricsCatalog,
} from "./revenue-profitability-comprehensive";
import {
  marketingRetailBronzeLayer,
  marketingRetailSilverLayer,
  marketingRetailGoldLayer,
  marketingRetailMetricsCatalog,
} from "./retail/marketing-retail-comprehensive";

export type DomainData = {
  id: string;
  bronze?: {
    tables: any[];
    totalTables: number;
  };
  silver?: {
    tables: any[];
    totalTables: number;
  };
  gold?: {
    dimensions?: any[];
    facts?: any[];
    totalDimensions?: number;
    totalFacts?: number;
  };
  metrics?: {
    categories: any[];
    totalMetrics?: number;
  };
};

// Comprehensive domain registry
export const domainRegistry: Record<string, DomainData> = {
  "customer-core": {
    id: "customer-core",
    bronze: { ...customerCoreBronzeLayer, totalTables: 27 } as any,
    silver: { ...customerCoreSilverLayer, totalTables: 6 } as any,
    gold: { ...customerCoreGoldLayer, totalDimensions: 6, totalFacts: 6 } as any,
    metrics: {
      categories: customerCoreMetricsCatalog.categories,
      totalMetrics: customerCoreMetricsCatalog.totalMetrics,
    },
  },
  loans: {
    id: "loans",
    bronze: loansBronzeLayer,
    silver: loansSilverLayer,
    gold: loansGoldLayer,
    metrics: {
      categories: loansMetricsCatalog.categories,
      totalMetrics: loansMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  deposits: {
    id: "deposits",
    bronze: depositsBronzeLayer as any,
    silver: depositsSilverLayer as any,
    gold: depositsGoldLayer as any,
    metrics: {
      categories: depositsMetricsCatalog.categories,
      totalMetrics: depositsMetricsCatalog.categories.reduce(
        (sum: number, cat: any) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  "credit-cards": {
    id: "credit-cards",
    bronze: creditCardsBronzeLayer,
    silver: creditCardsSilverLayer,
    gold: creditCardsGoldLayer,
    metrics: {
      categories: creditCardsMetricsCatalog.categories,
      totalMetrics: creditCardsMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  payments: {
    id: "payments",
    bronze: paymentsBronzeLayer as any,
    silver: paymentsSilverLayer as any,
    gold: paymentsGoldLayer as any,
    metrics: {
      categories: paymentsMetricsCatalog.categories,
      totalMetrics: paymentsMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  treasury: {
    id: "treasury",
    bronze: treasuryBronzeLayer as any,
    silver: treasurySilverLayer as any,
    gold: treasuryGoldLayer as any,
    metrics: {
      categories: treasuryMetricsCatalog.categories,
      totalMetrics: treasuryMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  fraud: {
    id: "fraud",
    bronze: fraudBronzeLayer as any,
    silver: fraudSilverLayer as any,
    gold: fraudGoldLayer as any,
    metrics: {
      categories: fraudMetricsCatalog.categories,
      totalMetrics: fraudMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  compliance: {
    id: "compliance",
    bronze: complianceBronzeLayer as any,
    silver: complianceSilverLayer as any,
    gold: complianceGoldLayer as any,
    metrics: {
      categories: complianceMetricsCatalog.categories,
      totalMetrics: complianceMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  mortgages: {
    id: "mortgages",
    bronze: mortgageBronzeLayer as any,
    silver: mortgageSilverLayer as any,
    gold: mortgageGoldLayer as any,
    metrics: {
      categories: mortgageMetricsCatalog.categories,
      totalMetrics: mortgageMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  collections: {
    id: "collections",
    bronze: collectionsBronzeLayer as any,
    silver: collectionsSilverLayer as any,
    gold: collectionsGoldLayer as any,
    metrics: {
      categories: collectionsMetricsCatalog.categories,
      totalMetrics: collectionsMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  operations: {
    id: "operations",
    bronze: operationsBronzeLayer as any,
    silver: operationsSilverLayer as any,
    gold: operationsGoldLayer as any,
    metrics: {
      categories: operationsMetricsCatalog.categories,
      totalMetrics: operationsMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  channels: {
    id: "channels",
    bronze: channelsBronzeLayer as any,
    silver: channelsSilverLayer as any,
    gold: channelsGoldLayer as any,
    metrics: {
      categories: channelsMetricsCatalog.categories,
      totalMetrics: channelsMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  wealth: {
    id: "wealth",
    bronze: wealthBronzeLayer as any,
    silver: wealthSilverLayer as any,
    gold: wealthGoldLayer as any,
    metrics: {
      categories: wealthMetricsCatalog.categories,
      totalMetrics: wealthMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  fx: {
    id: "fx",
    bronze: fxBronzeLayer as any,
    silver: fxSilverLayer as any,
    gold: fxGoldLayer as any,
    metrics: {
      categories: fxMetricsCatalog.categories,
      totalMetrics: fxMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  risk: {
    id: "risk",
    bronze: riskBronzeLayer as any,
    silver: riskSilverLayer as any,
    gold: riskGoldLayer as any,
    metrics: {
      categories: riskMetricsCatalog.categories,
      totalMetrics: riskMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  revenue: {
    id: "revenue",
    bronze: revenueBronzeLayer as any,
    silver: revenueSilverLayer as any,
    gold: revenueGoldLayer as any,
    metrics: {
      categories: revenueMetricsCatalog.categories,
      totalMetrics: revenueMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  "trade-finance": {
    id: "trade-finance",
    bronze: tradeFinanceBronzeLayer as any,
    silver: tradeFinanceSilverLayer as any,
    gold: tradeFinanceGoldLayer as any,
    metrics: {
      categories: tradeFinanceMetricsCatalog.categories,
      totalMetrics: tradeFinanceMetricsCatalog.totalMetrics,
    },
  },
  "cash-management": {
    id: "cash-management",
    bronze: cashManagementBronzeLayer as any,
    silver: cashManagementSilverLayer as any,
    gold: cashManagementGoldLayer as any,
    metrics: {
      categories: cashManagementMetricsCatalog.categories,
      totalMetrics: cashManagementMetricsCatalog.totalMetrics,
    },
  },
  "merchant-services": {
    id: "merchant-services",
    bronze: merchantServicesBronzeLayer as any,
    silver: merchantServicesSilverLayer as any,
    gold: merchantServicesGoldLayer as any,
    metrics: {
      categories: merchantServicesMetricsCatalog.categories,
      totalMetrics: merchantServicesMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  leasing: {
    id: "leasing",
    bronze: leasingBronzeLayer as any,
    silver: leasingSilverLayer as any,
    gold: leasingGoldLayer as any,
    metrics: {
      categories: leasingMetricsCatalog.categories,
      totalMetrics: leasingMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  "asset-based-lending": {
    id: "asset-based-lending",
    bronze: ablBronzeLayer as any,
    silver: ablSilverLayer as any,
    gold: ablGoldLayer as any,
    metrics: {
      categories: ablMetricsCatalog.categories,
      totalMetrics: ablMetricsCatalog.categories.reduce(
        (sum, cat) => sum + cat.metrics.length,
        0,
      ),
    },
  },
  "customer-commercial": {
    id: "customer-commercial",
    bronze: customerCommercialBronzeLayer as any,
    silver: customerCommercialSilverLayer as any,
    gold: customerCommercialGoldLayer as any,
    metrics: {
      categories: customerCommercialMetricsCatalog.categories,
      totalMetrics: customerCommercialMetricsCatalog.totalMetrics,
    },
  },
  "loans-commercial": {
    id: "loans-commercial",
    bronze: loansCommercialBronzeLayer as any,
    silver: loansCommercialSilverLayer as any,
    gold: loansCommercialGoldLayer as any,
    metrics: {
      categories: loansCommercialMetricsCatalog.categories,
      totalMetrics: loansCommercialMetricsCatalog.totalMetrics,
    },
  },
  "deposits-commercial": {
    id: "deposits-commercial",
    bronze: depositsCommercialBronzeLayer as any,
    silver: depositsCommercialSilverLayer as any,
    gold: depositsCommercialGoldLayer as any,
    metrics: {
      categories: depositsCommercialMetricsCatalog.categories,
      totalMetrics: depositsCommercialMetricsCatalog.totalMetrics,
    },
  },
  "payments-commercial": {
    id: "payments-commercial",
    bronze: paymentsCommercialBronzeLayer as any,
    silver: paymentsCommercialSilverLayer as any,
    gold: paymentsCommercialGoldLayer as any,
    metrics: {
      categories: paymentsCommercialMetricsCatalog.categories,
      totalMetrics: paymentsCommercialMetricsCatalog.totalMetrics,
    },
  },
  "treasury-commercial": {
    id: "treasury-commercial",
    bronze: treasuryCommercialBronzeLayer as any,
    silver: treasuryCommercialSilverLayer as any,
    gold: treasuryCommercialGoldLayer as any,
    metrics: {
      categories: [],
      totalMetrics: 0,
    },
  },
  "trade-finance-commercial": {
    id: "trade-finance-commercial",
    bronze: tradeFinanceCommercialBronzeLayer as any,
    silver: tradeFinanceCommercialSilverLayer as any,
    gold: tradeFinanceCommercialGoldLayer as any,
    metrics: {
      categories: [],
      totalMetrics: 0,
    },
  },
  "merchant-services-commercial": {
    id: "merchant-services-commercial",
    bronze: merchantServicesCommercialBronzeLayer as any,
    silver: merchantServicesCommercialSilverLayer as any,
    gold: merchantServicesCommercialGoldLayer as any,
    metrics: {
      categories: [],
      totalMetrics: 0,
    },
  },
  "abl-commercial": {
    id: "abl-commercial",
    bronze: ablCommercialBronzeLayer as any,
    silver: ablCommercialSilverLayer as any,
    gold: ablCommercialGoldLayer as any,
    metrics: {
      categories: [],
      totalMetrics: 0,
    },
  },
  "leasing-commercial": {
    id: "leasing-commercial",
    bronze: leasingCommercialBronzeLayer as any,
    silver: leasingCommercialSilverLayer as any,
    gold: leasingCommercialGoldLayer as any,
    metrics: {
      categories: [],
      totalMetrics: 0,
    },
  },
  "risk-commercial": {
    id: "risk-commercial",
    bronze: riskCommercialBronzeLayer as any,
    silver: riskCommercialSilverLayer as any,
    gold: riskCommercialGoldLayer as any,
    metrics: {
      categories: [],
      totalMetrics: 0,
    },
  },
  "compliance-commercial": {
    id: "compliance-commercial",
    bronze: complianceCommercialBronzeLayer as any,
    silver: complianceCommercialSilverLayer as any,
    gold: complianceCommercialGoldLayer as any,
    metrics: {
      categories: [],
      totalMetrics: 0,
    },
  },
  "marketing-retail": {
    id: "marketing-retail",
    bronze: marketingRetailBronzeLayer as any,
    silver: marketingRetailSilverLayer as any,
    gold: marketingRetailGoldLayer as any,
    metrics: {
      categories: marketingRetailMetricsCatalog.categories,
      totalMetrics: marketingRetailMetricsCatalog.totalMetrics,
    },
  },
  "marketing-orchestration": {
    id: "marketing-orchestration",
    bronze: {
      totalTables: marketingOrchestrationComplete.bronze.totalTables,
      tables: marketingOrchestrationComplete.bronze.tables,
    } as any,
    silver: {
      totalTables: marketingOrchestrationComplete.silver.totalTables,
      tables: marketingOrchestrationComplete.silver.tables,
    } as any,
    gold: {
      totalDimensions: marketingOrchestrationComplete.gold.dimensions.count,
      totalFacts: marketingOrchestrationComplete.gold.facts.count,
      dimensions: marketingOrchestrationComplete.gold.dimensions.list,
      facts: marketingOrchestrationComplete.gold.facts.list,
    } as any,
    metrics: {
      categories: marketingOrchestrationComplete.metrics.categories,
      totalMetrics: marketingOrchestrationComplete.metrics.totalMetrics,
    },
  },
  "crm-analytics": {
    id: "crm-analytics",
    bronze: {
      totalTables: crmAnalyticsComplete.bronze.totalTables,
      tables: crmAnalyticsComplete.bronze.tables,
    } as any,
    silver: {
      totalTables: crmAnalyticsComplete.silver.totalTables,
      tables: crmAnalyticsComplete.silver.tables,
    } as any,
    gold: {
      totalDimensions: crmAnalyticsComplete.gold.dimensions.count,
      totalFacts: crmAnalyticsComplete.gold.facts.count,
      dimensions: crmAnalyticsComplete.gold.dimensions.list,
      facts: crmAnalyticsComplete.gold.facts.list,
    } as any,
    metrics: {
      categories: crmAnalyticsComplete.metrics.categories,
      totalMetrics: crmAnalyticsComplete.metrics.totalMetrics,
    },
  },
};

// Helper functions
export function getDomainData(domainId: string): DomainData | undefined {
  return domainRegistry[domainId];
}

export function getDomainTableCounts(domainId: string): {
  bronze: number;
  silver: number;
  gold: number;
} {
  const data = getDomainData(domainId);
  if (!data) return { bronze: 0, silver: 0, gold: 0 };

  return {
    bronze: data.bronze?.totalTables || data.bronze?.tables?.length || 0,
    silver: data.silver?.totalTables || data.silver?.tables?.length || 0,
    gold:
      (data.gold?.totalDimensions || data.gold?.dimensions?.length || 0) +
      (data.gold?.totalFacts || data.gold?.facts?.length || 0),
  };
}

export function getDomainMetricsCount(domainId: string): number {
  const data = getDomainData(domainId);
  if (!data?.metrics) return 0;

  return (
    data.metrics.totalMetrics ||
    data.metrics.categories?.reduce(
      (sum, cat) => sum + cat.metrics.length,
      0,
    ) ||
    0
  );
}

export function getAllDomainIds(): string[] {
  return Object.keys(domainRegistry);
}

export function getDomainCoverage(): {
  total: number;
  withData: number;
  percent: number;
} {
  const total = Object.keys(domainRegistry).length;
  const withData = Object.values(domainRegistry).filter(
    (d) => d.bronze || d.silver || d.gold || d.metrics,
  ).length;

  return {
    total,
    withData,
    percent: Math.round((withData / total) * 100),
  };
}
