import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import { beforeEach, vi } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { db } from '@/db'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

beforeEach(async () => {
  await db.expenses.clear()
  await db.categories.clear()
  await db.settings.clear()
})

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function createWrapper() {
  const queryClient = createTestQueryClient()
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

export function renderWithClient(ui: React.ReactElement) {
  const queryClient = createTestQueryClient()
  return render(
    createElement(QueryClientProvider, { client: queryClient }, ui)
  )
}

export function renderWithRouter(
  ui: React.ReactElement,
  { route = '/' }: { route?: string } = {}
) {
  const queryClient = createTestQueryClient()
  return render(
    createElement(
      MemoryRouter,
      { initialEntries: [route] },
      createElement(QueryClientProvider, { client: queryClient }, ui)
    )
  )
}
