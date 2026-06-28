# AGENTS.md — Pocket Ledger

Guide for AI agents and developers working in this repo.

**This file documents what the code can't tell you at a glance — architecture, conventions, and the "why" — and points to source instead of copying it.** Pasted code drifts out of sync and misleads; a `file` + symbol pointer doesn't. Read the cited file for current detail. See [Keeping this file useful](#keeping-this-file-useful) before adding to it.

## Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Conventions](#conventions)
- [State Management](#state-management)
- [Data Layer](#data-layer)
- [Routing](#routing)
- [Forms & Validation](#forms--validation)
- [Components](#components)
- [PWA](#pwa)
- [Testing](#testing)
- [Development](#development)
- [Keeping this file useful](#keeping-this-file-useful)

---

## Overview

Pocket Ledger is an **offline-first, mobile-first PWA** for tracking expenses by category. All data lives locally in IndexedDB — there is **no backend and no network data calls**. Strict TypeScript, light/dark themes, installable.

## Architecture

Five layers, presentation → storage:

1. **Presentation** — `src/features/` (calendar, expenses, categories, insights, settings) + `src/components/` (`ui/` primitives, `layout/`, `pwa/`).
2. **State** — `src/hooks/` (React Query) + `src/contexts/` (form-draft session state). See [State Management](#state-management).
3. **Business logic** — `src/services/` (pure functions: `money.ts`, `aggregation.ts`).
4. **Data access** — `src/db/` (Dexie/IndexedDB repositories, one per entity).
5. **Utilities** — `src/lib/dates.ts`.

**Write data flow:** component handler → React Query mutation (`src/hooks/`) → repository (`src/db/`) → Dexie/IndexedDB → on success, invalidate query cache → refetch → re-render.

## Tech Stack

| Area | Stack (major.minor) |
|---|---|
| UI / build | React 19.2, TypeScript 5.9, Vite 8.0, Tailwind 4.3 |
| Routing | React Router 7.18 |
| Data | TanStack Query 5.101, Dexie 4.4 (IndexedDB) |
| Forms | React Hook Form 7.80, Zod 4.4, `@hookform/resolvers` |
| UI libs | Radix UI (Dialog), lucide-react, react-hot-toast, react-currency-input-field |
| PWA | vite-plugin-pwa 1.3 (Workbox) |
| Testing | Vitest 4.1, React Testing Library 16.3, fake-indexeddb 6.2, jsdom |

Authoritative versions: `package.json`. These minors are Dependabot-bumped frequently — don't treat them as exact.

## Project Structure

```
src/
├── components/
│   ├── ui/         # presentational primitives (Button, Input, Dialog, AmountInput, …)
│   ├── layout/     # AppLayout, BottomNav, PageHeader, CalendarContext
│   └── pwa/        # UpdatePrompt
├── features/       # domain modules: calendar, expenses, categories, insights, settings
├── db/             # Dexie setup (index.ts) + repositories (expensesRepo, categoriesRepo, settingsRepo)
├── hooks/          # React Query hooks + utility hooks
├── contexts/       # ExpenseFormContext (form-draft persistence)
├── services/       # pure business logic (money.ts, aggregation.ts)
├── lib/            # dates.ts
├── types/          # index.ts — all domain types
├── constants/      # colors.ts
├── test/           # setup.ts — Vitest global setup + render helpers
├── App.tsx         # routes
└── main.tsx        # entry: BrowserRouter + QueryClientProvider + StrictMode
```

## Conventions

- **Path alias** `@/` → `./src/` (`vite.config.ts`).
- **Naming:** components PascalCase; hooks `useX` (camelCase); utils/services camelCase; types PascalCase.
- **Test files:** exactly one co-located test per implementation, named `<Impl>.test.ts(x)` — same base name (e.g. `ExpensePage.tsx` → `ExpensePage.test.tsx`). Do **not** encode behavior in the filename (`ExpensePage.dateprefill.test.tsx` ✗); scope behaviors with `describe()` blocks.
- **Exports:** named exports throughout; page components additionally have a `default` export for `React.lazy`.
- **TypeScript:** strict, incl. `noUnusedLocals` / `noUnusedParameters`. Prefer `??` over `||` for defaults; early returns for guards.
- **Imports** ordered: React → third-party → `@/` internal → types → relative.

## State Management

Four layers:

1. **React Query** (server-state cache, used even though local-first for invalidation/refetch). Config in `src/main.tsx` (`staleTime` 5 min, `retry` 1). Hooks: `src/hooks/useExpenses.ts`, `useCategories.ts`, `useSettings.ts`. Mutations invalidate the whole `['expenses']` (and `['categories']`) key on success — so an edited expense propagates to every view.
2. **React Context** — `src/contexts/ExpenseFormContext.tsx`. `ExpenseFormDraft = { amount, categoryId, note, expenseId? }` — **note: no `date`** (the expense date lives in the `?date=` URL param, not the draft). The draft is a **passive** `sessionStorage` snapshot whose only job is to survive the round-trip to the category-picker route: written by event handlers (`setDraft` in `ExpensePage.handleCategoryClick`, `updateDraft` in `CategoryPickerPage`) and read via React Hook Form's `values` prop — **no effects**. The context exposes `startExpenseForm({ id } | { date })`, the single entry point for opening the form (clears any stale draft, then navigates).
3. **IndexedDB** — all persistent data. See [Data Layer](#data-layer).
4. **Local component state** — UI-only `useState` (e.g. dialog-open flags).

## Data Layer

Dexie setup + migrations: `src/db/index.ts`. Schema is at **version 2**; the v1→v2 `.upgrade()` migrated categories from `usageCount` to `lastUsedAt`. Domain types: `src/types/index.ts`.

**Tables / indexes:**

| Table | Shape (see `src/types/index.ts`) | Dexie index |
|---|---|---|
| `expenses` | `id, date('YYYY-MM-DD'), amountCents(int), categoryId, note?(≤500), createdAt, updatedAt` | `id, date, categoryId, createdAt` |
| `categories` | `id, name, color(#hex), lastUsedAt(ms\|null)` | `id, name, lastUsedAt` |
| `settings` | singleton `id:'settings', weekStartsOn(0\|1), theme('light'\|'dark'\|'system')` | `id` |

**Repository behavior worth knowing (not obvious from signatures)** — `src/db/expensesRepo.ts`, `categoriesRepo.ts`, `settingsRepo.ts`:

- `expensesRepo`: `createExpense`/`updateExpense` mark the category recently-used **only when `categoryId` actually changes**; both stamp `updatedAt`. Range queries (`listExpensesForDateRange`, `listExpensesForDay`, `listExpensesByCategory`) use the `date` index. Lookup is `getExpense(id)`.
- `categoriesRepo`: `initDefaultCategories` seeds seven defaults on first load; `listCategories` sorts by `lastUsedAt` desc, then name; `deleteCategory` **throws if the category still has expenses**.
- `settingsRepo`: singleton row `'settings'`; returns and persists defaults when absent.

## Routing

React Router v7. `BrowserRouter` in `src/main.tsx`; routes in `src/App.tsx`, all pages `React.lazy`-loaded behind `<Suspense>`.

```
/                         → redirect to /calendar
/calendar                 CalendarPage
/insights                 InsightsPage
/categories               CategoriesPage
/categories/new           CategoryFormPage
/categories/:id           CategoryFormPage
/settings                 SettingsPage
/expenses/new             ExpensePage          (create)
/expenses/new/category    CategoryPickerPage
/expenses/:id             ExpensePage          (edit)
/expenses/:id/category    CategoryPickerPage
```

- `:id` present → edit; absent → create (`useParams`).
- The selected date travels as `?date=` (`useSearchParams`); the in-form picker writes it with `setSearchParams`, and `CategoryPickerPage` threads it through its return path so it survives the round-trip.
- **Open the expense form via `ExpenseFormContext.startExpenseForm`, not a raw `navigate`** — that's what clears a stale draft so it can't prefill a fresh add/edit.

## Forms & Validation

React Hook Form + Zod (`zodResolver`). Schemas: `expenseFormSchema` in `src/features/expenses/ExpensePage.tsx`; `categoryFormSchema` in `src/features/categories/CategoryForm.tsx`. Custom inputs are wired through `<Controller>`.

The expense form (`ExpensePage.tsx`) has subtle, deliberate choices — read it before editing:

- `useForm({ values, resetOptions: { keepDirtyValues: true } })` — uses **`values`, not `defaultValues`**, so the form re-syncs when its source changes (e.g. the edited expense finishes loading). `values` is derived: in-progress draft (category round-trip) ?? loaded expense (edit) ?? empty (create).
- The **date is URL-derived** (`?date=`), validated with `isValidISODate` + `isFutureDate` (`src/lib/dates.ts`); it is **not** in the draft.
- Not-found (edit) renders `<Navigate to="/calendar" replace />`. The component has **zero `useEffect`** — initialization is via `values`, redirects via `<Navigate>`, persistence via event handlers.

## Components

- **`src/components/ui/`** — presentational primitives only (props in, callbacks out; no data fetching or business logic): `Button`, `Input`, `Select`, `Dialog` (Radix-backed — bottom-sheet on mobile, centered modal on desktop), `ConfirmDialog`, `AmountInput` (cents-based currency input), `AutocompleteInput` (debounced suggestions, ARIA listbox).
- **`src/components/layout/`** — `AppLayout` (theme, bottom nav, provides `CalendarContext`; consumes `ExpenseFormContext`), `BottomNav` (nav + add-expense FAB), `PageHeader`.
- `forwardRef` for primitives needing ref access; one component per file. Theme via CSS variables (`var(--color-*)`, defined in `src/index.css`).

## PWA

- Config: `vite.config.ts` (`VitePWA`, `registerType: 'prompt'` — user-controlled updates).
- Update detection: `src/hooks/usePWAUpdate.ts` (polls hourly) → `src/components/pwa/UpdatePrompt.tsx`.
- Offline: Workbox-cached app shell + IndexedDB data; no CDN/external assets.
- Mobile: safe-area insets (`safe-bottom` in `src/index.css`), ≥44px touch targets, `viewport-fit=cover`.

## Testing

Vitest + React Testing Library + `fake-indexeddb`. Config in `vite.config.ts` (`jsdom`, `setupFiles: ./src/test/setup.ts`).

- **`src/test/setup.ts`** imports `fake-indexeddb/auto`, mocks `window.matchMedia`, and clears the three Dexie tables in `beforeEach`. Render helpers: `createTestQueryClient`, `createWrapper` (QueryClient only), `renderWithClient`, and `renderWithRouter` (`MemoryRouter` + `initialEntries` + QueryClient). Anything that consumes `useExpenseFormContext` (e.g. `AppLayout`) must be wrapped in `ExpenseFormProvider` in tests.
- Test-file naming: see [Conventions](#conventions).
- What's tested: pure functions (`src/services/`, `src/lib/dates.test.ts`), repositories (`src/db/*.test.ts`), hooks via `renderHook`, and components via render + interaction. Reference examples: `src/services/money.test.ts`, `src/db/expensesRepo.test.ts`, `src/hooks/useExpenses.test.ts`, `src/components/ui/AmountInput.test.tsx`.

## Development

```
npm run dev        # dev server (HMR)
npm test           # tests (watch)
npm run test:run   # tests (once)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build      # tsc -b && vite build
npm run preview    # serve production build
```

- Conventional commits: `feat` / `fix` / `refactor` / `test` / `docs`.
- There is **no error boundary** in `src/` — an uncaught render throw unmounts the whole tree (relevant when handling untrusted input like the `?date=` param).
- Inspect data at DevTools → Application → IndexedDB → `PocketLedgerDB`.

## Keeping this file useful

This guide was deliberately compacted (it had drifted out of sync with the code). To keep it accurate and short:

- **Point to code (`file` + symbol); don't paste it.** Pasted snippets duplicate a source of truth and rot — a stale example is worse than a pointer.
- **Document what isn't obvious from a single file:** architecture, conventions, cross-cutting rationale.
- **Skip generic React/TypeScript/PWA advice** — assume the reader already knows it; record only this project's specifics and deviations.
