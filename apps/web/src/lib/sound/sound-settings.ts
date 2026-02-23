// sound-settings.ts — Dexie userSettings 사운드 설정 읽기/쓰기 서비스
// Phase 17 사운드 시스템

import { db } from '@/lib/db'

export interface SoundSettings {
  bgmVolume: number
  sfxVolume: number
  isSoundMuted: boolean
  bgmEnabled: boolean
}

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  bgmVolume: 0.5,
  sfxVolume: 0.7,
  isSoundMuted: false,
  bgmEnabled: false,
}

/**
 * Dexie에서 사운드 설정 로드
 * 설정이 없으면 기본값 반환, 있으면 각 필드 ?? 기본값으로 fallback
 */
export async function loadSoundSettings(userId: string): Promise<SoundSettings> {
  const row = await db.userSettings.where('userId').equals(userId).first()

  if (!row) return { ...DEFAULT_SOUND_SETTINGS }

  return {
    bgmVolume: row.bgmVolume ?? DEFAULT_SOUND_SETTINGS.bgmVolume,
    sfxVolume: row.sfxVolume ?? DEFAULT_SOUND_SETTINGS.sfxVolume,
    isSoundMuted: row.isSoundMuted ?? DEFAULT_SOUND_SETTINGS.isSoundMuted,
    bgmEnabled: row.bgmEnabled ?? DEFAULT_SOUND_SETTINGS.bgmEnabled,
  }
}

/**
 * Dexie에 사운드 설정 저장 (upsert 패턴)
 * 기존 settings.service.ts의 패턴 준수
 */
export async function saveSoundSettings(
  userId: string,
  updates: Partial<SoundSettings>,
): Promise<void> {
  const existing = await db.userSettings.where('userId').equals(userId).first()

  if (existing) {
    await db.userSettings.update(existing.id, updates)
  } else {
    await db.userSettings.put({
      userId,
      dailyGoal: 10,
      isDiagnosisCompleted: false,
      ...updates,
    } as Parameters<typeof db.userSettings.put>[0])
  }
}
