/**
 * 로그인 페이지
 *
 * - 이메일 + 비밀번호 폼
 * - 서버의 구체적 에러 메시지 그대로 표시 ("가입되지 않은 이메일입니다" 등)
 * - 성공 시: isOnboarded=false → /onboarding, isOnboarded=true → / (홈)
 * - 반응형: 모바일 전체 너비, 태블릿/데스크톱 중앙 카드 (max-w-md mx-auto)
 */

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

    if (!email.trim()) {
      setError('이메일을 입력해주세요')
      return
    }
    if (!password) {
      setError('비밀번호를 입력해주세요')
      return
    }

    setIsSubmitting(true)
    try {
      const user = await login(email, password)
      // isOnboarded 여부에 따라 이동 경로 결정
      if (!user.isOnboarded) {
        navigate('/onboarding')
      } else {
        navigate('/')
      }
    } catch (err) {
      if (isApiError(err)) {
        // 서버의 구체적 에러 메시지 그대로 표시
        setError(err.error)
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30 px-4 py-8">
      {/* 앱 로고 */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
          <GraduationCap className="w-8 h-8 text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">기출 학습 도우미</h1>
          <p className="text-sm text-muted-foreground mt-1">수학 기출문제 학습 플랫폼</p>
        </div>
      </div>

      {/* 로그인 카드 */}
      <Card className="w-full max-w-sm rounded-[24px] border-none shadow-xl shadow-black/5 bg-white/80 dark:bg-card/60 backdrop-blur-xl">
        <CardHeader className="space-y-2 pb-6 pt-8 px-8">
          <CardTitle className="text-2xl font-bold text-center tracking-tight">로그인</CardTitle>
          <CardDescription className="text-center text-sm">
            이메일과 비밀번호를 입력해주세요
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* 이메일 입력 */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
                className="h-11 rounded-xl bg-muted/50 focus-visible:bg-transparent"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isSubmitting}
                className="h-11 rounded-xl bg-muted/50 focus-visible:bg-transparent"
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p
                className="text-sm text-destructive font-medium bg-destructive/10 px-3 py-2 rounded-lg"
                role="alert"
              >
                {error}
              </p>
            )}

            {/* 제출 버튼 */}
            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-base font-semibold shadow-sm hover:-translate-y-0.5 transition-transform mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </Button>

            {/* 회원가입 링크 */}
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                계정이 없으신가요?{' '}
                <Link
                  to="/register"
                  className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
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
