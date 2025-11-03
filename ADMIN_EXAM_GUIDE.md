# 📝 Admin Exam & Question Upload Guide

## Where Admins Can Upload Question Papers

### 📍 **Location:** Admin Dashboard → "Manage Exams" Tab

---

## 🎯 Step-by-Step Instructions

### Step 1: Login as Admin
- Go to: `http://localhost:3000`
- Login with admin credentials (admin@exam.com / admin123)

### Step 2: Navigate to "Manage Exams"
- After login, you'll see the Admin Dashboard
- Click on **"Manage Exams"** tab in the navigation bar
- You'll see:
  - A "Create Exam" button at the top right
  - List of all existing exams (if any)

### Step 3: Create an Exam
1. Click the **"Create Exam"** button (blue button with ➕ icon)
2. Fill in the exam details:
   - **Title:** Name of the exam (e.g., "Mathematics Final Exam")
   - **Duration:** Time in minutes (e.g., 60)
   - **Description:** Brief description of the exam
   - **Total Marks:** Maximum marks for the exam
   - **Passing Marks:** Minimum marks to pass
   - **Start Date & Time:** When exam becomes available
   - **End Date & Time:** When exam closes
   - **Randomize Question Order:** Check if you want random question order
3. Click **"Save Exam"**

### Step 4: Add Questions to the Exam
1. After creating the exam, you'll see it in the exam cards grid
2. Click **"Manage Questions"** button on the exam card
3. You'll be taken to the Questions section
4. Click **"Add Question"** button
5. Fill in question details:
   - **Question Text:** The actual question
   - **Question Type:** 
     - Multiple Choice (MCQ)
     - True/False
     - Descriptive (essay type)
   - **Options:** (For MCQ/True-False)
     - Enter each option on a new line
     - Example:
       ```
       Option A
       Option B
       Option C
       Option D
       ```
   - **Correct Answer:** The correct option (for MCQ/True-False)
   - **Marks:** Points for this question
6. Click **"Save Question"**
7. Repeat to add more questions

---

## 📸 Visual Guide

### Admin Dashboard Navigation:
```
┌─────────────────────────────────────┐
│  Admin Dashboard                    │
├─────────────────────────────────────┤
│ [Dashboard] [Users] [Manage Exams] │
│                ↑                    │
│          CLICK HERE                  │
└─────────────────────────────────────┘
```

### Manage Exams Tab:
```
┌─────────────────────────────────────┐
│  Manage Exams & Questions    [+]    │
│                  Create Exam        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Math Exam            [Edit] │   │
│  │                        [X] │   │
│  │ Description...              │   │
│  │ ⏱️ 60 min  ⭐ 100 marks     │   │
│  │                             │   │
│  │ [Manage Questions]          │   │
│  │ [Copy Link]                  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Manage Questions Section:
```
┌─────────────────────────────────────┐
│  Questions                  [+]      │
│             Add Question             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Question 1 (5 marks) [Edit] │   │
│  │                           [X]│   │
│  │ What is 2 + 2?             │   │
│  │ • Option A                 │   │
│  │ • Option B ✓ (correct)     │   │
│  │ • Option C                 │   │
│  │ • Option D                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Question 2 (10 marks) [Edit]│   │
│  │ Explain JavaScript...       │   │
│  │ [Descriptive - manual grade]│   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## ✨ Key Features for Admins

### ✅ **Full Exam Management:**
- Create new exams
- Edit existing exams
- Delete exams
- View all exams in the system

### ✅ **Question Management:**
- Add multiple questions
- Edit questions
- Delete questions
- Support for:
  - Multiple Choice Questions (MCQ)
  - True/False Questions
  - Descriptive/Essay Questions

### ✅ **Additional Features:**
- Copy exam link to share with students
- Assign exam to any teacher
- View exam statistics

---

## 📋 Quick Workflow

1. **Admin logs in**
2. **Clicks "Manage Exams"** tab
3. **Clicks "Create Exam"** button
4. **Fills exam details** → Saves
5. **Clicks "Manage Questions"** on the exam card
6. **Clicks "Add Question"** button
7. **Enters question details:**
   - Question text
   - Type (MCQ/True-False/Descriptive)
   - Options (if applicable)
   - Correct answer
   - Marks
8. **Saves question**
9. **Repeats** steps 6-8 for more questions
10. **Done!** Exam is ready to share

---

## 💡 Tips

- **Batch Upload:** Add all questions one by one after creating the exam
- **Question Types:** 
  - Use MCQ for objective questions
  - Use True/False for simple yes/no questions
  - Use Descriptive for essay-type answers
- **Marks Distribution:** Make sure total marks match sum of all question marks
- **Randomize:** Enable if you want questions in random order for each student

---

## 🎯 Summary

**Where:** Admin Dashboard → **"Manage Exams"** Tab → **"Create Exam"** Button → **"Manage Questions"** Button → **"Add Question"** Button

**Path:** 
```
Login → Manage Exams Tab → Create Exam → Manage Questions → Add Question
```

**That's it! Admins can now upload question papers just like teachers!** 🎓✨

