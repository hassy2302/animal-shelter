"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "animal-favorites";

interface FavoritesContextValue {
  favorites: Set<string>;
  isFavorite: (noticeNo: string) => boolean;
  toggle: (noticeNo: string) => void;
  count: number;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(new Set(JSON.parse(stored) as string[]));
    } catch {}
  }, []);

  const toggle = useCallback((noticeNo: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(noticeNo)) next.delete(noticeNo);
      else next.add(noticeNo);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (noticeNo: string) => favorites.has(noticeNo),
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggle, count: favorites.size }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
