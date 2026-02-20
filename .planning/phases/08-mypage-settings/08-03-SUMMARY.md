---
phase: 08-mypage-settings
plan: "03"
subsystem: ui
tags: [profile, avatar, dark-mode, katex, slider, switch, dialog, react-hook-form, zod]

dependency_graph:
  requires:
    - phase: 08-01
      provides: SettingsContext (toggleDarkMode, setKatexFontSize, isDarkMode, katexFontSize)
    - phase: 08-02
      provides: updateProfile, changePassword, deleteAccount (auth.ts), AuthContext.updateProfile, settings.service.ts
  provides:
    - AvatarDisplay (이모지/이니셜 아바타 컴포넌트)
    - ProfileEditForm (이름 + 이모지 그리드 선택 편집 폼)
    - PasswordChangeForm (비밀번호 변경 폼)
    - StudentProfilePage (/student/profile — 프로필/설정/보안/계정삭제 통합 페이지)
    - InstructorProfilePage (/instructor/profile — 강사 마이페이지)
  affects:
    - apps/web/src/main.tsx (ComingSoonPage 대신 프로필 페이지 연결)

tech-stack:
  added: []
  patterns:
    - 컴포넌트 합성 패턴 — AvatarDisplay/ProfileEditForm/PasswordChangeForm을 페이지에서 조합
    - react-hook-form + zod zodResolver 유효성 검사
    - 함수 내부 null 가드 — 훅 이후 선언된 함수에서 null 체크 (TypeScript 닫힘 null 추론 대응)
    - isApiError 타입 가드로 서버 에러 메시지 추출

key-files:
  created:
    - apps/web/src/components/profile/AvatarDisplay.tsx
    - apps/web/src/components/profile/ProfileEditForm.tsx
    - apps/web/src/components/profile/PasswordChangeForm.tsx
    - apps/web/src/routes/student/profile/index.tsx
    - apps/web/src/routes/instructor/profile/index.tsx
  modified:
    - apps/web/src/main.tsx

key-decisions:
  - "함수 내부 if (!user) return null 가드 추가 — TypeScript 클로저 내 null 추론 오류 방지 (컴포넌트 상단 early return만으로는 함수 내부 null 분석 안 됨)"
  - "ProfileEditForm: useEffect로 user props 변경 시 setValue 재동기화 — 외부 updateProfile 후 폼 상태 동기화"
  - "이모지 선택 취소 버튼 추가 — avatarEmoji 빈 문자열로 설정하면 이니셜 아바타로 전환"
  - "계정 삭제 버튼: disabled={deleteEmailInput !== user.email} — 이메일 일치 시에만 클릭 가능 (UX 안전장치)"

requirements-completed: [MYPAGE-01, MYPAGE-02, MYPAGE-03, MYPAGE-04, MYPAGE-05]

duration: 226s
completed: "2026-02-21"
---

# Phase 8 Plan 03: 마이페이지 UI 컴포넌트 Summary

**AvatarDisplay/ProfileEditForm/PasswordChangeForm 3개 공유 컴포넌트 + 학생/강사 통합 마이페이지(프로필 편집, 다크모드 Switch, KaTeX Slider, 비밀번호 변경, 계정 삭제 Dialog) 구현**

## Performance

- **Duration:** 226초 (~4분)
- **Started:** 2026-02-20T15:58:34Z
- **Completed:** 2026-02-20T16:02:20Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- AvatarDisplay: 이모지 아바타(bg-primary/10) + 이니셜 아바타(bg-primary) sm/md/lg 3가지 크기 지원
- ProfileEditForm: react-hook-form + zod, 이름 입력 + 20개 이모지 그리드 선택, 저장 후 3초 피드백
- PasswordChangeForm: 현재/새/확인 비밀번호 3필드, isApiError 서버 에러 표시, 성공 시 폼 리셋
- 학생/강사 마이페이지: 4개 섹션 카드 구조 (프로필/앱설정/보안/위험영역), ComingSoonPage 대체
- 빌드 성공 — TypeScript 에러 없음

## Task Commits

1. **Task 1: AvatarDisplay + ProfileEditForm + PasswordChangeForm 컴포넌트** - `82c34fb` (feat)
2. **Task 2: 학생/강사 마이페이지 통합 페이지 + 빌드 검증** - `e1d08da` (feat)

## Files Created/Modified

- `apps/web/src/components/profile/AvatarDisplay.tsx` - 이모지/이니셜 아바타 컴포넌트 (sm/md/lg 크기)
- `apps/web/src/components/profile/ProfileEditForm.tsx` - 이름 + 20개 이모지 그리드 편집 폼
- `apps/web/src/components/profile/PasswordChangeForm.tsx` - 비밀번호 변경 폼 (changePassword 사용)
- `apps/web/src/routes/student/profile/index.tsx` - 학생 마이페이지 통합 페이지
- `apps/web/src/routes/instructor/profile/index.tsx` - 강사 마이페이지 통합 페이지
- `apps/web/src/main.tsx` - /student/profile, /instructor/profile 라우트 연결

## Decisions Made

1. **함수 내부 null 가드**: TypeScript는 컴포넌트 상단 `if (!user) return null` 이후에도 함수 클로저 내에서 `user`를 `User | null`로 추론함. `handleDeleteAccount` 등 내부 함수에 별도 `if (!user) return` 추가로 해결.

2. **ProfileEditForm useEffect 동기화**: `user.name`, `user.avatarEmoji` props가 `updateProfile` 호출 후 변경될 때 폼 상태를 `setValue`로 재동기화. 외부 업데이트와 로컬 폼 상태의 불일치 방지.

3. **이모지 선택 취소**: `setValue('avatarEmoji', '')` + 이니셜 아바타 전환. 이모지 없이 이니셜만 사용하고 싶은 경우를 위한 UX 옵션.

4. **계정 삭제 버튼 disabled**: `deleteEmailInput !== user.email` 조건으로 이메일 일치 전까지 버튼 비활성화 — Dialog 내 추가 안전장치.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript null 추론 오류 수정**
- **Found during:** Task 2 빌드 검증
- **Issue:** `handleDeleteAccount` 등 함수 클로저 내에서 TypeScript가 `user`를 `User | null`로 추론하여 `TS18047: 'user' is possibly 'null'` 에러 발생
- **Fix:** 각 함수 내부 첫 줄에 `if (!user) return` null 가드 추가. 컴포넌트 상단 early return 유지.
- **Files modified:** `apps/web/src/routes/student/profile/index.tsx`, `apps/web/src/routes/instructor/profile/index.tsx`
- **Verification:** `pnpm --filter web build` 성공 (TypeScript 에러 없음)
- **Committed in:** e1d08da (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** TypeScript 닫힘 null 추론 오류 수정. 계획 범위 변경 없음.

## Issues Encountered

없음 — 빌드 에러는 즉시 수정됨.

## Next Phase Readiness

- Phase 8 Plan 03 완료 — 마이페이지 UI 전체 구현 완성
- Plan 04(통합 검증 체크포인트)에서 실제 브라우저 동작 확인 필요:
  - 프로필 저장 → AuthContext user 즉시 반영 확인
  - 다크모드 토글 → 전체 앱 테마 전환 확인
  - KaTeX Slider → 미리보기 즉시 반영 확인
  - 계정 삭제 → 로그인 화면 이동 확인

---
*Phase: 08-mypage-settings*
*Completed: 2026-02-21*

## Self-Check: PASSED

- [x] `apps/web/src/components/profile/AvatarDisplay.tsx` — 존재
- [x] `apps/web/src/components/profile/ProfileEditForm.tsx` — 존재
- [x] `apps/web/src/components/profile/PasswordChangeForm.tsx` — 존재
- [x] `apps/web/src/routes/student/profile/index.tsx` — 존재
- [x] `apps/web/src/routes/instructor/profile/index.tsx` — 존재
- [x] `.planning/phases/08-mypage-settings/08-03-SUMMARY.md` — 존재
- [x] 커밋 82c34fb — 존재 (Task 1: 프로필 컴포넌트)
- [x] 커밋 e1d08da — 존재 (Task 2: 마이페이지 통합 페이지)
- [x] 커밋 efbd86a — 존재 (docs: 메타데이터)
