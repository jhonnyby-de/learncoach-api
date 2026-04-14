import express from 'express';
import LearningPlan from '../models/LearningPlan.js';
import User from '../models/User.js';
import { validate } from '../middleware/validate.js';
import Joi from 'joi';
import knowledgeDB from '../data/knowledge-database.js';

// Mock user for non-authenticated mode
const getMockUserId = () => 'demo_user_001';

const router = express.Router();

// Validation schemas
const generatePlanSchema = Joi.object({
  grade: Joi.number().integer().min(1).max(13).required(),
  subjects: Joi.array().items(Joi.string()).min(1).required(),
  targetNote: Joi.number().min(1).max(6).required(),
  days: Joi.number().integer().min(1).max(365).required(),
  hoursPerDay: Joi.number().min(0.5).max(12).default(2),
  currentLevels: Joi.object().pattern(Joi.string(), Joi.number()),
  examDate: Joi.date().iso().optional(),
  focusAreas: Joi.array().items(Joi.string()).default([]),
  learningStyle: Joi.string().valid('visual', 'auditory', 'kinesthetic', 'reading', 'mixed').default('mixed')
});

/**
 * @swagger
 * /api/planner/generate:
 *   post:
 *     summary: Generate a new learning plan
 *     tags: [Learning Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grade
 *               - subjects
 *               - targetNote
 *               - days
 *             properties:
 *               grade:
 *                 type: integer
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *               targetNote:
 *                 type: number
 *               days:
 *                 type: integer
 *               hoursPerDay:
 *                 type: number
 *     responses:
 *       201:
 *         description: Learning plan generated successfully
 *       400:
 *         description: Invalid input
 */
router.post('/generate', validate(generatePlanSchema), async (req, res) => {
  try {
    const {
      grade,
      subjects,
      targetNote,
      days,
      hoursPerDay,
      currentLevels,
      examDate,
      focusAreas,
      learningStyle
    } = req.body;

    // Generate plan using knowledge database
    const profile = {
      grade,
      subjects: Array.isArray(subjects) ? subjects : [subjects],
      currentLevels: currentLevels || {},
      targetNote: parseFloat(targetNote),
      learningStyle
    };

    const generatedPlan = knowledgeDB.generateSmartLearningPlan(profile, parseInt(days), parseFloat(hoursPerDay));

    // Enhance with metadata
    const enhancedPlan = {
      ...generatedPlan,
      metadata: {
        generatedAt: new Date().toISOString(),
        grade,
        targetNote,
        subjects: profile.subjects,
        totalStudyDays: days,
        examDate: examDate || null,
        focusAreas: focusAreas.length > 0 ? focusAreas : 'All topics based on priority analysis',
        learningStrategy: getLearningStrategy(learningStyle, generatedPlan.averageComplexity),
        estimatedSuccessRate: calculateSuccessRate(currentLevels, targetNote, generatedPlan)
      }
    };

    // Create MongoDB document
    const planData = {
      userId: req.userId || getMockUserId(),
      grade,
      subjects: profile.subjects,
      targetNote: parseFloat(targetNote),
      days: parseInt(days),
      hoursPerDay: parseFloat(hoursPerDay),
      currentLevels,
      examDate,
      focusAreas,
      learningStyle,
      schedule: generatedPlan.schedule,
      totalTopics: generatedPlan.totalTopics,
      totalDays: generatedPlan.totalDays,
      totalHours: generatedPlan.totalHours,
      averageComplexity: generatedPlan.summary.averageComplexity,
      examCriticalTopics: generatedPlan.summary.examCriticalTopics,
      recommendations: generateRecommendations(generatedPlan, focusAreas),
      warnings: generateWarnings(generatedPlan, examDate),
      learningStrategy: enhancedPlan.metadata.learningStrategy,
      estimatedSuccessRate: enhancedPlan.metadata.estimatedSuccessRate,
      subjectBreakdown: generatedPlan.summary.subjectBreakdown,
      status: 'active'
    };

    const savedPlan = await LearningPlan.create(planData);

    // Return the plan
    const populatedPlan = await LearningPlan.findById(savedPlan._id);

    res.status(201).json({
      success: true,
      message: 'Learning plan generated successfully',
      data: {
        plan: populatedPlan,
        generated: enhancedPlan
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate learning plan'
    });
  }
});

/**
 * @swagger
 * /api/planner/plans:
 *   get:
 *     summary: Get user's learning plans
 *     tags: [Learning Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of learning plans
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = await LearningPlan.find({ userId: req.userId || getMockUserId(), isActive: true })
      .sort({ createdAt: -1 })
      .select('-schedule'); // Exclude detailed schedule for list view

    res.json({
      success: true,
      count: plans.length,
      data: { plans }
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
 * /api/planner/plans/{id}:
 *   get:
 *     summary: Get specific learning plan
 *     tags: [Learning Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Learning plan details
 *       404:
 *         description: Plan not found
 */
router.get('/plans/:id', async (req, res) => {
  try {
    const plan = await LearningPlan.findOne({
      _id: req.params.id,
      userId: req.userId || getMockUserId(),
      isActive: true
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Learning plan not found'
      });
    }

    res.json({
      success: true,
      data: { plan }
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
 * /api/planner/plans/{id}/complete-session:
 *   post:
 *     summary: Mark a session as completed
 *     tags: [Learning Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dayIndex:
 *                 type: integer
 *               sessionIndex:
 *                 type: integer
 *               score:
 *                 type: number
 *     responses:
 *       200:
 *         description: Session completed
 */
router.post('/plans/:id/complete-session', async (req, res) => {
  try {
    const { dayIndex, sessionIndex, score } = req.body;

    const plan = await LearningPlan.findOne({
      _id: req.params.id,
      userId: req.userId || getMockUserId()
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Learning plan not found'
      });
    }

    await plan.completeSession(dayIndex, sessionIndex, score);

    res.json({
      success: true,
      message: 'Session marked as completed',
      data: { plan }
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
 * /api/planner/plans/{id}:
 *   delete:
 *     summary: Delete a learning plan (soft delete)
 *     tags: [Learning Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Plan deleted
 */
router.delete('/plans/:id', async (req, res) => {
  try {
    const plan = await LearningPlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId || getMockUserId() },
      { isActive: false, deletedAt: new Date() },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Learning plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Learning plan deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions
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

export default router;
