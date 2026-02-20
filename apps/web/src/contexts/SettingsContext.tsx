/**
 * 앱 전역 설정 컨텍스트
 *
 * 관리하는 상태:
 * - isDarkMode: 다크모드 활성화 여부 (localStorage: 'app:isDarkMode')
 * - katexFontSize: KaTeX 수식 글꼴 크기 배수 (localStorage: 'app:katexFontSize')
 *
 * 다크모드: document.documentElement.classList.toggle('dark') 패턴으로 Tailwind .dark 클래스 활성화
 * KaTeX 글꼴: CSS custom property --katex-font-size를 document root에 설정
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// localStorage 키 상수
const DARK_MODE_KEY = 'app:isDarkMode'
const KATEX_FONT_SIZE_KEY = 'app:katexFontSize'

// 기본값 상수
const DEFAULT_KATEX_FONT_SIZE = 1.0

interface SettingsContextValue {
  isDarkMode: boolean
  katexFontSize: number
  toggleDarkMode: (enabled: boolean) => void
  setKatexFontSize: (size: number) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [katexFontSize, setKatexFontSizeState] = useState(DEFAULT_KATEX_FONT_SIZE)

  // 초기화: localStorage에서 설정 읽어 state 및 DOM 동기화
  useEffect(() => {
    const savedDark = localStorage.getItem(DARK_MODE_KEY)
    const savedFontSize = localStorage.getItem(KATEX_FONT_SIZE_KEY)

    const dark = savedDark === 'true'
    const fontSize = savedFontSize ? parseFloat(savedFontSize) : DEFAULT_KATEX_FONT_SIZE

    setIsDarkMode(dark)
    setKatexFontSizeState(Number.isFinite(fontSize) ? fontSize : DEFAULT_KATEX_FONT_SIZE)

    // DOM 적용 (index.html 동기 스크립트와 일치 — React 마운트 시 최종 확정)
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.setProperty(
      '--katex-font-size',
      `${Number.isFinite(fontSize) ? fontSize : DEFAULT_KATEX_FONT_SIZE}em`,
    )
  }, [])

  /**
   * 다크모드 전환
   * @param enabled - true: 다크모드 활성화, false: 라이트모드
   */
  function toggleDarkMode(enabled: boolean) {
    setIsDarkMode(enabled)
    document.documentElement.classList.toggle('dark', enabled)
    localStorage.setItem(DARK_MODE_KEY, String(enabled))
  }

  /**
   * KaTeX 수식 글꼴 크기 변경
   * @param size - 글꼴 크기 배수 (예: 0.8, 1.0, 1.5)
   */
  function setKatexFontSize(size: number) {
    setKatexFontSizeState(size)
    document.documentElement.style.setProperty('--katex-font-size', `${size}em`)
    localStorage.setItem(KATEX_FONT_SIZE_KEY, String(size))
  }

  return (
    <SettingsContext.Provider value={{ isDarkMode, katexFontSize, toggleDarkMode, setKatexFontSize }}>
      {children}
    </SettingsContext.Provider>
  )
}

/**
 * 설정 컨텍스트 훅
 * SettingsProvider 외부에서 호출 시 에러 발생
 */
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings는 SettingsProvider 내부에서만 사용할 수 있습니다')
  }
  return context
}
