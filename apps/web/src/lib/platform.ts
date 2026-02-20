/**
 * 플랫폼 감지 유틸리티
 * - OS 감지 (macOS / Windows / Linux / unknown)
 * - GitHub Releases 기반 데스크톱 다운로드 URL 생성
 * - Electrobun 데스크톱 앱 환경 감지
 */

/** GitHub Releases 다운로드 베이스 URL (실제 배포 시 OWNER/REPO 교체) */
export const DESKTOP_DOWNLOAD_BASE_URL =
  'https://github.com/OWNER/REPO/releases/latest/download/'

export type DesktopOS = 'macos' | 'windows' | 'linux' | 'unknown'

/**
 * 현재 브라우저의 OS를 감지한다.
 * navigator.userAgent / navigator.platform 기반으로 판별.
 */
export function detectOS(): DesktopOS {
  if (typeof navigator === 'undefined') return 'unknown'

  const ua = navigator.userAgent
  const platform =
    (navigator as { userAgentData?: { platform?: string } }).userAgentData
      ?.platform ?? navigator.platform ?? ''

  if (/Mac|iPhone|iPad/i.test(platform) || /Macintosh/i.test(ua)) {
    return 'macos'
  }
  if (/Win/i.test(platform) || /Windows/i.test(ua)) {
    return 'windows'
  }
  if (/Linux/i.test(platform) || /Linux/i.test(ua)) {
    return 'linux'
  }
  return 'unknown'
}

/**
 * OS에 따른 데스크톱 앱 다운로드 URL을 반환한다.
 * GitHub Releases URL 패턴 기반.
 */
export function getDownloadUrl(os: DesktopOS): string | null {
  switch (os) {
    case 'macos':
      return `${DESKTOP_DOWNLOAD_BASE_URL}기출학습도우미-macos-arm64.dmg`
    case 'windows':
      return `${DESKTOP_DOWNLOAD_BASE_URL}기출학습도우미-windows-x64.exe`
    case 'linux':
      return `${DESKTOP_DOWNLOAD_BASE_URL}기출학습도우미-linux-x64.AppImage`
    default:
      return null
  }
}

/**
 * 현재 환경이 Electrobun 데스크톱 앱 내부인지 감지한다.
 * Electrobun은 User-Agent에 'Electrobun' 문자열을 포함한다.
 */
export function isDesktopApp(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.userAgent.includes('Electrobun')
}
