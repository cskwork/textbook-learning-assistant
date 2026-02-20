/**
 * 강사 마이페이지
 *
 * 학생 마이페이지와 동일한 구조, 유일한 차이:
 * - 페이지 제목 "강사 마이페이지"
 * - 계정 삭제 안내 문구에 강사 데이터(반, 과제) 삭제 명시
 *
 * 섹션:
 * 1. 프로필 — AvatarDisplay + ProfileEditForm (이름/이모지 편집)
 * 2. 앱 설정 — 다크모드 Switch + 수식 글꼴 크기 Slider + KaTeX 미리보기
 * 3. 보안 — PasswordChangeForm (비밀번호 변경)
 * 4. 위험 영역 — 계정 삭제 Dialog (이메일 입력 확인 후 삭제)
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Trash2, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { deleteAccount } from '@/lib/auth'
import { saveUserSettings, getGeminiApiKey, saveGeminiApiKey } from '@/services/settings.service'
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
import type { User } from '@/lib/auth'

export default function InstructorProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  const { isDarkMode, katexFontSize, toggleDarkMode, setKatexFontSize } = useSettings()
  const navigate = useNavigate()

  // 계정 삭제 Dialog 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteEmailInput, setDeleteEmailInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Gemini API 키 관리 상태
  const [geminiKey, setGeminiKey] = useState('')
  const [geminiKeySaved, setGeminiKeySaved] = useState(false)
  const [geminiKeyLoading, setGeminiKeyLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    getGeminiApiKey(user.email).then(key => {
      if (key) setGeminiKey(key)
    })
  }, [user?.email])

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

  async function handleSaveGeminiKey() {
    if (!user) return
    setGeminiKeyLoading(true)
    await saveGeminiApiKey(user.email, geminiKey.trim())
    setGeminiKeyLoading(false)
    setGeminiKeySaved(true)
    setTimeout(() => setGeminiKeySaved(false), 2000)
  }

  if (!user) return null

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">강사 마이페이지</h1>
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
              <Label htmlFor="instructor-dark-mode-switch" className="text-sm font-medium">
                다크 모드
              </Label>
              <p className="text-xs text-muted-foreground">어두운 배경 테마를 사용합니다</p>
            </div>
            <Switch
              id="instructor-dark-mode-switch"
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              aria-label="다크 모드 전환"
            />
          </div>

          {/* 수식 글꼴 크기 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="instructor-katex-font-slider" className="text-sm font-medium">
                  수식 글꼴 크기
                </Label>
                <p className="text-xs text-muted-foreground">KaTeX 수식 렌더링 크기를 조절합니다</p>
              </div>
              <span className="text-sm font-mono text-muted-foreground">
                {katexFontSize.toFixed(1)}x
              </span>
            </div>
            <Slider
              id="instructor-katex-font-slider"
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

      {/* AI 설정 카드 */}
      <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI 문제 생성 설정
          </CardTitle>
          <CardDescription>
            Google AI Studio에서 발급한 Gemini API 키를 입력하세요.
            키는 이 기기에만 저장됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="AIza..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <Button
              onClick={handleSaveGeminiKey}
              disabled={geminiKeyLoading || !geminiKey.trim()}
              size="sm"
              className="shrink-0"
            >
              {geminiKeySaved ? '저장됨' : '저장'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            API 키가 없으면{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              Google AI Studio
            </a>
            에서 무료로 발급받으세요.
          </p>
        </CardContent>
      </Card>

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
                모든 강사 데이터(반 목록, 과제, 학생 관리 기록)와 학습 데이터가 영구적으로 삭제됩니다
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
                    정말로 계정을 삭제하시겠습니까? 반 목록, 과제, 학생 관리 기록 등 모든 강사 데이터가
                    영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 py-2">
                  <Label htmlFor="instructor-delete-email-confirm">
                    확인을 위해 이메일 주소를 입력하세요
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    계정 이메일: <span className="font-mono font-medium">{user.email}</span>
                  </p>
                  <Input
                    id="instructor-delete-email-confirm"
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
