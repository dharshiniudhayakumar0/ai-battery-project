import React, { useState, useEffect } from 'react';
import { Battery, AlertTriangle, BatteryFull, ShieldAlert, RefreshCw } from 'lucide-react';
import api from '../api';

const Fleet = () => {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [environments, setEnvironments] = useState(['All']);

  useEffect(() => {
    api.get('/api/devices')
      .then(res => {
        setFleet(res.data);
        const uniqueEnvs = ['All', ...new Set(res.data.map(d => d.environment).filter(Boolean))];
        setEnvironments(uniqueEnvs);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load fleet", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">Fleet Command Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Dense Grid View for monitoring active edge devices instantly.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Filter Environment:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          >
            {environments.map(env => (
              <option key={env} value={env}>{env}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card p-4 overflow-hidden min-h-[200px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <RefreshCw className="animate-spin mb-4" size={32} />
            <p className="font-medium text-slate-500">Loading fleet data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-10 gap-2">
            {fleet
              .filter(device => filter === 'All' || device.environment === filter)
              .map(device => (
              <div 
                key={device.id} 
                className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center cursor-pointer hover:scale-105 transition-transform ${
                  device.status === 'Critical' ? 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800' :
                  device.status === 'Warning' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800' :
                  'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                }`}
              >
                <div className="mb-1 text-slate-700 dark:text-slate-300">
                  {device.status === 'Healthy' ? <BatteryFull size={18} className="text-green-500"/> :
                   device.status === 'Warning' ? <AlertTriangle size={18} className="text-orange-500"/> :
                   <ShieldAlert size={18} className="text-red-500 animate-pulse"/>
                  }
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-0.5 truncate w-full">{device.name}</div>
                <div className={`text-xs font-bold ${
                  device.health > 70 ? 'text-green-600 dark:text-green-400' :
                  device.health > 40 ? 'text-orange-600 dark:text-orange-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {device.health}%
                </div>
              </div>
            ))}
            {fleet.length === 0 && (
               <div className="col-span-full py-8 text-center text-slate-500">
                 No active devices in the fleet.
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Fleet;
