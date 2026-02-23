/**
 * Electrobun 메인 프로세스 (Bun 사이드)
 *
 * BrowserWindow를 생성하고 웹 앱 URL을 로드한다.
 * - 개발 모드: APP_DEV_URL 또는 http://localhost:5173
 * - 프로덕션: APP_URL
 * URL 접근 실패 시 빈 화면 대신 원인 안내 화면을 렌더링한다.
 */
import { BrowserWindow, Utils } from "electrobun/bun"

const isDev = process.env.NODE_ENV !== 'production'
const APP_URL = isDev
  ? (process.env.APP_DEV_URL ?? 'http://localhost:5173')
  : (process.env.APP_URL ?? 'https://your-app.vercel.app')
const URL_CHECK_TIMEOUT_MS = 3000

function escapeHtml(raw: string): string {
  return raw
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildFallbackHtml(targetUrl: string, reason: string): string {
  const safeUrl = escapeHtml(targetUrl)
  const safeReason = escapeHtml(reason)
  const devGuide = isDev
    ? `<li><code>pnpm web:dev</code> 실행 후 앱을 다시 시작하세요.</li>`
    : `<li>배포 URL이 유효한지 확인하고 <code>APP_URL</code> 환경 변수를 설정하세요.</li>`

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>앱 로드 실패</title>
    <style>
      :root { color-scheme: light dark; }
      body {
        margin: 0;
        padding: 24px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #f7f8fb;
        color: #111827;
      }
      .card {
        max-width: 760px;
        margin: 40px auto;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        padding: 24px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.06);
      }
      h1 { margin: 0 0 12px; font-size: 20px; }
      p { margin: 10px 0; line-height: 1.55; }
      ul { margin: 8px 0 0 20px; line-height: 1.55; }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        background: #f3f4f6;
        border-radius: 6px;
        padding: 2px 6px;
      }
      .meta {
        margin-top: 16px;
        padding: 12px;
        border-radius: 10px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
      }
      button {
        margin-top: 16px;
        border: 0;
        border-radius: 10px;
        padding: 10px 14px;
        background: #1d4ed8;
        color: white;
        font-weight: 600;
        cursor: pointer;
      }
      button:hover { background: #1e40af; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>화면을 불러오지 못했습니다</h1>
      <p>데스크톱 앱이 웹 앱 URL에 접근하지 못해 빈 화면이 발생할 수 있습니다.</p>
      <ul>
        ${devGuide}
        <li>접속 대상 URL: <code>${safeUrl}</code></li>
      </ul>
      <div class="meta">
        <strong>오류 정보</strong>
        <p>${safeReason}</p>
      </div>
      <button onclick="location.reload()">다시 시도</button>
    </div>
  </body>
</html>`
}

async function isReachable(url: string): Promise<{ ok: boolean; reason?: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), URL_CHECK_TIMEOUT_MS)

  try {
    const head = await fetch(url, { method: 'HEAD', signal: controller.signal })
    if (head.ok) {
      return { ok: true }
    }

    // 일부 서버는 HEAD를 지원하지 않으므로 GET으로 한 번 더 확인
    if (head.status === 405 || head.status === 501) {
      const get = await fetch(url, { method: 'GET', signal: controller.signal })
      return get.ok
        ? { ok: true }
        : { ok: false, reason: `GET 요청 실패 (HTTP ${get.status})` }
    }

    return { ok: false, reason: `HEAD 요청 실패 (HTTP ${head.status})` }
  } catch (error) {
    const reason = error instanceof Error ? error.message : '알 수 없는 네트워크 오류'
    return { ok: false, reason }
  } finally {
    clearTimeout(timer)
  }
}

const mainWindow = new BrowserWindow({
  title: '수학 기출 학습 도우미',
  url: null,
  frame: {
    width: 1280,
    height: 800,
  },
  titleBarStyle: 'default',
})

async function bootstrapWindow() {
  const check = await isReachable(APP_URL)

  if (check.ok) {
    mainWindow.webview.loadURL(APP_URL)
    return
  }

  const reason = check.reason ?? '원인을 확인할 수 없습니다'
  mainWindow.webview.loadHTML(buildFallbackHtml(APP_URL, reason))
  console.error(`[desktop] APP_URL load failed: ${reason}`)
}

bootstrapWindow().catch((error) => {
  const reason = error instanceof Error ? error.message : '초기화 중 알 수 없는 오류'
  mainWindow.webview.loadHTML(buildFallbackHtml(APP_URL, reason))
  console.error('[desktop] bootstrap error:', error)
})

mainWindow.on('close', () => {
  Utils.quit()
})
