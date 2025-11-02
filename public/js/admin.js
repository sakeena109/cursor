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

async function loadExams() {
    const tableBody = document.querySelector('#examsTable tbody');
    if (!tableBody) return;
    
    try {
        const response = await apiRequest('/admin/exams');
        
        if (response && response.success) {
            const exams = response.exams || [];
            
            if (exams.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No exams found.</td></tr>';
                return;
            }
            
            tableBody.innerHTML = exams.map(exam => {
                const startDate = new Date(exam.start_date);
                const endDate = new Date(exam.end_date);
                return `
                    <tr>
                        <td>${exam.title}</td>
                        <td>${exam.teacher_name || 'N/A'}</td>
                        <td>${exam.duration} min</td>
                        <td>${exam.total_marks}</td>
                        <td>${formatDate(startDate)}</td>
                        <td>${formatDate(endDate)}</td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading exams:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="error-state">Error loading exams.</td></tr>';
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

