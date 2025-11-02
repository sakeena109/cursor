const pool = require('../config/database');

const logAntiCheatViolation = async (sessionId, violationType, details = {}) => {
  try {
    await pool.execute(
      'INSERT INTO anti_cheat_logs (session_id, violation_type, details, timestamp) VALUES (?, ?, ?, NOW())',
      [sessionId, violationType, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('Error logging anti-cheat violation:', error);
  }
};

const checkViolationCount = async (sessionId, maxViolations = 3) => {
  try {
    const [violations] = await pool.execute(
      'SELECT COUNT(*) as count FROM anti_cheat_logs WHERE session_id = ?',
      [sessionId]
    );
    return violations[0].count >= maxViolations;
  } catch (error) {
    console.error('Error checking violation count:', error);
    return false;
  }
};

module.exports = { logAntiCheatViolation, checkViolationCount };

