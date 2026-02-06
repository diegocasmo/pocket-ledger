import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/setup'
import { SettingsPage } from '@/features/settings/SettingsPage'

function renderSettingsPage() {
  return renderWithRouter(<SettingsPage />, { route: '/settings' })
}

describe('SettingsPage', () => {
  describe('rendering', () => {
    it('renders theme options', async () => {
      renderSettingsPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /system/i })).toBeInTheDocument()
      })
    })

    it('renders week start options', async () => {
      renderSettingsPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sunday/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /monday/i })).toBeInTheDocument()
      })
    })
  })

  describe('theme settings', () => {
    it('defaults to system theme', async () => {
      renderSettingsPage()

      await waitFor(() => {
        const systemButton = screen.getByRole('button', { name: /system/i })
        expect(systemButton).toHaveClass('bg-primary-500')
      })
    })

    it('changes to light theme when selected', async () => {
      const user = userEvent.setup()
      renderSettingsPage()

      const lightButton = await screen.findByRole('button', { name: /light/i })
      await user.click(lightButton)

      await waitFor(() => {
        expect(lightButton).toHaveClass('bg-primary-500')
      })
    })

    it('changes to dark theme when selected', async () => {
      const user = userEvent.setup()
      renderSettingsPage()

      const darkButton = await screen.findByRole('button', { name: /dark/i })
      await user.click(darkButton)

      await waitFor(() => {
        expect(darkButton).toHaveClass('bg-primary-500')
      })
    })
  })

  describe('week start settings', () => {
    it('defaults to Sunday', async () => {
      renderSettingsPage()

      await waitFor(() => {
        const sundayButton = screen.getByRole('button', { name: /sunday/i })
        expect(sundayButton).toHaveClass('bg-primary-500')
      })
    })

    it('changes to Monday when selected', async () => {
      const user = userEvent.setup()
      renderSettingsPage()

      const mondayButton = await screen.findByRole('button', { name: /monday/i })
      await user.click(mondayButton)

      await waitFor(() => {
        expect(mondayButton).toHaveClass('bg-primary-500')
      })
    })

    it('persists week start setting when changed', async () => {
      const user = userEvent.setup()

      // First render - change to Monday
      const { unmount } = renderSettingsPage()

      const mondayButton = await screen.findByRole('button', { name: /monday/i })
      await user.click(mondayButton)

      await waitFor(() => {
        expect(mondayButton).toHaveClass('bg-primary-500')
      })

      // Unmount and remount to verify persistence
      unmount()

      renderSettingsPage()

      await waitFor(() => {
        const mondayButtonAgain = screen.getByRole('button', { name: /monday/i })
        expect(mondayButtonAgain).toHaveClass('bg-primary-500')
      })
    })
  })
})
