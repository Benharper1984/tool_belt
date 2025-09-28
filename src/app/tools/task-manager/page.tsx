import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

export default function TaskManagerTool() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
        <p className="text-gray-600 mt-2">
          Organize and prioritize tasks with collaborative features.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Advanced task management with team collaboration tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-500">This tool is currently under development.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}