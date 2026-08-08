"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Globe,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Zap,
  Server,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Copy,
  Check,
  Code,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export type LLMProvider = "openai" | "anthropic" | "openrouter" | "dahl" | "custom" | "puter" | "standalone";

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface TestLogDetails {
  timestamp: string;
  provider: string;
  url: string;
  model: string;
  status: number;
  statusText: string;
  latencyMs: number;
  requestHeaders: Record<string, string>;
  requestBody: Record<string, unknown>;
  responseBody: unknown;
  replyText?: string;
}

export const STORAGE_KEY = "smartrps_llm_config";

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: "standalone",
  apiKey: "",
  baseUrl: "",
  model: "",
};

export const PROVIDER_PRESETS: Record<
  LLMProvider,
  { name: string; description: string; defaultBaseUrl: string; defaultModel: string; models: string[] }
> = {
  openai: {
    name: "OpenAI",
    description: "Model flagship OpenAI seperti GPT-4o dan GPT-4o-mini.",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "o3-mini"],
  },
  anthropic: {
    name: "Anthropic Claude",
    description: "Model canggih Anthropic seperti Claude 3.5 Sonnet & Haiku.",
    defaultBaseUrl: "https://api.anthropic.com",
    defaultModel: "claude-3-5-sonnet-20241022",
    models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
  },
  openrouter: {
    name: "OpenRouter",
    description: "Router universal untuk OpenAI, Claude, DeepSeek, Llama, & Gemini.",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
    models: ["openai/gpt-4o-mini", "anthropic/claude-3.5-sonnet", "deepseek/deepseek-r1", "google/gemini-2.0-flash-001"],
  },
  dahl: {
    name: "Dahl Global (Kimi & MiniMax)",
    description: "Inference endpoint di inference.dahl.global/v1 dengan model Moonshot Kimi & MiniMax M2.7.",
    defaultBaseUrl: "https://inference.dahl.global/v1",
    defaultModel: "moonshotai/Kimi-K2.6",
    models: ["moonshotai/Kimi-K2.6", "MiniMaxAI/MiniMax-M2.7"],
  },
  custom: {
    name: "Custom / Local Server",
    description: "Server kompatibel OpenAI seperti Ollama, LocalAI, LM Studio, vLLM, Dahl Global.",
    defaultBaseUrl: "https://inference.dahl.global/v1",
    defaultModel: "moonshotai/Kimi-K2.6",
    models: ["moonshotai/Kimi-K2.6", "MiniMaxAI/MiniMax-M2.7", "llama3", "mistral", "qwen", "gemma"],
  },
  puter: {
    name: "Puter.js (Gratis)",
    description: "AI gratis via puter.com — tanpa API key. Gunakan claude-3-7-sonnet atau gpt-4o via akun Puter pengguna.",
    defaultBaseUrl: "https://js.puter.com/v2/",
    defaultModel: "claude-3-7-sonnet",
    models: ["claude-3-7-sonnet", "gpt-4o", "claude-3-5-sonnet", "o3-mini"],
  },
  standalone: {
    name: "Mode Mandiri (Offline)",
    description: "Tanpa API token. Menggunakan engine pembangun RPS OBE internal.",
    defaultBaseUrl: "",
    defaultModel: "Internal Generator",
    models: ["Internal Generator"],
  },
};

export function loadStoredLLMConfig(): LLMConfig {
  if (typeof window === "undefined") return DEFAULT_LLM_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LLM_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      provider: parsed.provider || "standalone",
      apiKey: parsed.apiKey || "",
      baseUrl: parsed.baseUrl || "",
      model: parsed.model || "",
    };
  } catch {
    return DEFAULT_LLM_CONFIG;
  }
}

export function saveStoredLLMConfig(config: LLMConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error("[LLMSettings] Failed to save config:", err);
  }
}

interface LLMSettingsProps {
  onConfigChange?: (config: LLMConfig) => void;
}

export function LlmSettings({ onConfigChange }: LLMSettingsProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<LLMConfig>(DEFAULT_LLM_CONFIG);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);
  const [showLogDetails, setShowLogDetails] = useState(true);
  const [activeLogTab, setActiveLogTab] = useState<"summary" | "request" | "response">("summary");

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    reply?: string;
    latencyMs?: number;
    logDetails?: TestLogDetails;
  } | null>(null);

  useEffect(() => {
    const loaded = loadStoredLLMConfig();
    setConfig(loaded);
  }, []);

  const handleProviderSelect = (provider: LLMProvider) => {
    const preset = PROVIDER_PRESETS[provider];
    const newConfig: LLMConfig = {
      provider,
      apiKey: provider === config.provider ? config.apiKey : "",
      baseUrl: preset.defaultBaseUrl,
      model: preset.defaultModel,
    };
    setConfig(newConfig);
    setTestResult(null);
  };

  const handleSave = () => {
    saveStoredLLMConfig(config);
    if (onConfigChange) onConfigChange(config);
    toast({
      title: "Pengaturan Diberlakukan",
      description: `Penyedia ${PROVIDER_PRESETS[config.provider].name} telah disimpan.`,
    });
  };

  const handleResetStandalone = () => {
    const resetConfig: LLMConfig = {
      provider: "standalone",
      apiKey: "",
      baseUrl: "",
      model: "Internal Generator",
    };
    setConfig(resetConfig);
    saveStoredLLMConfig(resetConfig);
    if (onConfigChange) onConfigChange(resetConfig);
    setTestResult(null);
    toast({
      title: "Kembali ke Mode Mandiri",
      description: "Aplikasi menggunakan generator RPS OBE internal tanpa API Token.",
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setShowLogDetails(true);

    try {
      const res = await fetch("/api/rps/test-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: config.provider,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl || PROVIDER_PRESETS[config.provider].defaultBaseUrl,
          model: config.model || PROVIDER_PRESETS[config.provider].defaultModel,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setTestResult({
          success: false,
          error: data.error || "Gagal menghubungkan ke server LLM.",
          logDetails: data.logDetails,
        });
        toast({
          title: "Tes Koneksi Gagal",
          description: data.error || "Periksa kembali API Token dan URL Endpoint.",
          variant: "destructive",
        });
      } else {
        setTestResult({
          success: true,
          message: data.message,
          reply: data.reply,
          latencyMs: data.latencyMs,
          logDetails: data.logDetails,
        });
        toast({
          title: "Koneksi Berhasil & Siap!",
          description: `Terhubung ke ${PROVIDER_PRESETS[config.provider].name} (${data.latencyMs}ms).`,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Kesalahan koneksi.";
      setTestResult({ success: false, error: msg });
      toast({
        title: "Error Koneksi",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyLog = () => {
    if (!testResult?.logDetails) return;
    const jsonStr = JSON.stringify(testResult.logDetails, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedLog(true);
    toast({
      title: "Log Diagnostik Disalin",
      description: "Data respon dan log diagnostik telah disalin ke clipboard.",
    });
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const activePreset = PROVIDER_PRESETS[config.provider];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Pengaturan LLM API Token</CardTitle>
                <CardDescription className="text-xs">
                  Konfigurasikan penyedia model kecerdasan buatan (OpenAI, Anthropic Claude, OpenRouter, Dahl Global, atau Mode Mandiri).
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={config.provider === "standalone" ? "outline" : "default"}
                className={config.provider !== "standalone" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                {activePreset.name}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Provider Selector Cards */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pilih Penyedia AI (Provider)
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.keys(PROVIDER_PRESETS) as LLMProvider[]).map((key) => {
            const preset = PROVIDER_PRESETS[key];
            const isSelected = config.provider === key;
            return (
              <motion.div key={key} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Card
                  onClick={() => handleProviderSelect(key)}
                  className={`cursor-pointer transition-all border-2 relative h-full ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/5 shadow-sm dark:bg-emerald-950/20"
                      : "border-border/60 hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {key === "openai" && <Sparkles className="h-4 w-4 text-emerald-500" />}
                        {key === "anthropic" && <Cpu className="h-4 w-4 text-purple-500" />}
                        {key === "openrouter" && <Globe className="h-4 w-4 text-blue-500" />}
                        {key === "dahl" && <Server className="h-4 w-4 text-teal-500" />}
                        {key === "custom" && <Server className="h-4 w-4 text-amber-500" />}
                        {key === "puter" && <Zap className="h-4 w-4 text-green-400" />}
                        {key === "standalone" && <Zap className="h-4 w-4 text-orange-500" />}
                        <CardTitle className="text-sm font-semibold">{preset.name}</CardTitle>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-1">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {preset.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Configuration Form Card */}
      {config.provider !== "standalone" && config.provider !== "puter" ? (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <CardTitle className="text-base">
                  Konfigurasi Token &amp; Endpoint &mdash; {activePreset.name}
                </CardTitle>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                {config.provider}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Token disimpan dengan aman di peramban lokal (localStorage) dan dikirimkan langsung ke API generator.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            {/* API Key Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="api-key-input" className="text-xs font-medium">
                  API Token / Secret Key <span className="text-red-500">*</span>
                </Label>
                {config.apiKey && (
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, apiKey: "" })}
                    className="text-[11px] text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Bersihkan
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="api-key-input"
                  type={showApiKey ? "text" : "password"}
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder={`Masukkan API Token ${activePreset.name} Anda...`}
                  className="pr-10 font-mono text-xs h-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Base URL Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="base-url-input" className="text-xs font-medium">
                  API Base URL Endpoint
                </Label>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, baseUrl: activePreset.defaultBaseUrl })}
                  className="text-[11px] text-primary hover:underline"
                >
                  Reset Default
                </button>
              </div>
              <Input
                id="base-url-input"
                type="text"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder={activePreset.defaultBaseUrl}
                className="font-mono text-xs h-10"
              />
            </div>

            {/* Model Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="model-select" className="text-xs font-medium">
                Model AI yang Digunakan
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  value={activePreset.models.includes(config.model) ? config.model : "custom"}
                  onValueChange={(val) => {
                    if (val !== "custom") setConfig({ ...config, model: val });
                  }}
                >
                  <SelectTrigger id="model-select" className="h-10 text-xs">
                    <SelectValue placeholder="Pilih model preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {activePreset.models.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs font-mono">
                        {m}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" className="text-xs font-mono">
                      [Model Kustom Lainnya]
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="text"
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  placeholder="Ketik nama model..."
                  className="font-mono text-xs h-10"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 flex-wrap border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={isTesting || !config.apiKey}
                className="gap-1.5 h-9 bg-primary/5 hover:bg-primary/10 border-primary/30"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span>Menguji Koneksi &amp; Diagnostik...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 text-primary" />
                    <span>Tes Koneksi &amp; Diagnostik LLM</span>
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetStandalone}
                  className="h-9 text-xs"
                >
                  Mode Mandiri
                </Button>
                <Button type="button" size="sm" onClick={handleSave} className="gap-1.5 h-9 shadow-sm bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Simpan Pengaturan</span>
                </Button>
              </div>
            </div>

            {/* Diagnostic Log Inspector Panel */}
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-2"
              >
                <div
                  className={`rounded-lg border p-4 text-xs transition-all ${
                    testResult.success
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                      : "border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-300"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      {testResult.success ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <span>KONEKSI TERHUBUNG &amp; LLM API SIAP!</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          <span>KONEKSI GAGAL / UNCONNECTED</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {testResult.logDetails && (
                        <Badge
                          variant="outline"
                          className={
                            testResult.logDetails.status === 200
                              ? "bg-emerald-600 text-white font-mono"
                              : "bg-red-600 text-white font-mono"
                          }
                        >
                          HTTP {testResult.logDetails.status} {testResult.logDetails.statusText}
                        </Badge>
                      )}
                      {testResult.latencyMs !== undefined && (
                        <Badge variant="secondary" className="font-mono text-[10px] gap-1">
                          <Activity className="h-3 w-3" /> {testResult.latencyMs} ms
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-xs opacity-90 leading-relaxed font-medium">
                    {testResult.message || testResult.error}
                  </p>
                </div>

                {/* Log Inspector Controls */}
                {testResult.logDetails && (
                  <Card className="border-border/80 bg-zinc-950 text-zinc-100 shadow-md overflow-hidden font-mono text-[11.5px]">
                    <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-emerald-400" />
                        <span className="font-sans font-semibold text-xs text-zinc-200">
                          Log Pembaca Respon Diagnostik LLM
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyLog}
                          className="h-7 px-2 text-[11px] text-zinc-300 hover:text-white hover:bg-zinc-800 gap-1"
                        >
                          {copiedLog ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedLog ? "Tersalin!" : "Salin Log"}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowLogDetails(!showLogDetails)}
                          className="h-7 px-2 text-[11px] text-zinc-300 hover:text-white hover:bg-zinc-800 gap-1"
                        >
                          {showLogDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          <span>{showLogDetails ? "Sembunyikan Log" : "Lihat Log"}</span>
                        </Button>
                      </div>
                    </div>

                    {showLogDetails && (
                      <div className="p-3 space-y-3">
                        {/* Sub Tabs */}
                        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                          <button
                            type="button"
                            onClick={() => setActiveLogTab("summary")}
                            className={`px-2.5 py-1 rounded text-[11px] font-sans transition-all ${
                              activeLogTab === "summary"
                                ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                                : "text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            Ringkasan Respon
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveLogTab("request")}
                            className={`px-2.5 py-1 rounded text-[11px] font-sans transition-all ${
                              activeLogTab === "request"
                                ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                                : "text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            Request Payload
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveLogTab("response")}
                            className={`px-2.5 py-1 rounded text-[11px] font-sans transition-all ${
                              activeLogTab === "response"
                                ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                                : "text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            Response Raw (JSON)
                          </button>
                        </div>

                        {/* Tab Content */}
                        {activeLogTab === "summary" && (
                          <div className="space-y-2 leading-relaxed">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-zinc-400">Timestamp: </span>
                                <span className="text-emerald-300">{testResult.logDetails.timestamp}</span>
                              </div>
                              <div>
                                <span className="text-zinc-400">Provider: </span>
                                <span className="text-amber-300">{testResult.logDetails.provider.toUpperCase()}</span>
                              </div>
                              <div>
                                <span className="text-zinc-400">Model: </span>
                                <span className="text-blue-300">{testResult.logDetails.model}</span>
                              </div>
                              <div>
                                <span className="text-zinc-400">Latensi: </span>
                                <span className="text-purple-300">{testResult.logDetails.latencyMs} ms</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-zinc-400">Target Endpoint URL: </span>
                              <span className="text-zinc-200 break-all">{testResult.logDetails.url}</span>
                            </div>
                            {testResult.logDetails.replyText && (
                              <div className="pt-2 border-t border-zinc-800">
                                <span className="text-zinc-400 block mb-1">Pesan Balasan Test Prompt (&quot;Ping&quot;):</span>
                                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-emerald-300 font-mono">
                                  &quot;{testResult.logDetails.replyText}&quot;
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {activeLogTab === "request" && (
                          <div className="space-y-2">
                            <div>
                              <span className="text-zinc-400 block mb-1">Target Endpoint:</span>
                              <span className="text-zinc-200">{testResult.logDetails.url}</span>
                            </div>
                            <div>
                              <span className="text-zinc-400 block mb-1">Headers:</span>
                              <pre className="p-2 rounded bg-zinc-900 text-amber-300 overflow-x-auto text-[11px]">
                                {JSON.stringify(testResult.logDetails.requestHeaders, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <span className="text-zinc-400 block mb-1">Request Body:</span>
                              <pre className="p-2 rounded bg-zinc-900 text-blue-300 overflow-x-auto text-[11px]">
                                {JSON.stringify(testResult.logDetails.requestBody, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {activeLogTab === "response" && (
                          <div>
                            <span className="text-zinc-400 block mb-1">Respon Mentah dari Provider LLM:</span>
                            <pre className="p-2.5 rounded bg-zinc-900 text-emerald-400 overflow-x-auto max-h-72 text-[11px] leading-relaxed">
                              {JSON.stringify(testResult.logDetails.responseBody, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      ) : config.provider === "puter" ? (
        /* Puter.js Info Panel — No API Key Required */
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-500 mx-auto">
              <Zap className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-green-700 dark:text-green-400">Puter.js AI — Gratis, Tanpa API Key</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
                Puter.js menggunakan akun Puter pengguna untuk memanggil AI terbaik seperti{" "}
                <code className="font-mono text-green-600 dark:text-green-400">claude-3-7-sonnet</code> dan{" "}
                <code className="font-mono text-green-600 dark:text-green-400">gpt-4o</code> secara gratis.
                Tidak perlu API key — cukup punya akun Puter aktif.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="space-y-1">
                <span className="font-medium text-green-700 dark:text-green-400 block">✅ Keunggulan Puter.js:</span>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>• Gratis tanpa kartu kredit</li>
                  <li>• Akses GPT-4o &amp; Claude Sonnet</li>
                  <li>• Auto-login via akun Puter</li>
                  <li>• Fallback otomatis tersedia</li>
                </ul>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-amber-600 dark:text-amber-400 block">⚠️ Perlu Diperhatikan:</span>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>• Berjalan di sisi browser</li>
                  <li>• Perlu internet &amp; akun Puter</li>
                  <li>• Rate limit tergantung kuota akun</li>
                  <li>• Prompt dikirim ke puter.com</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center pt-1">
              <Button
                size="sm"
                onClick={handleSave}
                className="gap-1.5 bg-green-600 hover:bg-green-700 text-white shadow-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Aktifkan Puter.js</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleProviderSelect("openai")}
                className="gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>Gunakan API Token</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-6 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mx-auto">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Mode Mandiri (Offline) Aktif</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
                SmartRPS Builder menggunakan engine pembangun RPS berbasis kurikulum OBE bawaan secara langsung tanpa memerlukan API Token atau layanan eksternal.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleProviderSelect("openai")}
                className="gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>Gunakan API Token (OpenAI / Anthropic / Dahl)</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleProviderSelect("puter")}
                className="gap-1.5"
              >
                <Zap className="h-3.5 w-3.5 text-green-500" />
                <span>Puter.js (Gratis, Tanpa API Key)</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
