---
phase: 14-instructor-portal
plan: "03"
subsystem: instructor-groups-ui
tags: [ui, animation, recharts, instructor, groups, analytics]
dependency_graph:
  requires:
    - 14-01 (강사 홈 기출탭탭 스타일)
    - 14-02 (문제 관리 기출탭탭 스타일)
  provides:
    - 기출탭탭 스타일 그룹 목록 (AnimatedCard + FadeIn)
    - 과제 진행률 + 미완료 학생 알림 (INST-04)
    - 반 전체 비교 차트 (INST-03)
    - 학생 상세 분석 기출탭탭 스타일 (INST-03)
  affects:
    - apps/web/src/routes/instructor/groups/
tech_stack:
  added: []
  patterns:
    - AnimatedCard 통계 카드 교체 패턴 (stat-accent 래퍼 유지)
    - FadeIn delay stagger 패턴 (0.05 간격)
    - recharts BarChart 수평 바 차트 (Cell 컴포넌트로 동적 색상)
    - assignmentProgress mock 진행률 (useEffect 내 한번만 생성)
key_files:
  created: []
  modified:
    - apps/web/src/routes/instructor/groups/index.tsx
    - apps/web/src/routes/instructor/groups/detail.tsx
    - apps/web/src/routes/instructor/groups/report.tsx
    - apps/web/src/routes/instructor/groups/student-detail.tsx
    - apps/web/src/routes/instructor/groups/assign.tsx
    - apps/web/src/routes/instructor/groups/new.tsx
decisions:
  - "assignmentProgress: useEffect 내 Math.random()으로 mock 진행률 생성 — re-render 시 변경 방지"
  - "incompleteMembers: 멤버 인덱스 기반 미완료 판별 — POC 환경 mock 데이터 대응"
  - "반 전체 비교 차트: recharts BarChart layout='vertical' + Cell 동적 색상 (emerald/amber/rose)"
  - "Card 유지 vs AnimatedCard 교체: 큰 섹션 Card 유지, 통계 소카드만 AnimatedCard 교체"
metrics:
  duration: 315s
  completed: 2026-02-21
  tasks: 2
  files: 6
---

# Phase 14 Plan 03: 강사 그룹/과제 관리 + 학생 분석 기출탭탭 스타일 리디자인 Summary

**한 줄 요약:** 강사 그룹 6개 페이지에 AnimatedCard + FadeIn 기출탭탭 스타일 적용, 과제 진행률 바 + 미완료 학생 알림 + recharts 반 전체 비교 차트 추가

## 완료된 작업

### Task 1: 그룹 목록/상세 기출탭탭 스타일 + 과제 진행률 + 미완료 학생 알림
**커밋:** f63c185

- **GroupListPage (index.tsx):** 헤더/카드 그리드에 FadeIn 적용, 개별 카드 Card → AnimatedCard 교체 + stagger delay
- **GroupDetailPage (detail.tsx):** FadeIn 래퍼 적용, 과제별 진행률 바(`completedCount/memberCount` + 프로그레스 바) 추가 (INST-04)
- **미완료 학생 알림:** AlertTriangle 아이콘 + amber 스타일 경고 카드 (과제+멤버 있을 때만 표시)
- **AssignWorkbookPage (assign.tsx):** FadeIn 래퍼 추가
- **GroupNewPage (new.tsx):** FadeIn 래퍼 추가 (생성 완료/폼 두 상태 모두)

### Task 2: 학습 리포트 + 학생 상세 분석 기출탭탭 스타일 리디자인
**커밋:** 5a8cbe7

- **GroupReportPage (report.tsx):**
  - 요약 통계 카드 3종 (학생 수/평균 정답률/총 풀이) Card → AnimatedCard 교체
  - 반 전체 비교 차트 추가: recharts BarChart 수평 바, 정답률별 emerald/amber/rose 동적 색상 (INST-03)
  - 학생별 현황 테이블/모바일 카드 FadeIn 래퍼 적용
- **StudentAnalyticsDetailPage (student-detail.tsx):**
  - 통계 카드 4종 (총 풀이/정답률/학습시간/오답) AnimatedCard + FadeIn stagger 적용 (INST-03)
  - 차트 2컬럼/오답노트 섹션 FadeIn delay 순차 적용

## 성공 기준 충족

- INST-03 충족: 개별 학생 상세(AnimatedCard stagger) + 반 전체 비교 차트(recharts BarChart) 리디자인 UI로 표시
- INST-04 충족: 과제 진행률 바 + 미완료 학생 알림이 새 UI로 표시
- pnpm --filter web build: TypeScript 0 에러, Vite 빌드 성공

## Deviations from Plan

None - 플랜 그대로 실행됨.

## Self-Check: PASSED

- apps/web/src/routes/instructor/groups/index.tsx: FOUND
- apps/web/src/routes/instructor/groups/detail.tsx: FOUND
- apps/web/src/routes/instructor/groups/report.tsx: FOUND
- apps/web/src/routes/instructor/groups/student-detail.tsx: FOUND
- apps/web/src/routes/instructor/groups/assign.tsx: FOUND
- apps/web/src/routes/instructor/groups/new.tsx: FOUND
- Commit f63c185: FOUND
- Commit 5a8cbe7: FOUND
- Build: PASSED (0 TypeScript errors)
