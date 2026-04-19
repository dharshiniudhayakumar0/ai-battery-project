import React from 'react';
import { Terminal, Copy, Check, Server } from 'lucide-react';

const DockerInfo = () => {
  const codeBlock = `version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://api:8000
    depends_on:
      - redis
      - api
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  api:
    image: my-battery-api
    ports:
      - "8000:8000"`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-2">
          Docker Deployment
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Containerize and run the platform anywhere.</p>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Server className="text-blue-500" /> Infrastructure Overview
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
          The AI Battery Platform is designed to be fully containerized. To ensure seamless operation between the React frontend, caching layer (Redis), and backend models, we use Docker Compose.
        </p>
        
        <div className="bg-slate-950 text-slate-300 rounded-xl overflow-hidden font-mono text-sm border border-slate-800">
          <div className="flex justify-between items-center px-4 py-2 bg-slate-900 border-b border-slate-800">
            <span className="text-slate-400">docker-compose.yml</span>
            <button className="text-slate-500 hover:text-slate-300"><Copy size={16}/></button>
          </div>
          <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed text-blue-300">
            <code>{codeBlock}</code>
          </pre>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Terminal className="text-blue-500" /> Start Commands
        </h2>
        
        <div className="space-y-4">
          <div className="bg-slate-950 rounded-xl flex items-center justify-between p-4 border border-slate-800">
             <div className="flex items-center gap-3 font-mono text-sm">
                <span className="text-emerald-500">$</span>
                <span className="text-slate-200">docker-compose build</span>
             </div>
          </div>
          <div className="bg-slate-950 rounded-xl flex items-center justify-between p-4 border border-slate-800">
             <div className="flex items-center gap-3 font-mono text-sm">
                <span className="text-emerald-500">$</span>
                <span className="text-slate-200">docker-compose up -d</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DockerInfo;
