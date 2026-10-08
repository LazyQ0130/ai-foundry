import { Link, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Admin from './pages/Admin'
import CourseCatalog from './pages/CourseCatalog'
import CourseGuide from './pages/CourseGuide'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import LearningPath from './pages/LearningPath'
import LessonPage from './pages/LessonPage'
import Pricing from './pages/Pricing'
import ProjectPage from './pages/ProjectPage'
import ProjectsPage from './pages/ProjectsPage'
import StagePage from './pages/StagePage'
import AuthPage from './pages/AuthPage'
import { RequireAuth } from './auth/AuthProvider'
import AccountPage from './pages/AccountPage'
import AboutPage from './pages/AboutPage'
import CapstoneLessonPage from './pages/CapstoneLessonPage'
import CapstoneOverview from './pages/CapstoneOverview'
import FaqPage from './pages/FaqPage'
import EmailSecurity from './components/EmailSecurity'
import PolicyPage from './pages/PolicyPage'
import { LearningBoundary } from './data/progress'

function NotFound() {
  return (
    <div className="shell py-28 text-center">
      <p className="text-[13px] font-semibold tracking-widest text-brand-600">404</p>
      <h1 className="mt-3 text-[26px] font-bold tracking-tight text-slate-900">这个页面还没有搭好</h1>
      <p className="mt-3 text-[13.5px] text-slate-500">
        你可以返回首页，或从学习路径找到想了解的课程。
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Link to="/" className="btn btn-lg btn-primary">
          返回首页
        </Link>
        <Link to="/path" className="btn btn-lg btn-outline">
          查看学习路径
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="admin" element={<Navigate to="/admin/users" replace />} />
      <Route path="admin/:section" element={<RequireAuth admin><Admin /></RequireAuth>} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="guide" element={<CourseGuide />} />
        <Route path="capstone" element={<CapstoneOverview />} />
        <Route path="capstone/lessons/:lessonId" element={<RequireAuth><CapstoneLessonPage /></RequireAuth>} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="privacy" element={<PolicyPage kind="privacy" />} />
        <Route path="terms" element={<PolicyPage kind="terms" />} />
        <Route path="forgot-password" element={<section className="shell py-16"><div className="mx-auto max-w-md"><EmailSecurity reset /></div></section>} />
        <Route path="path" element={<LearningBoundary><LearningPath /></LearningBoundary>} />
        <Route path="login" element={<AuthPage />} />
        <Route path="register" element={<AuthPage register />} />
        <Route path="account" element={<RequireAuth><AccountPage /></RequireAuth>} />
        <Route path="dashboard" element={<RequireAuth><LearningBoundary><Dashboard /></LearningBoundary></RequireAuth>} />
        <Route path="courses" element={<LearningBoundary><CourseCatalog /></LearningBoundary>} />
        <Route path="projects" element={<LearningBoundary><ProjectsPage /></LearningBoundary>} />
        <Route path="project/:id" element={<LearningBoundary><ProjectPage /></LearningBoundary>} />
        <Route path="stage/:slug" element={<LearningBoundary><StagePage /></LearningBoundary>} />
        <Route path="lesson/:stageSlug/:lessonId" element={<LearningBoundary><LessonPage /></LearningBoundary>} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
