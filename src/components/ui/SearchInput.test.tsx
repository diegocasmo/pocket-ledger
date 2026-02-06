import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Search..." />)

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('calls onChange on typing', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<SearchInput value="" onChange={handleChange} placeholder="Search..." />)

    await user.type(screen.getByPlaceholderText('Search...'), 'a')

    expect(handleChange).toHaveBeenCalledWith('a')
  })

  it('shows clear button when value is non-empty', () => {
    render(<SearchInput value="test" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument()
  })

  it('hides clear button when value is empty', () => {
    render(<SearchInput value="" onChange={vi.fn()} />)

    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()
  })

  it('calls onChange with empty string on clear button click', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<SearchInput value="test" onChange={handleChange} />)

    await user.click(screen.getByRole('button', { name: /clear search/i }))

    expect(handleChange).toHaveBeenCalledWith('')
  })

  it('calls onClear instead of onChange when provided', async () => {
    const handleChange = vi.fn()
    const handleClear = vi.fn()
    const user = userEvent.setup()

    render(<SearchInput value="test" onChange={handleChange} onClear={handleClear} />)

    await user.click(screen.getByRole('button', { name: /clear search/i }))

    expect(handleClear).toHaveBeenCalled()
    expect(handleChange).not.toHaveBeenCalled()
  })
})
