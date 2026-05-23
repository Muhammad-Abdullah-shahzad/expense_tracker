import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsPanel() {
  const { expenses, primaryCurrency, convertCurrency, CATEGORIES, theme } = useApp();

  // 1. Prepare Category Doughnut Data
  const categoryTotals = {};
  Object.keys(CATEGORIES).forEach(key => {
    categoryTotals[key] = 0;
  });

  expenses.forEach(exp => {
    const amountInPrimary = convertCurrency(exp.amount, exp.currency, primaryCurrency);
    if (categoryTotals[exp.category] !== undefined) {
      categoryTotals[exp.category] += amountInPrimary;
    } else {
      categoryTotals[exp.category] = amountInPrimary;
    }
  });

  const activeCategories = Object.keys(categoryTotals).filter(cat => categoryTotals[cat] > 0);
  
  const doughnutData = {
    labels: activeCategories.map(cat => CATEGORIES[cat]?.name || cat),
    datasets: [
      {
        data: activeCategories.map(cat => categoryTotals[cat]),
        backgroundColor: activeCategories.map(cat => CATEGORIES[cat]?.color || '#71717a'),
        borderColor: theme === 'dark' ? '#18181b' : '#ffffff', // zinc-900 or white
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#a1a1aa', // zinc-400
          font: { family: 'Inter', size: 10, weight: '500' },
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: theme === 'dark' ? '#fafafa' : '#18181b',
        bodyColor: theme === 'dark' ? '#a1a1aa' : '#52525b',
        borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7',
        borderWidth: 1,
        padding: 10,
        boxPadding: 6,
        bodyFont: { family: 'Inter' },
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            return ` ${context.label}: ${primaryCurrency} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    cutout: '70%'
  };

  // 2. Prepare Trend Line Data (last 7 days of spending)
  const getPastDateStrs = (count) => {
    const arr = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d.toISOString().split('T')[0]);
    }
    return arr;
  };

  const last7Days = getPastDateStrs(7);

  const dailyTotals = {};
  last7Days.forEach(date => {
    dailyTotals[date] = 0;
  });

  expenses.forEach(exp => {
    if (dailyTotals[exp.date] !== undefined) {
      const amountInPrimary = convertCurrency(exp.amount, exp.currency, primaryCurrency);
      dailyTotals[exp.date] += amountInPrimary;
    }
  });

  const lineData = {
    labels: last7Days.map(date => {
      const parts = date.split('-');
      return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        fill: true,
        label: 'Spending Trend',
        data: last7Days.map(date => dailyTotals[date]),
        borderColor: '#71717a', // zinc-500
        borderWidth: 2,
        pointBackgroundColor: '#38bdf8', // sky-400
        pointBorderColor: theme === 'dark' ? '#18181b' : '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(113, 113, 122, 0.15)');
          gradient.addColorStop(1, 'rgba(113, 113, 122, 0.0)');
          return gradient;
        }
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: theme === 'dark' ? '#fafafa' : '#18181b',
        bodyColor: theme === 'dark' ? '#a1a1aa' : '#52525b',
        borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7',
        borderWidth: 1,
        padding: 10,
        boxPadding: 6,
        bodyFont: { family: 'Inter' },
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            return ` Total Spent: ${primaryCurrency} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#71717a', // zinc-500
          font: { family: 'Inter', size: 9, weight: '500' }
        }
      },
      y: {
        grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)' },
        ticks: {
          color: '#71717a', // zinc-500
          font: { family: 'Inter', size: 9, weight: '500' },
          callback: (value) => `${primaryCurrency} ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        }
      }
    }
  };

  const totalCurrentWeek = last7Days.reduce((acc, date) => acc + dailyTotals[date], 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full animate-slide-up">
      {/* 1. Line Trend Panel */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Spending Trend</h3>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">7-Day Transaction Performance</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest block">7-Day Total</span>
            <span className="text-base font-bold text-sky-400 mt-0.5 block">
              {primaryCurrency} {totalCurrentWeek.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="h-[160px] relative w-full mt-2">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* 2. Doughnut Share Panel */}
      <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Category Allocation</h3>
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">Share by Category</span>
        </div>

        <div className="h-[160px] relative w-full mt-2 flex items-center justify-center flex-1">
          {activeCategories.length > 0 ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <div className="text-center text-zinc-500 text-xs py-12 font-medium">
              No transactions recorded yet to display breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
