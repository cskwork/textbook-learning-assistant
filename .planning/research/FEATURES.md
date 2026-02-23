# Feature Research

**Domain:** 고등학교 수학 기출문제 학습 웹앱 (Korean HS Math Exam Practice)
**Researched:** 2026-02-23 (v3.0 게이미피케이션 업데이트) | 2026-02-24 (v4.0 PDF 2-Way 업데이트)
**Confidence:** MEDIUM (WebSearch verified across multiple sources; specifics noted per feature)

---

## v4.0 PDF 2-Way 학습 시스템 — 신규 Feature Landscape

> 이 섹션은 v4.0 "PDF 2-Way 학습 시스템" 마일스톤 전용.
> 기존 v1/v2/v3 기능은 아래 원본 섹션 참조.
> PDF 2-Way = PDF 업로드 → AI 파싱 → DB 등록 (강사) + 앱 문제 → PDF 내보내기 (학생/강사).

---

### Table Stakes — PDF 학습 앱의 기본 기대값

강사나 학생이 "PDF 올리면 되겠다"고 생각할 때 당연히 기대하는 기능들.
없으면 "왜 이 기능을 만들었지?" 반응이 나온다.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **PDF 파일 업로드** | 파일 업로드 없이 PDF 2-Way 시스템 자체가 시작되지 않음. drag-and-drop + 버튼 클릭 모두 기대 | LOW | 기존 파일 입력 폼 패턴 | react-dropzone 또는 HTML input[type=file]. 최대 50MB, PDF만 허용. 업로드 진행 바 표시 필수. |
| **AI 파싱 진행 상태 표시** | Gemini API 호출은 1-10초 걸림. 진행 상태 없으면 사용자는 앱이 멈춘 줄 앎 | LOW | Gemini API 연동 | 단계별 상태: "PDF 분석 중..." → "문제 추출 중..." → "검수 준비 완료". 스피너 + 현재 단계 텍스트. |
| **추출된 문제 검수/수정 UI** | AI OCR은 100% 정확하지 않음. 강사가 수정할 수 있어야 실사용 가능. 수정 불가 = 강사 불신 | HIGH | AI 추출 결과, 기존 LaTeX 에디터 | 문제별 카드 목록. 각 카드에 LaTeX 미리보기 + 인라인 편집. 문제번호/정답/배점/난이도 수정 가능. 수정 후 DB 등록 버튼. |
| **PDF 뷰어 (기본 렌더링)** | "PDF 뷰어"라고 불리는 기능에서 PDF를 볼 수 없으면 기능이 아님 | MEDIUM | pdf.js (react-pdf) | 페이지 전환, 줌 인/아웃, 페이지 번호 표시. 수식 포함 PDF 렌더링 정확도가 핵심. |
| **풀이 오버레이 (정답 가리기/보이기)** | iPad로 시험지 보며 공부하는 학생이 기대하는 핵심 인터랙션. 없으면 그냥 PDF 뷰어와 차이 없음 | MEDIUM | PDF 뷰어, 문제 위치 데이터 | 정답 영역을 불투명 박스로 가리기. 탭하면 보임. 학생이 스스로 문제를 먼저 풀고 정답 확인. |
| **PDF 내보내기 (기본 시험지 스타일)** | 강사가 문제를 앱에서 직접 출력/배포할 수 있기를 기대 | MEDIUM | 기존 문제 DB, KaTeX 렌더링 | A4 세로, 헤더(과목/날짜/이름 칸), 문제 번호, 수식 정확 렌더링. 브라우저 Print API 또는 @react-pdf/renderer. |
| **파싱 실패/오류 안내** | Gemini가 못 읽는 PDF (스캔 품질 불량, 보안 PDF 등)가 반드시 있음. 조용히 실패하면 강사 혼란 | LOW | AI 파싱 결과 상태 관리 | 명확한 오류 메시지: "이 PDF는 텍스트 레이어가 없어 OCR 정확도가 낮을 수 있습니다". 재시도 버튼. 수동 입력 fallback 안내. |

---

### Differentiators — PDF 학습 앱의 차별화 기능

있으면 "이 앱 진짜 쓸 만하다"는 반응을 이끌어내는 기능들.
v4.0의 핵심 정체성.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Gemini Vision AI 수식 추출 (LaTeX 변환)** | 일반 OCR은 수식을 이미지로만 처리. Gemini Vision이 수식을 LaTeX로 변환하면 앱 내 자동 채점 + 검색 가능. 수학 앱에서 이게 핵심 차별화 | HIGH | Gemini API (gemini-2.0-flash), 기존 KaTeX 렌더링 | Gemini 2.0 Flash는 PDF 네이티브 처리 지원 (최대 50MB/1000페이지). structured output (JSON Schema)으로 문제번호/문제본문(LaTeX)/선택지/정답/배점 추출. Confidence score 요청하여 낮은 항목 강조 표시. |
| **AI 추출 결과 신뢰도 시각화** | 모든 AI 결과를 동일하게 보여주면 강사가 어디를 검토해야 하는지 모름. 낮은 신뢰도 문항을 빨간색으로 강조하면 검수 시간 80% 단축 | MEDIUM | AI 파싱 결과 + 신뢰도 스코어 | 문항별 신뢰도 바 (녹색/노란색/빨간색). 빨간색(70% 미만)은 자동으로 펼쳐서 검수 유도. 전체 신뢰도 요약 (예: "28/30문제 신뢰도 90% 이상"). |
| **PDF 뷰어 + 문제별 하이라이트 연동** | 뷰어에서 특정 문제를 클릭하면 앱 문제 카드로 이동하고, 앱 문제 카드 클릭 시 PDF 해당 위치로 스크롤. 양방향 네비게이션 | HIGH | PDF 뷰어, AI가 추출한 문제 위치 좌표(bbox) | Gemini에게 각 문제의 페이지 번호 + 바운딩 박스 좌표도 함께 추출 요청. PDF.js canvas layer 위에 반투명 하이라이트 오버레이 그리기. |
| **강사용 1-클릭 PDF → DB 등록** | 검수 완료 후 문제를 DB에 등록하는 과정이 복잡하면 강사가 포기. 기존 LaTeX 에디터로 수동 입력하던 것을 90% 자동화 | MEDIUM | AI 추출 결과, 기존 문제 DB 스키마, 기존 문제 등록 API | 검수 화면에서 "전체 선택 → 등록" 1-2단계로 완료. 과목/단원/유형 자동 분류 제안 + 강사 확인. 등록 성공 문항 수 / 실패 문항 목록 요약. |
| **학습지 스타일 PDF 내보내기** | 시험지(정답 없는 문제지)와 학습지(풀이 해설 포함)는 완전히 다른 레이아웃. 둘 다 지원하면 강사가 출력물 별도 작업 불필요 | HIGH | 기존 문제 DB + 해설 데이터, @react-pdf/renderer | 학습지 모드: 문제 아래 풀이 해설 + 관련 개념 인박스 포함. KaTeX 수식을 SVG로 변환 후 @react-pdf/renderer Image 컴포넌트로 삽입 (SVG Data URI 미지원 우회). |
| **페이지 범위 선택 파싱** | 40페이지짜리 기출문제집에서 특정 단원 10페이지만 파싱하고 싶은 것이 강사의 실제 니즈 | MEDIUM | PDF 업로드 + Gemini API | 업로드 후 페이지 썸네일 그리드 표시. 페이지 범위 선택 (1-10, 15-20 등). 선택한 범위만 Gemini로 전송. |
| **문제 번호 자동 감지 및 순서 정렬** | OCR 순서가 PDF 레이아웃 순서와 다를 수 있음 (2단 레이아웃 등). 자동 정렬이 없으면 강사가 순서 재정렬 필요 | MEDIUM | AI 파싱 결과 (bbox 좌표 기반 정렬) | Gemini 프롬프트에 "문제 번호를 명시적으로 추출하고 오름차순 정렬"을 요청. 2단 레이아웃 감지 후 좌→우 정렬. 강사가 drag-and-drop으로 수동 순서 조정 가능. |
| **PDF 뷰어 내 즉석 문제 풀기** | PDF 보면서 그 자리에서 답 선택/입력 → 채점까지. 시험지를 앱으로 보는 경험의 완성형 | HIGH | PDF 뷰어, 풀이 오버레이, 기존 채점 엔진 | 정답 오버레이에 객관식 선택지 인터랙션 추가. "제출" 버튼 → 채점 결과 오버레이 표시. 틀리면 오답노트 자동 추가 (기존 오답노트 연동). |

---

### Anti-Features — PDF 기능 구현의 함정 목록

자연스럽게 요청되거나 당연해 보이지만 실제로는 심각한 문제를 만드는 기능들.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| **손글씨 필기 OCR (필기 시험지 파싱)** | 학생이 손으로 쓴 답안지를 파싱하고 싶음 | 손글씨 수식 OCR 정확도는 인쇄체 대비 현저히 낮음 (특히 한국 수학 기호 혼재 시). 오류율이 높아 신뢰도 전체를 훼손함. Mathpix HWR는 별도 훈련된 모델 필요 | 인쇄된 기출문제 PDF만 지원 (v4.0). 손글씨는 v5.0 이후 별도 연구 후 도입 |
| **실시간 PDF 스트리밍 뷰어** | 대용량 PDF를 빠르게 열고 싶음 | react-pdf 기반 뷰어도 페이지 수 많으면 메모리 이슈 발생. 스트리밍 구현은 PDF.js 내부 렌더러 커스터마이징 필요 = 유지보수 악몽 | 페이지 범위 선택으로 필요한 페이지만 로드. 가상 스크롤로 렌더 비용 최소화 |
| **PDF 내 자유 필기/펜 입력** | iPad 시험지 느낌 완성을 위해 Apple Pencil처럼 필기 원함 | Canvas 위 필기 이벤트 처리 + 저장 + PDF 내보내기까지 연결은 완전 별도 기능 수준. PDF.js canvas와 drawing canvas 동기화 복잡도 폭증 | 오버레이 정답 확인 + 인터랙티브 채점으로 충분한 "iPad 시험지 느낌" 달성 |
| **서버사이드 PDF 렌더링 (헤드리스 브라우저)** | Puppeteer로 HTML을 PDF로 변환하면 완벽한 레이아웃 | 서버 필요 (현재 POC 아키텍처 완전 위반). Puppeteer = Node.js 서버 + 크롬 인스턴스 = 인프라 비용. 현재 프로젝트는 클라이언트 사이드 POC | @react-pdf/renderer로 클라이언트 사이드 PDF 생성. 수식은 KaTeX → SVG → Image 변환으로 해결 |
| **보안 PDF 지원 (비밀번호 잠금)** | 학원 기출문제지 일부가 비밀번호 보호됨 | PDF.js는 비밀번호 해제를 지원하나 이는 저작권/보안 우회 문제. 학원 자체 자료 배포 목적 파일에만 해당되더라도 법적 리스크 | 비밀번호 해제 없이 "잠긴 PDF는 지원하지 않습니다" 안내로 명확히 거부 |
| **PDF 전체 페이지 동시 파싱 (무제한)** | 교재 전체를 한 번에 올려서 모두 파싱하고 싶음 | Gemini API 비용: 1M 토큰 = $0.10 (Flash). 100페이지 PDF = 약 50K 토큰. 무제한 허용 시 API 비용 폭증. 긴 문서일수록 Gemini 정확도 하락 | 최대 50페이지/회로 제한. 페이지 범위 선택 UI로 강사가 필요한 부분만 선택 |
| **PDF 편집 (페이지 추가/삭제/재배열)** | 파싱 전 PDF를 앱 안에서 편집하고 싶음 | PDF 편집은 완전히 다른 제품 영역. PDF.js는 읽기 전용. 편집 SDK는 상용 라이선스 필요 (PSPDFKit, Foxit 등) | "PDF를 올리기 전에 편집해주세요" 안내. 추출된 문제는 앱 내 LaTeX 에디터로 수정 |

---

## Feature Dependencies — v4.0 PDF 2-Way

```
[PDF 업로드]
    └──triggers──> [Gemini Vision AI 파싱]
                       ├──outputs──> [추출 문제 목록 + 신뢰도 + bbox 좌표]
                       │                  └──feeds──> [검수/수정 UI]
                       │                                  └──on-confirm──> [DB 등록 (강사)]
                       │                                                       └──requires──> [기존 문제 DB 스키마]
                       │                                                       └──enhances──> [기존 AI 문제 추천 (BKT)]
                       └──outputs──> [bbox 좌표]
                                          └──feeds──> [PDF 뷰어 하이라이트 오버레이]

[PDF 뷰어 (react-pdf / PDF.js)]
    └──renders──> [PDF 캔버스 레이어]
                       └──overlaid-by──> [풀이 오버레이 (정답 가리기)]
                                              └──interacts-with──> [문제 카드 (양방향 네비게이션)]
                                              └──connects-to──> [즉석 문제 풀기]
                                                                     └──requires──> [기존 채점 엔진]
                                                                     └──feeds──> [기존 오답노트]

[앱 문제 DB (기존)]
    └──queries──> [PDF 내보내기]
                       ├──mode-시험지──> [@react-pdf/renderer + KaTeX→SVG→Image]
                       └──mode-학습지──> [@react-pdf/renderer + 해설 데이터]

[페이지 범위 선택]
    └──constrains──> [Gemini API 호출 범위] (비용 최적화)
```

### Dependency Notes

- **Gemini Vision이 전체 파싱 파이프라인의 핵심 의존성이다:** Gemini API 없이는 AI 파싱 기능 전체가 불가능. Gemini에 장애가 생기면 업로드→파싱 기능 전체 다운. 수동 입력 fallback 경로를 반드시 유지 (기존 LaTeX 에디터로 직접 등록).
- **KaTeX → SVG → Image 변환이 PDF 내보내기의 핵심 병목이다:** @react-pdf/renderer는 KaTeX HTML을 직접 지원하지 않음. KaTeX.renderToString()으로 SVG 생성 → Data URI 또는 Blob URL → Image 컴포넌트로 삽입하는 변환 레이어가 필수.
- **PDF 뷰어 + 하이라이트 오버레이는 Gemini bbox 좌표 정확도에 의존한다:** Gemini가 bbox 좌표를 잘못 추출하면 하이라이트가 엉뚱한 위치에 그려짐. bbox 없이도 동작하는 fallback (문제 번호 기반 텍스트 검색)이 필요.
- **즉석 문제 풀기는 기존 채점 엔진에 완전히 의존한다:** 새로운 채점 로직 없이 기존 채점 엔진을 PDF 뷰어 컨텍스트에서 재사용. 오답노트 자동 등록도 기존 로직 그대로.
- **강사용 DB 등록은 기존 문제 DB 스키마에 맞아야 한다:** AI 추출 결과를 기존 스키마 (과목/단원/유형/난이도/LaTeX/정답)에 매핑하는 변환 레이어 필요. 기존 BKT AI 추천 시스템이 새로 등록된 문제도 바로 활용 가능.

---

## MVP Definition — v4.0 PDF 2-Way

### Phase 1: PDF 업로드 + AI 파싱 (핵심 파이프라인)

런치 필수 — 이것 없으면 v4.0 자체가 없음.

- [ ] **PDF 파일 업로드 (drag-and-drop + 버튼)** — 파이프라인 진입점
- [ ] **Gemini 2.0 Flash API 연동 (PDF → 문제 JSON 추출)** — 핵심 AI 기능
- [ ] **AI 파싱 진행 상태 UI** — 사용자 경험 필수
- [ ] **추출 결과 검수/수정 UI (인라인 LaTeX 편집)** — AI 오류 수정 없인 실사용 불가
- [ ] **신뢰도 시각화 (빨간색 강조)** — 검수 효율 극대화
- [ ] **강사용 DB 등록 (검수 완료 문항 1-클릭 등록)** — 파이프라인 완성

### Phase 2: PDF 뷰어 + 풀이 오버레이

핵심 차별화 — 학생 UX의 메인.

- [ ] **PDF 뷰어 (react-pdf, 페이지 전환 + 줌)** — 뷰어 없으면 오버레이 없음
- [ ] **풀이 오버레이 (정답 가리기/보이기 토글)** — "iPad 시험지 느낌" 핵심
- [ ] **페이지 범위 선택 파싱** — Gemini API 비용 최적화

### Phase 3: PDF 내보내기

강사 출력물 니즈 충족.

- [ ] **시험지 스타일 PDF 내보내기 (@react-pdf/renderer + KaTeX→SVG)** — 강사 배포용
- [ ] **학습지 스타일 PDF 내보내기 (해설 포함)** — 학생 자습용

### Phase 4 이후 검증 후 추가 (v4.x)

- [ ] **PDF 뷰어 + 즉석 문제 풀기 (채점 엔진 연동)** — 뷰어와 채점 통합
- [ ] **양방향 PDF-문제카드 네비게이션 (bbox 기반)** — Gemini bbox 정확도 검증 후
- [ ] **문제 번호 자동 정렬 (2단 레이아웃 감지)** — 복잡한 레이아웃 PDF 대응

---

## Feature Prioritization Matrix — v4.0

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| PDF 파일 업로드 | HIGH | LOW | P1 |
| Gemini AI 파싱 (LaTeX 추출) | HIGH | HIGH | P1 |
| AI 파싱 진행 상태 UI | HIGH | LOW | P1 |
| 추출 결과 검수/수정 UI | HIGH | HIGH | P1 |
| 신뢰도 시각화 | HIGH | MEDIUM | P1 |
| 강사용 1-클릭 DB 등록 | HIGH | MEDIUM | P1 |
| PDF 뷰어 (기본) | HIGH | MEDIUM | P1 |
| 풀이 오버레이 (정답 가리기) | HIGH | MEDIUM | P1 |
| 페이지 범위 선택 | MEDIUM | MEDIUM | P1 |
| 시험지 스타일 PDF 내보내기 | HIGH | HIGH | P2 |
| 학습지 스타일 PDF 내보내기 | MEDIUM | HIGH | P2 |
| 즉석 문제 풀기 (뷰어 내 채점) | HIGH | HIGH | P2 |
| 양방향 PDF-문제카드 네비게이션 | MEDIUM | HIGH | P3 |
| 문제 번호 자동 정렬 (2단 레이아웃) | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: v4.0 출시 필수 (Phase 1-2에 분배)
- P2: v4.0 Phase 3-4 또는 v4.1
- P3: Gemini bbox 정확도 검증 후 결정

---

## Competitor Feature Analysis — PDF 학습 시스템

| Feature | 콴다 (QANDA) | Flexcil | Goodnotes | StudyPDF | v4.0 우리 앱 |
|---------|-------------|---------|-----------|----------|--------------|
| PDF 업로드 | O (카메라 촬영 위주) | O (PDF 직접) | O (PDF 직접) | O | O |
| AI 문제 추출 | O (카메라 OCR) | X | X | O (퀴즈 생성) | O (Gemini + LaTeX 변환) |
| 수식 LaTeX 변환 | 부분적 (이미지 처리) | X | X | X | O (핵심 차별화) |
| PDF 뷰어 | O | O (핵심) | O (핵심) | O | O |
| 정답 가리기 오버레이 | X | O (내용 가리기) | X | X | O |
| PDF 내보내기 | X | X | O (노트 내보내기) | X | O (시험지 + 학습지) |
| DB 자동 등록 | X | X | X | X | O (강사 전용 차별화) |
| 앱 채점 엔진 연동 | O (자체 채점) | X | X | X | O (기존 채점 엔진 재사용) |
| BKT 취약 분석 연동 | X | X | X | X | O (기존 BKT 자동 활용) |

**핵심 차별화 포인트:** 수식 LaTeX 변환 + DB 자동 등록 + BKT 취약 분석 연동. 단순 PDF 뷰어나 퀴즈 생성이 아니라 강사의 문제 DB 구축 파이프라인을 자동화하는 것이 이 앱의 고유한 포지션.

---

## Expected User Behaviors — PDF 기능 사용 시나리오

### 강사 시나리오 (주요)

1. 수능 기출문제지 PDF (30문제)를 앱에 업로드
2. 파싱 완료 후 검수 화면에서 Gemini가 틀린 수식 3개 빨간색으로 강조
3. 해당 수식 인라인 편집 (LaTeX 직접 수정)
4. "전체 등록" 클릭 → 문제 DB에 27개 자동 등록, 3개는 수동 처리 대기
5. 등록된 문제로 과제 출제 (기존 강사 포털 연동)

### 학생 시나리오 (PDF 뷰어)

1. 강사가 공유한 시험지 PDF를 앱 뷰어에서 열기
2. 문제별로 정답 영역이 흰 박스로 가려져 있음
3. 문제 스스로 풀고 → 박스 탭 → 정답 확인
4. 틀린 문제 → 자동 오답노트 추가

### 강사 시나리오 (PDF 내보내기)

1. 앱 문제 DB에서 원하는 단원 15문제 선택
2. "PDF 내보내기" → 시험지 스타일 선택
3. 헤더 정보(이름/날짜) 설정 → 다운로드
4. 인쇄 또는 학생에게 PDF로 공유

---

## Technical Constraints — v4.0 PDF 구현 시 주의사항

| 제약 | 내용 | 해결 방향 |
|------|------|-----------|
| Gemini API 비용 | $0.10/1M 입력 토큰. 100페이지 PDF ≈ 50K 토큰 ≈ $0.005. 무제한 허용 시 비용 폭증 | 페이지 범위 제한 (최대 50페이지/회) + 사용량 로깅 |
| Gemini 파일 크기 제한 | 최대 50MB, 1000페이지 | 파일 크기 검증 + 초과 시 명확한 안내 |
| @react-pdf/renderer + KaTeX | SVG Data URI 직접 지원 없음 | KaTeX.renderToString() → SVG → Blob URL or Base64 PNG 변환 레이어 필요 |
| POC 아키텍처 유지 | 현재 localStorage + IndexedDB 기반. 실제 파일 저장소(S3 등) 없음 | PDF 파일은 파싱 후 즉시 버림. 추출된 문제 JSON만 IndexedDB에 저장 |
| react-pdf bbox 좌표 → 오버레이 | PDF.js 좌표 시스템 (원점: 왼쪽 하단)과 DOM 좌표 시스템 (원점: 왼쪽 상단) 불일치 | 좌표 변환 공식 필수: `y_dom = page_height - (y_pdf + height)` |

---

## Sources — v4.0 PDF 2-Way

- Gemini API 문서 처리 공식 문서: https://ai.google.dev/gemini-api/docs/document-processing
- Gemini 2.0 Flash PDF 제한 (50MB/1000페이지): https://www.datastudios.org/post/google-gemini-pdf-uploading-pdf-reading-capabilities-text-extraction-accuracy-layout-support-and
- Gemini structured output (JSON Schema): https://ai.google.dev/gemini-api/docs/structured-output
- Gemini PDF structured extraction 실전 예시: https://www.philschmid.de/gemini-pdf-to-data
- react-pdf (wojtekmaj) PDF 뷰어: https://github.com/wojtekmaj/react-pdf
- PDF.js 레이어 구조 (Canvas/Text/Annotation): https://blog.react-pdf.dev/understanding-pdfjs-layers-and-how-to-use-them-in-reactjs
- react-pdf-highlighter 오버레이: https://github.com/agentcooper/react-pdf-highlighter
- @react-pdf/renderer SVG 지원: https://react-pdf.org/svg
- @react-pdf/renderer + SVG 차트 (react-pdf-charts): https://github.com/EvHaus/react-pdf-charts
- Human-in-the-loop AI 검수 UX: https://unstract.com/blog/human-in-the-loop-hitl-for-ai-document-processing/
- Mathpix Math OCR API (STEM 특화): https://mathpix.com/convert
- Mistral OCR (수식 포함 문서 이해): https://mistral.ai/news/mistral-ocr
- PDF generator JS 라이브러리 비교 2025: https://www.nutrient.io/blog/top-js-pdf-libraries/
- Goodnotes 인터랙티브 시험지 UX: https://support.goodnotes.com/hc/en-us/articles/6762959305615-Getting-Started-with-Interactive-Exam-Practice

---

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
*Feature research for: 고등학교 수학 기출문제 학습 웹앱 (PWA) — v3.0 게이미피케이션 "반전 모드" / v4.0 PDF 2-Way 학습 시스템*
*Researched: 2026-02-23 (v3.0) / 2026-02-24 (v4.0)*
