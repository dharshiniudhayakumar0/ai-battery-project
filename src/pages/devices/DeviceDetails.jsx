import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Battery, Zap, Thermometer, ShieldCheck, ArrowLeft, Clock, Activity, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api';

const mockData = [
  { time: '00:00', voltage: 48.2, temp: 35 },
  { time: '04:00', voltage: 48.0, temp: 36 },
  { time: '08:00', voltage: 47.9, temp: 35 },
  { time: '12:00', voltage: 47.6, temp: 38 },
  { time: '16:00', voltage: 47.4, temp: 34 },
  { time: '20:00', voltage: 47.8, temp: 35 },
];

const DeviceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDevice = async () => {
      try {
        const res = await api.get(`/devices/${id}`);
        // Add mock status and metrics if missing from backend for UI consistency
        setDevice({
          ...res.data,
          health: res.data.health || 85,
          voltage: res.data.voltage || 48.2,
          temp: res.data.temp || 35,
          status: res.data.status || 'Healthy',
          lastServiced: '2023-11-15'
        });
      } catch (err) {
        console.error("Failed to fetch device details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevice();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <RefreshCw className="animate-spin mb-4" size={32} />
        <p className="font-medium text-slate-500">Retrieving device data...</p>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-xl font-bold mb-2">Device not found</h2>
        <button onClick={() => navigate('/devices')} className="text-blue-600 hover:underline">Back to fleet</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">{device.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Device ID: {device.id}</p>
        </div>
        <div className="ml-auto px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-sm font-semibold border border-green-200 dark:border-green-800 flex items-center">
          <ShieldCheck size={16} className="mr-1.5" /> {device.status}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
            <Battery size={20} className="mr-2" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Health %</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{device.health}%</div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${device.health}%`}}></div>
          </div>
        </div>
        
        <div className="glass-card p-5">
          <div className="flex items-center text-orange-500 mb-2">
            <Zap size={20} className="mr-2" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Voltage</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{device.voltage}V</div>
          <p className="text-sm text-slate-500 mt-1">Optimal: 48.0V</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center text-red-500 mb-2">
            <Thermometer size={20} className="mr-2" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Temperature</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{device.temp}°C</div>
          <p className="text-sm text-slate-500 mt-1">Safe zone: &lt; 45°C</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center text-purple-500 mb-2">
            <Clock size={20} className="mr-2" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Last Service</h3>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">{device.lastServiced}</div>
          <p className="text-sm text-slate-500 mt-1">112 days ago</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
            <Activity size={18} className="mr-2 text-blue-500" /> Voltage & Temperature Trends
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={['dataMin - 1', 'dataMax + 1']} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                <Line yAxisId="left" type="monotone" dataKey="voltage" stroke="#3b82f6" strokeWidth={3} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Device Info</h3>
          <ul className="space-y-4">
            <li className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Type</span>
              <span className="font-medium text-slate-900 dark:text-white">{device.type}</span>
            </li>
            <li className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Environment</span>
              <span className="font-medium text-slate-900 dark:text-white">{device.environment || device.env}</span>
            </li>
            <li className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Firmware</span>
              <span className="font-medium text-slate-900 dark:text-white">v2.1.4</span>
            </li>
            <li className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Charge Cycles</span>
              <span className="font-medium text-slate-900 dark:text-white">412</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetails;
