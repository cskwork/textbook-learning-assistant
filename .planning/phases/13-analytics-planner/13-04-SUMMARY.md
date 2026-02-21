---
phase: 13-analytics-planner
plan: "04"
subsystem: planner-ui
tags: [react, dexie, planner, calendar, notification, useLiveQuery]
dependency_graph:
  requires: [13-03-data-layer]
  provides: [planner-page, planner-calendar, task-checklist, weekly-settings, notification-toggle]
  affects: [_layout-tabbar, main-routes]
tech_stack:
  added: []
  patterns: [useLiveQuery-trigger-pattern, useEffect-async-load, cleanup-ref-pattern, upsert-on-addTask]
key_files:
  created:
    - apps/web/src/routes/student/planner/index.tsx
    - apps/web/src/components/planner/PlannerCalendar.tsx
    - apps/web/src/components/planner/TaskChecklist.tsx
    - apps/web/src/components/planner/WeeklySettingsCard.tsx
    - apps/web/src/components/planner/NotificationToggle.tsx
  modified:
    - apps/web/src/main.tsx
    - apps/web/src/routes/_layout.tsx
decisions:
  - "탭바 오답노트 → 플래너 교체: 오답노트는 홈 QuickActionButtons에서 접근 가능(Phase 12 구현됨), 탭 5개 유지"
  - "taskChangeCounter 패턴: useLiveQuery(studyTasks.count)로 태스크 변경 감지 → useEffect 재실행 트리거로 플랜+태스크 리로드"
  - "PlannerCalendar 7x6 고정 그리드(42칸): 이전/다음 달 날짜 포함, 빠른 렌더링 우선(애니메이션 없음)"
  - "WeeklySettingsCard 합계 100% 검증: 저장 버튼 disabled(totalAlloc !== 100), 마지막 과목(기하) 자동 계산"
  - "NotificationToggle cleanupRef 패턴: useRef<() => void | null>로 setInterval cleanup 관리, useEffect 의존성 변경 시 재스케줄"
metrics:
  duration: 263
  completed_date: "2026-02-21"
  tasks_completed: 2
  files_changed: 7
---

# Phase 13 Plan 04: 학습 플래너 UI Summary

**One-liner:** PlannerCalendar(7x6 그리드) + TaskChecklist(체크박스+진행률) + WeeklySettingsCard(주간목표+과목배분) + NotificationToggle(Switch+scheduleNotificationCheck) + PlannerPage 조합 + /student/planner 라우트 + 탭바 플래너 탭 등록

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | PlannerCalendar + TaskChecklist + WeeklySettingsCard + NotificationToggle 컴포넌트 | a97d188 | apps/web/src/components/planner/ 4종 |
| 2 | PlannerPage 조합 + 라우트 등록 + 탭바 연결 | b52016b | apps/web/src/routes/student/planner/index.tsx, main.tsx, _layout.tsx |

## What Was Built

### Task 1: 4종 플래너 컴포넌트

**PlannerCalendar.tsx (176줄):**
- Props: `selectedDate`, `onDateChange`, `markedDates?: Set<string>`
- 7x6 고정 42칸 그리드 (이전/다음 달 날짜 포함)
- 월 헤더: "2026년 2월" + 이전/다음 ChevronButton
- 요일 헤더: 일월화수목금토
- 날짜 셀: 선택(bg-primary) / 오늘(border-2 border-primary) / 현재월 외(opacity 30%)
- markedDates 도트: w-1 h-1 rounded-full bg-primary (선택 날짜 제외)
- min-w-[36px] min-h-[36px] 터치 타겟 확보

**TaskChecklist.tsx (172줄):**
- Props: `tasks`, `onToggle`, `onAddTask`
- 커스텀 체크박스: border-2 토글, 완료 시 SVG 체크마크
- 완료 태스크: line-through + text-muted-foreground
- 과목 Badge + 진행률 바(completedCount/targetCount)
- 하단 추가 인풋: Enter 키 + 추가 버튼, 빈 제출 방지
- 빈 상태: CalendarPlus 아이콘 + "오늘의 학습 계획을 추가해보세요!"

**WeeklySettingsCard.tsx (175줄):**
- Props: `userId`
- useLiveQuery → DB 설정 로드, useEffect로 로컬 state 동기화
- 주간 목표: Input type=number (10~200, step=10)
- 과목별 배분: 5과목(수학I~기하) Input type=number (0~100%)
  - 마지막 과목(기하) 자동 계산 (나머지 4과목 보수)
  - 합계 표시: 100%이면 primary, 아니면 destructive
- 저장 버튼: totalAlloc !== 100이면 disabled, saveWeeklyScheduleSettings 호출

**NotificationToggle.tsx (184줄):**
- Props: `userId`
- useLiveQuery → notificationEnabled, notificationTime
- Switch 컴포넌트 (shadcn/ui) 토글
- 토글 ON: requestNotificationPermission() → granted면 scheduleNotificationCheck
- useRef cleanup 패턴: cleanupRef.current()로 이전 setInterval 정리
- Input type="time" 알림 시간
- 브라우저 미지원('unsupported') / 권한 거부('denied') 안내 메시지

### Task 2: PlannerPage + 라우트 + 탭바

**planner/index.tsx (255줄):**
- useAuth 가드: user 없으면 null 반환
- selectedDate state (기본: 오늘 toLocalKey(new Date()))
- markedDates: useLiveQuery로 이번 달 studyPlans 날짜 Set 추출
- taskChangeCounter: useLiveQuery(studyTasks.count) → useEffect 재실행 트리거
- handleToggle: toggleTask(taskId) → 자동 리로드
- handleAddTask: 플랜 없으면 db.studyPlans.add + db.studyTasks.add 인라인 생성
- handleStartTodayPlan: createDailyPlan(user.email, 10, []) — 빈 daily 플랜
- 레이아웃: 헤더(delay=0) → DailyGoalProgress(0.05) → 캘린더+체크(0.1) → 주간+알림(0.15)
- lg: 캘린더 w-1/3 / 체크리스트 flex-1, 설정 2컬럼

**main.tsx:**
- `import PlannerPage from './routes/student/planner/index'`
- `<Route path="/student/planner" element={<PlannerPage />} />`

**_layout.tsx:**
- CalendarDays import 추가
- 학생 탭 변경: 홈, 문제풀기, 문제집, 분석, **플래너**
- 오답노트 탭 제거 (홈 → QuickActionButtons → 오답 복습 접근 가능)

## Verification

- `pnpm --filter web build` TypeScript 0 에러, Vite 프로덕션 빌드 성공
- apps/web/src/routes/student/planner/index.tsx 존재 (255줄 — 120줄 이상 기준 충족)
- apps/web/src/components/planner/ 디렉토리에 4개 컴포넌트 존재 (각 172~184줄)
- main.tsx: /student/planner 라우트 등록 확인
- _layout.tsx: 학생 탭바 '플래너' 탭 + CalendarDays 아이콘 확인
- PlannerPage에서 4종 컴포넌트 모두 import 확인

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 미사용 import 제거 (TypeScript strict 오류)**
- **Found during:** Task 2 빌드 검증
- **Issue:** getTodayPlan, CardContent import 선언 후 사용하지 않아 TS6133 에러 발생
- **Fix:** getTodayPlan → createDailyPlan으로 대체(인라인 플랜 생성 로직 사용), CardContent 제거
- **Files modified:** apps/web/src/routes/student/planner/index.tsx

## Self-Check: PASSED

- FOUND: apps/web/src/routes/student/planner/index.tsx
- FOUND: apps/web/src/components/planner/PlannerCalendar.tsx
- FOUND: apps/web/src/components/planner/TaskChecklist.tsx
- FOUND: apps/web/src/components/planner/WeeklySettingsCard.tsx
- FOUND: apps/web/src/components/planner/NotificationToggle.tsx
- FOUND: commit a97d188 (Task 1)
- FOUND: commit b52016b (Task 2)
