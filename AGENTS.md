# AGENTS.md - Pocket Ledger Development Guide

This document provides a comprehensive overview of the Pocket Ledger codebase architecture, patterns, and best practices for AI coding assistants and developers.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Coding Patterns and Conventions](#coding-patterns-and-conventions)
6. [State Management](#state-management)
7. [Data Layer](#data-layer)
8. [PWA Features](#pwa-features)
9. [Routing](#routing)
10. [Forms and Validation](#forms-and-validation)
11. [Component Patterns](#component-patterns)
12. [Testing Strategy](#testing-strategy)
13. [Development Workflow](#development-workflow)
14. [Best Practices](#best-practices)

---

## Project Overview

**Pocket Ledger** is a Progressive Web App (PWA) for tracking expenses and managing budgets. It is designed with an offline-first approach, storing all data locally in IndexedDB.

### Key Features

- Track daily expenses
- Organize expenses by categories
- View insights and analytics
- Works completely offline
- Installable on mobile devices
- Light/dark theme support
- Mobile-first responsive design

### Design Philosophy

- **Offline-First**: All data stored locally, no server dependency
- **Mobile-First**: Optimized for mobile devices with touch interactions
- **Progressive Enhancement**: Core functionality works everywhere, enhanced features on capable devices
- **Type Safety**: Strict TypeScript configuration for maximum safety
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation support

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Components                     │
│  (Features, UI Components, Layouts)                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ├─► React Query (Server State Cache)
                  │
                  ├─► React Context (Session State)
                  │
                  └─► Custom Hooks
                      │
                      ├─► Repository Layer (src/db/)
                      │   │
                      │   └─► Dexie (IndexedDB)
                      │
                      └─► Services (src/services/)
                          (Business Logic)
```

### Architectural Layers

1. **Presentation Layer** (`src/features/`, `src/components/`)
   - Feature modules (calendar, expenses, categories, insights, settings)
   - Reusable UI components
   - Layout components

2. **State Management Layer** (`src/hooks/`, `src/contexts/`)
   - React Query hooks for data fetching and caching
   - React Context for form draft persistence
   - Custom hooks for business logic

3. **Business Logic Layer** (`src/services/`)
   - Money formatting and parsing
   - Data aggregation
   - Utility functions

4. **Data Access Layer** (`src/db/`)
   - Repository pattern for database operations
   - Dexie (IndexedDB wrapper)
   - CRUD operations for expenses, categories, and settings

5. **Utility Layer** (`src/lib/`)
   - Date manipulation utilities
   - Helper functions

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 7.3 | Build tool and dev server |
| React Router | 7.13 | Client-side routing |
| TanStack Query | 5.90 | Data fetching and caching |
| Dexie | 4.0 | IndexedDB wrapper |

### UI and Styling

| Technology | Purpose |
|-----------|---------|
| Tailwind CSS | 4.1 | Utility-first CSS framework |
| Radix UI | Accessible, unstyled primitives |
| Lucide React | Icon library |
| react-hot-toast | Toast notifications |

### Forms and Validation

| Technology | Purpose |
|-----------|---------|
| React Hook Form | 7.71 | Form state management |
| Zod | 4.3 | Schema validation |
| @hookform/resolvers | Integration layer |

### PWA Support

| Technology | Purpose |
|-----------|---------|
| vite-plugin-pwa | 1.2 | Service worker generation |
| Workbox | (via plugin) | PWA runtime caching |

### Testing

| Technology | Purpose |
|-----------|---------|
| Vitest | 4.0 | Test runner |
| React Testing Library | 16.3 | Component testing |
| fake-indexeddb | 6.2 | IndexedDB mocking |

---

## Project Structure

```
pocket-ledger/
├── public/                    # Static assets (icons, manifest)
├── src/
│   ├── components/           # Reusable components
│   │   ├── ui/              # UI primitives (Button, Input, Dialog)
│   │   ├── layout/          # Layout components (AppLayout, BottomNav)
│   │   └── pwa/             # PWA-specific components (UpdatePrompt)
│   │
│   ├── features/            # Feature modules (domain-driven organization)
│   │   ├── calendar/        # Calendar view and expense list
│   │   ├── categories/      # Category management
│   │   ├── expenses/        # Expense create/edit forms
│   │   ├── insights/        # Analytics and reports
│   │   └── settings/        # App settings
│   │
│   ├── db/                  # Data access layer (repositories)
│   │   ├── index.ts         # Dexie database setup
│   │   ├── expensesRepo.ts  # Expense CRUD operations
│   │   ├── categoriesRepo.ts # Category CRUD operations
│   │   └── settingsRepo.ts  # Settings CRUD operations
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useExpenses.ts   # React Query hooks for expenses
│   │   ├── useCategories.ts # React Query hooks for categories
│   │   ├── useSettings.ts   # React Query hooks for settings
│   │   ├── usePWAUpdate.ts  # PWA update detection
│   │   ├── useTheme.ts      # Theme management
│   │   └── ...              # Other utility hooks
│   │
│   ├── contexts/            # React Context providers
│   │   └── ExpenseFormContext.tsx # Form draft persistence
│   │
│   ├── services/            # Business logic (pure functions)
│   │   ├── money.ts         # Currency formatting/parsing
│   │   └── aggregation.ts   # Expense aggregation logic
│   │
│   ├── lib/                 # Utility libraries
│   │   └── dates.ts         # Date manipulation utilities
│   │
│   ├── types/               # Shared TypeScript types
│   │   └── index.ts         # All domain types
│   │
│   ├── constants/           # App constants
│   │   └── colors.ts        # Color palette for categories
│   │
│   ├── test/                # Test setup and utilities
│   │   └── setup.ts         # Vitest global setup
│   │
│   ├── App.tsx              # Root component with routing
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles and CSS variables
│
├── index.html               # HTML entry point
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.js         # ESLint configuration
└── package.json             # Dependencies and scripts
```

### Naming Conventions

- **Components**: PascalCase (`ExpensePage.tsx`, `Button.tsx`)
- **Hooks**: camelCase with `use` prefix (`useExpenses.ts`, `usePWAUpdate.ts`)
- **Utilities**: camelCase (`dates.ts`, `money.ts`)
- **Types**: PascalCase (`Expense`, `Category`, `Settings`)
- **Constants**: SCREAMING_SNAKE_CASE or camelCase depending on usage
- **Test files**: Same name as implementation with `.test.ts` or `.test.tsx` suffix

### File Co-location

Test files are co-located with their implementation:

```
src/hooks/
├── useExpenses.ts
└── useExpenses.test.ts
```

This pattern makes it easy to find tests and keeps related code together.

---

## Coding Patterns and Conventions

### TypeScript Configuration

The project uses strict TypeScript settings for maximum safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedSideEffectImports": true
  }
}
```

### Import Organization

Imports are organized in this order:

1. React imports
2. Third-party library imports
3. Internal component imports (using `@/` alias)
4. Type imports
5. Relative imports (if any)

Example from `src/features/expenses/ExpensePage.tsx`:

```typescript
import { useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { ChevronDown } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
```

### Path Aliases

The project uses `@/` as an alias for `./src/`:

```typescript
import { Button } from '@/components/ui/Button'
import { useExpenses } from '@/hooks/useExpenses'
```

This is configured in `vite.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Code Style Guidelines

1. **One component per file** (with rare exceptions for tightly coupled helpers)
2. **ForwardRef pattern** for components that need ref access
3. **Const declarations** for components to prevent accidental re-renders
4. **Explicit return types** for functions and hooks
5. **Nullish coalescing** (`??`) preferred over logical OR (`||`) for default values
6. **Template literals** for multi-line strings
7. **Object destructuring** for props and parameters
8. **Early returns** for error conditions and guard clauses

### Example Component Structure

```typescript
import { forwardRef } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  // ... other props
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button ref={ref} className="..." {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

---

## State Management

Pocket Ledger uses a multi-layered state management approach:

### 1. React Query (Server State Cache)

React Query manages data fetching, caching, and synchronization. Even though this is an offline-first app with local storage, React Query provides:

- Automatic cache invalidation
- Optimistic updates
- Background refetching
- Unified data fetching interface

**Configuration** (`src/main.tsx:9-16`):

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})
```

**Usage Example** (`src/hooks/useExpenses.ts:18-25`):

```typescript
export function useExpensesForMonth(year: number, month: number) {
  const [start, end] = getMonthRange(year, month)
  return useQuery({
    queryKey: [...EXPENSES_KEY, 'month', year, month],
    queryFn: () => listExpensesForDateRange(start, end),
  })
}
```

**Mutation Example** (`src/hooks/useExpenses.ts:63-77`):

```typescript
export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateExpenseInput) => createExpense(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Expense added')
    },
    onError: () => {
      toast.error('Failed to add expense')
    },
  })
}
```

### 2. React Context (Session State)

Used for form draft persistence across navigation:

**ExpenseFormContext** (`src/contexts/ExpenseFormContext.tsx:27-92`):

```typescript
export interface ExpenseFormDraft {
  amount: string
  categoryId: string
  note: string
}

export interface ExpenseFormContextValue {
  draft: ExpenseFormDraft | null
  setDraft: (draft: ExpenseFormDraft | null) => void
  updateDraft: (partial: Partial<ExpenseFormDraft>) => void
  clearDraft: () => void
}
```

Persists form state in `sessionStorage` so users don't lose their work when navigating to select a category.

### 3. IndexedDB (Persistent State)

All application data is stored in IndexedDB via Dexie:

- Expenses
- Categories
- Settings

See [Data Layer](#data-layer) section for details.

### 4. Local Component State

For UI-only state that doesn't need to be shared:

```typescript
const [viewDate, setViewDate] = useState(() => new Date())
const [isDialogOpen, setIsDialogOpen] = useState(false)
```

### Data Flow Pattern

```
User Action
    ↓
Component Event Handler
    ↓
React Query Mutation
    ↓
Repository Function (src/db/)
    ↓
Dexie → IndexedDB
    ↓
onSuccess → Query Cache Invalidation
    ↓
React Query Refetch
    ↓
Component Re-render with New Data
```

---

## Data Layer

### Database Schema

The app uses three main tables in IndexedDB:

#### Expenses Table

```typescript
interface Expense {
  id: string                // UUID
  date: string              // 'YYYY-MM-DD' format
  amountCents: number       // Integer (1234 = $12.34)
  categoryId: string        // Foreign key to categories
  note?: string             // Optional, max 500 chars
  createdAt: number         // Unix timestamp (ms)
  updatedAt: number         // Unix timestamp (ms)
}

// Index: 'id, date, categoryId, createdAt'
```

#### Categories Table

```typescript
interface Category {
  id: string                // UUID
  name: string              // Category name
  color: string             // Hex color (#xxxxxx)
  usageCount: number        // For sorting by frequency
}

// Index: 'id, name, usageCount'
```

#### Settings Table

```typescript
interface Settings {
  id: 'settings'            // Literal type (singleton)
  weekStartsOn: 0 | 1       // 0 = Sunday, 1 = Monday
  theme: 'light' | 'dark' | 'system'
}

// Index: 'id'
```

### Dexie Configuration

**Database Setup** (`src/db/index.ts:4-17`):

```typescript
const db = new Dexie('PocketLedgerDB') as Dexie & {
  expenses: EntityTable<Expense, 'id'>
  categories: EntityTable<Category, 'id'>
  settings: EntityTable<Settings, 'id'>
}

db.version(1).stores({
  expenses: 'id, date, categoryId, createdAt',
  categories: 'id, name, usageCount',
  settings: 'id'
})
```

### Repository Pattern

Each entity has its own repository module with CRUD operations.

#### Expenses Repository (`src/db/expensesRepo.ts`)

**Key Operations:**

```typescript
// Create expense
export async function createExpense(input: CreateExpenseInput): Promise<Expense>

// Update expense
export async function updateExpense(id: string, patch: UpdateExpenseInput): Promise<Expense>

// Delete expense
export async function deleteExpense(id: string): Promise<void>

// Query operations
export async function getExpenseById(id: string): Promise<Expense | undefined>
export async function listExpensesForDateRange(start: string, end: string): Promise<Expense[]>
export async function listExpensesForDay(date: string): Promise<Expense[]>
export async function listExpensesByCategory(categoryId: string, start: string, end: string): Promise<Expense[]>
```

**Side Effects:**

- Creating/updating expenses automatically increments category usage count
- Deletes are soft (immediate deletion, no undo)
- All operations update timestamps

**Query Example** (`src/db/expensesRepo.ts:72-76`):

```typescript
export async function listExpensesForDateRange(start: string, end: string): Promise<Expense[]> {
  return db.expenses
    .where('date').between(start, end, true, true)
    .sortBy('createdAt')
    .then((expenses) => expenses.reverse())
}
```

#### Categories Repository (`src/db/categoriesRepo.ts`)

**Key Operations:**

```typescript
// Initialize default categories on first load
export async function initDefaultCategories(): Promise<void>

// CRUD operations
export async function listCategories(): Promise<Category[]>
export async function createCategory(input: CreateCategoryInput): Promise<Category>
export async function updateCategory(id: string, patch: UpdateCategoryInput): Promise<Category>
export async function deleteCategory(id: string): Promise<void>

// Utility operations
export async function incrementUsage(id: string): Promise<void>
export async function categoryHasExpenses(categoryId: string): Promise<boolean>
```

**Default Categories** (`src/db/categoriesRepo.ts:4-22`):

On first load, the app creates these default categories:
- Food & Dining
- Shopping
- Transportation
- Entertainment
- Bills & Utilities
- Health & Fitness
- Travel
- Other

**Sorting** (`src/db/categoriesRepo.ts:28-34`):

Categories are sorted by usage frequency, then alphabetically:

```typescript
export async function listCategories(): Promise<Category[]> {
  return db.categories.toArray().then((categories) =>
    categories.sort((a, b) => {
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount
      }
      return a.name.localeCompare(b.name)
    })
  )
}
```

**Deletion Protection** (`src/db/categoriesRepo.ts:68-73`):

```typescript
export async function deleteCategory(id: string): Promise<void> {
  const hasExpenses = await categoryHasExpenses(id)
  if (hasExpenses) {
    throw new Error('Cannot delete category with expenses')
  }
  await db.categories.delete(id)
}
```

#### Settings Repository (`src/db/settingsRepo.ts`)

**Operations:**

```typescript
export async function getSettings(): Promise<Settings>
export async function updateSettings(patch: Partial<Omit<Settings, 'id'>>): Promise<Settings>
```

Settings are stored as a singleton with id `'settings'`. If not found, defaults are returned and saved.

### Type Definitions

All data types are centralized in `src/types/index.ts`:

```typescript
export interface Expense {
  id: string
  date: string
  amountCents: number
  categoryId: string
  note?: string
  createdAt: number
  updatedAt: number
}

export interface Category {
  id: string
  name: string
  color: string
  usageCount: number
}

export interface Settings {
  id: 'settings'
  weekStartsOn: 0 | 1
  theme: 'light' | 'dark' | 'system'
}

export interface RangeAggregate {
  totalCents: number
  byCategory: Record<string, number>
  byDay: Record<string, number>
}
```

---

## PWA Features

### Configuration

**Vite PWA Plugin** (`vite.config.ts:11-40`):

```typescript
VitePWA({
  registerType: 'prompt',  // User-controlled updates
  includeAssets: ['favicon.svg', 'apple-touch-icon.svg'],
  manifest: {
    name: 'Pocket Ledger',
    short_name: 'Pocket Ledger',
    description: 'Track your expenses and manage your budget',
    theme_color: '#3b82f6',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [
      {
        src: 'pwa-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml'
      },
      {
        src: 'pwa-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml'
      },
      {
        src: 'pwa-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ]
  }
})
```

### Offline Support

The app works completely offline by:

1. **Service Worker**: Generated by `vite-plugin-pwa`
   - Caches app shell (HTML, CSS, JS)
   - Caches static assets (icons, fonts)
   - Network-first strategy for app updates

2. **IndexedDB**: All data stored locally
   - No network requests for data operations
   - Instant read/write access
   - Persistent across sessions

3. **No External Dependencies**: All assets bundled
   - No CDN dependencies
   - No external API calls
   - Self-contained application

### Update Detection

**Update Hook** (`src/hooks/usePWAUpdate.ts:3-21`):

```typescript
const UPDATE_CHECK_INTERVAL = 1000 * 60 * 60 // 1 hour

export function usePWAUpdate() {
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => {
          registration.update()
        }, UPDATE_CHECK_INTERVAL)
      }
    },
  })

  const applyUpdate = () => {
    updateServiceWorker(true)
  }

  return { needRefresh, applyUpdate }
}
```

The app checks for updates every hour and prompts the user to reload when a new version is available.

**Update UI** (`src/components/pwa/UpdatePrompt.tsx:5-40`):

```typescript
export function UpdatePrompt() {
  const { needRefresh, applyUpdate } = usePWAUpdate()
  const [dismissed, setDismissed] = useState(false)

  if (!needRefresh || dismissed) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-[var(--color-primary)] text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-start justify-between gap-3">
        <p className="flex-1 text-sm">
          A new version is available. Reload to update.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={applyUpdate}
            className="bg-white text-[var(--color-primary)] px-4 py-2 rounded font-medium text-sm"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Mobile Optimizations

1. **Safe Area Insets** (`src/index.css:65-67`):
   ```css
   @utility safe-bottom {
     padding-bottom: env(safe-area-inset-bottom);
   }
   ```
   Used for iPhone notch and Android gesture navigation

2. **Touch Optimizations**:
   - Large touch targets (min 44x44px)
   - Swipe gestures in calendar
   - Bottom navigation for thumb-friendly access

3. **Viewport Meta Tag** (`index.html`):
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
   ```

4. **Theme Color**:
   ```html
   <meta name="theme-color" content="#3b82f6">
   ```
   Matches OS status bar color

### Installation

Users can install the app from:
- Chrome: "Install app" prompt
- Safari: "Add to Home Screen"
- Edge: "Install app" in menu

Once installed:
- App opens in standalone mode (no browser chrome)
- Appears in app launcher
- Can be uninstalled like native apps

---

## Routing

### Router Configuration

**Framework**: React Router v7

**Setup** (`src/main.tsx:21-22`, `src/App.tsx:1-47`):

```typescript
// main.tsx
<BrowserRouter>
  <App />
</BrowserRouter>

// App.tsx
function App() {
  return (
    <ExpenseFormProvider>
      <AppLayout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Routes defined here */}
          </Routes>
        </Suspense>
      </AppLayout>
    </ExpenseFormProvider>
  )
}
```

### Route Structure

```typescript
<Routes>
  {/* Redirect root to calendar */}
  <Route path="/" element={<Navigate to="/calendar" replace />} />

  {/* Main feature pages */}
  <Route path="/calendar" element={<CalendarPage />} />
  <Route path="/insights" element={<InsightsPage />} />
  <Route path="/categories" element={<CategoriesPage />} />
  <Route path="/settings" element={<SettingsPage />} />

  {/* Expense management */}
  <Route path="/expenses/new" element={<ExpensePage />} />
  <Route path="/expenses/:id" element={<ExpensePage />} />
  <Route path="/expenses/new/category" element={<CategoryPickerPage />} />
  <Route path="/expenses/:id/category" element={<CategoryPickerPage />} />

  {/* Category management */}
  <Route path="/categories/new" element={<CategoryFormPage />} />
  <Route path="/categories/:id" element={<CategoryFormPage />} />
</Routes>
```

### Lazy Loading

All page components are lazy-loaded for optimal performance:

```typescript
const CalendarPage = lazy(() => import('@/features/calendar/CalendarPage'))
const InsightsPage = lazy(() => import('@/features/insights/InsightsPage'))
// ... other pages
```

### Navigation Patterns

#### 1. Programmatic Navigation

```typescript
import { useNavigate } from 'react-router-dom'

function MyComponent() {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/calendar')
  }

  return <button onClick={handleClick}>Go to Calendar</button>
}
```

#### 2. URL Parameters

```typescript
import { useParams } from 'react-router-dom'

function ExpensePage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  // id is undefined for /expenses/new
  // id is string for /expenses/:id
}
```

#### 3. Query Parameters

```typescript
import { useSearchParams } from 'react-router-dom'

function ExpensePage() {
  const [searchParams] = useSearchParams()
  const dateParam = searchParams.get('date')

  // /expenses/new?date=2024-01-15 → dateParam = '2024-01-15'
}
```

#### 4. Back Navigation

```typescript
function handleCancel() {
  if (hasChanges) {
    // Show confirm dialog
    setShowCancelConfirm(true)
  } else {
    navigate(-1) // Go back
  }
}
```

### Bottom Navigation

The app uses a bottom navigation bar for main features:

**BottomNav Component** (`src/components/layout/BottomNav.tsx:15-68`):

```typescript
export function BottomNav({ onAddExpense }: BottomNavProps) {
  const location = useLocation()

  const navItems = [
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/insights', icon: PieChart, label: 'Insights' },
    { path: '/categories', icon: Tag, label: 'Categories' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="...">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={isActive ? 'active-styles' : 'inactive-styles'}
        >
          <item.icon />
          <span>{item.label}</span>
        </Link>
      ))}

      {/* Floating Action Button */}
      <button onClick={onAddExpense} className="fab-styles">
        <Plus />
      </button>
    </nav>
  )
}
```

---

## Forms and Validation

### Form Management

**Framework**: React Hook Form + Zod

This combination provides:
- Type-safe form handling
- Schema-based validation
- Integration with React ecosystem
- Minimal re-renders

### Validation Schema Example

**Expense Form** (`src/features/expenses/ExpensePage.tsx:27-47`):

```typescript
const expenseFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'Please enter a valid amount')
    .refine(
      (val) => {
        const cents = parseUsdToCents(val)
        return cents !== null && cents > 0
      },
      { message: 'Please enter a valid amount' }
    )
    .transform((val) => parseUsdToCents(val) as number),

  categoryId: z.string().min(1, 'Please select a category'),

  note: z
    .string()
    .max(500, 'Note must be 500 characters or less')
    .transform((val) => val.trim() || undefined)
    .optional(),
})

type ExpenseFormData = z.output<typeof expenseFormSchema>
```

**Category Form** (`src/features/categories/CategoryForm.tsx:10-17`):

```typescript
export const categoryFormSchema = z.object({
  name: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(1, 'Please enter a category name')),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Please select a valid color'),
})

export type CategoryFormData = z.infer<typeof categoryFormSchema>
```

### Form Setup Pattern

```typescript
const {
  control,
  handleSubmit,
  setError,
  watch,
  setValue,
  formState: { errors },
} = useForm<z.input<typeof expenseFormSchema>, unknown, ExpenseFormData>({
  resolver: zodResolver(expenseFormSchema),
  mode: 'onBlur',  // Validate on blur
  defaultValues: {
    amount: draft?.amount ?? '',
    categoryId: draft?.categoryId ?? '',
    note: draft?.note ?? '',
  },
})
```

### Controller Pattern

For custom inputs, use the `Controller` component:

```typescript
<Controller
  name="amount"
  control={control}
  render={({ field }) => (
    <AmountInput
      value={field.value}
      onChange={(val) => {
        field.onChange(val)
        updateDraft({ amount: val })
      }}
      onBlur={field.onBlur}
      error={errors.amount?.message}
      autoFocus={!isEditing}
    />
  )}
/>
```

### Custom Validation

For validations that require async operations or complex logic:

```typescript
const handleFormSubmit = (data: ExpenseFormData) => {
  // Custom validation
  if (isFutureDate(formDate)) {
    setError('root.date', { message: "Can't add expenses for future dates" })
    return
  }

  // Proceed with submission
  mutation.mutate({
    date: formDate,
    amountCents: data.amount,
    categoryId: data.categoryId,
    note: data.note,
  })
}
```

### Form Draft Persistence

The expense form persists drafts in session storage to preserve user input when navigating away:

**ExpenseFormContext** (`src/contexts/ExpenseFormContext.tsx`):

```typescript
export interface ExpenseFormDraft {
  amount: string
  categoryId: string
  note: string
}

// Usage in form
const { draft, updateDraft, clearDraft } = useExpenseFormContext()

// Update draft on change
<Controller
  name="amount"
  control={control}
  render={({ field }) => (
    <AmountInput
      value={field.value}
      onChange={(val) => {
        field.onChange(val)
        updateDraft({ amount: val })  // Persist to session storage
      }}
    />
  )}
/>

// Clear draft on successful submission
const handleFormSubmit = async (data: ExpenseFormData) => {
  await createExpense.mutateAsync(data)
  clearDraft()
  navigate(-1)
}
```

### Input Components

#### AmountInput (`src/components/ui/AmountInput.tsx`)

Specialized currency input with:
- Multi-locale support (comma, Arabic decimal separators)
- Automatic decimal formatting
- Input sanitization
- Prefix support ($, €, etc.)

```typescript
<AmountInput
  value={value}
  onChange={setValue}
  error={error}
  autoFocus
/>
```

#### AutocompleteInput (`src/components/ui/AutocompleteInput.tsx`)

Input with suggestions based on history:

```typescript
<AutocompleteInput
  label="Note"
  value={value}
  onChange={setValue}
  suggestions={suggestions}
  placeholder="e.g., Grocery shopping"
/>
```

Features:
- Debounced suggestions (200ms)
- Keyboard navigation (arrow keys, enter, escape)
- Accessible (ARIA roles)
- Based on category history (last 6 months)

---

## Component Patterns

### Component Types

#### 1. Feature Components

Located in `src/features/`, these are page-level components that:
- Fetch data using custom hooks
- Handle business logic
- Compose multiple UI components
- Manage local state

Example: `CalendarPage.tsx`, `ExpensePage.tsx`

#### 2. UI Components

Located in `src/components/ui/`, these are reusable, presentational components:
- Accept props for configuration
- Emit events via callbacks
- No business logic
- No data fetching

Example: `Button.tsx`, `Input.tsx`, `Dialog.tsx`

#### 3. Layout Components

Located in `src/components/layout/`, these structure the app:
- Provide consistent layout
- Handle navigation
- Manage theme
- Wrap feature components

Example: `AppLayout.tsx`, `BottomNav.tsx`, `PageHeader.tsx`

### ForwardRef Pattern

For components that need ref access:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = '...'
    const variantStyles = {
      primary: '...',
      secondary: '...',
      danger: '...',
    }
    const sizeStyles = {
      sm: '...',
      md: '...',
      lg: '...',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

### Compound Component Pattern

For complex UI components like dialogs:

```typescript
// Dialog.tsx exports multiple components
export const Dialog = { /* root */ }
export const DialogTitle = { /* title */ }
export const DialogDescription = { /* description */ }
export const DialogClose = { /* close button */ }

// Usage
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTitle>Confirm Delete</DialogTitle>
  <DialogDescription>
    Are you sure you want to delete this expense?
  </DialogDescription>
  <div className="flex gap-2">
    <Button onClick={handleConfirm}>Delete</Button>
    <DialogClose asChild>
      <Button variant="secondary">Cancel</Button>
    </DialogClose>
  </div>
</Dialog>
```

### Accessible Components

All interactive components follow accessibility best practices:

1. **Semantic HTML**: Use appropriate elements (`<button>`, `<input>`, `<nav>`)
2. **ARIA Labels**: Provide labels for screen readers
3. **Keyboard Navigation**: Support tab, enter, escape, arrow keys
4. **Focus Management**: Visible focus indicators, focus trapping in modals
5. **Color Contrast**: WCAG AA compliant

Example from `AutocompleteInput.tsx:119,125`:

```typescript
<div role="listbox">
  {suggestions.map((suggestion, index) => (
    <button
      key={suggestion}
      role="option"
      aria-selected={index === selectedIndex}
      aria-label={`Select ${suggestion}`}
    >
      {suggestion}
    </button>
  ))}
</div>
```

### Radix UI Integration

The app uses Radix UI primitives for complex, accessible components:

- **Dialog** (`@radix-ui/react-dialog`): Modals and bottom sheets
- **VisuallyHidden** (`@radix-ui/react-visually-hidden`): Hide content visually but keep for screen readers

Example usage:

```typescript
import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

export function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <VisuallyHidden.Root asChild>
            <Dialog.Title>Dialog Title</Dialog.Title>
          </VisuallyHidden.Root>
          <Dialog.Description>
            Dialog content here
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Mobile-First Responsive Design

Components use mobile-first Tailwind classes:

```typescript
<div className="
  flex flex-col    // Mobile: vertical layout
  md:flex-row      // Tablet+: horizontal layout
  gap-4            // All: 1rem gap
  md:gap-6         // Tablet+: 1.5rem gap
">
```

### Theme Support

Components use CSS variables for theming:

```typescript
<div className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
```

Theme variables are defined in `src/index.css:7-57` and switched based on user preference.

---

## Testing Strategy

### Testing Framework

- **Test Runner**: Vitest
- **Component Testing**: React Testing Library
- **Mocking**: Vitest's built-in `vi` API
- **IndexedDB Mocking**: `fake-indexeddb`

### Test Configuration

**Vitest Config** (`vite.config.ts:47-51`):

```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
}
```

**Global Setup** (`src/test/setup.ts:1-67`):

```typescript
import { beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import { db } from '@/db'

// Clean database before each test
beforeEach(async () => {
  await db.expenses.clear()
  await db.categories.clear()
  await db.settings.clear()
})
```

### Test Utilities

**Query Client Wrapper** (`src/test/setup.ts:17-32`):

```typescript
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
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

**Router Wrapper** (`src/test/setup.ts:44-57`):

```typescript
export function renderWithRouter(
  ui: React.ReactElement,
  { route = '/' }: { route?: string } = {}
) {
  window.history.pushState({}, '', route)
  return {
    ...render(ui, { wrapper: BrowserRouter }),
  }
}
```

### Testing Patterns

#### 1. Unit Tests (Services/Utils)

Test pure functions in isolation:

**Example: Money Service** (`src/services/money.test.ts:5-31`):

```typescript
describe('formatCentsToUsd', () => {
  it('formats cents to USD with two decimal places', () => {
    expect(formatCentsToUsd(1234)).toBe('12.34')
    expect(formatCentsToUsd(100)).toBe('1.00')
    expect(formatCentsToUsd(0)).toBe('0.00')
  })

  it('handles large amounts', () => {
    expect(formatCentsToUsd(123456789)).toBe('1234567.89')
  })
})

describe('parseUsdToCents', () => {
  it('parses USD string to cents', () => {
    expect(parseUsdToCents('12.34')).toBe(1234)
    expect(parseUsdToCents('1.00')).toBe(100)
    expect(parseUsdToCents('0.50')).toBe(50)
  })

  it('handles various formats', () => {
    expect(parseUsdToCents('.50')).toBe(50)
    expect(parseUsdToCents('12')).toBe(1200)
    expect(parseUsdToCents('1,234.56')).toBe(123456)
  })

  it('returns null for invalid input', () => {
    expect(parseUsdToCents('invalid')).toBe(null)
    expect(parseUsdToCents('')).toBe(null)
  })
})
```

#### 2. Hook Tests

Test custom hooks using `renderHook`:

**Example: useExpenses Hook** (`src/hooks/useExpenses.test.ts:26-54`):

```typescript
describe('useExpensesForMonth', () => {
  it('returns expenses for the specified month', async () => {
    // Setup test data
    await db.expenses.bulkAdd([
      {
        id: 'expense-1',
        date: '2024-01-15',
        amountCents: 1000,
        categoryId: 'cat-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'expense-2',
        date: '2024-02-10',
        amountCents: 2000,
        categoryId: 'cat-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ])

    // Render hook
    const { result } = renderHook(() => useExpensesForMonth(2024, 1), {
      wrapper: createWrapper(),
    })

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].id).toBe('expense-1')
  })
})
```

#### 3. Component Tests

Test component rendering and interactions:

**Example: AmountInput Component** (`src/components/ui/AmountInput.test.tsx:27-35`):

```typescript
describe('AmountInput', () => {
  it('allows only numbers and decimal point', () => {
    const onChange = vi.fn()
    render(<AmountInput value="" onChange={onChange} />)

    const input = screen.getByLabelText('Amount')
    fireEvent.change(input, { target: { value: '12.34' } })

    expect(onChange).toHaveBeenCalledWith('12.34')
  })

  it('displays error message when provided', () => {
    render(<AmountInput value="" onChange={vi.fn()} error="Invalid amount" />)
    expect(screen.getByText('Invalid amount')).toBeInTheDocument()
  })

  it('supports multiple locales', () => {
    const onChange = vi.fn()
    render(<AmountInput value="" onChange={onChange} />)

    const input = screen.getByLabelText('Amount')

    // Comma as decimal separator
    fireEvent.change(input, { target: { value: '12,34' } })
    expect(onChange).toHaveBeenCalledWith('12.34')

    // Arabic decimal separator
    fireEvent.change(input, { target: { value: '12٫34' } })
    expect(onChange).toHaveBeenCalledWith('12.34')
  })
})
```

#### 4. Repository Tests

Test database operations:

**Example: Expenses Repository** (`src/db/expensesRepo.test.ts:120-137`):

```typescript
describe('updateExpense', () => {
  beforeEach(async () => {
    await db.categories.bulkAdd([
      { id: 'cat-1', name: 'Food', color: '#ff0000', usageCount: 0 },
      { id: 'cat-2', name: 'Transport', color: '#00ff00', usageCount: 0 },
    ])
    await db.expenses.add({
      id: 'expense-1',
      date: '2024-01-01',
      amountCents: 1000,
      categoryId: 'cat-1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  })

  it('increments usage ONLY when categoryId changes', async () => {
    const incrementSpy = vi.spyOn(categoriesRepo, 'incrementUsage')

    // Update without changing category - should NOT increment
    await updateExpense('expense-1', { amountCents: 500 })
    expect(incrementSpy).not.toHaveBeenCalled()

    // Update with different category - SHOULD increment
    await updateExpense('expense-1', { categoryId: 'cat-2' })
    expect(incrementSpy).toHaveBeenCalledWith('cat-2')

    incrementSpy.mockRestore()
  })

  it('updates timestamps', async () => {
    const before = Date.now()
    await updateExpense('expense-1', { amountCents: 2000 })
    const after = Date.now()

    const expense = await db.expenses.get('expense-1')
    expect(expense?.updatedAt).toBeGreaterThanOrEqual(before)
    expect(expense?.updatedAt).toBeLessThanOrEqual(after)
  })
})
```

### Test Coverage Areas

Tests cover:

1. **Input Validation**: Currency parsing, string sanitization, format validation
2. **Database Operations**: CRUD operations, queries, side effects
3. **Hook Behavior**: Data fetching, mutations, cache invalidation
4. **Component Rendering**: Initial render, conditional rendering, error states
5. **User Interactions**: Clicks, form submissions, keyboard navigation
6. **Accessibility**: Labels, roles, keyboard support

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run with coverage
npm test -- --coverage
```

---

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# Navigate to http://localhost:5173
```

### Development Commands

```bash
# Start dev server (with HMR)
npm run dev

# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Type check
npm run typecheck

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Hot Module Replacement (HMR)

Vite provides fast HMR for:
- Component updates (preserves state)
- Style updates (instant)
- Hook updates (automatic refresh)

### Browser DevTools

Recommended extensions:
- **React Developer Tools**: Inspect component tree, props, hooks
- **Redux DevTools**: View React Query cache state
- **Lighthouse**: Test PWA compliance, performance, accessibility

### IndexedDB Inspector

To inspect local data:
1. Open Chrome DevTools
2. Go to Application tab
3. Expand IndexedDB
4. Select PocketLedgerDB
5. Browse expenses, categories, settings tables

### Service Worker Testing

To test PWA features:
1. Build production bundle: `npm run build`
2. Preview: `npm run preview`
3. Open DevTools → Application → Service Workers
4. Test offline mode by checking "Offline" checkbox
5. Test update flow by rebuilding and refreshing

### Debugging Tips

#### 1. React Query DevTools

Add to `src/main.tsx` for development:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

#### 2. Console Logging

The app uses structured logging:

```typescript
// Log database operations
console.log('[DB] Created expense:', expense)

// Log navigation
console.log('[NAV] Navigating to:', path)

// Log errors
console.error('[ERROR] Failed to save:', error)
```

#### 3. Error Boundaries

Not currently implemented, but recommended for production:

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('[ERROR BOUNDARY]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

---

## Best Practices

### Code Organization

1. **Feature-First Structure**: Organize by feature, not by type
   - ✅ `features/calendar/CalendarPage.tsx`
   - ❌ `pages/CalendarPage.tsx`

2. **Co-locate Tests**: Keep tests next to implementation
   - ✅ `hooks/useExpenses.ts` + `hooks/useExpenses.test.ts`
   - ❌ `hooks/useExpenses.ts` + `__tests__/useExpenses.test.ts`

3. **Single Responsibility**: One component per file (with rare exceptions)

4. **Explicit Exports**: Use named exports for better tree-shaking
   - ✅ `export function Button() {}`
   - ❌ `export default Button`

### Type Safety

1. **Strict Mode**: Enable all strict TypeScript checks
2. **No `any`**: Avoid `any` type, use `unknown` if necessary
3. **Type Inference**: Let TypeScript infer when possible
4. **Explicit Return Types**: For public functions and hooks
5. **Zod Schemas**: Define runtime validation schemas that match TypeScript types

### State Management

1. **Lift State Up**: Keep state as close as possible to where it's used
2. **React Query for Server State**: Even for local-first apps (cache management)
3. **Context for Shared UI State**: Forms, theme, navigation
4. **IndexedDB for Persistence**: All user data
5. **Avoid Prop Drilling**: Use context or composition for deep props

### Performance

1. **Lazy Load Routes**: Use `React.lazy()` for code splitting
2. **Memo Expensive Calculations**: Use `useMemo` when appropriate
3. **Debounce User Input**: For search, autocomplete (200ms)
4. **Virtual Lists**: For long lists (not yet implemented, recommended)
5. **Optimize Images**: Use WebP, lazy load off-screen images

### Accessibility

1. **Semantic HTML**: Use appropriate elements
2. **Keyboard Navigation**: Support tab, enter, escape, arrow keys
3. **Focus Management**: Trap focus in modals, restore on close
4. **ARIA Roles**: For custom components
5. **Color Contrast**: Meet WCAG AA standards
6. **Screen Reader Testing**: Test with VoiceOver, NVDA

### Mobile Optimization

1. **Touch Targets**: Minimum 44x44px
2. **Safe Areas**: Use `env(safe-area-inset-*)` for notches
3. **Viewport Meta**: Include `viewport-fit=cover`
4. **Swipe Gestures**: For common actions (calendar navigation)
5. **Thumb Zone**: Place important actions within reach

### PWA Best Practices

1. **Offline First**: Core functionality must work offline
2. **Update Prompts**: User-controlled updates, not automatic
3. **Manifest**: Complete with icons, theme color, display mode
4. **Service Worker**: Cache app shell, network-first for updates
5. **Installability**: Provide clear install prompts

### Security

1. **Input Sanitization**: Validate and sanitize all user input
2. **XSS Prevention**: Use React's built-in escaping
3. **SQL Injection**: N/A (using IndexedDB with Dexie)
4. **HTTPS**: Required for PWA installation
5. **Content Security Policy**: Consider for production

### Testing

1. **Test Behavior, Not Implementation**: Focus on user interactions
2. **AAA Pattern**: Arrange, Act, Assert
3. **Test Coverage**: Aim for >80% on critical paths
4. **Integration Over Unit**: Prefer integration tests for confidence
5. **Accessibility Tests**: Include ARIA, keyboard navigation

### Error Handling

1. **User-Friendly Messages**: Show actionable error messages
2. **Toast Notifications**: For success/error feedback
3. **Graceful Degradation**: Provide fallbacks
4. **Error Boundaries**: Catch React errors (recommended)
5. **Logging**: Log errors for debugging

### Code Quality

1. **ESLint**: Follow recommended rules
2. **TypeScript Strict**: Enable all strict checks
3. **Prettier**: Use consistent formatting (if added)
4. **Code Reviews**: Review all changes
5. **Documentation**: Document complex logic, public APIs

### Git Workflow

1. **Conventional Commits**: Use semantic commit messages
   - `feat:` New feature
   - `fix:` Bug fix
   - `refactor:` Code restructuring
   - `test:` Adding tests
   - `docs:` Documentation updates

2. **Small Commits**: Commit frequently with focused changes
3. **Branch Naming**: Use descriptive branch names
   - `feature/expense-categories`
   - `fix/calendar-navigation`
4. **Pull Requests**: Include description, screenshots for UI changes

---

## Progressive Web App Checklist

For AI agents implementing PWA features, ensure:

- [x] Web App Manifest with all required fields
- [x] Service Worker registered
- [x] HTTPS (required for PWA)
- [x] Offline functionality (core features work offline)
- [x] Installable (add to home screen prompt)
- [x] Responsive design (mobile, tablet, desktop)
- [x] Fast load time (<3s on 3G)
- [x] Accessible (WCAG AA)
- [x] Theme color (matches brand)
- [x] Icons (192x192, 512x512, maskable)
- [x] Safe area support (notches, gesture bars)
- [x] Update detection and prompts
- [x] Standalone display mode
- [ ] Push notifications (not implemented, optional)
- [ ] Background sync (not implemented, optional)

---

## Common Tasks for AI Agents

### Adding a New Feature

1. **Create feature directory**: `src/features/my-feature/`
2. **Create page component**: `MyFeaturePage.tsx`
3. **Add route**: Update `src/App.tsx`
4. **Create data hook**: `src/hooks/useMyFeature.ts`
5. **Add repository functions**: Update relevant repo in `src/db/`
6. **Add types**: Update `src/types/index.ts`
7. **Write tests**: Co-locate with implementation
8. **Update navigation**: Add to `BottomNav` if primary feature

### Adding a New UI Component

1. **Create component file**: `src/components/ui/MyComponent.tsx`
2. **Define TypeScript interface**: Props with types
3. **Implement with forwardRef**: If ref access needed
4. **Add accessibility**: ARIA labels, keyboard support
5. **Style with Tailwind**: Use theme variables
6. **Write tests**: `MyComponent.test.tsx`
7. **Export from index**: If using barrel exports

### Adding a New Database Entity

1. **Define type**: Add to `src/types/index.ts`
2. **Update Dexie schema**: Add table in `src/db/index.ts`
3. **Create repository**: `src/db/myEntityRepo.ts`
4. **Implement CRUD operations**: create, read, update, delete
5. **Create React Query hooks**: `src/hooks/useMyEntity.ts`
6. **Write repository tests**: Test all operations
7. **Handle migrations**: If modifying existing schema

### Fixing a Bug

1. **Reproduce the bug**: Write a failing test
2. **Identify root cause**: Use debugger, logs
3. **Fix the issue**: Minimum necessary changes
4. **Verify fix**: Ensure test passes
5. **Check for regressions**: Run full test suite
6. **Update documentation**: If behavior changed

### Refactoring Code

1. **Write tests first**: Ensure current behavior is tested
2. **Make small changes**: One refactor at a time
3. **Run tests frequently**: After each change
4. **Update types**: If interfaces changed
5. **Update documentation**: If public API changed
6. **Review performance**: Ensure no degradation

---

## Conclusion

This document provides a comprehensive guide to the Pocket Ledger codebase architecture, patterns, and best practices. When working on this codebase:

1. **Follow existing patterns**: Consistency is key
2. **Maintain type safety**: Leverage TypeScript's strictness
3. **Write tests**: Especially for business logic
4. **Consider accessibility**: Build for all users
5. **Optimize for mobile**: Mobile-first approach
6. **Keep it simple**: Avoid over-engineering
7. **Document as you go**: Help future developers (and AI agents)

For questions or clarifications, refer to:
- Inline code comments
- Test files (excellent documentation)
- This AGENTS.md file
- React, Vite, and library documentation

Happy coding! 🚀
