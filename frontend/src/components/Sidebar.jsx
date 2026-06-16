import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  History,
  Database,
  FileText,
  LogOut,
  TrendingUp,
  Menu,
  X,
  Sun,
  Moon,
  UserCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar({ activeTab, setActiveTab, isExpanded, setIsExpanded }) {
  const { currentUser, logout, theme, toggleTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', name: 'Expenses', icon: Receipt },
    { id: 'budgets', name: 'Budgets', icon: Wallet },
    { id: 'logs', name: 'Activity Log', icon: History },
    { id: 'backup', name: 'Backup & Share', icon: Database },
    { id: 'reports', name: 'Reports', icon: FileText },
    { id: 'profile', name: 'Profile', icon: UserCircle },
  ];

  const handleNav = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="no-print lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 active:scale-95 transition-all shadow-md"
      >
        {isOpen ? <X size={20} className="text-zinc-700 dark:text-zinc-200" /> : <Menu size={20} />}
      </button>

      {/* Main Sidebar Element */}
      <aside 
        className={`no-print fixed top-0 left-0 bottom-0 z-40 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between py-6 px-4 transition-all duration-300 ${
          isOpen ? 'translate-x-0 w-60' : '-translate-x-full lg:translate-x-0'
        } ${isExpanded ? 'lg:w-60' : 'lg:w-20'}`}
      >
        {/* Top Branding Section */}
        <div className="flex flex-col gap-8 w-full items-center lg:items-start overflow-hidden">
          <div className="flex items-center gap-3 px-2 mt-4 lg:mt-0 w-full">
            {/* Desktop Hamburger */}
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="hidden lg:flex shrink-0 w-9 h-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              <Menu size={22} />
            </button>
            
            {/* Logo when expanded */}
            <div className={`flex items-center gap-3 transition-opacity duration-200 ${!isExpanded ? 'lg:hidden' : 'lg:flex'} `}>
              <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center shadow-md shrink-0">
                <TrendingUp size={22} className="text-white dark:text-zinc-950" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Xpense
                </h2>
                <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest block -mt-0.5">Tracker Pro</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 w-full">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-3 px-4.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left w-full ${
                    isActive 
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold' 
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-zinc-900 dark:text-zinc-50 shrink-0' : 'text-zinc-500 shrink-0'} />
                  <span className={`transition-opacity duration-200 whitespace-nowrap ${!isExpanded ? 'lg:hidden' : 'block'}`}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Theme Toggle & Footer Profile */}
        <div className="flex flex-col gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-5 w-full overflow-hidden">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-all w-full text-left"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={20} className="shrink-0" /> : <Moon size={20} className="shrink-0" />}
            <span className={`transition-opacity duration-200 whitespace-nowrap ${!isExpanded ? 'lg:hidden' : 'block'}`}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
          
          <button onClick={() => handleNav('profile')} className="flex items-center gap-3 px-2 mt-2 w-full text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/40 rounded-lg py-1.5 transition-colors group" title="View Profile">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold uppercase text-xs">
              {currentUser?.name?.substring(0, 2) || 'US'}
            </div>
            <div className={`overflow-hidden transition-opacity duration-200 ${!isExpanded ? 'lg:hidden' : 'block'}`}>
              <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-50">{currentUser?.name}</h4>
              <p className="text-[10px] text-zinc-500 truncate mt-0.5">{currentUser?.email}</p>
            </div>
          </button>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all w-full text-left"
            title="Sign Out"
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`transition-opacity duration-200 whitespace-nowrap ${!isExpanded ? 'lg:hidden' : 'block'}`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Screen Backdrop for Mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        />
      )}
    </>
  );
}
