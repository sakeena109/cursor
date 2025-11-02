-- Online Exam System Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS online_exam_system;
USE online_exam_system;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'student') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Courses table (for attendance tracking)
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration INT NOT NULL COMMENT 'Duration in minutes',
  total_marks DECIMAL(10,2) NOT NULL,
  passing_marks DECIMAL(10,2) NOT NULL,
  teacher_id INT NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  random_order TINYINT(1) DEFAULT 0 COMMENT '1 = random order, 0 = sequential',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_teacher (teacher_id),
  INDEX idx_dates (start_date, end_date)
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  question_text TEXT NOT NULL,
  type ENUM('mcq', 'true_false', 'descriptive') NOT NULL,
  options JSON COMMENT 'For MCQ: array of options, for True/False: ["True", "False"]',
  correct_answer VARCHAR(500) COMMENT 'For MCQ/TrueFalse: the correct option, for descriptive: NULL',
  marks DECIMAL(10,2) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  INDEX idx_exam (exam_id)
);

-- Exam sessions table (tracks when student takes exam)
CREATE TABLE IF NOT EXISTS exam_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  student_id INT NOT NULL,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP NULL,
  score DECIMAL(10,2) DEFAULT 0,
  status ENUM('in_progress', 'completed', 'disqualified') DEFAULT 'in_progress',
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_exam_student (exam_id, student_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status)
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  question_id INT NOT NULL,
  answer TEXT,
  is_correct TINYINT(1) DEFAULT 0 COMMENT '1 = correct, 0 = incorrect (NULL for descriptive)',
  FOREIGN KEY (session_id) REFERENCES exam_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_session_question (session_id, question_id),
  INDEX idx_session (session_id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late') NOT NULL,
  marked_by INT NOT NULL COMMENT 'Teacher/admin who marked attendance',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_course_date (student_id, course_id, date),
  INDEX idx_student (student_id),
  INDEX idx_course (course_id),
  INDEX idx_date (date)
);

-- Activities table (daily activity tracking)
CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_type VARCHAR(100) NOT NULL COMMENT 'login, logout, exam_started, exam_completed, page_visit, etc.',
  description TEXT,
  metadata JSON COMMENT 'Additional data about the activity',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_type (activity_type),
  INDEX idx_timestamp (timestamp)
);

-- Anti-cheat logs table
CREATE TABLE IF NOT EXISTS anti_cheat_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  violation_type VARCHAR(100) NOT NULL COMMENT 'tab_switch, right_click, dev_tools, copy_paste, print_screen, etc.',
  details JSON COMMENT 'Additional details about the violation',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES exam_sessions(id) ON DELETE CASCADE,
  INDEX idx_session (session_id),
  INDEX idx_violation (violation_type),
  INDEX idx_timestamp (timestamp)
);

-- Insert default admin user (password: admin123)
-- IMPORTANT: Generate a proper bcrypt hash for 'admin123' before inserting
-- Run: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
-- Then replace the hash below with the generated hash
-- For now, this will fail and you need to manually create the admin user or generate the hash first
-- INSERT INTO users (name, email, password, role) VALUES 
-- ('Admin User', 'admin@exam.com', 'GENERATED_HASH_HERE', 'admin')
-- ON DUPLICATE KEY UPDATE name=name;

-- Insert sample course
INSERT INTO courses (name, code, description) VALUES 
('Sample Course', 'CS101', 'Introduction to Computer Science')
ON DUPLICATE KEY UPDATE name=name;

