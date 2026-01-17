import { useState } from 'react'
import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import {LandingPage} from './pages/LandingPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import PhoneVerificationPage from './pages/auth/PhoneVerificationPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import SmsOtpPage from './pages/auth/SmsOTP';
import EmailOtpPage from './pages/auth/EmailOTP';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* AUTH ROUTES */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-phone" element={<PhoneVerificationPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/sms-otp" element={<SmsOtpPage />} />
        <Route path="/email-otp" element={<EmailOtpPage />} />
      </Routes>

    </Router>
  )
}

export default App
