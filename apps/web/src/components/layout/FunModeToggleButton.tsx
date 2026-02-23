/**
 * 반전 모드 토글 버튼
 *
 * 클릭 한 번으로 일반 모드 <-> 반전(게임) 모드 전환
 * FunModeProvider 내부에서만 사용 가능
 *
 * Phase 17: iOS AudioContext 잠금 해제 + BGM lazy load 추가
 * Phase 20: 이모지 제거 → SwordIcon SVG + 네온 글로우 + Framer Motion 전환 애니메이션
 */

import { useFunMode } from '@/contexts/FunModeContext'
import { Button } from '@/components/ui/button'
import { SwordIcon, StarIcon } from '@/components/game/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FunModeToggleButtonProps {
  variant?: 'icon' | 'sidebar'
  className?: string
}

export function FunModeToggleButton({ variant = 'icon', className }: FunModeToggleButtonProps) {
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

  const title = isFunMode ? '일반 모드로 전환' : '반전 모드로 전환'

  function renderIcon() {
    return (
      <AnimatePresence mode="wait">
        {isFunMode ? (
          <motion.div
            key="fun"
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: 180, scale: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <SwordIcon size={20} color="var(--fun-neon-cyan)" glow />
          </motion.div>
        ) : (
          <motion.div
            key="normal"
            initial={{ rotate: 180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: -180, scale: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <StarIcon size={20} color="currentColor" />
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  if (variant === 'sidebar') {
    return (
      <Button
        variant="ghost"
        onClick={handleToggle}
        title={title}
        aria-label={title}
        className={cn(
          'group flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl w-full',
          'text-sm font-medium transition-all duration-200',
          isFunMode
            ? 'text-cyan-200 hover:text-cyan-100 hover:bg-cyan-500/10'
            : 'text-muted-foreground hover:bg-primary/8 hover:text-primary',
          className,
        )}
        style={isFunMode ? {
          boxShadow: 'inset 0 0 0 1px rgba(0, 212, 255, 0.35)',
          background: 'rgba(0, 212, 255, 0.06)',
        } : undefined}
      >
        <span
          className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors',
            isFunMode ? 'bg-cyan-500/10' : 'group-hover:bg-primary/10',
          )}
        >
          {renderIcon()}
        </span>
        <span>{isFunMode ? '일반 모드 전환' : '게임 모드 전환'}</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      title={title}
      aria-label={title}
      className={cn('relative overflow-hidden', className)}
      style={isFunMode ? {
        boxShadow: '0 0 12px var(--fun-neon-cyan), 0 0 24px rgba(0, 212, 255, 0.3)',
        border: '1px solid var(--fun-neon-cyan)',
        background: 'rgba(0, 212, 255, 0.1)',
      } : undefined}
    >
      {renderIcon()}
    </Button>
  )
}
