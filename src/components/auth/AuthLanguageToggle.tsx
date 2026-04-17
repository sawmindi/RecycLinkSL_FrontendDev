import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

//Globe control for login/signup/forgot 
export function AuthLanguageToggle({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language.startsWith('si') ? 'en' : 'si';
    void i18n.changeLanguage(next);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={className ?? 'text-gray-600 hover:text-gray-900'}
            onClick={toggleLanguage}
            aria-label={t('auth.toggleLanguage')}
          >
            <Globe className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {i18n.language.startsWith('si') ? t('auth.showEnglish') : t('auth.showSinhala')}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
