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
import { pilotDomains } from "@/lib/domains/registry";
import {
  ArrowRight,
  Database,
  GitBranch,
  Layers,
  BarChart3,
  Zap,
  Map,
  Cpu,
} from "lucide-react";

// Helper function to provide fallback descriptions for domains
function getDomainDescription(domainId: string): string {
  const descriptions: Record<string, string> = {
    customer: "Unified customer 360° domain covering retail customer lifecycle, demographics, segments, KYC/CDD compliance, relationship management, and customer preferences across all channels and products",
    deposits: "Comprehensive deposits domain covering deposit accounts, daily balances, transaction details, counterparty relationships, and regulatory metrics for deposit products",
    transactions: "Complete transactions domain covering payment processing, ACH/Wire transfers, transaction categorization, fraud detection, compliance screening, and counterparty analysis",
  };

  return descriptions[domainId] || "Explore this domain to view comprehensive data models, business metrics, and operational specifications";
}

export default function PlatformBlueprintHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-orange-600 to-orange-700 p-16 text-white mb-12 shadow-2xl">
        <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-white/20 to-teal-400/10 blur-3xl" />
        <div className="absolute -left-32 -bottom-32 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-teal-400/20 to-green-400/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto">
          <Badge className="bg-white text-primary font-semibold mb-6 text-sm px-4 py-1.5 shadow-md">
            Data Architecture Reference
          </Badge>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6">
            7-Layer Banking Data Architecture
          </h1>

          <p className="text-xl text-slate-200 max-w-4xl mb-8 leading-relaxed">
            Complete retail banking data architecture covering business domains, use cases, metrics, data models, mappings, source systems, and operational specifications across Customer Core, Deposits, and Transactions domains.
          </p>

          <div className="flex gap-4">
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-white text-white hover:bg-white/10 font-semibold"
              onClick={() => navigate("/")}
            >
              <ArrowRight className="mr-2 h-5 w-5" />
              Previous Architecture
            </Button>
          </div>
        </div>
      </section>

      {/* Retail Banking Domains Section */}
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-3">Retail Banking Domains</h2>
          <p className="text-muted-foreground max-w-3xl">
            Three core retail banking domains: Customer Core, Deposits, and Transactions. Each includes domain specifications, business use cases, metrics, data models, source mappings, and operational components.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pilotDomains.map((domain) => {
            // Get metadata description or use domain display name as fallback
            const description =
              (domain.metadata && typeof domain.metadata === 'object' && 'description' in domain.metadata)
                ? domain.metadata.description
                : getDomainDescription(domain.id);

            const priority =
              (domain.metadata && typeof domain.metadata === 'object' && 'priority' in domain.metadata)
                ? domain.metadata.priority
                : 'P0';

            return (
              <Card
                key={domain.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() =>
                  navigate(`/platform-blueprint/domain/${domain.id}`)
                }
              >
                <CardHeader>
                  <CardTitle className="text-xl">{domain.displayName}</CardTitle>
                  <CardDescription>
                    {description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Priority:</span>
                      <Badge variant="outline">
                        {priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sub-Domains:</span>
                      <span className="font-semibold">
                        {domain.subDomains?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Use Cases:</span>
                      <span className="font-semibold">
                        {domain.useCases?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-primary"
                    onClick={() =>
                      navigate(`/platform-blueprint/domain/${domain.id}`)
                    }
                  >
                    Explore <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 7-Layer Architecture Section */}
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-3">Architecture Layers</h2>
          <p className="text-muted-foreground max-w-3xl">
            Seven layers of data architecture: business context, metrics and semantics, data models, source mappings, system integration, and operational specifications for each domain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            {
              layer: "Layer 1",
              title: "Banking Area Selection",
              description: "Business unit categorization: Retail, Commercial, Wealth, Mortgage, CIB, Operations, Risk & Compliance",
              icon: BarChart3,
              color: "bg-blue-50 text-blue-700",
            },
            {
              layer: "Layer 2",
              title: "Domain Overview & Use Cases",
              description: "Domain specifications, business problems addressed, stakeholders, implementation complexity, expected ROI",
              icon: Layers,
              color: "bg-purple-50 text-purple-700",
            },
            {
              layer: "Layer 3",
              title: "Business Metrics & Semantics",
              description: "Gold layer metrics, KPIs, business definitions, semantic glossary, metric formulas and lineage",
              icon: BarChart3,
              color: "bg-green-50 text-green-700",
            },
            {
              layer: "Layer 4",
              title: "Data Model Architecture",
              description: "Logical models, physical schemas for Bronze/Silver/Gold layers, entity relationships, table specifications",
              icon: Database,
              color: "bg-orange-50 text-orange-700",
            },
            {
              layer: "Layer 5",
              title: "Source-to-Target Mapping",
              description: "Column-level lineage, transformation rules, table coverage analysis, data quality requirements",
              icon: Map,
              color: "bg-pink-50 text-pink-700",
            },
            {
              layer: "Layer 6",
              title: "Source System Integration",
              description: "Source system specifications (FIS, PEGA, Salesforce, Adobe), connection parameters, data availability",
              icon: Cpu,
              color: "bg-indigo-50 text-indigo-700",
            },
            {
              layer: "Layer 7",
              title: "Operations & Implementation",
              description: "ETL job specifications, database DDL scripts, transformation logic, data quality rules, implementation guides",
              icon: GitBranch,
              color: "bg-teal-50 text-teal-700",
            },
          ].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card key={index} className="overflow-hidden">
                <CardHeader className={`${item.color} py-4`}>
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6" />
                    <div>
                      <p className="text-sm font-medium opacity-75">
                        {item.layer}
                      </p>
                      <p className="font-semibold">{item.title}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-3">Data Architecture Components</h2>
          <p className="text-muted-foreground max-w-3xl">
            Architecture ingests real Fiserv/FIS core banking system data, transforms it through medallion layers, and delivers insights: FIS source systems provide raw banking data, Snowflake hosts the warehouse, SQL and views handle transformations, Power BI enables analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "Fiserv/FIS",
              description: "Core banking source system",
              icon: "🏦",
            },
            {
              name: "Snowflake",
              description: "Cloud data warehouse",
              icon: "❄️",
            },
            {
              name: "SQL Transformations",
              description: "Data cleaning & modeling",
              icon: "📝",
            },
            {
              name: "Power BI",
              description: "Business intelligence & analytics",
              icon: "📊",
            },
          ].map((tech) => (
            <Card key={tech.name}>
              <CardContent className="pt-6">
                <div className="text-4xl mb-3">{tech.icon}</div>
                <p className="font-semibold mb-1">{tech.name}</p>
                <p className="text-sm text-muted-foreground">
                  {tech.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Retail Banking Domains</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Three retail banking domains with complete architecture specification: Customer Core domain covers customer 360 and lifecycle management; Deposits domain covers deposit accounts and regulatory metrics; Transactions domain covers payment processing and fraud detection. Click on any domain card above to explore.
        </p>
      </section>
    </div>
  );
}
