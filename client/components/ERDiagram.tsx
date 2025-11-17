import React, { useState } from "react";
import { ArrowRight, Database, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TableEntity {
  schema: string;
  tableName: string;
  layer: "Bronze" | "Silver" | "Gold";
  description: string;
  businessKey: string;
  recordType: "Dimension" | "Fact" | "Bridge" | "Aggregate";
  estimatedRows: number;
}

interface TableRelationship {
  relationshipId: string;
  fromTable: {
    schema: string;
    tableName: string;
    layer: "Bronze" | "Silver" | "Gold";
  };
  toTable: {
    schema: string;
    tableName: string;
    layer: "Bronze" | "Silver" | "Gold";
  };
  relationshipType: "One-to-One" | "One-to-Many" | "Many-to-One" | "Many-to-Many";
  joinCondition: string;
  fromTableKey: string;
  toTableKey: string;
  cardinality: string;
  description: string;
  businessContext: string;
}

interface ERDiagramProps {
  entities: TableEntity[];
  relationships: TableRelationship[];
  title?: string;
}

export function ERDiagram({ entities, relationships, title = "Entity Relationship Diagram" }: ERDiagramProps) {
  const [selectedLayer, setSelectedLayer] = useState<"All" | "Bronze" | "Silver" | "Gold">("All");
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  const getLayerColor = (layer: string) => {
    switch (layer) {
      case "Bronze":
        return "bg-amber-50 border-amber-300 text-amber-900";
      case "Silver":
        return "bg-slate-50 border-slate-300 text-slate-900";
      case "Gold":
        return "bg-yellow-50 border-yellow-300 text-yellow-900";
      default:
        return "bg-gray-50 border-gray-300 text-gray-900";
    }
  };

  const getLayerBadgeColor = (layer: string) => {
    switch (layer) {
      case "Bronze":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Silver":
        return "bg-slate-100 text-slate-800 border-slate-300";
      case "Gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case "Dimension":
        return "◆";
      case "Fact":
        return "■";
      case "Aggregate":
        return "▲";
      case "Bridge":
        return "◇";
      default:
        return "○";
    }
  };

  const filteredEntities = selectedLayer === "All" 
    ? entities 
    : entities.filter(e => e.layer === selectedLayer);

  const filteredRelationships = relationships.filter(rel => {
    const fromIncluded = filteredEntities.some(e => e.tableName === rel.fromTable.tableName);
    const toIncluded = filteredEntities.some(e => e.tableName === rel.toTable.tableName);
    return fromIncluded && toIncluded;
  });

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-2 mt-4">
            {["All", "Bronze", "Silver", "Gold"].map(layer => (
              <button
                key={layer}
                onClick={() => setSelectedLayer(layer as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedLayer === layer
                    ? `${getLayerBadgeColor(layer)} border`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {layer}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Entities Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Tables ({filteredEntities.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntities.map((entity) => (
                <div
                  key={`${entity.schema}.${entity.tableName}`}
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${getLayerColor(entity.layer)} ${
                    expandedTable === entity.tableName ? "ring-2 ring-blue-400" : ""
                  }`}
                  onClick={() => setExpandedTable(expandedTable === entity.tableName ? null : entity.tableName)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        <span className="text-lg">{getRecordTypeIcon(entity.recordType)}</span>
                        <span className="font-mono text-xs break-words">{entity.tableName}</span>
                      </div>
                      <p className="text-xs mt-1 opacity-80">{entity.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="outline" className="text-xs h-5">
                      {entity.layer}
                    </Badge>
                    <Badge variant="outline" className="text-xs h-5">
                      {entity.recordType}
                    </Badge>
                  </div>

                  <div className="text-xs space-y-1 border-t border-current border-opacity-20 pt-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      <span className="font-mono">{entity.businessKey}</span>
                    </div>
                    <div className="text-opacity-70 text-xs">
                      ~{(entity.estimatedRows / 1000000).toFixed(1)}M rows
                    </div>
                  </div>

                  {expandedTable === entity.tableName && (
                    <div className="mt-3 border-t border-current border-opacity-20 pt-3">
                      <p className="text-xs font-semibold mb-1">Schema:</p>
                      <p className="text-xs font-mono">{entity.schema}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Relationships Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Relationships ({filteredRelationships.length})
            </h3>
            <div className="space-y-3">
              {filteredRelationships.map((rel) => (
                <div key={rel.relationshipId} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">
                      {rel.relationshipId}
                    </span>
                    <Badge className="bg-blue-100 text-blue-900 border-blue-300">
                      {rel.cardinality}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rel.relationshipType}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <p className="font-mono text-sm font-semibold">{rel.fromTable.tableName}</p>
                      <p className="text-xs text-gray-600">{rel.fromTableKey}</p>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="flex-1">
                      <p className="font-mono text-sm font-semibold">{rel.toTable.tableName}</p>
                      <p className="text-xs text-gray-600">{rel.toTableKey}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded p-2 mb-2 border border-gray-200">
                    <p className="text-xs font-mono text-gray-700 break-words">{rel.joinCondition}</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-gray-700"><span className="font-semibold">Description:</span> {rel.description}</p>
                    <p className="text-gray-600"><span className="font-semibold">Context:</span> {rel.businessContext}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-3">Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">◆</span>
                <span>Dimension</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">■</span>
                <span>Fact</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">▲</span>
                <span>Aggregate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">◇</span>
                <span>Bridge</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 border-2 border-amber-300 bg-amber-50"></div>
                <span>Bronze Layer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 border-2 border-slate-300 bg-slate-50"></div>
                <span>Silver Layer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 border-2 border-yellow-300 bg-yellow-50"></div>
                <span>Gold Layer</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
