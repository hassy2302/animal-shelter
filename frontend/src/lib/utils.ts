import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { UPKIND_CAT, UPKIND_DOG } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAnimalEmoji(kindNm: string, upkind: string): string {
  if (upkind === UPKIND_DOG) return "🐶";
  if (upkind === UPKIND_CAT) return "🐱";
  if (kindNm.includes("햄스터")) return "🐹";
  if (kindNm.includes("토끼")) return "🐰";
  if (kindNm.includes("거북")) return "🐢";
  if (kindNm.includes("고슴도치")) return "🦔";
  if (["앵무", "잉꼬", "사랑새", "금조"].some((k) => kindNm.includes(k))) return "🦜";
  if (kindNm.includes("페렛")) return "🦡";
  if (kindNm.includes("뱀")) return "🐍";
  if (kindNm.includes("도마뱀") || kindNm.includes("이구아나")) return "🦎";
  if (kindNm.includes("기니")) return "🐭";
  if (kindNm.includes("다람쥐")) return "🐿️";
  return "🐾";
}

export function formatDate(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6)}`;
}

export function isNewAnimal(happenDt: string): boolean {
  if (happenDt.length !== 8) return false;
  const date = new Date(
    parseInt(happenDt.slice(0, 4)),
    parseInt(happenDt.slice(4, 6)) - 1,
    parseInt(happenDt.slice(6, 8))
  );
  const diffDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

export function formatAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return "방금";
  if (diff < 60) return `${diff}분 전`;
  return `${Math.floor(diff / 60)}시간 전`;
}

export function buildApiUrl(path: string, params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      sp.set(k, String(v));
    }
  }
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}
