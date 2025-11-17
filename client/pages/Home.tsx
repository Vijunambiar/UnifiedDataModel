import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SourceToTargetMapping from "@/components/SourceToTargetMapping";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable, { type ColumnDef } from "@/components/DataTable";
import {
  bankingDomains,
  domainStats,
  type BankingDomain,
  type DomainPriority,
} from "@/lib/enterprise-domains";
import {
  internalDataSources,
  externalDataSources,
  dataSourceStats,
  getDataSourcesByDomain,
  type DataSource,
} from "@/lib/data-sources";
import { depositsStats } from "@/lib/deposits-domain-catalog";
import { getBankingAreaById, getDomainIdsForArea } from "@/lib/banking-areas";
import {
  retailBankingStats,
  getRetailCompletionStats,
} from "@/lib/retail-banking-stats";
import { referenceDataCatalog } from "@/lib/reference-data-catalog";
import {
  ArrowRight,
  Database,
  GitBranch,
  Shield,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Users,
  CreditCard,
  Landmark,
  Smartphone,
  Building,
  UserCheck,
  ShoppingCart,
  Repeat,
  Target,
  ArrowRightLeft,
} from "lucide-react";

function PlatformOverview({
  bankingAreaId,
  bankingAreaName,
}: {
  bankingAreaId?: string;
  bankingAreaName?: string;
}) {
  const navigate = useNavigate();

  // Get area-specific stats
  const isRetailArea = bankingAreaId === "retail";
  const isCommercialArea = bankingAreaId === "commercial";
  const retailStats = isRetailArea ? getRetailCompletionStats() : null;
  const areaInfo = bankingAreaId ? getBankingAreaById(bankingAreaId) : null;

  // Use area-specific stats if viewing a specific area, otherwise global stats
  const displayStats = isRetailArea
    ? {
        totalDomains: retailStats!.total,
        completedDomains: retailStats!.completed,
        totalMetrics: retailStats!.metrics,
        totalGoldTables: retailStats!.goldTables,
        completionPercentage: retailStats!.percentage,
      }
    : areaInfo
      ? {
          totalDomains: areaInfo.metrics.totalDomains,
          totalMetrics: areaInfo.metrics.totalMetrics,
          totalGoldTables: 0, // Will be calculated from domain data
        }
      : {
          totalDomains: domainStats.totalDomains,
          totalMetrics: domainStats.totalMetrics,
          totalGoldTables: domainStats.totalGoldTables,
        };

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-orange-600 to-orange-700 p-12 text-white shadow-2xl">
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br from-white/20 to-teal-400/10 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-gradient-to-br from-teal-400/20 to-green-400/10 blur-3xl" />

      <div className="relative">
        {bankingAreaId && (
          <Button
            variant="ghost"
            className="mb-4 text-slate-300 hover:text-white hover:bg-white/10"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Banking Areas
          </Button>
        )}

        <Badge className="bg-white text-primary font-semibold mb-4 shadow-md">
          {bankingAreaId
            ? `${bankingAreaName} Banking`
            : "Enterprise Banking Data Platform"}
        </Badge>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          {bankingAreaId
            ? `${bankingAreaName} Domains`
            : "Unified Data Model for Modern Banking"}
        </h1>
        <p className="text-xl text-slate-200 max-w-4xl mb-8 leading-relaxed">
          {bankingAreaId
            ? `Explore comprehensive data models and analytics for ${bankingAreaName} operations. Access domain-specific metrics, regulatory compliance frameworks, and production-ready data architecture.`
            : `Enterprise-grade unified data platform serving ${domainStats.totalDomains} banking domains with ${domainStats.totalMetrics}+ metrics across Bronze-Silver-Gold-Semantic architecture. Built for regulatory compliance, advanced analytics, and ML-ready data foundation.`}
        </p>

        {isRetailArea && (
          <div className="bg-white/10 border border-white/30 rounded-lg p-4 mb-6 backdrop-blur">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 text-green-300" />
              <span className="font-semibold text-white">
                Implementation Progress:
              </span>
              <span className="text-slate-200">
                {retailStats!.completed} of {retailStats!.total} domains
                completed ({retailStats!.percentage}%)
              </span>
              <span className="ml-2 text-slate-300">
                • {retailStats!.metrics.toLocaleString()} metrics deployed
              </span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20 border border-white/30">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {isRetailArea
                      ? `${displayStats.completedDomains}/${displayStats.totalDomains}`
                      : displayStats.totalDomains}
                  </div>
                  <div className="text-sm text-slate-300">
                    {isRetailArea
                      ? "Domains Complete"
                      : bankingAreaId
                        ? "Banking Domains"
                        : "Banking Domains"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20 border border-white/30">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {displayStats.totalMetrics.toLocaleString()}+
                  </div>
                  <div className="text-sm text-slate-300">Business Metrics</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20 border border-white/30">
                  <GitBranch className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {isRetailArea
                      ? retailStats!.bronzeTables + retailStats!.silverTables
                      : dataSourceStats.totalSources}
                  </div>
                  <div className="text-sm text-slate-300">
                    {isRetailArea ? "Bronze+Silver Tables" : "Data Sources"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20 border border-white/30">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {displayStats.totalGoldTables}
                  </div>
                  <div className="text-sm text-slate-300">Gold Tables</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Badge
            variant="outline"
            className="bg-white/20 text-white border-white/40 px-4 py-1.5 backdrop-blur"
          >
            🟠 Bronze: Raw & Immutable
          </Badge>
          <Badge
            variant="outline"
            className="bg-white/20 text-white border-white/40 px-4 py-1.5 backdrop-blur"
          >
            🔵 Silver: Cleaned & Conformed
          </Badge>
          <Badge
            variant="outline"
            className="bg-white/20 text-white border-white/40 px-4 py-1.5 backdrop-blur"
          >
            🟢 Gold: Dimensional & Metrics
          </Badge>
          <Badge
            variant="outline"
            className="bg-white/20 text-white border-white/40 px-4 py-1.5 backdrop-blur"
          >
            ⭐ Semantic: Business Layer
          </Badge>
        </div>

        <div className="flex gap-4">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            Get Started with Domain Selection
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-orange-400 border-orange-500 text-white hover:bg-orange-500"
          >
            View Architecture Details
          </Button>
        </div>
      </div>
    </section>
  );
}

function DomainExplorer({ allowedDomainIds }: { allowedDomainIds?: string[] }) {
  const [priorityFilter, setPriorityFilter] = useState<DomainPriority | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredDomains = useMemo(() => {
    return bankingDomains.filter((domain) => {
      const matchesPriority =
        priorityFilter === "all" || domain.priority === priorityFilter;
      const matchesSearch =
        !searchQuery ||
        domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        domain.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        domain.subDomains.some((sd) =>
          sd.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      const matchesArea =
        !allowedDomainIds || allowedDomainIds.includes(domain.id);
      return matchesPriority && matchesSearch && matchesArea;
    });
  }, [priorityFilter, searchQuery, allowedDomainIds]);

  const getPriorityColor = (priority: DomainPriority) => {
    switch (priority) {
      case "P0":
        return "bg-red-100 text-red-800 border-red-300";
      case "P1":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "P2":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "P3":
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getComplexityIcon = (complexity: string) => {
    if (complexity === "Very High")
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    if (complexity === "High")
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  };

  // Calculate total domains for the area (not global)
  const totalDomainsInArea = allowedDomainIds
    ? allowedDomainIds.length
    : bankingDomains.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Banking Domains</h2>
          <p className="text-muted-foreground mt-1">
            {filteredDomains.length} of {totalDomainsInArea} domains · Select a
            domain to explore its unified data model
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 md:w-64 h-10 px-3 rounded-md border bg-background"
          />
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as DomainPriority | "all")
            }
            className="h-10 px-3 rounded-md border bg-background"
          >
            <option value="all">All Priorities</option>
            <option value="P0">P0 - Critical</option>
            <option value="P1">P1 - High</option>
            <option value="P2">P2 - Medium</option>
            <option value="P3">P3 - Standard</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDomains.map((domain) => (
          <Card
            key={domain.id}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="text-4xl">{domain.icon}</div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className={getPriorityColor(domain.priority)}
                  >
                    {domain.priority}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {domain.name}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {domain.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  {getComplexityIcon(domain.complexity)}
                  <span className="text-muted-foreground">
                    {domain.complexity}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">
                    {domain.id === "deposits"
                      ? depositsStats.totalMetrics
                      : domain.keyMetricsCount}{" "}
                    metrics
                  </span>
                </div>
                <div className="text-muted-foreground col-span-2">
                  {domain.dataSources.length} data sources
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {domain.subDomains.slice(0, 3).map((sd) => (
                  <Badge key={sd} variant="secondary" className="text-xs">
                    {sd}
                  </Badge>
                ))}
                {domain.subDomains.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{domain.subDomains.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-2">
                  Tables by Layer:
                </div>
                <div className="flex gap-2 text-xs">
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                    Bronze: {domain.tablesCount.bronze}
                  </Badge>
                  <Badge className="bg-zinc-200 text-zinc-800 border-zinc-400">
                    Silver: {domain.tablesCount.silver}
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-400">
                    Gold: {domain.tablesCount.gold}
                  </Badge>
                </div>
              </div>

              <Button
                className="w-full group-hover:from-primary group-hover:to-orange-600 bg-gradient-to-r from-orange-500 to-orange-600 transition-all shadow-md"
                onClick={() => navigate(`/domain/${domain.id}`)}
              >
                Explore {domain.name}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DataSourcesCatalog({
  allowedDomainIds,
}: {
  allowedDomainIds?: string[];
}) {
  const [sourceType, setSourceType] = useState<"all" | "internal" | "external">(
    "all",
  );

  const displaySources = useMemo(() => {
    let sources: DataSource[];
    if (sourceType === "internal") sources = internalDataSources;
    else if (sourceType === "external") sources = externalDataSources;
    else sources = [...internalDataSources, ...externalDataSources];

    // Filter by banking area if specified
    if (allowedDomainIds && allowedDomainIds.length > 0) {
      sources = sources.filter((source) =>
        source.domains.some((domain) => allowedDomainIds.includes(domain)),
      );
    }

    return sources;
  }, [sourceType, allowedDomainIds]);

  // Calculate stats based on filtered sources (for area-specific view) or all sources
  const filteredStats = useMemo(() => {
    const allFiltered =
      allowedDomainIds && allowedDomainIds.length > 0
        ? [...internalDataSources, ...externalDataSources].filter((source) =>
            source.domains.some((domain) => allowedDomainIds.includes(domain)),
          )
        : [...internalDataSources, ...externalDataSources];

    const internalFiltered =
      allowedDomainIds && allowedDomainIds.length > 0
        ? internalDataSources.filter((source) =>
            source.domains.some((domain) => allowedDomainIds.includes(domain)),
          )
        : internalDataSources;

    const externalFiltered =
      allowedDomainIds && allowedDomainIds.length > 0
        ? externalDataSources.filter((source) =>
            source.domains.some((domain) => allowedDomainIds.includes(domain)),
          )
        : externalDataSources;

    return {
      totalSources: allFiltered.length,
      internal: internalFiltered.length,
      external: externalFiltered.length,
      realTime: allFiltered.filter((s) => s.refreshFrequency === "real-time")
        .length,
      critical: allFiltered.filter((s) => s.criticalityLevel === "Critical")
        .length,
    };
  }, [allowedDomainIds]);

  const internalColumns: ColumnDef<DataSource>[] = [
    {
      header: "System Name",
      accessor: (row) => (
        <div>
          <div className="font-semibold">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.category}</div>
        </div>
      ),
    },
    { header: "Vendor", accessor: (row) => row.vendor || "In-house" },
    {
      header: "Domains",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.domains.slice(0, 2).map((d) => (
            <Badge key={d} variant="outline" className="text-xs">
              {d}
            </Badge>
          ))}
          {row.domains.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{row.domains.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Refresh",
      accessor: (row) => (
        <Badge
          variant={
            row.refreshFrequency === "real-time" ? "default" : "secondary"
          }
        >
          {row.refreshFrequency}
        </Badge>
      ),
    },
    { header: "Volume/Day", accessor: (row) => row.volumeDaily },
    {
      header: "Integration",
      accessor: (row) => (
        <Badge variant="outline">{row.integrationMethod}</Badge>
      ),
    },
    {
      header: "Criticality",
      accessor: (row) => (
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
  ];

  const externalColumns: ColumnDef<DataSource>[] = [
    {
      header: "Provider",
      accessor: (row) => (
        <div>
          <div className="font-semibold">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.category}</div>
        </div>
      ),
    },
    { header: "Vendor", accessor: (row) => row.vendor || "-" },
    {
      header: "Use Cases",
      accessor: (row) => (
        <div className="max-w-xs text-sm text-muted-foreground line-clamp-2">
          {row.description}
        </div>
      ),
    },
    {
      header: "Refresh",
      accessor: (row) => (
        <Badge variant="secondary" className="text-xs">
          {row.refreshFrequency}
        </Badge>
      ),
    },
    {
      header: "Integration",
      accessor: (row) => (
        <Badge variant="outline" className="text-xs">
          {row.integrationMethod}
        </Badge>
      ),
    },
    {
      header: "Cost Model",
      accessor: (row) => <span className="text-xs">{row.cost || "N/A"}</span>,
    },
  ];

  return (
    <Tabs defaultValue="catalog" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
        <TabsTrigger value="catalog">Data Sources Catalog</TabsTrigger>
        <TabsTrigger value="mapping">Source-to-Target Mapping</TabsTrigger>
      </TabsList>

      <TabsContent value="catalog" className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Data Sources Inventory</h2>
            <p className="text-muted-foreground mt-1">
              {filteredStats.totalSources} total sources ·{" "}
              {filteredStats.internal} internal · {filteredStats.external}{" "}
              external
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={sourceType === "all" ? "default" : "outline"}
              onClick={() => setSourceType("all")}
            >
              All Sources ({filteredStats.totalSources})
            </Button>
            <Button
              variant={sourceType === "internal" ? "default" : "outline"}
              onClick={() => setSourceType("internal")}
            >
              Internal ({filteredStats.internal})
            </Button>
            <Button
              variant={sourceType === "external" ? "default" : "outline"}
              onClick={() => setSourceType("external")}
            >
              External ({filteredStats.external})
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {sourceType === "internal"
                ? "Internal Systems"
                : sourceType === "external"
                  ? "External Providers"
                  : "All Data Sources"}
            </CardTitle>
            <CardDescription>
              Comprehensive catalog of data sources feeding the unified data
              model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={
                sourceType === "external" ? externalColumns : internalColumns
              }
              data={displaySources}
            />
          </CardContent>
        </Card>

        {sourceType === "all" && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Real-time Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {filteredStats.realTime}
                </div>
                <p className="text-sm text-muted-foreground">
                  Streaming/CDC integration
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Critical Systems</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {filteredStats.critical}
                </div>
                <p className="text-sm text-muted-foreground">
                  Mission-critical sources
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">External Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {dataSourceStats.external}
                </div>
                <p className="text-sm text-muted-foreground">
                  Third-party providers
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      <TabsContent value="mapping">
        <SourceToTargetMapping />
      </TabsContent>
    </Tabs>
  );
}

function RetailEcosystemView() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent mb-3">
          Retail Banking Ecosystem
        </h2>
        <p className="text-muted-foreground text-lg max-w-4xl mx-auto">
          A comprehensive view of the retail banking landscape showing customer
          lifecycle stages, key systems, domain relationships, and data flows
        </p>
      </div>

      {/* Customer Lifecycle */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-orange-50">
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" />
            Customer Lifecycle Stages
          </CardTitle>
          <CardDescription>
            End-to-end journey of retail banking customers
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-5 gap-4">
            {[
              {
                stage: "Acquisition",
                icon: Target,
                color: "text-blue-600",
                bg: "bg-blue-50",
                domains: ["Marketing", "Digital"],
              },
              {
                stage: "Onboarding",
                icon: UserCheck,
                color: "text-green-600",
                bg: "bg-green-50",
                domains: ["Customer-Retail", "Compliance"],
              },
              {
                stage: "Growth",
                icon: TrendingUp,
                color: "text-orange-600",
                bg: "bg-orange-50",
                domains: ["Deposits", "Loans", "Cards"],
              },
              {
                stage: "Engagement",
                icon: Repeat,
                color: "text-purple-600",
                bg: "bg-purple-50",
                domains: ["Payments", "Digital", "Branch"],
              },
              {
                stage: "Retention",
                icon: Shield,
                color: "text-teal-600",
                bg: "bg-teal-50",
                domains: ["Customer Service", "Investment"],
              },
            ].map((item) => (
              <Card
                key={item.stage}
                className="border-2 hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6 text-center">
                  <div
                    className={`mx-auto w-16 h-16 rounded-full ${item.bg} flex items-center justify-center mb-3`}
                  >
                    <item.icon className={`h-8 w-8 ${item.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.stage}</h3>
                  <div className="space-y-1">
                    {item.domains.map((domain) => (
                      <Badge key={domain} variant="outline" className="text-xs">
                        {domain}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Core Systems */}
      <Card className="border-2 border-teal-200">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-teal-600" />
            Core Systems & Platforms
          </CardTitle>
          <CardDescription>
            Key technology platforms powering retail banking operations
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Core Banking System",
                icon: Landmark,
                color: "text-blue-600",
                bg: "bg-blue-50",
                description: "Account management, transactions, GL",
                domains: ["Deposits", "Loans", "Customer"],
                coverage: "Bronze, Silver, Gold",
              },
              {
                name: "Digital Banking Platform",
                icon: Smartphone,
                color: "text-purple-600",
                bg: "bg-purple-50",
                description: "Mobile & web banking experiences",
                domains: ["Digital", "Payments", "Customer Service"],
                coverage: "Silver, Gold",
              },
              {
                name: "CRM & Marketing",
                icon: Users,
                color: "text-orange-600",
                bg: "bg-orange-50",
                description: "Customer 360, campaigns, analytics",
                domains: ["Customer", "Marketing", "Customer Service"],
                coverage: "Gold, Semantic",
              },
              {
                name: "Card Management",
                icon: CreditCard,
                color: "text-green-600",
                bg: "bg-green-50",
                description: "Credit/debit card processing & rewards",
                domains: ["Cards", "Payments", "Fraud"],
                coverage: "Bronze, Silver, Gold",
              },
              {
                name: "Branch Operations",
                icon: Building,
                color: "text-teal-600",
                bg: "bg-teal-50",
                description: "Branch transactions & staff management",
                domains: ["Branch", "Customer Service"],
                coverage: "Bronze, Silver",
              },
              {
                name: "Loan Origination System",
                icon: ShoppingCart,
                color: "text-red-600",
                bg: "bg-red-50",
                description: "Loan applications & underwriting",
                domains: ["Loans", "Compliance", "Risk"],
                coverage: "Bronze, Silver, Gold",
              },
            ].map((system) => (
              <Card
                key={system.name}
                className="hover:shadow-xl transition-all border-2"
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg ${system.bg}`}>
                      <system.icon className={`h-6 w-6 ${system.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{system.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {system.description}
                  </p>
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-2">
                      Connected Domains:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {system.domains.map((domain) => (
                        <Badge
                          key={domain}
                          variant="secondary"
                          className="text-xs"
                        >
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 pt-2 border-t">
                    <strong>Data Layers:</strong> {system.coverage}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Domain Relationships */}
      <Card className="border-2 border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-orange-600" />
            Key Domain Relationships
          </CardTitle>
          <CardDescription>
            How retail banking domains interact and share data
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                from: "Customer-Retail",
                to: "All Domains",
                relationship: "Golden Record",
                description:
                  "Provides unified customer identity and attributes to all domains",
                type: "One-to-Many",
                dataFlow: "Customer ID, Demographics, Segments",
              },
              {
                from: "Deposits-Retail",
                to: "Customer-Retail",
                relationship: "Account Ownership",
                description:
                  "Links checking/savings accounts to customer profiles",
                type: "Many-to-One",
                dataFlow: "Account balances, transactions, product holdings",
              },
              {
                from: "Cards-Retail",
                to: "Payments-Retail",
                relationship: "Transaction Processing",
                description: "Card transactions flow through payment networks",
                type: "Many-to-Many",
                dataFlow: "Authorizations, settlements, interchange",
              },
              {
                from: "Digital-Retail",
                to: "Branch-Retail",
                relationship: "Omnichannel Experience",
                description: "Unified customer experience across channels",
                type: "Bidirectional",
                dataFlow: "Session data, preferences, transaction history",
              },
              {
                from: "Marketing-Retail",
                to: "Customer-Retail",
                relationship: "Campaign Targeting",
                description: "Uses customer data for personalized campaigns",
                type: "Many-to-One",
                dataFlow: "Segments, propensity scores, campaign responses",
              },
              {
                from: "Fraud-Retail",
                to: "Payments/Cards",
                relationship: "Risk Monitoring",
                description: "Real-time fraud detection on transactions",
                type: "Many-to-Many",
                dataFlow: "Transaction alerts, risk scores, fraud flags",
              },
            ].map((rel, idx) => (
              <Card
                key={idx}
                className="border hover:border-primary/50 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      {rel.from}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="font-mono text-xs">
                      {rel.to}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">
                    {rel.relationship}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    {rel.description}
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary text-xs">
                        {rel.type}
                      </Badge>
                    </div>
                    <div className="text-slate-600">
                      <strong>Data Flow:</strong> {rel.dataFlow}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Foundational Reference Data */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Foundational Reference Data
          </CardTitle>
          <CardDescription>
            Critical enumerations and code values that power the data model
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {referenceDataCatalog.slice(0, 4).map((refData) => (
              <Card
                key={refData.id}
                className="border hover:border-primary/50 transition-colors"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{refData.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {refData.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Values Defined:
                      </span>
                      <Badge variant="secondary">{refData.values.length}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {refData.values.slice(0, 3).map((val) => (
                        <Badge
                          key={val.code}
                          variant="outline"
                          className="text-xs font-mono"
                        >
                          {val.code}
                        </Badge>
                      ))}
                      {refData.values.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{refData.values.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-2 pt-2 border-t">
                      <strong>Used in:</strong> {refData.domain.join(", ")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              View complete reference data in individual domain pages under the
              "Reference Data" tab
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">15</div>
              <div className="text-sm text-muted-foreground">
                Retail Domains
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">6</div>
              <div className="text-sm text-muted-foreground">Core Systems</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-600">5</div>
              <div className="text-sm text-muted-foreground">
                Lifecycle Stages
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">100%</div>
              <div className="text-sm text-muted-foreground">Data Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  const [searchParams] = useSearchParams();

  // Get banking area from URL params
  const bankingAreaId = searchParams.get("area");
  const bankingArea = bankingAreaId
    ? getBankingAreaById(bankingAreaId)
    : undefined;
  const allowedDomainIds = bankingAreaId
    ? getDomainIdsForArea(bankingAreaId)
    : undefined;

  return (
    <div className="space-y-12 pb-12">
      <PlatformOverview
        bankingAreaId={bankingAreaId || undefined}
        bankingAreaName={bankingArea?.name}
      />

      <Tabs defaultValue="domains" className="w-full">
        <TabsList
          className={`grid w-full ${bankingAreaId === "retail" ? "grid-cols-3 max-w-2xl" : "grid-cols-2 max-w-md"}`}
        >
          <TabsTrigger value="domains">Domain Explorer</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          {bankingAreaId === "retail" && (
            <TabsTrigger value="ecosystem">Ecosystem View</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="domains" className="mt-8">
          <DomainExplorer allowedDomainIds={allowedDomainIds} />
        </TabsContent>

        <TabsContent value="sources" className="mt-8">
          <DataSourcesCatalog allowedDomainIds={allowedDomainIds} />
        </TabsContent>

        {bankingAreaId === "retail" && (
          <TabsContent value="ecosystem" className="mt-8">
            <RetailEcosystemView />
          </TabsContent>
        )}
      </Tabs>

      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            Quick Start: Domain Selection Wizard
          </CardTitle>
          <CardDescription>
            Get started with the unified data model by selecting your priority
            domain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Our recommendation: Start with <strong>Loans & Lending</strong>{" "}
            domain due to regulatory urgency (CECL/IFRS 9), clear data lineage,
            and high stakeholder visibility. This domain provides a solid
            foundation with{" "}
            {bankingDomains.find((d) => d.id === "loans")?.keyMetricsCount}{" "}
            pre-built metrics and comprehensive ECL calculations.
          </p>
          <div className="flex gap-3">
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => (window.location.href = "/domain/loans")}
            >
              Start with Loans Domain
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/layers")}
            >
              View Layer Architecture
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
