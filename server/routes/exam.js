const express = require('express');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const pool = require('../config/database');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Start exam session (Student)
router.post('/start/:examId', authenticate, authorize('student'), async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if exam is available
    const now = new Date();
    const startDate = new Date(exam.start_date);
    const endDate = new Date(exam.end_date);

    if (now < startDate || now > endDate) {
      return res.status(400).json({
        success: false,
        message: 'Exam is not available at this time'
      });
    }

    // Check if session already exists
    const [existingSessions] = await pool.execute(
      'SELECT * FROM exam_sessions WHERE exam_id = ? AND student_id = ? AND status = "in_progress"',
      [examId, studentId]
    );

    let sessionId;
    if (existingSessions.length > 0) {
      sessionId = existingSessions[0].id;
    } else {
      // Create new session
      const [result] = await pool.execute(
        'INSERT INTO exam_sessions (exam_id, student_id, start_time, status) VALUES (?, ?, NOW(), "in_progress")',
        [examId, studentId]
      );
      sessionId = result.insertId;
    }

    // Get questions
    const questions = await Question.findByExamId(examId, exam.random_order === 1);

    // Log activity
    await Activity.create({
      user_id: studentId,
      activity_type: 'exam_started',
      description: `Started exam: ${exam.title}`,
      metadata: { exam_id: examId, session_id: sessionId }
    });

    res.json({
      success: true,
      sessionId,
      exam: {
        ...exam,
        questions: questions.map(q => ({
          id: q.id,
          question_text: q.question_text,
          type: q.type,
          options: q.options,
          marks: q.marks
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Submit answer
router.post('/submit-answer', authenticate, authorize('student'), async (req, res) => {
  try {
    const { session_id, question_id, answer } = req.body;
    const studentId = req.user.id;

    // Verify session belongs to student
    const [sessions] = await pool.execute(
      'SELECT * FROM exam_sessions WHERE id = ? AND student_id = ?',
      [session_id, studentId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if answer already exists
    const [existingAnswers] = await pool.execute(
      'SELECT * FROM answers WHERE session_id = ? AND question_id = ?',
      [session_id, question_id]
    );

    const question = await Question.findById(question_id);
    let is_correct = 0;

    if (question && question.type !== 'descriptive') {
      is_correct = question.correct_answer === answer ? 1 : 0;
    }

    if (existingAnswers.length > 0) {
      // Update existing answer
      await pool.execute(
        'UPDATE answers SET answer = ?, is_correct = ? WHERE session_id = ? AND question_id = ?',
        [answer, is_correct, session_id, question_id]
      );
    } else {
      // Insert new answer
      await pool.execute(
        'INSERT INTO answers (session_id, question_id, answer, is_correct) VALUES (?, ?, ?, ?)',
        [session_id, question_id, answer, is_correct]
      );
    }

    res.json({
      success: true,
      message: 'Answer submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Submit exam
router.post('/submit/:sessionId', authenticate, authorize('student'), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const studentId = req.user.id;

    // Verify session
    const [sessions] = await pool.execute(
      'SELECT e.*, es.start_time FROM exam_sessions es JOIN exams e ON es.exam_id = e.id WHERE es.id = ? AND es.student_id = ?',
      [sessionId, studentId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const session = sessions[0];

    // Calculate score
    const [answers] = await pool.execute(
      `SELECT SUM(CASE WHEN a.is_correct = 1 THEN q.marks ELSE 0 END) as score
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE a.session_id = ?`,
      [sessionId]
    );

    const score = answers[0].score || 0;
    const percentage = (score / session.total_marks) * 100;

    // Update session
    await pool.execute(
      'UPDATE exam_sessions SET end_time = NOW(), score = ?, status = "completed" WHERE id = ?',
      [score, sessionId]
    );

    // Log activity
    await Activity.create({
      user_id: studentId,
      activity_type: 'exam_completed',
      description: `Completed exam: ${session.title}`,
      metadata: { exam_id: session.exam_id, session_id: sessionId, score, percentage }
    });

    res.json({
      success: true,
      message: 'Exam submitted successfully',
      score,
      percentage: percentage.toFixed(2),
      total_marks: session.total_marks,
      passing_marks: session.passing_marks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get exam results
router.get('/results/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `SELECT es.*, e.title as exam_title, u.name as student_name 
                 FROM exam_sessions es
                 JOIN exams e ON es.exam_id = e.id
                 JOIN users u ON es.student_id = u.id
                 WHERE es.id = ?`;

    const params = [sessionId];

    // Students can only view their own results
    if (userRole === 'student') {
      query += ' AND es.student_id = ?';
      params.push(userId);
    }

    const [sessions] = await pool.execute(query, params);

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const session = sessions[0];

    // Get answers
    const [answers] = await pool.execute(
      `SELECT a.*, q.question_text, q.type, q.options, q.marks, q.correct_answer
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE a.session_id = ?
       ORDER BY q.id ASC`,
      [sessionId]
    );

    const formattedAnswers = answers.map(ans => ({
      ...ans,
      options: JSON.parse(ans.options || '[]')
    }));

    res.json({
      success: true,
      session,
      answers: formattedAnswers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Log anti-cheat violation
router.post('/log-violation', authenticate, authorize('student'), async (req, res) => {
  try {
    const { session_id, violation_type, details } = req.body;
    const studentId = req.user.id;

    // Verify session belongs to student
    const [sessions] = await pool.execute(
      'SELECT * FROM exam_sessions WHERE id = ? AND student_id = ?',
      [session_id, studentId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Log violation
    await pool.execute(
      'INSERT INTO anti_cheat_logs (session_id, violation_type, details, timestamp) VALUES (?, ?, ?, NOW())',
      [session_id, violation_type, JSON.stringify(details || {})]
    );

    // Check violation count
    const [violations] = await pool.execute(
      'SELECT COUNT(*) as count FROM anti_cheat_logs WHERE session_id = ?',
      [session_id]
    );

    const violationCount = violations[0].count;

    res.json({
      success: true,
      violationCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get public exam info (for link access)
router.get('/public/:examId', async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }
    
    // Return basic exam info (without questions)
    res.json({
      success: true,
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        total_marks: exam.total_marks,
        start_date: exam.start_date,
        end_date: exam.end_date
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Public exam access via link (with email)
router.post('/public/:examId/access', async (req, res) => {
  try {
    const { examId } = req.params;
    const { email, password } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found. Please check your email or contact your teacher.'
      });
    }
    
    // Check if user is a student
    if (user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can take exams via public link'
      });
    }
    
    // Verify exam exists and is available
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }
    
    // Check if exam is available
    const now = new Date();
    const startDate = new Date(exam.start_date);
    const endDate = new Date(exam.end_date);
    
    if (now < startDate || now > endDate) {
      return res.status(400).json({
        success: false,
        message: 'Exam is not available at this time'
      });
    }
    
    // If password provided, verify it
    if (password) {
      const isValidPassword = await User.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }
      
      // Generate token if password is correct
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: '24h' }
      );
      
      return res.json({
        success: true,
        message: 'Access granted',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
    
    // If no password, allow access for public links (email verification is enough)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '2h' } // Shorter expiry for public access
    );
    
    res.json({
      success: true,
      message: 'Access granted',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
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

