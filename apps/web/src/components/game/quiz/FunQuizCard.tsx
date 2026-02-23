/**
 * FunQuizCard — 반전 모드 전용 문제 카드 래퍼
 *
 * GlassCard + NeonBorder 래핑, 밝은 텍스트,
 * 선택지는 LaserButton 사용.
 */

import { type ReactNode } from 'react'
import { GlassCard, NeonBorder, LaserButton } from '@/components/game/ui'

interface FunQuizCardProps {
  /** 문제 내용 (KaTeX 등 포함 가능) */
  children: ReactNode
  /** 선택지 목록 */
  choices?: Array<{
    id: string | number
    label: string
    content: ReactNode
  }>
  /** 선택된 답 */
  selectedId?: string | number | null
  /** 정답 ID (채점 후) */
  correctId?: string | number | null
  /** 선택지 클릭 핸들러 */
  onChoiceSelect?: (id: string | number) => void
  /** 비활성 상태 (채점 중) */
  disabled?: boolean
  className?: string
}

function getChoiceVariant(
  choiceId: string | number,
  selectedId: string | number | null | undefined,
  correctId: string | number | null | undefined,
): 'primary' | 'danger' | 'gold' {
  if (correctId != null) {
    if (choiceId === correctId) return 'gold'
    if (choiceId === selectedId && choiceId !== correctId) return 'danger'
  }
  if (choiceId === selectedId) return 'primary'
  return 'primary'
}

export function FunQuizCard({
  children,
  choices,
  selectedId,
  correctId,
  onChoiceSelect,
  disabled = false,
  className = '',
}: FunQuizCardProps) {
  return (
    <NeonBorder color="cyan">
      <GlassCard className={`p-5 ${className}`}>
        {/* 문제 내용 */}
        <div
          className="prose prose-invert max-w-none mb-5"
          style={{ color: 'var(--fun-text-primary)' }}
        >
          {children}
        </div>

        {/* 선택지 */}
        {choices && choices.length > 0 && (
          <div className="space-y-2.5">
            {choices.map((choice) => {
              const variant = getChoiceVariant(choice.id, selectedId, correctId)
              const isSelected = choice.id === selectedId
              const isCorrect = correctId != null && choice.id === correctId

              return (
                <LaserButton
                  key={choice.id}
                  variant={variant}
                  size="md"
                  onClick={() => onChoiceSelect?.(choice.id)}
                  disabled={disabled}
                  className={`
                    w-full text-left justify-start
                    ${isSelected ? 'ring-1 ring-[var(--fun-neon-cyan)]' : ''}
                    ${isCorrect ? 'ring-2 ring-[var(--fun-neon-green)]' : ''}
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        borderColor: isSelected ? 'var(--fun-neon-cyan)' : 'var(--fun-glass-border)',
                        color: isSelected ? 'var(--fun-neon-cyan)' : 'var(--fun-text-secondary)',
                      }}
                    >
                      {choice.label}
                    </span>
                    <span>{choice.content}</span>
                  </span>
                </LaserButton>
              )
            })}
          </div>
        )}
      </GlassCard>
    </NeonBorder>
  )
}
