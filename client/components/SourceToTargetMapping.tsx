import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import DataTable, { type ColumnDef } from "@/components/DataTable";
import {
  allSourceSystems,
  allFieldMappings,
  allDataLineage,
  type SourceSystem,
  type FieldMapping,
  type DataLineage,
  type SourceSchema,
  type SourceField,
} from "@/lib/source-to-target-mapping";
import {
  Database,
  ArrowRightLeft,
  Network,
  Code2,
  FileCode,
  Search,
  Filter,
  Download,
  Copy,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  FileJson,
  Table as TableIcon,
  Layers as LayersIcon,
  AlertCircle,
} from "lucide-react";

export default function SourceToTargetMapping() {
  const [selectedSystem, setSelectedSystem] = useState<SourceSystem | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<
    "systems" | "mappings" | "lineage" | "schemas" | "table"
  >("systems");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSourceSystem, setFilterSourceSystem] = useState<string>("all");
  const [filterTransformationType, setFilterTransformationType] =
    useState<string>("all");
  const [filterLayer, setFilterLayer] = useState<string>("all");
  const [showSQL, setShowSQL] = useState<{ [key: number]: boolean }>({});

  // Use all mappings and lineage from expanded framework
  const allMappings = allFieldMappings;
  const allLineage = allDataLineage;

  // Filter for featured source systems (all critical systems)
  const featuredSystems = allSourceSystems.filter(
    (s) => s.criticality === "CRITICAL",
  );

  // Get unique values for filters
  const uniqueSourceSystems = useMemo(() => {
    const systems = new Set(allMappings.map((m) => m.sourceSystem));
    return Array.from(systems);
  }, []);

  const uniqueTransformationTypes = useMemo(() => {
    const types = new Set(allMappings.map((m) => m.transformationType));
    return Array.from(types);
  }, []);

  // Filtered mappings
  const filteredMappings = useMemo(() => {
    return allMappings.filter((mapping) => {
      const matchesSearch =
        mapping.sourceField.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.bronzeField.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.silverField?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.goldField?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.businessDefinition
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesSourceSystem =
        filterSourceSystem === "all" ||
        mapping.sourceSystem === filterSourceSystem;
      const matchesTransformationType =
        filterTransformationType === "all" ||
        mapping.transformationType === filterTransformationType;

      let matchesLayer = true;
      if (filterLayer === "bronze") matchesLayer = !!mapping.bronzeTable;
      if (filterLayer === "silver") matchesLayer = !!mapping.silverTable;
      if (filterLayer === "gold") matchesLayer = !!mapping.goldTable;

      return (
        matchesSearch &&
        matchesSourceSystem &&
        matchesTransformationType &&
        matchesLayer
      );
    });
  }, [
    allMappings,
    searchTerm,
    filterSourceSystem,
    filterTransformationType,
    filterLayer,
  ]);

  // Filtered lineage
  const filteredLineage = useMemo(() => {
    return allLineage.filter((lineage) => {
      const matchesSearch =
        lineage.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lineage.domainId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lineage.sourceSystem.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSourceSystem =
        filterSourceSystem === "all" ||
        lineage.sourceSystem === filterSourceSystem;

      return matchesSearch && matchesSourceSystem;
    });
  }, [allLineage, searchTerm, filterSourceSystem]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportMappings = () => {
    if (viewMode === "table") {
      // Export as CSV for table view
      const headers = [
        "Source System",
        "Source Schema",
        "Source Field",
        "Source Data Type",
        "Bronze Table",
        "Bronze Column",
        "Bronze Data Type",
        "Silver Table",
        "Silver Column",
        "Silver Data Type",
        "Gold Table",
        "Gold Column",
        "Gold Data Type",
        "Transformation Type",
        "Business Definition",
        "Data Quality Rules",
      ];

      const rows = filteredMappings.map((m) => [
        m.sourceSystem,
        m.sourceSchema,
        m.sourceField,
        m.sourceDataType,
        m.bronzeTable,
        m.bronzeField,
        m.bronzeDataType,
        m.silverTable || "",
        m.silverField || "",
        m.silverDataType || "",
        m.goldTable || "",
        m.goldField || "",
        m.goldDataType || "",
        m.transformationType,
        m.businessDefinition,
        m.dataQualityRules?.join("; ") || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const dataUri =
        "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
      const exportFileDefaultName = "source-to-target-mappings.csv";
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } else {
      // Export as JSON for other views
      const dataStr = JSON.stringify(filteredMappings, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = "source-to-target-mappings.json";
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    }
  };

  const sourceSystemColumns: ColumnDef<SourceSystem>[] = [
    {
      header: "Source System",
      accessor: (row) => (
        <div>
          <div className="font-semibold flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            {row.sourceSystemName}
          </div>
          <div className="text-xs text-muted-foreground">
            Code: <span className="font-mono">{row.sourceSystemCode}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Vendor & Product",
      accessor: (row) => (
        <div>
          <div className="font-medium">{row.vendor}</div>
          <div className="text-xs text-muted-foreground">
            {row.productName} v{row.version}
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (row) => (
        <Badge variant="outline" className="text-xs">
          {row.systemType.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      header: "Integration",
      accessor: (row) => (
        <div>
          <Badge className="text-xs">{row.integrationType}</Badge>
          <div className="text-xs text-muted-foreground mt-1">
            {row.dataFormat}
          </div>
        </div>
      ),
    },
    {
      header: "Domains",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.domains.slice(0, 3).map((d) => (
            <Badge key={d} variant="secondary" className="text-xs">
              {d}
            </Badge>
          ))}
          {row.domains.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{row.domains.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Schemas",
      accessor: (row) => (
        <div className="text-center">
          <div className="text-lg font-bold">
            {row.sourceSchemas?.length || 0}
          </div>
          <div className="text-xs text-muted-foreground">documented</div>
        </div>
      ),
    },
    {
      header: "Criticality",
      accessor: (row) => (
        <Badge
          className={
            row.criticality === "CRITICAL"
              ? "bg-red-100 text-red-800"
              : row.criticality === "HIGH"
                ? "bg-orange-100 text-orange-800"
                : "bg-blue-100 text-blue-800"
          }
        >
          {row.criticality}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedSystem(row);
            setViewMode("schemas");
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">
            Source-to-Target Mapping Framework
          </h2>
          <p className="text-muted-foreground mt-1">
            Column-level mappings, transformations, and data lineage from source
            systems to gold layer
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={viewMode === "systems" ? "default" : "outline"}
            onClick={() => setViewMode("systems")}
          >
            <Database className="h-4 w-4 mr-2" />
            Source Systems
          </Button>
          <Button
            variant={viewMode === "schemas" ? "default" : "outline"}
            onClick={() => setViewMode("schemas")}
          >
            <TableIcon className="h-4 w-4 mr-2" />
            Source Schemas
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-4 w-4 mr-2" />
            Mapping Table
          </Button>
          <Button
            variant={viewMode === "mappings" ? "default" : "outline"}
            onClick={() => setViewMode("mappings")}
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Field Mappings
          </Button>
          <Button
            variant={viewMode === "lineage" ? "default" : "outline"}
            onClick={() => setViewMode("lineage")}
          >
            <Network className="h-4 w-4 mr-2" />
            Data Lineage
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Source Systems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allSourceSystems.length}</div>
            <p className="text-xs text-muted-foreground">Documented systems</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Field Mappings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allMappings.length}</div>
            <p className="text-xs text-muted-foreground">
              Column-level mappings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lineage Paths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allLineage.length}</div>
            <p className="text-xs text-muted-foreground">
              Certified lineage flows
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Featured Systems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {featuredSystems.length}
            </div>
            <p className="text-xs text-muted-foreground">FIS, FICO, Experian</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      {(viewMode === "mappings" ||
        viewMode === "lineage" ||
        viewMode === "table") && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search fields, tables, transformations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={filterSourceSystem}
                  onChange={(e) => setFilterSourceSystem(e.target.value)}
                >
                  <option value="all">All Source Systems</option>
                  {uniqueSourceSystems.map((system) => (
                    <option key={system} value={system}>
                      {system}
                    </option>
                  ))}
                </select>
              </div>
              {(viewMode === "mappings" || viewMode === "table") && (
                <>
                  <div>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={filterTransformationType}
                      onChange={(e) =>
                        setFilterTransformationType(e.target.value)
                      }
                    >
                      <option value="all">All Transform Types</option>
                      {uniqueTransformationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={filterLayer}
                      onChange={(e) => setFilterLayer(e.target.value)}
                    >
                      <option value="all">All Layers</option>
                      <option value="bronze">Bronze Layer</option>
                      <option value="silver">Silver Layer</option>
                      <option value="gold">Gold Layer</option>
                    </select>
                  </div>
                </>
              )}
              {(viewMode === "mappings" || viewMode === "table") && (
                <div className="md:col-span-5 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredMappings.length} of {allMappings.length}{" "}
                    mappings
                  </div>
                  <Button variant="outline" size="sm" onClick={exportMappings}>
                    <Download className="h-4 w-4 mr-2" />
                    {viewMode === "table" ? "Export CSV" : "Export JSON"}
                  </Button>
                </div>
              )}
              {viewMode === "lineage" && (
                <div className="md:col-span-5">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredLineage.length} of {allLineage.length}{" "}
                    lineage paths
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mapping Table View */}
      {viewMode === "table" && (
        <Card>
          <CardHeader>
            <CardTitle>Source-to-Target Mapping Table</CardTitle>
            <CardDescription>
              Comprehensive tabular view of all column-level mappings from
              source to bronze, silver, and gold layers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 border-b-2 border-slate-300">
                    <tr>
                      <th
                        className="text-left p-3 font-semibold border-r border-slate-300"
                        colSpan={3}
                      >
                        Source
                      </th>
                      <th
                        className="text-left p-3 font-semibold bg-amber-50 border-r border-slate-300"
                        colSpan={2}
                      >
                        Bronze Layer
                      </th>
                      <th
                        className="text-left p-3 font-semibold bg-blue-50 border-r border-slate-300"
                        colSpan={2}
                      >
                        Silver Layer
                      </th>
                      <th
                        className="text-left p-3 font-semibold bg-green-50 border-r border-slate-300"
                        colSpan={2}
                      >
                        Gold Layer
                      </th>
                      <th className="text-left p-3 font-semibold" colSpan={2}>
                        Transformation
                      </th>
                    </tr>
                    <tr className="bg-slate-50 border-b">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground border-r">
                        System
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground border-r">
                        Schema
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground border-r">
                        Field
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-amber-800 border-r">
                        Table
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-amber-800 border-r">
                        Column
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-blue-800 border-r">
                        Table
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-blue-800 border-r">
                        Column
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-green-800 border-r">
                        Table
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-green-800 border-r">
                        Column
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground border-r">
                        Type
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">
                        Business Definition
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMappings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={11}
                          className="p-8 text-center text-muted-foreground"
                        >
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <div>No mappings found matching your filters</div>
                        </td>
                      </tr>
                    ) : (
                      filteredMappings.map((mapping, idx) => (
                        <tr
                          key={idx}
                          className="border-b hover:bg-slate-50 transition-colors"
                        >
                          {/* Source System */}
                          <td className="p-3 border-r align-top">
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              {mapping.sourceSystem}
                            </Badge>
                          </td>
                          {/* Source Schema */}
                          <td className="p-3 border-r align-top">
                            <div className="font-mono text-xs text-muted-foreground">
                              {mapping.sourceSchema}
                            </div>
                          </td>
                          {/* Source Field */}
                          <td className="p-3 border-r align-top">
                            <div className="font-semibold font-mono text-xs">
                              {mapping.sourceField}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {mapping.sourceDataType}
                            </div>
                          </td>
                          {/* Bronze Table */}
                          <td className="p-3 bg-amber-50/50 border-r align-top">
                            <div className="font-mono text-xs text-amber-900">
                              {mapping.bronzeTable}
                            </div>
                          </td>
                          {/* Bronze Column */}
                          <td className="p-3 bg-amber-50/50 border-r align-top">
                            <div className="font-semibold font-mono text-xs text-amber-900">
                              {mapping.bronzeField}
                            </div>
                            <div className="text-xs text-amber-700 mt-1">
                              {mapping.bronzeDataType}
                            </div>
                          </td>
                          {/* Silver Table */}
                          <td className="p-3 bg-blue-50/50 border-r align-top">
                            <div className="font-mono text-xs text-blue-900">
                              {mapping.silverTable || (
                                <span className="text-muted-foreground italic">
                                  N/A
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Silver Column */}
                          <td className="p-3 bg-blue-50/50 border-r align-top">
                            <div className="font-semibold font-mono text-xs text-blue-900">
                              {mapping.silverField || (
                                <span className="text-muted-foreground italic">
                                  N/A
                                </span>
                              )}
                            </div>
                            {mapping.silverDataType && (
                              <div className="text-xs text-blue-700 mt-1">
                                {mapping.silverDataType}
                              </div>
                            )}
                          </td>
                          {/* Gold Table */}
                          <td className="p-3 bg-green-50/50 border-r align-top">
                            <div className="font-mono text-xs text-green-900">
                              {mapping.goldTable || (
                                <span className="text-muted-foreground italic">
                                  N/A
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Gold Column */}
                          <td className="p-3 bg-green-50/50 border-r align-top">
                            <div className="font-semibold font-mono text-xs text-green-900">
                              {mapping.goldField || (
                                <span className="text-muted-foreground italic">
                                  N/A
                                </span>
                              )}
                            </div>
                            {mapping.goldDataType && (
                              <div className="text-xs text-green-700 mt-1">
                                {mapping.goldDataType}
                              </div>
                            )}
                          </td>
                          {/* Transformation Type */}
                          <td className="p-3 border-r align-top">
                            <Badge
                              variant="secondary"
                              className="text-xs whitespace-nowrap"
                            >
                              {mapping.transformationType}
                            </Badge>
                          </td>
                          {/* Business Definition */}
                          <td className="p-3 align-top max-w-xs">
                            <div className="text-xs text-muted-foreground line-clamp-3">
                              {mapping.businessDefinition}
                            </div>
                            {mapping.dataQualityRules &&
                              mapping.dataQualityRules.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-semibold text-slate-700 mb-1">
                                    Rules:
                                  </div>
                                  <ul className="text-xs text-muted-foreground space-y-1">
                                    {mapping.dataQualityRules
                                      .slice(0, 2)
                                      .map((rule, rIdx) => (
                                        <li
                                          key={rIdx}
                                          className="flex items-start gap-1"
                                        >
                                          <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                          <span>{rule}</span>
                                        </li>
                                      ))}
                                    {mapping.dataQualityRules.length > 2 && (
                                      <li className="text-xs text-muted-foreground">
                                        +{mapping.dataQualityRules.length - 2}{" "}
                                        more rules
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Summary */}
            {filteredMappings.length > 0 && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Mappings</div>
                    <div className="text-xl font-bold">
                      {filteredMappings.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Source Systems</div>
                    <div className="text-xl font-bold">
                      {
                        new Set(filteredMappings.map((m) => m.sourceSystem))
                          .size
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      Transformation Types
                    </div>
                    <div className="text-xl font-bold">
                      {
                        new Set(
                          filteredMappings.map((m) => m.transformationType),
                        ).size
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportMappings}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border">
              <div className="font-semibold text-sm mb-3">Layer Legend</div>
              <div className="grid md:grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-200 border border-slate-400 rounded"></div>
                  <span>
                    <strong>Source:</strong> Original system data
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-200 border border-amber-400 rounded"></div>
                  <span>
                    <strong>Bronze:</strong> Raw ingestion (minimal
                    transformation)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-200 border border-blue-400 rounded"></div>
                  <span>
                    <strong>Silver:</strong> Cleansed & conformed (SCD Type 2)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-200 border border-green-400 rounded"></div>
                  <span>
                    <strong>Gold:</strong> Business-ready analytics layer
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Source Systems View */}
      {viewMode === "systems" && (
        <Card>
          <CardHeader>
            <CardTitle>Source System Registry</CardTitle>
            <CardDescription>
              Comprehensive catalog of source systems with connection details,
              SLAs, and metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={sourceSystemColumns} data={featuredSystems} />
          </CardContent>
        </Card>
      )}

      {/* Source Schemas View */}
      {viewMode === "schemas" && (
        <div className="space-y-6">
          {/* System Selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Select Source System
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={selectedSystem?.sourceSystemId || ""}
                    onChange={(e) => {
                      const system = featuredSystems.find(
                        (s) => s.sourceSystemId === e.target.value,
                      );
                      setSelectedSystem(system || null);
                    }}
                  >
                    <option value="">Choose a system...</option>
                    {featuredSystems.map((system) => (
                      <option
                        key={system.sourceSystemId}
                        value={system.sourceSystemId}
                      >
                        {system.sourceSystemName} ({system.sourceSystemCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedSystem && (
            <>
              {/* System Details */}
              <Card className="border-2 border-primary">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-50">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    {selectedSystem.sourceSystemName}
                  </CardTitle>
                  <CardDescription>
                    {selectedSystem.vendor} • {selectedSystem.productName} v
                    {selectedSystem.version}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm font-semibold mb-2">
                        Integration
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <Badge>{selectedSystem.integrationType}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Format:</span>
                          <span className="font-mono text-xs">
                            {selectedSystem.dataFormat}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Frequency:
                          </span>
                          <span className="text-xs">
                            {selectedSystem.refreshFrequency}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-2">
                        Connection
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Protocol:
                          </span>
                          <span className="font-mono text-xs">
                            {selectedSystem.connectionDetails.protocol}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Host:</span>
                          <span className="font-mono text-xs">
                            {selectedSystem.connectionDetails.host}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Auth:</span>
                          <span className="text-xs">
                            {selectedSystem.connectionDetails.authMethod}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-2">
                        SLA & Performance
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Availability:
                          </span>
                          <span className="text-xs">
                            {selectedSystem.sla.availability}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Latency:
                          </span>
                          <span className="text-xs">
                            {selectedSystem.sla.latency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Volume:</span>
                          <span className="text-xs">
                            {selectedSystem.avgDailyVolume}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Source Schemas */}
              {selectedSystem.sourceSchemas &&
                selectedSystem.sourceSchemas.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TableIcon className="h-5 w-5" />
                        Source Schemas ({selectedSystem.sourceSchemas.length})
                      </CardTitle>
                      <CardDescription>
                        Detailed field-level documentation for each source
                        table, file, or API endpoint
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {selectedSystem.sourceSchemas.map(
                          (schema, schemaIdx) => (
                            <AccordionItem
                              key={schemaIdx}
                              value={`schema-${schemaIdx}`}
                            >
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <div className="text-left">
                                    <div className="font-semibold">
                                      {schema.schemaName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {schema.description}
                                    </div>
                                  </div>
                                  <Badge variant="secondary">
                                    {schema.fields.length} fields
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-4">
                                  {/* Schema Metadata */}
                                  <div className="bg-slate-50 p-4 rounded border space-y-2 text-sm">
                                    {schema.tableName && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Table:
                                        </span>
                                        <span className="font-mono">
                                          {schema.tableName}
                                        </span>
                                      </div>
                                    )}
                                    {schema.fileName && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          File:
                                        </span>
                                        <span className="font-mono">
                                          {schema.fileName}
                                        </span>
                                      </div>
                                    )}
                                    {schema.apiEndpoint && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Endpoint:
                                        </span>
                                        <span className="font-mono text-xs">
                                          {schema.apiEndpoint}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Primary Key:
                                      </span>
                                      <span className="font-mono text-xs">
                                        {schema.primaryKey.join(", ")}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Fields Table */}
                                  <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                      <thead className="bg-slate-50 border-b">
                                        <tr>
                                          <th className="text-left p-3 font-semibold">
                                            Field Name
                                          </th>
                                          <th className="text-left p-3 font-semibold">
                                            Data Type
                                          </th>
                                          <th className="text-left p-3 font-semibold">
                                            Description
                                          </th>
                                          <th className="text-center p-3 font-semibold">
                                            Flags
                                          </th>
                                          <th className="text-left p-3 font-semibold">
                                            Validation Rules
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {schema.fields.map(
                                          (field, fieldIdx) => (
                                            <tr
                                              key={fieldIdx}
                                              className="border-b hover:bg-slate-50"
                                            >
                                              <td className="p-3">
                                                <div className="font-mono text-xs font-semibold">
                                                  {field.sourceFieldName}
                                                </div>
                                                {field.sampleValues &&
                                                  field.sampleValues.length >
                                                    0 && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                      e.g.,{" "}
                                                      {field.sampleValues[0]}
                                                    </div>
                                                  )}
                                              </td>
                                              <td className="p-3">
                                                <Badge
                                                  variant="outline"
                                                  className="text-xs font-mono"
                                                >
                                                  {field.dataType}
                                                  {field.length &&
                                                    `(${field.length})`}
                                                  {field.precision &&
                                                    field.scale &&
                                                    `(${field.precision},${field.scale})`}
                                                </Badge>
                                                {!field.nullable && (
                                                  <div className="text-xs text-red-600 mt-1">
                                                    NOT NULL
                                                  </div>
                                                )}
                                              </td>
                                              <td className="p-3 max-w-xs">
                                                <div className="text-xs">
                                                  {field.description}
                                                </div>
                                              </td>
                                              <td className="p-3">
                                                <div className="flex flex-col gap-1 items-center">
                                                  {field.piiFlag && (
                                                    <Badge className="bg-red-100 text-red-800 text-xs">
                                                      <Lock className="h-3 w-3 mr-1" />
                                                      PII
                                                    </Badge>
                                                  )}
                                                  {field.encryptionRequired && (
                                                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                                                      <Lock className="h-3 w-3 mr-1" />
                                                      Encrypt
                                                    </Badge>
                                                  )}
                                                </div>
                                              </td>
                                              <td className="p-3">
                                                {field.validationRules &&
                                                field.validationRules.length >
                                                  0 ? (
                                                  <ul className="text-xs space-y-1">
                                                    {field.validationRules
                                                      .slice(0, 3)
                                                      .map((rule, ruleIdx) => (
                                                        <li
                                                          key={ruleIdx}
                                                          className="text-muted-foreground"
                                                        >
                                                          • {rule}
                                                        </li>
                                                      ))}
                                                    {field.validationRules
                                                      .length > 3 && (
                                                      <li className="text-muted-foreground">
                                                        +
                                                        {field.validationRules
                                                          .length - 3}{" "}
                                                        more
                                                      </li>
                                                    )}
                                                  </ul>
                                                ) : (
                                                  <span className="text-xs text-muted-foreground">
                                                    None
                                                  </span>
                                                )}
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ),
                        )}
                      </Accordion>
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </div>
      )}

      {/* Field Mappings View */}
      {viewMode === "mappings" && (
        <div className="space-y-4">
          {filteredMappings.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-lg font-semibold">No mappings found</div>
                <div className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filter criteria
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredMappings.map((mapping, idx) => (
              <Card key={idx} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header with Field Path */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <Badge variant="outline" className="font-mono">
                          {mapping.sourceSystem}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-lg">
                          {mapping.sourceField}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge className="bg-amber-100 text-amber-800">
                          Bronze
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge className="bg-blue-100 text-blue-800">
                          Silver
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge className="bg-green-100 text-green-800">
                          Gold
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setShowSQL((prev) => ({ ...prev, [idx]: !prev[idx] }))
                        }
                      >
                        {showSQL[idx] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="ml-2">
                          {showSQL[idx] ? "Hide" : "Show"} SQL
                        </span>
                      </Button>
                    </div>

                    {/* Transformation Type & Business Definition */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-semibold mb-2">
                          Transformation Type
                        </div>
                        <Badge variant="secondary" className="text-sm">
                          {mapping.transformationType}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm font-semibold mb-2">
                          Business Definition
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {mapping.businessDefinition}
                        </p>
                      </div>
                    </div>

                    {/* Layer Details */}
                    <div className="grid md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-amber-50 p-4 rounded border space-y-2">
                        <div className="font-semibold text-amber-800 flex items-center gap-2">
                          <LayersIcon className="h-4 w-4" />
                          Bronze Layer
                        </div>
                        <div className="font-mono text-xs">
                          {mapping.bronzeTable}
                        </div>
                        <div className="text-muted-foreground font-mono">
                          {mapping.bronzeField}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {mapping.bronzeDataType}
                        </Badge>
                      </div>
                      <div className="bg-blue-50 p-4 rounded border space-y-2">
                        <div className="font-semibold text-blue-800 flex items-center gap-2">
                          <LayersIcon className="h-4 w-4" />
                          Silver Layer
                        </div>
                        <div className="font-mono text-xs">
                          {mapping.silverTable || "N/A"}
                        </div>
                        <div className="text-muted-foreground font-mono">
                          {mapping.silverField || "N/A"}
                        </div>
                        {mapping.silverDataType && (
                          <Badge variant="outline" className="text-xs">
                            {mapping.silverDataType}
                          </Badge>
                        )}
                      </div>
                      <div className="bg-green-50 p-4 rounded border space-y-2">
                        <div className="font-semibold text-green-800 flex items-center gap-2">
                          <LayersIcon className="h-4 w-4" />
                          Gold Layer
                        </div>
                        <div className="font-mono text-xs">
                          {mapping.goldTable || "N/A"}
                        </div>
                        <div className="text-muted-foreground font-mono">
                          {mapping.goldField || "N/A"}
                        </div>
                        {mapping.goldDataType && (
                          <Badge variant="outline" className="text-xs">
                            {mapping.goldDataType}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Transformation Logic */}
                    <div>
                      <div className="text-sm font-semibold mb-2">
                        Transformation Logic
                      </div>
                      <p className="text-sm text-muted-foreground bg-slate-50 p-3 rounded border">
                        {mapping.transformationLogic}
                      </p>
                    </div>

                    {/* SQL Code (Collapsible) */}
                    {showSQL[idx] && mapping.transformationSQL && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold flex items-center gap-2">
                            <Code2 className="h-4 w-4" />
                            Transformation SQL
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(mapping.transformationSQL || "")
                            }
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded text-xs overflow-x-auto font-mono">
                          {mapping.transformationSQL}
                        </pre>
                      </div>
                    )}

                    {/* Data Quality Rules */}
                    {mapping.dataQualityRules &&
                      mapping.dataQualityRules.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold mb-2">
                            Data Quality Rules
                          </div>
                          <div className="bg-blue-50 p-3 rounded border">
                            <ul className="text-xs space-y-1">
                              {mapping.dataQualityRules.map((rule, ruleIdx) => (
                                <li
                                  key={ruleIdx}
                                  className="flex items-center gap-2"
                                >
                                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                                  <span>{rule}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                    {/* Sample Transformations */}
                    {mapping.sampleTransformation &&
                      mapping.sampleTransformation.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold mb-2">
                            Sample Transformations
                          </div>
                          <div className="bg-slate-50 p-3 rounded border space-y-2">
                            {mapping.sampleTransformation.map(
                              (sample, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="flex items-center gap-3 text-sm font-mono"
                                >
                                  <div className="flex-1 bg-blue-100 text-blue-800 px-3 py-2 rounded">
                                    {sample.sourceValue}
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <div className="flex-1 bg-green-100 text-green-800 px-3 py-2 rounded">
                                    {sample.targetValue}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Data Lineage View */}
      {viewMode === "lineage" && (
        <div className="space-y-4">
          {filteredLineage.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-lg font-semibold">
                  No lineage paths found
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filter criteria
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredLineage.map((lineage, idx) => (
              <Card key={idx} className="border-l-4 border-l-green-500">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg flex items-center gap-2">
                          <Network className="h-5 w-5 text-primary" />
                          {lineage.entity}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Domain:{" "}
                          <Badge variant="outline">{lineage.domainId}</Badge>
                        </div>
                      </div>
                      {lineage.certifiedFlag && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Certified
                        </Badge>
                      )}
                    </div>

                    {/* Visual Lineage Flow */}
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-lg border-2">
                      <div className="flex items-center gap-4 flex-wrap justify-between">
                        {/* Source */}
                        <div className="flex items-center gap-3 bg-white p-4 rounded-lg border-2 border-purple-200 shadow-sm">
                          <Database className="h-6 w-6 text-purple-600" />
                          <div>
                            <div className="text-xs text-purple-600 font-semibold">
                              SOURCE
                            </div>
                            <div className="font-mono text-sm font-bold">
                              {lineage.sourceSystem}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {lineage.sourceSchema}.{lineage.sourceField}
                            </div>
                          </div>
                        </div>

                        <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />

                        {/* Bronze */}
                        <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-lg border-2 border-amber-200 shadow-sm">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <div>
                            <div className="text-xs text-amber-800 font-semibold">
                              BRONZE
                            </div>
                            <div className="font-mono text-sm">
                              {lineage.bronzeTable}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {lineage.bronzeField}
                            </div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {lineage.bronzeLoadType}
                            </Badge>
                          </div>
                        </div>

                        <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />

                        {/* Silver */}
                        <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg border-2 border-blue-200 shadow-sm">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <div>
                            <div className="text-xs text-blue-800 font-semibold">
                              SILVER
                            </div>
                            <div className="font-mono text-sm">
                              {lineage.silverTable}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {lineage.silverField}
                            </div>
                          </div>
                        </div>

                        <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />

                        {/* Gold */}
                        <div className="flex items-center gap-3 bg-green-50 p-4 rounded-lg border-2 border-green-200 shadow-sm">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div>
                            <div className="text-xs text-green-800 font-semibold">
                              GOLD
                            </div>
                            <div className="font-mono text-sm">
                              {lineage.goldTable}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {lineage.goldField}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transformation Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded border">
                        <div className="font-semibold text-sm mb-2 text-blue-800">
                          Bronze → Silver Transformation
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {lineage.silverTransformation}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded border">
                        <div className="font-semibold text-sm mb-2 text-green-800">
                          Silver → Gold Transformation
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {lineage.goldAggregation}
                        </p>
                      </div>
                    </div>

                    {/* Full Lineage Path */}
                    <div className="bg-slate-900 text-slate-100 p-4 rounded">
                      <div className="text-xs font-semibold mb-2 text-green-400">
                        Complete Lineage Path
                      </div>
                      <div className="text-sm font-mono">
                        {lineage.dataLineagePath}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex gap-4">
                        <div>
                          Load Type:{" "}
                          <Badge variant="outline" className="text-xs ml-1">
                            {lineage.bronzeLoadType}
                          </Badge>
                        </div>
                        <div>
                          Last Updated:{" "}
                          <span className="font-semibold">
                            {lineage.lastUpdated}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(lineage.dataLineagePath)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Path
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Featured Systems Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-blue-600" />
            Featured Source Systems
          </CardTitle>
          <CardDescription>
            Detailed implementation for FIS ACH Tracker, FICO Fraud Detection,
            and Experian Credit Bureau
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {featuredSystems.map((system) => (
              <Card
                key={system.sourceSystemId}
                className="border-2 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedSystem(system);
                  setViewMode("schemas");
                }}
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <Badge className="mb-2">{system.sourceSystemCode}</Badge>
                      <div className="font-semibold">
                        {system.sourceSystemName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {system.vendor}
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Integration:
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {system.integrationType}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Format:</span>
                        <span className="font-mono">{system.dataFormat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Schemas:</span>
                        <span className="font-semibold">
                          {system.sourceSchemas?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Domains:</span>
                        <span className="font-semibold">
                          {system.domains.length}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground">SLA</div>
                      <div className="text-xs font-semibold">
                        {system.sla.availability}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {system.sla.latency}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
