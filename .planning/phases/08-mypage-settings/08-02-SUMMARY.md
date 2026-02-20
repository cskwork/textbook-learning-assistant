---
phase: 08-mypage-settings
plan: "02"
subsystem: auth-data-layer
tags: [auth, dexie, settings, profile]
dependency_graph:
  requires: []
  provides:
    - updateProfile (auth.ts)
    - changePassword (auth.ts)
    - deleteAccount (auth.ts)
    - AuthContext.updateProfile
    - db.ts version(6) + UserSetting 확장
    - settings.service.ts (getUserSettings, saveUserSettings)
  affects:
    - apps/web/src/lib/auth.ts
    - apps/web/src/lib/db.ts
    - apps/web/src/contexts/AuthContext.tsx
    - apps/web/src/services/settings.service.ts
tech_stack:
  added: []
  patterns:
    - StoredUser 내부 타입 분리 (password 포함 저장, 외부 User에는 미포함)
    - Dexie upsert 패턴 (기존 레코드 조회 후 update/put 분기)
    - 동적 import로 deleteAccount에서 db 접근 (순환 참조 방지)
key_files:
  created:
    - apps/web/src/services/settings.service.ts
  modified:
    - apps/web/src/lib/auth.ts
    - apps/web/src/lib/db.ts
    - apps/web/src/contexts/AuthContext.tsx
decisions:
  - "[08-02]: StoredUser 내부 인터페이스로 password 분리 — User 공개 타입에서 password 노출 방지"
  - "[08-02]: deleteAccount에서 db를 dynamic import — auth.ts ↔ db.ts 순환 참조 방지"
  - "[08-02]: login() 비밀번호 검증 하위 호환 — stored.password 없으면 기존 유저 통과 (seed 데이터 등)"
metrics:
  duration: "123s"
  completed: "2026-02-21"
  tasks_completed: 2
  files_modified: 4
---

# Phase 8 Plan 02: 데이터 레이어 — auth.ts 확장 + AuthContext + Dexie version(6) + settings.service.ts

auth.ts에 name/avatarEmoji User 확장 + updateProfile/changePassword/deleteAccount 3개 함수 추가, Dexie version(6) UserSetting 4개 optional 필드 확장, AuthContext.updateProfile 노출, settings.service.ts 신규 생성 — Plan 03 UI 레이어가 소비할 전체 데이터 레이어 완성

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | auth.ts User 확장 + updateProfile/changePassword/deleteAccount + db.ts version(6) + settings.service.ts | b697bf9 | auth.ts, db.ts, settings.service.ts (신규) |
| 2 | AuthContext에 updateProfile 노출 + 빌드 검증 | 0f6dbae | AuthContext.tsx |

## What Was Built

### auth.ts 변경사항
- `User` 인터페이스에 `name?: string`, `avatarEmoji?: string` 추가 (optional — 기존 유저 하위 호환)
- 내부 `StoredUser` 인터페이스 추가 (`User` 확장 + `password?: string`)
- `register()`: password를 `StoredUser`에 저장
- `login()`: 비밀번호 검증 추가 (기존 유저 password 없으면 통과)
- `updateProfile(updates)`: name/avatarEmoji USERS_KEY + CURRENT_USER_KEY 양쪽 업데이트
- `changePassword(currentPassword, newPassword)`: 기존 비밀번호 확인 + 8자 이상 검증
- `deleteAccount()`: Dexie 7개 테이블 + localStorage 완전 삭제 (동적 import)

### db.ts 변경사항
- `UserSetting` 인터페이스에 optional 필드 추가: `displayName`, `avatarEmoji`, `isDarkMode`, `katexFontSize`
- `version(6)` 선언 (인덱스 변경 없음 — optional 필드 추가만)

### AuthContext.tsx 변경사항
- `updateProfile as apiUpdateProfile` import 추가
- `AuthContextValue` 인터페이스에 `updateProfile` 추가
- `updateProfile` 함수 구현: `apiUpdateProfile(updates)` 호출 후 `setUser(u)` (앱 전체 즉시 반영)
- Provider value에 `updateProfile` 포함

### settings.service.ts (신규)
- `getUserSettings(userId)`: Dexie userSettings에서 단일 레코드 조회
- `saveUserSettings(userId, updates)`: 기존 레코드 있으면 update, 없으면 put (dailyGoal: 10, isDiagnosisCompleted: false 기본값)

## Decisions Made

1. **StoredUser 내부 타입 분리**: password를 User 공개 타입에서 숨기고 StoredUser 내부 인터페이스로 관리. CURRENT_USER_KEY에는 항상 password 없는 User 저장.

2. **동적 import로 db 접근**: `deleteAccount()`에서 `const { db } = await import('./db')` — auth.ts와 db.ts 사이의 순환 참조 방지. Vite 빌드 경고(dynamic import + static import 혼용)는 무해함.

3. **login() 비밀번호 하위 호환**: `stored.password && stored.password !== password` 조건 — seed 데이터나 기존 localStorage 사용자(password 없음)는 영향 없음.

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

1. `pnpm build` 성공 (TypeScript 에러 없음, exit code 0)
2. auth.ts: User 인터페이스에 name?, avatarEmoji? 추가됨
3. auth.ts: updateProfile, changePassword, deleteAccount 3개 함수 export
4. db.ts: version(6) 선언 + UserSetting 4개 optional 필드
5. AuthContext: updateProfile value 포함, setUser(updated) 호출
6. settings.service.ts: getUserSettings, saveUserSettings export

## Self-Check: PASSED
