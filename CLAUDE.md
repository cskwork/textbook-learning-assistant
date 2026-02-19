# 수학 기출 학습 도우미

## 현재 상태

- **현재 Phase:** 1 (기반 인프라 + 인증)
- **진행 상황:** Phase 1 계획 완료, 실행 대기 중
- **다음 명령어:** `/gsd:execute-phase 1`
- **참고:** `/clear` 먼저 실행 후 위 명령어 실행 권장 (fresh context)

## Phase 1 계획 요약

5개 plan, 4개 wave:
- Wave 1: 01-01 (모노레포+DB+Express), 01-02 (React+Tailwind v4+앱 셸) — 병렬
- Wave 2: 01-03 (JWT 인증 API 6개 엔드포인트)
- Wave 3: 01-04 (인증 UI + AuthContext + 보호 라우트 + RBAC)
- Wave 4: 01-05 (통합 사용자 검증 체크포인트)

## 핵심 결정사항

- 하단 탭바 네비게이션 (모바일/태블릿), 데스크톱은 사이드바
- 태블릿 우선(tablet-first) 반응형 디자인
- 기출탭탭 스타일 — 파란색 계열, 교육 앱 느낌
- 가입: 이메일+비밀번호만, 역할 선택은 온보딩에서
- 비밀번호 8자 이상, 로그인 에러는 구체적 한국어 메시지
- JWT httpOnly cookie (access 15m, refresh 7d)
- pnpm 모노레포 (apps/web, apps/api)

## 기술 스택

- Frontend: React 19 + Vite 7 + Tailwind v4 + shadcn/ui
- Backend: Express 5 + Drizzle ORM + PostgreSQL
- Auth: JWT (jsonwebtoken) + bcrypt
