// apps/web/src/components/quiz/ShortAnswerInput.tsx
// 단답형 텍스트 입력 UI — type=text 사용 (type=number 금지: 빈 값 NaN 처리 오류 방지)
import { PenLine } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FadeIn } from '@/components/motion/FadeIn'
import { cn } from '@/lib/utils'

interface ShortAnswerInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function ShortAnswerInput({
  value,
  onChange,
  disabled,
  placeholder = '답을 입력하세요',
  className,
}: ShortAnswerInputProps) {
  return (
    <FadeIn className={cn('space-y-1.5', className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <PenLine className="h-4 w-4" />
        <span>단답형</span>
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'rounded-xl h-14 text-lg font-semibold text-center',
          disabled && 'cursor-not-allowed opacity-70',
        )}
      />
      <p className="text-muted-foreground text-xs">
        숫자로 답하는 문제의 경우 숫자만 입력하세요
      </p>
    </FadeIn>
  )
}
