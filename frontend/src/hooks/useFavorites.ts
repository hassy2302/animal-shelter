"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "animal-favorites";

export function useFavorites() {
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

  return { isFavorite, toggle, count: favorites.size };
}
