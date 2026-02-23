---
phase: 15-infra-fun-mode
plan: "01"
subsystem: infra
tags: [react-context, css-variables, localStorage, theme-switching, fun-mode]

# Dependency graph
requires: []
provides:
  - FunModeProvider: 앱 루트에 등록된 전역 반전 모드 컨텍스트
  - useFunMode 훅: isFunMode + toggleFunMode 반환
  - "[data-fun-mode='true'] CSS 선택자: 게임 테마 CSS 변수 오버라이드"
  - FunModeToggleButton: 헤더 토글 버튼 컴포넌트
  - localStorage 영속성: 'app:funMode' 키로 상태 유지
affects: [15-02, 16, 17, 18, 19, 20]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "data-속성 테마 전환: document.documentElement.setAttribute('data-fun-mode', ...) 패턴"
    - "useLayoutEffect FOUC 방지: 초기 마운트 시 DOM 속성 동기 적용"
    - "CSS 변수 오버라이드: [data-fun-mode='true'] 선택자로 :root 변수 재정의"

key-files:
  created:
    - apps/web/src/contexts/FunModeContext.tsx
    - apps/web/src/hooks/useFunMode.ts
    - apps/web/src/components/layout/FunModeToggleButton.tsx
  modified:
    - apps/web/src/index.css
    - apps/web/src/components/layout/AppShell.tsx
    - apps/web/src/main.tsx

key-decisions:
  - "FunModeProvider 위치: SettingsProvider > FunModeProvider > AuthProvider 순서로 래핑"
  - "useLayoutEffect로 FOUC 방지: 초기 렌더 전 DOM 속성 동기 적용"
  - "CSS 변수 오버라이드 방식: @layer base 내부에 [data-fun-mode='true'] 선택자 배치"

patterns-established:
  - "반전 모드 게이트 패턴: data-fun-mode DOM 속성 + CSS 변수 오버라이드로 테마 즉시 전환"
  - "Context 재수출 패턴: hooks 디렉터리에서 contexts를 재수출하여 import 경로 유연성 확보"

requirements-completed: [INFRA-01, INFRA-02, INFRA-03]

# Metrics
duration: 2min
completed: 2026-02-23
---

# Phase 15 Plan 01: FunMode 인프라 게이트 Summary

**FunModeContext + CSS 변수 오버라이드로 단일 버튼 클릭에 전체 앱 테마가 다크 퍼플/네온 그린 게임 스타일로 즉시 전환되는 인프라 구축 (localStorage 영속성 포함)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-23T12:45:19Z
- **Completed:** 2026-02-23T12:47:30Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- FunModeProvider + useFunMode 훅 생성 — localStorage 영속성 + FOUC 방지 useLayoutEffect 포함
- [data-fun-mode="true"] CSS 선택자로 배경(다크 퍼플), 강조색(네온 그린), 보조색(일렉트릭 퍼플) 즉시 전환
- FunModeToggleButton을 AppShell 헤더에 삽입, main.tsx에 FunModeProvider 루트 래핑

## Task Commits

Each task was committed atomically:

1. **Task 1: FunModeContext + useFunMode 훅 생성** - `e97aa02` (feat)
2. **Task 2: CSS 테마 변수 + 토글 버튼 + AppShell 연결** - `e2f2bfc` (feat)

## Files Created/Modified

- `apps/web/src/contexts/FunModeContext.tsx` - FunModeProvider + useFunMode 훅 (전역 게이트)
- `apps/web/src/hooks/useFunMode.ts` - hooks 디렉터리 재수출 편의 훅
- `apps/web/src/components/layout/FunModeToggleButton.tsx` - 헤더 토글 버튼 (🎯↔🎮)
- `apps/web/src/index.css` - [data-fun-mode="true"] 게임 테마 CSS 변수 오버라이드 추가
- `apps/web/src/components/layout/AppShell.tsx` - FunModeToggleButton import + 헤더 JSX 삽입
- `apps/web/src/main.tsx` - FunModeProvider 루트 래핑 (SettingsProvider > FunModeProvider > AuthProvider)

## Decisions Made

- FunModeProvider 위치: SettingsProvider 바로 내부, AuthProvider 바로 외부에 배치 — 반전 모드가 인증 여부와 무관하게 동작해야 하므로 AuthProvider 외부 유지
- useLayoutEffect 사용: 초기 마운트 시 FOUC(Flash of Unstyled Content) 방지를 위해 useEffect 대신 useLayoutEffect 사용
- CSS 변수 @layer base 배치: Tailwind v4의 :root 변수보다 높은 우선순위로 오버라이드되도록 @layer base 내부에 배치

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- v3.0 반전 모드 전제 조건 완성: FunModeContext 게이트가 준비됨
- Phase 16-20의 모든 반전 기능은 `useFunMode()` 훅 하나로 UI 분기 가능
- 다음: 15-02 Vite 번들 전략 (manualChunks + lazy loading) 실행

---
*Phase: 15-infra-fun-mode*
*Completed: 2026-02-23*
