import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function ExpenseForm({ onClose, editId = null }) {
  const { 
    expenses, 
    addExpense, 
    updateExpense, 
    primaryCurrency, 
    EXCHANGE_RATES, 
    CATEGORIES 
  } = useApp();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('PKR');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  // Tag creation state
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  // Load existing expense if we are in edit mode
  useEffect(() => {
    if (editId) {
      const exp = expenses.find(e => e.id === editId);
      if (exp) {
        setAmount(exp.amount.toString());
        setCurrency(exp.currency);
        setCategory(exp.category);
        setDate(exp.date);
        setNotes(exp.notes || '');
        setTags(exp.tags || []);
      }
    }
  }, [editId, expenses]);

  const handleAddTag = (e) => {
    e.preventDefault();
    const cleanTag = tagInput.trim().replace(/,/g, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    const payload = {
      amount: parseFloat(amount),
      currency,
      category,
      date,
      tags,
      notes: notes.trim()
    };

    if (editId) {
      updateExpense(editId, payload);
    } else {
      addExpense(payload);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-slide-up">
        {/* Title bar */}
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
            {editId ? 'Modify Expense Record' : 'Record New Expense'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Input fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 text-left">
          
          {/* Amount and Currency */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-[9px] font-extrabold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest block mb-1.5">
                Spent Amount (PKR)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-zinc-300 dark:focus:border-zinc-700 outline-none px-3.5 py-2 text-xs font-semibold transition-all"
              />
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-extrabold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 focus:border-zinc-300 dark:focus:border-zinc-700 outline-none px-3.5 py-2.2 text-xs transition-all cursor-pointer"
              >
                {Object.keys(CATEGORIES).map(catKey => (
                  <option key={catKey} value={catKey}>
                    {CATEGORIES[catKey].name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-extrabold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest block mb-1.5">
                Transaction Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 focus:border-zinc-300 dark:focus:border-zinc-700 outline-none px-3.5 py-2 text-xs transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Tags Maker */}
          <div>
            <label className="text-[9px] font-extrabold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest block mb-1.5">
              Add Tags / Labels (Press Enter)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Starbucks, Lunch, Office"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-zinc-300 dark:focus:border-zinc-700 outline-none px-3.5 py-2 text-xs transition-all"
              />
              <button 
                type="button" 
                onClick={handleAddTag}
                className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-300 rounded-lg px-3 transition-colors shrink-0"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Tags Pills container */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80">
                {tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 text-zinc-600 dark:text-zinc-400"
                  >
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(idx)}
                      className="hover:text-red-400 text-zinc-500 p-0.5 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes description */}
          <div>
            <label className="text-[9px] font-extrabold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest block mb-1.5">
              Notes & Descriptions
            </label>
            <textarea
              placeholder="Record transaction details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-zinc-300 dark:focus:border-zinc-700 outline-none px-3.5 py-2 text-xs min-h-[60px] max-h-[120px] resize-y transition-all"
            />
          </div>

          {/* Action Row */}
          <div className="flex justify-end gap-2.5 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 text-xs font-semibold px-4 py-2.2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 text-white dark:text-zinc-950 text-xs font-bold px-4 py-2.2 rounded-lg shadow-sm transition-all"
            >
              {editId ? 'Apply Update' : 'Save Expense'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
