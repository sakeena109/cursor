// Dashboard JavaScript

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = '/';
        return;
    }
    
    currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = '/';
        return;
    }
    
    // Set user name
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = currentUser.name;
    }
    
    // Load initial data based on role
    if (currentUser.role === 'student') {
        loadStudentDashboard();
    } else {
        // Redirect to appropriate dashboard
        if (currentUser.role === 'admin') {
            window.location.href = '/admin';
        } else if (currentUser.role === 'teacher') {
            window.location.href = '/teacher';
        }
    }
});

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionName);
    if (section) {
        section.classList.add('active');
    }
    
    // Add active to nav link
    const navLink = Array.from(document.querySelectorAll('.nav-link')).find(link => 
        link.getAttribute('onclick').includes(sectionName)
    );
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // Load section data
    if (sectionName === 'exams') {
        loadExams();
    } else if (sectionName === 'results') {
        loadResults();
    } else if (sectionName === 'attendance') {
        loadAttendance();
    } else if (sectionName === 'activities') {
        loadActivities();
    }
}

// Load student dashboard
function loadStudentDashboard() {
    loadExams();
    loadResults();
    loadAttendance();
    loadActivities();
}

// Load exams
async function loadExams() {
    const grid = document.getElementById('examsGrid');
    if (!grid) return;
    
    try {
        const response = await apiRequest('/student/exams');
        
        if (response && response.success) {
            const exams = response.exams || [];
            
            if (exams.length === 0) {
                grid.innerHTML = '<div class="empty-state">No exams available at the moment.</div>';
                return;
            }
            
            grid.innerHTML = exams.map(exam => {
                const startDate = new Date(exam.start_date);
                const endDate = new Date(exam.end_date);
                const now = new Date();
                const isAvailable = now >= startDate && now <= endDate;
                
                return `
                    <div class="exam-card">
                        <div class="exam-card-header">
                            <h3>${exam.title}</h3>
                            <span class="exam-status ${isAvailable ? 'available' : 'upcoming'}">
                                ${isAvailable ? 'Available' : 'Upcoming'}
                            </span>
                        </div>
                        <div class="exam-card-body">
                            <p>${exam.description || 'No description'}</p>
                            <div class="exam-details">
                                <div class="detail-item">
                                    <i class="fas fa-clock"></i>
                                    <span>${exam.duration} minutes</span>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-star"></i>
                                    <span>${exam.total_marks} marks</span>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-user"></i>
                                    <span>${exam.teacher_name || 'N/A'}</span>
                                </div>
                            </div>
                            <div class="exam-dates">
                                <p><strong>Start:</strong> ${formatDate(startDate)}</p>
                                <p><strong>End:</strong> ${formatDate(endDate)}</p>
                            </div>
                        </div>
                        <div class="exam-card-footer">
                            ${isAvailable ? `
                                <button class="btn btn-primary" onclick="startExam(${exam.id})">
                                    <i class="fas fa-play"></i> Start Exam
                                </button>
                            ` : `
                                <button class="btn btn-secondary" disabled>
                                    <i class="fas fa-clock"></i> Not Available Yet
                                </button>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            grid.innerHTML = '<div class="error-state">Error loading exams.</div>';
        }
    } catch (error) {
        console.error('Error loading exams:', error);
        grid.innerHTML = '<div class="error-state">Error loading exams. Please refresh the page.</div>';
    }
}

// Start exam
function startExam(examId) {
    if (confirm('Are you ready to start the exam? Once you start, the timer will begin.')) {
        // Check if user is logged in
        if (isAuthenticated()) {
            window.location.href = `/exam/${examId}`;
        } else {
            // If not logged in, redirect to public access page
            window.location.href = `/take/${examId}`;
        }
    }
}

// Load results
async function loadResults() {
    const tableBody = document.querySelector('#resultsTable tbody');
    if (!tableBody) return;
    
    try {
        const response = await apiRequest('/student/results');
        
        if (response && response.success) {
            const results = response.results || [];
            
            if (results.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No results available.</td></tr>';
                return;
            }
            
            tableBody.innerHTML = results.map(result => {
                const percentage = result.total_marks > 0 
                    ? ((result.score / result.total_marks) * 100).toFixed(2)
                    : '0.00';
                const isPassed = result.score >= result.passing_marks;
                const statusClass = isPassed ? 'passed' : 'failed';
                const date = result.end_time ? new Date(result.end_time) : null;
                
                return `
                    <tr>
                        <td>${result.title || 'N/A'}</td>
                        <td>${result.score || 0} / ${result.total_marks || 0}</td>
                        <td>${percentage}%</td>
                        <td><span class="status-badge ${statusClass}">${result.status || 'N/A'}</span></td>
                        <td>${date ? formatDate(date) : 'N/A'}</td>
                        <td>
                            <button class="btn btn-sm btn-secondary" onclick="viewResult(${result.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            tableBody.innerHTML = '<tr><td colspan="6" class="error-state">Error loading results.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading results:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="error-state">Error loading results.</td></tr>';
    }
}

// View result
function viewResult(sessionId) {
    if (sessionId) {
        window.location.href = `/exam/results/${sessionId}`;
    } else {
        alert('Unable to view result. Session ID not found.');
    }
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

