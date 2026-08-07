"use client";

import { useCallback, useState } from "react";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Link2,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { toRpsData } from "@/lib/rps-parser";

interface RpsShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mataKuliah: string;
  sks: string;
  semester: string;
  programStudi: string;
  deskripsi: string | null;
  jsonData: string;
}

interface SharePayload {
  v: 1;
  mk: string;
  sks: string;
  smt: string;
  prodi: string;
  desc: string;
  data: unknown;
}

export function RpsShareDialog({
  open,
  onOpenChange,
  mataKuliah,
  sks,
  semester,
  programStudi,
  deskripsi,
  jsonData,
}: RpsShareDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = useCallback(() => {
    const data = toRpsData(jsonData);
    const payload: SharePayload = {
      v: 1,
      mk: mataKuliah,
      sks,
      smt: semester,
      prodi: programStudi,
      desc: deskripsi || "",
      data: data || {},
    };
    try {
      const json = JSON.stringify(payload);
      // Use base64url encoding for URL safety
      const encoded =
        typeof window !== "undefined" && typeof btoa !== "undefined"
          ? btoa(unescape(encodeURIComponent(json)))
              .replace(/\+/g, "-")
              .replace(/\//g, "_")
              .replace(/=+$/, "")
          : "";
      const base =
        typeof window !== "undefined" ? window.location.origin : "";
      return `${base}/?share=${encoded}`;
    } catch {
      return "";
    }
  }, [mataKuliah, sks, semester, programStudi, deskripsi, jsonData]);

  const url = shareUrl();
  const payloadSize = url.length;

  const handleCopy = useCallback(async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Tautan disalin!",
        description: "Tautan share RPS telah disalin ke clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Gagal menyalin",
        description: "Browser tidak mengizinkan akses clipboard.",
        variant: "destructive",
      });
    }
  }, [url, toast]);

  const handleOpenInNewTab = useCallback(() => {
    if (!url) return;
    window.open(url, "_blank");
  }, [url]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4 text-primary" />
            Bagikan RPS
          </DialogTitle>
          <DialogDescription className="text-xs">
            Bagikan RPS &ldquo;{mataKuliah}&rdquo; via tautan. Penerima dapat
            melihat dan mengimpor RPS ini ke akun mereka.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* URL display */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="h-3 w-3" />
              Tautan Share
            </label>
            <div className="flex gap-2">
              <Input
                value={url}
                readOnly
                className="text-xs font-mono h-9"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                onClick={handleCopy}
                size="sm"
                className="h-9 shrink-0"
                disabled={!url}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-1" />
                )}
                {copied ? "Disalin" : "Salin"}
              </Button>
            </div>
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-[10px] font-normal">
              Ukuran: {(payloadSize / 1024).toFixed(1)} KB
            </Badge>
            <Badge variant="outline" className="text-[10px] font-normal">
              Format: Base64 URL
            </Badge>
            <Badge variant="outline" className="text-[10px] font-normal text-primary">
              Read-only share
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleOpenInNewTab}
              variant="outline"
              size="sm"
              className="flex-1 h-9"
              disabled={!url}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Buka di Tab Baru
            </Button>
          </div>

          {/* How it works */}
          <div className="rounded-md border border-border/50 bg-muted/20 p-3 space-y-1.5">
            <p className="text-[11px] font-medium text-foreground">
              Cara Kerja:
            </p>
            <ul className="text-[11px] text-muted-foreground space-y-0.5 ml-3 list-disc">
              <li>Seluruh data RPS dienkode ke Base64 di URL</li>
              <li>Penerima membuka link → RPS dimuat otomatis di Builder</li>
              <li>Penerima dapat melihat, menyimpan, atau mengedit RPS</li>
              <li>Tidak perlu server — tautan bersifat self-contained</li>
            </ul>
          </div>

          {/* Warning for large payloads */}
          {payloadSize > 8000 && (
            <div className="rounded-md border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 p-3">
              <p className="text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                <QrCode className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  Tautan ini cukup panjang ({(payloadSize / 1024).toFixed(1)} KB).
                  Beberapa aplikasi chat/email mungkin memotong URL panjang.
                </span>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
