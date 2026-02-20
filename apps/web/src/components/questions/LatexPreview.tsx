// apps/web/src/components/questions/LatexPreview.tsx
// KaTeX 기반 LaTeX 수식 + 일반 텍스트 혼합 렌더링 컴포넌트
// QBNK-06, UIUX-02 구현
import katex from 'katex'
import { cn } from '@/lib/utils'

interface LatexPreviewProps {
  content: string
  className?: string
}

/**
 * $$...$$ → 블록 수식 (displayMode: true) 먼저 처리
 * $...$ → 인라인 수식 (displayMode: false)
 * 순서 중요: $$ 먼저 처리하지 않으면 $ 파서가 $$를 두 인라인 수식으로 오인식
 */
function renderMixedContent(text: string): string {
  // 1단계: $$...$$ 블록 수식
  let result = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      })
    } catch {
      return `<span class="text-destructive font-mono text-sm">[LaTeX 오류: ${math}]</span>`
    }
  })

  // 2단계: $...$ 인라인 수식
  result = result.replace(/\$([^\n$]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
        output: 'html',
      })
    } catch {
      return `<span class="text-destructive font-mono text-sm">[LaTeX 오류: ${math}]</span>`
    }
  })

  // 줄바꿈 처리 (수식 아닌 일반 텍스트)
  result = result.replace(/\n/g, '<br />')

  return result
}

export function LatexPreview({ content, className }: LatexPreviewProps) {
  if (!content) {
    return (
      <div className={cn('text-muted-foreground text-sm italic', className)}>
        미리보기가 여기에 표시됩니다
      </div>
    )
  }

  return (
    <div
      className={cn('leading-relaxed [&_.katex-display]:overflow-x-auto [&_.katex-display]:py-2', className)}
      dangerouslySetInnerHTML={{ __html: renderMixedContent(content) }}
    />
  )
}
