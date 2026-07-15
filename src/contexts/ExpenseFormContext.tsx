import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'expense-form-draft'

interface ExpenseFormDraft {
  amount: string
  categoryId: string
  note: string
  expenseId?: string // Present when editing
}

interface ExpenseFormContextValue {
  draft: ExpenseFormDraft | null
  setDraft: (draft: ExpenseFormDraft | null) => void
  updateDraft: (updates: Partial<ExpenseFormDraft>) => void
  clearDraft: () => void
  /**
   * The single entry point for opening the expense form. It discards any
   * leftover draft and navigates, so the "a fresh add/edit starts clean"
   * invariant lives in one place instead of relying on every call site to
   * remember to clear first. Use this instead of navigating to the form
   * routes directly.
   */
  startExpenseForm: (target: { id: string } | { date: string }) => void
}

const ExpenseFormContext = createContext<ExpenseFormContextValue | null>(null)

function loadDraft(): ExpenseFormDraft | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  return null
}

function saveDraft(draft: ExpenseFormDraft | null) {
  try {
    if (draft) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore storage errors
  }
}

interface ExpenseFormProviderProps {
  children: ReactNode
}

export function ExpenseFormProvider({ children }: ExpenseFormProviderProps) {
  const navigate = useNavigate()
  const [draft, setDraftState] = useState<ExpenseFormDraft | null>(loadDraft)

  useEffect(() => {
    saveDraft(draft)
  }, [draft])

  const setDraft = useCallback((newDraft: ExpenseFormDraft | null) => {
    setDraftState(newDraft)
  }, [])

  const updateDraft = useCallback((updates: Partial<ExpenseFormDraft>) => {
    setDraftState((prev) => {
      if (!prev) return prev
      return { ...prev, ...updates }
    })
  }, [])

  const clearDraft = useCallback(() => {
    setDraftState(null)
  }, [])

  const startExpenseForm = useCallback(
    (target: { id: string } | { date: string }) => {
      // Fresh entry: discard any leftover draft so it can't prefill the form,
      // then navigate. Keeping clear+navigate together here means a new entry
      // point can't accidentally skip the clear.
      setDraftState(null)
      if ('id' in target) {
        void navigate(`/expenses/${target.id}`)
      } else {
        void navigate(`/expenses/new?date=${target.date}`)
      }
    },
    [navigate]
  )

  return (
    <ExpenseFormContext.Provider
      value={{ draft, setDraft, updateDraft, clearDraft, startExpenseForm }}
    >
      {children}
    </ExpenseFormContext.Provider>
  )
}

export function useExpenseFormContext() {
  const context = useContext(ExpenseFormContext)
  if (!context) {
    throw new Error('useExpenseFormContext must be used within ExpenseFormProvider')
  }
  return context
}
