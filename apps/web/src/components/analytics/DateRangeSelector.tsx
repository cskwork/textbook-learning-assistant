/**
 * 날짜 범위 선택 칩 컴포넌트
 *
 * Props:
 *   value: 현재 선택된 일수 (7 | 14 | 30)
 *   onChange: 일수 변경 핸들러
 *
 * - 칩 버튼 3개: 7일, 14일, 30일
 * - 활성 칩: primary 배경 + primary-foreground 텍스트
 * - 비활성 칩: muted/50 배경 + muted-foreground 텍스트
 * - Phase 11/12 칩 필터 패턴과 동일한 스타일링
 */

interface DateRangeSelectorProps {
  value: number
  onChange: (days: number) => void
}

const DATE_OPTIONS = [
  { label: '7일', value: 7 },
  { label: '14일', value: 14 },
  { label: '30일', value: 30 },
]

export default function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex gap-2">
      {DATE_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            value === option.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted/50 hover:bg-muted text-muted-foreground'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
