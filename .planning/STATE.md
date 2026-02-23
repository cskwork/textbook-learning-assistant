# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-23)

**핵심 가치:** 학생이 자신의 취약한 수학 유형을 정확히 파악하고, AI가 추천하는 맞춤 문제를 통해 효율적으로 실력을 향상시킬 수 있어야 한다
**현재 집중:** v3.0 반전 모드 — 게이미피케이션 학습 혁명

## Current Position

Phase: 18 (Three.js 시각 효과) — 진행 중
Plan: 1/4 plans 완료
Status: Plan 01 완료 (R3F Canvas 인프라 + 배경 씬), Plan 02/03/04 대기
Last activity: 2026-02-24 — Plan 01 완료 (R3F Canvas + 4개 배경 씬 + GPU 감지 + FunModeGate 활성화)

진행 상황: [Phase 18 ██░░░░░░░░] 25% (1/4 plans) | v3.0 전체 [█████░░░░░] 4.25/6 phases

## Performance Metrics

| 마일스톤 | Phases | Plans | 상태 |
|---------|--------|-------|------|
| v1.0 MVP | 9 | 38 | 완료 |
| v2.0 디자인 리뉴얼 | 5 | 21 | 완료 |
| v3.0 반전 모드 | 6 | 미정 | 진행 중 |
| Phase 15-infra-fun-mode P02 | 3 | 2 tasks | 5 files |
| Phase 15 P01 | 2 | 2 tasks | 6 files |
| Phase 15 P03 | 2 | 2 tasks | 4 files |
| Phase 16 P01 | 5 min | 2 tasks | 9 files |
| Phase 16 P02 | 3 | 2 tasks | 7 files |
| Phase 16 P03 | 4 min | 2 tasks | 5 files |
| Phase 16 P04 | 2 min | 2 tasks | 3 files |
| Phase 16 P05 | 3 min | 2 tasks | 2 files |
| Phase 17 P01 | 5 min | 2 tasks | 7 files |
| Phase 17 P02 | 4 min | 2 tasks | 7 files |
| Phase 18 P01 | 5 min | 2 tasks | 11 files |

## Accumulated Context

### Decisions

- **FunModeContext 단일 게이트 패턴**: `data-fun-mode` DOM 속성 + CSS 변수로 테마 즉시 전환. 각 페이지는 `useFunMode()` 훅 하나로 UI 분기.
- **번들 분리 전략 확정**: Phaser/Three.js/Howler.js는 React.lazy() + Vite manualChunks('game-phaser', 'game-three', 'game-howler')로 완전 분리. 일반 모드 번들 영향 = 0.
- **게임 상태 React 외부 관리**: Phaser 씬과 React DOM은 EventBus 패턴으로만 통신. Three.js + Howler.js는 React 외부 싱글턴. 60fps 리렌더링 방지.
- **SDT 기반 보상 설계**: 보상은 학습 성취 기반으로만. 반전 모드 기본값 OFF. BGM 기본값 OFF. 반 내 리더보드만 허용 (전교 공개 랭킹 제외).
- **신규 라이브러리 버전**: Phaser 3.90.0, Three.js 0.183.1, @react-three/fiber 9.5.0, @react-three/drei 10.7.7, Howler 2.2.4, use-sound 5.0.0, canvas-confetti 1.9.4.
- **Phaser 4 제외**: 현재 RC(beta) 단계로 불안정. Phaser 3.90 사용.
- **R3F v8 제외**: React 18 전용. v9(React 19 전용) 사용.
- [Phase 15-infra-fun-mode]: eventemitter3 대신 경량 SimpleEventEmitter 직접 구현 — Phase 19에서 Phaser.Events.EventEmitter 교체 예정
- [Phase 15-infra-fun-mode]: FunModeGate Phase 15에서 Suspense 인프라만 구축 — Phase 18 ThreeBackground, Phase 19 PhaserBridge lazy import 활성화 예정
- [Phase 15]: FunModeProvider 위치: SettingsProvider > FunModeProvider > AuthProvider 순서 (인증 여부와 무관한 테마 동작 보장)
- [Phase 15]: CSS 변수 오버라이드 방식: [data-fun-mode='true'] 선택자를 @layer base 내부에 배치해 :root 변수보다 높은 우선순위 적용
- [Phase 15-infra-fun-mode]: Dexie version(8) 신규 테이블만 정의 — 기존 테이블 자동 상속, gamificationProfiles/xpEvents/badges Phase 16 준비
- [Phase 15-infra-fun-mode]: PhaserBridge POC 패턴 확립 — useRef 가드 + dynamic import + cleanup(destroy(true)) 3단계로 G1/G2/G3 pitfall 방지
- [Phase 16-01]: XP 레벨 곡선: Lv1→2=100XP, 매 레벨 1.15배 증가, 최대 50레벨 (초반 빠른 레벨업)
- [Phase 16-01]: 콤보 배수: 2=1.5x, 3=2x, 4=2.5x, 5+=3x(max) | 난이도 XP: 쉬움=100, 보통=200, 어려움=300
- [Phase 16-01]: 스트릭 보너스: 3일=50XP, 7일=150XP, 14일=300XP, 30일=500XP
- [Phase 16-01]: 뱃지 17개: 학습 5개(study) + 연속 5개(streak) + 성취 7개(achievement), 첫날 2개 획득 가능
- [Phase 16-01]: 데일리 챌린지 난이도: 평일 3문제(월화=2, 수목=3, 금=4), 주말 5문제(난이도3)
- [Phase 16-01]: 주간 챌린지 목표: 50문제
- [Phase 16-02]: XPBar 그라데이션 + 반짝임 하이라이트 오버레이로 게임 UI 질감 구현
- [Phase 16-02]: BadgeUnlockOverlay epic 전용 pulse glow — scale/opacity 루프로 희귀도 3단계 차별화
- [Phase 16-02]: ComboCounter fixed inset-0 화면 정중앙 — 콤보 놓치지 않도록 강제 시선 유도
- [Phase 16-03]: 리더보드 surrounding 중복 제거 — top3 studentId Set으로 필터, TOP3 안에 드는 학생은 내 주변에 중복 표시 안 함
- [Phase 16-03]: displayName fallback: userSettings.displayName 없으면 email @ 앞부분 사용 (POC 환경 대비)
- [Phase 16-03]: 주간 챌린지 완료 보너스 1000 XP — 데일리(500 XP)의 2배, 주간 목표가 약 16.7일 데일리 분량이므로 합리적
- [Phase 16-04]: onGamificationResult 콜백 패턴 — QuizPlayer → QuizPage 레벨업/뱃지 이벤트 전달, 오버레이는 페이지 레벨에서 렌더링
- [Phase 20 사전 피드백]: 게임모드 가독성 — 어두운 배경에 밝은 글자, 일관된 디자인. 더 화려하고 레이저 효과. 이모지 대신 SVG 아이콘 사용 (고퀄리티)
- [Phase 16-04]: XPBar FocusMode 숨김 — 퀴즈 풀기 중 집중 방해 방지, isFocusMode 기반 조건부 렌더링
- [Phase 16-05]: studentGroupId useLiveQuery undefined → ?? null 처리로 Leaderboard groupId 타입 안전하게 전달
- [Phase 16-05]: StreakCounter bonusXP=0 홈 고정 — 실시간 보너스는 Phase 19 퀴즈 세션에서 담당
- [Phase 16-05]: handleStartDailyChallenge 임시 구현 — /student/problems 리디렉션, Phase 19에서 실제 챌린지 모드로 교체 예정
- [Phase 17-01]: SoundManager subscribe/getSnapshot 패턴 — useSyncExternalStore 호환으로 React 외부 싱글턴 상태 구독
- [Phase 17-01]: SfxEngine이 Howler.ctx AudioContext 공유 — 별도 AudioContext 생성 금지
- [Phase 17-01]: saveSoundSettings upsert 패턴 — 기존 settings.service.ts와 동일한 where→first→update/put 방식
- [Phase 17-02]: 동적 import('howler') iOS AudioContext unlock — FunMode 토글 클릭 시에만 howler 로드, 일반 모드 번들 영향 0
- [Phase 17-02]: 콤보 SFX multiplier→comboStep 역산 — 1.5→2, 2→3, 2.5→4, 3→5 매핑
- [Phase 17-02]: game-howler 청크 36.72KB 독립 분리 — Vite manualChunks 정상 동작 확인

### Critical Pitfalls (Phase 15에서 먼저 검증 필수)

- **G1 React StrictMode + Phaser 이중 초기화**: `useRef` 가드로 이중 초기화 방지. Phaser 공식 React TypeScript 템플릿 패턴 사용.
- **G3 WebGL 컨텍스트 한도**: Phaser + Three.js 동시 실행 시 브라우저 한도(8~16개) 주의. Three.js 이펙트는 특별한 순간에만 사용 후 즉시 dispose().
- **G4 iOS Web Audio 자동재생 차단**: 반전 모드 진입 버튼 click 핸들러에서 `audioContext.resume()` 명시 호출. iPhone 실기기 테스트 필수.
- **G5 번들 사이즈**: Phaser/Three.js 정적 import 절대 금지. 반드시 React.lazy() + manualChunks.
- **G6 게이미피케이션 내재 동기 약화**: SDT 기반 설계 원칙 구현 전 문서화.
- **G2 Phaser 씬 메모리 누수**: 씬 shutdown 핸들러에서 텍스처/오디오 명시 제거. `game.destroy(true)` cleanup 호출.

### Pending Todos

- [ ] Phase 15 계획 수립: `/gsd:plan-phase 15`
- [ ] 사운드 에셋 소싱 결정: freesound.org/pixabay CC0 또는 직접 제작 (Phase 17 전에 결정 필요)
- [ ] Phase 15 POC: Safari WebGL 컨텍스트 한도 실측 (단일 소스 수치 검증 필요)
- [ ] Phase 19 초기: 저사양 Android 태블릿 (Snapdragon 450급) 실기기 테스트 계획

### Blockers/Concerns

- 빌드 chunk size 경고 (2780KB) — lazy import 패턴 개선 필요 (Phase 15에서 해결 예정)
- POC 아키텍처 (localStorage + Dexie) — 실서비스 전환 시 백엔드 연동 필요
- Phaser/Three.js 번들 사이즈 — lazy loading 및 코드 스플리팅 필수 (Phase 15 번들 전략으로 해결 예정)
- R3F v9 peer dep `react: ">=19 <19.3"` — React 19.3 릴리즈 시 즉시 재검토 필요

## Session Continuity

Last activity: 2026-02-23 — Phase 17 Plan 02 완료 (BGM 토글 UI + SoundSettings + QuizPlayer SFX + iOS 잠금 해제)
Stopped at: Completed 17-sound-system-02-PLAN.md
Resume file: None
Next command: `/gsd:discuss-phase 18` (Phase 18: Three.js 시각 효과)
