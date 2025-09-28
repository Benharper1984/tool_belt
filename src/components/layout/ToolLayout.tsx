import { ToolLayoutProps } from '@/lib/types';

export default function ToolLayout({ 
  title, 
  description, 
  actions, 
  children 
}: ToolLayoutProps) {
  return (
    <div className="min-h-screen ml-64">
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}