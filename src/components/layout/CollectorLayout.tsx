import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HeaderPage } from './Header';
import FooterPage from './Footer';
import { CollectorSidebar } from './CollectorSidebar';

export function CollectorLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Header */}
      <HeaderPage onMenuClick={() => setSidebarOpen(true)} />

      {/* Main content area with sidebar */}
      <div className="flex flex-1">
        <CollectorSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
         />

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6 md:p-8">
            <Outlet />
          </main>

          <FooterPage />
        </div>
      </div>
    </div>
  );
}