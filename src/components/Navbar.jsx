import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Bell, Volume2, VolumeX, Menu, UserCircle } from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { useAlerts } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { voiceEnabled, toggleVoice, alerts } = useAlerts();
  const { user, logout } = useAuth();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
    document.dir = e.target.value === 'ar' ? 'rtl' : 'ltr';
  };

  const [dbAlerts, setDbAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/api/alerts');
        setDbAlerts(res.data);
      } catch (err) {
        console.error("Error fetching alerts", err);
      }
    };
    
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadAlerts = alerts.length + dbAlerts.filter(a => !a.is_read).length;

  return (
    <header className="h-16 glass border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 w-full transition-all">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 font-outfit">
             Monitoring Center
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Language Selection */}
        <select 
          onChange={changeLanguage} 
          value={i18n.language}
          className="bg-transparent border border-slate-200 dark:border-slate-700 text-sm rounded-lg p-1.5 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200"
        >
          <option value="en">English</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="ar">العربية (Arabic)</option>
        </select>

        {/* Voice Toggle */}
        <button 
          onClick={toggleVoice} 
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          title={voiceEnabled ? "Mute Voice Alerts" : "Enable Voice Alerts"}
        >
          {voiceEnabled ? <Volume2 size={20} className="text-blue-500" /> : <VolumeX size={20} />}
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-colors"
          >
            <Bell size={20} />
            {unreadAlerts > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            )}
          </button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Notifications</span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {dbAlerts.length === 0 && alerts.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No new notifications</div>
                ) : (
                  <>
                    {dbAlerts.map((a, i) => (
                      <div key={`db-${i}`} className="p-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{a.message || 'Alert threshold crossed'}</div>
                        <div className="text-xs text-slate-500 mt-1">{a.device_id || 'System'} • {new Date(a.timestamp).toLocaleTimeString()}</div>
                      </div>
                    ))}
                    {alerts.map((a, i) => (
                      <div key={`local-${i}`} className="p-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <div className={`text-sm font-medium ${a.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>{a.message}</div>
                        <div className="text-xs text-slate-500 mt-1">Local App Event</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">
              {user?.username || 'Guest'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {user?.role || 'Viewer'}
            </span>
          </div>
          <button onClick={logout} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
             <UserCircle size={28} className="text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
