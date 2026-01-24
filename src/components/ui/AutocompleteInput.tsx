import { useState, useRef, useCallback, forwardRef } from 'react'

interface AutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  suggestions: string[]
  label?: string
  placeholder?: string
  error?: string
  maxLength?: number
}

export const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      suggestions,
      label,
      placeholder,
      error,
      maxLength,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Merge forwarded ref with local ref
    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )

    const showDropdown = isOpen && suggestions.length > 0 && value.length >= 1

    const handleFocus = useCallback(() => {
      setIsOpen(true)
    }, [])

    const handleBlur = useCallback(() => {
      setIsOpen(false)
      onBlur?.()
    }, [onBlur])

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value)
      },
      [onChange]
    )

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }, [])

    const handleSuggestionSelect = useCallback(
      (suggestion: string) => {
        onChange(suggestion)
        setIsOpen(false)
        // Keep focus on input
        inputRef.current?.focus()
      },
      [onChange]
    )

    const inputId = label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="relative w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={setRefs}
          id={inputId}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2 rounded-lg border
            bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-secondary)]
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-[var(--color-border)]'}
          `}
        />
        {showDropdown && (
          <div
            className="
              absolute z-50 w-full mt-1
              bg-[var(--color-bg-primary)]
              border border-[var(--color-border)]
              rounded-lg shadow-lg
              overflow-hidden
            "
            role="listbox"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion}-${index}`}
                type="button"
                role="option"
                className="
                  w-full px-3 py-3 min-h-[44px]
                  text-left text-[var(--color-text-primary)]
                  hover:bg-[var(--color-bg-secondary)]
                  active:bg-[var(--color-bg-tertiary)]
                  focus:outline-none focus:bg-[var(--color-bg-secondary)]
                  border-b border-[var(--color-border)] last:border-b-0
                "
                onMouseDown={(e) => {
                  // Prevent blur before selection
                  e.preventDefault()
                }}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)

AutocompleteInput.displayName = 'AutocompleteInput'
