import React, { useState } from 'react';
import { Mail, Smartphone, Bell, Volume2, Save } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';

const Settings = () => {
  const { voiceEnabled, toggleVoice, addAlert } = useAlerts();
  
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    smsAlerts: true,
    weeklyReport: true
  });

  const togglePref = (key) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    addAlert('Settings saved successfully', 'success');
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">System Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure global platform preferences and alert behaviors.</p>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
          <Bell className="text-blue-500" size={20}/> Alert System Configuration
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 items-start">
              <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Mail size={20}/></div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200">Email Alerts</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Receive critical anomaly warnings via registered Email.</p>
              </div>
            </div>
            <ToggleSwitch checked={prefs.emailAlerts} onChange={() => togglePref('emailAlerts')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4 items-start">
              <div className="mt-1 p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Smartphone size={20}/></div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200">SMS Alerts</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Instant pushes to configured mobile device for high-severity issues.</p>
              </div>
            </div>
            <ToggleSwitch checked={prefs.smsAlerts} onChange={() => togglePref('smsAlerts')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4 items-start">
              <div className="mt-1 p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Volume2 size={20}/></div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200">Voice Synthesis Alerts</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Browser will speak out loud when critical alerts occur on dashboard.</p>
              </div>
            </div>
            <ToggleSwitch checked={voiceEnabled} onChange={toggleVoice} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors">
          Reset Defaults
        </button>
        <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md flex items-center gap-2 transition-colors">
          <Save size={18}/> Save Preferences
        </button>
      </div>
    </div>
  );
};

export default Settings;
