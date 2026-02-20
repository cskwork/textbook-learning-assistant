/**
 * 온보딩 페이지 — 역할 선택 (학생 / 강사)
 *
 * 디자인: 큰 인터랙티브 카드 + 개별 컬러 악센트 + hover lift
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

  if (user?.isOnboarded) return <Navigate to="/" replace />
  if (!user) return <Navigate to="/login" replace />

  async function handleRoleSelect(role: 'student' | 'instructor') {
    setSelectedRole(role)
    setError('')
    setIsSubmitting(true)
    try {
      const updatedUser = await setRole(role)
      navigate(updatedUser.role === 'student' ? '/student' : '/instructor')
    } catch (err) {
      setError(isApiError(err) ? err.error : '역할 설정 중 오류가 발생했습니다. 다시 시도해주세요.')
      setSelectedRole(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-background">
      {/* ── 데코 ── */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-emerald-500/4 blur-3xl" />

      {/* ── 헤더 ── */}
      <div className="flex flex-col items-center gap-3 mb-8 animate-fade-up stagger-1 relative">
        <div className="w-12 h-12 rounded-2xl cta-gradient flex items-center justify-center shadow-lg shadow-primary/20">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-[1.6rem] font-extrabold text-foreground tracking-tight">어떤 역할로 사용하시나요?</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user.email} 님, 역할을 선택하면 맞춤 기능을 제공합니다.
          </p>
        </div>
      </div>

      {/* ── 역할 선택 카드 ── */}
      <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up stagger-2">
        {/* 학생 카드 */}
        <button
          onClick={() => handleRoleSelect('student')}
          disabled={isSubmitting}
          className={cn(
            'stat-accent-blue group relative flex flex-col items-center gap-5 p-8 rounded-2xl',
            'bg-white dark:bg-card border-2 transition-all duration-300',
            'hover:shadow-xl hover:-translate-y-1',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            selectedRole === 'student'
              ? 'border-[var(--stat-color)] shadow-xl shadow-[var(--stat-bg)] -translate-y-1'
              : 'border-transparent shadow-md hover:border-[var(--stat-color)]',
            isSubmitting && selectedRole !== 'student' && 'opacity-40 cursor-not-allowed scale-[0.98]',
          )}
          type="button"
          aria-label="학생으로 시작하기"
        >
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300',
            selectedRole === 'student'
              ? 'bg-[var(--stat-color)] text-white scale-110'
              : 'bg-[var(--stat-bg-strong)] group-hover:bg-[var(--stat-color)] group-hover:text-white',
          )}>
            <BookOpenCheck className="w-8 h-8" style={{ color: selectedRole === 'student' ? 'white' : 'var(--stat-color)' }} />
          </div>

          <div className="text-center">
            <p className="text-xl font-extrabold text-foreground mb-2">학생</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              수학 기출문제를 풀고<br />
              AI 맞춤 추천으로 실력을 키워요
            </p>
          </div>

          {isSubmitting && selectedRole === 'student' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-card/70 rounded-2xl backdrop-blur-sm">
              <div className="w-7 h-7 border-[3px] border-[var(--stat-color)]/30 border-t-[var(--stat-color)] rounded-full animate-spin" />
            </div>
          )}
        </button>

        {/* 강사 카드 */}
        <button
          onClick={() => handleRoleSelect('instructor')}
          disabled={isSubmitting}
          className={cn(
            'stat-accent-emerald group relative flex flex-col items-center gap-5 p-8 rounded-2xl',
            'bg-white dark:bg-card border-2 transition-all duration-300',
            'hover:shadow-xl hover:-translate-y-1',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            selectedRole === 'instructor'
              ? 'border-[var(--stat-color)] shadow-xl shadow-[var(--stat-bg)] -translate-y-1'
              : 'border-transparent shadow-md hover:border-[var(--stat-color)]',
            isSubmitting && selectedRole !== 'instructor' && 'opacity-40 cursor-not-allowed scale-[0.98]',
          )}
          type="button"
          aria-label="강사로 시작하기"
        >
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300',
            selectedRole === 'instructor'
              ? 'bg-[var(--stat-color)] text-white scale-110'
              : 'bg-[var(--stat-bg-strong)] group-hover:bg-[var(--stat-color)] group-hover:text-white',
          )}>
            <Users className="w-8 h-8" style={{ color: selectedRole === 'instructor' ? 'white' : 'var(--stat-color)' }} />
          </div>

          <div className="text-center">
            <p className="text-xl font-extrabold text-foreground mb-2">강사</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              문제를 출제하고<br />
              학생 학습 현황을 관리하세요
            </p>
          </div>

          {isSubmitting && selectedRole === 'instructor' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-card/70 rounded-2xl backdrop-blur-sm">
              <div className="w-7 h-7 border-[3px] border-[var(--stat-color)]/30 border-t-[var(--stat-color)] rounded-full animate-spin" />
            </div>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive font-medium bg-destructive/8 px-4 py-2 rounded-xl animate-fade-up" role="alert">
          {error}
        </p>
      )}

      <p className="mt-8 text-xs text-muted-foreground/60">
        역할은 한 번 설정하면 변경할 수 없습니다.
      </p>
    </div>
  )
}
