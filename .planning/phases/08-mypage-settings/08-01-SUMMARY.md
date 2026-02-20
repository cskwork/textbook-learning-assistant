---
phase: 08-mypage-settings
plan: 01
subsystem: 설정 인프라
tags: [dark-mode, katex, settings-context, shadcn]
dependency_graph:
  requires: []
  provides:
    - SettingsContext (isDarkMode, katexFontSize, toggleDarkMode, setKatexFontSize)
    - 다크모드 FOUC 방지 동기 스크립트
    - KaTeX 글꼴 크기 CSS custom property
    - shadcn slider, switch, dialog 컴포넌트
  affects:
    - apps/web/src/main.tsx (SettingsProvider 추가)
    - 앱 전체 (다크모드, KaTeX 글꼴 크기 전역 적용)
tech_stack:
  added:
    - shadcn/ui Slider 컴포넌트
    - shadcn/ui Switch 컴포넌트
    - shadcn/ui Dialog 컴포넌트
  patterns:
    - React Context + useReducer 패턴 (SettingsContext)
    - document.documentElement.classList.toggle('dark') 패턴
    - CSS custom property (--katex-font-size) 전역 제어
    - FOUC 방지 동기 인라인 스크립트 (index.html)
key_files:
  created:
    - apps/web/src/contexts/SettingsContext.tsx
    - apps/web/src/components/ui/slider.tsx
    - apps/web/src/components/ui/switch.tsx
    - apps/web/src/components/ui/dialog.tsx
  modified:
    - apps/web/index.html
    - apps/web/src/index.css
    - apps/web/src/main.tsx
decisions:
  - "SettingsProvider를 BrowserRouter 내, AuthProvider 외부에 배치 — 다크모드가 로그인 페이지 포함 전체 앱에 적용"
  - "localStorage 키: 'app:isDarkMode', 'app:katexFontSize' — AuthContext 패턴과 일관성"
  - ".katex font-size에 !important — katex.min.css 기본값(1.21em) 오버라이드 필수"
  - "FOUC 방지: index.html body 최상단에 동기 스크립트 배치 (React 마운트 전 실행)"
metrics:
  duration: 109s
  completed_date: "2026-02-20"
  tasks_completed: 2
  files_modified: 7
---

# Phase 8 Plan 01: SettingsContext 전역 설정 인프라 Summary

## 한 줄 요약

localStorage + CSS custom property 기반 SettingsContext로 다크모드/KaTeX 글꼴 크기 전역 상태 관리 인프라 구축 (FOUC 방지 포함)

## 완료된 작업

### Task 1: shadcn 컴포넌트 설치 + SettingsContext 생성 + index.html/index.css 수정

**커밋:** b4d2a2c

**작업 내용:**
- `pnpm dlx shadcn@latest add slider switch dialog` — Phase 8 Plan 03에서 사용할 UI 컴포넌트 사전 설치
- `SettingsContext.tsx` 생성: `isDarkMode`, `katexFontSize`, `toggleDarkMode`, `setKatexFontSize` 전역 상태
- `index.html` 수정: `<body>` 최상단에 다크모드 + KaTeX 글꼴 크기 FOUC 방지 동기 스크립트 추가
- `index.css` 수정: `.katex { font-size: var(--katex-font-size, 1em) !important; }` 규칙 추가

**검증 결과:** slider.tsx, switch.tsx, dialog.tsx 파일 존재 / SettingsProvider export 확인 / app:isDarkMode 동기 스크립트 존재 / katex-font-size CSS 규칙 존재

---

### Task 2: main.tsx에 SettingsProvider 통합 + 빌드 검증

**커밋:** 877f85e

**작업 내용:**
- `main.tsx`에 `SettingsProvider` import 추가
- `SettingsProvider`를 `BrowserRouter` 내, `AuthProvider` 외부에 배치
- `pnpm build` 성공 (TypeScript 에러 없음, exit code 0)

**검증 결과:** SettingsProvider가 AuthProvider를 감싸는 구조 확인 / 빌드 성공

## 검증 결과

1. `pnpm build` — TypeScript 에러 없이 성공 (109s)
2. shadcn slider, switch, dialog 컴포넌트 파일 존재 확인
3. SettingsContext.tsx — SettingsProvider, useSettings 내보내기 확인
4. index.html — 다크모드 동기 스크립트 존재 확인
5. index.css — `.katex { font-size: var(--katex-font-size, 1em) !important; }` 규칙 존재 확인
6. main.tsx — SettingsProvider가 AuthProvider 외부에서 감싸는 구조 확인

## 결정사항

| 결정 | 이유 |
|------|------|
| SettingsProvider를 AuthProvider 외부에 배치 | 다크모드가 로그인 페이지 등 인증 전 화면에서도 동작해야 함 |
| localStorage 키 `app:` 접두사 | AuthContext의 기존 패턴과 일관성 유지 |
| `.katex font-size !important` | katex.min.css가 .katex에 1.21em 고정 설정 — 오버라이드 필수 |
| FOUC 방지 동기 스크립트 | React 마운트 전 실행으로 화면 깜빡임 없이 다크모드/글꼴 크기 즉시 적용 |

## 일탈 사항

없음 — 계획대로 정확히 실행됨

## Self-Check

- [x] `apps/web/src/contexts/SettingsContext.tsx` — 존재
- [x] `apps/web/index.html` — 동기 스크립트 포함
- [x] `apps/web/src/index.css` — KaTeX CSS 규칙 포함
- [x] `apps/web/src/components/ui/slider.tsx` — 존재
- [x] `apps/web/src/components/ui/switch.tsx` — 존재
- [x] `apps/web/src/components/ui/dialog.tsx` — 존재
- [x] `apps/web/src/main.tsx` — SettingsProvider 통합
- [x] 커밋 b4d2a2c — 존재
- [x] 커밋 877f85e — 존재

## Self-Check: PASSED
