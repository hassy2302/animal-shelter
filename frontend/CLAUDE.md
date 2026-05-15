# 햄소토 웹 프론트엔드 — Claude 작업 가이드

## 프로젝트 개요

`햄소토 (유기동물입양 - 햄소토)` 서비스의 Next.js 웹 프론트엔드.
Android 앱(`animal-shelter-native`)의 WebView 소스이기도 함.

- **도메인:** https://hamsoto.kr
- **Vercel 배포:** https://animal-shelter-navy.vercel.app
- **개발자:** hamsoto
- **개인정보처리방침:** https://hamsoto.kr/privacy

## 아키텍처

브라우저 → Next.js API Routes (Vercel) → 백엔드 (Render)

- 백엔드 URL(`animal-shelter-x6nk.onrender.com`)은 브라우저에 노출되지 않음
- `src/app/api/` 하위 Route Handler가 백엔드를 프록시
- 초기 렌더링은 SSR(`page.tsx`), 이후 필터/페이지 변경은 클라이언트에서 `/api/*` 호출

## 연관 레포

- Android 앱: `animal-shelter-native` (Capacitor WebView 래핑)
- 백엔드: `animal-shelter/backend` (Render 호스팅)
- 백엔드 API: https://animal-shelter-x6nk.onrender.com (서버 사이드 전용, `.env`의 `API_BASE_URL`)

## 환경 변수

`.env.local` (클라이언트 노출용):
```
NEXT_PUBLIC_KAKAO_JS_KEY=...
```

`.env.local` (서버 사이드 전용):
```
API_BASE_URL=https://animal-shelter-x6nk.onrender.com
```

## 주요 페이지

- `src/app/page.tsx` — 메인 (동물 목록)
- `src/app/animal/[noticeNo]/page.tsx` — 동물 상세
- `src/app/privacy/page.tsx` — 개인정보처리방침 (Google Play 심사용)
- `src/app/admin/page.tsx` — 관리자 페이지

## 주요 컴포넌트

- `src/app/AnimalPageClient.tsx` — 메인 페이지 레이아웃 (필터, 목록 통합)
- `src/components/filters/SpeciesPills.tsx` — 종류 필터 (이모지 그리드)
- `src/components/filters/FilterBar.tsx` — 지역/상태 필터 카드
- `src/components/animals/AnimalCard.tsx` — 동물 카드
- `src/components/animals/AnimalDetailModal.tsx` — 동물 상세 모달
- `src/components/layout/Header.tsx` — 헤더

## 빌드 / 배포

```bash
npm run build   # 빌드
# Vercel에 push하면 자동 배포
```

## Google Play 심사 관련

개인정보처리방침(`src/app/privacy/page.tsx`)에 앱 이름(햄소토)과 개발자(hamsoto) 명시 필수.
Play Console에 등록된 URL: https://hamsoto.kr/privacy

## SEO

- `src/app/page.tsx` — canonical 태그 `https://hamsoto.kr` 고정 (필터 파라미터 URL 중복 색인 방지)
- `public/robots.txt` — 필터 파라미터 URL 크롤링 차단, sitemap 위치 안내
- Google Search Console "사용자가 선택한 표준이 없는 중복 페이지" 문제 수정 완료 (2026-05-15)
