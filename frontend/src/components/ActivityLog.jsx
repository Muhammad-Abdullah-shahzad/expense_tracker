import React from 'react';
import { Info, Trash2, Calendar, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ActivityLog() {
  const { activityLogs, setActivityLogs, addLog } = useApp();

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to purge all active activity logs?')) {
      // Clear logs but re-initialize with a system log
      const newLogs = [
        {
          id: `log-${Date.now()}`,
          action: 'Logs Purged',
          details: 'User successfully cleared activity log history.',
          timestamp: new Date().toISOString(),
          type: 'system'
        }
      ];
      localStorage.setItem('et_logs', JSON.stringify(newLogs));
      window.location.reload();
    }
  };

  const getLogBadge = (type) => {
    switch (type) {
      case 'create': return { class: 'bg-emerald-500/10 border-emerald-550/20 text-emerald-400', label: 'Create' };
      case 'update': return { class: 'bg-sky-500/10 border-sky-550/20 text-sky-400', label: 'Update' };
      case 'delete': return { class: 'bg-red-500/10 border-red-550/20 text-red-400', label: 'Delete' };
      default: return { class: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400', label: 'System' };
    }
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col gap-6 shadow-sm animate-slide-up">
      <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Audit Trail Timeline</h3>
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">Chronological history of major operations</span>
        </div>
        
        {activityLogs.length > 1 && (
          <button 
            onClick={handleClearLogs}
            className="bg-red-950/25 hover:bg-red-900/30 text-red-450 border border-red-900/30 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={13} />
            Purge History
          </button>
        )}
      </div>

      {/* Timeline flow */}
      <div className="relative pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 flex flex-col gap-6 py-2 ml-3 text-left">
        {activityLogs.length > 0 ? (
          activityLogs.map((log) => {
            const badge = getLogBadge(log.type);
            const ts = formatTime(log.timestamp);
            return (
              <div key={log.id} className="relative group animate-fade-in">
                
                {/* Visual timeline bullet */}
                <div 
                  className={`absolute -left-[30.5px] top-1.5 w-3 h-3 rounded-full border bg-white dark:bg-zinc-950 flex items-center justify-center ${
                    log.type === 'create' ? 'border-emerald-500' : log.type === 'update' ? 'border-sky-500' : log.type === 'delete' ? 'border-red-500' : 'border-zinc-400 dark:border-zinc-600'
                  }`}
                />

                {/* Log card */}
                <div className="bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-100 dark:hover:bg-zinc-800/20 transition-all duration-200">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${badge.class}`}>
                        {badge.label}
                      </span>
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {log.action}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                      {log.details}
                    </p>
                  </div>

                  {/* Timestamp stamp */}
                  <div className="flex items-center gap-3 text-[10px] font-medium text-zinc-500 shrink-0">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{ts.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>{ts.time}</span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center -ml-6">
            <div className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500">
              <Info size={18} />
            </div>
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-300">Timeline Empty</h4>
            <p className="text-xs text-zinc-500 max-w-xs font-medium">
              Perform some database mutations like adding expenses or changing settings to trigger timeline records.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
