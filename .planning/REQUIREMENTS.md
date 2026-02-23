# Requirements: 수학 기출 학습 도우미

**Defined:** 2026-02-24
**Core Value:** 학생이 자신의 취약한 수학 유형을 정확히 파악하고, AI가 추천하는 맞춤 문제를 통해 효율적으로 실력을 향상시킬 수 있어야 한다

## v4.0 Requirements

v4.0 PDF 2-Way 학습 시스템. PDF ↔ 앱 양방향 연동.
**접근:** POC 우선 — DB 없이 Vercel static+serverless로 검증. DB 등록은 후속.

### UPLOAD (PDF 업로드 & AI 파싱)

- [ ] **UPLOAD-01**: 사용자가 PDF 파일을 드래그앤드롭 또는 버튼 클릭으로 업로드할 수 있다 (최대 50MB, PDF만 허용)
- [ ] **UPLOAD-02**: Gemini Vision AI가 PDF에서 수학 문제를 자동 추출하고 수식을 LaTeX로 변환한다
- [ ] **UPLOAD-03**: AI 파싱 진행 상태가 단계별로 표시된다 (PDF 분석 중 → 문제 추출 중 → 검수 준비 완료)
- [ ] **UPLOAD-04**: AI 추출 결과에 문항별 신뢰도가 시각화된다 (70% 미만 빨간색 강조)
- [ ] **UPLOAD-05**: 강사가 파싱할 페이지 범위를 선택할 수 있다
- [ ] **UPLOAD-06**: 추출된 문제가 문제 번호 순서대로 자동 정렬된다
- [ ] **UPLOAD-07**: 파싱 실패 시 명확한 오류 메시지와 수동 입력 fallback이 안내된다

### REVIEW (강사 검수)

- [ ] **REVIEW-01**: 강사가 AI 추출 결과를 인라인 LaTeX 편집으로 검수/수정할 수 있다

### VIEWER (PDF 뷰어 & 오버레이)

- [ ] **VIEWER-01**: 앱 내에서 PDF를 렌더링하고 페이지 전환, 줌 인/아웃이 가능하다
- [ ] **VIEWER-02**: PDF 위에 정답 영역을 가리는 풀이 오버레이가 동작한다 (탭으로 보이기/가리기 토글)
- [ ] **VIEWER-03**: PDF 뷰어에서 문제를 바로 풀고 채점할 수 있다 (기존 채점 엔진 연동)
- [ ] **VIEWER-04**: PDF 문제 ↔ 앱 문제카드 양방향 네비게이션이 가능하다 (bbox 기반)

### EXPORT (PDF 내보내기)

- [ ] **EXPORT-01**: 선택한 문제를 시험지 스타일 PDF로 내보낼 수 있다 (A4, 헤더, 수식 렌더링)
- [ ] **EXPORT-02**: 선택한 문제를 학습지 스타일 PDF로 내보낼 수 있다 (해설 포함)

### DB-REG (DB 연동 — POC 이후)

- [ ] **DB-REG-01**: 강사가 검수 완료된 문항을 1-클릭으로 기존 문제 DB에 등록할 수 있다
- [ ] **DB-REG-02**: 등록 시 과목/단원/유형이 자동 분류 제안되고 강사가 확인/수정할 수 있다

## v5.0+ Requirements

다음 마일스톤 이후로 연기된 기능. 현재 로드맵에 포함되지 않음.

### PDF 고급

- **PDF-ADV-01**: 손글씨 시험지 OCR 파싱 (별도 HWR 모델 연구 필요)
- **PDF-ADV-02**: PDF 뷰어 내 Apple Pencil/펜 필기 입력
- **PDF-ADV-03**: 서버사이드 PDF 처리 프록시 (Gemini API 키 보호)
- **PDF-ADV-04**: DOCX/HWP 파일 지원

## Out of Scope

v4.0에서 명시적으로 제외된 기능.

| Feature | Reason |
|---------|--------|
| 손글씨 필기 OCR | 수식 OCR 정확도 현저히 낮음, 별도 HWR 모델 필요 (v5.0 이후) |
| 실시간 PDF 스트리밍 뷰어 | PDF.js 내부 렌더러 커스터마이징 유지보수 비용 과다 |
| PDF 내 자유 필기/펜 입력 | Canvas 동기화 + 저장 + 내보내기 = 별도 제품 수준 복잡도 |
| 서버사이드 PDF 렌더링 (Puppeteer) | POC 아키텍처(클라이언트 사이드) 완전 위반 |
| 보안 PDF 지원 (비밀번호 잠금) | 저작권/보안 우회 법적 리스크 |
| PDF 무제한 페이지 동시 파싱 | Gemini API 비용 폭증 + 정확도 하락. 최대 50페이지/회 제한 |
| PDF 편집 (페이지 추가/삭제/재배열) | 완전 다른 제품 영역, PDF 편집 SDK는 상용 라이선스 필요 |

## Traceability

요구사항 ↔ Phase 매핑.

| Requirement | Phase | Status |
|-------------|-------|--------|
| UPLOAD-01 | Phase 22 | Pending |
| UPLOAD-02 | Phase 22 | Pending |
| UPLOAD-03 | Phase 22 | Pending |
| UPLOAD-04 | Phase 23 | Pending |
| UPLOAD-05 | Phase 22 | Pending |
| UPLOAD-06 | Phase 22 | Pending |
| UPLOAD-07 | Phase 22 | Pending |
| REVIEW-01 | Phase 23 | Pending |
| VIEWER-01 | Phase 21 | Pending |
| VIEWER-02 | Phase 25 | Pending |
| VIEWER-03 | Phase 25 | Pending |
| VIEWER-04 | Phase 25 | Pending |
| EXPORT-01 | Phase 24 | Pending |
| EXPORT-02 | Phase 24 | Pending |
| DB-REG-01 | Phase 26 | Pending |
| DB-REG-02 | Phase 26 | Pending |

**Coverage:**
- v4.0 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0

---
*Requirements defined: 2026-02-24*
*Last updated: 2026-02-24 after v4.0 로드맵 생성 완료 (Phase 21-26)*
