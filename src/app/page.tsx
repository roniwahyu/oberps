"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Info,
  Github,
  Heart,
  Zap,
  Search,
  Share2,
  X,
  Key,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { RpsBuilder, RpsLoadRequest } from "@/components/rps/rps-builder";
import { RpsSavedList } from "@/components/rps/rps-saved-list";
import { RpsAbout } from "@/components/rps/rps-about";
import { LlmSettings } from "@/components/rps/llm-settings";
import { GlobalSearch } from "@/components/rps/global-search";
import { MainNavbar } from "@/components/navigation/main-navbar";

interface SavedRpsLike {
  id: string;
  mataKuliah: string;
  sks: string;
  semester: string;
  programStudi: string;
  deskripsi: string | null;
  promptText: string;
  jsonData: string;
  createdAt: string;
  updatedAt: string;
}

function parseShareParam(): {
  loadRequest: RpsLoadRequest | null;
  notice: string | null;
} {
  if (typeof window === "undefined") return { loadRequest: null, notice: null };
  const params = new URLSearchParams(window.location.search);
  const shareParam = params.get("share");
  if (!shareParam) return { loadRequest: null, notice: null };

  try {
    let b64 = shareParam.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const json = decodeURIComponent(escape(atob(b64)));
    const payload = JSON.parse(json) as {
      v?: number;
      mk?: string;
      sks?: string;
      smt?: string;
      prodi?: string;
      desc?: string;
      data?: unknown;
    };
    const req: RpsLoadRequest = {
      mataKuliah: payload.mk || "Mata Kuliah Impor",
      sks: payload.sks || "3",
      semester: payload.smt || "1",
      programStudi: payload.prodi || "S1 Teknik Informatika",
      deskripsi: payload.desc || "",
      jsonData: payload.data || null,
      promptText: "Dimuat dari tautan share",
      nonce: Date.now(),
    };
    return {
      loadRequest: req,
      notice: `RPS "${payload.mk || "Mata Kuliah"}" dimuat dari tautan share`,
    };
  } catch {
    return { loadRequest: null, notice: null };
  }
}

export default function Home() {
  // Parse share URL once on initial render (client-only, lazy initializer)
  const initialShare = useState(parseShareParam)[0];
  const [activeTab, setActiveTab] = useState("builder");
  const [savedRefreshKey, setSavedRefreshKey] = useState(0);
  const [loadRequest, setLoadRequest] = useState<RpsLoadRequest | null>(
    initialShare.loadRequest
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [focusRpsId, setFocusRpsId] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(
    initialShare.notice
  );

  // Clean the URL after mount (remove ?share= param)
  useEffect(() => {
    if (initialShare.loadRequest && typeof window !== "undefined") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [initialShare.loadRequest]);

  const handleSaved = useCallback(() => {
    setSavedRefreshKey((k) => k + 1);
    setActiveTab("saved");
  }, []);

  const handleDuplicate = useCallback((item: SavedRpsLike) => {
    setLoadRequest({
      mataKuliah: item.mataKuliah,
      sks: item.sks,
      semester: item.semester,
      programStudi: item.programStudi,
      deskripsi: item.deskripsi || "",
      jsonData: (() => {
        try {
          return JSON.parse(item.jsonData);
        } catch {
          return null;
        }
      })(),
      promptText: item.promptText,
      nonce: Date.now(),
    });
    setActiveTab("builder");
  }, []);

  const handleSearchSelect = useCallback((id: string) => {
    setFocusRpsId(id);
    setSavedRefreshKey((k) => k + 1);
    setActiveTab("saved");
  }, []);

  // Global keyboard shortcut: Ctrl+Shift+F to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={handleSearchSelect}
      />
      <MainNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {shareNotice && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
            <Share2 className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm text-foreground flex-1">{shareNotice}</span>
            <button
              onClick={() => setShareNotice(null)}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-6"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <TabsList className="bg-muted/60 p-1">
              <TabsTrigger value="builder" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Builder</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tersimpan</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5">
                <Key className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Pengaturan LLM</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="gap-1.5">
                <Info className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tentang</span>
              </TabsTrigger>
            </TabsList>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-amber-500" />
              <span>Bertenaga AI &middot; OBE Curriculum Framework</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <TabsContent value="builder" className="mt-0 focus-visible:outline-none">
                <RpsBuilder onSaved={handleSaved} loadRequest={loadRequest} />
              </TabsContent>

              <TabsContent value="saved" className="mt-0 focus-visible:outline-none">
                <RpsSavedList
                  refreshKey={savedRefreshKey}
                  onDuplicate={handleDuplicate}
                  focusId={focusRpsId}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-0 focus-visible:outline-none">
                <LlmSettings />
              </TabsContent>

              <TabsContent value="about" className="mt-0 focus-visible:outline-none">
                <RpsAbout />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <span>
              SmartRPS Builder &middot; OBE Curriculum Framework &middot; v1.9
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              Dibuat dengan
              <Heart className="h-3 w-3 fill-red-500 text-red-500" />
              menggunakan Next.js &amp; AI
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
