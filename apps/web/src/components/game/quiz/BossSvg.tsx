// BossSvg.tsx
// 기하학적 보스 SVG 일러스트 — 순수 SVG path 기반 (이모지 금지)
// Phase 19 게임화 퀴즈 엔진

interface BossSvgProps {
  /** 보스 타입 (현재 'default' 1종만 구현) */
  type?: 'default' | 'triangle' | 'polygon'
  /** 크기 (px, 기본 200) */
  size?: number
  /** 추가 className */
  className?: string
}

export function BossSvg({ type: _type = 'default', size = 200, className }: BossSvgProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      data-testid="boss-svg"
    >
      {/* 배경 glow 원 */}
      <circle cx="100" cy="100" r="90" fill="none" stroke="#7c3aed" strokeWidth="1" opacity="0.3" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="#a855f7" strokeWidth="0.5" opacity="0.2" />

      {/* 본체 — 기하학적 다면체 (수학 모티프) */}
      <polygon
        points="100,20 170,70 155,150 45,150 30,70"
        fill="#1e1b4b"
        stroke="#a855f7"
        strokeWidth="2.5"
      />

      {/* 내부 삼각형 패턴 */}
      <polygon
        points="100,40 150,80 50,80"
        fill="none"
        stroke="#c084fc"
        strokeWidth="1"
        opacity="0.6"
      />
      <polygon
        points="100,55 135,90 65,90"
        fill="none"
        stroke="#e879f9"
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* 눈 — 위협적 삼각형 눈 */}
      <polygon
        points="70,90 85,80 85,100"
        fill="#ef4444"
        opacity="0.9"
      />
      <polygon
        points="130,90 115,80 115,100"
        fill="#ef4444"
        opacity="0.9"
      />

      {/* 눈 빛 (하이라이트) */}
      <circle cx="78" cy="90" r="2" fill="#fca5a5" />
      <circle cx="122" cy="90" r="2" fill="#fca5a5" />

      {/* 입 — 날카로운 지그재그 */}
      <polyline
        points="65,120 75,115 85,125 95,115 105,125 115,115 125,125 135,120"
        fill="none"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 보스 크라운 (수학 기호) */}
      <text
        x="100"
        y="170"
        textAnchor="middle"
        fill="#c084fc"
        fontSize="16"
        fontFamily="monospace"
        fontWeight="bold"
        opacity="0.7"
      >
        BOSS
      </text>

      {/* 네온 엣지 하이라이트 */}
      <polygon
        points="100,20 170,70 155,150 45,150 30,70"
        fill="none"
        stroke="#e879f9"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  )
}
