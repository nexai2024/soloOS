'use client';

import { useState, ReactNode } from 'react';
import {
  LayoutDashboard,
  Lightbulb,
  Map,
  Server,
  Megaphone,
  Users,
  Wrench,
  Menu,
  X,
  Moon,
  Sun,
  Bell,
  ChevronRight
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { useTheme } from '@/contexts/ThemeContext';
import { SearchBar } from './SearchBar';

interface DashboardLayoutProps {
  children: ReactNode;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export default function DashboardLayout({ children, activeModule, onModuleChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark, toggleTheme } = useTheme();

  const modules = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, description: 'Single pane of glass' },
    { id: 'ideation', name: 'Ideation', icon: Lightbulb, description: 'Capture & validate ideas' },
    { id: 'planning', name: 'Product & Planning', icon: Map, description: 'Roadmap & features' },
    { id: 'devops', name: 'DevOps-lite', icon: Server, description: 'Deployments & repos' },
    { id: 'marketing', name: 'Marketing & Launch', icon: Megaphone, description: 'Campaigns & launches' },
    { id: 'users', name: 'User & Revenue', icon: Users, description: 'Users & subscriptions' },
    { id: 'ops', name: 'Ops & Support', icon: Wrench, description: 'Incidents & support' }
  ];

  const activeModuleData = modules.find(m => m.id === activeModule);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <div
        className={`fixed inset-y-0 left-0 z-50 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-lg">SoloOS</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>

          <nav className="flex-1 py-4 px-2 overflow-y-auto">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  className={`w-full flex items-center ${
                    sidebarOpen ? 'justify-start px-4' : 'justify-center px-2'
                  } py-3 mb-1 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : ''} flex-shrink-0`} />
                  {sidebarOpen && (
                    <div className="flex-1 text-left">
                      <div className="font-medium">{module.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">{module.description}</div>
                    </div>
                  )}
                  {isActive && sidebarOpen && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className={`flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
              <UserButton
                afterSignOutUrl="/login"
                appearance={{
                  elements: {
                    avatarBox: 'h-8 w-8',
                  },
                }}
                showName={sidebarOpen}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {activeModuleData?.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeModuleData?.description}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <SearchBar />
            </div>

            <button
              className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
