import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FIS_SOURCE_TABLES,
  SOURCE_TO_BRONZE_MAPPINGS,
  FISSourceTable,
  SourceToBronzeMapping,
} from "@/lib/fis-source-tables";
import { ArrowRight, Database, CheckCircle, AlertCircle } from "lucide-react";

export function FISSourceMappingViewer() {
  const [selectedSource, setSelectedSource] = useState<FISSourceTable | null>(
    FIS_SOURCE_TABLES.TB_CI_OZ6_CUST_ARD
  );

  const getSourceMapping = (
    fisTableName: string
  ): SourceToBronzeMapping | undefined => {
    return SOURCE_TO_BRONZE_MAPPINGS.find(
      (m) => m.fisTableName === fisTableName
    );
  };

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      Customer: "bg-blue-100 text-blue-800",
      Deposits: "bg-green-100 text-green-800",
      Transactions: "bg-purple-100 text-purple-800",
      Lending: "bg-amber-100 text-amber-800",
      Investment: "bg-pink-100 text-pink-800",
    };
    return colors[domain] || "bg-gray-100 text-gray-800";
  };

  const getTransformationBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      "1:1": "bg-green-100 text-green-800",
      "N:1": "bg-blue-100 text-blue-800",
      Aggregation: "bg-purple-100 text-purple-800",
      Enrichment: "bg-amber-100 text-amber-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">FIS Source Tables</h2>
        <p className="text-muted-foreground">
          Source System (FIS_RAW) → Bronze Layer Transformation Mappings
        </p>
      </div>

      <Tabs defaultValue="mappings" className="w-full">
        <TabsList>
          <TabsTrigger value="mappings">Transformation Mappings</TabsTrigger>
          <TabsTrigger value="sources">Source Tables</TabsTrigger>
        </TabsList>

        {/* Transformation Mappings Tab */}
        <TabsContent value="mappings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FIS Raw to Bronze Mappings</CardTitle>
              <CardDescription>
                Source-to-target table mappings and transformation logic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SOURCE_TO_BRONZE_MAPPINGS.map((mapping, idx) => {
                  const sourceTable = FIS_SOURCE_TABLES[mapping.fisTableName];
                  return (
                    <Card key={idx} className="bg-gray-50">
                      <CardContent className="pt-6">
                        {/* Mapping Header */}
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Database className="h-4 w-4 text-gray-600" />
                                <code className="text-sm font-mono font-semibold">
                                  FIS_RAW.{mapping.fisTableName}
                                </code>
                              </div>
                              {sourceTable && (
                                <p className="text-xs text-muted-foreground">
                                  {sourceTable.recordEstimate} |{" "}
                                  {sourceTable.refreshFrequency}
                                </p>
                              )}
                            </div>

                            <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Database className="h-4 w-4 text-blue-600" />
                                <code className="text-sm font-mono font-semibold">
                                  {mapping.bronzeTableName}
                                </code>
                              </div>
                              <Badge
                                className={getTransformationBadgeColor(
                                  mapping.transformationType
                                )}
                              >
                                {mapping.transformationType}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm mb-4">{mapping.description}</p>

                        {/* Transformation Logic */}
                        {mapping.transformationLogic && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-600 mb-2">
                              Transformation Logic:
                            </p>
                            <pre className="bg-white border border-gray-200 rounded p-3 text-xs overflow-x-auto">
                              {mapping.transformationLogic}
                            </pre>
                          </div>
                        )}

                        {/* Data Quality Rules */}
                        {mapping.dataQualityRules &&
                          mapping.dataQualityRules.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Data Quality
                                Rules:
                              </p>
                              <ul className="space-y-1">
                                {mapping.dataQualityRules.map((rule, rIdx) => (
                                  <li key={rIdx} className="text-xs text-gray-700">
                                    • {rule}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Source Tables Tab */}
        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.values(FIS_SOURCE_TABLES).map((source) => (
              <Card
                key={source.fisTableName}
                className={`cursor-pointer transition-all ${
                  selectedSource?.fisTableName === source.fisTableName
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedSource(source)}
              >
                <CardContent className="pt-6">
                  <code className="text-xs font-mono font-semibold block mb-2 truncate">
                    {source.fisTableName}
                  </code>
                  <Badge className={getDomainColor(source.domain)}>
                    {source.domain}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-3">
                    {source.recordEstimate}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedSource && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {selectedSource.fisTableName}
                </CardTitle>
                <CardDescription>
                  {selectedSource.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Schema
                    </p>
                    <p className="font-mono text-sm">
                      {selectedSource.fisSchema}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Domain
                    </p>
                    <Badge className={getDomainColor(selectedSource.domain)}>
                      {selectedSource.domain}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Records
                    </p>
                    <p className="text-sm">{selectedSource.recordEstimate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Refresh
                    </p>
                    <p className="text-sm">{selectedSource.refreshFrequency}</p>
                  </div>
                </div>

                {/* Business Key */}
                <div>
                  <p className="text-sm font-semibold mb-2">Business Key</p>
                  <code className="bg-gray-100 px-3 py-2 rounded text-xs">
                    {selectedSource.businessKey}
                  </code>
                </div>

                {/* Target Bronze Tables */}
                <div>
                  <p className="text-sm font-semibold mb-2">
                    Bronze Target Tables
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSource.bronzeTargets.map((target) => (
                      <Badge key={target} variant="outline">
                        {target}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Columns */}
                <div>
                  <p className="text-sm font-semibold mb-3">Columns</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedSource.columns.map((col, idx) => (
                      <div
                        key={idx}
                        className="border-b last:border-b-0 pb-2 last:pb-0"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-mono text-sm font-semibold">
                            {col.name}
                          </p>
                          {!col.nullable && (
                            <Badge variant="destructive" className="text-xs">
                              NOT NULL
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mb-1">
                          {col.dataType}
                        </p>
                        <p className="text-xs text-gray-700">
                          {col.description}
                        </p>
                        {col.bronzeColumnMapping && (
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <ArrowRight className="h-3 w-3 text-blue-500" />
                            <code className="text-blue-600 font-mono">
                              {col.bronzeColumnMapping}
                            </code>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mapping Details */}
                {getSourceMapping(selectedSource.fisTableName) && (
                  <Card className="bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-base">Mapping Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getSourceMapping(selectedSource.fisTableName) && (
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold mb-2">
                              Transformation Type
                            </p>
                            <Badge
                              className={getTransformationBadgeColor(
                                getSourceMapping(
                                  selectedSource.fisTableName
                                )!.transformationType
                              )}
                            >
                              {
                                getSourceMapping(selectedSource.fisTableName)!
                                  .transformationType
                              }
                            </Badge>
                          </div>
                          {getSourceMapping(selectedSource.fisTableName)!
                            .transformationLogic && (
                            <div>
                              <p className="text-sm font-semibold mb-2">
                                SQL Logic
                              </p>
                              <pre className="bg-white border rounded p-3 text-xs overflow-x-auto">
                                {
                                  getSourceMapping(selectedSource.fisTableName)!
                                    .transformationLogic
                                }
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
