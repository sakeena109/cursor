const pool = require('../config/database');

class Activity {
  static async create(activityData) {
    const { user_id, activity_type, description, metadata } = activityData;
    
    const [result] = await pool.execute(
      `INSERT INTO activities (user_id, activity_type, description, metadata, timestamp) 
       VALUES (?, ?, ?, ?, NOW())`,
      [user_id, activity_type, description, JSON.stringify(metadata || {})]
    );
    
    return result.insertId;
  }

  static async findByUser(userId, limit = 50) {
    const [rows] = await pool.execute(
      `SELECT * FROM activities 
       WHERE user_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [userId, limit]
    );
    
    return rows.map(row => ({
      ...row,
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  static async findByType(activityType, limit = 100) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.name as user_name, u.role as user_role 
       FROM activities a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.activity_type = ? 
       ORDER BY a.timestamp DESC 
       LIMIT ?`,
      [activityType, limit]
    );
    
    return rows.map(row => ({
      ...row,
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  static async getDailyStats(userId, date) {
    const [rows] = await pool.execute(
      `SELECT 
        activity_type,
        COUNT(*) as count
       FROM activities 
       WHERE user_id = ? AND DATE(timestamp) = ?
       GROUP BY activity_type`,
      [userId, date]
    );
    return rows;
  }
}

module.exports = Activity;

