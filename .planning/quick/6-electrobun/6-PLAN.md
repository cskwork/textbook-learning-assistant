---
quick: 6
title: "Electrobun 데스크톱 앱 다운로드 버튼 + 앱 래퍼 설정"
type: execute
autonomous: true
files_modified:
  - apps/web/src/lib/platform.ts
  - apps/web/src/components/desktop/DesktopDownloadDialog.tsx
  - apps/web/src/components/layout/Sidebar.tsx
  - apps/desktop/package.json
  - apps/desktop/electrobun.config.ts
  - apps/desktop/src/main.ts
  - apps/desktop/src/preload.ts
  - apps/desktop/tsconfig.json
---

<objective>
사이드바 하단(로그아웃 위)에 "데스크톱 앱 설치" 버튼을 추가하고, Electrobun 기반 데스크톱 앱 래퍼 프로젝트를 `apps/desktop/`에 구성한다.

Purpose: 데스크톱 사용자에게 네이티브 앱 경험 제공을 위한 다운로드 진입점 + 앱 빌드 기반 마련
Output: 사이드바에 다운로드 다이얼로그 연결 버튼 + apps/desktop/ Electrobun 프로젝트 스켈레톤
</objective>

<context>
@apps/web/src/components/layout/Sidebar.tsx
@apps/web/src/components/layout/AppShell.tsx
@apps/web/src/components/pwa/PWAInstallBanner.tsx
@apps/web/src/components/ui/dialog.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: OS 감지 유틸 + 데스크톱 다운로드 다이얼로그 + 사이드바 버튼 통합</name>
  <files>
    apps/web/src/lib/platform.ts
    apps/web/src/components/desktop/DesktopDownloadDialog.tsx
    apps/web/src/components/layout/Sidebar.tsx
  </files>
  <action>
1. **`apps/web/src/lib/platform.ts`** 생성 — OS 감지 유틸리티:
   - `detectOS()` 함수: navigator.userAgent/navigator.platform 기반으로 'macos' | 'windows' | 'linux' | 'unknown' 반환
   - `getDownloadUrl(os: string)` 함수: GitHub Releases URL 패턴으로 다운로드 링크 생성
   - 다운로드 URL 베이스는 상수로 분리: `DESKTOP_DOWNLOAD_BASE_URL` (예: `https://github.com/OWNER/REPO/releases/latest/download/`)
   - macOS: `기출학습도우미-macos-arm64.dmg`, Windows: `기출학습도우미-windows-x64.exe` 패턴
   - `isDesktopApp()` 함수: 현재 환경이 Electrobun 데스크톱 앱인지 감지 (navigator.userAgent에 'Electrobun' 포함 여부)
   - 데스크톱 앱 내부에서는 다운로드 버튼을 숨기기 위해 사용

2. **`apps/web/src/components/desktop/DesktopDownloadDialog.tsx`** 생성 — 다운로드 다이얼로그:
   - shadcn Dialog 컴포넌트 사용 (이미 설치됨)
   - Props: `open: boolean`, `onOpenChange: (open: boolean) => void`
   - 다이얼로그 내용:
     - 제목: "데스크톱 앱 설치"
     - 설명: "더 빠르고 안정적인 데스크톱 앱을 설치하세요"
     - OS 자동 감지하여 추천 다운로드 버튼 강조 표시
     - macOS 다운로드 버튼 (Apple 아이콘 또는 Monitor): "macOS 다운로드 (.dmg)"
     - Windows 다운로드 버튼: "Windows 다운로드 (.exe)"
     - 추천 OS 버튼은 primary variant, 다른 OS는 outline variant
     - 하단에 "현재 감지된 OS: {os}" 텍스트 (text-muted-foreground text-xs)
   - lucide-react 아이콘 사용: Monitor (macOS), Monitor (Windows) — 또는 Download 아이콘
   - 각 버튼 클릭 시 `window.open(downloadUrl, '_blank')` 로 새 탭 열기

3. **`apps/web/src/components/layout/Sidebar.tsx`** 수정 — 다운로드 버튼 추가:
   - 로그아웃 섹션(`<div className="px-3 py-4 border-t border-border/40">`) 위에 "데스크톱 앱" 버튼 영역 추가
   - 새로운 border-t 섹션으로 분리: `<div className="px-3 py-2">`
   - 버튼 스타일: 기존 nav 링크와 동일한 `group flex items-center gap-3 px-3 py-2.5 rounded-xl` 패턴
   - 아이콘: lucide-react의 `Monitor` (w-[18px] h-[18px])
   - 텍스트: "데스크톱 앱 설치"
   - 색상: text-muted-foreground, hover 시 text-primary + bg-primary/8
   - 클릭 시 DesktopDownloadDialog open state 토글
   - `isDesktopApp()` true이면 버튼 자체를 렌더링하지 않음 (Electrobun 앱 내부에서는 숨김)
   - DesktopDownloadDialog를 Sidebar 내부에서 렌더링 (상태 관리: useState)
   - import 추가: `Monitor` from lucide-react, `useState` from react, `DesktopDownloadDialog`, `isDesktopApp` from platform.ts
  </action>
  <verify>
    - `pnpm web:build` 빌드 성공 확인
    - Sidebar.tsx에 Monitor 아이콘 + DesktopDownloadDialog import 확인
    - platform.ts에 detectOS, getDownloadUrl, isDesktopApp export 확인
  </verify>
  <done>
    - 데스크톱 사이드바 하단(로그아웃 위)에 "데스크톱 앱 설치" 버튼 표시
    - 버튼 클릭 시 OS 감지 기반 다운로드 다이얼로그 표시
    - macOS/Windows 다운로드 링크 제공 (GitHub Releases URL 패턴)
    - Electrobun 앱 내부에서는 버튼 숨김
  </done>
</task>

<task type="auto">
  <name>Task 2: Electrobun 데스크톱 앱 프로젝트 스켈레톤 구성</name>
  <files>
    apps/desktop/package.json
    apps/desktop/electrobun.config.ts
    apps/desktop/src/main.ts
    apps/desktop/src/preload.ts
    apps/desktop/tsconfig.json
  </files>
  <action>
1. **`apps/desktop/package.json`** 생성:
   ```json
   {
     "name": "desktop",
     "version": "0.1.0",
     "private": true,
     "description": "수학 기출 학습 도우미 — Electrobun 데스크톱 앱",
     "scripts": {
       "dev": "electrobun dev",
       "build": "electrobun build",
       "build:release": "electrobun build --release"
     },
     "dependencies": {
       "electrobun": "latest"
     }
   }
   ```

2. **`apps/desktop/electrobun.config.ts`** 생성 — Electrobun 설정:
   - appName: "수학기출학습도우미"
   - appId: "com.textbook-learning-assistant.desktop"
   - BrowserWindow 설정: 기본 크기 1280x800, 최소 크기 800x600
   - URL 로딩 전략:
     - 개발 모드: `http://localhost:5173` (Vite dev server)
     - 프로덕션 모드: 배포 URL (예: `https://your-app.vercel.app`) 또는 로컬 빌드 파일 로드
   - User-Agent에 'Electrobun' 문자열 포함 설정 (isDesktopApp 감지용)

3. **`apps/desktop/src/main.ts`** 생성 — 메인 프로세스:
   - BrowserWindow 생성
   - 개발 모드: `http://localhost:5173` 로드
   - 프로덕션: 환경 변수 또는 config에서 URL 읽기
   - 윈도우 제목: "수학 기출 학습 도우미"
   - macOS: titleBarStyle 'hiddenInset' (트래픽 라이트 통합)

4. **`apps/desktop/src/preload.ts`** 생성 — 프리로드 스크립트:
   - 최소 구성 (빈 preload — 향후 네이티브 API 브릿지 추가 지점)
   - 주석으로 향후 확장 포인트 설명

5. **`apps/desktop/tsconfig.json`** 생성:
   - target: ESNext, module: ESNext, strict: true
   - Bun 타입 호환 설정

6. **루트 `pnpm-workspace.yaml`은 이미 `apps/*` 패턴** — apps/desktop 자동 인식됨

참고: Electrobun은 Bun 런타임 필요. 실제 빌드/실행은 Bun 설치 후 가능.
이 태스크는 프로젝트 스켈레톤만 생성하며 실제 빌드 테스트는 하지 않음.
(Electrobun은 아직 초기 단계 프레임워크로, API가 변경될 수 있음)
  </action>
  <verify>
    - apps/desktop/ 디렉토리에 package.json, electrobun.config.ts, src/main.ts, src/preload.ts, tsconfig.json 존재 확인
    - package.json에 electrobun 의존성 포함 확인
    - main.ts에 BrowserWindow 생성 + URL 로드 코드 확인
    - pnpm-workspace.yaml의 apps/* 패턴이 desktop 포함하는지 확인
  </verify>
  <done>
    - apps/desktop/ 디렉토리에 Electrobun 프로젝트 스켈레톤 구성 완료
    - main.ts가 Vite dev server URL 또는 프로덕션 URL을 BrowserWindow로 로드
    - Bun 설치 후 `bun dev`로 데스크톱 앱 실행 가능한 구조
  </done>
</task>

</tasks>

<verification>
- `pnpm web:build` 성공 (Task 1 — 프론트엔드 빌드 깨지지 않음)
- Sidebar 하단에 "데스크톱 앱 설치" 버튼 렌더링 확인
- 버튼 클릭 시 다이얼로그에 macOS/Windows 다운로드 링크 표시
- apps/desktop/ 스켈레톤 파일 존재 확인
</verification>

<success_criteria>
1. 데스크톱 사이드바(lg 이상)에서 로그아웃 버튼 위에 "데스크톱 앱 설치" 버튼 표시
2. 버튼 클릭 시 OS 감지 기반 다운로드 다이얼로그 표시 (macOS/Windows)
3. apps/desktop/에 Electrobun 프로젝트 스켈레톤 존재
4. pnpm web:build 성공
</success_criteria>

<output>
완료 후 `.planning/quick/6-electrobun/6-SUMMARY.md` 생성
</output>
