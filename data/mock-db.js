// ============================================
// LEARNCOACH API - MOCK DATABASE
// Users, Progress, XP, Achievements, Sessions
// ============================================

class MockDatabase {
  constructor() {
    this.users = new Map();
    this.progress = new Map();
    this.sessions = new Map();
    this.achievements = new Map();
    this.leaderboard = [];
    this.xpLog = new Map();
    this.quizResults = new Map();
    
    this.initializeMockData();
  }

  initializeMockData() {
    // Create sample user
    const sampleUser = {
      id: 'user_001',
      name: 'Max Mustermann',
      grade: 9,
      schoolType: 'Gymnasium',
      targetGrade: 2.0, // German grading: 1-6, 1 is best
      subjects: ['Mathematik', 'Deutsch', 'Englisch', 'Physik', 'Chemie', 'Geschichte'],
      learningStyle: 'visual', // visual, auditory, kinesthetic, reading/writing
      dailyGoalMinutes: 60,
      streak: 12,
      totalXP: 2450,
      level: 8,
      joinDate: '2024-09-01',
      lastActive: new Date().toISOString(),
      preferences: {
        notificationEnabled: true,
        darkMode: true,
        soundEffects: false,
        pomodoroDuration: 25,
        breakDuration: 5
      },
      skillLevels: {
        'math_g7_010': 2.5,
        'math_g7_015': 3.0,
        'math_g8_005': 2.0,
        'german_g9_012': 2.0,
        'english_g8_020': 2.5,
        'physics_g9_008': 3.5,
        'chemistry_g8_015': 4.0,
        'history_g9_010': 2.5
      },
      completedTopics: ['math_g5_001', 'math_g5_002', 'german_g5_001', 'english_g5_001'],
      weakTopics: ['math_g7_015', 'physics_g9_008', 'chemistry_g8_015'],
      strongTopics: ['math_g8_005', 'german_g9_012']
    };

    this.users.set(sampleUser.id, sampleUser);
    this.progress.set(sampleUser.id, this.generateProgressData(sampleUser));
    this.achievements.set(sampleUser.id, this.generateAchievements());
    this.xpLog.set(sampleUser.id, this.generateXPLog());
    this.quizResults.set(sampleUser.id, []);
    
    // Generate leaderboard
    this.generateLeaderboard();
  }

  generateProgressData(user) {
    const progress = {
      userId: user.id,
      totalStudyHours: 127.5,
      totalSessions: 89,
      topicsCompleted: user.completedTopics.length,
      topicsInProgress: user.weakTopics.length,
      averageSessionDuration: 32,
      weeklyStats: this.generateWeeklyStats(),
      monthlyStats: this.generateMonthlyStats(),
      subjectProgress: this.generateSubjectProgress(user),
      studyStreak: {
        current: user.streak,
        longest: 21,
        lastStudyDate: new Date().toISOString().split('T')[0]
      },
      upcomingReviews: this.generateUpcomingReviews(user),
      milestones: [
        { name: 'Erste 10 Stunden', completed: true, date: '2024-09-15' },
        { name: '50 Themen abgeschlossen', completed: false, progress: 65 },
        { name: '7-Tage Streak', completed: true, date: '2024-10-01' },
        { name: '14-Tage Streak', completed: true, date: '2024-10-15' }
      ]
    };
    
    return progress;
  }

  generateWeeklyStats() {
    const stats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      stats.push({
        date: date.toISOString().split('T')[0],
        dayName: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][date.getDay()],
        minutes: Math.floor(Math.random() * 90) + 30,
        sessions: Math.floor(Math.random() * 4) + 1,
        xp: Math.floor(Math.random() * 150) + 50
      });
    }
    return stats;
  }

  generateMonthlyStats() {
    const stats = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      stats.push({
        month: date.toLocaleString('de-DE', { month: 'short' }),
        hours: Math.floor(Math.random() * 20) + 5,
        topicsCompleted: Math.floor(Math.random() * 8) + 2,
        xp: Math.floor(Math.random() * 500) + 200
      });
    }
    return stats;
  }

  generateSubjectProgress(user) {
    const subjects = {};
    for (const subject of user.subjects) {
      const progress = Math.random() * 40 + 30; // 30-70%
      subjects[subject] = {
        totalTopics: subject === 'Mathematik' ? 320 : 250,
        completedTopics: Math.floor(progress * 3),
        masteryPercentage: Math.round(progress),
        averageScore: (Math.random() * 2 + 2).toFixed(1), // 2.0-4.0
        timeSpent: Math.floor(Math.random() * 50) + 10,
        lastStudied: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    }
    return subjects;
  }

  generateUpcomingReviews(user) {
    return user.weakTopics.map((topicId, index) => ({
      topicId,
      dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: index < 2 ? 'high' : 'medium',
      lastReviewed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  generateAchievements() {
    return [
      { id: 'first_session', name: 'Erste Session', description: 'Erste Lerneinheit abgeschlossen', unlocked: true, date: '2024-09-01', icon: '🎯' },
      { id: 'streak_7', name: '7-Tage Streak', description: '7 Tage am Stück gelernt', unlocked: true, date: '2024-10-01', icon: '🔥' },
      { id: 'streak_14', name: '14-Tage Streak', description: '14 Tage am Stück gelernt', unlocked: true, date: '2024-10-15', icon: '🔥🔥' },
      { id: 'xp_1000', name: 'XP Sammler', description: '1000 XP erreicht', unlocked: true, date: '2024-10-10', icon: '💎' },
      { id: 'xp_2500', name: 'XP Meister', description: '2500 XP erreicht', unlocked: false, progress: 98, icon: '👑' },
      { id: 'math_master', name: 'Mathe-Genie', description: '50 Mathe-Themen gemeistert', unlocked: false, progress: 45, icon: '🧮' },
      { id: 'night_owl', name: 'Nachteule', description: '10 Sessions nach 22 Uhr', unlocked: true, date: '2024-11-01', icon: '🦉' },
      { id: 'early_bird', name: 'Früher Vogel', description: '10 Sessions vor 8 Uhr', unlocked: false, progress: 60, icon: '🐦' },
      { id: 'perfect_score', name: 'Perfekte Note', description: 'Ein Quiz mit 100% bestanden', unlocked: true, date: '2024-10-20', icon: '💯' },
      { id: 'quiz_master', name: 'Quiz-Meister', description: '50 Quizzes absolviert', unlocked: false, progress: 34, icon: '🏆' }
    ];
  }

  generateXPLog() {
    const actions = [
      { action: 'Session completed', xp: 50 },
      { action: 'Quiz passed', xp: 30 },
      { action: 'Topic mastered', xp: 100 },
      { action: 'Streak maintained', xp: 20 },
      { action: 'Daily goal reached', xp: 25 },
      { action: 'Flashcard review', xp: 10 },
      { action: 'Practice exercises', xp: 15 }
    ];

    const log = [];
    for (let i = 0; i < 20; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      log.push({
        date: date.toISOString(),
        action: action.action,
        xp: action.xp,
        topicId: `math_g${Math.floor(Math.random() * 5 + 5)}_${Math.floor(Math.random() * 20 + 1).toString().padStart(3, '0')}`
      });
    }
    
    return log.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  generateLeaderboard() {
    const names = ['Lisa Schmidt', 'Tom Müller', 'Anna Weber', 'Felix Klein', 'Sophie Bauer', 'Lucas Mayer', 'Emma Schulz', 'Jonas Hoffmann'];
    this.leaderboard = names.map((name, index) => ({
      rank: index + 1,
      name,
      level: 10 - index,
      xp: 3000 - (index * 250),
      streak: 15 - index,
      subjects: Math.floor(Math.random() * 4) + 2
    }));
  }

  // API Methods
  getUser(userId) {
    return this.users.get(userId);
  }

  updateUser(userId, updates) {
    const user = this.users.get(userId);
    if (!user) return null;
    
    Object.assign(user, updates);
    user.lastActive = new Date().toISOString();
    return user;
  }

  getProgress(userId) {
    return this.progress.get(userId);
  }

  logSession(userId, sessionData) {
    const session = {
      id: `session_${Date.now()}`,
      userId,
      ...sessionData,
      date: new Date().toISOString()
    };
    
    this.sessions.set(session.id, session);
    
    // Update user XP and stats
    const user = this.users.get(userId);
    if (user) {
      user.totalXP += sessionData.xpEarned || 0;
      user.level = Math.floor(user.totalXP / 300) + 1;
      
      // Update streak
      const today = new Date().toISOString().split('T')[0];
      const lastActive = user.lastActive.split('T')[0];
      
      if (today !== lastActive) {
        const lastDate = new Date(lastActive);
        const todayDate = new Date(today);
        const diffDays = (todayDate - lastDate) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          user.streak++;
        } else if (diffDays > 1) {
          user.streak = 1;
        }
      }
      
      user.lastActive = new Date().toISOString();
    }
    
    return session;
  }

  addXP(userId, amount, action) {
    const user = this.users.get(userId);
    if (!user) return null;
    
    user.totalXP += amount;
    
    const log = this.xpLog.get(userId) || [];
    log.unshift({
      date: new Date().toISOString(),
      action,
      xp: amount
    });
    this.xpLog.set(userId, log);
    
    // Check for level up
    const newLevel = Math.floor(user.totalXP / 300) + 1;
    const leveledUp = newLevel > user.level;
    user.level = newLevel;
    
    return { newTotal: user.totalXP, newLevel, leveledUp };
  }

  getLeaderboard(limit = 10) {
    return this.leaderboard.slice(0, limit);
  }

  getAchievements(userId) {
    return this.achievements.get(userId) || [];
  }

  unlockAchievement(userId, achievementId) {
    const achievements = this.achievements.get(userId);
    if (!achievements) return null;
    
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.date = new Date().toISOString().split('T')[0];
      return achievement;
    }
    
    return null;
  }

  saveQuizResult(userId, quizResult) {
    const results = this.quizResults.get(userId) || [];
    results.push({
      ...quizResult,
      date: new Date().toISOString(),
      id: `quiz_${Date.now()}`
    });
    this.quizResults.set(userId, results);
    return results[results.length - 1];
  }

  getQuizResults(userId) {
    return this.quizResults.get(userId) || [];
  }

  getWeeklyReport(userId) {
    const progress = this.progress.get(userId);
    if (!progress) return null;

    const thisWeek = progress.weeklyStats.reduce((sum, day) => sum + day.minutes, 0);
    const lastWeek = thisWeek * (0.8 + Math.random() * 0.4); // Simulate previous week
    
    return {
      weekNumber: this.getWeekNumber(new Date()),
      totalMinutes: thisWeek,
      comparisonToLastWeek: ((thisWeek - lastWeek) / lastWeek * 100).toFixed(1),
      sessionsCompleted: progress.weeklyStats.reduce((sum, day) => sum + day.sessions, 0),
      xpEarned: progress.weeklyStats.reduce((sum, day) => sum + day.xp, 0),
      topicsMastered: Math.floor(Math.random() * 5) + 1,
      strongestSubject: Object.entries(progress.subjectProgress)
        .sort((a, b) => b[1].masteryPercentage - a[1].masteryPercentage)[0][0],
      weakestSubject: Object.entries(progress.subjectProgress)
        .sort((a, b) => a[1].masteryPercentage - b[1].masteryPercentage)[0][0],
      dailyBreakdown: progress.weeklyStats
    };
  }

  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }
}

// Create singleton instance
const mockDB = new MockDatabase();

export default mockDB;
export { MockDatabase };
