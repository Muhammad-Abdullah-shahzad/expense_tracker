import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BudgetProgress({ mode = 'full' }) {
  const { 
    expenses, 
    budgets, 
    updateBudgets, 
    primaryCurrency, 
    convertCurrency, 
    CATEGORIES 
  } = useApp();

  const [tempBudgets, setTempBudgets] = useState({ ...budgets });

  // Compute expenses by category (converted to PKR since budgets are stored in PKR)
  const categoryExpensesPKR = {};
  Object.keys(CATEGORIES).forEach(key => {
    categoryExpensesPKR[key] = 0;
  });

  expenses.forEach(exp => {
    const amountInPKR = convertCurrency(exp.amount, exp.currency, 'PKR');
    if (categoryExpensesPKR[exp.category] !== undefined) {
      categoryExpensesPKR[exp.category] += amountInPKR;
    }
  });

  const totalSpentPKR = Object.values(categoryExpensesPKR).reduce((a, b) => a + b, 0);
  const totalBudgetPKR = budgets.total;

  const overallPercent = Math.min(Math.round((totalSpentPKR / (totalBudgetPKR || 1)) * 100), 200);

  const handleSliderChange = (category, value) => {
    const parsedVal = parseInt(value) || 0;
    setTempBudgets(prev => {
      const updated = { ...prev, [category]: parsedVal };
      // Dynamically recalculate total budget as the sum of category budgets
      const categoriesSum = Object.keys(CATEGORIES).reduce((acc, cat) => acc + (updated[cat] || 0), 0);
      updated.total = categoriesSum;
      return updated;
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateBudgets(tempBudgets);
  };

  // Convert PKR budget values to primary currency for display
  const dispPrimary = (pkrAmount) => {
    const val = convertCurrency(pkrAmount, 'PKR', primaryCurrency);
    return `${primaryCurrency} ${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  // Simple Summary Widget View (Dashboard Sidebar Component)
  if (mode === 'summary') {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-3 shadow-sm animate-slide-up hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-850 pb-2.5">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Monthly Budget Progress</h3>
          <span className={`text-xs font-bold ${overallPercent > 100 ? 'text-red-400' : overallPercent > 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {overallPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden border border-zinc-200 dark:border-zinc-800 relative">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercent > 100 
                ? 'bg-red-500' 
                : overallPercent > 80 
                  ? 'bg-amber-500' 
                  : 'bg-zinc-400'
            }`}
            style={{ width: `${Math.min(overallPercent, 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] font-semibold">
          <span className="text-zinc-600 dark:text-zinc-500">Spent: {dispPrimary(totalSpentPKR)}</span>
          <span className="text-zinc-500 dark:text-zinc-400">Limit: {dispPrimary(totalBudgetPKR)}</span>
        </div>

        {overallPercent > 100 && (
          <div className="flex items-start gap-2 text-red-400 text-[10px] bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 font-medium">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            <span>Over budget cap! Avoid non-essential shopping and entertainment.</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full animate-slide-up">
      {/* Budget Sliders Configuration */}
      <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Configure Monthly Budgets</h3>
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">Adjust category spending caps</span>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3.5">
            {Object.keys(CATEGORIES).map((cat) => (
              <div key={cat} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  <span>{CATEGORIES[cat].name}</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{dispPrimary(tempBudgets[cat] || 0)}</span>
                </div>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">{primaryCurrency}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={tempBudgets[cat] || 0}
                    onChange={(e) => handleSliderChange(cat, e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 pl-11 pr-3 py-1.5 text-xs font-semibold focus:border-zinc-300 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 outline-none transition-all"
                    placeholder="Set limit..."
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <span>Total Budget Sum:</span>
              <span className="font-bold text-sky-400">{dispPrimary(tempBudgets.total || 0)}</span>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 text-white dark:text-zinc-950 text-xs font-bold rounded-lg transition-all shadow-sm"
            >
              Save Budget Limits
            </button>
          </div>
        </form>
      </div>

      {/* Visual Progress Dashboard */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Spending Performance</h3>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">Category Spent vs allocation Limits</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest block">Overall Status</span>
            <span className={`text-sm font-bold mt-0.5 block ${overallPercent > 100 ? 'text-red-400' : 'text-sky-400'}`}>
              {overallPercent}% Spent
            </span>
          </div>
        </div>

        {/* Categories Progress list */}
        <div className="flex flex-col gap-4">
          {Object.keys(CATEGORIES).map(cat => {
            const spentPKR = categoryExpensesPKR[cat] || 0;
            const budgetPKR = budgets[cat] || 0;
            const percent = budgetPKR > 0 ? Math.min(Math.round((spentPKR / budgetPKR) * 100), 200) : 0;
            const isOver = percent > 100;
            const isNear = percent > 80 && percent <= 100;

            return (
              <div key={cat} className="flex flex-col gap-1.5 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/20">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: CATEGORIES[cat].color }}
                    />
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{CATEGORIES[cat].name}</span>
                  </div>
                  <div className="text-zinc-600 dark:text-zinc-400 font-medium">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{dispPrimary(spentPKR)}</span>
                    <span className="text-zinc-500 dark:text-zinc-500"> / {dispPrimary(budgetPKR)}</span>
                  </div>
                </div>

                {/* Progress track */}
                {budgetPKR > 0 ? (
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-950 overflow-hidden border border-zinc-300 dark:border-zinc-850 relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver 
                          ? 'bg-red-500' 
                          : isNear 
                            ? 'bg-amber-500' 
                            : 'bg-zinc-400'
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                ) : (
                  <div className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1 mt-0.5">
                    <HelpCircle size={11} className="text-zinc-600" />
                    <span>No budget cap configured for this category.</span>
                  </div>
                )}

                {/* Status warning labels */}
                {budgetPKR > 0 && (
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider mt-0.5">
                    <span className={isOver ? 'text-red-400' : isNear ? 'text-amber-400' : 'text-zinc-500'}>
                      {percent}% Consumed
                    </span>
                    {isOver ? (
                      <span className="text-red-400">Limit Exceeded!</span>
                    ) : isNear ? (
                      <span className="text-amber-400">Approaching Limit</span>
                    ) : (
                      <span className="text-emerald-400">Within Safety Cap</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
