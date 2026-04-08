import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LearnCoach API',
      version: '1.0.0',
      description: 'Intelligent Learning Platform API - Generate smart learning plans, track progress, and gamify education',
      contact: {
        name: 'LearnCoach Support',
        email: 'support@learncoach.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://learncoach-api.vercel.app',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            grade: { type: 'number' },
            role: { type: 'string', enum: ['user', 'developer', 'admin'] },
            totalXP: { type: 'number' },
            level: { type: 'number' },
            streak: {
              type: 'object',
              properties: {
                current: { type: 'number' },
                longest: { type: 'number' }
              }
            }
          }
        },
        LearningPlan: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            grade: { type: 'number' },
            subjects: { type: 'array', items: { type: 'string' } },
            targetNote: { type: 'number' },
            days: { type: 'number' },
            schedule: { type: 'array' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            code: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User registration, login, and token management' },
      { name: 'Users', description: 'User profile and progress management' },
      { name: 'Learning Plans', description: 'Generate and manage learning plans' },
      { name: 'Knowledge', description: 'Access to knowledge database topics' },
      { name: 'Quiz', description: 'Generate and take quizzes' },
      { name: 'Progress', description: 'Track learning progress and sessions' },
      { name: 'Coach', description: 'AI-powered coaching and daily tips' }
    ]
  },
  apis: ['./routes/*.js', './api/**/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
