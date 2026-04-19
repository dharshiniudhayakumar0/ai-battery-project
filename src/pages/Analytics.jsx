import React from 'react';
import { 
  BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const deviceTypeData = [
  { name: 'Li-Ion NMC', value: 400, color: '#3b82f6' },
  { name: 'Lead-Acid AGM', value: 300, color: '#f59e0b' },
  { name: 'LiFePO4', value: 300, color: '#10b981' },
  { name: 'Ni-Cd', value: 200, color: '#6366f1' },
];

const healthDistribution = [
  { range: '90-100%', count: 450 },
  { range: '80-89%', count: 320 },
  { range: '70-79%', count: 180 },
  { range: '60-69%', count: 85 },
  { range: '<60%', count: 25 },
];

const lifecycleData = [
  { month: 'Jan', added: 40, replaced: 10 },
  { month: 'Feb', added: 30, replaced: 15 },
  { month: 'Mar', added: 65, replaced: 8 },
  { month: 'Apr', added: 45, replaced: 25 },
  { month: 'May', added: 80, replaced: 12 },
  { month: 'Jun', added: 95, replaced: 30 },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">Advanced Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Deep dive into fleet performance and historical trends.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Composition - Pie Chart */}
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Device Fleet Composition</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceTypeData}
                  cx="50%" cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {deviceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Distribution - Bar Chart */}
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Health Score Distribution</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBar data={healthDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </RechartsBar>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lifecycle - Area Chart */}
        <div className="glass-card p-6 lg:col-span-2 min-h-[350px] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Fleet Lifecycle Trends</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lifecycleData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReplaced" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="added" name="New Dispatches" stroke="#10b981" fillOpacity={1} fill="url(#colorAdded)" strokeWidth={2} />
                <Area type="monotone" dataKey="replaced" name="Replacements" stroke="#ef4444" fillOpacity={1} fill="url(#colorReplaced)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
