import React, { useState, useRef } from 'react';
import Swal from "sweetalert2";

const CustomerPasswordReset = ({ onClose, onLoginClick }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '', '', '']); // Array for 8-digit code
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const API_BASE = 'https://suyambuoils.com/api/customer'; // Adjust if your base path differs

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Enter your email';
      case 2: return 'Enter the code sent to your email';
      case 3: return 'Create new password';
      default: return 'Reset Password';
    }
  };

  const isMessageSuccess = message.includes('success') || message.includes('sent') || message.includes('verified') || message.includes('valid') || message.includes('exists');

const getMessageClass = () => {
  if (message.includes('Validating')) {
    return 'bg-orange-50 text-orange-700 border border-orange-200';
  }
  if (message.includes('Updating') || message.includes('Verifying')) {
    return 'bg-green-50 text-green-700 border border-green-200';
  }
  if (isMessageSuccess) {
    return 'bg-blue-50 text-blue-700 border border-blue-200';
  }
  return 'bg-red-50 text-red-700 border border-red-200';
};
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email.');
      return;
    }
    setLoading(true);
    setMessage('Validating email...'); // Show loading message
    try {
      const response = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Email exists. A reset code has been sent to your email.');
        setStep(2); // Advance only if email exists and code sent
      } else {
        setMessage(data.message);
        // Stay on step 1 and show error (email not found or invalid)
        setStep(1);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setStep(1);
    }
    setLoading(false);
  };

  const handleCodeChange = (index, value) => {
    const newCode = [...code];
    newCode[index] = value.slice(-1); // Keep only last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 7) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous if empty
      inputRefs.current[index - 1].focus();
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    const newCode = pastedData.split('').concat(Array(8 - pastedData.length).fill(''));
    setCode(newCode);
    if (pastedData.length > 0 && pastedData.length <= 8) {
      inputRefs.current[Math.min(pastedData.length - 1, 7)].focus();
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const codeString = code.join('');
    if (!codeString || codeString.length !== 8 || !/^\d{8}$/.test(codeString)) {
      setMessage('Please enter a valid 8-digit code.');
      return;
    }
    setLoading(true);
    setMessage('Verifying code...');
    try {
      const response = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passkey: codeString }),
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) {
        setStep(3);
      } else {
        // Stay on step 2 if invalid code
        setStep(2);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setStep(2);
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6 || newPassword !== confirmPassword) {
      setMessage('Passwords must match and be at least 6 characters.');
      return;
    }
    setLoading(true);
    setMessage('Updating password...');
    try {
      const codeString = code.join('');
      const response = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passkey: codeString, newPassword, confirmPassword }),
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          text: 'Password reset successfully! Redirecting to login...',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true
        });
        setTimeout(() => {
          // Reset form
          setStep(1);
          setEmail('');
          setCode(['', '', '', '', '', '', '', '']);
          setNewPassword('');
          setConfirmPassword('');
          // Close modal and open login
          onClose();
          onLoginClick();
        }, 2000);
      } else {
        // Stay on step 3 if failed
        setStep(3);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setStep(3);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
        {/* <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button> */}
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <h3 className="text-lg font-medium mb-4 text-center">{getStepTitle()}</h3>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${getMessageClass()}`}>
            {message}
          </div>
        )}
        
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your email"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code (8 digits)</label>
              <div 
                className="flex flex-wrap justify-center gap-1 p-2 bg-gray-50 rounded-lg"
                onPaste={handleCodePaste}
              >
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    maxLength={1}
                    className="w-8 h-8 text-center text-base font-bold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder=""
                  />
                ))}
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Confirm new password"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <button
              type="button"
              onClick={onLoginClick}
              className="font-medium text-green-600 hover:text-green-700"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerPasswordReset;