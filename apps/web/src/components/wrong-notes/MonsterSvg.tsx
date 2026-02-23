/**
 * MonsterSvg -- 문제 유형별 기하학적 몬스터 실루엣 SVG
 *
 * 유형별 다른 형태 + 난이도별 색상/글로우 차등
 */

type MathType = 'suwa-yeonsan' | 'dohyeong' | 'cheukjeong' | 'gyuchikseong' | 'jaryo-ganeungseong' | 'default'
type Difficulty = 'easy' | 'medium' | 'hard'

interface MonsterSvgProps {
  type?: string
  difficulty?: Difficulty
  defeated?: boolean
  size?: number
  className?: string
}

function mapType(raw?: string): MathType {
  if (!raw) return 'default'
  const lower = raw.toLowerCase()
  if (lower.includes('수와연산') || lower.includes('수와 연산')) return 'suwa-yeonsan'
  if (lower.includes('도형')) return 'dohyeong'
  if (lower.includes('측정')) return 'cheukjeong'
  if (lower.includes('규칙')) return 'gyuchikseong'
  if (lower.includes('자료') || lower.includes('가능성')) return 'jaryo-ganeungseong'
  return 'default'
}

const difficultyStyles: Record<Difficulty, { stroke: string; glow: string; animate: boolean }> = {
  easy: { stroke: '#606080', glow: 'none', animate: false },
  medium: { stroke: 'var(--fun-neon-cyan)', glow: '0 0 8px rgba(0,212,255,0.4)', animate: false },
  hard: { stroke: 'var(--fun-neon-magenta)', glow: '0 0 12px rgba(255,0,255,0.5), 0 0 24px rgba(255,0,255,0.2)', animate: true },
}

function MonsterPath({ type }: { type: MathType }) {
  switch (type) {
    case 'suwa-yeonsan':
      return (
        <>
          <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" fill="none" strokeWidth={1.5} />
          <circle cx="9" cy="10" r="1.5" />
          <circle cx="15" cy="10" r="1.5" />
          <path d="M8 15C9 17 15 17 16 15" fill="none" strokeWidth={1.5} />
        </>
      )
    case 'dohyeong':
      return (
        <>
          <polygon points="12,1 23,18 1,18" fill="none" strokeWidth={1.5} />
          <rect x="6" y="18" width="12" height="5" rx="1" fill="none" strokeWidth={1.5} />
          <circle cx="9" cy="12" r="1.2" />
          <circle cx="15" cy="12" r="1.2" />
          <path d="M10 16L14 16" strokeWidth={1.5} />
        </>
      )
    case 'cheukjeong':
      return (
        <>
          <rect x="4" y="3" width="16" height="18" rx="2" fill="none" strokeWidth={1.5} />
          {[6, 9, 12, 15, 18].map(y => (
            <line key={y} x1="4" y1={y} x2="7" y2={y} strokeWidth={1} />
          ))}
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="16" cy="10" r="1.5" />
          <path d="M10 16C11 17.5 15 17.5 16 16" fill="none" strokeWidth={1.5} />
        </>
      )
    case 'gyuchikseong':
      return (
        <>
          <circle cx="12" cy="12" r="10" fill="none" strokeWidth={1.5} />
          <circle cx="12" cy="12" r="6" fill="none" strokeWidth={1} strokeDasharray="3 2" />
          <circle cx="12" cy="12" r="3" fill="none" strokeWidth={1} strokeDasharray="2 2" />
          <circle cx="9" cy="10" r="1.2" />
          <circle cx="15" cy="10" r="1.2" />
          <path d="M9 15C10 16.5 14 16.5 15 15" fill="none" strokeWidth={1.5} />
        </>
      )
    case 'jaryo-ganeungseong':
      return (
        <>
          <rect x="3" y="14" width="3" height="7" rx="0.5" fill="none" strokeWidth={1.5} />
          <rect x="8" y="10" width="3" height="11" rx="0.5" fill="none" strokeWidth={1.5} />
          <rect x="13" y="6" width="3" height="15" rx="0.5" fill="none" strokeWidth={1.5} />
          <rect x="18" y="2" width="3" height="19" rx="0.5" fill="none" strokeWidth={1.5} />
          <circle cx="9" cy="5" r="1.2" />
          <circle cx="15" cy="3" r="1.2" />
        </>
      )
    default:
      return (
        <>
          <circle cx="12" cy="12" r="10" fill="none" strokeWidth={1.5} />
          <text x="12" y="12" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="bold" fill="currentColor">?</text>
          <circle cx="8" cy="8" r="1" />
          <circle cx="16" cy="8" r="1" />
        </>
      )
  }
}

export function MonsterSvg({ type, difficulty = 'easy', defeated = false, size = 64, className = '' }: MonsterSvgProps) {
  const mappedType = mapType(type)
  const style = difficultyStyles[difficulty]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      stroke={defeated ? 'var(--fun-neon-green)' : style.stroke}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${style.animate ? 'animate-neon-pulse' : ''} ${className}`}
      style={{
        filter: defeated ? 'drop-shadow(0 0 6px rgba(0,255,136,0.5))' : (style.glow !== 'none' ? `drop-shadow(${style.glow.split(',')[0]})` : undefined),
        opacity: defeated ? 1 : (difficulty === 'easy' ? 0.7 : 1),
      }}
    >
      <MonsterPath type={mappedType} />
      {defeated && (
        <path d="M7 12L10 15L17 8" stroke="var(--fun-neon-green)" strokeWidth={2.5} fill="none" />
      )}
    </svg>
  )
}
