# 🚀 GET YOUR WEBSITE RUNNING - Complete Guide

## 📋 What You Need First

### Required Software:
1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MySQL** - [Download here](https://dev.mysql.com/downloads/)
3. **Code Editor** (optional - you already have Cursor!)

---

## 🎯 STEP-BY-STEP SETUP

### STEP 1: Install Node.js
1. Go to https://nodejs.org/
2. Download the LTS (Long Term Support) version
3. Install it (this includes npm)
4. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```

### STEP 2: Install MySQL
1. Download MySQL from https://dev.mysql.com/downloads/
2. Install MySQL Server
3. Remember your root password (or set it to empty)
4. Start MySQL service

### STEP 3: Create Database

**Option A: Using MySQL Command Line**
```bash
mysql -u root -p
```
Then run:
```sql
CREATE DATABASE online_exam_system;
exit;
```

Then import schema:
```bash
mysql -u root -p online_exam_system < database/schema.sql
```

**Option B: Using phpMyAdmin/MySQL Workbench**
1. Open phpMyAdmin or MySQL Workbench
2. Create new database: `online_exam_system`
3. Import the file: `database/schema.sql`

### STEP 4: Configure Database Connection

1. Open the `.env` file in your project
2. Update these values:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password    ← Change this!
   DB_NAME=online_exam_system
   ```

### STEP 5: Install Project Dependencies

Open terminal/command prompt in project folder:
```bash
npm install
```

This will install:
- express
- mysql2
- bcrypt
- jsonwebtoken
- and other dependencies

### STEP 6: Create Admin User

```bash
node scripts/create-admin.js
```

This creates:
- **Email:** admin@exam.com
- **Password:** admin123

### STEP 7: Start the Server

```bash
npm start
```

You should see:
```
✅ Database connected successfully
🚀 Server running on http://localhost:3000
```

### STEP 8: Open in Browser

Open your web browser and go to:
```
http://localhost:3000
```

---

## 🎉 YOU'RE IN! Here's What to Do Next:

### As ADMIN (admin@exam.com / admin123):

1. **Create a Teacher:**
   - Click "Users" in navigation
   - Click "Add User"
   - Fill in:
     - Name: Teacher Name
     - Email: teacher@exam.com
     - Password: teacher123
     - Role: Teacher
   - Click "Save"

2. **Create a Student:**
   - Click "Add User" again
   - Fill in:
     - Name: Student Name
     - Email: student@exam.com
     - Password: student123
     - Role: Student
   - Click "Save"

### As TEACHER (teacher@exam.com / teacher123):

1. **Create an Exam:**
   - Click "My Exams"
   - Click "Create Exam"
   - Fill in exam details:
     - Title: Sample Math Exam
     - Duration: 30 (minutes)
     - Total Marks: 100
     - Passing Marks: 40
     - Set Start and End dates
   - Click "Save Exam"

2. **Add Questions:**
   - Click "Manage Questions" on your exam
   - Click "Add Question"
   - Choose type: MCQ, True/False, or Descriptive
   - Add question text, options, correct answer, and marks
   - Click "Save Question"
   - Add more questions as needed

### As STUDENT (student@exam.com / student123):

1. **Take Exam:**
   - Click "Exams" in navigation
   - Click "Start Exam" on an available exam
   - Answer questions
   - Click "Submit Exam"

2. **View Results:**
   - Click "Results" in navigation
   - Click "View" on any completed exam
   - See detailed breakdown!

---

## 🎨 FEATURES YOU'LL SEE:

### Home Page (Login)
- Beautiful gradient background
- Login form
- Feature highlights

### Admin Dashboard
- System statistics cards
- User management table
- All exams overview
- All results overview

### Teacher Dashboard
- Create/edit exams
- Manage questions
- View student results
- Mark attendance

### Student Dashboard
- View available exams
- Take exams (with anti-cheat!)
- View results with detailed breakdown
- Check attendance
- View daily activities

### Exam Taking Interface
- Question navigation sidebar
- Timer countdown
- Auto-save answers
- Mark for review
- Fullscreen enforcement
- Anti-cheating protection

### Results Page
- Beautiful summary card (Pass/Fail)
- Question-wise breakdown
- Color-coded answers (green=correct, red=incorrect)
- Print option

---

## 🛠️ TROUBLESHOOTING

### ❌ "npm is not recognized"
**Solution:** Install Node.js from nodejs.org and restart terminal

### ❌ "Cannot connect to database"
**Solutions:**
- Check MySQL is running
- Verify `.env` file has correct credentials
- Make sure database `online_exam_system` exists

### ❌ "Port 3000 already in use"
**Solution:** Change `PORT=3001` in `.env` file

### ❌ "Module not found"
**Solution:** Run `npm install` again

### ❌ "Admin user creation failed"
**Solution:** 
- Make sure database is set up first
- Check database credentials in `.env`
- Ensure MySQL is running

---

## 📸 VISUAL PREVIEW

### Login Page:
- Purple gradient background
- White login card with logo
- Feature cards on the side

### Dashboard:
- Modern card-based layout
- Colorful statistics
- Responsive design

### Exam Interface:
- Clean question display
- Navigation sidebar
- Timer in header
- Anti-cheat warnings

### Results:
- Pass/Fail summary card
- Detailed question breakdown
- Color-coded answers

---

## 📝 QUICK COMMANDS REFERENCE

```bash
# Install dependencies (first time)
npm install

# Create admin user
node scripts/create-admin.js

# Start server
npm start

# Start with auto-reload (development)
npm run dev
```

---

## 🎓 YOU'RE ALL SET!

Once the server is running, you'll have:
- ✅ Full authentication system
- ✅ Role-based dashboards
- ✅ Exam creation and taking
- ✅ Anti-cheating features
- ✅ Results viewing
- ✅ Attendance tracking
- ✅ Activity monitoring
- ✅ Beautiful modern UI

**Enjoy your Online Exam System!** 🚀

---

Need more help? Check:
- `README.md` - Full documentation
- `QUICK_START.md` - Quick reference
- `SETUP.md` - Detailed setup guide

