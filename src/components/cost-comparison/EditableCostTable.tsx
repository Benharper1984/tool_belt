'use client';

import React, { useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { CostItem, calculateItemTotal, DEFAULT_CATEGORIES } from '@/lib/cost-comparison';

interface EditableCostTableProps {
  data: CostItem[];
  onChange: (data: CostItem[]) => void;
  currency: string;
}

const columnHelper = createColumnHelper<CostItem>();

export default function EditableCostTable({ data, onChange, currency }: EditableCostTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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

  const updateItem = useCallback((id: string, field: keyof CostItem, value: any) => {
    const newData = data.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate total when unitCost or quantity changes
        if (field === 'unitCost' || field === 'quantity') {
          updated.total = calculateItemTotal(updated.unitCost, updated.quantity);
        }
        return updated;
      }
      return item;
    });
    onChange(newData);
  }, [data, onChange]);

  const removeItem = useCallback((id: string) => {
    const newData = data.filter(item => item.id !== id);
    onChange(newData);
  }, [data, onChange]);

  const addItem = useCallback(() => {
    const newItem: CostItem = {
      id: crypto.randomUUID(),
      name: '',
      unitCost: 0,
      quantity: 1,
      total: 0,
      category: DEFAULT_CATEGORIES[0],
      notes: '',
    };
    onChange([...data, newItem]);
  }, [data, onChange]);

  const columns = [
    columnHelper.accessor('name', {
      header: 'Item Name',
      cell: ({ getValue, row }) => (
        <Input
          value={getValue()}
          onChange={(e) => updateItem(row.original.id, 'name', e.target.value)}
          placeholder="Enter item name"
          className="w-full"
        />
      ),
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: ({ getValue, row }) => (
        <select
          value={getValue()}
          onChange={(e) => updateItem(row.original.id, 'category', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
        >
          {DEFAULT_CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      ),
    }),
    columnHelper.accessor('unitCost', {
      header: `Unit Cost (${getCurrencySymbol(currency)})`,
      cell: ({ getValue, row }) => (
        <Input
          type="number"
          value={getValue()}
          onChange={(e) => updateItem(row.original.id, 'unitCost', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className="w-24"
        />
      ),
    }),
    columnHelper.accessor('quantity', {
      header: 'Quantity',
      cell: ({ getValue, row }) => (
        <Input
          type="number"
          value={getValue()}
          onChange={(e) => updateItem(row.original.id, 'quantity', parseInt(e.target.value) || 0)}
          placeholder="1"
          className="w-20"
        />
      ),
    }),
    columnHelper.accessor('total', {
      header: `Total (${getCurrencySymbol(currency)})`,
      cell: ({ getValue }) => (
        <span className="font-medium">
          {getCurrencySymbol(currency)}{getValue().toFixed(2)}
        </span>
      ),
    }),
    columnHelper.accessor('notes', {
      header: 'Notes',
      cell: ({ getValue, row }) => (
        <Input
          value={getValue() || ''}
          onChange={(e) => updateItem(row.original.id, 'notes', e.target.value)}
          placeholder="Optional notes"
          className="w-full"
        />
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeItem(row.original.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const grandTotal = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-4">
      {/* Table Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            onClick={addItem}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </Button>
        </div>
        <div className="text-lg font-semibold">
          Grand Total: {getCurrencySymbol(currency)}{grandTotal.toFixed(2)}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center space-x-2 ${
                          header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <div className="w-4 h-4" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.original.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {data.length === 0 && (
          <div className="text-center py-12 bg-white">
            <div className="text-gray-400 mb-4">
              <Plus className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500 mb-4">No cost items added yet.</p>
            <Button onClick={addItem}>Add Your First Item</Button>
          </div>
        )}
      </div>

      {/* Summary */}
      {data.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {data.length} item{data.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xl font-bold text-gray-900">
              Total: {getCurrencySymbol(currency)}{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}