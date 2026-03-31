import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Label } from '../../components/ui/label';
import { AuthService } from '../../services/AuthService';
import { toast } from 'react-toastify';
import { Role } from '../../models/Role';
import { AuthLanguageToggle } from '../../components/auth/AuthLanguageToggle';

export function LoginPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await AuthService.userLogin({ phoneNumber, password });
      if (res.success) {
        const me = await AuthService.getMe();
        if (me.success && me.data?.role) {
          switch (me.data.role) {
            case Role.CITIZEN:
              navigate('/citizen/overview');
              break;
            case Role.COLLECTOR:
              navigate('/collector/overview');
              break;
            case Role.ADMIN:
              navigate('/admin/overview');
              break;
            default:
              toast.error(t('auth.toastUnknownRole'));
          }
        } else {
          toast.error(t('auth.toastRoleDetect'));
        }
      } else {
        toast.error(res.message || t('auth.toastLoginFailed'));
      }
    } catch (e) {
      toast.error(t('auth.toastLoginUnexpected'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between gap-4 mb-12">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base">{t('auth.back')}</span>
          </Button>
          <AuthLanguageToggle />
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12">
          <div className="flex flex-col items-center mb-10">
            <img
              src="/logo.png"
              alt={t('auth.logoAlt')}
              onClick={() => navigate('/')}
              className="h-16 w-auto mb-4 object-contain cursor-pointer"
            />
            <p className="text-gray-600 text-sm text-center">{t('auth.joinPlatform')}</p>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.phoneNumber')}</Label>
              <Input
                type="tel"
                placeholder={t('auth.phonePlaceholder')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-6 rounded-xl border border-gray-300 focus:border-[#325251] focus:ring-2 focus:ring-[#325251]/20 transition-all"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-6 rounded-xl border border-gray-300 focus:border-[#325251] focus:ring-2 focus:ring-[#325251]/20 transition-all pr-12"
                />
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {t('auth.forgotPasswordLink')}
              </Button>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-[#325251] hover:bg-[#3d4f4c] text-white py-6 rounded-xl text-base font-medium transition-colors"
            >
              {t('auth.loginButton')}
            </Button>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              {t('auth.noAccount')}{' '}
              <Button variant="link" onClick={() => navigate('/signup')} className="text-gray-800 font-medium p-0 h-auto">
                {t('auth.signUpLink')}
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
