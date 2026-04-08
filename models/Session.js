import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Session Details
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 480 // max 8 hours
  }, // in minutes
  
  // Topic Information
  topicId: { type: String, required: true },
  topicName: { type: String, required: true },
  subject: { type: String, required: true },
  grade: Number,
  complexity: { type: Number, min: 1, max: 10 },
  
  // Session Type
  sessionType: {
    type: String,
    enum: ['learning', 'review', 'quiz', 'exam_simulation', 'practice'],
    default: 'learning'
  },
  
  // Performance Metrics
  rating: {
    type: Number,
    min: 1,
    max: 5
  }, // User self-rating (1-5)
  
  quizScore: {
    type: Number,
    min: 0,
    max: 100
  }, // If session included a quiz
  
  notes: String,
  
  // XP Earned
  xpEarned: {
    type: Number,
    default: 0
  },
  
  xpBreakdown: {
    base: Number,
    streakBonus: Number,
    complexityBonus: Number,
    quizBonus: Number
  },
  
  // Streak Information
  streakDay: Number, // Which streak day was this
  
  // Timestamps
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: Date,
  
  // Device/Location Info
  device: {
    type: String,
    enum: ['web', 'mobile', 'tablet'],
    default: 'web'
  },
  
  ipAddress: String,
  
  // Learning Plan Reference (if applicable)
  learningPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPlan'
  },
  
  // Day/Session Index in Plan
  planDayIndex: Number,
  planSessionIndex: Number
}, {
  timestamps: true
});

// Indexes for efficient querying
sessionSchema.index({ userId: 1, startedAt: -1 });
sessionSchema.index({ userId: 1, subject: 1 });
sessionSchema.index({ startedAt: -1 });
sessionSchema.index({ subject: 1, grade: 1 });

// Static method to get daily stats
sessionSchema.statics.getDailyStats = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const sessions = await this.find({
    userId,
    startedAt: { $gte: startOfDay, $lte: endOfDay }
  });
  
  return {
    totalSessions: sessions.length,
    totalMinutes: sessions.reduce((sum, s) => sum + s.duration, 0),
    totalXP: sessions.reduce((sum, s) => sum + s.xpEarned, 0),
    subjects: [...new Set(sessions.map(s => s.subject))],
    topics: [...new Set(sessions.map(s => s.topicName))]
  };
};

// Static method to get streak info
sessionSchema.statics.getStreakInfo = async function(userId) {
  const sessions = await this.find({ userId })
    .sort({ startedAt: -1 })
    .limit(100);
  
  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActive: null };
  }
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate = null;
  
  for (const session of sessions) {
    const sessionDate = new Date(session.startedAt);
    sessionDate.setHours(0, 0, 0, 0);
    
    if (!lastDate) {
      tempStreak = 1;
      lastDate = sessionDate;
    } else {
      const diffDays = Math.floor((lastDate - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
        lastDate = sessionDate;
      } else if (diffDays > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        break;
      }
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  // Check if streak is still active
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = new Date(sessions[0].startedAt);
  lastActive.setHours(0, 0, 0, 0);
  const daysSince = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
  
  currentStreak = daysSince <= 1 ? tempStreak : 0;
  
  return {
    currentStreak,
    longestStreak,
    lastActive: sessions[0].startedAt
  };
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
