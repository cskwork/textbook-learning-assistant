// gamification.service.ts
// 게이미피케이션 비즈니스 로직 — XP 지급, 스트릭 관리, 뱃지 체크, 리더보드
// Phase 16 보상 시스템

import { db } from '@/lib/db'
import { calculateLevel } from './xp-formula'
import { BADGE_DEFINITIONS, type BadgeCheckContext } from './badge-definitions'

/** 리더보드 항목 */
export interface LeaderboardEntry {
  studentId: string
  displayName: string
  avatarEmoji: string
  totalXP: number
  level: number
  streakDays: number
  rank: number
}

/** getClassLeaderboard 반환 타입 */
export interface ClassLeaderboardResult {
  /** 상위 3명 (1~3등) */
  top3: LeaderboardEntry[]
  /** 현재 사용자 주변 ±2명 (top3와 겹칠 수 있음) */
  surrounding: LeaderboardEntry[]
  /** 현재 사용자 순위 */
  myRank: number
  /** 반 전체 인원 수 */
  total: number
}

/** awardXP 반환 타입 */
export interface AwardXPResult {
  xpAwarded: number
  totalXP: number
  previousLevel: number
  newLevel: number
  leveledUp: boolean
  unlockedBadges: string[]
}

/**
 * XP 지급 — Dexie transaction 내에서 원자적 실행
 * - 프로필 없으면 생성
 * - XP 이벤트 기록
 * - 프로필 totalXP/level 업데이트
 * - 뱃지 체크
 *
 * @param studentId - 학생 이메일
 * @param baseXP - 기본 XP (getBaseXP 결과)
 * @param reason - XP 지급 사유 ('quiz_correct' | 'combo_bonus' | 'streak_bonus' | 'daily_challenge' | 'weekly_challenge')
 * @param comboMultiplier - 콤보 배수 (기본 1)
 */
export async function awardXP(
  studentId: string,
  baseXP: number,
  reason: string,
  comboMultiplier: number = 1,
): Promise<AwardXPResult> {
  return db.transaction('rw', [db.gamificationProfiles, db.xpEvents, db.badges], async () => {
    const now = Date.now()
    const xpAwarded = Math.round(baseXP * comboMultiplier)

    // 기존 프로필 조회 또는 신규 생성
    let profile = await db.gamificationProfiles.where('studentId').equals(studentId).first()
    const previousLevel = profile?.level ?? 1

    if (!profile) {
      // 신규 프로필 생성
      const newId = await db.gamificationProfiles.add({
        studentId,
        totalXP: 0,
        level: 1,
        streakDays: 0,
        lastStudyDate: now,
        updatedAt: now,
      })
      profile = await db.gamificationProfiles.get(newId)!
    }

    const newTotalXP = (profile!.totalXP ?? 0) + xpAwarded
    const newLevel = calculateLevel(newTotalXP)

    // XP 이벤트 기록
    await db.xpEvents.add({
      studentId,
      amount: xpAwarded,
      reason,
      comboMultiplier,
      timestamp: now,
    })

    // 프로필 업데이트
    await db.gamificationProfiles.where('studentId').equals(studentId).modify({
      totalXP: newTotalXP,
      level: newLevel,
      updatedAt: now,
    })

    // 뱃지 체크 — 현재 스트릭 조회 (프로필 최신 상태 반영)
    const updatedProfile = await db.gamificationProfiles.where('studentId').equals(studentId).first()
    const unlockedBadges = await checkAndAwardBadges(
      studentId,
      newTotalXP,
      newLevel,
      updatedProfile?.streakDays ?? 0,
    )

    return {
      xpAwarded,
      totalXP: newTotalXP,
      previousLevel,
      newLevel,
      leveledUp: newLevel > previousLevel,
      unlockedBadges,
    }
  })
}

/**
 * 스트릭 업데이트 — 자정 기준 로컬 타임존
 * - 어제 학습 = 스트릭 증가
 * - 오늘 이미 학습 = 유지 (중복 카운트 방지)
 * - 그 외 = 리셋(1)
 *
 * 스트릭 보너스:
 * - 3일 = 50 XP
 * - 7일 = 150 XP
 * - 14일 = 300 XP
 * - 30일 = 500 XP
 */
export async function updateStreak(studentId: string): Promise<void> {
  return db.transaction('rw', [db.gamificationProfiles, db.xpEvents, db.badges], async () => {
    const now = Date.now()
    const todayString = new Date().toDateString() // 로컬 타임존 기준

    let profile = await db.gamificationProfiles.where('studentId').equals(studentId).first()

    if (!profile) {
      // 프로필 없으면 초기 생성
      await db.gamificationProfiles.add({
        studentId,
        totalXP: 0,
        level: 1,
        streakDays: 1,
        lastStudyDate: now,
        updatedAt: now,
      })
      return
    }

    const lastStudyDate = new Date(profile.lastStudyDate)
    const lastStudyString = lastStudyDate.toDateString()

    // 오늘 이미 학습했으면 스트릭 유지 (아무것도 하지 않음)
    if (lastStudyString === todayString) {
      return
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = yesterday.toDateString()

    let newStreakDays: number
    if (lastStudyString === yesterdayString) {
      // 어제 학습 → 스트릭 증가
      newStreakDays = profile.streakDays + 1
    } else {
      // 그 외 (하루 이상 빈 날) → 리셋
      newStreakDays = 1
    }

    await db.gamificationProfiles.where('studentId').equals(studentId).modify({
      streakDays: newStreakDays,
      lastStudyDate: now,
      updatedAt: now,
    })

    // 스트릭 보너스 XP 지급
    const streakBonusXP = getStreakBonusXP(newStreakDays)
    if (streakBonusXP > 0) {
      await db.xpEvents.add({
        studentId,
        amount: streakBonusXP,
        reason: 'streak_bonus',
        comboMultiplier: 1,
        timestamp: now,
      })

      const updatedProfile = await db.gamificationProfiles
        .where('studentId')
        .equals(studentId)
        .first()
      const newTotalXP = (updatedProfile?.totalXP ?? 0) + streakBonusXP
      const newLevel = calculateLevel(newTotalXP)

      await db.gamificationProfiles.where('studentId').equals(studentId).modify({
        totalXP: newTotalXP,
        level: newLevel,
        updatedAt: now,
      })
    }

    // 뱃지 체크
    const finalProfile = await db.gamificationProfiles.where('studentId').equals(studentId).first()
    await checkAndAwardBadges(
      studentId,
      finalProfile?.totalXP ?? 0,
      finalProfile?.level ?? 1,
      newStreakDays,
    )
  })
}

/** 스트릭 보너스 XP 계산 */
function getStreakBonusXP(streakDays: number): number {
  if (streakDays === 3) return 50
  if (streakDays === 7) return 150
  if (streakDays === 14) return 300
  if (streakDays === 30) return 500
  return 0
}

/**
 * 뱃지 조건 확인 및 신규 뱃지 지급
 * - xpEvents에서 totalCorrect 집계 (reason: 'quiz_correct' 카운트)
 * - BADGE_DEFINITIONS 순회하여 미획득 + 조건 충족 뱃지 지급
 *
 * @returns 새로 획득한 뱃지 ID 배열
 */
export async function checkAndAwardBadges(
  studentId: string,
  totalXP: number,
  level: number,
  streakDays: number,
): Promise<string[]> {
  // 총 정답 수 집계
  const correctEvents = await db.xpEvents
    .where('studentId')
    .equals(studentId)
    .filter((e) => e.reason === 'quiz_correct')
    .toArray()
  const totalCorrect = correctEvents.length

  // 최대 콤보 조회 (xpEvents에서 최대 comboMultiplier 역산)
  // comboMultiplier: 1=0~1콤보, 1.5=2콤보, 2=3콤보, 2.5=4콤보, 3=5+콤보
  const allCorrectEvents = await db.xpEvents
    .where('studentId')
    .equals(studentId)
    .filter((e) => e.reason === 'quiz_correct' || e.reason === 'combo_bonus')
    .toArray()

  const maxMultiplier = allCorrectEvents.reduce(
    (max, e) => Math.max(max, e.comboMultiplier ?? 1),
    1,
  )
  // comboMultiplier → comboMax 역산: 3x=5콤보, 2.5x=4콤보, 2x=3콤보, 1.5x=2콤보, 1x=1콤보
  let comboMax = 1
  if (maxMultiplier >= 3) comboMax = 5
  else if (maxMultiplier >= 2.5) comboMax = 4
  else if (maxMultiplier >= 2) comboMax = 3
  else if (maxMultiplier >= 1.5) comboMax = 2

  const ctx: BadgeCheckContext = { totalXP, level, streakDays, totalCorrect, comboMax }

  // 이미 획득한 뱃지 조회
  const existingBadges = await db.badges.where('studentId').equals(studentId).toArray()
  const existingBadgeIds = new Set(existingBadges.map((b) => b.badgeId))

  // 신규 획득 뱃지 지급
  const newlyUnlocked: string[] = []
  const now = Date.now()

  for (const badge of BADGE_DEFINITIONS) {
    if (!existingBadgeIds.has(badge.id) && badge.checkCondition(ctx)) {
      await db.badges.add({
        studentId,
        badgeId: badge.id,
        unlockedAt: now,
      })
      newlyUnlocked.push(badge.id)
    }
  }

  return newlyUnlocked
}

/**
 * 반 내 XP 리더보드 조회
 * - groupId 기반으로 GroupMember 필터링
 * - 각 반원의 gamificationProfiles 조회 후 XP 내림차순 정렬
 * - currentStudentId가 없으면 자기 자신만 표시
 *
 * @param groupId - 반 ID (GroupMember.groupId)
 * @param currentStudentId - 현재 사용자 studentId (email)
 * @returns ClassLeaderboardResult
 */
export async function getClassLeaderboard(
  groupId: number | null | undefined,
  currentStudentId: string,
): Promise<ClassLeaderboardResult> {
  // 반원 목록 조회 (groupId 없으면 본인만)
  let studentIds: string[] = [currentStudentId]

  if (groupId != null) {
    const members = await db.groupMembers.where('groupId').equals(groupId).toArray()
    studentIds = members.map((m) => m.studentId)
    // 반원이 없거나 본인만 있으면 본인 포함 보장
    if (!studentIds.includes(currentStudentId)) {
      studentIds.push(currentStudentId)
    }
  }

  // 각 반원의 게이미피케이션 프로필 조회
  const profiles = await Promise.all(
    studentIds.map(async (sid) => {
      const profile = await db.gamificationProfiles.where('studentId').equals(sid).first()
      // 프로필 없으면 기본값 사용
      return {
        studentId: sid,
        totalXP: profile?.totalXP ?? 0,
        level: profile?.level ?? 1,
        streakDays: profile?.streakDays ?? 0,
      }
    }),
  )

  // 유저 설정에서 displayName/avatarEmoji 조회
  const settingsList = await Promise.all(
    studentIds.map((sid) => db.userSettings.where('userId').equals(sid).first()),
  )
  const settingsMap = new Map(
    settingsList.map((s, i) => [studentIds[i], s]),
  )

  // XP 내림차순 정렬
  const sorted = [...profiles].sort((a, b) => b.totalXP - a.totalXP)

  // 순위 부여 (동점 처리: 동일 XP면 같은 순위)
  const ranked: LeaderboardEntry[] = sorted.map((p, idx) => {
    const settings = settingsMap.get(p.studentId)
    // displayName 없으면 email 앞부분 사용
    const emailPrefix = p.studentId.split('@')[0] ?? p.studentId
    return {
      studentId: p.studentId,
      displayName: settings?.displayName ?? emailPrefix,
      avatarEmoji: settings?.avatarEmoji ?? '🧑‍🎓',
      totalXP: p.totalXP,
      level: p.level,
      streakDays: p.streakDays,
      rank: idx + 1,
    }
  })

  // 현재 사용자 순위 탐색
  const myEntry = ranked.find((e) => e.studentId === currentStudentId)
  const myRank = myEntry?.rank ?? ranked.length

  // TOP 3
  const top3 = ranked.slice(0, 3)

  // 내 주변 ±2명 (top3와 겹칠 수 있음)
  const myIdx = ranked.findIndex((e) => e.studentId === currentStudentId)
  const surroundStart = Math.max(0, myIdx - 2)
  const surroundEnd = Math.min(ranked.length, myIdx + 3)
  const surrounding = ranked.slice(surroundStart, surroundEnd)

  return {
    top3,
    surrounding,
    myRank,
    total: ranked.length,
  }
}
