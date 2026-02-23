// Phase 18: WebGL 미지원 시 CSS gradient fallback 배경
// 화면별 gradient + 미세 애니메이션으로 ambient 느낌 제공

interface CssFallbackBgProps {
  scene: 'space' | 'neon' | 'wave' | 'mountain'
}

/** scene별 CSS gradient + 배경 스타일 매핑 */
const sceneStyles: Record<CssFallbackBgProps['scene'], string> = {
  space:
    'bg-gradient-to-b from-slate-950 via-indigo-950 to-black',
  neon:
    'bg-gradient-to-b from-violet-950 via-purple-950 to-black',
  wave:
    'bg-gradient-to-b from-cyan-950 via-blue-950 to-slate-950',
  mountain:
    'bg-gradient-to-b from-emerald-950 via-green-950 to-stone-950',
}

/**
 * WebGL 미지원 기기용 CSS-only 배경 컴포넌트.
 * gradient + 미세한 opacity 애니메이션으로 ambient 느낌을 준다.
 */
export function CssFallbackBg({ scene }: CssFallbackBgProps) {
  return (
    <div
      className={`fixed inset-0 -z-10 pointer-events-none ${sceneStyles[scene]}`}
      style={{ animation: 'css-fallback-pulse 8s ease-in-out infinite' }}
    />
  )
}
