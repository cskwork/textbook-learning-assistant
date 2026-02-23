# Phase 17: 사운드 시스템 - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

반전 모드(FunMode)에서 BGM 재생 + 이벤트별 SFX 재생 + iOS 오디오 잠금 해제 + 볼륨 개별 제어. Howler.js 기반 오디오 엔진 구축. 사운드 에셋 자체는 무료 라이센스 또는 Web Audio API 합성으로 생성.

</domain>

<decisions>
## Implementation Decisions

### BGM 동작
- BGM 기본값 OFF — 사용자가 명시적으로 켜야 재생
- BGM 토글 버튼: 헤더 영역 또는 FunMode 컨트롤 바에 배치
- BGM은 로딩/전환 시 끊김 없이 루프 재생 (crossfade 전환)
- 페이지 이동 시에도 BGM 유지 (React 외부 싱글턴 패턴 — Phase 15 결정 준수)
- BGM 트랙: 1개 기본 학습 BGM (밝고 차분한 lo-fi/chiptune 스타일)

### SFX 이벤트 매핑
- 정답: 짧고 밝은 성공음 (ding/chime, ~0.3초)
- 오답: 부드러운 실패음 (soft buzz, ~0.3초) — 학습 맥락이므로 공포감 없이
- 콤보: 정답음 + 추가 상승 효과음 (콤보 단계별 피치 상승)
- 레벨업: 팡파르/축하 사운드 (~1.5초)
- 뱃지 획득: 짧은 달성 효과음 (~1초)
- 스트릭 보너스: 코인 획득 사운드 (~0.5초)
- UI 클릭/탭: 없음 — SFX는 학습 이벤트에만 집중

### 볼륨 제어
- BGM 볼륨 슬라이더 (0-100%, 기본 50%)
- SFX 볼륨 슬라이더 (0-100%, 기본 70%)
- 전체 음소거 토글 (BGM + SFX 한번에)
- 볼륨 설정은 Dexie userSettings 테이블에 저장
- 설정 화면 내 "사운드" 섹션에 배치

### iOS 오디오 잠금 해제
- iOS Safari 정책: 사용자 제스처 없이 오디오 재생 불가
- FunMode 진입 시 첫 번째 사용자 인터랙션(탭/클릭)에서 Howler.js AudioContext 활성화
- 별도 "사운드 활성화" 버튼 없이 자연스러운 잠금 해제 — 첫 문제 풀기 등 기존 인터랙션 활용

### 사운드 에셋 전략
- Web Audio API 기반 프로그래매틱 합성 우선 (번들 크기 최소화, 라이센스 무관)
- 필요 시 freesound.org CC0 에셋 보조 사용
- 모든 SFX는 sprite 패턴으로 하나의 오디오 파일에 묶어 HTTP 요청 최소화
- BGM은 별도 파일 (lazy load, FunMode 진입 시에만 로드)

### Claude's Discretion
- 합성 사운드의 정확한 주파수/파형 설계
- SFX sprite 파일 구성 방식
- Howler.js pool size 및 동시 재생 수
- crossfade 지속 시간
- 오류 시 무음 fallback 처리 방식

</decisions>

<specifics>
## Specific Ideas

- 콤보 SFX는 단계별로 피치가 올라가는 느낌 (2연속: 기본, 3연속: 반음 높게, 5+연속: 옥타브 높게)
- 레벨업 사운드는 게임 느낌이지만 과하지 않게 — RPG 레벨업 팡파르 레퍼런스
- BGM은 공부에 방해되지 않는 수준 — lo-fi hip hop 또는 가벼운 chiptune

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 17-sound-system*
*Context gathered: 2026-02-23*
