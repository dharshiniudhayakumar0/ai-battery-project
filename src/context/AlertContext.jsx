import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(
    localStorage.getItem('voiceAlerts') !== 'false'
  );

  const toggleVoice = () => {
    setVoiceEnabled(prev => {
      localStorage.setItem('voiceAlerts', !prev);
      return !prev;
    });
  };

  const speak = useCallback((text) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, [voiceEnabled]);

  const addAlert = useCallback((message, type = 'info', speakMessage = false) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
    
    if (speakMessage && (type === 'warning' || type === 'critical')) {
      speak(message);
    }

    // Auto remove after 5s
    setTimeout(() => {
      removeAlert(id);
    }, 5000);
  }, [speak]);

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const triggerLoginVoiceAlert = useCallback(() => {
    // Simulated logic to check if there are critical devices on login
    // In a real app, this would check backend data
    setTimeout(() => {
      speak("Warning: Battery health is critical in 2 devices");
    }, 1500);
  }, [speak]);

  return (
    <AlertContext.Provider value={{ 
      alerts, 
      addAlert, 
      removeAlert, 
      voiceEnabled, 
      toggleVoice,
      triggerLoginVoiceAlert,
      speak
    }}>
      {children}
      {/* Toast Render Area */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium flex items-center justify-between min-w-[300px] animate-in slide-in-from-right-8 fade-in 
              ${alert.type === 'critical' ? 'bg-red-600' : 
                alert.type === 'warning' ? 'bg-orange-500' : 
                alert.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}
          >
            <span>{alert.message}</span>
            <button onClick={() => removeAlert(alert.id)} className="ml-4 opacity-70 hover:opacity-100">×</button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertContext);
