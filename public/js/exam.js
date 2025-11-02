// Exam Taking JavaScript

let currentExam = null;
let currentSessionId = null;
let currentQuestions = [];
let currentAnswers = {};
let markedForReview = new Set();
let examTimer = null;
let timeRemaining = 0;

// Start exam
async function startExam(examId) {
    try {
        const response = await apiRequest(`/exam/start/${examId}`);
        
        if (response && response.success) {
            currentExam = response.exam;
            currentSessionId = response.sessionId;
            currentQuestions = response.exam.questions || [];
            timeRemaining = currentExam.duration * 60; // Convert to seconds
            
            // Initialize answers object
            currentQuestions.forEach(q => {
                currentAnswers[q.id] = '';
            });
            
            // Initialize anti-cheat
            if (typeof initAntiCheat === 'function') {
                initAntiCheat(currentSessionId);
            }
            
            // Start timer
            startTimer();
            
            // Load exam interface
            loadExamInterface();
            
            // Auto-save interval
            setInterval(() => {
                saveAnswers();
            }, 30000); // Auto-save every 30 seconds
        } else {
            alert('Failed to start exam: ' + (response?.message || 'Unknown error'));
            window.location.href = '/dashboard';
        }
    } catch (error) {
        console.error('Error starting exam:', error);
        alert('Error starting exam. Please try again.');
    }
}

// Load exam interface
function loadExamInterface() {
    const examContainer = document.getElementById('examContainer');
    if (!examContainer) return;
    
    examContainer.innerHTML = `
        <div class="exam-header">
            <div class="exam-info">
                <h2>${currentExam.title}</h2>
                <p>${currentExam.description || ''}</p>
            </div>
            <div class="exam-timer">
                <div class="timer-display" id="timerDisplay">
                    ${formatTime(timeRemaining)}
                </div>
                <div class="timer-warning" id="timerWarning"></div>
            </div>
        </div>
        
        <div class="exam-body">
            <div class="exam-sidebar">
                <div class="question-nav">
                    <h3>Question Navigation</h3>
                    <div class="question-grid" id="questionGrid"></div>
                </div>
                <div class="exam-actions">
                    <button class="btn btn-secondary" onclick="markForReview()">
                        <i class="fas fa-bookmark"></i> Mark for Review
                    </button>
                    <button class="btn btn-primary" onclick="submitExam()">
                        <i class="fas fa-check-circle"></i> Submit Exam
                    </button>
                </div>
            </div>
            
            <div class="exam-content">
                <div class="question-container" id="questionContainer"></div>
            </div>
        </div>
    `;
    
    renderQuestionNav();
    renderQuestion(0);
}

// Render question navigation
function renderQuestionNav() {
    const grid = document.getElementById('questionGrid');
    if (!grid) return;
    
    grid.innerHTML = currentQuestions.map((q, index) => {
        const isAnswered = currentAnswers[q.id] !== '';
        const isReviewed = markedForReview.has(q.id);
        let statusClass = '';
        if (isAnswered && isReviewed) statusClass = 'answered reviewed';
        else if (isAnswered) statusClass = 'answered';
        else if (isReviewed) statusClass = 'review';
        
        return `<button class="question-btn ${statusClass}" onclick="goToQuestion(${index})" data-qid="${q.id}">
            ${index + 1}
        </button>`;
    }).join('');
}

// Render question
function renderQuestion(index) {
    if (index < 0 || index >= currentQuestions.length) return;
    
    const question = currentQuestions[index];
    const container = document.getElementById('questionContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="question-header">
            <span class="question-number">Question ${index + 1} of ${currentQuestions.length}</span>
            <span class="question-marks">${question.marks} Marks</span>
        </div>
        
        <div class="question-text">${question.question_text}</div>
        
        <div class="question-options">
            ${renderOptions(question, index)}
        </div>
        
        <div class="question-navigation">
            <button class="btn btn-secondary" onclick="goToQuestion(${index - 1})" ${index === 0 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Previous
            </button>
            <button class="btn btn-secondary" onclick="goToQuestion(${index + 1})" ${index === currentQuestions.length - 1 ? 'disabled' : ''}>
                Next <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
    
    // Load saved answer
    if (currentAnswers[question.id]) {
        if (question.type === 'mcq' || question.type === 'true_false') {
            const option = document.querySelector(`input[value="${currentAnswers[question.id]}"]`);
            if (option) option.checked = true;
        } else {
            const textarea = document.querySelector('textarea[name="answer"]');
            if (textarea) textarea.value = currentAnswers[question.id];
        }
    }
    
    // Highlight current question in nav
    const navButtons = document.querySelectorAll('.question-btn');
    navButtons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
}

// Render options based on question type
function renderOptions(question, index) {
    if (question.type === 'mcq') {
        return question.options.map((option, optIndex) => `
            <label class="option-label">
                <input type="radio" name="question_${question.id}" value="${option}" 
                       onchange="saveAnswer(${question.id}, '${option}')">
                <span class="option-text">${option}</span>
            </label>
        `).join('');
    } else if (question.type === 'true_false') {
        return question.options.map((option, optIndex) => `
            <label class="option-label">
                <input type="radio" name="question_${question.id}" value="${option}" 
                       onchange="saveAnswer(${question.id}, '${option}')">
                <span class="option-text">${option}</span>
            </label>
        `).join('');
    } else {
        return `
            <textarea name="answer" rows="10" placeholder="Type your answer here..."
                      onchange="saveAnswer(${question.id}, this.value)"></textarea>
        `;
    }
}

// Save answer
async function saveAnswer(questionId, answer) {
    currentAnswers[questionId] = answer;
    
    // Update navigation
    const navBtn = document.querySelector(`.question-btn[data-qid="${questionId}"]`);
    if (navBtn) {
        navBtn.classList.add('answered');
    }
    
    // Submit to server
    try {
        await apiRequest('/exam/submit-answer', {
            method: 'POST',
            body: JSON.stringify({
                session_id: currentSessionId,
                question_id: questionId,
                answer: answer
            })
        });
    } catch (error) {
        console.error('Error saving answer:', error);
    }
}

// Go to question
function goToQuestion(index) {
    if (index < 0 || index >= currentQuestions.length) return;
    renderQuestion(index);
}

// Mark for review
function markForReview() {
    const currentIndex = getCurrentQuestionIndex();
    if (currentIndex === -1) return;
    
    const questionId = currentQuestions[currentIndex].id;
    markedForReview.add(questionId);
    
    const navBtn = document.querySelector(`.question-btn[data-qid="${questionId}"]`);
    if (navBtn) {
        navBtn.classList.add('review');
    }
    
    // Show notification
    showNotification('Question marked for review');
}

// Get current question index
function getCurrentQuestionIndex() {
    const activeBtn = document.querySelector('.question-btn.active');
    if (activeBtn) {
        const qid = parseInt(activeBtn.dataset.qid);
        return currentQuestions.findIndex(q => q.id === qid);
    }
    return 0;
}

// Start timer
function startTimer() {
    examTimer = setInterval(() => {
        timeRemaining--;
        
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(timeRemaining);
            
            // Warning when time is low
            const warning = document.getElementById('timerWarning');
            if (warning) {
                if (timeRemaining <= 300) { // 5 minutes
                    warning.textContent = '⏰ Time is running out!';
                    warning.style.display = 'block';
                    warning.classList.add('critical');
                } else if (timeRemaining <= 600) { // 10 minutes
                    warning.textContent = 'Time remaining: ' + formatTime(timeRemaining);
                    warning.style.display = 'block';
                } else {
                    warning.style.display = 'none';
                }
            }
        }
        
        if (timeRemaining <= 0) {
            clearInterval(examTimer);
            autoSubmitExam();
        }
    }, 1000);
}

// Format time
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Submit exam
async function submitExam() {
    if (!confirm('Are you sure you want to submit the exam? This action cannot be undone.')) {
        return;
    }
    
    if (examTimer) {
        clearInterval(examTimer);
    }
    
    try {
        const response = await apiRequest(`/exam/submit/${currentSessionId}`, {
            method: 'POST'
        });
        
        if (response && response.success) {
            alert(`Exam submitted successfully!\nScore: ${response.score}/${response.total_marks}\nPercentage: ${response.percentage}%`);
            window.location.href = '/dashboard';
        } else {
            alert('Error submitting exam: ' + (response?.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error submitting exam:', error);
        alert('Error submitting exam. Please try again.');
    }
}

// Auto-submit on timeout
function autoSubmitExam() {
    alert('Time is up! Your exam will be submitted automatically.');
    submitExam();
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Make submitExam available globally
window.submitExam = submitExam;

