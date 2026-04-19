import React, { useState, useCallback } from 'react';
import { UploadCloud, File, CheckCircle, AlertCircle, X } from 'lucide-react';
import api from '../api';
import { useAlerts } from '../context/AlertContext';

const CsvUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [preview, setPreview] = useState([]);
  const [recentUploads, setRecentUploads] = useState([
    { id: 1, name: 'historical_data_nov.csv', date: new Date(Date.now() - 86400000).toLocaleDateString(), time: '14:30', rows: 1250 },
    { id: 2, name: 'zone_b_telemetry.csv', date: new Date(Date.now() - 172800000).toLocaleDateString(), time: '09:15', rows: 840 },
  ]);
  const { addAlert } = useAlerts();

  const handleCommit = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setStatus('processing');
      const res = await api.post('/api/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      addAlert(res.data.message, 'success');
      
      // Add to recent uploads table
      const now = new Date();
      setRecentUploads([{
        id: Date.now(),
        name: file.name,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rows: preview.length > 0 ? 458 : 0 // using simulated count
      }, ...recentUploads]);
      
      setStatus('idle');
      setFile(null);
      setPreview([]);
    } catch (err) {
      addAlert(err.response?.data?.error || err.message, 'error');
      setStatus('error');
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (selectedFile) => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setStatus('error');
      setFile(selectedFile);
      return;
    }
    setFile(selectedFile);
    setStatus('processing');
    
    // Simulate parsing
    setTimeout(() => {
      setPreview([
        { id: '1', device_id: '00:1B:44', recorded_voltage: '48.2', recorded_temp: '32.5' },
        { id: '2', device_id: '00:1B:45', recorded_voltage: '47.9', recorded_temp: '35.1' },
      ]);
      setStatus('success');
    }, 1500);
  };

  const removeFile = () => {
    setFile(null);
    setStatus('idle');
    setPreview([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">Batch Data Upload</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Upload CSV files containing offline battery telemetry for processing.</p>
      </div>

      <div 
        className={`glass-card p-12 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed transition-all ${
          isDragging ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 
          status === 'error' ? 'border-red-400 bg-red-50/50 dark:bg-red-900/10' :
          status === 'success' ? 'border-green-400 bg-green-50/50 dark:bg-green-900/10' :
          'border-slate-300 dark:border-slate-700 hover:border-blue-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-500 mb-6">
              <UploadCloud size={40} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Drag & Drop your CSV</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">or click below to browse your files</p>
            <label className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-colors cursor-pointer">
              Select File
              <input type="file" className="hidden" accept=".csv" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
            </label>
            <p className="text-xs text-slate-400 mt-4">Supported format: CSV (Max 50MB)</p>
          </>
        ) : (
          <div className="w-full max-w-lg">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <File className={`h-10 w-10 ${status==='error'?'text-red-500':status==='success'?'text-green-500':'text-blue-500'}`} />
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{file.name}</h4>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {status === 'processing' && <span className="text-sm font-medium text-blue-500 animate-pulse">Processing...</span>}
                {status === 'error' && <span className="text-sm font-medium text-red-500 flex items-center gap-1"><AlertCircle size={16}/> Invalid File</span>}
                {status === 'success' && <span className="text-sm font-medium text-green-500 flex items-center gap-1"><CheckCircle size={16}/> Ready</span>}
                <button onClick={removeFile} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {status === 'success' && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3 ml-1">Data Preview</h4>
                <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-2">Device ID</th>
                        <th className="px-4 py-2">Voltage</th>
                        <th className="px-4 py-2">Temp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {preview.map((row, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 font-mono text-slate-700 dark:text-slate-300">{row.device_id}</td>
                          <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{row.recorded_voltage}V</td>
                          <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{row.recorded_temp}°C</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 text-center">
                    Showing 2 of 458 rows
                  </div>
                </div>
                
                <button onClick={handleCommit} className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-md transition-all">
                  Commit Data to Database
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Uploads History */}
      <div className="glass-card p-6 mt-8">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Recent Upload History</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Filename</th>
                <th className="px-4 py-3 font-medium">Upload Date</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium text-right">Rows Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentUploads.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-slate-500">No recent uploads found.</td>
                </tr>
              ) : (
                recentUploads.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                       <File size={16} className="text-blue-500" /> {item.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.date}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.time}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-right">{item.rows.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CsvUpload;
