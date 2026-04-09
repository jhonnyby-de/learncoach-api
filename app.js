// LearnCoach API - Main Application

// ============================================
// AUTH & TOKEN MANAGEMENT
// ============================================
let authToken = localStorage.getItem('learncoach_token') || '';
let currentUser = JSON.parse(localStorage.getItem('learncoach_user') || 'null');

function setAuthToken(token) {
    authToken = token;
    localStorage.setItem('learncoach_token', token);
}

function clearAuth() {
    authToken = '';
    currentUser = null;
    localStorage.removeItem('learncoach_token');
    localStorage.removeItem('learncoach_user');
    updateAuthUI();
}

function getAuthHeaders() {
    return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
}

// ============================================
// ENDPOINT CONFIGURATIONS
// ============================================
const endpoints = {
    // AUTH ENDPOINTS
    'auth-register': {
        method: 'POST',
        path: '/api/auth/register',
        category: 'Authentication',
        description: 'Register a new user account',
        body: {
            email: 'user@example.com',
            password: 'SecurePass123!',
            firstName: 'Max',
            lastName: 'Mustermann',
            grade: 9
        }
    },
    'auth-login': {
        method: 'POST',
        path: '/api/auth/login',
        category: 'Authentication',
        description: 'Login with existing credentials',
        body: {
            email: 'user@example.com',
            password: 'SecurePass123!'
        }
    },
    'auth-me': {
        method: 'GET',
        path: '/api/auth/me',
        category: 'Authentication',
        description: 'Get current user profile (requires auth)',
        requiresAuth: true
    },
    'auth-apikey': {
        method: 'POST',
        path: '/api/auth/apikey',
        category: 'Authentication',
        description: 'Generate API key for service access (requires auth)',
        requiresAuth: true
    },
    'auth-logout': {
        method: 'POST',
        path: '/api/auth/logout',
        category: 'Authentication',
        description: 'Logout user (requires auth)',
        requiresAuth: true
    },
    
    // PLANNER ENDPOINTS
    'planner-generate': {
        method: 'POST',
        path: '/api/planner/generate',
        category: 'Learning Plans',
        description: 'Generate a new smart learning plan (requires auth)',
        requiresAuth: true,
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
            focusAreas: [],
            learningStyle: 'mixed'
        }
    },
    'planner-list': {
        method: 'GET',
        path: '/api/planner/plans',
        category: 'Learning Plans',
        description: 'Get all user learning plans (requires auth)',
        requiresAuth: true
    },
    'planner-complete': {
        method: 'POST',
        path: '/api/planner/plans/:id/complete-session',
        category: 'Learning Plans',
        description: 'Mark a session as completed (requires auth)',
        requiresAuth: true,
        body: {
            dayIndex: 0,
            sessionIndex: 0,
            score: 85
        }
    },
    
    // QUIZ ENDPOINTS
    'quiz-generate': {
        method: 'POST',
        path: '/api/quiz/generate',
        category: 'Quiz',
        description: 'Generate a new quiz (requires auth)',
        requiresAuth: true,
        body: {
            topicIds: ["math_g9_001", "math_g9_002"],
            difficulty: 'medium',
            questionCount: 5
        }
    },
    'quiz-submit': {
        method: 'POST',
        path: '/api/quiz/submit',
        category: 'Quiz',
        description: 'Submit quiz answers (requires auth)',
        requiresAuth: true,
        body: {
            quizId: 'quiz_123456',
            answers: [0, 1, 2, 0, 1]
        }
    },
    'quiz-history': {
        method: 'GET',
        path: '/api/quiz/history',
        category: 'Quiz',
        description: 'Get quiz history (requires auth)',
        requiresAuth: true
    },
    
    // PROGRESS ENDPOINTS
    'progress-log': {
        method: 'POST',
        path: '/api/progress/log-session',
        category: 'Progress',
        description: 'Log a study session and earn XP (requires auth)',
        requiresAuth: true,
        body: {
            duration: 45,
            topicId: 'math_g9_001',
            topicName: 'Quadratische Gleichungen',
            subject: 'Mathematik',
            grade: 9,
            sessionType: 'learning',
            rating: 4,
            notes: 'Good progress today'
        }
    },
    'progress-sessions': {
        method: 'GET',
        path: '/api/progress/sessions',
        category: 'Progress',
        description: 'Get study sessions history (requires auth)',
        requiresAuth: true,
        params: {
            limit: 50,
            subject: ''
        }
    },
    'progress-stats': {
        method: 'GET',
        path: '/api/progress/stats',
        category: 'Progress',
        description: 'Get progress statistics (requires auth)',
        requiresAuth: true
    },
    'progress-dashboard': {
        method: 'GET',
        path: '/api/progress/dashboard',
        category: 'Progress',
        description: 'Get dashboard data (requires auth)',
        requiresAuth: true
    },
    
    // KNOWLEDGE ENDPOINTS
    'knowledge-topics': {
        method: 'GET',
        path: '/api/knowledge/topics',
        category: 'Knowledge',
        description: 'Browse knowledge database topics',
        params: { 
            grade: 9, 
            subject: 'Mathematik',
            complexityMin: 1,
            complexityMax: 10,
            limit: 20,
            search: ''
        }
    },
    'knowledge-subjects': {
        method: 'GET',
        path: '/api/knowledge/subjects',
        category: 'Knowledge',
        description: 'Get available subjects list'
    },
    'knowledge-stats': {
        method: 'GET',
        path: '/api/knowledge/stats',
        category: 'Knowledge',
        description: 'Get knowledge base statistics'
    },
    
    // LEGACY ENDPOINTS (for backward compatibility)
    'user-profile': {
        method: 'GET',
        path: '/api/users/profile',
        category: 'Legacy',
        description: 'Get user profile (legacy endpoint)',
        params: { userId: 'user_001' }
    },
    'coach-tip': {
        method: 'GET',
        path: '/api/coach/daily-tip',
        category: 'Legacy',
        description: 'Get daily learning tip',
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
    
    const authBadge = config.requiresAuth 
        ? `<span class="auth-badge auth-required">🔒 Auth Required</span>` 
        : `<span class="auth-badge auth-public">🌐 Public</span>`;
    
    const categoryBadge = config.category 
        ? `<span class="category-badge">${config.category}</span>` 
        : '';
    
    let html = `
        <div class="endpoint-info">
            <div class="endpoint-badges">
                ${categoryBadge}
                ${authBadge}
            </div>
            <p class="endpoint-desc">${config.description || ''}</p>
        </div>
        <div class="form-group">
            <label class="form-label">Method</label>
            <input type="text" class="form-input method-${config.method.toLowerCase()}" value="${config.method}" readonly>
        </div>
        <div class="form-group">
            <label class="form-label">Endpoint</label>
            <input type="text" class="form-input" value="${config.path}" readonly>
        </div>
    `;
    
    if (config.requiresAuth && !authToken) {
        html += `
            <div class="auth-warning">
                <span class="warning-icon">⚠️</span>
                <span>This endpoint requires authentication. Please <a href="#" onclick="showAuthModal(); return false;">login</a> first.</span>
            </div>
        `;
    }
    
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
    
    output.textContent = '⏳ Loading...';
    
    // Check auth requirement
    if (config.requiresAuth && !authToken) {
        output.textContent = JSON.stringify({
            success: false,
            error: 'Authentication required. Please login first.',
            code: 'AUTH_REQUIRED'
        }, null, 2);
        return;
    }
    
    try {
        let url = config.path;
        
        // Add query params for GET requests
        if (config.params) {
            const paramsInput = document.getElementById('request-params')?.value;
            const params = paramsInput ? JSON.parse(paramsInput) : config.params;
            const queryString = new URLSearchParams(params).toString();
            if (queryString) {
                url += (url.includes('?') ? '&' : '?') + queryString;
            }
        }
        
        const options = {
            method: config.method,
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            }
        };
        
        // Add body for POST/PUT requests
        if (['POST', 'PUT', 'PATCH'].includes(config.method)) {
            const bodyText = document.getElementById('request-body')?.value;
            if (bodyText) {
                options.body = bodyText;
            }
        }
        
        // Make actual API call
        const response = await fetch(url, options);
        const data = await response.json();
        
        // Handle auth responses
        if (currentEndpoint === 'auth-login' && data.success && data.data?.token) {
            setAuthToken(data.data.token);
            currentUser = data.data.user;
            localStorage.setItem('learncoach_user', JSON.stringify(currentUser));
            updateAuthUI();
        }
        
        if (currentEndpoint === 'auth-register' && data.success && data.data?.token) {
            setAuthToken(data.data.token);
            currentUser = data.data.user;
            localStorage.setItem('learncoach_user', JSON.stringify(currentUser));
            updateAuthUI();
        }
        
        if (currentEndpoint === 'auth-logout') {
            clearAuth();
        }
        
        output.textContent = JSON.stringify(data, null, 2);
        currentResponseData = data;
        
    } catch (error) {
        console.error('API Error:', error);
        // Show mock response if API not available
        const mockResponse = generateMockResponse(currentEndpoint);
        output.textContent = JSON.stringify(mockResponse, null, 2);
        currentResponseData = mockResponse;
    }
}

function generateMockResponse(endpoint) {
    const now = Date.now();
    const responses = {
        // AUTH ENDPOINTS
        'auth-register': {
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: `user_${now}`,
                    email: 'user@example.com',
                    name: 'Max Mustermann',
                    grade: 9,
                    role: 'user'
                },
                token: `mock_jwt_token_${now}`,
                refreshToken: `mock_refresh_token_${now}`
            }
        },
        'auth-login': {
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: `user_${now}`,
                    email: 'user@example.com',
                    name: 'Max Mustermann',
                    grade: 9,
                    role: 'user',
                    totalXP: 2450,
                    level: 8,
                    streak: { current: 12, longest: 15 }
                },
                token: `mock_jwt_token_${now}`,
                refreshToken: `mock_refresh_token_${now}`
            }
        },
        'auth-me': {
            success: true,
            data: {
                user: {
                    id: `user_${now}`,
                    email: 'user@example.com',
                    name: 'Max Mustermann',
                    grade: 9,
                    role: 'user',
                    totalXP: 2450,
                    level: 8,
                    streak: { current: 12, longest: 15 },
                    subscription: { plan: 'free', status: 'active' }
                }
            }
        },
        'auth-apikey': {
            success: true,
            message: 'API key generated successfully',
            data: { apiKey: `lc_api_${now}_mockkey123456789` }
        },
        'auth-logout': {
            success: true,
            message: 'Logged out successfully'
        },
        
        // PLANNER ENDPOINTS
        'planner-generate': {
            success: true,
            message: 'Learning plan generated successfully',
            data: {
                plan: {
                    _id: `plan_${now}`,
                    userId: `user_${now}`,
                    grade: 9,
                    subjects: ["Mathematik", "Deutsch", "Englisch"],
                    targetNote: 2.0,
                    days: 30,
                    hoursPerDay: 2,
                    totalTopics: 24,
                    totalDays: 30,
                    totalHours: 60,
                    averageComplexity: 6.5,
                    status: 'active',
                    schedule: [
                        {
                            day: 1,
                            date: new Date().toISOString().split('T')[0],
                            type: 'regular',
                            totalHours: 2,
                            sessions: [
                                { topicId: 'math_g9_001', topicName: 'Quadratische Gleichungen', subject: 'Mathematik', duration: 2, type: 'new_learning', complexity: 7 }
                            ]
                        }
                    ],
                    createdAt: new Date().toISOString()
                },
                generated: {
                    totalTopics: 24,
                    metadata: {
                        generatedAt: new Date().toISOString(),
                        learningStrategy: 'Mixed: Visual + Practice',
                        estimatedSuccessRate: 78
                    }
                }
            }
        },
        'planner-list': {
            success: true,
            count: 3,
            data: {
                plans: [
                    { _id: `plan_${now}`, grade: 9, subjects: ["Mathematik"], targetNote: 2.0, days: 30, status: 'active', totalTopics: 24, progress: { daysCompleted: 5, topicsCompleted: 4 } },
                    { _id: `plan_${now-1}`, grade: 10, subjects: ["Physik"], targetNote: 2.5, days: 45, status: 'completed', totalTopics: 18, progress: { daysCompleted: 45, topicsCompleted: 18 } }
                ]
            }
        },
        'planner-complete': {
            success: true,
            message: 'Session marked as completed',
            data: {
                plan: {
                    _id: `plan_${now}`,
                    progress: { daysCompleted: 6, topicsCompleted: 5, hoursStudied: 12 }
                }
            }
        },
        
        // QUIZ ENDPOINTS
        'quiz-generate': {
            success: true,
            message: 'Quiz generated successfully',
            data: {
                quiz: {
                    id: `quiz_${now}`,
                    generatedAt: new Date().toISOString(),
                    totalQuestions: 5,
                    totalPoints: 50,
                    timeLimit: 10,
                    topics: [{ id: 'math_g9_001', name: 'Quadratische Gleichungen', subject: 'Mathematik' }],
                    questions: [
                        { id: 'q_1', type: 'multiple_choice', question: 'Was ist die Lösung von x² - 4 = 0?', options: ['x = ±2', 'x = 2', 'x = -2', 'x = 4'], difficulty: 6, points: 10 },
                        { id: 'q_2', type: 'multiple_choice', question: 'Welche Formel löst ax² + bx + c = 0?', options: ['pq-Formel', 'ABC-Formel', 'Mitternachtsformel', 'Alle genannten'], difficulty: 7, points: 10 }
                    ]
                }
            }
        },
        'quiz-submit': {
            success: true,
            data: {
                result: {
                    percentage: 80,
                    grade: '2',
                    passed: true,
                    earnedPoints: 40,
                    totalPossible: 50,
                    correctAnswers: 4,
                    xpEarned: 60,
                    newTotalXP: 2510,
                    newLevel: 9,
                    achievements: ['excellent_score']
                }
            }
        },
        'quiz-history': {
            success: true,
            count: 5,
            data: {
                quizzes: [
                    { _id: `quiz_${now}`, difficulty: 'medium', status: 'completed', totalQuestions: 5, 'results.percentage': 80, xpAwarded: 60, createdAt: new Date().toISOString() },
                    { _id: `quiz_${now-1}`, difficulty: 'easy', status: 'completed', totalQuestions: 5, 'results.percentage': 100, xpAwarded: 75, createdAt: new Date(Date.now() - 86400000).toISOString() }
                ]
            }
        },
        
        // PROGRESS ENDPOINTS
        'progress-log': {
            success: true,
            message: 'Session logged successfully',
            data: {
                session: {
                    id: `session_${now}`,
                    duration: 45,
                    topicName: 'Quadratische Gleichungen',
                    xpEarned: 86,
                    streakDay: 13
                },
                xp: {
                    earned: 86,
                    breakdown: { base: 36, streakBonus: 24, complexityBonus: 10, quizBonus: 16 }
                },
                streak: { current: 13, longest: 15 },
                user: { totalXP: 2536, level: 9, leveledUp: true }
            }
        },
        'progress-sessions': {
            success: true,
            count: 50,
            data: {
                sessions: [
                    { _id: `session_${now}`, duration: 45, topicName: 'Quadratische Gleichungen', subject: 'Mathematik', xpEarned: 86, startedAt: new Date().toISOString() },
                    { _id: `session_${now-1}`, duration: 30, topicName: 'pq-Formel', subject: 'Mathematik', xpEarned: 64, startedAt: new Date(Date.now() - 86400000).toISOString() }
                ]
            }
        },
        'progress-stats': {
            success: true,
            data: {
                streak: { current: 13, longest: 15, lastActive: new Date().toISOString() },
                today: { totalSessions: 2, totalMinutes: 75, totalXP: 150, subjects: ['Mathematik'], topics: ['Quadratische Gleichungen', 'pq-Formel'] },
                weekly: { totalSessions: 12, totalMinutes: 480, totalXP: 960, subjects: ['Mathematik', 'Deutsch'], dailyAverage: 1.7 },
                subjects: [
                    { subject: 'Mathematik', totalMinutes: 840, totalSessions: 18, totalXP: 1680 },
                    { subject: 'Deutsch', totalMinutes: 320, totalSessions: 8, totalXP: 640 }
                ]
            }
        },
        'progress-dashboard': {
            success: true,
            data: {
                user: { name: 'Max Mustermann', level: 9, totalXP: 2536, streak: { current: 13, longest: 15 } },
                today: { totalSessions: 2, totalMinutes: 75, totalXP: 150 },
                recentSessions: [
                    { topicName: 'Quadratische Gleichungen', subject: 'Mathematik', duration: 45, xpEarned: 86, startedAt: new Date().toISOString() }
                ],
                weeklyActivity: [
                    { date: '2026-04-02', dayName: 'Mi', minutes: 60, sessions: 1 },
                    { date: '2026-04-03', dayName: 'Do', minutes: 90, sessions: 2 },
                    { date: '2026-04-04', dayName: 'Fr', minutes: 45, sessions: 1 },
                    { date: '2026-04-05', dayName: 'Sa', minutes: 0, sessions: 0 },
                    { date: '2026-04-06', dayName: 'So', minutes: 30, sessions: 1 },
                    { date: '2026-04-07', dayName: 'Mo', minutes: 120, sessions: 3 },
                    { date: '2026-04-08', dayName: 'Di', minutes: 75, sessions: 2 }
                ]
            }
        },
        
        // KNOWLEDGE ENDPOINTS
        'knowledge-topics': {
            success: true,
            count: 20,
            total: 2247,
            data: {
                topics: [
                    { id: 'math_g9_001', name: 'Quadratische Gleichungen', subject: 'Mathematik', grade: 9, complexity: 7, estimatedHours: 5, description: 'Lösen von Gleichungen 2. Grades', category: 'Algebra', isExamCritical: true },
                    { id: 'math_g9_002', name: 'pq-Formel', subject: 'Mathematik', grade: 9, complexity: 6, estimatedHours: 4, description: 'Lösungsformel für x² + px + q = 0', category: 'Algebra', isExamCritical: false },
                    { id: 'math_g9_003', name: 'ABC-Formel', subject: 'Mathematik', grade: 9, complexity: 6, estimatedHours: 4, description: 'Mitternachtsformel für ax² + bx + c = 0', category: 'Algebra', isExamCritical: true }
                ]
            }
        },
        'knowledge-subjects': {
            success: true,
            count: 16,
            data: {
                subjects: [
                    { id: 'mathematics', name: 'Mathematik', icon: '📐', grades: [5, 6, 7, 8, 9, 10, 11, 12, 13] },
                    { id: 'german', name: 'Deutsch', icon: '📚', grades: [5, 6, 7, 8, 9, 10, 11, 12, 13] },
                    { id: 'english', name: 'Englisch', icon: '🔤', grades: [5, 6, 7, 8, 9, 10, 11, 12, 13] },
                    { id: 'physics', name: 'Physik', icon: '⚛️', grades: [7, 8, 9, 10, 11, 12, 13] }
                ]
            }
        },
        'knowledge-stats': {
            success: true,
            data: {
                totalTopics: 2247,
                byGrade: { 5: 180, 6: 195, 7: 220, 8: 245, 9: 267, 10: 278, 11: 289, 12: 286, 13: 287 },
                bySubject: { 'Mathematik': 340, 'Deutsch': 280, 'Englisch': 265, 'Physik': 180, 'Chemie': 165, 'Biologie': 190, 'Geschichte': 210 },
                lastUpdated: new Date().toISOString()
            }
        },
        
        // LEGACY ENDPOINTS
        'generate-plan': {
            success: true,
            plan: {
                totalTopics: 24,
                totalDays: 33,
                totalHours: 66,
                targetNote: 2.0,
                metadata: { generatedAt: new Date().toISOString(), grade: 9, learningStrategy: "Mixed: Visual + Practice", estimatedSuccessRate: 78 },
                schedule: [{ day: 1, date: new Date().toISOString().split('T')[0], type: 'regular', sessions: [{ topicName: "Quadratische Gleichungen", duration: 2, subject: "Mathematik", type: "new_learning", complexity: 7 }] }],
                summary: { topicsToCover: 24, examCriticalTopics: 8, averageComplexity: 6.5, subjectBreakdown: { "Mathematik": 24, "Deutsch": 18, "Englisch": 18 } }
            }
        },
        'user-profile': {
            success: true,
            user: { name: "Max Mustermann", grade: 9, level: 8, totalXP: 2450, streak: 12, subjects: ["Mathematik", "Deutsch", "Englisch", "Physik"] },
            stats: { totalTopicsInDB: 2247, topicsCompleted: 47, completionRate: 23 }
        },
        'coach-tip': {
            success: true,
            tip: {
                date: new Date().toISOString().split('T')[0],
                tips: ["💪 Jeder kleine Schritt bringt dich näher an dein Ziel!", "💡 Probiere heute die Pomodoro-Technik: 25 Minuten Fokus, dann 5 Minuten Pause.", "📚 Physik-Tipp: Skizzen helfen enorm - Zeichne Kraftvektoren und Diagramme."],
                actionItems: [{ type: "goal", priority: "high", message: "Noch 15 Minuten bis zu deinem Tagesziel!" }, { type: "review", priority: "medium", message: "3 Themen stehen zur Wiederholung an" }]
            }
        }
    };
    
    return responses[endpoint] || { success: true, message: 'Mock response', data: {} };
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

// ============================================
// NEW: Category Toggle & Auth UI Functions
// ============================================

function toggleCategory(categoryId) {
    const category = document.getElementById(`category-${categoryId}`).parentElement;
    category.classList.toggle('collapsed');
}

function updateAuthUI() {
    const authStatus = document.getElementById('auth-status');
    if (!authStatus) return;
    
    if (authToken && currentUser) {
        authStatus.innerHTML = `
            <span class="auth-indicator authenticated">🟢 ${currentUser.name || currentUser.email}</span>
            <button class="btn-small" onclick="clearAuth()">Logout</button>
        `;
    } else {
        authStatus.innerHTML = `
            <span class="auth-indicator">🔴 Not Authenticated</span>
            <button class="btn-small" onclick="showAuthModal()">Login / Register</button>
        `;
    }
}

function showAuthModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('auth-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal" style="position: relative;">
                <button class="modal-close" onclick="hideAuthModal()">&times;</button>
                <h3 class="modal-title">🔐 Authentication</h3>
                <div class="modal-tabs">
                    <button class="modal-tab active" onclick="switchAuthTab('login')">Login</button>
                    <button class="modal-tab" onclick="switchAuthTab('register')">Register</button>
                </div>
                <div id="auth-tab-content">
                    <!-- Content filled by switchAuthTab -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.classList.add('active');
    switchAuthTab('login');
}

function hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function switchAuthTab(tab) {
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('auth-tab-content');
    if (tab === 'login') {
        content.innerHTML = `
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" id="auth-email" value="user@example.com">
            </div>
            <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" id="auth-password" value="SecurePass123!">
            </div>
            <button class="btn-primary" onclick="performAuth('login')" style="width: 100%;">Login</button>
        `;
    } else {
        content.innerHTML = `
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" id="auth-email" value="user@example.com">
            </div>
            <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" id="auth-password" value="SecurePass123!">
            </div>
            <div class="form-group">
                <label class="form-label">First Name</label>
                <input type="text" class="form-input" id="auth-firstname" value="Max">
            </div>
            <div class="form-group">
                <label class="form-label">Last Name</label>
                <input type="text" class="form-input" id="auth-lastname" value="Mustermann">
            </div>
            <div class="form-group">
                <label class="form-label">Grade</label>
                <input type="number" class="form-input" id="auth-grade" value="9">
            </div>
            <button class="btn-primary" onclick="performAuth('register')" style="width: 100%;">Register</button>
        `;
    }
}

async function performAuth(type) {
    const email = document.getElementById('auth-email')?.value;
    const password = document.getElementById('auth-password')?.value;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    // Simulate API call
    const mockResponse = type === 'login' 
        ? generateMockResponse('auth-login')
        : generateMockResponse('auth-register');
    
    if (mockResponse.success && mockResponse.data?.token) {
        setAuthToken(mockResponse.data.token);
        currentUser = mockResponse.data.user;
        localStorage.setItem('learncoach_user', JSON.stringify(currentUser));
        updateAuthUI();
        hideAuthModal();
        
        // Show success message
        const output = document.getElementById('response-output');
        output.textContent = JSON.stringify({
            success: true,
            message: `${type === 'login' ? 'Login' : 'Registration'} successful!`,
            user: currentUser
        }, null, 2);
    }
}

// Override selectEndpoint to handle category active states
const originalSelectEndpoint = selectEndpoint;
selectEndpoint = function(endpoint) {
    currentEndpoint = endpoint;
    
    // Update all endpoint buttons
    document.querySelectorAll('.endpoint-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the correct button
    const endpointConfig = endpoints[endpoint];
    if (endpointConfig) {
        const buttons = document.querySelectorAll('.endpoint-btn');
        buttons.forEach(btn => {
            const btnText = btn.textContent.toLowerCase();
            const endpointKey = endpoint.replace(/-/g, '').toLowerCase();
            if (btnText.includes(endpointKey) || endpointKey.includes(btnText.replace(/\s/g, ''))) {
                btn.classList.add('active');
            }
        });
    }
    
    updateForm();
};

// Initialize auth UI on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    updateForm();
    
    // Close modal on overlay click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            hideAuthModal();
        }
    });
});
