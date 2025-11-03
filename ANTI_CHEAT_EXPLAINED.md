# 🛡️ Anti-Cheat System - Complete Explanation

## 🎯 How Students Access Exams

### **Method 1: Via Dashboard**
1. Student logs in → `http://localhost:3000`
2. Navigates to "Exams" tab
3. Sees available exams
4. Clicks "Start Exam"
5. **Anti-cheat activates immediately**

### **Method 2: Via Direct Link**
1. Teacher/Admin shares link: `http://localhost:3000/take/1`
2. Student clicks link
3. Enters email (and password if they have account)
4. Clicks "Start Exam"
5. **Anti-cheat activates immediately**

---

## 🚫 **Strict Restrictions Once Exam Starts**

### **CANNOT Leave Page:**
- ✅ `beforeunload` event prevents closing
- ✅ Warning appears: "You are currently taking an exam..."
- ✅ If they force close, session marked as disqualified
- ✅ Page navigation blocked

### **CANNOT Switch Tabs:**
- ✅ Focus detection every 500ms
- ✅ Tab switch detected **immediately**
- ✅ Warning shown to student
- ✅ Violation logged to admin
- ✅ After 3 tab switches → **AUTO-DISQUALIFIED**

### **CANNOT Minimize Window:**
- ✅ Visibility API monitors window state
- ✅ Blur event detects focus loss
- ✅ Minimizing triggers violation
- ✅ Multiple minimizes = disqualification

### **CANNOT Use Keyboard Shortcuts:**
- ❌ F12 (Developer Tools) → BLOCKED
- ❌ Ctrl+Shift+I (Dev Tools) → BLOCKED
- ❌ Ctrl+Shift+J (Console) → BLOCKED
- ❌ Ctrl+U (View Source) → BLOCKED
- ❌ Ctrl+P (Print) → BLOCKED
- ❌ Print Screen → BLOCKED

### **CANNOT Use Mouse Tricks:**
- ❌ Right-click → DISABLED + Violation logged
- ❌ Copy (Ctrl+C) → DISABLED + Violation logged
- ❌ Paste (Ctrl+V) → DISABLED + Violation logged
- ❌ Cut (Ctrl+X) → DISABLED + Violation logged
- ❌ Drag → DISABLED

### **CANNOT Leave Fullscreen:**
- ✅ Fullscreen automatically requested
- ✅ If exited, immediately re-enabled
- ✅ Exit attempt = Violation logged

---

## 📊 **Violation Tracking & Admin View**

### **How Violations Are Logged:**

1. **Student commits violation** (e.g., switches tab)
2. **Frontend detects** it immediately
3. **Violation sent to server** via API
4. **Stored in database** (`anti_cheat_logs` table)
5. **Warning shown** to student
6. **Count increases**
7. **Admin can view** in real-time

### **Database Storage:**
```sql
anti_cheat_logs:
- session_id (which exam session)
- violation_type (tab_switch, right_click, etc.)
- details (JSON with timestamp, duration, etc.)
- timestamp (exact time of violation)
```

---

## 👁️ **Admin Malpractice Dashboard**

### **Location:** Admin Dashboard → **"Malpractice" Tab**

### **Features:**

#### **1. All Violations Table:**
Shows **ALL** violations across all exams:
- Student Name & Email
- Exam Name
- Violation Type (color-coded)
- Exact Timestamp
- Details (time away, duration)
- "View All" button (see all violations for that session)

#### **2. Disqualified Sessions:**
Shows exams that were auto-disqualified:
- Student info
- Exam name
- Total violation count
- Disqualification date/time
- "View Details" button

#### **3. Real-Time Updates:**
- Click "Refresh" to see latest violations
- Violations appear as they happen
- Color-coded by severity:
  - 🔴 Red: Critical (Tab Switch, Window Minimize)
  - 🟡 Yellow: Warning (Dev Tools, Copy/Paste)
  - 🟢 Green: Info (Other violations)

---

## ⚠️ **Warning System for Students**

### **Warning Display:**
- Appears at **top-right corner**
- **Yellow/Orange** background
- Shows violation number (Warning 1, Warning 2, etc.)
- **Auto-dismisses** after 5 seconds
- **Pulsing animation** to grab attention

### **Warning Messages:**
- "⚠️ Warning 1: You switched tabs! This is being monitored."
- "⚠️ Warning 2: Right-click is disabled during exam"
- "⚠️ Warning 3: Window was minimized. Please return."

---

## 🚨 **Disqualification Process**

### **When Disqualification Happens:**
- ✅ 3+ tab switches
- ✅ 3+ window minimizes
- ✅ 3+ right-click attempts
- ✅ Any combination of 3 violations

### **What Happens:**
1. **Exam immediately stops**
2. **Red disqualification screen appears** (blocks everything)
3. **Auto-submits** exam (if answers exist)
4. **Session marked** as "disqualified"
5. **Final violation logged** with reason
6. **Student cannot continue**
7. **Admin notified** (shows in Malpractice tab)

### **Disqualification Screen:**
- **Full-screen blocking modal**
- Red warning icon
- Clear reason displayed
- "Return to Dashboard" button
- Cannot be closed or bypassed

---

## 📈 **Admin Monitoring Features**

### **View Options:**

#### **Option 1: All Violations**
- See every violation from all exams
- Filter by student, exam, or date
- Real-time updates

#### **Option 2: Disqualified Only**
- See only disqualified sessions
- Quick view of problem students
- Violation counts per session

#### **Option 3: Session Details**
- Click "View All" on any violation
- See complete violation history for that exam session
- Chronological list of all violations

---

## 🔍 **Violation Types Tracked**

### **Critical Violations (Red):**
- `tab_switch` - Switched to another tab
- `window_minimized` - Minimized browser window
- `window_blur` - Lost window focus
- `fullscreen_exit` - Exited fullscreen mode
- `page_unload_attempt` - Tried to close page
- `disqualified` - Session disqualified

### **Warning Violations (Yellow):**
- `dev_tools_f12` - Tried to open F12
- `dev_tools_shortcut` - Tried Ctrl+Shift+I
- `view_source` - Tried Ctrl+U
- `print_screen` - Tried to screenshot

### **Info Violations (Green):**
- `right_click` - Right-click attempted
- `copy` - Copy attempt
- `paste` - Paste attempt
- `cut` - Cut attempt
- `window_focus` - Returned to window
- `tab_return` - Returned to tab

---

## 💻 **Technical Implementation**

### **Frontend Detection:**
- `document.hasFocus()` - Checks window focus
- `document.hidden` - Visibility API
- `visibilitychange` event
- `blur`/`focus` events
- `beforeunload` event
- Keyboard event listeners
- Mouse event listeners

### **Backend Logging:**
- REST API endpoint: `/api/exam/log-violation`
- Stores in `anti_cheat_logs` table
- Includes session ID, type, details, timestamp
- Updates violation count
- Auto-disqualifies if threshold exceeded

### **Admin API:**
- `/api/admin/violations` - Get all violations
- `/api/admin/violations/session/:id` - Get session violations
- `/api/admin/disqualified` - Get disqualified sessions

---

## 🎯 **Summary**

### **Student Access:**
- Dashboard → Exams → Start Exam
- OR Direct Link → Enter Email → Start Exam

### **Once Started:**
- ❌ Cannot leave page
- ❌ Cannot switch tabs
- ❌ Cannot minimize
- ❌ Cannot use shortcuts
- ❌ Cannot copy/paste
- ✅ All violations logged

### **Admin View:**
- Malpractice Tab → See all violations
- Real-time monitoring
- Disqualified sessions list
- Detailed violation history

**Complete exam integrity protection!** 🛡️

