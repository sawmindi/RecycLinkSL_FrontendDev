import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Label } from '../../components/ui/label';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // console.log('Login:', { username, password });
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
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-3 font-medium font-serif">RecycleLinkSL</h1>
            <p className="text-gray-600 text-sm">
              Join our platform to sell your recyclable items and earn money
            </p>
          </div>

          {/* Tab Switcher */}
          {/* <div className="bg-[#325251] rounded-full p-1.5 mb-8 flex">
            <Button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === 'login'
                  ? 'bg-[#4A6B6A] text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Login
            </Button>
            <Button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === 'signup'
                  ? 'bg-[#4A6B6A] text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign Up
            </Button>
          </div> */}

          {/* Login Form */}
          <div className="space-y-6">
            {/* Username Field */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </Label>
              <Input
                type="text"
                placeholder="eg: johnSmith"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
