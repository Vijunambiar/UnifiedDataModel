import * as XLSX from 'xlsx';

interface TableColumn {
  name: string;
  dataType: string;
  description?: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  isNullable?: boolean;
  defaultValue?: string;
}

interface TableDefinition {
  name: string;
  description: string;
  sourceSystem?: string;
  sourceTable?: string;
  loadType?: string;
  grain?: string;
  primaryKey?: string[];
  foreignKeys?: string[];
  scdType?: string;
  factType?: string;
  dimensionType?: string;
  partitioning?: string;
  transformations?: string[];
  dataQualityRules?: string[];
  indexes?: string[];
  schema: Record<string, string>;
}

function parseSchemaColumn(name: string, definition: string): TableColumn {
  const isPrimaryKey = definition.includes('PRIMARY KEY');
  const isForeignKey = definition.includes('FK to') || definition.includes('COMMENT \'FK');
  const isNullable = !definition.includes('NOT NULL');
  
  const dataTypeMatch = definition.match(/^([A-Z]+(?:\([^)]+\))?)/);
  const dataType = dataTypeMatch ? dataTypeMatch[1] : 'STRING';
  
  const commentMatch = definition.match(/COMMENT '([^']+)'/);
  const description = commentMatch ? commentMatch[1] : '';
  
  const defaultMatch = definition.match(/DEFAULT '?([^'\s]+)'?/);
  const defaultValue = defaultMatch ? defaultMatch[1] : undefined;
  
  return {
    name,
    dataType,
    description,
    isPrimaryKey,
    isForeignKey,
    isNullable,
    defaultValue,
  };
}

export function exportTableSchemasToXLSX(
  tables: TableDefinition[],
  layerName: string,
  domainName: string
) {
  const workbook = XLSX.utils.book_new();
  
  // Sheet 1: Table Summary
  const summaryData: any[] = [
    [`${layerName} Layer - Table Summary`],
    [`Domain: ${domainName}`],
    [`Export Date: ${new Date().toISOString().split('T')[0]}`],
    [''],
    ['Table Name', 'Description', 'Grain', 'Source System', 'Load Type', 'Column Count', 'Primary Keys', 'SCD Type'],
  ];
  
  tables.forEach(table => {
    const columnCount = Object.keys(table.schema).length;
    const primaryKeys = table.primaryKey?.join(', ') || 'N/A';
    
    summaryData.push([
      table.name,
      table.description,
      table.grain || 'N/A',
      table.sourceSystem || 'N/A',
      table.loadType || 'N/A',
      columnCount,
      primaryKeys,
      table.scdType || table.factType || table.dimensionType || 'N/A',
    ]);
  });
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [
    { wch: 50 },
    { wch: 60 },
    { wch: 40 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 30 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Sheet 2: Complete Column Specifications
  const columnData: any[] = [
    [`${layerName} Layer - Column Specifications`],
    [''],
    ['Table Name', 'Column Name', 'Data Type', 'Description', 'Primary Key', 'Foreign Key', 'Nullable', 'Default Value'],
  ];
  
  tables.forEach(table => {
    const columns = Object.entries(table.schema).map(([name, def]) => 
      parseSchemaColumn(name, def)
    );
    
    columns.forEach(col => {
      columnData.push([
        table.name,
        col.name,
        col.dataType,
        col.description || '',
        col.isPrimaryKey ? 'YES' : 'NO',
        col.isForeignKey ? 'YES' : 'NO',
        col.isNullable ? 'YES' : 'NO',
        col.defaultValue || '',
      ]);
    });
    
    // Add blank row between tables
    columnData.push(['', '', '', '', '', '', '', '']);
  });
  
  const columnSheet = XLSX.utils.aoa_to_sheet(columnData);
  columnSheet['!cols'] = [
    { wch: 50 },
    { wch: 30 },
    { wch: 20 },
    { wch: 80 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(workbook, columnSheet, 'Columns');
  
  // Sheet 3: Metadata & Business Rules
  const metadataData: any[] = [
    [`${layerName} Layer - Metadata & Business Rules`],
    [''],
    ['Table Name', 'Type', 'Detail'],
  ];
  
  tables.forEach(table => {
    // Transformations
    if (table.transformations && table.transformations.length > 0) {
      metadataData.push([table.name, 'Transformation', table.transformations.join('\n')]);
    }
    
    // Data Quality Rules
    if (table.dataQualityRules && table.dataQualityRules.length > 0) {
      metadataData.push([table.name, 'Data Quality Rule', table.dataQualityRules.join('\n')]);
    }
    
    // Indexes
    if (table.indexes && table.indexes.length > 0) {
      metadataData.push([table.name, 'Index', table.indexes.join('\n')]);
    }
    
    // Partitioning
    if (table.partitioning) {
      metadataData.push([table.name, 'Partitioning', table.partitioning]);
    }
    
    // Add blank row between tables
    metadataData.push(['', '', '']);
  });
  
  const metadataSheet = XLSX.utils.aoa_to_sheet(metadataData);
  metadataSheet['!cols'] = [
    { wch: 50 },
    { wch: 25 },
    { wch: 100 },
  ];
  XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
  
  // Sheet 4: DDL Generation Template
  const ddlData: any[] = [
    [`${layerName} Layer - DDL Templates`],
    [''],
    ['Table Name', 'DDL (CREATE TABLE Statement)'],
  ];
  
  tables.forEach(table => {
    const columns = Object.entries(table.schema).map(([name, def]) => 
      parseSchemaColumn(name, def)
    );
    
    let ddl = `CREATE TABLE ${table.name} (\n`;
    
    columns.forEach((col, idx) => {
      const nullable = col.isNullable ? '' : ' NOT NULL';
      const pk = col.isPrimaryKey ? ' PRIMARY KEY' : '';
      const defaultVal = col.defaultValue ? ` DEFAULT ${col.defaultValue}` : '';
      const comment = col.description ? ` COMMENT '${col.description}'` : '';
      
      ddl += `  ${col.name} ${col.dataType}${nullable}${pk}${defaultVal}${comment}`;
      if (idx < columns.length - 1) ddl += ',';
      ddl += '\n';
    });
    
    ddl += ');\n';
    
    if (table.indexes && table.indexes.length > 0) {
      ddl += '\n-- Indexes\n';
      table.indexes.forEach(index => {
        ddl += `${index};\n`;
      });
    }
    
    ddlData.push([table.name, ddl]);
    ddlData.push(['', '']); // Blank row
  });
  
  const ddlSheet = XLSX.utils.aoa_to_sheet(ddlData);
  ddlSheet['!cols'] = [
    { wch: 50 },
    { wch: 120 },
  ];
  XLSX.utils.book_append_sheet(workbook, ddlSheet, 'DDL Templates');
  
  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${domainName}_${layerName}_Tables_${timestamp}.xlsx`;
  
  // Download
  XLSX.writeFile(workbook, filename);
}
