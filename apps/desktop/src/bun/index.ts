/**
 * Electrobun 메인 프로세스 (Bun 사이드)
 *
 * BrowserWindow를 생성하고 배포된 웹 앱 URL을 로드한다.
 * macOS 트래픽 라이트 통합 타이틀바 적용.
 */
import { BrowserWindow, Utils } from "electrobun/bun"

const APP_URL = 'https://dist-blush-gamma-43.vercel.app'

const mainWindow = new BrowserWindow({
  title: '수학 기출 학습 도우미',
  url: APP_URL,
  frame: {
    width: 1280,
    height: 800,
  },
  titleBarStyle: 'hiddenInset',
})

mainWindow.on('close', () => {
  Utils.quit()
})
