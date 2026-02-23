/**
 * 학생 마이페이지
 *
 * 섹션:
 * 1. 프로필 — AvatarDisplay + ProfileEditForm (이름/이모지 편집)
 * 2. [FunMode] 획득 뱃지 — 레벨/XP/스트릭 요약 + 카테고리별 뱃지 그리드
 * 3. 앱 설정 — 다크모드 Switch + 수식 글꼴 크기 Slider + KaTeX 미리보기
 * 4. 보안 — PasswordChangeForm (비밀번호 변경)
 * 5. 위험 영역 — 계정 삭제 Dialog (이메일 입력 확인 후 삭제)
 */

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Trash2, Award, Trophy } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { deleteAccount } from '@/lib/auth'
import { saveUserSettings } from '@/services/settings.service'
import { AvatarDisplay } from '@/components/profile/AvatarDisplay'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm'
import { LatexPreview } from '@/components/questions/LatexPreview'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useFunMode } from '@/hooks/useFunMode'
import { useGamification } from '@/hooks/useGamification'
import { SoundSettingsPanel } from '@/components/sound/SoundSettingsPanel'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badge-definitions'
import { cn } from '@/lib/utils'
import type { User } from '@/lib/auth'

export default function StudentProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  const { isDarkMode, katexFontSize, toggleDarkMode, setKatexFontSize } = useSettings()
  const navigate = useNavigate()
  const { isFunMode } = useFunMode()
  const { profile, allBadges } = useGamification(user?.email)

  // 계정 삭제 Dialog 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteEmailInput, setDeleteEmailInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // 획득한 뱃지 ID Set
  const earnedBadgeIds = new Set(allBadges.map(b => b.badgeId))

  // 카테고리별 뱃지 그룹
  const badgesByCategory = {
    study: BADGE_DEFINITIONS.filter(b => b.category === 'study'),
    streak: BADGE_DEFINITIONS.filter(b => b.category === 'streak'),
    achievement: BADGE_DEFINITIONS.filter(b => b.category === 'achievement'),
  }

  const categoryLabels: Record<string, string> = {
    study: '학습',
    streak: '연속',
    achievement: '성취',
  }

  /**
   * 프로필 저장 — AuthContext.updateProfile + Dexie 백업
   */
  async function handleProfileSave(updates: Pick<User, 'name' | 'avatarEmoji'>) {
    if (!user) return
    const updated = await updateProfile(updates)
    // Dexie 백업 (실패해도 앱은 계속 동작)
    await saveUserSettings(updated.email, {
      displayName: updates.name,
      avatarEmoji: updates.avatarEmoji,
    }).catch(() => {})
  }

  /**
   * 계정 삭제 — 이메일 일치 확인 후 deleteAccount() 호출
   */
  async function handleDeleteAccount() {
    if (!user) return
    if (deleteEmailInput !== user.email) {
      setDeleteError('입력한 이메일이 계정 이메일과 일치하지 않습니다')
      return
    }
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteAccount()
      await logout()
      navigate('/login', { replace: true })
    } catch {
      setDeleteError('계정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.')
      setIsDeleting(false)
    }
  }

  if (!user) return null

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">마이페이지</h1>
        <p className="text-sm text-muted-foreground mt-1">프로필과 앱 설정을 관리하세요</p>
      </div>

      {/* 프로필 섹션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <AvatarDisplay email={user.email} name={user.name} avatarEmoji={user.avatarEmoji} size="lg" />
            <div>
              <CardTitle className="text-base">{user.name || user.email}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileEditForm user={user} onSave={handleProfileSave} />
        </CardContent>
      </Card>

      {/* 게이미피케이션 뱃지 섹션 — FunMode 전용 */}
      {isFunMode && profile && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <CardTitle>획득 뱃지</CardTitle>
            </div>
            <CardDescription>
              {allBadges.length}개 획득 / {BADGE_DEFINITIONS.length}개 중
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* 레벨/XP/스트릭 요약 */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
              <div className="text-center">
                <p className="text-2xl font-black text-primary">Lv.{profile.level}</p>
                <p className="text-[11px] text-muted-foreground">현재 레벨</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-foreground">{profile.totalXP.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">총 XP</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-orange-500">{profile.streakDays}일</p>
                <p className="text-[11px] text-muted-foreground">연속 학습</p>
              </div>
            </div>

            {/* 카테고리별 뱃지 그리드 */}
            {Object.entries(badgesByCategory).map(([category, badges]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-muted-foreground" />
                  {categoryLabels[category]}
                  <span className="text-xs text-muted-foreground font-normal ml-1">
                    ({badges.filter(b => earnedBadgeIds.has(b.id)).length}/{badges.length})
                  </span>
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {badges.map((badge) => {
                    const isEarned = earnedBadgeIds.has(badge.id)
                    return (
                      <div
                        key={badge.id}
                        className={cn(
                          'flex flex-col items-center gap-1 p-2.5 rounded-xl text-center transition-all',
                          isEarned
                            ? 'bg-white dark:bg-card shadow-sm border border-border/30'
                            : 'bg-muted/20 opacity-40 grayscale',
                        )}
                      >
                        <span className="text-2xl">{badge.icon}</span>
                        <p className="text-[10px] font-semibold leading-tight">{badge.name}</p>
                        {isEarned && (
                          <span className={cn(
                            'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                            badge.rarity === 'epic' && 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
                            badge.rarity === 'rare' && 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
                            badge.rarity === 'common' && 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
                          )}>
                            {badge.rarity}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 앱 설정 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>앱 설정</CardTitle>
          <CardDescription>화면 테마와 수식 글꼴 크기를 조절합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 다크모드 */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode-switch" className="text-sm font-medium">
                다크 모드
              </Label>
              <p className="text-xs text-muted-foreground">어두운 배경 테마를 사용합니다</p>
            </div>
            <Switch
              id="dark-mode-switch"
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              aria-label="다크 모드 전환"
            />
          </div>

          {/* 수식 글꼴 크기 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="katex-font-slider" className="text-sm font-medium">
                  수식 글꼴 크기
                </Label>
                <p className="text-xs text-muted-foreground">KaTeX 수식 렌더링 크기를 조절합니다</p>
              </div>
              <span className="text-sm font-mono text-muted-foreground">
                {katexFontSize.toFixed(1)}x
              </span>
            </div>
            <Slider
              id="katex-font-slider"
              min={0.8}
              max={1.5}
              step={0.1}
              value={[katexFontSize]}
              onValueChange={([val]) => setKatexFontSize(val)}
              className="w-full"
              aria-label="수식 글꼴 크기 슬라이더"
            />
            {/* KaTeX 미리보기 */}
            <div className="rounded-lg border bg-muted/30 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-2">미리보기</p>
              <LatexPreview content="$x^2 + 2x + 1 = 0$" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 사운드 설정 섹션 — FunMode 전용 (Phase 17) */}
      {isFunMode && <SoundSettingsPanel userId={user.email} />}

      {/* 보안 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>보안</CardTitle>
          <CardDescription>비밀번호를 변경합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>

      {/* 위험 영역 섹션 */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">위험 영역</CardTitle>
          <CardDescription>되돌릴 수 없는 작업입니다. 신중하게 진행하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">계정 삭제</p>
              <p className="text-xs text-muted-foreground">
                모든 학습 데이터(풀이 기록, 오답노트, 문제집)가 영구적으로 삭제됩니다
              </p>
            </div>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setDeleteEmailInput('')
                    setDeleteError(null)
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  계정 삭제
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>계정을 삭제하시겠습니까?</DialogTitle>
                  <DialogDescription>
                    정말로 계정을 삭제하시겠습니까? 모든 학습 데이터가 영구적으로 삭제됩니다.
                    이 작업은 되돌릴 수 없습니다.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 py-2">
                  <Label htmlFor="delete-email-confirm">
                    확인을 위해 이메일 주소를 입력하세요
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    계정 이메일: <span className="font-mono font-medium">{user.email}</span>
                  </p>
                  <Input
                    id="delete-email-confirm"
                    type="email"
                    placeholder={user.email}
                    value={deleteEmailInput}
                    onChange={(e) => {
                      setDeleteEmailInput(e.target.value)
                      setDeleteError(null)
                    }}
                    autoComplete="off"
                  />
                  {deleteError && (
                    <p className="text-xs text-destructive">{deleteError}</p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={isDeleting}
                  >
                    취소
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteEmailInput !== user.email}
                  >
                    {isDeleting ? '삭제 중...' : '계정 영구 삭제'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
