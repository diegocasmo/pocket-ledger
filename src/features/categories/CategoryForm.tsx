import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PRESET_COLORS } from '../../constants/colors'

interface CategoryFormProps {
  name: string
  color: string
  onNameChange: (name: string) => void
  onColorChange: (color: string) => void
  onSubmit: () => void
  onCancel: () => void
  onDelete?: () => void
  isEditing: boolean
  isSubmitting: boolean
  isDeleting?: boolean
}

export function CategoryForm({
  name,
  color,
  onNameChange,
  onColorChange,
  onSubmit,
  onCancel,
  onDelete,
  isEditing,
  isSubmitting,
  isDeleting = false,
}: CategoryFormProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Category name"
        autoFocus
      />
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              onClick={() => onColorChange(presetColor)}
              className={`w-8 h-8 rounded-full transition-transform ${
                color === presetColor
                  ? 'ring-2 ring-primary-500 ring-offset-2 scale-110'
                  : ''
              }`}
              style={{ backgroundColor: presetColor }}
              aria-label={`Select color ${presetColor}`}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        {isEditing ? (
          <>
            {onDelete && (
              <Button
                variant="danger"
                onClick={onDelete}
                className="flex-1"
                disabled={isDeleting}
              >
                Delete
              </Button>
            )}
            <Button
              onClick={onSubmit}
              className="flex-1"
              disabled={!name.trim() || isSubmitting}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className="flex-1"
              disabled={!name.trim() || isSubmitting}
            >
              Create
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
