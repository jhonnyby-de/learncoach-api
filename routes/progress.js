import express from 'express';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import Joi from 'joi';

const router = express.Router();

// Validation schema
const logSessionSchema = Joi.object({
  duration: Joi.number().integer().min(1).required(),
  topicId: Joi.string().required(),
  topicName: Joi.string().required(),
  subject: Joi.string().required(),
  grade: Joi.number().integer(),
  sessionType: Joi.string().valid('learning', 'review', 'quiz', 'exam_simulation', 'practice').default('learning'),
  rating: Joi.number().integer().min(1).max(5),
  notes: Joi.string().max(500).allow(''),
  quizScore: Joi.number().min(0).max(100),
  learningPlanId: Joi.string().optional()
});

/**
 * @swagger
 * /api/progress/log-session:
 *   post:
 *     summary: Log a study session
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - duration
 *               - topicId
 *               - topicName
 *               - subject
 *             properties:
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *               topicId:
 *                 type: string
 *               topicName:
 *                 type: string
 *               subject:
 *                 type: string
 *               sessionType:
 *                 type: string
 *               rating:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Session logged successfully
 */
router.post('/log-session', authenticate, validate(logSessionSchema), async (req, res) => {
  try {
    const userId = req.userId;
    const {
      duration,
      topicId,
      topicName,
      subject,
      grade,
      sessionType,
      rating,
      notes,
      quizScore,
      learningPlanId
    } = req.body;

    // Get user for streak calculation
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Calculate XP
    const baseXP = Math.floor(duration * 0.8);
    const streakBonus = calculateStreakBonus(user.streak?.current || 0);
    const complexityBonus = 0; // Could be calculated based on topic complexity
    const quizBonus = quizScore ? Math.floor(quizScore * 0.5) : 0;
    
    const xpEarned = baseXP + streakBonus + complexityBonus + quizBonus;

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActive = user.streak?.lastActive ? new Date(user.streak.lastActive) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day
        user.streak.current += 1;
        user.streak.longest = Math.max(user.streak.longest, user.streak.current);
      } else if (diffDays > 1) {
        // Streak broken
        user.streak.current = 1;
      }
    } else {
      user.streak.current = 1;
    }
    
    user.streak.lastActive = new Date();
    user.totalXP += xpEarned;
    
    // Level up check
    const newLevel = Math.floor(user.totalXP / 300) + 1;
    const leveledUp = newLevel > user.level;
    if (leveledUp) {
      user.level = newLevel;
    }

    // Save user
    await user.save();

    // Create session record
    const session = await Session.create({
      userId,
      duration,
      topicId,
      topicName,
      subject,
      grade,
      sessionType,
      rating,
      notes,
      quizScore,
      xpEarned,
      xpBreakdown: {
        base: baseXP,
        streakBonus,
        complexityBonus,
        quizBonus
      },
      streakDay: user.streak.current,
      completedAt: new Date(),
      learningPlanId
    });

    res.status(201).json({
      success: true,
      message: 'Session logged successfully',
      data: {
        session: {
          id: session._id,
          duration,
          topicName,
          xpEarned,
          streakDay: user.streak.current
        },
        xp: {
          earned: xpEarned,
          breakdown: {
            base: baseXP,
            streakBonus,
            complexityBonus,
            quizBonus
          }
        },
        streak: {
          current: user.streak.current,
          longest: user.streak.longest
        },
        user: {
          totalXP: user.totalXP,
          level: user.level,
          leveledUp
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to log session'
    });
  }
});

/**
 * @swagger
 * /api/progress/sessions:
 *   get:
 *     summary: Get user's study sessions
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of sessions
 */
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const { limit = 50, subject } = req.query;
    const query = { userId: req.userId };
    
    if (subject) {
      query.subject = subject;
    }

    const sessions = await Session.find(query)
      .sort({ startedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: sessions.length,
      data: { sessions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/progress/stats:
 *   get:
 *     summary: Get user's progress statistics
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress statistics
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    // Get streak info
    const streakInfo = await Session.getStreakInfo(userId);

    // Get today's stats
    const todayStats = await Session.getDailyStats(userId, new Date());

    // Get weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklySessions = await Session.find({
      userId,
      startedAt: { $gte: weekAgo }
    });

    const weeklyStats = {
      totalSessions: weeklySessions.length,
      totalMinutes: weeklySessions.reduce((sum, s) => sum + s.duration, 0),
      totalXP: weeklySessions.reduce((sum, s) => sum + s.xpEarned, 0),
      subjects: [...new Set(weeklySessions.map(s => s.subject))],
      dailyAverage: Math.round(weeklySessions.length / 7 * 10) / 10
    };

    // Get subject breakdown
    const subjectStats = await Session.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$subject',
          totalMinutes: { $sum: '$duration' },
          totalSessions: { $sum: 1 },
          totalXP: { $sum: '$xpEarned' }
        }
      },
      { $sort: { totalMinutes: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        streak: streakInfo,
        today: todayStats,
        weekly: weeklyStats,
        subjects: subjectStats.map(s => ({
          subject: s._id,
          totalMinutes: s.totalMinutes,
          totalSessions: s.totalSessions,
          totalXP: s.totalXP
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/progress/dashboard:
 *   get:
 *     summary: Get dashboard data
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    const streakInfo = await Session.getStreakInfo(userId);
    const todayStats = await Session.getDailyStats(userId, new Date());

    // Recent sessions
    const recentSessions = await Session.find({ userId })
      .sort({ startedAt: -1 })
      .limit(5)
      .select('topicName subject duration xpEarned startedAt rating');

    // Weekly activity (last 7 days)
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStats = await Session.getDailyStats(userId, date);
      weeklyActivity.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('de-DE', { weekday: 'short' }),
        minutes: dayStats.totalMinutes,
        sessions: dayStats.totalSessions
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          name: user.fullName,
          level: user.level,
          totalXP: user.totalXP,
          streak: streakInfo
        },
        today: todayStats,
        recentSessions,
        weeklyActivity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions
function calculateStreakBonus(streak) {
  if (streak >= 30) return 20;
  if (streak >= 14) return 15;
  if (streak >= 7) return 10;
  if (streak >= 3) return 5;
  return 0;
}

export default router;
