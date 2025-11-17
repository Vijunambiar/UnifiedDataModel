import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPilotDomainById, getPilotDomainBronzeTablesAsync, getPilotDomainSilverTablesAsync, getPilotDomainGoldTablesAsync } from "@/lib/domains/registry";
import { ArrowLeft, Database, Copy, GitBranch, Link2, ArrowRight, Zap, Filter, Package, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { customerERDComplete } from "@/lib/domains/customer/erd-relationships";
import { depositsERDComplete } from "@/lib/domains/deposits/erd-relationships";
import { transactionsERDComplete } from "@/lib/domains/transactions/erd-relationships";
import { TableDDLViewer } from "@/components/TableDDLViewer";
import { DataQualityScriptsView } from "@/components/DataQualityScripts";
import { GoldLayerAggregationsView } from "@/components/GoldLayerAggregations";

// Get ERD data based on domain
const getERDData = (domainId: string) => {
  if (domainId === "customer") {
    return customerERDComplete;
  } else if (domainId === "deposits") {
    return depositsERDComplete;
  } else if (domainId === "transactions") {
    return transactionsERDComplete;
  }
  return null;
};

const getLayerStructure = (domain: any) => {
  const bronze = domain?.bronzeTables || [];
  const silver = domain?.silverTables || [];
  const goldDimensions = domain?.goldDimensions || [];
  const goldFacts = domain?.goldFacts || [];
  const goldTables = [...goldDimensions, ...goldFacts];

  return [
    {
      name: "Bronze Layer",
      description: "Raw data ingestion from source systems",
      color: "bg-amber-50 border-amber-200",
      icon: Database,
      tables: bronze,
      count: bronze.length,
    },
    {
      name: "Silver Layer",
      description: "Cleaned, deduplicated, and conformed data",
      color: "bg-slate-50 border-slate-200",
      icon: Database,
      tables: silver || [],
      count: silver.length,
    },
    {
      name: "Gold Layer",
      description: "Business-ready dimensional model for analytics",
      color: "bg-yellow-50 border-yellow-200",
      icon: Database,
      tables: goldTables,
      count: goldTables.length,
    },
  ];
};

export default function PlatformBlueprintDomainDataModels() {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const basicDomain = getPilotDomainById(domainId || "");
  const [domain, setDomain] = useState(basicDomain);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTableData = async () => {
      if (!domainId || !basicDomain) return;

      try {
        setIsLoading(true);
        const [bronze, silver, gold] = await Promise.all([
          getPilotDomainBronzeTablesAsync(domainId),
          getPilotDomainSilverTablesAsync(domainId),
          getPilotDomainGoldTablesAsync(domainId),
        ]);

        setDomain({
          ...basicDomain,
          bronzeTables: bronze,
          silverTables: silver,
          goldFacts: gold,
          goldDimensions: [],
        });
      } catch (error) {
        console.error("Error loading table data:", error);
        setDomain(basicDomain);
      } finally {
        setIsLoading(false);
      }
    };

    loadTableData();
  }, [domainId, basicDomain]);

  if (!domain) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground mb-4">
          Domain not found
        </p>
        <Button onClick={() => navigate("/platform-blueprint/domains")}>
          Back to Domains
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading data model...</p>
        </div>
      </div>
    );
  }

  const erdData = getERDData(domainId || "");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/platform-blueprint/domain/${domainId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold">Data Models</h1>
          <p className="text-muted-foreground mt-1">
            3-Layer Architecture for {domain.displayName}
          </p>
        </div>
      </div>

      {/* Architecture Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Data Architecture Stack</CardTitle>
          <CardDescription>
            Bronze → Silver → Gold layers with quality gates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Medallion Architecture:</strong> A three-layer approach
                to progressively refine and enhance data quality.
              </p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Tool Stack:</span>
              <div className="flex gap-2">
                <Badge variant="outline">FIS Source</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layer Details */}
      <div className="space-y-6">
        {getLayerStructure(domain).map((layer, idx) => {
          const IconComponent = layer.icon;
          return (
            <Card key={`layer-${idx}`} className={`border-2 ${layer.color}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg">
                      <IconComponent className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <CardTitle>{layer.name}</CardTitle>
                      <CardDescription>{layer.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">{layer.count} total</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <TableDDLViewer tables={layer.tables} layerName={layer.name} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Lineage & Transformations */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Data Lineage & Transformations</CardTitle>
          <CardDescription>
            End-to-end data flow and transformation pipeline through the medallion architecture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Transformation Pipeline Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Bronze Stage */}
              <div className="relative">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-amber-700" />
                    </div>
                    <h3 className="font-semibold text-amber-900">Bronze Layer</h3>
                  </div>
                  <p className="text-sm text-amber-800 mb-4">Raw data ingestion</p>
                  <ul className="text-xs text-amber-700 space-y-2">
                    <li>✓ Source system data</li>
                    <li>✓ Minimal cleaning</li>
                    <li>✓ Load as-is pattern</li>
                    <li>✓ Daily refresh</li>
                  </ul>
                </div>
                <div className="absolute -right-2 top-1/2 transform translate-x-full -translate-y-1/2 z-10 hidden md:block">
                  <ArrowRight className="h-6 w-6 text-slate-400" />
                </div>
              </div>

              {/* Silver Stage */}
              <div className="relative">
                <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <Filter className="h-5 w-5 text-slate-700" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Silver Layer</h3>
                  </div>
                  <p className="text-sm text-slate-700 mb-4">Cleaned & conformed</p>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li>✓ Deduplication</li>
                    <li>✓ Business logic</li>
                    <li>✓ SCD Type 2</li>
                    <li>✓ Data quality rules</li>
                  </ul>
                </div>
                <div className="absolute -right-2 top-1/2 transform translate-x-full -translate-y-1/2 z-10 hidden md:block">
                  <ArrowRight className="h-6 w-6 text-slate-400" />
                </div>
              </div>

              {/* Gold Stage */}
              <div className="relative">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Zap className="h-5 w-5 text-yellow-700" />
                    </div>
                    <h3 className="font-semibold text-yellow-900">Gold Layer</h3>
                  </div>
                  <p className="text-sm text-yellow-800 mb-4">Analytics ready</p>
                  <ul className="text-xs text-yellow-700 space-y-2">
                    <li>✓ Denormalized facts</li>
                    <li>✓ Pre-aggregated metrics</li>
                    <li>✓ Dimension tables</li>
                    <li>✓ Business semantics</li>
                  </ul>
                </div>
              </div>

              {/* Semantic Layer */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Database className="h-5 w-5 text-blue-700" />
                  </div>
                  <h3 className="font-semibold text-blue-900">Semantic Layer</h3>
                </div>
                <p className="text-sm text-blue-800 mb-4">Business metrics</p>
                <ul className="text-xs text-blue-700 space-y-2">
                  <li>✓ Business metrics</li>
                  <li>✓ KPI definitions</li>
                  <li>✓ Metric catalog</li>
                  <li>✓ BI ready</li>
                </ul>
              </div>
            </div>

            {/* Transformation Details */}
            <div className="border-t border-slate-200 pt-6">
              <h4 className="font-semibold mb-4 text-slate-900">Transformation Steps</h4>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-amber-50 to-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 text-amber-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">1</div>
                    <div>
                      <p className="font-semibold text-slate-900">Bronze → Silver: Data Refinement</p>
                      <p className="text-sm text-slate-600 mt-1">Standardize column names, handle NULL values, apply business rules, generate surrogate keys, implement SCD Type 2 tracking</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-50 to-yellow-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 text-slate-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">2</div>
                    <div>
                      <p className="font-semibold text-slate-900">Silver → Gold: Aggregation & Denormalization</p>
                      <p className="text-sm text-slate-600 mt-1">Join dimension tables, pre-calculate metrics, create aggregate tables, optimize for query performance, generate business semantics</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-blue-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 text-yellow-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">3</div>
                    <div>
                      <p className="font-semibold text-slate-900">Gold → Semantic: Metric Definition</p>
                      <p className="text-sm text-slate-600 mt-1">Define business metrics with formulas, create KPI definitions, document metric lineage, expose via semantic layer for BI tools</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Quality Gates */}
            <div className="border-t border-slate-200 pt-6">
              <h4 className="font-semibold mb-4 text-slate-900">Data Quality Gates</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="font-semibold text-orange-900 mb-2 text-sm">Bronze Gate</p>
                  <ul className="text-xs text-orange-800 space-y-1">
                    <li>✓ Record count validation</li>
                    <li>✓ Load success check</li>
                    <li>✓ Source data completeness</li>
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-blue-900 mb-2 text-sm">Silver Gate</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>✓ Deduplication validation</li>
                    <li>✓ Business rule compliance</li>
                    <li>✓ Reference integrity</li>
                  </ul>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-900 mb-2 text-sm">Gold Gate</p>
                  <ul className="text-xs text-green-800 space-y-1">
                    <li>✓ Aggregation accuracy</li>
                    <li>✓ Metric formula validation</li>
                    <li>✓ Reconciliation checks</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logical Data Model */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Logical Data Model</CardTitle>
          <CardDescription>
            Entity relationships and business concepts (Crow's Foot notation)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto bg-gray-50 p-6 rounded-lg">
            <svg viewBox="0 0 1200 400" className="min-w-full" style={{ height: "auto" }}>
              {/* Bronze Tables */}
              <rect x="20" y="20" width="150" height="100" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" rx="4" />
              <text x="95" y="45" textAnchor="middle" className="font-bold" fontSize="12">
                BRONZE
              </text>
              <text x="30" y="65" fontSize="11">
                • Customer Master
              </text>
              <text x="30" y="80" fontSize="11">
                • Identifiers
              </text>
              <text x="30" y="95" fontSize="11">
                • Names/Addresses
              </text>
              <text x="30" y="110" fontSize="11">
                • Relationships
              </text>

              {/* Arrow Bronze to Silver */}
              <line x1="170" y1="70" x2="200" y2="70" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />

              {/* Silver Tables */}
              <rect x="200" y="20" width="150" height="100" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="2" rx="4" />
              <text x="275" y="45" textAnchor="middle" className="font-bold" fontSize="12">
                SILVER
              </text>
              <text x="210" y="65" fontSize="11">
                • Customer Golden
              </text>
              <text x="210" y="80" fontSize="11">
                • Relationships
              </text>
              <text x="210" y="95" fontSize="11">
                • Preferences
              </text>
              <text x="210" y="110" fontSize="11">
                • Risk Assessment
              </text>

              {/* Arrow Silver to Gold */}
              <line x1="350" y1="70" x2="380" y2="70" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />

              {/* Gold Table */}
              <rect x="380" y="20" width="150" height="100" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" rx="4" />
              <text x="455" y="45" textAnchor="middle" className="font-bold" fontSize="12">
                GOLD
              </text>
              <text x="390" y="65" fontSize="11">
                • Customer Deposit
              </text>
              <text x="390" y="80" fontSize="11">
                  Aggregation
              </text>
              <text x="390" y="95" fontSize="11">
                (Denormalized)
              </text>

              {/* Key Relationships */}
              <g>
                <text x="20" y="170" className="font-semibold" fontSize="12">
                  Key Relationships:
                </text>

                <rect x="20" y="190" width="280" height="70" fill="white" stroke="#E5E7EB" strokeWidth="1" rx="4" />
                <text x="30" y="210" fontSize="11" className="font-semibold">
                  Customer Master (Bronze)
                </text>
                <text x="30" y="230" fontSize="11">
                  ├��� 1:N → Customer Golden (Silver)
                </text>
                <text x="30" y="250" fontSize="11">
                  └─ 1:N → Customer Preferences (Silver)
                </text>

                <rect x="320" y="190" width="280" height="70" fill="white" stroke="#E5E7EB" strokeWidth="1" rx="4" />
                <text x="330" y="210" fontSize="11" className="font-semibold">
                  Silver Layer (Multiple)
                </text>
                <text x="330" y="230" fontSize="11">
                  ├─ N:1 → Customer Deposit Aggr (Gold)
                </text>
                <text x="330" y="250" fontSize="11">
                  └─ Denormalized for Analytics
                </text>

                <rect x="620" y="190" width="280" height="70" fill="white" stroke="#E5E7EB" strokeWidth="1" rx="4" />
                <text x="630" y="210" fontSize="11" className="font-semibold">
                  Business Key Mapping:
                </text>
                <text x="630" y="230" fontSize="11">
                  • CUSTOMER_NUMBER (All layers)
                </text>
                <text x="630" y="250" fontSize="11">
                  • SCD Type 2 tracking in Silver
                </text>
              </g>

              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="#666" />
                </marker>
              </defs>
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Physical Data Model */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Physical Data Model</CardTitle>
          <CardDescription>
            Actual table structures with keys and critical columns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bronze Physical Model */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-3">Bronze Layer</h3>
              <div className="space-y-3 text-xs">
                <div className="bg-white p-2 rounded border border-amber-100">
                  <div className="font-mono font-bold">customer_master</div>
                  <div className="text-gray-600 mt-1">PK: customer_nbr</div>
                  <div className="text-gray-500 mt-1">Columns: 25+</div>
                  <div className="text-gray-500">Rows: ~5M</div>
                </div>
                <div className="bg-white p-2 rounded border border-amber-100">
                  <div className="font-mono font-bold">customer_identifiers</div>
                  <div className="text-gray-600 mt-1">PK: id_nbr</div>
                  <div className="text-gray-600 mt-1">FK: customer_nbr</div>
                  <div className="text-gray-500 mt-1">Rows: ~10M</div>
                </div>
                <div className="bg-white p-2 rounded border border-amber-100">
                  <div className="font-mono font-bold">customer_names_addresses</div>
                  <div className="text-gray-600 mt-1">PK: address_id</div>
                  <div className="text-gray-600 mt-1">FK: customer_nbr</div>
                  <div className="text-gray-500 mt-1">Rows: ~12M</div>
                </div>
              </div>
            </div>

            {/* Silver Physical Model */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Silver Layer</h3>
              <div className="space-y-3 text-xs">
                <div className="bg-white p-2 rounded border border-slate-100">
                  <div className="font-mono font-bold">customer_golden</div>
                  <div className="text-gray-600 mt-1">PK: customer_key</div>
                  <div className="text-gray-600 mt-1">SCD2: effective_date</div>
                  <div className="text-gray-500 mt-1">Columns: 40+</div>
                  <div className="text-gray-500">Rows: ~5.5M</div>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <div className="font-mono font-bold">customer_preferences</div>
                  <div className="text-gray-600 mt-1">PK: customer_key</div>
                  <div className="text-gray-600 mt-1">FK: customer_golden</div>
                  <div className="text-gray-500 mt-1">Rows: ~5.5M</div>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <div className="font-mono font-bold">customer_risk_assessment</div>
                  <div className="text-gray-600 mt-1">PK: customer_key</div>
                  <div className="text-gray-600 mt-1">Dimension: Risk Score</div>
                  <div className="text-gray-500 mt-1">Rows: ~5.5M</div>
                </div>
              </div>
            </div>

            {/* Gold Physical Model */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-3">Gold Layer</h3>
              <div className="space-y-3 text-xs">
                <div className="bg-white p-2 rounded border border-yellow-100">
                  <div className="font-mono font-bold">customer_deposit_aggr</div>
                  <div className="text-gray-600 mt-1">PK: customer_number</div>
                  <div className="text-gray-600 mt-1">Type: AGGREGATE</div>
                  <div className="text-gray-500 mt-1">Columns: 60+</div>
                  <div className="text-gray-500 mt-1">Rows: ~5.5M</div>
                  <div className="text-gray-600 mt-2 italic">
                    Sources: All Silver tables
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Differences */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-blue-900 mb-3">Key Physical Differences</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold text-blue-900">Bronze</p>
                <ul className="text-gray-700 mt-2 space-y-1">
                  <li>• Normalized structure</li>
                  <li>• Source column mapping</li>
                  <li>• No data quality columns</li>
                  <li>• Partitioned by date</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-blue-900">Silver</p>
                <ul className="text-gray-700 mt-2 space-y-1">
                  <li>• Conformed dimensions</li>
                  <li>• SCD Type 2 tracking</li>
                  <li>• Data quality metrics</li>
                  <li>• Surrogate keys</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-blue-900">Gold</p>
                <ul className="text-gray-700 mt-2 space-y-1">
                  <li>• Heavily denormalized</li>
                  <li>• Pre-aggregated metrics</li>
                  <li>• Optimized for queries</li>
                  <li>• No joins needed</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entity Relationship Diagram */}
      {erdData && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Entity Relationship Diagram (ERD)</CardTitle>
            <CardDescription>
              Table structures and relationships across Bronze, Silver, and Gold layers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Entities Summary */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Entities ({erdData.totalEntities})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs text-amber-700 font-semibold mb-2">BRONZE LAYER</p>
                  <p className="text-2xl font-bold">{erdData.bronzeEntities}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-xs text-slate-700 font-semibold mb-2">SILVER LAYER</p>
                  <p className="text-2xl font-bold">{erdData.silverEntities}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-xs text-yellow-700 font-semibold mb-2">GOLD LAYER</p>
                  <p className="text-2xl font-bold">{erdData.goldEntities}</p>
                </div>
              </div>
            </div>

            {/* Entities Table */}
            <div>
              <h3 className="font-semibold mb-4">All Entities</h3>
              <div className="overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold">Table Name</TableHead>
                      <TableHead className="font-semibold">Layer</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Business Key</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {erdData.entities.map((entity: any, idx: number) => (
                      <TableRow key={idx} className="border-b hover:bg-gray-50">
                        <TableCell className="font-mono font-semibold whitespace-nowrap">
                          {entity.tableName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{entity.layer}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{entity.recordType}</TableCell>
                        <TableCell className="font-mono text-xs">{entity.businessKey}</TableCell>
                        <TableCell className="max-w-xs text-xs">{entity.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Relationships */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Relationships ({erdData.totalRelationships})
              </h3>
              <div className="overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">From Table</TableHead>
                      <TableHead className="font-semibold">To Table</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Cardinality</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {erdData.relationships.map((rel: any, idx: number) => (
                      <TableRow key={idx} className="border-b hover:bg-gray-50">
                        <TableCell className="font-mono font-semibold whitespace-nowrap">
                          {rel.relationshipId}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          {rel.fromTable.tableName}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          {rel.toTable.tableName}
                        </TableCell>
                        <TableCell className="text-xs">{rel.relationshipType}</TableCell>
                        <TableCell className="font-semibold text-xs">{rel.cardinality}</TableCell>
                        <TableCell className="max-w-xs text-xs">{rel.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gold Layer Aggregations Section */}
      <div className="mt-12">
        <GoldLayerAggregationsView />
      </div>

      {/* Data Quality Scripts Section */}
      <div className="mt-12">
        <DataQualityScriptsView layer="all" />
      </div>
    </div>
  );
}
