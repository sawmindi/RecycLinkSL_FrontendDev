import React from 'react';
import { Outlet } from 'react-router-dom';
import { CitizenSidebar } from './CitizenSidebar';
import { HeaderPage } from './Header';
import FooterPage from './Footer';

export function CitizenLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Header */}
      <HeaderPage />

      {/* Main content area with sidebar */}
      <div className="flex flex-1">
        <CitizenSidebar />

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