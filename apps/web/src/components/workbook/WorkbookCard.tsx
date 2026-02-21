// apps/web/src/components/workbook/WorkbookCard.tsx
// 문제집 카드 — AnimatedCard 래퍼 + 제목/뱃지/날짜/풀기/삭제 버튼
import { Play, Trash2 } from 'lucide-react'
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedCard } from '@/components/motion/AnimatedCard'
import type { Workbook } from '@/lib/db'

interface WorkbookCardProps {
  workbook: Workbook
  onPlay: (id: number) => void
  onDelete: (id: number) => void
}

export function WorkbookCard({ workbook, onPlay, onDelete }: WorkbookCardProps) {
  function handleDelete() {
    if (window.confirm('문제집을 삭제하시겠습니까?')) {
      onDelete(workbook.id)
    }
  }

  const createdDate = new Date(workbook.createdAt).toLocaleDateString('ko-KR')
  const lastPlayedDate = workbook.lastPlayedAt
    ? new Date(workbook.lastPlayedAt).toLocaleDateString('ko-KR')
    : null

  return (
    <AnimatedCard className="border border-border/50 shadow-sm overflow-hidden flex flex-col">
      {/* 상단: 제목 */}
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-foreground/90">{workbook.title}</CardTitle>
      </CardHeader>

      {/* 중앙: 문제 수 + 필터 뱃지 + 날짜 */}
      <CardContent className="px-5 pb-5 pt-2 flex-1 space-y-4">
        {/* 문제 수 + 필터 요약 뱃지 */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-2.5 bg-primary/10 text-primary hover:bg-primary/20 border-none">
            {workbook.questionIds.length}문제
          </Badge>
          {workbook.filters.subject && (
            <Badge variant="outline" className="rounded-md border-border/60 text-muted-foreground font-medium">
              {workbook.filters.subject}
            </Badge>
          )}
          {workbook.filters.unit && (
            <Badge variant="outline" className="rounded-md border-border/60 text-muted-foreground font-medium">
              {workbook.filters.unit}
            </Badge>
          )}
        </div>

        {/* 날짜 정보 */}
        <div className="flex flex-col gap-1 mt-auto">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground/80">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>생성일: {createdDate}</span>
          </div>
          {lastPlayedDate && (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground/80">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>마지막 풀이: {lastPlayedDate}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* 바닥: 풀기 버튼 + 삭제 아이콘 */}
      <CardFooter className="p-4 pt-0 gap-3 border-t border-border/10 bg-muted/10 mt-auto">
        <Button
          size="sm"
          variant="default"
          className="flex-1 rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform"
          onClick={() => onPlay(workbook.id)}
        >
          <Play className="w-4 h-4 mr-1.5 fill-current" />
          풀기
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-xl text-destructive/80 hover:text-destructive hover:bg-destructive/10 shrink-0 h-9 w-9"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </AnimatedCard>
  )
}
