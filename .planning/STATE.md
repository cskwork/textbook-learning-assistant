# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-24)

**핵심 가치:** 학생이 자신의 취약한 수학 유형을 정확히 파악하고, AI가 추천하는 맞춤 문제를 통해 효율적으로 실력을 향상시킬 수 있어야 한다
**현재 집중:** v4.0 PDF 2-Way 학습 시스템 — Phase 21 (Vercel 인프라 + PDF 뷰어 기반)

## Current Position

Phase: 21 of 26 (Vercel 인프라 + PDF 뷰어 기반)
Plan: 0 of 3 in current phase
Status: Ready to plan
Last activity: 2026-02-24 — v4.0 로드맵 생성 완료

Progress: [░░░░░░░░░░] 0% (v4.0 기준)

## Performance Metrics

| 마일스톤 | Phases | Plans | 상태 |
|---------|--------|-------|------|
| v1.0 MVP | 9 | 38 | 완료 |
| v2.0 디자인 리뉴얼 | 5 | 21 | 완료 |
| v3.0 반전 모드 | 6 | 22 | 완료 |
| v4.0 PDF 2-Way | 6 | 17 | 시작 전 |

## Accumulated Context

### Decisions

- **POC 우선 (2026-02-24):** DB 없이 Vercel static+serverless로 핵심 파이프라인 검증 먼저
- **Vercel serverless (2026-02-24):** Gemini API 키 서버사이드 보호 + 프론트엔드 동일 배포
- **메모리 상태만 (2026-02-24):** Dexie/IndexedDB 스킵, DB 없이 Phase 21-25 진행. DB 연동은 Phase 26
- **Phase 24 병렬 가능 (2026-02-24):** PDF 내보내기는 Phase 22/23과 독립. Phase 21 완료 후 병렬 진행 가능

### Blockers/Concerns

- Gemini Files API CORS 브라우저 호환성 — Phase 22 첫 번째 검증 과제 (차단 시 Vercel serverless 프록시 필요)
- iOS Safari PDF.js 호환성 — Phase 21 실기기 검증 필수 (에뮬레이터 재현 불가)
- Gemini bbox 좌표 정확도 — Phase 25 구현 전 Phase 22 파싱 결과로 검증 필요
- R3F v9 peer dep `react: ">=19 <19.3"` — React 19.3 릴리즈 시 즉시 재검토

### Pending Todos

None yet.

## Session Continuity

Last session: 2026-02-24
Stopped at: v4.0 로드맵 생성 완료
Resume file: None
Next command: /gsd:plan-phase 21
