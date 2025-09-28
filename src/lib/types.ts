// Global TypeScript types for the multi-tool platform

export interface CostItem {
  id: string;
  name: string;
  unitCost: number;
  quantity: number;
  total: number; // calculated field
  category: string;
  notes?: string;
}

export interface CostComparison {
  id: string;
  title: string;
  description?: string;
  items: CostItem[];
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface ToolLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  filename?: string;
  data: any;
}

export interface FileUploadResult {
  success: boolean;
  data?: any;
  error?: string;
}