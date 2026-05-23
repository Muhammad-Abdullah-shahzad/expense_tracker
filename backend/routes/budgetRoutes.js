import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Update user budgets
// @route   PUT /api/budgets
// @access  Private
router.put('/', protect, async (req, res) => {
  const { total, food, utilities, shopping, entertainment, transportation, health, travel, miscellaneous } = req.body;

  try {
    const user = req.user;

    if (total !== undefined) user.budgets.total = total;
    if (food !== undefined) user.budgets.food = food;
    if (utilities !== undefined) user.budgets.utilities = utilities;
    if (shopping !== undefined) user.budgets.shopping = shopping;
    if (entertainment !== undefined) user.budgets.entertainment = entertainment;
    if (transportation !== undefined) user.budgets.transportation = transportation;
    if (health !== undefined) user.budgets.health = health;
    if (travel !== undefined) user.budgets.travel = travel;
    if (miscellaneous !== undefined) user.budgets.miscellaneous = miscellaneous;

    await user.save();
    res.json(user.budgets);
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
