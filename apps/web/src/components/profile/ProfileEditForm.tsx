/**
 * ProfileEditForm — 이름 + 아바타 이모지 선택 편집 폼
 *
 * - react-hook-form + zod로 폼 관리
 * - 이름 입력 필드 (1~20자)
 * - 20개 이모지 그리드 선택 (클릭 시 선택됨, 선택된 항목 ring 강조)
 * - AvatarDisplay로 현재 선택 미리보기
 * - 저장 버튼: isSubmitting 중 disabled + 스피너
 * - 성공 시 3초간 피드백 메시지 표시
 */

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import type { User } from '@/lib/auth'
import { AvatarDisplay } from './AvatarDisplay'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// 미리 정의된 이모지 목록 (20개)
const AVATAR_EMOJIS = [
  '🐧', '🦊', '🐰', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷',
  '🐸', '🐵', '🐔', '🐤', '🦉',
  '🐝', '🐙', '🐠', '🌸', '📚',
]

const profileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(20, '이름은 20자 이하로 입력해주세요'),
  avatarEmoji: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileEditFormProps {
  user: User
  onSave: (updates: Pick<User, 'name' | 'avatarEmoji'>) => Promise<void>
}

export function ProfileEditForm({ user, onSave }: ProfileEditFormProps) {
  const [successMessage, setSuccessMessage] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? '',
      avatarEmoji: user.avatarEmoji ?? '',
    },
  })

  const watchedName = watch('name')
  const watchedEmoji = watch('avatarEmoji')

  // user props가 외부에서 업데이트되면 폼 초기값 재동기화
  useEffect(() => {
    setValue('name', user.name ?? '')
    setValue('avatarEmoji', user.avatarEmoji ?? '')
  }, [user.name, user.avatarEmoji, setValue])

  async function onSubmit(data: ProfileFormData) {
    await onSave({
      name: data.name,
      avatarEmoji: data.avatarEmoji || undefined,
    })
    setSuccessMessage(true)
    setTimeout(() => setSuccessMessage(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* 현재 아바타 미리보기 */}
      <div className="flex items-center gap-4">
        <AvatarDisplay
          email={user.email}
          name={watchedName || user.name}
          avatarEmoji={watchedEmoji || undefined}
          size="lg"
        />
        <div>
          <p className="text-sm font-medium text-foreground">{watchedName || user.name || user.email}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* 이름 입력 */}
      <div className="space-y-1.5">
        <Label htmlFor="profile-name">이름</Label>
        <Input
          id="profile-name"
          placeholder="표시 이름을 입력하세요"
          {...register('name')}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* 아바타 이모지 선택 */}
      <div className="space-y-1.5">
        <Label>아바타 이모지 선택</Label>
        <div className="grid grid-cols-10 gap-1.5">
          {AVATAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setValue('avatarEmoji', emoji)}
              className={cn(
                'w-8 h-8 text-lg rounded-lg flex items-center justify-center transition-all hover:bg-primary/10',
                watchedEmoji === emoji
                  ? 'ring-2 ring-primary bg-primary/10'
                  : 'bg-muted/50',
              )}
              aria-label={`아바타 이모지 ${emoji} 선택`}
              aria-pressed={watchedEmoji === emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
        {/* 이모지 선택 취소 버튼 */}
        {watchedEmoji && (
          <button
            type="button"
            onClick={() => setValue('avatarEmoji', '')}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            이모지 선택 취소 (이니셜 사용)
          </button>
        )}
      </div>

      {/* 저장 버튼 + 성공 메시지 */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          저장
        </Button>
        {successMessage && (
          <p className="text-sm text-green-600 dark:text-green-400">
            프로필이 저장되었습니다
          </p>
        )}
      </div>
    </form>
  )
}
