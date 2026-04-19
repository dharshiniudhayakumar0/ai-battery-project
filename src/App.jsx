import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import OTPVerification from './pages/auth/OTPVerification';

// Lazy loading core pages initially to keep bundle small
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DeviceList = lazy(() => import('./pages/devices/DeviceList'));
const AddDevice = lazy(() => import('./pages/devices/AddDevice'));
const DeviceDetails = lazy(() => import('./pages/devices/DeviceDetails'));

const Environment = lazy(() => import('./pages/Environment'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Simulation = lazy(() => import('./pages/Simulation'));
const AnomalyDetection = lazy(() => import('./pages/AnomalyDetection'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Explainability = lazy(() => import('./pages/Explainability'));
const Fleet = lazy(() => import('./pages/Fleet'));
const Reports = lazy(() => import('./pages/Reports'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const DockerInfo = lazy(() => import('./pages/DockerInfo'));
const CsvUpload = lazy(() => import('./pages/CsvUpload'));
const ManualInput = lazy(() => import('./pages/ManualInput'));
const HealthCalculator = lazy(() => import('./pages/HealthCalculator'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));

// We handle missing components gracefully below while building
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-[60vh] glass-card">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">{title} Page</h2>
      <p className="text-slate-500 dark:text-slate-400">Under construction...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/devices" element={<DeviceList />} />
            <Route path="/devices/add" element={<AddDevice />} />
            <Route path="/devices/:id" element={<DeviceDetails />} />
            <Route path="/manual-input" element={<ManualInput />} />
            <Route path="/health-calculator" element={<HealthCalculator />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/environment" element={<Environment />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/anomalies" element={<AnomalyDetection />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/explainability" element={<Explainability />} />
            <Route path="/upload" element={<CsvUpload />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/docker" element={<DockerInfo />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
