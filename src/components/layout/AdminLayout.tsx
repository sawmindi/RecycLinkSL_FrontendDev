import React from 'react';
import { Outlet } from 'react-router-dom';
import { HeaderPage } from './Header';
import FooterPage from './Footer';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Header */}
      <HeaderPage />

      {/* Main content area with sidebar */}
      <div className="flex flex-1">
        <AdminSidebar/>

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