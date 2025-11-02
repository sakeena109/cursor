# Quick Setup Guide - Online Exam System

## 🚀 Quick Start (Step by Step)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up MySQL Database

1. **Start MySQL** (make sure MySQL is running on your system)

2. **Create Database Manually:**
   - Open MySQL Workbench, phpMyAdmin, or command line
   - Run: `CREATE DATABASE online_exam_system;`

3. **Import Schema:**
   ```bash
   mysql -u root -p online_exam_system < database/schema.sql
   ```
   
   OR manually run the SQL file `database/schema.sql` in your MySQL client

4. **Update .env file:**
   - Open `.env` file
   - Update `DB_PASSWORD` if your MySQL root user has a password
   - Leave blank if no password

### Step 3: Create Admin User

After dependencies are installed, run:
```bash
node scripts/create-admin.js
```

This creates the default admin user:
- **Email:** admin@exam.com
- **Password:** admin123

### Step 4: Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Step 5: Access the Website

Open your browser and go to:
**http://localhost:3000**

## 📋 Default Login Credentials

After running `node scripts/create-admin.js`:
- **Email:** admin@exam.com
- **Password:** admin123

## 🎯 What You Can Do After Login

### As Admin:
1. View system statistics
2. Create/manage users (students, teachers)
3. View all exams and results
4. Monitor system activities

### As Teacher (create via Admin):
1. Create exams with questions
2. View student results
3. Mark attendance

### As Student (create via Admin):
1. View available exams
2. Take exams with anti-cheat protection
3. View results and attendance

## 🔧 Troubleshooting

### Port Already in Use?
- Change `PORT=3000` to another port in `.env` file (e.g., `PORT=3001`)
- Then access: `http://localhost:3001`

### Database Connection Error?
- Check MySQL is running
- Verify database credentials in `.env`
- Make sure database `online_exam_system` exists

### Module Not Found?
```bash
npm install
```

### Cannot Create Admin User?
- Make sure database is set up first
- Check `.env` file has correct database credentials
- Make sure MySQL is running

## 📝 First Steps After Login

1. **Login as Admin** (admin@exam.com / admin123)
2. **Create a Teacher** user from Admin Dashboard
3. **Create a Student** user from Admin Dashboard
4. **Login as Teacher** and create an exam
5. **Login as Student** and take the exam
6. **View Results** from student dashboard

## 🎨 Features Available

✅ User authentication and role-based access
✅ Create and manage exams
✅ Multiple question types (MCQ, True/False, Descriptive)
✅ Anti-cheating system (tab detection, copy prevention, etc.)
✅ Attendance tracking
✅ Activity monitoring
✅ Results viewing with detailed breakdown
✅ Modern, responsive UI

Enjoy using the Online Exam System! 🎓

