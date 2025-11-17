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
import TableNode from "./TableNode";

type TableColumn = {
  name: string;
  type?: string;
  isPK?: boolean;
  isFK?: boolean;
};

type Table = {
  name: string;
  columns?: TableColumn[];
  type?: "dimension" | "fact" | "bronze" | "silver";
};

type TableRelationship = {
  from: string;
  to: string;
  fromColumn?: string;
  toColumn?: string;
};

type PhysicalERDProps = {
  tables: Table[];
  relationships?: TableRelationship[];
  layer: "bronze" | "silver" | "gold";
};

const nodeTypes = {
  tableNode: TableNode,
};

// Helper to strip layer prefix for matching
const stripPrefix = (name: string) =>
  name.replace(/^(bronze|silver|gold)\./, "");

export function PhysicalERD({
  tables,
  relationships = [],
  layer,
}: PhysicalERDProps) {
  // Generate nodes from tables
  const initialNodes: Node[] = useMemo(() => {
    if (tables.length === 0) return [];

    // Calculate layout - hierarchical for gold (star schema), grid for bronze/silver
    const isGoldLayer = layer === "gold";
    const factTables = tables.filter((t) => t.type === "fact");
    const dimensionTables = tables.filter(
      (t) => t.type === "dimension" || !t.type,
    );

    let nodes: Node[] = [];

    if (isGoldLayer && factTables.length > 0) {
      // Improved Star schema layout: facts in compact grid, dimensions in organized rings
      const centerX = 800;
      const centerY = 500;

      // Arrange fact tables in a compact grid (2 rows max for up to 8 facts)
      const factCols = Math.min(4, factTables.length);
      const factRows = Math.ceil(factTables.length / factCols);
      const factSpacingX = 380;
      const factSpacingY = 350;

      factTables.forEach((table, idx) => {
        const col = idx % factCols;
        const row = Math.floor(idx / factCols);
        const startX = centerX - ((factCols - 1) * factSpacingX) / 2;
        const startY = centerY - ((factRows - 1) * factSpacingY) / 2;

        nodes.push({
          id: table.name,
          type: "tableNode",
          position: {
            x: startX + col * factSpacingX - 140,
            y: startY + row * factSpacingY - 150,
          },
          data: {
            name: table.name,
            type: table.type,
            columns: table.columns || [],
            layer,
          },
        });
      });

      // Position dimensions in strategic locations around the facts
      // Use larger radius and organized positioning for better readability
      const baseRadius = 600;

      // Split dimensions into groups for better organization
      const dimsPerSide = Math.ceil(dimensionTables.length / 4);

      dimensionTables.forEach((table, idx) => {
        let x, y;

        // Organize dimensions in 4 quadrants (top, right, bottom, left)
        const side = Math.floor(idx / dimsPerSide);
        const posInSide = idx % dimsPerSide;
        const totalInSide = Math.min(dimsPerSide, dimensionTables.length - side * dimsPerSide);

        switch(side) {
          case 0: // Top
            x = centerX - ((totalInSide - 1) * 420) / 2 + posInSide * 420;
            y = centerY - baseRadius;
            break;
          case 1: // Right
            x = centerX + baseRadius;
            y = centerY - ((totalInSide - 1) * 300) / 2 + posInSide * 300;
            break;
          case 2: // Bottom
            x = centerX - ((totalInSide - 1) * 420) / 2 + posInSide * 420;
            y = centerY + baseRadius;
            break;
          case 3: // Left
          default:
            x = centerX - baseRadius;
            y = centerY - ((totalInSide - 1) * 300) / 2 + posInSide * 300;
            break;
        }

        nodes.push({
          id: table.name,
          type: "tableNode",
          position: { x: x - 140, y: y - 100 },
          data: {
            name: table.name,
            type: table.type,
            columns: table.columns || [],
            layer,
          },
        });
      });
    } else {
      // Improved grid layout for bronze/silver layers
      // Optimize column count based on table count for better visual balance
      let cols;
      if (tables.length <= 6) {
        cols = Math.min(3, tables.length);
      } else if (tables.length <= 12) {
        cols = 4;
      } else {
        cols = 5;
      }

      const horizontalSpacing = 420;
      const verticalSpacing = 350;

      tables.forEach((table, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);

        nodes.push({
          id: table.name,
          type: "tableNode",
          position: {
            x: col * horizontalSpacing + 80,
            y: row * verticalSpacing + 80,
          },
          data: {
            name: table.name,
            type: table.type,
            columns: table.columns || [],
            layer,
          },
        });
      });
    }

    return nodes;
  }, [tables, layer]);

  // Generate edges from relationships
  const initialEdges: Edge[] = useMemo(() => {
    console.log(
      `[${layer} ERD] Generating edges from ${relationships.length} relationships`,
    );
    if (relationships.length === 0) {
      console.log(`[${layer} ERD] No relationships to render`);
      return [];
    }

    // Log all available nodes
    console.log(
      `[${layer} ERD] Available nodes:`,
      initialNodes.map((n) => n.id),
    );

    return relationships
      .map((rel, idx) => {
        const fromNode = initialNodes.find(
          (n) =>
            stripPrefix(n.id) === stripPrefix(rel.from) || n.id === rel.from,
        );
        const toNode = initialNodes.find(
          (n) => stripPrefix(n.id) === stripPrefix(rel.to) || n.id === rel.to,
        );

        if (!fromNode || !toNode) {
          console.log(
            `[${layer} ERD] ❌ Skipping relationship: ${rel.from} -> ${rel.to}`,
          );
          console.log(
            `  From node found: ${!!fromNode}, To node found: ${!!toNode}`,
          );
          return null;
        }

        console.log(
          `[${layer} ERD] ✅ Creating edge: ${fromNode.id} -> ${toNode.id}`,
        );

        return {
          id: `e${idx}-${rel.from}-${rel.to}`,
          source: fromNode.id,
          target: toNode.id,
          type: ConnectionLineType.SmoothStep,
          animated: false,
          style: { stroke: "#475569", strokeWidth: 2.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#475569",
            width: 20,
            height: 20,
          },
          label: rel.fromColumn || "",
          labelStyle: {
            fontSize: 11,
            fill: "#1e293b",
            fontWeight: 600,
            textShadow: "0 1px 2px rgba(255,255,255,0.9)",
          },
          labelBgStyle: {
            fill: "#ffffff",
            fillOpacity: 0.95,
            stroke: "#475569",
            strokeWidth: 1,
          },
          labelBgPadding: [5, 7] as [number, number],
          labelBgBorderRadius: 5,
        };
      })
      .filter((edge) => edge !== null) as Edge[];
  }, [relationships, initialNodes, layer]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Color scheme for minimap by layer
  const minimapNodeColor = useCallback(
    (node: Node) => {
      const colors = {
        bronze: "#f59e0b",
        silver: "#10b981",
        gold: "#3b82f6",
      };
      return colors[layer];
    },
    [layer],
  );

  if (tables.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
        <div className="text-center">
          <p className="text-slate-500 mb-2">No tables defined for ERD</p>
          <p className="text-xs text-slate-400">
            Define {layer} layer tables to generate physical ERD
          </p>
        </div>
      </div>
    );
  }

  // Calculate optimal height based on layer and table count
  const canvasHeight = useMemo(() => {
    if (layer === "gold" && tables.length > 10) {
      return "900px"; // Large star schema needs more space
    }
    if (tables.length > 15) {
      return "750px";
    }
    return "600px"; // Default
  }, [layer, tables.length]);

  // Layer-specific styling
  const layerStyles = {
    bronze: {
      bg: "from-amber-50/50 via-orange-50/30 to-yellow-50/20",
      borderColor: "border-amber-200",
      badgeBg: "bg-amber-50",
      badgeBorder: "border-amber-300",
      icon: "#f59e0b",
    },
    silver: {
      bg: "from-slate-50/50 via-gray-50/30 to-zinc-50/20",
      borderColor: "border-slate-200",
      badgeBg: "bg-slate-50",
      badgeBorder: "border-slate-300",
      icon: "#64748b",
    },
    gold: {
      bg: "from-yellow-50/50 via-amber-50/30 to-orange-50/20",
      borderColor: "border-yellow-200",
      badgeBg: "bg-yellow-50",
      badgeBorder: "border-yellow-300",
      icon: "#eab308",
    },
  };

  const style = layerStyles[layer];

  return (
    <Card className={`p-0 bg-gradient-to-br ${style.bg} overflow-hidden border-2 ${style.borderColor} shadow-lg`}>
      {/* Header */}
      <div className="px-4 py-3 bg-white/90 backdrop-blur-sm border-b-2 border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={style.icon} strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              Physical ERD - {layer.charAt(0).toUpperCase() + layer.slice(1)}{" "}
              Layer
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Database schema with tables and relationships • Drag to explore • Scroll to zoom
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={`text-xs ${style.badgeBg} ${style.badgeBorder}`}>
              {tables.length} Table{tables.length !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="text-xs bg-blue-50 border-blue-300">
              {relationships.length} Link{relationships.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </div>

      {/* React Flow Diagram */}
      <div style={{ height: canvasHeight }} className="bg-white">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: layer === "gold" ? 0.15 : 0.2,
            maxZoom: layer === "gold" && tables.length > 15 ? 0.7 : 1.0,
          }}
          minZoom={0.1}
          maxZoom={1.5}
          defaultEdgeOptions={{
            type: ConnectionLineType.SmoothStep,
            animated: false,
          }}
        >
          <Background color="#94a3b8" gap={20} size={1.5} />
          <Controls showInteractive={false} className="bg-white/90 backdrop-blur-sm border-2 border-slate-200 shadow-lg" />
          <MiniMap
            nodeColor={minimapNodeColor}
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="bg-white/90 backdrop-blur-sm border-2 border-slate-200 shadow-lg"
          />
          <Panel
            position="top-right"
            className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border-2 border-slate-200 px-4 py-3 m-3"
          >
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5">
                Schema Legend
              </h5>

              {/* Key Types */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                    <span className="font-semibold text-red-700 text-[10px] px-1.5 py-0.5 bg-red-50 border border-red-300 rounded">
                      PK
                    </span>
                  </div>
                  <span className="text-slate-600">Primary Key</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                    <span className="font-semibold text-blue-700 text-[10px] px-1.5 py-0.5 bg-blue-50 border border-blue-300 rounded">
                      FK
                    </span>
                  </div>
                  <span className="text-slate-600">Foreign Key</span>
                </div>
              </div>

              {/* Table Types (for Gold layer) */}
              {layer === "gold" && (
                <div className="border-t border-slate-200 pt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <span className="font-semibold text-[10px] px-1.5 py-0.5 bg-blue-50 border border-blue-300 rounded">
                      F
                    </span>
                    <span className="text-slate-600">Fact Table</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                    </svg>
                    <span className="font-semibold text-[10px] px-1.5 py-0.5 bg-blue-50 border border-blue-300 rounded">
                      D
                    </span>
                    <span className="text-slate-600">Dimension</span>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </Card>
  );
}
