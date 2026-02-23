/**
 * QuestCard -- 퀘스트 스타일 문제집 카드
 *
 * GlassCard + NeonBorder 기반.
 * - 완료: gold 네온 + "클리어" 태그 + TrophyIcon
 * - 미완료: cyan 네온 + 진행률 프로그레스바
 */

import { GlassCard, NeonBorder, NeonText, LaserButton } from '@/components/game/ui'
import { ScrollIcon, TrophyIcon, StarIcon, SwordIcon } from '@/components/game/icons'
import type { Workbook } from '@/lib/db'

interface QuestCardProps {
  workbook: Workbook
  onPlay: (id: number) => void
}

export function QuestCard({ workbook, onPlay }: QuestCardProps) {
  const questionCount = workbook.questionIds.length
  // 완료 여부: 간이 판정 -- 실제 진행률은 attemptCount 기반이지만
  // Workbook에는 completedAt 같은 필드가 없으므로 0 문제 = 완료 아님
  const isCompleted = false // 추후 실제 진행률 연동
  const borderColor = isCompleted ? 'gold' : 'cyan'

  return (
    <NeonBorder color={borderColor}>
      <GlassCard className="p-4 flex flex-col gap-3">
        {/* 상단: 아이콘 + 이름 */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'var(--fun-bg-tertiary)',
              border: `1px solid var(--fun-neon-${borderColor})`,
            }}
          >
            {isCompleted ? (
              <TrophyIcon size={22} color={`var(--fun-neon-gold)`} glow />
            ) : (
              <ScrollIcon size={22} color={`var(--fun-neon-cyan)`} glow />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <NeonText
              color={borderColor}
              glow="medium"
              className="text-sm font-bold truncate"
            >
              {workbook.title}
            </NeonText>
            {isCompleted && (
              <span
                className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5"
                style={{
                  background: 'var(--fun-neon-gold)',
                  color: 'var(--fun-bg-primary)',
                }}
              >
                CLEAR
              </span>
            )}
          </div>
        </div>

        {/* 중단: 문제 수 + 난이도 표시 */}
        <div className="flex items-center gap-2">
          <SwordIcon size={14} color="var(--fun-text-secondary)" />
          <span className="text-[10px] font-semibold" style={{ color: 'var(--fun-text-secondary)' }}>
            {questionCount} 문제
          </span>
          <div className="flex gap-0.5 ml-auto">
            {Array.from({ length: Math.min(Math.ceil(questionCount / 5), 5) }).map((_, i) => (
              <StarIcon key={i} size={12} color="var(--fun-neon-gold)" />
            ))}
          </div>
        </div>

        {/* 진행률 바 (미완료 시) */}
        {!isCompleted && (
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--fun-bg-tertiary)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: '0%',
                background: 'linear-gradient(90deg, var(--fun-neon-cyan), var(--fun-neon-green))',
                boxShadow: '0 0 6px var(--fun-neon-cyan)',
              }}
            />
          </div>
        )}

        {/* 하단: CTA 버튼 */}
        <LaserButton
          variant={isCompleted ? 'gold' : 'primary'}
          size="sm"
          onClick={() => onPlay(workbook.id!)}
          className="w-full"
        >
          {isCompleted ? '다시 도전' : '퀘스트 시작'}
        </LaserButton>
      </GlassCard>
    </NeonBorder>
  )
}
