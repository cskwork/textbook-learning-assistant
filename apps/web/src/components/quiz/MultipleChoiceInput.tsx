// apps/web/src/components/quiz/MultipleChoiceInput.tsx
// 5지선다 버튼 UI — 세로 스택 레이아웃, 번호 원형 배지, 선택지 텍스트, 터치 타겟 확보
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LatexPreview } from '@/components/questions/LatexPreview'

const OPTIONS = ['1', '2', '3', '4', '5'] as const

interface MultipleChoiceInputProps {
  selected: string
  onSelect: (answer: string) => void
  disabled?: boolean  // 제출 후 선택 잠금
  choices?: string[]  // 선택지 텍스트 배열 (5개, LaTeX 포함 가능)
}

export function MultipleChoiceInput({ selected, onSelect, disabled, choices }: MultipleChoiceInputProps) {
  return (
    <div className="space-y-2.5">
      {OPTIONS.map((opt, idx) => {
        const isSelected = selected === opt
        const choiceText = choices?.[idx]

        return (
          <motion.button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt)}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 min-h-[52px] text-left transition-all duration-200',
              isSelected
                ? 'border-primary bg-primary/10 text-primary font-bold'
                : 'border-border/50 hover:border-primary/30 hover:bg-primary/5',
              disabled && 'cursor-not-allowed opacity-70',
            )}
          >
            {/* 번호 원형 배지 */}
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                isSelected
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {opt}
            </span>
            {/* 선택지 텍스트 */}
            {choiceText ? (
              <span className="text-base font-medium flex-1 min-w-0">
                <LatexPreview content={choiceText} />
              </span>
            ) : (
              <span className="text-base font-medium text-muted-foreground">{opt}번</span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
