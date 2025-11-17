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
import { bankingAreas, bankingAreasStats } from "@/lib/banking-areas";
import {
  ArrowRight,
  Building2,
  Users,
  TrendingUp,
  Shield,
  Download,
} from "lucide-react";
import { exportBankingAreasToXLSX } from "@/lib/export-banking-data";
import { useToast } from "@/hooks/use-toast";

export default function BankingAreas() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAreaClick = (areaId: string) => {
    navigate(`/domains?area=${areaId}`);
  };

  const handleDownload = () => {
    try {
      exportBankingAreasToXLSX();
      toast({
        title: "Download Complete",
        description: "Banking areas data has been exported successfully.",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-orange-600 to-orange-700 p-16 text-white mb-12 shadow-2xl">
        <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-white/20 to-teal-400/10 blur-3xl" />
        <div className="absolute -left-32 -bottom-32 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-teal-400/20 to-green-400/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto">
          <Badge className="bg-white text-primary font-semibold mb-6 text-sm px-4 py-1.5 shadow-md">
            Enterprise Banking Data Platform
          </Badge>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6">
            Choose Your Banking Area
          </h1>

          <p className="text-xl text-slate-200 max-w-4xl mb-6 leading-relaxed">
            Navigate to your area of focus to access comprehensive data models,
            metrics, and analytics. Each banking area provides end-to-end
            coverage of domains, regulatory compliance, and business
            intelligence.
          </p>

          <div className="mb-10 flex gap-4">
            <Button
              onClick={() => navigate('/platform-summary')}
              size="lg"
              className="bg-white text-primary hover:bg-slate-100 font-semibold shadow-lg"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              View Platform Summary
            </Button>
            <Button
              onClick={handleDownload}
              size="lg"
              variant="outline"
              className="bg-white/50 text-white border-white/30 hover:bg-white/70 hover:text-primary font-semibold shadow-lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Data
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white/20 border border-white/30">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {bankingAreasStats.totalAreas}
                    </div>
                    <div className="text-sm text-slate-300">Banking Areas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white/20 border border-white/30">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {bankingAreasStats.totalDomainsCovered}
                    </div>
                    <div className="text-sm text-slate-300">Total Domains</div>
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
                    <div className="text-3xl font-bold text-white">
                      {bankingAreasStats.totalMetrics.toLocaleString()}+
                    </div>
                    <div className="text-sm text-slate-300">
                      Business Metrics
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
                    <div className="text-3xl font-bold text-white">
                      {bankingAreasStats.coreAreas}
                    </div>
                    <div className="text-sm text-slate-300">
                      Core Business Units
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Banking Areas Grid */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent mb-3">
            Banking Areas
          </h2>
          <p className="text-muted-foreground text-lg">
            Select a banking area to explore its domains, data models, and
            analytics capabilities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {bankingAreas.map((area) => (
            <Card
              key={area.id}
              className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-orange-100 hover:border-primary relative overflow-hidden"
              onClick={() => handleAreaClick(area.id)}
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{area.icon}</div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {area.name}
                      </CardTitle>
                      <Badge
                        variant={
                          area.strategicPriority === "Core"
                            ? "default"
                            : "secondary"
                        }
                        className="mt-2 bg-gradient-to-r from-primary to-orange-600 text-white"
                      >
                        {area.strategicPriority} Business
                      </Badge>
                    </div>
                  </div>
                </div>

                <CardDescription className="text-base text-slate-600 leading-relaxed">
                  {area.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative space-y-6">
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-orange-50 via-white to-teal-50 rounded-xl border border-orange-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                      {area.metrics.totalDomains}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      Domains
                    </div>
                  </div>
                  <div className="text-center border-x border-orange-200">
                    <div className="text-2xl font-bold bg-gradient-to-r from-secondary to-teal-600 bg-clip-text text-transparent">
                      {area.metrics.totalMetrics}+
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      Metrics
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-accent to-green-600 bg-clip-text text-transparent">
                      {area.metrics.customerSegments}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      Segments
                    </div>
                  </div>
                </div>

                {/* Key Capabilities */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">
                    Key Capabilities
                  </h4>
                  <div className="space-y-2">
                    {area.keyCapabilities.slice(0, 4).map((capability, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        <span>{capability}</span>
                      </div>
                    ))}
                    {area.keyCapabilities.length > 4 && (
                      <div className="text-sm text-slate-500 italic">
                        +{area.keyCapabilities.length - 4} more capabilities
                      </div>
                    )}
                  </div>
                </div>

                {/* Target Customers */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Target Customers
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {area.targetCustomers.map((customer, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {customer}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full group-hover:bg-slate-900 transition-colors"
                  onClick={() => handleAreaClick(area.id)}
                >
                  Explore {area.name}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-7xl mx-auto px-6 mt-16 mb-12">
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to dive deeper?</h3>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Select any banking area above to access comprehensive data models,
              metrics catalogs, regulatory compliance frameworks, and
              production-ready analytics
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary">
                View All Domains
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
