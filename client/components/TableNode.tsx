import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Badge } from "@/components/ui/badge";
import { Database, Table2, Key } from "lucide-react";

type TableColumn = {
  name: string;
  type?: string;
  isPK?: boolean;
  isFK?: boolean;
};

type TableNodeData = {
  name: string;
  type?: "dimension" | "fact" | "bronze" | "silver";
  columns: TableColumn[];
  layer: "bronze" | "silver" | "gold";
};

function TableNode({ data }: NodeProps<TableNodeData>) {
  const { name, type, columns, layer } = data;

  // Enhanced color schemes by layer
  const layerColors = {
    bronze: {
      header: "from-amber-500 via-amber-600 to-orange-600",
      headerText: "text-white",
      border: "border-amber-600",
      icon: "#f59e0b",
      badgeBg: "bg-amber-100",
      badgeText: "text-amber-800",
      badgeBorder: "border-amber-300",
      shadow: "shadow-amber-200",
    },
    silver: {
      header: "from-slate-400 via-slate-500 to-gray-600",
      headerText: "text-white",
      border: "border-slate-600",
      icon: "#64748b",
      badgeBg: "bg-slate-100",
      badgeText: "text-slate-800",
      badgeBorder: "border-slate-300",
      shadow: "shadow-slate-200",
    },
    gold: {
      header: "from-yellow-400 via-yellow-500 to-amber-500",
      headerText: "text-slate-900",
      border: "border-yellow-600",
      icon: "#eab308",
      badgeBg: "bg-yellow-100",
      badgeText: "text-yellow-900",
      badgeBorder: "border-yellow-400",
      shadow: "shadow-yellow-200",
    },
  };

  const colors = layerColors[layer];
  // Show all columns with scrollable container
  const visibleColumns = columns;
  const hasMore = false;

  // Count PKs and FKs
  const pkCount = columns.filter((c) => c.isPK).length;
  const fkCount = columns.filter((c) => c.isFK).length;

  return (
    <div
      className={`bg-white rounded-xl border-2 ${colors.border} shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[280px] max-w-[320px] group ${colors.shadow}`}
    >
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-white border-2 border-slate-400 hover:scale-150 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-white border-2 border-slate-400 hover:scale-150 transition-transform"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-white border-2 border-slate-400 hover:scale-150 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-white border-2 border-slate-400 hover:scale-150 transition-transform"
      />

      {/* Table Header */}
      <div className={`px-4 py-3 rounded-t-xl bg-gradient-to-r ${colors.header}`}>
        <div className="flex items-center gap-2.5">
          {type === "fact" ? (
            <Database className="h-5 w-5 flex-shrink-0" style={{ color: colors.headerText === 'text-white' ? 'white' : '#1e293b' }} />
          ) : (
            <Table2 className="h-5 w-5 flex-shrink-0" style={{ color: colors.headerText === 'text-white' ? 'white' : '#1e293b' }} />
          )}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-bold ${colors.headerText} text-sm truncate leading-tight`}
              title={name}
            >
              {name}
            </h3>
            {type && (
              <div className="text-[10px] opacity-90 mt-0.5 font-medium" style={{ color: colors.headerText === 'text-white' ? 'rgba(255,255,255,0.9)' : '#475569' }}>
                {layer.toUpperCase()} • {type === "fact" ? "FACT TABLE" : "DIMENSION"}
              </div>
            )}
          </div>
          {type && (
            <Badge
              className={`text-[10px] px-2 py-0.5 h-5 font-bold ${colors.badgeBg} ${colors.badgeText} border ${colors.badgeBorder}`}
            >
              {type === "fact" ? "F" : "D"}
            </Badge>
          )}
        </div>
      </div>

      {/* Columns - Scrollable */}
      <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
        {visibleColumns.map((col, idx) => (
          <div
            key={idx}
            className={`px-4 py-2.5 flex items-center gap-2.5 hover:bg-blue-50/50 transition-colors ${
              idx % 2 === 1 ? "bg-slate-50/30" : "bg-white"
            }`}
          >
            {/* PK/FK Badge with Icon */}
            {(col.isPK || col.isFK) && (
              <div className="flex items-center gap-1">
                <Key className={`h-3.5 w-3.5 ${col.isPK ? "text-red-600" : "text-blue-600"}`} />
                <Badge
                  variant="outline"
                  className={`text-[9px] px-1.5 py-0 h-4 font-bold ${
                    col.isPK
                      ? "bg-red-50 text-red-700 border-red-300"
                      : "bg-blue-50 text-blue-700 border-blue-300"
                  }`}
                >
                  {col.isPK ? "PK" : "FK"}
                </Badge>
              </div>
            )}

            {/* Column Name and Type */}
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <p
                className={`text-xs truncate leading-tight ${
                  col.isPK
                    ? "font-bold text-slate-900"
                    : col.isFK
                      ? "font-semibold text-slate-800"
                      : "text-slate-700"
                }`}
                title={`${col.name}: ${col.type || "unknown"}`}
              >
                {col.name}
              </p>
              {col.type && (
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">
                  {col.type}
                </span>
              )}
            </div>
          </div>
        ))}

      </div>

      {/* Footer Statistics */}
      <div className={`px-4 py-2 bg-gradient-to-r ${colors.header} bg-opacity-10 border-t-2 ${colors.border} rounded-b-xl`}>
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-700">
          <span>{columns.length} column{columns.length !== 1 ? "s" : ""}</span>
          {pkCount > 0 && (
            <span className="flex items-center gap-1">
              <Key className="h-3 w-3 text-red-600" />
              <span className="text-red-700">{pkCount} PK</span>
            </span>
          )}
          {fkCount > 0 && (
            <span className="flex items-center gap-1">
              <Key className="h-3 w-3 text-blue-600" />
              <span className="text-blue-700">{fkCount} FK</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(TableNode);
