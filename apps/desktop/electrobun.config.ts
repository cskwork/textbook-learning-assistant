/**
 * Electrobun 데스크톱 앱 설정
 *
 * 개발 모드: Vite 개발 서버(http://localhost:5173) 로드
 * 프로덕션: 배포 URL 또는 빌드된 정적 파일 로드
 */

const isDev = process.env.NODE_ENV !== 'production'

/** 프로덕션 배포 URL (Vercel 등 실제 배포 주소로 교체) */
const PRODUCTION_URL = process.env.APP_URL ?? 'https://your-app.vercel.app'

const config = {
  appName: '수학기출학습도우미',
  appId: 'com.textbook-learning-assistant.desktop',

  window: {
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: '수학 기출 학습 도우미',
    /** macOS 트래픽 라이트 통합 타이틀바 */
    titleBarStyle: 'hiddenInset' as const,
  },

  /** 로드할 URL: 개발 모드에서는 Vite dev server, 프로덕션에서는 배포 URL */
  url: isDev ? 'http://localhost:5173' : PRODUCTION_URL,

  /**
   * User-Agent에 'Electrobun' 문자열 포함 설정
   * → isDesktopApp() 감지용 (platform.ts 참고)
   */
  userAgent: `Electrobun/0.1.0`,
}

export default config
