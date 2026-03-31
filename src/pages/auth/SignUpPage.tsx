import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Label } from '../../components/ui/label';
import { AuthService, CitizenSignupRequest } from '../../services/AuthService';
import { MainCitySelect } from '../../components/forms/MainCitySelect';
import { MAIN_CITY_VALUE_SET } from '../../data/mainCities';
import { toast } from 'react-toastify';
import { AuthLanguageToggle } from '../../components/auth/AuthLanguageToggle';

export function SignUpPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    area: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.toastPasswordMismatch'));
      return;
    }

    if (!formData.area || !MAIN_CITY_VALUE_SET.has(formData.area)) {
      toast.error(t('auth.toastSelectArea'));
      return;
    }

    const usernameFallback =
      (formData.email && formData.email.split('@')[0]) || formData.mobile;

    const payload: CitizenSignupRequest = {
      full_name: formData.fullName,
      username: usernameFallback,
      email: formData.email,
      phoneNumber: formData.mobile,
      area: formData.area,
      password: formData.password,
    };

    try {
      const res = await AuthService.citizenSignUp(payload);
      if (res.success && res.data) {
        navigate('/sms-otp', {
          state: {
            userId: res.data._id,
            phoneNumber: payload.phoneNumber,
          },
        });
      } else {
        toast.error(res.message || t('auth.toastSignupFailed'));
      }
    } catch (e) {
      toast.error(t('auth.toastSignupUnexpected'));
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
              <Label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.fullName')}</Label>
              <Input
                type="text"
                placeholder={t('auth.fullNamePlaceholder')}
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-4 py-6 rounded-xl border border-gray-300 focus:border-[#4a5f5c] focus:ring-2 focus:ring-[#4a5f5c]/20 transition-all"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email')}</Label>
              <Input
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-6 rounded-xl border border-gray-300 focus:border-[#4a5f5c] focus:ring-2 focus:ring-[#4a5f5c]/20 transition-all"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.mobileNumber')}</Label>
              <Input
                type="tel"
                placeholder={t('auth.mobilePlaceholder')}
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className="w-full px-4 py-6 rounded-xl border border-gray-300 focus:border-[#4a5f5c] focus:ring-2 focus:ring-[#4a5f5c]/20 transition-all"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.areaRequired')} <span className="text-red-600">*</span>
              </Label>
              <MainCitySelect
                value={formData.area}
                onValueChange={(area) => handleInputChange('area', area)}
                placeholder={t('auth.areaPlaceholder')}
                triggerClassName="min-h-[52px] rounded-xl px-4 py-6 h-auto border border-gray-300 hover:bg-white hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-[#4a5f5c]/20"
              />
              <p className="mt-2 text-xs text-gray-500">{t('auth.areaHelp')}</p>
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-6 rounded-xl border border-gray-300 focus:border-[#4a5f5c] focus:ring-2 focus:ring-[#4a5f5c]/20 transition-all pr-12"
                />
                <Button
                variant="ghost"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.confirmPassword')}</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-6 rounded-xl border border-gray-300 focus:border-[#4a5f5c] focus:ring-2 focus:ring-[#4a5f5c]/20 transition-all pr-12"
                />
                <Button
                variant="ghost"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              onClick={handleSignup}
              className="w-full bg-[#325251] hover:bg-[#3d4f4c] text-white py-6 rounded-xl text-base font-medium transition-colors mt-8"
            >
              {t('auth.signUpButton')}
            </Button>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              {t('auth.alreadyHaveAccount')}{' '}
              <Button variant="link" onClick={() => navigate('/login')} className="text-gray-800 font-medium p-0 h-auto">
                {t('auth.loginLink')}
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
