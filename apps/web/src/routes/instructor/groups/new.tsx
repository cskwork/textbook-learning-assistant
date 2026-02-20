/**
 * 새 반 만들기 페이지 (/instructor/groups/new)
 * 반 이름 입력 → 제출 → 초대 코드 표시
 */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { createGroup, getGroup } from '@/services/group.service'

export default function GroupNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [createdGroupId, setCreatedGroupId] = useState<number | null>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !name.trim()) return
    setIsSubmitting(true)
    try {
      const id = await createGroup(user.email, name.trim())
      const group = await getGroup(id)
      if (group) {
        setCreatedGroupId(id)
        setInviteCode(group.inviteCode)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (createdGroupId && inviteCode) {
    return (
      <div className="p-4 md:p-6 max-w-md mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-green-600">반이 생성되었습니다!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              학생들에게 아래 초대 코드를 알려주세요.
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-2xl font-mono tracking-widest px-4 py-2">
                {inviteCode}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              학생은 앱 홈 화면의 "반 참여" 버튼에서 이 코드를 입력합니다.
            </p>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => navigate(`/instructor/groups/${createdGroupId}`)}>
                반 상세 보기
              </Button>
              <Button variant="outline" onClick={() => navigate('/instructor/groups')}>
                목록으로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">새 반 만들기</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="name">반 이름</Label>
          <Input
            id="name"
            placeholder="예: 2025 수능반 A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? '생성 중...' : '반 만들기'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/instructor/groups')}>
            취소
          </Button>
        </div>
      </form>
    </div>
  )
}
