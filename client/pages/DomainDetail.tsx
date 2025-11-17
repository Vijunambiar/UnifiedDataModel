import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable, { type ColumnDef } from "@/components/DataTable";
import { bankingDomains } from "@/lib/enterprise-domains";
import { getDataSourcesByDomain } from "@/lib/data-sources";
import { goldMetricsCatalog } from "@/lib/domain-metrics";
import {
  depositsMetricsCatalog,
  depositsStats,
  type DepositsMetric,
} from "@/lib/deposits-domain-catalog";
import { customerCoreMetricsCatalog } from "@/lib/customer-core-comprehensive";
import { customerRetailMetricsCatalog } from "@/lib/retail/customer-retail-metrics";
import { depositsRetailMetricsCatalog } from "@/lib/retail/deposits-retail-metrics";
import { loansRetailMetricsCatalog } from "@/lib/retail/loans-retail-metrics";
import { cardsRetailMetricsCatalog } from "@/lib/retail/cards-retail-metrics";
import { paymentsRetailMetricsCatalog } from "@/lib/retail/payments-retail-metrics";
import { branchRetailMetricsCatalog } from "@/lib/retail/branch-retail-metrics";
import { marketingRetailMetricsCatalog } from "@/lib/retail/marketing-retail-metrics";
import { paymentsCommercialMetricsCatalog } from "@/lib/commercial/payments-commercial-metrics";
import { customerCommercialMetricsCatalog } from "@/lib/commercial/customer-commercial-metrics";
import { depositsCommercialMetricsCatalog } from "@/lib/commercial/deposits-commercial-metrics";
import { loansCommercialMetricsCatalog } from "@/lib/commercial/loans-commercial-metrics";
import { treasuryCommercialMetricsCatalog } from "@/lib/commercial/treasury-commercial-metrics";
import { riskCommercialMetricsCatalog } from "@/lib/commercial/risk-commercial-metrics";
import { complianceCommercialMetricsCatalog } from "@/lib/commercial/compliance-commercial-metrics";
import {
  ArrowLeft,
  Database,
  GitBranch,
  TrendingUp,
  AlertCircle,
  FileText,
  Network,
  Filter,
  Download,
  CheckCircle2,
  Layers as LayersIcon,
  Table2,
  FileCode,
} from "lucide-react";
import { exportToCSV, exportToXLSX } from "@/lib/export";
import { useMemo, useState, useEffect } from "react";
import { evaluateDomain, type DomainEvaluation } from "@/lib/domain-evaluation";
import { exportAndDownload, type ExportFormat } from "@/lib/data-model-exports";
import { LogicalERD } from "@/components/LogicalERD";
import { PhysicalERD } from "@/components/PhysicalERD";
import { generateLogicalRelationships } from "@/lib/erd-relationships";
import { enrichLogicalEntitiesWithAttributes } from "@/lib/logical-model-mapper";
import { useToast } from "@/hooks/use-toast";
import { getReferenceDataByDomain, type ReferenceDataCategory } from "@/lib/reference-data-catalog";
import { TableSchemaViewer } from "@/components/TableSchemaViewer";
import { TableSpecsLoader } from "@/components/TableSpecsLoader";
import { SemanticLayerViewer } from "@/components/SemanticLayerViewer";
import depositsSemanticLayer from "@/lib/deposits-semantic-layer";
import customerCoreSemanticLayer from "@/lib/customer-core-semantic-layer";
import loansRetailSemanticLayer from "@/lib/retail/loans-retail-semantic-layer";
import customerRetailSemanticLayer from "@/lib/retail/customer-retail-semantic-layer";
import cardsRetailSemanticLayer from "@/lib/retail/cards-retail-semantic-layer";
import paymentsRetailSemanticLayer from "@/lib/retail/payments-retail-semantic-layer";
import loansCommercialSemanticLayer from "@/lib/commercial/loans-commercial-semantic-layer";
import customerCommercialSemanticLayer from "@/lib/commercial/customer-commercial-semantic-layer";
import depositsCommercialSemanticLayer from "@/lib/commercial/deposits-commercial-semantic-layer";
import paymentsCommercialSemanticLayer from "@/lib/commercial/payments-commercial-semantic-layer";
import branchRetailSemanticLayer from "@/lib/retail/branch-retail-semantic-layer";
import digitalRetailSemanticLayer from "@/lib/retail/digital-retail-semantic-layer";
import depositsRetailSemanticLayer from "@/lib/retail/deposits-retail-semantic-layer";
import marketingRetailSemanticLayer from "@/lib/retail/marketing-retail-semantic-layer";
import fraudRetailSemanticLayer from "@/lib/retail/fraud-retail-semantic-layer";
import complianceRetailSemanticLayer from "@/lib/retail/compliance-retail-semantic-layer";
import customerServiceRetailSemanticLayer from "@/lib/retail/customer-service-retail-semantic-layer";
import collectionsRetailSemanticLayer from "@/lib/retail/collections-retail-semantic-layer";
import investmentRetailSemanticLayer from "@/lib/retail/investment-retail-semantic-layer";
import insuranceRetailSemanticLayer from "@/lib/retail/insurance-retail-semantic-layer";
import openBankingRetailSemanticLayer from "@/lib/retail/open-banking-retail-semantic-layer";
import marketingOrchestrationSemanticLayer from "@/lib/retail/marketing-orchestration-semantic-layer";
import crmAnalyticsSemanticLayer from "@/lib/retail/crm-analytics-semantic-layer";
import { marketingOrchestrationMetricsCatalog } from "@/lib/retail/marketing-orchestration-metrics";
import { crmAnalyticsMetricsCatalog } from "@/lib/retail/crm-analytics-metrics";

// Semantic layer registry - maps domain IDs to their semantic layers
const semanticLayerRegistry: Record<string, any> = {
  "deposits": depositsSemanticLayer,
  "customer-core": customerCoreSemanticLayer,
  "loans-retail": loansRetailSemanticLayer,
  "customer-retail": customerRetailSemanticLayer,
  "cards-retail": cardsRetailSemanticLayer,
  "payments-retail": paymentsRetailSemanticLayer,
  "loans-commercial": loansCommercialSemanticLayer,
  "customer-commercial": customerCommercialSemanticLayer,
  "deposits-commercial": depositsCommercialSemanticLayer,
  "payments-commercial": paymentsCommercialSemanticLayer,
  "branch-retail": branchRetailSemanticLayer,
  "digital-retail": digitalRetailSemanticLayer,
  "deposits-retail": depositsRetailSemanticLayer,
  "marketing-retail": marketingRetailSemanticLayer,
  "fraud-retail": fraudRetailSemanticLayer,
  "compliance-retail": complianceRetailSemanticLayer,
  "customer-service-retail": customerServiceRetailSemanticLayer,
  "collections-retail": collectionsRetailSemanticLayer,
  "investment-retail": investmentRetailSemanticLayer,
  "insurance-retail": insuranceRetailSemanticLayer,
  "open-banking-retail": openBankingRetailSemanticLayer,
  "marketing-orchestration": marketingOrchestrationSemanticLayer,
  "crm-analytics": crmAnalyticsSemanticLayer,
};

// Table specifications are now loaded dynamically on-demand to improve performance

function DepositsMetricsView() {
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [metricTypeFilter, setMetricTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMetrics = useMemo(() => {
    return depositsMetricsCatalog.filter((m) => {
      const matchesLevel = levelFilter === "all" || m.level === levelFilter;
      const matchesProduct =
        productFilter === "all" || m.productType === productFilter;
      const matchesType =
        metricTypeFilter === "all" || m.metric_type === metricTypeFilter;
      const matchesSearch =
        !searchQuery ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.technical_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.definition.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLevel && matchesProduct && matchesType && matchesSearch;
    });
  }, [levelFilter, productFilter, metricTypeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-900">
              {depositsStats.totalMetrics}
            </div>
            <div className="text-sm text-purple-700">Total Metrics</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xl font-bold">{depositsStats.byLevel.L1}</div>
            <div className="text-xs text-muted-foreground">L1: Portfolio</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xl font-bold">{depositsStats.byLevel.L2}</div>
            <div className="text-xs text-muted-foreground">L2: Product</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xl font-bold">{depositsStats.byLevel.L3}</div>
            <div className="text-xs text-muted-foreground">L3: Segment</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xl font-bold">{depositsStats.byLevel.L4}</div>
            <div className="text-xs text-muted-foreground">L4: Granular</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Metrics
              </CardTitle>
              <CardDescription>
                {filteredMetrics.length} of {depositsStats.totalMetrics} metrics
                shown
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  exportToCSV("deposits_metrics.csv", filteredMetrics)
                }
              >
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  exportToXLSX("deposits_metrics.xlsx", [
                    { name: "Metrics", data: filteredMetrics },
                  ])
                }
              >
                Export XLSX
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 px-3 rounded-md border bg-background md:col-span-2"
            />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="h-10 px-3 rounded-md border bg-background"
            >
              <option value="all">All Levels</option>
              <option value="L1-Portfolio">
                L1: Portfolio ({depositsStats.byLevel.L1})
              </option>
              <option value="L2-Product">
                L2: Product ({depositsStats.byLevel.L2})
              </option>
              <option value="L3-Segment">
                L3: Segment ({depositsStats.byLevel.L3})
              </option>
              <option value="L4-Granular">
                L4: Granular ({depositsStats.byLevel.L4})
              </option>
            </select>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="h-10 px-3 rounded-md border bg-background"
            >
              <option value="all">All Products</option>
              <option value="All">
                Portfolio-wide ({depositsStats.byProduct.All})
              </option>
              <option value="DDA">DDA ({depositsStats.byProduct.DDA})</option>
              <option value="Savings">
                Savings ({depositsStats.byProduct.Savings})
              </option>
              <option value="MMA">MMA ({depositsStats.byProduct.MMA})</option>
              <option value="CD">CD ({depositsStats.byProduct.CD})</option>
            </select>
            <select
              value={metricTypeFilter}
              onChange={(e) => setMetricTypeFilter(e.target.value)}
              className="h-10 px-3 rounded-md border bg-background"
            >
              <option value="all">All Types</option>
              <option value="operational">
                Operational ({depositsStats.byType.operational})
              </option>
              <option value="analytics">
                Analytics ({depositsStats.byType.analytics})
              </option>
              <option value="insight">
                Insight ({depositsStats.byType.insight})
              </option>
              <option value="model_driven">
                Model-Driven ({depositsStats.byType.model_driven})
              </option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={[
              {
                header: "Level",
                accessor: (r: DepositsMetric) => (
                  <Badge
                    variant="outline"
                    className={
                      r.level === "L1-Portfolio"
                        ? "bg-purple-100 text-purple-800 border-purple-300"
                        : r.level === "L2-Product"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : r.level === "L3-Segment"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-orange-100 text-orange-800 border-orange-300"
                    }
                  >
                    {r.level}
                  </Badge>
                ),
              },
              {
                header: "Product",
                accessor: (r: DepositsMetric) => (
                  <Badge variant="secondary" className="text-xs">
                    {r.productType}
                  </Badge>
                ),
              },
              {
                header: "Metric Name",
                accessor: (r: DepositsMetric) => r.name,
              },
              {
                header: "Type",
                accessor: (r: DepositsMetric) => (
                  <Badge
                    className={
                      r.metric_type === "operational"
                        ? "bg-gray-100 text-gray-800"
                        : r.metric_type === "analytics"
                          ? "bg-blue-100 text-blue-800"
                          : r.metric_type === "insight"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                    }
                  >
                    {r.metric_type}
                  </Badge>
                ),
              },
              {
                header: "Technical Name",
                accessor: (r: DepositsMetric) => (
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                    {r.technical_name}
                  </code>
                ),
              },
              { header: "Grain", accessor: (r: DepositsMetric) => r.grain },
              {
                header: "ALCO",
                accessor: (r: DepositsMetric) =>
                  r.alcoRelevance ? (
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      Yes
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">No</span>
                  ),
              },
              {
                header: "Treasury",
                accessor: (r: DepositsMetric) =>
                  r.treasuryRelevance ? (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Yes
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">No</span>
                  ),
              },
              {
                header: "Definition",
                accessor: (r: DepositsMetric) => (
                  <span className="text-xs">{r.definition}</span>
                ),
              },
            ]}
            data={filteredMetrics}
          />
        </CardContent>
      </Card>

      {/* Regulatory Summary */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-900">
            Regulatory Relevance Summary
          </CardTitle>
          <CardDescription>
            Key metrics aligned with regulatory requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-lg font-bold text-red-900">
                {depositsStats.alcoRelevant}
              </div>
              <div className="text-sm text-red-700">ALCO-Relevant Metrics</div>
              <div className="text-xs text-muted-foreground mt-1">
                Used in Asset-Liability Committee reporting
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-lg font-bold text-red-900">
                {depositsStats.treasuryRelevant}
              </div>
              <div className="text-sm text-red-700">
                Treasury-Relevant Metrics
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Used in Treasury and Funding analysis
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-lg font-bold text-red-900">
                {
                  depositsMetricsCatalog.filter(
                    (m) =>
                      m.regulatoryRelevance && m.regulatoryRelevance.length > 0,
                  ).length
                }
              </div>
              <div className="text-sm text-red-700">
                Regulatory-Tagged Metrics
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                LCR, NSFR, Basel III, etc.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DomainDetail() {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const domain = bankingDomains.find((d) => d.id === domainId);
  const dataSources = domainId ? getDataSourcesByDomain(domainId) : [];

  const [evaluation, setEvaluation] = useState<DomainEvaluation | null>(null);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Load domain evaluation when domainId changes
  useEffect(() => {
    async function loadDomainEvaluation() {
      if (!domainId) return;

      try {
        setLoadingEvaluation(true);
        const domainEval = await evaluateDomain(domainId);
        setEvaluation(domainEval);
      } catch (error) {
        console.error("Failed to load domain evaluation:", error);
      } finally {
        setLoadingEvaluation(false);
      }
    }

    loadDomainEvaluation();
  }, [domainId]);

  // Handle data model export
  async function handleExport(format: ExportFormat) {
    if (!domainId) return;

    try {
      setExporting(true);
      await exportAndDownload(domainId, format);

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

  // Use domain-specific catalog if available, otherwise use general catalog
  const metrics = useMemo(() => {
    if (domainId === "deposits") {
      return depositsMetricsCatalog;
    }

    // For customer-core, use the comprehensive metrics catalog
    if (domainId === "customer-core") {
      // Map metric categories to their specific silver source tables
      const getSilverTable = (categoryName: string) => {
        // Event-based metrics
        if (categoryName.includes('Event Volume') || categoryName.includes('Activity')) return 'silver.customer_events';

        // Session-based metrics
        if (categoryName.includes('Session') || categoryName.includes('Mobile App') ||
            categoryName.includes('User Behavior') || categoryName.includes('Performance') ||
            categoryName.includes('A/B Testing')) return 'silver.customer_sessions';

        // Journey-based metrics
        if (categoryName.includes('Journey')) return 'silver.customer_journeys';

        // Touchpoint and campaign metrics
        if (categoryName.includes('Touchpoint') || categoryName.includes('Campaign') ||
            categoryName.includes('Attribution') || categoryName.includes('Acquisition')) return 'silver.touchpoints';

        // Feature and content metrics
        if (categoryName.includes('Feature') || categoryName.includes('Adoption') ||
            categoryName.includes('Content Engagement')) return 'silver.feature_adoption';

        // Engagement metrics (uses multiple sources)
        if (categoryName.includes('Engagement Metrics') || categoryName.includes('Traffic & Web'))
          return 'silver.customer_sessions, silver.customer_events';

        // Conversion metrics (cross-table)
        if (categoryName.includes('Conversion') || categoryName.includes('Digital Conversion'))
          return 'silver.customer_journeys, silver.customer_events';

        // Customer-level metrics (default)
        // Includes: Base, Lifecycle, Segmentation, Value, Satisfaction, Risk, Product, Household, Identity, Retention, Loyalty, etc.
        return 'silver.customer_golden_record';
      };

      // Map metric categories to their gold fact tables
      const getGoldTable = (categoryName: string) => {
        // Event fact table
        if (categoryName.includes('Event Volume') || categoryName.includes('Activity')) return 'gold.fact_events';

        // Session fact table
        if (categoryName.includes('Session') || categoryName.includes('Mobile App') ||
            categoryName.includes('User Behavior') || categoryName.includes('Performance') ||
            categoryName.includes('A/B Testing') || categoryName.includes('Traffic & Web')) return 'gold.fact_sessions';

        // Journey fact table
        if (categoryName.includes('Journey')) return 'gold.fact_journeys';

        // Touchpoint fact table (includes attribution data)
        if (categoryName.includes('Touchpoint') || categoryName.includes('Campaign') ||
            categoryName.includes('Attribution') || categoryName.includes('Acquisition')) return 'gold.fact_touchpoints';

        // Feature usage fact table
        if (categoryName.includes('Feature') || categoryName.includes('Content Engagement')) return 'gold.fact_feature_usage';

        // Conversion metrics (can use journey or events)
        if (categoryName.includes('Conversion')) return 'gold.fact_journeys';

        // Customer snapshot (default for all customer-level aggregated metrics)
        return 'gold.fact_customer_daily_snapshot';
      };

      // Flatten the comprehensive metrics structure to match the expected format
      return customerCoreMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Customer Core",
          subdomain: category.name,
          metric_type: m.type || "diagnostic",
          technical_name: m.id,
          grain: "aggregated",
          data_type: m.unit,
          source_silver_table: getSilverTable(category.name),
          source_silver_column: "Derived from base measures",
          source_gold_table: getGoldTable(category.name),
          source_gold_column: "Calculated via SQL formula",
          sql: m.formula,
        })),
      );
    }

    // Retail domain metrics catalogs
    if (domainId === "customer-retail") {
      return customerRetailMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Customer-Retail",
          subdomain: category.name,
          metric_type: m.type || "diagnostic",
          technical_name: m.id,
          grain: m.grain || "daily",
          data_type: m.unit || m.dataType,
          source_silver_table: m.silverTable || "silver.retail_customer_golden_record",
          source_silver_column: "Calculated from base measures",
          source_gold_table: m.goldTable || "gold.dim_retail_customer",
          source_gold_column: "Calculated via SQL formula",
          sql: m.formula || m.calculation?.sql,
        })),
      );
    }

    if (domainId === "deposits-retail") {
      return depositsRetailMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Deposits-Retail",
          subdomain: category.name,
          metric_type: m.type || "operational",
          technical_name: m.id,
          grain: m.grain || "daily",
          data_type: m.unit || m.dataType,
          sql: m.formula || m.calculation?.sql,
        })),
      );
    }

    if (domainId === "loans-retail") {
      return loansRetailMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Loans-Retail",
          subdomain: category.name,
          metric_type: m.type || "operational",
          technical_name: m.id,
          grain: m.grain || "daily",
          data_type: m.unit || m.dataType,
          sql: m.formula || m.calculation?.sql,
        })),
      );
    }

    if (domainId === "cards-retail") {
      return cardsRetailMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Cards-Retail",
          subdomain: category.name,
          metric_type: m.type || "operational",
          technical_name: m.id,
          grain: m.grain || "daily",
          data_type: m.unit || m.dataType,
          sql: m.formula || m.calculation?.sql,
        })),
      );
    }

    if (domainId === "payments-retail") {
      return paymentsRetailMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Payments-Retail",
          subdomain: category.name,
          metric_type: m.type || "operational",
          technical_name: m.id,
          grain: m.grain || "daily",
          data_type: m.unit || m.dataType,
          sql: m.formula || m.calculation?.sql,
        })),
      );
    }

    if (domainId === "branch-retail") {
      return branchRetailMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Branch-Retail",
          subdomain: category.name,
          metric_type: m.type || "operational",
          technical_name: m.id,
          grain: "daily",
          data_type: m.unit || m.dataType,
          sql: m.formula || m.calculation?.sql,
        })),
      );
    }

    if (domainId === "marketing-retail") {
      return marketingRetailMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Marketing-Retail",
          subdomain: category.name,
          metric_type: m.type || "diagnostic",
          technical_name: m.id,
          grain: m.granularity?.toLowerCase() || "daily",
          data_type: m.unit || m.dataType,
          sql: m.formula || m.calculation?.sql,
        })),
      );
    }

    if (domainId === "payments-commercial") {
      return paymentsCommercialMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Payments-Commercial",
          subdomain: category.name,
          metric_type: m.type || "operational",
          technical_name: m.id,
          grain: m.granularity?.toLowerCase() || "daily",
          data_type: m.unit || m.dataType,
          aggregation: m.aggregation,
          source_silver_table: m.sourceTables?.[0] || "silver.commercial_payments_unified",
          source_silver_column: "Calculated from base measures",
          source_gold_table: m.sourceTables?.[1] || "gold.fact_payment_transactions",
          source_gold_column: "Calculated via SQL formula",
          sql: m.formula || m.calculation?.sql,
        })),
      );
    }

    if (domainId === "customer-commercial") {
      return customerCommercialMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Customer-Commercial",
          subdomain: category.name,
          metric_type: m.type || "diagnostic",
          technical_name: m.id,
          grain: m.granularity?.toLowerCase() || "monthly",
          data_type: m.unit || m.dataType,
          aggregation: m.aggregation,
          source_silver_table: m.sourceTables?.[0] || "silver.commercial_customer_golden_record",
          source_silver_column: "Calculated from base measures",
          source_gold_table: m.sourceTables?.[1] || "gold.dim_commercial_customer",
          source_gold_column: "Calculated via SQL formula",
          sql: m.formula || m.calculation?.sql,
        })),
      );
    }

    if (domainId === "deposits-commercial") {
      return depositsCommercialMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Deposits-Commercial",
          subdomain: category.name,
          metric_type: m.type || "operational",
          technical_name: m.id,
          grain: m.granularity?.toLowerCase() || "daily",
          data_type: m.unit || m.dataType,
          aggregation: m.aggregation,
          source_silver_table: m.sourceTables?.[0] || "silver.commercial_deposit_balances",
          source_silver_column: "Calculated from base measures",
          source_gold_table: m.sourceTables?.[1] || "gold.fact_deposit_balances",
          source_gold_column: "Calculated via SQL formula",
          sql: m.formula || m.calculation?.sql,
        })),
      );
    }

    if (domainId === "loans-commercial") {
      return loansCommercialMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Loans-Commercial",
          subdomain: category.name,
          metric_type: m.type || "operational",
          technical_name: m.id,
          grain: m.granularity?.toLowerCase() || "monthly",
          data_type: m.unit || m.dataType,
          aggregation: m.aggregation,
          source_silver_table: m.sourceTables?.[0] || "silver.commercial_loan_portfolio",
          source_silver_column: "Calculated from base measures",
          source_gold_table: m.sourceTables?.[1] || "gold.fact_loan_portfolio",
          source_gold_column: "Calculated via SQL formula",
          sql: m.formula || m.calculation?.sql,
        })),
      );
    }

    if (domainId === "treasury-commercial") {
      return treasuryCommercialMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Treasury-Commercial",
          subdomain: category.name,
          metric_type: m.type || "operational",
          technical_name: m.id,
          grain: m.granularity?.toLowerCase() || "daily",
          data_type: m.unit || m.dataType,
          aggregation: m.aggregation,
          source_silver_table: m.sourceTables?.[0] || "silver.commercial_treasury_services",
          source_silver_column: "Calculated from base measures",
          source_gold_table: m.sourceTables?.[1] || "gold.fact_treasury_transactions",
          source_gold_column: "Calculated via SQL formula",
          sql: m.formula || m.calculation?.sql,
        })),
      );
    }

    if (domainId === "risk-commercial") {
      return riskCommercialMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Risk-Commercial",
          subdomain: category.name,
          metric_type: m.type || "diagnostic",
          technical_name: m.id,
          grain: m.granularity?.toLowerCase() || "quarterly",
          data_type: m.unit || m.dataType,
          aggregation: m.aggregation,
          source_silver_table: m.sourceTables?.[0] || "silver.commercial_risk_metrics",
          source_silver_column: "Calculated from risk models",
          source_gold_table: m.sourceTables?.[1] || "gold.fact_risk_exposures",
          source_gold_column: "Calculated via risk formulas",
          sql: m.formula || m.calculation?.sql,
        })),
      );
    }

    if (domainId === "compliance-commercial") {
      return complianceCommercialMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Compliance-Commercial",
          subdomain: category.name,
          metric_type: m.type || "diagnostic",
          technical_name: m.id,
          grain: m.granularity?.toLowerCase() || "monthly",
          data_type: m.unit || m.dataType,
          aggregation: m.aggregation,
          source_silver_table: m.sourceTables?.[0] || "silver.commercial_compliance_monitoring",
          source_silver_column: "Calculated from compliance data",
          source_gold_table: m.sourceTables?.[1] || "gold.fact_compliance_events",
          source_gold_column: "Calculated via compliance formulas",
          sql: m.formula || m.calculation?.sql,
        })),
      );
    }

    if (domainId === "marketing-orchestration") {
      return marketingOrchestrationMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "Marketing-Orchestration",
          subdomain: category.name,
          metric_type: m.type || "diagnostic",
          technical_name: m.id,
          grain: m.granularity || "daily",
          data_type: m.unit || m.dataType,
          aggregation: m.aggregation,
          source_silver_table: m.sourceTables?.[0] || "silver.fct_nba_decisions",
          source_silver_column: "Calculated from orchestration events",
          source_gold_table: m.sourceTables?.[1] || "gold.fct_nba_decision_daily",
          source_gold_column: "Calculated via orchestration formulas",
          sql: m.sqlSilver || m.formula || m.calculation?.sql,
          sqlSilver: m.sqlSilver,
          sqlGold: m.sqlGold,
        })),
      );
    }

    if (domainId === "crm-analytics") {
      return crmAnalyticsMetricsCatalog.categories.flatMap((category) =>
        category.metrics.map((m: any) => ({
          ...m,
          domain: "CRM-Analytics",
          subdomain: category.name,
          metric_type: m.type || "operational",
          technical_name: m.id,
          grain: m.granularity || "daily",
          data_type: m.unit || m.dataType,
          aggregation: m.aggregation,
          source_silver_table: m.sourceTables?.[0] || "silver.fct_opportunity",
          source_silver_column: "Calculated from CRM data",
          source_gold_table: m.sourceTables?.[1] || "gold.fct_opportunity",
          source_gold_column: "Calculated via CRM formulas",
          sql: m.sqlSilver || m.formula || m.calculation?.sql,
          sqlSilver: m.sqlSilver,
          sqlGold: m.sqlGold,
        })),
      );
    }

    return goldMetricsCatalog.filter(
      (m) =>
        m.domain.toLowerCase().replace(/[^a-z0-9]+/g, "-") === domainId ||
        m.domain.toLowerCase().replace(/ /g, "-") === domainId,
    );
  }, [domainId]);

  if (!domain) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Domain Not Found</CardTitle>
            <CardDescription>
              The requested domain could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="flex items-start gap-6">
          <div className="text-6xl">{domain.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{domain.name}</h1>
              <Badge
                className={
                  domain.priority === "P0"
                    ? "bg-red-100 text-red-800"
                    : domain.priority === "P1"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                }
              >
                {domain.priority} Priority
              </Badge>
              <Badge variant="outline">{domain.complexity} Complexity</Badge>
              <Badge className="bg-green-100 text-green-800">
                {domain.businessValue} Value
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground max-w-4xl">
              {domain.description}
            </p>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {domainId === "deposits"
                    ? depositsStats.totalMetrics
                    : domain.keyMetricsCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Business Metrics
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-amber-600" />
              <div>
                <div className="text-2xl font-bold">
                  {domain.tablesCount.gold}
                </div>
                <div className="text-sm text-muted-foreground">Gold Tables</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <GitBranch className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{dataSources.length}</div>
                <div className="text-sm text-muted-foreground">
                  Data Sources
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Network className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {domain.subDomains.length}
                </div>
                <div className="text-sm text-muted-foreground">Sub-domains</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">
            Metrics (
            {domainId === "deposits"
              ? depositsStats.totalMetrics
              : domainId === "customer-retail"
                ? customerRetailMetricsCatalog.totalMetrics
                : domainId === "deposits-retail"
                  ? depositsRetailMetricsCatalog.totalMetrics
                  : domainId === "loans-retail"
                    ? loansRetailMetricsCatalog.totalMetrics
                    : domainId === "cards-retail"
                      ? cardsRetailMetricsCatalog.totalMetrics
                      : domainId === "payments-retail"
                        ? paymentsRetailMetricsCatalog.totalMetrics
                        : domainId === "branch-retail"
                          ? branchRetailMetricsCatalog.totalMetrics
                          : domainId === "marketing-retail"
                            ? marketingRetailMetricsCatalog.totalMetrics
                            : domainId === "marketing-orchestration"
                              ? marketingOrchestrationMetricsCatalog.totalMetrics
                              : domainId === "crm-analytics"
                                ? crmAnalyticsMetricsCatalog.totalMetrics
                                : domainId === "payments-commercial"
                                  ? paymentsCommercialMetricsCatalog.totalMetrics
                                  : domainId === "customer-commercial"
                                    ? customerCommercialMetricsCatalog.totalMetrics
                                    : domainId === "deposits-commercial"
                                      ? depositsCommercialMetricsCatalog.totalMetrics
                                      : domainId === "loans-commercial"
                                        ? loansCommercialMetricsCatalog.totalMetrics
                                        : domainId === "customer-core"
                                          ? customerCoreMetricsCatalog.totalMetrics || customerCoreMetricsCatalog.categories?.reduce((sum, cat) => sum + cat.totalMetrics, 0)
                                          : metrics.length > 0
                                            ? metrics.length
                                            : domain.keyMetricsCount}
            )
          </TabsTrigger>
          <TabsTrigger value="sources">
            Data Sources ({dataSources.length})
          </TabsTrigger>
          <TabsTrigger value="datamodels">
            <LayersIcon className="h-4 w-4 mr-1" />
            Data Models
          </TabsTrigger>
          <TabsTrigger value="semantic">
            <Database className="h-4 w-4 mr-1" />
            Semantic Layer
          </TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="reference">Reference Data</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sub-Domains</CardTitle>
                <CardDescription>
                  {domain.subDomains.length} specialized areas within this
                  domain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {domain.subDomains.map((sd) => (
                    <Badge key={sd} variant="secondary" className="text-sm">
                      {sd}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Entities</CardTitle>
                <CardDescription>
                  {domain.keyEntities.length} core data entities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {domain.keyEntities.map((entity) => (
                    <Badge key={entity} variant="outline" className="text-sm">
                      {entity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Use Cases & Applications</CardTitle>
              <CardDescription>
                Key analytical use cases supported by this domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {domain.useCases.map((useCase) => (
                  <div
                    key={useCase}
                    className="flex items-start gap-2 p-3 rounded-lg border bg-slate-50"
                  >
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{useCase}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Stakeholders</CardTitle>
              <CardDescription>
                Business owners and consumers of this domain data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {domain.stakeholders.map((stakeholder) => (
                  <Badge
                    key={stakeholder}
                    className="bg-purple-100 text-purple-800 border-purple-300 text-sm"
                  >
                    {stakeholder}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          {domainId === "deposits" ? (
            <DepositsMetricsView />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Domain Metrics Catalog</CardTitle>
                    <CardDescription>
                      {domainId === "deposits"
                        ? depositsStats.totalMetrics
                        : domainId === "customer-retail"
                          ? customerRetailMetricsCatalog.totalMetrics
                          : domainId === "deposits-retail"
                            ? depositsRetailMetricsCatalog.totalMetrics
                            : domainId === "loans-retail"
                              ? loansRetailMetricsCatalog.totalMetrics
                              : domainId === "cards-retail"
                                ? cardsRetailMetricsCatalog.totalMetrics
                                : domainId === "payments-retail"
                                  ? paymentsRetailMetricsCatalog.totalMetrics
                                  : domainId === "branch-retail"
                                    ? branchRetailMetricsCatalog.totalMetrics
                                    : domainId === "marketing-retail"
                                      ? marketingRetailMetricsCatalog.totalMetrics
                                      : domainId === "marketing-orchestration"
                                        ? marketingOrchestrationMetricsCatalog.totalMetrics
                                        : domainId === "crm-analytics"
                                          ? crmAnalyticsMetricsCatalog.totalMetrics
                                          : domainId === "payments-commercial"
                                            ? paymentsCommercialMetricsCatalog.totalMetrics
                                            : domainId === "customer-commercial"
                                              ? customerCommercialMetricsCatalog.totalMetrics
                                              : domainId === "deposits-commercial"
                                                ? depositsCommercialMetricsCatalog.totalMetrics
                                                : domainId === "loans-commercial"
                                                  ? loansCommercialMetricsCatalog.totalMetrics
                                                  : domainId === "customer-core"
                                                    ? customerCoreMetricsCatalog.totalMetrics || customerCoreMetricsCatalog.categories?.reduce((sum, cat) => sum + cat.totalMetrics, 0)
                                                    : metrics.length > 0
                                                      ? metrics.length
                                                      : domain.keyMetricsCount}{" "}
                      metrics across operational, insight, analytics, and
                      model-driven categories
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        exportToCSV(`${domain.id}_metrics.csv`, metrics)
                      }
                    >
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        exportToXLSX(`${domain.id}_metrics.xlsx`, [
                          { name: "Metrics", data: metrics },
                        ])
                      }
                    >
                      Export XLSX
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {metrics.length > 0 ? (
                  <>
                    {metrics.length < domain.keyMetricsCount && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <strong>Note:</strong> Showing {metrics.length} sample
                          metrics with full definitions. The complete catalog
                          contains{" "}
                          {domainId === "deposits"
                            ? depositsStats.totalMetrics
                            : domainId === "customer-retail"
                              ? customerRetailMetricsCatalog.totalMetrics
                              : domainId === "deposits-retail"
                                ? depositsRetailMetricsCatalog.totalMetrics
                                : domainId === "loans-retail"
                                  ? loansRetailMetricsCatalog.totalMetrics
                                  : domainId === "cards-retail"
                                    ? cardsRetailMetricsCatalog.totalMetrics
                                    : domainId === "payments-retail"
                                      ? paymentsRetailMetricsCatalog.totalMetrics
                                      : domainId === "branch-retail"
                                        ? branchRetailMetricsCatalog.totalMetrics
                                        : domainId === "marketing-retail"
                                          ? marketingRetailMetricsCatalog.totalMetrics
                                          : domainId === "marketing-orchestration"
                                            ? marketingOrchestrationMetricsCatalog.totalMetrics
                                            : domainId === "crm-analytics"
                                              ? crmAnalyticsMetricsCatalog.totalMetrics
                                              : domainId === "payments-commercial"
                                                ? paymentsCommercialMetricsCatalog.totalMetrics
                                                : domainId === "customer-commercial"
                                                  ? customerCommercialMetricsCatalog.totalMetrics
                                                  : domainId === "deposits-commercial"
                                                    ? depositsCommercialMetricsCatalog.totalMetrics
                                                    : domainId === "loans-commercial"
                                                      ? loansCommercialMetricsCatalog.totalMetrics
                                                      : domainId === "customer-core"
                                                        ? customerCoreMetricsCatalog.totalMetrics || customerCoreMetricsCatalog.categories?.reduce((sum, cat) => sum + cat.totalMetrics, 0)
                                                        : domain.keyMetricsCount}{" "}
                          metrics.
                        </p>
                      </div>
                    )}
                    <DataTable
                      columns={[
                        { header: "Metric", accessor: (r: any) => r.name },
                        {
                          header: "Type",
                          accessor: (r: any) => (
                            <Badge variant="secondary">{r.metric_type}</Badge>
                          ),
                        },
                        {
                          header: "Technical Name",
                          accessor: (r: any) => (
                            <code className="text-xs">{r.technical_name}</code>
                          ),
                        },
                        { header: "Grain", accessor: (r: any) => r.grain },
                        {
                          header: "Aggregation",
                          accessor: (r: any) => r.aggregation,
                        },
                        {
                          header: "Silver Table",
                          accessor: (r: any) => (
                            <span className="text-xs font-mono">
                              {r.source_silver_table}
                            </span>
                          ),
                        },
                        {
                          header: "Gold Table",
                          accessor: (r: any) => (
                            <span className="text-xs font-mono">
                              {r.source_gold_table}
                            </span>
                          ),
                        },
                        {
                          header: "Silver SQL",
                          accessor: (r: any) => (
                            r.sqlSilver ? (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-semibold">
                                  View SQL
                                </summary>
                                <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto max-w-md max-h-48">
                                  {r.sqlSilver}
                                </pre>
                              </details>
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )
                          ),
                        },
                        {
                          header: "Gold SQL",
                          accessor: (r: any) => (
                            r.sqlGold ? (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-semibold">
                                  View SQL
                                </summary>
                                <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto max-w-md max-h-48">
                                  {r.sqlGold}
                                </pre>
                              </details>
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )
                          ),
                        },
                      ]}
                      data={metrics}
                    />
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Metrics catalog for this domain is being developed.</p>
                    <p className="text-sm mt-2">
                      Check the main metrics catalog for cross-domain metrics.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>
                {dataSources.length} systems feeding this domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  {
                    header: "Source System",
                    accessor: (row: any) => (
                      <div>
                        <div className="font-semibold">{row.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.category}
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: "Type",
                    accessor: (row: any) => (
                      <Badge
                        variant={
                          row.type === "internal" ? "default" : "outline"
                        }
                      >
                        {row.type}
                      </Badge>
                    ),
                  },
                  {
                    header: "Refresh",
                    accessor: (row: any) => (
                      <Badge variant="secondary">{row.refreshFrequency}</Badge>
                    ),
                  },
                  {
                    header: "Volume/Day",
                    accessor: (row: any) => row.volumeDaily,
                  },
                  {
                    header: "Integration",
                    accessor: (row: any) => (
                      <Badge variant="outline">{row.integrationMethod}</Badge>
                    ),
                  },
                  {
                    header: "Criticality",
                    accessor: (row: any) => (
                      <Badge
                        className={
                          row.criticalityLevel === "Critical"
                            ? "bg-red-100 text-red-800"
                            : row.criticalityLevel === "High"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                        }
                      >
                        {row.criticalityLevel}
                      </Badge>
                    ),
                  },
                ]}
                data={dataSources}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Models Tab */}
        <TabsContent value="datamodels" className="space-y-6">
          {loadingEvaluation ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-muted-foreground">Loading data model evaluation...</div>
              </CardContent>
            </Card>
          ) : evaluation ? (
            <>
              {/* Data Layers Overview */}
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50/50 via-white to-teal-50/30">
                  <CardTitle className="flex items-center gap-2">
                    <LayersIcon className="h-6 w-6 text-primary" />
                    Data Model Overview
                  </CardTitle>
                  <CardDescription>
                    Bronze, Silver, and Gold layer structure for {domain.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Bronze Layer */}
                    <Card className={evaluation.hasBronzeLayer ? "border-amber-500" : "border-gray-300"}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                          {evaluation.hasBronzeLayer ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div className="font-semibold text-amber-600">Bronze Layer</div>
                        </div>
                        <div className="text-3xl font-bold text-amber-600">
                          {evaluation.bronzeLayer?.tableCount || 0}
                        </div>
                        <div className="text-sm text-slate-600">Raw data tables</div>
                      </CardContent>
                    </Card>

                    {/* Silver Layer */}
                    <Card className={evaluation.hasSilverLayer ? "border-zinc-500" : "border-gray-300"}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                          {evaluation.hasSilverLayer ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div className="font-semibold text-zinc-600">Silver Layer</div>
                        </div>
                        <div className="text-3xl font-bold text-zinc-600">
                          {evaluation.silverLayer?.tableCount || 0}
                        </div>
                        <div className="text-sm text-slate-600">Conformed tables</div>
                      </CardContent>
                    </Card>

                    {/* Gold Layer */}
                    <Card className={evaluation.hasGoldLayer ? "border-yellow-500" : "border-gray-300"}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                          {evaluation.hasGoldLayer ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div className="font-semibold text-yellow-600">Gold Layer</div>
                        </div>
                        <div className="text-3xl font-bold text-yellow-600">
                          {evaluation.goldLayer?.tableCount || 0}
                        </div>
                        <div className="text-sm text-slate-600">Dimensional model tables</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Data Quality Score */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div>
                      <div className="font-semibold text-slate-900">Overall Grade</div>
                      <div className="text-sm text-slate-600">Data model completeness and quality</div>
                    </div>
                    <div className="text-4xl font-bold text-green-600">{evaluation.grade}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Logical ERD */}
              <Card>
                <CardHeader>
                  <CardTitle>Logical Data Model</CardTitle>
                  <CardDescription>
                    Conceptual entities and business relationships
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LogicalERD
                    entities={enrichLogicalEntitiesWithAttributes(
                      domain.keyEntities,
                      evaluation.silverLayer,
                      evaluation.goldLayer,
                    )}
                    relationships={generateLogicalRelationships(domain.keyEntities)}
                  />
                </CardContent>
              </Card>

              {/* Physical ERD */}
              <Card>
                <CardHeader>
                  <CardTitle>Physical Data Model</CardTitle>
                  <CardDescription>
                    Actual database tables and schemas across all layers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="bronze" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="bronze">Bronze Layer</TabsTrigger>
                      <TabsTrigger value="silver">Silver Layer</TabsTrigger>
                      <TabsTrigger value="gold">Gold Layer</TabsTrigger>
                    </TabsList>

                    {/* Bronze Layer ERD */}
                    <TabsContent value="bronze">
                      {evaluation.bronzeLayer?.tables && evaluation.bronzeLayer.tables.length > 0 ? (
                        <PhysicalERD
                          layer="bronze"
                          tables={evaluation.bronzeLayer.tables.map((table) => ({
                            name: table.name,
                            type: "bronze" as const,
                            columns: table.columns || [],
                          }))}
                          relationships={evaluation.bronzeLayer.relationships || []}
                        />
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          No bronze layer tables defined for this domain
                        </div>
                      )}
                    </TabsContent>

                    {/* Silver Layer ERD */}
                    <TabsContent value="silver">
                      {evaluation.silverLayer?.tables && evaluation.silverLayer.tables.length > 0 ? (
                        <PhysicalERD
                          layer="silver"
                          tables={evaluation.silverLayer.tables.map((table) => ({
                            name: table.name,
                            type: "silver" as const,
                            columns: table.columns || [],
                          }))}
                          relationships={evaluation.silverLayer.relationships || []}
                        />
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          No silver layer tables defined for this domain
                        </div>
                      )}
                    </TabsContent>

                    {/* Gold Layer ERD */}
                    <TabsContent value="gold">
                      {evaluation.goldLayer?.tables && evaluation.goldLayer.tables.length > 0 ? (
                        <PhysicalERD
                          layer="gold"
                          tables={evaluation.goldLayer.tables.map((table: any) => ({
                            name: table.name,
                            type: table.type || "dimension",
                            columns: table.columns || [],
                          }))}
                          relationships={evaluation.goldLayer.relationships || []}
                        />
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          No gold layer tables defined for this domain
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Data Model</CardTitle>
                  <CardDescription>
                    Download data model documentation in multiple formats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                      onClick={() => handleExport("csv")}
                      disabled={exporting}
                      className="h-auto py-4 flex-col gap-2"
                    >
                      <FileText className="h-6 w-6" />
                      <span>Export CSV</span>
                    </Button>
                    <Button
                      onClick={() => handleExport("xlsx")}
                      disabled={exporting}
                      className="h-auto py-4 flex-col gap-2"
                      variant="outline"
                    >
                      <Table2 className="h-6 w-6" />
                      <span>Export Excel</span>
                    </Button>
                    <Button
                      onClick={() => handleExport("sql")}
                      disabled={exporting}
                      className="h-auto py-4 flex-col gap-2"
                      variant="outline"
                    >
                      <FileCode className="h-6 w-6" />
                      <span>Export SQL DDL</span>
                    </Button>
                    <Button
                      onClick={() => handleExport("pdf")}
                      disabled={!evaluation.readyForPdfExport || exporting}
                      className="h-auto py-4 flex-col gap-2"
                      variant="outline"
                    >
                      <Download className="h-6 w-6" />
                      <span>Export PDF</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-muted-foreground">No data model evaluation available</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Semantic Layer Tab */}
        <TabsContent value="semantic" className="space-y-6">
          <SemanticLayerViewer
            domainId={domainId}
            domainName={domain.name}
            measures={semanticLayerRegistry[domainId]?.measures}
            attributes={semanticLayerRegistry[domainId]?.attributes}
            hierarchies={semanticLayerRegistry[domainId]?.hierarchies}
            folders={semanticLayerRegistry[domainId]?.folders}
          />
        </TabsContent>

        {/* Regulatory Tab */}
        <TabsContent value="regulatory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Context</CardTitle>
              <CardDescription>
                Compliance requirements and regulations governing this domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {domain.regulatoryContext.map((reg) => (
                  <div
                    key={reg}
                    className="flex items-start gap-3 p-4 rounded-lg border bg-red-50 border-red-200"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-sm">{reg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Architecture Tab */}
        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Architecture</CardTitle>
              <CardDescription>
                Layer-by-layer breakdown of tables and entities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-amber-50 border-amber-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Database className="h-5 w-5 text-amber-600" />
                        Bronze Layer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-amber-600">
                        {domain.tablesCount.bronze}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Raw, immutable tables
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-100 border-zinc-300">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Database className="h-5 w-5 text-zinc-600" />
                        Silver Layer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-zinc-600">
                        {domain.tablesCount.silver}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Cleaned, conformed tables
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Database className="h-5 w-5 text-yellow-600" />
                        Gold Layer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-yellow-600">
                        {domain.tablesCount.gold}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Dimensional model tables
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-6 rounded-lg border bg-slate-50">
                  <h3 className="font-semibold mb-4">Data Flow Architecture</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge className="bg-amber-600 text-white">
                      Bronze (Raw)
                    </Badge>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                    <Badge className="bg-zinc-400 text-white">
                      Silver (Conformed)
                    </Badge>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                    <Badge className="bg-yellow-500 text-black">
                      Gold (Dimensional)
                    </Badge>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                    <Badge className="bg-teal-500 text-white">
                      Semantic (Business)
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Continue building the unified data model for {domain.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {domainId === "deposits" && (
                <>
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={() => navigate("/domain/deposits/assessment")}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Comprehensive Assessment (94% Complete)
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => navigate("/domain/deposits/unified-model")}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    View Comprehensive Unified Data Model (Plug & Play)
                  </Button>
                </>
              )}
              <Button className="w-full" onClick={() => navigate("/layers")}>
                View Full Layer Architecture (Bronze → Silver → Gold → Semantic)
              </Button>
              <Button variant="outline" className="w-full">
                Generate Domain-Specific ERD
              </Button>
              <Button variant="outline" className="w-full">
                Export Domain Blueprint
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tables Tab */}
        <TabsContent value="tables" className="space-y-6">
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-orange-50">
              <CardTitle>Complete Table Specifications</CardTitle>
              <CardDescription>
                Industry-standard, plug-and-play table schemas for Bronze, Silver, and Gold layers with full column definitions, data types, primary keys, and metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <TableSpecsLoader domainId={domainId || ''} domain={domain} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reference Data Tab */}
        <TabsContent value="reference" className="space-y-6">
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-orange-50">
              <CardTitle>Reference Data & Enumerations</CardTitle>
              <CardDescription>
                Foundational data model elements including relationship types, application statuses, and standard code values
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {(() => {
                const referenceData = getReferenceDataByDomain(domainId || "");

                if (referenceData.length === 0) {
                  return (
                    <div className="text-center py-12 text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No reference data defined for this domain yet.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-8">
                    {referenceData.map((category) => (
                      <Card key={category.id} className="border-2">
                        <CardHeader className="bg-slate-50">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Database className="h-5 w-5 text-primary" />
                            {category.name}
                          </CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            {category.values.map((value) => (
                              <div key={value.code} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                      <Badge className="font-mono bg-primary">
                                        {value.code}
                                      </Badge>
                                      <span className="font-semibold text-lg">{value.name}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{value.description}</p>
                                  </div>
                                </div>

                                {value.businessRules && value.businessRules.length > 0 && (
                                  <div className="mt-3 pl-4 border-l-2 border-orange-200">
                                    <div className="text-xs font-semibold text-slate-600 mb-2">Business Rules:</div>
                                    <ul className="space-y-1">
                                      {value.businessRules.map((rule, idx) => (
                                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                          <span className="text-orange-500 mt-0.5">•</span>
                                          <span>{rule}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {value.examples && value.examples.length > 0 && (
                                  <div className="mt-3">
                                    <div className="text-xs font-semibold text-slate-600 mb-1">Examples:</div>
                                    <div className="flex flex-wrap gap-2">
                                      {value.examples.map((example, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {example}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {value.upstreamSource && (
                                  <div className="mt-3 pt-3 border-t">
                                    <div className="text-xs text-slate-500">
                                      <strong>Source System:</strong> {value.upstreamSource}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
