/**
 * 앱 진입점
 *
 * 라우트 구조:
 * - 공개 라우트: /login, /register (AuthContext로 보호 — 로그인 상태면 홈으로)
 * - 온보딩 라우트: /onboarding (AuthContext에서 직접 처리)
 * - 보호 라우트: / 이하 (_layout.tsx가 인증+온보딩 완료 확인)
 *   - /student/* (학생 전용)
 *   - /instructor/* (강사 전용)
 * - 역할별 루트(/): 인증된 사용자를 역할별 홈으로 리디렉트
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import './index.css'

import { AuthProvider } from './contexts/AuthContext'
import PublicRoute from './routes/public-route'
import Layout from './routes/_layout'
import LoginPage from './routes/login'
import RegisterPage from './routes/register'
import OnboardingPage from './routes/onboarding'
import StudentHomePage from './routes/student/index'
import InstructorHomePage from './routes/instructor/index'
import InstructorProblemsPage from './routes/instructor/problems/index'
import NewQuestionPage from './routes/instructor/problems/new'
import QuestionDetailPage from './routes/instructor/problems/detail'
import EditQuestionPage from './routes/instructor/problems/edit'
import ComingSoonPage from './routes/coming-soon'
import StudentProblemsPage from './routes/student/problems/index'
import QuizPage from './routes/student/quiz/index'
import WrongNotesPage from './routes/student/wrong-notes/index'
import RoleRedirect from './routes/role-redirect'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 공개 라우트: 비인증 사용자만 접근 */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* 온보딩 라우트: 인증 필요, 온보딩 완료 전 */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* 보호 라우트: 인증 + 온보딩 완료 필요 */}
          <Route element={<Layout />}>
            {/* 루트 경로: 역할에 따라 리디렉트 */}
            <Route index element={<RoleRedirect />} />

            {/* 학생 전용 라우트 */}
            <Route path="/student" element={<StudentHomePage />} />
            <Route path="/student/problems" element={<StudentProblemsPage />} />
            <Route path="/student/quiz/:id" element={<QuizPage />} />
            <Route path="/student/wrong-notes" element={<WrongNotesPage />} />
            <Route path="/student/profile" element={<ComingSoonPage />} />

            {/* 강사 전용 라우트 */}
            <Route path="/instructor" element={<InstructorHomePage />} />
            <Route path="/instructor/problems" element={<InstructorProblemsPage />} />
            <Route path="/instructor/problems/new" element={<NewQuestionPage />} />
            <Route path="/instructor/problems/:id" element={<QuestionDetailPage />} />
            <Route path="/instructor/problems/:id/edit" element={<EditQuestionPage />} />
            <Route path="/instructor/students" element={<ComingSoonPage />} />
            <Route path="/instructor/profile" element={<ComingSoonPage />} />
          </Route>

          {/* 404 — 인덱스로 리디렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
