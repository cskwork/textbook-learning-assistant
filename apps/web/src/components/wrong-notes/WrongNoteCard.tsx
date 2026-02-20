// apps/web/src/components/wrong-notes/WrongNoteCard.tsx
// 오답 카드 — 메타데이터 뱃지 + 다시 풀기 + 완전 학습 버튼
import { XCircle, RotateCcw, CheckCircle2, Bookmark } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { WrongNote } from '@/lib/db'

interface WrongNoteCardProps {
  wrongNote: WrongNote
  onRetry: (questionId: number) => void      // '다시 풀기' 클릭 핸들러
  onMastered: (wrongNoteId: number) => void  // '완전 학습' 클릭 핸들러
}

export function WrongNoteCard({ wrongNote, onRetry, onMastered }: WrongNoteCardProps) {
  function handleMastered() {
    if (window.confirm('이 문제를 오답노트에서 제거합니까?')) {
      onMastered(wrongNote.id)
    }
  }

  const lastWrongDate = wrongNote.lastWrongAt > 0
    ? new Date(wrongNote.lastWrongAt).toLocaleDateString('ko-KR')
    : null

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* 메타데이터 뱃지 행 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="default" className="text-xs">
            {wrongNote.subject}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {wrongNote.unit}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {wrongNote.questionCategory}
          </Badge>
          {wrongNote.isBookmarked && (
            <Bookmark className="size-4 text-yellow-500 fill-yellow-400 ml-auto" />
          )}
        </div>

        {/* 오답 통계 + 날짜 */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <XCircle className="size-4 text-destructive" />
            {wrongNote.wrongCount}회 틀림
          </span>
          {lastWrongDate && (
            <span>마지막 오답: {lastWrongDate}</span>
          )}
        </div>

        {/* 버튼 행 */}
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="default"
            className="flex items-center gap-1.5"
            onClick={() => onRetry(wrongNote.questionId)}
          >
            <RotateCcw className="size-3.5" />
            다시 풀기
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1.5"
            onClick={handleMastered}
          >
            <CheckCircle2 className="size-3.5" />
            완전 학습
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
