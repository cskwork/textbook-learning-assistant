/**
 * 회원가입 페이지
 *
 * - 이메일 + 비밀번호 폼
 * - 비밀번호 8자 이상 클라이언트 검증
 * - 서버 에러(이미 가입된 이메일 등) 폼 하단에 빨간색으로 표시
 * - 성공 시 /onboarding으로 이동
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
import { register as apiRegister } from '@/lib/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 클라이언트 유효성 검사
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
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      // 가입 후 즉시 로그인 (쿠키가 이미 설정되어 있으나 AuthContext user 상태 업데이트를 위해)
      await apiRegister(email, password)
      // 가입 직후 AuthContext.login으로 user 상태 동기화
      // (register API가 이미 쿠키를 설정했으므로 login API 호출 없이 getMe()로 해도 되지만,
      //  명확한 상태 업데이트를 위해 login을 호출)
      await login(email, password)
      navigate('/onboarding')
    } catch (err) {
      if (isApiError(err)) {
        setError(err.error)
      } else {
        setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
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

      {/* 회원가입 카드 */}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            이메일과 비밀번호로 계정을 만드세요
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
                aria-describedby={error ? 'form-error' : undefined}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-1.5">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="8자 이상 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-describedby={error ? 'form-error' : undefined}
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p
                id="form-error"
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
              {isSubmitting ? '가입 중...' : '회원가입'}
            </Button>

            {/* 로그인 링크 */}
            <p className="text-sm text-center text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                로그인
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
