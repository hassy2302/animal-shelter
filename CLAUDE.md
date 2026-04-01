# 햄스토 (hamsoto.kr) — Claude 작업 가이드

## 프로젝트 개요

전국 보호소 유기 동물 입양 공고 조회 서비스. 농림축산식품부 국가동물보호정보시스템 API를 사용.

- **웹:** https://hamsoto.kr (Vercel)
- **백엔드:** Render (Docker, FastAPI)
- **Android 앱:** Google Play 비공개 테스트 중 (`animal-shelter-native/`, Capacitor)

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

Redis 없으면 in-memory 자동 폴백. APScheduler가 매 정시 캐시 워밍.
