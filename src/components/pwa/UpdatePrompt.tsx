import { useState } from 'react'
import { X, RefreshCw } from 'lucide-react'
import { usePWAUpdate } from '@/hooks/usePWAUpdate'

export function UpdatePrompt() {
  const { needRefresh, applyUpdate } = usePWAUpdate()
  const [dismissed, setDismissed] = useState(false)

  if (!needRefresh || dismissed) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4">
      <div className="max-w-lg mx-auto bg-primary-500 text-white rounded-lg shadow-lg p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <RefreshCw className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            A new version is available
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={applyUpdate}
            className="px-3 py-1.5 bg-white text-primary-600 text-sm font-medium rounded-md hover:bg-primary-50 transition-colors"
          >
            Reload
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-primary-600 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
