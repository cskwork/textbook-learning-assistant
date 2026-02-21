/**
 * 학생 홈 배너 Swiper 슬라이더
 *
 * 3종 슬라이드:
 *   1. AI 추천 — 맞춤 추천 문제 수 표시 + "추천 문제 풀기" CTA
 *   2. 오답 복습 — 오답 수 표시 + "오답노트 가기" CTA
 *   3. 학습 팁 — 동기부여 메시지
 *
 * Swiper pagination 커스텀: .swiper-pagination-bullet-active { bg-primary }
 */

import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { Sparkles, AlertTriangle, BookOpen, ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import type { Question } from '@/lib/db'

interface HomeBannerSwiperProps {
  /** AI 추천 문제 목록 */
  recommendedQuestions: Question[]
  /** 오답노트 문제 수 */
  wrongNoteCount: number
  /** 휴리스틱 추천 여부 (학습 데이터 부족) */
  isHeuristic: boolean
}

export function HomeBannerSwiper({
  recommendedQuestions,
  wrongNoteCount,
  isHeuristic,
}: HomeBannerSwiperProps) {
  return (
    <Swiper
      spaceBetween={16}
      slidesPerView={1}
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000, disableOnInteraction: true }}
      modules={[Pagination, Autoplay]}
      className="home-banner-swiper !pb-7"
    >
      {/* ── 슬라이드 1: AI 추천 ── */}
      <SwiperSlide>
        <div className="cta-gradient rounded-2xl text-white relative overflow-hidden">
          {/* 데코 서클 */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-sm pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative p-6 flex flex-col gap-3">
            {/* 헤더 */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white/70 uppercase tracking-widest">AI 맞춤 추천</p>
                {recommendedQuestions.length > 0 ? (
                  <p className="text-base font-bold leading-snug">
                    {isHeuristic ? '기본 추천' : 'AI 추천'} {recommendedQuestions.length}문제가 준비됐어요
                  </p>
                ) : (
                  <p className="text-base font-bold leading-snug">
                    문제를 더 풀면 AI가 맞춤 추천해요
                  </p>
                )}
              </div>
            </div>

            {/* CTA */}
            <Button
              asChild
              size="sm"
              className="w-fit bg-white text-primary hover:bg-white/90 font-semibold rounded-xl shadow-md h-9 px-4"
            >
              <Link to="/student/problems">
                추천 문제 풀기
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </SwiperSlide>

      {/* ── 슬라이드 2: 오답 복습 ── */}
      <SwiperSlide>
        <div className="bg-gradient-to-br from-rose-500 to-orange-400 rounded-2xl text-white relative overflow-hidden">
          {/* 데코 서클 */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-sm pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative p-6 flex flex-col gap-3">
            {/* 헤더 */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white/70 uppercase tracking-widest">오답 복습</p>
                {wrongNoteCount > 0 ? (
                  <p className="text-base font-bold leading-snug">
                    틀린 문제 {wrongNoteCount}개 복습하기
                  </p>
                ) : (
                  <p className="text-base font-bold leading-snug">
                    오답이 없어요! 완벽해요 🎉
                  </p>
                )}
              </div>
            </div>

            {/* CTA */}
            <Button
              asChild
              size="sm"
              className="w-fit bg-white text-rose-600 hover:bg-white/90 font-semibold rounded-xl shadow-md h-9 px-4"
            >
              <Link to="/student/wrong-notes">
                오답노트 가기
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </SwiperSlide>

      {/* ── 슬라이드 3: 학습 팁 ── */}
      <SwiperSlide>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl text-white relative overflow-hidden">
          {/* 데코 서클 */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-sm pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative p-6 flex flex-col gap-3">
            {/* 헤더 */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white/70 uppercase tracking-widest">학습 팁</p>
                <p className="text-base font-bold leading-snug">
                  매일 10문제씩 풀면 한 달에 300문제!
                </p>
              </div>
            </div>

            {/* 부연 설명 */}
            <p className="text-sm text-white/80 leading-relaxed">
              꾸준한 반복 학습이 수학 실력 향상의 핵심이에요.
            </p>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  )
}
