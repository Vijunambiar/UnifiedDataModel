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
import { GoldMetricsTable } from "@/components/GoldMetricsTable";
import { getPilotDomainById, getPilotDomainGoldMetricsAsync } from "@/lib/domains/registry";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Target,
  Calculator,
  Table as TableIcon,
  Database,
  CheckCircle2,
  Loader,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function PlatformBlueprintDomainBusinessMetrics() {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const domain = getPilotDomainById(domainId || "");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      if (!domainId) return;

      try {
        setIsLoading(true);
        const data = await getPilotDomainGoldMetricsAsync(domainId);
        setMetrics(data || []);
      } catch (error) {
        console.error("Error loading metrics:", error);
        setMetrics([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, [domainId]);

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
          <p className="text-slate-600">Loading metrics...</p>
        </div>
      </div>
    );
  }

  // Get metrics from state - should be the complete goldMetrics array
  const allMetrics = metrics || [];

  // Group metrics by category for card view
  const metricsByCategory = allMetrics.reduce((acc: any, metric: any) => {
    const category = metric.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(metric);
    return acc;
  }, {});

  const getCategoryIcon = (category: string) => {
    if (category.includes("Volume")) return BarChart3;
    if (category.includes("Growth")) return TrendingUp;
    if (category.includes("Value")) return Calculator;
    if (category.includes("Engagement")) return TrendingUp;
    return Target;
  };

  const getCategoryColor = (category: string) => {
    if (category.includes("Volume")) return "bg-blue-50";
    if (category.includes("Growth")) return "bg-green-50";
    if (category.includes("Value")) return "bg-amber-50";
    if (category.includes("Engagement")) return "bg-purple-50";
    if (category.includes("Risk")) return "bg-red-50";
    return "bg-gray-50";
  };

  const metricCategories = Object.entries(metricsByCategory).map(([name, metrics]) => ({
    name,
    metrics,
    icon: getCategoryIcon(name),
    color: getCategoryColor(name),
  }));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/platform-blueprint/domain/${domainId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Business Metrics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gold Layer Semantic Definitions for {domain?.displayName}
          </p>
        </div>
      </div>

      {/* Metrics Overview Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Total Metrics</p>
            <p className="text-2xl font-bold">{allMetrics.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Source Tables</p>
            <p className="text-2xl font-bold">
              {new Set(allMetrics.flatMap((m) => m.sourceTables || [])).size}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Coverage</p>
            <p className="text-2xl font-bold">95%</p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center justify-between mb-6 bg-slate-50 p-3 rounded-lg">
        <h2 className="text-sm font-semibold">View Metrics</h2>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
            className="h-8 text-xs"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-8 text-xs"
          >
            <TableIcon className="h-3 w-3 mr-1" />
            Table
          </Button>
        </div>
      </div>

      {/* All Metrics - Table View */}
      {viewMode === "table" && (
        <div className="mb-8">
          <GoldMetricsTable
            metrics={allMetrics}
            title="Gold Layer Metrics Table"
            description="All metrics with source table mapping, derived from actual source tables"
          />
        </div>
      )}

      {/* All Metrics - Cards View */}
      {viewMode === "cards" && (
        <div className="space-y-8">
          {metricCategories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`${category.color} p-3 rounded-lg`}>
                  <category.icon className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{category.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {category.metrics.length} metrics
                  </p>
                </div>
              </div>

              {category.metrics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.metrics.map((metric, idx) => (
                    <Card key={metric.id || `${category.name}-${idx}`} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{metric.name}</CardTitle>
                          {metric.deprecated && (
                            <Badge variant="secondary">Deprecated</Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs">
                          {metric.id || metric.metricId}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Description
                          </p>
                          <p className="text-sm">{metric.description}</p>
                        </div>
                        {(metric.businessLogic || metric.formula) && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Formula
                            </p>
                            <p className="text-xs font-mono bg-gray-50 p-2 rounded overflow-x-auto">
                              {metric.businessLogic || metric.formula}
                            </p>
                          </div>
                        )}
                        {(metric.sourceTables && metric.sourceTables.length > 0) && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Source Tables
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {metric.sourceTables.map((table: string, idx: number) => (
                                <Badge key={`source-${idx}`} variant="secondary" className="text-xs">
                                  {table}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {metric.granularity && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Granularity
                            </p>
                            <Badge variant="outline">{metric.granularity}</Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <p className="text-muted-foreground">
                    No metrics in this category yet
                  </p>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Metrics Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Metrics Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Metrics</p>
              <p className="text-3xl font-bold">{allMetrics.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Categories</p>
              <p className="text-3xl font-bold">{metricCategories.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
