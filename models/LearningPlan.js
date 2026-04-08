import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  topicId: { type: String, required: true },
  topicName: { type: String, required: true },
  subject: { type: String, required: true },
  duration: { type: Number, required: true }, // in hours
  type: { 
    type: String, 
    enum: ['new_learning', 'review', 'practice', 'exam_prep'],
    default: 'new_learning'
  },
  complexity: { type: Number, min: 1, max: 10 },
  completed: { type: Boolean, default: false },
  completedAt: Date,
  score: Number // quiz score if applicable
}, { _id: false });

const dayScheduleSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['regular', 'review', 'exam', 'break'],
    default: 'regular'
  },
  totalHours: Number,
  sessionCount: Number,
  sessions: [sessionSchema],
  subjects: [String],
  completed: { type: Boolean, default: false }
}, { _id: false });

const learningPlanSchema = new mongoose.Schema({
  // Reference to user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Plan Configuration
  grade: { type: Number, required: true, min: 1, max: 13 },
  subjects: [{ type: String, required: true }],
  targetNote: { type: Number, required: true, min: 1, max: 6 },
  days: { type: Number, required: true },
  hoursPerDay: { type: Number, default: 2 },
  
  // Current Levels
  currentLevels: {
    type: Map,
    of: Number
  },
  
  // Exam Date (optional)
  examDate: Date,
  
  // Focus Areas
  focusAreas: [String],
  
  // Learning Style
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'reading', 'mixed'],
    default: 'mixed'
  },
  
  // Generated Schedule
  schedule: [dayScheduleSchema],
  
  // Summary Statistics
  totalTopics: Number,
  totalDays: Number,
  totalHours: Number,
  averageComplexity: Number,
  examCriticalTopics: Number,
  
  // Metadata
  generatedAt: { type: Date, default: Date.now },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'abandoned'],
    default: 'active'
  },
  
  // Progress Tracking
  progress: {
    daysCompleted: { type: Number, default: 0 },
    topicsCompleted: { type: Number, default: 0 },
    hoursStudied: { type: Number, default: 0 },
    lastStudied: Date
  },
  
  // Recommendations & Warnings (stored from generation)
  recommendations: [{
    type: { type: String },
    message: String
  }],
  warnings: [String],
  
  // Learning Strategy
  learningStrategy: String,
  estimatedSuccessRate: Number,
  
  // Subject Breakdown
  subjectBreakdown: {
    type: Map,
    of: Number
  },
  
  // Soft Delete
  isActive: { type: Boolean, default: true },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes
learningPlanSchema.index({ userId: 1, createdAt: -1 });
learningPlanSchema.index({ status: 1 });
learningPlanSchema.index({ grade: 1, subjects: 1 });

// Virtual for completion percentage
learningPlanSchema.virtual('completionPercentage').get(function() {
  if (!this.totalDays || this.totalDays === 0) return 0;
  return Math.round((this.progress.daysCompleted / this.totalDays) * 100);
});

// Method to mark session as completed
learningPlanSchema.methods.completeSession = async function(dayIndex, sessionIndex, score) {
  if (this.schedule[dayIndex] && this.schedule[dayIndex].sessions[sessionIndex]) {
    const session = this.schedule[dayIndex].sessions[sessionIndex];
    session.completed = true;
    session.completedAt = new Date();
    if (score) session.score = score;
    
    // Update progress
    this.progress.topicsCompleted += 1;
    this.progress.hoursStudied += session.duration;
    this.progress.lastStudied = new Date();
    
    await this.save();
  }
};

// Method to mark day as completed
learningPlanSchema.methods.completeDay = async function(dayIndex) {
  if (this.schedule[dayIndex]) {
    this.schedule[dayIndex].completed = true;
    this.progress.daysCompleted += 1;
    await this.save();
  }
};

const LearningPlan = mongoose.model('LearningPlan', learningPlanSchema);

export default LearningPlan;
