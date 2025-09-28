import { z } from 'zod';

// Zod schemas for validation
export const CostItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Item name is required'),
  unitCost: z.number().min(0, 'Unit cost must be positive'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  total: z.number(), // calculated field
  category: z.string().min(1, 'Category is required'),
  notes: z.string().optional(),
});

export const CostComparisonSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  items: z.array(CostItemSchema),
  currency: z.string().default('USD'),
  createdAt: z.date(),
  updatedAt: z.date(),
  tags: z.array(z.string()),
});

// TypeScript types derived from Zod schemas
export type CostItem = z.infer<typeof CostItemSchema>;
export type CostComparison = z.infer<typeof CostComparisonSchema>;

// Helper functions for cost calculations
export const calculateItemTotal = (unitCost: number, quantity: number): number => {
  return Math.round((unitCost * quantity) * 100) / 100; // Round to 2 decimal places
};

export const calculateGrandTotal = (items: CostItem[]): number => {
  return items.reduce((sum, item) => sum + item.total, 0);
};

export const getCategorySummary = (items: CostItem[]): Record<string, number> => {
  return items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.total;
    return acc;
  }, {} as Record<string, number>);
};

// Default categories for cost items
export const DEFAULT_CATEGORIES = [
  'Materials',
  'Labor',
  'Equipment',
  'Services',
  'Software',
  'Utilities',
  'Transportation',
  'Other'
];

// Default currencies
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

// Factory function to create new cost item
export const createCostItem = (overrides?: Partial<CostItem>): CostItem => {
  const baseItem = {
    id: crypto.randomUUID(),
    name: '',
    unitCost: 0,
    quantity: 1,
    total: 0,
    category: DEFAULT_CATEGORIES[0],
    notes: '',
  };
  
  const item = { ...baseItem, ...overrides };
  item.total = calculateItemTotal(item.unitCost, item.quantity);
  
  return item;
};

// Factory function to create new cost comparison
export const createCostComparison = (overrides?: Partial<CostComparison>): CostComparison => {
  const now = new Date();
  
  return {
    id: crypto.randomUUID(),
    title: 'New Cost Comparison',
    description: '',
    items: [],
    currency: 'USD',
    createdAt: now,
    updatedAt: now,
    tags: [],
    ...overrides,
  };
};