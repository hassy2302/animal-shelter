"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="맨 위로"
      className="fixed bottom-6 right-4 z-40 w-11 h-11 rounded-full bg-white border border-[var(--border)] shadow-md flex items-center justify-center text-[var(--muted)] hover:text-brand-500 hover:border-brand-300 transition-colors"
    >
      ↑
    </button>
  );
}
