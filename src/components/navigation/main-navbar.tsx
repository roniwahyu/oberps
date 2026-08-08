"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Info,
  Key,
  Search,
  Menu,
  X,
  Zap,
  Globe,
  ShieldCheck,
  Wand2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { loadStoredLLMConfig, LLMProvider } from "@/components/rps/llm-settings";

interface MainNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenWizard?: () => void;
  savedCount?: number;
}

export function MainNavbar({
  activeTab,
  onTabChange,
  onOpenSearch,
  onOpenWizard,
  savedCount = 0,
}: MainNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [llmConfig, setLlmConfig] = useState<{ provider: LLMProvider }>({ provider: "dahl" });

  useEffect(() => {
    setMounted(true);
    setLlmConfig(loadStoredLLMConfig());
    const handleStorage = () => setLlmConfig(loadStoredLLMConfig());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const navItems = [
    {
      id: "builder",
      label: "RPS Builder",
      badge: "OBE",
      icon: Sparkles,
      desc: "Buat RPS berbasis Outcome-Based Education",
    },
    {
      id: "saved",
      label: "Dokumen Tersimpan",
      badge: savedCount > 0 ? String(savedCount) : undefined,
      icon: BookOpen,
      desc: "Daftar RPS terdaftar & arsip",
    },
    {
      id: "settings",
      label: "Pengaturan LLM",
      badge: mounted ? llmConfig.provider.toUpperCase() : "DAHL",
      icon: Key,
      desc: "Kunci API & Provider AI Engine",
    },
    {
      id: "about",
      label: "Panduan & Tentang",
      icon: Info,
      desc: "Struktur SN-DIKTI & Dokumentasi",
    },
  ];

  const getProviderBadge = (provider: LLMProvider) => {
    switch (provider) {
      case "dahl":
        return { label: "Dahl MiniMax", color: "bg-emerald-950/80 border-emerald-500/50 text-emerald-300", icon: Zap };
      case "puter":
        return { label: "Puter.js Free", color: "bg-sky-950/80 border-sky-500/50 text-sky-300", icon: Globe };
      case "standalone":
        return { label: "Offline Mode", color: "bg-slate-900 border-slate-700 text-slate-400", icon: ShieldCheck };
      default:
        return { label: provider.toUpperCase(), color: "bg-purple-950/80 border-purple-500/50 text-purple-300", icon: Key };
    }
  };

  const providerInfo = getProviderBadge(llmConfig.provider || "dahl");
  const ProviderIcon = providerInfo.icon;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* BRAND LOGO */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            onClick={() => onTabChange("builder")}
            className="group relative flex items-center gap-2.5 cursor-pointer"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-400 blur-md opacity-40 group-hover:opacity-80 transition duration-300 rounded-xl" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-md shadow-indigo-950/50 border border-indigo-400/30">
                <GraduationCap className="h-5.5 w-5.5 transform group-hover:scale-110 transition duration-300" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-indigo-100 to-slate-300 bg-clip-text text-transparent truncate">
                  Oberps
                </h1>
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex text-[10px] font-bold border-indigo-500/40 text-indigo-300 bg-indigo-500/10 px-1.5 py-0"
                >
                  OBE v1.9
                </Badge>
              </div>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate hidden xs:block">
                AI RPS Generator &middot; SN-DIKTI Standard
              </p>
            </div>
          </div>
        </div>

        {/* DESKTOP MAIN NAVIGATION TABS */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/60 p-1.5 rounded-xl border border-border/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/30"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* RIGHT ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          {/* Active Provider Indicator Pill */}
          {mounted && (
            <button
              onClick={() => onTabChange("settings")}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${providerInfo.color} hover:opacity-90 transition-all`}
              title="Klik untuk mengubah API Token LLM Engine"
            >
              <ProviderIcon className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="text-[11px] font-semibold">{providerInfo.label}</span>
            </button>
          )}

          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSearch}
            className="h-9 px-2.5 sm:px-3 text-xs gap-1.5 border border-border/40 hover:bg-muted/60"
            title="Pencarian global RPS (Ctrl+Shift+F)"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden xl:inline text-xs">Cari RPS</span>
            <kbd className="hidden sm:inline-flex ml-1 px-1 py-0.5 rounded border border-border/60 bg-muted font-mono text-[9px] text-muted-foreground">
              ⌃⇧F
            </kbd>
          </Button>

          {/* Wizard Launcher Button */}
          {onOpenWizard && (
            <Button
              size="sm"
              onClick={onOpenWizard}
              className="h-9 px-3 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-950/40 hidden sm:inline-flex"
            >
              <Wand2 className="h-3.5 w-3.5 mr-1.5 text-amber-300 animate-pulse" />
              Wizard 9-Step
            </Button>
          )}

          <ThemeToggle />

          {/* MOBILE HAMBURGER TOGGLE BUTTON */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-9 w-9 text-slate-300 hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* MOBILE RESPONSIVE DRAWER / DROPDOWN MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/60 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3 shadow-2xl"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Menu Utama Navigation
              </span>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-indigo-600/20 border border-indigo-500/40 text-indigo-200 font-bold"
                        : "bg-slate-900/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold flex items-center gap-2">
                          {item.label}
                          {item.badge && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-bold">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </button>
                );
              })}
            </div>

            {/* Mobile Actions */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px]">Active AI Engine:</span>
                <span className="font-bold text-indigo-300 flex items-center gap-1">
                  <ProviderIcon className="w-3 h-3 text-amber-400" />
                  {providerInfo.label}
                </span>
              </div>

              {onOpenWizard && (
                <Button
                  size="sm"
                  onClick={() => {
                    onOpenWizard();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full h-10 text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                >
                  <Wand2 className="h-4 w-4 mr-2 text-amber-300 animate-pulse" />
                  Buka Wizard RPS OBE (9-Step)
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
