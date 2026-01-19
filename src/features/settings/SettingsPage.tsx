import { Button } from '@/components/ui/Button'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import type { Settings } from '@/types'

const themeOptions: { value: Settings['theme']; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

const weekStartOptions: { value: 0 | 1; label: string }[] = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
]

export function SettingsPage() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()

  const handleThemeChange = (theme: Settings['theme']) => {
    updateSettings.mutate({ theme })
  }

  const handleWeekStartChange = (weekStartsOn: 0 | 1) => {
    updateSettings.mutate({ weekStartsOn })
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
        Settings
      </h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Theme
          </h2>
          <div className="flex gap-2">
            {themeOptions.map(({ value, label }) => (
              <Button
                key={value}
                variant={settings?.theme === value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleThemeChange(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Week Starts On
          </h2>
          <div className="flex gap-2">
            {weekStartOptions.map(({ value, label }) => (
              <Button
                key={value}
                variant={settings?.weekStartsOn === value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleWeekStartChange(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
