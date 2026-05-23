import express from 'express';
import Expense from '../models/Expense.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get user expenses
// @route   GET /api/expenses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
router.post('/', protect, async (req, res) => {
  const { amount, currency, category, date, tags, notes } = req.body;

  if (amount === undefined || !category || !date) {
    return res.status(400).json({ message: 'Amount, category, and date are required' });
  }

  try {
    const expense = await Expense.create({
      user: req.user.id,
      amount,
      currency,
      category,
      date,
      tags,
      notes
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense record not found' });
    }

    // Check if expense belongs to logged-in user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to edit this expense' });
    }

    const { amount, currency, category, date, tags, notes } = req.body;

    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.currency = currency || expense.currency;
    expense.category = category || expense.category;
    expense.date = date || expense.date;
    expense.tags = tags || expense.tags;
    expense.notes = notes !== undefined ? notes : expense.notes;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense record not found' });
    }

    // Check if expense belongs to logged-in user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this expense' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense record removed successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
