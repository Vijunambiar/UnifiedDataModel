import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  FileText,
  Table2,
  FileSpreadsheet,
  Workflow,
  Database,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  FileCode,
  Layers,
} from "lucide-react";
import { bankingDomains } from "@/lib/enterprise-domains";
import {
  evaluateDomain,
  evaluateAllDomains,
  type DomainEvaluation,
  type EvaluationSummary,
} from "@/lib/domain-evaluation";
import { exportAndDownload, type ExportFormat } from "@/lib/data-model-exports";
import { getDataSourcesByDomain } from "@/lib/data-sources";
import { LogicalERD } from "@/components/LogicalERD";
import { PhysicalERD } from "@/components/PhysicalERD";
import { generateLogicalRelationships } from "@/lib/erd-relationships";
import { enrichLogicalEntitiesWithAttributes } from "@/lib/logical-model-mapper";
import { useToast } from "@/hooks/use-toast";

export default function DataModels() {
  const [searchParams] = useSearchParams();
  const domainIdParam = searchParams.get("domain");

  const [selectedDomainId, setSelectedDomainId] = useState<string>(
    domainIdParam || bankingDomains[0]?.id || "",
  );
  const [evaluation, setEvaluation] = useState<DomainEvaluation | null>(null);
  const [summary, setSummary] = useState<EvaluationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [domainDataSources, setDomainDataSources] = useState<any[]>([]);

  const { toast } = useToast();

  // Load evaluation on mount
  useEffect(() => {
    loadEvaluation();
  }, []);

  // Load domain evaluation when selection changes
  useEffect(() => {
    if (selectedDomainId) {
      loadDomainEvaluation(selectedDomainId);
    }
  }, [selectedDomainId]);

  async function loadEvaluation() {
    try {
      setLoading(true);
      const result = await evaluateAllDomains();
      setSummary(result.summary);

      if (selectedDomainId) {
        const domainEval = result.evaluations.find(
          (e) => e.domainId === selectedDomainId,
        );
        if (domainEval) {
          setEvaluation(domainEval);
        }
      }
    } catch (error) {
      console.error("Failed to load evaluation:", error);
      toast({
        title: "Evaluation Error",
        description: "Failed to load domain evaluation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadDomainEvaluation(domainId: string) {
    try {
      const domainEval = await evaluateDomain(domainId);
      setEvaluation(domainEval);

      // Load data sources for this domain
      const sources = getDataSourcesByDomain(domainId);
      setDomainDataSources(sources);
    } catch (error) {
      console.error("Failed to load domain evaluation:", error);
    }
  }

  async function handleExport(format: ExportFormat) {
    if (!selectedDomainId) return;

    try {
      setExporting(true);
      await exportAndDownload(selectedDomainId, format);

      toast({
        title: "Export Successful",
        description: `Data model exported to ${format.toUpperCase()} format`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data model",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  }

  const selectedDomain = bankingDomains.find((d) => d.id === selectedDomainId);

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-orange-600 to-orange-700 p-12 text-white mb-8 shadow-2xl">
        <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-white/20 to-teal-400/10 blur-3xl" />
        <div className="absolute -left-32 -bottom-32 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-teal-400/20 to-green-400/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-10 w-10" />
            <h1 className="text-5xl font-extrabold tracking-tight">
              Data Models
            </h1>
          </div>

          <p className="text-xl text-slate-200 max-w-4xl">
            Comprehensive data model documentation with logical and physical
            models. Export to PDF, Excel, CSV, Draw.io, and DBDiagram.io
            formats.
          </p>
        </div>
      </section>


      {/* Domain Selector */}
      <section className="mb-8">
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-white">
            <CardTitle className="text-primary">Select Domain</CardTitle>
            <CardDescription>
              Choose a banking domain to view and export its data model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {bankingDomains.map((domain) => (
                <Button
                  key={domain.id}
                  variant={
                    selectedDomainId === domain.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedDomainId(domain.id)}
                  className={`justify-start h-auto py-3 transition-all ${
                    selectedDomainId === domain.id
                      ? "bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary shadow-md"
                      : "hover:border-primary/40 hover:bg-orange-50"
                  }`}
                >
                  <span className="mr-2 text-lg">{domain.icon}</span>
                  <span className="text-sm font-semibold">{domain.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Domain Details */}
      {selectedDomain && evaluation && (
        <section>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-orange-50 to-teal-50 p-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="logical">Logical Model</TabsTrigger>
              <TabsTrigger value="physical">Physical Model</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50/50 via-white to-teal-50/30">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{selectedDomain.icon}</div>
                    <div>
                      <CardTitle className="text-3xl">
                        {selectedDomain.name}
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        {selectedDomain.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Data Layers */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Data Layers</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card
                        className={
                          evaluation.hasBronzeLayer
                            ? "border-green-500"
                            : "border-red-300"
                        }
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2 mb-2">
                            {evaluation.hasBronzeLayer ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            <div className="font-semibold">Bronze Layer</div>
                          </div>
                          <div className="text-2xl font-bold text-slate-700">
                            {evaluation.bronzeLayer?.tableCount || 0}
                          </div>
                          <div className="text-sm text-slate-600">Tables</div>
                        </CardContent>
                      </Card>

                      <Card
                        className={
                          evaluation.hasSilverLayer
                            ? "border-green-500"
                            : "border-red-300"
                        }
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2 mb-2">
                            {evaluation.hasSilverLayer ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            <div className="font-semibold">Silver Layer</div>
                          </div>
                          <div className="text-2xl font-bold text-slate-700">
                            {evaluation.silverLayer?.tableCount || 0}
                          </div>
                          <div className="text-sm text-slate-600">Tables</div>
                        </CardContent>
                      </Card>

                      <Card
                        className={
                          evaluation.hasGoldLayer
                            ? "border-green-500"
                            : "border-red-300"
                        }
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2 mb-2">
                            {evaluation.hasGoldLayer ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            <div className="font-semibold">Gold Layer</div>
                          </div>
                          <div className="text-2xl font-bold text-slate-700">
                            {evaluation.goldLayer?.tableCount || 0}
                          </div>
                          <div className="text-sm text-slate-600">
                            Dimensions & Facts
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Metrics & Documentation
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            <div className="font-semibold">
                              Business Metrics
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-slate-700">
                            {evaluation.metricsCount}
                          </div>
                          <div className="text-sm text-slate-600">
                            {evaluation.hasDetailedMetrics ? (
                              <span className="text-green-600">
                                ✓ With formulas & definitions
                              </span>
                            ) : (
                              <span className="text-amber-600">
                                ⚠ Basic definitions only
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="h-5 w-5 text-purple-500" />
                            <div className="font-semibold">Physical Tables</div>
                          </div>
                          <div className="text-2xl font-bold text-slate-700">
                            {evaluation.physicalTablesCount}
                          </div>
                          <div className="text-sm text-slate-600">
                            ~{evaluation.physicalColumnsCount} columns
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Issues & Recommendations */}
                  {evaluation.issues.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-semibold mb-2">
                          Issues Detected:
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                          {evaluation.issues.map((issue, idx) => (
                            <li key={idx} className="text-sm">
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {evaluation.recommendations.length > 0 && (
                    <Alert>
                      <AlertDescription>
                        <div className="font-semibold mb-2">
                          Recommendations:
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                          {evaluation.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm">
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logical Model Tab */}
            <TabsContent value="logical">
              <Card>
                <CardHeader>
                  <CardTitle>Logical Data Model</CardTitle>
                  <CardDescription>
                    Conceptual entities and business concepts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">
                        Key Entities ({selectedDomain.keyEntities.length})
                      </h3>
                      <div className="grid md:grid-cols-3 gap-3">
                        {selectedDomain.keyEntities.map((entity, idx) => (
                          <Card
                            key={idx}
                            className="border-blue-200 bg-blue-50/50"
                          >
                            <CardContent className="pt-4">
                              <div className="font-semibold text-slate-900">
                                {entity}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">
                        Sub-Domains ({selectedDomain.subDomains.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedDomain.subDomains.map((subdomain, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-sm px-3 py-1"
                          >
                            {subdomain}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">
                        Data Sources ({domainDataSources.length})
                      </h3>
                      <div className="grid md:grid-cols-2 gap-2">
                        {domainDataSources.length > 0 ? (
                          domainDataSources.map((source, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm text-slate-700"
                            >
                              <div className="h-2 w-2 rounded-full bg-slate-400" />
                              <span>{source.name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-slate-500 italic">
                            No data sources mapped for this domain
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Logical ERD Diagram */}
                    <div className="pt-4">
                      <LogicalERD
                        entities={enrichLogicalEntitiesWithAttributes(
                          selectedDomain.keyEntities,
                          evaluation.silverLayer,
                          evaluation.goldLayer,
                        )}
                        relationships={generateLogicalRelationships(
                          selectedDomain.keyEntities,
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Physical Model Tab */}
            <TabsContent value="physical">
              <Card>
                <CardHeader>
                  <CardTitle>Physical Data Model</CardTitle>
                  <CardDescription>
                    Actual database tables across Bronze, Silver, and Gold
                    layers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Bronze Layer */}
                    {evaluation.bronzeLayer && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Badge className="bg-amber-500">Bronze</Badge>
                          <span>
                            Raw Data Tables ({evaluation.bronzeLayer.tableCount}
                            )
                          </span>
                        </h3>
                        <div className="text-sm text-slate-600 mb-2">
                          Raw, unprocessed data from source systems
                        </div>
                        <Card className="bg-amber-50/50 border-amber-200">
                          <CardContent className="pt-4 space-y-3">
                            <div className="grid md:grid-cols-2 gap-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm">
                                  Tables: {evaluation.bronzeLayer.tableCount}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {evaluation.bronzeLayer.hasSchema ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-amber-500" />
                                )}
                                <span className="text-sm">
                                  Schema Defined:{" "}
                                  {evaluation.bronzeLayer.hasSchema
                                    ? "Yes"
                                    : "No"}
                                </span>
                              </div>
                            </div>
                            {evaluation.bronzeLayer.tables &&
                              evaluation.bronzeLayer.tables.length > 0 && (
                                <div className="pt-3 border-t border-amber-300">
                                  <div className="text-xs font-semibold text-amber-900 mb-2">
                                    Tables:
                                  </div>
                                  <div className="grid md:grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                                    {evaluation.bronzeLayer.tables.map(
                                      (table, idx) => (
                                        <div
                                          key={idx}
                                          className="text-xs text-slate-700 font-mono bg-white/50 px-2 py-1 rounded"
                                        >
                                          {table.name}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </CardContent>
                        </Card>

                        {/* Bronze Layer ERD */}
                        {evaluation.bronzeLayer.tables &&
                          evaluation.bronzeLayer.tables.length > 0 && (
                            <div className="mt-4">
                              <PhysicalERD
                                layer="bronze"
                                tables={evaluation.bronzeLayer.tables.map(
                                  (table) => ({
                                    name: table.name,
                                    type: "bronze" as const,
                                    columns:
                                      table.key_fields?.map((field, idx) => {
                                        const fieldLower = field.toLowerCase();
                                        const isIdField =
                                          fieldLower.includes("_id");
                                        const isDateField =
                                          fieldLower.includes("date");
                                        const isAmountField =
                                          fieldLower.includes("amount") ||
                                          fieldLower.includes("balance");

                                        return {
                                          name: field,
                                          type: isIdField
                                            ? "INT"
                                            : isAmountField
                                              ? "DECIMAL"
                                              : "VARCHAR",
                                          isPK: idx === 0 && isIdField, // Only first field if it's an ID
                                          isFK:
                                            idx > 0 &&
                                            isIdField &&
                                            !isDateField, // Other IDs are FKs (but not dates)
                                        };
                                      }) || [],
                                  }),
                                )}
                                relationships={
                                  evaluation.bronzeLayer.relationships || []
                                }
                              />
                            </div>
                          )}
                      </div>
                    )}

                    {/* Silver Layer */}
                    {evaluation.silverLayer && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Badge className="bg-green-600">Silver</Badge>
                          <span>
                            Curated Data Tables (
                            {evaluation.silverLayer.tableCount})
                          </span>
                        </h3>
                        <div className="text-sm text-slate-600 mb-2">
                          Cleansed, validated, and enriched data
                        </div>
                        <Card className="bg-green-50/50 border-green-200">
                          <CardContent className="pt-4 space-y-3">
                            <div className="grid md:grid-cols-2 gap-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm">
                                  Tables: {evaluation.silverLayer.tableCount}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {evaluation.silverLayer.hasSchema ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-amber-500" />
                                )}
                                <span className="text-sm">
                                  Schema Defined:{" "}
                                  {evaluation.silverLayer.hasSchema
                                    ? "Yes"
                                    : "No"}
                                </span>
                              </div>
                            </div>
                            {evaluation.silverLayer.tables &&
                              evaluation.silverLayer.tables.length > 0 && (
                                <div className="pt-3 border-t border-green-300">
                                  <div className="text-xs font-semibold text-green-900 mb-2">
                                    Tables:
                                  </div>
                                  <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {evaluation.silverLayer.tables.map(
                                      (table, idx) => (
                                        <div
                                          key={idx}
                                          className="bg-white/50 px-2 py-1 rounded"
                                        >
                                          <div className="text-xs text-slate-900 font-mono">
                                            {table.name}
                                          </div>
                                          {table.description && (
                                            <div className="text-xs text-slate-600 mt-0.5">
                                              {table.description}
                                            </div>
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </CardContent>
                        </Card>

                        {/* Silver Layer ERD */}
                        {evaluation.silverLayer.tables &&
                          evaluation.silverLayer.tables.length > 0 && (
                            <div className="mt-4">
                              <PhysicalERD
                                layer="silver"
                                tables={evaluation.silverLayer.tables.map(
                                  (table) => ({
                                    name: table.name,
                                    type: "silver" as const,
                                    columns:
                                      table.key_fields?.map((field, idx) => {
                                        const fieldLower = field.toLowerCase();
                                        const isIdField =
                                          fieldLower.includes("_id") ||
                                          fieldLower.includes("_key");
                                        const isDateField =
                                          fieldLower.includes("date");
                                        const isAmountField =
                                          fieldLower.includes("amount") ||
                                          fieldLower.includes("balance");

                                        return {
                                          name: field,
                                          type: isIdField
                                            ? "INT"
                                            : isAmountField
                                              ? "DECIMAL"
                                              : "VARCHAR",
                                          isPK: idx === 0 && isIdField,
                                          isFK:
                                            idx > 0 &&
                                            isIdField &&
                                            !isDateField,
                                        };
                                      }) || [],
                                  }),
                                )}
                                relationships={
                                  evaluation.silverLayer.relationships || []
                                }
                              />
                            </div>
                          )}
                      </div>
                    )}

                    {/* Gold Layer */}
                    {evaluation.goldLayer && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Badge className="bg-blue-600">Gold</Badge>
                          <span>
                            Dimensional Model ({evaluation.goldLayer.tableCount}{" "}
                            tables)
                          </span>
                        </h3>
                        <div className="text-sm text-slate-600 mb-2">
                          Star schema with dimensions and facts for analytics
                        </div>
                        <Card className="bg-blue-50/50 border-blue-200">
                          <CardContent className="pt-4 space-y-3">
                            <div className="grid md:grid-cols-3 gap-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm">
                                  Total Tables:{" "}
                                  {evaluation.goldLayer.tableCount}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {evaluation.goldLayer.hasRelationships ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-amber-500" />
                                )}
                                <span className="text-sm">
                                  Relationships:{" "}
                                  {evaluation.goldLayer.hasRelationships
                                    ? "Defined"
                                    : "Pending"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm">
                                  Completeness:{" "}
                                  {evaluation.goldLayer.completeness}%
                                </span>
                              </div>
                            </div>
                            {evaluation.goldLayer.tables &&
                              evaluation.goldLayer.tables.length > 0 && (
                                <div className="pt-3 border-t border-blue-300">
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-xs font-semibold text-blue-900 mb-2">
                                        Dimensions:
                                      </div>
                                      <div className="space-y-1 max-h-48 overflow-y-auto">
                                        {evaluation.goldLayer.tables
                                          .filter(
                                            (t: any) =>
                                              !t.type || t.type === "dimension",
                                          )
                                          .map((table, idx) => (
                                            <div
                                              key={idx}
                                              className="bg-white/50 px-2 py-1 rounded"
                                            >
                                              <div className="text-xs text-slate-900 font-mono">
                                                {table.name}
                                              </div>
                                              {table.description && (
                                                <div className="text-xs text-slate-600 mt-0.5">
                                                  {table.description}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs font-semibold text-blue-900 mb-2">
                                        Facts:
                                      </div>
                                      <div className="space-y-1 max-h-48 overflow-y-auto">
                                        {evaluation.goldLayer.tables
                                          .filter((t: any) => t.type === "fact")
                                          .map((table, idx) => (
                                            <div
                                              key={idx}
                                              className="bg-white/50 px-2 py-1 rounded"
                                            >
                                              <div className="text-xs text-slate-900 font-mono">
                                                {table.name}
                                              </div>
                                              {table.description && (
                                                <div className="text-xs text-slate-600 mt-0.5">
                                                  {table.description}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </CardContent>
                        </Card>

                        {/* Gold Layer ERD - Star Schema */}
                        {evaluation.goldLayer.tables &&
                          evaluation.goldLayer.tables.length > 0 && (
                            <div className="mt-4">
                              <PhysicalERD
                                layer="gold"
                                tables={evaluation.goldLayer.tables.map(
                                  (table: any) => ({
                                    name: table.name,
                                    type: table.type || "dimension",
                                    columns: [
                                      {
                                        name:
                                          table.name
                                            .replace("gold.dim_", "")
                                            .replace("gold.fact_", "")
                                            .replace("dim_", "")
                                            .replace("fact_", "") + "_key",
                                        type: "INT",
                                        isPK: true,
                                      },
                                      ...(table.type === "fact"
                                        ? [
                                            {
                                              name: "date_key",
                                              type: "INT",
                                              isFK: true,
                                            },
                                            {
                                              name: "customer_key",
                                              type: "INT",
                                              isFK: true,
                                            },
                                          ]
                                        : []),
                                    ],
                                  }),
                                )}
                                relationships={
                                  evaluation.goldLayer.relationships || []
                                }
                              />
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export">
              <Card>
                <CardHeader>
                  <CardTitle>Export Data Model</CardTitle>
                  <CardDescription>
                    Download data model documentation in multiple formats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* PDF Export */}
                    <Card
                      className={
                        evaluation.readyForPdfExport
                          ? "border-green-500"
                          : "border-gray-300 opacity-60"
                      }
                    >
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-red-500" />
                          <div>
                            <div className="font-semibold">PDF Document</div>
                            <div className="text-xs text-slate-600">
                              Complete documentation
                            </div>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleExport("pdf")}
                          disabled={!evaluation.readyForPdfExport || exporting}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export PDF
                        </Button>
                      </CardContent>
                    </Card>

                    {/* XLSX Export */}
                    <Card
                      className={
                        evaluation.readyForXlsxExport
                          ? "border-green-500"
                          : "border-gray-300 opacity-60"
                      }
                    >
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="h-8 w-8 text-green-600" />
                          <div>
                            <div className="font-semibold">
                              Excel Spreadsheet
                            </div>
                            <div className="text-xs text-slate-600">
                              Tables & metrics
                            </div>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleExport("xlsx")}
                          disabled={!evaluation.readyForXlsxExport || exporting}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export XLSX
                        </Button>
                      </CardContent>
                    </Card>

                    {/* CSV Export */}
                    <Card
                      className={
                        evaluation.readyForCsvExport
                          ? "border-green-500"
                          : "border-gray-300 opacity-60"
                      }
                    >
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <Table2 className="h-8 w-8 text-blue-500" />
                          <div>
                            <div className="font-semibold">CSV File</div>
                            <div className="text-xs text-slate-600">
                              Simple table format
                            </div>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleExport("csv")}
                          disabled={!evaluation.readyForCsvExport || exporting}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export CSV
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Draw.io Export */}
                    <Card
                      className={
                        evaluation.readyForDrawIo
                          ? "border-green-500"
                          : "border-gray-300 opacity-60"
                      }
                    >
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <Workflow className="h-8 w-8 text-purple-500" />
                          <div>
                            <div className="font-semibold">Draw.io Diagram</div>
                            <div className="text-xs text-slate-600">
                              ERD visualization
                            </div>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleExport("drawio")}
                          disabled={!evaluation.readyForDrawIo || exporting}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export Draw.io
                        </Button>
                      </CardContent>
                    </Card>

                    {/* DBDiagram Export */}
                    <Card
                      className={
                        evaluation.readyForDbDiagram
                          ? "border-green-500"
                          : "border-gray-300 opacity-60"
                      }
                    >
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <FileCode className="h-8 w-8 text-amber-600" />
                          <div>
                            <div className="font-semibold">DBDiagram.io</div>
                            <div className="text-xs text-slate-600">
                              DBML format
                            </div>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleExport("dbdiagram")}
                          disabled={!evaluation.readyForDbDiagram || exporting}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export DBML
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Export All */}
                    <Card className="border-blue-500 bg-blue-50/50">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <Download className="h-8 w-8 text-blue-600" />
                          <div>
                            <div className="font-semibold">
                              Export All Formats
                            </div>
                            <div className="text-xs text-slate-600">
                              Complete package
                            </div>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={async () => {
                            for (const format of [
                              "pdf",
                              "xlsx",
                              "csv",
                              "drawio",
                              "dbdiagram",
                            ] as ExportFormat[]) {
                              await handleExport(format);
                              await new Promise((resolve) =>
                                setTimeout(resolve, 500),
                              );
                            }
                          }}
                          disabled={exporting}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export All
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Export Instructions */}
                  <Alert className="mt-6">
                    <AlertDescription>
                      <div className="font-semibold mb-2">
                        Export Instructions:
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>
                          <strong>PDF:</strong> Open in browser and use Print →
                          Save as PDF for final PDF format
                        </li>
                        <li>
                          <strong>XLSX:</strong> Open in Microsoft Excel or
                          Google Sheets
                        </li>
                        <li>
                          <strong>CSV:</strong> Import into any data analysis
                          tool
                        </li>
                        <li>
                          <strong>Draw.io:</strong> Upload to{" "}
                          <a
                            href="https://app.diagrams.net"
                            target="_blank"
                            className="text-blue-600 underline"
                          >
                            app.diagrams.net
                          </a>{" "}
                          to visualize ERD
                        </li>
                        <li>
                          <strong>DBML:</strong> Paste into{" "}
                          <a
                            href="https://dbdiagram.io"
                            target="_blank"
                            className="text-blue-600 underline"
                          >
                            dbdiagram.io
                          </a>{" "}
                          to generate database schema
                        </li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      )}
    </div>
  );
}
