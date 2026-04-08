// ============================================
// PROGRESS & GAMIFICATION API
// GET /api/progress/weekly-report - Get weekly stats
// POST /api/progress/log-session - Log study session
// GET /api/progress/leaderboard - Get leaderboard
// GET /api/progress/achievements - Get user achievements
// ============================================

import mockDB from '../../data/mock-db.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  switch (action) {
    case 'weekly-report':
      return getWeeklyReport(req, res);
    case 'log-session':
      return logSession(req, res);
    case 'leaderboard':
      return getLeaderboard(req, res);
    case 'achievements':
      return getAchievements(req, res);
    default:
      return getProgressOverview(req, res);
  }
}

function getProgressOverview(req, res) {
  const userId = req.query.userId || 'user_001';
  const user = mockDB.getUser(userId);
  const progress = mockDB.getProgress(userId);

  if (!user || !progress) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({
    success: true,
    overview: {
      user: {
        id: user.id,
        name: user.name,
        level: user.level,
        totalXP: user.totalXP,
        streak: user.streak,
        dailyGoal: user.dailyGoalMinutes
      },
      stats: {
        totalHours: progress.totalStudyHours,
        totalSessions: progress.totalSessions,
        topicsCompleted: progress.topicsCompleted,
        averageSessionDuration: progress.averageSessionDuration
      },
      weekly: progress.weeklyStats,
      monthly: progress.monthlyStats,
      subjectProgress: progress.subjectProgress,
      upcomingReviews: progress.upcomingReviews.slice(0, 5),
      milestones: progress.milestones
    }
  });
}

function getWeeklyReport(req, res) {
  const userId = req.query.userId || 'user_001';
  const report = mockDB.getWeeklyReport(userId);

  if (!report) {
    return res.status(404).json({ error: 'No data found' });
  }

  return res.status(200).json({
    success: true,
    report
  });
}

function logSession(req, res) {
  const { 
    userId = 'user_001',
    duration,
    topicId,
    topicName,
    subject,
    sessionType = 'learning',
    notes = '',
    rating
  } = req.body;

  if (!duration || !topicId) {
    return res.status(400).json({ 
      error: 'Required: duration (minutes), topicId' 
    });
  }

  // Calculate XP
  const user = mockDB.getUser(userId);
  const baseXP = Math.floor(duration * 0.8);
  const streakBonus = user ? Math.min(50, user.streak * 2) : 0;
  const totalXP = baseXP + streakBonus;

  const session = {
    duration,
    topicId,
    topicName,
    subject,
    sessionType,
    notes,
    rating,
    xpEarned: totalXP,
    streakBonus,
    timestamp: new Date().toISOString()
  };

  const loggedSession = mockDB.logSession(userId, session);
  const xpUpdate = mockDB.addXP(userId, totalXP, 'Study session completed');

  // Check for achievements
  const newAchievements = [];
  
  if (user && user.streak === 7) {
    const unlocked = mockDB.unlockAchievement(userId, 'streak_7');
    if (unlocked) newAchievements.push(unlocked);
  }
  if (user && user.streak === 14) {
    const unlocked = mockDB.unlockAchievement(userId, 'streak_14');
    if (unlocked) newAchievements.push(unlocked);
  }
  if (user && user.totalXP >= 1000 && user.totalXP - totalXP < 1000) {
    const unlocked = mockDB.unlockAchievement(userId, 'xp_1000');
    if (unlocked) newAchievements.push(unlocked);
  }

  return res.status(200).json({
    success: true,
    session: loggedSession,
    xp: {
      earned: totalXP,
      breakdown: {
        base: baseXP,
        streakBonus: streakBonus
      },
      newTotal: xpUpdate.newTotal,
      newLevel: xpUpdate.newLevel,
      leveledUp: xpUpdate.leveledUp
    },
    streak: user ? user.streak : 0,
    achievements: newAchievements,
    message: `Session logged! +${totalXP} XP${newAchievements.length > 0 ? ' and new achievements!' : ''}`
  });
}

function getLeaderboard(req, res) {
  const limit = parseInt(req.query.limit) || 10;
  const leaderboard = mockDB.getLeaderboard(limit);

  return res.status(200).json({
    success: true,
    leaderboard,
    stats: {
      totalUsers: leaderboard.length,
      averageLevel: (leaderboard.reduce((sum, u) => sum + u.level, 0) / leaderboard.length).toFixed(1),
      topXP: leaderboard[0]?.xp || 0
    }
  });
}

function getAchievements(req, res) {
  const userId = req.query.userId || 'user_001';
  const achievements = mockDB.getAchievements(userId);

  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return res.status(200).json({
    success: true,
    summary: {
      total: achievements.length,
      unlocked: unlocked.length,
      locked: locked.length,
      completionPercentage: Math.round((unlocked.length / achievements.length) * 100)
    },
    unlocked: unlocked.sort((a, b) => new Date(b.date) - new Date(a.date)),
    inProgress: locked.sort((a, b) => (b.progress || 0) - (a.progress || 0)).slice(0, 5)
  });
}
