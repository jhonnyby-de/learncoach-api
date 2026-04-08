import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['multiple_choice', 'equation', 'word_problem', 'grammar', 'vocabulary', 'concept', 'calculation'],
    required: true
  },
  topicId: String,
  topicName: String,
  subject: String,
  difficulty: { type: Number, min: 1, max: 10 },
  question: { type: String, required: true },
  options: [String],
  correctAnswer: mongoose.Schema.Types.Mixed, // Can be string, number, or index
  explanation: String,
  points: { type: Number, default: 10 }
}, { _id: false });

const userAnswerSchema = new mongoose.Schema({
  questionId: String,
  userAnswer: mongoose.Schema.Types.Mixed,
  isCorrect: Boolean,
  points: Number,
  timeSpent: Number // in seconds
}, { _id: false });

const quizSchema = new mongoose.Schema({
  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Quiz Configuration
  title: String,
  topicIds: [String],
  topics: [{
    id: String,
    name: String,
    subject: String
  }],
  
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'medium'
  },
  
  // Questions
  questions: [questionSchema],
  totalQuestions: Number,
  totalPoints: Number,
  
  // Time Settings
  timeLimit: Number, // in minutes, null for untimed
  timeStarted: Date,
  timeCompleted: Date,
  
  // Status
  status: {
    type: String,
    enum: ['generated', 'started', 'completed', 'expired'],
    default: 'generated'
  },
  
  // Results (filled after completion)
  results: {
    correctAnswers: Number,
    wrongAnswers: Number,
    percentage: Number,
    grade: String, // German grade 1-6
    earnedPoints: Number,
    totalPossible: Number,
    passed: Boolean,
    userAnswers: [userAnswerSchema],
    detailedResults: [{
      questionId: String,
      question: String,
      userAnswer: mongoose.Schema.Types.Mixed,
      correctAnswer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      points: Number,
      explanation: String
    }],
    feedback: String,
    recommendations: {
      weakAreas: [String],
      suggestedTopics: [String],
      studyTip: String
    }
  },
  
  // XP Awarded
  xpAwarded: {
    type: Number,
    default: 0
  },
  
  // Achievements unlocked
  achievements: [String],
  
  // Expiration
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  
  // Session Reference (if quiz was part of a study session)
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }
}, {
  timestamps: true
});

// Indexes
quizSchema.index({ userId: 1, createdAt: -1 });
quizSchema.index({ status: 1 });
quizSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired quizzes

// Method to start quiz
quizSchema.methods.start = async function() {
  this.status = 'started';
  this.timeStarted = new Date();
  await this.save();
};

// Method to submit answers
quizSchema.methods.submit = async function(answers) {
  let correct = 0;
  let earnedPoints = 0;
  const detailedResults = [];
  
  for (let i = 0; i < this.questions.length; i++) {
    const question = this.questions[i];
    const userAnswer = answers[i];
    const isCorrect = userAnswer === question.correctAnswer;
    
    if (isCorrect) {
      correct++;
      earnedPoints += question.points;
    }
    
    detailedResults.push({
      questionId: question.id,
      question: question.question,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      points: isCorrect ? question.points : 0,
      explanation: question.explanation
    });
  }
  
  const percentage = Math.round((correct / this.questions.length) * 100);
  const passed = percentage >= 60;
  
  // Calculate German grade
  const grade = this.calculateGrade(percentage);
  
  this.status = 'completed';
  this.timeCompleted = new Date();
  this.results = {
    correctAnswers: correct,
    wrongAnswers: this.questions.length - correct,
    percentage,
    grade,
    earnedPoints,
    totalPossible: this.totalPoints,
    passed,
    userAnswers: answers.map((answer, i) => ({
      questionId: this.questions[i].id,
      userAnswer: answer,
      isCorrect: answer === this.questions[i].correctAnswer,
      points: answer === this.questions[i].correctAnswer ? this.questions[i].points : 0
    })),
    detailedResults,
    feedback: this.generateFeedback(percentage, passed),
    recommendations: this.generateRecommendations(detailedResults)
  };
  
  // Calculate XP
  this.xpAwarded = Math.floor(earnedPoints * (passed ? 1.5 : 1));
  
  // Check for achievements
  if (percentage === 100) {
    this.achievements.push('perfect_score');
  }
  if (percentage >= 90) {
    this.achievements.push('excellent_score');
  }
  
  await this.save();
  
  return {
    percentage,
    grade,
    passed,
    earnedPoints,
    xpAwarded: this.xpAwarded,
    achievements: this.achievements
  };
};

// Helper method to calculate German grade
quizSchema.methods.calculateGrade = function(percentage) {
  if (percentage >= 92) return '1+';
  if (percentage >= 85) return '1';
  if (percentage >= 78) return '1-';
  if (percentage >= 71) return '2+';
  if (percentage >= 64) return '2';
  if (percentage >= 57) return '2-';
  if (percentage >= 50) return '3+';
  if (percentage >= 43) return '3';
  if (percentage >= 36) return '3-';
  if (percentage >= 29) return '4+';
  if (percentage >= 22) return '4';
  if (percentage >= 15) return '4-';
  if (percentage >= 8) return '5+';
  return '6';
};

// Generate feedback message
quizSchema.methods.generateFeedback = function(percentage, passed) {
  if (percentage >= 90) return 'Hervorragend! Du beherrschst das Thema perfekt.';
  if (percentage >= 75) return 'Sehr gut! Kleine Lücken sollten noch geschlossen werden.';
  if (passed) return 'Bestanden, aber es gibt noch Verbesserungspotenzial.';
  if (percentage >= 40) return 'Nicht bestanden. Lern die falsch beantworteten Fragen nach.';
  return 'Mehr Übung nötig. Arbeite die Grundlagen noch einmal durch.';
};

// Generate recommendations
quizSchema.methods.generateRecommendations = function(detailedResults) {
  const wrongAnswers = detailedResults.filter(r => !r.isCorrect);
  const weakAreas = [...new Set(wrongAnswers.map(r => r.question))].slice(0, 3);
  
  return {
    weakAreas,
    suggestedTopics: [], // Would be populated based on topic mapping
    studyTip: wrongAnswers.length > 3
      ? 'Fokussiere dich auf die Bereiche mit den meisten Fehlern.'
      : 'Gute Leistung! Vertiefe die wenigen Lücken.'
  };
};

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
