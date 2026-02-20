import { useState, useCallback } from 'react'
import type { MouseEvent, ComponentPropsWithRef } from 'react'

/**
 * 클릭 위치에서 물결 효과(ripple)가 퍼지는 버튼 컴포넌트
 *
 * CSS + state 기반 ripple 구현:
 * - 클릭 좌표에서 원형 물결이 퍼져나가는 마이크로 인터랙션
 * - 400ms 후 ripple span 자동 제거
 * - position: relative + overflow: hidden 필수 (컴포넌트 내부 적용)
 */

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

interface RippleButtonProps extends ComponentPropsWithRef<'button'> {
  /** ripple 색상 (기본값: 'currentColor') */
  rippleColor?: string
}

export function RippleButton({
  children,
  className = '',
  onClick,
  rippleColor = 'currentColor',
  style,
  disabled,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return

      const button = e.currentTarget
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      const id = Date.now()
      setRipples((prev) => [...prev, { id, x, y, size }])

      // 400ms 후 ripple 제거
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
      }, 400)

      onClick?.(e)
    },
    [disabled, onClick],
  )

  return (
    <button
      {...props}
      disabled={disabled}
      className={`relative overflow-hidden ${className}`}
      style={style}
      onClick={handleClick}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            color: rippleColor,
            backgroundColor: 'currentColor',
          }}
        />
      ))}
    </button>
  )
}
