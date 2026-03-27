"use client";

import useSWR from "swr";
import type { AnimalFilters, AnimalListResponse } from "@/types/animal";
import { buildApiUrl } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("데이터 로드 실패");
    return r.json() as Promise<AnimalListResponse>;
  });

export function useAnimals(filters: AnimalFilters) {
  const key = buildApiUrl("/api/animals", filters as Record<string, unknown>);

  const { data, error, isLoading, mutate } = useSWR<AnimalListResponse>(key, fetcher, {
    keepPreviousData: true,  // 필터 변경 시 깜빡임 방지
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
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
