// apps/web/src/routes/student/problems/index.tsx
// 학생 문제 목록 페이지 — QuestionList를 basePath="/student/quiz"로 재사용
import { useState } from 'react'
import { QuestionList } from '@/components/questions/QuestionList'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Question } from '@/lib/db'

// 과목 필터 옵션 목록
const SUBJECT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: '전체' },
  { value: '수학I', label: '수학I' },
  { value: '수학II', label: '수학II' },
  { value: '미적분', label: '미적분' },
  { value: '확률과통계', label: '확률과통계' },
  { value: '기하', label: '기하' },
]

export default function StudentProblemsPage() {
  const [filterSubject, setFilterSubject] = useState<Question['subject'] | undefined>(undefined)

  function handleSubjectChange(value: string) {
    if (value === 'all') {
      setFilterSubject(undefined)
    } else {
      setFilterSubject(value as Question['subject'])
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      {/* 페이지 헤더: 제목 + 과목 필터 */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">문제 목록</h1>

        {/* 과목 필터 셀렉트 */}
        <Select value={filterSubject ?? 'all'} onValueChange={handleSubjectChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 문제 목록 — basePath로 /student/quiz/:id 이동 */}
      <QuestionList filterSubject={filterSubject} basePath="/student/quiz" />
    </div>
  )
}
