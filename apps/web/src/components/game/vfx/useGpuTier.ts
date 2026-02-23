// Phase 18: GPU 티어 감지 훅 — WebGL 지원 여부 + 기기 성능 수준 판단
import { useMemo } from 'react'

export type VfxQuality = 'high' | 'medium' | 'low' | 'css-only'

/** WebGL 지원 여부를 canvas 기반으로 판별 */
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}

/** 모바일 기기 여부를 터치 + 화면 크기로 판별 */
function isMobileDevice(): boolean {
  return navigator.maxTouchPoints > 0 && window.innerWidth < 1024
}

/**
 * GPU 티어를 감지하여 VFX 품질 레벨을 결정한다.
 *
 * - 'css-only': WebGL 미지원 → CSS gradient fallback 사용
 * - 'low': 모바일 기기 → 파티클 50% 감소, DPR 제한
 * - 'medium': 중간 성능 → 기본 설정
 * - 'high': 고성능 → 최대 품질
 */
export function useGpuTier(): VfxQuality {
  return useMemo(() => {
    // SSR 방어
    if (typeof window === 'undefined') return 'css-only'

    if (!detectWebGL()) return 'css-only'

    if (isMobileDevice()) return 'low'

    // hardwareConcurrency로 CPU 코어 수 기반 간이 성능 판별
    const cores = navigator.hardwareConcurrency ?? 4
    if (cores <= 2) return 'low'
    if (cores <= 4) return 'medium'
    return 'high'
  }, [])
}
