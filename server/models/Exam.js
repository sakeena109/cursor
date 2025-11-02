const pool = require('../config/database');

class Exam {
  static async create(examData) {
    const { title, description, duration, total_marks, passing_marks, teacher_id, start_date, end_date, random_order } = examData;
    
    const [result] = await pool.execute(
      `INSERT INTO exams (title, description, duration, total_marks, passing_marks, teacher_id, start_date, end_date, random_order, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [title, description, duration, total_marks, passing_marks, teacher_id, start_date, end_date, random_order || 0]
    );
    
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM exams WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll(teacherId = null) {
    let query = `SELECT e.*, u.name as teacher_name 
                 FROM exams e 
                 LEFT JOIN users u ON e.teacher_id = u.id`;
    
    if (teacherId) {
      query += ' WHERE e.teacher_id = ?';
    }
    
    query += ' ORDER BY e.created_at DESC';
    
    const [rows] = await pool.execute(query, teacherId ? [teacherId] : []);
    return rows;
  }

  static async findAvailableForStudent(studentId) {
    const [rows] = await pool.execute(
      `SELECT e.*, u.name as teacher_name,
              (SELECT COUNT(*) FROM exam_sessions WHERE exam_id = e.id AND student_id = ?) as attempt_count
       FROM exams e
       LEFT JOIN users u ON e.teacher_id = u.id
       WHERE e.start_date <= NOW() AND e.end_date >= NOW()
       ORDER BY e.start_date ASC`,
      [studentId]
    );
    return rows;
  }

  static async update(id, examData) {
    const { title, description, duration, total_marks, passing_marks, start_date, end_date, random_order } = examData;
    
    await pool.execute(
      `UPDATE exams SET title = ?, description = ?, duration = ?, total_marks = ?, passing_marks = ?, 
       start_date = ?, end_date = ?, random_order = ? WHERE id = ?`,
      [title, description, duration, total_marks, passing_marks, start_date, end_date, random_order, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM exams WHERE id = ?', [id]);
  }
}

module.exports = Exam;

