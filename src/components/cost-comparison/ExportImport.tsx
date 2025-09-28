'use client';

import React, { useRef } from 'react';
import Papa from 'papaparse';
import { Download, Upload, FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import { Button } from '@/components/ui';
import { CostItem, CostItemSchema, createCostItem } from '@/lib/cost-comparison';

interface ExportImportProps {
  data: CostItem[];
  onImport: (data: CostItem[]) => void;
  filename?: string;
}

export default function ExportImport({ data, onImport, filename = 'cost-comparison' }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export functions
  const exportAsCSV = () => {
    const csvData = data.map(item => ({
      name: item.name,
      category: item.category,
      unitCost: item.unitCost,
      quantity: item.quantity,
      total: item.total,
      notes: item.notes || '',
    }));

    const csv = Papa.unparse(csvData);
    downloadFile(csv, `${filename}.csv`, 'text/csv');
  };

  const exportAsJSON = () => {
    const jsonData = JSON.stringify(data, null, 2);
    downloadFile(jsonData, `${filename}.json`, 'application/json');
  };

  const exportAsTXT = () => {
    let txtContent = `Cost Comparison Report\n`;
    txtContent += `Generated: ${new Date().toLocaleString()}\n`;
    txtContent += `\n${'='.repeat(50)}\n\n`;

    // Summary
    const grandTotal = data.reduce((sum, item) => sum + item.total, 0);
    txtContent += `Total Items: ${data.length}\n`;
    txtContent += `Grand Total: $${grandTotal.toFixed(2)}\n\n`;

    // Items
    txtContent += `COST BREAKDOWN:\n`;
    txtContent += `${'='.repeat(50)}\n`;

    data.forEach((item, index) => {
      txtContent += `${index + 1}. ${item.name}\n`;
      txtContent += `   Category: ${item.category}\n`;
      txtContent += `   Unit Cost: $${item.unitCost.toFixed(2)}\n`;
      txtContent += `   Quantity: ${item.quantity}\n`;
      txtContent += `   Total: $${item.total.toFixed(2)}\n`;
      if (item.notes) {
        txtContent += `   Notes: ${item.notes}\n`;
      }
      txtContent += `\n`;
    });

    // Category summary
    const categoryTotals = data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.total;
      return acc;
    }, {} as Record<string, number>);

    txtContent += `CATEGORY SUMMARY:\n`;
    txtContent += `${'='.repeat(50)}\n`;
    Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, total]) => {
        const percentage = ((total / grandTotal) * 100).toFixed(1);
        txtContent += `${category}: $${total.toFixed(2)} (${percentage}%)\n`;
      });

    downloadFile(txtContent, `${filename}-report.txt`, 'text/plain');
  };

  // Helper function to trigger download
  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.name.toLowerCase().split('.').pop();

    if (fileType === 'csv') {
      importFromCSV(file);
    } else if (fileType === 'json') {
      importFromJSON(file);
    } else {
      alert('Unsupported file format. Please use CSV or JSON files.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const importFromCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const importedData: CostItem[] = [];
          
          for (const row of results.data as any[]) {
            const item = createCostItem({
              name: row.name || '',
              category: row.category || 'Other',
              unitCost: parseFloat(row.unitCost) || 0,
              quantity: parseInt(row.quantity) || 1,
              notes: row.notes || '',
            });

            // Validate the item
            try {
              const validatedItem = CostItemSchema.parse(item);
              importedData.push(validatedItem);
            } catch (validationError) {
              console.warn(`Skipping invalid item: ${item.name}`, validationError);
            }
          }

          if (importedData.length > 0) {
            onImport(importedData);
            alert(`Successfully imported ${importedData.length} items.`);
          } else {
            alert('No valid items found in the CSV file.');
          }
        } catch (error) {
          console.error('CSV import error:', error);
          alert('Error importing CSV file. Please check the format.');
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Error parsing CSV file.');
      }
    });
  };

  const importFromJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON.parse(content);

        if (!Array.isArray(jsonData)) {
          throw new Error('JSON must contain an array of cost items');
        }

        const importedData: CostItem[] = [];

        for (const item of jsonData) {
          // Create item with default values for missing fields
          const costItem = createCostItem({
            ...item,
            name: item.name || '',
            category: item.category || 'Other',
            unitCost: typeof item.unitCost === 'number' ? item.unitCost : 0,
            quantity: typeof item.quantity === 'number' ? item.quantity : 1,
            notes: item.notes || '',
          });

          // Validate the item
          try {
            const validatedItem = CostItemSchema.parse(costItem);
            importedData.push(validatedItem);
          } catch (validationError) {
            console.warn(`Skipping invalid item: ${item.name}`, validationError);
          }
        }

        if (importedData.length > 0) {
          onImport(importedData);
          alert(`Successfully imported ${importedData.length} items.`);
        } else {
          alert('No valid items found in the JSON file.');
        }
      } catch (error) {
        console.error('JSON import error:', error);
        alert('Error importing JSON file. Please check the format.');
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Export Section */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={exportAsCSV}
            disabled={data.length === 0}
            className="flex items-center space-x-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export as CSV</span>
          </Button>

          <Button
            variant="outline"
            onClick={exportAsJSON}
            disabled={data.length === 0}
            className="flex items-center space-x-2"
          >
            <FileJson className="w-4 h-4" />
            <span>Export as JSON</span>
          </Button>

          <Button
            variant="outline"
            onClick={exportAsTXT}
            disabled={data.length === 0}
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Import Section */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <Upload className="w-4 h-4 mr-2" />
          Import Data
        </h3>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Choose File</span>
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <span className="text-sm text-gray-500">
            Supports CSV and JSON formats
          </span>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          <p className="mb-1"><strong>CSV format:</strong> name, category, unitCost, quantity, notes</p>
          <p><strong>JSON format:</strong> Array of cost item objects</p>
        </div>
      </div>

      {/* Sample Data Links */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Sample Data</h4>
        <p className="text-sm text-gray-600 mb-3">
          Need sample data to get started? Download these examples:
        </p>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const sampleData = [
                createCostItem({ name: 'Laptop Computer', category: 'Equipment', unitCost: 1200, quantity: 2 }),
                createCostItem({ name: 'Software License', category: 'Software', unitCost: 99, quantity: 5 }),
                createCostItem({ name: 'Office Supplies', category: 'Materials', unitCost: 50, quantity: 10 }),
              ];
              onImport(sampleData);
            }}
          >
            Load Sample Data
          </Button>
        </div>
      </div>
    </div>
  );
}