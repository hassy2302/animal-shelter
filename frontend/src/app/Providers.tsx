"use client";

import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <RecentlyViewedProvider>{children}</RecentlyViewedProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
