// 학생 문제집 목록 페이지 — 카드 그리드 + 정렬 UI
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/motion/FadeIn'
import { WorkbookList } from '@/components/workbook/WorkbookList'
import { useAuth } from '@/contexts/AuthContext'

export default function WorkbooksPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent')

  // 칩 스타일 공통 클래스
  const chipBase =
    'px-3 py-1.5 rounded-full text-sm font-medium border border-border/60 bg-white dark:bg-card text-muted-foreground hover:bg-muted/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30'
  const chipActive =
    'bg-primary/10 text-primary border-primary/30 font-semibold hover:bg-primary/15'

  return (
    <FadeIn className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      {/* 상단 영역: 제목 + 정렬 토글 + 새 문제집 버튼 */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold mr-auto">내 문제집</h1>
        {/* 정렬 칩 토글 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSortBy('recent')}
            className={cn(chipBase, sortBy === 'recent' && chipActive)}
          >
            최신순
          </button>
          <button
            type="button"
            onClick={() => setSortBy('name')}
            className={cn(chipBase, sortBy === 'name' && chipActive)}
          >
            이름순
          </button>
        </div>
        <Button onClick={() => navigate('/student/workbooks/create')} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          새 문제집
        </Button>
      </div>

      <WorkbookList
        studentId={user?.email ?? ''}
        sortBy={sortBy}
        onPlay={(workbookId) => navigate(`/student/workbooks/${workbookId}/play`)}
      />
    </FadeIn>
  )
}
