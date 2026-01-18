import { describe, it, expect } from 'vitest'
import { db } from './index'
import { getSettings, updateSettings } from './settingsRepo'

describe('settingsRepo', () => {
  describe('getSettings', () => {
    it('creates default settings on first call', async () => {
      const settings = await getSettings()
      expect(settings.id).toBe('settings')
      expect(settings.weekStartsOn).toBe(0)
      expect(settings.theme).toBe('system')
    })

    it('persists default settings to database', async () => {
      await getSettings()
      const stored = await db.settings.get('settings')
      expect(stored).toBeDefined()
      expect(stored?.weekStartsOn).toBe(0)
    })

    it('returns existing settings without creating duplicates', async () => {
      // First call creates defaults
      await getSettings()
      // Modify settings
      await db.settings.update('settings', { theme: 'dark' })
      // Second call should return modified settings
      const settings = await getSettings()
      expect(settings.theme).toBe('dark')
      // Verify only one settings record exists
      const count = await db.settings.count()
      expect(count).toBe(1)
    })
  })

  describe('updateSettings', () => {
    it('merges partial updates', async () => {
      // Initialize with defaults
      await getSettings()
      // Update only theme
      const updated = await updateSettings({ theme: 'dark' })
      expect(updated.theme).toBe('dark')
      expect(updated.weekStartsOn).toBe(0) // Original value preserved
    })

    it('can update weekStartsOn', async () => {
      await getSettings()
      const updated = await updateSettings({ weekStartsOn: 1 })
      expect(updated.weekStartsOn).toBe(1)
      expect(updated.theme).toBe('system') // Original value preserved
    })

    it('can update multiple fields at once', async () => {
      await getSettings()
      const updated = await updateSettings({ theme: 'light', weekStartsOn: 1 })
      expect(updated.theme).toBe('light')
      expect(updated.weekStartsOn).toBe(1)
    })

    it('persists updates to database', async () => {
      await getSettings()
      await updateSettings({ theme: 'dark' })
      const stored = await db.settings.get('settings')
      expect(stored?.theme).toBe('dark')
    })
  })
})
