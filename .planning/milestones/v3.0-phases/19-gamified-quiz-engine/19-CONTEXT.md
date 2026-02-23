# Phase 19: 게임화 퀴즈 엔진 - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

4가지 게임 모드(타임어택, 서바이벌, 보스배틀, 미니게임) 구현 + 게임 모드 선택 UI + 각 모드별 결과 화면. Phase 15의 PhaserBridge POC 패턴 활용하여 Canvas 기반 미니게임 구현. 기존 QuizPlayer 확장이 아닌 별도 게임 퀴즈 컴포넌트로 구현.

</domain>

<decisions>
## Implementation Decisions

### 게임 모드 진입 경로
- 홈 화면 또는 퀴즈 시작 시 "모드 선택" 카드 UI 표시 (FunMode 활성 시에만)
- 모드 선택: 일반(기존), 타임어택, 서바이벌, 보스배틀, 미니게임
- FunMode OFF 시 기존 QuizPlayer만 사용 (모드 선택 UI 미노출)

### 타임어택 모드 (GAME-01)
- 제한 시간: 난이도별 차등 (쉬움 30초, 보통 20초, 어려움 15초/문제)
- 타이머 UI: 원형 프로그레스 + 숫자 카운트다운, 상단 고정
- 시간 소진 시 해당 문제 오답 처리 → 다음 문제로 자동 진행
- 보너스: 남은 시간에 비례한 추가 XP (빠를수록 보너스 증가)
- 연속 10문제 세트, 총 점수 = 정답수 x 기본XP + 시간보너스

### 서바이벌 모드 (GAME-02)
- 하트 3개 (빨간 하트 SVG 아이콘)
- 오답 시 하트 -1 + 하트 깨지는 애니메이션 + shake 효과
- 정답 시 XP 획득 + 스트릭 보너스 누적
- 하트 0개 → 게임오버 화면 (총 정답 수 + 획득 XP + 최고기록 비교)
- 문제 수 제한 없음 (끝까지 살아남기)
- 10문제마다 하트 1개 회복 (최대 3개)

### 보스배틀 모드 (GAME-03)
- 보스 캐릭터: 단원/챕터별 테마 보스 (SVG 일러스트 — 이모지 금지)
- 보스 HP: 문제 수 x 정답 데미지 (보스 HP 100, 정답 1개당 10 데미지)
- 정답 → 플레이어 공격 애니메이션 + 보스 HP 감소 + 대미지 텍스트
- 오답 → 보스 반격 애니메이션 + 플레이어 HP 감소 (하트 3개 서바이벌과 유사)
- 보스 처치 시 특별 보상 (보스 뱃지 + 보너스 XP)
- 보스 일러스트: 간단한 SVG 실루엣/기하학적 디자인 (수학 관련 모티프)

### 미니게임 (GAME-04)
- Phaser 기반 Canvas 미니게임 (Phase 15 PhaserBridge POC 활용)
- 첫 번째 미니게임: "수식 조합" — 떨어지는 숫자/연산자를 조합하여 목표 값 만들기
- Phaser 씬에서 입력 처리, 결과를 React로 EventBus 전달
- 미니게임 완료 시 점수 기반 XP 지급
- 추가 미니게임은 향후 확장 가능한 구조 (MiniGameRegistry 패턴)

### 결과 화면 (GAME-05)
- 모든 게임 모드 공통 결과 화면 컴포넌트
- 표시 내용: 모드명, 정답/전체 비율, 획득 점수, 획득 XP, 소요 시간
- 개인 최고기록(Personal Best) 달성 시 "NEW RECORD!" 배너 + 특별 효과
- 기록은 Dexie gameRecords 테이블에 저장
- "다시 하기" / "모드 선택으로" / "홈으로" 버튼

### Claude's Discretion
- 각 모드의 정확한 XP 보상 공식
- 보스 SVG 디자인 디테일
- 미니게임 물리/게임플레이 세부 밸런스
- 결과 화면 애니메이션 디테일
- 타이머 UI 정확한 색상/크기

</decisions>

<specifics>
## Specific Ideas

- 보스배틀은 RPG 턴제 전투 느낌 — 플레이어 좌측, 보스 우측 배치
- 타임어택은 긴장감 있는 UI — 남은 시간 5초 이하 시 빨간색 + 깜빡임
- 서바이벌 하트는 게임답게 — 잃을 때 깨지는 파편 효과
- SVG 보스 캐릭터: 기하학적/수학적 모티프 (삼각형, 원, 다각형 조합)
- Phase 20 디자인 피드백 사전 반영: 어두운 배경 + 밝은 글자, 화려한 레이저 효과, SVG 아이콘

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 19-gamified-quiz-engine*
*Context gathered: 2026-02-23*
