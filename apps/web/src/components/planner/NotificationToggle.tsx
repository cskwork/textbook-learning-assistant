/**
 * 알림 설정 토글 컴포넌트 — Phase 13 PLAN-02
 *
 * Props:
 *   userId: string  — user email
 *
 * 특징:
 *   - useLiveQuery로 UserSetting에서 notificationEnabled, notificationTime 읽기
 *   - 알림 토글 ON: requestNotificationPermission() → granted면 scheduleNotificationCheck 시작
 *   - 알림 토글 OFF: cleanup + UserSetting 업데이트
 *   - 알림 시간 Input type="time"
 *   - 브라우저 미지원 / 권한 거부 안내 메시지
 */

import { useState, useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Bell, BellOff } from 'lucide-react'
import { db } from '@/lib/db'
import {
  requestNotificationPermission,
  scheduleNotificationCheck,
} from '@/services/notification.service'
import { saveWeeklyScheduleSettings } from '@/services/planner.service'
import { AnimatedCard } from '@/components/motion/AnimatedCard'
import { FadeIn } from '@/components/motion/FadeIn'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface NotificationToggleProps {
  userId: string
}

export function NotificationToggle({ userId }: NotificationToggleProps) {
  const userSetting = useLiveQuery(
    () => db.userSettings.where('userId').equals(userId).first().then((r) => r ?? null),
    [userId],
  )

  const [isEnabled, setIsEnabled] = useState(false)
  const [notifTime, setNotifTime] = useState('20:00')
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default')
  const cleanupRef = useRef<(() => void) | null>(null)

  // DB 설정 로드 시 로컬 state 동기화
  useEffect(() => {
    if (!userSetting) return
    if (userSetting.notificationEnabled !== undefined) {
      setIsEnabled(userSetting.notificationEnabled)
    }
    if (userSetting.notificationTime) {
      setNotifTime(userSetting.notificationTime)
    }
  }, [userSetting])

  // 브라우저 알림 지원 여부 + 현재 권한 확인
  useEffect(() => {
    if (typeof Notification === 'undefined') {
      setPermissionState('unsupported')
    } else {
      setPermissionState(Notification.permission)
    }
  }, [])

  // 알림 스케줄 시작 (enabled + granted)
  useEffect(() => {
    if (isEnabled && permissionState === 'granted') {
      // 기존 스케줄 정리
      cleanupRef.current?.()
      cleanupRef.current = scheduleNotificationCheck(userId, notifTime)
    } else {
      cleanupRef.current?.()
      cleanupRef.current = null
    }

    return () => {
      cleanupRef.current?.()
    }
  }, [isEnabled, notifTime, permissionState, userId])

  async function handleToggle(checked: boolean) {
    if (checked) {
      // 알림 켜기: 권한 요청
      const permission = await requestNotificationPermission()
      setPermissionState(permission)

      if (permission === 'granted') {
        setIsEnabled(true)
        await saveWeeklyScheduleSettings(userId, {
          notificationEnabled: true,
          notificationTime: notifTime,
        })
      }
      // 거부 시: isEnabled는 false 유지, permissionState 업데이트로 안내 메시지 표시
    } else {
      // 알림 끄기
      cleanupRef.current?.()
      cleanupRef.current = null
      setIsEnabled(false)
      await saveWeeklyScheduleSettings(userId, {
        notificationEnabled: false,
      })
    }
  }

  async function handleTimeChange(newTime: string) {
    setNotifTime(newTime)
    if (isEnabled) {
      await saveWeeklyScheduleSettings(userId, {
        notificationTime: newTime,
      })
    }
  }

  return (
    <FadeIn delay={0.15}>
      <AnimatedCard className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">학습 알림 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 브라우저 미지원 안내 */}
          {permissionState === 'unsupported' && (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              이 브라우저는 알림을 지원하지 않습니다.
            </p>
          )}

          {/* 권한 거부 안내 */}
          {permissionState === 'denied' && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              브라우저 설정에서 알림을 허용해주세요.
            </p>
          )}

          {/* 알림 토글 */}
          {permissionState !== 'unsupported' && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isEnabled ? (
                    <Bell className="h-4 w-4 text-primary" />
                  ) : (
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-foreground">
                    {isEnabled ? '알림 켜짐' : '알림 꺼짐'}
                  </span>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={handleToggle}
                  disabled={permissionState === 'denied'}
                  aria-label="학습 알림 토글"
                />
              </div>

              {/* 알림 시간 */}
              <div className={['flex items-center gap-2', !isEnabled ? 'opacity-50 pointer-events-none' : ''].join(' ')}>
                <label className="text-xs text-muted-foreground whitespace-nowrap">
                  알림 시간
                </label>
                <Input
                  type="time"
                  value={notifTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="h-8 w-32 text-sm"
                  disabled={!isEnabled}
                />
              </div>

              {/* 활성 안내 */}
              {isEnabled && permissionState === 'granted' && (
                <p className="text-xs text-primary bg-primary/10 rounded-lg px-3 py-2">
                  매일 {notifTime}에 미완료 학습 알림을 발송합니다.
                </p>
              )}
            </>
          )}
        </CardContent>
      </AnimatedCard>
    </FadeIn>
  )
}
