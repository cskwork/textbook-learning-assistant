/**
 * Electrobun 메인 프로세스
 *
 * BrowserWindow를 생성하고 웹 앱 URL을 로드한다.
 * - 개발 모드: http://localhost:5173 (Vite dev server)
 * - 프로덕션: 환경 변수 APP_URL 또는 기본 배포 URL
 */
import { BrowserWindow } from 'electrobun'

const isDev = process.env.NODE_ENV !== 'production'
const APP_URL = isDev
  ? 'http://localhost:5173'
  : (process.env.APP_URL ?? 'https://your-app.vercel.app')

async function main() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: '수학 기출 학습 도우미',
    /**
     * macOS 트래픽 라이트(신호등 버튼)를 타이틀바에 통합
     * Windows/Linux에서는 무시됨
     */
    titleBarStyle: 'hiddenInset',
  })

  await win.loadURL(APP_URL)
}

main().catch(console.error)
