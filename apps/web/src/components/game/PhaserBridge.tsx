// Phase 15 POC — React StrictMode 이중 초기화 방지 검증
// Source: phaserjs/template-react-ts 공식 GitHub 템플릿 패턴
// Phase 19에서 실제 게임 씬으로 교체 예정
import { forwardRef, useLayoutEffect, useRef } from 'react'
import { EventBus } from '@/game/EventBus'

export interface PhaserBridgeRef {
  game: Phaser.Game | null
}

interface PhaserBridgeProps {
  /** 캔버스 너비 (px) */
  width?: number
  /** 캔버스 높이 (px) */
  height?: number
}

/**
 * POC: React StrictMode + Phaser 이중 초기화 방지 패턴 검증.
 * useRef 가드로 마운트 1회만 Phaser.Game 생성.
 * Phase 19에서 실제 타임어택/서바이벌 씬으로 확장.
 */
export const PhaserBridge = forwardRef<PhaserBridgeRef, PhaserBridgeProps>(
  ({ width = 400, height = 300 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const gameRef = useRef<Phaser.Game | null>(null)

    useLayoutEffect(() => {
      // useRef 가드 — StrictMode 이중 마운트 방지 (Pitfall G1)
      if (gameRef.current !== null) return
      if (!containerRef.current) return

      // Phaser를 동적 import — 정적 import 절대 금지 (Pitfall G5)
      import('phaser').then(({ default: Phaser }) => {
        if (gameRef.current !== null) return // 비동기 완료 전 unmount 방지

        gameRef.current = new Phaser.Game({
          type: Phaser.AUTO,
          width,
          height,
          parent: containerRef.current!,
          backgroundColor: '#1a0a2e',
          scene: {
            // POC 씬 — "Phaser POC 성공!" 텍스트만 표시
            preload() {
              // PreloadScene 진행률 이벤트 발행 (GameLoadingSpinner와 연동)
              this.load.on('progress', (value: number) => {
                EventBus.emit('load-progress', Math.round(value * 100))
              })
            },
            create() {
              const { width: w, height: h } = this.scale
              this.add.text(w / 2, h / 2, 'Phase 15 POC ✓\nPhaser 이중 초기화 방지 성공', {
                fontSize: '18px',
                color: '#00ff88',
                align: 'center',
              }).setOrigin(0.5)

              // React에 Phaser 준비 완료 알림
              EventBus.emit('load-progress', 100)
              EventBus.emit('phaser-ready', gameRef.current)
            },
          },
        })

        // ref 노출 — 외부에서 game 인스턴스 접근 가능 (Phase 19용)
        if (ref && typeof ref === 'object') {
          ref.current = { game: gameRef.current }
        }
      })

      return () => {
        // cleanup — G2 메모리 누수 방지, WebGL 컨텍스트 해제
        if (gameRef.current) {
          gameRef.current.destroy(true)
          gameRef.current = null
        }
        if (ref && typeof ref === 'object') {
          ref.current = { game: null }
        }
      }
    }, []) // 마운트 1회만 실행

    return (
      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden"
        style={{ width, height }}
        data-testid="phaser-container"
      />
    )
  }
)

PhaserBridge.displayName = 'PhaserBridge'
