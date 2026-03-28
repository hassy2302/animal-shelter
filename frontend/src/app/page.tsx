import { fetchAnimals } from "@/lib/api";
import type { AnimalFilters } from "@/types/animal";
import AnimalPageClient from "./AnimalPageClient";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const str = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);
  const validStates = ["all", "protect", "complete", "etc"] as const;
  const validPerPage = [12, 24, 48] as const;

  const initialFilters: AnimalFilters = {
    sido_code: str("sido_code") ?? "",
    sigungu_code: str("sigungu_code") ?? "",
    state: validStates.find((s) => s === str("state")) ?? "protect",
    species: str("species") ?? "전체",
    search: str("search") ?? "",
    page: Math.max(1, parseInt(str("page") ?? "1") || 1),
    per_page: validPerPage.find((n) => n === parseInt(str("per_page") ?? "")) ?? undefined,
  };

  // SSR: URL 파라미터 기반으로 1페이지 미리 fetch
  let initialData = null;
  try {
    initialData = await fetchAnimals(initialFilters);
  } catch {
    // 서버 fetch 실패 시 클라이언트에서 재시도
  }

  return <AnimalPageClient initialData={initialData} initialFilters={initialFilters} />;
}
