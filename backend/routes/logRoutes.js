import express from 'express';
import ActivityLog from '../models/ActivityLog.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get user activity logs
// @route   GET /api/logs
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const logs = await ActivityLog.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create activity log
// @route   POST /api/logs
// @access  Private
router.post('/', protect, async (req, res) => {
  const { action, details, type } = req.body;

  if (!action || !details) {
    return res.status(400).json({ message: 'Action and details are required' });
  }

  try {
    const log = await ActivityLog.create({
      user: req.user.id,
      action,
      details,
      type: type || 'info',
      timestamp: new Date()
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete all activity logs for user
// @route   DELETE /api/logs
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await ActivityLog.deleteMany({ user: req.user.id });
    res.json({ message: 'All logs cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
