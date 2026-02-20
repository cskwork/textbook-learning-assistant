# Phase 9: AI 문제 생성 보조 — Context

## 사용자 요구사항

- 새 문제 등록/수정 시 AI가 프롬프트에 따라 수식 포함 문제를 생성해주는 기능
- AI가 수학 문제를 만들어주는 보조 도구

## 기술 결정

- **모델:** `gemini-3-flash-preview` (Google Gemini API)
- **API 키:** 사용자가 Google AI Studio에서 발급한 키 사용
- **API 엔드포인트:** Google AI Studio (Generative Language API)

## 통합 위치

- 강사 문제 등록/수정 폼 (QuestionForm)
- AI 생성 버튼 → 프롬프트 입력 → Gemini API 호출 → 수식 포함 문제 텍스트 생성
