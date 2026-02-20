/**
 * 새 반 만들기 페이지 (/instructor/groups/new)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { createGroup, getGroup } from '@/services/group.service'

export default function GroupNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [createdGroupId, setCreatedGroupId] = useState<number | null>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

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

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 생성 완료 상태
  if (createdGroupId && inviteCode) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-scale-in stagger-1 w-full">
          <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card text-center">
            <CardContent className="p-8 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">반이 생성되었습니다!</h2>
                <p className="text-sm text-muted-foreground mt-1">학생들에게 아래 초대 코드를 알려주세요.</p>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-muted/60 hover:bg-muted transition-colors mx-auto"
              >
                <span className="text-3xl font-mono font-black tracking-[0.2em] text-foreground">{inviteCode}</span>
                {copied
                  ? <Check className="w-4 h-4 text-emerald-500" />
                  : <Copy className="w-4 h-4 text-muted-foreground" />
                }
              </button>
              <p className="text-xs text-muted-foreground">
                학생은 앱 홈 화면의 "반 참여"에서 이 코드를 입력합니다.
              </p>
              <div className="flex gap-2 justify-center pt-1">
                <Button className="rounded-xl font-semibold" onClick={() => navigate(`/instructor/groups/${createdGroupId}`)}>
                  반 상세 보기
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => navigate('/instructor/groups')}>
                  목록으로
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-lg mx-auto flex flex-col justify-center min-h-[60vh]">
      <div className="animate-fade-up stagger-1">
        <h1 className="text-[1.65rem] font-extrabold tracking-tight text-foreground mb-1">새 반 만들기</h1>
        <p className="text-sm text-muted-foreground mb-6">반 이름을 입력하면 초대 코드가 자동 생성됩니다.</p>

        <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">반 이름</Label>
                <Input
                  id="name"
                  placeholder="예: 2025 수능반 A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="h-11 rounded-xl bg-muted/40 border-transparent focus-visible:bg-white dark:focus-visible:bg-card focus-visible:border-primary/30 focus-visible:shadow-sm transition-all"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" className="rounded-xl font-semibold flex-1" disabled={isSubmitting || !name.trim()}>
                  {isSubmitting ? '생성 중...' : '반 만들기'}
                </Button>
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => navigate('/instructor/groups')}>
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
