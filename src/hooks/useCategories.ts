import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryHasExpenses,
} from '@/db/categoriesRepo'
import type { Category } from '@/types'

const CATEGORIES_KEY = ['categories']

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: listCategories,
  })
}

export function useCategoryHasExpenses(categoryId: string) {
  return useQuery({
    queryKey: ['categoryHasExpenses', categoryId],
    queryFn: () => categoryHasExpenses(categoryId),
    enabled: !!categoryId,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Pick<Category, 'name' | 'color'>) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
      toast.success('Category created')
    },
    onError: () => {
      toast.error('Failed to create category')
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: string } & Partial<Pick<Category, 'name' | 'color'>>) =>
      updateCategory(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
      toast.success('Category updated')
    },
    onError: () => {
      toast.error('Failed to update category')
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
      toast.success('Category deleted')
    },
    onError: () => {
      toast.error('Failed to delete category')
    },
  })
}
