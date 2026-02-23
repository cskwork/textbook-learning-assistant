// apps/web/src/routes/student/wrong-notes/index.tsx
// 오답노트 페이지 — 칩 필터 + 카드 그리드 목록
// [Phase 20] 반전 모드: MonsterCodex lazy 분기
import { lazy, Suspense, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { FadeIn } from '@/components/motion/FadeIn'
import { WrongNoteFilter } from '@/components/wrong-notes/WrongNoteFilter'
import { WrongNoteList } from '@/components/wrong-notes/WrongNoteList'
import { useFunMode } from '@/hooks/useFunMode'
import { GameLoadingSpinner } from '@/components/game/GameLoadingSpinner'

const MonsterCodex = lazy(() =>
  import('@/components/wrong-notes/MonsterCodex').then(m => ({ default: m.MonsterCodex }))
)

export default function WrongNotesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isFunMode } = useFunMode()
  const [filterUnit, setFilterUnit] = useState<string | undefined>(undefined)
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined)

  const studentId = user?.email ?? ''

  function handleRetry(questionId: number) {
    navigate(`/student/quiz/${questionId}`)
  }

  // 반전 모드: 몬스터 도감
  if (isFunMode) {
    return (
      <Suspense fallback={<GameLoadingSpinner />}>
        <MonsterCodex />
      </Suspense>
    )
  }

  return (
    <FadeIn className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">오답노트</h1>
      <WrongNoteFilter
        studentId={studentId}
        filterUnit={filterUnit}
        filterCategory={filterCategory}
        onFilterUnit={setFilterUnit}
        onFilterCategory={setFilterCategory}
      />
      <WrongNoteList
        studentId={studentId}
        filterUnit={filterUnit}
        filterCategory={filterCategory}
        onRetry={handleRetry}
      />
    </FadeIn>
  )
}
