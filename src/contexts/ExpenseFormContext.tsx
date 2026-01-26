import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'expense-form-draft'

export interface ExpenseFormDraft {
  amount: string
  categoryId: string
  note: string
  date: string
  expenseId?: string // Present when editing
}

interface ExpenseFormContextValue {
  draft: ExpenseFormDraft | null
  setDraft: (draft: ExpenseFormDraft | null) => void
  updateDraft: (updates: Partial<ExpenseFormDraft>) => void
  clearDraft: () => void
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

  return (
    <ExpenseFormContext.Provider value={{ draft, setDraft, updateDraft, clearDraft }}>
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
