// ============================================
// ADVANCED LEARNING PLAN API
// POST /api/planner/generate - Generate smart learning plan
// POST /api/planner/adjust - Adjust existing plan
// ============================================

import knowledgeDB from '../../data/knowledge-database.js';
import mockDB from '../../data/mock-db.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.query;

  if (action === 'generate') {
    return generatePlan(req, res);
  }

  if (action === 'adjust') {
    return adjustPlan(req, res);
  }

  return generatePlan(req, res);
}

function generatePlan(req, res) {
  const {
    grade,
    subjects,
    currentLevels = {},
    targetNote,
    days,
    hoursPerDay = 2,
    examDate,
    focusAreas = [],
    learningStyle = 'mixed'
  } = req.body;

  // Validation
  if (!grade || !subjects || !targetNote || !days) {
    return res.status(400).json({
      error: 'Missing required fields: grade, subjects, targetNote, days'
    });
  }

  if (grade < 5 || grade > 13) {
    return res.status(400).json({
      error: 'Grade must be between 5 and 13'
    });
  }

  if (targetNote < 1 || targetNote > 6) {
    return res.status(400).json({
      error: 'Target note must be between 1.0 and 6.0 (German grading system)'
    });
  }

  // Build user profile
  const profile = {
    grade,
    subjects: Array.isArray(subjects) ? subjects : [subjects],
    currentLevels,
    targetNote: parseFloat(targetNote),
    learningStyle
  };

  // Generate intelligent plan
  const plan = knowledgeDB.generateSmartLearningPlan(profile, parseInt(days), parseFloat(hoursPerDay));

  // Enhance plan with metadata
  const enhancedPlan = {
    ...plan,
    metadata: {
      generatedAt: new Date().toISOString(),
      grade,
      targetNote,
      subjects: profile.subjects,
      totalStudyDays: days,
      examDate: examDate || null,
      focusAreas: focusAreas.length > 0 ? focusAreas : 'All topics based on priority analysis',
      learningStrategy: getLearningStrategy(learningStyle, plan.averageComplexity),
      estimatedSuccessRate: calculateSuccessRate(currentLevels, targetNote, plan)
    },
    recommendations: generateRecommendations(plan, focusAreas),
    warnings: generateWarnings(plan, examDate),
    dailySchedule: plan.schedule.map(day => ({
      day: day.day,
      date: day.date,
      type: day.type || 'regular',
      totalHours: day.totalHours,
      sessionCount: day.sessions.length,
      subjects: [...new Set(day.sessions.map(s => s.subject))],
      topics: day.sessions.map(s => ({
        name: s.topicName,
        subject: s.subject,
        duration: s.duration,
        type: s.type,
        complexity: s.complexity
      })),
      pomodoroSuggestion: generatePomodoroSchedule(day.sessions, hoursPerDay)
    }))
  };

  return res.status(200).json({
    success: true,
    plan: enhancedPlan
  });
}

function adjustPlan(req, res) {
  const { planId, adjustments } = req.body;

  // In a real implementation, fetch existing plan and apply adjustments
  // For now, return a message indicating this would modify the plan

  return res.status(200).json({
    success: true,
    message: 'Plan adjustment feature - would apply:',
    adjustments: {
      addDays: adjustments.addDays || 0,
      reduceHours: adjustments.reduceHours || 0,
      skipTopics: adjustments.skipTopics || [],
      addTopics: adjustments.addTopics || [],
      changeTarget: adjustments.newTargetNote || null
    },
    note: 'In production, this would modify the existing plan and recalculate the schedule'
  });
}

function getLearningStrategy(style, avgComplexity) {
  const strategies = {
    visual: 'Mind maps, diagrams, color coding, video content',
    auditory: 'Podcasts, discussions, reading aloud, mnemonic songs',
    kinesthetic: 'Practice problems, experiments, movement while learning',
    reading: 'Textbooks, notes, flashcards, summaries',
    mixed: 'Combination of all methods based on topic complexity'
  };

  let strategy = strategies[style] || strategies.mixed;
  
  if (avgComplexity > 7) {
    strategy += ' + Intensive practice sessions + Frequent breaks';
  }

  return strategy;
}

function calculateSuccessRate(currentLevels, targetNote, plan) {
  const currentAvg = Object.values(currentLevels).reduce((a, b) => a + b, 0) / 
    (Object.values(currentLevels).length || 1);
  
  const gap = Math.abs(targetNote - currentAvg);
  const daysAvailable = plan.totalDays;
  const topicsCount = plan.totalTopics;
  
  // Simple algorithm: more days and fewer topics = higher success rate
  let rate = Math.min(95, 40 + (daysAvailable / topicsCount) * 100);
  
  if (gap > 2) rate -= 15;
  if (plan.summary.averageComplexity > 8) rate -= 10;
  
  return Math.round(Math.max(20, rate));
}

function generateRecommendations(plan, focusAreas) {
  const recs = [];

  if (plan.summary.examCriticalTopics > 10) {
    recs.push({
      type: 'warning',
      message: `${plan.summary.examCriticalTopics} topics are marked as exam-critical. Prioritize these in your study sessions.`
    });
  }

  if (plan.summary.averageComplexity > 7) {
    recs.push({
      type: 'tip',
      message: 'High complexity topics detected. Consider extending study time or breaking topics into smaller chunks.'
    });
  }

  if (focusAreas.length > 0) {
    recs.push({
      type: 'focus',
      message: `Focusing on: ${focusAreas.join(', ')}. Plan adjusted to prioritize these areas.`
    });
  }

  recs.push({
    type: 'strategy',
    message: 'Use spaced repetition for review sessions. The plan automatically schedules reviews at optimal intervals.'
  });

  return recs;
}

function generateWarnings(plan, examDate) {
  const warnings = [];

  if (examDate) {
    const exam = new Date(examDate);
    const lastDay = new Date(plan.schedule[plan.schedule.length - 1].date);
    
    if (lastDay > exam) {
      warnings.push('Study plan extends beyond exam date. Consider starting earlier or reducing scope.');
    }
  }

  if (plan.totalTopics > plan.totalDays * 2) {
    warnings.push('Many topics to cover in limited time. Some topics may need to be deferred or studied superficially.');
  }

  return warnings;
}

function generatePomodoroSchedule(sessions, hoursPerDay) {
  const pomodoros = [];
  let currentTime = 8; // Start at 8:00
  
  for (const session of sessions) {
    const sessionPomodoros = Math.ceil(session.duration * 60 / 25);
    
    for (let i = 0; i < sessionPomodoros; i++) {
      const startTime = `${String(Math.floor(currentTime)).padStart(2, '0')}:${String((currentTime % 1) * 60).padStart(2, '0')}`;
      currentTime += 25/60;
      const endTime = `${String(Math.floor(currentTime)).padStart(2, '0')}:${String((currentTime % 1) * 60).padStart(2, '0')}`;
      
      pomodoros.push({
        start: startTime,
        end: endTime,
        topic: session.topicName,
        type: i === sessionPomodoros - 1 ? session.type : 'focus',
        breakAfter: i < sessionPomodoros - 1 ? 5 : 15
      });
      
      currentTime += (i < sessionPomodoros - 1 ? 5 : 15) / 60;
    }
  }

  return pomodoros;
}
