import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import { beforeEach } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { db } from '../db'

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
