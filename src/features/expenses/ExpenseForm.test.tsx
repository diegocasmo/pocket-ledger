import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpenseForm } from '@/features/expenses/ExpenseForm'
import { db } from '@/db'
import { renderWithClient } from '@/test/setup'

describe('ExpenseForm', () => {
  beforeEach(async () => {
    await db.categories.bulkAdd([
      { id: 'cat-1', name: 'Food', color: '#ff0000', usageCount: 10 },
      { id: 'cat-2', name: 'Transport', color: '#00ff00', usageCount: 5 },
    ])
  })

  describe('validation', () => {
    it('rejects amount <= 0', async () => {
      const onSubmit = vi.fn()
      renderWithClient(<ExpenseForm date="2024-01-15" onSubmit={onSubmit} />)

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      // Enter 0 as amount
      const amountInput = screen.getByLabelText('Amount')
      await userEvent.type(amountInput, '0')

      // Select a category
      const categorySelect = screen.getByLabelText('Category')
      await userEvent.selectOptions(categorySelect, 'cat-1')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /add expense/i })
      fireEvent.click(submitButton)

      expect(screen.getByText('Please enter a valid amount')).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('rejects empty amount', async () => {
      const onSubmit = vi.fn()
      renderWithClient(<ExpenseForm date="2024-01-15" onSubmit={onSubmit} />)

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      // Select a category without entering amount
      const categorySelect = screen.getByLabelText('Category')
      await userEvent.selectOptions(categorySelect, 'cat-1')

      const submitButton = screen.getByRole('button', { name: /add expense/i })
      fireEvent.click(submitButton)

      expect(screen.getByText('Please enter a valid amount')).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('requires category selection', async () => {
      const onSubmit = vi.fn()
      renderWithClient(<ExpenseForm date="2024-01-15" onSubmit={onSubmit} />)

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      // Enter valid amount but no category
      const amountInput = screen.getByLabelText('Amount')
      await userEvent.type(amountInput, '10.00')

      const submitButton = screen.getByRole('button', { name: /add expense/i })
      fireEvent.click(submitButton)

      expect(screen.getByText('Please select a category')).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('rejects note > 500 characters', async () => {
      const onSubmit = vi.fn()
      renderWithClient(<ExpenseForm date="2024-01-15" onSubmit={onSubmit} />)

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      const amountInput = screen.getByLabelText('Amount')
      await userEvent.type(amountInput, '10.00')

      const categorySelect = screen.getByLabelText('Category')
      await userEvent.selectOptions(categorySelect, 'cat-1')

      // Note input has maxLength=500, but we test the validation logic
      const noteInput = screen.getByLabelText('Note (optional)')
      const longNote = 'a'.repeat(501)
      // Bypass maxLength by setting value directly
      fireEvent.change(noteInput, { target: { value: longNote } })

      const submitButton = screen.getByRole('button', { name: /add expense/i })
      fireEvent.click(submitButton)

      expect(screen.getByText('Note must be 500 characters or less')).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('rejects future dates', async () => {
      const onSubmit = vi.fn()
      const futureDate = '2099-12-31'
      renderWithClient(<ExpenseForm date={futureDate} onSubmit={onSubmit} />)

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      const amountInput = screen.getByLabelText('Amount')
      await userEvent.type(amountInput, '10.00')

      const categorySelect = screen.getByLabelText('Category')
      await userEvent.selectOptions(categorySelect, 'cat-1')

      const submitButton = screen.getByRole('button', { name: /add expense/i })
      fireEvent.click(submitButton)

      expect(screen.getByText("Can't add expenses for future dates")).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('submission', () => {
    it('calls onSubmit with cents (not dollars)', async () => {
      const onSubmit = vi.fn()
      renderWithClient(<ExpenseForm date="2024-01-15" onSubmit={onSubmit} />)

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      const amountInput = screen.getByLabelText('Amount')
      await userEvent.type(amountInput, '12.34')

      const categorySelect = screen.getByLabelText('Category')
      await userEvent.selectOptions(categorySelect, 'cat-1')

      const submitButton = screen.getByRole('button', { name: /add expense/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          amountCents: 1234,
          categoryId: 'cat-1',
          note: undefined,
        })
      })
    })

    it('trims note and passes undefined if empty', async () => {
      const onSubmit = vi.fn()
      renderWithClient(<ExpenseForm date="2024-01-15" onSubmit={onSubmit} />)

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      const amountInput = screen.getByLabelText('Amount')
      await userEvent.type(amountInput, '5.00')

      const categorySelect = screen.getByLabelText('Category')
      await userEvent.selectOptions(categorySelect, 'cat-1')

      // Enter whitespace-only note
      const noteInput = screen.getByLabelText('Note (optional)')
      await userEvent.type(noteInput, '   ')

      const submitButton = screen.getByRole('button', { name: /add expense/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          amountCents: 500,
          categoryId: 'cat-1',
          note: undefined,
        })
      })
    })

    it('trims note and passes trimmed value', async () => {
      const onSubmit = vi.fn()
      renderWithClient(<ExpenseForm date="2024-01-15" onSubmit={onSubmit} />)

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      const amountInput = screen.getByLabelText('Amount')
      await userEvent.type(amountInput, '5.00')

      const categorySelect = screen.getByLabelText('Category')
      await userEvent.selectOptions(categorySelect, 'cat-1')

      const noteInput = screen.getByLabelText('Note (optional)')
      await userEvent.type(noteInput, '  Coffee at cafe  ')

      const submitButton = screen.getByRole('button', { name: /add expense/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          amountCents: 500,
          categoryId: 'cat-1',
          note: 'Coffee at cafe',
        })
      })
    })
  })

  describe('edit mode', () => {
    it('pre-fills existing values', async () => {
      const expense = {
        id: 'expense-1',
        date: '2024-01-15',
        amountCents: 2550,
        categoryId: 'cat-1',
        note: 'Lunch',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      renderWithClient(
        <ExpenseForm date="2024-01-15" expense={expense} onSubmit={vi.fn()} />
      )

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      const amountInput = screen.getByLabelText('Amount') as HTMLInputElement
      expect(amountInput.value).toBe('25.50')

      const categorySelect = screen.getByLabelText('Category') as HTMLSelectElement
      expect(categorySelect.value).toBe('cat-1')

      const noteInput = screen.getByLabelText('Note (optional)') as HTMLInputElement
      expect(noteInput.value).toBe('Lunch')
    })

    it('shows Save button in edit mode', async () => {
      const expense = {
        id: 'expense-1',
        date: '2024-01-15',
        amountCents: 1000,
        categoryId: 'cat-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      renderWithClient(
        <ExpenseForm date="2024-01-15" expense={expense} onSubmit={vi.fn()} />
      )

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /add expense/i })).not.toBeInTheDocument()
    })

    it('shows Delete button when onDelete is provided', async () => {
      const expense = {
        id: 'expense-1',
        date: '2024-01-15',
        amountCents: 1000,
        categoryId: 'cat-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      const onDelete = vi.fn()
      renderWithClient(
        <ExpenseForm
          date="2024-01-15"
          expense={expense}
          onSubmit={vi.fn()}
          onDelete={onDelete}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Food')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton).toBeInTheDocument()

      fireEvent.click(deleteButton)
      expect(onDelete).toHaveBeenCalled()
    })
  })
})
