// 문제집 생성 페이지
import { useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkbookCreator } from '@/components/workbook/WorkbookCreator'
import { useAuth } from '@/contexts/AuthContext'

export default function CreateWorkbookPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/student/workbooks')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">새 문제집 만들기</h1>
      </div>
      <WorkbookCreator
        studentId={user?.email ?? ''}
        onCreated={() => navigate('/student/workbooks')}
      />
    </div>
  )
}
