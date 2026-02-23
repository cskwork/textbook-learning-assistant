/**
 * 반전 모드 토글 버튼
 *
 * 클릭 한 번으로 일반 모드 <-> 반전(게임) 모드 전환
 * FunModeProvider 내부에서만 사용 가능
 *
 * Phase 17: iOS AudioContext 잠금 해제 + BGM lazy load 추가
 */

import { useFunMode } from '@/contexts/FunModeContext'
import { Button } from '@/components/ui/button'

export function FunModeToggleButton() {
  const { isFunMode, toggleFunMode } = useFunMode()

  async function handleToggle() {
    // iOS AudioContext 잠금 해제 — 사용자 클릭 이벤트 핸들러 내에서 실행
    // 동적 import로 일반 모드에서 howler 번들 로드 방지
    try {
      const { Howler } = await import('howler')
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        await Howler.ctx.resume()
      }
    } catch {
      // howler 로드 실패 시 무시 — 사운드 없이 FunMode 계속
    }

    toggleFunMode()

    // FunMode 진입 시 BGM 에셋 lazy load (기본 OFF, play 안 함)
    if (!isFunMode) {
      try {
        const { soundManager } = await import('@/lib/sound/SoundManager')
        soundManager.loadBGM('/sounds/bgm-study.mp3')
      } catch {
        // SoundManager 로드 실패 시 무시
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      title={isFunMode ? '일반 모드로 전환' : '반전 모드로 전환'}
      aria-label={isFunMode ? '일반 모드로 전환' : '반전 모드로 전환'}
      className={isFunMode ? 'text-primary animate-pulse' : 'text-muted-foreground'}
    >
      {isFunMode ? '🎮' : '🎯'}
    </Button>
  )
}
