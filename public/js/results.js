// Results Detail View JavaScript

async function loadResultDetails(sessionId) {
    const container = document.getElementById('resultsContainer');
    if (!container) return;
    
    try {
        const response = await apiRequest(`/exam/results/${sessionId}`);
        
        if (response && response.success) {
            const { session, answers } = response;
            const percentage = session.total_marks > 0 
                ? ((session.score / session.total_marks) * 100).toFixed(2)
                : '0.00';
            const isPassed = session.score >= session.passing_marks;
            
            container.innerHTML = `
                <div class="results-header">
                    <h1><i class="fas fa-chart-bar"></i> Exam Results</h1>
                    <div class="results-summary">
                        <div class="summary-card ${isPassed ? 'passed' : 'failed'}">
                            <div class="summary-icon">
                                <i class="fas fa-${isPassed ? 'check-circle' : 'times-circle'}"></i>
                            </div>
                            <div class="summary-content">
                                <h2>${session.exam_title || 'Exam Results'}</h2>
                                <div class="summary-stats">
                                    <div class="stat-item">
                                        <span class="stat-label">Score</span>
                                        <span class="stat-value">${session.score || 0} / ${session.total_marks || 0}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Percentage</span>
                                        <span class="stat-value">${percentage}%</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Status</span>
                                        <span class="stat-value">
                                            <span class="status-badge ${isPassed ? 'passed' : 'failed'}">
                                                ${isPassed ? 'Passed' : 'Failed'}
                                            </span>
                                        </span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Passing Marks</span>
                                        <span class="stat-value">${session.passing_marks || 0}</span>
                                    </div>
                                </div>
                                <div class="summary-meta">
                                    <p><strong>Started:</strong> ${formatDateTime(session.start_time)}</p>
                                    <p><strong>Submitted:</strong> ${session.end_time ? formatDateTime(session.end_time) : 'N/A'}</p>
                                    ${session.student_name ? `<p><strong>Student:</strong> ${session.student_name}</p>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="results-body">
                    <h2><i class="fas fa-list"></i> Question-wise Answers</h2>
                    <div class="answers-list">
                        ${answers.map((answer, index) => {
                            const isCorrect = answer.is_correct === 1;
                            const questionOptions = answer.options || [];
                            
                            return `
                                <div class="answer-card ${isCorrect ? 'correct' : 'incorrect'}">
                                    <div class="answer-header">
                                        <span class="question-number">Question ${index + 1}</span>
                                        <span class="question-marks">${answer.marks} marks</span>
                                        <span class="answer-status ${isCorrect ? 'correct' : 'incorrect'}">
                                            <i class="fas fa-${isCorrect ? 'check' : 'times'}"></i>
                                            ${isCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                    </div>
                                    <div class="answer-question">
                                        <p><strong>Question:</strong> ${answer.question_text}</p>
                                    </div>
                                    <div class="answer-details">
                                        ${answer.type !== 'descriptive' ? `
                                            <div class="answer-options">
                                                <p><strong>Options:</strong></p>
                                                ${questionOptions.map(opt => {
                                                    const isSelected = answer.answer === opt;
                                                    const isCorrectOption = answer.correct_answer === opt;
                                                    let optionClass = '';
                                                    if (isCorrectOption) optionClass = 'correct-option';
                                                    if (isSelected && !isCorrectOption) optionClass = 'wrong-selected';
                                                    if (isSelected && isCorrectOption) optionClass = 'correct-selected';
                                                    
                                                    return `
                                                        <div class="option-item ${optionClass}">
                                                            ${opt}
                                                            ${isCorrectOption ? '<i class="fas fa-check"></i>' : ''}
                                                            ${isSelected && !isCorrectOption ? '<i class="fas fa-times"></i>' : ''}
                                                        </div>
                                                    `;
                                                }).join('')}
                                            </div>
                                            <div class="answer-info">
                                                <p><strong>Your Answer:</strong> <span class="${isCorrect ? 'correct-text' : 'incorrect-text'}">${answer.answer || 'Not answered'}</span></p>
                                                ${!isCorrect ? `<p><strong>Correct Answer:</strong> <span class="correct-text">${answer.correct_answer || 'N/A'}</span></p>` : ''}
                                            </div>
                                        ` : `
                                            <div class="answer-descriptive">
                                                <p><strong>Your Answer:</strong></p>
                                                <div class="answer-text">${answer.answer || 'No answer provided'}</div>
                                                <p class="grading-note"><i class="fas fa-info-circle"></i> Descriptive questions require manual grading by the teacher.</p>
                                            </div>
                                        `}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="results-footer">
                    <button class="btn btn-primary" onclick="window.location.href='/dashboard'">
                        <i class="fas fa-arrow-left"></i> Back to Dashboard
                    </button>
                    <button class="btn btn-secondary" onclick="window.print()">
                        <i class="fas fa-print"></i> Print Results
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Results Not Found</h2>
                    <p>${response?.message || 'Unable to load results. Please try again.'}</p>
                    <button class="btn btn-primary" onclick="window.location.href='/dashboard'">
                        Back to Dashboard
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading results:', error);
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Error Loading Results</h2>
                <p>An error occurred while loading the results. Please try again.</p>
                <button class="btn btn-primary" onclick="window.location.href='/dashboard'">
                    Back to Dashboard
                </button>
            </div>
        `;
    }
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
}

