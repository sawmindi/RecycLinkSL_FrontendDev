import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, PlusCircle, Package, DollarSign, History, Bell, LogOut, Globe, X, User,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface CitizenSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CitizenSidebar({ isOpen = false, onClose }: CitizenSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
      const newLang = i18n.language === 'si' ? 'en' : 'si';
      i18n.changeLanguage(newLang);
    };
  
    useEffect(() => {
      onClose?.();
    }, [location.pathname]);
  
    useEffect(() => {
      document.body.style.overflow = isOpen ? 'hidden' : '';
      return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

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
    (path === '/citizen' && location.pathname === '/citizen/overview');

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const sidebarContent = (
    <aside className="flex flex-col h-full w-64 bg-[#043937] text-white">

      <div className="flex items-center justify-between px-4 py-3 border-b border-teal-800/40 md:hidden">
       
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-teal-200 hover:bg-teal-900/40 rounded-full"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-teal-200 hover:bg-teal-900/40 rounded-full"
                  onClick={toggleLanguage}
                >
                  <Globe className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {i18n.language === 'si' ? 'English' : 'සිංහල'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
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
                onClick={() => handleNavigate(item.path)}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Button>
            ))}
          </div>
        </nav>

        <div className="p-5 border-t border-teal-800/50">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10 border-2 border-teal-700/50 shrink-0">
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
            onClick={() => handleNavigate('/citizen/profile')}
          >
            <User className="h-4 w-4" />
            {t('sidebar.myProfile')}
          </Button>

          <Separator className="my-3 bg-teal-800/40" />

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5 text-red-300 hover:text-red-200 hover:bg-red-950/30 text-sm px-3"
            onClick={() => handleNavigate('/login')}
          >
            <LogOut className="h-4 w-4" />
            {t('sidebar.logOut')}
          </Button>
          </div>
    </aside>
  );

  return (
     <>
      {/* Desktop */}
      <div className="hidden md:flex md:w-64 shrink-0 min-h-0">
        {sidebarContent}
      </div>

      {/* Mobile */}
      <div
        className={`
          fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 md:hidden
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`
          fixed inset-y-0 right-0 z-50 w-64 shadow-2xl
          transform transition-transform duration-300 ease-in-out md:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {sidebarContent}
      </div>
    </>
  );
}