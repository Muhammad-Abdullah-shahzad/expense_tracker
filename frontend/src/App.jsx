import React, { useState } from 'react';
import { 
  Plus, 
  TrendingUp, 
  CircleDollarSign, 
  Layers, 
  ArrowRight,
  TrendingDown as ExpIcon,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import AnalyticsPanel from './components/AnalyticsPanel';
import BudgetProgress from './components/BudgetProgress';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import BackupRestore from './components/BackupRestore';
import ActivityLog from './components/ActivityLog';
import ReportGenerator from './components/ReportGenerator';

export default function App() {
  const { 
    isAuthenticated, 
    login, 
    register, 
    expenses, 
    budgets, 
    primaryCurrency, 
    convertCurrency,
    CATEGORIES
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
  // Auth Form State
  const [isRegister, setIsRegister] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  // Modal Expense Form State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState(null);

  // Form Submissions for Login/Register
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (isRegister) {
      if (!authName || !authEmail || !authPassword) {
        setAuthError('Please fill in all details.');
        return;
      }
      const result = await register(authName, authEmail, authPassword);
      if (!result.success) {
        setAuthError(result.message);
      }
    } else {
      const result = await login(authEmail, authPassword);
      if (!result.success) {
        setAuthError(result.message);
      }
    }
  };

  const autoFillAuth = () => {
    setAuthEmail('team@ncbae.edu.pk');
    setAuthPassword('123456');
    setAuthError('');
  };

  // Metric computations for active month
  const computeActiveMetrics = () => {
    const today = new Date();
    const activeMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const monthlyExpenses = expenses.filter(exp => exp.date.substring(0, 7) === activeMonthStr);
    
    // Total Spent (converted to active primary currency)
    const totalSpent = monthlyExpenses.reduce((acc, exp) => {
      return acc + convertCurrency(exp.amount, exp.currency, primaryCurrency);
    }, 0);

    // Highest expense this month
    let maxExpenseVal = 0;
    let maxExpenseLabel = 'None';
    monthlyExpenses.forEach(exp => {
      const val = convertCurrency(exp.amount, exp.currency, primaryCurrency);
      if (val > maxExpenseVal) {
        maxExpenseVal = val;
        maxExpenseLabel = CATEGORIES[exp.category]?.name || exp.category;
      }
    });

    // Total monthly budget converted to primary currency
    const totalBudgetPrimary = convertCurrency(budgets.total, 'PKR', primaryCurrency);

    return {
      totalSpent: `${primaryCurrency} ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      remainingBudget: `${primaryCurrency} ${(Math.max(totalBudgetPrimary - totalSpent, 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      highestExpense: maxExpenseVal > 0 ? `${maxExpenseLabel}` : 'N/A',
      highestExpenseVal: maxExpenseVal > 0 ? `${primaryCurrency} ${maxExpenseVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '',
      count: `${monthlyExpenses.length} Records`
    };
  };

  const metrics = computeActiveMetrics();

  const handleEditOpen = (id) => {
    setEditExpenseId(id);
    setShowExpenseModal(true);
  };

  const handleAddOpen = () => {
    setEditExpenseId(null);
    setShowExpenseModal(true);
  };

  // Auth Screen Render (if not logged in)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors">
        <div className="w-full max-w-[420px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col gap-6 shadow-2xl animate-slide-up">
          {/* Logo Branding */}
          <div className="flex flex-col items-center gap-3 text-center border-b border-zinc-200 dark:border-zinc-800 pb-5">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center shadow-lg">
              <TrendingUp size={24} className="text-white dark:text-zinc-950" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
                Xpense Tracker
              </h1>
              <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                NCBA&E CS Department FYP
              </p>
            </div>
          </div>

          {/* Form deck */}
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase block mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Khadija & Khurram"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-zinc-300 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 outline-none px-3.5 py-2.5 text-sm transition-all"
                />
              </div>
            )}
            
            <div>
              <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase block mb-1">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="team@ncbae.edu.pk"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-zinc-300 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 outline-none px-3.5 py-2.5 text-sm transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase block mb-1">Secret Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-zinc-300 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 outline-none px-3.5 py-2.5 text-sm transition-all"
              />
            </div>

            {authError && (
              <span className="text-xs text-red-400 font-medium block bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center animate-pulse">
                {authError}
              </span>
            )}

            <button type="submit" className="w-full py-2.5 mt-2 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.99] text-white dark:text-zinc-950 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all">
              {isRegister ? 'Create Account' : 'Authenticate Credentials'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Presentation Credentials Block */}
          {!isRegister && (
            <div className="flex flex-col gap-2 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30 text-center">
              <span className="text-[11px] text-zinc-600 dark:text-zinc-500 font-medium">Presentation Shortcut Credentials:</span>
              <div className="flex gap-2 justify-center">
                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-300">team@ncbae.edu.pk</span>
                <span className="text-zinc-400 dark:text-zinc-700">|</span>
                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-300">123456</span>
              </div>
              <button 
                onClick={autoFillAuth}
                className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:underline font-semibold mt-1"
              >
                Auto-fill credentials
              </button>
            </div>
          )}

          {/* Toggle Register/Login */}
          <div className="text-center mt-1">
            <button 
              onClick={() => { setIsRegister(!isRegister); setAuthError(''); }}
              className="text-xs text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : 'First time user? Create account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Tab Render selector
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            {/* Widget metric row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard 
                title="Total Spent This Month" 
                value={metrics.totalSpent} 
                subtext="Converted from entries" 
                icon={ExpIcon} 
                glowColor="sky"
              />
              <MetricCard 
                title="Remaining Balance" 
                value={metrics.remainingBudget} 
                subtext="Budget safety net" 
                icon={CircleDollarSign} 
                glowColor="sky"
              />
              <MetricCard 
                title="Top Expense Sector" 
                value={metrics.highestExpense} 
                subtext={metrics.highestExpenseVal || "No charges"} 
                icon={ShoppingBag} 
                glowColor="emerald"
              />
              <MetricCard 
                title="Records Registry" 
                value={metrics.count} 
                subtext="Current active ledger" 
                icon={Layers} 
                glowColor="orange"
              />
            </div>

            {/* Graphs row */}
            <AnalyticsPanel />

            {/* Split dashboard row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <BudgetProgress mode="summary" />
              </div>
              
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3.5 mb-5">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Recent Ledger Preview</h3>
                  <button 
                    onClick={() => setActiveTab('expenses')}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-semibold transition-colors"
                  >
                    View All Registry
                  </button>
                </div>
                <ExpenseList 
                  onEditClick={handleEditOpen} 
                  onAddClick={handleAddOpen} 
                  searchTerm="" 
                />
              </div>
            </div>
          </>
        );
      case 'expenses':
        return (
          <ExpenseList 
            onEditClick={handleEditOpen} 
            onAddClick={handleAddOpen} 
            searchTerm={searchTerm} 
          />
        );
      case 'budgets':
        return <BudgetProgress mode="full" />;
      case 'logs':
        return <ActivityLog />;
      case 'backup':
        return <BackupRestore />;
      case 'reports':
        return <ReportGenerator />;
      default:
        return <div className="text-zinc-600 dark:text-zinc-400 p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">Tab not implemented</div>;
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased transition-colors">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      
      <main className={`flex-1 p-4 min-h-screen flex flex-col gap-4 w-full max-w-full overflow-x-hidden transition-all duration-300 ${isSidebarExpanded ? 'lg:pl-60' : 'lg:pl-20'}`}>
        <Header 
          activeTab={activeTab} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
        
        {/* Render actual sub-page */}
        <div className="flex flex-col gap-6 animate-fade-in">
          {renderActiveTab()}
        </div>
      </main>

      {/* Add / Edit Floating Modal portal */}
      {showExpenseModal && (
        <ExpenseForm 
          onClose={() => setShowExpenseModal(false)} 
          editId={editExpenseId} 
        />
      )}
    </div>
  );
}
