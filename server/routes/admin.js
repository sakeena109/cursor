const express = require('express');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
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

// Create exam (Admin)
router.post('/exams', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Admin can assign exam to any teacher or themselves
    const teacherId = req.body.teacher_id || req.user.id;
    
    const examData = {
      ...req.body,
      teacher_id: teacherId
    };

    const examId = await Exam.create(examData);

    await Activity.create({
      user_id: req.user.id,
      activity_type: 'exam_created',
      description: `Admin created exam: ${req.body.title}`,
      metadata: { exam_id: examId }
    });

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      examId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update exam (Admin)
router.put('/exams/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Exam.update(req.params.id, req.body);
    
    await Activity.create({
      user_id: req.user.id,
      activity_type: 'exam_updated',
      description: `Admin updated exam: ${req.params.id}`,
      metadata: { exam_id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Exam updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete exam (Admin)
router.delete('/exams/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Question.deleteByExamId(req.params.id);
    await Exam.delete(req.params.id);
    
    await Activity.create({
      user_id: req.user.id,
      activity_type: 'exam_deleted',
      description: `Admin deleted exam: ${req.params.id}`,
      metadata: { exam_id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add question to exam (Admin)
router.post('/exams/:examId/questions', authenticate, authorize('admin'), async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      exam_id: req.params.examId
    };

    const questionId = await Question.create(questionData);
    
    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      questionId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get exam questions (Admin)
router.get('/exams/:examId/questions', authenticate, authorize('admin'), async (req, res) => {
  try {
    const questions = await Question.findByExamId(req.params.examId);
    res.json({
      success: true,
      questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update question (Admin)
router.put('/questions/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Question.update(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Question updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete question (Admin)
router.delete('/questions/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Question.delete(req.params.id);
    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all anti-cheat violations
router.get('/violations', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [violations] = await pool.execute(
      `SELECT 
        acl.*,
        es.exam_id,
        es.student_id,
        e.title as exam_title,
        u.name as student_name,
        u.email as student_email
       FROM anti_cheat_logs acl
       JOIN exam_sessions es ON acl.session_id = es.id
       JOIN exams e ON es.exam_id = e.id
       JOIN users u ON es.student_id = u.id
       ORDER BY acl.timestamp DESC
       LIMIT 500`
    );
    
    const formattedViolations = violations.map(v => ({
      ...v,
      details: JSON.parse(v.details || '{}')
    }));
    
    res.json({
      success: true,
      violations: formattedViolations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get violations by session
router.get('/violations/session/:sessionId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [violations] = await pool.execute(
      `SELECT 
        acl.*,
        es.exam_id,
        es.student_id,
        e.title as exam_title,
        u.name as student_name,
        u.email as student_email
       FROM anti_cheat_logs acl
       JOIN exam_sessions es ON acl.session_id = es.id
       JOIN exams e ON es.exam_id = e.id
       JOIN users u ON es.student_id = u.id
       WHERE acl.session_id = ?
       ORDER BY acl.timestamp DESC`,
      [req.params.sessionId]
    );
    
    const formattedViolations = violations.map(v => ({
      ...v,
      details: JSON.parse(v.details || '{}')
    }));
    
    res.json({
      success: true,
      violations: formattedViolations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get disqualified sessions
router.get('/disqualified', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [sessions] = await pool.execute(
      `SELECT 
        es.*,
        e.title as exam_title,
        u.name as student_name,
        u.email as student_email,
        (SELECT COUNT(*) FROM anti_cheat_logs WHERE session_id = es.id) as violation_count
       FROM exam_sessions es
       JOIN exams e ON es.exam_id = e.id
       JOIN users u ON es.student_id = u.id
       WHERE es.status = 'disqualified'
       ORDER BY es.end_time DESC`
    );
    
    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

