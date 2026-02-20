// apps/web/src/components/quiz/ShortAnswerInput.tsx
// 단답형 텍스트 입력 UI — type=text 사용 (type=number 금지: 빈 값 NaN 처리 오류 방지)
import { Input } from '@/components/ui/input'
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
  placeholder = '숫자 또는 답을 입력하세요',
  className,
}: ShortAnswerInputProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(disabled && 'cursor-not-allowed opacity-70')}
      />
      <p className="text-muted-foreground text-xs">
        숫자로 답하는 문제의 경우 숫자만 입력하세요
      </p>
    </div>
  )
}
