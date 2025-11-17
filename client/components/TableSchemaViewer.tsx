import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Database,
  Key,
  FileText,
  GitBranch,
  Layers,
  Info,
  Download,
} from "lucide-react";
import { exportTableSchemasToXLSX } from "@/lib/table-schema-export";
import { useToast } from "@/hooks/use-toast";

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
  primaryKey?: string | string[]; // Can be either string (gold layer) or array (bronze/silver)
  foreignKeys?: string[];
  scdType?: string;
  factType?: string;
  dimensionType?: string;
  partitioning?: string | object; // Can be string (SQL) or object (structured metadata)
  transformations?: string[];
  dataQualityRules?: string[];
  indexes?: (string | object)[]; // Can be SQL strings or structured objects
  schema: Record<string, string>;
}

interface TableSchemaViewerProps {
  tables: TableDefinition[];
  layerName: string;
  layerColor: string;
  layerIcon?: React.ReactNode;
  domainName: string;
}

function parseSchemaColumn(name: string, definition: string): TableColumn {
  const isPrimaryKey = definition.includes("PRIMARY KEY");
  const isForeignKey =
    definition.includes("FK to") || definition.includes("COMMENT 'FK");
  const isNullable = !definition.includes("NOT NULL");

  // Extract data type (before first space or COMMENT)
  const dataTypeMatch = definition.match(/^([A-Z]+(?:\([^)]+\))?)/);
  const dataType = dataTypeMatch ? dataTypeMatch[1] : "STRING";

  // Extract comment/description
  const commentMatch = definition.match(/COMMENT '([^']+)'/);
  const description = commentMatch ? commentMatch[1] : "";

  // Extract default value
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

export function TableSchemaViewer({
  tables,
  layerName,
  layerColor,
  layerIcon,
  domainName,
}: TableSchemaViewerProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    try {
      exportTableSchemasToXLSX(tables, layerName, domainName);
      toast({
        title: "Export Complete",
        description: `${layerName} layer table specifications downloaded successfully.`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description:
          "There was an error exporting the table schemas. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {layerIcon || <Database className="h-6 w-6 text-primary" />}
          <div>
            <h3 className="text-2xl font-bold">{layerName} Layer</h3>
            <p className="text-sm text-muted-foreground">
              {tables.length} Tables
            </p>
          </div>
        </div>
        <Button onClick={handleDownload} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download {layerName} Specs (XLSX)
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-4">
        {tables.map((table, idx) => {
          const columns = Object.entries(table.schema).map(([name, def]) =>
            parseSchemaColumn(name, def),
          );
          const primaryKeyColumns = columns.filter((col) => col.isPrimaryKey);
          const foreignKeyColumns = columns.filter((col) => col.isForeignKey);

          return (
            <AccordionItem
              key={idx}
              value={`table-${idx}`}
              className="border-2 rounded-lg"
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-start justify-between w-full pr-4">
                  <div className="flex items-start gap-3 text-left">
                    <Database className={`h-5 w-5 mt-1 ${layerColor}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="font-mono font-semibold text-base">
                          {table.name}
                        </code>
                        {table.scdType && (
                          <Badge variant="outline" className="text-xs">
                            {table.scdType}
                          </Badge>
                        )}
                        {table.factType && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-purple-50"
                          >
                            {table.factType}
                          </Badge>
                        )}
                        {table.loadType && (
                          <Badge variant="secondary" className="text-xs">
                            {table.loadType}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {table.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {columns.length} columns
                        </span>
                        {primaryKeyColumns.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Key className="h-3 w-3" />
                            {primaryKeyColumns.length} PK
                          </span>
                        )}
                        {foreignKeyColumns.length > 0 && (
                          <span className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            {foreignKeyColumns.length} FK
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 mt-4">
                  {/* Table Metadata */}
                  {(table.grain || table.sourceSystem || table.sourceTable) && (
                    <Card className="bg-slate-50">
                      <CardContent className="pt-4">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          {table.grain && (
                            <div>
                              <span className="font-semibold text-slate-700">
                                Grain:
                              </span>
                              <p className="text-slate-600 mt-1">
                                {table.grain}
                              </p>
                            </div>
                          )}
                          {table.sourceSystem && (
                            <div>
                              <span className="font-semibold text-slate-700">
                                Source System:
                              </span>
                              <p className="text-slate-600 mt-1">
                                {table.sourceSystem}
                              </p>
                            </div>
                          )}
                          {table.sourceTable && (
                            <div>
                              <span className="font-semibold text-slate-700">
                                Source Table:
                              </span>
                              <p className="text-slate-600 mt-1 font-mono text-xs">
                                {table.sourceTable}
                              </p>
                            </div>
                          )}
                          {table.primaryKey && (
                            <div>
                              <span className="font-semibold text-slate-700">
                                Primary Key:
                              </span>
                              <p className="text-slate-600 mt-1 font-mono text-xs">
                                {Array.isArray(table.primaryKey)
                                  ? table.primaryKey.join(", ")
                                  : table.primaryKey}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Transformations */}
                  {table.transformations &&
                    table.transformations.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <GitBranch className="h-4 w-4" />
                          Transformations
                        </h5>
                        <ul className="space-y-1 pl-4">
                          {table.transformations.map((transform, i) => (
                            <li
                              key={i}
                              className="text-sm text-slate-600 flex items-start gap-2"
                            >
                              <span className="text-primary mt-1">•</span>
                              <span>{transform}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Data Quality Rules */}
                  {table.dataQualityRules &&
                    table.dataQualityRules.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Data Quality Rules
                        </h5>
                        <ul className="space-y-1 pl-4">
                          {table.dataQualityRules.map((rule, i) => (
                            <li
                              key={i}
                              className="text-sm text-slate-600 flex items-start gap-2"
                            >
                              <span className="text-orange-500 mt-1">✓</span>
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Column Schema */}
                  <div>
                    <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Column Definitions
                    </h5>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-100">
                            <TableHead className="font-semibold">
                              Column Name
                            </TableHead>
                            <TableHead className="font-semibold">
                              Data Type
                            </TableHead>
                            <TableHead className="font-semibold">
                              Description
                            </TableHead>
                            <TableHead className="font-semibold w-24 text-center">
                              Keys
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {columns.map((column, i) => (
                            <TableRow
                              key={i}
                              className={
                                column.isPrimaryKey ? "bg-blue-50" : ""
                              }
                            >
                              <TableCell className="font-mono text-sm font-medium">
                                {column.name}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                <Badge variant="outline" className="font-mono">
                                  {column.dataType}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {column.description || "-"}
                                {column.defaultValue && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    Default: <code>{column.defaultValue}</code>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {column.isPrimaryKey && (
                                    <Badge
                                      variant="default"
                                      className="text-xs bg-blue-600"
                                    >
                                      PK
                                    </Badge>
                                  )}
                                  {column.isForeignKey && (
                                    <Badge
                                      variant="default"
                                      className="text-xs bg-green-600"
                                    >
                                      FK
                                    </Badge>
                                  )}
                                  {!column.isNullable &&
                                    !column.isPrimaryKey && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        NN
                                      </Badge>
                                    )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Indexes */}
                  {table.indexes && table.indexes.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-sm mb-2">Indexes</h5>
                      <div className="space-y-1">
                        {table.indexes.map((index, i) => {
                          // Handle both string and object formats
                          const indexDisplay =
                            typeof index === "string"
                              ? index
                              : typeof index === "object" && index !== null
                                ? `${(index as any).name || "INDEX"}: ${(index as any).type || ""} on (${
                                    Array.isArray((index as any).columns)
                                      ? (index as any).columns.join(", ")
                                      : (index as any).column || ""
                                  })${(index as any).isUnique ? " [UNIQUE]" : ""}`
                                : JSON.stringify(index);

                          return (
                            <code
                              key={i}
                              className="block text-xs bg-slate-100 p-2 rounded font-mono text-slate-700"
                            >
                              {indexDisplay}
                            </code>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Partitioning */}
                  {table.partitioning && (
                    <div>
                      <h5 className="font-semibold text-sm mb-2">
                        Partitioning Strategy
                      </h5>
                      <code className="block text-xs bg-slate-100 p-2 rounded font-mono text-slate-700">
                        {typeof table.partitioning === "string"
                          ? table.partitioning
                          : JSON.stringify(table.partitioning, null, 2)}
                      </code>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
