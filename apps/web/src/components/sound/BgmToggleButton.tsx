// BgmToggleButton — 헤더 BGM ON/OFF 토글 아이콘 버튼
// FunMode 전용 — 일반 모드에서는 숨김
// Phase 17 사운드 시스템

import { Volume2, VolumeX } from 'lucide-react'
import { useSoundSettings } from '@/hooks/useSoundSettings'
import { useFunMode } from '@/hooks/useFunMode'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

/**
 * BGM 토글 버튼 — AppShell 헤더 우측 아이콘 그룹에 배치
 *
 * - FunMode OFF → null (숨김)
 * - BGM ON → Volume2 아이콘 (green 강조)
 * - BGM OFF → VolumeX 아이콘
 */
export function BgmToggleButton() {
  const { isFunMode } = useFunMode()
  const { user } = useAuth()
  const { bgmEnabled, toggleBgm } = useSoundSettings(user?.email)

  // 일반 모드에서는 렌더링하지 않음
  if (!isFunMode) return null

  return (
    <button
      type="button"
      onClick={toggleBgm}
      className={cn(
        'flex items-center justify-center',
        // AppShell 기존 아이콘 버튼 패턴 — w-10 h-10 터치 타겟
        'w-10 h-10 rounded-xl',
        'transition-all duration-200',
        bgmEnabled
          ? 'text-green-500 hover:text-green-600 hover:bg-green-500/8'
          : 'text-muted-foreground/60 hover:text-primary hover:bg-primary/8',
      )}
      aria-label={bgmEnabled ? 'BGM 끄기' : 'BGM 켜기'}
    >
      {bgmEnabled ? (
        <Volume2 className="w-4 h-4" />
      ) : (
        <VolumeX className="w-4 h-4" />
      )}
    </button>
  )
}
