import React from 'react'
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function FooterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <footer className="relative bg-[#043937] py-4 mt-16">
    <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
        <img src="/logo.png" alt="RecycLinkSL Logo"
        onClick={() => navigate('/')} 
        className="h-10 w-auto object-contain cursor-pointer"
        />

        <p className="text-sm text-slate-400 mt-2">
            &copy; {new Date().getFullYear()} RecycLinkSL.  
            {t('footer.copyright')}
        </p>
        </div>
    </div>
    </footer>
  )
}
