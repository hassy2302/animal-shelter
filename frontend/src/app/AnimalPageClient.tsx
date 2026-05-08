"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { AnimalListResponse } from "@/types/animal";
import type { AnimalFilters } from "@/types/animal";
import { useAnimals } from "@/hooks/useAnimals";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { fetchAnimalsBatch, fetchAnimals } from "@/lib/api";
import type { Animal } from "@/types/animal";
import { DEFAULT_FILTERS } from "@/lib/constants";
import Header from "@/components/layout/Header";
import StatsBar from "@/components/layout/StatsBar";
import FilterBar from "@/components/filters/FilterBar";
import SpeciesPills from "@/components/filters/SpeciesPills";
import AnimalGrid from "@/components/animals/AnimalGrid";
import Pagination from "@/components/pagination/Pagination";
import ScrollToTop from "@/components/layout/ScrollToTop";

const ADOPTION_STEPS = [
  { icon: "🔍", title: "공고 찾기", desc: "마음에 드는 동물을 찾아요" },
  { icon: "📞", title: "보호소 연락", desc: "공고의 전화번호로 문의해요" },
  { icon: "📝", title: "입양 신청", desc: "보호소 방문 후 신청서 작성" },
  { icon: "🏠", title: "입양 완료", desc: "새 가족이 됐어요!" },
];

function AdoptionGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 border border-[#D1E3FF] dark:border-[#1E3A5F] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 bg-[#EFF6FF] dark:bg-[#0F1E33] text-left"
      >
        <span className="text-sm font-bold text-[#1D4ED8] dark:text-[#93C5FD]">💡 입양은 어떻게 하나요?</span>
        <span className="text-xs text-[#3B82F6] dark:text-[#60A5FA]">{open ? "접기 ▲" : "펼치기 ▼"}</span>
      </button>
      {open && (
        <div className="px-5 py-4 bg-white dark:bg-[#111827]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ADOPTION_STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1.5 p-3 bg-[#F8FAFF] dark:bg-[#1E2A3A] rounded-xl">
                <span className="text-2xl">{step.icon}</span>
                <span className="text-xs font-extrabold text-[var(--text)]">{i + 1}. {step.title}</span>
                <span className="text-xs text-[var(--muted)]">{step.desc}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--muted)] leading-relaxed">
            보호소마다 입양 절차가 다를 수 있어요. 보호소 번호를 확인해 문의해보세요! 공고 기간이 끝나기 전에도 입양 가능한 경우가 있어요.
          </p>
        </div>
      )}
    </div>
  );
}

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
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [recentAnimals, setRecentAnimals] = useState<Animal[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const { data, animals, total, totalPages, fetchedAt, isLoading, error } = useAnimals(filters);
  const { favorites, count: favCount, cleanup } = useFavorites();
  const { recentlyViewed, count: recentCount } = useRecentlyViewed();
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

  useEffect(() => {
    if (!showRecentOnly || recentlyViewed.length === 0) {
      setRecentAnimals([]);
      return;
    }
    setRecentLoading(true);
    fetchAnimalsBatch(recentlyViewed)
      .then((result) => {
        const ordered = recentlyViewed
          .map((no) => result.find((a: Animal) => a.noticeNo === no))
          .filter(Boolean) as Animal[];
        setRecentAnimals(ordered);
      })
      .catch(() => setRecentAnimals([]))
      .finally(() => setRecentLoading(false));
  }, [showRecentOnly, recentlyViewed]);

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
  const [marqueeAnimals, setMarqueeAnimals] = useState<Animal[]>([]);

  useEffect(() => {
    fetchAnimals({ per_page: 48, page: 1, state: "protect" })
      .then((res) => {
        const totalPages = res.total_pages;
        const pageSet = new Set<number>();
        pageSet.add(1);
        while (pageSet.size < Math.min(3, totalPages)) {
          pageSet.add(Math.floor(Math.random() * totalPages) + 1);
        }
        const extraPages = [...pageSet].filter((p) => p !== 1);
        return Promise.all([
          Promise.resolve(res),
          ...extraPages.map((p) => fetchAnimals({ per_page: 48, page: p, state: "protect" })),
        ]);
      })
      .then((results) => {
        const all = results.flatMap((r) => r.items);
        const seen = new Set<string>();
        const unique = all.filter((a: Animal) => {
          if (seen.has(a.noticeNo)) return false;
          seen.add(a.noticeNo);
          return (a.upkind !== "417000" && a.upkind !== "422400") && (a.popfile1 || a.popfile2);
        });
        setMarqueeAnimals(unique.sort(() => Math.random() - 0.5).slice(0, 32));
      })
      .catch(() => {});
  }, []);
  const displayAnimals = showFavoritesOnly ? favoriteAnimals : showRecentOnly ? recentAnimals : rawAnimals;
  const displayTotal = showFavoritesOnly ? favoriteAnimals.length : showRecentOnly ? recentAnimals.length : (data !== undefined ? total : (initialData?.total ?? 0));
  const displayTotalPages = (showFavoritesOnly || showRecentOnly) ? 1 : (data !== undefined ? totalPages : (initialData?.total_pages ?? 1));
  const displayFetchedAt = data !== undefined ? fetchedAt : initialData?.fetched_at;
  const activePerPage = filters.per_page ?? 12;
  const displayLoading = showFavoritesOnly ? favoriteLoading : showRecentOnly ? recentLoading : isLoading;

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-8">
      <Header featuredAnimals={marqueeAnimals} />

      {/* 신고 안내 배너 */}
      <div className="mb-4 px-5 py-3.5 bg-[#FFF1E6] dark:bg-[#2C1A0E] border border-brand-200 dark:border-[#6B3015] rounded-2xl text-center">
        <p className="text-base font-bold text-[#9A3412] dark:text-[#FB923C] mb-2.5">🐾 유기 동물을 발견하셨나요?</p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="tel:1577-0954"
            className="text-base font-bold text-brand-500 hover:text-brand-600 bg-white dark:bg-[#1E1B18] border border-brand-200 dark:border-[#6B3015] px-4 py-1.5 rounded-full transition-colors shadow-sm whitespace-nowrap"
          >
            📞 1577-0954
          </a>
          <a
            href="https://www.animal.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-bold text-brand-500 hover:text-brand-600 bg-white dark:bg-[#292524] border border-brand-200 dark:border-[#7C2D12] px-4 py-1.5 rounded-full transition-colors shadow-sm whitespace-nowrap"
          >
            🌐 홈페이지 신고
          </a>
        </div>
      </div>

      {/* 입양 안내 배너 */}
      <AdoptionGuide />

      {/* 종류 필터 */}
      <div className={`mb-3 transition-opacity ${(showFavoritesOnly || showRecentOnly) ? "opacity-40 pointer-events-none select-none" : ""}`}>
        <SpeciesPills
          value={filters.species ?? "전체"}
          onChange={(v) => {
            updateFilters({ species: v, page: 1 });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>

      {/* 찜 토글 + 최근 본 동물 토글 */}
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => { setShowFavoritesOnly((v: boolean) => !v); setShowRecentOnly(false); }}
          className={`text-sm font-bold px-4 py-1.5 rounded-full border transition-colors ${
            showFavoritesOnly
              ? "bg-red-50 dark:bg-[#4C0519] text-red-500 border-red-300 dark:border-[#9F1239]"
              : "bg-white dark:bg-[#292524] text-[var(--muted)] border-[var(--border)] hover:border-red-300"
          }`}
        >
          {showFavoritesOnly ? "❤️ 찜한 동물만" : `🤍 찜한 동물 (${favCount})`}
        </button>
        {recentCount > 0 && (
          <button
            onClick={() => { setShowRecentOnly((v: boolean) => !v); setShowFavoritesOnly(false); }}
            className={`text-sm font-bold px-4 py-1.5 rounded-full border transition-colors ${
              showRecentOnly
                ? "bg-blue-50 dark:bg-[#172554] text-blue-500 border-blue-300 dark:border-[#1E3A8A]"
                : "bg-white dark:bg-[#292524] text-[var(--muted)] border-[var(--border)] hover:border-blue-300"
            }`}
          >
            {showRecentOnly ? "🕐 최근 본 동물만" : "🕐 최근 본 동물"}
          </button>
        )}
      </div>

      {/* 지역/상태 필터 */}
      <div className={`mb-3 transition-opacity ${(showFavoritesOnly || showRecentOnly) ? "opacity-40 pointer-events-none select-none" : ""}`}>
        <FilterBar filters={filters} onChange={updateFilters} onReset={handleReset} />
      </div>

      {/* 텍스트 검색 */}
      <div className={`mb-4 relative transition-opacity ${(showFavoritesOnly || showRecentOnly) ? "opacity-40 pointer-events-none select-none" : ""}`}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="🔍 공고번호, 보호소명, 발견장소 등 검색"
          aria-label="동물 검색"
          className={`w-full text-base bg-white dark:bg-[#292524] border rounded-lg px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-brand-300 transition-colors ${
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
      <div className={`flex items-center justify-between mb-2 transition-opacity ${(showFavoritesOnly || showRecentOnly) ? "opacity-40 pointer-events-none select-none" : ""}`}>
        <div className="flex items-center gap-1">
          {(["latest", "oldest"] as const).map((v) => (
            <button
              key={v}
              onClick={() => updateFilters({ sort: v, page: 1 })}
              className={`text-sm px-2.5 py-1 rounded-lg font-bold transition-colors ${
                (filters.sort ?? "latest") === v
                  ? "bg-brand-500 text-white"
                  : "bg-white dark:bg-[#292524] border border-[var(--border)] text-[var(--muted)] hover:border-brand-300"
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
                  : "bg-white dark:bg-[#292524] border border-[var(--border)] text-[var(--muted)] hover:border-brand-300"
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
          <p className="text-sm text-[var(--muted)]">{error.message}</p>
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
            showRecentOnly ? "최근 본 동물이 없어요" :
            filters.search ? "검색 결과가 없어요" :
            "조건에 맞는 동물이 없습니다"
          }
          emptySubMessage={
            showFavoritesOnly && favoriteError ? "잠시 후 다시 시도해주세요." :
            showFavoritesOnly ? "동물 카드의 🤍를 눌러 찜해보세요." :
            showRecentOnly ? "상세보기를 누르면 기록돼요." :
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

        {/* 앱 다운로드 */}
        <div className="text-center mb-6">
          <p className="text-xs font-bold text-[var(--muted)] mb-3">📱 앱으로 더 편리하게!</p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=app.animalshelter.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl hover:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.76c.35.2.74.24 1.12.12l11.5-6.63-2.48-2.49-10.14 8.99zM.5 1.5C.19 1.86 0 2.4 0 3.1v17.8c0 .7.19 1.24.5 1.6l.08.08 9.97-9.97v-.24L.58 1.42.5 1.5zM20.37 10.3l-2.84-1.64-2.77 2.77 2.77 2.77 2.87-1.65c.82-.47.82-1.24-.03-1.25zM4.3.12L15.8 6.75l-2.48 2.49L3.18.24C3.56.12 3.95.16 4.3.32V.12z"/>
              </svg>
              <div className="text-left">
                <div className="text-[9px] opacity-80 leading-none">Google Play에서 받기</div>
                <div className="text-sm font-bold leading-tight">Google Play</div>
              </div>
            </a>
            <div className="relative flex items-center gap-2 px-4 py-2.5 bg-[#E7E5E4] dark:bg-[#3D3935] text-[#A8A29E] rounded-xl cursor-not-allowed">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.22 1.3-2.2 3.87.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.61M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <div className="text-[9px] leading-none">출시 예정</div>
                <div className="text-sm font-bold leading-tight">App Store</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text)] mb-1">유기 동물을 발견하셨나요?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="tel:1577-0954"
                className="inline-flex items-center gap-1.5 text-base font-bold text-brand-500 hover:text-brand-600 transition-colors"
              >
                📞 1577-0954
              </a>
              <span className="hidden sm:block w-1 h-1 bg-[#D6D3D1] dark:bg-[#57534E] rounded-full" />
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
          <div className="hidden sm:flex items-center gap-2 absolute left-0">
            <span className="text-xs text-[var(--muted)] font-semibold">문의</span>
            <a
              href="mailto:hassy2302@gmail.com"
              className="text-sm bg-white/70 dark:bg-white/5 border border-[#E5E0D8] dark:border-[#44403C] text-[var(--muted)] px-2.5 py-0.5 rounded-full font-semibold hover:text-brand-500 transition-colors"
            >
              ✉️ hassy2302@gmail.com
            </a>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1.5 absolute right-0">
            <span className="text-xs text-[var(--muted)] font-semibold">유기 동물 정보 제공</span>
            <span className="text-sm bg-white/70 border border-[#E5E0D8] text-[var(--muted)] px-2.5 py-0.5 rounded-full font-semibold">
              🏛️ 농림축산식품부
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
