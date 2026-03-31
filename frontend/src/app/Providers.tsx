"use client";

import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <RecentlyViewedProvider>{children}</RecentlyViewedProvider>
    </FavoritesProvider>
  );
}
