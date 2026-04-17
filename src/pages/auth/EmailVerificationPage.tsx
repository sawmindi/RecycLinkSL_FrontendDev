import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

interface EmailVerificationPageProps {
  onBack?: () => void;
  onSendCode?: (email: string) => void;
}

export default function EmailVerificationPage({ onBack, onSendCode }: EmailVerificationPageProps) {
  const [email, setEmail] = useState('');

  const handleSend = () => {
    // console.log('Sending code to:', email);
    if (onSendCode) {
      onSendCode(email);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <div className="absolute top-6 left-6 md:top-8 md:left-10 z-10">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 mb-12 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base">Back</span>
          </Button>
        </div>

        {/* Main Card */}
        <div className="">
            <div className="flex flex-col items-center">
                <img
                src="/logo.png"
                alt="RecycleLinkSL Logo"
                className="h-10 w-auto mb-4 object-contain"
                />
            </div>
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-xl md:text-2xl font-serif font-semibold mb-3">
              Enter your email
            </h1>
          </div>

          {/* Email Input */}
          <div className="max-w-lg mx-auto mb-20">
            <Input
              type="email"
              placeholder="Ex: john@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-6 rounded-xl border border-gray-300 focus:border-[#4a5f5c] focus:ring-2 focus:ring-[#4a5f5c]/20 transition-all text-base"
            />
            <p className="text-center text-sm text-gray-600 mt-3">
              We will send a 4-digit code to your Email Address
            </p>
          </div>

          {/* Send Button */}
          <div className="max-w-lg mx-auto">
            <Button
              onClick={handleSend}
              disabled={!email.trim()}
              className="w-full bg-[#325251] hover:bg-[#3d4f4c] text-white py-6 rounded-xl text-base font-medium transition-colors"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}