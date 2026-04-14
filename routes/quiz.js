import express from 'express';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import { validate } from '../middleware/validate.js';
import Joi from 'joi';

// Mock user for non-authenticated mode
const getMockUserId = () => 'demo_user_001';

const router = express.Router();

// Validation schemas
const generateSchema = Joi.object({
  topicIds: Joi.array().items(Joi.string()).min(1).required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard', 'mixed').default('medium'),
  questionCount: Joi.number().integer().min(1).max(50).default(5),
  questionTypes: Joi.array().items(Joi.string()).optional()
});

const submitSchema = Joi.object({
  quizId: Joi.string().required(),
  answers: Joi.array().items(Joi.any()).required()
});

// Question templates (simplified version)
const questionTemplates = {
  Mathematik: [
    { type: 'multiple_choice', template: 'Was ist das Ergebnis von {a} + {b}?', generator: () => {
      const a = rand(1, 20), b = rand(1, 20);
      return { a, b, answer: a + b, options: [a + b, a + b + 1, a + b - 1, a + b + 2] };
    }},
    { type: 'equation', template: 'Löse: x + {b} = {c}', generator: () => {
      const b = rand(1, 10), c = rand(10, 30);
      return { b, c, answer: c - b, options: [c - b, c + b, c * b, c / b] };
    }}
  ],
  Deutsch: [
    { type: 'grammar', template: 'Welche Wortart ist "{word}"?', generator: () => {
      const words = [
        { word: 'schnell', answer: 0, options: ['Adjektiv', 'Nomen', 'Verb', 'Konjunktion'] },
        { word: 'Haus', answer: 1, options: ['Adjektiv', 'Nomen', 'Verb', 'Konjunktion'] },
        { word: 'laufen', answer: 2, options: ['Adjektiv', 'Nomen', 'Verb', 'Konjunktion'] }
      ];
      return randomItem(words);
    }}
  ],
  Englisch: [
    { type: 'vocabulary', template: 'Was bedeutet "{word}" auf Deutsch?', generator: () => {
      const words = [
        { word: 'apple', answer: 0, options: ['Apfel', 'Birne', 'Kirsche', 'Banane'] },
        { word: 'house', answer: 1, options: ['Garten', 'Haus', 'Dach', 'Wand'] }
      ];
      return randomItem(words);
    }}
  ]
};

/**
 * @swagger
 * /api/quiz/generate:
 *   post:
 *     summary: Generate a new quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topicIds
 *             properties:
 *               topicIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               difficulty:
 *                 type: string
 *               questionCount:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Quiz generated successfully
 */
router.post('/generate', validate(generateSchema), async (req, res) => {
  try {
    const { topicIds, difficulty, questionCount } = req.body;
    const userId = req.userId || getMockUserId();

    // Generate questions
    const questions = [];
    
    for (let i = 0; i < Math.min(questionCount, 20); i++) {
      const topicId = topicIds[i % topicIds.length];
      const subject = getSubjectFromTopicId(topicId);
      const templates = questionTemplates[subject] || questionTemplates.Mathematik;
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      const data = template.generator();
      
      questions.push({
        id: `q_${i + 1}`,
        type: template.type,
        topicId,
        subject,
        difficulty: difficulty === 'hard' ? 8 : difficulty === 'easy' ? 4 : 6,
        question: formatQuestion(template.template, data),
        options: data.options,
        correctAnswer: data.answer,
        explanation: `Correct answer: ${data.answer}`,
        points: 10
      });
    }

    // Create quiz in database
    const quiz = await Quiz.create({
      userId,
      topicIds,
      topics: topicIds.map(id => ({ id, name: getTopicName(id), subject: getSubjectFromTopicId(id) })),
      difficulty,
      questions,
      totalQuestions: questions.length,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      timeLimit: questions.length * 2,
      status: 'generated'
    });

    // Return quiz without correct answers
    const clientQuiz = {
      id: quiz._id,
      generatedAt: quiz.createdAt,
      totalQuestions: quiz.totalQuestions,
      totalPoints: quiz.totalPoints,
      timeLimit: quiz.timeLimit,
      topics: quiz.topics,
      questions: questions.map(q => ({
        id: q.id,
        type: q.type,
        topicName: q.topicId,
        subject: q.subject,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        points: q.points
      }))
    };

    res.status(201).json({
      success: true,
      message: 'Quiz generated successfully',
      data: { quiz: clientQuiz }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate quiz'
    });
  }
});

/**
 * @swagger
 * /api/quiz/{id}/start:
 *   post:
 *     summary: Start a quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Quiz started
 */
router.post('/:id/start', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.userId || getMockUserId(),
      status: 'generated'
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found or already started'
      });
    }

    quiz.status = 'started';
    quiz.timeStarted = new Date();
    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz started',
      data: {
        quizId: quiz._id,
        timeStarted: quiz.timeStarted,
        timeLimit: quiz.timeLimit
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
 * /api/quiz/submit:
 *   post:
 *     summary: Submit quiz answers
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quizId
 *               - answers
 *             properties:
 *               quizId:
 *                 type: string
 *               answers:
 *                 type: array
 *     responses:
 *       200:
 *         description: Quiz results
 */
router.post('/submit', validate(submitSchema), async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.userId || getMockUserId();

    const quiz = await Quiz.findOne({
      _id: quizId,
      userId,
      status: 'started'
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found or not started'
      });
    }

    // Submit answers
    const result = await quiz.submit(answers);

    // Get or create mock user
    let user = await User.findById(userId);
    if (!user) {
      user = await User.create({
        _id: userId,
        email: 'demo@example.com',
        password: 'demo',
        firstName: 'Demo',
        lastName: 'User',
        grade: 9,
        totalXP: 0,
        level: 1,
        streak: { current: 1, longest: 1, lastActive: new Date() }
      });
    }
    
    user.totalXP += result.xpAwarded;
    
    // Level up check
    const newLevel = Math.floor(user.totalXP / 300) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }
    
    await user.save();

    res.json({
      success: true,
      data: {
        result: {
          ...result,
          newTotalXP: user.totalXP,
          newLevel: user.level
        },
        detailedResults: quiz.results.detailedResults
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit quiz'
    });
  }
});

/**
 * @swagger
 * /api/quiz/history:
 *   get:
 *     summary: Get quiz history
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of completed quizzes
 */
router.get('/history', async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.userId || getMockUserId(),
      status: 'completed'
    })
      .sort({ createdAt: -1 })
      .select('-questions');

    res.json({
      success: true,
      count: quizzes.length,
      data: { quizzes }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatQuestion(template, data) {
  let question = template;
  for (const [key, value] of Object.entries(data)) {
    if (key !== 'options' && key !== 'answer') {
      question = question.replace(`{${key}}`, value);
    }
  }
  return question;
}

function getSubjectFromTopicId(topicId) {
  if (topicId.startsWith('math')) return 'Mathematik';
  if (topicId.startsWith('de')) return 'Deutsch';
  if (topicId.startsWith('en')) return 'Englisch';
  if (topicId.startsWith('phy')) return 'Physik';
  if (topicId.startsWith('chem')) return 'Chemie';
  if (topicId.startsWith('bio')) return 'Biologie';
  return 'Mathematik';
}

function getTopicName(topicId) {
  // Simplified - would normally query database
  return topicId;
}

export default router;
