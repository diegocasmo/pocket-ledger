export interface Expense {
  id: string;
  date: string;              // 'YYYY-MM-DD', single date only
  amountCents: number;       // Integer cents (1234 = $12.34)
  categoryId: string;
  note?: string;             // Max 500 chars
  createdAt: number;         // ms epoch
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;             // Hex color
  usageCount: number;        // For sorting by frequency
}

export interface Settings {
  id: 'settings';
  weekStartsOn: 0 | 1;       // 0 = Sunday, 1 = Monday
  theme: 'light' | 'dark' | 'system';
}

export type ThemeOption = 'light' | 'dark' | 'system';

export interface RangeAggregate {
  totalCents: number;
  byCategory: Record<string, number>;  // categoryId -> totalCents
  byDay: Record<string, number>;       // 'YYYY-MM-DD' -> totalCents
}
