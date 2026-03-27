import type { AnimalFilters, AnimalListResponse } from "@/types/animal";
import type { Sido, Sigungu } from "@/types/region";
import { buildApiUrl } from "./utils";

export async function fetchAnimals(filters: AnimalFilters): Promise<AnimalListResponse> {
  const url = buildApiUrl("/api/animals", filters as Record<string, unknown>);
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`동물 데이터 로드 실패: ${res.status}`);
  return res.json();
}

export async function refreshAnimals(
  sido_code: string,
  sigungu_code: string,
): Promise<AnimalListResponse> {
  const url = buildApiUrl("/api/animals/refresh", { sido_code, sigungu_code });
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error(`갱신 실패: ${res.status}`);
  return res.json();
}

export async function fetchSido(): Promise<Sido[]> {
  const res = await fetch("/api/regions/sido", { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("시도 로드 실패");
  return res.json();
}

export async function fetchSigungu(sido_code: string): Promise<Sigungu[]> {
  const res = await fetch(`/api/regions/sigungu?sido_code=${sido_code}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("시군구 로드 실패");
  return res.json();
}
