"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Info,
  Github,
  Heart,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { RpsBuilder, RpsLoadRequest } from "@/components/rps/rps-builder";
import { RpsSavedList } from "@/components/rps/rps-saved-list";
import { RpsAbout } from "@/components/rps/rps-about";

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

export default function Home() {
  const [activeTab, setActiveTab] = useState("builder");
  const [savedRefreshKey, setSavedRefreshKey] = useState(0);
  const [loadRequest, setLoadRequest] = useState<RpsLoadRequest | null>(null);

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-lg rounded-xl" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight truncate">
                  SmartRPS Builder
                </h1>
                <Badge
                  variant="secondary"
                  className="hidden sm:inline-flex text-[10px] font-normal"
                >
                  OBE
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                AI-powered RPS Generator berbasis Outcome-Based Education
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex h-9"
              asChild
            >
              <a
                href="https://smartrps.rifainstitute.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-3.5 w-3.5 mr-1.5" />
                Referensi
              </a>
            </Button>
            <Button
              size="sm"
              className="h-9 shadow-sm"
              onClick={() => setActiveTab("builder")}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Buat RPS
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
                />
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
              SmartRPS Builder &middot; OBE Curriculum Framework &middot; v1.4
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
