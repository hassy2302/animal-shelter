# 유기동물 입양 플랫폼

전국 보호소의 유기동물 정보를 한눈에 확인하고 입양할 수 있는 웹 서비스입니다.

**배포 주소:** https://animal-shelter-navy.vercel.app

---

## 서비스 소개

국가동물보호정보시스템과 대전광역시 API를 통합하여 전국 유기동물 현황을 실시간으로 제공합니다. 지역, 종류, 보호 상태별 필터로 원하는 동물을 손쉽게 찾을 수 있습니다.

### 주요 기능

- **종류별 필터** — 강아지, 고양이, 햄스터, 토끼, 거북이, 고슴도치, 조류, 기타
- **지역별 필터** — 시도 / 시군구 선택
- **보호 상태별 필터** — 보호중 / 입양완료 / 기타 / 전체
- **텍스트 검색** — 공고번호, 보호소명, 발견장소, 특이사항
- **반응형 UI** — 모바일 우선 설계, 그리드 레이아웃

---

## 기술 스택

### Frontend
- **Next.js 15** (App Router, SSR)
- **TypeScript 5.6**
- **Tailwind CSS 3.4**
- **SWR 2.2** — 데이터 페칭 및 캐싱 (1시간 자동 갱신)

### Backend
- **FastAPI 0.115** — 비동기 REST API
- **Redis** — 캐시 레이어 (in-memory 폴백 지원)
- **APScheduler** — 매시간 캐시 워밍 스케줄러
- **httpx** — 외부 API 비동기 호출

### 인프라
- **Frontend:** Vercel
- **Backend:** Render (Docker 배포)

---

## 외부 API

| API | 용도 |
|-----|------|
| 국가동물보호정보시스템 | 전국 유기동물(강아지·고양이·소동물) 조회, 시도·시군구 목록 |
| 대전광역시 유기동물공고현황 | 대전 지역 유기동물 조회 (XML 파싱) |

두 API의 중복 데이터는 `noticeNo` 기준으로 자동 제거됩니다.

---

## 시작하기

### 1. 환경 변수 설정

**Backend** (`backend/.env`)
```env
API_KEY=국가동물보호정보시스템_서비스키
DAEJEON_KEY=대전광역시_서비스키
REDIS_URL=redis://localhost:6379       # 선택 사항
CORS_ORIGINS=["http://localhost:3000"]
ENV=development
```

**Frontend** (`frontend/.env.local`)
```env
API_BASE_URL=http://localhost:8000
```

### 2. Backend 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 프로젝트 구조

```
animal-shelter/
├── backend/
│   └── app/
│       ├── main.py              # FastAPI 앱 진입점
│       ├── config.py            # 환경변수 설정
│       ├── models/              # Pydantic 모델 (Animal, Region)
│       ├── services/
│       │   ├── animal_service.py    # 필터링, 정렬, 캐싱 로직
│       │   ├── national_api.py      # 국가 API 클라이언트
│       │   └── daejeon_api.py       # 대전 API 클라이언트 (XML)
│       ├── api/                 # REST 엔드포인트 (animals, regions)
│       ├── cache/manager.py     # Redis + in-memory 캐시
│       └── scheduler/jobs.py    # 캐시 워밍 스케줄러
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx             # 홈 (SSR)
        │   └── AnimalPageClient.tsx # 클라이언트 필터 로직
        ├── components/
        │   ├── layout/              # Header, StatsBar
        │   ├── animals/             # AnimalGrid, AnimalCard
        │   ├── filters/             # FilterBar, SpeciesPills
        │   └── pagination/
        ├── hooks/
        │   ├── useAnimals.ts        # SWR 훅 (동물 목록)
        │   └── useRegions.ts        # SWR 훅 (지역 목록)
        └── lib/
            ├── api.ts               # API 클라이언트
            ├── constants.ts         # 종류·상태 옵션
            └── utils.ts             # 날짜 포맷, 이모지 매핑
```

---

## 캐싱 전략

| 데이터 | TTL | 캐시 키 |
|--------|-----|---------|
| 동물 목록 | 2시간 | `animals:{sido}:{sigungu}` |
| 시도 목록 | 24시간 | `sido_list` |
| 시군구 목록 | 24시간 | `sigungu:{sido}` |

- Redis를 우선 사용하며, 연결 불가 시 in-memory 캐시로 자동 폴백
- APScheduler가 매 정시마다 주요 지역(전국, 서울, 대전) 캐시를 선제적으로 워밍

---

## 배포

### Backend (Render)

```bash
# backend/ 디렉토리 기준
docker build -t animal-shelter-api .
docker run -p 8000:8000 \
  -e API_KEY=... \
  -e DAEJEON_KEY=... \
  -e REDIS_URL=... \
  animal-shelter-api
```

Render에서 Docker 환경으로 배포하며, 환경 변수는 Render 대시보드에서 설정합니다.
헬스 체크 엔드포인트: `GET /health`

### Frontend (Vercel)

GitHub 레포지토리를 Vercel에 연결하면 `frontend/` 디렉토리 기준으로 자동 배포됩니다.
환경 변수 `API_BASE_URL`에 Railway 백엔드 URL을 입력하세요.
