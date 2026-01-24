import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AutocompleteInput } from '@/components/ui/AutocompleteInput'

describe('AutocompleteInput', () => {
  it('shows suggestions when focused and has matching suggestions', () => {
    render(
      <AutocompleteInput
        value="cof"
        onChange={vi.fn()}
        suggestions={['Coffee at Starbucks', 'Coffee beans']}
        label="Note"
      />
    )

    const input = screen.getByLabelText('Note')
    fireEvent.focus(input)

    expect(screen.getByText('Coffee at Starbucks')).toBeInTheDocument()
    expect(screen.getByText('Coffee beans')).toBeInTheDocument()
  })

  it('calls onChange with selected suggestion', () => {
    const onChange = vi.fn()
    render(
      <AutocompleteInput
        value="cof"
        onChange={onChange}
        suggestions={['Coffee at Starbucks']}
        label="Note"
      />
    )

    const input = screen.getByLabelText('Note')
    fireEvent.focus(input)

    const suggestion = screen.getByText('Coffee at Starbucks')
    fireEvent.click(suggestion)

    expect(onChange).toHaveBeenCalledWith('Coffee at Starbucks')
  })

  it('keeps focus on input after selecting suggestion', () => {
    render(
      <AutocompleteInput
        value="cof"
        onChange={vi.fn()}
        suggestions={['Coffee at Starbucks']}
        label="Note"
      />
    )

    const input = screen.getByLabelText('Note')
    fireEvent.focus(input)

    const suggestion = screen.getByText('Coffee at Starbucks')
    fireEvent.click(suggestion)

    expect(document.activeElement).toBe(input)
  })

  it('hides suggestions on blur (tap outside)', () => {
    render(
      <AutocompleteInput
        value="cof"
        onChange={vi.fn()}
        suggestions={['Coffee at Starbucks']}
        label="Note"
      />
    )

    const input = screen.getByLabelText('Note')
    fireEvent.focus(input)

    expect(screen.getByText('Coffee at Starbucks')).toBeInTheDocument()

    fireEvent.blur(input)

    expect(screen.queryByText('Coffee at Starbucks')).not.toBeInTheDocument()
  })

  it('does not show suggestions when value is empty', () => {
    render(
      <AutocompleteInput
        value=""
        onChange={vi.fn()}
        suggestions={['Coffee at Starbucks']}
        label="Note"
      />
    )

    const input = screen.getByLabelText('Note')
    fireEvent.focus(input)

    expect(screen.queryByText('Coffee at Starbucks')).not.toBeInTheDocument()
  })

  it('hides suggestions on Escape key', () => {
    render(
      <AutocompleteInput
        value="cof"
        onChange={vi.fn()}
        suggestions={['Coffee at Starbucks']}
        label="Note"
      />
    )

    const input = screen.getByLabelText('Note')
    fireEvent.focus(input)

    expect(screen.getByText('Coffee at Starbucks')).toBeInTheDocument()

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.queryByText('Coffee at Starbucks')).not.toBeInTheDocument()
  })

  it('does not show suggestions when there are none', () => {
    render(
      <AutocompleteInput
        value="xyz"
        onChange={vi.fn()}
        suggestions={[]}
        label="Note"
      />
    )

    const input = screen.getByLabelText('Note')
    fireEvent.focus(input)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('displays error message when provided', () => {
    render(
      <AutocompleteInput
        value=""
        onChange={vi.fn()}
        suggestions={[]}
        error="Note is required"
      />
    )

    expect(screen.getByText('Note is required')).toBeInTheDocument()
  })

  it('calls onBlur when input loses focus', () => {
    const onBlur = vi.fn()
    render(
      <AutocompleteInput
        value="test"
        onChange={vi.fn()}
        onBlur={onBlur}
        suggestions={[]}
        label="Note"
      />
    )

    const input = screen.getByLabelText('Note')
    fireEvent.focus(input)
    fireEvent.blur(input)

    expect(onBlur).toHaveBeenCalled()
  })

  it('applies maxLength to input', () => {
    render(
      <AutocompleteInput
        value=""
        onChange={vi.fn()}
        suggestions={[]}
        label="Note"
        maxLength={100}
      />
    )

    const input = screen.getByLabelText('Note')
    expect(input).toHaveAttribute('maxLength', '100')
  })
})
