const express = require('express');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Attendance = require('../models/Attendance');
const Activity = require('../models/Activity');
const { authenticate, authorize } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Create exam
router.post('/exams', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const examData = {
      ...req.body,
      teacher_id: req.user.id
    };

    const examId = await Exam.create(examData);

    await Activity.create({
      user_id: req.user.id,
      activity_type: 'exam_created',
      description: `Created exam: ${req.body.title}`,
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

// Get teacher's exams
router.get('/exams', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const exams = await Exam.findAll(req.user.id);
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

// Update exam
router.put('/exams/:id', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam || exam.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Exam.update(req.params.id, req.body);
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

// Delete exam
router.delete('/exams/:id', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam || exam.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Question.deleteByExamId(req.params.id);
    await Exam.delete(req.params.id);
    
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

// Add question to exam
router.post('/exams/:examId/questions', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam || exam.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

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

// Get exam questions
router.get('/exams/:examId/questions', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam || exam.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

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

// Update question
router.put('/questions/:id', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const exam = await Exam.findById(question.exam_id);
    if (exam.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

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

// Delete question
router.delete('/questions/:id', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const exam = await Exam.findById(question.exam_id);
    if (exam.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

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

// Get exam results
router.get('/exams/:examId/results', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam || exam.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [results] = await pool.execute(
      `SELECT es.*, u.name as student_name, u.email as student_email
       FROM exam_sessions es
       JOIN users u ON es.student_id = u.id
       WHERE es.exam_id = ?
       ORDER BY es.end_time DESC`,
      [req.params.examId]
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

// Mark attendance
router.post('/attendance', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const attendanceData = {
      ...req.body,
      marked_by: req.user.id
    };

    const attendanceId = await Attendance.create(attendanceData);
    
    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      attendanceId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get student activities
router.get('/activities', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const { student_id, activity_type } = req.query;
    let activities;

    if (activity_type) {
      activities = await Activity.findByType(activity_type);
    } else if (student_id) {
      activities = await Activity.findByUser(student_id);
    } else {
      activities = await Activity.findByType('all');
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

