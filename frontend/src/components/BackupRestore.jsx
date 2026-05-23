import React, { useRef, useState } from 'react';
import { 
  Download, 
  UploadCloud, 
  FileSpreadsheet, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BackupRestore() {
  const { 
    expenses, 
    budgets, 
    primaryCurrency, 
    importBackupData, 
    addLog 
  } = useApp();

  const fileInputRef = useRef(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. JSON Backup Export
  const handleExportJSON = () => {
    const backupObj = {
      expenses,
      budgets,
      primaryCurrency,
      backupTimestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    const str = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `et_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addLog('Backup Created', 'Full database snapshot downloaded as JSON file.', 'system');
    setSuccessMsg('JSON Database backup created and downloaded successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // 2. CSV Export
  const handleExportCSV = () => {
    if (expenses.length === 0) {
      setErrorMsg('No transactions recorded to export to CSV.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    const headers = ['ID', 'Date', 'Amount', 'Currency', 'Category', 'Tags', 'Notes'];
    const rows = expenses.map(exp => [
      exp.id,
      exp.date,
      exp.amount,
      exp.currency,
      exp.category,
      exp.tags?.join('; ') || '',
      exp.notes?.replace(/"/g, '""') || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `et_expense_registry_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addLog('CSV Exported', 'Expense registry exported successfully as CSV table.', 'system');
    setSuccessMsg('Expense ledger successfully exported as CSV!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // 3. JSON Import/Restore
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = await importBackupData(event.target.result);
      if (result.success) {
        setSuccessMsg('Database snapshot restored and synced successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(`Restore failed: ${result.message}`);
        setTimeout(() => setErrorMsg(''), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input selection
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-slide-up text-left">
      
      {/* Exporter deck */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between gap-6 shadow-sm">
        <div className="border-b border-zinc-200 dark:border-zinc-850 pb-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Export Portability Center</h3>
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">Securely download your financial registries</span>
        </div>

        <div className="flex flex-col gap-3 py-1.5">
          {/* JSON Button */}
          <button 
            onClick={handleExportJSON}
            className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700 text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                <Download size={16} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Full JSON Backup</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Download entire app database state for recovery</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 uppercase tracking-wider">Download</span>
          </button>

          {/* CSV Button */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700 text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                <FileSpreadsheet size={16} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Export to CSV</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Open expenses registry in Excel or Google Sheets</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-sky-400 hover:text-sky-300 uppercase tracking-wider">Spreadsheet</span>
          </button>
        </div>

        <div className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed bg-zinc-50 dark:bg-zinc-950/30 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-850">
          <strong>Security Note:</strong> All files are compiled client-side instantly inside your browser. No financial details or transactions are ever transmitted to external servers.
        </div>
      </div>

      {/* Recovery deck */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between gap-6 shadow-sm">
        <div className="border-b border-zinc-200 dark:border-zinc-850 pb-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Database Restoration Center</h3>
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">Restore application states from backup JSON files</span>
        </div>

        {/* Drag and Drop Upload Area */}
        <div 
          onClick={triggerFileInput}
          className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/10 transition-all cursor-pointer text-center"
        >
          <UploadCloud size={28} className="text-zinc-500 animate-pulse" />
          <div>
            <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">Select JSON Backup File</h4>
            <p className="text-[10px] text-zinc-500 mt-1">Upload the .json file generated from database export</p>
          </div>
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* Alerts / notifications messages inside the restoration tab */}
        <div className="min-h-[48px] flex flex-col gap-2 justify-center">
          {successMsg && (
            <div className="flex items-center gap-2 text-emerald-450 text-xs bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 font-semibold">
              <ShieldCheck size={14} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          
          {errorMsg && (
            <div className="flex items-center gap-2 text-red-450 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20 font-semibold">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!successMsg && !errorMsg && (
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500 text-[10px] font-semibold bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-850">
              <RefreshCw size={12} className="shrink-0" />
              <span>Restoring a backup will overwrite all active transactions and budgets.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
