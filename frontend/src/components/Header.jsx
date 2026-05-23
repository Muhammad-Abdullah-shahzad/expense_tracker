import React from 'react';
import { Search, Globe, Calendar, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header({ activeTab, searchTerm, setSearchTerm }) {
  const { primaryCurrency, setPrimaryCurrency, currentUser, EXCHANGE_RATES, theme, toggleTheme } = useApp();

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'expenses': return 'Expense Registry';
      case 'budgets': return 'Budget Config';
      case 'logs': return 'Audit History';
      case 'backup': return 'Backup & Export';
      case 'reports': return 'Report Center';
      default: return 'Expense Tracker';
    }
  };

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-fade-in">
      {/* Title & Greeting section */}
      <div>
        <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">
          {getGreeting()}, {currentUser?.name?.split(' ')[0] || 'User'}
        </span>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-0.5">
          {getTitle()}
        </h1>
      </div>

      {/* Control Widgets */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search bar */}
        {activeTab === 'expenses' && (
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search registry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-300 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 outline-none pl-9 pr-4 py-1.5 text-xs transition-all"
            />
          </div>
        )}

        {/* Dynamic Date display */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <Calendar size={13} className="text-zinc-500" />
          <span>{todayStr}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors ml-1"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>
    </header>
  );
}
