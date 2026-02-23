/**
 * FunMode (반전 모드) 전역 컨텍스트
 *
 * 관리하는 상태:
 * - isFunMode: 반전 모드 활성화 여부 (localStorage: 'app:funMode')
 *
 * 반전 모드: document.documentElement.setAttribute('data-fun-mode', ...) 패턴으로
 * [data-fun-mode="true"] CSS 선택자를 통해 게임 테마 CSS 변수 즉시 전환
 *
 * v3.0 반전 모드의 핵심 게이트 — 이 Context 없이는 Phase 16-20의 어떤 기능도 동작하지 않음
 */

import { createContext, useContext, useLayoutEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface FunModeContextValue {
  isFunMode: boolean
  toggleFunMode: () => void
}

const FunModeContext = createContext<FunModeContextValue | null>(null)

export function FunModeProvider({ children }: { children: ReactNode }) {
  const [isFunMode, setIsFunMode] = useState<boolean>(() => {
    return localStorage.getItem('app:funMode') === 'true'
  })

  // FOUC 방지 — 초기 마운트 시 DOM 속성 동기 적용
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-fun-mode', String(isFunMode))
  }, [])

  function toggleFunMode() {
    const next = !isFunMode
    setIsFunMode(next)
    localStorage.setItem('app:funMode', String(next))
    document.documentElement.setAttribute('data-fun-mode', String(next))
  }

  return (
    <FunModeContext.Provider value={{ isFunMode, toggleFunMode }}>
      {children}
    </FunModeContext.Provider>
  )
}

export function useFunMode(): FunModeContextValue {
  const ctx = useContext(FunModeContext)
  if (!ctx) throw new Error('useFunMode: FunModeProvider 외부에서 호출됨')
  return ctx
}
