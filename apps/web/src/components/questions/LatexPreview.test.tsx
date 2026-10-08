import katex from 'katex'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LatexPreview } from './LatexPreview'

// KaTeX HTML 출력에 등장하는 태그만 허용 (그 외 태그는 사용자 입력이 HTML로 해석된 것)
const ALLOWED_TAGS = new Set(['div', 'span', 'strong', 'br', 'svg', 'path', 'line', 'g', 'rect'])
const URL_ATTRS = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'srcset'])

function render(content: string): string {
  return renderToStaticMarkup(<LatexPreview content={content} />)
}

function findUnsafeMarkup(html: string): string[] {
  const issues: string[] = []
  for (const tag of html.matchAll(/<([a-zA-Z][\w:-]*)([^>]*)>/g)) {
    const name = tag[1].toLowerCase()
    if (!ALLOWED_TAGS.has(name)) issues.push(`tag:${name}`)
    for (const attr of tag[2].matchAll(/([^\s=/]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g)) {
      const attrName = attr[1].toLowerCase()
      const value = attr[2].toLowerCase()
      if (attrName.startsWith('on')) issues.push(`event:${attrName}`)
      if (URL_ATTRS.has(attrName)) issues.push(`url:${attrName}`)
      if (attrName === 'style' && /url\(|expression\(|javascript:/.test(value)) issues.push('style')
    }
  }
  return issues
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('LatexPreview 보안', () => {
  it('일반 텍스트의 HTML 태그와 이벤트 속성을 텍스트로 표시한다', () => {
    const html = render('문제 <img src=x onerror="alert(1)"> 와 <script>alert(2)</script> 그리고 <a href="javascript:alert(3)">링크</a>')

    expect(findUnsafeMarkup(html)).toEqual([])
    expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;')
    expect(html).toContain('&lt;script&gt;alert(2)&lt;/script&gt;')
  })

  it('부등호, 따옴표, 앰퍼샌드를 이스케이프한다', () => {
    const html = render(`a < b && c > d, "큰따옴표" 'single'`)

    expect(findUnsafeMarkup(html)).toEqual([])
    expect(html).toContain('a &lt; b &amp;&amp; c &gt; d, &quot;큰따옴표&quot; &#39;single&#39;')
  })

  it('Bold 문법 안의 HTML도 이스케이프한다', () => {
    const html = render('**<svg onload="alert(1)">굵게</svg>**')

    expect(findUnsafeMarkup(html)).toEqual([])
    expect(html).toContain('<strong>&lt;svg onload=&quot;alert(1)&quot;&gt;굵게&lt;/svg&gt;</strong>')
  })

  it('trust가 필요한 KaTeX 명령은 링크/HTML 속성을 만들지 않는다', () => {
    const html = render([
      '$\\href{javascript:alert(1)}{x}$',
      '$\\url{javascript:alert(2)}$',
      '$$\\htmlData{onclick=alert(3)}{y}$$',
      '$\\includegraphics{javascript:alert(4)}$',
    ].join(' '))

    expect(findUnsafeMarkup(html)).toEqual([])
    expect(html).not.toMatch(/<a[\s>]|<img[\s>]/)
  })

  it('KaTeX 실패 시 오류 텍스트를 이스케이프한다', () => {
    vi.spyOn(katex, 'renderToString').mockImplementation(() => {
      throw new Error('forced failure')
    })

    const html = render('$<img src=x onerror=alert(1)>$ 그리고 $$"<b onmouseover=alert(2)>"$$')

    expect(findUnsafeMarkup(html)).toEqual([])
    expect(html).toContain('<span class="text-destructive font-mono text-sm">[LaTeX 오류: &lt;img src=x onerror=alert(1)&gt;]</span>')
    expect(html).toContain('[LaTeX 오류: &quot;&lt;b onmouseover=alert(2)&gt;&quot;]')
  })
})

describe('LatexPreview 서식 유지', () => {
  it('인라인 수식과 블록 수식을 KaTeX로 렌더링한다', () => {
    const html = render('값은 $x^2$ 이다.\n$$\\frac{a}{b}$$')

    expect(html).toContain(katex.renderToString('x^2', { displayMode: false, throwOnError: false, output: 'html' }))
    expect(html).toContain(katex.renderToString('\\frac{a}{b}', { displayMode: true, throwOnError: false, output: 'html' }))
    expect(html).toContain('class="katex-display"')
  })

  it('Bold와 줄바꿈을 유지하고, 수식을 감싼 Bold도 유지한다', () => {
    const html = render('첫 줄\n**정답은 $128$**\n마지막')
    const math = katex.renderToString('128', { displayMode: false, throwOnError: false, output: 'html' })

    expect(html).toContain(`첫 줄<br /><strong>정답은 ${math}</strong><br />마지막`)
  })

  it('KaTeX가 만든 HTML에는 Bold/줄바꿈 치환을 적용하지 않는다', () => {
    const html = render('$$\na**b**c\n$$')

    expect(html).toContain(katex.renderToString('a**b**c', { displayMode: true, throwOnError: false, output: 'html' }))
    expect(html).not.toContain('<strong>')
    expect(html).not.toContain('<br />')
  })

  it('빈 내용이면 안내 문구를 표시한다', () => {
    expect(render('')).toContain('미리보기가 여기에 표시됩니다')
  })
})
