// ============================================
// USER PROFILE API
// GET /api/users/profile - Get user profile
// POST /api/users/profile - Update user profile
// ============================================

import mockDB from '../../data/mock-db.js';
import knowledgeDB from '../../data/knowledge-database.js';

export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return getProfile(req, res);
  }

  if (req.method === 'POST') {
    return updateProfile(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function getProfile(req, res) {
  const userId = req.query.userId || 'user_001';
  const user = mockDB.getUser(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Get knowledge stats
  const allTopics = knowledgeDB.getTopicCount();
  const userGradeTopics = knowledgeDB.getTopicsForGrade(user.grade);
  const completedInGrade = user.completedTopics.filter(id => {
    const topic = knowledgeDB.getTopicById(id);
    return topic && topic.grade === user.grade;
  }).length;

  const response = {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      grade: user.grade,
      schoolType: user.schoolType,
      targetGrade: user.targetGrade,
      subjects: user.subjects,
      learningStyle: user.learningStyle,
      dailyGoalMinutes: user.dailyGoalMinutes,
      streak: user.streak,
      totalXP: user.totalXP,
      level: user.level,
      joinDate: user.joinDate,
      lastActive: user.lastActive,
      preferences: user.preferences
    },
    stats: {
      totalTopicsInDB: allTopics,
      topicsInCurrentGrade: userGradeTopics.length,
      topicsCompleted: user.completedTopics.length,
      completionRate: userGradeTopics.length > 0 ? Math.round((completedInGrade / userGradeTopics.length) * 100) : 0,
      skillLevels: user.skillLevels,
      weakTopicsCount: user.weakTopics.length,
      strongTopicsCount: user.strongTopics.length
    },
    skillAssessment: generateSkillAssessment(user),
    nextMilestones: [
      { name: 'Level 9 erreichen', progress: Math.round((user.totalXP % 300) / 3), target: 100 },
      { name: '30-Tage Streak', progress: user.streak, target: 30 },
      { name: '100 Themen gemeistert', progress: user.completedTopics.length, target: 100 }
    ]
  };

  return res.status(200).json(response);
}

function updateProfile(req, res) {
  const userId = req.body.userId || 'user_001';
  const allowedUpdates = ['name', 'grade', 'targetGrade', 'subjects', 'learningStyle', 'dailyGoalMinutes', 'preferences'];
  
  const updates = {};
  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  const updatedUser = mockDB.updateUser(userId, updates);

  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      grade: updatedUser.grade,
      targetGrade: updatedUser.targetGrade,
      subjects: updatedUser.subjects,
      learningStyle: updatedUser.learningStyle
    }
  });
}

function generateSkillAssessment(user) {
  const subjects = {};
  
  for (const [topicId, level] of Object.entries(user.skillLevels)) {
    const topic = knowledgeDB.getTopicById(topicId);
    if (topic) {
      if (!subjects[topic.subject]) {
        subjects[topic.subject] = { total: 0, count: 0, topics: [] };
      }
      subjects[topic.subject].total += level;
      subjects[topic.subject].count++;
      subjects[topic.subject].topics.push({
        name: topic.name,
        level: level,
        target: user.targetGrade,
        gap: Math.max(0, level - user.targetGrade)
      });
    }
  }

  const assessment = {};
  for (const [subject, data] of Object.entries(subjects)) {
    assessment[subject] = {
      averageLevel: Math.round((data.total / data.count) * 10) / 10,
      targetLevel: user.targetGrade,
      gap: Math.round((data.total / data.count - user.targetGrade) * 10) / 10,
      priorityTopics: data.topics
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 5)
    };
  }

  return assessment;
}
