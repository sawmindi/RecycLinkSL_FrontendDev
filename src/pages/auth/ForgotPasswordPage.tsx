import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import PhoneVerificationPage from './PhoneVerificationPage';
import EmailVerificationPage from './EmailVerificationPage';

export function ForgotPasswordPage() {
  const [selectedMethod, setSelectedMethod] = useState<'sms' | 'email' | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const navigate = useNavigate();

  const handleMethodSelect = (method: 'sms' | 'email') => {
    setSelectedMethod(method);
    setShowVerification(true);
    // console.log(`Selected method: ${method}`);
  };

  const handleBack = () => {
    if (showVerification) {
      setShowVerification(false);
      setSelectedMethod(null);
    } else {
      navigate('/');
    }
  };


  if (showVerification && selectedMethod === 'sms') {
    return <PhoneVerificationPage onBack={handleBack} />;
  }

  if (showVerification && selectedMethod === 'email') {
    return <EmailVerificationPage onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <div className="absolute top-6 left-6 md:top-8 md:left-10 z-10">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 mb-12 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base">Back</span>
          </Button>
        </div>

        {/* Main Card */}
        <div className="">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <img
              src="/logo.png"
              alt="RecycleLinkSL Logo"
              className="h-10 w-auto mb-4 object-contain"
            />
            <div className="text-center">
              <h1 className="text-3xl font-semibold font-serif">Forgot Your Password?</h1>
              <p className="text-gray-600 text-sm mt-2">
                Select a method below to reset your password
              </p>
            </div>
          </div>

          {/* Recovery Options */}
          <div className="space-y-4 max-w-lg mx-auto">
            {/* Via SMS Button */}
            <Button
              onClick={() => handleMethodSelect('sms')}
              variant="outline"
              className={`w-full py-6 rounded-xl text-base font-medium transition-all border-2 ${
                selectedMethod === 'sms'
                  ? 'border-[#4a5f5c] bg-[#4a5f5c]/5'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-3 ">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Via SMS: .... ... ...</span>
              </div>
            </Button>

            {/* Via Email Button */}
            <Button
              onClick={() => handleMethodSelect('email')}
              variant="outline"
              className={`w-full py-6 rounded-xl text-base font-medium transition-all border-2 ${
                selectedMethod === 'email'
                  ? 'border-[#4a5f5c] bg-[#4a5f5c]/5'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Via Email: ......@gmail.com</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}