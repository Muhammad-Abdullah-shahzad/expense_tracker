import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const AppContext = createContext();

// Predefined category set with design tokens
export const CATEGORIES = {
  food: { name: 'Food & Dining', class: 'cat-food', color: '#ff7043' },
  utilities: { name: 'Bills & Utilities', class: 'cat-utilities', color: '#00bbf9' },
  shopping: { name: 'Shopping', class: 'cat-shopping', color: '#c77dff' },
  entertainment: { name: 'Entertainment', class: 'cat-entertainment', color: '#f15bb5' },
  transportation: { name: 'Transportation', class: 'cat-transportation', color: '#fee440' },
  health: { name: 'Health & Medical', class: 'cat-health', color: '#06d6a0' },
  travel: { name: 'Travel & Trips', class: 'cat-travel', color: '#00f5d4' },
  miscellaneous: { name: 'Miscellaneous', class: 'cat-miscellaneous', color: '#a39cb5' }
};

// Dynamic base exchange rates
const EXCHANGE_RATES = {
  PKR: 1.0
};

const DEFAULT_BUDGETS = {
  total: 334200, // in PKR
  food: 83550,
  utilities: 55700,
  shopping: 69625,
  entertainment: 41775,
  transportation: 27850,
  health: 27850,
  travel: 27850,
  miscellaneous: 13925
};

const API_BASE = 'http://localhost:5001/api';

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('et_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('et_token');
  });

  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [primaryCurrency, setPrimaryCurrency] = useState(() => {
    // Always force PKR — clear any stale USD value from old sessions
    localStorage.setItem('et_currency', 'PKR');
    return 'PKR';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('et_theme') || 'dark';
  });

  const [activityLogs, setActivityLogs] = useState([]);

  // Theme logic
  useEffect(() => {
    localStorage.setItem('et_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // API helper using native fetch
  const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('et_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'API request failed');
    }
    return response.json();
  };

  // Fetch all user specific data from backend
  const fetchUserData = async (token) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Fetch user profile (gets primaryCurrency and budgets)
      const userRes = await fetch(`${API_BASE}/auth/me`, { headers });
      if (userRes.ok) {
        const userData = await userRes.json();
        setCurrentUser({ name: userData.name, email: userData.email, id: userData.id });
        setPrimaryCurrency('PKR');
        setBudgets(userData.budgets || DEFAULT_BUDGETS);
      }

      // Fetch expenses
      const expensesRes = await fetch(`${API_BASE}/expenses`, { headers });
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        setExpenses(expensesData);
      }

      // Fetch logs
      const logsRes = await fetch(`${API_BASE}/logs`, { headers });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setActivityLogs(logsData);
      }
    } catch (error) {
      console.error('Error fetching user data from backend:', error);
    }
  };

  // Load user data on startup or authentication change
  useEffect(() => {
    const token = localStorage.getItem('et_token');
    if (isAuthenticated && token) {
      fetchUserData(token);
    } else {
      setExpenses([]);
      setActivityLogs([]);
    }
  }, [isAuthenticated]);

  // Logging system
  const addLog = async (action, details, type = 'info') => {
    try {
      const newLog = await apiFetch('/logs', {
        method: 'POST',
        body: JSON.stringify({ action, details, type })
      });
      setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 activities
    } catch (err) {
      console.error('Error adding activity log:', err);
    }
  };

  // Convert amount between currencies
  const convertCurrency = (amount, fromCur, toCur) => {
    if (fromCur === toCur) return amount;
    // Normalize to PKR
    const amountInPKR = amount / (EXCHANGE_RATES[fromCur] || 1.0);
    // Convert to target currency
    return amountInPKR * (EXCHANGE_RATES[toCur] || 1.0);
  };

  // Authentication Real Endpoints
  const login = async (email, password) => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('et_token', data.token);
      localStorage.setItem('et_user', JSON.stringify({ name: data.name, email: data.email, id: data.id }));
      setCurrentUser({ name: data.name, email: data.email, id: data.id });
      setPrimaryCurrency('PKR');
      setBudgets(data.budgets || DEFAULT_BUDGETS);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      localStorage.setItem('et_token', data.token);
      localStorage.setItem('et_user', JSON.stringify({ name: data.name, email: data.email, id: data.id }));
      setCurrentUser({ name: data.name, email: data.email, id: data.id });
      setPrimaryCurrency('PKR');
      setBudgets(data.budgets || DEFAULT_BUDGETS);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('et_token');
    localStorage.removeItem('et_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // Expense Management
  const addExpense = async (expenseData) => {
    try {
      const newExpense = await apiFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData)
      });
      setExpenses(prev => [newExpense, ...prev]);
      await addLog(
        'Expense Added',
        `Spent ${newExpense.amount} ${newExpense.currency} on ${CATEGORIES[newExpense.category]?.name || newExpense.category}.`,
        'create'
      );
      toast.success('Expense recorded successfully!');
    } catch (err) {
      console.error('Error adding expense:', err);
      toast.error('Error adding expense: ' + err.message);
    }
  };

  const updateExpense = async (id, updatedData) => {
    try {
      const updatedExpense = await apiFetch(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      setExpenses(prev => prev.map(exp => exp.id === id ? updatedExpense : exp));
      await addLog('Expense Updated', `Transaction record (${id}) was modified.`, 'update');
      toast.success('Expense updated successfully!');
    } catch (err) {
      console.error('Error updating expense:', err);
      toast.error('Error updating expense: ' + err.message);
    }
  };

  const deleteExpense = async (id) => {
    const target = expenses.find(exp => exp.id === id);
    try {
      await apiFetch(`/expenses/${id}`, {
        method: 'DELETE'
      });
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      if (target) {
        await addLog(
          'Expense Deleted',
          `Removed record of ${target.amount} ${target.currency} from ${CATEGORIES[target.category]?.name}.`,
          'delete'
        );
      }
      toast.success('Expense deleted successfully!');
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast.error('Error deleting expense: ' + err.message);
    }
  };

  // Budget Management
  const updateBudgets = async (newBudgets) => {
    try {
      const updatedBudgets = await apiFetch('/budgets', {
        method: 'PUT',
        body: JSON.stringify(newBudgets)
      });
      setBudgets(updatedBudgets);
      await addLog('Budgets Updated', 'Monthly spending thresholds updated.', 'update');
      toast.success('Budgets updated successfully!');
    } catch (err) {
      console.error('Error updating budgets:', err);
      toast.error('Error updating budgets: ' + err.message);
    }
  };

  // Backup & Restore
  const importBackupData = async (backupJson) => {
    try {
      const data = JSON.parse(backupJson);
      if (Array.isArray(data.expenses) && data.budgets) {
        // Restore budgets
        await apiFetch('/budgets', {
          method: 'PUT',
          body: JSON.stringify(data.budgets)
        });

        // Restore currency
        if (data.primaryCurrency) {
          setPrimaryCurrency(data.primaryCurrency);
        }

        // Post expenses
        await Promise.all(data.expenses.map(exp => {
          const { amount, currency, category, date, tags, notes } = exp;
          return apiFetch('/expenses', {
            method: 'POST',
            body: JSON.stringify({ amount, currency, category, date, tags, notes })
          });
        }));

        // Re-fetch everything
        const token = localStorage.getItem('et_token');
        if (token) {
          await fetchUserData(token);
        }

        await addLog('Database Restored', 'Full system state imported from backup file.', 'system');
        return { success: true };
      }
      return { success: false, message: 'Invalid data format' };
    } catch (err) {
      console.error('Error importing backup data:', err);
      return { success: false, message: err.message || 'Error parsing JSON file' };
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      isAuthenticated,
      expenses,
      budgets,
      primaryCurrency,
      activityLogs,
      EXCHANGE_RATES,
      CATEGORIES,
      login,
      register,
      logout,
      addExpense,
      updateExpense,
      deleteExpense,
      updateBudgets,
      convertCurrency,
      importBackupData,
      addLog,
      theme,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
