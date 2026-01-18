import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { CalendarPage } from './features/calendar/CalendarPage'
import { InsightsPage } from './features/insights/InsightsPage'
import { SettingsPage } from './features/settings/SettingsPage'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppLayout>
  )
}

export default App
