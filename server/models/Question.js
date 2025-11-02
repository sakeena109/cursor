const pool = require('../config/database');

class Question {
  static async create(questionData) {
    const { exam_id, question_text, type, options, correct_answer, marks } = questionData;
    
    const [result] = await pool.execute(
      `INSERT INTO questions (exam_id, question_text, type, options, correct_answer, marks, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [exam_id, question_text, type, JSON.stringify(options), correct_answer, marks]
    );
    
    return result.insertId;
  }

  static async findByExamId(examId, randomOrder = false) {
    let query = 'SELECT * FROM questions WHERE exam_id = ?';
    
    if (randomOrder) {
      query += ' ORDER BY RAND()';
    } else {
      query += ' ORDER BY id ASC';
    }
    
    const [rows] = await pool.execute(query, [examId]);
    
    // Parse JSON options
    return rows.map(row => ({
      ...row,
      options: JSON.parse(row.options || '[]')
    }));
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM questions WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      ...row,
      options: JSON.parse(row.options || '[]')
    };
  }

  static async update(id, questionData) {
    const { question_text, type, options, correct_answer, marks } = questionData;
    
    await pool.execute(
      `UPDATE questions SET question_text = ?, type = ?, options = ?, correct_answer = ?, marks = ? WHERE id = ?`,
      [question_text, type, JSON.stringify(options), correct_answer, marks, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM questions WHERE id = ?', [id]);
  }

  static async deleteByExamId(examId) {
    await pool.execute('DELETE FROM questions WHERE exam_id = ?', [examId]);
  }
}

module.exports = Question;

