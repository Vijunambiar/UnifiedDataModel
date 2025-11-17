import React, { useState } from "react";
import { ChevronDown, Code2, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataQualityScripts, DataQualityFramework } from "@/lib/operations/data-quality-scripts";

interface DataQualityScriptsProps {
  layer?: "bronze" | "silver" | "gold" | "all";
}

export function DataQualityScriptsView({ layer = "all" }: DataQualityScriptsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedScript, setExpandedScript] = useState<string | null>(null);

  const getLayers = () => {
    if (layer === "all") {
      return ["bronze", "silver", "gold", "monitoring"];
    }
    return [layer, "monitoring"];
  };

  const getLayerColor = (layerName: string) => {
    switch (layerName) {
      case "bronze":
        return "bg-amber-50 border-amber-300 text-amber-900";
      case "silver":
        return "bg-slate-50 border-slate-300 text-slate-900";
      case "gold":
        return "bg-yellow-50 border-yellow-300 text-yellow-900";
      case "monitoring":
        return "bg-blue-50 border-blue-300 text-blue-900";
      default:
        return "bg-gray-50 border-gray-300 text-gray-900";
    }
  };

  const getLayerBadgeColor = (layerName: string) => {
    switch (layerName) {
      case "bronze":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "silver":
        return "bg-slate-100 text-slate-800 border-slate-300";
      case "gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "monitoring":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Data Quality (DQ) Scripts & Framework
          </CardTitle>
          <CardDescription>
            Comprehensive data quality validation, testing, and monitoring across all layers
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Layer DQ Scripts */}
      {getLayers().map((layerName) => {
        const layerData =
          DataQualityScripts[layerName as keyof typeof DataQualityScripts];
        if (!layerData) return null;

        return (
          <Card key={layerName} className={`border-2 ${getLayerColor(layerName)}`}>
            <CardHeader
              className="cursor-pointer hover:bg-white/50"
              onClick={() =>
                setExpandedSection(
                  expandedSection === layerName ? null : layerName
                )
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getLayerBadgeColor(layerName)}>
                    {layerData.name}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {layerData.description}
                  </p>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    expandedSection === layerName ? "rotate-180" : ""
                  }`}
                />
              </div>
            </CardHeader>

            {expandedSection === layerName && (
              <CardContent className="space-y-4">
                {/* DQ Scripts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(layerData.scripts).map(([scriptKey, script]) => (
                    <div
                      key={scriptKey}
                      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() =>
                          setExpandedScript(
                            expandedScript === scriptKey ? null : scriptKey
                          )
                        }
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-sm">
                              {script.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {script.description}
                            </p>
                          </div>
                          <Code2 className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
                        </div>
                      </button>

                      {expandedScript === scriptKey && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto max-h-96">
                            <pre className="whitespace-pre-wrap break-words">
                              {script.sql}
                            </pre>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-xs"
                            onClick={() =>
                              navigator.clipboard.writeText(script.sql)
                            }
                          >
                            Copy SQL
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Control Tables */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Control Tables & Infrastructure
          </CardTitle>
          <CardDescription>
            Database infrastructure for DQ results tracking and exception management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(DataQualityFramework.controlTables).map(
            ([tableKey, tableInfo]) => (
              <div
                key={tableKey}
                className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <button
                  onClick={() =>
                    setExpandedScript(
                      expandedScript === tableKey ? null : tableKey
                    )
                  }
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm font-mono">
                        {tableInfo.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tableInfo.description}
                      </p>
                    </div>
                    <Code2 className="h-4 w-4 text-slate-600 flex-shrink-0 ml-2" />
                  </div>
                </button>

                {expandedScript === tableKey && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto max-h-96">
                      <pre className="whitespace-pre-wrap break-words">
                        {tableInfo.ddl}
                      </pre>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={() =>
                        navigator.clipboard.writeText(tableInfo.ddl)
                      }
                    >
                      Copy DDL
                    </Button>
                  </div>
                )}
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Data Quality Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {DataQualityFramework.bestPractices.map((practice, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
          <CardDescription>
            Steps to implement the data quality framework
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-l-4 border-amber-500 pl-4 py-2">
              <p className="font-semibold text-sm mb-2">1. Setup Control Tables</p>
              <p className="text-xs text-muted-foreground">
                Execute DDL scripts to create CONTROL.DATA_QUALITY_RESULTS and
                CONTROL.DATA_QUALITY_EXCEPTIONS tables
              </p>
            </div>
            <div className="border-l-4 border-slate-500 pl-4 py-2">
              <p className="font-semibold text-sm mb-2">2. Schedule DQ Jobs</p>
              <p className="text-xs text-muted-foreground">
                Schedule Bronze layer checks post-load (recommended: 1 hour
                after load completion)
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <p className="font-semibold text-sm mb-2">3. Configure Alerts</p>
              <p className="text-xs text-muted-foreground">
                Setup email/Slack alerts for critical quality failures
                (PASS_RATE &lt; 90%) and warnings (&lt; 95%)
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-semibold text-sm mb-2">4. Monitor & Improve</p>
              <p className="text-xs text-muted-foreground">
                Review weekly DQ trends, identify root causes, and implement
                preventive measures
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DataQualityScriptsView;
