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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      {/* 앱 로고 */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground leading-tight">기출 학습 도우미</p>
          <p className="text-xs text-muted-foreground">수학 기출문제 학습 플랫폼</p>
        </div>
      </div>

      {/* 로그인 카드 */}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
          <CardDescription className="text-center">
            이메일과 비밀번호로 로그인하세요
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* 이메일 입력 */}
            <div className="space-y-1.5">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-1.5">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
            </div>

            {/* 에러 메시지 — 서버의 구체적 메시지 그대로 표시 */}
            {error && (
              <p
                className="text-sm text-destructive font-medium"
                role="alert"
              >
                {error}
              </p>
            )}

            {/* 제출 버튼 */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </Button>

            {/* 회원가입 링크 */}
            <p className="text-sm text-center text-muted-foreground">
              계정이 없으신가요?{' '}
              <Link
                to="/register"
                className="text-primary font-medium hover:underline"
              >
                회원가입
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
