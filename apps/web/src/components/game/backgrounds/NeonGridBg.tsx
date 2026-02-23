// Phase 18: 퀴즈 화면 네온 격자 배경 씬
// Tron 스타일 와이어프레임 바닥 무한 스크롤 + 스파클
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import type { VfxQuality } from '@/components/game/vfx/useGpuTier'

interface NeonGridBgProps {
  quality: VfxQuality
}

/** 무한 스크롤 네온 격자 바닥 */
function NeonGrid() {
  const gridRef = useRef<THREE.GridHelper>(null!)

  useFrame((_, delta) => {
    if (!gridRef.current) return

    // 앞으로 스크롤
    gridRef.current.position.z += delta * 3

    // 임계값 도달 시 리셋 (무한 스크롤)
    if (gridRef.current.position.z > 4) {
      gridRef.current.position.z = 0
    }
  })

  return (
    <gridHelper
      ref={gridRef}
      args={[100, 50, '#8b5cf6', '#6366f1']}
      position={[0, -3, 0]}
      rotation={[0, 0, 0]}
    />
  )
}

export default function NeonGridBg({ quality }: NeonGridBgProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const pointer = useThree((state) => state.pointer)
  const isLow = quality === 'low'

  useFrame(() => {
    if (!groupRef.current) return

    // 마우스 parallax — 카메라 방향 미세 변화
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -0.3 + pointer.y * 0.03,
      0.02
    )
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * 0.03,
      0.02
    )
  })

  return (
    <group ref={groupRef} rotation={[-0.3, 0, 0]}>
      <NeonGrid />
      {/* 두 번째 격자로 이음새 방지 */}
      <NeonGrid />

      {/* 상단 빛나는 스파클 파티클 */}
      <Sparkles
        count={isLow ? 15 : 30}
        scale={[20, 10, 20]}
        size={isLow ? 1.5 : 2.5}
        speed={0.4}
        color="#a78bfa"
        position={[0, 5, -10]}
      />

      {/* 보라/남색 분위기 ambient light */}
      <ambientLight intensity={0.15} color="#6366f1" />
    </group>
  )
}
