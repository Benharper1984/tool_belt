'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Check, Code, FileText, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { CostItem, CostItemSchema, calculateItemTotal } from '@/lib/cost-comparison';

interface CodeEditorProps {
  data: CostItem[];
  onChange: (data: CostItem[]) => void;
  format: 'json' | 'yaml';
}

export default function CodeEditor({ data, onChange, format }: CodeEditorProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Convert data to formatted code
  const dataToCode = useCallback((items: CostItem[], format: 'json' | 'yaml'): string => {
    if (format === 'json') {
      return JSON.stringify(items, null, 2);
    } else {
      // Simple YAML conversion (for basic objects)
      if (items.length === 0) return '';
      
      return items.map(item => {
        return [
          `- id: "${item.id}"`,
          `  name: "${item.name}"`,
          `  unitCost: ${item.unitCost}`,
          `  quantity: ${item.quantity}`,
          `  total: ${item.total}`,
          `  category: "${item.category}"`,
          ...(item.notes ? [`  notes: "${item.notes}"`] : [])
        ].join('\n');
      }).join('\n');
    }
  }, []);

  // Copy to clipboard functionality
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Sample format templates
  const getJsonTemplate = () => {
    return JSON.stringify([
      {
        "id": "unique-id-1",
        "name": "Sample Item",
        "unitCost": 100,
        "quantity": 2,
        "total": 200,
        "category": "Materials",
        "notes": "Optional notes"
      }
    ], null, 2);
  };

  const getYamlTemplate = () => {
    return `- id: "unique-id-1"
  name: "Sample Item"
  unitCost: 100
  quantity: 2
  total: 200
  category: "Materials"
  notes: "Optional notes"`;
  };

  const getMinimalJsonTemplate = () => {
    return JSON.stringify([
      {
        "name": "Sample Item",
        "unitCost": 100,
        "quantity": 2,
        "category": "Materials"
      }
    ], null, 2);
  };

  const getMinimalYamlTemplate = () => {
    return `- name: "Sample Item"
  unitCost: 100
  quantity: 2
  category: "Materials"`;
  };

  // Parse code to data
  const codeToData = useCallback((codeString: string, format: 'json' | 'yaml'): CostItem[] | null => {
    try {
      if (!codeString.trim()) return [];

      let parsed: any;

      if (format === 'json') {
        parsed = JSON.parse(codeString);
      } else {
        // Simple YAML parser (basic implementation)
        parsed = parseYAML(codeString);
      }

      if (!Array.isArray(parsed)) {
        throw new Error('Data must be an array of cost items');
      }

      // Validate each item
      const validatedItems: CostItem[] = [];
      for (const item of parsed) {
        try {
          const validatedItem = CostItemSchema.parse(item);
          // Recalculate total to ensure consistency
          validatedItem.total = calculateItemTotal(validatedItem.unitCost, validatedItem.quantity);
          validatedItems.push(validatedItem);
        } catch (validationError) {
          throw new Error(`Invalid item: ${item.name || 'Unknown'} - ${validationError}`);
        }
      }

      return validatedItems;
    } catch (err) {
      return null;
    }
  }, []);

  // Simple YAML parser for basic objects (limited implementation)
  const parseYAML = (yamlString: string): any[] => {
    const items: any[] = [];
    const lines = yamlString.split('\n').filter(line => line.trim());
    let currentItem: any = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('- ')) {
        // New item
        if (currentItem) {
          items.push(currentItem);
        }
        currentItem = {};
        
        // Parse first property
        const keyValue = trimmed.substring(2).split(': ');
        if (keyValue.length === 2) {
          const key = keyValue[0];
          let value: any = keyValue[1];
          
          // Remove quotes and parse numbers
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          } else if (!isNaN(Number(value))) {
            value = Number(value);
          }
          
          currentItem[key] = value;
        }
      } else if (trimmed.includes(': ') && currentItem) {
        // Property of current item
        const keyValue = trimmed.split(': ');
        if (keyValue.length === 2) {
          const key = keyValue[0];
          let value: any = keyValue[1];
          
          // Remove quotes and parse numbers
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          } else if (!isNaN(Number(value))) {
            value = Number(value);
          }
          
          currentItem[key] = value;
        }
      }
    }

    if (currentItem) {
      items.push(currentItem);
    }

    return items;
  };

  // Sync data to code when data changes
  useEffect(() => {
    const newCode = dataToCode(data, format);
    setCode(newCode);
    setError(null);
    setIsValid(true);
  }, [data, format, dataToCode]);

  // Handle code changes
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    
    // Try to parse the code
    const parsedData = codeToData(newCode, format);
    
    if (parsedData === null) {
      setError('Invalid format or syntax error');
      setIsValid(false);
    } else {
      setError(null);
      setIsValid(true);
      // Don't update data while typing to avoid cursor jumps
      // onChange(parsedData);
    }
  };

  // Apply code changes to data
  const applyChanges = () => {
    const parsedData = codeToData(code, format);
    if (parsedData !== null) {
      onChange(parsedData);
      setError(null);
      setIsValid(true);
    }
  };

  // Reset to current data
  const resetCode = () => {
    const newCode = dataToCode(data, format);
    setCode(newCode);
    setError(null);
    setIsValid(true);
  };

  return (
    <div className="space-y-4">
      {/* Header with template buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {format === 'json' ? (
            <Code className="w-5 h-5 text-gray-600" />
          ) : (
            <FileText className="w-5 h-5 text-gray-600" />
          )}
          <h3 className="font-medium text-gray-900">
            {format.toUpperCase()} Editor
          </h3>
          {isValid ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
        </div>

        <div className="flex space-x-2">
          {/* Template copy buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(
                format === 'json' ? getMinimalJsonTemplate() : getMinimalYamlTemplate(),
                'minimal'
              )}
              className="text-xs"
            >
              {copySuccess === 'minimal' ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span className="ml-1">Copy Minimal</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(
                format === 'json' ? getJsonTemplate() : getYamlTemplate(),
                'full'
              )}
              className="text-xs"
            >
              {copySuccess === 'full' ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span className="ml-1">Copy Full</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={resetCode}
            disabled={isValid && code === dataToCode(data, format)}
          >
            Reset
          </Button>
          <Button
            size="sm"
            onClick={applyChanges}
            disabled={!code.trim() || !isValid}
          >
            Apply Changes
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          className={`w-full h-80 p-4 font-mono text-sm bg-gray-50 border-none resize-none focus:outline-none focus:bg-white ${
            !isValid ? 'bg-red-50' : ''
          }`}
          placeholder={`Enter ${format.toUpperCase()} data here...`}
          spellCheck={false}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Template examples */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">Quick Start Templates</h4>
        <div className="space-y-3 text-sm">
          <div>
            <div className="font-medium text-blue-800 mb-1">Minimal Format (required fields only):</div>
            <div className="bg-white p-3 rounded border text-xs font-mono overflow-x-auto">
              <pre>{format === 'json' ? getMinimalJsonTemplate() : getMinimalYamlTemplate()}</pre>
            </div>
            <div className="text-blue-600 text-xs mt-1">
              • id and total are auto-generated • notes is optional
            </div>
          </div>
          
          <div>
            <div className="font-medium text-blue-800 mb-1">Full Format (all fields):</div>
            <div className="bg-white p-3 rounded border text-xs font-mono overflow-x-auto">
              <pre>{format === 'json' ? getJsonTemplate() : getYamlTemplate()}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p className="mb-2">
          <strong>Tip:</strong> Use the "Copy Minimal" or "Copy Full" buttons above to get started quickly.
          Edit the code and click "Apply Changes" to update the table.
        </p>
        {format === 'json' && (
          <p>
            JSON format: Array of objects with required fields: name, unitCost, quantity, category.
          </p>
        )}
        {format === 'yaml' && (
          <p>
            YAML format: List of items starting with "-" followed by key: value pairs.
          </p>
        )}
      </div>
    </div>
  );
}