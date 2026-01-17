import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import PhoneVerificationPage from './PhoneVerificationPage';
import EmailVerificationPage from './EmailVerificationPage';
import SmsOtpPage from './SmsOTP';
import EmailOtpPage from './EmailOTP';

type Step = 'select-method' | 'enter-phone' | 'enter-email' | 'verify-phone-otp' | 'verify-email-otp';


export function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>('select-method');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleMethodSelect = (method: 'sms' | 'email') => {
    if (method === 'sms') {
      setCurrentStep('enter-phone');
    } else {
      setCurrentStep('enter-email');
    }
  };

  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone);
    setCurrentStep('verify-phone-otp');
  };

  const handleEmailSubmit = (emailAddress: string) => {
    setEmail(emailAddress);
    setCurrentStep('verify-email-otp');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'enter-phone':
      case 'enter-email':
        setCurrentStep('select-method');
        break;
      case 'verify-phone-otp':
        setCurrentStep('enter-phone');
        break;
      case 'verify-email-otp':
        setCurrentStep('enter-email');
        break;
      default:
        navigate('/');
    }
  };


  if (currentStep === 'enter-phone') {
    return <PhoneVerificationPage onBack={handleBack} onSendCode={handlePhoneSubmit} />;
  }

  if (currentStep === 'enter-email') {
    return <EmailVerificationPage onBack={handleBack} onSendCode={handleEmailSubmit} />;
  }

  if (currentStep === 'verify-phone-otp') {
    return <SmsOtpPage onBack={handleBack} phoneNumber={phoneNumber} />;
  }

  if (currentStep === 'verify-email-otp') {
    return <EmailOtpPage onBack={handleBack} email={email} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <div className="absolute top-6 left-6 md:top-8 md:left-10 z-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
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
              // className={`w-full py-6 rounded-xl text-base font-medium transition-all border-2 ${
              //   selectedMethod === 'sms'
              //     ? 'border-[#4a5f5c] bg-[#4a5f5c]/5'
              //     : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              // }`}
              className="w-full py-6 rounded-xl text-base font-medium transition-all border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
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
              // className={`w-full py-6 rounded-xl text-base font-medium transition-all border-2 ${
              //   selectedMethod === 'email'
              //     ? 'border-[#4a5f5c] bg-[#4a5f5c]/5'
              //     : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              // }`}
              className="w-full py-6 rounded-xl text-base font-medium transition-all border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
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