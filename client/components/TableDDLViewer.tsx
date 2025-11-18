import { useState } from "react";
import { ChevronDown, Copy, Eye } from "lucide-react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";

interface Column {
  name: string;
  dataType: string;
  nullable?: boolean;
  businessMeaning?: string;
  sourceSchema?: string;
  sourceTable?: string;
  sourceColumn?: string;
}

interface TableDefinition {
  name: string;
  schema?: string;
  description?: string;
  columns?: Column[];
  recordEstimate?: string;
  estimatedRows?: number | string;
  primaryKey?: string[];
  grain?: string;
  scd2?: boolean;
  partitionBy?: string[];
  sourceTables?: string[];
  [key: string]: any; // Allow schema object
}

// Convert schema object to columns array
function parseSchemaToColumns(schemaObj: any): Column[] {
  if (!schemaObj || typeof schemaObj !== "object") return [];

  return Object.entries(schemaObj).map(([name, def]: [string, any]) => {
    const defStr = String(def);
    // Parse "TYPE COMMENT 'description'" format
    const match = defStr.match(/^(.+?)\s+COMMENT\s+'(.+)'$/);
    const hasComment = match !== null;
    const dataType = match ? match[1].trim() : defStr.trim();
    const comment = match ? match[2] : "";

    return {
      name,
      dataType,
      businessMeaning: comment || undefined,
    };
  });
}

interface TableDDLViewerProps {
  tables: TableDefinition[];
  layerName: string;
}

export function TableDDLViewer({ tables, layerName }: TableDDLViewerProps) {
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableDefinition | null>(null);
  const [showDDL, setShowDDL] = useState(false);

  const getTableColumns = (table: TableDefinition): Column[] => {
    if (table.columns && Array.isArray(table.columns)) {
      return table.columns;
    }
    if (table.schema && typeof table.schema === "object") {
      return parseSchemaToColumns(table.schema);
    }
    return [];
  };

  const getSchemaFromTableName = (tableName: string): string => {
    if (tableName.includes(".")) {
      return tableName.split(".")[0];
    }
    return "analytics";
  };

  const getTableNameWithoutSchema = (tableName: string): string => {
    if (tableName.includes(".")) {
      return tableName.split(".")[1];
    }
    return tableName;
  };

  const generateDDL = (table: TableDefinition): string => {
    const columns = getTableColumns(table)
      .map((col: Column) => {
        let def = `  ${col.name} ${col.dataType}`;
        if (col.businessMeaning) {
          def += ` COMMENT '${col.businessMeaning.replace(/'/g, "''")}'`;
        }
        return def;
      })
      .join(",\n");

    const schemaName = getSchemaFromTableName(table.name);
    const tableNameOnly = getTableNameWithoutSchema(table.name);

    let ddl = `CREATE TABLE ${schemaName}.${tableNameOnly} (\n${columns}\n)`;

    if (table.primaryKey && table.primaryKey.length > 0) {
      ddl += `\nPRIMARY KEY (${table.primaryKey.join(", ")})`;
    }

    if (table.partitionBy && table.partitionBy.length > 0) {
      ddl += `\nPARTITION BY (${table.partitionBy.join(", ")})`;
    }

    if (table.grain) {
      ddl += `\nCOMMENT '${table.grain.replace(/'/g, "''")}'`;
    }

    return ddl;
  };

  const copyDDL = (table: TableDefinition) => {
    const ddl = generateDDL(table);
    navigator.clipboard.writeText(ddl);
  };

  if (!tables || tables.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tables available for {layerName}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12"></TableHead>
              <TableHead>Table Name</TableHead>
              <TableHead>Schema</TableHead>
              <TableHead className="text-right">Columns</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table) => [
              <TableRow
                key={`${table.name}-main`}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() =>
                  setExpandedTable(
                    expandedTable === table.name ? null : table.name
                  )
                }
              >
                <TableCell>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      expandedTable === table.name ? "rotate-180" : ""
                    }`}
                  />
                </TableCell>
                <TableCell className="font-medium">{table.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getSchemaFromTableName(table.name)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{getTableColumns(table).length}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTable(table);
                      setShowDDL(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyDDL(table);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>,

              ...(expandedTable === table.name ? [
                <TableRow key={`${table.name}-expanded`}>
                  <TableCell colSpan={5} className="bg-muted/30 p-0">
                    <div className="p-4">
                      {table.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {table.description}
                        </p>
                      )}

                      {(table.grain ||
                        (table.primaryKey && table.primaryKey.length > 0)) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-xs">
                          {table.grain && (
                            <div>
                              <span className="font-semibold">Grain:</span>
                              <p className="text-muted-foreground">
                                {table.grain}
                              </p>
                            </div>
                          )}
                          {table.primaryKey && table.primaryKey.length > 0 && (
                            <div>
                              <span className="font-semibold">PK:</span>
                              <p className="text-muted-foreground text-xs">
                                {table.primaryKey.join(", ")}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {table.sourceTables && table.sourceTables.length > 0 && (
                        <div className="mb-4 pb-4 border-b">
                          <span className="font-semibold text-sm">Source Tables:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {table.sourceTables.map((src) => (
                              <Badge key={src} variant="outline" className="text-xs">
                                {src}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="rounded border bg-background p-3">
                        <h5 className="font-semibold text-sm mb-3">
                          Columns ({getTableColumns(table).length})
                        </h5>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {getTableColumns(table).map((col) => (
                            <div
                              key={col.name}
                              className="border-b last:border-b-0 pb-2 last:pb-0"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-mono text-sm font-semibold">
                                    {col.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {col.dataType}
                                    {col.nullable === false ? " NOT NULL" : ""}
                                  </p>
                                </div>
                                {col.businessMeaning && (
                                  <Badge variant="outline" className="ml-2">
                                    {col.businessMeaning.substring(0, 30)}
                                    {col.businessMeaning.length > 30
                                      ? "..."
                                      : ""}
                                  </Badge>
                                )}
                              </div>
                              {col.businessMeaning && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {col.businessMeaning}
                                </p>
                              )}
                              {(col.sourceTable || col.sourceSchema) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Source:{" "}
                                  {col.sourceSchema
                                    ? `${col.sourceSchema}.`
                                    : ""}
                                  {col.sourceTable}
                                  {col.sourceColumn ? `.${col.sourceColumn}` : ""}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ] : [])
            ]).flat()}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDDL} onOpenChange={setShowDDL}>
        <DialogContent className="max-w-3xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTable?.name} - DDL</DialogTitle>
            <DialogDescription>
              {selectedTable?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedTable && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-slate-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>{generateDDL(selectedTable)}</pre>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => copyDDL(selectedTable)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy DDL
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Column Details</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {getTableColumns(selectedTable).map((col) => (
                    <div key={col.name} className="border-l-2 border-blue-500 pl-3 py-1">
                      <p className="font-mono text-sm font-semibold">{col.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {col.dataType}
                        {col.nullable === false ? " NOT NULL" : ""}
                      </p>
                      {col.businessMeaning && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {col.businessMeaning}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
