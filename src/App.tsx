import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'

const CalendarPage = lazy(() => import('@/features/calendar/CalendarPage'))
const InsightsPage = lazy(() => import('@/features/insights/InsightsPage'))
const CategoriesPage = lazy(() => import('@/features/categories/CategoriesPage'))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="animate-pulse text-[var(--color-text-secondary)]">Loading...</div>
    </div>
  )
}

function App() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/calendar" replace />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </AppLayout>
  )
}

export default App
