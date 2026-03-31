# 🐾 햄스토 (hamsoto.kr)

전국 보호소의 유기동물 입양 공고를 한눈에 확인할 수 있는 웹 서비스입니다.

**서비스 주소:** https://hamsoto.kr

---

## 서비스 소개

국가동물보호정보시스템과 대전광역시 API를 통합하여 전국 유기동물 현황을 실시간으로 제공합니다. 햄스터를 좋아하는 개발자가 만든 서비스로, 햄스터·설치류를 포함한 모든 동물의 공고를 쉽게 찾을 수 있습니다.

### 주요 기능

- **종류별 필터** — 햄스터, 토끼, 고양이, 강아지, 거북이, 고슴도치, 조류, 기타 (설치류 우선 정렬)
- **지역별 필터** — 시도 / 시군구 선택
- **보호 상태별 필터** — 보호중 / 입양완료 / 기타 / 전체
- **최신순 / 과거순 정렬**
- **텍스트 검색** — 공고번호, 보호소명, 발견장소 등
- **찜 기능** — 관심 동물 저장 (로컬스토리지)
- **신규 배지** — 최근 3일 내 등록된 공고 표시
- **카카오톡 공유** — 공고 링크 공유
- **헤더 이미지 마퀴** — 전체 소동물(고양이·강아지 제외) 중 랜덤 선별된 사진이 흐르며 클릭 시 상세 공고 확인
- **반응형 UI** — 모바일 우선 설계

---

## 기술 스택

### Frontend
- **Next.js 15** (App Router, SSR)
- **TypeScript 5**
- **Tailwind CSS 3.4**
- **SWR 2** — 데이터 페칭 및 캐싱

### Backend
- **FastAPI** — 비동기 REST API
- **Redis (Upstash)** — 캐시 레이어 (in-memory 폴백 지원)
- **APScheduler** — 매시간 캐시 워밍
- **httpx** — 외부 API 비동기 호출 (동시 요청 수 제한으로 429 방지)

### 인프라
- **Frontend:** Vercel + 커스텀 도메인 (hamsoto.kr, Vercel DNS)
- **Backend:** Render (Docker)
- **Android 앱:** Capacitor + Google Play (내부 테스트 중)
- **모니터링:** Sentry (프론트엔드 + 백엔드 에러 트래킹)
- **분석:** Google Analytics 4

---

## 외부 API

| API | 용도 |
|-----|------|
| 국가동물보호정보시스템 | 전국 유기동물(강아지·고양이·소동물) 조회, 시도·시군구 목록 |
| 대전광역시 유기동물공고현황 | 대전 지역 유기동물 조회 (XML 파싱) |
| 카카오 SDK | 공고 링크 카카오톡 공유 |

두 API의 중복 데이터는 `noticeNo` 기준으로 자동 제거됩니다.

---

## 동물 정렬 기준

같은 필터 조건 내에서 아래 순서로 정렬됩니다:

1. 🐹 햄스터
2. 🐭 설치류 (래트, 레트, 팬시마우스, 팬더마우스, 기니피그, 데구 등)
3. 기타 소동물
4. 🐱 고양이
5. 🐶 강아지

각 그룹 내에서는 최신순 또는 과거순으로 정렬합니다.

---

## 시작하기

### 환경 변수 설정

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
NEXT_PUBLIC_KAKAO_JS_KEY=카카오_JS키
SENTRY_AUTH_TOKEN=Sentry_인증토큰
```

### Backend 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend 실행

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
│       ├── models/              # Pydantic 모델
│       ├── services/
│       │   ├── animal_service.py    # 필터링, 정렬, 종류 분류
│       │   ├── national_api.py      # 국가 API (세마포어로 요청 수 제한)
│       │   └── daejeon_api.py       # 대전 API (XML 파싱)
│       ├── api/                 # REST 엔드포인트 (animals, regions)
│       ├── cache/manager.py     # Redis + in-memory 캐시
│       └── scheduler/jobs.py    # 캐시 워밍 스케줄러
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx             # 홈 (SSR)
        │   └── AnimalPageClient.tsx # 클라이언트 필터/찜 로직
        ├── components/
        │   ├── layout/              # Header (마퀴), StatsBar, ScrollToTop
        │   ├── animals/             # AnimalGrid, AnimalCard, AnimalDetailModal, ShareSheet
        │   ├── filters/             # FilterBar, SpeciesPills
        │   └── pagination/
        ├── contexts/
        │   └── FavoritesContext.tsx # 찜 기능 전역 상태
        ├── hooks/
        │   ├── useAnimals.ts        # SWR 훅 (동물 목록)
        │   └── useRegions.ts        # SWR 훅 (지역 목록)
        └── lib/
            ├── api.ts               # API 클라이언트
            ├── constants.ts         # 종류·상태 옵션, BASE_URL
            └── utils.ts             # 날짜 포맷, 이모지 매핑
```

---

## 캐싱 전략

| 데이터 | TTL | 비고 |
|--------|-----|------|
| 동물 목록 | 1시간 | `animals:{sido}:{sigungu}` |
| 시도 목록 | 24시간 | `sido_list` |
| 시군구 목록 | 24시간 | `sigungu:{sido}` |

- Redis 우선, 연결 불가 시 in-memory 자동 폴백
- APScheduler가 매 정시마다 전국/서울/대전 캐시 선제 워밍
- 앱 시작 시 2초 후 초기 캐시 워밍 실행

---

## 배포

### Backend (Render)

Render에서 `backend/` 디렉토리 기준 Docker 배포.

환경 변수 (Render 대시보드 설정):
```
API_KEY=...
DAEJEON_KEY=...
REDIS_URL=...
CORS_ORIGINS=["https://hamsoto.kr","https://www.hamsoto.kr","https://animal-shelter-navy.vercel.app"]
ENV=production
```

헬스체크: `GET /health`

### Frontend (Vercel)

GitHub 연결 후 `frontend/` 디렉토리 기준 자동 배포.

환경 변수 (Vercel 대시보드):
```
API_BASE_URL=https://[render-서비스명].onrender.com
NEXT_PUBLIC_KAKAO_JS_KEY=...
```

커스텀 도메인 hamsoto.kr은 Vercel DNS를 통해 연결.

### Android 앱 (animal-shelter-native)

Capacitor 기반 Android 앱. 웹과 동일한 Next.js 코드를 static export 후 WebView로 래핑.

```bash
cd animal-shelter-native
npm run build
npx cap sync android
```

업데이트 배포 시 `android/app/build.gradle`에서 `versionCode`를 1 올리고 Android Studio에서 AAB 빌드 후 Play Console에 업로드.
