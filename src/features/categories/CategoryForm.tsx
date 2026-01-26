import { useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PRESET_COLORS, COLOR_NAMES } from '@/constants/colors'
import type { Category } from '@/types'

export const categoryFormSchema = z.object({
  name: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(1, 'Please enter a category name')),

  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Please select a valid color'),
})

export type CategoryFormData = z.infer<typeof categoryFormSchema>

interface CategoryFormProps {
  category?: Category | null
  initialName?: string
  onSubmit: (data: CategoryFormData) => void
  onCancel: () => void
  onDelete?: () => void
  isSubmitting: boolean
  isDeleting?: boolean
}

export function CategoryForm({
  category,
  initialName,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting,
  isDeleting = false,
}: CategoryFormProps) {
  const isEditing = !!category
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof categoryFormSchema>, unknown, CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: category?.name ?? initialName ?? '',
      color: category?.color ?? PRESET_COLORS[0],
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Name"
        placeholder="Category name"
        autoFocus
        error={errors.name?.message}
        {...register('name')}
      />

      <Controller
        name="color"
        control={control}
        render={({ field }) => {
          const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
            let newIndex: number | null = null

            switch (e.key) {
              case 'ArrowLeft':
                e.preventDefault()
                newIndex = currentIndex > 0 ? currentIndex - 1 : PRESET_COLORS.length - 1
                break
              case 'ArrowRight':
                e.preventDefault()
                newIndex = currentIndex < PRESET_COLORS.length - 1 ? currentIndex + 1 : 0
                break
              case 'Home':
                e.preventDefault()
                newIndex = 0
                break
              case 'End':
                e.preventDefault()
                newIndex = PRESET_COLORS.length - 1
                break
            }

            if (newIndex !== null) {
              field.onChange(PRESET_COLORS[newIndex])
              const container = scrollContainerRef.current
              const buttons = container?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
              buttons?.[newIndex]?.focus()
            }
          }

          return (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Color
              </label>
              <div
                ref={scrollContainerRef}
                role="radiogroup"
                aria-label="Category color"
                className="flex gap-2 overflow-x-auto pb-2 -mb-2"
              >
                {PRESET_COLORS.map((presetColor, index) => {
                  const isSelected = field.value === presetColor
                  return (
                    <button
                      key={presetColor}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => field.onChange(presetColor)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`w-8 h-8 rounded-full transition-transform flex-shrink-0 ${
                        isSelected ? 'ring-2 ring-primary-500 ring-offset-2 scale-110' : ''
                      }`}
                      style={{ backgroundColor: presetColor }}
                      aria-label={COLOR_NAMES[presetColor]}
                    />
                  )
                })}
              </div>
              {errors.color && (
                <p className="mt-1 text-sm text-red-500">{errors.color.message}</p>
              )}
            </div>
          )
        }}
      />

      <div className="flex gap-2">
        {isEditing ? (
          <>
            {onDelete && (
              <Button
                type="button"
                variant="danger"
                onClick={onDelete}
                className="flex-1"
                disabled={isDeleting}
              >
                Delete
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              Create
            </Button>
          </>
        )}
      </div>
    </form>
  )
}
