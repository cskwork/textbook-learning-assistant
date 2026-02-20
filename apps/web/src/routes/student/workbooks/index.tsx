// 학생 문제집 목록 페이지
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkbookList } from '@/components/workbook/WorkbookList'
import { useAuth } from '@/contexts/AuthContext'

export default function WorkbooksPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">내 문제집</h1>
        <Button onClick={() => navigate('/student/workbooks/create')} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          새 문제집
        </Button>
      </div>
      <WorkbookList
        studentId={user?.email ?? ''}
        onPlay={(workbookId) => navigate(`/student/workbooks/${workbookId}/play`)}
      />
    </div>
  )
}
