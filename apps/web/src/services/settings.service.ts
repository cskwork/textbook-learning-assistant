// apps/web/src/services/settings.service.ts
// 마이페이지 + 앱 설정 Dexie 백업 저장 서비스 (MYPAGE-01, MYPAGE-02, Phase 9 AI 키 관리)

import { db, type UserSetting } from '@/lib/db'

/**
 * 사용자 설정 조회
 * Dexie userSettings 테이블에서 userId 기준으로 단일 레코드 반환
 */
export async function getUserSettings(userId: string): Promise<UserSetting | undefined> {
  return db.userSettings.where('userId').equals(userId).first()
}

/**
 * 사용자 설정 저장 (upsert)
 * 기존 레코드가 있으면 update, 없으면 put (기본값 포함)
 */
export async function saveUserSettings(
  userId: string,
  updates: Partial<Pick<UserSetting, 'displayName' | 'avatarEmoji' | 'isDarkMode' | 'katexFontSize'>>,
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
    } as UserSetting)
  }
}

/**
 * Gemini API 키 조회 (Phase 9 — AIGEN-04)
 * userId 기준으로 Dexie userSettings에서 geminiApiKey 반환
 */
export async function getGeminiApiKey(userId: string): Promise<string | undefined> {
  const setting = await db.userSettings.where('userId').equals(userId).first()
  return setting?.geminiApiKey
}

/**
 * Gemini API 키 저장 (Phase 9 — AIGEN-04)
 * userId 기준으로 Dexie userSettings에 geminiApiKey upsert
 * DB 버전 업 없이 선택 필드로 저장 (인덱스 없음)
 */
export async function saveGeminiApiKey(userId: string, apiKey: string): Promise<void> {
  const existing = await db.userSettings.where('userId').equals(userId).first()
  if (existing) {
    await db.userSettings.update(existing.id, { geminiApiKey: apiKey })
  } else {
    // 설정이 없으면 기본값과 함께 생성
    await db.userSettings.put({
      userId,
      dailyGoal: 10,
      isDiagnosisCompleted: false,
      geminiApiKey: apiKey,
    } as UserSetting)
  }
}
