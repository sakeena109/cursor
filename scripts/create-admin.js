// Script to create admin user
// Run: node scripts/create-admin.js

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'online_exam_system'
    });
    
    await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=name',
      ['Admin User', 'admin@exam.com', hashedPassword, 'admin']
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@exam.com');
    console.log('Password: admin123');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();

