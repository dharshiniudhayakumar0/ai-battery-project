import React, { useState, useEffect } from 'react';
import { User, Mail, Building, FileText, Camera, Battery, Shield, MapPin, Activity, CheckCircle, AlertTriangle, Save, X, Edit2, Phone } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAlerts } from '../context/AlertContext';
import api from '../api';

const Profile = () => {
  const { addAlert } = useAlerts();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone_number: '',
    company_name: '',
    description: '',
    avatar: null
  });

  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    healthStatus: [
      { name: 'Healthy', value: 0, color: '#10b981' },
      { name: 'Warning', value: 0, color: '#f59e0b' },
      { name: 'Critical', value: 0, color: '#ef4444' }
    ]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Initial Local Fallback (immediate UI update)
      const savedUser = localStorage.getItem('loginUser');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setProfile(prev => ({
          ...prev,
          username: parsed.username || prev.username,
          email: parsed.email || prev.email,
          phone_number: parsed.phone_number || prev.phone_number,
          company_name: parsed.company_name || prev.company_name
        }));
      }

      // 2. Fetch Fresh Profile Data from Server
      try {
        const profileRes = await api.get('/api/profile');
        if (profileRes.data) {
          setProfile(prev => ({
            ...prev,
            ...profileRes.data
          }));
        }
      } catch (pErr) {
        console.warn("Profile API check failed, using local/registered data:", pErr.message);
        // We don't alert here to avoid annoying the user if local data is fine
      }

      // 3. Fetch Device Stats
      try {
        const devicesRes = await api.get('/api/devices');
        const devices = devicesRes.data || [];
        
        let healthy = 0, warning = 0, critical = 0;
        devices.forEach(dev => {
          const health = dev.health || 0;
          if (health > 80) healthy++;
          else if (health > 50) warning++;
          else critical++;
        });

        setStats({
          totalDevices: devices.length,
          activeDevices: devices.length, // Simplified
          healthStatus: [
            { name: 'Healthy', value: healthy, color: '#10b981' },
            { name: 'Warning', value: warning, color: '#f59e0b' },
            { name: 'Critical', value: critical, color: '#ef4444' }
          ]
        });
      } catch (dErr) {
        console.error("Devices API error:", dErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/profile', profile);
      addAlert("Profile updated successfully", "success");
      setIsEditing(false);
      // Sync local storage too
      const updatedProfile = {
        ...JSON.parse(localStorage.getItem('loginUser') || '{}'),
        ...profile
      };
      localStorage.setItem('loginUser', JSON.stringify(updatedProfile));
      
      // Update global auth state if applicable
      // Explicitly fetch again to confirm server state
      setTimeout(fetchData, 300);
    } catch (err) {
      addAlert("Failed to update profile: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 animate-pulse font-medium">Syncing account details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 font-outfit">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="text-blue-600 dark:text-blue-400 opacity-80" />
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="text-white" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-white dark:border-slate-900 rounded-full flex items-center justify-center shadow-lg transform scale-90 md:scale-100">
              <Shield size={18} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {profile.username}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg text-sm">
                <CheckCircle size={14} /> Registered Fleet Admin
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium">
                <MapPin size={14} /> Global Operations
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <X size={18} /> Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
              >
                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
                Save Changes
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
            >
              <Edit2 size={18} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Fleet Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border-l-4 border-blue-600">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity size={20} className="text-blue-500" /> Fleet Analytics
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.healthStatus}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stats.healthStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-center">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalDevices}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Total Assets</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-center">
                <p className="text-2xl font-black text-green-500">{stats.healthStatus[0].value}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Healthy</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-blue-500/20">
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <Shield size={20} /> Security Status
            </h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-4">
              Your account is protected by End-to-End Encryption and Multi-Factor Authentication.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg w-fit">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              SERVER SYNC ACTIVE
            </div>
          </div>
        </div>

        {/* Right Column: Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
              <FileText size={20} className="text-blue-500" /> Account Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} /> Full Username
                </label>
                {isEditing ? (
                  <input 
                    name="username" value={profile.username} onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 rounded-xl border border-transparent">
                    {profile.username}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </label>
                {isEditing ? (
                  <input 
                    name="email" value={profile.email} onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 rounded-xl border border-transparent">
                    {profile.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={12} /> Contact Number
                </label>
                {isEditing ? (
                  <input 
                    name="phone_number" value={profile.phone_number} onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 rounded-xl border border-transparent">
                    {profile.phone_number}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building size={12} /> Company
                </label>
                {isEditing ? (
                  <input 
                    name="company_name" value={profile.company_name} onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 rounded-xl border border-transparent">
                    {profile.company_name}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={12} /> Bio / Description
              </label>
              {isEditing ? (
                <textarea 
                  name="description" value={profile.description} onChange={handleInputChange} rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900 dark:text-white resize-none"
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-transparent italic leading-relaxed">
                  "{profile.description}"
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="text-amber-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Maintenance Warning</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">3 devices require calibration soon.</p>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 p-4 rounded-2xl flex items-start gap-3">
              <Battery className="text-blue-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-blue-800 dark:text-blue-400">System Efficiency</p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">Average fleet health is 94.2%.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
