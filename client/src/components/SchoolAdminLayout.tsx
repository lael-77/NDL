/**
 * School Admin Layout Component
 * Provides navigation sidebar and main content area
 */

import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  BarChart3,
  Settings,
  Bell,
} from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';

interface SchoolAdminLayoutProps {
  children: React.ReactNode;
}

export function SchoolAdminLayout({ children }: SchoolAdminLayoutProps) {
  const location = useLocation();
  const { user } = useAuthStore();

  const navItems = [
    {
      path: '/school-admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/school-admin/students',
      label: 'Students',
      icon: Users,
    },
    {
      path: '/school-admin/teams',
      label: 'Teams',
      icon: UsersRound,
    },
    {
      path: '/school-admin/reports',
      label: 'Reports',
      icon: BarChart3,
    },
    {
      path: '/school-admin/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Content wrapper - starts below fixed navbar */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto p-4">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {user?.fullName || 'School Admin'}
                </div>
                <div className="text-xs text-gray-500">School Administrator</div>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}

