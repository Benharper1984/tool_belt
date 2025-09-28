'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { CostItem, getCategorySummary } from '@/lib/cost-comparison';

interface CostChartsProps {
  data: CostItem[];
  currency: string;
}

// Color palette for charts
const COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#EC4899', // pink-500
  '#6B7280', // gray-500
];

export default function CostCharts({ data, currency }: CostChartsProps) {
  const getCurrencySymbol = (currencyCode: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
    };
    return symbols[currencyCode] || '$';
  };

  // Prepare data for charts
  const categorySummary = getCategorySummary(data);
  const categoryData = Object.entries(categorySummary)
    .map(([category, total]) => ({
      name: category,
      value: total,
      percentage: data.length > 0 ? ((total / data.reduce((sum, item) => sum + item.total, 0)) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const itemData = data
    .map(item => ({
      name: item.name || 'Unnamed Item',
      value: item.total,
      category: item.category,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 items

  const grandTotal = data.reduce((sum, item) => sum + item.total, 0);

  // Custom tooltip for currency formatting
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            {`${getCurrencySymbol(currency)}${payload[0].value.toFixed(2)}`}
          </p>
          {payload[0].payload.percentage && (
            <p className="text-gray-500 text-sm">
              {`${payload[0].payload.percentage.toFixed(1)}%`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Empty state
  if (data.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="opacity-50">
            <CardHeader>
              <CardTitle className="text-gray-400">Chart {i}</CardTitle>
              <CardDescription>Add some cost items to see visualizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-sm">No data to display</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cost by Category</CardTitle>
          <CardDescription>
            Distribution of costs across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Items Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Cost Items</CardTitle>
          <CardDescription>
            Highest cost items (showing top {Math.min(10, itemData.length)})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={itemData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `${getCurrencySymbol(currency)}${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Summary</CardTitle>
          <CardDescription>
            Detailed breakdown by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {getCurrencySymbol(currency)}{category.value.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {category.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span>{getCurrencySymbol(currency)}{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>
            Key metrics and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {data.length}
                </div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {categoryData.length}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>

            {data.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Item Cost:</span>
                  <span className="font-medium">
                    {getCurrencySymbol(currency)}{(grandTotal / data.length).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Highest Item:</span>
                  <span className="font-medium">
                    {getCurrencySymbol(currency)}{Math.max(...data.map(item => item.total)).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Lowest Item:</span>
                  <span className="font-medium">
                    {getCurrencySymbol(currency)}{Math.min(...data.map(item => item.total)).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Largest Category:</span>
                  <span className="font-medium">
                    {categoryData[0]?.name || 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}