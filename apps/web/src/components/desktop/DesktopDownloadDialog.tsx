/**
 * 데스크톱 앱 다운로드 다이얼로그
 * - OS 자동 감지 후 추천 다운로드 버튼 강조
 * - macOS (.dmg) / Windows (.exe) 다운로드 링크 제공
 */
import { Download, Monitor } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { detectOS, getDownloadUrl } from '@/lib/platform'
import type { DesktopOS } from '@/lib/platform'

interface DesktopDownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** 각 OS 표시 레이블 */
const OS_LABELS: Record<DesktopOS, string> = {
  macos: 'macOS',
  windows: 'Windows',
  linux: 'Linux',
  unknown: '알 수 없음',
}

export function DesktopDownloadDialog({
  open,
  onOpenChange,
}: DesktopDownloadDialogProps) {
  const currentOS = detectOS()

  const handleDownload = (os: DesktopOS) => {
    const url = getDownloadUrl(os)
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            데스크톱 앱 설치
          </DialogTitle>
          <DialogDescription>
            더 빠르고 안정적인 데스크톱 앱을 설치하세요
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          {/* macOS 다운로드 버튼 */}
          <Button
            variant={currentOS === 'macos' ? 'default' : 'outline'}
            className="w-full justify-start gap-3"
            onClick={() => handleDownload('macos')}
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>macOS 다운로드 (.dmg)</span>
            {currentOS === 'macos' && (
              <span className="ml-auto text-xs opacity-80">추천</span>
            )}
          </Button>

          {/* Windows 다운로드 버튼 */}
          <Button
            variant={currentOS === 'windows' ? 'default' : 'outline'}
            className="w-full justify-start gap-3"
            onClick={() => handleDownload('windows')}
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Windows 다운로드 (.exe)</span>
            {currentOS === 'windows' && (
              <span className="ml-auto text-xs opacity-80">추천</span>
            )}
          </Button>
        </div>

        {/* 현재 감지된 OS 표시 */}
        <p className="text-xs text-muted-foreground text-center pt-1">
          현재 감지된 OS: {OS_LABELS[currentOS]}
        </p>
      </DialogContent>
    </Dialog>
  )
}
