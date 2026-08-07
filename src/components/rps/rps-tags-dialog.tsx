"use client";

import { useCallback, useEffect, useState } from "react";
import { Tag, Plus, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { parseTags, serializeTags, SUGGESTED_TAGS } from "@/lib/rps-tags";

interface RpsTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rpsId: string | null;
  rpsName: string;
  currentTags: string;
  onSaved: () => void;
}

export function RpsTagsDialog({
  open,
  onOpenChange,
  rpsId,
  rpsName,
  currentTags,
  onSaved,
}: RpsTagsDialogProps) {
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync tags when dialog opens
  useEffect(() => {
    if (open) {
      setTags(parseTags(currentTags));
      setNewTag("");
    }
  }, [open, currentTags]);

  const handleAddTag = useCallback(() => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setNewTag("");
      return;
    }
    setTags((prev) => [...prev, trimmed]);
    setNewTag("");
  }, [newTag, tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleAddSuggested = useCallback(
    (tag: string) => {
      if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
      setTags((prev) => [...prev, tag]);
    },
    [tags]
  );

  const handleSave = useCallback(async () => {
    if (!rpsId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/rps/${rpsId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: serializeTags(tags) }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Gagal menyimpan tags.");
      }
      toast({
        title: "Tags disimpan",
        description: `${tags.length} tag diterapkan ke "${rpsName}".`,
      });
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: "Gagal menyimpan",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [rpsId, tags, rpsName, toast, onSaved, onOpenChange]);

  const availableSuggestions = SUGGESTED_TAGS.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Tag className="h-4 w-4 text-primary" />
            Kelola Tags
          </DialogTitle>
          <DialogDescription className="text-xs">
            Tambahkan tag untuk mengategorisasi &ldquo;{rpsName}&rdquo;.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current tags */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tag Aktif ({tags.length})
            </label>
            {tags.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">
                Belum ada tag. Tambahkan dari saran atau ketik sendiri.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[11px] py-1 pl-2 pr-1 gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-0.5 rounded-full hover:bg-background/80 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Add new tag */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tambah Tag
            </label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Ketik tag lalu Enter..."
                className="h-9 text-sm"
              />
              <Button
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                size="sm"
                className="h-9 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Suggested tags */}
          {availableSuggestions.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Saran Tag
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableSuggestions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddSuggested(tag)}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] font-medium hover:bg-muted/60 hover:border-primary/30 transition-colors"
                  >
                    <Plus className="h-2.5 w-2.5" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="h-9"
          >
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="h-9">
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Simpan Tags
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
