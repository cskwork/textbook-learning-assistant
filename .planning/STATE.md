# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-23)

**핵심 가치:** 학생이 자신의 취약한 수학 유형을 정확히 파악하고, AI가 추천하는 맞춤 문제를 통해 효율적으로 실력을 향상시킬 수 있어야 한다
**현재 집중:** v3.0 반전 모드 — 게이미피케이션 학습 혁명

## Current Position

Phase: 15 (반전 모드 기반 인프라 + 번들 전략)
Plan: —
Status: 계획 수립 대기 중
Last activity: 2026-02-23 — v3.0 로드맵 생성 완료

진행 상황: [Phase 15 ░░░░░░░░░░] 0% | v3.0 전체 [░░░░░░░░░░] 0/6 phases

## Performance Metrics

| 마일스톤 | Phases | Plans | 상태 |
|---------|--------|-------|------|
| v1.0 MVP | 9 | 38 | 완료 |
| v2.0 디자인 리뉴얼 | 5 | 21 | 완료 |
| v3.0 반전 모드 | 6 | 미정 | 진행 중 |

## Accumulated Context

### Decisions

- **FunModeContext 단일 게이트 패턴**: `data-fun-mode` DOM 속성 + CSS 변수로 테마 즉시 전환. 각 페이지는 `useFunMode()` 훅 하나로 UI 분기.
- **번들 분리 전략 확정**: Phaser/Three.js/Howler.js는 React.lazy() + Vite manualChunks('game-phaser', 'game-three', 'game-howler')로 완전 분리. 일반 모드 번들 영향 = 0.
- **게임 상태 React 외부 관리**: Phaser 씬과 React DOM은 EventBus 패턴으로만 통신. Three.js + Howler.js는 React 외부 싱글턴. 60fps 리렌더링 방지.
- **SDT 기반 보상 설계**: 보상은 학습 성취 기반으로만. 반전 모드 기본값 OFF. BGM 기본값 OFF. 반 내 리더보드만 허용 (전교 공개 랭킹 제외).
- **신규 라이브러리 버전**: Phaser 3.90.0, Three.js 0.183.1, @react-three/fiber 9.5.0, @react-three/drei 10.7.7, Howler 2.2.4, use-sound 5.0.0, canvas-confetti 1.9.4.
- **Phaser 4 제외**: 현재 RC(beta) 단계로 불안정. Phaser 3.90 사용.
- **R3F v8 제외**: React 18 전용. v9(React 19 전용) 사용.

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

Last activity: 2026-02-23 — v3.0 로드맵 생성 완료
Stopped at: Phase 15 계획 수립 전
Resume file: None
Next command: `/gsd:plan-phase 15`
