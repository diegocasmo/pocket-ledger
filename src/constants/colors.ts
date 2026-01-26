export const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
  '#f43f5e', // rose
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#6366f1', // indigo
  '#a855f7', // violet
  '#d946ef', // fuchsia
  '#84cc16', // lime
  '#10b981', // emerald
  '#f59e0b', // amber
  '#78716c', // stone
  '#71717a', // zinc
] as const

export const COLOR_NAMES: Record<(typeof PRESET_COLORS)[number], string> = {
  '#ef4444': 'Red',
  '#f97316': 'Orange',
  '#eab308': 'Yellow',
  '#22c55e': 'Green',
  '#3b82f6': 'Blue',
  '#8b5cf6': 'Purple',
  '#ec4899': 'Pink',
  '#6b7280': 'Gray',
  '#f43f5e': 'Rose',
  '#14b8a6': 'Teal',
  '#06b6d4': 'Cyan',
  '#0ea5e9': 'Sky',
  '#6366f1': 'Indigo',
  '#a855f7': 'Violet',
  '#d946ef': 'Fuchsia',
  '#84cc16': 'Lime',
  '#10b981': 'Emerald',
  '#f59e0b': 'Amber',
  '#78716c': 'Stone',
  '#71717a': 'Zinc',
}
