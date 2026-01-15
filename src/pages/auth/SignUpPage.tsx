import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Label } from '../../components/ui/label';

export function SignUpPage() {
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

  const handleSignup = () => {
    //console.log('Sign up:', formData);
    navigate('/login')
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <Button
        variant="ghost"
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-gray-600 mb-12 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base">Back</span>
        </Button>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <img
              src="/logo.png" alt="RecycleLinkSL Logo"
              onClick={() => navigate('/')} 
              className="h-16 w-auto mb-4 object-contain cursor-pointer" 
            />
            <p className="text-gray-600 text-sm">
              Join our platform to sell your recyclable items and earn money
            </p>
          </div>

          {/* Sign Up Form */}
          <div className="space-y-6">
            {/* Full Name Field */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </Label>
              <Input
                type="text"
                placeholder="eg: John Smith"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-4 py-6 rounded-xl border border-gray-300 focus:border-[#4a5f5c] focus:ring-2 focus:ring-[#4a5f5c]/20 transition-all"
              />
            </div>

            {/* Email Field */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </Label>
              <Input
                type="email"
                placeholder="eg: johnSmith@gmail.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-6 rounded-xl border border-gray-300 focus:border-[#4a5f5c] focus:ring-2 focus:ring-[#4a5f5c]/20 transition-all"
              />
            </div>

            {/* Mobile Number Field */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </Label>
              <Input
                type="tel"
                placeholder="eg: +9400000000"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className="w-full px-4 py-6 rounded-xl border border-gray-300 focus:border-[#4a5f5c] focus:ring-2 focus:ring-[#4a5f5c]/20 transition-all"
              />
            </div>

            {/* Area/District Field */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Area/District
              </Label>
              <Input
                type="text"
                placeholder="eg: Colombo"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                className="w-full px-4 py-6 rounded-xl border border-gray-300 focus:border-[#4a5f5c] focus:ring-2 focus:ring-[#4a5f5c]/20 transition-all"
              />
            </div>

            {/* Password Field */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="eg: ************"
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

            {/* Confirm Password Field */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="eg: ************"
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

            {/* Sign Up Button */}
            <Button
              onClick={handleSignup}
              className="w-full bg-[#325251] hover:bg-[#3d4f4c] text-white py-6 rounded-xl text-base font-medium transition-colors mt-8"
            >
              Sign Up
            </Button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Button
              variant="link"
                onClick={() => navigate('/login')}
                className="text-gray-800 font-medium"
              >
                Login
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
