# 수학 기출 학습 도우미

## 현재 상태

- **완료된 Milestones:** v1.0 MVP, v2.0 디자인 리뉴얼, v3.0 반전 모드 게이미피케이션
- **현재 Milestone:** v4.0 PDF 2-Way 학습 시스템
- **현재 Phase:** 요구사항 정의 중 (리서치 진행)
- **다음 명령어:** `/gsd:new-milestone` (요구사항 → 로드맵 생성)
- **참고:** `/clear` 먼저 실행 후 위 명령어 실행 권장 (fresh context)

## v4.0 목표

PDF ↔ 앱 양방향 연동:
- PDF 업로드 & Gemini Vision AI 문제 자동 추출 (사용자 검수/수정)
- PDF 뷰어 + 풀이 오버레이 (iPad 시험지 느낌)
- 강사용 PDF → DB 자동 등록
- 앱 → PDF 내보내기 (시험지 스타일 + 학습지 스타일)

## 핵심 결정사항

- 하단 탭바 네비게이션 (모바일/태블릿), 데스크톱은 사이드바
- 태블릿 우선(tablet-first) 반응형 디자인
- 기출탭탭 스타일 — 파란색 계열, 교육 앱 느낌
- Tailwind v4 CSS-first 방식 유지 — 디자인 토큰은 @layer base CSS 변수
- POC 아키텍처(localStorage + Dexie) 유지

## 기술 스택

- Frontend: React 19 + Vite 7 + Tailwind v4 + shadcn/ui
- Backend: Express 5 + Drizzle ORM + PostgreSQL (POC: localStorage mock)
- Auth: JWT (jsonwebtoken) + bcrypt (POC: localStorage mock)
- v2.0: Swiper, Framer Motion, Pretendard 폰트
- v3.0: Phaser 3.90, Three.js 0.183, R3F 9.5, Howler.js 2.2, Dexie v9
