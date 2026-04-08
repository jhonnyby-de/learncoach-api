import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import Joi from 'joi';
import knowledgeDB from '../data/knowledge-database.js';

const router = express.Router();

// Validation schemas
const getTopicsSchema = Joi.object({
  grade: Joi.number().integer().min(1).max(13),
  subject: Joi.string(),
  complexityMin: Joi.number().integer().min(1).max(10),
  complexityMax: Joi.number().integer().min(1).max(10),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string()
}).unknown();

/**
 * @swagger
 * /api/knowledge/topics:
 *   get:
 *     summary: Get knowledge topics
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: complexityMin
 *         schema:
 *           type: integer
 *       - in: query
 *         name: complexityMax
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of topics
 */
router.get('/topics', authenticate, validate(getTopicsSchema, 'query'), async (req, res) => {
  try {
    const {
      grade,
      subject,
      complexityMin,
      complexityMax,
      limit,
      search
    } = req.query;

    // Get topics from knowledge database
    let topics = [];

    if (grade) {
      topics = knowledgeDB.getTopicsForGrade(parseInt(grade));
    } else if (subject) {
      topics = knowledgeDB.getTopicsBySubject(subject);
    } else {
      // Get all topics with limit
      const allGrades = [5, 6, 7, 8, 9, 10, 11, 12, 13];
      topics = allGrades.flatMap(g => knowledgeDB.getTopicsForGrade(g));
    }

    // Filter by complexity
    if (complexityMin !== undefined) {
      topics = topics.filter(t => t.complexity >= parseInt(complexityMin));
    }
    if (complexityMax !== undefined) {
      topics = topics.filter(t => t.complexity <= parseInt(complexityMax));
    }

    // Filter by subject if specified with grade
    if (subject && grade) {
      topics = topics.filter(t => t.subject.toLowerCase() === subject.toLowerCase());
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      topics = topics.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower) ||
        t.category?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by complexity
    topics.sort((a, b) => a.complexity - b.complexity);

    // Apply limit
    const limitedTopics = topics.slice(0, parseInt(limit));

    res.json({
      success: true,
      count: limitedTopics.length,
      total: topics.length,
      data: {
        topics: limitedTopics.map(t => ({
          id: t.id,
          name: t.name,
          subject: t.subject,
          grade: t.grade,
          complexity: t.complexity,
          estimatedHours: t.estimatedHours,
          description: t.description,
          category: t.category,
          isExamCritical: t.examRelevance >= 8,
          dependencies: t.dependencies
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
 * /api/knowledge/topics/{id}:
 *   get:
 *     summary: Get specific topic details
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Topic details
 *       404:
 *         description: Topic not found
 */
router.get('/topics/:id', authenticate, async (req, res) => {
  try {
    const topic = knowledgeDB.getTopicById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    // Get related topics
    const relatedTopics = knowledgeDB.getRelatedTopics(req.params.id);

    // Get prerequisite topics
    const prerequisites = topic.dependencies
      ?.map(depId => knowledgeDB.getTopicById(depId))
      .filter(Boolean) || [];

    res.json({
      success: true,
      data: {
        topic: {
          id: topic.id,
          name: topic.name,
          subject: topic.subject,
          grade: topic.grade,
          complexity: topic.complexity,
          estimatedHours: topic.estimatedHours,
          description: topic.description,
          category: topic.category,
          examRelevance: topic.examRelevance,
          isExamCritical: topic.examRelevance >= 8,
          dependencies: topic.dependencies,
          learningObjectives: topic.learningObjectives,
          keyConcepts: topic.keyConcepts,
          resources: topic.resources
        },
        relatedTopics: relatedTopics.map(t => ({
          id: t.id,
          name: t.name,
          subject: t.subject,
          complexity: t.complexity
        })),
        prerequisites: prerequisites.map(t => ({
          id: t.id,
          name: t.name,
          subject: t.subject
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
 * /api/knowledge/subjects:
 *   get:
 *     summary: Get available subjects
 *     tags: [Knowledge]
 *     responses:
 *       200:
 *         description: List of subjects
 */
router.get('/subjects', async (req, res) => {
  try {
    const subjects = [
      { id: 'mathematics', name: 'Mathematik', icon: '📐', grades: [5, 6, 7, 8, 9, 10, 11, 12, 13] },
      { id: 'german', name: 'Deutsch', icon: '📚', grades: [5, 6, 7, 8, 9, 10, 11, 12, 13] },
      { id: 'english', name: 'Englisch', icon: '🔤', grades: [5, 6, 7, 8, 9, 10, 11, 12, 13] },
      { id: 'physics', name: 'Physik', icon: '⚛️', grades: [7, 8, 9, 10, 11, 12, 13] },
      { id: 'chemistry', name: 'Chemie', icon: '⚗️', grades: [7, 8, 9, 10, 11, 12, 13] },
      { id: 'biology', name: 'Biologie', icon: '🔬', grades: [5, 6, 7, 8, 9, 10, 11, 12, 13] },
      { id: 'history', name: 'Geschichte', icon: '🏛️', grades: [5, 6, 7, 8, 9, 10, 11, 12, 13] },
      { id: 'geography', name: 'Erdkunde', icon: '🌍', grades: [5, 6, 7, 8, 9, 10, 11, 12, 13] },
      { id: 'politics', name: 'Politik', icon: '🏛️', grades: [9, 10, 11, 12, 13] },
      { id: 'religion', name: 'Religion', icon: '⛪', grades: [5, 6, 7, 8, 9, 10, 11, 12, 13] },
      { id: 'art', name: 'Kunst', icon: '🎨', grades: [5, 6, 7, 8, 9, 10, 11, 12] },
      { id: 'music', name: 'Musik', icon: '🎵', grades: [5, 6, 7, 8, 9, 10, 11, 12] },
      { id: 'pe', name: 'Sport', icon: '⚽', grades: [5, 6, 7, 8, 9, 10, 11, 12, 13] },
      { id: 'computer_science', name: 'Informatik', icon: '💻', grades: [7, 8, 9, 10, 11, 12, 13] },
      { id: 'economics', name: 'Wirtschaft', icon: '💰', grades: [9, 10, 11, 12, 13] },
      { id: 'philosophy', name: 'Philosophie', icon: '🤔', grades: [11, 12, 13] }
    ];

    res.json({
      success: true,
      count: subjects.length,
      data: { subjects }
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
 * /api/knowledge/stats:
 *   get:
 *     summary: Get knowledge base statistics
 *     tags: [Knowledge]
 *     responses:
 *       200:
 *         description: Knowledge base statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const totalTopics = knowledgeDB.getTopicCount();
    
    // Count by grade
    const gradeStats = {};
    for (let grade = 5; grade <= 13; grade++) {
      const topics = knowledgeDB.getTopicsForGrade(grade);
      gradeStats[grade] = topics.length;
    }

    // Count by subject
    const subjectStats = {};
    const subjects = ['Mathematik', 'Deutsch', 'Englisch', 'Physik', 'Chemie', 'Biologie', 'Geschichte'];
    for (const subject of subjects) {
      const topics = knowledgeDB.getTopicsBySubject(subject);
      subjectStats[subject] = topics.length;
    }

    res.json({
      success: true,
      data: {
        totalTopics,
        byGrade: gradeStats,
        bySubject: subjectStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
