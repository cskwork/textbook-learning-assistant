/**
 * 유형별 정답률 BarChart 컴포넌트 (REPT-01)
 *
 * Props:
 *   data: { category: string; accuracy: number; total: number }[]
 *
 * - accuracy 오름차순 정렬 (취약 유형 먼저 표시)
 * - 최대 10개 유형 표시
 * - 빈 데이터 상태 처리
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

/** 유형별 정답률 데이터 타입 */
export interface AccuracyData {
  category: string
  accuracy: number
  total: number
}

interface AccuracyBarChartProps {
  data: AccuracyData[]
}

const chartConfig = {
  accuracy: {
    label: '정답률 (%)',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

export function AccuracyBarChart({ data }: AccuracyBarChartProps) {
  // 데이터 없을 때 안내 메시지
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-muted-foreground text-sm">
        아직 풀이 데이터가 없습니다
      </div>
    )
  }

  // accuracy 오름차순 정렬 (취약 유형 먼저) + 최대 10개
  const sortedData = [...data]
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10)

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart data={sortedData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="category"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={50}
        />
        <YAxis
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => (
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{value}%</span>
                  <span className="text-muted-foreground text-xs">
                    총 {item.payload?.total ?? 0}문제
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="accuracy" fill="var(--color-accuracy)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
