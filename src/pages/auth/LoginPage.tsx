import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Label } from '../../components/ui/label';
import { AuthService } from '../../services/AuthService';
import { toast } from 'react-toastify';
import { Role } from '../../models/Role';

export function LoginPage() {
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
              toast.error('Unknown user role. Please contact support.');
          }
        } else {
          toast.error('Unable to detect user role. Please try again.');
        }
      } else {
        toast.error(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (e) {
      toast.error('An unexpected error occurred while logging in.');
    }
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

          {/* Login Form */}
          <div className="space-y-6">
            {/* Phone Number Field */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </Label>
              <Input
                type="tel"
                placeholder="eg: +94771234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-6 rounded-xl border border-gray-300 focus:border-[#325251] focus:ring-2 focus:ring-[#325251]/20 transition-all"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-6 rounded-xl border border-gray-300 focus:border-[#325251] focus:ring-2 focus:ring-[#325251]/20 transition-all pr-12"
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

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Forgot Your Password ?
              </Button>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              className="w-full bg-[#325251] hover:bg-[#3d4f4c] text-white py-6 rounded-xl text-base font-medium transition-colors"
            >
              Login
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Button
                variant="link"
                onClick={() => navigate('/signup')}
                className="text-gray-800 font-medium"
              >
                Sign Up
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
