import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

export default function TimeTrackerTool() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Time Tracker</h1>
        <p className="text-gray-600 mt-2">
          Track time spent on projects and tasks with detailed reporting.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Professional time tracking with project management features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏱️</div>
            <p className="text-gray-500">This tool is currently under development.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}