# Phase 6: PWA 오프라인 지원 - Research

**Researched:** 2026-02-20
**Domain:** Progressive Web App (PWA) — vite-plugin-pwa + Workbox + Web App Manifest
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UIUX-03 | PWA로 설치하여 앱처럼 사용할 수 있다 (홈 화면 추가) | vite-plugin-pwa의 manifest 구성으로 installability 달성; generateSW 전략으로 앱 셸 전체를 precache하여 오프라인 작동 보장 |
</phase_requirements>

---

## Summary

Phase 6는 단일 요구사항 UIUX-03을 구현한다: PWA 설치 가능성과 오프라인 동작. 현재 아키텍처는 **POC — Dexie.js IndexedDB + 백엔드 없음, Vercel 프론트엔드 전용** 배포다. 데이터가 이미 IndexedDB에 있으므로 오프라인 동작은 앱 셸(HTML/JS/CSS 에셋)을 service worker로 precache하면 자동으로 된다. "온라인 복귀 시 동기화"는 POC에서 N/A다.

구현 범위는 정확히 세 가지다: (1) `vite-plugin-pwa` 설치 + `vite.config.ts` 수정, (2) `public/` 폴더에 PWA 아이콘 2종(192×192, 512×512) 추가, (3) `index.html`에 `<meta theme-color>` + `apple-touch-icon` 태그 추가. 추가로 `<PWAInstallBanner>` 컴포넌트를 만들어 브라우저의 `beforeinstallprompt` 이벤트를 포착하고 설치 유도 배너를 제공한다.

**Primary recommendation:** `vite-plugin-pwa` v1.2.0 (최신), `generateSW` 전략, `registerType: 'autoUpdate'`, `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']`. TypeScript `tsconfig.app.json`에 `"WebWorker"` lib 항목 추가 불필요 (`generateSW` 전략이면 서비스워커 코드를 직접 작성하지 않아도 됨).

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite-plugin-pwa | ^1.2.0 | Vite용 PWA 플러그인 — manifest 생성, SW 생성, 자산 precache | Vite 공식 ecosystem, zero-config React 지원, Context7 HIGH confidence |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| workbox (번들 포함) | ^7.x (vite-plugin-pwa 내장) | Service Worker precaching/caching 전략 | vite-plugin-pwa가 자동 관리; 별도 설치 불필요 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| generateSW (자동) | injectManifest (커스텀 SW) | POC에선 커스텀 SW 불필요; generateSW가 더 단순 |
| autoUpdate | promptForUpdate | 교육 앱에서 조용한 자동 업데이트가 UX 단순화 |

**Installation:**

```bash
pnpm add -D vite-plugin-pwa --filter web
```

---

## Architecture Patterns

### Recommended Project Structure

```
apps/web/
├── public/
│   ├── pwa-192x192.png      # PWA 아이콘 (기존 vite.svg 대체 혹은 추가)
│   ├── pwa-512x512.png      # PWA 아이콘 (마스크어블)
│   └── apple-touch-icon.png # iOS 홈 화면 아이콘
├── src/
│   ├── components/
│   │   └── pwa/
│   │       └── PWAInstallBanner.tsx  # beforeinstallprompt 포착 + 설치 배너
│   └── main.tsx             # 변경 없음 (vite-plugin-pwa가 SW 자동 등록)
├── index.html               # theme-color, apple-touch-icon 메타 태그 추가
└── vite.config.ts           # VitePWA() 플러그인 추가
```

### Pattern 1: generateSW 전략 — vite.config.ts

**What:** `VitePWA()` 플러그인이 빌드 시 service worker를 자동 생성하고 앱 에셋을 precache한다.
**When to use:** 커스텀 SW 로직이 불필요한 POC/단순 앱 — 이 프로젝트에 딱 맞음

```typescript
// Source: https://vite-pwa-org.netlify.app/guide
// apps/web/vite.config.ts
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png'],
      manifest: {
        name: '수학 기출 학습 도우미',
        short_name: '수학도우미',
        description: '수학 기출 문제 학습 및 AI 취약 유형 분석',
        theme_color: '#2563eb',   // 기출탭탭 스타일 — 파란색 계열
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,  // dev에서는 비활성화 (HMR 충돌 방지)
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Pattern 2: React `useRegisterSW` 훅 — 오프라인 알림 배너

**What:** `virtual:pwa-register/react`에서 제공하는 훅으로 오프라인 준비 상태와 업데이트 필요 상태를 관리한다.

```typescript
// Source: https://github.com/vite-pwa/vite-plugin-pwa/blob/main/docs/frameworks/react.md
import { useRegisterSW } from 'virtual:pwa-register/react'

function PWAInstallBanner() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW 등록됨:', r)
    },
    onRegisterError(error) {
      console.error('SW 등록 오류:', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 ...">
      {offlineReady
        ? <span>오프라인에서도 사용 가능합니다</span>
        : <span>새 버전이 있습니다. 업데이트하시겠습니까?</span>}
      {needRefresh && (
        <button onClick={() => updateServiceWorker(true)}>업데이트</button>
      )}
      <button onClick={close}>닫기</button>
    </div>
  )
}
```

### Pattern 3: PWA Install Prompt — `beforeinstallprompt` 이벤트

**What:** 브라우저의 PWA 설치 프롬프트를 가로채서 커스텀 배너로 설치를 유도한다.

```typescript
// 크롬/엣지 등 지원 브라우저에서 beforeinstallprompt 이벤트가 발생
// iOS Safari는 이 이벤트 미지원 → 안내 텍스트("공유 → 홈 화면에 추가") 대신 표시

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

useEffect(() => {
  const handler = (e: Event) => {
    e.preventDefault()
    setInstallPrompt(e as BeforeInstallPromptEvent)
  }
  window.addEventListener('beforeinstallprompt', handler)
  return () => window.removeEventListener('beforeinstallprompt', handler)
}, [])
```

### Pattern 4: index.html 메타 태그 업데이트

```html
<!-- apps/web/index.html -->
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="/pwa-192x192.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#2563eb" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="수학도우미" />
  <title>수학 기출 학습 도우미</title>
</head>
```

### Anti-Patterns to Avoid

- **`devOptions.enabled: true` 켜두기:** HMR과 service worker 캐시가 충돌하여 개발 중 이상한 캐시 문제 발생. 프로덕션 빌드로만 테스트.
- **`navigateFallback` 없이 SPA 배포:** React Router가 클라이언트 라우팅을 담당하는 SPA에서 navigateFallback 없으면 새로고침 시 오프라인에서 404 발생.
- **아이콘 생성 수동으로만:** 192×192 / 512×512 두 사이즈가 최소 요건. 마스크어블(maskable) 목적의 512×512가 없으면 Android에서 PWA 설치 조건 미충족.
- **`autoUpdate` + 즉시 skipWaiting 없이:** `registerType: 'autoUpdate'`를 쓰면 플러그인이 자동으로 `workbox.skipWaiting: true`와 `workbox.clientsClaim: true`를 강제 설정하므로 수동 설정 불필요.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service Worker 생성 | 직접 sw.js 작성 | vite-plugin-pwa generateSW | Workbox 내장, precache manifest 자동 주입, cache versioning 처리 |
| Manifest 생성 | public/manifest.json 수동 작성 | vite-plugin-pwa manifest 옵션 | 빌드 시 자동 생성 + 앱에 link 태그 자동 삽입 |
| SW 등록 코드 | `navigator.serviceWorker.register()` 직접 | `registerType: 'autoUpdate'` | 플러그인이 자동 삽입, 업데이트 lifecycle 처리 |
| 아이콘 파일 생성 | Canvas API / sharp 직접 | @vite-pwa/assets-generator (선택) | 단순 PNG 2개 제공으로도 충분 (POC 수준) |

**Key insight:** POC에서는 `generateSW` 전략이 99%를 자동 처리한다. 커스텀 서비스워커 코드를 쓸 필요가 없다.

---

## Common Pitfalls

### Pitfall 1: SPA Navigate Fallback 누락

**What goes wrong:** 오프라인 상태에서 `/student/analytics` 같은 딥 링크를 새로고침하면 네트워크 요청이 실패하고 빈 화면이 뜸
**Why it happens:** Service worker가 HTML만 precache하고 클라이언트 라우팅을 모름
**How to avoid:** `workbox.navigateFallback: 'index.html'` 설정 필수
**Warning signs:** 빌드 후 오프라인 테스트 시 `/` 는 되지만 다른 경로에서 새로고침 실패

### Pitfall 2: iOS Safari PWA 설치 방법 차이

**What goes wrong:** `beforeinstallprompt` 이벤트가 iOS에서 발생하지 않아 설치 배너가 뜨지 않음
**Why it happens:** iOS Safari는 PWA 설치를 "공유 → 홈 화면에 추가"로만 지원
**How to avoid:** iOS 감지 후 다른 안내 메시지 표시 (`/iPhone|iPad|iPod/.test(navigator.userAgent)`)
**Warning signs:** 안드로이드에선 설치 프롬프트가 뜨는데 iOS에선 아무것도 없음

### Pitfall 3: vite-plugin-pwa + Vite 7 호환성

**What goes wrong:** vite-plugin-pwa 구버전이 Vite 7과 충돌
**Why it happens:** Vite 7이 2025년 출시, 플러그인 API 변경
**How to avoid:** vite-plugin-pwa v1.x.x 사용 (v1.2.0이 최신, Vite 7 지원 확인됨)
**Warning signs:** `npm show vite-plugin-pwa version` → 1.2.0 확인

### Pitfall 4: 개발 중 SW 캐시 오염

**What goes wrong:** `devOptions.enabled: true` 상태에서 개발하면 HMR 변경이 캐시에 걸려 반영이 안 됨
**Why it happens:** SW가 오래된 에셋을 캐시에서 서빙
**How to avoid:** 개발 중 `devOptions.enabled: false` (기본값), Chrome DevTools → Application → Service Workers → "Update on reload" 체크
**Warning signs:** 코드 수정 후 저장해도 브라우저에 반영이 안 됨

### Pitfall 5: 아이콘 파일 빠진 빌드

**What goes wrong:** `includeAssets`에 명시한 아이콘 파일이 `public/` 폴더에 없으면 빌드 경고 발생, 설치 조건 미충족
**Why it happens:** manifest.json에 아이콘 경로가 명시되어 있는데 파일이 없음
**How to avoid:** `public/pwa-192x192.png`, `public/pwa-512x512.png` 두 파일 반드시 생성 먼저
**Warning signs:** Chrome PWA 설치 버튼이 비활성화 상태, Lighthouse PWA audit 실패

### Pitfall 6: Vercel SPA Routing 설정 누락

**What goes wrong:** Vercel 배포 후 `/student/analytics` 직접 접근 시 404 에러
**Why it happens:** Vercel이 SPA 라우팅을 모르고 실제 파일을 찾으려 함
**How to avoid:** `apps/web/public/` 또는 루트에 `vercel.json` 추가:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Code Examples

### 완전한 vite.config.ts

```typescript
// Source: Context7 /vite-pwa/vite-plugin-pwa + /websites/vite-pwa-org_netlify_app
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png'],
      manifest: {
        name: '수학 기출 학습 도우미',
        short_name: '수학도우미',
        description: '수학 기출 문제 학습 및 AI 취약 유형 분석',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'ko',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### PWAInstallBanner 컴포넌트 (TypeScript)

```tsx
// Source: Context7 /vite-pwa/vite-plugin-pwa (frameworks/react.md)
// apps/web/src/components/pwa/PWAInstallBanner.tsx
import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW 등록됨:', r)
    },
    onRegisterError(error) {
      console.error('SW 등록 오류:', error)
    },
  })

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
  }

  const handleClose = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
    setDismissed(true)
  }

  if (dismissed) return null

  // 업데이트 배너
  if (needRefresh) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 rounded-lg bg-primary p-3 text-primary-foreground shadow-lg">
        <p className="text-sm">새 버전이 있습니다.</p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => updateServiceWorker(true)}>업데이트</Button>
          <Button size="sm" variant="ghost" onClick={handleClose}>닫기</Button>
        </div>
      </div>
    )
  }

  // 오프라인 준비 배너
  if (offlineReady) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 rounded-lg bg-green-600 p-3 text-white shadow-lg">
        <p className="text-sm">오프라인에서도 사용 가능합니다.</p>
        <Button size="sm" variant="ghost" className="mt-2 text-white" onClick={handleClose}>닫기</Button>
      </div>
    )
  }

  // PWA 설치 유도 배너 (Android/Chrome)
  if (installPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 rounded-lg bg-primary p-3 text-primary-foreground shadow-lg">
        <p className="text-sm font-medium">홈 화면에 추가하기</p>
        <p className="text-xs opacity-80">앱처럼 빠르게 접근하세요</p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleInstall}>설치</Button>
          <Button size="sm" variant="ghost" onClick={() => setInstallPrompt(null)}>나중에</Button>
        </div>
      </div>
    )
  }

  return null
}
```

### main.tsx에서 PWAInstallBanner 마운트

```tsx
// main.tsx의 createRoot().render() 안에 PWAInstallBanner 추가
// 위치: <AuthProvider> 바로 안쪽, <BrowserRouter> 하위

import { PWAInstallBanner } from './components/pwa/PWAInstallBanner'

// ... (기존 JSX 구조에 추가)
<AuthProvider>
  <PWAInstallBanner />
  <BrowserRouter>
    ...
  </BrowserRouter>
</AuthProvider>
```

### vercel.json (SPA 라우팅 지원)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    }
  ]
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 수동 service worker 작성 | vite-plugin-pwa + generateSW | 2022~현재 | 거의 zero-config로 PWA 구현 가능 |
| `public/manifest.json` 수동 관리 | `manifest` 옵션으로 플러그인이 생성 | vite-plugin-pwa v0.x | 빌드 파이프라인에 통합, 일관성 보장 |
| `workbox-webpack-plugin` | `vite-plugin-pwa` + Workbox | Vite 생태계 성숙 | Vite 7 네이티브 지원 |

**현재 최신:**
- vite-plugin-pwa: **1.2.0** (2025년 Vite 7 지원)
- Workbox: 내장 **7.x**
- React virtual module: `virtual:pwa-register/react` (`useRegisterSW` 훅)

---

## Open Questions

1. **아이콘 이미지 소스**
   - What we know: 192×192, 512×512 PNG 두 파일 필요. `apple-touch-icon.png`은 180×180 권장.
   - What's unclear: 실제 디자인 에셋이 없음 — 플레이스홀더 제작 필요
   - Recommendation: 플레이스홀더 PNG를 스크립트 또는 온라인 툴(favicon.io)로 생성하거나, 파란색 배경에 "수" 텍스트 SVG를 PNG로 변환. PLAN 구현자가 직접 생성.

2. **Vercel 배포 루트 위치**
   - What we know: 모노레포에서 `apps/web`이 프론트엔드 루트
   - What's unclear: `vercel.json`을 `apps/web/` 안에 넣어야 하는지 vs 모노레포 루트
   - Recommendation: `apps/web/public/vercel.json` 또는 Vercel 대시보드 설정에서 Root Directory를 `apps/web`으로 설정하면 루트에 위치. 플레이스먼트는 실행 시 확인.

3. **PWA 검증 도구**
   - What we know: Chrome DevTools → Lighthouse → PWA 탭이 표준 검증 도구
   - What's unclear: `pnpm run build && pnpm run preview`로 로컬 검증 필요
   - Recommendation: 검증 플랜(06-03)에서 `vite preview`로 로컬 HTTPS-like 환경에서 테스트 포함

---

## Sources

### Primary (HIGH confidence)

- Context7 `/vite-pwa/vite-plugin-pwa` — React PWA setup, generateSW, useRegisterSW, manifest 구성
- Context7 `/websites/vite-pwa-org_netlify_app` — Vercel 배포 Cache-Control 헤더, navigateFallback, Workbox globPatterns
- `npm show vite-plugin-pwa version` → 1.2.0 (현재 최신 버전 직접 확인)

### Secondary (MEDIUM confidence)

- 프로젝트 `apps/web/vite.config.ts` 직접 분석 — 현재 플러그인 구성 파악
- 프로젝트 `apps/web/package.json` 직접 분석 — Vite 7.x, React 19.x 버전 확인
- 프로젝트 `apps/web/tsconfig.app.json` 직접 분석 — `lib: ["ES2022", "DOM", "DOM.Iterable"]` 확인

### Tertiary (LOW confidence)

- 없음

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Context7 + npm 버전 직접 확인
- Architecture: HIGH — Context7 공식 예제 코드 기반
- Pitfalls: HIGH — Context7 공식 docs + 프로젝트 실제 스택 분석

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (vite-plugin-pwa가 안정 라이브러리, 30일 유효)
