/**
 * 일별 학습 추이 LineChart 컴포넌트 (REPT-02)
 *
 * Props:
 *   data: { date: string; count: number; correct: number }[]
 *
 * - 최근 14일 추이 표시
 * - Line 2개: count(총 풀이), correct(정답)
 * - ChartLegend 포함
 * - 빈 데이터 상태 처리
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'

/** 일별 학습 통계 데이터 타입 */
export interface DailyStatData {
  date: string   // YYYY-MM-DD 또는 MM/DD 포맷
  count: number
  correct: number
}

interface DailyTrendLineChartProps {
  data: DailyStatData[]
}

const chartConfig = {
  count: {
    label: '총 풀이',
    color: 'hsl(var(--chart-1))',
  },
  correct: {
    label: '정답',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

/** YYYY-MM-DD → MM/DD 포맷 변환 */
function formatDate(dateStr: string): string {
  if (dateStr.includes('/')) return dateStr  // 이미 MM/DD 형식
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`
  }
  return dateStr
}

export function DailyTrendLineChart({ data }: DailyTrendLineChartProps) {
  // 데이터 없을 때 안내 메시지
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-muted-foreground text-sm">
        아직 학습 데이터가 없습니다
      </div>
    )
  }

  // 날짜 포맷 변환
  const formattedData = data.map((d) => ({
    ...d,
    date: formatDate(d.date),
  }))

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <LineChart data={formattedData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          interval={1}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          allowDecimals={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="var(--color-count)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="correct"
          stroke="var(--color-correct)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
