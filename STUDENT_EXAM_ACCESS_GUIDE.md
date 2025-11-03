# 🎓 How Students Access Exams - Complete Guide

## 📍 **How Students Can Access Exams**

### **Option 1: Via Dashboard (Logged In)**
1. Student logs in at `http://localhost:3000`
2. Goes to "Exams" tab in Student Dashboard
3. Clicks "Start Exam" on an available exam
4. Exam starts immediately

### **Option 2: Via Exam Link (Direct Access)**
1. Teacher/Admin shares exam link (e.g., `http://localhost:3000/take/1`)
2. Student clicks the link
3. Enters their registered email (and optional password)
4. Clicks "Start Exam"
5. Exam starts immediately

---

## 🔒 **Anti-Cheat Protection - What Happens During Exam**

### **Once Exam Starts:**
✅ **Fullscreen Mode:** Automatically enforced  
✅ **Tab Switching:** **BLOCKED** - Cannot switch tabs  
✅ **Window Minimizing:** **BLOCKED** - Cannot minimize  
✅ **Right-Click:** **DISABLED** - Context menu blocked  
✅ **Copy/Paste:** **DISABLED** - Clipboard operations blocked  
✅ **Print Screen:** **BLOCKED** - Screenshots prevented  
✅ **Developer Tools:** **BLOCKED** - F12, Ctrl+Shift+I disabled  
✅ **Page Reload:** **WARNED** - Beforeunload event prevents closing  

### **If Student Tries Malpractice:**

#### **⚠️ WARNING SYSTEM:**
- **First Violation:** Warning message appears
- **Second Violation:** Another warning, violation logged
- **Third Violation:** **AUTO-DISQUALIFICATION**
  - Exam automatically submitted
  - Session marked as "disqualified"
  - Student cannot continue
  - All violations logged

#### **What Gets Logged:**
- ✅ Tab switches (time away recorded)
- ✅ Window minimize/restore
- ✅ Right-click attempts
- ✅ Copy/paste attempts
- ✅ Developer tools access
- ✅ Print screen attempts
- ✅ Page close attempts
- ✅ Fullscreen exit

---

## 👁️ **Admin Monitoring - Viewing Malpractice**

### **Location:** Admin Dashboard → "Malpractice" Tab

### **What Admin Can See:**

#### **1. All Violations Table:**
- Student name and email
- Exam name
- Violation type (Tab Switch, Right-Click, etc.)
- Exact timestamp
- Details (time away, duration, etc.)
- "View All" button to see all violations for that session

#### **2. Disqualified Sessions:**
- List of all disqualified exams
- Student information
- Number of violations
- Date/time disqualified
- "View Details" button

### **Violation Types Displayed:**
- 🔴 **Critical:** Tab Switch, Window Minimized
- 🟡 **Warning:** Dev Tools, Copy/Paste
- 🟢 **Info:** Other violations

---

## 📊 **How Violations Are Tracked**

### **Real-Time Logging:**
1. Student commits violation (e.g., switches tab)
2. Violation logged **immediately** to database
3. Warning shown to student
4. Violation count increases
5. Admin can see it in Malpractice tab

### **Disqualification Process:**
1. Violation count reaches 3
2. Exam automatically submitted
3. Session status changed to "disqualified"
4. Final violation logged with reason
5. Student sees disqualification screen
6. Admin sees in "Disqualified Exams" section

---

## 🛡️ **Strict Anti-Cheat Features**

### **Page Protection:**
- ✅ **Beforeunload:** Warning when trying to close
- ✅ **Unload Event:** Marks session as disqualified if closed
- ✅ **Focus Detection:** Checks every 500ms
- ✅ **Visibility API:** Detects tab switches
- ✅ **Blur/Focus Events:** Tracks window focus

### **Input Protection:**
- ✅ Right-click disabled
- ✅ Text selection disabled
- ✅ Copy/Cut/Paste disabled
- ✅ Drag disabled
- ✅ Keyboard shortcuts blocked (F12, Ctrl+Shift+I, etc.)

### **Visual Protection:**
- ✅ Fullscreen enforced
- ✅ Screen capture blocked
- ✅ Print screen blocked

---

## 📋 **Student Experience Flow**

### **Starting Exam:**
```
1. Student accesses exam (link or dashboard)
2. Enters credentials (if via link)
3. Clicks "Start Exam"
4. Fullscreen mode activates
5. Anti-cheat system initializes
6. Exam timer starts
7. Student answers questions
```

### **If Student Tries to Cheat:**
```
Attempt 1: ⚠️ Warning appears (top-right corner)
Attempt 2: ⚠️ Another warning, logged to admin
Attempt 3: 🚫 AUTO-DISQUALIFIED
         - Red screen appears
         - "Exam Disqualified" message
         - Cannot continue
         - Auto-submitted
         - Reported to admin
```

---

## 👨‍💼 **Admin View - Malpractice Tab**

### **What Admin Sees:**

#### **Violations Table:**
- Color-coded rows (red for critical violations)
- Violation type badges
- Timestamp of each violation
- Student and exam information
- View details button

#### **Disqualified Exams:**
- List of all disqualified sessions
- Violation count per session
- Student information
- View full violation history

### **Example View:**
```
┌─────────────────────────────────────────────────┐
│ Malpractice Monitoring    [Refresh] [Disqualified]│
├─────────────────────────────────────────────────┤
│ Student      │ Exam        │ Violation  │ Time  │
│ John Doe     │ Math Test   │ Tab Switch │ 10:30 │
│ Jane Smith   │ Science     │ Right Click│ 11:15 │
│ ...          │ ...         │ ...        │ ...   │
└─────────────────────────────────────────────────┘
```

---

## 🔐 **Security Summary**

### **What Students CANNOT Do:**
❌ Switch tabs  
❌ Minimize window  
❌ Close page (without warning)  
❌ Right-click  
❌ Copy/paste text  
❌ Open developer tools  
❌ Take screenshots  
❌ Leave fullscreen  
❌ Reload page (without warning)  

### **What Gets Logged:**
✅ Every violation type  
✅ Exact timestamp  
✅ Duration (for tab switches)  
✅ Student information  
✅ Exam information  
✅ Session ID  

### **What Admin Sees:**
✅ Real-time violation logs  
✅ Disqualified sessions  
✅ Violation counts  
✅ Detailed violation history  
✅ Student and exam details  

---

## 💡 **Key Points**

1. **Students access via:** Dashboard or Direct Link
2. **Once started:** Cannot leave or use other tabs
3. **Violations tracked:** Every malpractice attempt logged
4. **Admin monitoring:** Full visibility in "Malpractice" tab
5. **Auto-disqualification:** After 3 violations
6. **Real-time:** Violations appear immediately to admin

**The system ensures complete exam integrity!** 🛡️✨

