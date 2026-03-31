import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Truck, Calendar, History, Bell, User, LogOut, X, Globe,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { AuthService } from '../../services/AuthService';
import { Util } from '../../Util';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
interface CollectorSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}


function getInitials(fullName?: string): string {
  if (!fullName?.trim()) return '?';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return fullName.slice(0, 2).toUpperCase();
}


export function CollectorSidebar({ isOpen = false, onClose }: CollectorSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('si') ? 'en' : 'si';
    void i18n.changeLanguage(newLang);
  };

  useEffect(() => {
      onClose?.();
    }, [location.pathname]);
  
    useEffect(() => {
      document.body.style.overflow = isOpen ? 'hidden' : '';
      return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

  useEffect(() => {
    AuthService.getMe().then((res) => {
      if (res.success && res.data) {
        setFullName(res.data.full_name ?? '');
        setUsername(res.data.username ?? '');
        const u = res.data as { profilePhotoId?: string };
        if (u.profilePhotoId) setAvatarUrl(Util.fileURL(u.profilePhotoId));
      }
    });
  }, []);

  const navItems = [
    { path: '/collector/overview', label: t('sidebar.overview'), icon: Home },
    { path: '/collector/pickups', label: t('sidebar.pickups'), icon: Truck },
    // { path: '/collector/schedule-management', label: t('sidebar.scheduleManagement'), icon: Calendar },
    { path: '/collector/collection-history', label: t('sidebar.collectionHistory'), icon: History },
    { path: '/collector/notifications', label: t('sidebar.notifications'), icon: Bell },
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/collector' && location.pathname === '/collector/overview');

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
                {i18n.language.startsWith('si') ? 'English' : 'සිංහල'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-teal-200 hover:bg-teal-900/40 rounded-full relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                    2
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {t('notifications')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
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

      {/* User Profile & Logout */}
      <div className="p-5 border-t border-teal-800/50">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10 border-2 border-teal-700/50 shrink-0">
            <AvatarImage src={avatarUrl || undefined} alt={fullName || 'Collector'} />
            <AvatarFallback className="bg-teal-700 text-white">{getInitials(fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-base truncate">{fullName || '—'}</p>
            <p className="text-sm text-teal-200 truncate">{username || '—'}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 text-teal-200 hover:text-white hover:bg-teal-800/50 text-sm mb-2 px-3"
          onClick={() => handleNavigate('/collector/profile')}
        >
          <User className="h-4 w-4" />
          {t('sidebar.myProfile')}
        </Button>

        <Separator className="my-3 bg-teal-800/40" />

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 text-red-300 hover:text-red-200 hover:bg-red-950/30 text-sm px-3"
          onClick={() => { AuthService.userLogout(); navigate('/login'); }}
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