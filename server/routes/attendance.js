const express = require('express');
const Attendance = require('../models/Attendance');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get attendance by date
router.get('/date/:date', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { date } = req.params;
    const { course_id } = req.query;
    
    const attendance = await Attendance.findByDate(date, course_id || null);
    
    res.json({
      success: true,
      attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get attendance percentage for student
router.get('/percentage/:studentId/:courseId', authenticate, async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    
    // Students can only view their own attendance
    if (req.user.role === 'student' && req.user.id != studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const stats = await Attendance.getAttendancePercentage(studentId, courseId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

