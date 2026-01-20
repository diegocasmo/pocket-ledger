import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog } from '@/components/ui/Dialog'

describe('Dialog', () => {
  describe('rendering', () => {
    it('does not render when closed', () => {
      render(
        <Dialog isOpen={false} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Dialog>
      )
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders when open', () => {
      render(
        <Dialog isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Dialog>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders title when provided', () => {
      render(
        <Dialog isOpen={true} onClose={vi.fn()} title="Test Title">
          <div>Content</div>
        </Dialog>
      )
      expect(screen.getAllByText('Test Title')[0]).toBeInTheDocument()
    })

    it('renders children content', () => {
      render(
        <Dialog isOpen={true} onClose={vi.fn()} title="Test">
          <span>Dialog Content</span>
        </Dialog>
      )
      // Content appears in both mobile and desktop views
      const contents = screen.getAllByText('Dialog Content')
      expect(contents.length).toBeGreaterThan(0)
    })
  })

  describe('accessibility - keyboard interaction', () => {
    it('closes on Escape key', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Dialog isOpen={true} onClose={onClose} title="Test">
          <div>Content</div>
        </Dialog>
      )

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })
  })

  describe('close button', () => {
    it('calls onClose when close button clicked', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Dialog isOpen={true} onClose={onClose} title="Test">
          <div>Content</div>
        </Dialog>
      )

      const closeButtons = screen.getAllByLabelText('Close')
      await user.click(closeButtons[0])

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('aria attributes', () => {
    it('has proper dialog role', () => {
      render(
        <Dialog isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Dialog>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })
  })
})
