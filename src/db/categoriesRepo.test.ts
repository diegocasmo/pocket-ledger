import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db'
import {
  initDefaultCategories,
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  incrementUsage,
  categoryHasExpenses,
} from '@/db/categoriesRepo'

describe('categoriesRepo', () => {
  describe('initDefaultCategories', () => {
    it('creates 7 default categories when database is empty', async () => {
      await initDefaultCategories()
      const categories = await db.categories.toArray()
      expect(categories).toHaveLength(7)
    })

    it('does not create duplicates when called multiple times', async () => {
      await initDefaultCategories()
      await initDefaultCategories()
      await initDefaultCategories()
      const categories = await db.categories.toArray()
      expect(categories).toHaveLength(7)
    })

    it('does not add defaults when categories already exist', async () => {
      await db.categories.add({
        id: 'custom-1',
        name: 'Custom Category',
        color: '#000000',
        usageCount: 0,
      })
      await initDefaultCategories()
      const categories = await db.categories.toArray()
      expect(categories).toHaveLength(1)
      expect(categories[0].name).toBe('Custom Category')
    })
  })

  describe('listCategories', () => {
    beforeEach(async () => {
      await db.categories.bulkAdd([
        { id: 'cat-1', name: 'Alpha', color: '#ff0000', usageCount: 5 },
        { id: 'cat-2', name: 'Zeta', color: '#00ff00', usageCount: 10 },
        { id: 'cat-3', name: 'Beta', color: '#0000ff', usageCount: 5 },
      ])
    })

    it('returns categories sorted by usageCount DESC, then name ASC', async () => {
      const categories = await listCategories()
      expect(categories.map((c) => c.name)).toEqual(['Zeta', 'Alpha', 'Beta'])
    })

    it('initializes default categories if database is empty', async () => {
      await db.categories.clear()
      const categories = await listCategories()
      expect(categories).toHaveLength(7)
    })
  })

  describe('getCategory', () => {
    it('returns category by id', async () => {
      await db.categories.add({
        id: 'test-id',
        name: 'Test Category',
        color: '#123456',
        usageCount: 0,
      })
      const category = await getCategory('test-id')
      expect(category).toBeDefined()
      expect(category?.name).toBe('Test Category')
    })

    it('returns undefined for non-existent id', async () => {
      const category = await getCategory('non-existent')
      expect(category).toBeUndefined()
    })
  })

  describe('createCategory', () => {
    it('creates category with correct properties', async () => {
      const category = await createCategory({
        name: 'New Category',
        color: '#abcdef',
      })
      expect(category.name).toBe('New Category')
      expect(category.color).toBe('#abcdef')
      expect(category.usageCount).toBe(0)
      expect(category.id).toBeDefined()
    })

    it('persists category to database', async () => {
      const category = await createCategory({
        name: 'Persisted Category',
        color: '#111111',
      })
      const retrieved = await db.categories.get(category.id)
      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('Persisted Category')
    })

    it('trims name when creating category', async () => {
      const category = await createCategory({
        name: '  Category with spaces  ',
        color: '#abcdef',
      })
      expect(category.name).toBe('Category with spaces')
    })

    it('handles empty name after trimming', async () => {
      const category = await createCategory({
        name: '   ',
        color: '#abcdef',
      })
      expect(category.name).toBe('')
    })
  })

  describe('updateCategory', () => {
    it('updates category name', async () => {
      await db.categories.add({
        id: 'update-test',
        name: 'Original',
        color: '#ffffff',
        usageCount: 0,
      })
      const updated = await updateCategory('update-test', { name: 'Updated' })
      expect(updated.name).toBe('Updated')
      expect(updated.color).toBe('#ffffff')
    })

    it('updates category color', async () => {
      await db.categories.add({
        id: 'color-test',
        name: 'Color Test',
        color: '#000000',
        usageCount: 0,
      })
      const updated = await updateCategory('color-test', { color: '#ff0000' })
      expect(updated.color).toBe('#ff0000')
      expect(updated.name).toBe('Color Test')
    })

    it('throws error when category not found', async () => {
      await expect(
        updateCategory('non-existent', { name: 'New Name' })
      ).rejects.toThrow('Category not found: non-existent')
    })

    it('trims name when updating category', async () => {
      await db.categories.add({
        id: 'trim-test',
        name: 'Original',
        color: '#ffffff',
        usageCount: 0,
      })
      const updated = await updateCategory('trim-test', {
        name: '  Trimmed Name  ',
      })
      expect(updated.name).toBe('Trimmed Name')
    })

    it('handles empty name after trimming on update', async () => {
      await db.categories.add({
        id: 'empty-test',
        name: 'Original',
        color: '#ffffff',
        usageCount: 0,
      })
      const updated = await updateCategory('empty-test', { name: '   ' })
      expect(updated.name).toBe('')
    })
  })

  describe('deleteCategory', () => {
    it('deletes category when it has no expenses', async () => {
      await db.categories.add({
        id: 'delete-test',
        name: 'To Delete',
        color: '#000000',
        usageCount: 0,
      })
      await deleteCategory('delete-test')
      const category = await db.categories.get('delete-test')
      expect(category).toBeUndefined()
    })

    it('throws error when category has expenses', async () => {
      await db.categories.add({
        id: 'has-expenses',
        name: 'Has Expenses',
        color: '#000000',
        usageCount: 1,
      })
      await db.expenses.add({
        id: 'expense-1',
        date: '2024-01-15',
        amountCents: 1000,
        categoryId: 'has-expenses',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      await expect(deleteCategory('has-expenses')).rejects.toThrow(
        'Cannot delete category with existing expenses'
      )
    })
  })

  describe('incrementUsage', () => {
    it('increments usage count by 1', async () => {
      await db.categories.add({
        id: 'increment-test',
        name: 'Increment Test',
        color: '#000000',
        usageCount: 5,
      })
      await incrementUsage('increment-test')
      const category = await db.categories.get('increment-test')
      expect(category?.usageCount).toBe(6)
    })

    it('increments from 0 correctly', async () => {
      await db.categories.add({
        id: 'zero-test',
        name: 'Zero Test',
        color: '#000000',
        usageCount: 0,
      })
      await incrementUsage('zero-test')
      const category = await db.categories.get('zero-test')
      expect(category?.usageCount).toBe(1)
    })

    it('does nothing for non-existent category', async () => {
      // Should not throw
      await incrementUsage('non-existent')
    })
  })

  describe('categoryHasExpenses', () => {
    it('returns true when category has expenses', async () => {
      await db.categories.add({
        id: 'with-expense',
        name: 'With Expense',
        color: '#000000',
        usageCount: 1,
      })
      await db.expenses.add({
        id: 'expense-1',
        date: '2024-01-15',
        amountCents: 1000,
        categoryId: 'with-expense',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      const hasExpenses = await categoryHasExpenses('with-expense')
      expect(hasExpenses).toBe(true)
    })

    it('returns false when category has no expenses', async () => {
      await db.categories.add({
        id: 'without-expense',
        name: 'Without Expense',
        color: '#000000',
        usageCount: 0,
      })
      const hasExpenses = await categoryHasExpenses('without-expense')
      expect(hasExpenses).toBe(false)
    })

    it('returns false for non-existent category', async () => {
      const hasExpenses = await categoryHasExpenses('non-existent')
      expect(hasExpenses).toBe(false)
    })
  })
})
