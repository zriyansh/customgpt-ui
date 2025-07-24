'use client';

import React from 'react';
import { Navbar } from './Navbar';

interface PageLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showBackButton?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  showNavbar = true, 
  showBackButton = true 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar showBackButton={showBackButton} />}
      <main className={showNavbar ? '' : 'pt-0'}>
        {children}
      </main>
    </div>
  );
};