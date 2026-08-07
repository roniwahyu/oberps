"use client";

import { useEffect, useCallback } from "react";

export interface ShortcutHandlers {
  onGenerate?: () => void;
  onSave?: () => void;
  onPreset?: () => void;
  onReset?: () => void;
  onPrint?: () => void;
  onToggleView?: () => void;
}

function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    el.isContentEditable
  );
}

/**
 * Global keyboard shortcuts:
 * - Ctrl/Cmd+Enter : Generate RPS
 * - Ctrl/Cmd+S     : Save RPS
 * - Ctrl/Cmd+K     : Open preset library
 * - Ctrl/Cmd+P     : Print / PDF
 * - Ctrl/Cmd+Shift+V: Toggle Ringkasan/JSON view
 * - Ctrl/Cmd+Shift+R: Reset form
 */
export function useKeyboardShortcuts(
  handlers: ShortcutHandlers,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      // Ctrl+S — always prevent default browser save
      if (e.key.toLowerCase() === "s" && !e.shiftKey) {
        e.preventDefault();
        if (handlers.onSave) {
          handlers.onSave();
        }
        return;
      }

      // Ctrl+P — prevent default print, use our print
      if (e.key.toLowerCase() === "p" && !e.shiftKey) {
        e.preventDefault();
        if (handlers.onPrint) {
          handlers.onPrint();
        }
        return;
      }

      // Ctrl+K — open preset
      if (e.key.toLowerCase() === "k" && !e.shiftKey) {
        e.preventDefault();
        if (handlers.onPreset) {
          handlers.onPreset();
        }
        return;
      }

      // Ctrl+Enter — generate
      if (e.key === "Enter") {
        e.preventDefault();
        if (handlers.onGenerate && !isEditableTarget(e.target)) {
          handlers.onGenerate();
        }
        return;
      }

      // Ctrl+Shift+V — toggle view
      if (e.key.toLowerCase() === "v" && e.shiftKey) {
        e.preventDefault();
        if (handlers.onToggleView) {
          handlers.onToggleView();
        }
        return;
      }

      // Ctrl+Shift+R — reset
      if (e.key.toLowerCase() === "r" && e.shiftKey) {
        e.preventDefault();
        if (handlers.onReset) {
          handlers.onReset();
        }
        return;
      }
    },
    [enabled, handlers]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
