# 햄스토 (hamsoto.kr) — Claude 작업 가이드

## 프로젝트 개요

전국 보호소 유기 동물 입양 공고 조회 서비스. 농림축산식품부 국가동물보호정보시스템 API를 사용.

- **웹:** https://hamsoto.kr (Vercel)
- **백엔드:** Render (Docker, FastAPI)
- **Android 앱:** Google Play 프로덕션 액세스 신청 중 (`animal-shelter-native/`, Capacitor)

## 레포지토리 구조

```
animal-shelter/          ← 이 레포
├── backend/             ← FastAPI 백엔드
├── frontend/            ← Next.js 웹
└── CLAUDE.md

animal-shelter-native/   ← 별도 디렉토리 (Android 앱)
```

## 주요 규칙

### 커밋 & 배포
- 커밋과 git push는 사용자가 직접 함 — 명령어만 알려줄 것
- Vercel 배포는 main 브랜치 push 시 자동
- Android 앱 업데이트 시 `android/app/build.gradle`의 `versionCode`를 1 증가 후 Android Studio에서 AAB 빌드
- 현재 versionCode: 8, versionName: 1.3

### 코드 작업 범위
- 웹(`frontend/`)과 앱(`animal-shelter-native/`)은 별개 코드베이스
- 백엔드는 웹·앱 공통으로 사용
- 앱은 웹과 동일한 Next.js 코드를 static export 후 WebView로 래핑

### 동물 정렬 기준 (`backend/app/services/animal_service.py`)

1. 🐹 햄스터
2. 설치류 (래트, 기니피그, 데구, 친칠라 등 — `RODENT_KEYWORDS`)
3. 기타 소동물
4. 🐱 고양이
5. 🐶 강아지

### 종류 필터 (`SPECIES_KEYWORDS`)
- 햄스터, 토끼, 거북이, 고슴도치, 새 — 키워드 기반 매칭
- 기타 = 위 키워드에 해당하지 않는 소동물

## 환경 변수

### Backend (`backend/.env`)
```
API_KEY=국가동물보호정보시스템_서비스키
GEMINI_API_KEY=           # AI 분류 기능용 (현재 홀딩)
REDIS_URL=redis://...     # 없으면 in-memory 폴백
CORS_ORIGINS=[...]
FCM_SERVICE_ACCOUNT_JSON= # Firebase 서비스 계정 JSON을 base64 인코딩한 값 (알림 기능)
```

### Frontend (`frontend/.env.local`)
```
API_BASE_URL=https://...onrender.com
NEXT_PUBLIC_KAKAO_JS_KEY=...
SENTRY_AUTH_TOKEN=...
```

## 로컬 실행

```bash
# Backend
cd backend && uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm run dev

# Android 앱
cd animal-shelter-native && npm run build && npx cap sync android && npx cap open android
```

## 주요 브랜치

- `main` — 운영 브랜치
- `feat/ai-image-classification` — AI 이미지 분류 기능 (홀딩 중, 미병합)

## 캐시 TTL

| 데이터 | TTL |
|--------|-----|
| 동물 목록 | 1시간 |
| 시도/시군구 | 24시간 |

Redis 없으면 in-memory 자동 폴백. APScheduler가 매 정시 캐시 워밍 + 신규 공고 알림 발송.

### 캐시 안전장치 (`backend/app/services/animal_service.py`, `backend/app/cache/manager.py`)

- **inflight dedup (`_fetch_deduped` / `_inflight`)**: 동일 캐시 키에 대해 fetch가 이미 진행 중이면 새 요청은 기다렸다가 결과를 공유 — 국가 API 중복 호출(thundering herd) 방지. `force_refresh=True` 경로(스타트업 워밍, 스케줄러)도 동일하게 처리되어 워밍 중 유저 요청이 결과를 피기백 가능.
- **`_should_cache(items)`**: 결과가 10건 이하이면 캐시에 저장하지 않음 — 429 오류 등으로 빈 결과가 캐시에 기록되어 "동물 없음"이 표시되는 캐시 오염 방지.
- **스케줄러 전국 단일 워밍**: `scheduler/jobs.py`는 전국(sido_code="") 단일 워밍만 수행. 시도별 18개 병렬 워밍은 Render 무료 플랜(512MB) OOM 유발로 제거됨.
- **시도별 요청 캐시 미저장**: `sido_code` 있는 요청은 캐시에 저장하지 않고 직접 조회 — 메모리 절약.
- **Redis+in-memory 이중 쓰기**: `CacheManager.set`은 Redis와 in-memory 모두에 저장. `CacheManager.get`은 Redis에 키가 없으면 in-memory로 폴백 — Redis setex 실패 시에도 캐시 동작 보장.

> ⚠️ **과거 버그 기록 (수정 완료):**
> 1. `CacheManager.set`이 Redis 저장 후 `return`으로 in-memory를 건너뜀 → Redis 장애 시 항상 캐시 MISS
> 2. `CacheManager.get`이 Redis 연결 상태에서 키 없을 때 in-memory를 확인하지 않고 `None` 반환 → Redis에 키 없으면 in-memory 무시
> 3. 스케줄러가 18개 시도 병렬 워밍 → OOM → 서버 반복 재시작 → 캐시 무효화 악순환

## 알림 기능 (`backend/app/services/notification_service.py`)

- Android 앱 전용 (웹에서는 벨 아이콘 미표시)
- 헤더 우측 🔔 버튼 → 알림 설정 모달 (카테고리별 토글)
- 카테고리: 햄스터, 설치류, 토끼, 고양이, 강아지, 거북이, 고슴도치, 새, 기타 (모두 선택 가능)
- FCM 토큰 + 구독 카테고리를 Redis(또는 in-memory)에 저장
- 매 정시 캐시 워밍 후 `happenDt > last_checked_at` 인 신규 공고 감지 → 구독자에게 FCM 발송
- `last_checked_at` 미존재 시 현재 시각으로 초기화 (서버 재시작 후 오탐 방지)
- 만료된 FCM 토큰은 발송 실패 시 자동 제거
- 현재 FCM 우선순위 `normal` → 추후 `high`로 변경 예정 (Android Doze 모드 대응)

## 헤더 마퀴 (`frontend/src/components/layout/Header.tsx`)

- 전체 소동물(고양이·강아지 제외) 중 랜덤 선별된 사진이 가로로 흐름
- 속도: `tailwind.config.ts`의 `animation.marquee` duration 값으로 조정 (현재 `45s`)
- 클릭 시 해당 동물 상세 공고 확인

## 앱 이름

| 위치 | 이름 |
|------|------|
| 홈화면 (설치 후) | `햄소토` |
| Google Play 스토어 | `유기동물입양 - 햄소토` |

## 수익 모델 (예정)

- 후원 모델: 토스 / 카카오페이 링크 연동 예정
- 광고 없이 운영
