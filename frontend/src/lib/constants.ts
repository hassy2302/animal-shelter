export const BASE_URL = "https://animal-shelter-navy.vercel.app";

export const UPKIND_DOG = "417000";
export const UPKIND_CAT = "422400";
export const UPKIND_ETC = "429900";

export const SPECIES_OPTIONS = [
  "전체", "🐹 햄스터", "🐰 토끼", "🐱 고양이",
  "🐶 강아지", "🐢 거북이", "🦔 고슴도치", "🐦 새", "기타",
];

export const STATE_OPTIONS = [
  { label: "보호중", value: "protect" },
  { label: "전체",   value: "all" },
  { label: "입양완료", value: "complete" },
  { label: "기타",   value: "etc" },
];

export const DEFAULT_FILTERS = {
  sido_code: "",
  sigungu_code: "",
  state: "protect" as const,
  species: "전체",
  page: 1,
  sort: "latest" as const,
};
