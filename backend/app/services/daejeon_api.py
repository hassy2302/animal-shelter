import asyncio
import logging
import httpx
import xml.etree.ElementTree as ET
from app.config import settings

logger = logging.getLogger(__name__)

DAEJEON_BASE = "http://apis.data.go.kr/6300000/animalDaejeonService"
DAEJEON_GU = {"1": "동구", "2": "중구", "3": "서구", "4": "유성구", "5": "대덕구"}
DAEJEON_STATUS = {
    "1": "보호중(공고중)", "2": "보호중(입양가능)", "3": "보호중(입양예정)",
    "4": "입양완료", "5": "자연사", "6": "안락사", "7": "주인반환",
    "8": "보호중(임시보호)", "9": "입양불가", "10": "방사",
    "11": "주민참여", "12": "보호중(입원중)",
}


def _t(el: ET.Element, tag: str) -> str:
    return el.findtext(tag, "") or ""


async def fetch_all() -> list[dict]:
    all_items = []
    page = 1

    async with httpx.AsyncClient() as client:
        while True:
            root = None
            for attempt in range(3):
                try:
                    r = await client.get(
                        f"{DAEJEON_BASE}/animalDaejeonList",
                        params={
                            "serviceKey": settings.DAEJEON_KEY,
                            "searchCondition": "3",
                            "numOfRows": 100,
                            "pageNo": page,
                        },
                        timeout=15,
                    )
                    root = ET.fromstring(r.text)
                    break
                except Exception as e:
                    if attempt == 2:
                        logger.warning(f"대전시 API 오류 page={page}: {e}")
                    else:
                        await asyncio.sleep(2 ** attempt)

            if root is None or root.findtext(".//returnCode") != "00":
                logger.warning(f"대전 API returnCode={root.findtext('.//returnCode') if root is not None else 'None'}, 응답: {r.text[:300] if root is not None else ''}")
                break

            total_page = int(root.findtext(".//totalPage", "1") or 1)

            for item in root.findall(".//items"):
                gu_cd = _t(item, "gu")
                file_path = _t(item, "filePath")
                animal_seq = _t(item, "animalSeq")
                rescue_date = _t(item, "rescueDate").replace("-", "")

                all_items.append({
                    "desertionNo": "",
                    "noticeNo": _t(item, "regId"),
                    "processState": DAEJEON_STATUS.get(_t(item, "adoptionStatusCd"), ""),
                    "kindNm": _t(item, "species"),
                    "upkind": "429900",
                    "sexCd": {"1": "F", "2": "M"}.get(_t(item, "gender"), "Q"),
                    "age": _t(item, "age"),
                    "colorCd": _t(item, "hairColor"),
                    "weight": _t(item, "weight"),
                    "specialMark": _t(item, "memo"),
                    "happenPlace": _t(item, "foundPlace"),
                    "happenDt": rescue_date,
                    "noticeEdt": "",
                    "popfile1": f"http://www.daejeon.go.kr/{file_path}" if file_path else "",
                    "popfile2": "",
                    "careNm": f"대전 {DAEJEON_GU.get(gu_cd, '')} 동물보호센터",
                    "careTel": "042-270-7239",
                    "orgNm": "대전광역시",
                    "source": "daejeon",
                    "animalSeq": animal_seq,
                })

            if page >= total_page:
                break
            page += 1

    return all_items
