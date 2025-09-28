'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationStructure } from '../../../tools-config';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">GT</span>
          </div>
          <span className="font-bold text-gray-900">General Tools</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        {navigationStructure.map((section) => (
          <div key={section.category} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {section.category}
            </h3>
            <ul className="space-y-1">
              {section.tools.map((tool) => {
                const IconComponent = tool.icon;
                const isActive = pathname === tool.route;
                const isComingSoon = tool.status === 'coming-soon';

                return (
                  <li key={tool.route}>
                    <Link
                      href={isComingSoon ? '#' : tool.route}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors',
                        isActive 
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : isComingSoon
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      )}
                      onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="flex-1">{tool.name}</span>
                      {tool.status === 'beta' && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                          Beta
                        </span>
                      )}
                      {tool.status === 'coming-soon' && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          Soon
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Version 0.1.0 • Built with Next.js
        </p>
      </div>
    </div>
  );
}