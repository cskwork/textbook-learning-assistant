# Pitfalls Research

**Domain:** 수학 기출문제 학습 웹앱 (Math Exam Learning PWA for Korean High School Students)
**Researched:** 2026-02-19
**Confidence:** MEDIUM (WebSearch + official docs 교차 검증. 일부 항목은 학술 논문 기반)

---

## Critical Pitfalls

### Pitfall 1: KaTeX/MathJax SSR 하이드레이션 불일치

**What goes wrong:**
서버에서 렌더링된 수식 HTML과 클라이언트에서 KaTeX가 다시 렌더링한 HTML이 불일치하여 React hydration 에러가 발생한다. KaTeX는 SSR 시 MathML 지원 여부를 서버와 클라이언트에서 다르게 판단하기 때문에, Next.js/SSR 환경에서 수식이 깜빡이거나 레이아웃이 무너진다.

**Why it happens:**
KaTeX의 `renderToString`은 환경 감지 로직이 브라우저 환경에서만 동작하는 API(`navigator`, `document`)에 의존한다. Next.js에서 서버 렌더링 후 클라이언트 하이드레이션 시 두 번째 패스에서 다른 결과를 생성한다.

**How to avoid:**
- KaTeX는 클라이언트 전용(`'use client'`)으로만 렌더링하거나, `suppressHydrationWarning`을 수식 컨테이너에 명시적으로 적용한다.
- 수식이 많은 페이지는 `dynamic(() => import('...'), { ssr: false })`로 lazy load한다.
- `react-katex`보다 직접 `useEffect` 내에서 `renderToString` 호출을 권장한다.
- CLS(Cumulative Layout Shift) 방지를 위해 수식 컨테이너에 최소 높이를 CSS로 미리 지정한다.

**Warning signs:**
- 개발 환경에서 "Prop `dangerouslySetInnerHTML` did not match" 콘솔 경고
- 수식 영역만 레이아웃이 점프하는 현상
- Lighthouse CLS 점수 0.1 초과

**Phase to address:** Phase 1 (기술 스택 선정 및 초기 설정) - 수식 렌더링 파이프라인 POC 필수

---

### Pitfall 2: BKT/DKT Cold Start — 신규 사용자에게 잘못된 추천

**What goes wrong:**
신규 학생의 상호작용 데이터가 없는 상태에서 BKT/DKT 모델이 극단적으로 낮거나 높은 숙련도를 추정하여, 너무 쉽거나 너무 어려운 문제만 추천한다. 초기 사용 경험이 나빠져 이탈율이 높아진다.

**Why it happens:**
BKT는 사전 확률(`P(L0)`)을 전체 모집단 평균으로 초기화하는데, 이는 개별 학생 수준을 전혀 반영하지 못한다. DKT/SAKT 등 딥러닝 계열은 짧은 시퀀스(<5개 응답)에서 attention weight가 편향되어 예측이 불안정하다.

**How to avoid:**
- 온보딩 진단 퀴즈(5~10문제)로 초기 숙련도를 추정하는 cold start 전략을 설계한다.
- 초기에는 BKT보다 item difficulty + 정답률 기반의 단순 규칙 기반 추천을 사용하고, 충분한 데이터(학생당 30+ 응답)가 쌓이면 BKT/DKT로 전환한다.
- BKT `P(Slip)`, `P(Guess)` 파라미터를 0.3 이하로 바운딩하지 않으면 EM이 비현실적인 값으로 수렴한다 — 반드시 제약 설정.
- 진단 결과를 학년/과목 수준으로만 세분화하고, 단원별 세분화는 데이터 축적 후 도입한다.

**Warning signs:**
- 신규 사용자가 첫 세션에서 연속 5회 이상 오답 또는 정답
- 학생별 `P(L0)` 추정치가 0 또는 1에 수렴
- 초기 이탈률(Day 1 → Day 3 retention)이 기준 대비 30% 이상 낮음

**Phase to address:** Phase 2 (적응형 학습 엔진) - 온보딩 진단 플로우를 MVP에서 함께 구현

---

### Pitfall 3: 문제 태깅 스키마 설계 실패 — 나중에 전체 재태깅 필요

**What goes wrong:**
초기에 단원/난이도 2계층 태그만 정의한 뒤 문제 수천 개를 입력했는데, 이후 "개념별 태그", "풀이 유형", "예상 소요 시간" 등을 추가하려면 기존 전체 문제를 재검토해야 한다. 이 시점에서는 이미 사용자 학습 기록과 태그가 연결되어 있어 마이그레이션 비용이 매우 크다.

**Why it happens:**
MVP 압박으로 최소 태깅 구조부터 시작하지만, 적응형 추천은 세밀한 개념 태그에 의존한다. 태그 스키마는 데이터가 쌓일수록 변경 비용이 기하급수적으로 증가한다.

**How to avoid:**
- 1단계부터 확장 가능한 태그 스키마 설계: `{subject, grade, unit, topic, concept[], difficulty, question_type, estimated_time, solution_method[], source_exam, year}`
- 수능/모의고사 기준 공식 교육과정 분류 체계(교육부 성취기준)를 태그 계층의 기준으로 사용한다.
- 태그는 JSON 배열로 저장하되, 핵심 태그(unit, difficulty)는 별도 컬럼으로 인덱싱한다.
- 첫 100문제를 입력하기 전에 태그 스키마를 검토하고 팀 내 합의 문서를 작성한다.

**Warning signs:**
- 태그 선택 시 "기타" 카테고리 사용 빈도 증가
- "이 문제는 어디에 분류해야 하지?"라는 질문이 반복됨
- 같은 개념 문제가 서로 다른 단원으로 분류됨

**Phase to address:** Phase 1 (데이터 모델링) - 첫 번째 문제 입력 전에 스키마 확정

---

### Pitfall 4: 수능/모의고사 기출문제 저작권 미처리

**What goes wrong:**
수능 기출문제를 그대로 텍스트/이미지로 서비스에 올렸다가 저작권 침해 이슈에 휘말린다. 평가원(KICE)이 수능 문제를 CC BY-NC-ND 4.0으로 공개하지만, 문제에 포함된 문학 작품·예술 작품은 별도 저작권이 있다. 법원 판례(2024)에서도 평가원 자신이 저작권 침해로 판결받은 사례가 있다.

**Why it happens:**
수능 문제 자체는 공공재로 인식하지만, 문제에 삽입된 지문(소설 발췌, 시, 그림 등)은 원저작자 권리가 살아있다. 수학 문제의 경우 지문 삽입은 드물지만, 문제 이미지(스캔본) 그대로 사용하면 KICE 저작권 귀속 문제가 생긴다.

**How to avoid:**
- 수학 기출문제는 텍스트+LaTeX로 재입력(직접 타이핑)하여 표현 형식을 새로 생성한다.
- 법률 검토: CC BY-NC-ND 4.0 조건 하에 비상업적/수정 없음 조건 준수 여부 확인.
- 서비스가 유료(상업적)가 될 경우 KICE에 사전 허가 문의를 진행한다.
- 이미지 스캔본은 사용하지 않고, 도형/그래프는 직접 SVG로 재제작한다.

**Warning signs:**
- 문제 데이터를 PDF 스캔에서 직접 추출하는 파이프라인 존재
- "어차피 공개된 거잖아요"라는 팀 내 인식
- 유료 서비스 전환 계획이 있으나 저작권 검토가 없음

**Phase to address:** Phase 0 (사전 기획) - 법적 검토를 개발 시작 전에 완료

---

### Pitfall 5: PWA 오프라인 동기화 충돌 처리 미설계

**What goes wrong:**
오프라인에서 문제를 풀고 나중에 네트워크가 연결되면 학습 기록을 서버에 올리는데, 같은 학생이 다른 기기에서도 문제를 풀었을 경우 어느 기록이 정답인지 알 수 없는 상태가 된다. BKT 모델에 순서가 다른 응답 시퀀스가 입력되면 숙련도 추정이 오염된다.

**Why it happens:**
Background Sync API가 모든 브라우저에서 지원되지 않으며, 충돌 해결 전략을 처음부터 설계하지 않으면 나중에 data integrity 문제가 발생한다. 교육 앱의 특성상 응답 순서가 모델 입력에 직접 영향을 준다.

**How to avoid:**
- 각 학습 응답 이벤트에 `device_id` + `timestamp` + `sequence_number`를 기록한다.
- 충돌 해결 전략: 타임스탬프 기준 병합(LWW - Last Write Wins)보다 이벤트 소싱 방식으로 모든 응답 이벤트를 누적 저장하고 서버에서 재계산한다.
- IndexedDB 저장 시 트랜잭션 단위를 "응답 하나"로 원자적으로 관리한다.
- 오프라인 가능 범위를 명확히 제한: 문제 풀기는 오프라인 가능, 성적 분석/추천은 온라인 필요.
- iOS Safari의 IndexedDB 할당량(50MB)을 고려하여 캐싱 전략을 수립한다.

**Warning signs:**
- 동기화 로직이 "나중에 추가"로 미뤄지고 있음
- 서버 학습 기록과 로컬 기록의 비교 로직이 없음
- 테스트에서 오프라인 → 온라인 전환 시나리오가 없음

**Phase to address:** Phase 3 (PWA 오프라인 지원) - 동기화 프로토콜 설계를 구현 전에 문서화

---

## Moderate Pitfalls

### Pitfall 6: 모바일에서 수식 가로 스크롤 깨짐

**What goes wrong:**
`\frac{\partial^2 f}{\partial x^2}` 같은 긴 수식이 모바일 뷰포트(360px)에서 부모 컨테이너를 벗어나 레이아웃이 깨진다. MathJax는 긴 수식을 단일 비분리 블록으로 렌더링하기 때문이다.

**Prevention:**
- 수식 래퍼에 `overflow-x: auto; max-width: 100%` 적용.
- 블록 수식(`$$...$$`)은 전용 스크롤 컨테이너 안에 배치한다.
- 기기 폭이 400px 이하인 경우 display math 폰트 사이즈를 자동으로 축소(`font-size: clamp(0.8em, 2vw, 1em)`).
- 실제 안드로이드 기기(Chrome) + iOS Safari에서 수식 렌더링 테스트를 별도로 수행한다.

---

### Pitfall 7: 강사/학생 권한 설계 부실 — 데이터 노출 사고

**What goes wrong:**
강사가 모든 학생 데이터를 볼 수 있도록 단순히 `role === 'teacher'` 체크만 구현했는데, 강사가 자기 수업 외 다른 반 학생 데이터까지 접근하거나, 학생이 URL 조작으로 다른 학생 답안을 볼 수 있는 취약점이 생긴다.

**Prevention:**
- 행 수준 보안(Row Level Security, RLS)을 DB 레이어(Supabase/PostgreSQL)에서 강제한다.
- API 레이어에서 "강사는 자신이 관리하는 클래스 학생만 조회 가능" 조건을 모든 쿼리에 적용한다.
- 미들웨어 레벨 role 체크 외에 DB 레이어에서도 중복 검증(Defense in Depth).
- 학생 ID가 URL 파라미터로 노출되지 않도록 내부 UUID를 사용한다.

---

### Pitfall 8: 문제 이미지/수식 로딩으로 인한 LCP 저하

**What goes wrong:**
문제 목록 페이지에서 수십 개의 문제를 한 번에 렌더링하면서 KaTeX 렌더링 + 이미지 로딩이 동시에 일어나 Largest Contentful Paint(LCP)가 5초를 초과한다. 모바일 3G 환경에서는 더 심각하다.

**Prevention:**
- 문제 목록은 가상화(react-window, TanStack Virtual)로 화면에 보이는 문제만 렌더링한다.
- KaTeX는 Intersection Observer로 뷰포트 진입 시에만 렌더링(lazy math rendering).
- 그래프/도형 이미지는 WebP + `loading="lazy"` 적용.
- 첫 로드에는 문제 10개 이하만 표시하고 무한 스크롤 또는 페이지네이션 사용.

---

### Pitfall 9: BKT 파라미터 자유 추정으로 인한 비현실적 숙련도

**What goes wrong:**
BKT EM 알고리즘이 `P(Slip) = 0.8` 같은 비현실적인 파라미터로 수렴하면, "항상 틀리는 학생도 숙련됨"이라는 역설적 추정이 나온다. 이 상태에서 쉬운 문제만 계속 추천된다.

**Prevention:**
- `P(Slip) < 0.3`, `P(Guess) < 0.3` 제약 조건을 EM 루프에 명시적으로 적용(pyBKT의 `coef_` 바운딩 활용).
- 단원별로 파라미터를 독립적으로 추정(multigs)하되, 데이터가 50개 미만인 단원은 전역 파라미터를 사용한다.
- 파라미터 추정 결과를 모니터링 대시보드에 표시하고 이상 감지 알림을 설정한다.

---

### Pitfall 10: 스페이스드 리피티션 없이 단순 "못 푼 문제 반복" 구현

**What goes wrong:**
틀린 문제를 단순히 다시 보여주는 방식은 간격 효과(Spacing Effect)를 활용하지 못한다. 학생이 방금 틀린 문제를 바로 다시 풀면 단기 기억으로 정답을 맞추지만 장기 기억으로 이어지지 않는다. 앱이 학습 효과가 없는 것처럼 느껴진다.

**Prevention:**
- SM-2 또는 FSRS 알고리즘 기반 복습 스케줄링을 Day 1부터 도입한다.
- BKT 숙련도와 스페이스드 리피티션 간격을 연동한다: 숙련도가 낮을수록 복습 간격을 짧게.
- "오늘의 복습 문제" 섹션을 학습 대시보드의 핵심 기능으로 배치한다.

---

## Technical Debt Patterns

| 단축키 | 즉각적 이점 | 장기 비용 | 수용 가능 여부 |
|--------|-------------|-----------|----------------|
| 문제 입력을 Markdown 텍스트만 지원 (LaTeX 미지원) | 개발 빠름 | 수식 문제 입력 불가, 전체 리빌드 필요 | Never — 수학 앱의 핵심 |
| BKT 없이 정답률 기반 난이도 추천만 구현 | 구현 단순 | 개인화 불가, 나중에 BKT 도입 시 스키마 변경 | MVP에서 한시적 허용, Phase 2에서 전환 |
| 단일 `role` 컬럼으로 권한 관리 | 개발 빠름 | 클래스별 권한 분리 불가, RLS 재설계 필요 | Phase 1에서 클래스 연결 구조와 함께 설계해야 함 |
| 이미지 스캔으로 문제 저장 | 입력 빠름 | 검색/태깅 불가, 저작권 위험, OCR 오류 | Never — 텍스트+LaTeX 재입력 필수 |
| 오프라인 미지원으로 시작 | 개발 단순 | PWA 핵심 가치 훼손 | MVP에서 허용, Phase 3에서 반드시 구현 |

---

## Integration Gotchas

| 통합 대상 | 흔한 실수 | 올바른 접근 |
|-----------|-----------|------------|
| KaTeX + React | `dangerouslySetInnerHTML` 직접 사용으로 XSS 위험 | `katex.renderToString()`에 `throwOnError: false` + DOMPurify 적용 |
| KaTeX + SSR (Next.js) | SSR에서 렌더링 후 클라이언트 하이드레이션 불일치 | `dynamic({ ssr: false })` 또는 클라이언트 전용 래퍼 |
| Supabase RLS | 개발 중 RLS 비활성화 후 배포 전 활성화 잊음 | CI에서 RLS 활성화 여부 자동 검증 스크립트 추가 |
| IndexedDB (Dexie.js) | 스키마 버전 관리 없이 필드 추가 → 기존 사용자 DB 오류 | Dexie migration 버전 관리를 처음부터 적용 |
| pyBKT / 커스텀 BKT | Python 모델을 Node.js API와 연동할 때 `float32` 정밀도 차이 | 파라미터를 DB에 저장할 때 `DOUBLE PRECISION` 사용 |
| Desmos/GeoGebra iframe | iframe이 PWA 오프라인 캐시에서 제외됨 | 그래프 도구 URL을 서비스워커 캐시 목록에 명시적으로 포함 |

---

## Performance Traps

| 트랩 | 증상 | 예방 | 임계점 |
|------|------|------|--------|
| 문제 목록 전체 KaTeX 렌더링 | 페이지 로드 시 5초 이상 멈춤 | Intersection Observer + 가상 스크롤 | 문제 20개 이상 |
| BKT 매 응답마다 전체 히스토리 재계산 | 응답 저장 API가 2초 이상 걸림 | 증분 업데이트(이전 상태 + 새 응답만 계산) | 응답 100개 이상 |
| 문제 이미지 비최적화 (PNG/JPEG 원본) | 모바일 3G에서 첫 화면 10초 이상 | WebP 변환 + CDN + `loading="lazy"` | 이미지 10개 이상 |
| IndexedDB 전체 응답 이력 매번 읽기 | 오프라인 모드에서 앱이 느려짐 | 최근 100개 응답만 로컬 캐시, 나머지는 서버 | 응답 500개 이상 |
| N+1: 학생별 최신 숙련도 조회 | 대시보드 쿼리 10초 이상 | 숙련도를 별도 테이블에 캐싱하고 응답 시 갱신 | 학생 50명 이상 |

---

## Security Mistakes

| 실수 | 위험 | 예방 |
|------|------|------|
| 학생 응답 데이터를 클라이언트에서 직접 집계 후 서버에 POST | 클라이언트가 점수를 조작할 수 있음 | 원시 응답(정답/오답)만 서버에 전송, 집계는 서버에서만 |
| 강사가 모든 학생 데이터 조회 API에 클래스 필터 없음 | 다른 반 학생 데이터 노출 | RLS: `class_id` 기반 row-level 접근 제한 |
| 기출문제 이미지를 퍼블릭 URL로 서빙 | 저작권 문제 + 무단 크롤링 | 서명된 URL(signed URL) 또는 인증 후 다운로드 |
| 미성년자 학습 데이터 장기 보관 | COPPA/개인정보보호법 위반 (만 14세 미만) | 데이터 보존 정책 명문화, 일정 기간 후 자동 삭제 |
| API에서 학생 UUID 대신 순차 ID 노출 | IDOR 취약점 (다른 학생 데이터 열거 가능) | 모든 공개 ID에 UUID v4 사용 |

---

## UX Pitfalls

| 함정 | 사용자 영향 | 개선 방향 |
|------|------------|-----------|
| 수식이 렌더링되기 전에 raw LaTeX 코드 노출 | 학생 혼란, 앱 신뢰도 하락 | 로딩 스켈레톤 or `visibility: hidden` 후 렌더링 완료 시 표시 |
| 정답 맞혔을 때만 피드백, 오답 해설 없음 | 학습 효과 없음 | 오답 시 단계별 풀이 해설(Step-by-step) 필수 |
| 적응형 추천이 "왜 이 문제인지" 설명 없음 | 학생이 알고리즘 불신 | 추천 이유 레이블 표시: "이 단원 정답률이 60%입니다" |
| 모바일에서 수식 입력 UI 없음 (강사용) | 강사가 모바일로 문제 입력 불가 | 강사 문제 입력은 데스크톱 전용으로 명확히 제한하거나 수식 키패드 제공 |
| 진도 대시보드가 단원별 평균 점수만 표시 | 어디가 약점인지 파악 불가 | BKT 숙련도 곡선 + 틀린 개념 태그 히트맵 표시 |

---

## "Looks Done But Isn't" Checklist

- [ ] **KaTeX 렌더링:** 스크린리더 접근성 확인 — KaTeX `aria-label` 또는 MathML 출력 여부 검증
- [ ] **오프라인 모드:** 실제 기기에서 비행기 모드로 전환 후 문제 풀기 → 재연결 후 동기화 흐름 검증
- [ ] **권한 관리:** 학생 계정으로 강사 API 엔드포인트 직접 호출 시 403 반환 확인
- [ ] **BKT 숙련도:** 같은 문제를 연속 10번 맞혔을 때 숙련도가 1에 수렴하지 않고 적절히 올라가는지 확인
- [ ] **문제 태깅:** 태그가 없는 문제가 추천 알고리즘에서 누락되지 않는지 확인
- [ ] **PWA 설치:** iOS Safari에서 "홈 화면에 추가" 후 오프라인 기동 확인
- [ ] **저작권:** 모든 문제 콘텐츠의 출처와 라이선스가 내부 데이터베이스에 기록되어 있는지 확인
- [ ] **수식 복사:** 학생이 수식을 클립보드에 복사했을 때 LaTeX 텍스트가 복사되는지 확인

---

## Recovery Strategies

| 함정 | 복구 비용 | 복구 단계 |
|------|-----------|-----------|
| 태그 스키마 재설계 | HIGH | (1) 새 스키마 정의 (2) 마이그레이션 스크립트 작성 (3) 기존 문제 일괄 재태깅 (학습 기록 참조 무결성 유지) |
| BKT 파라미터 오염 | MEDIUM | (1) 이상 파라미터 필터링 (2) 해당 단원 숙련도 초기화 (3) 제약 조건 추가 후 재추정 |
| SSR 하이드레이션 불일치 전수 발생 | MEDIUM | (1) 수식 컴포넌트 전체 `ssr: false` 전환 (2) CLS 방지 CSS 추가 (3) Lighthouse 재검증 |
| 오프라인 동기화 데이터 유실 | HIGH | (1) 이벤트 소싱 로그에서 복원 (2) 타임스탬프 기반 재정렬 (3) 사용자에게 손실 알림 및 보상) |
| 저작권 침해 경고 수신 | HIGH | (1) 해당 문제 즉시 비공개 처리 (2) 법적 검토 (3) 텍스트 재입력 후 재게시 |

---

## Pitfall-to-Phase Mapping

| 함정 | 방지 단계 | 검증 방법 |
|------|-----------|-----------|
| KaTeX SSR 하이드레이션 불일치 | Phase 1 (기술 스택 설정) | 수식 렌더링 POC에서 Lighthouse CLS < 0.1 확인 |
| BKT Cold Start | Phase 2 (적응형 엔진) | 신규 사용자 시뮬레이션: 진단 퀴즈 → 추천 결과 검토 |
| 문제 태깅 스키마 미설계 | Phase 1 (데이터 모델링) | 첫 100문제 입력 전 팀 리뷰 완료 |
| 기출문제 저작권 | Phase 0 (사전 기획) | 법적 검토 문서 + 입력 가이드라인 완성 |
| PWA 오프라인 동기화 충돌 | Phase 3 (PWA 구현) | 오프라인 시나리오 E2E 테스트 자동화 |
| 모바일 수식 레이아웃 깨짐 | Phase 1 (UI 컴포넌트) | 실제 기기 크로스브라우저 테스트 |
| 강사/학생 권한 부실 | Phase 1 (인증/권한) | OWASP IDOR 체크리스트 통과 |
| BKT 파라미터 비현실적 수렴 | Phase 2 (적응형 엔진) | 파라미터 바운딩 단위 테스트 + 모니터링 알림 |

---

## Sources

- Cold Start in Knowledge Tracing (2025): [https://arxiv.org/abs/2505.21517](https://arxiv.org/abs/2505.21517)
- BKT Parametric Constraints (EDM 2024): [https://educationaldatamining.org/edm2024/proceedings/2024.EDM-long-papers.2/index.html](https://educationaldatamining.org/edm2024/proceedings/2024.EDM-long-papers.2/index.html)
- pyBKT Library: [https://github.com/CAHLR/pyBKT](https://github.com/CAHLR/pyBKT)
- KaTeX vs MathJax 비교 (2025): [https://biggo.com/news/202511040733_KaTeX_MathJax_Web_Rendering_Comparison](https://biggo.com/news/202511040733_KaTeX_MathJax_Web_Rendering_Comparison)
- LaTeX/KaTeX 웹 챌린지: [https://evelynlearning.com/blog/challenges-in-writing-math-for-the-web-using-latex-and-katex](https://evelynlearning.com/blog/challenges-in-writing-math-for-the-web-using-latex-and-katex)
- PWA 오프라인 동적 데이터: [https://www.monterail.com/blog/pwa-offline-dynamic-data](https://www.monterail.com/blog/pwa-offline-dynamic-data)
- 수능 저작권 판결 (경향신문, 2024): [https://www.khan.co.kr/article/202408041306001](https://www.khan.co.kr/article/202408041306001)
- EdTech 보안 위반 사례 (2024): [https://managedservicesjournal.com/articles/edtech-security-challenges-to-overcome-in-2024/](https://managedservicesjournal.com/articles/edtech-security-challenges-to-overcome-in-2024/)
- FSRS 스페이스드 리피티션 알고리즘: [https://github.com/open-spaced-repetition/fsrs4anki/wiki/spaced-repetition-algorithm:-a-three%E2%80%90day-journey-from-novice-to-expert](https://github.com/open-spaced-repetition/fsrs4anki/wiki/spaced-repetition-algorithm:-a-three%E2%80%90day-journey-from-novice-to-expert)
- Moodle 문제 DB 구조 (공식 문서): [https://docs.moodle.org/dev/Question_database_structure](https://docs.moodle.org/dev/Question_database_structure)
- Deep KT 리뷰 (2025): [https://dl.acm.org/doi/10.1145/3729605.3729620](https://dl.acm.org/doi/10.1145/3729605.3729620)

---
*Pitfalls research for: 수학 기출문제 학습 웹앱 (Math Exam Learning PWA)*
*Researched: 2026-02-19*

---

---

# v3.0 반전 모드 — 게이미피케이션 통합 함정

**도메인 추가:** React 교육 앱에 Phaser 3 / Three.js / 게이미피케이션 추가
**Researched:** 2026-02-23
**Confidence:** MEDIUM-HIGH (GitHub issues, official templates, academic research, MDN 공식 문서 교차 검증)

---

## Critical Pitfalls (v3.0 게이미피케이션)

### Pitfall G1: React StrictMode + Phaser 이중 초기화

**What goes wrong:**
React 18/19의 StrictMode가 개발 모드에서 컴포넌트를 두 번 마운트(mount → unmount → remount)하는데, `useEffect` 내에서 `new Phaser.Game(config)`를 초기화하면 게임 인스턴스가 2개 생성된다. 두 번째 인스턴스가 같은 DOM 컨테이너에 Canvas를 붙이려다 충돌하거나, 첫 번째 인스턴스가 cleanup 없이 남아 메모리 누수가 발생한다.

**Why it happens:**
Phaser의 `Game` 초기화는 멱등적(idempotent)이지 않다. React StrictMode는 순수하지 않은 side effect를 찾기 위해 의도적으로 마운트를 두 번 실행한다. `useEffect`의 cleanup 함수에서 `game.destroy(true)`를 호출해도 Phaser의 destroy는 비동기적으로 다음 프레임에 실행되므로, React의 두 번째 마운트 시점에 정리가 완료되지 않아 충돌이 발생한다.

**How to avoid:**
- `useRef`에 게임 인스턴스를 저장하고, `if (gameRef.current) return` 가드로 이중 초기화 방지.
- Phaser 공식 React TypeScript 템플릿(`phaserjs/template-react-ts`)의 `PhaserGame.tsx` 패턴을 그대로 따른다 — `forwardRef` + EventBus 패턴.
- 개발 환경에서만 StrictMode를 게임 컴포넌트 외부로 분리하는 것을 검토한다.
- `game.destroy(true)`는 cleanup 함수에서 호출하되, `DESTROY` 이벤트를 수신하여 비동기 완료를 확인한다.

**Warning signs:**
- 개발 환경 콘솔에 "Canvas is already in use" 또는 Phaser 초기화 오류
- 게임이 두 개의 Canvas 요소를 DOM에 생성
- 메모리 사용량이 페이지 전환마다 선형으로 증가

**Phase to address:** Phase 15 (반전 모드 기반 인프라) — Phaser 통합 POC 단계에서 가장 먼저 검증

---

### Pitfall G2: Phaser 씬(Scene) unmount 시 메모리 누수

**What goes wrong:**
React 라우터로 페이지를 이동하면 Phaser 게임 컴포넌트가 unmount되는데, `game.destroy(true)`를 호출했음에도 텍스처 아틀라스, 오디오 버퍼, 애니메이션 클립이 GPU/오디오 메모리에 남는다. 특히 Phaser의 WebAudio는 `AudioContext`를 명시적으로 닫지 않으면 브라우저 프로세스가 참조를 유지한다.

**Why it happens:**
Phaser는 `game.destroy(true)`에 `true`(RemoveCanvas) 플래그를 전달해야 Canvas DOM 요소도 제거한다. `false`로 호출하면 Canvas가 DOM에 남는다. 씬별로 `preload`한 텍스처는 `scene.textures.remove(key)` 또는 `this.cache.audio.remove(key)`를 씬의 `shutdown` 핸들러에서 명시적으로 제거하지 않으면 TextureManager 레벨에서 유지된다.

**How to avoid:**
- 모든 씬의 `shutdown` 이벤트 핸들러에서 씬 전용 텍스처/오디오 제거:
  ```javascript
  this.events.on('shutdown', () => {
    this.textures.remove('boss-spritesheet');
    this.cache.audio.remove('bgm-battle');
  });
  ```
- `game.destroy(true)`를 `useEffect` cleanup에서 호출.
- `scene.sys.events.off()` 로 씬에 등록된 이벤트 리스너 전부 제거.
- Chrome DevTools Memory 탭에서 페이지 이동 전후 heap 스냅샷 비교로 검증.

**Warning signs:**
- 반전 모드 진입/퇴장을 5회 반복하면 브라우저 탭 메모리가 100MB+ 증가
- `AudioContext` 인스턴스가 DevTools에서 닫히지 않고 쌓임
- `performance.memory.usedJSHeapSize`가 세션 중 단조 증가

**Phase to address:** Phase 15 (반전 모드 기반 인프라), Phase 16 (Phaser 퀴즈 엔진) — 씬 전환마다 검증

---

### Pitfall G3: WebGL Context 한도 초과 (Phaser + Three.js 공존)

**What goes wrong:**
브라우저는 동시에 8~16개의 WebGL 컨텍스트만 허용한다. Phaser가 Canvas/WebGL 렌더러로 컨텍스트 1개를 사용하고, Three.js 파티클 이펙트가 별도 Canvas로 추가 컨텍스트를 생성하면, 다른 컴포넌트(KaTeX SVG, 분석 차트 등)의 컨텍스트까지 합산되어 한도에 근접한다. 오래된 컨텍스트가 강제 소멸되면 "WebGL context lost" 오류가 발생하고 Canvas가 검게 표시된다.

**Why it happens:**
현존 브라우저(Chrome, Safari)는 탭당 WebGL 컨텍스트 수를 하드 제한한다. Safari의 OffscreenCanvas는 최대 4개까지만 허용한다는 2024년 실측 결과도 있다. Phaser와 Three.js를 별도 Canvas로 동시 실행하면 필연적으로 한도에 가까워진다.

**How to avoid:**
- Phaser와 Three.js를 **하나의 Canvas**에서 공존시키지 않고, Three.js 이펙트는 Phaser 씬 내의 `RenderTexture` 또는 CSS 레이어(DOM 오버레이)로 대체 검토.
- Three.js는 반전 모드 레벨업/보스전 등 특별한 순간에만 단일 Full-screen Canvas로 띄우고, 사용 후 즉시 `renderer.dispose()` + `forceContextLoss()` 호출.
- 동시 활성 WebGL 컨텍스트 수를 DevTools에서 모니터링 (`WebGL Inspector` 확장 프로그램 활용).
- 분석 차트 라이브러리(Recharts, Chart.js)가 WebGL 렌더러를 사용하는지 확인하고 SVG 모드로 고정.

**Warning signs:**
- 콘솔에 "WARNING: Too many active WebGL contexts. Oldest context will be lost."
- 특정 화면이 검은 Canvas로 표시됨
- iOS Safari에서만 재현되는 Canvas 소실

**Phase to address:** Phase 15 (아키텍처 설계), Phase 17 (Three.js 이펙트) — 컨텍스트 예산 계획 필수

---

### Pitfall G4: iOS Web Audio API 자동재생 차단

**What goes wrong:**
게임 BGM이나 정답 효과음을 `AudioContext.createBuffer()` + `source.start()`로 재생하려 하면 iOS(Safari, Chrome-on-iOS 동일)에서 "AudioContext was not allowed to start" 오류가 발생한다. 사용자 제스처(터치/클릭) 없이는 오디오를 재생할 수 없으며, 심지어 사용자가 소리를 허용했더라도 기기가 무음 모드이면 Web Audio API 사운드는 재생되지 않는다.

**Why it happens:**
iOS의 Web Audio API는 처음 `AudioContext`를 생성하면 `suspended` 상태이며, 사용자 gesture event handler 내부에서 `audioContext.resume()`을 호출해야 `running` 상태로 전환된다. 한 번 resume된 이후에는 같은 컨텍스트에서 자유롭게 재생 가능하다. Phaser의 `SoundManager`도 내부적으로 동일한 제약을 받는다.

**How to avoid:**
- 반전 모드 진입 버튼의 click 핸들러에서 `audioContext.resume()`을 명시적으로 호출하여 오디오 컨텍스트를 활성화 — 이후 모든 사운드가 정상 작동.
- Phaser 설정에서 `audio: { noAudio: false }` 유지하되, `game.sound.unlock()` 메서드를 유저 제스처에 연결.
- `<audio>` HTML 요소를 무음 상태로 하나 생성하여 사용자 제스처 시 play/pause를 호출하는 "unlock trick" 적용 (iOS Safari 15.4+ 이전 구버전 대응).
- 오디오 초기화 실패 시 소리 없이 진동/시각 피드백으로 graceful degrade.

**Warning signs:**
- iOS 기기에서 게임 시작 시 소리 없음
- 콘솔에 "The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture."
- Android에서는 정상, iOS에서만 무음

**Phase to address:** Phase 16 (Phaser 퀴즈 엔진), Phase 18 (사운드 시스템) — iOS 실기기 테스트 필수

---

### Pitfall G5: 번들 사이즈 폭발 (기존 2.7MB + Phaser ~1MB + Three.js ~600KB)

**What goes wrong:**
현재 앱 번들이 이미 2.7MB인 상황에서 Phaser 3를 `import Phaser from 'phaser'`로 전체 import하면 ~1MB, Three.js를 `import * as THREE from 'three'`로 import하면 ~600KB가 추가된다. 초기 번들이 4MB+로 증가하면 3G 환경에서 15초 이상 로딩이 발생하고, Lighthouse Performance 점수가 30점대로 폭락한다.

**Why it happens:**
Phaser와 Three.js 모두 monolithic 라이브러리로 설계되어 있어 tree-shaking이 완전히 동작하지 않는다. 특히 Phaser는 물리 엔진, 게임 오브젝트, 씬 시스템 등 모든 모듈이 긴밀히 결합되어 있어 부분 import가 어렵다.

**How to avoid:**
- Phaser와 Three.js 모두 `React.lazy()` + `Suspense`로 동적 import:
  ```javascript
  const GameMode = React.lazy(() => import('./GameMode'));
  ```
- Vite 설정에서 `manualChunks`로 Phaser/Three.js를 별도 청크로 분리 — 반전 모드 첫 진입 시 한 번만 다운로드.
- Three.js는 필요한 모듈만 named import: `import { Scene, PerspectiveCamera, WebGLRenderer } from 'three'`.
- Phaser는 커스텀 빌드를 통한 불필요 모듈 제거 검토 (Matter.js 물리, Tilemaps 등).
- 반전 모드 진입 버튼 hover 시 prefetch 트리거로 사용자 체감 로딩 시간 단축.

**Warning signs:**
- `vite build --report` 결과에서 Phaser/Three.js 청크가 메인 번들에 포함됨
- Lighthouse FCP/TTI가 일반 모드 대비 3배 이상 증가
- 반전 모드 진입 버튼 클릭 후 5초 이상 로딩 스피너

**Phase to address:** Phase 15 (반전 모드 기반 인프라) — 번들 전략을 코드 작성 전에 결정

---

### Pitfall G6: 게이미피케이션이 학습 내재 동기를 약화시킴

**What goes wrong:**
XP, 뱃지, 리더보드, 연속 출석 스트릭 같은 외재적 보상(extrinsic reward)에 과도하게 집중하면 학생이 "배지를 위해 문제를 푸는" 행동으로 전환된다. 2025년 메타분석(K-12 31개 연구, n=5,000+)에서 게이미피케이션은 외재 동기(g=0.713)에는 큰 효과가 있지만 내재 동기(g=0.638)에는 상대적으로 낮은 효과를 보였으며, 장기 노출 시 내재 동기가 감소한다는 종단 연구 결과가 있다.

**Why it happens:**
보상이 예측 가능하고 반복되면 인지적 과부하 없이 "보상 루프"만 작동한다. 학생이 문제의 어려움을 회피하고 쉬운 문제만 반복하여 XP를 획득하는 전략을 취하게 된다. Duolingo의 스트릭은 강력한 리텐션 도구이지만 동시에 불안과 강박을 유발하는 것으로 알려져 있다.

**How to avoid:**
- 외재적 보상보다 **자율성(Autonomy), 유능감(Competence), 관계성(Relatedness)** — 자기결정이론(SDT) 기반 설계.
- XP와 뱃지는 "학습 성취" 기반으로만 지급하고, 단순 클릭/시간 소비 기반 보상 제거.
- 보스전/타임어택은 어려운 문제를 도전으로 프레이밍하되, 실패해도 패널티가 없는 설계.
- 리더보드는 "개인 성장 비교" (이번 주 vs 지난 주 자기 자신)로 구현하고, 타인과의 경쟁 순위는 opt-in으로만 제공.
- 반전 모드는 언제든 끌 수 있어야 한다 — 강제 게이미피케이션은 역효과.

**Warning signs:**
- 학생이 쉬운 문제만 골라 빠르게 XP 수집하는 패턴 (로그 분석)
- 스트릭이 끊길까 봐 앱을 끄지 못하는 피드백
- 반전 모드 이탈 후 일반 모드 사용 시간이 감소

**Phase to address:** Phase 15 (설계 단계) — 보상 설계 원칙을 구현 전에 문서화; Phase 19 (리워드 시스템)

---

### Pitfall G7: 이중 UI 상태 — 모든 화면에 두 가지 버전 유지

**What goes wrong:**
홈, 퀴즈, 분석, 오답노트 등 모든 페이지가 "일반 모드"와 "반전 모드" 두 가지 UI를 동시에 가져야 한다. 이를 나이브하게 구현하면 각 컴포넌트에 `if (gameMode) return <GameVersion /> else return <NormalVersion />`이 흩어져 코드베이스가 두 배로 증가하고, 수정 시 두 버전을 동시에 관리해야 한다.

**Why it happens:**
모드 분기를 각 컴포넌트 내부에서 처리하는 패턴은 초기에 간단해 보이지만, 컴포넌트 수가 20개 이상이 되면 "일반 모드 버그 수정 시 게임 모드도 확인해야" 하는 인지 부하가 폭발한다.

**How to avoid:**
- **Provider 패턴**: `GameModeContext`를 앱 루트에 두고, 각 페이지는 `useGameMode()` 훅으로 모드 감지.
- **컴포넌트 교체 전략**: 페이지 라우터 레벨에서 모드에 따라 완전히 다른 컴포넌트를 lazy load — `QuizPage`(일반) vs `GameQuizPage`(반전).
- **공통 데이터 레이어 분리**: 문제 데이터, 채점 로직, 학습 기록은 모드와 무관한 공통 훅으로 추출 — UI만 교체.
- 절대 피해야 할 패턴: 기존 컴포넌트에 `gameMode` prop을 추가하는 방식 (prop drilling 지옥).

**Warning signs:**
- 일반 모드 버그 수정 후 게임 모드에서 동일 버그 재발
- 컴포넌트 파일에 `// game mode` 주석이 50줄 이상
- 두 모드 간 상태 동기화 버그(점수가 잘못 공유됨)

**Phase to address:** Phase 15 (반전 모드 기반 인프라) — 모드 아키텍처를 첫 번째 피처 구현 전에 확정

---

### Pitfall G8: 저사양 태블릿에서 60fps Canvas 렌더링 실패

**What goes wrong:**
고등학생의 주요 기기인 저가형 Android 태블릿(Snapdragon 450, 2GB RAM)에서 Phaser의 WebGL 렌더러가 30fps 이하로 떨어지거나, Three.js 파티클 이펙트 시 브라우저가 다운된다. 학습 앱이 유희를 제공하다 앱 자체를 불안정하게 만드는 역효과가 발생한다.

**Why it happens:**
저가형 Android 태블릿은 GPU 드라이버가 구형이고 WebGL 2.0을 지원하지 않는 경우가 많다. 스프라이트 배치가 500개 이상이거나 실시간 파티클 이펙트가 1000개 이상이면 60fps 유지가 불가능하다.

**How to avoid:**
- 기기 감지: `navigator.hardwareConcurrency < 4` 또는 WebGL `MAX_TEXTURE_SIZE < 4096`이면 "라이트 모드" 이펙트 사용.
- Phaser 렌더러를 WebGL 우선으로 설정하되, WebGL 미지원 시 Canvas 렌더러로 자동 폴백.
- Three.js 파티클은 `InstancedMesh`로 최적화하고, 최대 파티클 수를 기기 성능에 따라 동적으로 조절.
- 반전 모드 이펙트에 "품질 레벨" 설정 추가: 고성능(파티클 1000개) / 중간(파티클 300개) / 저성능(CSS 애니메이션으로 대체).
- 저사양 기기에서는 Phaser 대신 CSS 애니메이션 + Canvas 2D로 게임 UI를 구현하는 폴백 경로 준비.

**Warning signs:**
- 실제 저가형 Android 기기에서 FPS가 20 이하로 표시
- `requestAnimationFrame` 콜백 간격이 50ms 이상
- 게임 시작 후 브라우저 탭이 "느린 페이지" 경고 표시

**Phase to address:** Phase 16 (Phaser 퀴즈 엔진) — 저사양 기기 테스트를 개발 초기부터 포함

---

## Moderate Pitfalls (v3.0 게이미피케이션)

### Pitfall G9: Phaser 텍스처 아틀라스 경로 혼동 (public vs import)

**What goes wrong:**
Vite 프로젝트에서 Phaser의 `this.load.atlas('key', 'path/to/texture.png', 'path/to/atlas.json')`에 경로를 잘못 지정하면 개발 환경에서는 로딩되지만 프로덕션 빌드에서 404가 발생한다.

**Prevention:**
- Phaser 에셋(텍스처, 오디오, 스프라이트시트)은 모두 `/public/assets/` 디렉토리에 배치하고 절대 경로 참조.
- `import`로 가져온 에셋 URL(Vite가 해시를 붙임)과 `/public` 정적 파일 경로를 혼용하지 않는다.
- Phaser 공식 React 템플릿의 에셋 경로 규칙을 준수: static files in `/public/assets`, imported modules use bundled paths.
- 배포 전 프로덕션 빌드(`vite build`)로 에셋 경로 검증을 CI에 포함.

---

### Pitfall G10: EventBus 메모리 누수 — React-Phaser 통신

**What goes wrong:**
React 컴포넌트가 Phaser EventBus에 리스너를 등록하고, 컴포넌트 unmount 시 리스너를 제거하지 않으면 GC되지 않는 클로저가 쌓인다. 반전 모드를 여러 번 토글하면 같은 이벤트에 리스너가 중복 등록된다.

**Prevention:**
- React `useEffect` cleanup에서 `EventBus.removeListener(event, handler)` 반드시 호출.
- `EventBus.on()` 대신 `EventBus.once()`를 사용하는 이벤트는 자동 해제되므로 cleanup 불필요.
- Phaser 씬의 `shutdown` 핸들러에서 `EventBus.removeAllListeners()` 호출하여 씬 수명에 종속된 리스너 전부 제거.

---

### Pitfall G11: 게임 모드에서 수학 수식(KaTeX) 렌더링 충돌

**What goes wrong:**
Phaser Canvas 위에 수학 문제(LaTeX 수식)를 표시하려고 HTML DOM 요소를 Canvas에 오버레이하면, Phaser의 input 시스템(터치, 클릭)이 DOM 오버레이에 막혀 작동하지 않는다.

**Prevention:**
- 퀴즈 문제 텍스트는 HTML/CSS 레이어(position: absolute, z-index 높음)로 Phaser Canvas 위에 오버레이.
- Phaser input을 DOM 이벤트로 포워딩하거나, 수식 영역에는 Phaser input을 비활성화.
- 또는 KaTeX 렌더링 결과를 SVG로 생성한 뒤 Phaser의 `this.add.image()`로 Canvas 내에 직접 로드하는 방식 — 단, 동적 수식 업데이트가 복잡해짐.
- 정답 선택지(버튼)는 Phaser 내 게임 오브젝트로 구현하고, 문제 텍스트만 HTML 오버레이로 처리하는 하이브리드 접근이 현실적.

---

### Pitfall G12: HMR(Hot Module Replacement)이 Phaser 씬을 제대로 교체하지 못함

**What goes wrong:**
Vite HMR이 작동할 때 React 컴포넌트는 교체되지만 Phaser 게임 인스턴스는 이미 실행 중이어서 씬 코드가 업데이트되지 않는다. 씬 로직을 수정해도 브라우저를 수동으로 새로고침해야 반영된다.

**Prevention:**
- Phaser 씬 파일을 수정할 때는 전체 페이지 새로고침이 필요함을 팀에 공유 — DX 기대치 설정.
- `import.meta.hot.accept()` 핸들러에서 Phaser 게임을 destroy 후 재초기화하는 HMR 핸들러 구현 (복잡도 높음, 선택 사항).
- 씬 로직 개발 중에는 Phaser의 Standalone 모드(React 없이 순수 HTML)에서 먼저 검증 후 통합하는 워크플로우 채택.

---

### Pitfall G13: 반전 모드 토글 시 애니메이션 상태 손실

**What goes wrong:**
학생이 문제를 풀다가 반전 모드를 켜면 현재 문제 풀이 진행 상태, 타이머, 채점 결과가 초기화된다. 반대로 게임 모드에서 일반 모드로 돌아와도 리워드 획득 결과가 사라진다.

**Prevention:**
- 반전 모드는 UI 레이어만 교체하고, 문제 풀이 상태(현재 문제 인덱스, 남은 시간, 정답 여부)는 React 전역 상태(Zustand 또는 Context)에서 관리.
- 모드 전환은 라우터 이동이 아닌 조건부 렌더링으로 구현 — URL은 동일하게 유지.
- 게임 모드 획득 XP/뱃지는 모드 전환과 무관하게 즉시 localStorage에 저장.

---

## Technical Debt Patterns (v3.0)

| 단축키 | 즉각적 이점 | 장기 비용 | 수용 가능 여부 |
|--------|-------------|-----------|----------------|
| Phaser 전체 import (`import Phaser from 'phaser'`) | 빠른 개발 시작 | 번들 +1MB, TTI 3배 증가 | Never — lazy import 필수 |
| 각 컴포넌트 내 `if (gameMode)` 분기 | 빠른 구현 | 컴포넌트 수 20개 이상 시 유지보수 불가 | 1-2개 컴포넌트에서만 허용, 이후 리팩토링 |
| Phaser Canvas 렌더러 고정 (WebGL 미사용) | 저사양 호환 | 파티클/이펙트 성능 제한 | MVP에서 한시적 허용 |
| 사운드 파일을 `/public`에 원본 MP3로 배치 | 간단 | 파일 크기 최적화 미적용, 모바일 로딩 느림 | 개발 중 허용, 배포 전 WebM/OGG + MP3 폴백으로 변환 |
| 리더보드를 localStorage에만 저장 | 백엔드 불필요 | POC에서 서버 동기화 불가, 다기기 지원 없음 | POC 단계 한정 허용 |

---

## Integration Gotchas (v3.0)

| 통합 대상 | 흔한 실수 | 올바른 접근 |
|-----------|-----------|------------|
| Phaser + React | `new Phaser.Game()` 직접 호출 | `PhaserGame` 브릿지 컴포넌트 + `useRef` + EventBus 패턴 |
| Phaser + Vite | 에셋을 `src/`에서 `import`로 참조 | 에셋은 `/public/assets/`에 배치하고 런타임 문자열 경로 사용 |
| Three.js + React | 컴포넌트마다 `new THREE.WebGLRenderer()` 생성 | 렌더러를 전역 싱글톤으로 유지, 씬만 교체 |
| Three.js 씬 전환 | `scene.clear()` 호출 후 이동 | `geometry.dispose()`, `material.dispose()`, `texture.dispose()` 각각 호출 |
| Web Audio + iOS | `AudioContext` 초기화 시 바로 소리 재생 | 첫 번째 유저 제스처 핸들러에서 `audioContext.resume()` 호출 후 재생 |
| Phaser + Tailwind v4 | Phaser Canvas가 Tailwind global reset에 영향받음 | Phaser 컨테이너에 `all: initial` 또는 CSS 격리 적용 |

---

## Performance Traps (v3.0)

| 트랩 | 증상 | 예방 | 임계점 |
|------|------|------|--------|
| Phaser 파티클 이미터 미제거 | 씬 전환 시 파티클이 계속 생성 | `scene.shutdown`에서 `emitter.destroy()` | 파티클 이미터 3개 이상 동시 활성 |
| Three.js 텍스처 미해제 | GPU 메모리 증가, 렌더링 느려짐 | 씬 종료 시 `texture.dispose()` 일괄 호출 | 1024x1024 텍스처 10개 이상 |
| 반전 모드 진입 시 동기 초기화 | 모드 전환 시 UI 블록 1~3초 | Phaser 초기화를 비동기 + Suspense로 처리 | Phaser 최초 초기화 시점 |
| 오디오 버퍼 중복 로드 | 사운드 재생 시 딜레이, 메모리 증가 | Phaser AudioManager가 씬 간 공유 캐시 사용 | 효과음 20개 이상 |
| requestAnimationFrame 루프 + React 리렌더링 동시 | 60fps 유지 불가, jank 발생 | Phaser 상태를 React state로 연결 최소화 — EventBus 경유 | React 컴포넌트 10개+ Phaser 상태 구독 |

---

## UX Pitfalls (v3.0)

| 함정 | 사용자 영향 | 개선 방향 |
|------|------------|-----------|
| 반전 모드 전환 시 즉각적 화면 점프 | 방향감 상실, 멀미 | Framer Motion으로 300ms 전환 애니메이션 + reduced-motion 지원 |
| 게임 BGM이 꺼지지 않아 수업 시간에 소리 남 | 민망함, 사용 중단 | BGM 볼륨을 별도로 저장, 반전 모드 종료 시 자동 페이드아웃 |
| 보스전 타임어택이 수학 불안 학생에게 스트레스 | 학습 거부 | 타임어택을 opt-in으로 설계, 기본값은 타이머 없음 |
| 리더보드가 상위권 학생만 동기 부여 | 하위권 학생 이탈 | 개인 성장 리더보드(지난 주 대비 향상) 우선, 전체 순위는 숨김 |
| 뱃지를 모두 잠금 해제 후 할 것이 없음 | 급격한 흥미 감소 | 주기적 시즌 뱃지 + 개인 목표 달성 뱃지로 롱텀 목표 유지 |
| 반전 모드에서 수식이 게임 이펙트에 가려짐 | 문제 내용 미확인 | 수식 레이어의 z-index를 이펙트 레이어보다 항상 높게 유지 |

---

## "Looks Done But Isn't" Checklist (v3.0)

- [ ] **메모리 누수 검증:** 반전 모드 진입/퇴장 10회 반복 후 Chrome DevTools 메모리 힙 스냅샷 비교 — 200MB 이상 증가 없어야 함
- [ ] **iOS 오디오:** iPhone(실기기)에서 반전 모드 진입 후 첫 정답 효과음이 실제로 재생되는지 확인
- [ ] **WebGL 컨텍스트 수:** Phaser + Three.js 동시 실행 시 DevTools에서 활성 WebGL 컨텍스트가 4개 이하인지 확인
- [ ] **저사양 기기:** 저가형 Android 태블릿(Snapdragon 450급)에서 Phaser 씬이 30fps 이상 유지되는지 측정
- [ ] **번들 크기:** `vite build` 후 `dist` 분석에서 Phaser/Three.js가 별도 청크로 분리되었는지 확인
- [ ] **모드 상태 보존:** 퀴즈 3번째 문제에서 반전 모드 켜기 → 꺼기 → 다시 켜기 후 문제 번호와 타이머가 올바른지 확인
- [ ] **reduced-motion:** 시스템 `prefers-reduced-motion: reduce` 설정 시 Phaser 애니메이션이 멈추는지 확인
- [ ] **수식 가시성:** 게임 이펙트(파티클, 플래시) 재생 중에도 문제 수식이 읽을 수 있는지 확인

---

## Recovery Strategies (v3.0)

| 함정 | 복구 비용 | 복구 단계 |
|------|-----------|-----------|
| Phaser 이중 초기화로 인한 앱 크래시 | MEDIUM | (1) StrictMode 외부에 게임 컴포넌트 격리 (2) `useRef` 가드 추가 (3) 기존 인스턴스 destroy 후 재초기화 |
| WebGL 컨텍스트 소진 | HIGH | (1) Three.js를 Canvas 렌더러로 교체 (2) Phaser 씬 공유 렌더러로 전환 (3) 이펙트를 CSS 애니메이션으로 대체 |
| 번들 사이즈 폭발 (4MB+) | MEDIUM | (1) Phaser/Three.js를 `React.lazy()`로 전환 (2) `manualChunks` 설정 (3) 필요 없는 Phaser 플러그인 제거 |
| 게이미피케이션으로 인한 학습 동기 저하 | HIGH | (1) 보상 시스템 감사(audit) (2) 외재적 보상 빈도 축소 (3) 성취 기반 보상으로 재설계 (4) A/B 테스트 |
| iOS 오디오 완전 미작동 | LOW | (1) `AudioContext.resume()` 호출 시점을 반전 모드 버튼 click 핸들러로 이동 (2) 기존 unlock trick 구현 추가 |

---

## Pitfall-to-Phase Mapping (v3.0)

| 함정 | 방지 단계 | 검증 방법 |
|------|-----------|-----------|
| React StrictMode + Phaser 이중 초기화 | Phase 15 (기반 인프라 POC) | StrictMode 환경에서 Canvas 개수 = 1 확인 |
| Phaser 씬 메모리 누수 | Phase 15-16 (Phaser 통합) | 10회 모드 전환 후 메모리 힙 스냅샷 |
| WebGL 컨텍스트 한도 초과 | Phase 15 (아키텍처 설계) | Phaser + Three.js 동시 실행 시 컨텍스트 수 모니터링 |
| iOS Web Audio 차단 | Phase 18 (사운드 시스템) | iPhone 실기기에서 첫 사운드 재생 확인 |
| 번들 사이즈 폭발 | Phase 15 (번들 전략) | `vite-bundle-visualizer`로 청크 분리 확인 |
| 게이미피케이션 동기 약화 | Phase 15 (설계), Phase 19 (리워드) | 보상 설계 원칙 문서 + 학생 인터뷰 |
| 이중 UI 상태 복잡도 | Phase 15 (아키텍처) | 모드 전환 시 공통 데이터 레이어 상태 유지 확인 |
| 저사양 기기 성능 | Phase 16-17 (Phaser/Three.js) | 저가형 Android 기기에서 FPS 30+ 확인 |
| EventBus 메모리 누수 | Phase 16 (Phaser 퀴즈) | 씬 전환 시 리스너 중복 등록 없음 확인 |
| HMR Phaser 씬 미교체 | Phase 15-16 전반 | 팀 워크플로우 문서화로 DX 기대치 설정 |

---

## Sources (v3.0)

- Phaser 3 공식 React TypeScript 템플릿: [https://github.com/phaserjs/template-react-ts](https://github.com/phaserjs/template-react-ts)
- Phaser + React 공식 발표 (2024-02): [https://phaser.io/news/2024/02/official-phaser-3-and-react-template](https://phaser.io/news/2024/02/official-phaser-3-and-react-template)
- Phaser 메모리 누수 이슈 #5456: [https://github.com/photonstorm/phaser/issues/5456](https://github.com/photonstorm/phaser/issues/5456)
- Phaser Game.destroy() React 이슈 #4305: [https://github.com/phaserjs/phaser/issues/4305](https://github.com/phaserjs/phaser/issues/4305)
- Three.js WebGL 메모리 누수 이슈 #18759: [https://github.com/mrdoob/three.js/issues/18759](https://github.com/mrdoob/three.js/issues/18759)
- react-three-fiber WebGL 컨텍스트 Safari 이슈: [https://github.com/pmndrs/react-three-fiber/discussions/2457](https://github.com/pmndrs/react-three-fiber/discussions/2457)
- Three.js 메모리 누수 방지 팁: [https://roger-chi.vercel.app/blog/tips-on-preventing-memory-leak-in-threejs-scene](https://roger-chi.vercel.app/blog/tips-on-preventing-memory-leak-in-threejs-scene)
- MDN Web Audio API 자동재생 가이드: [https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- MDN Web Audio API 모범 사례: [https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- 게이미피케이션 내재 동기 메타분석 (2025, K-12): [https://onlinelibrary.wiley.com/doi/10.1002/pits.70056](https://onlinelibrary.wiley.com/doi/10.1002/pits.70056)
- 게이미피케이션이 학습을 방해하는 방법 (Frontiers in Education, 2024): [https://public-pages-files-2025.frontiersin.org/journals/education/articles/10.3389/feduc.2024.1474733/pdf](https://public-pages-files-2025.frontiersin.org/journals/education/articles/10.3389/feduc.2024.1474733/pdf)
- 게이미피케이션 다크 패턴 (MDPI, 2024): [https://arxiv.org/html/2412.05039v1](https://arxiv.org/html/2412.05039v1)
- Springer 게이미피케이션 메타분석 (2023): [https://link.springer.com/article/10.1007/s11423-023-10337-7](https://link.springer.com/article/10.1007/s11423-023-10337-7)
- WebGL 컨텍스트 한도 실측 (OffscreenCanvas, 2024): [https://groups.google.com/g/webgl-dev-list/c/LMXMoEUCaj4](https://groups.google.com/g/webgl-dev-list/c/LMXMoEUCaj4)
- Vite 번들 최적화 가이드 (2025): [https://www.frontendtools.tech/blog/reduce-javascript-bundle-size-2025](https://www.frontendtools.tech/blog/reduce-javascript-bundle-size-2025)

---
*v3.0 게이미피케이션 함정 연구 추가: 2026-02-23*
