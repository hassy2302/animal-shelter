import type { Animal } from "@/types/animal";
import AnimalCard from "./AnimalCard";

interface AnimalGridProps {
  animals: Animal[];
  isLoading?: boolean;
}

export default function AnimalGrid({ animals, isLoading }: AnimalGridProps) {
  if (isLoading && animals.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-brand-100" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && animals.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--muted)]">
        <div className="text-5xl mb-4">🐾</div>
        <p className="font-bold text-base">조건에 맞는 동물이 없습니다</p>
        <p className="text-sm mt-1">필터를 변경하거나 초기화해보세요.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity duration-200 ${isLoading ? "opacity-60" : "opacity-100"}`}>
      {animals.map((animal, i) => (
        <AnimalCard key={animal.desertionNo || animal.noticeNo || i} animal={animal} />
      ))}
    </div>
  );
}
