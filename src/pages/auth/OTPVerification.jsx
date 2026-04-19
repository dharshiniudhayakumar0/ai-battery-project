import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { KeyRound, Smartphone } from 'lucide-react';
import api from '../../api';

const OTPVerification = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addAlert, triggerLoginVoiceAlert } = useAlerts();
  
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);

  const phone = localStorage.getItem('loginContact') || 'your phone number';

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/verify-otp', {
        phone_number: phone,
        otp: otp
      });
      if (res.data.success) {
        addAlert('OTP Verified successfully', 'success');
        
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }

        const userData = {
          username: res.data.username || 'User',
          email: res.data.email,
          phone_number: res.data.phone_number || phone,
          company_name: res.data.company_name,
          role: 'Admin'
        };
        
        localStorage.setItem('loginUser', JSON.stringify(userData));
        login(userData);
        
        if (triggerLoginVoiceAlert) {
          triggerLoginVoiceAlert();
        }
        navigate('/');
      } else {
        addAlert('Invalid OTP. Please try again.', 'error');
      }
    } catch (err) {
      addAlert(err.response?.data?.message || err.message, 'error');
    }
  };

  const handleResend = async () => {
    setOtp('');
    setTimeLeft(30);
    try {
      await api.post('/api/send-otp', { phone_number: phone });
      addAlert('New OTP sent to your phone number', 'info');
    } catch (err) {
      addAlert(err.response?.data?.message || err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full blur-[100px]" />

      <div className="glass-card w-full max-w-md p-8 relative z-10 text-center animate-in slide-in-from-bottom-4 fade-in">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Smartphone size={32} className="text-blue-600 dark:text-blue-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">OTP Verification</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Enter the 6-digit code sent to<br />
          <span className="font-semibold text-slate-700 dark:text-slate-300">{phone}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Enter 6-digit OTP" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center tracking-[0.5em] text-xl font-mono text-slate-900 dark:text-white"
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            disabled={otp.length !== 6}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-medium shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            Verify OTP
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2">
          {timeLeft > 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Resend OTP in <span className="font-semibold text-blue-600 dark:text-blue-400">00:{timeLeft.toString().padStart(2, '0')}</span>
            </p>
          ) : (
            <button 
              onClick={handleResend}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
