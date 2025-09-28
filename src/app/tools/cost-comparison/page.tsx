'use client';

import { useState, useCallback } from 'react';
import { Calculator, Code, BarChart3, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import EditableCostTable from '@/components/cost-comparison/EditableCostTable';
import CodeEditor from '@/components/cost-comparison/CodeEditor';
import CostCharts from '@/components/cost-comparison/CostCharts';
import ExportImport from '@/components/cost-comparison/ExportImport';
import { 
  CostItem, 
  createCostComparison, 
  createCostItem, 
  SUPPORTED_CURRENCIES 
} from '@/lib/cost-comparison';

type ActiveTab = 'table' | 'code-json' | 'code-yaml' | 'charts' | 'export';

export default function CostComparisonTool() {
  // State management
  const [comparison, setComparison] = useState(() => createCostComparison({
    title: 'New Cost Comparison',
    items: [
      createCostItem({ name: 'Sample Item', category: 'Materials', unitCost: 100, quantity: 2 })
    ]
  }));
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('table');

  // Update comparison data
  const updateItems = useCallback((newItems: CostItem[]) => {
    setComparison(prev => ({
      ...prev,
      items: newItems,
    }));
  }, []);

  const updateTitle = useCallback((newTitle: string) => {
    setComparison(prev => ({ ...prev, title: newTitle }));
  }, []);

  const updateDescription = useCallback((newDescription: string) => {
    setComparison(prev => ({ ...prev, description: newDescription }));
  }, []);

  const updateCurrency = useCallback((newCurrency: string) => {
    setComparison(prev => ({ ...prev, currency: newCurrency }));
  }, []);

  // Tab configuration
  const tabs = [
    { id: 'table' as ActiveTab, label: 'Table View', icon: Calculator },
    { id: 'code-json' as ActiveTab, label: 'JSON Code', icon: Code },
    { id: 'code-yaml' as ActiveTab, label: 'YAML Code', icon: Code },
    { id: 'charts' as ActiveTab, label: 'Charts', icon: BarChart3 },
    { id: 'export' as ActiveTab, label: 'Export/Import', icon: Download },
  ];

  const grandTotal = comparison.items.reduce((sum, item) => sum + item.total, 0);
  const currencySymbol = SUPPORTED_CURRENCIES.find(c => c.code === comparison.currency)?.symbol || '$';

  return (
    <div className="min-h-screen ml-64 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 max-w-2xl">
              <Input
                value={comparison.title}
                onChange={(e) => updateTitle(e.target.value)}
                className="text-2xl font-bold border-none p-0 h-auto bg-transparent focus:bg-white focus:border focus:border-gray-200"
                placeholder="Enter comparison title..."
              />
              <Input
                value={comparison.description || ''}
                onChange={(e) => updateDescription(e.target.value)}
                className="mt-1 text-gray-600 border-none p-0 h-auto bg-transparent focus:bg-white focus:border focus:border-gray-200"
                placeholder="Add a description (optional)..."
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Currency:</label>
                <select
                  value={comparison.currency}
                  onChange={(e) => updateCurrency(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SUPPORTED_CURRENCIES.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Grand Total</div>
                <div className="text-2xl font-bold text-blue-600">
                  {currencySymbol}{grandTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {activeTab === 'table' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Interactive Cost Table</span>
              </CardTitle>
              <CardDescription>
                Add, edit, and manage your cost items with real-time calculations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditableCostTable
                data={comparison.items}
                onChange={updateItems}
                currency={comparison.currency}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'code-json' && (
          <Card>
            <CardHeader>
              <CardTitle>JSON Code Editor</CardTitle>
              <CardDescription>
                Edit your cost data as JSON. Changes sync automatically with the table.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeEditor
                data={comparison.items}
                onChange={updateItems}
                format="json"
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'code-yaml' && (
          <Card>
            <CardHeader>
              <CardTitle>YAML Code Editor</CardTitle>
              <CardDescription>
                Edit your cost data as YAML. Changes sync automatically with the table.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeEditor
                data={comparison.items}
                onChange={updateItems}
                format="yaml"
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Cost Analysis & Visualizations
              </h2>
              <p className="text-gray-600">
                Interactive charts and insights for your cost data
              </p>
            </div>
            
            <CostCharts
              data={comparison.items}
              currency={comparison.currency}
            />
          </div>
        )}

        {activeTab === 'export' && (
          <Card>
            <CardHeader>
              <CardTitle>Export & Import</CardTitle>
              <CardDescription>
                Export your data to various formats or import from existing files.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExportImport
                data={comparison.items}
                onImport={updateItems}
                filename={comparison.title.toLowerCase().replace(/\s+/g, '-')}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Summary (visible on all tabs) */}
      {comparison.items.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white shadow-lg rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Quick Summary</div>
          <div className="font-semibold">{comparison.items.length} items</div>
          <div className="text-lg font-bold text-blue-600">
            {currencySymbol}{grandTotal.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}