// apps/web/src/components/questions/LatexEditor.tsx
// LaTeX 입력 textarea + 실시간 KaTeX 미리보기 split 에디터
// + MathLive WYSIWYG 수식 입력 도우미 패널 (토글 방식)
import { useRef, useState } from 'react'
import { Calculator } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { LatexPreview } from './LatexPreview'
import { MathFieldInput } from './MathFieldInput'

interface LatexEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function LatexEditor({
  value,
  onChange,
  placeholder = '$x^2 + y^2 = r^2$ 형식으로 입력하세요',
  minHeight = 'min-h-32',
}: LatexEditorProps) {
  const [isHelperOpen, setIsHelperOpen] = useState(false)
  const [mathValue, setMathValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // MathLive에서 삽입 버튼 클릭 시: textarea 커서 위치에 LaTeX 삽입
  function handleInsert(latex: string) {
    const textarea = textareaRef.current
    if (!textarea) {
      // textarea ref 없으면 끝에 추가
      onChange(value + latex)
      return
    }

    const start = textarea.selectionStart ?? value.length
    const end = textarea.selectionEnd ?? value.length
    const newValue = value.slice(0, start) + latex + value.slice(end)

    onChange(newValue)

    // 삽입 후 커서를 삽입된 텍스트 뒤로 이동
    requestAnimationFrame(() => {
      textarea.focus()
      const newCursor = start + latex.length
      textarea.setSelectionRange(newCursor, newCursor)
    })
  }

  return (
    <div className="space-y-3">
      {/* 수식 입력 도우미 토글 버튼 */}
      <button
        type="button"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setIsHelperOpen((prev) => !prev)}
      >
        <Calculator className="w-4 h-4" />
        수식 입력 도우미
        <span className="text-xs opacity-60">{isHelperOpen ? '닫기' : '열기'}</span>
      </button>

      {/* MathLive 수식 입력 도우미 패널 (토글) */}
      {isHelperOpen && (
        <div className="border rounded-lg p-3 bg-muted/20 space-y-2">
          <p className="text-xs text-muted-foreground">
            수식을 시각적으로 입력한 뒤 삽입 버튼을 누르세요
          </p>
          <MathFieldInput
            value={mathValue}
            onChange={setMathValue}
            onInsert={handleInsert}
          />
        </div>
      )}

      {/* 기존 입력/미리보기 영역 — 변경 없이 유지 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 입력 영역 */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            LaTeX 입력 <span className="text-xs opacity-60">($...$ 인라인, $$...$$ 블록)</span>
          </p>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`font-mono text-sm resize-y ${minHeight}`}
          />
        </div>
        {/* 미리보기 영역 */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">미리보기</p>
          <div className={`border rounded-md p-3 bg-muted/30 overflow-auto ${minHeight}`}>
            <LatexPreview content={value} />
          </div>
        </div>
      </div>
    </div>
  )
}
