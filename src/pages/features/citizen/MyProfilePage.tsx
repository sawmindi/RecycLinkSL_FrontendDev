import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { MapPin, Pencil } from 'lucide-react';
import { AuthService } from '../../../services/AuthService';
import { Util } from '../../../Util';
import { toast } from 'react-toastify';
import { AddressMapPickerDialog } from '../../../components/forms/AddressMapPickerDialog';

export default function MyProfile() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    password: '********',
    mobile: '',
    email: '',
    areaDistrict: '',
    address: '',
    addressLatitude: undefined as number | undefined,
    addressLongitude: undefined as number | undefined,
  });
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const addressPickerSeedRef = useRef({ address: '', area: '' });

  const [profileImage, setProfileImage] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuthService.getMe().then((res) => {
      if (res.success && res.data) {
        const u = res.data;
        setFormData({
          fullName: u.full_name ?? '',
          userName: u.username ?? '',
          password: '********',
          mobile: u.mobile_number ?? '',
          email: u.email ?? '',
          areaDistrict: u.area ?? '',
          address: u.address ?? '',
          addressLatitude: u.latitude,
          addressLongitude: u.longitude,
        });
        const photoId = (u as { profilePhotoId?: string }).profilePhotoId;
        if (photoId) setProfileImage(Util.fileURL(photoId));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name === 'mobileNumber' ? 'mobile' : name as keyof typeof formData;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const meRes = await AuthService.getMe();
    if (!meRes.success || !meRes.data?._id) {
      toast.error(t('profile.toastLoadFail'));
      return;
    }
    const res = await AuthService.updateUser(meRes.data._id, {
      full_name: formData.fullName,
      username: formData.userName,
      mobile_number: formData.mobile,
      email: formData.email || undefined,
      area: formData.areaDistrict,
      address: formData.address.trim() || undefined,
      ...(formData.addressLatitude != null && formData.addressLongitude != null
        ? { latitude: formData.addressLatitude, longitude: formData.addressLongitude }
        : {}),
    });
    if (res.success) {
      toast.success(t('profile.toastUpdated'));
      setIsEditing(false);
    } else {
      toast.error(res.message || t('profile.toastUpdateFail'));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    if (!name.trim()) return t('citizen.lists.emDash');
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="bg-gray-50 p-8">
        <p className="text-gray-500">{t('profile.loading')}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w3xl">
        <h2 className="text-3xl font-serif text-gray-800 mb-2">{t('sidebar.myProfile')}</h2>
      </div>
      <div className="flex-1 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-teal-100 shadow-md">
              <AvatarImage src={profileImage || undefined} alt={formData.fullName || t('profile.avatarAlt')} />
              <AvatarFallback className="bg-teal-700 text-white text-3xl font-semibold">
                {getInitials(formData.fullName)}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <>
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
                  aria-label={t('profile.ariaEditPicture')}
                >
                  <Pencil className="w-4 h-4 text-gray-600" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload profile picture"
                />
              </>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{formData.fullName}</h2>
            <p className="text-gray-600">{formData.userName}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                {t('profile.fullName')}
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                {t('profile.password')}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700">
                {t('profile.mobileNumber')}
              </Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                {t('profile.email')}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="areaDistrict" className="text-sm font-medium text-gray-700">
              {t('profile.areaDistrict')}
            </Label>
            <Input
              id="areaDistrict"
              name="areaDistrict"
              type="text"
              value={formData.areaDistrict}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full md:w-1/2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileAddress" className="text-sm font-medium text-gray-700">
              {t('auth.address')}
            </Label>
            <p className="text-xs text-gray-500">{t('auth.addressMapHint')}</p>
            <div className="flex max-w-2xl flex-col gap-2 sm:flex-row sm:items-start">
              <Textarea
                id="profileAddress"
                name="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                disabled={!isEditing}
                rows={3}
                className="min-h-[96px] flex-1"
                placeholder={t('auth.addressPlaceholder')}
              />
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 gap-2 border-teal-700 text-teal-800 hover:bg-teal-50"
                  onClick={() => {
                    addressPickerSeedRef.current = {
                      address: formData.address,
                      area: formData.areaDistrict,
                    };
                    setAddressPickerOpen(true);
                  }}
                >
                  <MapPin className="h-4 w-4" aria-hidden />
                  {t('auth.addressPickOnMap')}
                </Button>
              )}
            </div>
            {formData.addressLatitude != null && formData.addressLongitude != null && (
              <p className="text-xs font-medium text-teal-700">{t('auth.addressLocationSaved')}</p>
            )}
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

          <div className="flex gap-4 pt-4">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[#1a5f5c] hover:bg-[#164d4a] text-white px-8"
              >
                {t('profile.editProfile')}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  className="bg-[#1a5f5c] hover:bg-[#164d4a] text-white px-8"
                >
                  {t('profile.save')}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="px-8 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {t('profile.cancel')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}