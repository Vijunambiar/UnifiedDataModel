import * as XLSX from "xlsx";

function toCSV(rows: any[]): string {
  if (!rows || rows.length === 0) return "";
  const headers = Array.from(
    rows.reduce<Set<string>>((set, row) => {
      Object.keys(row || {}).forEach((k) => set.add(k));
      return set;
    }, new Set()),
  );
  const escape = (val: any) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    const line = headers.map((h) => escape((row as any)[h]));
    lines.push(line.join(","));
  }
  return lines.join("\n");
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportToCSV(filename: string, rows: any[]) {
  const csv = toCSV(rows);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(filename.endsWith(".csv") ? filename : `${filename}.csv`, blob);
}

export function exportToXLSX(filename: string, sheets: { name: string; data: any[] }[] | any[]) {
  const wb = XLSX.utils.book_new();
  if (Array.isArray(sheets) && sheets.length > 0) {
    // If passed as an array of records, create a single sheet named "Sheet1"
    if (sheets.length > 0 && !("name" in sheets[0]) && !("data" in sheets[0])) {
      const ws = XLSX.utils.json_to_sheet(sheets as any[]);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    } else {
      (sheets as { name: string; data: any[] }[]).forEach((s) => {
        const ws = XLSX.utils.json_to_sheet(s.data ?? []);
        XLSX.utils.book_append_sheet(wb, ws, s.name || "Sheet");
      });
    }
  }
  const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  downloadBlob(filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`, blob);
}

export function downloadText(filename: string, text: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  downloadBlob(filename, blob);
}
