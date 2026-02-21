// apps/web/src/services/notification.service.ts
// 브라우저 Notification API 래퍼 + 학습 리마인더 서비스 — Phase 13 PLAN-02
import { getTodayPlan, getPlanProgress } from './planner.service'

// ---------------------------------------------------------------------------
// 1. requestNotificationPermission — 알림 권한 요청
// ---------------------------------------------------------------------------

/**
 * 브라우저 알림 권한 요청
 * - 브라우저 미지원 시 'denied' 반환
 * - 반환: 'granted' | 'denied' | 'default'
 */
export async function requestNotificationPermission(): Promise<
  'granted' | 'denied' | 'default'
> {
  if (typeof Notification === 'undefined') return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  const permission = await Notification.requestPermission()
  return permission
}

// ---------------------------------------------------------------------------
// 2. sendStudyReminder — 학습 리마인더 알림 발송
// ---------------------------------------------------------------------------

/**
 * 학습 리마인더 브라우저 알림 발송
 * - 권한 미부여 시 무시
 * - tag: 'study-reminder' — 중복 알림 방지 (같은 tag는 기존 알림 교체)
 * - icon: PWA 아이콘 재사용 (/icons/icon-192x192.png)
 */
export function sendStudyReminder(title: string, body: string): void {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return

  new Notification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    tag: 'study-reminder',
  })
}

// ---------------------------------------------------------------------------
// 3. checkAndNotify — 오늘 학습 미완료 시 알림 발송
// ---------------------------------------------------------------------------

/**
 * 오늘 학습 목표 미완료 시 알림 발송
 * - getTodayPlan으로 플랜 조회
 * - 플랜 없거나 progress < 100% 이면 sendStudyReminder 호출
 */
export async function checkAndNotify(studentId: string): Promise<void> {
  const plan = await getTodayPlan(studentId)

  if (!plan) {
    sendStudyReminder(
      '오늘의 학습 계획을 세워보세요!',
      '오늘의 학습 목표를 아직 달성하지 못했어요!',
    )
    return
  }

  const { percent } = await getPlanProgress(plan.id)
  if (percent < 100) {
    sendStudyReminder(
      '학습 목표 달성까지 조금만 더!',
      '오늘의 학습 목표를 아직 달성하지 못했어요!',
    )
  }
}

// ---------------------------------------------------------------------------
// 4. scheduleNotificationCheck — 설정 시간에 알림 예약
// ---------------------------------------------------------------------------

/**
 * 매 분마다 현재 시간을 확인하여 설정 시간과 일치하면 checkAndNotify 실행
 * - timeStr: "HH:mm" 형식 (예: "20:00")
 * - 반환: cleanup 함수 (clearInterval) — 컴포넌트 unmount 시 호출
 *
 * 사용 예:
 * ```ts
 * const cleanup = scheduleNotificationCheck(userId, "20:00")
 * return () => cleanup() // useEffect cleanup
 * ```
 */
export function scheduleNotificationCheck(
  studentId: string,
  timeStr: string,
): () => void {
  let lastFired = ''

  const intervalId = setInterval(() => {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    // 같은 분에 중복 발송 방지
    if (currentTime === timeStr && currentTime !== lastFired) {
      lastFired = currentTime
      checkAndNotify(studentId).catch(console.error)
    }
  }, 60_000) // 60초마다 확인

  return () => clearInterval(intervalId)
}
