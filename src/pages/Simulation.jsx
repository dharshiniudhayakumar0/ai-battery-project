import React, { useState } from 'react';
import { Play, Activity, Thermometer, RefreshCw, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';

const Simulation = () => {
  const [inputs, setInputs] = useState({
    voltage: 48.0,
    temperature: 35.0,
    chargeCycles: 200
  });

  const [results, setResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    setResults(null);
    
    try {
      const res = await api.post('/api/predict', {
        voltage: inputs.voltage,
        temperature: inputs.temperature
      });
      
      const parsedHealth = res.data.predicted_health;
      const isAnomaly = res.data.anomaly_status;
      
      const curve = [];
      let currentH = parseFloat(parsedHealth);
      for(let i=0; i<=12; i++) {
        curve.push({
          month: `+${i}M`,
          health: currentH.toFixed(1)
        });
        currentH -= (inputs.temperature > 40 ? 1.2 : 0.5) + (isAnomaly ? 0.8 : 0);
      }

      setResults({
        healthScore: parsedHealth,
        degradationRate: inputs.temperature > 40 ? 'High' : (isAnomaly ? 'Elevated' : 'Normal'),
        estimatedLifespan: parsedHealth > 80 ? '2.5 Years' : parsedHealth > 50 ? '1 Year' : '3 Months',
        curveData: curve
      });
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">Simulation Engine</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Generate predictive health reports using synthetic scenario testing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 h-fit">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <Zap className="text-blue-500" /> Input Parameters
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Voltage (V)</label>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{inputs.voltage}V</span>
              </div>
              <input 
                type="range" name="voltage" min="40" max="60" step="0.1" 
                value={inputs.voltage} onChange={handleInputChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600" 
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>40V</span><span>60V</span>
              </div>
            </div>

             <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Temperature (°C)</label>
                <span className="text-sm font-bold text-orange-500">{inputs.temperature}°C</span>
              </div>
              <input 
                type="range" name="temperature" min="-10" max="80" step="0.5" 
                value={inputs.temperature} onChange={handleInputChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-orange-500" 
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>-10°C</span><span>80°C</span>
              </div>
            </div>

            <div>
               <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Charge Cycles</label>
                <span className="text-sm font-bold text-indigo-500">{inputs.chargeCycles}</span>
              </div>
              <input 
                type="range" name="chargeCycles" min="0" max="2000" step="10" 
                value={inputs.chargeCycles} onChange={handleInputChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-500" 
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0</span><span>2000</span>
              </div>
            </div>

            <button 
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSimulating ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />}
              {isSimulating ? 'Processing...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        <div className="glass-card p-6 lg:col-span-2 min-h-[400px] flex flex-col relative">
           <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <Activity className="text-blue-500" /> Simulation Results
          </h2>

          {!results && !isSimulating && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
               <Activity size={48} className="mb-4 opacity-50" />
               <p>Adjust parameters and run simulation to view insights.</p>
            </div>
          )}

          {isSimulating && (
            <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
              <RefreshCw className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-slate-900 dark:text-white font-medium animate-pulse">Running Physics Models...</p>
            </div>
          )}

          {results && !isSimulating && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                    <div className={`text-3xl font-bold mb-1 ${results.healthScore > 80 ? 'text-green-500' : results.healthScore > 50 ? 'text-orange-500' : 'text-red-500'}`}>
                      {results.healthScore}%
                    </div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">Simulated Health</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {results.estimatedLifespan}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">Est. Lifespan</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                    <div className={`text-xl md:text-2xl font-bold mb-1 mt-1 xl:mt-0 ${results.degradationRate === 'High' ? 'text-orange-500' : 'text-green-500'}`}>
                      {results.degradationRate}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">Degradation Rate</div>
                  </div>
               </div>

               <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Projected Health Trajectory (12 Months)</h3>
               <div className="flex-1 min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.curveData}>
                    <defs>
                      <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                    <Area type="monotone" dataKey="health" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHealth)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulation;
