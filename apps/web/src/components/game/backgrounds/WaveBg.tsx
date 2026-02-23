// Phase 18: 분석 화면 파도/물결 배경 씬
// PlaneGeometry + sin/cos wave 변형 + wireframe
import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { VfxQuality } from '@/components/game/vfx/useGpuTier'

interface WaveBgProps {
  quality: VfxQuality
}

/** 파도 메쉬 — sin/cos 기반 vertices 변형 */
function WaveMesh({ quality }: { quality: VfxQuality }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const isLow = quality === 'low'
  const segments = isLow ? 32 : 64

  // geometry 재사용을 위한 position attribute 캐시
  const originalPositions = useMemo(() => {
    const geo = new THREE.PlaneGeometry(40, 40, segments, segments)
    geo.rotateX(-Math.PI / 2)
    return geo.attributes.position.array.slice()
  }, [segments])

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    const geometry = meshRef.current.geometry
    const positions = geometry.attributes.position.array as Float32Array
    const time = clock.getElapsedTime()

    for (let i = 0; i < positions.length; i += 3) {
      const x = originalPositions[i]
      const z = originalPositions[i + 2]
      // sin/cos wave 조합으로 자연스러운 파도 형태
      positions[i + 1] =
        Math.sin(x * 0.15 + time * 0.8) * Math.cos(z * 0.15 + time * 0.6) * 1.5 +
        Math.sin(x * 0.08 + time * 0.4) * 0.8
    }

    geometry.attributes.position.needsUpdate = true
  })

  return (
    <mesh ref={meshRef} position={[0, -2, 0]}>
      <planeGeometry args={[40, 40, segments, segments]} />
      <meshBasicMaterial
        color="#38bdf8"
        wireframe
        transparent
        opacity={0.4}
        toneMapped={false}
      />
    </mesh>
  )
}

export default function WaveBg({ quality }: WaveBgProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const pointer = useThree((state) => state.pointer)

  useFrame(() => {
    if (!groupRef.current) return

    // 마우스 parallax — 카메라 위치 미세 이동 시뮬레이션
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * 0.04,
      0.02
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -0.5 + pointer.y * 0.03,
      0.02
    )
  })

  return (
    <group ref={groupRef} position={[0, 3, -5]} rotation={[-0.5, 0, 0]}>
      <WaveMesh quality={quality} />
      <ambientLight intensity={0.2} color="#38bdf8" />
    </group>
  )
}
