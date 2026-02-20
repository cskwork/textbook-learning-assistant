// MathLive <math-field> 웹 컴포넌트 React 래퍼
// 수식 입력 패널 — LatexEditor 내부에서 사용
import { useRef, useEffect } from 'react'
import type { MathfieldElement } from 'mathlive'
import 'mathlive' // 웹 컴포넌트 등록 side-effect
import { Button } from '@/components/ui/button'

// JSX에서 math-field 커스텀 엘리먼트 타입 선언 (React 19 react-jsx 모드 호환)
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<
        React.HTMLAttributes<MathfieldElement>,
        MathfieldElement
      > & { [key: string]: unknown }
    }
  }
}

interface MathFieldInputProps {
  value: string // LaTeX 문자열 ($ 없이 순수 LaTeX)
  onChange: (latex: string) => void
  onInsert: (latex: string) => void // "삽입" 버튼 클릭 시 콜백
  placeholder?: string
}

export function MathFieldInput({ value, onChange, onInsert, placeholder }: MathFieldInputProps) {
  const mfRef = useRef<MathfieldElement | null>(null)

  // math-field → React 상태 동기화
  useEffect(() => {
    const mf = mfRef.current
    if (!mf) return

    function handleInput() {
      onChange(mf!.value)
    }

    mf.addEventListener('input', handleInput)
    return () => {
      mf.removeEventListener('input', handleInput)
    }
  }, [onChange])

  // React 상태 → math-field 동기화 (외부에서 value 변경 시)
  useEffect(() => {
    const mf = mfRef.current
    if (!mf) return
    if (mf.value !== value) {
      mf.value = value
    }
  }, [value])

  function handleInlineInsert() {
    const mf = mfRef.current
    if (!mf || !mf.value.trim()) return
    onInsert(`$${mf.value}$`)
    mf.value = ''
    onChange('')
  }

  function handleBlockInsert() {
    const mf = mfRef.current
    if (!mf || !mf.value.trim()) return
    onInsert(`$$${mf.value}$$`)
    mf.value = ''
    onChange('')
  }

  const isEmpty = !value.trim()

  return (
    <div className="space-y-2">
      {/* MathLive WYSIWYG 수식 입력 필드 */}
      <math-field
        ref={mfRef as React.RefObject<MathfieldElement>}
        math-virtual-keyboard-policy="manual"
        placeholder={placeholder ?? '수식을 입력하세요 (예: \\frac{a}{b})'}
        style={{
          fontSize: '1.1rem',
          minHeight: '50px',
          border: '1px solid hsl(var(--border))',
          borderRadius: '0.375rem',
          padding: '0.5rem',
          width: '100%',
          display: 'block',
        }}
      />

      {/* 삽입 버튼 */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleInlineInsert}
          disabled={isEmpty}
        >
          인라인 삽입 <span className="ml-1 font-mono text-xs text-muted-foreground">$...$</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleBlockInsert}
          disabled={isEmpty}
        >
          블록 삽입 <span className="ml-1 font-mono text-xs text-muted-foreground">$$...$$</span>
        </Button>
      </div>
    </div>
  )
}
