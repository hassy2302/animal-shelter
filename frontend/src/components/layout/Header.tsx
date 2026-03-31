"use client";

import { useState } from "react";
import Image from "next/image";
import type { Animal } from "@/types/animal";
import AnimalDetailModal from "@/components/animals/AnimalDetailModal";

interface HeaderProps {
  featuredAnimals?: Animal[];
}

export default function Header({ featuredAnimals = [] }: HeaderProps) {
  const [selected, setSelected] = useState<Animal | null>(null);
  const items = featuredAnimals.length > 0
    ? [...featuredAnimals, ...featuredAnimals]
    : [];

  return (
    <>
      <div className="bg-gradient-to-br from-brand-100 via-[#FFF8F4] to-[#EEF4FF] border border-brand-200 rounded-2xl overflow-hidden mb-4">
        <div className="flex items-center gap-6 px-8 py-6">
          {/* 왼쪽: 서비스 이름 + 설명 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)] tracking-tight mb-1.5">
              🐾 유기 동물 입양 공고
            </h1>
            <p className="text-base text-[var(--text)] leading-relaxed">
              보호소의 작은 동물들이에요.<br />
              공고 기간이 지나면 입양 절차가 시작돼요.<br />
              <span className="text-sm text-[var(--muted)]">(공고 및 보호소마다 상이할 수 있어요)</span><br />
              <span className="font-bold text-brand-500">새 가족이 필요해요.</span>
            </p>
          </div>

          {/* 오른쪽: 무한 흐르는 이미지 (PC만) */}
          {items.length > 0 && (
            <div className="hidden sm:block overflow-hidden w-1/2 shrink-0 rounded-xl">
              <div
                className="flex gap-3 animate-marquee"
                style={{ width: `${items.length * 156}px` }}
              >
                {items.map((animal, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(animal)}
                    aria-label={`${animal.kindNm} 공고 보기`}
                    className="relative w-36 h-36 rounded-xl overflow-hidden shrink-0 border-2 border-white/70 shadow-sm hover:scale-105 hover:border-brand-300 transition-transform duration-200"
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
