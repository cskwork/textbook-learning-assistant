// MiniGameBridge.tsx
// Phaser 미니게임 React 브릿지 — PhaserBridge POC 패턴 확장
// Phase 19 게임화 퀴즈 엔진

import { useLayoutEffect, useRef, useState } from 'react'
import { EventBus } from '@/game/EventBus'
import { getMiniGame } from './MiniGameRegistry'

interface MiniGameBridgeProps {
  /** 미니게임 키 (MiniGameRegistry에서 조회) */
  miniGameKey: string
  /** 캔버스 너비 (px, 기본 400) */
  width?: number
  /** 캔버스 높이 (px, 기본 500) */
  height?: number
  /** 게임 완료 콜백 */
  onComplete: (result: { score: number; xp: number; success: boolean }) => void
}

export function MiniGameBridge({
  miniGameKey,
  width = 400,
  height = 500,
  onComplete,
}: MiniGameBridgeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useLayoutEffect(() => {
    // useRef 가드 — StrictMode 이중 마운트 방지 (Pitfall G1)
    if (gameRef.current !== null) return
    if (!containerRef.current) return

    const config = getMiniGame(miniGameKey)
    if (!config) {
      setError(`미니게임을 찾을 수 없습니다: ${miniGameKey}`)
      setLoading(false)
      return
    }

    // Phaser + 씬 동적 import
    Promise.all([
      import('phaser'),
      config.sceneFactory(),
    ]).then(([phaserModule, sceneModule]) => {
      if (gameRef.current !== null) return // 비동기 완료 전 unmount 방지

      const Phaser = phaserModule.default
      const SceneClass = sceneModule.default

      gameRef.current = new Phaser.Game({
        type: Phaser.CANVAS, // Three.js와 동시 실행 시 WebGL 컨텍스트 충돌 방지
        width,
        height,
        parent: containerRef.current!,
        backgroundColor: '#1a0a2e',
        scene: [new SceneClass(miniGameKey)],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
      })

      setLoading(false)
    }).catch((err) => {
      console.error('미니게임 로드 실패:', err)
      setError('미니게임을 로드하는 중 오류가 발생했습니다')
      setLoading(false)
    })

    // EventBus 리스너: 미니게임 완료
    const handleComplete = (result: unknown) => {
      onComplete(result as { score: number; xp: number; success: boolean })
    }
    EventBus.on('minigame-complete', handleComplete)

    return () => {
      // cleanup — 메모리 누수 방지, WebGL 컨텍스트 해제
      EventBus.off('minigame-complete', handleComplete)
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, []) // 마운트 1회만 실행

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-red-900/20 border border-red-500/30 p-8"
           style={{ width, height }}>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* 로딩 스피너 */}
      {loading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-[#1a0a2e] rounded-lg z-10"
          style={{ width, height }}
        >
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white/60 text-sm">미니게임 로딩 중...</p>
          </div>
        </div>
      )}

      {/* Phaser 캔버스 컨테이너 */}
      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden"
        style={{ width, height }}
        data-testid="minigame-container"
      />
    </div>
  )
}
