// Attendance JavaScript

async function loadAttendance() {
    const tableBody = document.querySelector('#attendanceTable tbody');
    const statsContainer = document.getElementById('attendanceStats');
    
    if (!tableBody) return;
    
    try {
        const response = await apiRequest('/student/attendance');
        
        if (response && response.success) {
            const attendance = response.attendance || [];
            const percentage = response.percentage || 0;
            
            // Display stats
            if (statsContainer) {
                statsContainer.innerHTML = `
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-percentage"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Attendance Percentage</h3>
                            <p class="stat-value ${percentage >= 75 ? 'good' : percentage >= 50 ? 'warning' : 'poor'}">${percentage}%</p>
                        </div>
                    </div>
                `;
            }
            
            if (attendance.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="3" class="empty-state">No attendance records available.</td></tr>';
                return;
            }
            
            tableBody.innerHTML = attendance.map(record => {
                const statusClass = record.status === 'present' ? 'present' : record.status === 'late' ? 'late' : 'absent';
                const date = new Date(record.date);
                
                return `
                    <tr>
                        <td>${formatDate(date)}</td>
                        <td>${record.course_name || 'N/A'}</td>
                        <td><span class="status-badge ${statusClass}">${record.status}</span></td>
                    </tr>
                `;
            }).join('');
        } else {
            tableBody.innerHTML = '<tr><td colspan="3" class="error-state">Error loading attendance.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
        tableBody.innerHTML = '<tr><td colspan="3" class="error-state">Error loading attendance.</td></tr>';
    }
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

