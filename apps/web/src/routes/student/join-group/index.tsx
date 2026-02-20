/**
 * 학생 그룹 참여 페이지 (/student/join-group)
 * 초대 코드 6자리 입력 → 그룹 찾기 → 가입
 */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { findGroupByInviteCode, joinGroup } from '@/services/group.service'

export default function JoinGroupPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !code.trim()) return
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const group = await findGroupByInviteCode(code.trim().toUpperCase())
      if (!group) {
        setError('해당 초대 코드의 반을 찾을 수 없습니다. 코드를 다시 확인해 주세요.')
        return
      }
      await joinGroup(group.id, user.email)
      setSuccess(`"${group.name}" 반에 성공적으로 가입했습니다!`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">반 참여</h1>

      {success ? (
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-green-600 font-medium">{success}</p>
            <Button onClick={() => navigate('/student')}>홈으로</Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="code">초대 코드</Label>
            <Input
              id="code"
              placeholder="6자리 코드 입력 (예: AB1C2D)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="font-mono text-lg tracking-widest text-center uppercase"
              required
            />
            <p className="text-xs text-muted-foreground">
              선생님께 받은 6자리 초대 코드를 입력하세요.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || code.length < 6}>
              {isSubmitting ? '확인 중...' : '반 참여하기'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/student')}>
              취소
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
