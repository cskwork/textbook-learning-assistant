/**
 * 최근 학습 이력 목록
 *
 * useLiveQuery로 최근 quizAttempts 5건 로드 후
 * 각 questionId로 Question 정보 조회하여 과목/단원 표시
 *
 * 빈 상태: "아직 학습 이력이 없어요" 안내 + 문제 풀러 가기 링크
 * FadeIn 래퍼로 stagger 입장 애니메이션 적용
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { CheckCircle2, XCircle, Clock, BookOpen } from 'lucide-react'
import { Link } from 'react-router'
import { FadeIn } from '@/components/motion/FadeIn'

interface RecentActivityListProps {
  /** 학생 ID (user.email) */
  studentId: string
}

/** 소요 시간 포맷: 초 → "1분 30초" 형태 */
function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}초`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s === 0 ? `${m}분` : `${m}분 ${s}초`
}

/** 날짜 포맷: 오늘이면 "오늘 HH:MM", 어제면 "어제", 그 이전이면 "M.D" */
function formatDate(ts: number): string {
  const now = new Date()
  const d = new Date(ts)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86_400_000

  if (ts >= todayStart) {
    return `오늘 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }
  if (ts >= yesterdayStart) return '어제'
  return `${d.getMonth() + 1}.${d.getDate()}`
}

export function RecentActivityList({ studentId }: RecentActivityListProps) {
  // 최근 5건 quizAttempts 조회 (역순 정렬 = 가장 최근 먼저)
  const recentAttempts = useLiveQuery(
    async () => {
      if (!studentId) return []
      const attempts = await db.quizAttempts
        .where('studentId')
        .equals(studentId)
        .reverse()
        .sortBy('attemptedAt')
      return attempts.slice(0, 5)
    },
    [studentId],
  )

  // 문제 정보 로드
  const enrichedAttempts = useLiveQuery(
    async () => {
      if (!recentAttempts || recentAttempts.length === 0) return []
      const questions = await Promise.all(
        recentAttempts.map((a) => db.questions.get(a.questionId)),
      )
      return recentAttempts.map((attempt, i) => ({
        attempt,
        question: questions[i] ?? null,
      }))
    },
    [recentAttempts],
  )

  // 로딩 스켈레톤
  if (enrichedAttempts === undefined) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-muted/40 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  // 빈 상태
  if (enrichedAttempts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">아직 학습 이력이 없어요</p>
          <p className="text-xs text-muted-foreground mt-1">
            문제를 풀면 여기에 기록이 남아요
          </p>
        </div>
        <Link
          to="/student/problems"
          className="text-xs font-semibold text-primary hover:underline"
        >
          문제 풀러 가기 →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {enrichedAttempts.map(({ attempt, question }, idx) => (
        <FadeIn key={attempt.id} delay={idx * 0.05}>
          <Link
            to={`/student/quiz/${attempt.questionId}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-card hover:bg-accent/50 transition-colors group"
          >
            {/* 정오답 아이콘 */}
            <div className="shrink-0">
              {attempt.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
            </div>

            {/* 과목 + 단원 */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">
                {question ? `${question.subject} · ${question.unit}` : '문제 정보 없음'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-[11px] text-muted-foreground">
                  {formatTime(attempt.timeSpent)}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formatDate(attempt.attemptedAt)}
                </span>
              </div>
            </div>

            {/* 정답 여부 배지 */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                attempt.isCorrect
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {attempt.isCorrect ? '정답' : '오답'}
            </span>
          </Link>
        </FadeIn>
      ))}
    </div>
  )
}
