import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Info 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ExpenseList({ onEditClick, onAddClick, searchTerm }) {
  const { expenses, deleteExpense, primaryCurrency, convertCurrency, CATEGORIES } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter & Search Logic
  const filteredExpenses = expenses.filter(exp => {
    // 1. Text Search matching note, tags, or category
    const noteMatch = exp.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const tagMatch = exp.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const categoryNameMatch = CATEGORIES[exp.category]?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const searchMatch = !searchTerm || noteMatch || tagMatch || categoryNameMatch;

    // 2. Category Filter Match
    const catMatch = categoryFilter === 'all' || exp.category === categoryFilter;

    // 3. Time range Filter Match
    const expDate = new Date(exp.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let timeMatch = true;
    if (timeFilter === 'today') {
      const compare = new Date();
      compare.setHours(0,0,0,0);
      timeMatch = new Date(exp.date + 'T00:00:00').getTime() === compare.getTime();
    } else if (timeFilter === 'week') {
      const compare = new Date();
      compare.setDate(compare.getDate() - 7);
      timeMatch = expDate >= compare;
    } else if (timeFilter === 'month') {
      timeMatch = expDate.getMonth() === today.getMonth() && expDate.getFullYear() === today.getFullYear();
    }

    return searchMatch && catMatch && timeMatch;
  });

  // Sort logic
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
    
    // Sort by converted amount in current active currency
    const amountA = convertCurrency(a.amount, a.currency, primaryCurrency);
    const amountB = convertCurrency(b.amount, b.currency, primaryCurrency);
    
    if (sortBy === 'amount-desc') return amountB - amountA;
    if (sortBy === 'amount-asc') return amountA - amountB;
    return 0;
  });

  // Pagination bounds
  const totalItems = sortedExpenses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedExpenses.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const dispAmount = (amount, currency) => {
    const val = convertCurrency(amount, currency, primaryCurrency);
    return `${primaryCurrency} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-4 shadow-sm animate-slide-up">
      
      {/* Search & Actions Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Ledger Records</h3>
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">Browse transaction histories</span>
        </div>
        
        <button 
          onClick={onAddClick}
          className="bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 text-white dark:text-zinc-950 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus size={14} />
          Record Expense
        </button>
      </div>

      {/* Filter and sorting deck */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40">
        
        {/* Category Filter dropdown */}
        <div>
          <label className="text-[9px] font-extrabold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest block mb-1.5">
            Category
          </label>
          <select 
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 focus:border-zinc-300 dark:focus:border-zinc-700 outline-none px-3 py-1.5 text-xs cursor-pointer"
          >
            <option value="all">All Categories</option>
            {Object.keys(CATEGORIES).map(catKey => (
              <option key={catKey} value={catKey}>
                {CATEGORIES[catKey].name}
              </option>
            ))}
          </select>
        </div>

        {/* Time Span Filter dropdown */}
        <div>
          <label className="text-[9px] font-extrabold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest block mb-1.5">
            Time Interval
          </label>
          <select 
            value={timeFilter}
            onChange={(e) => { setTimeFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 focus:border-zinc-300 dark:focus:border-zinc-700 outline-none px-3 py-1.5 text-xs cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Sort registry */}
        <div>
          <label className="text-[9px] font-extrabold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest block mb-1.5">
            Sort Options
          </label>
          <select 
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 focus:border-zinc-300 dark:focus:border-zinc-700 outline-none px-3 py-1.5 text-xs cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

      </div>

      {/* Main Ledger Table panel */}
      <div className="overflow-x-auto w-full">
        {currentItems.length > 0 ? (
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30">Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30">Category</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30">Amount (PKR)</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30">Tags & Notes</th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/25 transition-colors">
                  
                  {/* Date column */}
                  <td className="px-3 py-2 font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>

                  {/* Category badge */}
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${CATEGORIES[item.category]?.class || 'cat-miscellaneous'}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORIES[item.category]?.color || '#71717a' }} />
                      {CATEGORIES[item.category]?.name || item.category}
                    </span>
                  </td>

                  {/* Amount in PKR */}
                  <td className="px-3 py-2 font-bold text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
                    PKR {convertCurrency(item.amount, item.currency, 'PKR').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Tags and Notes descriptions */}
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1 max-w-[220px]">
                      {item.notes && <span className="text-zinc-700 dark:text-zinc-200 truncate font-medium">{item.notes}</span>}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, idx) => (
                            <span key={idx} className="text-[9px] font-bold px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 rounded text-zinc-600 dark:text-zinc-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Operational actions buttons */}
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => onEditClick(item.id)}
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                      >
                        <Edit size={13} />
                      </button>
                      <button 
                        onClick={() => {
                          if(confirm('Are you sure you want to delete this transaction record?')) {
                            deleteExpense(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2.5 py-16 text-center">
            <div className="w-11 h-11 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 flex items-center justify-center text-zinc-500 dark:text-zinc-600">
              <Info size={18} />
            </div>
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-300">No Transactions Found</h4>
            <p className="text-xs text-zinc-500 max-w-xs font-medium">
              Modify your search keywords or filters above, or record a new transaction to populate the registry list.
            </p>
          </div>
        )}
      </div>

      {/* Pagination indicators footer */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800 pt-4 text-xs font-medium">
          <span className="text-zinc-600 dark:text-zinc-500">
            Showing <strong className="text-zinc-800 dark:text-zinc-300">{indexOfFirstItem + 1}</strong> to <strong className="text-zinc-800 dark:text-zinc-300">{Math.min(indexOfLastItem, totalItems)}</strong> of <strong className="text-zinc-800 dark:text-zinc-300">{totalItems}</strong> records
          </span>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 disabled:opacity-30 disabled:hover:bg-zinc-50 dark:disabled:hover:bg-zinc-950 disabled:hover:text-zinc-400 transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => paginate(idx + 1)}
                className={`w-7.5 h-7.5 rounded-lg text-xs font-bold transition-all ${
                  currentPage === idx + 1 
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950' 
                    : 'border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 disabled:opacity-30 disabled:hover:bg-zinc-50 dark:disabled:hover:bg-zinc-950 disabled:hover:text-zinc-400 transition-colors"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
