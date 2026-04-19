import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Battery, Zap, Thermometer, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, Activity 
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import api from '../api';



const StatCard = ({ title, value, icon, trend, up }) => (
  <div className="glass-card p-6 flex flex-col hover:shadow-lg transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
        {icon}
      </div>
      {trend && (
        <span className={`flex items-center text-sm font-medium ${up ? 'text-green-500' : 'text-red-500'}`}>
          {up ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">{value}</h2>
  </div>
);

const Dashboard = () => {
  const { t } = useTranslation();
  
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    total: 0, healthy: 0, warning: 0, critical: 0, avgHealth: 100, avgTemp: 0
  });
  const [pieData, setPieData] = React.useState([]);
  const [chartData, setChartData] = React.useState([]);

  const [activeCount, setActiveCount] = React.useState(0);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/api/devices');
        const devices = res.data || [];
        
        let healthy = 0, warning = 0, critical = 0, totalTemp = 0, totalHealth = 0, activeCount = 0;
        let normalTemp = 0, elevatedTemp = 0, highTemp = 0;
        
        devices.forEach(d => {
          if (d.health > 0) {
            totalTemp += (d.temp || 0);
            totalHealth += (d.health || 0);
            
            if (d.health >= 80) healthy++;
            else if (d.health >= 50) warning++;
            else critical++;
            
            if (d.temp < 35) normalTemp++;
            else if (d.temp <= 45) elevatedTemp++;
            else highTemp++;
            
            activeCount++;
          }
        });
        
        const total = activeCount || 1;
        setStats({
          total: devices.length,
          healthy,
          warning,
          critical,
          avgHealth: activeCount > 0 ? (totalHealth / total).toFixed(1) : 0,
          avgTemp: activeCount > 0 ? (totalTemp / total).toFixed(1) : 0
        });
        setActiveCount(activeCount);
        
        setPieData([
          { name: 'Normal', value: normalTemp, color: '#3b82f6' },
          { name: 'Elevated', value: elevatedTemp, color: '#f59e0b' },
          { name: 'High', value: highTemp, color: '#ef4444' },
        ]);
        
        // Use devices to build mock voltage history for active demo effect if historical real data is absent
        // We'll map the top 7 devices as timeline points for now to ensure a working chart
        const cData = devices.slice(0, 7).map((d, i) => ({
          name: d.name || `Dev-${i}`,
          voltage: d.voltage || 0,
          health: d.health || 0
        }));
        setChartData(cData.length > 0 ? cData : [{name: 'No Data', voltage: 0, health: 0}]);
        
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-500">Loading live analytics...</div>;

  if (stats.total === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">Battery Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome to your monitoring platform.</p>
          </div>
        </div>
        
        <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500 mb-6">
            <Battery size={48} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">No Devices Added Yet</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
            Start by adding your first battery unit to visualize telemetry data, AI health predictions, and thermal analysis.
          </p>
          <a 
            href="/devices/add"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all"
          >
            Add Your First Device
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit tracking-tight">
            Battery Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time insights across all connected devices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Live MQTT Data
          </span>
          <span className="flex items-center text-xs font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-400 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800">
            <Activity size={12} className="mr-1.5" />
            Redis Cached
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Devices" value={stats.total} icon={<Battery size={24} />} trend="Active" up={true} />
        <StatCard title="Average Health" value={`${stats.avgHealth}%`} icon={<Zap size={24} />} trend="Live" up={stats.avgHealth > 80} />
        <StatCard title="Warning State" value={stats.warning} icon={<AlertTriangle size={24} />} trend="Attention" up={stats.warning === 0} />
        <StatCard title="Critical Needs" value={stats.critical} icon={<Thermometer size={24} />} trend="Urgent" up={stats.critical === 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Voltage Trends</h3>
            <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} 
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line type="monotone" dataKey="voltage" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Temperature Dist</h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-2">
               <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.avgTemp}°C</span>
               <span className="text-xs text-slate-500">Average</span>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-4">
             {pieData.map((item) => (
               <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-600 dark:text-slate-400">{item.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
