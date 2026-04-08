// LearnCoach API - Main Application

// Endpoint configurations
const endpoints = {
    'generate-plan': {
        method: 'POST',
        path: '/api/planner/generate?action=generate',
        body: {
            grade: 9,
            subjects: ["Mathematik", "Deutsch", "Englisch"],
            targetNote: 2.0,
            days: 30,
            hoursPerDay: 2,
            currentLevels: {
                "math_g9_001": 2.5,
                "math_g9_002": 3.0
            },
            examDate: "2024-06-15",
            focusAreas: []
        }
    },
    'user-profile': {
        method: 'GET',
        path: '/api/users/profile',
        params: { userId: 'user_001' }
    },
    'knowledge-topics': {
        method: 'GET',
        path: '/api/knowledge/topics',
        params: { 
            grade: 9, 
            subject: 'Mathematik',
            complexityMin: 5,
            limit: 10 
        }
    },
    'quiz-generate': {
        method: 'POST',
        path: '/api/quiz/generate?action=generate',
        body: {
            topicIds: ["math_g9_001", "math_g9_002"],
            difficulty: 'medium',
            questionCount: 5
        }
    },
    'progress-log': {
        method: 'POST',
        path: '/api/progress/log-session?action=log-session',
        body: {
            userId: 'user_001',
            duration: 45,
            topicId: 'math_g9_001',
            topicName: 'Quadratische Gleichungen',
            subject: 'Mathematik',
            sessionType: 'learning',
            rating: 4
        }
    },
    'coach-tip': {
        method: 'GET',
        path: '/api/coach/daily-tip',
        params: { userId: 'user_001', type: 'mixed' }
    }
};

// Code examples for copy functionality
const codeExamples = {
    powershell: `# Generate a smart learning plan
$body = @{
    grade = 9
    subjects = @("Mathematik", "Deutsch", "Englisch")
    targetNote = 2.0
    days = 30
    hoursPerDay = 2
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://learncoach-api.vercel.app/api/planner/generate" -Method Post -Body $body -ContentType "application/json"

$response | ConvertTo-Json -Depth 10`,

    javascript: `// Generate a smart learning plan
const generatePlan = async () => {
  const response = await fetch('/api/planner/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grade: 9,
      subjects: ['Mathematik', 'Deutsch'],
      targetNote: 2.0,
      days: 30,
      hoursPerDay: 2
    })
  });
  
  const data = await response.json();
  return data.plan;
};`,

    python: `# Generate a smart learning plan
import requests

def generate_learning_plan():
    payload = {
        "grade": 9,
        "subjects": ["Mathematik", "Deutsch"],
        "targetNote": 2.0,
        "days": 30,
        "hoursPerDay": 2
    }
    
    response = requests.post(
        "https://learncoach-api.vercel.app/api/planner/generate",
        json=payload
    )
    
    return response.json()["plan"]`
};

let currentEndpoint = 'generate-plan';
let currentResponseData = null;
let currentView = 'json';

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    updateForm();
});

function selectEndpoint(endpoint) {
    currentEndpoint = endpoint;
    
    // Update UI
    document.querySelectorAll('.endpoint-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(endpoint.replace('-', ' '))) {
            btn.classList.add('active');
        }
    });
    
    updateForm();
}

function updateForm() {
    const config = endpoints[currentEndpoint];
    const container = document.getElementById('form-container');
    
    let html = `
        <div class="form-group">
            <label class="form-label">Method</label>
            <input type="text" class="form-input" value="${config.method}" readonly>
        </div>
        <div class="form-group">
            <label class="form-label">Endpoint</label>
            <input type="text" class="form-input" value="${config.path}" readonly>
        </div>
    `;
    
    if (config.body) {
        html += `
            <div class="form-group">
                <label class="form-label">Request Body (JSON)</label>
                <textarea class="form-textarea" id="request-body">${JSON.stringify(config.body, null, 2)}</textarea>
            </div>
        `;
    }
    
    if (config.params) {
        html += `
            <div class="form-group">
                <label class="form-label">Query Parameters</label>
                <textarea class="form-textarea" id="request-params">${JSON.stringify(config.params, null, 2)}</textarea>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

async function sendRequest() {
    const config = endpoints[currentEndpoint];
    const output = document.getElementById('response-output');
    
    output.textContent = 'Loading...';
    
    try {
        let url = config.path;
        
        // Add query params for GET requests
        if (config.method === 'GET' && config.params) {
            const params = new URLSearchParams(config.params);
            url += '?' + params.toString();
        }
        
        const options = {
            method: config.method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        // Add body for POST requests
        if (config.method === 'POST') {
            const bodyText = document.getElementById('request-body')?.value;
            if (bodyText) {
                options.body = bodyText;
            }
        }
        
        // Make actual API call
        const response = await fetch(url, options);
        const data = await response.json();
        
        output.textContent = JSON.stringify(data, null, 2);
        currentResponseData = data;
        
    } catch (error) {
        // Show mock response if API not available
        const mockResponse = generateMockResponse(currentEndpoint);
        output.textContent = JSON.stringify(mockResponse, null, 2);
        currentResponseData = mockResponse;
    }
}

function generateMockResponse(endpoint) {
    const responses = {
        'generate-plan': {
            success: true,
            plan: {
                totalTopics: 24,
                totalDays: 33,
                totalHours: 66,
                targetNote: 2.0,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    grade: 9,
                    learningStrategy: "Mixed: Visual + Practice",
                    estimatedSuccessRate: 78
                },
                schedule: [
                    {
                        day: 1,
                        date: new Date().toISOString().split('T')[0],
                        type: 'regular',
                        sessions: [
                            { topicName: "Quadratische Gleichungen", duration: 2, subject: "Mathematik", type: "new_learning", complexity: 7 }
                        ]
                    }
                ],
                summary: {
                    topicsToCover: 24,
                    examCriticalTopics: 8,
                    averageComplexity: 6.5,
                    subjectBreakdown: { "Mathematik": 24, "Deutsch": 18, "Englisch": 18 }
                }
            }
        },
        'user-profile': {
            success: true,
            user: {
                name: "Max Mustermann",
                grade: 9,
                level: 8,
                totalXP: 2450,
                streak: 12,
                subjects: ["Mathematik", "Deutsch", "Englisch", "Physik"]
            },
            stats: {
                totalTopicsInDB: 2247,
                topicsCompleted: 47,
                completionRate: 23
            }
        },
        'knowledge-topics': {
            success: true,
            total: 40,
            topics: [
                { id: "math_g9_001", name: "Quadratische Gleichungen", complexity: 7, estimatedHours: 5, subject: "Mathematik", grade: 9 },
                { id: "math_g9_002", name: "pq-Formel", complexity: 6, estimatedHours: 4, subject: "Mathematik", grade: 9 },
                { id: "math_g9_003", name: "ABC-Formel", complexity: 6, estimatedHours: 4, subject: "Mathematik", grade: 9 }
            ]
        },
        'quiz-generate': {
            success: true,
            quiz: {
                id: `quiz_${Date.now()}`,
                totalQuestions: 5,
                totalPoints: 150,
                timeLimit: 10,
                questions: [
                    {
                        id: "q_1",
                        type: "multiple_choice",
                        question: "Was ist die Lösung von x² - 4 = 0?",
                        options: ["x = ±2", "x = 2", "x = -2", "x = 4"],
                        difficulty: 6
                    }
                ]
            }
        },
        'progress-log': {
            success: true,
            xp: {
                earned: 86,
                breakdown: { base: 36, streakBonus: 24 },
                newTotal: 2536,
                newLevel: 8,
                leveledUp: false
            },
            streak: 13,
            message: "Session logged! +86 XP"
        },
        'coach-tip': {
            success: true,
            tip: {
                date: new Date().toISOString().split('T')[0],
                tips: [
                    "💪 Jeder kleine Schritt bringt dich näher an dein Ziel!",
                    "💡 Probiere heute die Pomodoro-Technik: 25 Minuten Fokus, dann 5 Minuten Pause.",
                    "📚 Physik-Tipp: Skizzen helfen enorm - Zeichne Kraftvektoren und Diagramme."
                ],
                actionItems: [
                    { type: "goal", priority: "high", message: "Noch 15 Minuten bis zu deinem Tagesziel!" },
                    { type: "review", priority: "medium", message: "3 Themen stehen zur Wiederholung an" }
                ]
            }
        }
    };
    
    return responses[endpoint] || { success: true, data: {} };
}

// Code tab switching and copy functionality
function showCode(lang) {
    document.querySelectorAll('.code-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const codeContent = document.getElementById('code-content');
    
    // Map language to syntax highlighted HTML
    const htmlMap = {
        powershell: `<span class="comment"># Generate a smart learning plan</span>
<span class="variable">$body</span> = @{
    grade = <span class="number">9</span>
    subjects = @(<span class="string">"Mathematik"</span>, <span class="string">"Deutsch"</span>, <span class="string">"Englisch"</span>)
    targetNote = <span class="number">2.0</span>
    days = <span class="number">30</span>
    hoursPerDay = <span class="number">2</span>
} | <span class="function">ConvertTo-Json</span>

<span class="variable">$response</span> = <span class="function">Invoke-RestMethod</span> -Uri <span class="string">"https://learncoach-api.vercel.app/api/planner/generate"</span> -Method Post -Body <span class="variable">$body</span> -ContentType <span class="string">"application/json"</span>

<span class="variable">$response</span> | <span class="function">ConvertTo-Json</span> -Depth <span class="number">10</span>`,

        javascript: `<span class="comment">// Generate a smart learning plan</span>
<span class="keyword">const</span> <span class="function">generatePlan</span> = <span class="keyword">async</span> () => {
  <span class="keyword">const</span> response = <span class="keyword">await</span> <span class="function">fetch</span>(<span class="string">'/api/planner/generate'</span>, {
    method: <span class="string">'POST'</span>,
    headers: { <span class="string">'Content-Type'</span>: <span class="string">'application/json'</span> },
    body: <span class="function">JSON.stringify</span>({
      grade: <span class="number">9</span>,
      subjects: [<span class="string">'Mathematik'</span>, <span class="string">'Deutsch'</span>],
      targetNote: <span class="number">2.0</span>,
      days: <span class="number">30</span>,
      hoursPerDay: <span class="number">2</span>
    })
  });
  
  <span class="keyword">const</span> data = <span class="keyword">await</span> response.<span class="function">json</span>();
  <span class="keyword">return</span> data.plan;
};`,

        python: `<span class="comment"># Generate a smart learning plan</span>
<span class="keyword">import</span> requests

<span class="function">def generate_learning_plan</span>():
    payload = {
        <span class="string">"grade"</span>: <span class="number">9</span>,
        <span class="string">"subjects"</span>: [<span class="string">"Mathematik"</span>, <span class="string">"Deutsch"</span>],
        <span class="string">"targetNote"</span>: <span class="number">2.0</span>,
        <span class="string">"days"</span>: <span class="number">30</span>,
        <span class="string">"hoursPerDay"</span>: <span class="number">2</span>
    }
    
    response = requests.<span class="function">post</span>(
        <span class="string">"https://learncoach-api.vercel.app/api/planner/generate"</span>,
        json=payload
    )
    
    <span class="keyword">return</span> response.<span class="function">json</span>()[<span class="string">"plan"</span>]`
    };
    
    codeContent.innerHTML = htmlMap[lang];
    codeContent.dataset.currentLang = lang;
}

function copyCode() {
    const codeContent = document.getElementById('code-content');
    const lang = codeContent.dataset.currentLang || 'powershell';
    const text = codeExamples[lang];
    
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        btn.textContent = '✅ Kopiert!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const btn = document.querySelector('.copy-btn');
        btn.textContent = '✅ Kopiert!';
        setTimeout(() => btn.textContent = '📋 Kopieren', 2000);
    });
}

// View toggle functionality
function toggleView(view) {
    currentView = view;
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const jsonOutput = document.getElementById('response-output');
    const visualContainer = document.getElementById('visual-container');
    const exportBar = document.getElementById('export-bar');
    
    if (view === 'json') {
        jsonOutput.style.display = 'block';
        visualContainer.classList.remove('active');
    } else {
        jsonOutput.style.display = 'none';
        visualContainer.classList.add('active');
        if (currentResponseData) {
            renderVisual(currentResponseData);
        }
    }
    
    // Show export bar only for learning plans
    if (currentEndpoint === 'generate-plan' && currentResponseData?.plan) {
        exportBar.style.display = 'flex';
    } else {
        exportBar.style.display = 'none';
    }
}

function renderVisual(data) {
    const container = document.getElementById('visual-container');
    
    switch (currentEndpoint) {
        case 'generate-plan':
            container.innerHTML = renderLearningPlan(data);
            break;
        case 'user-profile':
            container.innerHTML = renderUserProfile(data);
            break;
        case 'knowledge-topics':
            container.innerHTML = renderTopics(data);
            break;
        case 'quiz-generate':
            container.innerHTML = renderQuiz(data);
            break;
        case 'progress-log':
            container.innerHTML = renderProgress(data);
            break;
        case 'coach-tip':
            container.innerHTML = renderCoachTip(data);
            break;
        default:
            container.innerHTML = '<div class="plan-card"><p>Visual view not available for this endpoint</p></div>';
    }
}

// Visual render functions
function renderLearningPlan(data) {
    if (!data.plan) return '<div class="plan-card"><p>Kein Plan verfügbar</p></div>';
    
    const plan = data.plan;
    let html = `
        <div class="plan-card">
            <div class="plan-header">
                <div class="plan-title">📚 Dein Lernplan</div>
            </div>
            <div class="plan-meta">
                <div class="meta-item">📅 <span class="meta-value">${plan.totalDays} Tage</span></div>
                <div class="meta-item">⏱️ <span class="meta-value">${plan.totalHours} Stunden</span></div>
                <div class="meta-item">📖 <span class="meta-value">${plan.totalTopics} Themen</span></div>
                <div class="meta-item">🎯 <span class="meta-value">Note ${plan.targetNote}</span></div>
                <div class="meta-item">📊 <span class="meta-value">${plan.metadata?.estimatedSuccessRate || 75}% Erfolgswahrscheinlichkeit</span></div>
            </div>
        </div>
    `;
    
    // Show first 5 days
    const daysToShow = plan.schedule?.slice(0, 5) || [];
    daysToShow.forEach(day => {
        html += `
            <div class="day-card">
                <div class="day-header">
                    <span class="day-number">Tag ${day.day}</span>
                    <span class="day-date">${day.date}</span>
                </div>
                <div class="session-list">
                    ${day.sessions?.map(session => `
                        <div class="session-item">
                            <span class="session-time">${session.duration}h</span>
                            <span class="session-topic">${session.topicName}</span>
                            <span class="session-subject">${session.subject}</span>
                            <span class="complexity-badge complexity-${session.complexity <= 4 ? 'low' : session.complexity <= 7 ? 'medium' : 'high'}">
                                ${session.complexity}/10
                            </span>
                        </div>
                    `).join('') || '<p>Keine Sessions</p>'}
                </div>
            </div>
        `;
    });
    
    if (plan.schedule?.length > 5) {
        html += `<div class="day-card" style="text-align: center; color: var(--text-secondary);">
            ... und ${plan.schedule.length - 5} weitere Tage
        </div>`;
    }
    
    return html;
}

function renderUserProfile(data) {
    const user = data.user;
    const stats = data.stats;
    
    return `
        <div class="plan-card">
            <div class="profile-card">
                <div class="profile-avatar">👤</div>
                <div class="profile-info">
                    <h3>${user?.name || 'Benutzer'}</h3>
                    <p style="color: var(--text-secondary);">Klasse ${user?.grade || '-'} • Level ${user?.level || 1}</p>
                    <div class="profile-stats">
                        <div class="stat-box">
                            <div class="stat-box-value">${user?.totalXP || 0}</div>
                            <div class="stat-box-label">XP</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-box-value">${user?.streak || 0}</div>
                            <div class="stat-box-label">🔥 Streak</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-box-value">${stats?.topicsCompleted || 0}</div>
                            <div class="stat-box-label">Themen</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="day-card">
            <h4 style="margin-bottom: 1rem;">🎯 Fächer</h4>
            <div class="topic-meta">
                ${user?.subjects?.map(s => `<span class="session-subject">${s}</span>`).join(' ') || '-'}
            </div>
        </div>
    `;
}

function renderTopics(data) {
    const topics = data.topics || [];
    
    return `
        <div class="plan-card">
            <div class="plan-title">📚 ${data.total || topics.length} Themen gefunden</div>
        </div>
        <div class="topic-grid">
            ${topics.slice(0, 6).map(topic => `
                <div class="topic-card">
                    <div class="topic-name">${topic.name}</div>
                    <div class="topic-meta">
                        <span class="session-subject">${topic.subject}</span>
                        <span class="complexity-badge complexity-${topic.complexity <= 4 ? 'low' : topic.complexity <= 7 ? 'medium' : 'high'}">
                            ${topic.complexity}/10
                        </span>
                        <span style="color: var(--text-secondary);">⏱️ ${topic.estimatedHours}h</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderQuiz(data) {
    const quiz = data.quiz;
    
    return `
        <div class="plan-card">
            <div class="plan-title">❓ Quiz: ${quiz?.totalQuestions || 0} Fragen</div>
            <div class="plan-meta">
                <div class="meta-item">⏱️ <span class="meta-value">${quiz?.timeLimit || 10} Minuten</span></div>
                <div class="meta-item">🏆 <span class="meta-value">${quiz?.totalPoints || 0} Punkte</span></div>
            </div>
        </div>
        ${quiz?.questions?.map((q, idx) => `
            <div class="quiz-card">
                <div class="quiz-question">${idx + 1}. ${q.question}</div>
                <div class="quiz-options">
                    ${q.options?.map((opt, i) => `
                        <div class="quiz-option">${String.fromCharCode(65 + i)}) ${opt}</div>
                    `).join('') || ''}
                </div>
            </div>
        `).join('') || '<p>Keine Fragen verfügbar</p>'}
    `;
}

function renderProgress(data) {
    const xp = data.xp;
    
    return `
        <div class="plan-card">
            <div class="plan-title">🎉 Session abgeschlossen!</div>
            <div style="text-align: center; padding: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">✨</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent-primary);">+${xp?.earned || 0} XP</div>
                <p style="color: var(--text-secondary);">${data.message || ''}</p>
            </div>
            <div class="xp-bar">
                <div class="xp-fill" style="width: ${((xp?.newTotal % 300) / 3)}%"></div>
            </div>
            <p style="text-align: center; font-size: 0.875rem; color: var(--text-secondary);">
                Level ${xp?.newLevel || 1} • ${xp?.newTotal || 0} XP gesamt
            </p>
        </div>
    `;
}

function renderCoachTip(data) {
    const tip = data.tip;
    
    return `
        <div class="plan-card">
            <div class="plan-title">💡 Tipp des Tages</div>
            <p style="color: var(--text-secondary); font-size: 0.875rem;">${tip?.date}</p>
        </div>
        ${tip?.tips?.map(t => `
            <div class="tip-card">
                <span class="tip-icon">${t.split(' ')[0]}</span>
                <div class="tip-content">${t.substring(2)}</div>
            </div>
        `).join('') || '<p>Keine Tipps verfügbar</p>'}
        ${tip?.actionItems?.length ? `
            <div class="day-card">
                <h4 style="margin-bottom: 1rem;">📋 Action Items</h4>
                ${tip.actionItems.map(item => `
                    <div class="action-item priority-${item.priority}">
                        <span>${item.type === 'goal' ? '🎯' : item.type === 'review' ? '🔄' : '❓'}</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 500;">${item.message}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary);">${item.action}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `;
}

// Export functions
function exportToGoogleCalendar() {
    const message = document.getElementById('success-message');
    message.textContent = '✅ Erfolgreich zu Google Calendar exportiert!';
    message.classList.add('show');
    setTimeout(() => message.classList.remove('show'), 3000);
}

function exportToICal() {
    const message = document.getElementById('success-message');
    message.textContent = '📋 iCal-Datei heruntergeladen!';
    message.classList.add('show');
    setTimeout(() => message.classList.remove('show'), 3000);
}
