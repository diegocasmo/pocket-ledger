import { InputHTMLAttributes, forwardRef } from 'react'
import { X } from 'lucide-react'

interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, className = '', ...props }, ref) => {
    const handleClear = () => {
      if (onClear) {
        onClear()
      } else {
        onChange('')
      }
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 pr-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${className}`}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'
