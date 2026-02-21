/**
 * 온보딩 페이지 — 역할 선택 (학생 / 강사)
 *
 * 디자인: 스텝 진행 인디케이터 + Framer Motion 카드 애니메이션 + 완료 축하 효과
 * - step 1 (select): 역할 선택 카드 stagger 애니메이션
 * - step 2 (complete): 체크마크 + 콘페티 축하 애니메이션 → 1.5초 후 자동 이동
 */

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { GraduationCap, BookOpenCheck, Users, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuth, isApiError } from '@/contexts/AuthContext'

// ── 콘페티 파티클 미리 계산 (컴포넌트 외부 상수) ──
const CONFETTI_PARTICLES = [
  { x: -72, y: -64, scale: 1.2, rotate: 45,  delay: 0,    color: 'bg-primary' },
  { x:  68, y: -70, scale: 0.8, rotate: 120, delay: 0.05, color: 'bg-success' },
  { x:  80, y:  24, scale: 1.0, rotate: 200, delay: 0.08, color: 'bg-warning' },
  { x:  40, y:  72, scale: 1.3, rotate: 300, delay: 0.02, color: 'bg-info' },
  { x: -60, y:  68, scale: 0.9, rotate: 75,  delay: 0.1,  color: 'bg-primary' },
  { x: -80, y: -16, scale: 0.7, rotate: 240, delay: 0.06, color: 'bg-success' },
  { x:  24, y: -80, scale: 1.1, rotate: 160, delay: 0.12, color: 'bg-warning' },
  { x: -32, y:  80, scale: 0.8, rotate: 330, delay: 0.04, color: 'bg-info' },
]

// ── 공통 easing ──
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const

export default function OnboardingPage() {
  const { user, setRole } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<'select' | 'complete'>('select')
  const [selectedRole, setSelectedRole] = useState<'student' | 'instructor' | null>(null)
  const [completedRole, setCompletedRole] = useState<'student' | 'instructor' | null>(null)
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
      // 축하 애니메이션 단계로 전환
      setCompletedRole(role)
      setStep('complete')
      // 1.5초 후 해당 역할 홈으로 이동
      setTimeout(() => {
        navigate(updatedUser.role === 'student' ? '/student' : '/instructor')
      }, 1500)
    } catch (err) {
      setError(isApiError(err) ? err.error : '역할 설정 중 오류가 발생했습니다. 다시 시도해주세요.')
      setSelectedRole(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const roleName = completedRole === 'student' ? '학생' : '강사'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-background">
      {/* ── 데코 배경 블러 원 ── */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-emerald-500/4 blur-3xl" />

      {/* ── 스텝 진행 인디케이터 ── */}
      <div className="flex items-center gap-2 mb-8">
        {/* 스텝 1 도트 */}
        <div className={cn(
          'w-2 h-2 rounded-full transition-colors duration-300',
          step === 'select' ? 'bg-primary' : 'bg-primary/40',
        )} />
        {/* 커넥터 라인 */}
        <div className={cn(
          'h-0.5 w-8 rounded-full transition-colors duration-500',
          step === 'complete' ? 'bg-primary' : 'bg-muted',
        )} />
        {/* 스텝 2 도트 */}
        <div className={cn(
          'w-2 h-2 rounded-full transition-colors duration-300',
          step === 'complete' ? 'bg-primary' : 'bg-muted',
        )} />
        {/* 텍스트 */}
        <p className="ml-2 text-xs text-muted-foreground tabular-nums">
          {step === 'select' ? '1' : '2'} / 2 단계
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'select' ? (
          /* ══════════════════════════════════
             step === 'select': 역할 선택 화면
             ══════════════════════════════════ */
          <motion.div
            key="select"
            className="w-full flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* ── 헤더 ── */}
            <motion.div
              className="flex flex-col items-center gap-3 mb-8 relative"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0 }}
            >
              <div className="w-12 h-12 rounded-2xl cta-gradient flex items-center justify-center shadow-lg shadow-primary/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-[1.6rem] font-extrabold text-foreground tracking-tight">어떤 역할로 사용하시나요?</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.email} 님, 역할을 선택하면 맞춤 기능을 제공합니다.
                </p>
              </div>
            </motion.div>

            {/* ── 역할 선택 카드 ── */}
            <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 학생 카드 */}
              <motion.button
                onClick={() => handleRoleSelect('student')}
                disabled={isSubmitting}
                className={cn(
                  'stat-accent-blue group relative flex flex-col items-center gap-5 p-8 rounded-2xl',
                  'bg-white dark:bg-card border-2',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  selectedRole === 'student'
                    ? 'border-[var(--stat-color)] shadow-xl shadow-[var(--stat-bg)]'
                    : 'border-transparent shadow-md',
                  isSubmitting && selectedRole !== 'student' && 'opacity-40 cursor-not-allowed',
                )}
                type="button"
                aria-label="학생으로 시작하기"
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={!isSubmitting ? { scale: 1.03, y: -4 } : undefined}
                whileTap={!isSubmitting ? { scale: 0.97 } : undefined}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.1 }}
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
              </motion.button>

              {/* 강사 카드 */}
              <motion.button
                onClick={() => handleRoleSelect('instructor')}
                disabled={isSubmitting}
                className={cn(
                  'stat-accent-emerald group relative flex flex-col items-center gap-5 p-8 rounded-2xl',
                  'bg-white dark:bg-card border-2',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  selectedRole === 'instructor'
                    ? 'border-[var(--stat-color)] shadow-xl shadow-[var(--stat-bg)]'
                    : 'border-transparent shadow-md',
                  isSubmitting && selectedRole !== 'instructor' && 'opacity-40 cursor-not-allowed',
                )}
                type="button"
                aria-label="강사로 시작하기"
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={!isSubmitting ? { scale: 1.03, y: -4 } : undefined}
                whileTap={!isSubmitting ? { scale: 0.97 } : undefined}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.25 }}
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
              </motion.button>
            </div>

            {error && (
              <motion.p
                className="mt-4 text-sm text-destructive font-medium bg-destructive/8 px-4 py-2 rounded-xl"
                role="alert"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.p>
            )}

            <p className="mt-8 text-xs text-muted-foreground/60">
              역할은 한 번 설정하면 변경할 수 없습니다.
            </p>
          </motion.div>
        ) : (
          /* ══════════════════════════════════
             step === 'complete': 축하 화면
             ══════════════════════════════════ */
          <motion.div
            key="complete"
            className="flex flex-col items-center gap-6 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
          >
            {/* 콘페티 파티클 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {CONFETTI_PARTICLES.map((p, i) => (
                <motion.span
                  key={i}
                  className={cn('w-3 h-3 rounded-full absolute', p.color)}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                  animate={{
                    x: p.x,
                    y: p.y,
                    scale: p.scale,
                    opacity: 0,
                    rotate: p.rotate,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: p.delay,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>

            {/* 체크마크 아이콘 */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: 0.1,
              }}
              className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-success" />
            </motion.div>

            {/* 환영 텍스트 */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: 0.2 }}
            >
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                환영합니다!
              </h2>
              <p className="text-muted-foreground mt-2">
                <span className="font-semibold text-foreground">{roleName}</span>으로 설정되었습니다.
                <br />
                잠시 후 이동합니다...
              </p>
            </motion.div>

            {/* 진행 점 애니메이션 */}
            <motion.div
              className="flex gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
