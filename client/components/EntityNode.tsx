import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import {
  User,
  Building2,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Shield,
  FileText,
  Users,
  Tag,
  Key,
  Database,
} from "lucide-react";

type EntityNodeData = {
  name: string;
  attributes?: string[];
};

// Map entity names to icons and colors
function getEntityStyle(name: string): {
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  iconBg: string;
} {
  const lowercaseName = name.toLowerCase();

  if (lowercaseName.includes("customer") || lowercaseName.includes("client")) {
    return {
      icon: <User className="h-5 w-5 text-white" />,
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      borderColor: "border-blue-700",
      iconBg: "bg-blue-700/40",
    };
  }

  if (lowercaseName.includes("party") || lowercaseName.includes("household")) {
    return {
      icon: <Users className="h-5 w-5 text-white" />,
      gradient: "from-purple-500 via-purple-600 to-violet-600",
      borderColor: "border-purple-700",
      iconBg: "bg-purple-700/40",
    };
  }

  if (lowercaseName.includes("account") || lowercaseName.includes("deposit")) {
    return {
      icon: <Database className="h-5 w-5 text-white" />,
      gradient: "from-emerald-500 via-emerald-600 to-green-600",
      borderColor: "border-emerald-700",
      iconBg: "bg-emerald-700/40",
    };
  }

  if (lowercaseName.includes("card")) {
    return {
      icon: <CreditCard className="h-5 w-5 text-white" />,
      gradient: "from-pink-500 via-pink-600 to-rose-600",
      borderColor: "border-pink-700",
      iconBg: "bg-pink-700/40",
    };
  }

  if (lowercaseName.includes("address") || lowercaseName.includes("location")) {
    return {
      icon: <MapPin className="h-5 w-5 text-white" />,
      gradient: "from-orange-500 via-orange-600 to-amber-600",
      borderColor: "border-orange-700",
      iconBg: "bg-orange-700/40",
    };
  }

  if (lowercaseName.includes("phone")) {
    return {
      icon: <Phone className="h-5 w-5 text-white" />,
      gradient: "from-teal-500 via-teal-600 to-cyan-600",
      borderColor: "border-teal-700",
      iconBg: "bg-teal-700/40",
    };
  }

  if (lowercaseName.includes("email") || lowercaseName.includes("contact")) {
    return {
      icon: <Mail className="h-5 w-5 text-white" />,
      gradient: "from-sky-500 via-sky-600 to-blue-600",
      borderColor: "border-sky-700",
      iconBg: "bg-sky-700/40",
    };
  }

  if (
    lowercaseName.includes("consent") ||
    lowercaseName.includes("preference")
  ) {
    return {
      icon: <Shield className="h-5 w-5 text-white" />,
      gradient: "from-green-500 via-green-600 to-emerald-600",
      borderColor: "border-green-700",
      iconBg: "bg-green-700/40",
    };
  }

  if (
    lowercaseName.includes("segment") ||
    lowercaseName.includes("category")
  ) {
    return {
      icon: <Tag className="h-5 w-5 text-white" />,
      gradient: "from-violet-500 via-violet-600 to-purple-600",
      borderColor: "border-violet-700",
      iconBg: "bg-violet-700/40",
    };
  }

  if (
    lowercaseName.includes("identification") ||
    lowercaseName.includes("id")
  ) {
    return {
      icon: <FileText className="h-5 w-5 text-white" />,
      gradient: "from-amber-500 via-amber-600 to-yellow-600",
      borderColor: "border-amber-700",
      iconBg: "bg-amber-700/40",
    };
  }

  if (lowercaseName.includes("branch") || lowercaseName.includes("office")) {
    return {
      icon: <Building2 className="h-5 w-5 text-white" />,
      gradient: "from-slate-500 via-slate-600 to-gray-600",
      borderColor: "border-slate-700",
      iconBg: "bg-slate-700/40",
    };
  }

  // Default for unknown entities
  return {
    icon: <Database className="h-5 w-5 text-white" />,
    gradient: "from-blue-500 via-blue-600 to-blue-700",
    borderColor: "border-blue-700",
    iconBg: "bg-blue-700/40",
  };
}

function EntityNode({ data }: NodeProps<EntityNodeData>) {
  const { name, attributes = [] } = data;
  const style = getEntityStyle(name);

  // Identify potential primary keys
  const primaryKeyAttrs = attributes.filter((attr) =>
    attr.toLowerCase().includes("_id") || attr.toLowerCase().includes("_key")
  );

  // Show all attributes with scrollable container
  const visibleAttributes = attributes;
  const hasMore = false;

  return (
    <div
      className={`bg-gradient-to-br ${style.gradient} rounded-lg border-2 ${style.borderColor} shadow-xl hover:shadow-2xl transition-all duration-300 w-[240px] max-h-[420px] flex flex-col group`}
    >
      {/* Handles for connections */}
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

      {/* Entity Header with Icon */}
      <div className={`px-3 py-2.5 ${style.iconBg} flex items-center gap-2.5 flex-shrink-0`}>
        <div className="flex-shrink-0">{style.icon}</div>
        <h3
          className="font-bold text-white text-sm leading-tight flex-1 truncate"
          title={name}
        >
          {name}
        </h3>
      </div>

      {/* Attributes - Scrollable */}
      {visibleAttributes.length > 0 && (
        <>
          <div className="border-t-2 border-white/20 flex-shrink-0" />
          <div className="px-3 py-2.5 space-y-1 overflow-y-auto flex-1 bg-white/5">
            {visibleAttributes.map((attr, idx) => {
              const isPK =
                attr.toLowerCase().includes("_id") ||
                attr.toLowerCase().includes("_key") ||
                idx === 0;

              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 group/item hover:bg-white/10 rounded px-1.5 py-0.5 transition-colors"
                  title={attr}
                >
                  {isPK && <Key className="h-3 w-3 text-yellow-300 flex-shrink-0" />}
                  <p
                    className={`text-xs leading-tight truncate flex-1 ${
                      isPK
                        ? "text-white font-semibold"
                        : "text-blue-50 font-light"
                    }`}
                  >
                    {attr}
                  </p>
                </div>
              );
            })}

          </div>
        </>
      )}

      {/* Footer Badge */}
      {attributes.length > 0 && (
        <div className="px-3 py-1.5 bg-black/20 flex-shrink-0 border-t-2 border-white/20">
          <div className="text-[10px] text-white/80 text-center font-medium">
            {attributes.length} attribute{attributes.length !== 1 ? "s" : ""}
            {primaryKeyAttrs.length > 0 && (
              <span className="ml-2">
                • {primaryKeyAttrs.length} key
                {primaryKeyAttrs.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(EntityNode);
