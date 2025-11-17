import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { exportSection } from "@/lib/section-exports";

interface ExportButtonProps {
  type: "sttm" | "ddl" | "dq" | "sql" | "metrics";
  data: any[];
  domainName?: string;
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
}

export function ExportButton({
  type,
  data,
  domainName = "export",
  disabled = false,
  size = "sm",
  variant = "outline",
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: "csv" | "xlsx") => {
    if (!data || data.length === 0) {
      alert("No data available to export");
      return;
    }

    try {
      setExporting(true);
      exportSection(type, format, data, domainName);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setTimeout(() => setExporting(false), 500);
    }
  };

  const typeLabels = {
    sttm: "STTM Mapping",
    ddl: "DDL Scripts",
    dq: "DQ Scripts",
    sql: "SQL Scripts",
    metrics: "Metrics",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || exporting || !data || data.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export {typeLabels[type]}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("csv")} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("xlsx")} className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          <span>Export as XLSX</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
