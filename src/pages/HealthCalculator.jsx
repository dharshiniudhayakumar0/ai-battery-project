import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Battery, Zap, History, RefreshCw, AlertCircle, Info, ArrowRight } from 'lucide-react';
import api from '../api';
import { useAlerts } from '../context/AlertContext';

const HealthCalculator = () => {
  const navigate = useNavigate();
  const { addAlert } = useAlerts();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [formData, setFormData] = useState({
    battery_type: 'Lithium-ion',
    system_type: 'UPS',
    years: '',
    cycles: '',
    avg_voltage: '',
    avg_temp: ''
  });

  const batteryTypes = [
    'Lithium-ion', 'Lithium Polymer (LiPo)', 'LiFePO4', 
    'Lead Acid (Flooded)', 'Lead Acid (AGM)', 'Lead Acid (Gel)', 
    'Nickel-Cadmium (NiCd)', 'Nickel-Metal Hydride (NiMH)', 
    'Silver-Zinc', 'Sodium-Ion', 'Sodium-Sulfur', 
    'Flow Battery (Vanadium)', 'Flow Battery (Zinc-Bromine)', 
    'Nickel-Zinc (NiZn)', 'Zinc-Air', 'Aluminium-Air', 
    'Magnesium-Ion', 'Solid State Battery'
  ];
  const systemTypes = ['UPS', 'EV', 'Solar Storage', 'Industrial', 'Consumer Electronics'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!formData.years || !formData.cycles || !formData.avg_voltage || !formData.avg_temp) {
      addAlert("Please fill in all assessment parameters", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/calculate-health', formData);
      setResult(res.data);
      addAlert("Health calculation completed", "success");
    } catch (err) {
      addAlert("Calculation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health) => {
    if (health > 80) return 'text-emerald-500';
    if (health > 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">Battery Health Calculator</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Estimate current health of old battery units based on usage history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <Calculator size={20} className="text-blue-500" /> Assessment Parameters
          </h2>
          
          <form onSubmit={handleCalculate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Battery Type</label>
              <select
                name="battery_type"
                value={formData.battery_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
              >
                {batteryTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">System Application</label>
              <select
                name="system_type"
                value={formData.system_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
              >
                {systemTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Avg. Voltage (V)</label>
                <input
                  type="number"
                  name="avg_voltage"
                  step="0.1"
                  placeholder="e.g. 12.6"
                  value={formData.avg_voltage}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Avg. Temp (°C)</label>
                <input
                  type="number"
                  name="avg_temp"
                  placeholder="e.g. 25"
                  value={formData.avg_temp}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Years in Use</label>
                <input
                  type="number"
                  name="years"
                  step="0.5"
                  placeholder="e.g. 2.5"
                  value={formData.years}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Est. Charge Cycles</label>
                <input
                  type="number"
                  name="cycles"
                  placeholder="e.g. 400"
                  value={formData.cycles}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? <RefreshCw size={20} className="animate-spin" /> : <Zap size={20} />}
              {loading ? 'Calculating...' : 'Calculate Current Health'}
            </button>
          </form>
        </div>

        {/* Result Section */}
        <div className="flex flex-col gap-6">
          {!result ? (
            <div className="glass-card p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                <Calculator size={32} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Ready to Calculate</h3>
                <p className="text-sm text-slate-500 max-w-[200px] mx-auto">Fill in the parameters to see the estimated health assessment.</p>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 flex-1 space-y-8 animate-in zoom-in-95 duration-300">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Estimated Health Score</p>
                <div className={`text-6xl font-black ${getHealthColor(result.calculated_health)}`}>
                  {result.calculated_health}%
                </div>
              </div>

              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    result.calculated_health > 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                    result.calculated_health > 50 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 
                    'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                  }`}
                  style={{ width: `${result.calculated_health}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-xs text-slate-500 mb-1">Remaining Life</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-200">~{result.estimated_remaining_years} Yrs</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <p className={`text-xl font-bold ${getHealthColor(result.calculated_health)}`}>
                    {result.calculated_health > 80 ? 'Excellent' : result.calculated_health > 50 ? 'Good' : 'Needs Review'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  This estimation is for reference only and intended for pre-registration assessment. For precise results, use automated monitoring.
                </p>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div 
            onClick={() => navigate('/devices/add', { state: { 
              deviceType: formData.battery_type,
              health: result?.calculated_health 
            }})}
            className="glass-card p-6 bg-gradient-to-br from-indigo-500 to-blue-600 text-white group cursor-pointer overflow-hidden relative active:scale-[0.98] transition-transform"
          >
             <div className="relative z-10 flex items-center justify-between">
               <div>
                  <h4 className="font-bold text-lg">Register this Battery?</h4>
                  <p className="text-indigo-100 text-xs">Start real-time health monitoring now</p>
               </div>
               <ArrowRight className="group-hover:translate-x-2 transition-transform" />
             </div>
             {/* Decorative circles */}
             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCalculator;
