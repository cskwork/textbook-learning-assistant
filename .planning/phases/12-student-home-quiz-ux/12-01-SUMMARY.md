---
phase: 12-student-home-quiz-ux
plan: "01"
subsystem: student-home
tags: [swiper, home-dashboard, animation, redesign]
dependency_graph:
  requires: [phase-11-layout-animation, phase-10-design-system]
  provides: [student-home-swiper-banner, quick-action-buttons, recent-activity-list]
  affects: [apps/web/src/routes/student/index.tsx]
tech_stack:
  added: [swiper]
  patterns: [HomeBannerSwiper, QuickActionButtons, RecentActivityList, FadeIn+AnimatedCard]
key_files:
  created:
    - apps/web/src/components/home/HomeBannerSwiper.tsx
    - apps/web/src/components/home/QuickActionButtons.tsx
    - apps/web/src/components/home/RecentActivityList.tsx
  modified:
    - apps/web/src/routes/student/index.tsx
    - apps/web/src/index.css
    - apps/web/package.json
    - pnpm-lock.yaml
decisions:
  - "HomeBannerSwiper 슬라이드 3종: AI 추천(cta-gradient)/오답 복습(rose-orange)/학습 팁(emerald-teal)"
  - "QuickActionButtons 그리드 배치(grid-cols-3) — 스크롤 없이 한눈에 보이는 구조"
  - "RecentActivityList: useLiveQuery 2단계 조회 (quizAttempts → questions) Promise.all 패턴"
  - "StudentHomePage 구조: 인사→배너→통계카드→빠른시작→AI추천+최근활동 5단계 레이아웃"
  - "AnimatedCard로 Card 래퍼 교체 — hover scale/lift 마이크로 인터랙션 전면 적용"
metrics:
  duration: 242
  completed_date: "2026-02-21"
  tasks_completed: 2
  files_modified: 6
---

# Phase 12 Plan 01: 학생 홈 대시보드 기출탭탭 스타일 리디자인 요약

**한 줄 요약:** Swiper 배너(3종) + 통계 카드 + 빠른 시작 CTA + 최근 활동 목록으로 학생 홈 대시보드 전면 리디자인 (HOME-01~03 충족)

## 완료된 태스크

| Task | 이름 | 커밋 | 주요 파일 |
|------|------|------|-----------|
| 1 | Swiper 설치 + 홈 컴포넌트 3종 생성 | e8b1058 | HomeBannerSwiper.tsx, QuickActionButtons.tsx, RecentActivityList.tsx |
| 2 | StudentHomePage 기출탭탭 스타일 전면 리디자인 | 6a023da | routes/student/index.tsx, index.css |

## 생성된 컴포넌트

### HomeBannerSwiper (`apps/web/src/components/home/HomeBannerSwiper.tsx`)
- Swiper + Pagination + Autoplay 모듈 사용
- 슬라이드 1: AI 추천 (cta-gradient, `recommendedQuestions` 수 표시)
- 슬라이드 2: 오답 복습 (rose-orange gradient, `wrongNoteCount` 표시)
- 슬라이드 3: 학습 팁 (emerald-teal gradient, 동기부여 메시지)
- `pb-7` 패딩으로 pagination dot 공간 확보

### QuickActionButtons (`apps/web/src/components/home/QuickActionButtons.tsx`)
- `grid-cols-3` 배치 — 오답 복습(rose) / AI 추천(violet) / 문제집(blue)
- `AnimatedCard` 래퍼로 hover scale/lift 인터랙션
- 오답 복습: `wrongNoteCount > 0` 시 개수 표시

### RecentActivityList (`apps/web/src/components/home/RecentActivityList.tsx`)
- `useLiveQuery` 2단계: quizAttempts 5건 → Promise.all로 Question 조회
- 정오답 아이콘(CheckCircle2/XCircle) + 과목·단원 + 소요시간 + 날짜
- `FadeIn` stagger(0.05s) 입장 애니메이션
- 빈 상태: 안내 메시지 + "문제 풀러 가기" 링크

## 리디자인 레이아웃 구조

```
[인사 영역] — FadeIn delay=0
[HomeBannerSwiper] — FadeIn delay=0.05 (HOME-02)
[통계 카드 4종] — FadeIn delay=0.1 + AnimatedCard (HOME-01)
  └ 오늘 풀이 | 정답률 | 연속 학습 | 학습 시간
[빠른 시작 CTA] — FadeIn delay=0.15 (HOME-03)
  └ QuickActionButtons (오답 복습 | AI 추천 | 문제집)
[AI 추천 + 최근 활동] — FadeIn delay=0.2
  └ AI 추천(lg:col-span-3) | RecentActivityList(lg:col-span-2)
```

## 요구사항 충족

| 요구사항 | 내용 | 상태 |
|----------|------|------|
| HOME-01 | 학습 현황 카드 (풀이 수, 정답률, 스트릭, 학습 시간) | 충족 |
| HOME-02 | Swiper 배너 슬라이더 (좌우 스와이프) | 충족 |
| HOME-03 | 빠른 학습 시작 CTA (오답 복습, AI 추천, 문제집) | 충족 |

## CSS 추가

`apps/web/src/index.css`에 Swiper pagination 커스텀 스타일 추가:
```css
.swiper-pagination-bullet-active { background: oklch(var(--primary)) !important; }
.swiper-pagination-bullet { background: oklch(var(--muted-foreground)); opacity: 0.3; }
```

## 계획 대비 편차

없음 — 계획대로 정확히 실행됨.

단, Task 2 실행 중 미사용 Card import 제거 자동 수정:
- [Rule 1 - Bug] `Card, CardContent, CardHeader, CardTitle` 임포트가 AnimatedCard 교체 후 미사용 상태로 TypeScript 빌드 오류 발생
- 해당 import 제거하여 즉시 해결
- 커밋 전 `pnpm --filter web build` 재실행으로 확인

## Self-Check: PASSED

확인 항목:
- [x] apps/web/src/components/home/HomeBannerSwiper.tsx 존재
- [x] apps/web/src/components/home/QuickActionButtons.tsx 존재
- [x] apps/web/src/components/home/RecentActivityList.tsx 존재
- [x] apps/web/src/routes/student/index.tsx 수정됨
- [x] apps/web/src/index.css Swiper pagination CSS 추가됨
- [x] 커밋 e8b1058 존재 (Task 1)
- [x] 커밋 6a023da 존재 (Task 2)
- [x] pnpm --filter web build 성공 (0 TypeScript 에러)
