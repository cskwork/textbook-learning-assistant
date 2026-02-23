// Phase 18: 레벨업 시네마틱 VFX — R3F ring expand + sparkle 파티클
// LevelUpOverlay 배경에 삽입되는 독립 Canvas
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

interface LevelUpVfxProps {
  /** true일 때 Canvas 마운트, false일 때 언마운트 (WebGL 컨텍스트 해제) */
  visible: boolean
}

/** 확장하는 링 — scale 0→15, opacity 1→0 */
function RingExpand({ delay = 0 }: { delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null!)
  const startedRef = useRef(false)
  const timeRef = useRef(-delay)

  useFrame((_, delta) => {
    timeRef.current += delta

    if (timeRef.current < 0) return
    if (!startedRef.current) startedRef.current = true

    const progress = Math.min(timeRef.current / 1.0, 1) // 1초간 확장
    const scale = progress * 15
    const opacity = 1 - progress

    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale)
    }
    if (materialRef.current) {
      materialRef.current.opacity = opacity
    }
  })

  return (
    <mesh ref={meshRef} scale={0}>
      <torusGeometry args={[0.1, 0.02, 8, 64]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#fbbf24"
        transparent
        opacity={1}
        toneMapped={false}
      />
    </mesh>
  )
}

/** 레벨업 씬 — 골드 스파클 + 2개 링 (시간차 확장) */
function LevelUpScene() {
  return (
    <>
      <RingExpand delay={0} />
      <RingExpand delay={0.2} />
      <Sparkles
        count={80}
        scale={[15, 15, 5]}
        size={3}
        speed={2}
        color="#fbbf24"
        opacity={0.8}
      />
    </>
  )
}

/**
 * LevelUpVfx — 레벨업 시네마틱 Three.js 파티클 배경.
 *
 * - visible=true 시 Canvas 마운트, false 시 언마운트 → WebGL 컨텍스트 해제
 * - 골드 색상 ring expand + sparkle 파티클
 * - LevelUpOverlay 내부에 absolute 배치 (z-index -1)
 * - 2.5초 타이머 동안만 존재 (overlay visible 따라)
 */
export default function LevelUpVfx({ visible }: LevelUpVfxProps) {
  if (!visible) return null

  return (
    <Canvas
      dpr={[0.5, 1]}
      gl={{ antialias: false, alpha: true }}
      camera={{ position: [0, 0, 10], fov: 50 }}
      style={{ position: 'absolute', inset: 0, zIndex: -1 }}
    >
      <LevelUpScene />
    </Canvas>
  )
}
