/**
 * FunModeAnalytics -- RPG 스탯 화면 스타일 분석 대시보드
 *
 * 기존 분석 데이터/로직을 재사용하면서 네온 다크 비주얼로 오버라이드.
 * - 능력치 요약: ShieldIcon / LightningIcon / SwordIcon + NeonText
 * - 차트 컨테이너: GlassCard 래핑 + 네온 그라데이션
 * - 취약 유형: "위험 지역" 스타일 카드
 * - 학습 트렌드: 네온 라인 + 다크 그리드 배경
 */

import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/db'
import {
  getCategoryAccuracy,
  getDailyStats,
  getOverallStats,
  getWeakCategories,
} from '@/services/analytics.service'
import { getStreak } from '@/services/streak.service'
import { GlassCard, NeonText, NeonBorder } from '@/components/game/ui'
import {
  ShieldIcon,
  LightningIcon,
  SwordIcon,
  SkullIcon,
  FlameIcon,
  StarIcon,
} from '@/components/game/icons'
import { StatHexagon } from '@/components/profile/StatHexagon'
import { GameLoadingSpinner } from '@/components/game/GameLoadingSpinner'

/** 카테고리 정확도 */
type CatAccuracy = { category: string; accuracy: number; total: number }
/** 일별 통계 */
type DailyStat = { date: string; count: number; correct: number }
/** 전체 통계 */
type OverallStats = { total: number; correct: number; accuracy: number; totalTimeSeconds: number }
/** 취약 유형 */
type WeakCategory = { category: string; pL: number }
/** 스트릭 */
type StreakData = { current: number; max: number }

export function FunModeAnalytics() {
  const { user } = useAuth()

  const [days] = useState(14)
  const [catAccuracy, setCatAccuracy] = useState<CatAccuracy[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([])
  const [overall, setOverall] = useState<OverallStats>({ total: 0, correct: 0, accuracy: 0, totalTimeSeconds: 0 })
  const [weakCats, setWeakCats] = useState<WeakCategory[]>([])
  const [streak, setStreak] = useState<StreakData>({ current: 0, max: 0 })
  const [loading, setLoading] = useState(true)

  const attemptCount = useLiveQuery(
    () => user ? db.quizAttempts.where('studentId').equals(user.email).count() : 0,
    [user?.email],
  )

  useEffect(() => {
    if (!user) return
    const sid = user.email

    async function load() {
      const [ca, ds, ov, wc, st] = await Promise.all([
        getCategoryAccuracy(sid),
        getDailyStats(sid, days),
        getOverallStats(sid),
        getWeakCategories(sid),
        getStreak(sid),
      ])
      setCatAccuracy(ca)
      setDailyStats(ds)
      setOverall(ov)
      setWeakCats(wc)
      setStreak(st)
      setLoading(false)
    }

    load()
  }, [user, attemptCount, days])

  if (loading || !user) return <GameLoadingSpinner />

  // StatHexagon 데이터: 카테고리 정확도 기반 (최대 6축)
  const hexStats = catAccuracy
    .slice(0, 6)
    .map(c => c.accuracy)

  // 부족한 축 채우기
  while (hexStats.length < 6) hexStats.push(0)

  // 평균 풀이 시간 (초)
  const avgTime = overall.total > 0
    ? Math.round(overall.totalTimeSeconds / overall.total)
    : 0

  return (
    <div
      className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto space-y-5"
      style={{ background: 'var(--fun-bg-primary)', color: 'var(--fun-text-primary)' }}
    >
      {/* 타이틀 */}
      <div className="flex items-center gap-3">
        <ShieldIcon size={28} color="var(--fun-neon-cyan)" glow />
        <NeonText as="h1" color="cyan" glow="high" className="text-xl font-black">
          RPG 스탯 분석
        </NeonText>
      </div>

      {/* 능력치 요약 카드 3종 */}
      <div className="grid grid-cols-3 gap-3">
        {/* 정확도 */}
        <NeonBorder color="cyan">
          <GlassCard className="p-4 text-center">
            <ShieldIcon size={24} color="var(--fun-neon-cyan)" glow className="mx-auto mb-2" />
            <NeonText color="cyan" glow="high" className="text-2xl font-black">
              {overall.accuracy}%
            </NeonText>
            <p className="text-[10px] mt-1" style={{ color: 'var(--fun-text-muted)' }}>
              방어력 (정확도)
            </p>
          </GlassCard>
        </NeonBorder>

        {/* 속도 */}
        <NeonBorder color="gold">
          <GlassCard className="p-4 text-center">
            <LightningIcon size={24} color="var(--fun-neon-gold)" glow className="mx-auto mb-2" />
            <NeonText color="gold" glow="high" className="text-2xl font-black">
              {avgTime}s
            </NeonText>
            <p className="text-[10px] mt-1" style={{ color: 'var(--fun-text-muted)' }}>
              민첩성 (평균 속도)
            </p>
          </GlassCard>
        </NeonBorder>

        {/* 공격력 */}
        <NeonBorder color="magenta">
          <GlassCard className="p-4 text-center">
            <SwordIcon size={24} color="var(--fun-neon-magenta)" glow className="mx-auto mb-2" />
            <NeonText color="magenta" glow="high" className="text-2xl font-black">
              {overall.total}
            </NeonText>
            <p className="text-[10px] mt-1" style={{ color: 'var(--fun-text-muted)' }}>
              공격력 (총 풀이수)
            </p>
          </GlassCard>
        </NeonBorder>
      </div>

      {/* 스트릭 + 연속 기록 */}
      <GlassCard className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlameIcon size={24} color="var(--fun-neon-gold)" glow />
          <div>
            <NeonText color="gold" glow="medium" className="text-lg font-black">
              {streak.current}일 연속
            </NeonText>
            <p className="text-[10px]" style={{ color: 'var(--fun-text-muted)' }}>
              최고 기록: {streak.max}일
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(streak.current, 7) }).map((_, i) => (
            <FlameIcon key={i} size={16} color="var(--fun-neon-gold)" glow />
          ))}
        </div>
      </GlassCard>

      {/* 육각형 능력치 차트 */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <StarIcon size={18} color="var(--fun-neon-cyan)" glow />
          <NeonText color="cyan" glow="low" className="text-sm font-bold">
            유형별 능력치
          </NeonText>
        </div>
        <div className="flex justify-center">
          <StatHexagon
            stats={hexStats}
            labels={catAccuracy.slice(0, 6).map(c => c.category)}
            size={220}
          />
        </div>
      </GlassCard>

      {/* 위험 지역 -- 취약 유형 카드 */}
      {weakCats.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <SkullIcon size={20} color="var(--fun-neon-red)" glow />
            <NeonText color="magenta" glow="low" className="text-sm font-bold">
              위험 지역
            </NeonText>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weakCats.slice(0, 4).map(wc => (
              <GlassCard key={wc.category} className="p-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    border: '2px solid var(--fun-neon-red)',
                    boxShadow: '0 0 8px var(--fun-neon-red)',
                  }}
                >
                  <SkullIcon size={20} color="var(--fun-neon-red)" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--fun-text-primary)' }}>
                    {wc.category}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--fun-text-muted)' }}>
                    오답 확률 {Math.round(wc.pL * 100)}%
                  </p>
                </div>
                {/* 위험도 바 */}
                <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: 'var(--fun-bg-tertiary)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(wc.pL * 100)}%`,
                      background: 'linear-gradient(90deg, var(--fun-neon-red), var(--fun-neon-magenta))',
                    }}
                  />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* 학습 트렌드 -- 네온 라인 차트 (CSS 기반 간이 차트) */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <LightningIcon size={18} color="var(--fun-neon-gold)" glow />
          <NeonText color="gold" glow="low" className="text-sm font-bold">
            최근 {days}일 학습 추이
          </NeonText>
        </div>
        {dailyStats.length > 0 ? (
          <div className="flex items-end gap-1 h-32">
            {dailyStats.map((ds, i) => {
              const maxCount = Math.max(...dailyStats.map(d => d.count), 1)
              const h = (ds.count / maxCount) * 100
              const acc = ds.count > 0 ? ds.correct / ds.count : 0
              return (
                <div
                  key={i}
                  className="flex-1 relative group"
                  style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
                >
                  <div
                    className="w-full rounded-t-sm transition-all duration-300"
                    style={{
                      height: `${Math.max(h, 4)}%`,
                      background: acc >= 0.8
                        ? 'var(--fun-neon-cyan)'
                        : acc >= 0.5
                          ? 'var(--fun-neon-gold)'
                          : 'var(--fun-neon-red)',
                      boxShadow: `0 0 6px ${acc >= 0.8 ? 'var(--fun-neon-cyan)' : acc >= 0.5 ? 'var(--fun-neon-gold)' : 'var(--fun-neon-red)'}`,
                      opacity: 0.85,
                    }}
                  />
                  {/* 툴팁 (호버) */}
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                    <div
                      className="px-2 py-1 rounded text-[9px] whitespace-nowrap"
                      style={{ background: 'var(--fun-bg-secondary)', color: 'var(--fun-text-primary)' }}
                    >
                      {ds.date.slice(5)} | {ds.count}문제 | {Math.round(acc * 100)}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center">
            <NeonText color="cyan" glow="low" className="text-xs">
              아직 데이터가 없습니다
            </NeonText>
          </div>
        )}
      </GlassCard>

      {/* 유형별 정답률 바 차트 */}
      {catAccuracy.length > 0 && (
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <SwordIcon size={18} color="var(--fun-neon-magenta)" glow />
            <NeonText color="magenta" glow="low" className="text-sm font-bold">
              유형별 전투력
            </NeonText>
          </div>
          <div className="space-y-2">
            {catAccuracy.map(ca => (
              <div key={ca.category} className="flex items-center gap-3">
                <span className="text-[10px] font-semibold w-20 truncate" style={{ color: 'var(--fun-text-secondary)' }}>
                  {ca.category}
                </span>
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--fun-bg-tertiary)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${ca.accuracy}%`,
                      background: ca.accuracy >= 80
                        ? 'linear-gradient(90deg, var(--fun-neon-cyan), var(--fun-neon-green))'
                        : ca.accuracy >= 50
                          ? 'linear-gradient(90deg, var(--fun-neon-gold), var(--fun-neon-cyan))'
                          : 'linear-gradient(90deg, var(--fun-neon-red), var(--fun-neon-gold))',
                      boxShadow: '0 0 6px var(--fun-neon-cyan)',
                    }}
                  />
                </div>
                <NeonText color="cyan" glow="low" className="text-xs font-bold w-10 text-right">
                  {ca.accuracy}%
                </NeonText>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
