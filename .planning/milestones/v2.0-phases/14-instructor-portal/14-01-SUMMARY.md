---
phase: 14-instructor-portal
plan: "01"
subsystem: instructor-home
tags: [dashboard, animated-card, fade-in, group-summary, assignments]
dependency_graph:
  requires: []
  provides: [instructor-home-redesign]
  affects: [apps/web/src/routes/instructor/index.tsx]
tech_stack:
  added: []
  patterns: [AnimatedCard, FadeIn stagger, stat-accent CSS 변수, GroupSummary Promise.all 집계]
key_files:
  created: []
  modified:
    - apps/web/src/routes/instructor/index.tsx
decisions:
  - "[14-01] 통계 카드: AnimatedCard + stat-accent CSS 변수 조합 유지 — 학생 홈 패턴과 일관성"
  - "[14-01] groupSummaries: Map<number, GroupSummary> useState + useEffect Promise.all 집계 — 반 목록 변경 시 자동 재집계"
  - "[14-01] 최근 과제: db.assignments.where('groupId').anyOf(groupIds) — 강사의 전체 반 과제 통합 조회"
  - "[14-01] 빠른 이동: grid-cols-3 (반 관리/문제 관리/새 반 만들기) AnimatedCard 래퍼"
metrics:
  duration: 182
  completed_date: "2026-02-21"
  tasks_completed: 1
  files_modified: 1
---

# Phase 14 Plan 01: 강사 홈 대시보드 기출탭탭 스타일 전면 리디자인 Summary

**한 줄 요약:** AnimatedCard + FadeIn stagger + GroupSummary Promise.all 집계로 강사 홈 대시보드를 기출탭탭 스타일로 전면 리디자인 (INST-01 충족)

## 완료된 작업

| Task | 이름 | Commit | 주요 파일 |
|------|------|--------|----------|
| 1 | 강사 홈 대시보드 기출탭탭 스타일 전면 리디자인 | e895d61 | apps/web/src/routes/instructor/index.tsx |

## 구현 내용

### 레이아웃 구조

- **FadeIn delay=0:** 인사 영역 + 문제 출제 CTA 버튼
- **FadeIn delay=0.05:** 통계 카드 2종 (관리 중인 반 / 출제한 문제) — AnimatedCard + stat-accent-blue/emerald
- **FadeIn delay=0.1:** 빠른 이동 grid-cols-3 (반 관리 / 문제 관리 / 새 반 만들기) — AnimatedCard + stat-accent-violet
- **FadeIn delay=0.15:** 최근 반 (lg:col-span-3) + 최근 과제 (lg:col-span-2)

### 반별 성적 요약 (INST-01)

```typescript
interface GroupSummary {
  groupId: number
  memberCount: number
  avgAccuracy: number
}

// useEffect: recentGroups 변경 시 Promise.all 집계
const members = await listGroupMembers(group.id!)
const statsResults = await Promise.all(members.map(m => getOverallStats(m.studentId)))
const avgAccuracy = Math.round(totalAccuracy / statsResults.length)
```

반 목록에 각 반의 학생 수 Badge + 평균 정답률 % 표시.

### 최근 과제 섹션

- `db.assignments.where('groupId').anyOf(groupIds)` — 강사 전체 반 과제 통합 조회
- 최신 5개 정렬 (assignedAt desc)
- 과제 행: 제목 + 그룹명 + 마감일
- 빈 상태: 과제 배정 안내 + 반 관리 링크

## 검증 결과

- `pnpm --filter web build` 성공 — TypeScript 0 에러, Vite 프로덕션 빌드 완료
- `grep "AnimatedCard"` — import 및 3회 사용 확인
- `grep "FadeIn"` — import 및 4개 delay 패턴 (0, 0.05, 0.1, 0.15) 확인
- `grep "avgAccuracy|memberCount|GroupSummary"` — 반별 성적 요약 로직 확인

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] groups/detail.tsx 미사용 AnimatedCard import 제거**
- **발견 시점:** Task 1 빌드 검증 시
- **문제:** `AnimatedCard`가 import되었으나 실제로 사용되지 않아 TS6133 에러 발생
- **수정:** import 제거 (ESLint/linter가 자동 수정)
- **파일:** apps/web/src/routes/instructor/groups/detail.tsx

**2. [Rule 1 - Bug] groups/new.tsx FadeIn 닫는 태그 오류 수정**
- **발견 시점:** Task 1 빌드 검증 시
- **문제:** `<FadeIn>` 열기 태그 대응 닫기 태그가 `</div>`로 잘못됨
- **수정:** `</FadeIn>` 및 FadeIn 전체 적용 (linter 자동 수정)
- **파일:** apps/web/src/routes/instructor/groups/new.tsx

## Self-Check: PASSED

- [x] `apps/web/src/routes/instructor/index.tsx` 파일 존재 확인
- [x] commit `e895d61` 존재 확인 (`git log --oneline -1`)
- [x] 빌드 성공 (TypeScript 0 에러, Vite 빌드 정상 완료)
- [x] INST-01 요구사항 충족: 학생 현황 카드 + 최근 과제 + 반별 성적 요약 모두 구현
