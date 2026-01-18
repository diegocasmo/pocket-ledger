import { db } from './index'
import type { Settings } from '../types'

const DEFAULT_SETTINGS: Settings = {
  id: 'settings',
  weekStartsOn: 0,
  theme: 'system',
}

export async function getSettings(): Promise<Settings> {
  const settings = await db.settings.get('settings')
  if (!settings) {
    await db.settings.add(DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
  }
  return settings
}

export async function updateSettings(
  patch: Partial<Omit<Settings, 'id'>>
): Promise<Settings> {
  const current = await getSettings()
  const updated: Settings = { ...current, ...patch }
  await db.settings.put(updated)
  return updated
}
