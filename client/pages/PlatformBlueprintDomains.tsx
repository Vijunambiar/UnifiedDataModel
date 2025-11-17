import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pilotDomains } from "@/lib/domains/registry";
import { ArrowRight, Users, Landmark, Zap } from "lucide-react";

// Helper function to provide fallback descriptions for domains
function getDomainDescription(domainId: string): string {
  const descriptions: Record<string, string> = {
    customer: "Unified customer 360° domain covering retail customer lifecycle, demographics, segments, KYC/CDD compliance, relationship management, and customer preferences across all channels and products",
    deposits: "Comprehensive deposits domain covering deposit accounts, daily balances, transaction details, counterparty relationships, and regulatory metrics for deposit products",
    transactions: "Complete transactions domain covering payment processing, ACH/Wire transfers, transaction categorization, fraud detection, compliance screening, and counterparty analysis",
  };

  return descriptions[domainId] || "Explore this domain to view comprehensive data models, business metrics, and operational specifications";
}

export default function PlatformBlueprintDomains() {
  const navigate = useNavigate();

  const domainIcons: Record<string, React.ReactNode> = {
    customer: <Users className="h-8 w-8" />,
    deposits: <Landmark className="h-8 w-8" />,
    transactions: <Zap className="h-8 w-8" />,
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Retail Banking Domains</h1>
            <p className="text-lg text-muted-foreground">
              Three foundational retail banking domains with complete
              metadata, use cases, metrics, and code generation.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/platform-blueprint")}
          >
            Back to Overview
          </Button>
        </div>
      </section>

      {/* Domain Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {pilotDomains.map((domain) => (
          <Card
            key={domain.id}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() =>
              navigate(`/platform-blueprint/domain/${domain.id}`)
            }
          >
            {/* Domain Icon Header */}
            <div
              className={`p-6 ${
                domain.id === "customer"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : domain.id === "deposits"
                    ? "bg-gradient-to-br from-green-500 to-green-600"
                    : "bg-gradient-to-br from-orange-500 to-orange-600"
              } text-white flex items-center gap-4`}
            >
              {domainIcons[domain.id]}
              <div>
                <h2 className="text-2xl font-bold">{domain.displayName}</h2>
              </div>
            </div>

            <CardContent className="pt-6">
              {/* Description */}
              <p className="text-muted-foreground mb-6">
                {(domain.metadata && typeof domain.metadata === 'object' && 'description' in domain.metadata)
                  ? domain.metadata.description
                  : getDomainDescription(domain.id)}
              </p>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <Badge variant="outline" className="text-sm">
                    {(domain.metadata && typeof domain.metadata === 'object' && 'priority' in domain.metadata)
                      ? domain.metadata.priority
                      : 'P0'}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Complexity
                  </p>
                  <p className="text-sm font-semibold">
                    {(domain.metadata && typeof domain.metadata === 'object' && 'complexity' in domain.metadata)
                      ? domain.metadata.complexity
                      : 'High'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Sub-Domains</p>
                  <p className="text-sm font-semibold">
                    {domain.subDomains?.length || 0}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Status
                  </p>
                  <p className="text-sm font-semibold">Active</p>
                </div>
              </div>

              {/* Key Entities */}
              {domain.metadata && typeof domain.metadata === 'object' && 'keyEntities' in domain.metadata && Array.isArray(domain.metadata.keyEntities) && domain.metadata.keyEntities.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2">Key Entities</p>
                  <div className="flex flex-wrap gap-2">
                    {domain.metadata.keyEntities.slice(0, 4).map((entity) => (
                      <Badge key={entity} variant="secondary">
                        {entity}
                      </Badge>
                    ))}
                    {domain.metadata.keyEntities.length > 4 && (
                      <Badge variant="outline">
                        +{domain.metadata.keyEntities.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Source System */}
              <div className="mb-6 bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Source System
                </p>
                <p className="text-sm font-semibold">
                  {(domain.metadata && typeof domain.metadata === 'object' && 'sourceSystem' in domain.metadata)
                    ? domain.metadata.sourceSystem
                    : 'FIS'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(domain.metadata && typeof domain.metadata === 'object' && 'sourceTable' in domain.metadata)
                    ? domain.metadata.sourceTable
                    : 'Multiple tables'}
                </p>
              </div>

              {/* CTA Button */}
              <Button
                onClick={() =>
                  navigate(`/platform-blueprint/domain/${domain.id}`)
                }
                className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-primary hover:to-orange-700"
              >
                Explore Domain <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Information Section */}
      <section className="mt-16 pt-16 border-t">
        <h2 className="text-2xl font-bold mb-6">What's Included in Each Domain?</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "Domain Overview",
              description: "Complete specifications, metadata, and governance",
            },
            {
              title: "Business Use Cases",
              description: "Real-world problems solved with expected ROI",
            },
            {
              title: "Metrics & Definitions",
              description: "Gold layer metrics and semantic glossary",
            },
            {
              title: "Data Models",
              description: "Bronze/Silver/Gold layer schemas and relationships",
            },
            {
              title: "STTM & Lineage",
              description: "Source-to-target column mapping and lineage",
            },
            {
              title: "Code Generation",
              description: "Matillion jobs, dbt models, DDL scripts",
            },
            {
              title: "Data Quality",
              description: "Test definitions, anomaly detection, monitoring",
            },
            {
              title: "Operational Runbooks",
              description: "Setup guides, troubleshooting, best practices",
            },
          ].map((item, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
