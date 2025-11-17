// ============================================================================
// DOMAIN EVALUATION & AUDIT UTILITY
// ============================================================================
// Comprehensive evaluation of all banking domains for data model completeness

import { bankingDomains } from "./enterprise-domains";
import {
  generateStarSchemaRelationships,
  generateLayerRelationships,
  type TableRelationship,
} from "./erd-relationships";
import {
  processTableColumns,
  inferColumnsForTable,
  type ColumnInfo,
} from "./pk-fk-detector";

/**
 * Convert kebab-case domain ID to camelCase prefix for exports
 * e.g., "customer-core" -> "customerCore", "credit-cards" -> "creditCards"
 *
 * Special cases for abbreviated names:
 * - "asset-based-lending" -> "abl"
 */
function domainIdToCamelCase(domainId: string): string {
  // Handle special cases with abbreviated export names
  const specialCases: Record<string, string> = {
    "asset-based-lending": "abl",
  };

  if (specialCases[domainId]) {
    return specialCases[domainId];
  }

  return domainId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export type DataModelLayer = {
  name: string;
  tableCount: number;
  hasSchema: boolean;
  hasPrimaryKeys: boolean;
  hasRelationships: boolean;
  completeness: number; // 0-100
  tables?: Array<{
    name: string;
    description?: string;
    scd2?: boolean;
    key_fields?: string[];
    schema?: any;
    type?: "dimension" | "fact" | "bronze" | "silver";
  }>;
  relationships?: TableRelationship[];
};

export type DomainEvaluation = {
  domainId: string;
  domainName: string;
  priority: string;

  // Data Model Completeness
  hasBronzeLayer: boolean;
  hasSilverLayer: boolean;
  hasGoldLayer: boolean;

  bronzeLayer?: DataModelLayer;
  silverLayer?: DataModelLayer;
  goldLayer?: DataModelLayer;

  // Metrics & Documentation
  metricsCount: number;
  hasDetailedMetrics: boolean; // metrics with IDs, formulas, units
  hasMetricsFormulas: boolean;

  // Logical Model
  hasLogicalModel: boolean;
  logicalEntitiesCount: number;
  logicalRelationshipsCount: number;

  // Physical Model
  hasPhysicalModel: boolean;
  physicalTablesCount: number;
  physicalColumnsCount: number;

  // Export Readiness
  readyForPdfExport: boolean;
  readyForXlsxExport: boolean;
  readyForCsvExport: boolean;
  readyForDrawIo: boolean;
  readyForDbDiagram: boolean;

  // Overall Score
  completenessScore: number; // 0-100
  qualityGrade: "A" | "B" | "C" | "D" | "F";

  // Issues
  issues: string[];
  recommendations: string[];
};

export type EvaluationSummary = {
  totalDomains: number;
  evaluatedDomains: number;
  averageCompleteness: number;

  p0DomainsComplete: number;
  p1DomainsComplete: number;
  p2DomainsComplete: number;

  domainsWithBronze: number;
  domainsWithSilver: number;
  domainsWithGold: number;
  domainsWithMetrics: number;

  exportReadyDomains: number;
  erdReadyDomains: number;

  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };

  criticalIssues: string[];
  overallRecommendations: string[];
};

/**
 * Load and evaluate a domain's comprehensive data model
 */
async function loadDomainDataModel(domainId: string): Promise<any> {
  try {
    // Dynamically import the comprehensive file for the domain
    const comprehensiveFiles: Record<string, () => Promise<any>> = {
      "customer-core": () => import("./customer-core-comprehensive"),
      deposits: () => import("./deposits-comprehensive"),
      loans: () => import("./loans-comprehensive"),
      "credit-cards": () => import("./creditcards-comprehensive"),
      payments: () => import("./payments-comprehensive"),
      treasury: () => import("./treasury-alm-comprehensive"),
      risk: () => import("./risk-comprehensive"),
      compliance: () => import("./compliance-aml-comprehensive"),
      fraud: () => import("./fraud-comprehensive"),
      revenue: () => import("./revenue-profitability-comprehensive"),
      mortgages: () => import("./mortgage-comprehensive"),
      collections: () => import("./collections-comprehensive"),
      operations: () => import("./operations-comprehensive"),
      channels: () => import("./channels-comprehensive"),
      wealth: () => import("./wealth-comprehensive"),
      fx: () => import("./fx-comprehensive"),
      "trade-finance": () => import("./tradefinance-comprehensive"),
      "cash-management": () => import("./cashmanagement-comprehensive"),
      "merchant-services": () => import("./merchantservices-comprehensive"),
      leasing: () => import("./leasing-comprehensive"),
      "asset-based-lending": () => import("./abl-comprehensive"),

      // Commercial Banking Area-Specific Domains (4 domains)
      "customer-commercial": () => import("./commercial/customer-commercial-complete"),
      "loans-commercial": () => import("./commercial/loans-commercial-complete"),
      "deposits-commercial": () => import("./commercial/deposits-commercial-complete"),
      "payments-commercial": () => import("./commercial/payments-commercial-complete"),

      // Retail Banking Domains (15 domains)
      "customer-retail": () => import("./retail/customer-retail-comprehensive"),
      "deposits-retail": () => import("./retail/deposits-retail-comprehensive"),
      "loans-retail": () => import("./retail/loans-retail-comprehensive"),
      "cards-retail": () => import("./retail/cards-retail-comprehensive"),
      "payments-retail": () => import("./retail/payments-retail-comprehensive"),
      "branch-retail": () => import("./retail/branch-retail-comprehensive"),
      "digital-retail": () => import("./retail/digital-retail-complete"),
      "investment-retail": () => import("./retail/investment-retail-complete"),
      "insurance-retail": () => import("./retail/insurance-retail-complete"),
      "collections-retail": () => import("./retail/collections-retail-complete"),
      "customer-service-retail": () => import("./retail/customer-service-retail-complete"),
      "marketing-retail": () => import("./retail/marketing-retail-complete"),
      "fraud-retail": () => import("./retail/fraud-retail-complete"),
      "compliance-retail": () => import("./retail/compliance-retail-complete"),
      "open-banking-retail": () => import("./retail/open-banking-retail-complete"),
    };

    const loader = comprehensiveFiles[domainId];

    if (!loader) {
      console.warn(`No comprehensive file mapping for domain: ${domainId}`);
      return null;
    }
    if (loader) {
      return await loader();
    }
    return null;
  } catch (error) {
    console.warn(`Could not load comprehensive model for ${domainId}:`, error);
    return null;
  }
}

/**
 * Evaluate a single domain for completeness
 */
export async function evaluateDomain(
  domainId: string,
): Promise<DomainEvaluation> {
  const domain = bankingDomains.find((d) => d.id === domainId);
  if (!domain) {
    throw new Error(`Domain not found: ${domainId}`);
  }

  const dataModel = await loadDomainDataModel(domainId);

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Convert domain ID to camelCase for export name lookup
  const camelCasePrefix = domainIdToCamelCase(domainId);

  // Evaluate Bronze Layer
  const bronzeLayerKey = `${camelCasePrefix}BronzeLayer`;
  const bronzeLayerObj = dataModel?.[bronzeLayerKey] || dataModel?.bronzeLayer;
  const hasBronzeLayer = !!bronzeLayerObj;

  let bronzeLayer: DataModelLayer | undefined;
  if (hasBronzeLayer && bronzeLayerObj) {
    // Handle both flat tables array and nested table groups
    let tables = bronzeLayerObj.tables || [];

    // If no tables array but has nested table groups, flatten them
    if (tables.length === 0) {
      const nestedTableKeys = Object.keys(bronzeLayerObj).filter(
        (key) =>
          key.toLowerCase().includes("tables") &&
          Array.isArray(bronzeLayerObj[key]),
      );

      for (const key of nestedTableKeys) {
        tables = tables.concat(bronzeLayerObj[key]);
      }
    }

    const tableCount = bronzeLayerObj.totalTables || tables.length || 0;
    const hasSchema =
      tables.some((t: any) => t.schema || t.key_fields) || false;

    // Enrich tables with column info (PK/FK detection)
    tables = tables.map((t: any) => {
      // Process columns with PK/FK detection
      const columns = processTableColumns(t);

      // Ensure key_fields exists for relationship detection
      if (!t.key_fields && t.schema) {
        const schemaFields = Object.keys(t.schema);
        const keyFields = schemaFields.filter(
          (field: string) =>
            t.schema[field].includes("PRIMARY KEY") ||
            field.includes("_id") ||
            field.includes("_key"),
        );
        t.key_fields =
          keyFields.length > 0 ? keyFields : schemaFields.slice(0, 4);
      }

      return { ...t, columns };
    });

    const relationships = generateLayerRelationships(tables);
    console.log(
      `[${domainId}] Bronze layer relationships generated:`,
      relationships.length,
    );
    if (relationships.length > 0) {
      console.log(
        `[${domainId}] Sample bronze relationships:`,
        relationships.slice(0, 3),
      );
    }

    bronzeLayer = {
      name: "Bronze Layer",
      tableCount,
      hasSchema,
      hasPrimaryKeys: hasSchema,
      hasRelationships: relationships.length > 0,
      completeness: tableCount > 0 ? (hasSchema ? 100 : 50) : 0,
      tables: tables.slice(0, 50), // Limit to first 50 tables for performance
      relationships: relationships.slice(0, 100), // Limit relationships
    };
  } else {
    issues.push("Missing Bronze Layer definition");
    recommendations.push("Define Bronze Layer raw tables with schemas");
  }

  // Evaluate Silver Layer
  const silverLayerKey = `${camelCasePrefix}SilverLayer`;
  const silverLayerObj = dataModel?.[silverLayerKey] || dataModel?.silverLayer;
  const hasSilverLayer = !!silverLayerObj;

  let silverLayer: DataModelLayer | undefined;
  if (hasSilverLayer && silverLayerObj) {
    // Handle both flat tables array and nested table groups
    let tables = silverLayerObj.tables || [];

    // If no tables array but has nested table groups, flatten them
    if (tables.length === 0) {
      const nestedTableKeys = Object.keys(silverLayerObj).filter(
        (key) =>
          key.toLowerCase().includes("tables") &&
          Array.isArray(silverLayerObj[key]),
      );

      for (const key of nestedTableKeys) {
        tables = tables.concat(silverLayerObj[key]);
      }
    }

    const tableCount = silverLayerObj.totalTables || tables.length || 0;
    const hasSchema =
      tables.some((t: any) => t.schema || t.description) || false;

    // Enrich tables with column info (PK/FK detection)
    tables = tables.map((t: any) => {
      // Process columns with PK/FK detection
      let columns = processTableColumns(t);

      // If no schema/key_fields, infer columns based on table name
      if (columns.length === 0) {
        columns = inferColumnsForTable(t.name, "silver");
      }

      // Ensure key_fields exists for relationship detection
      if (!t.key_fields && t.schema) {
        const schemaFields = Object.keys(t.schema);
        const keyFields = schemaFields.filter(
          (field: string) =>
            t.schema[field].includes("PRIMARY KEY") || field.includes("_key"),
        );
        t.key_fields =
          keyFields.length > 0 ? keyFields : schemaFields.slice(0, 4);
      } else if (!t.key_fields && columns.length > 0) {
        // Extract key fields from inferred columns
        t.key_fields = columns
          .filter((c) => c.isPK || c.isFK)
          .map((c) => c.name);
      }

      return { ...t, columns };
    });

    const relationships = generateLayerRelationships(tables);
    console.log(
      `[${domainId}] Silver layer relationships generated:`,
      relationships.length,
    );
    if (relationships.length > 0) {
      console.log(
        `[${domainId}] Sample silver relationships:`,
        relationships.slice(0, 3),
      );
    }

    silverLayer = {
      name: "Silver Layer",
      tableCount,
      hasSchema,
      hasPrimaryKeys: hasSchema,
      hasRelationships: relationships.length > 0,
      completeness: tableCount > 0 ? (hasSchema ? 100 : 50) : 0,
      tables: tables.slice(0, 50), // Limit to first 50 tables for performance
      relationships: relationships.slice(0, 100), // Limit relationships
    };
  } else {
    issues.push("Missing Silver Layer definition");
    recommendations.push("Define Silver Layer curated/cleansed tables");
  }

  // Evaluate Gold Layer
  const goldLayerKey = `${camelCasePrefix}GoldLayer`;
  const goldLayerObj = dataModel?.[goldLayerKey] || dataModel?.goldLayer;
  const hasGoldLayer = !!goldLayerObj;

  let goldLayer: DataModelLayer | undefined;
  if (hasGoldLayer && goldLayerObj) {
    const dimCount =
      goldLayerObj.totalDimensions || goldLayerObj.dimensions?.length || 0;
    const factCount =
      goldLayerObj.totalFacts || goldLayerObj.facts?.length || 0;
    const tableCount = dimCount + factCount;
    const hasSchema =
      goldLayerObj.dimensions?.some((d: any) => d.grain || d.type) || false;

    // Combine dimensions and facts into tables array with column enrichment
    const dimensions = (goldLayerObj.dimensions || []).map((d: any) => {
      let columns = processTableColumns(d);

      // If no schema, infer columns
      if (columns.length === 0) {
        columns = inferColumnsForTable(d.name, "gold");
      }

      return {
        name: d.name,
        description: d.grain || d.description,
        type: "dimension" as const,
        grain: d.grain,
        columns,
      };
    });

    const facts = (goldLayerObj.facts || []).map((f: any) => {
      let columns = processTableColumns(f);

      // If no schema, infer columns including measures
      if (columns.length === 0) {
        columns = inferColumnsForTable(f.name, "gold");

        // Add measure columns
        if (f.measures && Array.isArray(f.measures)) {
          f.measures.forEach((measure: string) => {
            if (!columns.some((c) => c.name === measure)) {
              columns.push({
                name: measure,
                type: "DECIMAL",
                isPK: false,
                isFK: false,
              });
            }
          });
        }
      }

      return {
        name: f.name,
        description: f.grain || f.description,
        type: "fact" as const,
        grain: f.grain,
        measures: f.measures,
        columns,
      };
    });

    // Generate star schema relationships (facts -> dimensions)
    const relationships = generateStarSchemaRelationships(
      goldLayerObj.dimensions || [],
      goldLayerObj.facts || [],
    );
    console.log(
      `[${domainId}] Gold layer relationships generated:`,
      relationships.length,
    );
    console.log(
      `[${domainId}] Dimensions:`,
      goldLayerObj.dimensions?.length || 0,
    );
    console.log(`[${domainId}] Facts:`, goldLayerObj.facts?.length || 0);
    if (relationships.length > 0) {
      console.log(
        `[${domainId}] Sample gold relationships:`,
        relationships.slice(0, 5),
      );
    }

    goldLayer = {
      name: "Gold Layer",
      tableCount,
      hasSchema,
      hasPrimaryKeys: hasSchema,
      hasRelationships: relationships.length > 0,
      completeness: tableCount > 0 ? 100 : 0,
      tables: [...dimensions, ...facts].slice(0, 50), // Limit to first 50 for performance
      relationships: relationships.slice(0, 100), // Limit relationships
    };
  } else {
    issues.push("Missing Gold Layer definition");
    recommendations.push(
      "Define Gold Layer dimensional model (facts & dimensions)",
    );
  }

  // Evaluate Metrics
  const metricsCount = domain.keyMetricsCount || 0;
  const metricsCatalogKey = `${camelCasePrefix}MetricsCatalog`;
  const metricsKey = `${camelCasePrefix}Metrics`;
  // Try both MetricsCatalog and Metrics export names
  const metricsObj =
    dataModel?.[metricsCatalogKey] ||
    dataModel?.[metricsKey] ||
    dataModel?.metricsCatalog;

  // Check if metrics have detailed definitions (ID, formula, unit)
  const hasDetailedMetrics =
    metricsObj?.categories?.some((c: any) =>
      c.metrics?.some(
        (m: any) =>
          typeof m === "object" &&
          (m.id || m.metric_id) &&
          (m.formula || m.calculation),
      ),
    ) || false;
  const hasMetricsFormulas = hasDetailedMetrics;

  if (metricsCount === 0) {
    issues.push("No metrics defined");
    recommendations.push("Define key business metrics for this domain");
  } else if (metricsCount < 50) {
    recommendations.push(
      `Expand metrics catalog (current: ${metricsCount}, target: 200+)`,
    );
  }

  if (!hasDetailedMetrics && metricsCount > 0) {
    issues.push("Metrics lack detailed definitions (IDs, formulas, units)");
    recommendations.push(
      "Convert metrics from simple strings to detailed objects with IDs, formulas, and units",
    );
  }

  // Logical Model (Key Entities from domain definition)
  const logicalEntitiesCount = domain.keyEntities?.length || 0;
  const hasLogicalModel = logicalEntitiesCount > 0;
  const logicalRelationshipsCount = Math.floor(logicalEntitiesCount * 0.5); // Estimate

  // Physical Model (actual tables)
  const physicalTablesCount =
    domain.tablesCount.bronze +
    domain.tablesCount.silver +
    domain.tablesCount.gold;
  const hasPhysicalModel = physicalTablesCount > 0;
  const physicalColumnsCount = physicalTablesCount * 15; // Estimate avg 15 columns per table

  // Export Readiness
  const readyForPdfExport =
    hasBronzeLayer && hasSilverLayer && hasGoldLayer && metricsCount > 0;
  const readyForXlsxExport = hasBronzeLayer || hasSilverLayer || hasGoldLayer;
  const readyForCsvExport = hasBronzeLayer || hasSilverLayer || hasGoldLayer;
  const readyForDrawIo = hasGoldLayer && logicalEntitiesCount > 0;
  const readyForDbDiagram = hasBronzeLayer && (bronzeLayer?.hasSchema || false);

  if (!readyForDrawIo) {
    recommendations.push(
      "Define entity relationships for ERD diagram generation",
    );
  }
  if (!readyForDbDiagram) {
    recommendations.push(
      "Add detailed table schemas for database diagram generation",
    );
  }

  // Calculate Completeness Score (0-100)
  let completenessScore = 0;

  // Bronze layer: 20 points
  if (hasBronzeLayer) completenessScore += 10;
  if (bronzeLayer?.hasSchema) completenessScore += 10;

  // Silver layer: 15 points
  if (hasSilverLayer) completenessScore += 8;
  if (silverLayer?.hasSchema) completenessScore += 7;

  // Gold layer: 20 points
  if (hasGoldLayer) completenessScore += 10;
  if (goldLayer?.hasRelationships) completenessScore += 10;

  // Metrics: 25 points
  if (metricsCount > 0) completenessScore += 5;
  if (metricsCount >= 50) completenessScore += 5;
  if (metricsCount >= 100) completenessScore += 5;
  if (metricsCount >= 200) completenessScore += 5;
  if (hasDetailedMetrics) completenessScore += 5;

  // Logical model: 10 points
  if (hasLogicalModel) completenessScore += 5;
  if (logicalEntitiesCount >= 10) completenessScore += 5;

  // Export readiness: 10 points
  if (readyForPdfExport) completenessScore += 3;
  if (readyForXlsxExport) completenessScore += 2;
  if (readyForDrawIo) completenessScore += 3;
  if (readyForDbDiagram) completenessScore += 2;

  // Determine Quality Grade
  let qualityGrade: "A" | "B" | "C" | "D" | "F";
  if (completenessScore >= 90) qualityGrade = "A";
  else if (completenessScore >= 80) qualityGrade = "B";
  else if (completenessScore >= 70) qualityGrade = "C";
  else if (completenessScore >= 60) qualityGrade = "D";
  else qualityGrade = "F";

  return {
    domainId,
    domainName: domain.name,
    priority: domain.priority,

    hasBronzeLayer,
    hasSilverLayer,
    hasGoldLayer,

    bronzeLayer,
    silverLayer,
    goldLayer,

    metricsCount,
    hasDetailedMetrics,
    hasMetricsFormulas,

    hasLogicalModel,
    logicalEntitiesCount,
    logicalRelationshipsCount,

    hasPhysicalModel,
    physicalTablesCount,
    physicalColumnsCount,

    readyForPdfExport,
    readyForXlsxExport,
    readyForCsvExport,
    readyForDrawIo,
    readyForDbDiagram,

    completenessScore,
    qualityGrade,

    issues,
    recommendations,
  };
}

/**
 * Evaluate all domains and generate summary
 */
export async function evaluateAllDomains(): Promise<{
  evaluations: DomainEvaluation[];
  summary: EvaluationSummary;
}> {
  const evaluations: DomainEvaluation[] = [];

  // Evaluate each domain
  for (const domain of bankingDomains) {
    try {
      const evaluation = await evaluateDomain(domain.id);
      evaluations.push(evaluation);
    } catch (error) {
      console.error(`Failed to evaluate domain ${domain.id}:`, error);
    }
  }

  // Calculate summary statistics
  const totalDomains = bankingDomains.length;
  const evaluatedDomains = evaluations.length;
  const averageCompleteness =
    evaluations.reduce((sum, e) => sum + e.completenessScore, 0) /
    evaluatedDomains;

  const p0DomainsComplete = evaluations.filter(
    (e) => e.priority === "P0" && e.completenessScore >= 90,
  ).length;
  const p1DomainsComplete = evaluations.filter(
    (e) => e.priority === "P1" && e.completenessScore >= 90,
  ).length;
  const p2DomainsComplete = evaluations.filter(
    (e) => e.priority === "P2" && e.completenessScore >= 90,
  ).length;

  const domainsWithBronze = evaluations.filter((e) => e.hasBronzeLayer).length;
  const domainsWithSilver = evaluations.filter((e) => e.hasSilverLayer).length;
  const domainsWithGold = evaluations.filter((e) => e.hasGoldLayer).length;
  const domainsWithMetrics = evaluations.filter(
    (e) => e.metricsCount > 0,
  ).length;

  const exportReadyDomains = evaluations.filter(
    (e) => e.readyForPdfExport,
  ).length;
  const erdReadyDomains = evaluations.filter(
    (e) => e.readyForDrawIo && e.readyForDbDiagram,
  ).length;

  const gradeDistribution = {
    A: evaluations.filter((e) => e.qualityGrade === "A").length,
    B: evaluations.filter((e) => e.qualityGrade === "B").length,
    C: evaluations.filter((e) => e.qualityGrade === "C").length,
    D: evaluations.filter((e) => e.qualityGrade === "D").length,
    F: evaluations.filter((e) => e.qualityGrade === "F").length,
  };

  // Collect critical issues
  const criticalIssues: string[] = [];
  evaluations.forEach((e) => {
    if (e.priority === "P0" && e.completenessScore < 80) {
      criticalIssues.push(
        `${e.domainName} (P0): Completeness ${e.completenessScore}% - ${e.issues.join(", ")}`,
      );
    }
  });

  // Overall recommendations
  const overallRecommendations: string[] = [];
  if (gradeDistribution.F > 0) {
    overallRecommendations.push(
      `${gradeDistribution.F} domain(s) need immediate attention (Grade F)`,
    );
  }
  if (domainsWithBronze < totalDomains) {
    overallRecommendations.push(
      `${totalDomains - domainsWithBronze} domain(s) missing Bronze Layer`,
    );
  }
  if (domainsWithGold < totalDomains) {
    overallRecommendations.push(
      `${totalDomains - domainsWithGold} domain(s) missing Gold Layer (dimensional model)`,
    );
  }
  if (erdReadyDomains < totalDomains * 0.8) {
    overallRecommendations.push(
      "Enhance entity relationships for better ERD diagram generation",
    );
  }

  const summary: EvaluationSummary = {
    totalDomains,
    evaluatedDomains,
    averageCompleteness,

    p0DomainsComplete,
    p1DomainsComplete,
    p2DomainsComplete,

    domainsWithBronze,
    domainsWithSilver,
    domainsWithGold,
    domainsWithMetrics,

    exportReadyDomains,
    erdReadyDomains,

    gradeDistribution,

    criticalIssues,
    overallRecommendations,
  };

  return {
    evaluations,
    summary,
  };
}
