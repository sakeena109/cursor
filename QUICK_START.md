# ⚡ QUICK START - Get Running in 5 Minutes!

## Prerequisites
- ✅ Node.js installed (v14+)
- ✅ MySQL installed and running
- ✅ Terminal/Command Prompt

## Setup Steps

### 1️⃣ Install Dependencies (First Time Only)
```bash
npm install
```

### 2️⃣ Database Setup

**Option A: Using Command Line**
```bash
mysql -u root -p
CREATE DATABASE online_exam_system;
exit;
mysql -u root -p online_exam_system < database/schema.sql
```

**Option B: Using MySQL Workbench/phpMyAdmin**
1. Create database: `online_exam_system`
2. Import file: `database/schema.sql`

### 3️⃣ Configure Database (if needed)

Edit `.env` file:
- Set `DB_PASSWORD` if MySQL has password
- Keep blank if no password

### 4️⃣ Create Admin User
```bash
node scripts/create-admin.js
```

### 5️⃣ Start Server
```bash
npm start
```

### 6️⃣ Open Browser
Go to: **http://localhost:3000**

### 7️⃣ Login
- Email: `admin@exam.com`
- Password: `admin123`

## 🎉 That's It! You're Ready!

### Next Steps:
1. **Create a Teacher** (Admin → Users → Add User)
2. **Create a Student** (Admin → Users → Add User)
3. **Login as Teacher** → Create Exam → Add Questions
4. **Login as Student** → View Exams → Take Exam → See Results

## 🆘 Quick Fixes

**Port busy?** Change `PORT=3000` to `PORT=3001` in `.env`

**Database error?** Make sure MySQL is running and database exists

**Module errors?** Run `npm install` again

---

**Need help?** Check `README.md` for detailed documentation!

