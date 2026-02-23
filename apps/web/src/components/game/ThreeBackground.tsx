// Phase 18: R3F Canvas 기반 3D 배경 — 화면별 테마 씬 렌더링
// FunModeGate에서 React.lazy()로 import됨. game-three 청크로 분리.
import { lazy, Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useGpuTier, type VfxQuality } from '@/components/game/vfx/useGpuTier'
import { CssFallbackBg } from '@/components/game/vfx/CssFallbackBg'

// 각 배경 씬을 lazy import — R3F 컴포넌트이므로 game-three 청크에 포함
const SpaceBg = lazy(() => import('@/components/game/backgrounds/SpaceBg'))
const NeonGridBg = lazy(() => import('@/components/game/backgrounds/NeonGridBg'))
const WaveBg = lazy(() => import('@/components/game/backgrounds/WaveBg'))
const MountainBg = lazy(() => import('@/components/game/backgrounds/MountainBg'))

export type SceneType = 'space' | 'neon' | 'wave' | 'mountain'

interface ThreeBackgroundProps {
  scene: SceneType
}

/** scene prop에 따라 적절한 배경 컴포넌트를 렌더링 */
function SceneRouter({ scene, quality }: { scene: SceneType; quality: VfxQuality }) {
  switch (scene) {
    case 'space':
      return <SpaceBg quality={quality} />
    case 'neon':
      return <NeonGridBg quality={quality} />
    case 'wave':
      return <WaveBg quality={quality} />
    case 'mountain':
      return <MountainBg quality={quality} />
    default:
      return <SpaceBg quality={quality} />
  }
}

/**
 * 반전 모드 3D 배경 컴포넌트.
 *
 * - GPU 티어에 따라 R3F Canvas 또는 CSS fallback 렌더링
 * - PerformanceMonitor로 FPS 기반 자동 DPR 조절
 * - fixed inset-0 -z-10으로 React DOM 뒤에 배치
 * - pointer-events-none으로 클릭 패스스루
 */
export default function ThreeBackground({ scene }: ThreeBackgroundProps) {
  const quality = useGpuTier()
  const [dpr, setDpr] = useState(() => (quality === 'low' ? 0.5 : 1))

  // WebGL 미지원 → CSS gradient fallback
  if (quality === 'css-only') {
    return <CssFallbackBg scene={scene} />
  }

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        dpr={dpr}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
        }}
        camera={{ position: [0, 0, 5], fov: 60 }}
        frameloop="always"
        style={{ width: '100%', height: '100%' }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(0.5)}
          onIncline={() => setDpr(quality === 'low' ? 0.75 : 1.5)}
          flipflops={3}
          onFallback={() => setDpr(0.5)}
        >
          <Suspense fallback={null}>
            <SceneRouter scene={scene} quality={quality} />
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
    </div>
  )
}
