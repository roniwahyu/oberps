"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export type LLMProvider = "openai" | "anthropic" | "openrouter" | "dahl" | "custom" | "standalone";

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
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
    name: "Dahl Global (Kimi)",
    description: "Inference endpoint di inference.dahl.global/v1 dengan model Moonshot Kimi.",
    defaultBaseUrl: "https://inference.dahl.global/v1",
    defaultModel: "moonshotai/Kimi-K2.6",
    models: ["moonshotai/Kimi-K2.6", "moonshotai/Kimi-K1.5"],
  },
  custom: {
    name: "Custom / Local Server",
    description: "Server kompatibel OpenAI seperti Ollama, LocalAI, LM Studio, vLLM, Dahl Global.",
    defaultBaseUrl: "https://inference.dahl.global/v1",
    defaultModel: "moonshotai/Kimi-K2.6",
    models: ["moonshotai/Kimi-K2.6", "llama3", "mistral", "qwen", "gemma"],
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

interface LlmSettingsProps {
  onConfigChange?: (config: LLMConfig) => void;
}

export function LlmSettings({ onConfigChange }: LlmSettingsProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<LLMConfig>(DEFAULT_LLM_CONFIG);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    reply?: string;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const loaded = loadStoredLLMConfig();
    setConfig(loaded);
  }, []);

  const handleProviderSelect = (provider: LLMProvider) => {
    const preset = PROVIDER_PRESETS[provider];
    const newConfig: LLMConfig = {
      ...config,
      provider,
      baseUrl: config.baseUrl || preset.defaultBaseUrl,
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
        });
        toast({
          title: "Koneksi Berhasil!",
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
                  Konfigurasikan penyedia model kecerdasan buatan (OpenAI, Anthropic Claude, OpenRouter, atau Mode Mandiri).
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={config.provider === "standalone" ? "outline" : "default"}
                className="gap-1.5 py-1 px-2.5 font-normal text-xs"
              >
                {config.provider === "standalone" ? (
                  <>
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span>Mode Mandiri</span>
                  </>
                ) : config.provider === "anthropic" ? (
                  <>
                    <Cpu className="h-3 w-3 text-purple-400" />
                    <span>Anthropic Claude</span>
                  </>
                ) : config.provider === "openai" ? (
                  <>
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    <span>OpenAI API</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-3 w-3 text-blue-400" />
                    <span>{activePreset.name}</span>
                  </>
                )}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Provider Selector Cards */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Pilih Penyedia AI (Provider)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(PROVIDER_PRESETS) as LLMProvider[]).map((pKey) => {
            const p = PROVIDER_PRESETS[pKey];
            const isSelected = config.provider === pKey;
            return (
              <motion.div
                key={pKey}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleProviderSelect(pKey)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40"
                    : "border-border/60 bg-card hover:border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    {pKey === "openai" && <Sparkles className="h-4 w-4 text-emerald-500" />}
                    {pKey === "anthropic" && <Cpu className="h-4 w-4 text-purple-500" />}
                    {pKey === "openrouter" && <Globe className="h-4 w-4 text-blue-500" />}
                    {pKey === "custom" && <Server className="h-4 w-4 text-amber-500" />}
                    {pKey === "standalone" && <Zap className="h-4 w-4 text-orange-500" />}
                    <span>{p.name}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Form Fields for Selected Provider */}
      {config.provider !== "standalone" ? (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Konfigurasi Token &amp; Endpoint — {activePreset.name}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Token akan disimpan dengan aman di peramban lokal (localStorage) dan dikirimkan langsung ke rute API generate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            {/* API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="api-key" className="text-xs font-semibold">
                  API Token / Secret Key <span className="text-red-500">*</span>
                </Label>
                {config.apiKey && (
                  <button
                    onClick={() => setConfig({ ...config, apiKey: "" })}
                    className="text-[11px] text-muted-foreground hover:text-red-500 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Bersihkan
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder={
                    config.provider === "anthropic"
                      ? "sk-ant-api03-..."
                      : config.provider === "openrouter"
                      ? "sk-or-v1-..."
                      : "sk-proj-..."
                  }
                  className="pr-10 font-mono text-xs h-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Base URL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="base-url" className="text-xs font-semibold">
                  API Base URL Endpoint
                </Label>
                <button
                  onClick={() => setConfig({ ...config, baseUrl: activePreset.defaultBaseUrl })}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1"
                >
                  Reset Default
                </button>
              </div>
              <Input
                id="base-url"
                type="text"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder={activePreset.defaultBaseUrl}
                className="font-mono text-xs h-10"
              />
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model-select" className="text-xs font-semibold">
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

            {/* Test Connection Results */}
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border p-3.5 text-xs ${
                  testResult.success
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>{testResult.message}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span>Gagal Menghubungkan</span>
                    </>
                  )}
                </div>
                {testResult.success ? (
                  <p className="mt-1 text-[11px] opacity-90">
                    Respons tes: &quot;{testResult.reply}&quot; ({testResult.latencyMs}ms)
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] font-mono break-all opacity-90">{testResult.error}</p>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 flex-wrap border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={isTesting || !config.apiKey}
                className="gap-1.5 h-9"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menguji...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Tes Koneksi</span>
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
                <Button type="button" size="sm" onClick={handleSave} className="gap-1.5 h-9 shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Simpan Pengaturan</span>
                </Button>
              </div>
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
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleProviderSelect("openai")}
                className="gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>Gunakan API Token (OpenAI / Anthropic)</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
