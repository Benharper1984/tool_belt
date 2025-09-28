import { lazy } from 'react';
import { Calculator, TrendingUp, Clock, CheckSquare } from 'lucide-react';

export interface ToolModule {
  id: string;
  name: string;
  description: string;
  route: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  techStack: string[];
  category: 'finance' | 'productivity' | 'design' | 'data';
  icon: React.ComponentType<any>;
  status: 'active' | 'beta' | 'coming-soon';
}

export interface ToolConfig {
  // Standard props all tools receive
  userId?: string;
  theme?: 'light' | 'dark';
  onSave?: (data: any) => void;
  onExport?: (format: string, data: any) => void;
}

// Tool registry - Central registry for all tools
export const toolsRegistry: ToolModule[] = [
  {
    id: 'cost-comparison',
    name: 'Cost Comparison Tool',
    description: 'Compare costs across different scenarios with editable tables and charts',
    route: '/tools/cost-comparison',
    component: lazy(() => import('@/app/tools/cost-comparison/page')),
    techStack: ['React', 'Recharts', '@tanstack/react-table', 'Zod'],
    category: 'finance',
    icon: Calculator,
    status: 'active'
  },
  {
    id: 'roi-calculator',
    name: 'ROI Calculator',
    description: 'Calculate return on investment with projection charts and analysis',
    route: '/tools/roi-calculator',
    component: lazy(() => import('@/app/tools/roi-calculator/page')),
    techStack: ['React', 'Recharts', 'React Hook Form'],
    category: 'finance',
    icon: TrendingUp,
    status: 'coming-soon'
  },
  {
    id: 'time-tracker',
    name: 'Time Tracker',
    description: 'Track time spent on projects and tasks with detailed reporting',
    route: '/tools/time-tracker',
    component: lazy(() => import('@/app/tools/time-tracker/page')),
    techStack: ['React', 'D3.js', 'Zustand'],
    category: 'productivity',
    icon: Clock,
    status: 'coming-soon'
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    description: 'Organize and prioritize tasks with collaborative features',
    route: '/tools/task-manager',
    component: lazy(() => import('@/app/tools/task-manager/page')),
    techStack: ['React', 'DnD Kit', 'Zustand'],
    category: 'productivity',
    icon: CheckSquare,
    status: 'coming-soon'
  }
];

// Navigation structure for sidebar
export interface NavigationCategory {
  category: string;
  tools: Pick<ToolModule, 'name' | 'route' | 'icon' | 'status'>[];
}

export const navigationStructure: NavigationCategory[] = [
  {
    category: 'Financial Tools',
    tools: toolsRegistry
      .filter(tool => tool.category === 'finance')
      .map(({ name, route, icon, status }) => ({ name, route, icon, status }))
  },
  {
    category: 'Productivity Tools', 
    tools: toolsRegistry
      .filter(tool => tool.category === 'productivity')
      .map(({ name, route, icon, status }) => ({ name, route, icon, status }))
  }
];

// Helper functions
export const getToolById = (id: string): ToolModule | undefined => {
  return toolsRegistry.find(tool => tool.id === id);
};

export const getToolsByCategory = (category: ToolModule['category']): ToolModule[] => {
  return toolsRegistry.filter(tool => tool.category === category);
};

export const getActiveTools = (): ToolModule[] => {
  return toolsRegistry.filter(tool => tool.status === 'active');
};