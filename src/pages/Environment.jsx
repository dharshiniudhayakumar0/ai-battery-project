import React, { useState, useEffect } from 'react';
import { Map, Layers, Activity, Users, ChevronRight, MapPin, RefreshCw } from 'lucide-react';
import api from '../api';

const Environment = () => {
  const [activeTab, setActiveTab] = useState('zones');
  const [environments, setEnvironments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnvData = async () => {
      try {
        const res = await api.get('/api/devices');
        const devices = res.data;
        
        const envGroups = devices.reduce((acc, dev) => {
          const envName = dev.environment || 'Unassigned';
          if (!acc[envName]) {
            acc[envName] = {
              id: envName,
              name: envName,
              type: 'Monitored Zone',
              devices: 0,
              alerts: 0,
              tempSum: 0,
              tempCount: 0
            };
          }
          acc[envName].devices += 1;
          acc[envName].tempSum += dev.temp || 0;
          acc[envName].tempCount += 1;
          if (dev.status === 'Warning' || dev.status === 'Critical') {
            acc[envName].alerts += 1;
          }
          return acc;
        }, {});
        
        const aggregated = Object.values(envGroups).map(g => ({
          ...g,
          temp: g.tempCount > 0 ? `${Math.round(g.tempSum / g.tempCount)}°C` : 'N/A'
        }));
        
        setEnvironments(aggregated);
      } catch (err) {
        console.error("Failed to fetch environments", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnvData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">Environment Segregation</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Group and monitor devices by Factory Zones, Departments, and Locations.</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button 
          onClick={() => setActiveTab('zones')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'zones' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Factory Zones
        </button>
        <button 
          onClick={() => setActiveTab('depts')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'depts' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Departments
        </button>
        <button 
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'locations' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Geographic Locations
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 w-full col-span-2">
          <RefreshCw className="animate-spin mb-4" size={32} />
          <p className="font-medium text-slate-500">Aggregating environment zones...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full flex-1">
          {environments.map(env => (
          <div key={env.id} className="glass-card p-5 group hover:border-blue-500/50 transition-colors cursor-pointer flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{env.name}</h3>
                  <p className="text-xs text-slate-500">{env.type}</p>
                </div>
              </div>
              <button className="text-slate-400 group-hover:text-blue-500 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-auto">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg text-center">
                <div className="text-lg font-bold text-slate-700 dark:text-slate-200">{env.devices}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Devices</div>
              </div>
              <div className={`p-2.5 rounded-lg text-center ${env.alerts > 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200'}`}>
                <div className="text-lg font-bold">{env.alerts}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold opacity-70">Alerts</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg text-center text-orange-600 dark:text-orange-400">
                <div className="text-lg font-bold">{env.temp}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold opacity-70">Avg Temp</div>
              </div>
            </div>
          </div>
        ))}

        <div className="glass-card p-5 border-dashed border-2 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all cursor-pointer min-h-[160px]">
          <div className="text-center">
            <Layers size={28} className="mx-auto mb-2" />
            <span className="font-medium">Define New Zone</span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Environment;
