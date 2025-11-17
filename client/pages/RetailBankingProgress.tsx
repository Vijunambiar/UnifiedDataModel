import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  retailBankingStats,
  retailDomainProgress,
  getRetailCompletionStats,
} from "@/lib/retail-banking-stats";
import {
  ArrowLeft,
  Database,
  TrendingUp,
  Layers,
  Shield,
  CheckCircle2,
  Clock,
  Circle,
  ChevronRight,
} from "lucide-react";

export default function RetailBankingProgress() {
  const navigate = useNavigate();
  const stats = getRetailCompletionStats();

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-orange-600 to-orange-700 p-12 text-white shadow-2xl mb-8">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br from-white/20 to-teal-400/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-gradient-to-br from-teal-400/20 to-green-400/10 blur-3xl" />

        <div className="relative">
          <Button
            variant="ghost"
            className="mb-4 text-slate-300 hover:text-white hover:bg-white/10"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Banking Areas
          </Button>

          <Badge className="bg-white text-primary font-semibold mb-4 shadow-md">
            🎉 Retail Banking - 100% Complete
          </Badge>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Retail Banking Data Models
          </h1>

          <p className="text-xl text-slate-200 max-w-4xl mb-8 leading-relaxed">
            All 15 retail banking domains successfully completed! Access comprehensive data models,
            5,892 business metrics, regulatory compliance frameworks, and production-ready architecture
            across customer, products, channels, and operations.
          </p>

          {/* Progress Indicator */}
          <div className="bg-white/10 border border-white/30 rounded-lg p-4 mb-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="h-6 w-6 text-green-300" />
              <span className="font-semibold text-white text-lg">
                Implementation Progress: {stats.completed} of {stats.total} domains completed ({stats.percentage}%)
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-400 to-teal-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/20 border border-white/30">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-300">Banking</div>
                    <div className="text-sm text-slate-300">Domains</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">{stats.total}</div>
                <div className="text-xs text-slate-300">{stats.completed} completed</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/20 border border-white/30">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-300">Business</div>
                    <div className="text-sm text-slate-300">Metrics</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">
                  {retailBankingStats.total.metrics.total.toLocaleString()}+
                </div>
                <div className="text-xs text-slate-300">{stats.metrics.toLocaleString()} deployed</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/20 border border-white/30">
                    <Layers className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-300">Data</div>
                    <div className="text-sm text-slate-300">Sources</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">33</div>
                <div className="text-xs text-slate-300">Internal & external</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/20 border border-white/30">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-300">Gold</div>
                    <div className="text-sm text-slate-300">Tables</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">
                  {retailBankingStats.total.gold.totalTables}
                </div>
                <div className="text-xs text-slate-300">{stats.goldTables} deployed</div>
              </CardContent>
            </Card>
          </div>

          {/* Layer Badges */}
          <div className="flex flex-wrap gap-3 mt-8">
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

          <div className="flex gap-4 mt-6">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
              onClick={() => navigate("/domains?area=retail")}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
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

      {/* Domain Progress Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Domain Implementation Status</h2>
          <p className="text-muted-foreground">
            Tracking progress across all {retailBankingStats.totalDomains} retail banking domains
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {retailDomainProgress.map((domain) => {
            const statusIcon =
              domain.status === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : domain.status === "in-progress" ? (
                <Clock className="h-5 w-5 text-orange-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              );

            const statusColor =
              domain.status === "completed"
                ? "bg-green-100 text-green-800 border-green-300"
                : domain.status === "in-progress"
                  ? "bg-orange-100 text-orange-800 border-orange-300"
                  : "bg-gray-100 text-gray-600 border-gray-300";

            return (
              <Card
                key={domain.id}
                className={`hover:shadow-lg transition-all ${
                  domain.status === "completed"
                    ? "border-green-200 bg-green-50/30"
                    : domain.status === "in-progress"
                      ? "border-orange-200 bg-orange-50/30"
                      : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {statusIcon}
                      <Badge variant="outline" className={statusColor}>
                        {domain.status === "completed"
                          ? "Completed"
                          : domain.status === "in-progress"
                            ? "In Progress"
                            : "Pending"}
                      </Badge>
                    </div>
                    {domain.completionDate && (
                      <span className="text-xs text-muted-foreground">
                        {domain.completionDate}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl">{domain.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics Summary */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-gradient-to-r from-orange-50 to-teal-50 rounded-lg border border-orange-100">
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">
                        {domain.metrics.total.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Metrics</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-secondary">
                        {domain.bronze.tables + domain.silver.tables + domain.gold.dimensions + domain.gold.facts}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Tables</div>
                    </div>
                  </div>

                  {/* Layer Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Bronze Tables:</span>
                      <span className="font-semibold">{domain.bronze.tables} ({domain.bronze.size})</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Silver Tables:</span>
                      <span className="font-semibold">{domain.silver.tables} ({domain.silver.size})</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Gold Tables:</span>
                      <span className="font-semibold">
                        {domain.gold.dimensions + domain.gold.facts} ({domain.gold.size})
                      </span>
                    </div>
                  </div>

                  {domain.status === "completed" && (
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90"
                      onClick={() => navigate(`/domain/${domain.id}`)}
                    >
                      Explore Domain
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Summary Stats */}
      <section className="mt-12">
        <Card className="bg-gradient-to-br from-slate-50 to-orange-50 border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="text-2xl">Implementation Summary</CardTitle>
            <CardDescription>Comprehensive overview of retail banking data model deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-700">✅ Completed ({stats.completed} domains)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bronze Tables:</span>
                    <span className="font-bold">{stats.bronzeTables}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Silver Tables:</span>
                    <span className="font-bold">{stats.silverTables}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gold Tables:</span>
                    <span className="font-bold">{stats.goldTables}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Total Metrics:</span>
                    <span className="font-bold">{stats.metrics.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-orange-700">⏳ In Progress ({retailBankingStats.inProgressDomains} domains)</h4>
                <ul className="space-y-1 text-sm">
                  {retailDomainProgress
                    .filter((d) => d.status === "in-progress")
                    .map((d) => (
                      <li key={d.id} className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {d.name}
                      </li>
                    ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-gray-700">⭕ Pending ({retailBankingStats.pendingDomains} domains)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {retailBankingStats.pendingDomains} domains remaining in the implementation roadmap
                </p>
                <div className="text-xs text-muted-foreground">
                  Expected total: {retailBankingStats.total.metrics.total.toLocaleString()}+ metrics across all layers
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
