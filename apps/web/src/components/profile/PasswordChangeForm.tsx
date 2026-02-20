/**
 * PasswordChangeForm — 기존 비밀번호 확인 + 새 비밀번호 설정 폼
 *
 * - react-hook-form + zod 유효성 검사
 *   - currentPassword: 필수
 *   - newPassword: 8자 이상
 *   - confirmPassword: newPassword와 일치
 * - 저장 버튼: isSubmitting 중 disabled
 * - 에러 시 서버 에러 메시지 표시 (isApiError 타입 가드)
 * - 성공 시 "비밀번호가 변경되었습니다" 피드백 + 폼 리셋
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { changePassword } from '@/lib/auth'
import { isApiError } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
    newPassword: z.string().min(8, '새 비밀번호는 8자 이상이어야 합니다'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '새 비밀번호와 비밀번호 확인이 일치하지 않습니다',
    path: ['confirmPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

export function PasswordChangeForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: PasswordFormData) {
    setServerError(null)
    try {
      await changePassword(data.currentPassword, data.newPassword)
      setSuccessMessage(true)
      reset()
      setTimeout(() => setSuccessMessage(false), 3000)
    } catch (err) {
      if (isApiError(err)) {
        setServerError(err.error)
      } else {
        setServerError('비밀번호 변경 중 오류가 발생했습니다')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 현재 비밀번호 */}
      <div className="space-y-1.5">
        <Label htmlFor="current-password">현재 비밀번호</Label>
        <Input
          id="current-password"
          type="password"
          placeholder="현재 비밀번호 입력"
          autoComplete="current-password"
          {...register('currentPassword')}
          aria-invalid={!!errors.currentPassword}
        />
        {errors.currentPassword && (
          <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      {/* 새 비밀번호 */}
      <div className="space-y-1.5">
        <Label htmlFor="new-password">새 비밀번호</Label>
        <Input
          id="new-password"
          type="password"
          placeholder="새 비밀번호 입력 (8자 이상)"
          autoComplete="new-password"
          {...register('newPassword')}
          aria-invalid={!!errors.newPassword}
        />
        {errors.newPassword && (
          <p className="text-xs text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      {/* 비밀번호 확인 */}
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">비밀번호 확인</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="새 비밀번호를 다시 입력하세요"
          autoComplete="new-password"
          {...register('confirmPassword')}
          aria-invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* 서버 에러 메시지 */}
      {serverError && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {serverError}
        </p>
      )}

      {/* 저장 버튼 + 성공 메시지 */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          비밀번호 변경
        </Button>
        {successMessage && (
          <p className="text-sm text-green-600 dark:text-green-400">
            비밀번호가 변경되었습니다
          </p>
        )}
      </div>
    </form>
  )
}
