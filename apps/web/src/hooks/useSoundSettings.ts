// useSoundSettings.ts — Dexie reactive 사운드 설정 훅
// useLiveQuery로 DB 변경 시 자동 반응 + soundManager 동기화
// Phase 17 사운드 시스템

import { useCallback, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { soundManager } from '@/lib/sound/SoundManager'
import {
  saveSoundSettings,
  DEFAULT_SOUND_SETTINGS,
  type SoundSettings,
} from '@/lib/sound/sound-settings'

export interface UseSoundSettingsReturn {
  bgmVolume: number
  sfxVolume: number
  isSoundMuted: boolean
  bgmEnabled: boolean
  setBgmVolume: (vol: number) => void
  setSfxVolume: (vol: number) => void
  toggleMute: () => void
  toggleBgm: () => void
}

/**
 * useSoundSettings — Dexie reactive 사운드 설정 훅
 *
 * - useLiveQuery로 userSettings 구독 → 사운드 설정 추출
 * - useEffect에서 설정 변경 시 soundManager.applySettings() 호출 (DB → 싱글턴 동기화)
 * - setter 함수: Dexie에 저장 + soundManager에 즉시 적용 (이중 업데이트로 즉각 반응)
 *
 * @param userId - 사용자 이메일 (없으면 null/undefined)
 */
export function useSoundSettings(userId: string | null | undefined): UseSoundSettingsReturn {
  // Dexie reactive 구독 — dependency [userId] 필수
  const row = useLiveQuery(
    () => {
      if (!userId) return undefined
      return db.userSettings.where('userId').equals(userId).first()
    },
    [userId],
  )

  // 현재 설정 추출 (DB 값 ?? 기본값)
  const bgmVolume = row?.bgmVolume ?? DEFAULT_SOUND_SETTINGS.bgmVolume
  const sfxVolume = row?.sfxVolume ?? DEFAULT_SOUND_SETTINGS.sfxVolume
  const isSoundMuted = row?.isSoundMuted ?? DEFAULT_SOUND_SETTINGS.isSoundMuted
  const bgmEnabled = row?.bgmEnabled ?? DEFAULT_SOUND_SETTINGS.bgmEnabled

  // DB → SoundManager 동기화
  useEffect(() => {
    soundManager.applySettings({
      bgmVolume,
      sfxVolume,
      isSoundMuted,
      bgmEnabled,
    })
  }, [bgmVolume, sfxVolume, isSoundMuted, bgmEnabled])

  // Setter: Dexie 저장 + SoundManager 즉시 적용
  const setBgmVolume = useCallback(
    (vol: number) => {
      soundManager.setBGMVolume(vol)
      if (userId) saveSoundSettings(userId, { bgmVolume: vol })
    },
    [userId],
  )

  const setSfxVolume = useCallback(
    (vol: number) => {
      soundManager.setSFXVolume(vol)
      if (userId) saveSoundSettings(userId, { sfxVolume: vol })
    },
    [userId],
  )

  const toggleMute = useCallback(() => {
    const newMuted = soundManager.toggleMute()
    if (userId) saveSoundSettings(userId, { isSoundMuted: newMuted })
  }, [userId])

  const toggleBgm = useCallback(() => {
    const newEnabled = soundManager.toggleBGM()
    if (userId) saveSoundSettings(userId, { bgmEnabled: newEnabled })
  }, [userId])

  return {
    bgmVolume,
    sfxVolume,
    isSoundMuted,
    bgmEnabled,
    setBgmVolume,
    setSfxVolume,
    toggleMute,
    toggleBgm,
  }
}
