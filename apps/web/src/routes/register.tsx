/**
 * 회원가입 페이지
 *
 * 디자인: 로그인과 동일한 비주얼 언어 — 데코 서클, 글래스 카드
 */

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { GraduationCap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth, isApiError } from '@/contexts/AuthContext'
import { register as apiRegister } from '@/lib/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate(): string {
    if (!email.trim()) return '이메일을 입력해주세요'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '올바른 이메일 형식이 아닙니다'
    if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다'
    return ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setIsSubmitting(true)
    try {
      await apiRegister(email, password)
      await login(email, password)
      navigate('/onboarding')
    } catch (err) {
      setError(isApiError(err) ? err.error : '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-background">
      {/* ── 데코 서클 ── */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 rounded-full bg-violet-500/6 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-amber-500/4 blur-2xl" />

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

      {/* ── 회원가입 카드 ── */}
      <Card className="w-full max-w-sm rounded-[22px] border-none shadow-xl shadow-black/[0.04] bg-white/85 dark:bg-card/70 backdrop-blur-2xl animate-scale-in stagger-2 relative">
        <CardHeader className="pb-1 pt-7 px-7">
          <h2 className="text-xl font-bold tracking-tight text-center">회원가입</h2>
          <p className="text-sm text-muted-foreground text-center mt-1">
            계정을 만들어 학습을 시작하세요
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
                aria-describedby={error ? 'form-error' : undefined}
                className="h-11 rounded-xl bg-muted/40 border-transparent focus-visible:bg-white dark:focus-visible:bg-card focus-visible:border-primary/30 focus-visible:shadow-sm transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="8자 이상 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-describedby={error ? 'form-error' : undefined}
                className="h-11 rounded-xl bg-muted/40 border-transparent focus-visible:bg-white dark:focus-visible:bg-card focus-visible:border-primary/30 focus-visible:shadow-sm transition-all"
              />
              <p className="text-[11px] text-muted-foreground/70 mt-1">8자 이상 영문, 숫자 조합</p>
            </div>

            {error && (
              <p
                id="form-error"
                className="text-sm text-destructive font-medium bg-destructive/8 px-3 py-2.5 rounded-xl animate-fade-up"
                role="alert"
              >
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
                  가입 중...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  회원가입
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            <div className="text-center pt-3">
              <p className="text-sm text-muted-foreground">
                이미 계정이 있으신가요?{' '}
                <Link
                  to="/login"
                  className="text-primary font-bold hover:underline decoration-2 underline-offset-4 transition-colors"
                >
                  로그인
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
