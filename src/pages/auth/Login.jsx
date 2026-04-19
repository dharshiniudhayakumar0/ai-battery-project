import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import api from '../../api';
import { BatteryCharging, Mail, Lock, User, Phone, Briefcase, KeyRound } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addAlert, triggerLoginVoiceAlert } = useAlerts();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [isOTPStep, setIsOTPStep] = useState(false);
  
  // Force clean state on mount and mode toggle
  React.useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginUser');
    // Clear auth context if we had a logout method exposed, 
    // but at minimum we clear the persistence layer.
  }, [isRegistering]);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    company: '',
    otp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    
    // REGISTER Flow (Step 1)
    if (isRegistering && !isOTPStep) {
      if (!formData.username || !formData.email || !formData.password || !formData.phone || !formData.company) {
        addAlert('Please fill in all registration fields', 'warning');
        return;
      }
      try {
        await api.post('/api/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone,
          company_name: formData.company
        });
        await api.post('/api/send-otp', { 
          phone_number: formData.phone,
          email: formData.email 
        });
        addAlert('Registration successful! OTP sent to your email', 'success');
        setIsOTPStep(true);
      } catch (err) {
        addAlert(err.response?.data?.message || err.message, 'error');
      }
    } 
    // OTP VERIFICATION Flow
    else if (isOTPStep) {
      if (formData.otp.length < 4) {
        addAlert('Please enter the OTP code', 'warning');
        return;
      }
      try {
        const res = await api.post('/api/verify-otp', {
          phone_number: formData.phone,
          otp: formData.otp
        });
        if (res.data.success) {
          if (res.data.token) localStorage.setItem('token', res.data.token);
          
          const userData = { 
            username: res.data.username || formData.username, 
            email: res.data.email || formData.email,
            phone_number: res.data.phone_number || formData.phone,
            company_name: res.data.company_name || formData.company,
            role: 'Admin'
          };
          localStorage.setItem('loginUser', JSON.stringify(userData));
          
          addAlert('Registration successful!', 'success');
          login(userData);
          triggerLoginVoiceAlert();
          navigate('/');
        }
      } catch (err) {
        addAlert(err.response?.data?.message || err.message, 'error');
      }
    } 
    // LOGIN Flow
    else {
      if (!formData.username || !formData.password) {
        addAlert('Please enter Username and Password', 'warning');
        return;
      }
      try {
        const res = await api.post('/api/login', {
          username: formData.username,
          email: formData.email, // Can be username or email in our dual logic
          password: formData.password
        });
        
        localStorage.setItem('token', res.data.token);
        const userData = { 
          username: res.data.username, 
          email: res.data.email, 
          phone_number: res.data.phone_number,
          company_name: res.data.company_name,
          role: 'Admin' 
        };
        localStorage.setItem('loginUser', JSON.stringify(userData));
        
        addAlert('Logged in successfully', 'success');
        login(userData);
        triggerLoginVoiceAlert();
        navigate('/');
      } catch (err) {
        addAlert(err.response?.data?.message || err.message, 'error');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors font-outfit">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-[100px]" />

      <div className="glass-card w-full max-w-md p-8 relative z-10">
        <div className="flex flex-col items-center mb-8 animate-in slide-in-from-top-4 fade-in">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <BatteryCharging size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {isOTPStep ? 'Authenticator' : (isRegistering ? 'Register Fleet' : 'Sign In')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            {isOTPStep ? 'Enter the code sent to your email' : 
             (isRegistering ? 'Start monitoring your battery health' : 'Enter your credentials to access insights')}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isOTPStep && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Common Username Field */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" name="username" placeholder="Username" 
                  value={formData.username} onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white font-medium shadow-sm"
                />
              </div>

              {/* Registration Only Fields */}
              {isRegistering && (
                <>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" name="email" placeholder="Email Address" 
                      value={formData.email} onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white font-medium"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="tel" name="phone" placeholder="Mobile Number" 
                      value={formData.phone} onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white font-medium"
                    />
                  </div>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" name="company" placeholder="Company Name" 
                      value={formData.company} onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white font-medium"
                    />
                  </div>
                </>
              )}

              {/* Common Password Field */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" name="password" placeholder="Password" 
                  value={formData.password} onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white font-medium"
                />
              </div>
            </div>
          )}

          {isOTPStep && (
            <div className="relative animate-in slide-in-from-right-4 fade-in">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" name="otp" placeholder="Enter OTP" 
                value={formData.otp} onChange={handleChange} maxLength={6}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center tracking-widest text-2xl font-bold dark:text-white font-mono"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.01] active:scale-[0.98] text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all duration-300"
          >
            {isOTPStep ? 'Verify Identity' : (isRegistering ? 'Register Now' : 'Access Account')}
          </button>
        </form>

        {!isOTPStep && (
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {isRegistering ? "Already managing a fleet? " : "New to AI Battery? "}
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
            >
              {isRegistering ? 'Sign In' : 'Join and Register'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
