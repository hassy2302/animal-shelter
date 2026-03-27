import { fetchAnimals } from "@/lib/api";
import AnimalPageClient from "./AnimalPageClient";

export default async function HomePage() {
  // SSR: 기본 필터로 1페이지 미리 fetch → 빠른 초기 로딩
  let initialData = null;
  try {
    initialData = await fetchAnimals({ state: "protect", page: 1 });
  } catch {
    // 서버 fetch 실패 시 클라이언트에서 재시도
  }

  return <AnimalPageClient initialData={initialData} />;
}
