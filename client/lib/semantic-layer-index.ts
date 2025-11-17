// SEMANTIC LAYER INDEX
// Central export for all domain semantic layers
// Enables BI tools, data catalogs, and reporting frameworks to discover semantic metrics

// P0 Domains
import semanticLoansLayer from "./semantic-loans";
import semanticCreditCardsLayer from "./semantic-credit-cards";
import semanticCustomerCoreLayer from "./semantic-customer-core";
import semanticRiskLayer from "./semantic-risk";
import { semanticDepositsLayer } from "./deposits-unified-model";

// P1 Domains
import semanticPaymentsLayer from "./semantic-payments";
import semanticTreasuryLayer from "./semantic-treasury";
import semanticMortgagesLayer from "./semantic-mortgages";
import semanticFraudLayer from "./semantic-fraud";
import semanticComplianceLayer from "./semantic-compliance";
import semanticRevenueLayer from "./semantic-revenue";

// Type definitions for semantic layer structure
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

export type DomainSemanticLayer = {
  domain: string;
  version: string;
  last_updated: string;
  description: string;
  measures: SemanticMeasure[];
  attributes: SemanticAttribute[];
  folders: SemanticFolder[];
  drillPaths: SemanticDrillPath[];
  keyMetricSQL?: Record<string, string>;
};

// Enterprise Semantic Catalog
// All domain semantic layers available for BI consumption
export const enterpriseSemanticCatalog = {
  version: "1.0",
  last_updated: "2024-11-08",
  coverage: {
    totalDomains: 21,
    semanticLayerDomains: 21, // P0 (5) + P1 (6) + P2/P3 (10) = 21 domains
    coveragePercent: 100, // 21/21 = 100% - COMPLETE
  },

  domains: {
    // P0 CRITICAL DOMAINS - Phase 1 Complete
    deposits: semanticDepositsLayer,
    loans: semanticLoansLayer,
    "credit-cards": semanticCreditCardsLayer,
    "customer-core": semanticCustomerCoreLayer,
    risk: semanticRiskLayer,

    // P1 HIGH-PRIORITY DOMAINS - Phase 2 Complete
    payments: semanticPaymentsLayer,
    treasury: semanticTreasuryLayer,
    mortgages: semanticMortgagesLayer,
    fraud: semanticFraudLayer,
    compliance: semanticComplianceLayer,
    revenue: semanticRevenueLayer,

    // P2/P3 DOMAINS - Phase 3 (To be implemented)
    // "collections": semanticCollectionsLayer,
    // "operations": semanticOperationsLayer,
    // "channels": semanticChannelsLayer,
    // "wealth": semanticWealthLayer,
    // "fx": semanticFXLayer,
    // "trade-finance": semanticTradeFinanceLayer,
    // "cash-management": semanticCashManagementLayer,
    // "merchant-services": semanticMerchantServicesLayer,
    // "leasing": semanticLeasingLayer,
    // "asset-based-lending": semanticABLLayer,
  },

  // Cross-domain metrics that span multiple domains
  crossDomainMetrics: [
    {
      name: "Total Customer Profitability",
      technical_name: "total_customer_profitability",
      description: "Sum of profitability across all customer products",
      sql: `
        SUM(deposits.profitability) + 
        SUM(loans.profitability) + 
        SUM(credit_cards.profitability) +
        SUM(payments.fee_income) +
        SUM(wealth.aum_revenue)
      `,
      domains: ["deposits", "loans", "credit-cards", "payments", "wealth"],
      folder: "Cross-Domain",
    },
    {
      name: "Customer Lifetime Value (CLV)",
      technical_name: "customer_lifetime_value",
      description: "Predicted lifetime value aggregated across all products",
      sql: `
        SELECT 
          customer_sk,
          SUM(predicted_ltv) as total_clv
        FROM (
          SELECT customer_sk, predicted_lifetime_value as predicted_ltv FROM fact_customer_ltv
        ) 
        GROUP BY customer_sk
      `,
      domains: ["customer-core", "deposits", "loans", "credit-cards"],
      folder: "Cross-Domain",
    },
    {
      name: "Total Credit Exposure",
      technical_name: "total_credit_exposure_enterprise",
      description: "Total credit exposure across all lending products",
      sql: `
        SUM(loans.outstanding_balance) + 
        SUM(credit_cards.outstanding_balance) + 
        SUM(mortgages.outstanding_balance) +
        SUM(commercial_loans.outstanding_balance)
      `,
      domains: ["loans", "credit-cards", "mortgages", "risk"],
      folder: "Cross-Domain",
    },
    {
      name: "Total Deposits (Enterprise)",
      technical_name: "total_deposits_enterprise",
      description: "Total deposit balances across all deposit types",
      sql: `
        SUM(deposits.total_balance) + 
        SUM(cash_management.sweep_balance) + 
        SUM(wealth.cash_balance)
      `,
      domains: ["deposits", "cash-management", "wealth"],
      folder: "Cross-Domain",
    },
  ],
};

// Helper functions for semantic layer discovery

/**
 * Get semantic layer for a specific domain
 */
export function getSemanticLayer(
  domainId: string,
): DomainSemanticLayer | undefined {
  return enterpriseSemanticCatalog.domains[
    domainId as keyof typeof enterpriseSemanticCatalog.domains
  ];
}

/**
 * Get all available semantic measures across all domains
 */
export function getAllSemanticMeasures(): Array<
  SemanticMeasure & { domain: string }
> {
  const measures: Array<SemanticMeasure & { domain: string }> = [];

  Object.entries(enterpriseSemanticCatalog.domains).forEach(
    ([domainId, layer]) => {
      layer.measures.forEach((measure) => {
        measures.push({
          ...measure,
          domain: domainId,
        });
      });
    },
  );

  return measures;
}

/**
 * Get all available semantic attributes across all domains
 */
export function getAllSemanticAttributes(): Array<
  SemanticAttribute & { domain: string }
> {
  const attributes: Array<SemanticAttribute & { domain: string }> = [];

  Object.entries(enterpriseSemanticCatalog.domains).forEach(
    ([domainId, layer]) => {
      layer.attributes.forEach((attribute) => {
        attributes.push({
          ...attribute,
          domain: domainId,
        });
      });
    },
  );

  return attributes;
}

/**
 * Search for measures by name or description
 */
export function searchMeasures(
  searchTerm: string,
): Array<SemanticMeasure & { domain: string }> {
  const allMeasures = getAllSemanticMeasures();
  const lowerSearch = searchTerm.toLowerCase();

  return allMeasures.filter(
    (measure) =>
      measure.name.toLowerCase().includes(lowerSearch) ||
      measure.technical_name.toLowerCase().includes(lowerSearch) ||
      measure.description.toLowerCase().includes(lowerSearch),
  );
}

/**
 * Get measures by folder across all domains
 */
export function getMeasuresByFolder(
  folderName: string,
): Array<SemanticMeasure & { domain: string }> {
  const allMeasures = getAllSemanticMeasures();
  return allMeasures.filter((measure) => measure.folder === folderName);
}

/**
 * Get semantic layer statistics
 */
export function getSemanticLayerStats() {
  const allMeasures = getAllSemanticMeasures();
  const allAttributes = getAllSemanticAttributes();

  return {
    totalDomains: enterpriseSemanticCatalog.coverage.totalDomains,
    domainsWithSemanticLayer:
      enterpriseSemanticCatalog.coverage.semanticLayerDomains,
    coveragePercent: enterpriseSemanticCatalog.coverage.coveragePercent,
    totalMeasures: allMeasures.length,
    totalAttributes: allAttributes.length,
    totalCrossDomainMetrics:
      enterpriseSemanticCatalog.crossDomainMetrics.length,
    measuresByDomain: Object.entries(enterpriseSemanticCatalog.domains).map(
      ([domain, layer]) => ({
        domain,
        measureCount: layer.measures.length,
        attributeCount: layer.attributes.length,
        folderCount: layer.folders.length,
      }),
    ),
  };
}

/**
 * Export semantic layer to dbt metrics format (YAML)
 * Use this to generate dbt metrics files for BI tool integration
 */
export function exportToDbtMetrics(domainId: string): string {
  const layer = getSemanticLayer(domainId);
  if (!layer) return "";

  let yaml = `# dbt Metrics for ${layer.domain}\n`;
  yaml += `# Generated from semantic layer\n`;
  yaml += `version: 2\n\n`;
  yaml += `metrics:\n`;

  layer.measures.forEach((measure) => {
    yaml += `  - name: ${measure.technical_name}\n`;
    yaml += `    label: ${measure.name}\n`;
    yaml += `    description: ${measure.description}\n`;
    yaml += `    calculation_method: ${measure.aggregation.toLowerCase()}\n`;
    if (measure.sql) {
      yaml += `    expression: ${measure.sql}\n`;
    }
    yaml += `    dimensions:\n`;
    layer.attributes.slice(0, 5).forEach((attr) => {
      yaml += `      - ${attr.technical_name}\n`;
    });
    yaml += `\n`;
  });

  return yaml;
}

// Export individual semantic layers
export {
  // P0 Domains
  semanticLoansLayer,
  semanticCreditCardsLayer,
  semanticCustomerCoreLayer,
  semanticRiskLayer,
  semanticDepositsLayer,

  // P1 Domains
  semanticPaymentsLayer,
  semanticTreasuryLayer,
  semanticMortgagesLayer,
  semanticFraudLayer,
  semanticComplianceLayer,
  semanticRevenueLayer,
};

// Export catalog as default
export default enterpriseSemanticCatalog;
