import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Truck, Calendar, History, Bell, User, LogOut,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/admin/overview', label: t('sidebar.overview'), icon: Home },
    { path: '/admin/pickup-schedule', label: t('sidebar.pickupSchedule'), icon: Truck },
    { path: '/admin/categories', label: t('sidebar.categories'), icon: Calendar },
    { path: '/admin/collector-assignment', label: t('sidebar.collectorAssignment'), icon: History },
    { path: '/admin/price-management', label: t('sidebar.priceManagement'), icon: History },
    { path: '/admin/user-management', label: t('sidebar.userManagement'), icon: History },
    { path: '/admin/route-optimisation', label: t('sidebar.routeOptimisation'), icon: History },
    { path: '/admin/reports', label: t('sidebar.reports'), icon: History },
    { path: '/admin/notifications', label: t('sidebar.notifications'), icon: Bell },
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/admin' && location.pathname === '/admin/overview');

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-[#043937] text-white border-r border-teal-800/40">
      

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={`
                w-full justify-start gap-3 text-base font-medium
                text-white hover:bg-teal-800/60 hover:text-white
                ${isActive(item.path) ? 'bg-teal-800/50' : ''}
              `}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-5 border-t border-teal-800/50">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10 border-2 border-teal-700/50">
            <AvatarImage src="/path-to-admin-avatar.jpg" alt="Kamal Silva" />
            <AvatarFallback className="bg-teal-700 text-white">KS</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-base truncate">Kamal Silva</p>
            <p className="text-sm text-teal-200 truncate">kamalsilva123</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 text-teal-200 hover:text-white hover:bg-teal-800/50 text-sm mb-2 px-3"
          onClick={() => navigate('/admin/profile')}
        >
          <User className="h-4 w-4" />
          {t('sidebar.myProfile')}
        </Button>

        <Separator className="my-3 bg-teal-800/40" />

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 text-red-300 hover:text-red-200 hover:bg-red-950/30 text-sm px-3"
          onClick={() => navigate('/login')}
        >
          <LogOut className="h-4 w-4" />
          {t('sidebar.logOut')}
        </Button>
      </div>
    </aside>
  );
}