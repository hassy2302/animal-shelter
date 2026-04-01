from pydantic import BaseModel
from datetime import datetime


class Animal(BaseModel):
    desertionNo: str = ""
    noticeNo: str = ""
    processState: str = ""
    kindNm: str = ""
    upkind: str = ""          # 417000(강아지) / 422400(고양이) / 429900(소동물)
    sexCd: str = "Q"          # M / F / Q
    age: str = ""
    colorCd: str = ""
    weight: str = ""
    specialMark: str = ""
    happenPlace: str = ""
    happenDt: str = ""        # YYYYMMDD
    noticeEdt: str = ""       # YYYYMMDD
    popfile1: str = ""
    popfile2: str = ""
    careNm: str = ""
    careTel: str = ""
    orgNm: str = ""
    source: str = "national"
    aiKindNm: str = ""        # Gemini Vision 분류 결과


class AnimalListResponse(BaseModel):
    items: list[Animal]
    total: int
    page: int
    per_page: int
    total_pages: int
    fetched_at: datetime
