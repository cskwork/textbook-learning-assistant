/**
 * GameQuizHud — 퀴즈 화면 게임 HUD 오버레이
 *
 * 상단에 고정되는 바:
 * - 좌측: HP 바 또는 하트 (모드별)
 * - 중앙: 콤보 카운터
 * - 우측: 타이머
 * 반투명 다크 배경 + backdrop-blur.
 */

import { HeartIcon, FlameIcon, LightningIcon } from '@/components/game/icons'
import { NeonText } from '@/components/game/ui'

export interface GameQuizHudProps {
  mode: 'normal' | 'timeattack' | 'survival' | 'bossbattle' | 'minigame'
  hp?: number
  maxHp?: number
  combo?: number
  timeLeft?: number
  totalTime?: number
}

export function GameQuizHud({
  mode,
  hp = 3,
  maxHp = 3,
  combo = 0,
  timeLeft,
  totalTime,
}: GameQuizHudProps) {
  const showHp = mode === 'survival' || mode === 'bossbattle'
  const showTimer = mode === 'timeattack' || mode === 'bossbattle'
  const timerRatio = totalTime && totalTime > 0 ? (timeLeft ?? 0) / totalTime : 1
  const timerUrgent = timerRatio < 0.25

  return (
    <div
      className="sticky top-0 z-40 flex items-center justify-between px-4 py-2 rounded-b-xl"
      style={{
        background: 'rgba(10, 10, 26, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--fun-glass-border)',
      }}
    >
      {/* Left: HP or hearts */}
      <div className="flex items-center gap-1.5 min-w-[80px]">
        {showHp ? (
          <>
            {/* HP Bar style */}
            <HeartIcon size={18} color="var(--fun-neon-red)" glow />
            <div className="flex-1 max-w-[80px]">
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--fun-bg-card)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${maxHp > 0 ? (hp / maxHp) * 100 : 0}%`,
                    background: hp <= 1 ? 'var(--fun-neon-red)' : 'var(--fun-neon-green)',
                    boxShadow: hp <= 1 ? 'var(--fun-glow-magenta)' : undefined,
                  }}
                />
              </div>
            </div>
            <span className="text-xs font-bold" style={{ color: 'var(--fun-text-secondary)' }}>
              {hp}/{maxHp}
            </span>
          </>
        ) : (
          /* Normal mode: static hearts */
          <div className="flex gap-0.5">
            {Array.from({ length: maxHp }).map((_, i) => (
              <HeartIcon
                key={i}
                size={16}
                color={i < hp ? 'var(--fun-neon-red)' : 'var(--fun-text-muted)'}
                glow={i < hp}
              />
            ))}
          </div>
        )}
      </div>

      {/* Center: Combo */}
      <div className="flex items-center gap-1">
        {combo > 0 && (
          <>
            <FlameIcon
              size={18}
              color={combo >= 5 ? 'var(--fun-neon-gold)' : 'var(--fun-neon-cyan)'}
              glow
            />
            <NeonText
              color={combo >= 5 ? 'gold' : 'cyan'}
              glow={combo >= 5 ? 'high' : 'medium'}
              className="text-sm font-black"
            >
              {combo} COMBO
            </NeonText>
          </>
        )}
      </div>

      {/* Right: Timer */}
      <div className="flex items-center gap-1.5 min-w-[80px] justify-end">
        {showTimer && timeLeft !== undefined ? (
          <>
            <LightningIcon
              size={16}
              color={timerUrgent ? 'var(--fun-neon-red)' : 'var(--fun-neon-cyan)'}
              glow={timerUrgent}
            />
            <NeonText
              color={timerUrgent ? 'red' : 'cyan'}
              glow={timerUrgent ? 'high' : 'low'}
              className="text-sm font-bold tabular-nums"
            >
              {timeLeft}s
            </NeonText>
          </>
        ) : (
          <span className="text-xs" style={{ color: 'var(--fun-text-muted)' }}>
            {mode === 'minigame' ? 'MINI' : 'QUIZ'}
          </span>
        )}
      </div>
    </div>
  )
}
