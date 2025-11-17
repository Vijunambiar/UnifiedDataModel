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
import { getPilotDomainById } from "@/lib/domains/registry";
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

export default function PlatformBlueprintDomainSTTM() {
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

  const totalMappings = domain.sttmMapping.length;
  const coveragePercent = Math.round(
    ((totalMappings - (domain.sttmGaps?.length || 0)) / totalMappings) * 100
  );

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
          <h1 className="text-4xl font-bold">Source-to-Target Mapping</h1>
          <p className="text-muted-foreground mt-1">
            Complete mapping catalog for {domain.displayName}
          </p>
        </div>
      </div>

      {/* Coverage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Mappings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalMappings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{coveragePercent}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Mapped
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalMappings - (domain.sttmGaps?.length || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {domain.sttmGaps?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mapping Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Source to Target Mappings</CardTitle>
          <CardDescription>
            Complete mapping of source columns to target data warehouse tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Source System</TableHead>
                  <TableHead className="w-1/4">Source Column</TableHead>
                  <TableHead className="w-1/4">Target Table</TableHead>
                  <TableHead className="w-1/4">Target Column</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domain.sttmMapping.slice(0, 10).map((mapping, idx) => (
                  <TableRow key={`mapping-${idx}`}>
                    <TableCell className="font-mono text-xs">
                      {mapping.sourceSystem}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {mapping.sourceColumn}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {mapping.targetTable}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {mapping.targetColumn}
                    </TableCell>
                    <TableCell>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {domain.sttmMapping.length > 10 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                +{domain.sttmMapping.length - 10} more mappings
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Coverage by Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Coverage by Target Table</CardTitle>
          <CardDescription>
            Mapping completeness for each target table
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {domain.tableCoverage?.slice(0, 5).map((table, idx) => (
              <div key={table.name || `table-${idx}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{table.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(table.coverage)}% mapped
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${table.coverage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gaps & Issues */}
      {domain.sttmGaps && domain.sttmGaps.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Identified Gaps</CardTitle>
                <CardDescription>
                  Source columns that need mapping or resolution
                </CardDescription>
              </div>
              <Badge variant="destructive">{domain.sttmGaps.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {domain.sttmGaps.slice(0, 5).map((gap, idx) => (
                <div
                  key={`gap-${idx}`}
                  className="flex items-start gap-3 p-3 border border-red-100 bg-red-50 rounded-lg"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{gap.sourceColumn}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {gap.reason}
                    </p>
                  </div>
                </div>
              ))}
              {domain.sttmGaps.length > 5 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  +{domain.sttmGaps.length - 5} more gaps
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transformation Logic */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Transformation Patterns</CardTitle>
          <CardDescription>
            Common transformation logic applied to mappings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-semibold text-sm">Direct Mapping</p>
              <p className="text-xs text-muted-foreground mt-1">
                Column copied directly from source to target
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-semibold text-sm">Type Conversion</p>
              <p className="text-xs text-muted-foreground mt-1">
                Data type transformations (e.g., string to date)
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="font-semibold text-sm">Business Logic</p>
              <p className="text-xs text-muted-foreground mt-1">
                Complex calculations or aggregations
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <p className="font-semibold text-sm">Composite Mapping</p>
              <p className="text-xs text-muted-foreground mt-1">
                Multiple source columns combined into one target
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
