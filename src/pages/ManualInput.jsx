import React, { useState, useEffect } from 'react';
import { Save, Battery, Zap, Thermometer, Activity, RefreshCw, ChevronRight } from 'lucide-react';
import api from '../api';
import { useAlerts } from '../context/AlertContext';

const ManualInput = () => {
  const { addAlert } = useAlerts();
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [fetchingDevices, setFetchingDevices] = useState(true);
  
  const [formData, setFormData] = useState({
    device_id: '',
    voltage: '',
    temperature: '',
    cycles: '',
    health: ''
  });
  const [isFirstInput, setIsFirstInput] = useState(false);

  useEffect(() => {
    api.get('/api/devices')
      .then(res => {
        setDevices(res.data);
        if (res.data.length > 0) {
          const firstDeviceId = res.data[0].id;
          setFormData(prev => ({ ...prev, device_id: firstDeviceId }));
          checkFirstInput(firstDeviceId);
        }
        setFetchingDevices(false);
      })
      .catch(err => {
        console.error("Failed to fetch devices", err);
        addAlert("Failed to load device list", "error");
        setFetchingDevices(false);
      });
  }, []);

  const checkFirstInput = async (deviceId) => {
    try {
      const res = await api.get(`/api/battery-data/check-first-input/${deviceId}`);
      setIsFirstInput(res.data.is_first_input);
    } catch (err) {
      console.error("Failed to check first input", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'device_id') {
      checkFirstInput(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = ['device_id', 'voltage', 'temperature', 'cycles'];
    if (isFirstInput) requiredFields.push('health');
    
    const isMissingFields = requiredFields.some(field => !formData[field]);
    if (isMissingFields) {
      addAlert("Please fill in all required fields", "warning");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        device_id: parseInt(formData.device_id),
        voltage: parseFloat(formData.voltage),
        temperature: parseFloat(formData.temperature),
        cycles: parseFloat(formData.cycles),
        health: isFirstInput ? parseFloat(formData.health) : 0 // Backend might require a value, or I can update backend to handle missing health if not first input. Actually, the backend model says health is nullable=False, so I should probably send a default or handle it. Wait, the user said "show battery health part only on first time". This might mean they want to keep the last known health or calculate it. For now, I'll send 0 if not first input, or maybe I should fetch the last health. 
      };
      
      // If not first input, let's try to get the existing health.
      if (!isFirstInput) {
        try {
          const lastData = await api.get(`/api/battery-data/${formData.device_id}`);
          if (lastData.data && lastData.data.length > 0) {
            payload.health = lastData.data[0].health;
          }
        } catch (e) {
          console.error("Failed to fetch last health, using 0", e);
        }
      }

      await api.post('/api/battery-data/', payload);
      addAlert("Battery record saved successfully!", "success");
      
      // Reset form except device_id
      setFormData(prev => ({
        ...prev,
        voltage: '',
        temperature: '',
        cycles: '',
        health: ''
      }));
      // Re-check first input (it should be false now)
      checkFirstInput(formData.device_id);
    } catch (err) {
      addAlert(err.response?.data?.message || "Failed to record battery data", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">Manual Data Entry</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manually record battery telemetry for devices when automated logging is unavailable.</p>
      </div>

      <div className="glass-card p-8 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-4">
            {/* Device Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <Battery size={16} className="text-blue-500" /> Select Device
              </label>
              {fetchingDevices ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm italic">
                  <RefreshCw size={14} className="animate-spin" /> Loading devices...
                </div>
              ) : (
                <select
                  name="device_id"
                  value={formData.device_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
                  required
                >
                  <option value="" disabled>Choose a device...</option>
                  {devices.map(device => (
                    <option key={device.id} value={device.id}>
                      {device.name} ({device.env})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Voltage */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" /> Voltage (V)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="voltage"
                  placeholder="e.g. 48.2"
                  value={formData.voltage}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
                  required
                />
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                  <Thermometer size={16} className="text-rose-500" /> Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  placeholder="e.g. 35.5"
                  value={formData.temperature}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Cycles */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <RefreshCw size={16} className="text-blue-400" /> Charge Cycles
              </label>
              <input
                type="number"
                name="cycles"
                placeholder="Number of times charged"
                value={formData.cycles}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
                required
              />
              <p className="mt-1 text-xs text-slate-500">How many times the battery has been charged at this voltage and temperature.</p>
            </div>

            {/* Health - Only visible for first input */}
            {isFirstInput && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                  <Activity size={16} className="text-emerald-500" /> Initial Battery Health (%)
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    name="health"
                    value={formData.health || 0}
                    onChange={handleChange}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    required
                  />
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 font-medium">Poor</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${formData.health > 80 ? 'text-emerald-500' : formData.health > 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {formData.health || 0}%
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Excellent</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
            >
              {loading ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {loading ? 'Recording...' : 'Save Battery Record'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center flex-shrink-0">
          <Activity size={20} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400">Validation Note</h4>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/60 mt-0.5">
            Submitted values are automatically checked against safety thresholds. Critical health or high temperature values will trigger immediate system alerts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManualInput;
