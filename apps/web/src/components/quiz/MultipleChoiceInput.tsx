// apps/web/src/components/quiz/MultipleChoiceInput.tsx
// 5지선다 버튼 UI — 선택 강조 + 제출 후 비활성화
import { cn } from '@/lib/utils'

const OPTIONS = ['1', '2', '3', '4', '5'] as const

interface MultipleChoiceInputProps {
  selected: string
  onSelect: (answer: string) => void
  disabled?: boolean  // 제출 후 선택 잠금
}

export function MultipleChoiceInput({ selected, onSelect, disabled }: MultipleChoiceInputProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(opt)}
          className={cn(
            'h-12 rounded-lg border-2 text-lg font-bold transition-colors',
            selected === opt
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border hover:border-primary/50',
            disabled && 'cursor-not-allowed opacity-70',
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
