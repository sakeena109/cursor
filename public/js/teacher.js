// Teacher Dashboard JavaScript

let currentUser = null;
let currentExamId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        window.location.href = '/';
        return;
    }
    
    currentUser = getCurrentUser();
    if (currentUser && currentUser.role !== 'teacher') {
        window.location.href = '/dashboard';
        return;
    }
    
    loadExams();
});

function showSection(sectionName) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const section = document.getElementById(sectionName);
    if (section) {
        section.classList.add('active');
    }
    
    const navLink = Array.from(document.querySelectorAll('.nav-link')).find(link => 
        link.getAttribute('onclick').includes(sectionName)
    );
    if (navLink) {
        navLink.classList.add('active');
    }
}

async function loadExams() {
    const grid = document.getElementById('examsGrid');
    if (!grid) return;
    
    try {
        const response = await apiRequest('/teacher/exams');
        
        if (response && response.success) {
            const exams = response.exams || [];
            
            if (exams.length === 0) {
                grid.innerHTML = '<div class="empty-state">No exams created yet. Create your first exam!</div>';
                return;
            }
            
            grid.innerHTML = exams.map(exam => {
                const startDate = new Date(exam.start_date);
                const endDate = new Date(exam.end_date);
                return `
                    <div class="exam-card">
                        <div class="exam-card-header">
                            <h3>${exam.title}</h3>
                            <div class="exam-actions">
                                <button class="btn btn-sm btn-secondary" onclick="editExam(${exam.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteExam(${exam.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="exam-card-body">
                            <p>${exam.description || 'No description'}</p>
                            <div class="exam-details">
                                <div class="detail-item">
                                    <i class="fas fa-clock"></i> ${exam.duration} min
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-star"></i> ${exam.total_marks} marks
                                </div>
                            </div>
                        </div>
                        <div class="exam-card-footer">
                            <button class="btn btn-primary" onclick="manageQuestions(${exam.id})">
                                <i class="fas fa-question-circle"></i> Manage Questions
                            </button>
                            <button class="btn btn-secondary" onclick="viewResults(${exam.id})">
                                <i class="fas fa-chart-bar"></i> View Results
                            </button>
                            <button class="btn btn-info" onclick="copyExamLink(${exam.id})" title="Copy exam link to share with students">
                                <i class="fas fa-link"></i> Copy Link
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading exams:', error);
    }
}

function showExamModal() {
    document.getElementById('examModal').style.display = 'block';
    document.getElementById('examModalTitle').textContent = 'Create Exam';
    document.getElementById('examForm').reset();
    document.getElementById('examId').value = '';
}

function closeExamModal() {
    document.getElementById('examModal').style.display = 'none';
}

async function saveExam(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const examId = document.getElementById('examId').value;
    
    const examData = {
        title: formData.get('title'),
        description: formData.get('description'),
        duration: parseInt(formData.get('duration')),
        total_marks: parseFloat(formData.get('total_marks')),
        passing_marks: parseFloat(formData.get('passing_marks')),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        random_order: document.getElementById('examRandomOrder').checked ? 1 : 0
    };
    
    try {
        let response;
        if (examId) {
            response = await apiRequest(`/teacher/exams/${examId}`, {
                method: 'PUT',
                body: JSON.stringify(examData)
            });
        } else {
            response = await apiRequest('/teacher/exams', {
                method: 'POST',
                body: JSON.stringify(examData)
            });
        }
        
        if (response && response.success) {
            alert(examId ? 'Exam updated successfully' : 'Exam created successfully');
            closeExamModal();
            loadExams();
        }
    } catch (error) {
        console.error('Error saving exam:', error);
        alert('Error saving exam. Please try again.');
    }
}

async function editExam(examId) {
    try {
        const response = await apiRequest('/teacher/exams');
        if (response && response.success) {
            const exam = response.exams.find(e => e.id == examId);
            if (exam) {
                document.getElementById('examId').value = exam.id;
                document.getElementById('examTitle').value = exam.title;
                document.getElementById('examDescription').value = exam.description || '';
                document.getElementById('examDuration').value = exam.duration;
                document.getElementById('examTotalMarks').value = exam.total_marks;
                document.getElementById('examPassingMarks').value = exam.passing_marks;
                document.getElementById('examStartDate').value = new Date(exam.start_date).toISOString().slice(0, 16);
                document.getElementById('examEndDate').value = new Date(exam.end_date).toISOString().slice(0, 16);
                document.getElementById('examRandomOrder').checked = exam.random_order === 1;
                document.getElementById('examModalTitle').textContent = 'Edit Exam';
                document.getElementById('examModal').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error loading exam:', error);
        alert('Error loading exam details.');
    }
}

async function deleteExam(examId) {
    if (!confirm('Are you sure you want to delete this exam? All questions and results will be deleted.')) {
        return;
    }
    
    try {
        const response = await apiRequest(`/teacher/exams/${examId}`, {
            method: 'DELETE'
        });
        if (response && response.success) {
            alert('Exam deleted successfully');
            loadExams();
        }
    } catch (error) {
        console.error('Error deleting exam:', error);
        alert('Error deleting exam. Please try again.');
    }
}

async function manageQuestions(examId) {
    currentExamId = examId;
    showSection('questions');
    loadQuestions(examId);
}

async function loadQuestions(examId) {
    // Create questions section if it doesn't exist
    let questionsSection = document.getElementById('questions');
    if (!questionsSection) {
        const container = document.querySelector('.dashboard-container');
        questionsSection = document.createElement('div');
        questionsSection.id = 'questions';
        questionsSection.className = 'dashboard-section';
        questionsSection.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-question-circle"></i> Questions</h2>
                <button class="btn btn-primary" onclick="showQuestionModal()">
                    <i class="fas fa-plus"></i> Add Question
                </button>
            </div>
            <div class="questions-container" id="questionsContainer"></div>
        `;
        container.appendChild(questionsSection);
    }
    
    questionsSection.classList.add('active');
    
    const container = document.getElementById('questionsContainer');
    if (!container) return;
    
    try {
        const response = await apiRequest(`/teacher/exams/${examId}/questions`);
        
        if (response && response.success) {
            const questions = response.questions || [];
            
            if (questions.length === 0) {
                container.innerHTML = '<div class="empty-state">No questions added yet. Add your first question!</div>';
                return;
            }
            
            container.innerHTML = questions.map((q, index) => {
                const options = q.options || [];
                return `
                    <div class="question-card">
                        <div class="question-header">
                            <h4>Question ${index + 1} (${q.marks} marks)</h4>
                            <div class="question-actions">
                                <button class="btn btn-sm btn-secondary" onclick="editQuestion(${q.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteQuestion(${q.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="question-body">
                            <p>${q.question_text}</p>
                            ${q.type !== 'descriptive' ? `
                                <div class="question-options">
                                    ${options.map((opt, i) => `
                                        <div class="option-item ${opt === q.correct_answer ? 'correct' : ''}">
                                            ${opt} ${opt === q.correct_answer ? '<i class="fas fa-check"></i>' : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<p class="descriptive-note">Descriptive question - manual grading required</p>'}
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        container.innerHTML = '<div class="error-state">Error loading questions.</div>';
    }
}

function showQuestionModal() {
    if (!currentExamId) {
        alert('Please select an exam first');
        return;
    }
    
    document.getElementById('questionModal').style.display = 'block';
    document.getElementById('questionModalTitle').textContent = 'Add Question';
    document.getElementById('questionForm').reset();
    document.getElementById('questionId').value = '';
    document.getElementById('questionExamId').value = currentExamId;
    toggleQuestionOptions();
}

function closeQuestionModal() {
    document.getElementById('questionModal').style.display = 'none';
}

function toggleQuestionOptions() {
    const type = document.getElementById('questionType').value;
    const optionsContainer = document.getElementById('optionsContainer');
    const correctAnswerContainer = document.getElementById('correctAnswerContainer');
    
    if (type === 'descriptive') {
        optionsContainer.style.display = 'none';
        correctAnswerContainer.style.display = 'none';
        document.getElementById('questionCorrectAnswer').required = false;
    } else {
        optionsContainer.style.display = 'block';
        correctAnswerContainer.style.display = 'block';
        document.getElementById('questionCorrectAnswer').required = true;
        
        if (type === 'true_false') {
            document.getElementById('questionOptions').value = 'True\nFalse';
            document.getElementById('questionOptions').disabled = true;
        } else {
            document.getElementById('questionOptions').disabled = false;
        }
    }
}

async function saveQuestion(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const questionId = document.getElementById('questionId').value;
    const type = formData.get('type');
    
    let options = [];
    if (type !== 'descriptive') {
        const optionsText = document.getElementById('questionOptions').value;
        options = optionsText.split('\n').filter(opt => opt.trim());
    }
    
    const questionData = {
        exam_id: parseInt(formData.get('examId')),
        question_text: formData.get('question_text'),
        type: type,
        options: options,
        correct_answer: formData.get('correct_answer') || null,
        marks: parseFloat(formData.get('marks'))
    };
    
    try {
        let response;
        if (questionId) {
            response = await apiRequest(`/teacher/questions/${questionId}`, {
                method: 'PUT',
                body: JSON.stringify(questionData)
            });
        } else {
            response = await apiRequest(`/teacher/exams/${questionData.exam_id}/questions`, {
                method: 'POST',
                body: JSON.stringify(questionData)
            });
        }
        
        if (response && response.success) {
            alert(questionId ? 'Question updated successfully' : 'Question added successfully');
            closeQuestionModal();
            loadQuestions(currentExamId);
        }
    } catch (error) {
        console.error('Error saving question:', error);
        alert('Error saving question. Please try again.');
    }
}

async function editQuestion(questionId) {
    try {
        const response = await apiRequest(`/teacher/exams/${currentExamId}/questions`);
        if (response && response.success) {
            const question = response.questions.find(q => q.id == questionId);
            if (question) {
                document.getElementById('questionId').value = question.id;
                document.getElementById('questionExamId').value = question.exam_id;
                document.getElementById('questionText').value = question.question_text;
                document.getElementById('questionType').value = question.type;
                document.getElementById('questionMarks').value = question.marks;
                
                if (question.type !== 'descriptive') {
                    document.getElementById('questionOptions').value = question.options.join('\n');
                    document.getElementById('questionCorrectAnswer').value = question.correct_answer || '';
                }
                
                toggleQuestionOptions();
                document.getElementById('questionModalTitle').textContent = 'Edit Question';
                document.getElementById('questionModal').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error loading question:', error);
        alert('Error loading question details.');
    }
}

async function deleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question?')) {
        return;
    }
    
    try {
        const response = await apiRequest(`/teacher/questions/${questionId}`, {
            method: 'DELETE'
        });
        if (response && response.success) {
            alert('Question deleted successfully');
            loadQuestions(currentExamId);
        }
    } catch (error) {
        console.error('Error deleting question:', error);
        alert('Error deleting question. Please try again.');
    }
}

async function viewResults(examId) {
    showSection('results');
    const container = document.getElementById('resultsContainer');
    if (!container) return;
    
    try {
        const response = await apiRequest(`/teacher/exams/${examId}/results`);
        
        if (response && response.success) {
            const results = response.results || [];
            
            if (results.length === 0) {
                container.innerHTML = '<div class="empty-state">No results available for this exam.</div>';
                return;
            }
            
            container.innerHTML = `
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Email</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(result => {
                            const percentage = result.total_marks > 0 
                                ? ((result.score / result.total_marks) * 100).toFixed(2)
                                : '0.00';
                            const date = result.end_time ? new Date(result.end_time) : null;
                            return `
                                <tr>
                                    <td>${result.student_name || 'N/A'}</td>
                                    <td>${result.student_email || 'N/A'}</td>
                                    <td>${result.score || 0} / ${result.total_marks || 0} (${percentage}%)</td>
                                    <td><span class="status-badge ${result.status || 'unknown'}">${result.status || 'N/A'}</span></td>
                                    <td>${date ? formatDate(date) : 'N/A'}</td>
                                    <td>
                                        <button class="btn btn-sm btn-secondary" onclick="viewResultDetails(${result.id})">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('Error loading results:', error);
        container.innerHTML = '<div class="error-state">Error loading results.</div>';
    }
}

function viewResultDetails(sessionId) {
    window.location.href = `/exam/results/${sessionId}`;
}

async function markAttendance() {
    const date = document.getElementById('attendanceDate').value;
    const courseId = document.getElementById('attendanceCourse').value;
    
    if (!date || !courseId) {
        alert('Please fill in all fields');
        return;
    }
    
    // This would typically open a modal to select students
    alert('Attendance marking feature - select students in the modal');
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Copy exam link to clipboard
function copyExamLink(examId) {
    const baseUrl = window.location.origin;
    const examLink = `${baseUrl}/take/${examId}`;
    
    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(examLink).then(() => {
            showNotification('Exam link copied to clipboard!', 'success');
            
            // Show modal with link details
            showLinkModal(examLink);
        }).catch(() => {
            // Fallback for older browsers
            copyToClipboardFallback(examLink);
        });
    } else {
        // Fallback for older browsers
        copyToClipboardFallback(examLink);
    }
}

// Fallback copy method
function copyToClipboardFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Exam link copied to clipboard!', 'success');
        showLinkModal(text);
    } catch (err) {
        showNotification('Could not copy link. Please copy manually.', 'error');
        showLinkModal(text);
    }
    
    document.body.removeChild(textarea);
}

// Show link modal
function showLinkModal(link) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3><i class="fas fa-link"></i> Exam Shareable Link</h3>
                <span class="close" onclick="this.closest('.modal').style.display='none'">&times;</span>
            </div>
            <div style="padding: 30px;">
                <p style="margin-bottom: 15px; color: var(--text-light);">
                    Share this link with your students. They can access the exam directly without logging in first.
                </p>
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <input type="text" id="examLinkInput" value="${link}" readonly 
                           style="flex: 1; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; font-size: 14px;">
                    <button class="btn btn-primary" onclick="copyLinkAgain()">
                        <i class="fas fa-copy"></i> Copy Again
                    </button>
                </div>
                <div style="background: var(--light-color); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="font-size: 14px; color: var(--text-dark); margin-bottom: 10px;">
                        <strong>How it works:</strong>
                    </p>
                    <ul style="font-size: 13px; color: var(--text-light); margin-left: 20px; line-height: 1.8;">
                        <li>Students click the link</li>
                        <li>They enter their registered email</li>
                        <li>They can optionally enter password (if they have an account)</li>
                        <li>They start the exam immediately</li>
                    </ul>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').style.display='none'">Close</button>
                    <button class="btn btn-primary" onclick="shareViaEmail('${link}')">
                        <i class="fas fa-envelope"></i> Share via Email
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function copyLinkAgain() {
    const input = document.getElementById('examLinkInput');
    input.select();
    document.execCommand('copy');
    showNotification('Link copied again!', 'success');
}

function shareViaEmail(link) {
    const subject = encodeURIComponent('Exam Link');
    const body = encodeURIComponent(`Please use this link to take the exam:\n\n${link}\n\nGood luck!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

