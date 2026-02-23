# 수학 기출 학습 도우미

## 현재 상태

- **현재 Milestone:** v3.0 반전 모드 — 게이미피케이션 학습 혁명
- **현재 Phase:** 20 (전체 화면 반전 디자인)
- **진행 상황:** Phase 19 완료, Phase 20 대기
- **다음 명령어:** `/gsd:discuss-phase 20`
- **참고:** `/clear` 먼저 실행 후 위 명령어 실행 권장 (fresh context)

## v3.0 로드맵 요약

6개 phase (15-20):
- Phase 15: 반전 모드 기반 인프라 + 번들 전략 (FunModeContext, 코드 스플리팅, Phaser POC)
- Phase 16: 보상 시스템 (XP/레벨/스트릭/콤보/뱃지/리더보드/챌린지)
- Phase 17: 사운드 시스템 (Howler.js BGM + SFX, iOS 잠금 해제)
- Phase 18: Three.js 시각 효과 (3D 배경, 파티클, 레벨업 시네마틱)
- Phase 19: 게임화 퀴즈 엔진 (타임어택/서바이벌/보스배틀/미니게임)
- Phase 20: 전체 화면 반전 디자인 (모든 화면 게임 테마 적용)

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
- v2.0: Swiper, Framer Motion, Pretendard 폰트
- v3.0 (예정): Phaser, Three.js, Howler.js, Dexie v8
