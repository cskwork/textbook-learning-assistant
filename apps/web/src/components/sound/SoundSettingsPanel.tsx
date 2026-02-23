// SoundSettingsPanel — BGM 볼륨 + SFX 볼륨 슬라이더 + 전체 음소거 토글 UI
// 프로필 페이지 설정 영역에 배치 — FunMode 전용
// Phase 17 사운드 시스템

import { Music } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { useSoundSettings } from '@/hooks/useSoundSettings'
import { useFunMode } from '@/hooks/useFunMode'

interface SoundSettingsPanelProps {
  userId: string
}

/**
 * 사운드 설정 패널 — Card 컴포넌트 기반
 *
 * - 전체 음소거 Switch (기존 다크모드 Switch 패턴)
 * - BGM 볼륨 Slider (기존 수식 글꼴 크기 Slider 패턴)
 * - 효과음 볼륨 Slider
 * - isSoundMuted 시 슬라이더 비활성화 + opacity-50
 */
export function SoundSettingsPanel({ userId }: SoundSettingsPanelProps) {
  const { isFunMode } = useFunMode()
  const {
    bgmVolume,
    sfxVolume,
    isSoundMuted,
    setBgmVolume,
    setSfxVolume,
    toggleMute,
  } = useSoundSettings(userId)

  // 일반 모드에서는 렌더링하지 않음
  if (!isFunMode) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          <CardTitle>사운드 설정</CardTitle>
        </div>
        <CardDescription>BGM과 효과음을 조절합니다</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 전체 음소거 — 기존 다크모드 Switch 패턴 */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="sound-mute-switch" className="text-sm font-medium">
              전체 음소거
            </Label>
            <p className="text-xs text-muted-foreground">모든 소리를 끕니다</p>
          </div>
          <Switch
            id="sound-mute-switch"
            checked={isSoundMuted}
            onCheckedChange={toggleMute}
            aria-label="전체 음소거 전환"
          />
        </div>

        {/* BGM 볼륨 Slider — 기존 수식 글꼴 크기 Slider 패턴 */}
        <div className={isSoundMuted ? 'opacity-50 pointer-events-none' : ''}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="bgm-volume-slider" className="text-sm font-medium">
                  BGM 볼륨
                </Label>
                <p className="text-xs text-muted-foreground">배경 음악 볼륨을 조절합니다</p>
              </div>
              <span className="text-sm font-mono text-muted-foreground">
                {Math.round(bgmVolume * 100)}%
              </span>
            </div>
            <Slider
              id="bgm-volume-slider"
              min={0}
              max={1}
              step={0.01}
              value={[bgmVolume]}
              onValueChange={([val]) => setBgmVolume(val)}
              className="w-full"
              disabled={isSoundMuted}
              aria-label="BGM 볼륨 슬라이더"
            />
          </div>
        </div>

        {/* 효과음 볼륨 Slider */}
        <div className={isSoundMuted ? 'opacity-50 pointer-events-none' : ''}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sfx-volume-slider" className="text-sm font-medium">
                  효과음 볼륨
                </Label>
                <p className="text-xs text-muted-foreground">정답/오답/콤보 효과음을 조절합니다</p>
              </div>
              <span className="text-sm font-mono text-muted-foreground">
                {Math.round(sfxVolume * 100)}%
              </span>
            </div>
            <Slider
              id="sfx-volume-slider"
              min={0}
              max={1}
              step={0.01}
              value={[sfxVolume]}
              onValueChange={([val]) => setSfxVolume(val)}
              className="w-full"
              disabled={isSoundMuted}
              aria-label="효과음 볼륨 슬라이더"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
