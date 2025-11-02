const express = require('express');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const Activity = require('../models/Activity');
const pool = require('../config/database');

const router = express.Router();

// Get all users
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const users = await User.findAll(role || null);
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user by ID
router.get('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user
router.put('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await User.update(req.params.id, req.body);
    
    await Activity.create({
      user_id: req.user.id,
      activity_type: 'user_updated',
      description: `Updated user: ${req.params.id}`,
      metadata: { updated_user_id: req.params.id }
    });

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    if (req.params.id == req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await User.delete(req.params.id);
    
    await Activity.create({
      user_id: req.user.id,
      activity_type: 'user_deleted',
      description: `Deleted user: ${req.params.id}`,
      metadata: { deleted_user_id: req.params.id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all exams
router.get('/exams', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [exams] = await pool.execute(
      `SELECT e.*, u.name as teacher_name 
       FROM exams e 
       LEFT JOIN users u ON e.teacher_id = u.id
       ORDER BY e.created_at DESC`
    );
    res.json({
      success: true,
      exams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all exam results
router.get('/results', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [results] = await pool.execute(
      `SELECT es.*, e.title as exam_title, u.name as student_name, t.name as teacher_name
       FROM exam_sessions es
       JOIN exams e ON es.exam_id = e.id
       JOIN users u ON es.student_id = u.id
       JOIN users t ON e.teacher_id = t.id
       ORDER BY es.end_time DESC`
    );
    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get system statistics
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [userStats] = await pool.execute(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    const [examStats] = await pool.execute(
      'SELECT COUNT(*) as total_exams, SUM(CASE WHEN end_date >= NOW() THEN 1 ELSE 0 END) as active_exams FROM exams'
    );

    const [resultStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_results,
        AVG(score) as avg_score,
        SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed
       FROM exam_sessions`
    );

    const [activityStats] = await pool.execute(
      'SELECT activity_type, COUNT(*) as count FROM activities GROUP BY activity_type ORDER BY count DESC LIMIT 10'
    );

    res.json({
      success: true,
      stats: {
        users: userStats,
        exams: examStats[0],
        results: resultStats[0],
        activities: activityStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

