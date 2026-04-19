import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Battery, AlertTriangle, Activity, 
  Settings, Server, Upload, FileText, Calendar, 
  Map, BatteryCharging, ChevronLeft, ChevronRight, Share2, Lightbulb, LogOut, User, Edit3, Calculator
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, setCollapsed }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { label: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/' },
    { label: 'Fleet', icon: <Server size={20} />, path: '/fleet' },
    { label: t('devices'), icon: <Battery size={20} />, path: '/devices' },
    { label: 'Manual Input', icon: <Edit3 size={20} />, path: '/manual-input' },
    { label: 'Health Calculator', icon: <Calculator size={20} />, path: '/health-calculator' },
    { label: 'Environment', icon: <Map size={20} />, path: '/environment' },
    { label: 'Analytics', icon: <Activity size={20} />, path: '/analytics' },
    { label: 'Simulation', icon: <BatteryCharging size={20} />, path: '/simulation' },
    { label: 'Anomalies', icon: <AlertTriangle size={20} />, path: '/anomalies' },
    { label: 'Maintenance', icon: <Calendar size={20} />, path: '/maintenance' },
    { label: 'Explainability', icon: <Share2 size={20} />, path: '/explainability' },
    { label: 'CSV Upload', icon: <Upload size={20} />, path: '/upload' },
    { label: 'Reports', icon: <FileText size={20} />, path: '/reports' },
    { label: 'Recommendations', icon: <Lightbulb size={20} />, path: '/recommendations' },
    { label: t('settings'), icon: <Settings size={20} />, path: '/settings' },
    { label: 'Profile', icon: <User size={20} />, path: '/profile' },
  ];

  return (
    <div className={`relative flex flex-col h-screen glass border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-20 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 h-16 border-b border-slate-200 dark:border-slate-800">
        {!isCollapsed && (
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate flex items-center gap-2">
            <BatteryCharging className="text-blue-600" /> AI Battery
          </span>
        )}
        {isCollapsed && <BatteryCharging className="text-blue-600 mx-auto" />}
        <button 
          onClick={() => setCollapsed(!isCollapsed)} 
          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hidden md:block"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-current'}`}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={logout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group ${isCollapsed ? 'justify-center mx-auto' : ''}`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
