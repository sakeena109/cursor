// Admin Dashboard JavaScript

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        window.location.href = '/';
        return;
    }
    
    currentUser = getCurrentUser();
    if (currentUser && currentUser.role !== 'admin') {
        window.location.href = '/dashboard';
        return;
    }
    
    loadDashboard();
    loadUsers();
    loadExams();
    loadResults();
    loadViolations();
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
    
    // Load section-specific data
    if (sectionName === 'violations') {
        loadViolations();
    }
}

async function loadDashboard() {
    try {
        const response = await apiRequest('/admin/stats');
        
        if (response && response.success) {
            const stats = response.stats;
            const grid = document.getElementById('statsGrid');
            if (!grid) return;
            
            grid.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <h3>Total Users</h3>
                        <p class="stat-value">${stats.users.reduce((sum, u) => sum + parseInt(u.count), 0)}</p>
                        <p class="stat-detail">${stats.users.map(u => `${u.role}: ${u.count}`).join(', ')}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="stat-content">
                        <h3>Exams</h3>
                        <p class="stat-value">${stats.exams.total_exams || 0}</p>
                        <p class="stat-detail">Active: ${stats.exams.active_exams || 0}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon purple">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="stat-content">
                        <h3>Results</h3>
                        <p class="stat-value">${stats.results.total_results || 0}</p>
                        <p class="stat-detail">Completed: ${stats.results.completed || 0}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">
                        <i class="fas fa-history"></i>
                    </div>
                    <div class="stat-content">
                        <h3>Activities</h3>
                        <p class="stat-value">${stats.activities.length}</p>
                        <p class="stat-detail">Recent activities tracked</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadUsers() {
    const role = document.getElementById('userRoleFilter')?.value || '';
    const tableBody = document.querySelector('#usersTable tbody');
    if (!tableBody) return;
    
    try {
        const response = await apiRequest(`/admin/users${role ? `?role=${role}` : ''}`);
        
        if (response && response.success) {
            const users = response.users || [];
            
            if (users.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No users found.</td></tr>';
                return;
            }
            
            tableBody.innerHTML = users.map(user => {
                const date = new Date(user.created_at);
                return `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td><span class="role-badge ${user.role}">${user.role}</span></td>
                        <td>${formatDate(date)}</td>
                        <td>
                            <button class="btn btn-sm btn-secondary" onclick="editUser(${user.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="error-state">Error loading users.</td></tr>';
    }
}

let currentExamId = null;

async function loadExams() {
    const grid = document.getElementById('examsGrid');
    if (!grid) return;
    
    try {
        const response = await apiRequest('/admin/exams');
        
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
                                ${exam.teacher_name ? `<div class="detail-item"><i class="fas fa-user"></i> ${exam.teacher_name}</div>` : ''}
                            </div>
                        </div>
                        <div class="exam-card-footer">
                            <button class="btn btn-primary" onclick="manageQuestions(${exam.id})">
                                <i class="fas fa-question-circle"></i> Manage Questions
                            </button>
                            <button class="btn btn-secondary" onclick="copyExamLink(${exam.id})">
                                <i class="fas fa-link"></i> Copy Link
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading exams:', error);
        grid.innerHTML = '<div class="error-state">Error loading exams.</div>';
    }
}

async function loadResults() {
    const tableBody = document.querySelector('#resultsTable tbody');
    if (!tableBody) return;
    
    try {
        const response = await apiRequest('/admin/results');
        
        if (response && response.success) {
            const results = response.results || [];
            
            if (results.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No results found.</td></tr>';
                return;
            }
            
            tableBody.innerHTML = results.map(result => {
                const percentage = result.total_marks > 0 
                    ? ((result.score / result.total_marks) * 100).toFixed(2)
                    : '0.00';
                const date = result.end_time ? new Date(result.end_time) : null;
                return `
                    <tr>
                        <td>${result.student_name || 'N/A'}</td>
                        <td>${result.exam_title || 'N/A'}</td>
                        <td>${result.score || 0} / ${result.total_marks || 0}</td>
                        <td>${percentage}%</td>
                        <td><span class="status-badge ${result.status || 'unknown'}">${result.status || 'N/A'}</span></td>
                        <td>${date ? formatDate(date) : 'N/A'}</td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading results:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="error-state">Error loading results.</td></tr>';
    }
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

function showUserModal() {
    document.getElementById('userModal').style.display = 'block';
    document.getElementById('modalTitle').textContent = 'Add User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

async function saveUser(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userId = document.getElementById('userId').value;
    
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };
    
    try {
        if (userId) {
            // Update user (password optional)
            const response = await apiRequest(`/admin/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
            if (response && response.success) {
                alert('User updated successfully');
                closeUserModal();
                loadUsers();
            }
        } else {
            // Create user
            const response = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            if (response && response.success) {
                alert('User created successfully');
                closeUserModal();
                loadUsers();
            }
        }
    } catch (error) {
        console.error('Error saving user:', error);
        alert('Error saving user. Please try again.');
    }
}

async function editUser(userId) {
    try {
        const response = await apiRequest(`/admin/users/${userId}`);
        if (response && response.success) {
            const user = response.user;
            document.getElementById('userId').value = user.id;
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userPassword').required = false;
            document.getElementById('modalTitle').textContent = 'Edit User';
            document.getElementById('userModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading user:', error);
        alert('Error loading user details.');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await apiRequest(`/admin/users/${userId}`, {
            method: 'DELETE'
        });
        if (response && response.success) {
            alert('User deleted successfully');
            loadUsers();
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
    }
}

// Exam Management Functions
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
            response = await apiRequest(`/admin/exams/${examId}`, {
                method: 'PUT',
                body: JSON.stringify(examData)
            });
        } else {
            response = await apiRequest('/admin/exams', {
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
        const response = await apiRequest('/admin/exams');
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
        const response = await apiRequest(`/admin/exams/${examId}`, {
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
        const response = await apiRequest(`/admin/exams/${examId}/questions`);
        
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
            response = await apiRequest(`/admin/questions/${questionId}`, {
                method: 'PUT',
                body: JSON.stringify(questionData)
            });
        } else {
            response = await apiRequest(`/admin/exams/${questionData.exam_id}/questions`, {
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
        const response = await apiRequest(`/admin/exams/${currentExamId}/questions`);
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
        const response = await apiRequest(`/admin/questions/${questionId}`, {
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

function copyExamLink(examId) {
    const baseUrl = window.location.origin;
    const examLink = `${baseUrl}/take/${examId}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(examLink).then(() => {
            alert('Exam link copied to clipboard!\n\n' + examLink);
        }).catch(() => {
            alert('Link: ' + examLink + '\n\n(Please copy manually)');
        });
    } else {
        alert('Link: ' + examLink + '\n\n(Please copy manually)');
    }
}

// Load violations
async function loadViolations() {
    const tableBody = document.querySelector('#violationsTable tbody');
    if (!tableBody) return;
    
    try {
        const response = await apiRequest('/admin/violations');
        
        if (response && response.success) {
            const violations = response.violations || [];
            
            if (violations.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No violations detected. Great!</td></tr>';
                return;
            }
            
            tableBody.innerHTML = violations.map(violation => {
                const timestamp = new Date(violation.timestamp);
                const violationType = violation.violation_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                return `
                    <tr style="${violation.violation_type.includes('disqualified') || violation.violation_type.includes('tab') ? 'background: rgba(239, 68, 68, 0.1);' : ''}">
                        <td>
                            <strong>${violation.student_name || 'N/A'}</strong><br>
                            <small style="color: var(--text-light);">${violation.student_email || 'N/A'}</small>
                        </td>
                        <td>${violation.exam_title || 'N/A'}</td>
                        <td>
                            <span class="status-badge ${getViolationSeverity(violation.violation_type)}" style="text-transform: capitalize;">
                                ${violationType}
                            </span>
                        </td>
                        <td>${formatDateTime(timestamp)}</td>
                        <td>
                            <small style="color: var(--text-light);">
                                ${formatViolationDetails(violation.details)}
                            </small>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-secondary" onclick="viewSessionViolations(${violation.session_id})">
                                <i class="fas fa-eye"></i> View All
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading violations:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="error-state">Error loading violations.</td></tr>';
    }
}

// Load disqualified sessions
async function loadDisqualified() {
    const section = document.getElementById('disqualifiedSection');
    const violationsSection = document.getElementById('violationsSection');
    const tableBody = document.querySelector('#disqualifiedTable tbody');
    
    if (!tableBody) return;
    
    // Toggle visibility
    if (section.style.display === 'none') {
        section.style.display = 'block';
        violationsSection.style.display = 'none';
    } else {
        section.style.display = 'none';
        violationsSection.style.display = 'block';
    }
    
    try {
        const response = await apiRequest('/admin/disqualified');
        
        if (response && response.success) {
            const sessions = response.sessions || [];
            
            if (sessions.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No disqualified sessions.</td></tr>';
                return;
            }
            
            tableBody.innerHTML = sessions.map(session => {
                const date = session.end_time ? new Date(session.end_time) : null;
                return `
                    <tr style="background: rgba(239, 68, 68, 0.1);">
                        <td>
                            <strong>${session.student_name || 'N/A'}</strong><br>
                            <small style="color: var(--text-light);">${session.student_email || 'N/A'}</small>
                        </td>
                        <td>${session.exam_title || 'N/A'}</td>
                        <td>
                            <span style="background: #ef4444; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                ${session.violation_count || 0} Violations
                            </span>
                        </td>
                        <td>${date ? formatDateTime(date) : 'N/A'}</td>
                        <td>
                            <button class="btn btn-sm btn-secondary" onclick="viewSessionViolations(${session.id})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading disqualified:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="error-state">Error loading disqualified sessions.</td></tr>';
    }
}

// View violations for a session
async function viewSessionViolations(sessionId) {
    try {
        const response = await apiRequest(`/admin/violations/session/${sessionId}`);
        
        if (response && response.success) {
            const violations = response.violations || [];
            
            if (violations.length === 0) {
                alert('No violations found for this session.');
                return;
            }
            
            const violationList = violations.map(v => {
                const time = new Date(v.timestamp);
                return `• ${v.violation_type.replace(/_/g, ' ')} at ${formatDateTime(time)}`;
            }).join('\n');
            
            alert(`Violations for this session:\n\n${violationList}\n\nTotal: ${violations.length} violation(s)`);
        }
    } catch (error) {
        console.error('Error loading session violations:', error);
        alert('Error loading violation details.');
    }
}

function getViolationSeverity(type) {
    if (type.includes('disqualified') || type.includes('tab_switch') || type.includes('window')) {
        return 'danger';
    } else if (type.includes('dev_tools') || type.includes('copy') || type.includes('paste')) {
        return 'warning';
    }
    return 'in_progress';
}

function formatViolationDetails(details) {
    if (!details || typeof details !== 'object') return 'N/A';
    
    const parts = [];
    if (details.timestamp) parts.push(`Time: ${new Date(details.timestamp).toLocaleTimeString()}`);
    if (details.duration) parts.push(`Duration: ${Math.round(details.duration / 1000)}s`);
    if (details.time_away) parts.push(`Away: ${Math.round(details.time_away / 1000)}s`);
    
    return parts.join(' | ') || 'No additional details';
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
}

