import React, { useState } from 'react';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../api';

const Reports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [environments, setEnvironments] = useState([]);
  const [history] = useState([
    { id: 1, name: 'Fleet Performance Q3', date: '2023-11-01', type: 'PDF' },
    { id: 2, name: 'Anomaly Log (Bat-Zone-A)', date: '2023-11-15', type: 'PDF' }
  ]);

  React.useEffect(() => {
    api.get('/api/devices').then(res => {
      const uniqueEnvs = [...new Set(res.data.map(d => d.environment).filter(Boolean))];
      setEnvironments(uniqueEnvs);
    }).catch(console.error);
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Find the dashboard element or generate a simulated report content
      // For this generic demo, we will create a mock temporary div to screenshot
      const reportContent = document.createElement('div');
      reportContent.innerHTML = 
        '<div style="padding: 40px; background: white; width: 800px; color: black; font-family: sans-serif;">' +
          '<h1 style="color: #2563eb; margin-bottom: 20px;">AI Battery Health Report</h1>' +
          '<p style="color: #64748b; margin-bottom: 40px;">Generated automatically by the AI Battery Platform</p>' +
          '<h2 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">Fleet Summary</h2>' +
          '<ul style="line-height: 1.8; margin-bottom: 40px;">' +
            '<li><strong>Total Monitored Devices:</strong> 1,248</li>' +
            '<li><strong>Healthy Units (>80%):</strong> 1,180</li>' +
            '<li><strong>Units requiring attention:</strong> 68</li>' +
            '<li><strong>Average Fleet Health:</strong> 94.5%</li>' +
          '</ul>' +
          '<h2 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">Recent Anomalies</h2>' +
          '<p><strong>Critical:</strong> Bat-Crane-OP experienced a sudden temperature rise up to 58°C.</p>' +
          '<p><strong>Warning:</strong> UPS-Main-Room discharging at sustained 4.2C.</p>' +
          '<h2 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; margin-top: 30px;">Batch Data Sync History</h2>' +
          '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">' +
            '<tr style="background: #f8fafc; text-align: left;">' +
              '<th style="padding: 10px; border: 1px solid #e2e8f0;">Source File</th>' +
              '<th style="padding: 10px; border: 1px solid #e2e8f0;">Date</th>' +
              '<th style="padding: 10px; border: 1px solid #e2e8f0;">Rows</th>' +
            '</tr>' +
            '<tr>' +
              '<td style="padding: 10px; border: 1px solid #e2e8f0;">historical_data_nov.csv</td>' +
              '<td style="padding: 10px; border: 1px solid #e2e8f0;">2023-11-20 14:30</td>' +
              '<td style="padding: 10px; border: 1px solid #e2e8f0;">1,250</td>' +
            '</tr>' +
            '<tr>' +
              '<td style="padding: 10px; border: 1px solid #e2e8f0;">telemetry_batch_z_a.csv</td>' +
              '<td style="padding: 10px; border: 1px solid #e2e8f0;">2023-11-22 09:15</td>' +
              '<td style="padding: 10px; border: 1px solid #e2e8f0;">840</td>' +
            '</tr>' +
          '</table>' +
        '</div>';
      document.body.appendChild(reportContent);
      
      const canvas = await html2canvas(reportContent);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('ai_battery_report.pdf');
      
      document.body.removeChild(reportContent);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-2">
          Report Generation
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Export highly detailed analytics and anomaly logs as PDF documents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            New Report Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Report Name</label>
               <input 
                type="text" 
                defaultValue="Weekly Executive Summary"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors"
               />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Scope</label>
               <select className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors">
                 <option>Entire Fleet</option>
                 <option>Critical Devices Only</option>
                 <optgroup label="Filter by Environment">
                   {environments.map(env => (
                     <option key={env} value={env}>{env} Space</option>
                   ))}
                 </optgroup>
               </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Include Sections</label>
              <div className="space-y-2">
                {['Health Summary & Bar Charts', 'Anomaly Detection Logs', 'Predictive Maintenance Needs', 'Raw Voltage/Temp Data'].map((item, i) => (
                  <label key={i} className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked={i < 3} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-md transition-all flex justify-center items-center gap-2"
            >
              {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <FileText size={18} />}
              {isGenerating ? 'Compiling PDF...' : 'Generate & Download PDF'}
            </button>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
            Recent Exports
            <Clock size={18} className="text-slate-400"/>
          </h2>

          <div className="space-y-3">
            {history.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-200">{doc.name}</h4>
                    <p className="text-xs text-slate-500">{doc.date} &bull; {doc.type}</p>
                  </div>
                </div>
                <button className="text-slate-400 group-hover:text-blue-600 transition-colors">
                  <Download size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 mt-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            Recent Data Syncs (CSV)
          </h2>
          <div className="space-y-4">
            {[
              { id: 101, file: 'history_nov_a.csv', date: '2023-11-20', rows: 1250 },
              { id: 102, file: 'batch_telemetry_b.csv', date: '2023-11-18', rows: 840 }
            ].map(sync => (
              <div key={sync.id} className="flex items-center justify-between text-sm pb-3 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Clock className="text-slate-400" size={16} />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{sync.file}</p>
                    <p className="text-xs text-slate-500">{sync.date}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-bold">
                  {sync.rows} ROWS
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
