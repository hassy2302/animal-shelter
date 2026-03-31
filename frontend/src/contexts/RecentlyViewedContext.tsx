"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "animal-recently-viewed";
const MAX_COUNT = 10;

interface RecentlyViewedContextValue {
  recentlyViewed: string[];
  addRecentlyViewed: (noticeNo: string) => void;
  count: number;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecentlyViewed(JSON.parse(stored) as string[]);
    } catch {}
  }, []);

  const addRecentlyViewed = useCallback((noticeNo: string) => {
    setRecentlyViewed((prev) => {
      const next = [noticeNo, ...prev.filter((n) => n !== noticeNo)].slice(0, MAX_COUNT);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, addRecentlyViewed, count: recentlyViewed.length }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return ctx;
}
