import { useSettings, useUpdateSettings } from './useSettings'
import type { ThemeOption } from '../types'

export function useTheme() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()

  const theme = settings?.theme ?? 'system'

  const setTheme = (newTheme: ThemeOption) => {
    updateSettings.mutate({ theme: newTheme })
  }

  return { theme, setTheme }
}
