// Gold Layer Aggregations Strategy Component
// Displays logical aggregations for Customer Core, Deposits, and Transactions domains

import React, { useState } from "react";
import { ChevronDown, Database, TrendingUp, Zap, AlertCircle, Code2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoldLayerAggregations } from "@/lib/operations/gold-layer-aggregations";

export function GoldLayerAggregationsView() {
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  const domains = [
    { key: "customerCore", label: "Customer Core", icon: "👤", color: "bg-blue-50" },
    { key: "deposits", label: "Deposits", icon: "🏦", color: "bg-green-50" },
    { key: "transactions", label: "Transactions", icon: "💳", color: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            Gold Layer Aggregations Strategy
          </CardTitle>
          <CardDescription className="mt-2">
            Logically-designed, business-driven aggregations following Star Schema principles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-l-4 border-purple-600 pl-4">
              <p className="font-semibold text-sm mb-1">Architecture Principle</p>
              <p className="text-xs text-muted-foreground">
                Atomic facts → Daily aggregations → Higher granularities (weekly/monthly)
              </p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <p className="font-semibold text-sm mb-1">Business Logic</p>
              <p className="text-xs text-muted-foreground">
                Aggregations follow business rules, not mechanical sums. Pre-compute at relevant grains
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Tabs */}
      <Tabs defaultValue="customerCore" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          {domains.map((domain) => (
            <TabsTrigger key={domain.key} value={domain.key}>
              <span className="mr-2">{domain.icon}</span>
              {domain.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {domains.map((domain) => {
          const domainData = GoldLayerAggregations[domain.key as keyof typeof GoldLayerAggregations];
          if (!domainData || typeof domainData === "string" || typeof domainData === "object" && !("tables" in domainData)) {
            return null;
          }

          return (
            <TabsContent key={domain.key} value={domain.key} className="space-y-4">
              {/* Domain Overview */}
              <Card className={`border-2 border-slate-300 ${domain.color}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{domainData.name}</CardTitle>
                  <CardDescription>{domainData.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    This domain implements {Object.keys(domainData.tables || {}).length} aggregation tables
                    with logical business design for analytics, reporting, and compliance.
                  </p>
                </CardContent>
              </Card>

              {/* Aggregation Tables */}
              <div className="space-y-3">
                {Object.entries(domainData.tables || {}).map(([tableKey, table]: [string, any]) => (
                  <Card
                    key={tableKey}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() =>
                      setExpandedTable(expandedTable === tableKey ? null : tableKey)
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-slate-100 text-slate-900">
                              {table.grain || "Custom Grain"}
                            </Badge>
                            <p className="font-mono text-sm font-semibold text-slate-900">
                              {table.name}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {table.description}
                          </p>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform flex-shrink-0 ${
                            expandedTable === tableKey ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </CardHeader>

                    {expandedTable === tableKey && (
                      <CardContent className="space-y-4 border-t pt-4">
                        {/* Business Logic */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="font-semibold text-xs mb-2 text-blue-900 flex items-center gap-2">
                            <AlertCircle className="h-3 w-3" />
                            Business Logic
                          </p>
                          <p className="text-xs text-blue-800 leading-relaxed">
                            {table.businessLogic}
                          </p>
                        </div>

                        {/* Columns */}
                        {table.columns && (
                          <div>
                            <p className="font-semibold text-xs mb-2">Key Columns</p>
                            <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                              <ul className="space-y-1">
                                {table.columns.map((col: string, idx: number) => (
                                  <li key={idx} className="text-xs font-mono text-gray-700">
                                    • {col}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* SQL */}
                        <div>
                          <p className="font-semibold text-xs mb-2">SQL Definition</p>
                          <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                            <pre className="whitespace-pre-wrap break-words">
                              {table.sql}
                            </pre>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(table.sql);
                            }}
                          >
                            <Code2 className="h-3 w-3 mr-1" />
                            Copy SQL
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Architecture Principles */}
      <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-slate-50 to-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Aggregation Strategy & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Strategy */}
          <div>
            <p className="font-semibold text-sm mb-3">Design Strategy</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GoldLayerAggregations.bestPractices.aggregationStrategy.map(
                (practice, idx) => (
                  <div
                    key={idx}
                    className="border border-purple-200 rounded-lg p-3 bg-purple-50 hover:bg-purple-100 transition-colors"
                  >
                    <p className="text-xs text-purple-900 leading-relaxed">
                      <span className="font-semibold">#{idx + 1}:</span> {practice}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Performance */}
          <div>
            <p className="font-semibold text-sm mb-3">Performance Optimization</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GoldLayerAggregations.bestPractices.performanceOptimization.map(
                (practice, idx) => (
                  <div
                    key={idx}
                    className="border border-orange-200 rounded-lg p-3 bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    <p className="text-xs text-orange-900 leading-relaxed">
                      <span className="font-semibold">•</span> {practice}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Data Quality */}
          <div>
            <p className="font-semibold text-sm mb-3">Data Quality Checks</p>
            <div className="space-y-2">
              {GoldLayerAggregations.bestPractices.dataQualityChecks.map(
                (check, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-red-800">{check}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Architecture Overview */}
      <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-slate-50 to-gray-50">
        <CardHeader>
          <CardTitle className="text-base">Aggregation Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-600 pl-4 py-2">
              <p className="font-semibold text-sm">Level 0: Atomic Facts</p>
              <p className="text-xs text-muted-foreground">
                Individual transactions, daily account balances, daily customer states. Lowest grain,
                source truth for all aggregations.
              </p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4 py-2">
              <p className="font-semibold text-sm">Level 1: Daily Aggregations</p>
              <p className="text-xs text-muted-foreground">
                Daily summaries by account/customer. Groups transactions, calculates daily metrics,
                detects daily anomalies.
              </p>
            </div>
            <div className="border-l-4 border-green-600 pl-4 py-2">
              <p className="font-semibold text-sm">Level 2: Monthly Aggregations</p>
              <p className="text-xs text-muted-foreground">
                Monthly summaries from daily data. Trends, averages, pattern detection. Regulatory
                reporting baseline.
              </p>
            </div>
            <div className="border-l-4 border-orange-600 pl-4 py-2">
              <p className="font-semibold text-sm">Level 3: Dimensional Aggregations</p>
              <p className="text-xs text-muted-foreground">
                Rolled up by business dimensions (segment, product, branch). Portfolio-level metrics.
                Executive dashboards.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GoldLayerAggregationsView;
