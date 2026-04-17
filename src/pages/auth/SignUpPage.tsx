import React, { useRef, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { AuthService, CitizenSignupRequest } from '../../services/AuthService';
import { MainCitySelect } from '../../components/forms/MainCitySelect';
import { AddressMapPickerDialog } from '../../components/forms/AddressMapPickerDialog';
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
    address: '',
    addressLatitude: undefined as number | undefined,
    addressLongitude: undefined as number | undefined,
    password: '',
    confirmPassword: ''
  });
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const addressPickerSeedRef = useRef({ address: '', area: '' });

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
      address: formData.address.trim() || undefined,
      ...(formData.addressLatitude != null && formData.addressLongitude != null
        ? { latitude: formData.addressLatitude, longitude: formData.addressLongitude }
        : {}),
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
              <Label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.address')}</Label>
              <p className="mb-2 text-xs text-gray-500">{t('auth.addressMapHint')}</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <Textarea
                  placeholder={t('auth.addressPlaceholder')}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="min-h-[96px] flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-[#4a5f5c] focus:ring-2 focus:ring-[#4a5f5c]/20"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 gap-2 border-teal-700 text-teal-800 hover:bg-teal-50"
                  onClick={() => {
                    addressPickerSeedRef.current = { address: formData.address, area: formData.area };
                    setAddressPickerOpen(true);
                  }}
                >
                  <MapPin className="h-4 w-4" aria-hidden />
                  {t('auth.addressPickOnMap')}
                </Button>
              </div>
              {formData.addressLatitude != null && formData.addressLongitude != null && (
                <p className="mt-1.5 text-xs font-medium text-teal-700">{t('auth.addressLocationSaved')}</p>
              )}
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

          <AddressMapPickerDialog
            open={addressPickerOpen}
            onOpenChange={setAddressPickerOpen}
            initialAddress={addressPickerSeedRef.current.address}
            areaHint={addressPickerSeedRef.current.area}
            onConfirm={(r) => {
              setFormData((prev) => ({
                ...prev,
                address: r.address,
                addressLatitude: r.latitude,
                addressLongitude: r.longitude,
              }));
              toast.success(t('auth.addressLocationSaved'));
            }}
          />

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
