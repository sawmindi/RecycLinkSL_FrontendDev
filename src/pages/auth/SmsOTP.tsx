import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface PhoneOTPVerificationProps {
  onBack?: () => void;
  phoneNumber?: string;
}

export default function SmsOtpPage({ onBack, phoneNumber }: PhoneOTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [timer, setTimer] = useState(59);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
      setOtp(newOtp);
      
      const nextIndex = Math.min(pastedData.length, 3);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 4) {
      console.log('Submitted Phone OTP:', otpCode);
    }
  };

  const handleResend = () => {
    setTimer(59);
    setOtp(['', '', '', '']);
    inputRefs.current[0]?.focus();
    console.log('Resending code to phone...');
  };

  const formatTime = (seconds: number) => {
    return `00:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center">
            <div className="flex flex-col items-center mb-2">
                <img
                    src="/logo.png"
                    alt="RecycleLinkSL Logo"
                    className="h-10 w-auto mb-4 object-contain"
                />
                {/* Header */}
                <h1 className="text-xl md:text-2xl font-serif font-semibold mb-3">
                    Please enter 4-digit code we sent to your phone number
                </h1>
                {phoneNumber && (
                    <p className="text-gray-600 mb-12 text-sm">
                    Code sent to: {phoneNumber}
                    </p>
                )}

            </div>
            
          
          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-4 mb-20">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-14 h-14 md:w-16 md:h-16 text-center text-2xl font-semibold rounded-xl border-2 border-gray-300 focus:border-[#4a5f5c] focus:ring-2 focus:ring-[#4a5f5c]/20 transition-all"
              />
            ))}
          </div>

          {/* Submit Button */}
          <div className="max-w-md mx-auto mb-6">
            <Button
              onClick={handleSubmit}
              disabled={otp.some((digit) => !digit)}
              className="w-full bg-[#325251] hover:bg-[#3d4f4c] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-6 rounded-xl text-base font-medium transition-colors"
            >
              Submit
            </Button>
          </div>

          {/* Resend Code */}
          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm text-gray-600">
                Resend Code - {formatTime(timer)}
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm text-[#4a5f5c] hover:text-[#3d4f4c] font-medium hover:underline transition-colors"
              >
                Resend Code
              </button>
            )}
          </div>

          {onBack && (
            <div className="mt-8">
              <button
                onClick={onBack}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to verification method
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}