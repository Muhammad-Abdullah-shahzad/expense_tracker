import React, { useState } from 'react';
import { FileText, Printer, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ReportGenerator() {
  const { expenses, budgets, primaryCurrency, convertCurrency, CATEGORIES } = useApp();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // Filter expenses by selected month
  const monthlyExpenses = expenses.filter(exp => {
    return exp.date.substring(0, 7) === selectedMonth;
  });

  // Calculate statistics
  const totalSpentPrimary = monthlyExpenses.reduce((acc, exp) => {
    return acc + convertCurrency(exp.amount, exp.currency, primaryCurrency);
  }, 0);

  // Highest Expense
  let highestExpense = null;
  let highestValPrimary = 0;
  
  monthlyExpenses.forEach(exp => {
    const valPrimary = convertCurrency(exp.amount, exp.currency, primaryCurrency);
    if (valPrimary > highestValPrimary) {
      highestValPrimary = valPrimary;
      highestExpense = exp;
    }
  });

  // Daily Average
  const daysInMonth = 30; // Approximation or actual
  const dailyAverage = totalSpentPrimary / (monthlyExpenses.length > 0 ? daysInMonth : 1);

  // Category breakdown
  const categorySummary = {};
  Object.keys(CATEGORIES).forEach(key => {
    categorySummary[key] = { spent: 0, budget: 0 };
  });

  monthlyExpenses.forEach(exp => {
    const amt = convertCurrency(exp.amount, exp.currency, primaryCurrency);
    if (categorySummary[exp.category]) {
      categorySummary[exp.category].spent += amt;
    }
  });

  Object.keys(CATEGORIES).forEach(key => {
    const pkrBudget = budgets[key] || 0;
    categorySummary[key].budget = convertCurrency(pkrBudget, 'PKR', primaryCurrency);
  });

  const handlePrint = () => {
    window.print();
  };

  const getMonthName = () => {
    const parts = selectedMonth.split('-');
    const date = new Date(parts[0], parts[1] - 1, 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up text-left">
      
      {/* Configuration Controls Bar */}
      <div className="no-print bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
            <FileText size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Statement Builder</h3>
            <span className="text-[10px] text-zinc-600 dark:text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">Select target month to compile statement</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 outline-none px-3.5 py-1.8 text-xs cursor-pointer"
          />
          <button 
            onClick={handlePrint}
            className="bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 text-white dark:text-zinc-950 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-30 disabled:hover:bg-zinc-900 dark:disabled:hover:bg-zinc-50"
            disabled={monthlyExpenses.length === 0}
          >
            <Printer size={14} />
            Generate PDF
          </button>
        </div>
      </div>

      {/* Main Printable Statement Report */}
      {monthlyExpenses.length > 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 md:p-12 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
          
          {/* Decorative glow background */}
          <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-zinc-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Academic Professional Branding Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-zinc-600 dark:text-zinc-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen size={10} />
                NCBA&E Software & Research Section
              </span>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
                Monthly Expense Statement
              </h2>
              <span className="text-xs text-zinc-500 font-medium">
                Department of Computer Sciences, Lahore Campus
              </span>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Statement Period</span>
              <span className="text-base font-bold text-sky-400 mt-0.5 block">{getMonthName()}</span>
            </div>
          </div>

          {/* Statistics summary metric row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-850 flex flex-col gap-1">
              <span className="text-[9px] text-zinc-600 dark:text-zinc-500 font-bold uppercase tracking-wider">Total Outflow</span>
              <strong className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-0.5 block">
                {primaryCurrency} {totalSpentPrimary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </strong>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-850 flex flex-col gap-1">
              <span className="text-[9px] text-zinc-600 dark:text-zinc-500 font-bold uppercase tracking-wider">Daily Average</span>
              <strong className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-0.5 block">
                {primaryCurrency} {dailyAverage.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </strong>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-850 flex flex-col gap-1">
              <span className="text-[9px] text-zinc-600 dark:text-zinc-500 font-bold uppercase tracking-wider">Record Count</span>
              <strong className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-0.5 block">
                {monthlyExpenses.length} Records
              </strong>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-850 flex flex-col gap-1">
              <span className="text-[9px] text-zinc-600 dark:text-zinc-500 font-bold uppercase tracking-wider">Highest Cost</span>
              <strong className="text-base font-bold text-sky-400 truncate mt-0.5 block">
                {highestExpense ? `${primaryCurrency} ${highestValPrimary.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'}
              </strong>
            </div>
          </div>

          {/* Category Allocation table list */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 tracking-tight uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
              Category Allocation Breakdown
            </h3>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30">Category</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30">Spent Total</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30">Allocation Limits</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30">Remaining Margin</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(categorySummary).map(catKey => {
                    const row = categorySummary[catKey];
                    const diff = row.budget - row.spent;
                    const percent = row.budget > 0 ? Math.min(Math.round((row.spent / row.budget) * 100), 200) : 0;
                    
                    if (row.spent === 0 && row.budget === 0) return null; // Skip empty rows

                    return (
                      <tr key={catKey} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{CATEGORIES[catKey].name}</span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">
                          {primaryCurrency} {row.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 font-medium">
                          {row.budget > 0 ? `${primaryCurrency} ${row.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'Unlimited'}
                        </td>
                        <td className={`px-4 py-3.5 font-semibold ${diff >= 0 ? 'text-emerald-405 text-emerald-400' : 'text-red-405 text-red-400'}`}>
                          {row.budget > 0 ? `${primaryCurrency} ${diff.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'Unlimited'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                            percent > 100 
                              ? 'bg-red-500/10 border-red-500/25 text-red-455 text-red-450' 
                              : percent > 80 
                                ? 'bg-amber-500/10 border-amber-500/25 text-amber-455 text-amber-450' 
                                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-455 text-emerald-450'
                          }`}>
                            {row.budget > 0 ? `${percent}% Spent` : 'On Track'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* signatures block for exports */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-8 border-t border-zinc-200 dark:border-zinc-800 pt-10 mt-10 text-[11px] font-medium text-zinc-600 dark:text-zinc-500">
            <div className="flex flex-col gap-1 items-center sm:items-start">
              <span>Prepared By:</span>
              <strong className="text-zinc-800 dark:text-zinc-300 text-xs font-semibold mt-1">Khadija & Khurram Sarfraz</strong>
              <span>Student ID: 132223206 / 132223139</span>
            </div>

            <div className="flex flex-col gap-1 items-center sm:items-end">
              <span>Supervisor Authorization:</span>
              <strong className="text-zinc-800 dark:text-zinc-300 text-xs font-semibold mt-1">MR. MUHAMMAD WASEEM</strong>
              <span>Internal Supervisor, NCBA&E Lahore</span>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-16 text-center flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 flex items-center justify-center text-zinc-500 dark:text-zinc-600">
            <Printer size={18} />
          </div>
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-300">No Data to Compile Statement</h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-500 max-w-xs font-medium">
            There are no recorded transactions in {getMonthName()}. Select a different target month or log new transactions to compile reports.
          </p>
        </div>
      )}

    </div>
  );
}
