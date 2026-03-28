"use client";

import useSWR from "swr";
import type { AnimalFilters, AnimalListResponse } from "@/types/animal";
import { buildApiUrl } from "@/lib/utils";

const fetcher = (url: string) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  return fetch(url, { signal: controller.signal })
    .then((r) => {
      if (!r.ok) throw new Error("데이터 로드 실패");
      return r.json() as Promise<AnimalListResponse>;
    })
    .catch((e: unknown) => {
      if (e instanceof Error && e.name === "AbortError") {
        throw new Error("서버 응답 시간이 초과됐어요");
      }
      throw e;
    })
    .finally(() => clearTimeout(timer));
};

export function useAnimals(filters: AnimalFilters) {
  const key = buildApiUrl("/api/animals", filters as Record<string, unknown>);

  const { data, error, isLoading, mutate } = useSWR<AnimalListResponse>(key, fetcher, {
    keepPreviousData: true,  // 필터 변경 시 깜빡임 방지
    revalidateOnFocus: false,
    dedupingInterval: 300_000,  // 5분
    refreshInterval: () => {
      // 다음 정각까지 남은 시간 (백엔드 워밍 여유 30초 추가)
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(nextHour.getHours() + 1, 0, 30, 0);
      return nextHour.getTime() - now.getTime();
    },
  });

  return {
    data,
    animals: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.total_pages ?? 1,
    fetchedAt: data?.fetched_at,
    isLoading,
    error,
    refresh: mutate,
  };
}
