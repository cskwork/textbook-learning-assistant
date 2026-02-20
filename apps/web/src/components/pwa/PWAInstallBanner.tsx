/**
 * PWA 설치 안내 + 업데이트 + 오프라인 알림 통합 배너
 *
 * 세 가지 상태를 순서대로 표시:
 * 1. needRefresh: 새 서비스워커 버전 감지 → 업데이트 배너
 * 2. offlineReady: 첫 로드 완료 → 오프라인 준비 토스트 (3초 후 자동 닫힘)
 * 3. installPrompt: beforeinstallprompt 이벤트 → PWA 설치 배너 (Android/Chrome)
 */
import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installDismissed, setInstallDismissed] = useState(false)

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW 등록됨:', r)
    },
    onRegisterError(error) {
      console.error('SW 등록 오류:', error)
    },
  })

  // beforeinstallprompt 이벤트 캡처 (Android/Chrome PWA 설치 프롬프트)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // 오프라인 준비 알림 — 3초 후 자동 닫힘
  useEffect(() => {
    if (offlineReady) {
      const timer = setTimeout(() => setOfflineReady(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [offlineReady, setOfflineReady])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
    }
  }

  const handleCloseUpdate = () => {
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  // 공통 배너 스타일: 하단 탭바 위에 위치 (bottom-20 = 5rem, 탭바 h-16 + 여유)
  const bannerClass =
    'fixed bottom-20 left-4 right-4 z-50 rounded-xl p-4 shadow-lg text-sm'

  // 1순위: 업데이트 필요
  if (needRefresh) {
    return (
      <div className={`${bannerClass} bg-primary text-primary-foreground`}>
        <p className="font-medium">새 버전이 있습니다</p>
        <p className="mt-1 text-xs opacity-80">업데이트하면 최신 기능을 사용할 수 있습니다.</p>
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => updateServiceWorker(true)}
          >
            업데이트
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-primary-foreground hover:text-primary-foreground/80"
            onClick={handleCloseUpdate}
          >
            나중에
          </Button>
        </div>
      </div>
    )
  }

  // 2순위: 오프라인 준비 (3초 자동 닫힘)
  if (offlineReady) {
    return (
      <div className={`${bannerClass} bg-green-600 text-white`}>
        <p className="font-medium">오프라인에서도 사용 가능합니다</p>
        <p className="mt-1 text-xs opacity-80">앱이 기기에 저장되었습니다.</p>
      </div>
    )
  }

  // 3순위: PWA 설치 유도 (Android/Chrome)
  if (installPrompt && !installDismissed) {
    return (
      <div className={`${bannerClass} bg-primary text-primary-foreground`}>
        <p className="font-medium">홈 화면에 추가하기</p>
        <p className="mt-1 text-xs opacity-80">앱처럼 빠르게 접근하세요. 오프라인에서도 사용 가능합니다.</p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleInstall}>
            설치
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-primary-foreground hover:text-primary-foreground/80"
            onClick={() => setInstallDismissed(true)}
          >
            나중에
          </Button>
        </div>
      </div>
    )
  }

  return null
}
