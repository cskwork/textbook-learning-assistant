// apps/web/src/components/questions/LatexEditor.tsx
// LaTeX 입력 textarea + 실시간 KaTeX 미리보기 split 에디터
import { Textarea } from '@/components/ui/textarea'
import { LatexPreview } from './LatexPreview'

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 입력 영역 */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">
          LaTeX 입력 <span className="text-xs opacity-60">($...$ 인라인, $$...$$ 블록)</span>
        </p>
        <Textarea
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
  )
}
