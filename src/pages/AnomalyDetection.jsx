import React from 'react';
import { AlertTriangle, TrendingUp, Thermometer, ShieldAlert, Cpu } from 'lucide-react';

const anomalyLogs = [
  { id: 1, type: 'Voltage Spike', device: 'Bat-Extruder-1', value: '54.2V', time: '10 mins ago', severity: 'Critical', desc: 'Voltage exceeded maximum threshold of 52.0V' },
  { id: 2, type: 'Temperature Rise', device: 'Bat-Crane-OP', value: '58°C', time: '45 mins ago', severity: 'High', desc: 'Rapid temperature increase detected in Cell Block 4' },
  { id: 3, type: 'Discharge Rate', device: 'UPS-Main-Room', value: '4.2C', time: '2 hours ago', severity: 'Medium', desc: 'Abnormal continuous discharge rate over 3C' },
  { id: 4, type: 'Imbalance', device: 'Forklift-Bat-B', value: '0.4V Δ', time: '5 hours ago', severity: 'Low', desc: 'Cell voltage drift detected during charging' },
];

const AnomalyDetection = () => {
  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800 border';
      case 'High': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800 border';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800 border';
      case 'Low': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800 border';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 border';
    }
  };

  const getIcon = (type) => {
    if (type.includes('Voltage')) return <TrendingUp size={20} />;
    if (type.includes('Temperature')) return <Thermometer size={20} />;
    if (type.includes('Imbalance')) return <Cpu size={20} />;
    return <AlertTriangle size={20} />;
  };

  return (
    <div className="space-y-6">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">Anomaly Detection Engine</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered detection of erratic battery behaviors via SHAP models.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <button className="px-4 py-1.5 rounded-md bg-white dark:bg-slate-800 shadow-sm text-sm font-medium text-slate-800 dark:text-slate-200">Active</button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Resolved</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {anomalyLogs.map(log => (
          <div key={log.id} className={`glass-card p-5 border-l-4 overflow-hidden relative group hover:shadow-md transition-shadow ${log.severity === 'Critical' ? 'border-l-red-500' : log.severity === 'High' ? 'border-l-orange-500' : log.severity === 'Medium' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
            
            <div className="absolute right-0 top-0 w-32 h-32 bg-current opacity-[0.03] -mr-8 -mt-8 rounded-full pointer-events-none" />
            
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className={`p-3 rounded-xl ${getSeverityStyle(log.severity)}`}>
                {getIcon(log.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{log.type}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getSeverityStyle(log.severity)}`}>
                    {log.severity}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{log.desc}</p>
              </div>

              <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-1 w-full md:w-auto bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-lg dark:bg-slate-900/50 md:dark:bg-transparent">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Device</span>
                  <div className="font-medium text-slate-900 dark:text-white">{log.device}</div>
                </div>
                <div className="md:text-right">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Peak Value</span>
                  <div className="font-bold text-red-600 dark:text-red-400">{log.value}</div>
                </div>
              </div>

              <div className="md:ml-4 text-xs font-medium text-slate-400 flex items-center shrink-0">
                <ClockIcon className="mr-1" /> {log.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// SVG component helper
const ClockIcon = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default AnomalyDetection;
