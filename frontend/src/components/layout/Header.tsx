"use client";

import { useState } from "react";
import Image from "next/image";
import type { Animal } from "@/types/animal";
import AnimalDetailModal from "@/components/animals/AnimalDetailModal";
import { useTheme } from "@/contexts/ThemeContext";

interface HeaderProps {
  featuredAnimals?: Animal[];
}

export default function Header({ featuredAnimals = [] }: HeaderProps) {
  const [selected, setSelected] = useState<Animal | null>(null);
  const { theme, toggle } = useTheme();
  const items = featuredAnimals.length > 0
    ? [...featuredAnimals, ...featuredAnimals]
    : [];

  return (
    <>
      <div className="relative bg-gradient-to-br from-brand-100 via-[#FFF8F4] to-[#EEF4FF] dark:from-[#292524] dark:via-[#1C1917] dark:to-[#1E2A3A] border border-brand-200 dark:border-[#44403C] rounded-2xl overflow-hidden mb-4">
        <button
          onClick={toggle}
          aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/70 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 transition-colors text-base"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <div className="flex items-center gap-6 px-8 py-6">
          {/* 왼쪽: 서비스 이름 + 설명 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-500 border border-brand-200 dark:bg-[#3D1A08] dark:text-[#FB923C] dark:border-[#7C2D12] tracking-widest">🐹 햄소토</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)] tracking-tight mb-1.5">
              🐾 유기 동물 입양 공고
            </h1>
            <p className="text-base text-[var(--text)] leading-relaxed">
              보호소의 작은 동물들이에요.<br />
              공고 기간이 지나면 입양 절차가 시작돼요.<br />
              (공고 및 보호소마다 상이할 수 있어요)<br />
              새 가족을 찾고 있어요.
            </p>
          </div>

          {/* 오른쪽: 무한 흐르는 이미지 (PC만) */}
          {items.length > 0 && (
            <div className="hidden sm:block overflow-hidden w-1/2 shrink-0 rounded-xl">
              <div
                className="flex gap-3 animate-marquee"
                style={{ width: `${items.length * 156}px`, willChange: "transform" }}
              >
                {items.map((animal, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(animal)}
                    aria-label={`${animal.kindNm} 공고 보기`}
                    className="relative w-36 h-36 rounded-xl overflow-hidden shrink-0 border-2 border-white/70 dark:border-white/20 shadow-sm hover:scale-105 hover:border-brand-300 transition-transform duration-200"
                  >
                    <Image
                      src={animal.popfile1 || animal.popfile2 || ""}
                      alt={animal.kindNm}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <AnimalDetailModal animal={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
