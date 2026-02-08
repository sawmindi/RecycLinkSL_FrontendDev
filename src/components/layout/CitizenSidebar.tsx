import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, PlusCircle, Package, DollarSign, History, Bell, LogOut,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';


export function CitizenSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/citizen/overview',  label: t('sidebar.overview'),    icon: Home },
    { path: '/citizen/schedules', label: t('sidebar.schedules'),   icon: Calendar },
    { path: '/citizen/add-item',  label: t('sidebar.addItems'),    icon: PlusCircle },
    { path: '/citizen/my-items',  label: t('sidebar.myItems'),     icon: Package },
    { path: '/citizen/earnings',  label: t('sidebar.earnings'),    icon: DollarSign },
    { path: '/citizen/history',   label: t('sidebar.history'),     icon: History },
    { path: '/citizen/notifications', label: t('sidebar.notifications'), icon: Bell },
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/citizen' && location.pathname === '/citizen');

  return (
    <aside className="hidden md:flex md:w-48 flex-col bg-[#043937] text-white ">
      
      <nav className="px-3 py-5 min-h-0 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={`
                w-full justify-start gap-3 text-sm font-medium
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

      
      <div className="mt-auto px-4 pb-6 border-t border-teal-800/50">
        {/* User Profile & Logout */}
        <div className="flex items-center gap-3 mb-4 pt-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
            SP
          </div>
          <div className="min-w-0">
            <p className="font-medium text-base leading-tight">Saman Perera</p>
            <p className="text-sm text-teal-300/90 leading-tight">samanperera12</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 text-teal-200 hover:text-white hover:bg-teal-800/50 text-sm mb-1.5 px-3"
          onClick={() => navigate('/citizen/profile')}
        >
          {t('sidebar.myProfile')}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 text-red-300 hover:text-red-200 hover:bg-red-950/30 text-sm px-3"
          onClick={() => navigate('/login')}
        >
          <LogOut className="h-5 w-5" />{t('sidebar.logOut')}
        </Button>
      </div>
    </aside>
  );
}