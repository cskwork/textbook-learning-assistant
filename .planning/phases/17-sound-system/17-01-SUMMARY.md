---
phase: 17-sound-system
plan: "01"
subsystem: sound
tags: [howler, web-audio-api, sfx, bgm, dexie, singleton]

requires:
  - phase: 15-infra-fun-mode
    provides: FunModeContext, EventBus 싱글턴 패턴, Vite manualChunks game-howler
  - phase: 16-reward-system
    provides: Dexie v8 gamification 테이블, useGamification useLiveQuery 패턴
provides:
  - SoundManager BGM 싱글턴 매니저 (load/toggle/volume/mute + React subscribe)
  - SfxEngine Web Audio API 6종 효과음 합성 엔진
  - sound-settings Dexie CRUD 서비스
  - useSoundSettings reactive 설정 훅 (DB ↔ SoundManager 양방향 동기화)
  - useSfx FunMode 전용 SFX 재생 훅
affects: [17-02-PLAN, 18-visual-effects, 19-quiz-engine]

tech-stack:
  added: [howler 2.2.4, "@types/howler"]
  patterns: [React 외부 싱글턴 + subscribe/getSnapshot, Web Audio OscillatorNode 합성, Dexie useLiveQuery reactive 패턴]

key-files:
  created:
    - apps/web/src/lib/sound/SoundManager.ts
    - apps/web/src/lib/sound/SfxEngine.ts
    - apps/web/src/lib/sound/sound-settings.ts
    - apps/web/src/hooks/useSoundSettings.ts
    - apps/web/src/hooks/useSfx.ts
  modified:
    - apps/web/src/lib/db.ts
    - apps/web/package.json

key-decisions:
  - "SoundManager subscribe/getSnapshot 패턴 — useSyncExternalStore 호환 설계로 React 외부 싱글턴 상태를 React에서 구독 가능"
  - "SfxEngine이 Howler.ctx AudioContext 공유 — 별도 AudioContext 생성 없이 Howler가 관리하는 컨텍스트 재사용"
  - "saveSoundSettings upsert 패턴 — 기존 settings.service.ts와 동일한 where→first→update/put 패턴 준수"

patterns-established:
  - "React 외부 싱글턴 + subscribe/getSnapshot: SoundManager가 React 렌더 사이클과 독립적으로 오디오 상태 관리"
  - "Web Audio API 프로그래매틱 합성: OscillatorNode + GainNode로 파일 없이 효과음 생성 (번들 크기 0)"
  - "Dexie 사운드 설정 upsert: loadSoundSettings/saveSoundSettings로 DB ↔ 런타임 양방향 동기화"

requirements-completed: [SND-01, SND-02, SND-03, SND-04, SND-05]

duration: 5 min
completed: 2026-02-23
---

# Phase 17 Plan 01: SoundManager 싱글턴 + SFX 합성 엔진 + Dexie 사운드 설정 + React 훅 Summary

**Howler.js 기반 BGM 싱글턴 매니저 + Web Audio API OscillatorNode 6종 SFX 합성 엔진 + Dexie reactive 사운드 설정 훅**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-23T14:33:00Z
- **Completed:** 2026-02-23T14:39:10Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- SoundManager 싱글턴이 React 외부에서 BGM 로드/토글/볼륨/뮤트를 관리하며 subscribe/getSnapshot으로 React 구독 지원
- SfxEngine이 6종 효과음(correct/wrong/combo/levelUp/badge/streak)을 Web Audio API로 파일 없이 합성
- Dexie userSettings에 사운드 설정 4개 필드 추가 (version 변경 없음, 인덱스 불필요)
- useSoundSettings가 useLiveQuery로 DB 변경 시 자동 반응 + soundManager 양방향 동기화
- useSfx가 FunMode 전용으로 SFX 재생을 선언적으로 제공

## Task Commits

Each task was committed atomically:

1. **Task 1: Howler.js 설치 + SoundManager + SfxEngine** - `333e128` (feat)
2. **Task 2: Dexie 확장 + 설정 서비스 + React 훅** - `b6ef9d5` (feat)

## Files Created/Modified
- `apps/web/src/lib/sound/SoundManager.ts` - BGM 싱글턴 매니저 (load/toggle/volume/mute + subscribe)
- `apps/web/src/lib/sound/SfxEngine.ts` - Web Audio API 6종 SFX 합성 엔진
- `apps/web/src/lib/sound/sound-settings.ts` - Dexie 사운드 설정 CRUD 서비스
- `apps/web/src/hooks/useSoundSettings.ts` - Dexie reactive 사운드 설정 훅
- `apps/web/src/hooks/useSfx.ts` - FunMode 전용 SFX 재생 훅
- `apps/web/src/lib/db.ts` - UserSetting에 사운드 설정 4개 필드 추가
- `apps/web/package.json` - howler 2.2.4 의존성 추가

## Decisions Made
- SoundManager subscribe/getSnapshot 패턴 — useSyncExternalStore 호환으로 React 외부 상태를 React에서 구독 가능
- SfxEngine이 Howler.ctx AudioContext 공유 — 별도 AudioContext 생성 금지, Howler 관리 컨텍스트 재사용
- saveSoundSettings upsert 패턴 — 기존 settings.service.ts와 동일한 where→first→update/put 패턴

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 01 완료, Plan 02 (UI 연동) 의존성 충족
- SoundManager/SfxEngine/useSoundSettings/useSfx 모두 Plan 02에서 즉시 사용 가능
- game-howler 청크는 Plan 02에서 UI 컴포넌트가 howler를 import할 때 자동 생성됨

---
*Phase: 17-sound-system*
*Completed: 2026-02-23*
