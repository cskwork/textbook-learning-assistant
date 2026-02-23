/**
 * StatHexagon -- SVG 기반 육각형 능력치 차트
 *
 * 6축: 정확도, 속도, 스트릭, 총 문제수, 평균 난이도, 콤보력
 */

import { motion } from 'framer-motion'

interface StatHexagonProps {
  /** 6축 값 (0~100 배열, 순서: 정확도/속도/스트릭/문제수/난이도/콤보) */
  stats: number[]
  size?: number
  className?: string
}

const LABELS = ['정확도', '속도', '스트릭', '문제수', '난이도', '콤보']
const CENTER = 100
const RADIUS = 80

function polarToCart(angle: number, r: number): [number, number] {
  const rad = ((angle - 90) * Math.PI) / 180
  return [CENTER + r * Math.cos(rad), CENTER + r * Math.sin(rad)]
}

function hexPoints(r: number): string {
  return Array.from({ length: 6 }, (_, i) => polarToCart(i * 60, r).join(',')).join(' ')
}

function dataPoints(stats: number[]): string {
  return stats
    .map((val, i) => {
      const r = (Math.min(100, Math.max(0, val)) / 100) * RADIUS
      return polarToCart(i * 60, r).join(',')
    })
    .join(' ')
}

export function StatHexagon({ stats, size = 220, className = '' }: StatHexagonProps) {
  const s = stats.length >= 6 ? stats.slice(0, 6) : [...stats, ...Array(6 - stats.length).fill(0)]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
    >
      {/* Guide hexagons */}
      {[0.33, 0.66, 1].map(scale => (
        <polygon
          key={scale}
          points={hexPoints(RADIUS * scale)}
          fill="none"
          stroke="var(--fun-glass-border)"
          strokeWidth={0.5}
        />
      ))}

      {/* Axis lines */}
      {Array.from({ length: 6 }, (_, i) => {
        const [x, y] = polarToCart(i * 60, RADIUS)
        return (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="var(--fun-glass-border)"
            strokeWidth={0.5}
          />
        )
      })}

      {/* Data polygon */}
      <motion.polygon
        points={dataPoints(s)}
        fill="rgba(0, 212, 255, 0.2)"
        stroke="var(--fun-neon-cyan)"
        strokeWidth={1.5}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
      />

      {/* Data dots */}
      {s.map((val, i) => {
        const r = (val / 100) * RADIUS
        const [cx, cy] = polarToCart(i * 60, r)
        return (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={3}
            fill="var(--fun-neon-cyan)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(0, 212, 255, 0.6))' }}
          />
        )
      })}

      {/* Labels */}
      {LABELS.map((label, i) => {
        const [x, y] = polarToCart(i * 60, RADIUS + 16)
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--fun-text-secondary)"
            fontSize={9}
            fontWeight={600}
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}
