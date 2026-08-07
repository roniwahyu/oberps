"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "smartrps-favorites";

function readFavoritesFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as string[];
      return new Set(arr);
    }
  } catch {
    // ignore parse errors
  }
  return new Set();
}

/**
 * Hook for managing RPS favorites (pinned RPS) in localStorage.
 * Favorites are stored as a Set of RPS IDs, persisted to localStorage.
 */
export function useFavorites() {
  // Lazy initializer reads from localStorage on first client render.
  // Note: SSR will render empty Set, then hydrate with localStorage data.
  const [favorites, setFavorites] = useState<Set<string>>(() => readFavoritesFromStorage());

  // Persist to localStorage whenever favorites change
  useEffect(() => {
    try {
      const arr = Array.from(favorites);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch {
      // ignore storage errors
    }
  }, [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites(new Set());
  }, []);

  return {
    favorites,
    favoriteIds: Array.from(favorites),
    favoriteCount: favorites.size,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    loaded: true,
  };
}
