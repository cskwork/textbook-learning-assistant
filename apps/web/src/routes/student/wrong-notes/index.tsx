// apps/web/src/routes/student/wrong-notes/index.tsx
// 오답노트 페이지 — 필터 + 목록 조합
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { WrongNoteFilter } from '@/components/wrong-notes/WrongNoteFilter'
import { WrongNoteList } from '@/components/wrong-notes/WrongNoteList'

export default function WrongNotesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [filterUnit, setFilterUnit] = useState<string | undefined>(undefined)
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined)

  const studentId = user?.email ?? ''

  function handleRetry(questionId: number) {
    navigate(`/student/quiz/${questionId}`)
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
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
    </div>
  )
}
