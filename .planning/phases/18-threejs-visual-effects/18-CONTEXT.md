# Phase 18: Three.js 시각 효과 - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

반전 모드(FunMode)에서 React Three Fiber(@react-three/fiber v9) 기반 3D 배경 + 파티클 이펙트 + 이벤트 반응 연출 구현. Phase 15에서 구축한 FunModeGate Suspense 인프라를 활성화하여 Three.js lazy load. 저사양 기기 fallback 포함.

</domain>

<decisions>
## Implementation Decisions

### 3D 배경 테마
- 화면별 배경 테마: 홈(우주/별), 퀴즈(네온 격자/사이버펑크), 분석(파도/물결), 프로필(산/자연)
- 배경은 CSS z-index 최하단, React DOM 위에 canvas 렌더링
- 미묘하게 움직이는 ambient 애니메이션 (60fps 목표, 30fps 최소)
- 마우스/터치 위치에 미세 반응 (parallax 느낌)

### 파티클 이펙트
- 정답: 중앙에서 방사형으로 퍼지는 골드/그린 파티클 폭발 (~1초)
- 오답: 화면 전체 빨간 플래시 (0.2초) + CSS transform shake (0.3초) — Three.js 불필요, CSS로 처리
- 콤보: 정답 파티클 + 콤보 단계별 파티클 양/크기 증가
- 레벨업: 이미 Phase 16에서 LevelUpOverlay 있음 → Three.js 파티클 배경 추가 (ring expand + sparkle)
- 퀴즈 완료: canvas-confetti 라이브러리 사용 (Phase 15에서 이미 의존성 확정)

### 성능/저사양 대응
- WebGL 지원 체크: 미지원 시 2D CSS fallback (간단한 gradient 애니메이션)
- FPS 모니터링: 15fps 이하 지속 시 자동으로 파티클 수 감소 또는 3D 배경 비활성화
- 모바일: 파티클 수 50% 감소, 배경 해상도 절반 (devicePixelRatio 제한)
- R3F 컴포넌트는 React.lazy()로 완전 코드 스플리팅 (Phase 15 manualChunks 'game-three' 활용)

### 이벤트 연동 방식
- Phase 15의 SimpleEventEmitter 패턴 활용 (gamification-event bus)
- QuizPlayer → awardXP 결과 → EventBus emit → Three.js 씬이 subscribe
- React 렌더 사이클 밖에서 직접 Three.js 오브젝트 조작 (useFrame 내부)

### Claude's Discretion
- 정확한 파티클 수, 크기, 속도, 색상 값
- Three.js 셰이더 복잡도
- FPS 임계값 튜닝
- 배경 테마별 지오메트리 디테일 수준
- canvas-confetti 설정 값 (파티클 수, 확산 각도 등)

</decisions>

<specifics>
## Specific Ideas

- 우주 배경: 작은 별들이 천천히 움직이며 가끔 유성이 지나감
- 네온 격자: Tron 스타일 와이어프레임 바닥이 앞으로 스크롤되는 느낌
- 정답 파티클은 게임 느낌이지만 과하지 않게 — 학습 방해 금지
- Phase 20 디자인 피드백 사전 반영: 어두운 배경 + 밝은 글자 가독성, 화려하되 일관된 디자인, SVG 아이콘 활용

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-threejs-visual-effects*
*Context gathered: 2026-02-23*
