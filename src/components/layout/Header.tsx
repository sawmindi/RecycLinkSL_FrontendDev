import React from 'react';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Bell, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface HeaderPageProps {
  onMenuClick?: () => void;
}

export function HeaderPage({ onMenuClick }: HeaderPageProps) {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('si') ? 'en' : 'si';
    void i18n.changeLanguage(newLang);
  };

  return (
    <header className="bg-[#043937] px-4 py-3 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between">

        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="RecycLinkSL Logo"
            className="h-9 md:h-11 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
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

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:text-teal-200 hover:bg-teal-900/40 rounded-full shrink-0"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

      </div>
    </header>
  );
}