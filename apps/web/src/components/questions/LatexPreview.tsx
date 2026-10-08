// apps/web/src/components/questions/LatexPreview.tsx
// KaTeX 기반 LaTeX 수식 + 일반 텍스트 혼합 렌더링 컴포넌트
// QBNK-06, UIUX-02 구현
import katex from 'katex'
import { cn } from '@/lib/utils'

interface LatexPreviewProps {
  content: string
  className?: string
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, ch => HTML_ESCAPES[ch])
}

function renderMath(math: string, displayMode: boolean): string {
  try {
    return katex.renderToString(math.trim(), {
      displayMode,
      throwOnError: false,
      output: 'html',
    })
  } catch {
    return `<span class="text-destructive font-mono text-sm">[LaTeX 오류: ${escapeHtml(math)}]</span>`
  }
}

/**
 * $$...$$ → 블록 수식 (displayMode: true) 먼저 처리
 * $...$ → 인라인 수식 (displayMode: false)
 * 순서 중요: $$ 먼저 처리하지 않으면 $ 파서가 $$를 두 인라인 수식으로 오인식
 *
 * 보안: 일반 텍스트와 수식을 먼저 분리한다. 일반 텍스트는 문자 단위로 이스케이프하고,
 * KaTeX가 만든 HTML은 이후의 Bold/줄바꿈 치환 대상에서 제외한다.
 */
function renderMixedContent(text: string): string {
  // 출력 조각 배열과, 같은 인덱스로 대응하는 원문 그림자 문자열 (수식 1개 = 문자 1개)
  const parts: string[] = []
  let shadow = ''

  const pushPlain = (plain: string) => {
    for (let i = 0; i < plain.length; i++) {
      const ch = plain[i]
      // 줄바꿈 처리 — 일반 텍스트에만 적용
      parts.push(ch === '\n' ? '<br />' : escapeHtml(ch))
      shadow += ch
    }
  }
  const pushMath = (math: string, displayMode: boolean) => {
    parts.push(renderMath(math, displayMode))
    shadow += '￼'
  }

  // 1단계: $$...$$ 블록 수식, 2단계: 나머지 텍스트의 $...$ 인라인 수식
  // split의 캡처 그룹 → 홀수 인덱스가 수식
  text.split(/\$\$([\s\S]+?)\$\$/).forEach((blockPart, i) => {
    if (i % 2 === 1) {
      pushMath(blockPart, true)
      return
    }
    blockPart.split(/\$([^\n$]+?)\$/).forEach((inlinePart, j) => {
      if (j % 2 === 1) pushMath(inlinePart, false)
      else pushPlain(inlinePart)
    })
  })

  // 3단계: 마크다운 Bold (**텍스트**) — 그림자 문자열에서 위치만 찾아 표시 (수식을 감싸는 Bold 유지)
  shadow.replace(/\*\*([^*]+)\*\*/g, (match, _inner, offset: number) => {
    const end = offset + match.length
    parts[offset] = '<strong>'
    parts[offset + 1] = ''
    parts[end - 2] = '</strong>'
    parts[end - 1] = ''
    return match
  })

  return parts.join('')
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
