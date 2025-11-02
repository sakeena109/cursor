// Activities JavaScript

async function loadActivities() {
    const container = document.getElementById('activitiesContainer');
    if (!container) return;
    
    try {
        const response = await apiRequest('/student/activities?limit=50');
        
        if (response && response.success) {
            const activities = response.activities || [];
            
            if (activities.length === 0) {
                container.innerHTML = '<div class="empty-state">No activities recorded.</div>';
                return;
            }
            
            container.innerHTML = `
                <div class="activities-timeline">
                    ${activities.map(activity => {
                        const timestamp = new Date(activity.timestamp);
                        const icon = getActivityIcon(activity.activity_type);
                        
                        return `
                            <div class="activity-item">
                                <div class="activity-icon ${getActivityClass(activity.activity_type)}">
                                    <i class="fas fa-${icon}"></i>
                                </div>
                                <div class="activity-content">
                                    <h4>${activity.description || activity.activity_type}</h4>
                                    <p class="activity-time">${formatDateTime(timestamp)}</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<div class="error-state">Error loading activities.</div>';
        }
    } catch (error) {
        console.error('Error loading activities:', error);
        container.innerHTML = '<div class="error-state">Error loading activities.</div>';
    }
}

function getActivityIcon(type) {
    const icons = {
        'login': 'sign-in-alt',
        'logout': 'sign-out-alt',
        'exam_started': 'play',
        'exam_completed': 'check-circle',
        'page_visit': 'mouse-pointer',
        'user_created': 'user-plus',
        'user_updated': 'user-edit',
        'user_deleted': 'user-minus',
        'exam_created': 'file-alt'
    };
    return icons[type] || 'circle';
}

function getActivityClass(type) {
    const classes = {
        'login': 'success',
        'logout': 'info',
        'exam_started': 'primary',
        'exam_completed': 'success',
        'page_visit': 'secondary',
        'user_created': 'success',
        'user_updated': 'warning',
        'user_deleted': 'danger',
        'exam_created': 'primary'
    };
    return classes[type] || 'secondary';
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

