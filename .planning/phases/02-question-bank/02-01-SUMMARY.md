---
phase: 02-question-bank
plan: 01
subsystem: data-layer
tags: [mock-auth, localStorage, IndexedDB, Dexie, CRUD, POC]
dependency_graph:
  requires: []
  provides:
    - lib/auth.ts (localStorage mock auth — register/login/logout/getMe/setRole)
    - lib/db.ts (Dexie 4.x EntityTable Question 스키마)
    - services/question.service.ts (문제 CRUD 5개 함수)
  affects:
    - contexts/AuthContext.tsx (api.ts import 제거)
    - 이후 모든 문제 UI (Plan 02, 03, 04 의존)
tech_stack:
  added:
    - dexie ^4.x (IndexedDB wrapper)
    - dexie-react-hooks ^1.1.x (useLiveQuery 훅)
    - react-hook-form ^7.x (폼 상태 관리)
    - zod ^3.x (스키마 유효성 검사)
    - "@hookform/resolvers ^3.x (zod ↔ react-hook-form 브릿지)"
  patterns:
    - Dexie 4.x EntityTable 패턴 (TypeScript 타입 안전 IndexedDB)
    - localStorage mock auth (동일 async 시그니처 유지)
key_files:
  created:
    - apps/web/src/lib/db.ts
    - apps/web/src/services/question.service.ts
  modified:
    - apps/web/src/lib/auth.ts (Express API → localStorage mock 전환)
    - apps/web/src/contexts/AuthContext.tsx (ApiError import 제거)
decisions:
  - "lib/auth.ts 자체 교체 방식 — mock-auth.ts 별도 파일 생성 없이 auth.ts를 직접 교체하여 AuthContext 변경 최소화"
  - "Question.source는 중첩 객체(QuestionSource 인터페이스) — Dexie는 중첩 객체를 인덱싱하지 않으므로 source.type 등은 필터링에 불사용"
  - "unit, questionCategory는 자유 텍스트(string) — POC에서 hardcode 목록 불필요, 향후 구조화 예정"
  - "pnpm --filter web add -D @types/katex 불필요 — katex 패키지에 타입 번들 포함됨 확인"
metrics:
  duration: 161s
  completed_date: "2026-02-20"
  tasks_completed: 2
  files_modified: 4
  files_created: 2
---

# Phase 2 Plan 01: 데이터 레이어 기반 구성 Summary

**한 줄 요약:** Express API 의존 인증을 localStorage mock으로 전환하고 Dexie 4.x EntityTable 기반 IndexedDB 문제 CRUD 서비스를 구현하여 백엔드 없는 Vercel POC 기반 완성

## 구현 내용

### Task 1: Mock Auth 레이어 전환 + AuthContext 수정 (커밋: 44e2a77)

**lib/auth.ts 전환:**
- 기존 `api.post('/api/auth/...')` 방식의 Express API 호출을 모두 제거
- localStorage 기반 mock 구현으로 교체 (register/login/logout/getMe/setRole/refreshToken)
- 동일한 async 함수 시그니처 유지 — AuthContext 변경 최소화
- 에러 형식도 동일: `{ error: string, statusCode: number }`

**AuthContext.tsx 수정:**
- `import type { ApiError } from '@/lib/api'` 라인 제거
- `isApiError` 함수를 인라인 타입 가드로 교체: `err is { error: string; statusCode: number }`

### Task 2: Dexie 스키마 + 문제 CRUD 서비스 (커밋: 3a1ff5e)

**설치된 패키지:**
- `dexie` — IndexedDB wrapper (TypeScript EntityTable 패턴)
- `dexie-react-hooks` — useLiveQuery 반응형 훅
- `react-hook-form` — 폼 상태 관리 (shadcn/ui 공식 권장)
- `zod` — 스키마 유효성 검사
- `@hookform/resolvers` — zodResolver 제공

**lib/db.ts:**
- `QuestionSource` 인터페이스: type/year/number/month 출처 정보
- `Question` 인터페이스: 내용/이미지/정답/유형/해설/메타데이터/출처/시스템 필드 14개
- Dexie version(1) 스키마: `++id, subject, unit, questionCategory, difficulty, createdAt, createdBy` 인덱스

**services/question.service.ts:**
- `createQuestion(data)` — id/createdAt/updatedAt 자동 생성
- `updateQuestion(id, data)` — updatedAt 자동 갱신
- `deleteQuestion(id)` — 단건 삭제
- `getQuestion(id)` — 단건 조회
- `listQuestions(filters?)` — 최신순, subject 필터 선택적 적용

## Mock Auth 전환 시 주의한 점

1. **시그니처 유지가 핵심** — `login(email, password): Promise<User>` 등 기존 시그니처를 그대로 유지해서 AuthContext 로직 변경 최소화
2. **에러 형식 통일** — `throw { error: '...', statusCode: N }` 형식으로 기존 ApiError 형식과 동일하게 던져 isApiError 가드가 그대로 작동
3. **api.ts 파일 유지** — lib/api.ts는 삭제하지 않음. 향후 실제 백엔드 전환 시 auth.ts만 교체하면 됨

## Dexie 스키마 결정사항

1. **EntityTable 패턴 채택** — Dexie 4.x의 타입 안전 방식. `db.questions: EntityTable<Question, 'id'>` 로 자동 primary key 추론
2. **QuestionSource 중첩 객체** — Dexie는 중첩 필드를 직접 인덱싱할 수 없으므로 source 객체는 인덱스 없이 저장. 출처 기반 필터링 필요 시 toArray() 후 JavaScript 필터 사용
3. **자유 텍스트 필드** — unit, questionCategory는 POC에서 자유 입력. 추후 Phase에서 과목별 단원 목록 hardcode 예정
4. **DB 이름** — `'mathQuestionDB'` 고정. 스키마 변경 시 version(2)로 마이그레이션 필요

## Deviations from Plan

None — 플랜 그대로 실행되었다.

Note: 커밋 목록에 a1ec043 (LatexPreview.tsx — 02-02 범위)가 포함되어 있으나, 해당 커밋은 이 실행 컨텍스트 이전에 별도로 생성된 것이다. 이 플랜 실행에서는 Task 1(44e2a77)과 Task 2(3a1ff5e)만 수행했다.

## Self-Check: PASSED

- FOUND: apps/web/src/lib/auth.ts
- FOUND: apps/web/src/lib/db.ts
- FOUND: apps/web/src/services/question.service.ts
- FOUND: apps/web/src/contexts/AuthContext.tsx
- FOUND: commit 44e2a77 (Task 1)
- FOUND: commit 3a1ff5e (Task 2)
- Build: pnpm --filter web build 에러 없이 통과
- Verification: auth.ts fetch 호출 없음, db.ts EntityTable 사용 확인
