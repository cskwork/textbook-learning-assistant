/**
 * AI 추천 문제 목록 컴포넌트 (AIAN-03, AIAN-04)
 *
 * Props:
 *   questions: Question[]  — 추천 문제 목록
 *   isHeuristic: boolean   — true이면 "정답률 기반 추천" 배지, false이면 "AI(BKT) 추천" 배지
 *
 * UI:
 *   - 추천 모드 배지 (isHeuristic 여부)
 *   - 문제 카드 (최대 5개): content 앞 40자 + questionCategory + difficulty 별 표시 + "풀기" 링크
 *   - 빈 배열: 안내 메시지
 */

import { Link } from 'react-router'
import { Star, Brain } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LatexPreview } from '@/components/questions/LatexPreview'
import type { Question } from '@/lib/db'

interface AIRecommendationsProps {
  questions: Question[]
  isHeuristic: boolean
}

/** difficulty → 별 문자열 변환 */
function renderStars(difficulty: number): string {
  return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty)
}

export default function AIRecommendations({ questions, isHeuristic }: AIRecommendationsProps) {
  const displayQuestions = questions.slice(0, 5)

  return (
    <div className="space-y-3">
      {/* 추천 모드 배지 */}
      <div className="flex items-center gap-2">
        {isHeuristic ? (
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <Star className="h-3 w-3" />
            정답률 기반 추천
          </Badge>
        ) : (
          <Badge className="gap-1.5 text-xs bg-primary/10 text-primary border-primary/20">
            <Brain className="h-3 w-3" />
            AI(BKT) 추천
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">
          취약 유형 기반 맞춤 문제
        </span>
      </div>

      {/* 문제 목록 */}
      {displayQuestions.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              취약 유형 문제가 없습니다. 더 많은 문제를 풀어보세요!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {displayQuestions.map((question) => (
            <Card key={question.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  {/* 문제 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground line-clamp-1 mb-1.5">
                      <LatexPreview content={question.content.length > 60 ? question.content.slice(0, 60) + '...' : question.content} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs h-5 px-1.5">
                        {question.questionCategory}
                      </Badge>
                      <span className="text-xs text-orange-400 tracking-tight">
                        {renderStars(question.difficulty)}
                      </span>
                    </div>
                  </div>
                  {/* 풀기 버튼 */}
                  <Button asChild size="sm" variant="default" className="shrink-0 h-8 text-xs">
                    <Link to={`/student/quiz/${question.id}`}>풀기</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
