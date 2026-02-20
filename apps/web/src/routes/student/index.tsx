/**
 * 학생 홈 페이지
 *
 * Phase 1 플레이스홀더 — 학습 현황 대시보드 스켈레톤
 * Phase 2 이상에서 실제 데이터로 채워질 예정
 */

import { BookOpenCheck, TrendingUp, Target, Clock } from 'lucide-react'
import { Link, Navigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

export default function StudentHomePage() {
  const { user } = useAuth()

  // useLiveQuery 반환값:
  //   undefined  → 쿼리 로딩 중
  //   null       → 쿼리 완료 + 레코드 없음 (신규 사용자)
  //   UserSetting → 쿼리 완료 + 레코드 있음
  const userSetting = useLiveQuery(
    () => user ? db.userSettings.where('userId').equals(user.email).first() : undefined,
    [user?.email],
  )

  // 로딩 중 — undefined인 경우 스피너 표시
  if (userSetting === undefined) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    )
  }

  // 신규 사용자(레코드 없음) 또는 진단 미완료 → 온보딩 퀴즈로 리디렉트
  if (userSetting === null || !userSetting.isDiagnosisCompleted) {
    return <Navigate to="/student/onboarding-quiz" replace />
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* 환영 메시지 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">안녕하세요!</h1>
        <p className="text-muted-foreground mt-1">
          {user?.email} 님의 학습 현황입니다.
        </p>
      </div>

      {/* 요약 통계 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpenCheck className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">오늘 푼 문제</span>
            </div>
            <div className="h-6 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">정답률</span>
            </div>
            <div className="h-6 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">연속 학습</span>
            </div>
            <div className="h-6 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">학습 시간</span>
            </div>
            <div className="h-6 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>

      {/* 문제 풀기 바로가기 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">문제 풀기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            수학 문제를 풀고 실력을 향상시켜 보세요.
          </p>
          <Button asChild className="w-full">
            <Link to="/student/problems">문제 목록 보기</Link>
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Phase 3에서 AI 맞춤 추천 기능이 추가됩니다
          </p>
        </CardContent>
      </Card>

      {/* AI 추천 문제 섹션 (준비 중) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI 추천 문제</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Phase 3에서 실제 문제 추천 기능이 추가됩니다
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
