import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderWithRouter } from '@/test/setup'
import { AppLayout } from '@/components/layout/AppLayout'
import { ExpenseFormProvider } from '@/contexts/ExpenseFormContext'
import { db } from '@/db'
import type { Settings } from '@/types'

type PreferenceListener = (event: { matches: boolean }) => void

const originalMatchMedia = window.matchMedia
let listeners: PreferenceListener[] = []

// The shared setup mock always reports `matches: false`, so replace it per test
// to drive the system-preference branch and to capture the change listener.
function stubPrefersDark(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: prefersDark,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (_type: string, listener: PreferenceListener) => {
        listeners.push(listener)
      },
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

async function renderAppLayout(theme: Settings['theme']) {
  await db.settings.put({ id: 'settings', weekStartsOn: 0, theme })

  return renderWithRouter(
    <ExpenseFormProvider>
      <AppLayout>
        <div>Page content</div>
      </AppLayout>
    </ExpenseFormProvider>,
    { route: '/calendar' }
  )
}

describe('AppLayout', () => {
  beforeEach(() => {
    listeners = []
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    })
  })

  describe('theme class', () => {
    it('adds the dark class for the dark theme', async () => {
      stubPrefersDark(false)
      await renderAppLayout('dark')

      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark')
      })
    })

    it('removes the dark class for the light theme', async () => {
      stubPrefersDark(true)
      document.documentElement.classList.add('dark')
      await renderAppLayout('light')

      await waitFor(() => {
        expect(document.documentElement).not.toHaveClass('dark')
      })
    })

    it('follows the system preference for the system theme', async () => {
      stubPrefersDark(true)
      await renderAppLayout('system')

      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark')
      })
    })

    it('tracks system preference changes while on the system theme', async () => {
      stubPrefersDark(false)
      await renderAppLayout('system')

      await waitFor(() => {
        expect(listeners).toHaveLength(1)
      })

      listeners.forEach((listener) => listener({ matches: true }))
      expect(document.documentElement).toHaveClass('dark')

      listeners.forEach((listener) => listener({ matches: false }))
      expect(document.documentElement).not.toHaveClass('dark')
    })
  })
})
