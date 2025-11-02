const express = require('express');
const Exam = require('../models/Exam');
const Attendance = require('../models/Attendance');
const Activity = require('../models/Activity');
const { authenticate, authorize } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Get available exams
router.get('/exams', authenticate, authorize('student'), async (req, res) => {
  try {
    const exams = await Exam.findAvailableForStudent(req.user.id);
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

// Get student's exam results
router.get('/results', authenticate, authorize('student'), async (req, res) => {
  try {
    const [results] = await pool.execute(
      `SELECT es.*, e.title, e.total_marks, e.passing_marks
       FROM exam_sessions es
       JOIN exams e ON es.exam_id = e.id
       WHERE es.student_id = ?
       ORDER BY es.end_time DESC`,
      [req.user.id]
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

// Get attendance
router.get('/attendance', authenticate, authorize('student'), async (req, res) => {
  try {
    const { course_id } = req.query;
    const attendance = await Attendance.findByStudent(req.user.id, course_id || null);

    // Get attendance percentage if course_id provided
    let percentage = null;
    if (course_id) {
      const stats = await Attendance.getAttendancePercentage(req.user.id, course_id);
      percentage = stats.percentage || 0;
    }

    res.json({
      success: true,
      attendance,
      percentage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get daily activities
router.get('/activities', authenticate, authorize('student'), async (req, res) => {
  try {
    const { limit = 50, date } = req.query;
    
    let activities;
    if (date) {
      activities = await Activity.getDailyStats(req.user.id, date);
    } else {
      activities = await Activity.findByUser(req.user.id, parseInt(limit));
    }

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

