// apps/web/src/services/gemini.service.ts
// Gemini API 호출 서비스 — 수학 문제 AI 생성 (Phase 9 — AIGEN-01, AIGEN-03)

import { GoogleGenAI } from '@google/genai'

/**
 * AI가 생성한 수학 문제 구조체
 * content/answer/explanation은 KaTeX 호환 LaTeX 포함 가능
 */
export interface GeneratedQuestion {
  content: string           // 문제 본문 (LaTeX $...$ 또는 $$...$$ 형식)
  answer: string            // 객관식: '1'~'5', 단답형: 숫자 문자열
  explanation: string       // 단계별 해설 (LaTeX 포함)
  questionType: 'multiple' | 'short'
  difficulty: 1 | 2 | 3 | 4 | 5
}

/**
 * Gemini API 응답 JSON 스키마
 * responseMimeType: 'application/json' + responseJsonSchema 조합으로 구조화된 출력 강제
 */
const MATH_QUESTION_SCHEMA = {
  type: 'object',
  properties: {
    content: {
      type: 'string',
      description: '수학 문제 본문 (LaTeX $...$ 또는 $$...$$ 형식)',
    },
    answer: {
      type: 'string',
      description: '객관식은 정답 번호 문자열 1~5, 단답형은 숫자 문자열',
    },
    explanation: {
      type: 'string',
      description: '단계별 풀이 과정 (한국어 + LaTeX)',
    },
    questionType: {
      type: 'string',
      enum: ['multiple', 'short'],
      description: '문제 유형: multiple(객관식 5지선다), short(단답형)',
    },
    difficulty: {
      type: 'integer',
      minimum: 1,
      maximum: 5,
      description: '난이도 1(최하)~5(최상)',
    },
  },
  required: ['content', 'answer', 'explanation', 'questionType', 'difficulty'],
}

/**
 * 시스템 프롬프트 — 한국 수학 교사 역할, KaTeX 호환 LaTeX 규칙 명시
 */
const SYSTEM_PROMPT = `당신은 한국 수학 교사입니다. 수능/내신 수준의 수학 문제를 출제합니다.
규칙:
- 모든 수식은 KaTeX 호환 LaTeX 사용: 인라인은 $...$, 블록은 $$...$$
- 객관식(multiple)은 5지선다로 작성, answer는 정답 번호 문자열 '1'~'5'
- 단답형(short)은 answer는 숫자 문자열
- explanation은 단계별 풀이 과정을 한국어로 작성`

/**
 * Gemini API를 호출하여 수학 문제를 생성한다.
 *
 * @param apiKey - Google AI Studio에서 발급한 Gemini API 키
 * @param userPrompt - 사용자가 입력한 문제 생성 프롬프트 (단원, 유형, 난이도 등)
 * @returns 구조화된 수학 문제 (GeneratedQuestion)
 * @throws API 키 미설정 시 즉시 에러, 빈 응답 시 에러
 *
 * 모델: gemini-3-flash-preview (CONTEXT.md 결정)
 * 접근 불가(404/403) 시 아래 주석의 fallback 모델로 교체:
 * // fallback: 'gemini-2.5-flash'
 */
export async function generateMathQuestion(
  apiKey: string,
  userPrompt: string,
): Promise<GeneratedQuestion> {
  // API 키 검증 — 비어있으면 즉시 에러, API 호출 발생하지 않음
  if (!apiKey.trim()) {
    throw new Error('Gemini API 키가 설정되지 않았습니다')
  }

  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // gemini-3-flash-preview 접근 불가 시 fallback: 'gemini-2.5-flash'
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: MATH_QUESTION_SCHEMA,
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  })

  if (!response.text) {
    throw new Error('AI 응답이 비어 있습니다. 프롬프트를 수정하거나 다시 시도하세요.')
  }

  return JSON.parse(response.text) as GeneratedQuestion
}
