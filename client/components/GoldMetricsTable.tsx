import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricTableProps {
  metrics: any[];
  title?: string;
  description?: string;
}

const getGrainColor = (grain: string) => {
  const colors: Record<string, string> = {
    Customer: "bg-emerald-100 text-emerald-800",
    Account: "bg-cyan-100 text-cyan-800",
    Segment: "bg-violet-100 text-violet-800",
    Transaction: "bg-orange-100 text-orange-800",
    Daily: "bg-blue-100 text-blue-800",
    Monthly: "bg-indigo-100 text-indigo-800",
    Quarterly: "bg-purple-100 text-purple-800",
    Product: "bg-amber-100 text-amber-800",
    Channel: "bg-rose-100 text-rose-800",
    Branch: "bg-yellow-100 text-yellow-800",
    Overall: "bg-slate-100 text-slate-800",
  };
  return colors[grain] || "bg-gray-100 text-gray-800";
};

export function GoldMetricsTable({ metrics, title, description }: MetricTableProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Volume: "bg-blue-100 text-blue-800",
      Growth: "bg-green-100 text-green-800",
      Retention: "bg-purple-100 text-purple-800",
      Value: "bg-amber-100 text-amber-800",
      Engagement: "bg-pink-100 text-pink-800",
      Risk: "bg-red-100 text-red-800",
      Activity: "bg-cyan-100 text-cyan-800",
      Quality: "bg-teal-100 text-teal-800",
      Performance: "bg-indigo-100 text-indigo-800",
      Segmentation: "bg-lime-100 text-lime-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Operational: "bg-blue-50 text-blue-700",
      Strategic: "bg-purple-50 text-purple-700",
      Tactical: "bg-orange-50 text-orange-700",
    };
    return colors[type] || "bg-gray-50 text-gray-700";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Gold Layer Metrics"}</CardTitle>
        <CardDescription>
          {description || "Production-ready metrics with SQL definitions and source table mapping"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold">Metric ID</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Grain</TableHead>
                <TableHead className="font-semibold">Source Tables</TableHead>
                <TableHead className="font-semibold">Business Logic</TableHead>
                <TableHead className="font-semibold">SQL Definition</TableHead>
                <TableHead className="font-semibold">Granularity</TableHead>
                <TableHead className="font-semibold">Data Type</TableHead>
                <TableHead className="font-semibold">Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric, index) => {
                const metricId = metric.metricId || `metric-${index}`;
                return (
                  <TableRow
                    key={metricId}
                    className="border-b hover:bg-gray-50"
                  >
                    <TableCell className="font-mono font-semibold whitespace-nowrap">
                      {metric.metricId}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs">{metric.name}</TableCell>
                    <TableCell className="max-w-sm">{metric.description}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(metric.category)} variant="default">
                        {metric.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(metric.type)} variant="secondary">
                        {metric.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getGrainColor(metric.grain)} variant="default">
                        {metric.grain || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="space-y-1">
                        {(metric.sourceTables ? metric.sourceTables : (metric.sourceTable ? [metric.sourceTable] : [])).map((table: string, tableIdx: number) => (
                          <div
                            key={`${metricId}-table-${tableIdx}`}
                            className="text-xs font-mono bg-gray-100 px-2 py-1 rounded whitespace-nowrap"
                          >
                            {table}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-sm text-xs">{metric.businessLogic}</TableCell>
                    <TableCell className="max-w-md">
                      <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs overflow-x-auto max-h-32 overflow-y-auto">
                        {metric.sqlDefinition?.trim() || "N/A"}
                      </pre>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{metric.granularity}</TableCell>
                    <TableCell className="whitespace-nowrap">{metric.dataType}</TableCell>
                    <TableCell className="whitespace-nowrap">{metric.unit}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {metrics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No metrics found</p>
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Metrics</p>
              <p className="text-2xl font-bold">{metrics.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Categories</p>
              <p className="text-2xl font-bold">
                {new Set(metrics.map((m) => m.category)).size}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Source Tables</p>
              <p className="text-2xl font-bold">
                {new Set(metrics.flatMap((m) => m.sourceTables)).size}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Data Types</p>
              <p className="text-2xl font-bold">
                {new Set(metrics.map((m) => m.dataType)).size}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
