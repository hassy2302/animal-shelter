"use client";

import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <FavoritesProvider>
          <RecentlyViewedProvider>{children}</RecentlyViewedProvider>
        </FavoritesProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
