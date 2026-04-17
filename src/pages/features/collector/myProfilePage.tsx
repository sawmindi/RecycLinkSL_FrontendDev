import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Pencil } from 'lucide-react';
import { AuthService } from '../../../services/AuthService';
import type { User } from '../../../models/User';

export function MyProfile() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    password: '',
    mobile: '',
    email: '',
    areaDistrict: '',
  });

  const [profileImage, setProfileImage] = useState('https://github.com/shadcn.png');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    AuthService.getMe().then((res) => {
      if (res.success && res.data) {
        const u = res.data as User;
        setFormData({
          fullName: u.full_name ?? '',
          userName: u.username ?? '',
          password: '',
          mobile: u.mobile_number ?? '',
          email: u.email ?? '',
          areaDistrict: u.area ?? '',
        });
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    AuthService.getMe().then((res) => {
      if (res.success && res.data && res.data._id) {
        AuthService.updateUser(res.data._id, {
          full_name: formData.fullName,
          username: formData.userName,
          mobile_number: formData.mobile,
          email: formData.email,
          area: formData.areaDistrict,
        }).catch(() => {});
      }
    });
    setIsEditing(false);
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

  return (
    <div className="bg-gray-50"> 
      <div className="max-w3xl">
        <h2 className="text-3xl font-serif text-gray-800 mb-2">{t('sidebar.myProfile')}</h2>
      </div>
      <div className="flex-1 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-teal-100 shadow-md">
              <AvatarImage src={profileImage} alt={formData.fullName || t('profile.avatarAlt')} />
              <AvatarFallback className="bg-teal-700 text-white text-3xl font-semibold">
                SP
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
                  aria-label={t('profile.ariaUploadPicture')}
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