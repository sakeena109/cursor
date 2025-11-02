# Online Exam System Platform

A comprehensive online examination platform for colleges and schools with advanced anti-cheating features, attendance tracking, and daily activity monitoring.

## Features

### Core Features
- **User Roles**: Admin, Teacher, Student with role-based access control
- **Exam Management**: Create, edit, and manage exams with multiple question types
- **Anti-Cheating System**: 
  - Tab/window switch detection
  - Right-click disable
  - Developer tools detection
  - Copy/paste prevention
  - Print screen blocking
  - Fullscreen enforcement
  - Activity logging
- **Attendance Tracking**: Daily attendance marking and reporting
- **Activity Monitoring**: Track login/logout, exam activities, and page navigation
- **Results & Analytics**: View exam results, scores, and system statistics

### User Roles

#### Admin
- Manage users (students, teachers)
- View all exams and results
- System statistics dashboard
- Full system access

#### Teacher
- Create and manage exams
- Add/edit questions (MCQ, True/False, Descriptive)
- View student results
- Mark attendance

#### Student
- Take exams with anti-cheat protection
- View results and grades
- Check attendance records
- View daily activities

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing, rate limiting

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Setup Steps

1. **Clone or extract the project**
   ```bash
   cd online-exam-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure database**
   - Create a MySQL database
   - Update `.env` file with your database credentials:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=online_exam_system
     DB_PORT=3306
     
     JWT_SECRET=your_secret_key_change_this
     SESSION_SECRET=your_session_secret_change_this
     PORT=3000
     ```

4. **Create database schema**
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   
   Or import `database/schema.sql` using your MySQL client (phpMyAdmin, MySQL Workbench, etc.)

5. **Generate admin password hash** (for default admin user)
   ```bash
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
   ```
   
   Copy the generated hash and update the `database/schema.sql` file where it says:
   ```sql
   INSERT INTO users (name, email, password, role) VALUES 
   ('Admin User', 'admin@exam.com', 'PASTE_HASH_HERE', 'admin')
   ```

6. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - Default admin credentials:
     - Email: `admin@exam.com`
     - Password: `admin123`

## Project Structure

```
/
├── public/
│   ├── css/           # Stylesheets
│   ├── js/            # Client-side JavaScript
│   └── assets/        # Images, icons
├── views/             # HTML pages
├── server/
│   ├── config/        # Database configuration
│   ├── middleware/    # Auth and anti-cheat middleware
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── server.js      # Main server file
├── database/
│   └── schema.sql     # Database schema
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Exams (Student)
- `GET /api/student/exams` - Get available exams
- `POST /api/exam/start/:examId` - Start exam
- `POST /api/exam/submit-answer` - Submit answer
- `POST /api/exam/submit/:sessionId` - Submit exam
- `POST /api/exam/log-violation` - Log anti-cheat violation
- `GET /api/exam/results/:sessionId` - Get exam results

### Teacher
- `GET /api/teacher/exams` - Get teacher's exams
- `POST /api/teacher/exams` - Create exam
- `PUT /api/teacher/exams/:id` - Update exam
- `DELETE /api/teacher/exams/:id` - Delete exam
- `POST /api/teacher/exams/:examId/questions` - Add question
- `GET /api/teacher/exams/:examId/questions` - Get questions
- `PUT /api/teacher/questions/:id` - Update question
- `DELETE /api/teacher/questions/:id` - Delete question
- `GET /api/teacher/exams/:examId/results` - Get exam results
- `POST /api/teacher/attendance` - Mark attendance

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/exams` - Get all exams
- `GET /api/admin/results` - Get all results
- `GET /api/admin/stats` - Get system statistics

### Attendance
- `GET /api/student/attendance` - Get student attendance
- `GET /api/attendance/date/:date` - Get attendance by date
- `GET /api/attendance/percentage/:studentId/:courseId` - Get attendance percentage

## Security Features

- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF tokens
- Rate limiting on login attempts
- Password strength requirements
- Secure session management
- JWT token authentication

## Anti-Cheating Features

The system includes multiple layers of anti-cheating protection:

1. **Tab/Window Detection**: Monitors tab switches and window focus
2. **Right-Click Disable**: Prevents context menu access
3. **Developer Tools Detection**: Blocks F12, Ctrl+Shift+I, etc.
4. **Copy/Paste Prevention**: Disables clipboard operations
5. **Print Screen Blocking**: Prevents screenshots
6. **Fullscreen Enforcement**: Forces fullscreen mode during exams
7. **Activity Logging**: Records all suspicious activities
8. **Warning System**: Shows warnings before disqualification
9. **Auto-Disqualification**: Auto-submits exam after max violations

## Usage Guidelines

### For Administrators
1. Login with admin credentials
2. Create teacher and student accounts
3. Monitor system statistics
4. View all exam results and activities

### For Teachers
1. Login with teacher credentials
2. Create exams with questions
3. Set exam dates and duration
4. View student results
5. Mark attendance

### For Students
1. Login with student credentials
2. View available exams
3. Start exam (anti-cheat will activate automatically)
4. Complete exam within time limit
5. View results after submission

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 3000

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and reinstall

## Development

For development with auto-reload:
```bash
npm run dev
```

## License

This project is created for educational purposes.

## Support

For issues or questions, please check the code comments or create an issue in the repository.

## Notes

- Always change default passwords in production
- Update JWT_SECRET and SESSION_SECRET in `.env`
- Regularly backup the database
- Test anti-cheat features thoroughly before deploying

