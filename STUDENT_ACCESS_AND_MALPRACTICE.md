# 🎓 Student Exam Access & Malpractice Monitoring - Complete Guide

## 📍 **How Students Access Exams**

### **Method 1: Via Dashboard (Logged In)**
1. Student goes to: `http://localhost:3000`
2. Logs in with email and password
3. Navigates to **"Exams"** tab in Student Dashboard
4. Sees list of available exams
5. Clicks **"Start Exam"** button
6. **Exam starts immediately with anti-cheat activated**

### **Method 2: Via Direct Link (No Login Required)**
1. Teacher/Admin shares exam link:
   ```
   http://localhost:3000/take/1
   ```
   (where `1` is the exam ID)

2. Student clicks the link
3. Sees exam info page
4. Enters their **registered email** (password optional if they have account)
5. Clicks **"Start Exam"**
6. **Exam starts immediately with anti-cheat activated**

---

## 🚫 **STRICT RESTRICTIONS - Once Exam Starts**

### **❌ CANNOT Leave the Page:**
- Browser shows warning: *"You are currently taking an exam. Are you sure you want to leave?"*
- If they force close → **Session marked as DISQUALIFIED**
- All attempts to leave are logged

### **❌ CANNOT Switch Tabs:**
- Tab switch detected **within 500ms**
- Immediate warning appears
- Violation logged to admin
- **After 3 tab switches → AUTO-DISQUALIFIED**
- Time away is tracked and reported

### **❌ CANNOT Minimize Window:**
- Window minimize detected immediately
- Violation logged
- Warning shown
- Multiple minimizes = disqualification

### **❌ CANNOT Use Keyboard Shortcuts:**
- **F12** (Developer Tools) → BLOCKED + Violation
- **Ctrl+Shift+I** (Dev Tools) → BLOCKED + Violation
- **Ctrl+Shift+J** (Console) → BLOCKED + Violation
- **Ctrl+U** (View Source) → BLOCKED + Violation
- **Ctrl+P** (Print) → BLOCKED + Violation
- **Print Screen** → BLOCKED + Violation

### **❌ CANNOT Use Mouse Functions:**
- **Right-click** → DISABLED + Violation logged
- **Copy** (Ctrl+C) → DISABLED + Violation logged
- **Paste** (Ctrl+V) → DISABLED + Violation logged
- **Cut** (Ctrl+X) → DISABLED + Violation logged
- **Drag** → DISABLED

### **❌ CANNOT Leave Fullscreen:**
- Fullscreen **automatically enforced**
- If exited → Immediately re-enabled
- Exit attempt = Violation logged

---

## ⚠️ **Warning System**

### **How It Works:**
1. **First Violation:** Warning appears (top-right corner)
   - Message: *"⚠️ WARNING 1: You switched tabs! This is being monitored."*
   - Yellow/orange background
   - Auto-dismisses after 5 seconds

2. **Second Violation:** Another warning, violation logged
   - Message: *"⚠️ WARNING 2: Right-click is disabled during exam"*
   - Violation count increases

3. **Third Violation:** **AUTO-DISQUALIFICATION**
   - Red disqualification screen appears
   - Exam stops immediately
   - Cannot continue
   - Auto-submitted
   - Reported to admin

---

## 🚨 **Disqualification Process**

### **When It Happens:**
- ✅ 3 tab switches
- ✅ 3 window minimizes
- ✅ 3 right-click attempts
- ✅ Any combination totaling 3 violations
- ✅ Force closing the page

### **What Happens:**
1. **Exam stops immediately**
2. **Red blocking screen appears:**
   ```
   ⚠️ Exam Disqualified
   
   Reason: [specific reason displayed]
   
   Your exam has been automatically submitted 
   due to multiple violations.
   
   All violations have been logged and reported 
   to your administrator.
   
   [Return to Dashboard]
   ```
3. **Exam auto-submitted** (if answers exist)
4. **Session status:** Changed to "disqualified"
5. **Final violation logged** with reason
6. **Student cannot bypass** this screen
7. **Admin immediately sees** it in Malpractice tab

---

## 👁️ **Admin Malpractice Dashboard**

### **Location:** Admin Dashboard → **"Malpractice"** Tab (4th tab)

### **What Admin Can See:**

#### **1. All Violations Table:**
Shows **every violation** from all exams:
- **Student Name & Email**
- **Exam Name**
- **Violation Type** (color-coded):
  - 🔴 Red: Critical (Tab Switch, Window Minimize)
  - 🟡 Yellow: Warning (Dev Tools, Copy/Paste)
  - 🟢 Green: Info (Other violations)
- **Exact Timestamp** (date and time)
- **Details:**
  - Time away (for tab switches)
  - Duration
  - Additional metadata
- **"View All" Button:**
  - Click to see all violations for that exam session
  - Shows complete violation history

#### **2. Disqualified Exams Section:**
Shows exams that were auto-disqualified:
- Click **"Disqualified Exams"** button
- See list of:
  - Student info (name, email)
  - Exam name
  - **Violation count** (badge)
  - Disqualification date/time
  - **"View Details"** button

#### **3. Real-Time Updates:**
- Click **"Refresh"** to update
- New violations appear as they happen
- Color-coded for quick identification

### **Admin View Example:**
```
┌────────────────────────────────────────────────────────┐
│ Malpractice Monitoring    [Disqualified] [Refresh]     │
├────────────────────────────────────────────────────────┤
│ Student      │ Exam        │ Violation    │ Time      │
│─────────────│─────────────│──────────────│──────────│
│ John Doe     │ Math Test   │ Tab Switch   │ 10:30:15 │
│ jane@...     │ Science     │ Right Click  │ 11:15:42 │
│ Bob Smith    │ History     │ Disqualified │ 12:00:00 │
│ ...          │ ...         │ ...          │ ...      │
└────────────────────────────────────────────────────────┘
```

---

## 📊 **What Gets Logged**

### **Violation Types:**
- ✅ `tab_switch` - Switched to another tab
- ✅ `window_minimized` - Minimized browser
- ✅ `window_blur` - Lost window focus
- ✅ `fullscreen_exit` - Exited fullscreen
- ✅ `page_unload_attempt` - Tried to close page
- ✅ `right_click` - Right-click attempted
- ✅ `copy` - Copy attempt
- ✅ `paste` - Paste attempt
- ✅ `dev_tools_f12` - Tried F12
- ✅ `dev_tools_shortcut` - Tried Ctrl+Shift+I
- ✅ `view_source` - Tried Ctrl+U
- ✅ `print_screen` - Screenshot attempt
- ✅ `disqualified` - Session disqualified

### **Details Captured:**
- ✅ Exact timestamp
- ✅ Duration (for tab switches - how long away)
- ✅ Time away (calculated)
- ✅ Student information
- ✅ Exam information
- ✅ Session ID

---

## 🔍 **How to View Violations as Admin**

### **Step-by-Step:**

1. **Login as Admin:**
   - Go to `http://localhost:3000`
   - Login with admin credentials

2. **Navigate to Malpractice Tab:**
   - Click **"Malpractice"** in top navigation (4th tab)

3. **View All Violations:**
   - Default view shows all violations
   - Scroll to see all students
   - Click **"View All"** on any row to see complete history

4. **View Disqualified Exams:**
   - Click **"Disqualified Exams"** button
   - See all auto-disqualified sessions
   - Click **"View Details"** to see full violation list

5. **Refresh Data:**
   - Click **"Refresh"** button for latest violations

---

## 💡 **Key Features Summary**

### **Student Experience:**
- ✅ Access via Dashboard or Direct Link
- ✅ Once started → **CANNOT leave or cheat**
- ✅ Warnings appear for violations
- ✅ Auto-disqualified after 3 violations
- ✅ Clear feedback on what's happening

### **Admin Monitoring:**
- ✅ **Real-time violation tracking**
- ✅ See all violations across all exams
- ✅ View disqualified sessions
- ✅ Detailed violation history per session
- ✅ Color-coded severity indicators
- ✅ Complete audit trail

### **Security Features:**
- ✅ Page cannot be closed (with warning)
- ✅ Tab switching detected in 500ms
- ✅ Fullscreen enforced
- ✅ Keyboard shortcuts blocked
- ✅ Mouse functions disabled
- ✅ Developer tools blocked
- ✅ All violations logged
- ✅ Auto-disqualification

---

## 🎯 **Quick Reference**

### **For Students:**
- **Access:** Dashboard or Link → Enter Email → Start Exam
- **During Exam:** Stay in fullscreen, don't switch tabs, follow rules
- **If You Violate:** Warning appears → More violations → Disqualified

### **For Admins:**
- **View Violations:** Admin Dashboard → Malpractice Tab
- **See Disqualified:** Click "Disqualified Exams" button
- **View Details:** Click "View All" or "View Details" on any violation
- **Refresh:** Click "Refresh" for latest data

---

**Complete exam integrity with full admin visibility!** 🛡️✨

