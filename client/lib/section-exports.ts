// ============================================================================
// SECTION-SPECIFIC EXPORT UTILITIES
// ============================================================================
// Export utilities for STTM, DDLs, DQ Scripts, SQL, and Metrics

/**
 * Export STTM (Source-to-Target Mapping) to CSV
 */
export function exportSTTMToCSV(mappings: any[]): string {
  let csv = "Source System,Source Table,Source Column,Target Table,Target Column,Transformation Logic,Data Type,Business Rule\n";
  
  mappings.forEach((mapping) => {
    const sourceSystem = mapping.sourceSystem || "";
    const sourceTable = mapping.sourceTable || "";
    const sourceColumn = mapping.sourceColumn || "";
    const targetTable = mapping.targetTable || mapping.silverTable || "";
    const targetColumn = mapping.targetColumn || mapping.silverColumn || "";
    const transformation = mapping.transformationLogic || mapping.businessLogic || "";
    const dataType = mapping.dataType || mapping.targetDataType || "";
    const businessRule = mapping.businessRule || "";
    
    csv += `"${sourceSystem}","${sourceTable}","${sourceColumn}","${targetTable}","${targetColumn}","${transformation}","${dataType}","${businessRule}"\n`;
  });
  
  return csv;
}

/**
 * Export STTM to XLSX (tab-delimited for Excel)
 */
export function exportSTTMToXLSX(mappings: any[]): string {
  let xlsx = "Source System\tSource Table\tSource Column\tTarget Table\tTarget Column\tTransformation Logic\tData Type\tBusiness Rule\n";
  
  mappings.forEach((mapping) => {
    const sourceSystem = mapping.sourceSystem || "";
    const sourceTable = mapping.sourceTable || "";
    const sourceColumn = mapping.sourceColumn || "";
    const targetTable = mapping.targetTable || mapping.silverTable || "";
    const targetColumn = mapping.targetColumn || mapping.silverColumn || "";
    const transformation = (mapping.transformationLogic || mapping.businessLogic || "").replace(/\t/g, " ");
    const dataType = mapping.dataType || mapping.targetDataType || "";
    const businessRule = (mapping.businessRule || "").replace(/\t/g, " ");
    
    xlsx += `${sourceSystem}\t${sourceTable}\t${sourceColumn}\t${targetTable}\t${targetColumn}\t${transformation}\t${dataType}\t${businessRule}\n`;
  });
  
  return xlsx;
}

/**
 * Export DDL Scripts to CSV
 */
export function exportDDLToCSV(tables: any[]): string {
  let csv = "Table Name,Schema,Layer,Column Name,Data Type,Primary Key,Foreign Key,Nullable,Description\n";
  
  tables.forEach((table) => {
    const tableName = table.name || "";
    const schema = table.schema || "";
    const layer = table.layer || "";
    const columns = table.columns || [];
    
    columns.forEach((col: any) => {
      const columnName = col.name || "";
      const dataType = col.dataType || col.type || "";
      const isPK = col.isPrimaryKey ? "YES" : "NO";
      const isFK = col.isForeignKey ? "YES" : "NO";
      const nullable = col.nullable ? "YES" : "NO";
      const description = col.businessMeaning || col.description || "";
      
      csv += `"${tableName}","${schema}","${layer}","${columnName}","${dataType}","${isPK}","${isFK}","${nullable}","${description}"\n`;
    });
  });
  
  return csv;
}

/**
 * Export DDL Scripts to XLSX
 */
export function exportDDLToXLSX(tables: any[]): string {
  let xlsx = "Table Name\tSchema\tLayer\tColumn Name\tData Type\tPrimary Key\tForeign Key\tNullable\tDescription\n";
  
  tables.forEach((table) => {
    const tableName = table.name || "";
    const schema = table.schema || "";
    const layer = table.layer || "";
    const columns = table.columns || [];
    
    columns.forEach((col: any) => {
      const columnName = col.name || "";
      const dataType = col.dataType || col.type || "";
      const isPK = col.isPrimaryKey ? "YES" : "NO";
      const isFK = col.isForeignKey ? "YES" : "NO";
      const nullable = col.nullable ? "YES" : "NO";
      const description = (col.businessMeaning || col.description || "").replace(/\t/g, " ");
      
      xlsx += `${tableName}\t${schema}\t${layer}\t${columnName}\t${dataType}\t${isPK}\t${isFK}\t${nullable}\t${description}\n`;
    });
  });
  
  return xlsx;
}

/**
 * Export DQ Scripts to CSV
 */
export function exportDQScriptsToCSV(scripts: any[]): string {
  let csv = "Check ID,Check Name,Table Name,Check Type,Severity,SQL Script,Description,Expected Result\n";
  
  scripts.forEach((script) => {
    const checkId = script.checkId || script.id || "";
    const checkName = script.checkName || script.name || "";
    const tableName = script.tableName || script.table || "";
    const checkType = script.checkType || script.type || "";
    const severity = script.severity || "MEDIUM";
    const sqlScript = script.sqlScript || script.sql || script.script || "";
    const description = script.description || "";
    const expectedResult = script.expectedResult || "";
    
    csv += `"${checkId}","${checkName}","${tableName}","${checkType}","${severity}","${sqlScript}","${description}","${expectedResult}"\n`;
  });
  
  return csv;
}

/**
 * Export DQ Scripts to XLSX
 */
export function exportDQScriptsToXLSX(scripts: any[]): string {
  let xlsx = "Check ID\tCheck Name\tTable Name\tCheck Type\tSeverity\tSQL Script\tDescription\tExpected Result\n";
  
  scripts.forEach((script) => {
    const checkId = script.checkId || script.id || "";
    const checkName = script.checkName || script.name || "";
    const tableName = script.tableName || script.table || "";
    const checkType = script.checkType || script.type || "";
    const severity = script.severity || "MEDIUM";
    const sqlScript = (script.sqlScript || script.sql || script.script || "").replace(/\t/g, "  ");
    const description = (script.description || "").replace(/\t/g, " ");
    const expectedResult = (script.expectedResult || "").replace(/\t/g, " ");
    
    xlsx += `${checkId}\t${checkName}\t${tableName}\t${checkType}\t${severity}\t${sqlScript}\t${description}\t${expectedResult}\n`;
  });
  
  return xlsx;
}

/**
 * Export SQL Scripts to CSV
 */
export function exportSQLToCSV(scripts: any[]): string {
  let csv = "Script ID,Script Name,Type,Layer,SQL Code,Description,Dependencies\n";
  
  scripts.forEach((script) => {
    const scriptId = script.id || "";
    const scriptName = script.name || "";
    const type = script.type || "";
    const layer = script.layer || "";
    const sqlCode = script.sql || script.code || script.script || "";
    const description = script.description || "";
    const dependencies = script.dependencies ? script.dependencies.join("; ") : "";
    
    csv += `"${scriptId}","${scriptName}","${type}","${layer}","${sqlCode}","${description}","${dependencies}"\n`;
  });
  
  return csv;
}

/**
 * Export SQL Scripts to XLSX
 */
export function exportSQLToXLSX(scripts: any[]): string {
  let xlsx = "Script ID\tScript Name\tType\tLayer\tSQL Code\tDescription\tDependencies\n";
  
  scripts.forEach((script) => {
    const scriptId = script.id || "";
    const scriptName = script.name || "";
    const type = script.type || "";
    const layer = script.layer || "";
    const sqlCode = (script.sql || script.code || script.script || "").replace(/\t/g, "  ");
    const description = (script.description || "").replace(/\t/g, " ");
    const dependencies = script.dependencies ? script.dependencies.join("; ") : "";
    
    xlsx += `${scriptId}\t${scriptName}\t${type}\t${layer}\t${sqlCode}\t${description}\t${dependencies}\n`;
  });
  
  return xlsx;
}

/**
 * Export Metrics to CSV
 */
export function exportMetricsToCSV(metrics: any[]): string {
  let csv = "Metric ID,Metric Name,Description,Category,Type,Formula,Unit,Granularity,Data Type,Source Tables,Business Logic\n";
  
  metrics.forEach((metric) => {
    const metricId = metric.metricId || metric.id || "";
    const name = metric.name || "";
    const description = metric.description || "";
    const category = metric.category || "";
    const type = metric.type || "";
    const formula = metric.formula || metric.businessLogic || "";
    const unit = metric.unit || "";
    const granularity = metric.granularity || "";
    const dataType = metric.dataType || "";
    const sourceTables = metric.sourceTables ? metric.sourceTables.join("; ") : "";
    const businessLogic = metric.businessLogic || metric.calculation || "";
    
    csv += `"${metricId}","${name}","${description}","${category}","${type}","${formula}","${unit}","${granularity}","${dataType}","${sourceTables}","${businessLogic}"\n`;
  });
  
  return csv;
}

/**
 * Export Metrics to XLSX
 */
export function exportMetricsToXLSX(metrics: any[]): string {
  let xlsx = "Metric ID\tMetric Name\tDescription\tCategory\tType\tFormula\tUnit\tGranularity\tData Type\tSource Tables\tBusiness Logic\n";
  
  metrics.forEach((metric) => {
    const metricId = metric.metricId || metric.id || "";
    const name = metric.name || "";
    const description = (metric.description || "").replace(/\t/g, " ");
    const category = metric.category || "";
    const type = metric.type || "";
    const formula = (metric.formula || metric.businessLogic || "").replace(/\t/g, "  ");
    const unit = metric.unit || "";
    const granularity = metric.granularity || "";
    const dataType = metric.dataType || "";
    const sourceTables = metric.sourceTables ? metric.sourceTables.join("; ") : "";
    const businessLogic = (metric.businessLogic || metric.calculation || "").replace(/\t/g, "  ");
    
    xlsx += `${metricId}\t${name}\t${description}\t${category}\t${type}\t${formula}\t${unit}\t${granularity}\t${dataType}\t${sourceTables}\t${businessLogic}\n`;
  });
  
  return xlsx;
}

/**
 * Download helper - trigger browser download
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
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
 * Generic export handler for all section types
 */
export function exportSection(
  type: "sttm" | "ddl" | "dq" | "sql" | "metrics",
  format: "csv" | "xlsx",
  data: any[],
  domainName: string = "export"
) {
  let content: string;
  let fileExt: string;
  let mimeType: string;
  
  if (format === "csv") {
    fileExt = "csv";
    mimeType = "text/csv";
    switch (type) {
      case "sttm":
        content = exportSTTMToCSV(data);
        break;
      case "ddl":
        content = exportDDLToCSV(data);
        break;
      case "dq":
        content = exportDQScriptsToCSV(data);
        break;
      case "sql":
        content = exportSQLToCSV(data);
        break;
      case "metrics":
        content = exportMetricsToCSV(data);
        break;
    }
  } else {
    fileExt = "xlsx";
    mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    switch (type) {
      case "sttm":
        content = exportSTTMToXLSX(data);
        break;
      case "ddl":
        content = exportDDLToXLSX(data);
        break;
      case "dq":
        content = exportDQScriptsToXLSX(data);
        break;
      case "sql":
        content = exportSQLToXLSX(data);
        break;
      case "metrics":
        content = exportMetricsToXLSX(data);
        break;
    }
  }
  
  const safeDomain = domainName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  const filename = `${safeDomain}_${type}_${new Date().toISOString().split('T')[0]}.${fileExt}`;
  
  downloadFile(content, filename, mimeType);
}
