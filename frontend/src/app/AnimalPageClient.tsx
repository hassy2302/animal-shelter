"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { AnimalListResponse } from "@/types/animal";
import type { AnimalFilters } from "@/types/animal";
import { useAnimals } from "@/hooks/useAnimals";
import { useFavorites } from "@/contexts/FavoritesContext";
import { fetchAnimalsBatch } from "@/lib/api";
import type { Animal } from "@/types/animal";
import { DEFAULT_FILTERS } from "@/lib/constants";
import Header from "@/components/layout/Header";
import StatsBar from "@/components/layout/StatsBar";
import FilterBar from "@/components/filters/FilterBar";
import SpeciesPills from "@/components/filters/SpeciesPills";
import AnimalGrid from "@/components/animals/AnimalGrid";
import Pagination from "@/components/pagination/Pagination";
import ScrollToTop from "@/components/layout/ScrollToTop";

interface Props {
  initialData: AnimalListResponse | null;
  initialFilters?: AnimalFilters;
}

export default function AnimalPageClient({ initialData, initialFilters }: Props) {
  const [filters, setFilters] = useState<AnimalFilters>({ ...DEFAULT_FILTERS, ...initialFilters });
  const [searchInput, setSearchInput] = useState(initialFilters?.search ?? "");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteAnimals, setFavoriteAnimals] = useState<Animal[]>([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState(false);
  const { data, animals, total, totalPages, fetchedAt, isLoading, error } = useAnimals(filters);
  const { favorites, count: favCount, cleanup } = useFavorites();
  const cleanupDone = useRef(false);

  // 페이지 로드 시 찜 목록 자동 정리 (종료된 공고 제거)
  useEffect(() => {
    if (cleanupDone.current || favorites.size === 0) return;
    cleanupDone.current = true;
    fetchAnimalsBatch([...favorites])
      .then((result) => cleanup(result.map((a: Animal) => a.noticeNo)))
      .catch(() => {});
  }, [favorites, cleanup]);

  useEffect(() => {
    if (!showFavoritesOnly || favorites.size === 0) {
      setFavoriteAnimals([]);
      setFavoriteError(false);
      return;
    }
    setFavoriteLoading(true);
    setFavoriteError(false);
    fetchAnimalsBatch([...favorites])
      .then((result) => {
        setFavoriteAnimals(result);
        cleanup(result.map((a: Animal) => a.noticeNo));
      })
      .catch(() => { setFavoriteAnimals([]); setFavoriteError(true); })
      .finally(() => setFavoriteLoading(false));
  }, [showFavoritesOnly, favorites, cleanup]);
  const pathname = usePathname();
  const isFirstRender = useRef(true);

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

  // URL 동기화 (히스토리 API로 페이지 리로드 없이 URL 반영)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (filters.sido_code) params.set("sido_code", filters.sido_code);
    if (filters.sigungu_code) params.set("sigungu_code", filters.sigungu_code);
    if (filters.state && filters.state !== "protect") params.set("state", filters.state);
    if (filters.species && filters.species !== "전체") params.set("species", filters.species);
    if (filters.search) params.set("search", filters.search);
    if (filters.page && filters.page > 1) params.set("page", String(filters.page));
    if (filters.per_page) params.set("per_page", String(filters.per_page));
    if (filters.sort && filters.sort !== "latest") params.set("sort", filters.sort);
    const query = params.toString();
    window.history.replaceState(null, "", pathname + (query ? `?${query}` : ""));
  }, [filters, pathname]);

  const rawAnimals = data !== undefined ? animals : (initialData?.items ?? []);
  const displayAnimals = showFavoritesOnly ? favoriteAnimals : rawAnimals;
  const displayTotal = showFavoritesOnly ? favoriteAnimals.length : (data !== undefined ? total : (initialData?.total ?? 0));
  const displayTotalPages = showFavoritesOnly ? 1 : (data !== undefined ? totalPages : (initialData?.total_pages ?? 1));
  const displayFetchedAt = data !== undefined ? fetchedAt : initialData?.fetched_at;
  const activePerPage = filters.per_page ?? 12;
  const displayLoading = showFavoritesOnly ? favoriteLoading : isLoading;

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-8">
      <Header />

      {/* 신고 안내 배너 */}
      <div className="mb-4 px-5 py-3.5 bg-[#FFF1E6] border border-brand-200 rounded-2xl text-center">
        <p className="text-base font-bold text-[#9A3412] mb-2.5">🐾 유기동물을 발견하셨나요?</p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="tel:1577-0954"
            className="text-base font-bold text-brand-500 hover:text-brand-600 bg-white border border-brand-200 px-4 py-1.5 rounded-full transition-colors shadow-sm whitespace-nowrap"
          >
            📞 1577-0954
          </a>
          <a
            href="https://www.animal.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-bold text-brand-500 hover:text-brand-600 bg-white border border-brand-200 px-4 py-1.5 rounded-full transition-colors shadow-sm whitespace-nowrap"
          >
            🌐 홈페이지 신고
          </a>
        </div>
      </div>

      {/* 종류 필터 */}
      <div className={`mb-3 transition-opacity ${showFavoritesOnly ? "opacity-40 pointer-events-none select-none" : ""}`}>
        <SpeciesPills
          value={filters.species ?? "전체"}
          onChange={(v) => {
            updateFilters({ species: v, page: 1 });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>

      {/* 찜 토글 */}
      <div className="mb-3">
        <button
          onClick={() => setShowFavoritesOnly((v: boolean) => !v)}
          className={`text-sm font-bold px-4 py-1.5 rounded-full border transition-colors ${
            showFavoritesOnly
              ? "bg-red-50 text-red-500 border-red-300"
              : "bg-white text-[var(--muted)] border-[var(--border)] hover:border-red-300"
          }`}
        >
          {showFavoritesOnly ? "❤️ 찜한 동물만" : `🤍 찜한 동물 (${favCount})`}
        </button>
      </div>

      {/* 지역/상태 필터 */}
      <div className={`mb-3 transition-opacity ${showFavoritesOnly ? "opacity-40 pointer-events-none select-none" : ""}`}>
        <FilterBar filters={filters} onChange={updateFilters} onReset={handleReset} />
      </div>

      {/* 텍스트 검색 */}
      <div className={`mb-4 relative transition-opacity ${showFavoritesOnly ? "opacity-40 pointer-events-none select-none" : ""}`}>
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

      {/* 정렬 + 페이지당 표시 수 */}
      <div className={`flex items-center justify-between mb-2 transition-opacity ${showFavoritesOnly ? "opacity-40 pointer-events-none select-none" : ""}`}>
        <div className="flex items-center gap-1">
          {(["latest", "oldest"] as const).map((v) => (
            <button
              key={v}
              onClick={() => updateFilters({ sort: v, page: 1 })}
              className={`text-sm px-2.5 py-1 rounded-lg font-bold transition-colors ${
                (filters.sort ?? "latest") === v
                  ? "bg-brand-500 text-white"
                  : "bg-white border border-[var(--border)] text-[var(--muted)] hover:border-brand-300"
              }`}
            >
              {v === "latest" ? "최신순" : "과거순"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {([12, 24, 48] as const).map((n) => (
            <button
              key={n}
              onClick={() => updateFilters({ per_page: n, page: 1 })}
              className={`text-sm px-2.5 py-1 rounded-lg font-bold transition-colors ${
                activePerPage === n
                  ? "bg-brand-500 text-white"
                  : "bg-white border border-[var(--border)] text-[var(--muted)] hover:border-brand-300"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* 통계 바 */}
      <div className="mb-4">
        <StatsBar
          total={displayTotal}
          page={filters.page ?? 1}
          totalPages={displayTotalPages}
          fetchedAt={displayFetchedAt}
        />
      </div>

      {/* 에러 */}
      {error && !displayLoading && (
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
      {!error && (
        <AnimalGrid
          animals={displayAnimals}
          isLoading={displayLoading}
          emptyMessage={
            showFavoritesOnly && favoriteError ? "찜 목록을 불러오지 못했어요" :
            showFavoritesOnly ? "찜한 동물이 없어요" :
            filters.search ? "검색 결과가 없어요" :
            "조건에 맞는 동물이 없습니다"
          }
          emptySubMessage={
            showFavoritesOnly && favoriteError ? "잠시 후 다시 시도해주세요." :
            showFavoritesOnly ? "동물 카드의 🤍를 눌러 찜해보세요." :
            filters.search ? `'${filters.search}'에 대한 결과가 없습니다.` :
            "필터를 변경하거나 초기화해보세요."
          }
        />
      )}

      {/* 페이지네이션 - 찜 모드에서는 숨김 */}
      {!error && !showFavoritesOnly && displayTotalPages > 1 && (
        <Pagination
          page={filters.page ?? 1}
          totalPages={displayTotalPages}
          onChange={(p) => {
            setFilters((prev) => ({ ...prev, page: p }));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      <ScrollToTop />

      {/* 푸터 */}
      <footer className="mt-12 py-6 border-t border-[var(--border)]">
        <div className="relative flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text)] mb-1">유기동물을 발견하셨나요?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="tel:1577-0954"
                className="inline-flex items-center gap-1.5 text-base font-bold text-brand-500 hover:text-brand-600 transition-colors"
              >
                📞 1577-0954
              </a>
              <span className="hidden sm:block w-1 h-1 bg-[#D6D3D1] rounded-full" />
              <a
                href="https://www.animal.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-base font-bold text-brand-500 hover:text-brand-600 transition-colors"
              >
                🌐 홈페이지 신고
              </a>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1.5 absolute right-0">
            <span className="text-xs text-[var(--muted)] font-semibold">데이터 출처</span>
            <span className="text-sm bg-white/70 border border-[#E5E0D8] text-[var(--muted)] px-2.5 py-0.5 rounded-full font-semibold">
              🏛️ 국가동물보호정보시스템
            </span>
            <span className="text-sm bg-white/70 border border-[#E5E0D8] text-[var(--muted)] px-2.5 py-0.5 rounded-full font-semibold">
              🌆 대전광역시 유기동물공고현황
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
