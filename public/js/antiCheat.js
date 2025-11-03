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
    
    // Prevent page reload/close
    window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = 'You are currently taking an exam. Are you sure you want to leave? This will be recorded as a violation.';
        logViolation('page_unload_attempt', { timestamp: new Date().toISOString() });
        return e.returnValue;
    });
    
    // Prevent leaving page
    window.addEventListener('unload', () => {
        if (sessionId) {
            // Mark session as disqualified if leaving
            fetch('/api/exam/disqualify-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ session_id: sessionId, reason: 'Page closed/unloaded' })
            }).catch(() => {});
        }
    });
    
    // Disable right-click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        logViolation('right_click', { timestamp: new Date().toISOString() });
        showWarning('Right-click is disabled during exam');
        violationCount++;
        if (violationCount >= MAX_VIOLATIONS) {
            disqualifyStudent('Too many violations detected');
        }
        return false;
    });
    
    // Disable text selection
    document.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
    });
    
    // Disable drag
    document.addEventListener('dragstart', (e) => {
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
    
    // Tab/window focus detection - STRICT MODE
    let lastFocusTime = Date.now();
    let focusCheckInterval;
    let tabSwitchCount = 0;
    let blurTime = null;
    
    const checkFocus = () => {
        if (!document.hasFocus()) {
            if (!blurTime) {
                blurTime = Date.now();
                logViolation('tab_switch', { 
                    timestamp: new Date().toISOString(),
                    duration: Date.now() - lastFocusTime
                });
                tabSwitchCount++;
                showWarning(`⚠️ WARNING ${tabSwitchCount}: You switched tabs! This is being monitored. Return immediately or risk disqualification.`);
                
                violationCount++;
                
                // Auto-disqualify after 3 tab switches
                if (tabSwitchCount >= MAX_VIOLATIONS) {
                    disqualifyStudent(`Disqualified: ${tabSwitchCount} tab switches detected`);
                }
            }
        } else {
            if (blurTime) {
                const timeAway = Date.now() - blurTime;
                logViolation('tab_return', {
                    timestamp: new Date().toISOString(),
                    time_away: timeAway
                });
                blurTime = null;
            }
            lastFocusTime = Date.now();
        }
    };
    
    // Check every 500ms for faster detection
    focusCheckInterval = setInterval(checkFocus, 500);
    
    // Visibility change detection
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            logViolation('window_minimized', { timestamp: new Date().toISOString() });
            showWarning('⚠️ WARNING: Window was minimized or tab was switched!');
            violationCount++;
            tabSwitchCount++;
            if (violationCount >= MAX_VIOLATIONS || tabSwitchCount >= MAX_VIOLATIONS) {
                disqualifyStudent('Exceeded maximum violations - window minimized/tab switched');
            }
        } else {
            logViolation('window_restored', { timestamp: new Date().toISOString() });
        }
    });
    
    // Blur event (when window loses focus)
    window.addEventListener('blur', () => {
        logViolation('window_blur', { timestamp: new Date().toISOString() });
        violationCount++;
        tabSwitchCount++;
        if (tabSwitchCount >= MAX_VIOLATIONS) {
            disqualifyStudent('Too many focus losses detected');
        }
    });
    
    // Focus event
    window.addEventListener('focus', () => {
        if (blurTime) {
            const timeAway = Date.now() - blurTime;
            logViolation('window_focus', {
                timestamp: new Date().toISOString(),
                time_away: timeAway
            });
            blurTime = null;
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
async function disqualifyStudent(reason) {
    clearInterval(window.antiCheatInterval);
    
    // Log disqualification to server
    if (sessionId) {
        try {
            await fetch('/api/exam/disqualify-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    reason: reason
                })
            });
        } catch (error) {
            console.error('Error reporting disqualification:', error);
        }
    }
    
    // Show disqualification message - BLOCKING
    const modal = document.createElement('div');
    modal.className = 'disqualification-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = `
        <div class="modal-content" style="background: white; padding: 40px; border-radius: 15px; text-align: center; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
            <div style="font-size: 60px; color: #ef4444; margin-bottom: 20px;">⚠️</div>
            <h2 style="color: #ef4444; margin-bottom: 20px; font-size: 28px;">Exam Disqualified</h2>
            <p style="font-size: 18px; margin-bottom: 15px; color: #1f2937;"><strong>Reason:</strong> ${reason}</p>
            <p style="font-size: 16px; margin-bottom: 30px; color: #6b7280;">Your exam has been automatically submitted due to multiple violations.</p>
            <p style="font-size: 14px; margin-bottom: 30px; color: #ef4444; font-weight: 600;">All violations have been logged and reported to your administrator.</p>
            <button onclick="window.location.href='/dashboard'" style="padding: 15px 30px; background: #667eea; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer;">Return to Dashboard</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Prevent any interaction
    document.body.style.pointerEvents = 'none';
    modal.style.pointerEvents = 'auto';
    
    // Auto-submit exam
    if (sessionId && window.submitExam) {
        setTimeout(() => {
            window.submitExam(sessionId);
        }, 2000);
    }
    
    // Remove beforeunload listener to allow navigation
    window.removeEventListener('beforeunload', () => {});
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.antiCheatInterval) {
        clearInterval(window.antiCheatInterval);
    }
});

