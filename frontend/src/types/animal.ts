export interface Animal {
  desertionNo: string;
  noticeNo: string;
  processState: string;
  kindNm: string;
  upkind: string;
  sexCd: "M" | "F" | "Q";
  age: string;
  colorCd: string;
  weight: string;
  specialMark: string;
  happenPlace: string;
  happenDt: string;
  noticeEdt: string;
  popfile1: string;
  popfile2: string;
  careNm: string;
  careTel: string;
  orgNm: string;
  source: "national" | "daejeon";
  animalSeq: string;
}

export interface AnimalListResponse {
  items: Animal[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  fetched_at: string;
}

export interface AnimalFilters {
  sido_code?: string;
  sigungu_code?: string;
  state?: "all" | "protect" | "complete" | "etc";
  species?: string;
  search?: string;
  page?: number;
  per_page?: number;
  sort?: "latest" | "oldest";
}
