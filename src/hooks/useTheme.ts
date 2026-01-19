import { useSettings, useUpdateSettings } from './useSettings'
import type { Settings } from '../types'

export function useTheme() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()

  const theme = settings?.theme ?? 'system'

  const setTheme = (newTheme: Settings['theme']) => {
    updateSettings.mutate({ theme: newTheme })
  }

  return { theme, setTheme }
}
