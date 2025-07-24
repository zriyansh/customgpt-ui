'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bot, 
  MessageSquare, 
  FileText, 
  Database, 
  BarChart3, 
  User, 
  ArrowLeft,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  showBackButton?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ showBackButton = true }) => {
  const pathname = usePathname();

  const navigationItems = [
    { href: '/', label: 'Chat', icon: MessageSquare },
    { href: '/projects', label: 'Projects', icon: Bot },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Back Button */}
          <div className="flex items-center gap-4">
            {showBackButton && pathname !== '/' && (
              <Link href="/">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Chat</span>
                </button>
              </Link>
            )}
            
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 hidden sm:block">
                CustomGPT Chat
              </span>
            </Link>
          </div>

          {/* Center - Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-brand-50 text-brand-600 border border-brand-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </div>

          {/* Right side - Mobile menu or additional actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-1">
              {navigationItems.slice(1).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        active
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )}
                      title={item.label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  </Link>
                );
              })}
            </div>
            
            {/* Home button for non-home pages on mobile */}
            {pathname !== '/' && (
              <Link href="/" className="md:hidden">
                <button 
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  title="Go to Chat"
                >
                  <Home className="w-4 h-4" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};