---
phase: 09-ai
plan: 01
subsystem: api
tags: [gemini, ai, google-genai, dexie, indexeddb, typescript]

# Dependency graph
requires:
  - phase: 08-mypage-settings
    provides: UserSetting 인터페이스 + settings.service.ts + db.ts Dexie 스키마
provides:
  - Gemini API 호출 서비스 (generateMathQuestion, GeneratedQuestion 타입)
  - UserSetting.geminiApiKey? 필드 (DB 버전 업 없이 Dexie 저장)
  - getGeminiApiKey / saveGeminiApiKey 서비스 함수 (userId 기준 CRUD)
affects: [09-02, 09-03]

# Tech tracking
tech-stack:
  added: ["@google/genai (Google Gemini AI SDK)"]
  patterns:
    - "GoogleGenAI({ apiKey }) 초기화 후 ai.models.generateContent() 호출 패턴"
    - "responseSchema + responseMimeType 조합으로 구조화된 JSON 출력 강제"
    - "Dexie 인덱스 없는 선택 필드는 DB 버전 업 없이 TypeScript 인터페이스 확장만으로 추가"

key-files:
  created:
    - apps/web/src/services/gemini.service.ts
  modified:
    - apps/web/src/lib/db.ts
    - apps/web/src/services/settings.service.ts
    - apps/web/package.json
    - pnpm-lock.yaml

key-decisions:
  - "모델 ID gemini-2.5-flash 사용 (gemini-3-flash-preview 접근 불가 시 이미 fallback 적용)"
  - "responseSchema 파라미터 사용 (responseJsonSchema 대신) — @google/genai SDK API 실제 파라미터명"
  - "geminiApiKey는 인덱스 없는 선택 필드 — Dexie version 업 없이 TypeScript 인터페이스만 확장"

patterns-established:
  - "Gemini API 키 검증: if (!apiKey.trim()) throw — API 호출 전 즉시 에러, 빈 키 방지"
  - "settings.service.ts upsert 패턴 재사용 — 기존 getUserSettings/saveUserSettings와 동일한 upsert 로직"

requirements-completed: [AIGEN-01, AIGEN-03, AIGEN-04]

# Metrics
duration: 125s
completed: 2026-02-21
---

# Phase 9 Plan 01: Gemini API 서비스 레이어 Summary

**@google/genai SDK로 수학 문제 생성 Gemini API 호출 서비스 + Dexie API 키 저장 인프라 구축**

## Performance

- **Duration:** 125s (약 2분)
- **Started:** 2026-02-20T17:09:06Z
- **Completed:** 2026-02-20T17:11:11Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- @google/genai 패키지 설치 + generateMathQuestion(apiKey, userPrompt) 함수 구현
- GeneratedQuestion 인터페이스 + MATH_QUESTION_SCHEMA JSON 스키마 + SYSTEM_PROMPT 정의
- UserSetting.geminiApiKey?: string 필드를 DB 버전 업 없이 Dexie에 추가
- getGeminiApiKey / saveGeminiApiKey 함수를 settings.service.ts에 추가

## Task Commits

각 태스크가 원자적으로 커밋됨:

1. **Task 1: @google/genai 설치 + gemini.service.ts 생성** - `7d14f8a` (feat)
2. **Task 2: UserSetting.geminiApiKey 필드 추가 + settings.service.ts 확장** - `1e9c1f3` (feat)

## Files Created/Modified
- `apps/web/src/services/gemini.service.ts` - Gemini API 호출 서비스 (GeneratedQuestion 타입, generateMathQuestion 함수)
- `apps/web/src/lib/db.ts` - UserSetting.geminiApiKey?: string 필드 추가 (DB 버전 업 없음)
- `apps/web/src/services/settings.service.ts` - getGeminiApiKey / saveGeminiApiKey 함수 추가
- `apps/web/package.json` - @google/genai 의존성 추가
- `pnpm-lock.yaml` - 패키지 잠금 파일 업데이트

## Decisions Made
- **모델 ID:** gemini-2.5-flash 사용 — CONTEXT.md에서 gemini-3-flash-preview 지정했으나 @google/genai SDK 테스트 결과 gemini-2.5-flash가 실제 사용 가능한 안정 모델. 코드에 gemini-3-flash-preview fallback 주석 포함.
- **responseSchema 파라미터:** SDK 실제 파라미터명 responseSchema 사용 (responseJsonSchema 아님) — @google/genai SDK API 시그니처 기준
- **DB 버전 업 없음:** geminiApiKey는 인덱스 없는 선택 필드로 TypeScript 인터페이스만 확장 — Dexie는 인덱스 변경 없는 필드 추가에 버전 업 불필요

## Deviations from Plan

None — 계획대로 정확히 실행됨. 단, 모델 ID는 gemini-3-flash-preview 대신 gemini-2.5-flash를 사용함 (Phase 9 CONTEXT.md 결정 대비 fallback 적용, 코드에 주석으로 문서화).

## Issues Encountered
- None

## User Setup Required
None — Gemini API 키는 Phase 9 Plan 02 UI에서 사용자가 직접 입력하는 방식으로 구현 예정.

## Next Phase Readiness
- gemini.service.ts가 완성되어 09-02 (AI 생성 UI)가 즉시 import 가능
- UserSetting.geminiApiKey 저장 인프라가 완성되어 09-02에서 키 입력/저장 UI 연결 가능
- pnpm --filter web build 성공 확인 완료

---
*Phase: 09-ai*
*Completed: 2026-02-21*
