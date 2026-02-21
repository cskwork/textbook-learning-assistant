/**
 * 취약 유형 RadarChart 컴포넌트 (REPT-03)
 *
 * Props:
 *   data: { category: string; pL: number }[]  (P(L) 0~1 값)
 *
 * - pL 값을 퍼센트로 변환하여 0~100 범위로 표시
 * - WEAK_THRESHOLD(40%) 이하 유형 존재 시 amber(warning) 계열 fill (덜 공격적인 톤)
 * - PolarGrid 은은한 stroke 적용
 * - 빈 데이터 상태 처리
 */

import { RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

/** 취약 유형 BKT 데이터 타입 */
export interface WeakTypeData {
  category: string
  pL: number   // P(L) 0~1 범위
}

interface WeakTypeRadarChartProps {
  data: WeakTypeData[]
}

/** P(L) < 0.4이면 취약 유형으로 판별 */
const WEAK_THRESHOLD_PERCENT = 40

const chartConfig = {
  pLPercent: {
    label: '지식 상태 (%)',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

export function WeakTypeRadarChart({ data }: WeakTypeRadarChartProps) {
  // 데이터 없을 때 안내 메시지
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-muted-foreground text-sm">
        유형별 데이터가 충분하지 않습니다 (최소 1문제 필요)
      </div>
    )
  }

  // pL → 퍼센트 변환 (0~100 범위)
  const chartData = data.map((d) => ({
    category: d.category,
    pLPercent: Math.round(d.pL * 100),
    isWeak: d.pL * 100 < WEAK_THRESHOLD_PERCENT,
  }))

  // 취약 유형 존재 여부 확인 (fill 색상 결정)
  const hasWeakCategories = chartData.some((d) => d.isWeak)

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <RadarChart data={chartData} accessibilityLayer>
        {/* 은은한 PolarGrid */}
        <PolarGrid stroke="hsl(var(--muted-foreground) / 0.2)" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fontSize: 12, fontWeight: 500 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => `${value}%`}
            />
          }
        />
        <Radar
          dataKey="pLPercent"
          fill={
            hasWeakCategories
              ? 'hsl(var(--warning, 45 93% 47%))'
              : 'hsl(var(--chart-1))'
          }
          fillOpacity={0.25}
          stroke={
            hasWeakCategories
              ? 'hsl(var(--warning, 45 93% 47%))'
              : 'hsl(var(--chart-1))'
          }
          strokeWidth={2}
        />
      </RadarChart>
    </ChartContainer>
  )
}
