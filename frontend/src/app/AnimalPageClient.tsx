"use client";

import { useState, useCallback, useEffect } from "react";
import type { AnimalListResponse } from "@/types/animal";
import type { AnimalFilters } from "@/types/animal";
import { useAnimals } from "@/hooks/useAnimals";
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
  const [searchInput, setSearchInput] = useState("");
  const { data, animals, total, totalPages, fetchedAt, isLoading, error } = useAnimals(filters);

  const updateFilters = useCallback((patch: Partial<AnimalFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
  }, []);

  // 검색어 디바운스 (400ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const displayAnimals = data !== undefined ? animals : (initialData?.items ?? []);
  const displayTotal = data !== undefined ? total : (initialData?.total ?? 0);
  const displayTotalPages = data !== undefined ? totalPages : (initialData?.total_pages ?? 1);
  const displayFetchedAt = data !== undefined ? fetchedAt : initialData?.fetched_at;

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-8">
      <Header />

      {/* 종류 필터 */}
      <div className="mb-3">
        <SpeciesPills
          value={filters.species ?? "전체"}
          onChange={(v) => {
            updateFilters({ species: v, page: 1 });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>

      {/* 지역/상태 필터 */}
      <div className="mb-3">
        <FilterBar filters={filters} onChange={updateFilters} onReset={handleReset} />
      </div>

      {/* 텍스트 검색 */}
      <div className="mb-4 relative">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="🔍 공고번호, 보호소명, 발견장소 등 검색"
          aria-label="동물 검색"
          className={`w-full text-base bg-white border rounded-lg px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-brand-300 transition-colors ${
            searchInput !== (filters.search ?? "")
              ? "border-brand-300"
              : "border-[var(--border)]"
          }`}
        />
        {searchInput !== (filters.search ?? "") && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-400">검색 중...</span>
        )}
      </div>

      <hr className="border-[var(--border)] mb-4" />

      {/* 통계 바 */}
      <StatsBar
        total={displayTotal}
        page={filters.page ?? 1}
        totalPages={displayTotalPages}
        fetchedAt={displayFetchedAt}
      />

      {/* 에러 */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-4">😿</p>
          <p className="text-base font-semibold text-[var(--text)] mb-1">
            {error.message === "서버 응답 시간이 초과됐어요"
              ? "서버에 연결할 수 없어요"
              : "데이터를 불러오지 못했어요"}
          </p>
          <p className="text-sm text-[var(--muted)]">{error.message === "서버 응답 시간이 초과됐어요"
            ? "서버가 응답하지 않습니다. 잠시 후 다시 시도해주세요."
            : "잠시 후 다시 시도해주세요."}</p>
        </div>
      )}

      {/* 카드 그리드 */}
      {!error && <AnimalGrid animals={displayAnimals} isLoading={isLoading} />}

      {/* 페이지네이션 */}
      {!error && displayTotalPages > 1 && (
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
