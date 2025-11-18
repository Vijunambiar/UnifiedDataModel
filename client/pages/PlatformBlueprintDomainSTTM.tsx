import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
import { getPilotDomainById, getPilotDomainSTTMMappingAsync } from "@/lib/domains/registry";
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

export default function PlatformBlueprintDomainSTTM() {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const domain = getPilotDomainById(domainId || "");
  const [sttmData, setSTTMData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (domainId) {
      getPilotDomainSTTMMappingAsync(domainId).then((data) => {
        setSTTMData(data);
        setLoading(false);
      });
    }
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

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">Loading STTM mappings...</p>
      </div>
    );
  }

  const totalMappings = sttmData?.mappings?.length || 0;
  const sttmGaps = sttmData?.gaps || [];
  const tableCoverage = sttmData?.tableCoverage || [];
  const coveragePercent = totalMappings > 0 ? Math.round(
    ((totalMappings - sttmGaps.length) / totalMappings) * 100
  ) : 0;

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
              {totalMappings - sttmGaps.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {sttmGaps.length}
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
                  <TableHead>Source System</TableHead>
                  <TableHead>Source Table</TableHead>
                  <TableHead>Source Column</TableHead>
                  <TableHead>Bronze Schema</TableHead>
                  <TableHead>Bronze Table</TableHead>
                  <TableHead>Silver Schema</TableHead>
                  <TableHead>Silver Table</TableHead>
                  <TableHead>Silver Column</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sttmData?.mappings?.map((mapping: any, idx: number) => (
                  <TableRow key={`mapping-${idx}`}>
                    <TableCell className="font-mono text-xs">
                      {mapping.sourceSystem}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {mapping.sourceTable}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {mapping.sourceField || mapping.sourceColumn}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                        {mapping.bronzeSchema}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                        {mapping.bronzeTable}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                        {mapping.silverSchema}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {mapping.targetTable || mapping.silverTable}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {mapping.targetColumn || mapping.silverColumn}
                    </TableCell>
                    <TableCell>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            {tableCoverage.map((table: any, idx: number) => {
              const coverage = (table.mappedCount / table.columnCount) * 100;
              return (
                <div key={table.fisTable || `table-${idx}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{table.fisTable || table.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(coverage)}% ({table.mappedCount}/{table.columnCount})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${coverage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gaps & Issues */}
      {sttmGaps && sttmGaps.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Identified Gaps</CardTitle>
                <CardDescription>
                  Source columns that need mapping or resolution
                </CardDescription>
              </div>
              <Badge variant="destructive">{sttmGaps.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sttmGaps.map((gap: any, idx: number) => (
                <div
                  key={`gap-${idx}`}
                  className="flex items-start gap-3 p-3 border border-red-100 bg-red-50 rounded-lg"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{gap.sourceColumn || gap.sourceField}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {gap.reason || "Unmapped column"}
                    </p>
                  </div>
                </div>
              ))}
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
