"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface JsonPreviewProps {
  data: unknown;
  /** Filename used when downloading */
  filename?: string;
  /** Show a header with actions (copy / download) */
  showActions?: boolean;
  maxHeight?: string;
}

export function JsonPreview({
  data,
  filename = "rps.json",
  showActions = true,
  maxHeight = "60vh",
}: JsonPreviewProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const jsonStr =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      toast({ title: "Disalin!", description: "JSON disalin ke clipboard." });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        title: "Gagal menyalin",
        description: "Browser tidak mengizinkan akses clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Diunduh!", description: `File ${filename} berhasil diunduh.` });
  };

  return (
    <div className="relative rounded-lg border border-border bg-[#282c34] overflow-hidden">
      {showActions && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/20">
          <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider">
            JSON Preview
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-7 text-zinc-200 hover:text-white hover:bg-white/10"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 mr-1" />
              ) : (
                <Copy className="h-3.5 w-3.5 mr-1" />
              )}
              {copied ? "Disalin" : "Salin"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              className="h-7 text-zinc-200 hover:text-white hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Unduh
            </Button>
          </div>
        </div>
      )}
      <div className="overflow-auto" style={{ maxHeight }}>
        <SyntaxHighlighter
          language="json"
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "12.5px",
            lineHeight: "1.55",
          }}
          wrapLongLines={false}
        >
          {jsonStr}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
