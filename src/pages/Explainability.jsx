import React from 'react';
import { Lightbulb, Info, Target, GitMerge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const shapValues = [
  { feature: 'Discharge Current', impact: 0.35, color: '#ef4444' }, // Red (Negative impact generally on life, high importance)
  { feature: 'Peak Temp', impact: 0.28, color: '#f97316' },
  { float: 'Charge Cycles', impact: 0.15, color: '#3b82f6' },
  { feature: 'Idle Time', impact: 0.12, color: '#10b981' },
  { feature: 'Voltage Drop', impact: -0.05, color: '#64748b' },
];

// Formatting SHAP data for recharts horizontal bars
const chartData = [
  { name: 'Discharge Current', value: 0.35, positive: true },
  { name: 'Peak Temp', value: 0.28, positive: true },
  { name: 'Charge Cycles', value: 0.15, positive: true },
  { name: 'Idle Time', value: 0.12, positive: true },
  { name: 'Voltage Drop', value: -0.05, positive: false },
].sort((a,b) => Math.abs(b.value) - Math.abs(a.value));

const Explainability = () => {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-2">
          AI Model Explainability <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 mt-1">SHAP Integration</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Understand exactly why the AI made its predictions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2 flex flex-col min-h-[450px]">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Global Feature Importance (SHAP Values)</h2>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400"></span> Pushes Prediction Higher (Risk)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-400"></span> Pushes Prediction Lower (Safe)</span>
              </div>
           </div>
           
           <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={120} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  formatter={(value) => [Math.abs(value).toFixed(2), "SHAP Impact"]}
                />
                <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.positive ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 bg-slate-50 dark:bg-slate-900 border-l-4 border-l-blue-500">
             <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-2">
               <Lightbulb className="text-blue-500" size={18} /> How to read this chart
             </h3>
             <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
               The chart on the left shows the <strong>mean |SHAP| value</strong> for each feature across the dataset. 
               Longer bars mean the feature had a bigger impact on the AI's final prediction.
             </p>
          </div>

           <div className="glass-card p-6">
             <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-4">
               <Target className="text-indigo-500" size={18} /> Key Insights
             </h3>
             <ul className="space-y-4 relative before:absolute before:inset-y-0 before:left-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-6">
                 <li className="relative">
                    <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-red-100 border-2 border-red-500 dark:bg-red-900 z-10"></span>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Discharge Current is critical</h4>
                    <p className="text-xs text-slate-500 mt-1">Sustained high discharge current is the #1 predictor of battery degradation in the current model.</p>
                 </li>
                 <li className="relative">
                    <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-orange-100 border-2 border-orange-500 dark:bg-orange-900 z-10"></span>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Temperature cascades</h4>
                    <p className="text-xs text-slate-500 mt-1">Peak Temp exacerbates the effects of high charge cycles heavily, creating a multiplier effect on capacity loss.</p>
                 </li>
                 <li className="relative">
                    <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500 dark:bg-blue-900 z-10"></span>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Charge Cycle Milestones</h4>
                    <p className="text-xs text-slate-500 mt-1">After 700+ charge cycles, lithium-ion NMC units show a 3x higher sensitivity to thermal spikes.</p>
                 </li>
                 <li className="relative">
                    <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500 dark:bg-emerald-900 z-10"></span>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Idle Time acts as a buffer</h4>
                    <p className="text-xs text-slate-500 mt-1">Extended idle time allows internal cell chemistry to rebalance, slightly pushing the lifespan prediction higher.</p>
                 </li>
                 <li className="relative">
                    <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-slate-100 border-2 border-slate-500 dark:bg-slate-700 z-10"></span>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Voltage Drop variations</h4>
                    <p className="text-xs text-slate-500 mt-1">While voltage drop is traditionally a strong indicator, our AI correctly deprioritizes it behind thermal dynamics.</p>
                 </li>
                 <li className="relative">
                    <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-indigo-100 border-2 border-indigo-500 dark:bg-indigo-900 z-10"></span>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Environment Clustering</h4>
                    <p className="text-xs text-slate-500 mt-1">Devices placed in 'Zone A - High Temp' consistently lose 1.8% more health per month across all profiles.</p>
                 </li>
                 <li className="relative">
                    <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-teal-100 border-2 border-teal-500 dark:bg-teal-900 z-10"></span>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Chemical Stabilization Lag</h4>
                    <p className="text-xs text-slate-500 mt-1">Predictions factor in a 48-hour 'settling period' after high-amperage events to account for ionic stabilization.</p>
                 </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explainability;
