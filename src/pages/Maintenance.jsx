import React, { useState } from 'react';
import { Calendar as CalendarIcon, Wrench, CheckCircle, Clock, FileText, Battery } from 'lucide-react';
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

const initialSchedules = [
  { id: 1, date: addDays(new Date(), 2), device: 'Bat-Extruder-1', task: 'Cell Balancing', priority: 'Medium' },
  { id: 2, date: addDays(new Date(), 5), device: 'UPS-Main-Room', task: 'Electrolyte Check', priority: 'High' },
  { id: 3, date: addDays(new Date(), 14), device: 'Forklift-Bat-B', task: 'Terminal Cleaning', priority: 'Low' },
  { id: 4, date: new Date(), device: 'Bat-Crane-OP', task: 'Emergency Replacement', priority: 'Critical' },
];

const Maintenance = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState(initialSchedules);
  
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ date: '', device: '', task: '', priority: 'Medium' });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDaySchedules = (day) => {
    return schedules.filter(s => isSameDay(s.date, day));
  };

  const nextService = schedules.sort((a, b) => a.date - b.date).find(s => s.date >= new Date());

  const handleSyncCalendar = () => {
    // Generate simple ICS content from schedules
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AI Battery Platform//Maintenance//EN\n";
    
    schedules.forEach(schedule => {
      const dtStart = format(schedule.date, "yyyyMMdd'T'090000"); // 9:00 AM
      const dtEnd = format(schedule.date, "yyyyMMdd'T'110000");   // 11:00 AM
      icsContent += "BEGIN:VEVENT\n";
      icsContent += "DTSTART:" + dtStart + "\n";
      icsContent += "DTEND:" + dtEnd + "\n";
      icsContent += "SUMMARY:[" + schedule.priority + "] Maintenance: " + schedule.device + "\n";
      icsContent += "DESCRIPTION:Scheduled Task: " + schedule.task + ". Please review physical device and clear logs post-service.\n";
      icsContent += "END:VEVENT\n";
    });
    
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'battery_maintenance_schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.date || !newEvent.device || !newEvent.task) return;
    
    setSchedules([...schedules, {
      id: Date.now(),
      date: new Date(newEvent.date),
      device: newEvent.device,
      task: newEvent.task,
      priority: newEvent.priority
    }]);
    
    setNewEvent({ date: '', device: '', task: '', priority: 'Medium' });
    setIsAddingEvent(false);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">Predictive Maintenance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Schedule and track AI-recommended service tasks.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAddingEvent(true)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg font-medium transition-colors border border-slate-200 dark:border-slate-700">
            + Add Task
          </button>
          <button onClick={handleSyncCalendar} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-colors flex items-center gap-2">
            <CalendarIcon size={18} /> Sync Calendar
          </button>
        </div>
      </div>
      
      {isAddingEvent && (
        <div className="glass-card p-6 border-l-4 border-l-blue-500 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Add Custom Maintenance Task</h2>
          <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
              <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Device/Unit</label>
              <input type="text" required placeholder="e.g. UPS-Main" value={newEvent.device} onChange={e => setNewEvent({...newEvent, device: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none dark:text-white" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Task or Note</label>
              <input type="text" required placeholder="What needs to be done or marked?" value={newEvent.task} onChange={e => setNewEvent({...newEvent, task: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
              <select value={newEvent.priority} onChange={e => setNewEvent({...newEvent, priority: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none dark:text-white">
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical</option>
                <option value="Note">User Note (Mark)</option>
              </select>
            </div>
            <div className="flex gap-2">
               <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Save</button>
               <button type="button" onClick={() => setIsAddingEvent(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
               <button onClick={() => setCurrentDate(addDays(monthStart, -1))} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Prev</button>
               <button onClick={() => setCurrentDate(new Date())} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium">Today</button>
               <button onClick={() => setCurrentDate(addDays(monthEnd, 1))} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Next</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-slate-50 dark:bg-slate-900 p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
            
            {/* Fill blank days before 1st of month */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`blank-${i}`} className="bg-slate-50/50 dark:bg-slate-900/30 p-2 min-h-[100px]" />
            ))}

            {daysInMonth.map((day, i) => {
              const dayTasks = getDaySchedules(day);
              const isTodayDate = isToday(day);

              return (
                <div 
                  key={i} 
                  onClick={() => {
                    setNewEvent({...newEvent, date: format(day, 'yyyy-MM-dd')});
                    setIsAddingEvent(true);
                  }}
                  className={`bg-slate-50 dark:bg-slate-900 p-2 min-h-[100px] border-t border-slate-200 dark:border-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer ${isTodayDate ? 'ring-2 ring-inset ring-blue-500' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isTodayDate ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="flex flex-col gap-1">
                    {dayTasks.map(task => (
                      <div key={task.id} className={`text-[10px] p-1.5 rounded-md truncate font-medium ${
                        task.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                        task.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                        task.priority === 'Note' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      }`} title={`${task.device} - ${task.task}`}>
                        {task.task}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-blue-600 to-indigo-700 border-none shadow-lg text-white">
            <h3 className="font-medium text-blue-100 mb-4 flex items-center gap-2"><Clock size={18}/> Next Service Target</h3>
            {nextService ? (
              <>
                <div className="text-3xl font-bold font-outfit mb-1">{format(nextService.date, 'MMM do')}</div>
                <div className="text-lg font-medium text-blue-100 mb-4">{nextService.device}</div>
                <div className="bg-white/10 rounded-lg p-3 text-sm">
                  <div className="font-semibold mb-1 flex items-center gap-2"><Wrench size={14}/> {nextService.task}</div>
                  <p className="text-blue-100 opacity-90">AI Predicts 85% probability of failure within 14 days without this action.</p>
                </div>
              </>
            ) : (
                <div className="text-xl font-medium">No upcoming services</div>
            )}
          </div>

          <div className="glass-card p-6">
             <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center justify-between">
               AI Recommendations
               <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full flex items-center gap-1">
                 <CheckCircle size={12}/> Applied
               </span>
             </h3>
             <ul className="space-y-4">
               <li className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                 <div className="mt-0.5 p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400"><FileText size={16}/></div>
                 <div>
                   <h4 className="font-medium text-sm text-slate-800 dark:text-slate-200">Adjust charge profile #42</h4>
                   <p className="text-xs text-slate-500 mt-1">Extended Bat-Extruder-1 lifespan by ~45 days based on recent voltage smoothing.</p>
                 </div>
               </li>
               <li className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                 <div className="mt-0.5 p-1.5 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400"><Wrench size={16}/></div>
                 <div>
                   <h4 className="font-medium text-sm text-slate-800 dark:text-slate-200">Inspect Ventilation Zone C</h4>
                   <p className="text-xs text-slate-500 mt-1">Temperature correlation pattern suggests physical blockage near Fan Array 2.</p>
                 </div>
               </li>
               <li className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                 <div className="mt-0.5 p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400"><Battery size={16}/></div>
                 <div>
                   <h4 className="font-medium text-sm text-slate-800 dark:text-slate-200">Decommission Unit B-12</h4>
                   <p className="text-xs text-slate-500 mt-1">Internal resistance has breached highly critical threshold. Remove by end of week.</p>
                 </div>
               </li>
               <li className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                 <div className="mt-0.5 p-1.5 bg-teal-50 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400"><CalendarIcon size={16}/></div>
                 <div>
                   <h4 className="font-medium text-sm text-slate-800 dark:text-slate-200">Align Shift Schedules</h4>
                   <p className="text-xs text-slate-500 mt-1">Shift charging cycles to off-peak hours to reduce thermal compounding events.</p>
                 </div>
               </li>
               <li className="flex gap-3 items-start">
                 <div className="mt-0.5 p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400"><CheckCircle size={16}/></div>
                 <div>
                   <h4 className="font-medium text-sm text-slate-800 dark:text-slate-200">Firmware Update Verified</h4>
                   <p className="text-xs text-slate-500 mt-1">Fleet wide deployment of v3.1 successfully mitigated 12% of baseline discharge anomalies.</p>
                 </div>
               </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
