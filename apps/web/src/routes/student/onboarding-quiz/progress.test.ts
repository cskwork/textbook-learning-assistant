import { describe, expect, it } from 'vitest'
import { getDiagnosticProgress } from './progress'

describe('getDiagnosticProgress', () => {
  it('첫 문제에서도 진행률을 0이 아닌 현재 문제 기준으로 계산한다', () => {
    expect(getDiagnosticProgress(0, 10)).toBe(10)
  })

  it('전체 문제 수가 없으면 0을 반환한다', () => {
    expect(getDiagnosticProgress(0, 0)).toBe(0)
  })

  it('마지막 문제를 넘는 값은 100으로 제한한다', () => {
    expect(getDiagnosticProgress(10, 10)).toBe(100)
  })
})
