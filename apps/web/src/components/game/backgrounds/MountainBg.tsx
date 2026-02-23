// Phase 18: 프로필 화면 산/자연 배경 씬
// 여러 겹의 산 레이어 + 마우스 parallax (깊이별 다른 속도)
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { VfxQuality } from '@/components/game/vfx/useGpuTier'

interface MountainBgProps {
  quality: VfxQuality
}

/** 산 레이어 — ConeGeometry 기반 뾰족한 봉우리들 */
function MountainLayer({
  y,
  z,
  color,
  count,
  scale,
  parallaxFactor,
}: {
  y: number
  z: number
  color: string
  count: number
  scale: number
  parallaxFactor: number
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const pointer = useThree((state) => state.pointer)

  useFrame(() => {
    if (!groupRef.current) return

    // 깊이별 다른 parallax 속도
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      pointer.x * parallaxFactor,
      0.02
    )
  })

  return (
    <group ref={groupRef} position={[0, y, z]}>
      {Array.from({ length: count }, (_, i) => {
        const spread = 30
        const x = (i / (count - 1)) * spread - spread / 2
        const heightVariation = 0.7 + Math.sin(i * 1.5) * 0.3
        const coneHeight = scale * heightVariation
        const coneRadius = scale * 0.4 * heightVariation

        return (
          <mesh
            key={i}
            position={[x + Math.sin(i * 2) * 2, coneHeight / 2, Math.sin(i * 3) * 1.5]}
          >
            <coneGeometry args={[coneRadius, coneHeight, 4]} />
            <meshBasicMaterial color={color} transparent opacity={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

export default function MountainBg({ quality }: MountainBgProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const isLow = quality === 'low'

  useFrame(({ clock }) => {
    if (!groupRef.current) return

    // 느린 좌우 oscillation
    const time = clock.getElapsedTime()
    groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.02
  })

  return (
    <group ref={groupRef} position={[0, -3, -10]}>
      {/* 뒤쪽 레이어 — 큰 산, 짙은 색, 느린 parallax */}
      <MountainLayer
        y={0}
        z={-15}
        color="#064e3b"
        count={8}
        scale={5}
        parallaxFactor={0.5}
      />

      {/* 중간 레이어 */}
      {!isLow && (
        <MountainLayer
          y={-0.5}
          z={-8}
          color="#065f46"
          count={6}
          scale={3.5}
          parallaxFactor={1.0}
        />
      )}

      {/* 앞쪽 레이어 — 작은 산, 밝은 색, 빠른 parallax */}
      <MountainLayer
        y={-1}
        z={-2}
        color="#047857"
        count={isLow ? 4 : 5}
        scale={2.5}
        parallaxFactor={1.5}
      />

      {/* 추가 뒤쪽 레이어 (고성능만) */}
      {!isLow && (
        <MountainLayer
          y={0.5}
          z={-22}
          color="#022c22"
          count={10}
          scale={6}
          parallaxFactor={0.3}
        />
      )}

      <ambientLight intensity={0.15} color="#34d399" />
    </group>
  )
}
