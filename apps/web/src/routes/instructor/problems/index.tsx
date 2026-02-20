// apps/web/src/routes/instructor/problems/index.tsx
// 강사 문제 목록 페이지 — /instructor/problems
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { QuestionList } from '@/components/questions/QuestionList'
import { PlusCircle } from 'lucide-react'

export default function InstructorProblemsPage() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">문제 목록</h1>
          <p className="text-sm text-muted-foreground">등록된 수학 문제를 관리합니다</p>
        </div>
        <Button asChild>
          <Link to="/instructor/problems/new">
            <PlusCircle className="w-4 h-4 mr-2" />
            새 문제 등록
          </Link>
        </Button>
      </div>

      <QuestionList basePath="/instructor/problems" />
    </div>
  )
}
