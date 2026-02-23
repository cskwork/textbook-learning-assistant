// MiniGameRegistry.ts
// 미니게임 등록/조회 레지스트리 — 향후 확장 가능한 패턴
// Phase 19 게임화 퀴즈 엔진

/** 미니게임 설정 */
export interface MiniGameConfig {
  /** 고유 키 (예: 'formulaCombo') */
  key: string
  /** 표시 이름 (예: '수식 조합') */
  name: string
  /** 간단한 설명 */
  description: string
  /** Phaser Scene 동적 import 팩토리 */
  sceneFactory: () => Promise<{ default: new (key: string) => Phaser.Scene }>
}

// ─── 레지스트리 저장소 ──────────────────────────────────────────────────────

const registry = new Map<string, MiniGameConfig>()

/** 미니게임 등록 */
export function registerMiniGame(config: MiniGameConfig): void {
  registry.set(config.key, config)
}

/** 전체 미니게임 목록 조회 */
export function getMiniGames(): MiniGameConfig[] {
  return Array.from(registry.values())
}

/** 단건 미니게임 조회 */
export function getMiniGame(key: string): MiniGameConfig | undefined {
  return registry.get(key)
}

// ─── 초기 등록 ──────────────────────────────────────────────────────────────

registerMiniGame({
  key: 'formulaCombo',
  name: '수식 조합',
  description: '떨어지는 숫자와 연산자를 조합하여 목표 값을 만드세요',
  sceneFactory: () => import('./scenes/FormulaComboScene'),
})
