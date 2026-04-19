import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';

const DashboardLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const { triggerLoginVoiceAlert } = useAlerts();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trigger voice alert once on login/mount if authenticated
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/') {
       // Just to ensure it doesn't spam, logic usually wraps around the login action itself
       // triggerLoginVoiceAlert();
    }
  }, [isAuthenticated, location.pathname, triggerLoginVoiceAlert]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile Backdrop */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-10 md:hidden" 
          onClick={() => setSidebarCollapsed(true)} 
        />
      )}
      
      <Sidebar isCollapsed={isSidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Navbar onMenuClick={() => setSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth will-change-scroll">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
