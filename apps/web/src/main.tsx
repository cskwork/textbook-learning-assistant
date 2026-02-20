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
import { SettingsProvider } from './contexts/SettingsContext'
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner'
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
import WorkbooksPage from './routes/student/workbooks/index'
import CreateWorkbookPage from './routes/student/workbooks/create'
import WorkbookPlayPage from './routes/student/workbooks/play'
import OnboardingQuizPage from './routes/student/onboarding-quiz/index'
import AnalyticsPage from './routes/student/analytics/index'
import RoleRedirect from './routes/role-redirect'
import JoinGroupPage from './routes/student/join-group/index'
import GroupReportPage from './routes/instructor/groups/report'
import GroupListPage from './routes/instructor/groups/index'
import GroupNewPage from './routes/instructor/groups/new'
import GroupDetailPage from './routes/instructor/groups/detail'
import AssignWorkbookPage from './routes/instructor/groups/assign'
import StudentProfilePage from './routes/student/profile/index'
import InstructorProfilePage from './routes/instructor/profile/index'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <PWAInstallBanner />
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
            <Route path="/student/workbooks" element={<WorkbooksPage />} />
            <Route path="/student/workbooks/create" element={<CreateWorkbookPage />} />
            <Route path="/student/workbooks/:id/play" element={<WorkbookPlayPage />} />
            <Route path="/student/onboarding-quiz" element={<OnboardingQuizPage />} />
            <Route path="/student/analytics" element={<AnalyticsPage />} />
            <Route path="/student/join-group" element={<JoinGroupPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />

            {/* 강사 전용 라우트 */}
            <Route path="/instructor" element={<InstructorHomePage />} />
            <Route path="/instructor/problems" element={<InstructorProblemsPage />} />
            <Route path="/instructor/problems/new" element={<NewQuestionPage />} />
            <Route path="/instructor/problems/:id" element={<QuestionDetailPage />} />
            <Route path="/instructor/problems/:id/edit" element={<EditQuestionPage />} />
            <Route path="/instructor/students" element={<ComingSoonPage />} />
            <Route path="/instructor/profile" element={<InstructorProfilePage />} />
            {/* 강사 그룹 관리 라우트 */}
            <Route path="/instructor/groups" element={<GroupListPage />} />
            <Route path="/instructor/groups/new" element={<GroupNewPage />} />
            <Route path="/instructor/groups/:id/assign" element={<AssignWorkbookPage />} />
            <Route path="/instructor/groups/:id" element={<GroupDetailPage />} />
            <Route path="/instructor/groups/:id/report" element={<GroupReportPage />} />
          </Route>

          {/* 404 — 인덱스로 리디렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
