---
phase: 17-sound-system
plan: "02"
subsystem: sound
tags: [bgm-toggle, sound-settings, sfx-integration, ios-unlock, howler, quiz-player]

requires:
  - phase: 17-sound-system/01
    provides: SoundManager, SfxEngine, useSoundSettings, useSfx
  - phase: 16-reward-system
    provides: QuizPlayer 게이미피케이션 흐름 (comboOnCorrect, awardXP, updateStreak)
provides:
  - BgmToggleButton 헤더 BGM 토글 UI
  - SoundSettingsPanel 볼륨/음소거 설정 UI
  - QuizPlayer SFX 연동 (정답/오답/콤보/레벨업/뱃지)
  - iOS AudioContext 잠금 해제 (FunModeToggleButton)
  - BGM lazy load on FunMode entry
affects: [18-visual-effects, 19-quiz-engine, 20-full-design]

tech-stack:
  added: []
  patterns: [동적 import('howler') iOS unlock, soundManager.loadBGM lazy load]

key-files:
  created:
    - apps/web/src/components/sound/BgmToggleButton.tsx
    - apps/web/src/components/sound/SoundSettingsPanel.tsx
    - apps/web/public/sounds/.gitkeep
  modified:
    - apps/web/src/components/layout/AppShell.tsx
    - apps/web/src/routes/student/profile/index.tsx
    - apps/web/src/components/quiz/QuizPlayer.tsx
    - apps/web/src/components/layout/FunModeToggleButton.tsx

key-decisions:
  - "동적 import('howler') 패턴 — 일반 모드에서 howler 번들 로드 방지, FunMode 토글 클릭 시에만 로드"
  - "콤보 SFX multiplier→comboStep 역산 — 1.5→2, 2→3, 2.5→4, 3→5 매핑으로 단계별 피치 상승"
  - "BGM 파일 부재 시 앱 정상 동작 — SoundManager.loadBGM onloaderror 핸들링으로 무음 fallback"

patterns-established:
  - "동적 import + AudioContext.resume(): FunMode 토글에서 iOS Safari 오디오 잠금 해제 패턴"
  - "fire-and-forget SFX 패턴: playSfx() 호출은 비동기 대기 없이 즉시 반환"

requirements-completed: [SND-01, SND-02, SND-03, SND-04, SND-05]

duration: 4 min
completed: 2026-02-23
---

# Phase 17 Plan 02: BGM 토글 UI + 사운드 설정 패널 + QuizPlayer SFX 연동 + iOS 잠금 해제 Summary

**사운드 엔진을 UI에 연결 — 헤더 BGM 토글, 프로필 사운드 설정 패널, QuizPlayer 6종 SFX 트리거, iOS AudioContext 동적 잠금 해제**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-23T14:39:10Z
- **Completed:** 2026-02-23T14:43:13Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- BgmToggleButton이 FunMode 헤더에 BGM ON/OFF 토글 표시 (Volume2/VolumeX, green 강조)
- SoundSettingsPanel이 프로필 페이지에 BGM/SFX 볼륨 슬라이더 + 전체 음소거 Switch 제공
- QuizPlayer에서 정답/오답/콤보/레벨업/뱃지 5종 SFX 즉각 재생
- FunModeToggleButton 클릭 시 동적 import로 iOS AudioContext 잠금 해제
- FunMode 진입 시 BGM 에셋 lazy load (기본 OFF)
- game-howler 청크 36.72KB 독립 분리 확인

## Task Commits

Each task was committed atomically:

1. **Task 1: BgmToggleButton + SoundSettingsPanel + AppShell/프로필 통합** - `601ff4f` (feat)
2. **Task 2: QuizPlayer SFX + FunModeToggleButton iOS unlock + BGM lazy load** - `2f98168` (feat)

## Files Created/Modified
- `apps/web/src/components/sound/BgmToggleButton.tsx` - 헤더 BGM ON/OFF 토글 버튼
- `apps/web/src/components/sound/SoundSettingsPanel.tsx` - BGM/SFX 볼륨 + 음소거 설정 패널
- `apps/web/src/components/layout/AppShell.tsx` - BgmToggleButton 헤더 삽입
- `apps/web/src/routes/student/profile/index.tsx` - SoundSettingsPanel 프로필 삽입
- `apps/web/src/components/quiz/QuizPlayer.tsx` - useSfx 훅으로 5종 SFX 트리거
- `apps/web/src/components/layout/FunModeToggleButton.tsx` - 동적 howler import + iOS AudioContext resume
- `apps/web/public/sounds/.gitkeep` - BGM 에셋 디렉터리 placeholder

## Decisions Made
- 동적 import('howler') 패턴으로 일반 모드 번들 영향 0 유지
- 콤보 SFX multiplier→comboStep 역산으로 단계별 피치 상승 매핑
- BGM 파일 부재 시 SoundManager.loadBGM onloaderror로 무음 fallback

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 17 사운드 시스템 완료
- BGM 에셋 파일(bgm-study.mp3)은 추후 소싱 필요 (SoundManager.loadBGM은 파일 부재 시 무음 처리)
- Phase 18 (Three.js 시각 효과) 진행 가능

---
*Phase: 17-sound-system*
*Completed: 2026-02-23*
