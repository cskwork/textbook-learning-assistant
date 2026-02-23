import { describe, expect, it } from 'vitest'
import { isProfileLoading } from './useGamification'

describe('isProfileLoading', () => {
  it('live query가 로딩 sentinel(null)일 때 true를 반환한다', () => {
    expect(isProfileLoading('student@example.com', null)).toBe(true)
  })

  it('프로필이 없는 상태(undefined)로 조회 완료되면 false를 반환한다', () => {
    expect(isProfileLoading('student@example.com', undefined)).toBe(false)
  })

  it('studentId가 없으면 sentinel이어도 false를 반환한다', () => {
    expect(isProfileLoading(null, null)).toBe(false)
  })
})
