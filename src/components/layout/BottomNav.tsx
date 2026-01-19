import { NavLink } from 'react-router-dom'
import { Calendar, BarChart3, Tag, Settings, Plus } from 'lucide-react'

interface BottomNavProps {
  onAddExpense: () => void
}

const navItems = [
  {
    to: '/calendar',
    label: 'Calendar',
    icon: <Calendar className="w-6 h-6" />,
  },
  {
    to: '/insights',
    label: 'Insights',
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    to: '/categories',
    label: 'Categories',
    icon: <Tag className="w-6 h-6" />,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: <Settings className="w-6 h-6" />,
  },
]

export function BottomNav({ onAddExpense }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-primary)] border-t border-[var(--color-border)] safe-bottom">
      <div className="max-w-lg mx-auto flex justify-around items-center relative">
        {navItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-4 text-xs transition-colors ${
                isActive
                  ? 'text-primary-500'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`
            }
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </NavLink>
        ))}

        {/* FAB Add Button */}
        <button
          onClick={onAddExpense}
          className="flex items-center justify-center w-14 h-14 -mt-7 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 active:bg-primary-700 transition-colors"
          aria-label="Add expense"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>

        {navItems.slice(2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-4 text-xs transition-colors ${
                isActive
                  ? 'text-primary-500'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`
            }
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
