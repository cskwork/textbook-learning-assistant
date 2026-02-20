// apps/web/src/lib/bkt.ts
// BKT (Bayesian Knowledge Tracing) 순수 함수 — 외부 라이브러리 없음
// Source: https://en.wikipedia.org/wiki/Bayesian_knowledge_tracing

export interface BKTParams {
  pInit: number      // P(L_0): 초기 지식 보유 확률 (기본값: 0.1)
  pTransit: number   // P(T): 미습득 → 습득 전이 확률 (기본값: 0.3)
  pSlip: number      // P(S): 알면서 틀릴 확률 (기본값: 0.1)
  pGuess: number     // P(G): 모르면서 맞힐 확률 (기본값: 0.2)
}

export const DEFAULT_BKT_PARAMS: BKTParams = {
  pInit: 0.1,
  pTransit: 0.3,
  pSlip: 0.1,
  pGuess: 0.2,
}

/**
 * 한 번의 시도 후 P(L) 업데이트 (Bayes 업데이트 + 전이 확률)
 *
 * 정답 사후확률: pL*(1-pSlip) / (pL*(1-pSlip) + (1-pL)*pGuess)
 * 오답 사후확률: pL*pSlip     / (pL*pSlip     + (1-pL)*(1-pGuess))
 * 전이 적용:    nextPL = posterior + (1 - posterior) * pTransit
 */
export function updateBKT(pL: number, isCorrect: boolean, params: BKTParams): number {
  const { pTransit, pSlip, pGuess } = params

  // 사후 확률 (Bayes 업데이트)
  const posterior = isCorrect
    ? (pL * (1 - pSlip)) / (pL * (1 - pSlip) + (1 - pL) * pGuess)
    : (pL * pSlip) / (pL * pSlip + (1 - pL) * (1 - pGuess))

  // 전이 확률 적용 (다음 기회에서의 P(L))
  return posterior + (1 - posterior) * pTransit
}

/**
 * 시도 배열로 최종 P(L) 계산
 * attempts가 비어있으면 pInit 반환
 */
export function computeBKT(
  attempts: { isCorrect: boolean }[],
  params: BKTParams = DEFAULT_BKT_PARAMS,
): number {
  let pL = params.pInit
  for (const attempt of attempts) {
    pL = updateBKT(pL, attempt.isCorrect, params)
  }
  return pL
}

/** 취약 유형 판별 임계값 — P(L) < 0.4 이면 취약 */
export const WEAK_THRESHOLD = 0.4

/** 숙달 판별 임계값 — P(L) >= 0.95 이면 숙달 */
export const MASTERY_THRESHOLD = 0.95
