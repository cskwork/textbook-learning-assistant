// Phase 18: 정답/콤보 파티클 폭발 이펙트
// InstancedMesh 기반 — 단일 draw call로 최대 150개 파티클 처리
// EventBus 'vfx:correct' / 'vfx:combo' 이벤트에 반응
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useVfxEvents } from '@/components/game/vfx/useVfxEvents'

const MAX_PARTICLES = 150
const tempObj = new THREE.Object3D()

interface Particle {
  velocity: THREE.Vector3
  life: number
  maxLife: number
  active: boolean
}

/** 콤보 단계별 파티클 색상 */
function getComboColor(comboStep: number, index: number): THREE.Color {
  const colors: string[][] = [
    // comboStep 1-2: 골드/그린
    ['#fbbf24', '#34d399'],
    ['#fbbf24', '#34d399'],
    // comboStep 3-4: 골드/오렌지
    ['#fbbf24', '#f97316'],
    ['#fbbf24', '#f97316'],
    // comboStep 5+: 골드/레드/보라
    ['#fbbf24', '#ef4444', '#8b5cf6'],
  ]

  const palette = colors[Math.min(comboStep - 1, colors.length - 1)]
  return new THREE.Color(palette[index % palette.length])
}

/**
 * 정답/콤보 파티클 폭발 이펙트.
 *
 * - EventBus 'vfx:correct' / 'vfx:combo' 이벤트 수신
 * - 중앙에서 방사형으로 퍼지는 파티클 (콤보 단계에 따라 양/크기/색상 증가)
 * - InstancedMesh 단일 draw call 최적화
 * - useFrame 내 메모리 할당 없음
 *
 * R3F Canvas 내부에서만 사용 가능 (ThreeBackground 씬에 포함)
 */
export function ParticleBurst() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const trigger = useVfxEvents()
  const comboStepRef = useRef(1)
  const lastTriggerRef = useRef(0)

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: MAX_PARTICLES }, () => ({
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 0,
        active: false,
      })),
    []
  )

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    // 새 트리거 감지
    const t = trigger.current
    if (t && (t.type === 'correct' || t.type === 'combo') && t.timestamp !== lastTriggerRef.current) {
      lastTriggerRef.current = t.timestamp
      const comboStep = (t.data as { comboStep?: number })?.comboStep ?? 1
      comboStepRef.current = comboStep

      // 활성화할 파티클 수 — 콤보 단계에 따라 증가
      const activeCount = Math.min(MAX_PARTICLES, 30 + comboStep * 20)

      for (let i = 0; i < activeCount; i++) {
        const p = particles[i]
        p.active = true
        p.life = 0
        p.maxLife = 0.8 + Math.random() * 0.4

        // 방사형 속도 (0,0,0 중심)
        const angle = Math.random() * Math.PI * 2
        const elevation = (Math.random() - 0.3) * Math.PI
        const speed = 3 + Math.random() * 3
        p.velocity.set(
          Math.cos(angle) * Math.cos(elevation) * speed,
          Math.sin(elevation) * speed + 2,
          Math.sin(angle) * Math.cos(elevation) * speed
        )

        // 색상 설정
        const color = getComboColor(comboStep, i)
        mesh.setColorAt(i, color)
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

      // 트리거 소비
      trigger.current = null
    }

    // 파티클 업데이트
    const comboScale = 1 + (comboStepRef.current - 1) * 0.3

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particles[i]

      if (p.active) {
        p.life += delta

        if (p.life >= p.maxLife) {
          // 비활성화 — 화면 밖 + scale 0
          p.active = false
          tempObj.position.set(0, -100, 0)
          tempObj.scale.setScalar(0)
        } else {
          const progress = p.life / p.maxLife
          // 방사형 확산
          tempObj.position.set(
            p.velocity.x * p.life,
            p.velocity.y * p.life - 4.9 * p.life * p.life, // 중력
            p.velocity.z * p.life
          )
          // 점점 작아짐
          const scale = (1 - progress) * 0.08 * comboScale
          tempObj.scale.setScalar(scale)
        }
      } else {
        // 비활성 파티클은 보이지 않게
        tempObj.position.set(0, -100, 0)
        tempObj.scale.setScalar(0)
      }

      tempObj.updateMatrix()
      mesh.setMatrixAt(i, tempObj.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PARTICLES]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial transparent opacity={0.8} toneMapped={false} />
    </instancedMesh>
  )
}
