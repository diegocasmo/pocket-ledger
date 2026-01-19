import { useState, useCallback } from 'react'

interface UseDeleteConfirmationOptions<T> {
  onDelete: (item: T) => Promise<void>
  onSuccess?: () => void
}

export function useDeleteConfirmation<T>(options: UseDeleteConfirmationOptions<T>) {
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const requestDelete = useCallback((item: T) => {
    setItemToDelete(item)
  }, [])

  const cancelDelete = useCallback(() => {
    setItemToDelete(null)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return

    setIsDeleting(true)
    try {
      await options.onDelete(itemToDelete)
      setItemToDelete(null)
      options.onSuccess?.()
    } finally {
      setIsDeleting(false)
    }
  }, [itemToDelete, options])

  return {
    itemToDelete,
    isOpen: itemToDelete !== null,
    isDeleting,
    requestDelete,
    cancelDelete,
    confirmDelete,
  }
}
