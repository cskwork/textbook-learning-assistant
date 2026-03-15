/**
 * MonsterDetail -- 몬스터 카드 클릭 시 표시되는 상세 패널
 */

import { GlassCard, NeonText, LaserButton } from '@/components/game/ui'
import { MonsterSvg } from './MonsterSvg'

interface MonsterDetailProps {
  questionId: number
  questionType?: string
  unitName?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  wrongCount?: number
  correctRate?: number
  lastAttemptDate?: string
  defeated?: boolean
  /** 문제 내용 렌더링 (외부에서 주입) */
  questionContent?: React.ReactNode
  onRetry?: () => void
  onClose?: () => void
}

export function MonsterDetail({
  questionType,
  unitName,
  difficulty = 'easy',
  wrongCount = 1,
  correctRate,
  lastAttemptDate,
  defeated = false,
  questionContent,
  onRetry,
  onClose,
}: MonsterDetailProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10, 10, 26, 0.9)' }}
      onClick={onClose}
    >
      <GlassCard
        className="w-full max-w-lg p-6 space-y-4"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Monster header */}
        <div className="flex items-center gap-4">
          <MonsterSvg
            type={questionType}
            difficulty={difficulty}
            defeated={defeated}
            size={72}
          />
          <div>
            <NeonText
              color={difficulty === 'hard' ? 'magenta' : 'green'}
              glow="medium"
              as="h2"
              className="text-lg font-black"
            >
              {unitName ?? questionType ?? '???'}
            </NeonText>
            <p className="text-xs mt-1" style={{ color: 'var(--fun-text-secondary)' }}>
              {difficulty === 'hard' ? 'BOSS' : difficulty === 'medium' ? 'ELITE' : 'NORMAL'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-3 gap-3 rounded-lg p-3"
          style={{ background: 'var(--fun-bg-card)' }}
        >
          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--fun-text-muted)' }}>오답 횟수</p>
            <NeonText color="coral" glow="low" className="text-lg font-bold">{wrongCount}</NeonText>
          </div>
          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--fun-text-muted)' }}>정답률</p>
            <NeonText color="green" glow="low" className="text-lg font-bold">
              {correctRate != null ? `${correctRate}%` : '-'}
            </NeonText>
          </div>
          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--fun-text-muted)' }}>최근 도전</p>
            <span className="text-sm font-semibold" style={{ color: 'var(--fun-text-secondary)' }}>
              {lastAttemptDate ?? '-'}
            </span>
          </div>
        </div>

        {/* Question content */}
        {questionContent && (
          <div
            className="rounded-lg p-4"
            style={{ background: 'var(--fun-bg-card)', color: 'var(--fun-text-primary)' }}
          >
            {questionContent}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <LaserButton variant="primary" size="sm" onClick={onClose}>
            돌아가기
          </LaserButton>
          <LaserButton variant="danger" size="md" onClick={onRetry}>
            재도전
          </LaserButton>
        </div>
      </GlassCard>
    </div>
  )
}
