import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ExpenseFormProvider } from '@/contexts/ExpenseFormContext'

const CalendarPage = lazy(() => import('@/features/calendar/CalendarPage'))
const InsightsPage = lazy(() => import('@/features/insights/InsightsPage'))
const CategoriesPage = lazy(() => import('@/features/categories/CategoriesPage'))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))
const ExpensePage = lazy(() => import('@/features/expenses/ExpensePage'))
const CategoryFormPage = lazy(() => import('@/features/categories/CategoryFormPage'))
const CategoryPickerPage = lazy(() => import('@/features/categories/CategoryPickerPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="animate-pulse text-[var(--color-text-secondary)]">Loading...</div>
    </div>
  )
}

function App() {
  return (
    <ExpenseFormProvider>
      <AppLayout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/calendar" replace />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/new" element={<CategoryFormPage />} />
            <Route path="/categories/:id" element={<CategoryFormPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/expenses/new" element={<ExpensePage />} />
            <Route path="/expenses/new/category" element={<CategoryPickerPage />} />
            <Route path="/expenses/:id" element={<ExpensePage />} />
            <Route path="/expenses/:id/category" element={<CategoryPickerPage />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </ExpenseFormProvider>
  )
}

export default App
