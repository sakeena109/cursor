// Anti-Cheating System JavaScript

let violationCount = 0;
let sessionId = null;
const MAX_VIOLATIONS = 3;
let isFullScreen = false;
let warnings = 0;

// Initialize anti-cheat system
function initAntiCheat(examSessionId) {
    sessionId = examSessionId;
    violationCount = 0;
    warnings = 0;
    
    // Disable right-click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        logViolation('right_click', { timestamp: new Date().toISOString() });
        showWarning('Right-click is disabled during exam');
        return false;
    });
    
    // Disable text selection
    document.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
    });
    
    // Disable copy, paste, cut
    document.addEventListener('copy', (e) => {
        e.preventDefault();
        logViolation('copy', { timestamp: new Date().toISOString() });
        showWarning('Copying is not allowed during exam');
        return false;
    });
    
    document.addEventListener('paste', (e) => {
        e.preventDefault();
        logViolation('paste', { timestamp: new Date().toISOString() });
        showWarning('Pasting is not allowed during exam');
        return false;
    });
    
    document.addEventListener('cut', (e) => {
        e.preventDefault();
        logViolation('cut', { timestamp: new Date().toISOString() });
        showWarning('Cutting is not allowed during exam');
        return false;
    });
    
    // Detect developer tools (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            logViolation('dev_tools_f12', { timestamp: new Date().toISOString() });
            showWarning('Developer tools are not allowed during exam');
            return false;
        }
        
        // Ctrl+Shift+I or Ctrl+Shift+J
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) {
            e.preventDefault();
            logViolation('dev_tools_shortcut', { timestamp: new Date().toISOString() });
            showWarning('Developer tools are not allowed during exam');
            return false;
        }
        
        // Ctrl+U (View source)
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
            logViolation('view_source', { timestamp: new Date().toISOString() });
            showWarning('Viewing page source is not allowed during exam');
            return false;
        }
        
        // Print Screen
        if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p')) {
            e.preventDefault();
            logViolation('print_screen', { timestamp: new Date().toISOString() });
            showWarning('Screenshots are not allowed during exam');
            return false;
        }
    });
    
    // Tab/window focus detection
    let lastFocusTime = Date.now();
    let focusCheckInterval;
    
    const checkFocus = () => {
        if (!document.hasFocus()) {
            logViolation('tab_switch', { 
                timestamp: new Date().toISOString(),
                duration: Date.now() - lastFocusTime
            });
            showWarning('You have switched tabs or minimized the window. This is not allowed.');
            
            violationCount++;
            if (violationCount >= MAX_VIOLATIONS) {
                disqualifyStudent('Exceeded maximum tab switch violations');
            }
        }
        lastFocusTime = Date.now();
    };
    
    focusCheckInterval = setInterval(checkFocus, 1000);
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            logViolation('window_minimized', { timestamp: new Date().toISOString() });
            showWarning('Window was minimized. Please return to the exam.');
            violationCount++;
            if (violationCount >= MAX_VIOLATIONS) {
                disqualifyStudent('Exceeded maximum window violations');
            }
        }
    });
    
    // Request fullscreen
    requestFullscreen();
    
    // Detect fullscreen exit
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
            logViolation('fullscreen_exit', { timestamp: new Date().toISOString() });
            showWarning('Fullscreen mode is required. Please return to fullscreen.');
            requestFullscreen();
        }
    });
    
    // Store interval for cleanup
    window.antiCheatInterval = focusCheckInterval;
}

// Request fullscreen
function requestFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {
            showWarning('Please enable fullscreen mode manually for best experience.');
        });
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    }
}

// Log violation to server
async function logViolation(type, details = {}) {
    if (!sessionId) return;
    
    try {
        await fetch('/api/exam/log-violation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                session_id: sessionId,
                violation_type: type,
                details: details
            })
        });
    } catch (error) {
        console.error('Error logging violation:', error);
    }
}

// Show warning to user
function showWarning(message) {
    warnings++;
    const warningDiv = document.getElementById('warningMessage') || createWarningDiv();
    warningDiv.textContent = `⚠️ Warning ${warnings}: ${message}`;
    warningDiv.style.display = 'block';
    warningDiv.classList.add('show');
    
    setTimeout(() => {
        warningDiv.classList.remove('show');
        setTimeout(() => {
            warningDiv.style.display = 'none';
        }, 300);
    }, 5000);
}

// Create warning div if it doesn't exist
function createWarningDiv() {
    const div = document.createElement('div');
    div.id = 'warningMessage';
    div.className = 'warning-message';
    document.body.appendChild(div);
    return div;
}

// Disqualify student
function disqualifyStudent(reason) {
    clearInterval(window.antiCheatInterval);
    
    // Show disqualification message
    const modal = document.createElement('div');
    modal.className = 'disqualification-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>⚠️ Exam Disqualified</h2>
            <p>${reason}</p>
            <p>Your exam has been automatically submitted due to violations.</p>
            <button onclick="window.location.href='/dashboard'">Return to Dashboard</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Auto-submit exam
    if (sessionId && window.submitExam) {
        window.submitExam(sessionId);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.antiCheatInterval) {
        clearInterval(window.antiCheatInterval);
    }
});

