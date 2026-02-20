---
phase: 09-ai
plan: 02
subsystem: ui
tags: [gemini, ai, react, shadcn, instructor, settings, dexie]

# Dependency graph
requires:
  - phase: 09-ai-01
    provides: generateMathQuestion(apiKey, userPrompt), GeneratedQuestion 타입, getGeminiApiKey/saveGeminiApiKey 함수
  - phase: 08-mypage-settings
    provides: 강사 마이페이지(profile/index.tsx), settings.service.ts, Card/Input/Button 컴포넌트
provides:
  - AIGeneratePanel 컴포넌트 (프롬프트 입력 + Gemini API 호출 + 결과 콜백)
  - QuestionForm 상단 AI 생성 패널 통합 — handleAIGenerated로 폼 필드 자동 채우기
  - 강사 마이페이지 Gemini API 키 입력/저장/로드 UI 카드
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "AIGeneratePanel onGenerated 콜백 패턴 — 생성 결과를 부모 컴포넌트(QuestionForm)가 처리"
    - "useEffect + getGeminiApiKey로 컴포넌트 마운트 시 API 키 비동기 로드"
    - "form.setValue + form.trigger 조합으로 react-hook-form 필드 프로그래밍 방식 업데이트"
    - "geminiKeySaved + setTimeout 패턴으로 저장 완료 피드백 2초 표시"

key-files:
  created:
    - apps/web/src/components/questions/AIGeneratePanel.tsx
  modified:
    - apps/web/src/components/questions/QuestionForm.tsx
    - apps/web/src/routes/instructor/profile/index.tsx

key-decisions:
  - "AIGeneratePanel을 QuestionForm 최상단에 배치 + hr 구분선으로 필수 입력과 시각적 분리"
  - "API 키는 input type=password로 표시 — 마스킹으로 보안 느낌 제공"
  - "강사 마이페이지 AI 설정 카드를 앱 설정 아래, 보안 위에 배치 — 기능 흐름 자연스러움"

patterns-established:
  - "AI 생성 패널: apiKey undefined → 버튼 비활성화 + 안내 메시지, 있으면 프롬프트 입력 + 생성 가능"
  - "handleAIGenerated: form.setValue 5개 필드 + form.trigger 3개 검증 필드 — react-hook-form 상태 동기화"

requirements-completed: [AIGEN-01, AIGEN-02, AIGEN-03, AIGEN-04]

# Metrics
duration: 114s
completed: 2026-02-21
---

# Phase 9 Plan 02: AI 문제 생성 UI Summary

**AIGeneratePanel 컴포넌트 + QuestionForm AI 패널 통합 + 강사 마이페이지 Gemini API 키 관리 UI 구현**

## Performance

- **Duration:** 114s (약 2분)
- **Started:** 2026-02-20T17:14:12Z
- **Completed:** 2026-02-20T17:16:06Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- AIGeneratePanel.tsx 신규 생성 — apiKey/onGenerated props, 로딩/에러 상태, API 키 미설정 안내
- QuestionForm 최상단에 AIGeneratePanel 통합 — handleAIGenerated로 5개 필드 자동 채우기
- 강사 마이페이지에 "AI 문제 생성 설정" 카드 추가 — API 키 입력/저장/로드, 저장됨 피드백

## Task Commits

각 태스크가 원자적으로 커밋됨:

1. **Task 1: AIGeneratePanel 컴포넌트 생성** - `59e00d0` (feat)
2. **Task 2: QuestionForm AI 패널 통합 + 강사 프로필 API 키 섹션** - `f2de65c` (feat)

## Files Created/Modified
- `apps/web/src/components/questions/AIGeneratePanel.tsx` - AI 생성 패널 (프롬프트 입력, Gemini API 호출, 로딩/에러 상태, API 키 미설정 안내)
- `apps/web/src/components/questions/QuestionForm.tsx` - AIGeneratePanel 통합, useEffect로 API 키 로드, handleAIGenerated로 폼 자동 채우기
- `apps/web/src/routes/instructor/profile/index.tsx` - Gemini API 키 카드 섹션 (입력/저장/로드/피드백)

## Decisions Made
- AIGeneratePanel을 QuestionForm 최상단에 배치하고 hr 구분선으로 기존 필수 입력과 시각적 분리 — 패널이 보조 도구임을 명확히 함
- API 키 입력을 input type=password로 처리 — 마스킹으로 키 노출 방지
- 강사 마이페이지 AI 설정 카드 위치: 앱 설정 ↔ 보안 사이 — 설정 섹션의 자연스러운 흐름

## Deviations from Plan

None — 계획대로 정확히 실행됨.

## Issues Encountered
- None

## User Setup Required
강사가 Google AI Studio (https://aistudio.google.com/app/apikey)에서 Gemini API 키를 발급받아 마이페이지에서 설정해야 AI 문제 생성 기능 사용 가능. 키는 기기 로컬(Dexie IndexedDB)에만 저장됨.

## Self-Check

파일 존재 확인:
- apps/web/src/components/questions/AIGeneratePanel.tsx: 생성됨 (88줄)
- apps/web/src/components/questions/QuestionForm.tsx: 수정됨 (AIGeneratePanel import + 통합)
- apps/web/src/routes/instructor/profile/index.tsx: 수정됨 (Gemini API 키 카드 추가)

빌드 확인: pnpm --filter web build 성공 (TypeScript 오류 0개)

## Self-Check: PASSED

## Next Phase Readiness
- Phase 9 Plan 01-02 완료 — AI 문제 생성 서비스 레이어 + UI 모두 구현
- 강사가 마이페이지에서 Gemini API 키 설정 후 문제 등록/수정 폼에서 AI 생성 즉시 사용 가능
- Phase 9 완료 (09-01 + 09-02 + 09-03 완료)

---
*Phase: 09-ai*
*Completed: 2026-02-21*
