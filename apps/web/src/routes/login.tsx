/**
 * 로그인 페이지
 *
 * 디자인: 데코 서클 + 글래스 카드 + 브랜드 타이포그래피
 */

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { GraduationCap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth, isApiError } from '@/contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('이메일을 입력해주세요'); return }
    if (!password) { setError('비밀번호를 입력해주세요'); return }

    setIsSubmitting(true)
    try {
      const user = await login(email, password)
      navigate(!user.isOnboarded ? '/onboarding' : '/')
    } catch (err) {
      setError(isApiError(err) ? err.error : '로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-background">
      {/* ── 데코 서클 ── */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/6 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-violet-500/5 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/4 w-40 h-40 rounded-full bg-emerald-500/4 blur-2xl" />

      {/* ── 브랜드 영역 ── */}
      <div className="flex flex-col items-center gap-3 mb-10 animate-fade-up stagger-1 relative">
        <div className="w-14 h-14 rounded-2xl cta-gradient flex items-center justify-center shadow-lg shadow-primary/20">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-[1.6rem] font-extrabold text-foreground tracking-tight">기출 학습 도우미</h1>
          <p className="text-sm text-muted-foreground mt-0.5">수학 기출문제 학습 플랫폼</p>
        </div>
      </div>

      {/* ── 로그인 카드 ── */}
      <Card className="w-full max-w-sm rounded-[22px] border-none shadow-xl shadow-black/[0.04] bg-white/85 dark:bg-card/70 backdrop-blur-2xl animate-scale-in stagger-2 relative">
        <CardHeader className="pb-1 pt-7 px-7">
          <h2 className="text-xl font-bold tracking-tight text-center">로그인</h2>
          <p className="text-sm text-muted-foreground text-center mt-1">
            이메일과 비밀번호를 입력해주세요
          </p>
        </CardHeader>

        <CardContent className="px-7 pb-7 pt-4">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
                className="h-11 rounded-xl bg-muted/40 border-transparent focus-visible:bg-white dark:focus-visible:bg-card focus-visible:border-primary/30 focus-visible:shadow-sm transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isSubmitting}
                className="h-11 rounded-xl bg-muted/40 border-transparent focus-visible:bg-white dark:focus-visible:bg-card focus-visible:border-primary/30 focus-visible:shadow-sm transition-all"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium bg-destructive/8 px-3 py-2.5 rounded-xl animate-fade-up" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-sm font-bold shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all mt-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  로그인 중...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  로그인
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            <div className="text-center pt-3">
              <p className="text-sm text-muted-foreground">
                계정이 없으신가요?{' '}
                <Link
                  to="/register"
                  className="text-primary font-bold hover:underline decoration-2 underline-offset-4 transition-colors"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
