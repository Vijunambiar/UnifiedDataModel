import { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EntityNode from "./EntityNode";
import {
  User,
  Users,
  Database,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Shield,
  Tag,
} from "lucide-react";

type Entity = {
  name: string;
  attributes?: string[];
};

type Relationship = {
  from: string;
  to: string;
  type: "1:1" | "1:M" | "M:M";
  label?: string;
};

type LogicalERDProps = {
  entities: Entity[];
  relationships?: Relationship[];
};

const nodeTypes = {
  entityNode: EntityNode,
};

// Helper to determine entity color for minimap
function getEntityColor(name: string): string {
  const lowercaseName = name.toLowerCase();

  if (lowercaseName.includes("customer") || lowercaseName.includes("client"))
    return "#3b82f6"; // blue
  if (lowercaseName.includes("party") || lowercaseName.includes("household"))
    return "#a855f7"; // purple
  if (lowercaseName.includes("account") || lowercaseName.includes("deposit"))
    return "#10b981"; // emerald
  if (lowercaseName.includes("card")) return "#ec4899"; // pink
  if (lowercaseName.includes("address") || lowercaseName.includes("location"))
    return "#f59e0b"; // orange
  if (lowercaseName.includes("phone")) return "#14b8a6"; // teal
  if (lowercaseName.includes("email") || lowercaseName.includes("contact"))
    return "#0ea5e9"; // sky
  if (lowercaseName.includes("consent") || lowercaseName.includes("preference"))
    return "#22c55e"; // green
  if (lowercaseName.includes("segment") || lowercaseName.includes("category"))
    return "#8b5cf6"; // violet

  return "#3b82f6"; // default blue
}

export function LogicalERD({ entities, relationships = [] }: LogicalERDProps) {
  // Generate nodes from entities with adaptive layout
  const initialNodes: Node[] = useMemo(() => {
    if (entities.length === 0) return [];

    const nodeWidth = 240;
    const nodeHeight = 200;
    const horizontalSpacing = 150;
    const verticalSpacing = 120;

    // Choose layout based on entity count
    if (entities.length <= 6) {
      // Circular layout for few entities with larger radius
      const centerX = 500;
      const centerY = 400;
      const radius = 380;

      return entities.map((entity, idx) => {
        const angle = (idx / entities.length) * 2 * Math.PI - Math.PI / 2; // Start at top
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        return {
          id: entity.name,
          type: "entityNode",
          position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 },
          data: {
            name: entity.name,
            attributes: entity.attributes || [],
          },
        };
      });
    } else {
      // Grid layout for better space utilization with many entities
      const cols = Math.ceil(Math.sqrt(entities.length * 1.5)); // Wider grid
      const rows = Math.ceil(entities.length / cols);

      return entities.map((entity, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);

        return {
          id: entity.name,
          type: "entityNode",
          position: {
            x: col * (nodeWidth + horizontalSpacing) + 50,
            y: row * (nodeHeight + verticalSpacing) + 50,
          },
          data: {
            name: entity.name,
            attributes: entity.attributes || [],
          },
        };
      });
    }
  }, [entities]);

  // Generate edges from relationships with enhanced styling
  const initialEdges: Edge[] = useMemo(() => {
    console.log(
      `[Logical ERD] Generating edges from ${relationships.length} relationships`,
    );
    if (relationships.length === 0) {
      console.log(`[Logical ERD] No relationships to render`);
      return [];
    }

    console.log(
      `[Logical ERD] Available entity nodes:`,
      initialNodes.map((n) => n.id),
    );
    console.log(`[Logical ERD] Relationships:`, relationships);

    return relationships
      .map((rel, idx) => {
        const fromNode = initialNodes.find((n) => n.id === rel.from);
        const toNode = initialNodes.find((n) => n.id === rel.to);

        if (!fromNode || !toNode) {
          console.log(
            `[Logical ERD] ❌ Skipping relationship: ${rel.from} -> ${rel.to}`,
          );
          console.log(
            `  From node found: ${!!fromNode}, To node found: ${!!toNode}`,
          );
          return null;
        }

        console.log(
          `[Logical ERD] ✅ Creating edge: ${fromNode.id} -> ${toNode.id}`,
        );

        // Enhanced styling based on relationship type
        const relationshipStyles: Record<string, {
          stroke: string;
          strokeWidth: number;
          strokeDasharray?: string;
          animated: boolean;
          label: string;
          markerColor: string;
        }> = {
          "1:1": {
            stroke: "#6366f1", // indigo
            strokeWidth: 2.5,
            strokeDasharray: undefined,
            animated: false,
            label: rel.label || "1:1",
            markerColor: "#6366f1",
          },
          "1:M": {
            stroke: "#14b8a6", // teal
            strokeWidth: 3,
            strokeDasharray: undefined,
            animated: false,
            label: rel.label || "1:M",
            markerColor: "#14b8a6",
          },
          "M:M": {
            stroke: "#f59e0b", // amber
            strokeWidth: 2.5,
            strokeDasharray: "8,4",
            animated: true,
            label: rel.label || "M:M",
            markerColor: "#f59e0b",
          },
        };

        // Get style with fallback to 1:M if type is invalid
        const style = relationshipStyles[rel.type] || relationshipStyles["1:M"];

        return {
          id: `e${idx}-${rel.from}-${rel.to}`,
          source: fromNode.id,
          target: toNode.id,
          type: ConnectionLineType.SmoothStep,
          animated: style.animated,
          style: {
            stroke: style.stroke,
            strokeWidth: style.strokeWidth,
            strokeDasharray: style.strokeDasharray,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: style.markerColor,
            width: 25,
            height: 25,
          },
          label: style.label,
          labelStyle: {
            fontSize: 12,
            fill: "#1e293b",
            fontWeight: 700,
            textShadow: "0 1px 2px rgba(255,255,255,0.9)",
          },
          labelBgStyle: {
            fill: "#ffffff",
            fillOpacity: 0.95,
            stroke: style.stroke,
            strokeWidth: 1,
          },
          labelBgPadding: [6, 8] as [number, number],
          labelBgBorderRadius: 6,
        };
      })
      .filter((edge) => edge !== null) as Edge[];
  }, [relationships, initialNodes]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Enhanced minimap with entity-specific coloring
  const minimapNodeColor = useCallback((node: Node) => {
    return getEntityColor(node.data.name);
  }, []);

  if (entities.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
        <div className="text-center">
          <p className="text-slate-500 mb-2">No entities defined for ERD</p>
          <p className="text-xs text-slate-400">
            Define key entities to generate logical ERD
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-teal-50/30 overflow-hidden border-2 border-blue-100 shadow-lg">
      {/* Header */}
      <div className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-base text-blue-900 flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Logical ERD - Conceptual Model
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Business entities and relationships • Drag to explore • Scroll to zoom
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs bg-blue-50 border-blue-300">
              {entities.length} {entities.length === 1 ? "Entity" : "Entities"}
            </Badge>
            <Badge variant="outline" className="text-xs bg-purple-50 border-purple-300">
              {relationships.length}{" "}
              {relationships.length === 1 ? "Link" : "Links"}
            </Badge>
          </div>
        </div>
      </div>

      {/* React Flow Diagram */}
      <div
        style={{ height: entities.length > 6 ? "750px" : "650px" }}
        className="bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15, maxZoom: 1.0 }}
          minZoom={0.2}
          maxZoom={1.5}
          defaultEdgeOptions={{
            type: ConnectionLineType.SmoothStep,
            animated: false,
          }}
        >
          <Background color="#cbd5e1" gap={20} size={1.5} />
          <Controls showInteractive={false} className="bg-white/90 backdrop-blur-sm" />
          <MiniMap
            nodeColor={minimapNodeColor}
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="bg-white/80 backdrop-blur-sm border-2 border-blue-200"
          />
          
          {/* Enhanced Legend Panel */}
          <Panel
            position="top-right"
            className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border-2 border-blue-100 px-4 py-3 m-3"
          >
            <div className="space-y-3">
              {/* Relationship Types */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 mb-2">Relationships</h5>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <svg width="24" height="3">
                      <line
                        x1="0"
                        y1="1.5"
                        x2="24"
                        y2="1.5"
                        stroke="#6366f1"
                        strokeWidth="2.5"
                      />
                    </svg>
                    <span className="font-medium text-indigo-700">1:1</span>
                    <span className="text-slate-500">One-to-One</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="24" height="3">
                      <line
                        x1="0"
                        y1="1.5"
                        x2="24"
                        y2="1.5"
                        stroke="#14b8a6"
                        strokeWidth="3"
                      />
                    </svg>
                    <span className="font-medium text-teal-700">1:M</span>
                    <span className="text-slate-500">One-to-Many</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="24" height="3">
                      <line
                        x1="0"
                        y1="1.5"
                        x2="24"
                        y2="1.5"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeDasharray="6,3"
                      />
                    </svg>
                    <span className="font-medium text-amber-700">M:M</span>
                    <span className="text-slate-500">Many-to-Many</span>
                  </div>
                </div>
              </div>

              {/* Entity Types */}
              <div className="border-t border-slate-200 pt-2">
                <h5 className="text-xs font-bold text-slate-700 mb-2">Entity Types</h5>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-blue-600" />
                    <span className="text-slate-600">Customer</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-purple-600" />
                    <span className="text-slate-600">Party</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Database className="h-3 w-3 text-emerald-600" />
                    <span className="text-slate-600">Account</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-3 w-3 text-pink-600" />
                    <span className="text-slate-600">Card</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-orange-600" />
                    <span className="text-slate-600">Address</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-sky-600" />
                    <span className="text-slate-600">Contact</span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </Card>
  );
}
