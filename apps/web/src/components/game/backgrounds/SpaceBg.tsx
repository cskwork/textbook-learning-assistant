// Phase 18: 홈 화면 우주/별 3D 배경 씬
// drei <Stars> + 유성 효과 + 마우스 parallax
import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import type { VfxQuality } from '@/components/game/vfx/useGpuTier'

interface SpaceBgProps {
  quality: VfxQuality
}

/** 유성 (Shooting Star) — 대각선으로 빠르게 이동하는 작은 빛 */
function ShootingStar() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const activeRef = useRef(false)
  const timerRef = useRef(0)
  const startPos = useMemo(() => new THREE.Vector3(), [])
  const velocity = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    timerRef.current += delta

    if (!activeRef.current) {
      // 8~15초 간격으로 유성 활성화
      if (timerRef.current > 8 + Math.random() * 7) {
        activeRef.current = true
        timerRef.current = 0

        // 화면 상단 랜덤 위치에서 시작
        startPos.set(
          (Math.random() - 0.5) * 40,
          15 + Math.random() * 10,
          -5 - Math.random() * 10
        )
        velocity.set(
          (Math.random() - 0.3) * -15,
          -20 - Math.random() * 10,
          0
        )

        if (meshRef.current) {
          meshRef.current.position.copy(startPos)
          meshRef.current.scale.setScalar(1)
        }
      }
    } else {
      // 유성 이동
      if (meshRef.current) {
        meshRef.current.position.addScaledVector(velocity, delta)

        // 점점 작아지며 사라짐
        const progress = timerRef.current / 1.2
        const scale = Math.max(0, 1 - progress)
        meshRef.current.scale.setScalar(scale)

        // 1.2초 후 비활성화
        if (timerRef.current > 1.2) {
          activeRef.current = false
          timerRef.current = 0
          meshRef.current.position.set(0, -100, 0)
        }
      }
    }
  })

  return (
    <mesh ref={meshRef} position={[0, -100, 0]}>
      <sphereGeometry args={[0.08, 4, 4]} />
      <meshBasicMaterial color="#fbbf24" transparent opacity={0.9} toneMapped={false} />
    </mesh>
  )
}

export default function SpaceBg({ quality }: SpaceBgProps) {
  const starsRef = useRef<THREE.Group>(null!)
  const pointer = useThree((state) => state.pointer)
  const isLow = quality === 'low'

  useFrame((_, delta) => {
    if (!starsRef.current) return

    // 느린 자전
    starsRef.current.rotation.y += delta * 0.02
    starsRef.current.rotation.x += delta * 0.01

    // 마우스 parallax — z 축 미세 회전
    starsRef.current.rotation.z = THREE.MathUtils.lerp(
      starsRef.current.rotation.z,
      pointer.x * 0.05,
      0.02
    )
  })

  return (
    <group ref={starsRef}>
      <Stars
        radius={80}
        depth={60}
        count={isLow ? 1500 : 3000}
        factor={4}
        saturation={0.2}
        fade
        speed={0.5}
      />
      {/* 모바일에서는 유성 비활성화 */}
      {!isLow && (
        <>
          <ShootingStar />
          <ShootingStar />
        </>
      )}
    </group>
  )
}
