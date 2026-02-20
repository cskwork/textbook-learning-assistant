---
phase: quick-004
plan: "01"
subsystem: student-home
tags: [ui, empty-state, ux, student]
dependency_graph:
  requires: []
  provides: [student-home-empty-state]
  affects: [apps/web/src/routes/student/index.tsx]
tech_stack:
  added: []
  patterns: [early-return-empty-state, cta-gradient-reuse, step-card-grid]
key_files:
  created: []
  modified:
    - apps/web/src/routes/student/index.tsx
decisions:
  - "attemptCount === 0 early return 패턴: 기존 대시보드 return 전에 empty state를 early return으로 삽입, 기존 코드 완전 보존"
  - "cta-gradient 재사용: 기존 대시보드의 그라데이션 CTA 클래스를 환영 히어로 카드에도 재사용하여 디자인 일관성 유지"
  - "questionCount 분기 CTA: 문제 있으면 '문제 풀러 가기'+'랜덤 풀기', 없으면 '반 참여하기'로 상황별 안내 최적화"
metrics:
  duration: 75s
  completed: "2026-02-21"
---

# Quick Task 004: 학생 홈 empty state UI 추가 요약

**한 줄 요약:** attemptCount === 0 신규 학생에게 환영 히어로 카드 + 3단계 앱 사용법 스텝 카드를 표시하는 empty state UI 추가

## 구현 내용

### 변경 파일

`apps/web/src/routes/student/index.tsx` — empty state 분기 UI 추가 (131줄 추가)

### 조건 분기 구조

```
userSetting === undefined  → 로딩 스켈레톤 (기존)
userSetting 미완료/null    → /student/onboarding-quiz 리디렉트 (기존)
attemptCount === 0         → [NEW] Empty State 화면
attemptCount > 0           → 기존 대시보드 (변경 없음)
```

### Empty State 구성

1. **인사 영역** — `{greeting.emoji} {greeting.text}` + `{userName}님, 환영해요!` 제목
2. **환영 히어로 카드** — `cta-gradient` 배경, `BookOpenCheck` 아이콘(w-16 h-16), 제목/부제
   - `questionCount > 0`: "문제 풀러 가기"(primary) + "랜덤 문제 풀기"(ghost)
   - `questionCount === 0`: "반 참여하기"(primary) + 안내 텍스트
3. **3단계 스텝 카드 그리드** — `grid grid-cols-1 md:grid-cols-3 gap-3`
   - 문제 풀기: `BookOpenCheck` (blue)
   - AI 분석: `Sparkles` (violet)
   - 맞춤 추천: `Target` (emerald)

## 완료 기준 달성

- [x] `attemptCount === 0`인 학생이 홈 진입 시 환영 메시지 + 학습 안내 + 3단계 스텝 카드 표시
- [x] `questionCount > 0`이면 "문제 풀러 가기" + "랜덤 문제 풀기" CTA 표시
- [x] `questionCount === 0`이면 "반 참여하기" CTA + 안내 텍스트 표시
- [x] `attemptCount > 0` 기존 사용자는 대시보드 변경 없이 동작
- [x] 빌드 에러 없음 (`pnpm --filter web build` 성공)

## 태스크 커밋

| 태스크 | 설명 | 커밋 | 파일 |
|--------|------|------|------|
| Task 1 | 학생 홈 empty state UI 추가 | ec6f264 | apps/web/src/routes/student/index.tsx |

## Deviations from Plan

None - 플랜 그대로 실행됨.

## Self-Check: PASSED

- [x] `apps/web/src/routes/student/index.tsx` 수정 확인
- [x] 커밋 ec6f264 확인
- [x] 빌드 성공 확인 (`built in 5.63s`)
