import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import Admin from './pages/Admin'
import CourseCatalog from './pages/CourseCatalog'
import CourseGuide from './pages/CourseGuide'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import LessonPage from './pages/LessonPage'
import Pricing from './pages/Pricing'
import ProjectPage from './pages/ProjectPage'
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

const CapstonePreview = lazy(() => import('./pages/CapstonePreview'))
const Environment = lazy(() => import('./pages/Environment.js'))

function NotFound() {
  return (
    <div className="shell py-28 text-center">
      <p className="text-[13px] font-semibold tracking-widest text-brand-600">404</p>
      <h1 className="mt-3 text-[26px] font-bold tracking-tight text-slate-900">这个页面还没有搭好</h1>
      <p className="mt-3 text-[13.5px] text-slate-500">
        你可以返回首页，或从课程页找到想了解的内容。
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Link to="/" className="btn btn-lg btn-primary">
          返回首页
        </Link>
        <Link to="/courses" className="btn btn-lg btn-outline">
          查看全部课程
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
        <Route path="environment" element={<Suspense fallback={<p className="shell py-12">正在加载环境说明…</p>}><Environment /></Suspense>} />
        <Route path="capstone" element={<CapstoneOverview />} />
        <Route path="capstone/preview/c1" element={<Suspense fallback={<p role="status" className="shell py-12">正在加载免费节选…</p>}><CapstonePreview /></Suspense>} />
        <Route path="capstone/lessons/:lessonId" element={<RequireAuth><CapstoneLessonPage /></RequireAuth>} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="privacy" element={<PolicyPage kind="privacy" />} />
        <Route path="terms" element={<PolicyPage kind="terms" />} />
        <Route path="forgot-password" element={<section className="shell py-16"><div className="mx-auto max-w-md"><EmailSecurity reset /></div></section>} />
        {/* 学习路径 / 项目实战 已合并进「课程」页；旧地址保留跳转。 */}
        <Route path="path" element={<Navigate to="/courses" replace />} />
        <Route path="login" element={<AuthPage />} />
        <Route path="register" element={<AuthPage register />} />
        <Route path="account" element={<RequireAuth><AccountPage /></RequireAuth>} />
        <Route path="dashboard" element={<RequireAuth><LearningBoundary><Dashboard /></LearningBoundary></RequireAuth>} />
        <Route path="courses" element={<LearningBoundary><CourseCatalog /></LearningBoundary>} />
        <Route path="projects" element={<Navigate to="/courses#projects" replace />} />
        <Route path="project/:id" element={<LearningBoundary><ProjectPage /></LearningBoundary>} />
        <Route path="stage/:slug" element={<LearningBoundary><StagePage /></LearningBoundary>} />
        <Route path="lesson/:stageSlug/:lessonId" element={<LearningBoundary><LessonPage /></LearningBoundary>} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
