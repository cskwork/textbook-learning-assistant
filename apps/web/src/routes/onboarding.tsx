/**
 * 온보딩 페이지 — 역할 선택 (학생 / 강사)
 *
 * - 큰 카드 2개: 학생(Student) / 강사(Instructor)
 * - 각 카드에 아이콘 + 설명 텍스트
 * - 클릭 시 AuthContext.setRole 호출 → 역할별 홈으로 이동
 * - 반응형: 모바일 세로 배치, md: 이상 가로 배치
 * - 이미 온보딩 완료된 사용자가 접근하면 홈으로 리디렉트
 */

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { GraduationCap, BookOpenCheck, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth, isApiError } from '@/contexts/AuthContext'

export default function OnboardingPage() {
  const { user, setRole } = useAuth()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<'student' | 'instructor' | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 이미 온보딩 완료된 사용자 → 홈으로 리디렉트
  if (user?.isOnboarded) {
    return <Navigate to="/" replace />
  }

  // 미인증 사용자 → 로그인으로 리디렉트
  if (!user) {
    return <Navigate to="/login" replace />
  }

  async function handleRoleSelect(role: 'student' | 'instructor') {
    setSelectedRole(role)
    setError('')
    setIsSubmitting(true)

    try {
      const updatedUser = await setRole(role)
      // 역할별 홈으로 이동
      if (updatedUser.role === 'student') {
        navigate('/student')
      } else {
        navigate('/instructor')
      }
    } catch (err) {
      if (isApiError(err)) {
        setError(err.error)
      } else {
        setError('역할 설정 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
      setSelectedRole(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-primary-foreground" />
        </div>
        <p className="text-lg font-bold text-foreground">기출 학습 도우미</p>
      </div>

      <div className="w-full max-w-2xl text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">어떤 역할로 사용하시나요?</h1>
        <p className="text-muted-foreground">
          {user.email} 님, 역할을 선택하면 맞춤 기능을 제공합니다.
        </p>
      </div>

      {/* 역할 선택 카드 — 모바일 세로, md 이상 가로 배치 */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 학생 카드 */}
        <button
          onClick={() => handleRoleSelect('student')}
          disabled={isSubmitting}
          className={cn(
            'group relative flex flex-col items-center gap-4 p-8 rounded-2xl border-2',
            'transition-all duration-200 text-left',
            'hover:border-primary hover:shadow-lg hover:shadow-primary/10',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            selectedRole === 'student'
              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
              : 'border-border bg-card hover:bg-accent/30',
            isSubmitting && selectedRole !== 'student' && 'opacity-50 cursor-not-allowed',
          )}
          type="button"
          aria-label="학생으로 시작하기"
        >
          {/* 아이콘 */}
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center',
            'transition-colors duration-200',
            selectedRole === 'student'
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground',
          )}>
            <BookOpenCheck className="w-8 h-8" />
          </div>

          {/* 텍스트 */}
          <div className="text-center">
            <p className="text-xl font-bold text-foreground mb-1">학생</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              수학 기출문제를 풀고<br />
              AI 맞춤 추천으로<br />
              실력을 키워요
            </p>
          </div>

          {/* 로딩 인디케이터 */}
          {isSubmitting && selectedRole === 'student' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-2xl">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>

        {/* 강사 카드 */}
        <button
          onClick={() => handleRoleSelect('instructor')}
          disabled={isSubmitting}
          className={cn(
            'group relative flex flex-col items-center gap-4 p-8 rounded-2xl border-2',
            'transition-all duration-200 text-left',
            'hover:border-primary hover:shadow-lg hover:shadow-primary/10',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            selectedRole === 'instructor'
              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
              : 'border-border bg-card hover:bg-accent/30',
            isSubmitting && selectedRole !== 'instructor' && 'opacity-50 cursor-not-allowed',
          )}
          type="button"
          aria-label="강사로 시작하기"
        >
          {/* 아이콘 */}
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center',
            'transition-colors duration-200',
            selectedRole === 'instructor'
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground',
          )}>
            <Users className="w-8 h-8" />
          </div>

          {/* 텍스트 */}
          <div className="text-center">
            <p className="text-xl font-bold text-foreground mb-1">강사</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              문제를 출제하고<br />
              학생 학습 현황을<br />
              관리하세요
            </p>
          </div>

          {/* 로딩 인디케이터 */}
          {isSubmitting && selectedRole === 'instructor' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-2xl">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="mt-4 text-sm text-destructive font-medium" role="alert">
          {error}
        </p>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        역할은 한 번 설정하면 변경할 수 없습니다.
      </p>
    </div>
  )
}
