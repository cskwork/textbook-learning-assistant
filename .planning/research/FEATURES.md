# Feature Research

**Domain:** 고등학교 수학 기출문제 학습 웹앱 (Korean HS Math Exam Practice)
**Researched:** 2026-02-23 (v3.0 게이미피케이션 업데이트)
**Confidence:** MEDIUM (WebSearch verified across multiple sources; specifics noted per feature)

---

## v3.0 게이미피케이션 "반전 모드" — 신규 Feature Landscape

> 이 섹션은 v3.0 "반전 모드" 마일스톤 전용. 기존 v1/v2 기능은 아래 원본 섹션 참조.
> 반전 모드 = 커스터마이즈 버튼으로 앱 전체를 게이미피케이션 학습 환경으로 변신.

---

### Table Stakes — 게이미피케이션 앱의 기본 기대값

사용자가 "게임 모드"라고 들었을 때 당연히 기대하는 기능들.
없으면 "이게 무슨 게임 모드야?" 반응이 나온다.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **반전 모드 토글 (전역 상태)** | 게이미피케이션 on/off의 진입점; 없으면 아무것도 작동 안 함 | LOW | 기존 다크모드 토글 패턴 재활용 | React Context + localStorage 저장. CSS 클래스 전환으로 전체 UI 변신. |
| **XP (경험치) 시스템** | Duolingo·Khan Academy 모두 XP가 진입 장벽 없는 보상 단위; 포인트 없으면 게임 아님 | LOW | 기존 풀이 이력 데이터 연동 | 문제 풀기: +10XP, 정답: +20XP, 콤보: 보너스. 클라이언트 localStorage 저장 (POC). |
| **레벨 시스템** | XP 축적의 가시적 목표; "레벨10 수학마스터" 타이틀이 동기 부여 | LOW | XP 시스템 | 레벨별 임계치: 1→500XP→2→1500XP→3... 총 30레벨 추천. 레벨업 시 애니메이션 필수. |
| **일일 스트릭 (Daily Streak)** | Duolingo 스트릭은 이탈률을 21% 감소시킴. 게이미피케이션 앱의 가장 검증된 리텐션 메커니즘 | LOW | 학습 이력 (날짜 기록) | 매일 1문제 이상 풀면 스트릭 연장. 화염 아이콘 + 일수 표시. Streak Freeze (냉동 부적) 아이템 도입 권장. |
| **기본 뱃지 / 업적** | 특정 마일스톤 달성 시각화; "칭찬 스티커" 심리 그대로 적용 | MEDIUM | XP·레벨 시스템, 풀이 이력 | 뱃지 30개 이상 설계 권장. 예: "첫 정답", "10연속 정답", "수학I 완전 정복" 등. |
| **정답/오답 시각 피드백 강화** | 기존 Framer Motion 채점 애니메이션 위에 게임 효과 추가; 없으면 일반 앱과 구분 불가 | LOW | 기존 퀴즈 채점 UI | 정답: 초록 폭발 + 파티클. 오답: 빨간 흔들림 + 화면 플래시. canvas-confetti 라이브러리 활용. |
| **콤보 카운터** | 연속 정답 시 승수 보상; 끊기지 않으려는 심리적 압박이 집중력 증가로 연결 | LOW | 퀴즈 풀이 엔진 | 3연속→콤보 시작, 5연속→×2XP, 10연속→×3XP. 오답 시 콤보 초기화. 화면 상단 카운터 표시. |
| **학습 완료 축하 화면** | 세션 종료 시 요약 + 축하; 없으면 빈 화면으로 끝나서 허무함 | LOW | 기존 결과 화면 | XP 획득량, 콤보 최대치, 레벨업 여부. 콘페티 + 사운드. |

---

### Differentiators — 차별화가 되는 게이미피케이션 기능

있으면 "이 앱 진짜다"라는 반응을 이끌어내는 기능들.
구현 난도가 높지만 v3.0의 핵심 정체성.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **타임어택 모드** | 시간 압박이 수능 실전 감각과 직결; 게임성 + 학습 효과 동시 달성 | MEDIUM | 기존 타이머 + 퀴즈 엔진 | 문제당 30초/60초 선택. 타이머 바 UI (빨간색으로 변함). 시간 내 정답 시 보너스XP. Phaser 없이 순수 React로 구현 가능. |
| **보스 배틀 모드** | 단원별 "보스" (최종 강적 문제 세트)를 상대하는 내러티브; 단순 문제 풀기를 서사로 전환 | HIGH | 문제 DB (단원별 최고난도 문제), 레벨 시스템 | 보스 HP바 UI: 정답 시 보스 HP 감소, 오답 시 내 HP 감소. Three.js 보스 캐릭터 3D 렌더링. 보스 처치 시 특별 뱃지 + 대량 XP. Phaser 없이 Canvas + Framer Motion으로 구현 가능. |
| **서바이벌 모드** | 목숨 3개로 틀리면 탈락; 끝까지 살아남으면 달성 뱃지 | MEDIUM | 퀴즈 엔진, 문제 DB (랜덤 셔플) | 하트 아이콘 3개. 오답 시 하트 감소 + 화면 진동. 하트 소진 = 게임오버 화면. 기록 저장 (최고 연속 정답). |
| **Three.js 3D 배경 효과** | 반전 모드 ON 시 화면 배경이 파티클 우주/미적분 그래프 공간으로 변신; 시각적 "반전"의 핵심 | HIGH | Three.js 라이브러리 | Three.js WebGL Canvas를 z-index 뒤에 배치. 파티클 수 200개 이하로 성능 제한. 60fps 목표. 모바일에서는 입자 수 50%로 자동 축소. three.quarks 파티클 엔진 활용 가능. |
| **레벨업 시네마틱** | 레벨업 순간의 화려한 전화면 연출; 게임의 "보상 순간"을 극대화 | MEDIUM | 레벨 시스템, Three.js (선택), Framer Motion | Framer Motion으로 전화면 오버레이. 빛 번짐 + 파티클 + 레벨 숫자 애니메이션. 2초 후 자동 닫힘. canvas-confetti로 구현 가능 (Three.js 불필요). |
| **사운드 시스템 (BGM + SFX)** | 청각적 피드백이 게임 몰입감을 결정적으로 높임; 무음 게임 모드는 형용 모순 | HIGH | Howler.js, 사운드 파일 에셋 | Howler.js: BGM (loop), SFX (sprite). 모드별 BGM: 기본(잔잔한 로파이), 타임어택(긴박한 전자음), 보스배틀(에픽 오케스트라). 정답 SFX, 오답 SFX, 레벨업 SFX, 콤보 SFX 각각 필요. 사운드 ON/OFF 토글 + 볼륨 조절 필수. |
| **주간 챌린지** | 매주 새로운 도전 과제; 재방문 이유 제공. Duolingo 위클리 챌린지와 동일 원리 | MEDIUM | XP 시스템, 뱃지, 풀이 이력 | 예: "이번 주 미적분 20문제 풀기", "서바이벌 5회 클리어". 클리어 시 특별 뱃지 + XP 보너스. 매주 월요일 갱신. |
| **리더보드 (반 내 랭킹)** | 친구/동급생과의 경쟁; Kahoot 실험에서 리더보드 도입 시 수업 완료율 25% 증가 | MEDIUM | 강사 그룹 기능, XP 시스템 | 강사가 만든 반(그룹) 내부 랭킹. 전교 랭킹은 v3.x 이후 (개인정보 고려). 주간 XP 기준. 본인 순위 강조 표시. |
| **홈 화면 게임 대시보드** | 반전 모드 홈이 완전히 다른 "게임 로비" UI로 변신; 단순 카드 그리드가 아닌 캐릭터 + 스탯 화면 | HIGH | 레벨·XP·스트릭·뱃지 시스템 | 캐릭터 아바타 (SVG, 레벨별 장비 변경). 오늘의 XP 진행 바. 스트릭 불꽃. 퀵 플레이 버튼 (모드 선택). |
| **오답노트 "재도전" 게이미피케이션** | 오답노트를 "쓰러진 보스 재매칭" 프레임으로 재해석; 지루한 오답 복습을 게임 컨텍스트로 전환 | MEDIUM | 기존 오답노트, 서바이벌/보스 모드 | 오답노트 문제를 모아 "복수전 모드"로 진입. 전에 틀린 문제를 다시 풀어 클리어 시 배지. |

---

### Anti-Features — 게이미피케이션 함정 목록

요청받거나 당연해 보이지만 실제로는 해가 되는 기능들.
특히 교육 앱에서 과잉 게이미피케이션은 학습 동기를 외재적 보상으로 대체하는 부작용이 연구로 검증됨.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| **전교 공개 리더보드** | 경쟁 심리 자극 → 동기 부여 | 하위권 학생 이탈 촉진; 개인정보(성적) 공개 문제; 경쟁 스트레스로 학습 회피 유발. 교육학 연구에서 공개 순위가 내재적 동기를 저해한다는 결과 다수. | 반 내 익명 랭킹 (본인 순위만 정확히, 타인은 "상위 N%" 표시) |
| **뽑기 / 가챠 시스템** | 수학대왕의 뽑기왕 기능이 인기; 희귀 아이템 심리 활용 | 도박 메커니즘; 확률 조작 논란 리스크; 미성년자 대상으로 법적·윤리적 문제. 보상이 학습이 아닌 뽑기 자체가 목표가 됨. | XP 기반 직접 구매 (뱃지 스킨, 아바타 아이템) — 확률 없이 명확한 가격 |
| **실시간 멀티플레이어 배틀** | Kahoot 스타일 동시 참여 경쟁; 흥미도 높음 | WebSocket 인프라 + 동기화 + 부정행위 방지 = 완전 별개 서비스 수준의 복잡도; POC 아키텍처와 완전히 맞지 않음 | 비동기 랭킹 (지난 주 XP 랭킹)으로 경쟁 심리 충족 |
| **광고 삽입으로 "계속하기" 토큰 충전** | 무료 앱 수익화 + 게임 에너지 시스템 | 게임 광고가 학습 집중을 끊음 (콴다 리뷰 1위 불만). 에너지 시스템은 학습을 제한하는 구조 = 교육 앱으로 치명적 신뢰도 손상 | 에너지/생명 시스템 없음; 무제한 플레이 유지 |
| **강제 BGM (끄기 불가)** | 몰입감 강화 의도 | 학교·도서관·대중교통 등 소리 끄기 필수 환경이 학생의 주 사용 환경임. 강제 사운드는 즉시 이탈 유발. | 사운드 ON/OFF + 볼륨 별도 제어 + 최초 실행 시 기본값 OFF |
| **반전 모드 강제 활성화 (기본값 ON)** | 화려한 게임 모드를 더 많이 노출 | 반전 모드는 3D·파티클·사운드로 배터리·성능 소모 큼. 저사양 기기에서 프레임 드랍 발생. 집중 학습 원하는 사용자에게 거슬림. 35% 이상의 사용자는 과잉 게이미피케이션 앱을 포기한다는 연구. | 기본값 OFF; 홈 화면 또는 설정에서 반전 모드 토글 명확히 노출 |
| **Phaser 게임 엔진 풀 도입** | Phaser로 완전한 게임 씬 구현 가능 | Phaser는 React DOM과 렌더링 철학이 충돌함; 두 가지 렌더 루프 병행은 성능·상태관리 복잡도 폭증. 기존 코드베이스(React 19 + Framer Motion)와 통합이 매우 어려움. | Phaser 대신 Canvas API + Three.js + Framer Motion 조합으로 동일 효과 달성 |
| **오프라인에서 게임 기능 완전 지원** | PWA 오프라인 정책 일관성 유지 원함 | Three.js 에셋·사운드 파일 캐시로 Service Worker 캐시 용량 폭증. 리더보드·XP 서버 동기화 불가. | 오프라인에서는 반전 모드 자동 비활성화 (또는 로컬 기능만 부분 지원) |

---

## Feature Dependencies — v3.0 게이미피케이션

```
[반전 모드 토글 (전역 Context)]
    └──enables──> [게이미피케이션 UI 전체]
                       ├──requires──> [XP 시스템]
                       │                  └──requires──> [풀이 이력 (기존 v1)]
                       │                  └──feeds──> [레벨 시스템]
                       │                                  └──triggers──> [레벨업 시네마틱]
                       ├──requires──> [스트릭 시스템]
                       │                  └──requires──> [날짜별 풀이 이력 (기존)]
                       ├──enables──> [콤보 카운터]
                       │                  └──requires──> [퀴즈 풀이 엔진 (기존 v1)]
                       ├──enables──> [뱃지/업적 시스템]
                       │                  └──requires──> [XP, 스트릭, 풀이 이력]
                       ├──enables──> [게임 모드들]
                       │                  ├──[타임어택] ──requires──> [퀴즈 엔진 + 타이머]
                       │                  ├──[보스 배틀] ──requires──> [문제 DB 최고난도 + Three.js]
                       │                  └──[서바이벌] ──requires──> [퀴즈 엔진 + 랜덤 셔플]
                       ├──enables──> [사운드 시스템 (Howler.js)]
                       │                  └──requires──> [사운드 에셋 파일]
                       ├──enables──> [Three.js 3D 배경]
                       │                  └──requires──> [Three.js 번들]
                       └──enables──> [리더보드]
                                          └──requires──> [XP 시스템 + 강사 그룹 (기존 v2)]

[오답노트 "복수전 모드"]
    └──requires──> [기존 오답노트 (v1)]
    └──requires──> [게임 모드들]

[주간 챌린지]
    └──requires──> [XP 시스템]
    └──requires──> [뱃지 시스템]
    └──enhances──> [리더보드]
```

### Dependency Notes

- **반전 모드 토글이 모든 것의 게이트다:** Context에서 `isGamificationMode` 플래그 하나로 전체 UI 분기. 이 구조가 없으면 기존 앱과 반전 모드 코드가 뒤섞임.
- **XP 시스템이 가장 먼저 필요하다:** 레벨, 뱃지, 리더보드, 챌린지 모두 XP에 의존. XP 없이 다른 게임 기능 구현하면 나중에 전면 리팩토링.
- **Three.js는 사운드 시스템과 독립적이다:** 둘 다 선택적으로 활성화 가능. Three.js 없이 사운드만 켜도 게임 느낌 상당히 향상됨. 성능 문제 시 Three.js 먼저 제거.
- **Phaser는 의존성 체인에 없다:** React + Canvas + Three.js + Framer Motion으로 동일 효과 달성. Phaser 도입은 코드베이스 충돌 리스크만 높임.
- **리더보드는 강사 그룹 기능에 의존한다:** 개인 랭킹보다 반 내 랭킹이 교육적으로 적절. 강사 그룹이 없으면 글로벌 랭킹만 가능한데 이는 Anti-Feature.

---

## MVP Definition — v3.0 반전 모드

### Phase 1: 반전 모드 핵심 인프라 (런치 필수)

- [ ] **반전 모드 토글 + 전역 Context** — 모든 게임 기능의 진입점
- [ ] **XP + 레벨 시스템** — 모든 보상 기능의 기반. 없으면 아무것도 동작 안 함
- [ ] **일일 스트릭** — 가장 검증된 리텐션 메커니즘 (Duolingo 데이터 기반)
- [ ] **콤보 카운터** — 퀴즈 풀이와 직접 연결, 구현 복잡도 낮음
- [ ] **정답/오답 파티클 피드백** — canvas-confetti로 빠른 구현 가능
- [ ] **반전 모드 홈 UI 변신** — 토글의 즉각적 시각 효과

### Phase 2: 게임 모드 + 시각 효과 (핵심 차별화)

- [ ] **타임어택 모드** — 가장 단순한 게임 모드, 빠른 구현
- [ ] **서바이벌 모드** — 하트 시스템, 적당한 복잡도
- [ ] **Three.js 3D 배경 파티클** — 반전 모드의 시각적 WOW 포인트
- [ ] **레벨업 시네마틱** — Framer Motion으로 충분, Three.js 불필요
- [ ] **사운드 시스템 (Howler.js)** — BGM + 핵심 SFX

### Phase 3: 고급 기능 (검증 후 추가)

- [ ] **보스 배틀 모드** — 높은 복잡도, Phase 2 완료 후
- [ ] **뱃지/업적 시스템 (30개)** — 콘텐츠 작업량 큼
- [ ] **반 내 리더보드** — 강사 그룹 연동 필요
- [ ] **주간 챌린지** — 콘텐츠 설계 + 주기 관리 로직
- [ ] **오답노트 복수전 모드** — 기존 오답노트 재해석

### Future Consideration (v3.x)

- [ ] **전교 익명 랭킹** — 개인정보·규모 이슈 해결 후
- [ ] **캐릭터 아바타 커스터마이징** — 아트 작업량이 매우 큼
- [ ] **시즌제 이벤트** — 운영 역량 확보 후
- [ ] **오프라인 게임 기능** — PWA 캐시 전략 정교화 후

---

## Feature Prioritization Matrix — v3.0

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| 반전 모드 토글 + Context | HIGH | LOW | P1 |
| XP + 레벨 시스템 | HIGH | LOW | P1 |
| 일일 스트릭 | HIGH | LOW | P1 |
| 콤보 카운터 | HIGH | LOW | P1 |
| 정답/오답 파티클 | HIGH | LOW | P1 |
| 반전 모드 홈 UI | HIGH | MEDIUM | P1 |
| 타임어택 모드 | HIGH | MEDIUM | P1 |
| 서바이벌 모드 | HIGH | MEDIUM | P1 |
| Three.js 3D 배경 | HIGH | HIGH | P1 |
| 레벨업 시네마틱 | MEDIUM | MEDIUM | P1 |
| 사운드 시스템 (BGM+SFX) | HIGH | MEDIUM | P1 |
| 보스 배틀 모드 | HIGH | HIGH | P2 |
| 뱃지/업적 시스템 | MEDIUM | MEDIUM | P2 |
| 반 내 리더보드 | MEDIUM | MEDIUM | P2 |
| 주간 챌린지 | MEDIUM | MEDIUM | P2 |
| 오답노트 복수전 | MEDIUM | MEDIUM | P2 |
| 캐릭터 아바타 | LOW | HIGH | P3 |
| 시즌제 이벤트 | LOW | HIGH | P3 |

**Priority key:**
- P1: v3.0 출시 필수 (2개 Phase에 분배)
- P2: v3.0 검증 후 추가 (Phase 3)
- P3: v3.x 이후 고려

---

## Competitor Feature Analysis — 게이미피케이션 특화

| Feature | Duolingo | Kahoot | 수학대왕 | Khan Academy | v3.0 반전 모드 |
|---------|---------|--------|---------|-------------|----------------|
| XP 시스템 | O (핵심) | O (점수) | O | O (에너지 포인트) | O |
| 레벨 시스템 | O (리그) | X | O | O (신규 도입) | O (30레벨) |
| 일일 스트릭 | O (핵심, 불꽃) | X | 부분적 | O (신규 도입) | O |
| 리더보드 | O (리그 기반) | O (실시간) | O (매쓰킹 리그) | X | O (반 내 주간) |
| 뱃지/업적 | O | X | O | O | O |
| 타임어택 | X | O (핵심) | 부분 | X | O |
| 보스 배틀 | X | X | X | X | O (차별화) |
| 서바이벌 모드 | X | X | X | X | O (차별화) |
| 3D 시각 효과 | X | X | X | X | O (차별화) |
| BGM + SFX | 부분 | O | X | X | O |
| 뽑기/가챠 | X | X | O (뽑기왕) | X | X (의도적 제외) |
| 실시간 멀티플레이 | X | O (핵심) | X | X | X (의도적 제외) |
| 반전 모드 개념 | X | X | X | X | O (유일한 차별점) |

---

## Education Gamification — 연구 기반 원칙

> 리서치 과정에서 발견한 게이미피케이션 교육 효과 데이터. 기능 설계 결정의 근거.

| 메커니즘 | 효과 | 출처 신뢰도 |
|--------|------|-----------|
| 일일 스트릭 | 이탈률 21% 감소 (Duolingo 스트릭 프리즈 도입 결과) | MEDIUM (WebSearch, Duolingo 공개 데이터) |
| 리그형 리더보드 | 주간 수업 완료율 40% 향상 (XP 리더보드 참여자) | MEDIUM (WebSearch, Duolingo 사례) |
| 리그 도입 | 수업 완료율 25% 증가 | MEDIUM (WebSearch, Kahoot 사례) |
| 외재적 보상 과다 | 내재적 학습 동기 저해 | HIGH (학술 연구 다수 일치) |
| 공개 경쟁 순위 | 하위권 학생 이탈 촉진 | HIGH (교육심리학 연구) |
| 과잉 게이미피케이션 | 사용자의 35%가 앱 이탈 | MEDIUM (WebSearch, 단일 소스) |

**핵심 설계 원칙:** 반전 모드는 선택적으로 활성화하고, 보상은 명확하게, 경쟁은 그룹 내부로 제한, 사운드는 기본값 OFF.

---

## 기존 v1/v2 Feature Landscape (원본 유지)

### Table Stakes (사용자가 당연히 기대하는 기능)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **단원/유형/난이도 필터 문제 풀기** | 모든 경쟁사 기본 제공; 없으면 교과서만 못함 | MEDIUM | 단원·유형·난이도 태깅 DB가 선행되어야 함 |
| **자동 채점 (객관식/단답형)** | 종이 문제집 대비 앱의 가장 기본 가치 | LOW | 정규식 + 숫자 비교로 충분; 서술형 제외 |
| **수식 정확 렌더링 (KaTeX)** | 수학 문제는 수식 없으면 읽히지 않음 | MEDIUM | LaTeX 저장 + KaTeX 렌더링; 그래프는 이미지 |
| **오답노트 / 틀린 문제 수집** | 기출탭탭·오르조 모두 핵심 기능으로 강조 | LOW | 자동 수집 + 수동 스크랩 두 방식 |
| **문제별 해설 제공** | 채점 후 해설 없으면 학습 가치 없음 | MEDIUM | 텍스트 + 이미지 혼합; 단계별 풀이가 이상적 |
| **학습 이력 / 풀이 기록 저장** | 재방문 이유 + 취약 분석의 데이터 소스 | LOW | 회원제 로그인과 세트 |
| **회원 가입 / 로그인** | 기록 동기화, 개인화의 전제 조건 | LOW | 이메일 인증으로 충분 |
| **반응형 디자인 (태블릿/모바일/PC)** | 학생은 태블릿과 폰 번갈아 사용 | MEDIUM | 태블릿 최적화 강조 |
| **문제 타이머** | 수능/모의고사 실전 감각 훈련 필수 | LOW | 문제별 소요 시간 기록 겸용 |
| **문제 북마크 / 스크랩** | 반복 풀기, 나중에 다시 보기 기본 UX | LOW | 오답노트와 연계 |

*(이하 v1/v2 Differentiators, Anti-Features, Dependencies는 위 원본 섹션 참조 — 생략)*

---

## Sources

- Duolingo 게이미피케이션 전략: https://www.orizon.co/blog/duolingos-gamification-secrets
- Duolingo 케이스 스터디 (Trophy): https://trophy.so/blog/duolingo-gamification-case-study
- EdTech 게이미피케이션 비교 (Prodwrks): https://prodwrks.com/gamification-in-edtech-lessons-from-duolingo-khan-academy-ixl-and-kahoot/
- 게이미피케이션 실패 이유 2026: https://medium.com/design-bootcamp/why-gamification-fails-new-findings-for-2026-fff0d186722f
- 게이미피케이션 "유령 효과" (학습 저해): https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2024.1474733/full
- Howler.js 공식: https://howlerjs.com/
- three.quarks 파티클 엔진: https://github.com/Alchemist0823/three.quarks
- canvas-confetti: https://github.com/catdad/canvas-confetti
- react-canvas-confetti: https://ulitcos.github.io/react-canvas-confetti/
- Phaser + React 메모리 게임 (2025): https://phaser.io/news/2025/02/memory-game-with-phaser-and-react
- 보스 배틀 디자인 원칙: https://www.gamedeveloper.com/design/boss-battle-design-and-structure
- 모바일 리더보드 게이미피케이션: https://www.plotline.so/blog/leaderboard-for-gamification-in-mobile-apps
- Three.js 파티클 GPGPU (Codrops 2024): https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/
- 게이미피케이션 UX 2025: https://www.designstudiouiux.com/blog/gamification-ux-design/

---
*Feature research for: 고등학교 수학 기출문제 학습 웹앱 (PWA) — v3.0 게이미피케이션 "반전 모드"*
*Researched: 2026-02-23*
