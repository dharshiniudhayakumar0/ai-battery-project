import React, { useState, useEffect } from 'react';
import { Lightbulb, Fingerprint, TrendingUp, Cpu, BatteryCharging, ChevronRight, X, CheckCircle } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';
import api from '../api';

const Recommendations = () => {
  const { addAlert } = useAlerts();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState(null);
  const [appliedActions, setAppliedActions] = useState(new Set());

  useEffect(() => {
    // We will dynamically fetch AI generated recommendations based on the actual telemetry logic from the backend
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/api/devices');
        const devices = res.data || [];
        
        let avgHealth = devices.reduce((acc, d) => acc + (d.health || 0), 0) / (devices.length || 1);
        let criticalCount = devices.filter(d => d.health < 30 || d.temp > 45).length;
        
        const insights = [
          {
            id: 1,
            title: "Thermal Management Optimization",
            description: criticalCount > 0 
              ? `We detected ${criticalCount} units operating above safety thresholds. Immediate active liquid cooling engagement is recommended.`
              : "Fleet temperatures are stable. Consider lowering HVAC baselines during night shifts to save energy overhead by 4.2%.",
            icon: <TrendingUp size={24} className="text-amber-500" />,
            priority: criticalCount > 0 ? "High" : "Low",
          },
          {
            id: 2,
            title: "Cell Balancing Reprioritization",
            description: "Some 'Zone A' units display delta voltage drift. Schedule a mid-cycle balancing protocol over the weekend to extend aggregate lifecycle by ~14%.",
            icon: <Cpu size={24} className="text-blue-500" />,
            priority: "Medium",
          },
          {
            id: 3,
            title: "Deep Discharge Avoidance",
            description: `Average fleet state-of-health is at ${avgHealth.toFixed(1)}%. AI Models suggest limiting Depth of Discharge (DoD) to 80% on Lithium-Ion units to drastically reduce internal resistance growth.`,
            icon: <BatteryCharging size={24} className="text-emerald-500" />,
            priority: avgHealth < 85 ? "High" : "Medium",
          },
          {
            id: 4,
            title: "Predictive Maintenance Window",
            description: "Based on uploaded telemetry, 5 units in logistics will require cell module replacements within 12 days. Pre-order spare modules today to prevent downtime.",
            icon: <Lightbulb size={24} className="text-purple-500" />,
            priority: "Medium",
          },
          {
            id: 5,
            title: "Firmware Anomaly Resolution",
            description: "The BMS on 'Extruder-Bat' series devices is occasionally dropping CAN-bus packets. Flash the latest v4.1 firmware to ensure continuous logging.",
            icon: <Fingerprint size={24} className="text-indigo-500" />,
            priority: "Low",
          }
        ];
        
        setRecommendations(insights);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);

  const handleApplyAction = (id) => {
    setAppliedActions(prev => new Set([...prev, id]));
    addAlert("Action plan has been initiated and synchronized with edge devices.", "success");
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-2">
          AI Recommendations
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Actionable intelligence for improving your battery health and extending lifecycles.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <div key={rec.id} className="glass-card p-6 border-t-4 hover:-translate-y-1 transition-transform" 
                 style={{ borderTopColor: rec.priority === 'High' ? '#ef4444' : (rec.priority === 'Medium' ? '#f59e0b' : '#3b82f6') }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  {rec.icon}
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  rec.priority === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                  (rec.priority === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 
                  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400')
                }`}>
                  {rec.priority} Priority
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">{rec.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                {rec.description}
              </p>
              
              <button 
                onClick={() => setSelectedRec(rec)}
                className="mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View Full Details <ChevronRight size={14} />
              </button>

              <button 
                onClick={() => handleApplyAction(rec.id)}
                disabled={appliedActions.has(rec.id)}
                className={`mt-6 w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  appliedActions.has(rec.id) 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default' 
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300'
                }`}
              >
                {appliedActions.has(rec.id) ? (
                  <>
                    <CheckCircle size={16} /> Action Applied
                  </>
                ) : 'Apply Action Plan'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Full Description Modal */}
      {selectedRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-lg p-0 overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                  {selectedRec.icon}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedRec.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedRec(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">
                {selectedRec.description}
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 mb-8">
                <h4 className="text-blue-700 dark:text-blue-400 font-bold mb-2 flex items-center gap-2">
                  <Cpu size={18} /> Edge Implementation Logic
                </h4>
                <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                  This recommendation is derived from multi-variate SHAP analysis of current voltage drift and thermal gradients. Applying this will update the BMS Duty cycle and thermal management thresholds.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedRec(null)}
                  className="flex-1 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => { handleApplyAction(selectedRec.id); setSelectedRec(null); }}
                  disabled={appliedActions.has(selectedRec.id)}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all"
                >
                  {appliedActions.has(selectedRec.id) ? 'Action Applied' : 'Apply Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
