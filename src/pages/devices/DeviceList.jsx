import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Battery, BatteryWarning, BatteryFull, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const getStatusColor = (status) => {
  switch(status) {
    case 'Healthy': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800';
    case 'Warning': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800';
    case 'Critical': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
};

const getStatusIcon = (status) => {
  switch(status) {
    case 'Healthy': return <BatteryFull size={16} className="mr-1.5" />;
    case 'Warning': return <BatteryWarning size={16} className="mr-1.5" />;
    case 'Critical': return <Battery size={16} className="mr-1.5" />;
    default: return <Battery size={16} className="mr-1.5" />;
  }
};

const DeviceList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnv, setFilterEnv] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [environments, setEnvironments] = useState(['All']);

  useEffect(() => {
    api.get('/api/devices')
      .then(res => {
        setDevices(res.data);
        const uniqueEnvs = ['All', ...new Set(res.data.map(d => d.environment || d.env).filter(Boolean))];
        setEnvironments(uniqueEnvs);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load devices", err);
        setLoading(false);
      });
  }, []);

  const filteredDevices = devices.filter(d => {
    const matchesSearch = d.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEnv = filterEnv === 'All' || d.environment === filterEnv || d.env === filterEnv;
    const matchesStatus = filterStatus === 'All' || d.status === filterStatus;
    return matchesSearch && matchesEnv && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">Device Fleet</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and monitor all connected battery units.</p>
        </div>
        <button 
          onClick={() => navigate('/devices/add')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Device
        </button>
      </div>

      <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by device name..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-colors"
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
            value={filterEnv}
            onChange={e => setFilterEnv(e.target.value)}
          >
            {environments.map(env => (
              <option key={env} value={env}>{env === 'All' ? 'All Environments' : env}</option>
            ))}
          </select>
          <select 
            className="px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Healthy">Healthy</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <RefreshCw className="animate-spin mb-4" size={32} />
            <p className="font-medium text-slate-500">Loading devices from server...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Device Name</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Environment</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Health %</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Voltage/Temp</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDevices.map(device => (
                <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3">
                        <Battery size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/devices/${device.id}`)}>
                          {device.name}
                        </p>
                        <p className="text-xs text-slate-500">{device.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">
                    {device.env}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{device.health}%</span>
                      <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${device.health > 80 ? 'bg-green-500' : device.health > 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                          style={{ width: `${device.health}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex flex-col">
                      <span>{device.voltage}V</span>
                      <span className="text-xs text-slate-400">{device.temp}°C</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(device.status)}`}>
                      {getStatusIcon(device.status)}
                      {device.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No devices found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceList;
