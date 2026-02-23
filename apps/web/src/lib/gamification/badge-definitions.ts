// badge-definitions.ts
// 뱃지 정의 — 정적 목록 + 조건 함수 (순수 함수)
// Phase 16 보상 시스템

/** 뱃지 획득 조건 평가에 사용되는 컨텍스트 */
export interface BadgeCheckContext {
  totalXP: number
  level: number
  streakDays: number
  totalCorrect: number
  comboMax: number
}

/** 뱃지 카테고리 */
export type BadgeCategory = 'study' | 'streak' | 'achievement'

/** 뱃지 희귀도 */
export type BadgeRarity = 'common' | 'rare' | 'epic'

/** 뱃지 정의 */
export interface BadgeDefinition {
  id: string
  name: string
  description: string
  category: BadgeCategory
  rarity: BadgeRarity
  icon: string // 이모지
  checkCondition: (ctx: BadgeCheckContext) => boolean
}

/**
 * BADGE_DEFINITIONS — 17개 뱃지 정의
 * 카테고리: 학습(study) 5개 / 연속(streak) 5개 / 성취(achievement) 7개
 * 설계 원칙: 첫날 2-3개 획득 가능 (first_correct + study_10은 common)
 */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ─────────────────────────────────────────
  // 학습 카테고리 (문제 수 기반)
  // ─────────────────────────────────────────
  {
    id: 'first_correct',
    name: '첫 정답',
    description: '첫 번째 문제를 맞혔습니다!',
    category: 'study',
    rarity: 'common',
    icon: '🎯',
    checkCondition: (ctx) => ctx.totalCorrect >= 1,
  },
  {
    id: 'study_10',
    name: '열정 입문',
    description: '정답 10문제를 달성했습니다.',
    category: 'study',
    rarity: 'common',
    icon: '📚',
    checkCondition: (ctx) => ctx.totalCorrect >= 10,
  },
  {
    id: 'study_50',
    name: '꾸준한 학습자',
    description: '정답 50문제를 달성했습니다.',
    category: 'study',
    rarity: 'common',
    icon: '📖',
    checkCondition: (ctx) => ctx.totalCorrect >= 50,
  },
  {
    id: 'study_100',
    name: '백 문제 마스터',
    description: '정답 100문제를 달성했습니다.',
    category: 'study',
    rarity: 'rare',
    icon: '💯',
    checkCondition: (ctx) => ctx.totalCorrect >= 100,
  },
  {
    id: 'study_500',
    name: '수학 영웅',
    description: '정답 500문제를 달성했습니다.',
    category: 'study',
    rarity: 'epic',
    icon: '🦸',
    checkCondition: (ctx) => ctx.totalCorrect >= 500,
  },

  // ─────────────────────────────────────────
  // 연속 카테고리 (스트릭 / 콤보 기반)
  // ─────────────────────────────────────────
  {
    id: 'streak_3',
    name: '3일 연속',
    description: '3일 연속 학습을 달성했습니다.',
    category: 'streak',
    rarity: 'common',
    icon: '🔥',
    checkCondition: (ctx) => ctx.streakDays >= 3,
  },
  {
    id: 'streak_7',
    name: '일주일 연속',
    description: '7일 연속 학습을 달성했습니다.',
    category: 'streak',
    rarity: 'rare',
    icon: '⚡',
    checkCondition: (ctx) => ctx.streakDays >= 7,
  },
  {
    id: 'streak_30',
    name: '한 달 연속',
    description: '30일 연속 학습을 달성했습니다!',
    category: 'streak',
    rarity: 'epic',
    icon: '👑',
    checkCondition: (ctx) => ctx.streakDays >= 30,
  },
  {
    id: 'combo_3',
    name: '콤보 입문',
    description: '3연속 정답 콤보를 달성했습니다.',
    category: 'streak',
    rarity: 'common',
    icon: '✨',
    checkCondition: (ctx) => ctx.comboMax >= 3,
  },
  {
    id: 'combo_5',
    name: '콤보 마스터',
    description: '5연속 정답 콤보를 달성했습니다.',
    category: 'streak',
    rarity: 'rare',
    icon: '💥',
    checkCondition: (ctx) => ctx.comboMax >= 5,
  },

  // ─────────────────────────────────────────
  // 성취 카테고리 (레벨 / 분야별 달성)
  // ─────────────────────────────────────────
  {
    id: 'level_5',
    name: '레벨 5 달성',
    description: '레벨 5에 도달했습니다.',
    category: 'achievement',
    rarity: 'common',
    icon: '⭐',
    checkCondition: (ctx) => ctx.level >= 5,
  },
  {
    id: 'level_10',
    name: '레벨 10 달성',
    description: '레벨 10에 도달했습니다!',
    category: 'achievement',
    rarity: 'rare',
    icon: '🌟',
    checkCondition: (ctx) => ctx.level >= 10,
  },
  {
    id: 'level_20',
    name: '레벨 20 달성',
    description: '레벨 20에 도달했습니다!',
    category: 'achievement',
    rarity: 'epic',
    icon: '🏆',
    checkCondition: (ctx) => ctx.level >= 20,
  },
  {
    id: 'level_50',
    name: '최고의 수학자',
    description: '최대 레벨 50에 도달했습니다!',
    category: 'achievement',
    rarity: 'epic',
    icon: '🎓',
    checkCondition: (ctx) => ctx.level >= 50,
  },
  {
    id: 'xp_1000',
    name: 'XP 1000 달성',
    description: '누적 XP 1000을 달성했습니다.',
    category: 'achievement',
    rarity: 'common',
    icon: '💎',
    checkCondition: (ctx) => ctx.totalXP >= 1000,
  },
  {
    id: 'xp_10000',
    name: 'XP 만 달성',
    description: '누적 XP 10,000을 달성했습니다!',
    category: 'achievement',
    rarity: 'rare',
    icon: '💰',
    checkCondition: (ctx) => ctx.totalXP >= 10000,
  },
  {
    id: 'xp_100000',
    name: 'XP 십만 달성',
    description: '누적 XP 100,000을 달성했습니다!',
    category: 'achievement',
    rarity: 'epic',
    icon: '🚀',
    checkCondition: (ctx) => ctx.totalXP >= 100000,
  },
]
