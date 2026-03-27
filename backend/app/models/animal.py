from pydantic import BaseModel
from typing import Literal
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
    source: Literal["national", "daejeon"] = "national"
    animalSeq: str = ""       # 대전시 전용


class AnimalListResponse(BaseModel):
    items: list[Animal]
    total: int
    page: int
    per_page: int
    total_pages: int
    fetched_at: datetime
