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
import { getPilotDomainById } from "@/lib/domains/registry";
import {
  ArrowLeft,
  Database,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const SOURCE_SYSTEMS = [
  {
    name: "FIS - Customer",
    type: "OLTP Source",
    technology: "FIS CUSTOMER, CUSTOMER_CONTACT, CUSTOMER_RELATIONSHIP",
    loadPattern: "Daily CDC",
    tables: 3,
    description: "Customer master, contact information, and relationships",
  },
  {
    name: "FIS-ADS - Deposits",
    type: "OLTP Source",
    technology: "FIS ACCOUNT, ACCOUNT_BALANCE, ACCOUNT_TRANSACTION, DEPOSIT_PRODUCT",
    loadPattern: "Real-time CDC",
    tables: 4,
    description: "Account details, balances, transactions, and product information",
  },
  {
    name: "FIS-ADS - Transactions",
    type: "OLTP Source",
    technology: "FIS PAYMENT, ACH_ITEM, WIRE_TRANSFER, CHECK_ITEM",
    loadPattern: "Real-time CDC",
    tables: 4,
    description: "Payment transactions, ACH items, wire transfers, and checks",
  },
];

export default function PlatformBlueprintDomainSources() {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const domain = getPilotDomainById(domainId || "");

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
          <h1 className="text-4xl font-bold">Source Systems</h1>
          <p className="text-muted-foreground mt-1">
            Data sources and integrations for {domain.displayName}
          </p>
        </div>
      </div>

      {/* Source Systems Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Source Systems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{SOURCE_SYSTEMS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {SOURCE_SYSTEMS.reduce((sum, s) => sum + s.tables, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Source Systems Details */}
      <div className="space-y-6">
        {SOURCE_SYSTEMS.map((system, idx) => (
          <Card key={`system-${idx}`}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Database className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <CardTitle>{system.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {system.description}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {system.technology}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Source Type
                  </p>
                  <p className="font-semibold text-sm">{system.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Load Pattern
                  </p>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <p className="font-semibold text-sm">{system.loadPattern}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tables</p>
                  <p className="font-semibold">{system.tables}</p>
                </div>
              </div>

              {/* Connection Details */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">Connection Details</h4>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Host:</span>
                    <span className="font-mono">{system.name.toLowerCase().replace(/\s+/g, "_")}.prod.db</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Port:</span>
                    <span className="font-mono">5432</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Encryption:</span>
                    <span className="font-mono">SSL/TLS</span>
                  </div>
                </div>
              </div>

              {/* Sample Tables */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Sample Tables</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {["accounts", "customers", "transactions", "products"]
                    .slice(0, 4)
                    .map((table, tIdx) => (
                      <div
                        key={`table-${tIdx}`}
                        className="border rounded-lg p-2 font-mono text-xs"
                      >
                        {table}
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Framework */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Data Integration Architecture</CardTitle>
          <CardDescription>
            FIS source to analytics pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-semibold text-sm">FIS Source Extraction</p>
                <p className="text-xs text-muted-foreground mt-1">
                  CDC and batch extraction from FIS core banking system tables
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-semibold text-sm">SQL Transformations</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Column mapping, standardization, and data quality enforcement
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <p className="font-semibold text-sm">Snowflake Cloud Data Warehouse</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Medallion architecture: Bronze (raw) → Silver (clean) → Gold (analytics)
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <p className="font-semibold text-sm">Quality Monitoring</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Data validation, reconciliation, and SLA monitoring
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingestion Schedule */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Ingestion Schedule</CardTitle>
          <CardDescription>
            Data refresh schedule and SLAs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-semibold">Real-time Sources</span>
              <Badge variant="outline">Every 5 minutes</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-semibold">Hourly Sources</span>
              <Badge variant="outline">Top of the hour</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Daily Sources</span>
              <Badge variant="outline">02:00 UTC</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
