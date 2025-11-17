// ============================================================================
// DATA MODEL EXPORT UTILITIES
// ============================================================================
// Export data models in PDF, XLSX, CSV, Draw.io (XML), and DBDiagram.io (DBML)

import { bankingDomains, type BankingDomain } from "./enterprise-domains";

export type ExportFormat = "pdf" | "xlsx" | "csv" | "drawio" | "dbdiagram";

export type TableDefinition = {
  name: string;
  layer: "bronze" | "silver" | "gold";
  type?: "dimension" | "fact" | "table";
  description?: string;
  schema?: Record<string, string>;
  key_fields?: string[];
  measures?: string[];
  grain?: string;
  scd2?: boolean;
};

export type EntityRelationship = {
  fromTable: string;
  toTable: string;
  fromField: string;
  toField: string;
  relationshipType: "one-to-one" | "one-to-many" | "many-to-many";
};

/**
 * Load domain data model from comprehensive file
 */
async function loadDomainDataModel(domainId: string): Promise<any> {
  const comprehensiveFiles: Record<string, () => Promise<any>> = {
    "customer-core": () => import("./customer-core-comprehensive"),
    deposits: () => import("./deposits-comprehensive"),
    loans: () => import("./loans-comprehensive"),
    "credit-cards": () => import("./creditcards-comprehensive"),
    payments: () => import("./payments-comprehensive"),
    fraud: () => import("./fraud-comprehensive"),
    "compliance-aml": () => import("./compliance-aml-comprehensive"),
    risk: () => import("./risk-comprehensive"),
    wealth: () => import("./wealth-comprehensive"),
    fx: () => import("./fx-comprehensive"),
    operations: () => import("./operations-comprehensive"),
    channels: () => import("./channels-comprehensive"),
    "merchant-services": () => import("./merchantservices-comprehensive"),
    leasing: () => import("./leasing-comprehensive"),
    "asset-based-lending": () => import("./abl-comprehensive"),
    "treasury-alm": () => import("./treasury-alm-comprehensive"),
    "revenue-profitability": () =>
      import("./revenue-profitability-comprehensive"),
    collections: () => import("./collections-comprehensive"),
    mortgage: () => import("./mortgage-comprehensive"),
    "trade-finance": () => import("./tradefinance-comprehensive"),
    "cash-management": () => import("./cashmanagement-comprehensive"),
  };

  try {
    const loader = comprehensiveFiles[domainId];
    if (loader) {
      return await loader();
    }
  } catch (error) {
    console.warn(`Could not load comprehensive model for ${domainId}:`, error);
  }
  return null;
}

/**
 * Extract tables from data model
 */
function extractTables(dataModel: any, domainId: string): TableDefinition[] {
  const tables: TableDefinition[] = [];

  // Extract Bronze tables
  const bronzeLayer =
    dataModel?.bronzeLayer ||
    dataModel?.[`${domainId.replace(/-/g, "")}BronzeLayer`] ||
    {};
  if (bronzeLayer.tables) {
    bronzeLayer.tables.forEach((table: any) => {
      tables.push({
        name: table.name,
        layer: "bronze",
        type: "table",
        description: table.description,
        schema: table.schema,
        key_fields: table.key_fields,
      });
    });
  }

  // Extract Silver tables
  const silverLayer =
    dataModel?.silverLayer ||
    dataModel?.[`${domainId.replace(/-/g, "")}SilverLayer`] ||
    {};
  if (silverLayer.tables) {
    silverLayer.tables.forEach((table: any) => {
      tables.push({
        name: table.name,
        layer: "silver",
        type: "table",
        description: table.description,
        schema: table.schema,
        scd2: table.scd2,
      });
    });
  }

  // Extract Gold dimensions and facts
  const goldLayer =
    dataModel?.goldLayer ||
    dataModel?.[`${domainId.replace(/-/g, "")}GoldLayer`] ||
    {};
  if (goldLayer.dimensions) {
    goldLayer.dimensions.forEach((dim: any) => {
      tables.push({
        name: dim.name,
        layer: "gold",
        type: "dimension",
        description: dim.description,
        grain: dim.grain,
        schema: dim.schema,
      });
    });
  }
  if (goldLayer.facts) {
    goldLayer.facts.forEach((fact: any) => {
      tables.push({
        name: fact.name,
        layer: "gold",
        type: "fact",
        description: fact.description,
        grain: fact.grain,
        measures: fact.measures,
        schema: fact.schema,
      });
    });
  }

  return tables;
}

/**
 * Infer relationships between tables based on naming conventions
 */
function inferRelationships(tables: TableDefinition[]): EntityRelationship[] {
  const relationships: EntityRelationship[] = [];

  // Infer relationships from foreign key patterns
  tables.forEach((fromTable) => {
    if (fromTable.key_fields) {
      fromTable.key_fields.forEach((field) => {
        // Look for _id suffix pattern (e.g., customer_id, account_id)
        if (field.endsWith("_id")) {
          const entityName = field.replace("_id", "");

          // Find potential parent tables
          tables.forEach((toTable) => {
            if (
              toTable.name.toLowerCase().includes(entityName) &&
              toTable !== fromTable
            ) {
              relationships.push({
                fromTable: fromTable.name,
                toTable: toTable.name,
                fromField: field,
                toField: field,
                relationshipType: "many-to-one",
              } as any);
            }
          });
        }
      });
    }

    // For Gold layer, infer fact-dimension relationships
    if (fromTable.type === "fact" && fromTable.schema) {
      Object.keys(fromTable.schema).forEach((field) => {
        if (field.endsWith("_key") || field.endsWith("_id")) {
          const dimName = field.replace("_key", "").replace("_id", "");

          // Find matching dimension
          tables.forEach((toTable) => {
            if (
              toTable.type === "dimension" &&
              toTable.name.toLowerCase().includes(dimName)
            ) {
              relationships.push({
                fromTable: fromTable.name,
                toTable: toTable.name,
                fromField: field,
                toField: field,
                relationshipType: "many-to-one",
              } as any);
            }
          });
        }
      });
    }
  });

  return relationships;
}

/**
 * Export to CSV format
 */
export async function exportToCSV(domainId: string): Promise<string> {
  const domain = bankingDomains.find((d) => d.id === domainId);
  if (!domain) throw new Error(`Domain not found: ${domainId}`);

  const dataModel = await loadDomainDataModel(domainId);
  const tables = extractTables(dataModel, domainId);

  let csv = "Layer,Table Name,Type,Description,Key Fields,Grain,SCD Type\n";

  tables.forEach((table) => {
    const keyFields = table.key_fields?.join("; ") || "";
    const grain = table.grain || "";
    const scdType = table.scd2 ? "SCD Type 2" : "SCD Type 1";

    csv += `"${table.layer}","${table.name}","${table.type || "table"}","${table.description || ""}","${keyFields}","${grain}","${scdType}"\n`;
  });

  return csv;
}

/**
 * Export to XLSX format (as CSV with tab delimiter for Excel compatibility)
 */
export async function exportToXLSX(domainId: string): Promise<string> {
  const domain = bankingDomains.find((d) => d.id === domainId);
  if (!domain) throw new Error(`Domain not found: ${domainId}`);

  const dataModel = await loadDomainDataModel(domainId);
  const tables = extractTables(dataModel, domainId);

  // Generate tab-delimited format for Excel
  let xlsx =
    "Layer\tTable Name\tType\tDescription\tKey Fields\tGrain\tSCD Type\tColumns\n";

  tables.forEach((table) => {
    const keyFields = table.key_fields?.join(", ") || "";
    const grain = table.grain || "";
    const scdType = table.scd2 ? "SCD Type 2" : "SCD Type 1";
    const columns = table.schema ? Object.keys(table.schema).join(", ") : "";

    xlsx += `${table.layer}\t${table.name}\t${table.type || "table"}\t${table.description || ""}\t${keyFields}\t${grain}\t${scdType}\t${columns}\n`;
  });

  // Add metrics sheet
  const metricsObj =
    dataModel?.metricsCatalog ||
    dataModel?.[`${domainId.replace(/-/g, "")}MetricsCatalog`];
  if (metricsObj?.categories) {
    xlsx += "\n\n### METRICS ###\n";
    xlsx +=
      "Category\tMetric ID\tMetric Name\tDescription\tFormula\tUnit\tAggregation\n";

    metricsObj.categories.forEach((category: any) => {
      category.metrics?.forEach((metric: any) => {
        if (typeof metric === "object" && metric.id) {
          xlsx += `${category.name}\t${metric.id}\t${metric.name}\t${metric.description || ""}\t${metric.formula || ""}\t${metric.unit || ""}\t${metric.aggregation || ""}\n`;
        }
      });
    });
  }

  return xlsx;
}

/**
 * Export to Draw.io XML format
 */
export async function exportToDrawIO(domainId: string): Promise<string> {
  const domain = bankingDomains.find((d) => d.id === domainId);
  if (!domain) throw new Error(`Domain not found: ${domainId}`);

  const dataModel = await loadDomainDataModel(domainId);
  const tables = extractTables(dataModel, domainId);
  const relationships = inferRelationships(tables);

  // Generate Draw.io XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="DataModelExporter" version="1.0">
  <diagram id="${domainId}" name="${domain.name} Data Model">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
`;

  // Add tables as rectangles
  let yOffset = 50;
  let xOffset = 50;
  const tablePositions: Record<string, { x: number; y: number; id: string }> =
    {};

  tables.forEach((table, index) => {
    const tableId = `table_${index}`;
    const color =
      table.layer === "bronze"
        ? "#FFE6CC"
        : table.layer === "silver"
          ? "#D5E8D4"
          : "#DAE8FC";
    const label = table.name.split(".")[1] || table.name;
    const fields = table.schema
      ? Object.keys(table.schema).slice(0, 5).join("\\n")
      : table.key_fields?.join("\\n") || "";

    tablePositions[table.name] = { x: xOffset, y: yOffset, id: tableId };

    xml += `        <mxCell id="${tableId}" value="${label}\\n${fields}" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;fillColor=${color};strokeColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="${xOffset}" y="${yOffset}" width="200" height="150" as="geometry" />
        </mxCell>
`;

    xOffset += 250;
    if (xOffset > 1000) {
      xOffset = 50;
      yOffset += 200;
    }
  });

  // Add relationships as arrows
  relationships.forEach((rel, index) => {
    const fromPos = tablePositions[rel.fromTable];
    const toPos = tablePositions[rel.toTable];

    if (fromPos && toPos) {
      const edgeId = `edge_${index}`;
      xml += `        <mxCell id="${edgeId}" value="${rel.fromField}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;endArrow=classic;endFill=1;" edge="1" parent="1" source="${fromPos.id}" target="${toPos.id}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
`;
    }
  });

  xml += `      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  return xml;
}

/**
 * Export to DBDiagram.io DBML format
 */
export async function exportToDBDiagram(domainId: string): Promise<string> {
  const domain = bankingDomains.find((d) => d.id === domainId);
  if (!domain) throw new Error(`Domain not found: ${domainId}`);

  const dataModel = await loadDomainDataModel(domainId);
  const tables = extractTables(dataModel, domainId);
  const relationships = inferRelationships(tables);

  let dbml = `// ${domain.name} Data Model\n`;
  dbml += `// Generated: ${new Date().toISOString()}\n`;
  dbml += `// Domain ID: ${domainId}\n\n`;

  dbml += `Project ${domainId.replace(/-/g, "_")} {\n`;
  dbml += `  database_type: 'Snowflake'\n`;
  dbml += `  Note: '${domain.description}'\n`;
  dbml += `}\n\n`;

  // Group tables by layer
  const bronzeTables = tables.filter((t) => t.layer === "bronze");
  const silverTables = tables.filter((t) => t.layer === "silver");
  const goldTables = tables.filter((t) => t.layer === "gold");

  // Generate Bronze Layer
  if (bronzeTables.length > 0) {
    dbml += `// ==============================\n`;
    dbml += `// BRONZE LAYER - Raw Data\n`;
    dbml += `// ==============================\n\n`;

    bronzeTables.forEach((table) => {
      const tableName = table.name.replace(/\./g, "_");
      dbml += `Table ${tableName} {\n`;

      if (table.schema) {
        Object.entries(table.schema).forEach(([field, type]) => {
          const isPK = table.key_fields?.includes(field);
          const pkMarker = isPK ? " [primary key]" : "";
          dbml += `  ${field} ${type}${pkMarker}\n`;
        });
      } else if (table.key_fields) {
        table.key_fields.forEach((field) => {
          dbml += `  ${field} varchar [primary key]\n`;
        });
      }

      if (table.description) {
        dbml += `\n  Note: '${table.description}'\n`;
      }

      dbml += `}\n\n`;
    });
  }

  // Generate Silver Layer
  if (silverTables.length > 0) {
    dbml += `// ==============================\n`;
    dbml += `// SILVER LAYER - Curated Data\n`;
    dbml += `// ==============================\n\n`;

    silverTables.forEach((table) => {
      const tableName = table.name.replace(/\./g, "_");
      dbml += `Table ${tableName} {\n`;

      if (table.schema) {
        Object.entries(table.schema).forEach(([field, type]) => {
          dbml += `  ${field} ${type}\n`;
        });
      }

      if (table.scd2) {
        dbml += `  valid_from timestamp\n`;
        dbml += `  valid_to timestamp\n`;
        dbml += `  is_current boolean\n`;
      }

      if (table.description) {
        dbml += `\n  Note: '${table.description}'\n`;
      }

      dbml += `}\n\n`;
    });
  }

  // Generate Gold Layer
  if (goldTables.length > 0) {
    dbml += `// ==============================\n`;
    dbml += `// GOLD LAYER - Dimensional Model\n`;
    dbml += `// ==============================\n\n`;

    goldTables.forEach((table) => {
      const tableName = table.name.replace(/\./g, "_");
      dbml += `Table ${tableName} [headercolor: ${table.type === "fact" ? "#DAE8FC" : "#FFE6CC"}] {\n`;

      if (table.type === "dimension") {
        dbml += `  ${table.name.split("_").pop()}_key bigint [primary key]\n`;
      } else if (table.type === "fact") {
        dbml += `  fact_key bigint [primary key]\n`;
        dbml += `  date_key int\n`;
      }

      if (table.schema) {
        Object.entries(table.schema).forEach(([field, type]) => {
          dbml += `  ${field} ${type}\n`;
        });
      }

      if (table.measures) {
        table.measures.forEach((measure) => {
          dbml += `  ${measure} decimal(18,2)\n`;
        });
      }

      if (table.description) {
        dbml += `\n  Note: '${table.description}'\n`;
      }
      if (table.grain) {
        dbml += `  Note: 'Grain: ${table.grain}'\n`;
      }

      dbml += `}\n\n`;
    });
  }

  // Generate Relationships
  if (relationships.length > 0) {
    dbml += `// Relationships\n`;
    relationships.forEach((rel) => {
      const fromTable = rel.fromTable.replace(/\./g, "_");
      const toTable = rel.toTable.replace(/\./g, "_");
      const relType =
        rel.relationshipType === "one-to-many"
          ? ">"
          : rel.relationshipType === "many-to-many"
            ? "<>"
            : "-";
      dbml += `Ref: ${fromTable}.${rel.fromField} ${relType} ${toTable}.${rel.toField}\n`;
    });
  }

  return dbml;
}

/**
 * Export to PDF (HTML content that can be printed to PDF)
 */
export async function exportToPDF(domainId: string): Promise<string> {
  const domain = bankingDomains.find((d) => d.id === domainId);
  if (!domain) throw new Error(`Domain not found: ${domainId}`);

  const dataModel = await loadDomainDataModel(domainId);
  const tables = extractTables(dataModel, domainId);
  const relationships = inferRelationships(tables);

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${domain.name} - Data Model Documentation</title>
  <style>
    @media print {
      @page { margin: 2cm; }
      body { font-family: Arial, sans-serif; }
      .page-break { page-break-before: always; }
    }
    body { 
      font-family: Arial, sans-serif; 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
    h2 { color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 5px; margin-top: 30px; }
    h3 { color: #60a5fa; }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 20px 0;
      font-size: 14px;
    }
    th, td { 
      border: 1px solid #ddd; 
      padding: 12px; 
      text-align: left; 
    }
    th { 
      background-color: #1e40af; 
      color: white; 
      font-weight: bold;
    }
    tr:nth-child(even) { background-color: #f9fafb; }
    .bronze { background-color: #fef3c7; }
    .silver { background-color: #d1fae5; }
    .gold { background-color: #dbeafe; }
    .badge { 
      display: inline-block; 
      padding: 4px 8px; 
      border-radius: 4px; 
      font-size: 12px; 
      font-weight: bold;
    }
    .metadata { color: #6b7280; font-size: 14px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>${domain.name} - Data Model Documentation</h1>
  
  <div class="metadata">
    <p><strong>Domain ID:</strong> ${domainId}</p>
    <p><strong>Priority:</strong> ${domain.priority}</p>
    <p><strong>Complexity:</strong> ${domain.complexity}</p>
    <p><strong>Business Value:</strong> ${domain.businessValue}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  </div>
  
  <h2>Overview</h2>
  <p>${domain.description}</p>
  
  <h3>Key Statistics</h3>
  <ul>
    <li><strong>Bronze Tables:</strong> ${domain.tablesCount.bronze}</li>
    <li><strong>Silver Tables:</strong> ${domain.tablesCount.silver}</li>
    <li><strong>Gold Tables:</strong> ${domain.tablesCount.gold}</li>
    <li><strong>Total Metrics:</strong> ${domain.keyMetricsCount}</li>
  </ul>
  
  <div class="page-break"></div>
  
  <h2>Data Model - All Layers</h2>
  <table>
    <thead>
      <tr>
        <th>Layer</th>
        <th>Table Name</th>
        <th>Type</th>
        <th>Description</th>
        <th>Grain</th>
      </tr>
    </thead>
    <tbody>
`;

  tables.forEach((table) => {
    const layerClass = table.layer;
    html += `      <tr class="${layerClass}">
        <td><span class="badge">${table.layer.toUpperCase()}</span></td>
        <td><strong>${table.name}</strong></td>
        <td>${table.type || "table"}</td>
        <td>${table.description || ""}</td>
        <td>${table.grain || "N/A"}</td>
      </tr>
`;
  });

  html += `    </tbody>
  </table>
  
  <div class="page-break"></div>
  
  <h2>Bronze Layer - Raw Tables</h2>
`;

  tables
    .filter((t) => t.layer === "bronze")
    .forEach((table) => {
      html += `  <h3>${table.name}</h3>
  <p>${table.description || ""}</p>
`;

      if (table.schema) {
        html += `  <table>
    <thead>
      <tr>
        <th>Column</th>
        <th>Data Type</th>
      </tr>
    </thead>
    <tbody>
`;
        Object.entries(table.schema).forEach(([field, type]) => {
          html += `      <tr><td>${field}</td><td>${type}</td></tr>\n`;
        });
        html += `    </tbody>
  </table>
`;
      } else if (table.key_fields) {
        html += `  <p><strong>Key Fields:</strong> ${table.key_fields.join(", ")}</p>`;
      }
    });

  html += `  
  <div class="page-break"></div>
  
  <h2>Gold Layer - Dimensional Model</h2>
`;

  const dimensions = tables.filter((t) => t.type === "dimension");
  const facts = tables.filter((t) => t.type === "fact");

  if (dimensions.length > 0) {
    html += `  <h3>Dimensions</h3>
  <table>
    <thead>
      <tr>
        <th>Dimension</th>
        <th>Description</th>
        <th>Grain</th>
      </tr>
    </thead>
    <tbody>
`;
    dimensions.forEach((dim) => {
      html += `      <tr>
        <td><strong>${dim.name}</strong></td>
        <td>${dim.description || ""}</td>
        <td>${dim.grain || ""}</td>
      </tr>
`;
    });
    html += `    </tbody>
  </table>
`;
  }

  if (facts.length > 0) {
    html += `  <h3>Facts</h3>
  <table>
    <thead>
      <tr>
        <th>Fact</th>
        <th>Description</th>
        <th>Grain</th>
        <th>Measures</th>
      </tr>
    </thead>
    <tbody>
`;
    facts.forEach((fact) => {
      html += `      <tr>
        <td><strong>${fact.name}</strong></td>
        <td>${fact.description || ""}</td>
        <td>${fact.grain || ""}</td>
        <td>${fact.measures?.join(", ") || ""}</td>
      </tr>
`;
    });
    html += `    </tbody>
  </table>
`;
  }

  html += `
  <div class="page-break"></div>
  
  <h2>Entity Relationships</h2>
  <p><strong>Total Relationships:</strong> ${relationships.length}</p>
  <table>
    <thead>
      <tr>
        <th>From Table</th>
        <th>From Field</th>
        <th>To Table</th>
        <th>To Field</th>
        <th>Relationship Type</th>
      </tr>
    </thead>
    <tbody>
`;

  relationships.forEach((rel) => {
    html += `      <tr>
        <td>${rel.fromTable}</td>
        <td>${rel.fromField}</td>
        <td>${rel.toTable}</td>
        <td>${rel.toField}</td>
        <td>${rel.relationshipType}</td>
      </tr>
`;
  });

  html += `    </tbody>
  </table>
  
  <hr style="margin-top: 40px;">
  <p style="text-align: center; color: #6b7280; font-size: 12px;">
    Generated by Enterprise Banking Data Platform | ${new Date().toLocaleString()}
  </p>
</body>
</html>`;

  return html;
}

/**
 * Generic export function that routes to specific format exporters
 */
export async function exportDataModel(
  domainId: string,
  format: ExportFormat,
): Promise<string> {
  switch (format) {
    case "csv":
      return await exportToCSV(domainId);
    case "xlsx":
      return await exportToXLSX(domainId);
    case "drawio":
      return await exportToDrawIO(domainId);
    case "dbdiagram":
      return await exportToDBDiagram(domainId);
    case "pdf":
      return await exportToPDF(domainId);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Download helper - trigger browser download
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export and download data model in specified format
 */
export async function exportAndDownload(
  domainId: string,
  format: ExportFormat,
) {
  const domain = bankingDomains.find((d) => d.id === domainId);
  if (!domain) throw new Error(`Domain not found: ${domainId}`);

  const content = await exportDataModel(domainId, format);
  const safeName = domain.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

  const fileExtensions: Record<ExportFormat, string> = {
    csv: "csv",
    xlsx: "xlsx",
    drawio: "drawio",
    dbdiagram: "dbml",
    pdf: "html", // PDF is HTML that can be printed
  };

  const mimeTypes: Record<ExportFormat, string> = {
    csv: "text/csv",
    xlsx: "application/vnd.ms-excel",
    drawio: "application/xml",
    dbdiagram: "text/plain",
    pdf: "text/html",
  };

  const filename = `${safeName}_data_model.${fileExtensions[format]}`;
  const mimeType = mimeTypes[format];

  downloadFile(content, filename, mimeType);
}
