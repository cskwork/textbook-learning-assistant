---
quick: 6
title: "Electrobun 데스크톱 앱 다운로드 버튼 + 앱 래퍼 설정"
subsystem: "desktop"
tags: [electrobun, desktop, sidebar, platform-detection, download]
key-files:
  created:
    - apps/web/src/lib/platform.ts
    - apps/web/src/components/desktop/DesktopDownloadDialog.tsx
    - apps/desktop/package.json
    - apps/desktop/electrobun.config.ts
    - apps/desktop/src/main.ts
    - apps/desktop/src/preload.ts
    - apps/desktop/tsconfig.json
  modified:
    - apps/web/src/components/layout/Sidebar.tsx
decisions:
  - "DESKTOP_DOWNLOAD_BASE_URL 상수로 GitHub Releases URL 베이스 분리 — 향후 실제 레포 주소로 교체 용이"
  - "isDesktopApp() User-Agent 기반 감지 — Electrobun이 UA에 'Electrobun' 문자열 포함하도록 config에 userAgent 설정"
  - "Linux AppImage 다운로드 URL도 추가 — macOS/Windows 외 Linux 지원 준비 (다이얼로그에는 macOS/Windows만 표시)"
  - "apps/desktop/tsconfig.json: moduleResolution bundler + bun-types — Electrobun은 Bun 런타임 기반"
metrics:
  duration: 133s
  completed: 2026-02-21
  tasks: 2
  files: 8
---

# Quick Task 6: Electrobun 데스크톱 앱 다운로드 버튼 + 앱 래퍼 설정 요약

**한 줄 요약:** 사이드바 하단에 OS 자동 감지 기반 "데스크톱 앱 설치" 버튼 + shadcn Dialog 다운로드 다이얼로그 + apps/desktop/ Electrobun 프로젝트 스켈레톤 구성

## 완료된 작업

### Task 1: OS 감지 유틸 + 데스크톱 다운로드 다이얼로그 + 사이드바 버튼 통합

- **커밋:** a01ad40
- **생성/수정:** `platform.ts`, `DesktopDownloadDialog.tsx`, `Sidebar.tsx`

**platform.ts 주요 내용:**
- `detectOS()`: navigator.userAgentData?.platform → navigator.platform → navigator.userAgent 순 폴백으로 'macos' | 'windows' | 'linux' | 'unknown' 반환
- `getDownloadUrl(os)`: GitHub Releases URL 패턴 기반 다운로드 링크 생성 (macOS .dmg, Windows .exe, Linux .AppImage)
- `isDesktopApp()`: navigator.userAgent에 'Electrobun' 포함 여부로 데스크톱 앱 환경 감지
- `DESKTOP_DOWNLOAD_BASE_URL` 상수: 실제 레포 주소로 교체 가능

**DesktopDownloadDialog 주요 내용:**
- shadcn Dialog + Button 컴포넌트 활용
- OS 자동 감지 후 해당 OS 버튼에 `추천` 뱃지 + `default` variant 강조
- macOS (.dmg) / Windows (.exe) 다운로드 버튼
- 현재 감지된 OS 표시 (text-muted-foreground text-xs)
- `window.open(url, '_blank', 'noopener,noreferrer')` 새 탭 열기

**Sidebar 변경사항:**
- `isDesktopApp()` true이면 버튼 전체 숨김
- 로그아웃 섹션 위에 border-t로 분리된 "데스크톱 앱 설치" 버튼 추가
- Monitor 아이콘 (lucide-react), hover 시 text-primary + bg-primary/8
- `useState`로 다이얼로그 open state 관리, Sidebar 내부에서 `DesktopDownloadDialog` 렌더링

### Task 2: Electrobun 데스크톱 앱 프로젝트 스켈레톤 구성

- **커밋:** ff9b080
- **생성:** `apps/desktop/` 전체 스켈레톤 (5개 파일)

**package.json:** electrobun 최신 버전 의존성, dev/build/build:release 스크립트

**electrobun.config.ts 주요 내용:**
- appName: "수학기출학습도우미", appId: "com.textbook-learning-assistant.desktop"
- 창 크기: 기본 1280x800, 최소 800x600
- 개발 모드: `http://localhost:5173`, 프로덕션: APP_URL 환경변수 또는 기본 Vercel URL
- userAgent에 'Electrobun/0.1.0' 포함 설정 (isDesktopApp() 감지 연동)

**src/main.ts 주요 내용:**
- BrowserWindow 생성 + loadURL(APP_URL) 호출
- macOS hiddenInset titleBarStyle (트래픽 라이트 통합)
- NODE_ENV=production 기반 개발/프로덕션 URL 분기

**src/preload.ts:** 최소 구성 + 향후 네이티브 API 브릿지 확장 포인트 주석

**tsconfig.json:** ESNext target/module, moduleResolution bundler, strict true, bun-types

**pnpm-workspace.yaml:** 기존 `apps/*` 패턴으로 apps/desktop 자동 인식

## 검증 결과

| 항목 | 결과 |
|------|------|
| `pnpm web:build` 성공 | PASS |
| Sidebar에 Monitor + DesktopDownloadDialog + isDesktopApp import | PASS |
| platform.ts에 detectOS/getDownloadUrl/isDesktopApp export | PASS |
| apps/desktop/ 5개 파일 존재 | PASS |
| pnpm-workspace.yaml apps/* 패턴 | PASS |

## 성공 기준 충족 여부

1. 데스크톱 사이드바(lg 이상)에서 로그아웃 버튼 위에 "데스크톱 앱 설치" 버튼 표시 — DONE
2. 버튼 클릭 시 OS 감지 기반 다운로드 다이얼로그 표시 (macOS/Windows) — DONE
3. apps/desktop/에 Electrobun 프로젝트 스켈레톤 존재 — DONE
4. pnpm web:build 성공 — DONE

## 편차 사항

없음 — 계획대로 정확히 실행됨.

## Self-Check: PASSED

- `apps/web/src/lib/platform.ts` — FOUND
- `apps/web/src/components/desktop/DesktopDownloadDialog.tsx` — FOUND
- `apps/web/src/components/layout/Sidebar.tsx` — FOUND (수정)
- `apps/desktop/package.json` — FOUND
- `apps/desktop/electrobun.config.ts` — FOUND
- `apps/desktop/src/main.ts` — FOUND
- `apps/desktop/src/preload.ts` — FOUND
- `apps/desktop/tsconfig.json` — FOUND
- 커밋 a01ad40 — FOUND
- 커밋 ff9b080 — FOUND
