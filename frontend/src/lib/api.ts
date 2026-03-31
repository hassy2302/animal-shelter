import type { Animal, AnimalFilters, AnimalListResponse } from "@/types/animal";
import type { Sido, Sigungu } from "@/types/region";
import { buildApiUrl } from "./utils";

export async function fetchAnimals(filters: AnimalFilters): Promise<AnimalListResponse> {
  const url = buildApiUrl("/api/animals", filters as Record<string, unknown>);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch(url, { next: { revalidate: 0 }, signal: controller.signal });
    if (!res.ok) throw new Error(`동물 데이터 로드 실패: ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
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

export async function fetchAnimal(noticeNo: string): Promise<Animal> {
  const res = await fetch(`/api/animals/${encodeURIComponent(noticeNo)}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`동물 데이터 로드 실패: ${res.status}`);
  return res.json();
}

export async function fetchAnimalsBatch(noticeNos: string[]): Promise<Animal[]> {
  const res = await fetch("/api/animals/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notice_nos: noticeNos }),
  });
  if (!res.ok) throw new Error("찜 목록 로드 실패");
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
