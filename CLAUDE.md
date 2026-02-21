# 수학 기출 학습 도우미

## 현재 상태

- **현재 Milestone:** v2.0 기출탭탭 스타일 디자인 리뉴얼
- **현재 Phase:** 10 (디자인 시스템)
- **진행 상황:** Phase 10 계획 대기 중
- **다음 명령어:** `/gsd:plan-phase 10`
- **참고:** `/clear` 먼저 실행 후 위 명령어 실행 권장 (fresh context)

## v2.0 로드맵 요약

5개 phase (10-14):
- Phase 10: 디자인 시스템 (색상·타이포·컴포넌트·다크모드)
- Phase 11: 공통 레이아웃 + 애니메이션 (네비게이션·Framer Motion·온보딩)
- Phase 12: 학생 홈 + 문제 풀이 UX (Swiper·퀴즈·채점 애니메이션)
- Phase 13: 분석 대시보드 + 학습 플래너 (차트·타임라인·리마인더)
- Phase 14: 강사 포털 리뉴얼 (홈·문제관리·분석·그룹)

## 핵심 결정사항

- 하단 탭바 네비게이션 (모바일/태블릿), 데스크톱은 사이드바
- 태블릿 우선(tablet-first) 반응형 디자인
- 기출탭탭 스타일 — 파란색 계열, 교육 앱 느낌
- Tailwind v4 CSS-first 방식 유지 — 디자인 토큰은 @layer base CSS 변수
- Swiper + Framer Motion 신규 도입
- POC 아키텍처(localStorage + mock) 유지

## 기술 스택

- Frontend: React 19 + Vite 7 + Tailwind v4 + shadcn/ui
- Backend: Express 5 + Drizzle ORM + PostgreSQL (POC: localStorage mock)
- Auth: JWT (jsonwebtoken) + bcrypt (POC: localStorage mock)
- New in v2.0: Swiper, Framer Motion, Pretendard 폰트
