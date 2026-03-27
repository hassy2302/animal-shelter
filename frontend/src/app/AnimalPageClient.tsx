"use client";

import { useState, useCallback } from "react";
import type { AnimalListResponse } from "@/types/animal";
import type { AnimalFilters } from "@/types/animal";
import { useAnimals } from "@/hooks/useAnimals";
import { refreshAnimals } from "@/lib/api";
import { DEFAULT_FILTERS } from "@/lib/constants";
import Header from "@/components/layout/Header";
import StatsBar from "@/components/layout/StatsBar";
import FilterBar from "@/components/filters/FilterBar";
import SpeciesPills from "@/components/filters/SpeciesPills";
import AnimalGrid from "@/components/animals/AnimalGrid";
import Pagination from "@/components/pagination/Pagination";

interface Props {
  initialData: AnimalListResponse | null;
}

export default function AnimalPageClient({ initialData }: Props) {
  const [filters, setFilters] = useState<AnimalFilters>(DEFAULT_FILTERS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, animals, total, totalPages, fetchedAt, isLoading, refresh } = useAnimals(filters);

  const updateFilters = useCallback((patch: Partial<AnimalFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const [manualFetchedAt, setManualFetchedAt] = useState<string | undefined>(undefined);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await refreshAnimals(filters.sido_code ?? "", filters.sigungu_code ?? "");
      setManualFetchedAt(fresh.fetched_at);
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const displayAnimals = data !== undefined ? animals : (initialData?.items ?? []);
  const displayTotal = data !== undefined ? total : (initialData?.total ?? 0);
  const displayTotalPages = data !== undefined ? totalPages : (initialData?.total_pages ?? 1);
  const displayFetchedAt = manualFetchedAt ?? (data !== undefined ? fetchedAt : initialData?.fetched_at);

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-8">
      <Header />

      {/* 종류 필터 */}
      <div className="mb-3">
        <SpeciesPills
          value={filters.species ?? "전체"}
          onChange={(v) => updateFilters({ species: v, page: 1 })}
        />
      </div>

      {/* 지역/상태 필터 */}
      <div className="mb-4">
        <FilterBar filters={filters} onChange={updateFilters} onReset={handleReset} />
      </div>

      <hr className="border-[var(--border)] mb-4" />

      {/* 통계 바 */}
      <StatsBar
        total={displayTotal}
        page={filters.page ?? 1}
        totalPages={displayTotalPages}
        fetchedAt={displayFetchedAt}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 카드 그리드 */}
      <AnimalGrid animals={displayAnimals} isLoading={isLoading} />

      {/* 페이지네이션 */}
      {displayTotalPages > 1 && (
        <Pagination
          page={filters.page ?? 1}
          totalPages={displayTotalPages}
          onChange={(p) => {
            setFilters((prev) => ({ ...prev, page: p }));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </main>
  );
}
