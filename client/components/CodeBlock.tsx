import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CodeBlock({ code, language = "sql", filename }: { code: string; language?: string; filename?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-lg border bg-muted/30">
      <div className="flex items-center justify-between p-2 border-b text-xs text-muted-foreground">
        <span className="truncate">{filename ?? `${language.toUpperCase()} snippet`}</span>
        <div className="flex gap-2">
          {filename ? (
            <Button variant="outline" size="sm" onClick={() => {
              const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}>Download</Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >{copied ? "Copied" : "Copy"}</Button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed"><code>{code}</code></pre>
    </div>
  );
}
