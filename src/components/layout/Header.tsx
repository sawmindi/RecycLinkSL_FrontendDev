import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '../ui/tooltip';

export function HeaderPage() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'si' ? 'en' : 'si';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="bg-[#043937] px-5 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="RecycLinkSL Logo"
            className="h-9 md:h-11 w-auto object-contain"
          />
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Language Toggle */}
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

          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-teal-200 hover:bg-teal-900/40 rounded-full relative"
                >
                  <Bell className="h-5 w-5" />
                  {/* Optional badge */}
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                    2
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {t('notifications')} {/* or hardcode "Notifications" */}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}