import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getToolById } from '../../../../tools-config';

interface ToolPageProps {
  params: {
    'tool-id': string;
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const toolId = params['tool-id'];
  const tool = getToolById(toolId);

  if (!tool) {
    notFound();
  }

  const ToolComponent = tool.component;

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {tool.name}...</p>
        </div>
      </div>
    }>
      <ToolComponent />
    </Suspense>
  );
}