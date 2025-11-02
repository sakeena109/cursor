const pool = require('../config/database');

class Attendance {
  static async create(attendanceData) {
    const { student_id, course_id, date, status, marked_by } = attendanceData;
    
    const [result] = await pool.execute(
      `INSERT INTO attendance (student_id, course_id, date, status, marked_by, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [student_id, course_id, date, status, marked_by]
    );
    
    return result.insertId;
  }

  static async findByStudent(studentId, courseId = null) {
    let query = `SELECT a.*, c.name as course_name 
                 FROM attendance a 
                 LEFT JOIN courses c ON a.course_id = c.id
                 WHERE a.student_id = ?`;
    
    const params = [studentId];
    
    if (courseId) {
      query += ' AND a.course_id = ?';
      params.push(courseId);
    }
    
    query += ' ORDER BY a.date DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findByDate(date, courseId = null) {
    let query = 'SELECT a.*, u.name as student_name, c.name as course_name FROM attendance a LEFT JOIN users u ON a.student_id = u.id LEFT JOIN courses c ON a.course_id = c.id WHERE a.date = ?';
    
    const params = [date];
    
    if (courseId) {
      query += ' AND a.course_id = ?';
      params.push(courseId);
    }
    
    query += ' ORDER BY u.name ASC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getAttendancePercentage(studentId, courseId) {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        ROUND(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as percentage
       FROM attendance 
       WHERE student_id = ? AND course_id = ?`,
      [studentId, courseId]
    );
    return rows[0];
  }
}

module.exports = Attendance;

