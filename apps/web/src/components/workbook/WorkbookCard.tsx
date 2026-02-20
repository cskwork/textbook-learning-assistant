// apps/web/src/components/workbook/WorkbookCard.tsx
// 문제집 카드 — 제목, 문제 수, 생성일, 풀기/삭제 버튼
import { Play, Trash2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{workbook.title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-3 space-y-2">
        {/* 문제 수 + 필터 요약 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{workbook.questionIds.length}문제</Badge>
          {workbook.filters.subject && (
            <Badge variant="outline" className="text-xs">
              {workbook.filters.subject}
            </Badge>
          )}
          {workbook.filters.unit && (
            <Badge variant="outline" className="text-xs">
              {workbook.filters.unit}
            </Badge>
          )}
        </div>
        {/* 날짜 정보 */}
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>생성일: {createdDate}</p>
          {lastPlayedDate && <p>마지막 풀이: {lastPlayedDate}</p>}
        </div>
      </CardContent>
      <CardFooter className="gap-2 pt-0">
        <Button
          size="sm"
          variant="default"
          className="flex items-center gap-1.5"
          onClick={() => onPlay(workbook.id)}
        >
          <Play className="size-3.5" />
          풀기
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center gap-1.5 text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="size-3.5" />
          삭제
        </Button>
      </CardFooter>
    </Card>
  )
}
