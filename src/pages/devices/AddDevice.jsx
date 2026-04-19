import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Camera, Server, Search, X, AlertCircle } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../api';

const AddDevice = () => {
  const location = useLocation();
  const { addAlert } = useAlerts();
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [formData, setFormData] = useState({
    deviceId: '',
    deviceName: '',
    deviceType: 'Lithium-Ion NMC (700+ Data Model)',
    industryType: 'Manufacturing',
    environment: 'Zone A - High Temp'
  });
  
  const [customFields, setCustomFields] = useState({
    showCustomDeviceType: false,
    showCustomIndustryType: false,
    showCustomEnvironment: false
  });

  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (location.state) {
      const { deviceType, health } = location.state;
      if (deviceType) {
        setFormData(prev => ({ ...prev, deviceType }));
      }
      // You could also store 'health' in a hidden field or just use it later
      console.log("Passed health estimation:", health);
    }
  }, [location]);

  useEffect(() => {
    if (isScanning) {
      setScannerError('');
      html5QrCodeRef.current = new Html5Qrcode("reader");
      
      html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // Success
          try {
            // Check if it's a JSON payload (Smart QR Code)
            const parsedData = JSON.parse(decodedText);
            
            setFormData(prev => ({
              ...prev,
              deviceId: parsedData.id || parsedData.deviceId || decodedText,
              deviceName: parsedData.name || parsedData.deviceName || prev.deviceName,
              deviceType: parsedData.type || parsedData.deviceType || prev.deviceType,
              industryType: parsedData.industry || parsedData.industryType || prev.industryType,
              environment: parsedData.environment || prev.environment
            }));
            
            setIsScanning(false);
            addAlert('Smart QR Code scanned successfully! Fields auto-filled.', 'success');
          } catch (e) {
            // Fallback: It's just a regular text/barcode (Not JSON)
            setFormData(prev => ({ ...prev, deviceId: decodedText }));
            setIsScanning(false);
            addAlert(`Scanned ID: ${decodedText}`, 'success');
          }
          stopScanner();
        },
        (error) => {
          // Ignore frequent scan errors, they happen when no QR code is in view
        }
      ).catch((err) => {
        // Handle camera permission denied or no camera available
        console.error("Camera error:", err);
        setScannerError("Camera access denied or no camera available. Please check device permissions.");
      });
    }

    return () => {
      stopScanner();
    };
  }, [isScanning]);

  const stopScanner = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
      }).catch(err => console.log("Error stopping scanner", err));
    }
  };

  const handleCloseModal = () => {
    setIsScanning(false);
    stopScanner();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check if user selected 'Custom'
    if (value === 'CUSTOM_OPTION') {
      if (name === 'deviceType') setCustomFields({...customFields, showCustomDeviceType: true});
      if (name === 'industryType') setCustomFields({...customFields, showCustomIndustryType: true});
      if (name === 'environment') setCustomFields({...customFields, showCustomEnvironment: true});
      setFormData({...formData, [name]: '' });
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deviceId || !formData.deviceName) {
      addAlert('Device ID and Name are required', 'warning');
      return;
    }
    
    try {
      const res = await api.post('/api/devices', {
        name: formData.deviceName,
        type: formData.deviceType,
        environment: formData.environment,
        barcode: formData.deviceId
      });
      addAlert(`Successfully added device ${formData.deviceName}`, 'success');
      // Reset form or redirect
      setFormData({
        deviceId: '',
        deviceName: '',
        deviceType: 'Lithium-Ion NMC (700+ Data Model)',
        industryType: 'Manufacturing',
        environment: 'Zone A - High Temp'
      });
      setCustomFields({
        showCustomDeviceType: false,
        showCustomIndustryType: false,
        showCustomEnvironment: false
      });
    } catch (err) {
      addAlert(err.response?.data?.message || err.message, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">Add New Device</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Register a new battery unit to the monitoring system.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Manual Form Section with Scan Option */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Server className="text-blue-500" /> Device Details
            </h2>
            <button 
              onClick={() => setIsScanning(true)}
              type="button"
              className="px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 text-sm"
            >
              <Camera size={18} />
              Scan Barcode
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Device ID (MAC/Serial)</label>
              <input 
                type="text" 
                name="deviceId"
                value={formData.deviceId}
                onChange={handleChange}
                placeholder="e.g. 00:1B:44:11:3A:B7 or Scan to auto-fill"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Custom Device Name</label>
              <input 
                type="text" 
                name="deviceName"
                value={formData.deviceName}
                onChange={handleChange}
                placeholder="e.g. Extruder-Bat-1"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Device Type</label>
              {!customFields.showCustomDeviceType ? (
                <select 
                  name="deviceType"
                  value={formData.deviceType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors"
                >
                  <option value="Lithium-ion">Lithium-ion</option>
                  <option value="Lithium Polymer (LiPo)">Lithium Polymer (LiPo)</option>
                  <option value="LiFePO4">LiFePO4</option>
                  <option value="Lead Acid (Flooded)">Lead Acid (Flooded)</option>
                  <option value="Lead Acid (AGM)">Lead Acid (AGM)</option>
                  <option value="Lead Acid (Gel)">Lead Acid (Gel)</option>
                  <option value="Nickel-Cadmium (NiCd)">Nickel-Cadmium (NiCd)</option>
                  <option value="Nickel-Metal Hydride (NiMH)">Nickel-Metal Hydride (NiMH)</option>
                  <option value="Silver-Zinc">Silver-Zinc</option>
                  <option value="Sodium-Ion">Sodium-Ion</option>
                  <option value="Sodium-Sulfur">Sodium-Sulfur</option>
                  <option value="Flow Battery (Vanadium)">Flow Battery (Vanadium)</option>
                  <option value="Flow Battery (Zinc-Bromine)">Flow Battery (Zinc-Bromine)</option>
                  <option value="Nickel-Zinc (NiZn)">Nickel-Zinc (NiZn)</option>
                  <option value="Zinc-Air">Zinc-Air</option>
                  <option value="Aluminium-Air">Aluminium-Air</option>
                  <option value="Magnesium-Ion">Magnesium-Ion</option>
                  <option value="Solid State Battery">Solid State Battery</option>
                  <option value="CUSTOM_OPTION">+ Add your own custom type...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text" name="deviceType" value={formData.deviceType} onChange={handleChange}
                    placeholder="Enter custom device type" autoFocus
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors"
                  />
                  <button type="button" onClick={() => { setCustomFields({...customFields, showCustomDeviceType: false}); setFormData({...formData, deviceType: 'Lithium-Ion NMC (700+ Data Model)'}) }} className="px-3 text-slate-400 hover:text-red-500">
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Industry Type</label>
                {!customFields.showCustomIndustryType ? (
                  <select 
                    name="industryType"
                    value={formData.industryType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors"
                  >
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Data Center">Data Center</option>
                    <option value="CUSTOM_OPTION">+ Add your own industry...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" name="industryType" value={formData.industryType} onChange={handleChange} placeholder="Custom industry" autoFocus
                      className="flex-1 px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors"
                    />
                    <button type="button" onClick={() => { setCustomFields({...customFields, showCustomIndustryType: false}); setFormData({...formData, industryType: 'Manufacturing'}) }} className="px-2 text-slate-400 hover:text-red-500">
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Environment</label>
                {!customFields.showCustomEnvironment ? (
                  <select 
                    name="environment"
                    value={formData.environment}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors"
                  >
                    <option value="Zone A - High Temp">Zone A - High Temp</option>
                    <option value="Zone B - Controlled">Zone B - Controlled</option>
                    <option value="Outdoor Hub">Outdoor Hub</option>
                    <option value="Cold Storage">Cold Storage</option>
                    <option value="CUSTOM_OPTION">+ Add your own environment...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" name="environment" value={formData.environment} onChange={handleChange} placeholder="Custom environment" autoFocus
                      className="flex-1 px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors"
                    />
                    <button type="button" onClick={() => { setCustomFields({...customFields, showCustomEnvironment: false}); setFormData({...formData, environment: 'Zone A - High Temp'}) }} className="px-2 text-slate-400 hover:text-red-500">
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
              <button 
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-md transition-all active:scale-[0.98]"
              >
                Register Device
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Camera Preview Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative border border-slate-200 dark:border-slate-700 flex flex-col">
            
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Camera className="text-blue-500" size={20} />
                Scan Barcode
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center w-full bg-slate-100 dark:bg-slate-950/50 min-h-[350px]">
              {scannerError ? (
                <div className="text-center space-y-4 p-4">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <AlertCircle size={32} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xs">{scannerError}</p>
                  <button 
                    onClick={handleCloseModal}
                    className="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    Close & Enter Manually
                  </button>
                </div>
              ) : (
                <div className="w-full relative rounded-xl overflow-hidden ring-4 ring-slate-200 dark:ring-slate-800 bg-black">
                  <div id="reader" className="w-full h-full min-h-[300px] object-cover"></div>
                  <div className="absolute inset-0 border-2 border-blue-500/50 pointer-events-none rounded-xl"></div>
                </div>
              )}
            </div>
            
            {!scannerError && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Position the barcode inside the frame to scan automatically.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AddDevice;
