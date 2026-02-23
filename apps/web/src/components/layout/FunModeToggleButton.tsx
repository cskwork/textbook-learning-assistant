/**
 * 반전 모드 토글 버튼
 *
 * 클릭 한 번으로 일반 모드 ↔ 반전(게임) 모드 전환
 * FunModeProvider 내부에서만 사용 가능
 */

import { useFunMode } from '@/contexts/FunModeContext'
import { Button } from '@/components/ui/button'

export function FunModeToggleButton() {
  const { isFunMode, toggleFunMode } = useFunMode()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFunMode}
      title={isFunMode ? '일반 모드로 전환' : '반전 모드로 전환'}
      aria-label={isFunMode ? '일반 모드로 전환' : '반전 모드로 전환'}
      className={isFunMode ? 'text-primary animate-pulse' : 'text-muted-foreground'}
    >
      {isFunMode ? '🎮' : '🎯'}
    </Button>
  )
}
