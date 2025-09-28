import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { toolsRegistry } from '../../tools-config';

export default function HomePage() {
  const activeTools = toolsRegistry.filter(tool => tool.status === 'active');
  const comingSoonTools = toolsRegistry.filter(tool => tool.status === 'coming-soon');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            General Tools Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A comprehensive suite of productivity tools designed to streamline your workflow. 
            From financial analysis to project management, we&apos;ve got the tools you need.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/tools/cost-comparison"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Cost Comparison Tool
            </Link>
            <Link 
              href="#tools"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Explore All Tools
            </Link>
          </div>
        </div>

        {/* Active Tools Section */}
        <section id="tools" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Available Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link key={tool.id} href={tool.route}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
                    <CardHeader>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                      </div>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {tool.techStack.slice(0, 3).map((tech) => (
                          <span 
                            key={tech}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                        {tool.techStack.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{tool.techStack.length - 3} more
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Coming Soon Section */}
        {comingSoonTools.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Coming Soon</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonTools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <Card key={tool.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <IconComponent className="w-6 h-6 text-gray-400" />
                        </div>
                        <CardTitle className="text-lg text-gray-700">{tool.name}</CardTitle>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                          Soon
                        </span>
                      </div>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Modular Architecture</h3>
              <p className="text-gray-600 text-sm">
                Each tool is independently developed and can use its optimal tech stack
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">High Performance</h3>
              <p className="text-gray-600 text-sm">
                Lazy loading, optimized rendering, and responsive design for all devices
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Consistent Design</h3>
              <p className="text-gray-600 text-sm">
                Shared UI components and design system ensure seamless user experience
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}