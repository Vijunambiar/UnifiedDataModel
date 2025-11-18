#!/usr/bin/env node
/**
 * COMPREHENSIVE STTM GENERATOR FROM EXCEL
 * 
 * Purpose: Parse the complete STTM Excel file and generate TypeScript mapping files
 * Input: Excel data with 18 tables and ~700 columns
 * Output: Complete STTM TypeScript files for all domains
 * 
 * Tables to process:
 * - CORE_CUSTOMERS: 8 tables, ~230 columns
 * - CORE_DEPOSIT: 10 tables, ~470 columns
 * 
 * Source Systems: FIS-ADS, FIS-DDW
 */

// Excel data structure from the STTM file
interface ExcelRow {
  coreSchema: string;
  coreTable: string;
  coreColumn: string;
  dataType: string;
  fisAdsTable: string;
  fisAdsColumn: string;
  fisDdwTable: string;
  fisDdwColumn: string;
}

interface GeneratedMapping {
  sourceSystem: string;
  sourceTable: string;
  sourceColumn: string;
  bronzeSchema: string;
  bronzeTable: string;
  bronzeColumn: string;
  silverSchema: string;
  silverTable: string;
  silverColumn: string;
  goldSchema: string;
  goldTable: string;
  goldColumn: string | null;
  dataType: string;
  businessLogic: string;
  businessMeaning: string;
  mappingType: "Direct" | "Derived" | "System" | "SCD2";
}

// Helper to determine mapping type based on column characteristics
function determineMappingType(
  column: string,
  fisColumn: string
): "Direct" | "Derived" | "System" | "SCD2" {
  const lowerCol = column.toUpperCase();
  
  // System columns
  if (["INSERT_BY", "INSERT_DT", "LAST_MODIFIED_BY", "LAST_MODIFIED_DT"].includes(lowerCol)) {
    return "System";
  }
  
  // SCD2 columns
  if (["EFFECTIVE_START_DATE", "EFFECTIVE_END_DATE", "RECORD_FLAG"].includes(lowerCol)) {
    return "SCD2";
  }
  
  // Derived columns (no FIS source)
  if (!fisColumn || fisColumn.includes("CURRENT_") || fisColumn.includes("HASH(")) {
    return "Derived";
  }
  
  // Direct 1:1 mappings
  return "Direct";
}

// Helper to generate business logic description
function generateBusinessLogic(row: ExcelRow, mappingType: string): string {
  if (mappingType === "System") {
    if (row.coreColumn.includes("INSERT_DT") || row.coreColumn.includes("LAST_MODIFIED_DT")) {
      return "CURRENT_TIMESTAMP() on insert/update";
    }
    if (row.coreColumn.includes("INSERT_BY") || row.coreColumn.includes("LAST_MODIFIED_BY")) {
      return "CURRENT_USER() - Snowflake ETL user";
    }
  }
  
  if (mappingType === "SCD2") {
    if (row.coreColumn === "EFFECTIVE_START_DATE") {
      return "SCD2 effective start date from source process date";
    }
    if (row.coreColumn === "EFFECTIVE_END_DATE") {
      return "SCD2 effective end date (9999-12-31 for current records)";
    }
    if (row.coreColumn === "RECORD_FLAG") {
      return "CASE WHEN EFFECTIVE_END_DATE = '9999-12-31' THEN 'A' ELSE 'I' END";
    }
    if (row.coreColumn === "ROW_HASH") {
      return "HASH of all business columns for SCD2 change detection";
    }
  }
  
  if (mappingType === "Derived") {
    if (row.fisAdsColumn.includes("HASH(")) {
      return row.fisAdsColumn;
    }
    if (row.fisAdsColumn.includes("CONCAT")) {
      return row.fisAdsColumn;
    }
    if (row.fisAdsColumn.includes("CASE WHEN")) {
      return row.fisAdsColumn;
    }
    if (row.coreColumn.endsWith("_FK") || row.coreColumn.endsWith("_SK")) {
      return "Foreign/Surrogate key lookup or auto-generation";
    }
    return "Derived/calculated field";
  }
  
  // Direct mapping
  return "1:1 mapping from source";
}

// Main function to generate mappings from Excel data
function generateSTTMFile(tableName: string, rows: ExcelRow[]): string {
  const mappingVarName = tableName.toLowerCase().replace(/dim_|fct_|brg_/g, "").replace(/_/g, "") + "Mappings";
  
  let output = `// STTM Mappings for ${tableName}\n`;
  output += `// Auto-generated from Excel STTM file\n\n`;
  output += `export interface ColumnMapping {\n`;
  output += `  sourceSystem: string;\n`;
  output += `  sourceTable: string;\n`;
  output += `  sourceColumn: string;\n`;
  output += `  bronzeSchema: string;\n`;
  output += `  bronzeTable: string;\n`;
  output += `  bronzeColumn: string;\n`;
  output += `  silverSchema: string;\n`;
  output += `  silverTable: string;\n`;
  output += `  silverColumn: string;\n`;
  output += `  goldSchema: string;\n`;
  output += `  goldTable: string;\n`;
  output += `  goldColumn: string | null;\n`;
  output += `  dataType: string;\n`;
  output += `  businessLogic: string;\n`;
  output += `  businessMeaning: string;\n`;
  output += `  mappingType: "Direct" | "Derived" | "System" | "SCD2";\n`;
  output += `}\n\n`;
  
  output += `export const ${mappingVarName}: ColumnMapping[] = [\n`;
  
  rows.forEach((row, index) => {
    const sourceSystem = row.fisAdsTable ? "FIS-ADS" : (row.fisDdwTable ? "FIS-DDW" : "SYSTEM");
    const sourceTable = row.fisAdsTable || row.fisDdwTable || "N/A";
    const sourceColumn = row.fisAdsColumn || row.fisDdwColumn || "AUTO_GENERATED";
    const mappingType = determineMappingType(row.coreColumn, sourceColumn);
    const businessLogic = generateBusinessLogic(row, mappingType);
    
    output += `  {\n`;
    output += `    sourceSystem: "${sourceSystem}",\n`;
    output += `    sourceTable: "${sourceTable}",\n`;
    output += `    sourceColumn: "${sourceColumn}",\n`;
    output += `    bronzeSchema: "${sourceSystem === "SYSTEM" ? "N/A" : "FIS_ADS"}",\n`;
    output += `    bronzeTable: "${sourceTable}",\n`;
    output += `    bronzeColumn: "${sourceColumn}",\n`;
    output += `    silverSchema: "${row.coreSchema}",\n`;
    output += `    silverTable: "${row.coreTable}",\n`;
    output += `    silverColumn: "${row.coreColumn}",\n`;
    output += `    goldSchema: "ANALYTICS",\n`;
    output += `    goldTable: "CUSTOMER_DEPOSIT_AGGR",\n`;
    output += `    goldColumn: null,\n`;
    output += `    dataType: "${row.dataType}",\n`;
    output += `    businessLogic: "${businessLogic.replace(/"/g, '\\"')}",\n`;
    output += `    businessMeaning: "${row.coreColumn.replace(/_/g, " ").toLowerCase()}",\n`;
    output += `    mappingType: "${mappingType}",\n`;
    output += `  },\n`;
  });
  
  output += `];\n\n`;
  output += `export default ${mappingVarName};\n`;
  
  return output;
}

console.log("✅ STTM Generator ready to process Excel data");
console.log("📊 Expected: 18 tables, ~700 columns");
console.log("🔧 Next step: Parse Excel data and generate complete STTM TypeScript files");
