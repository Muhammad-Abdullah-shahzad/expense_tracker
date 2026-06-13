import React, { useState } from 'react';
import { Info, Trash2, Calendar, Clock, ChevronLeft, ChevronRight, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const LOGS_PER_PAGE = 10;

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5 animate-slide-up">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Icon + heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Purge All Logs?</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              This will permanently clear the entire audit trail. A single system entry will be created to record the purge.
              <br />
              <span className="font-semibold text-red-400">This action cannot be undone.</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors"
          >
            Yes, Purge
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ActivityLog() {
  const { activityLogs, setActivityLogs, addLog, apiFetch } = useApp();
  const [page, setPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  const totalPages = Math.max(1, Math.ceil(activityLogs.length / LOGS_PER_PAGE));
  const paginated = activityLogs.slice((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE);

  const handleClearLogs = () => setShowConfirm(true);

  const confirmPurge = async () => {
    setShowConfirm(false);
    try {
      await apiFetch('/logs', { method: 'DELETE' });
      // Add a single system entry to record the purge
      await addLog('Logs Purged', 'User successfully cleared activity log history.', 'system');
      setPage(1);
    } catch (err) {
      console.error('Error purging logs:', err);
    }
  };

  const getLogStyle = (type) => {
    switch (type) {
      case 'create': return {
        badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        dot: 'border-emerald-500 bg-emerald-500/20',
        label: 'Create',
        card: 'border-l-emerald-500/40'
      };
      case 'update': return {
        badge: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
        dot: 'border-sky-500 bg-sky-500/20',
        label: 'Update',
        card: 'border-l-sky-500/40'
      };
      case 'delete': return {
        badge: 'bg-red-500/10 border-red-500/30 text-red-400',
        dot: 'border-red-500 bg-red-500/20',
        label: 'Delete',
        card: 'border-l-red-500/40'
      };
      default: return {
        badge: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400',
        dot: 'border-zinc-400 dark:border-zinc-600 bg-zinc-400/10',
        label: 'System',
        card: 'border-l-zinc-400/30'
      };
    }
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  };

  // Group logs by date for display
  const grouped = paginated.reduce((acc, log) => {
    const dateKey = new Date(log.timestamp).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(log);
    return acc;
  }, {});

  return (
    <>
      {showConfirm && (
        <ConfirmModal onConfirm={confirmPurge} onCancel={() => setShowConfirm(false)} />
      )}

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col gap-6 shadow-sm animate-slide-up">

        {/* Header */}
        <div className="flex justify-between items-start border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Audit Trail Timeline</h3>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">
              Chronological history of major operations
            </span>
            {activityLogs.length > 0 && (
              <span className="text-[10px] text-zinc-400 mt-1 block">
                {activityLogs.length} total {activityLogs.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>

          {activityLogs.length > 1 && (
            <button
              onClick={handleClearLogs}
              className="bg-red-950/25 hover:bg-red-900/30 text-red-400 border border-red-900/30 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={13} />
              Purge History
            </button>
          )}
        </div>

        {/* Log list */}
        {activityLogs.length > 0 ? (
          <div className="flex flex-col gap-6">
            {Object.entries(grouped).map(([dateLabel, logs]) => (
              <div key={dateLabel} className="flex flex-col gap-3">
                {/* Date separator */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    <Calendar size={10} />
                    {dateLabel}
                  </div>
                  <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                </div>

                {/* Entries for this date */}
                <div className="relative pl-5 border-l-2 border-zinc-200 dark:border-zinc-800 flex flex-col gap-3 ml-2">
                  {logs.map((log) => {
                    const style = getLogStyle(log.type);
                    const ts = formatTime(log.timestamp);
                    return (
                      <div key={log.id} className="relative group">
                        {/* Timeline dot */}
                        <div
                          className={`absolute -left-[22px] top-3.5 w-2.5 h-2.5 rounded-full border-2 ${style.dot}`}
                        />

                        {/* Card */}
                        <div className={`bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 border-l-2 ${style.card} rounded-xl px-4 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/30 transition-all duration-200`}>
                          <div className="flex flex-col gap-1.5 min-w-0">
                            {/* Badge + action */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${style.badge} shrink-0`}>
                                {style.label}
                              </span>
                              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                {log.action}
                              </span>
                            </div>
                            {/* Details */}
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                              {log.details}
                            </p>
                          </div>

                          {/* Timestamp */}
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 shrink-0 bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
                            <Clock size={10} />
                            <span>{ts.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <div className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500">
              <Info size={18} />
            </div>
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-300">Timeline Empty</h4>
            <p className="text-xs text-zinc-500 max-w-xs font-medium">
              Perform some database mutations like adding expenses or changing settings to trigger timeline records.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <span className="text-[11px] text-zinc-500 font-medium">
              Page {page} of {totalPages} &mdash; showing {((page - 1) * LOGS_PER_PAGE) + 1}–{Math.min(page * LOGS_PER_PAGE, activityLogs.length)} of {activityLogs.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              {/* Page number pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('ellipsis-' + p);
                  acc.push(p);
                  return acc;
                }, [])
                .map((item) =>
                  typeof item === 'number' ? (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors ${
                        page === item
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={item} className="text-xs text-zinc-400 px-1">…</span>
                  )
                )
              }

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
