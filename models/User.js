import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  // Basic Info
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w.-]+@[\w.-]+\.\w+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  name: {
    first: { type: String, trim: true },
    last: { type: String, trim: true }
  },
  
  // Role & Permissions
  role: {
    type: String,
    enum: ['user', 'developer', 'admin'],
    default: 'user'
  },
  
  // Profile
  avatar: String,
  grade: {
    type: Number,
    min: 1,
    max: 13
  },
  subjects: [String],
  school: String,
  
  // Learning Progress
  totalXP: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActive: Date
  },
  completedTopics: [{
    topicId: String,
    completedAt: Date,
    score: Number
  }],
  
  // API Access
  apiKey: {
    type: String,
    unique: true,
    sparse: true
  },
  apiKeyCreatedAt: Date,
  apiKeyLastUsed: Date,
  
  // Rate Limiting
  rateLimitTier: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    default: 'free'
  },
  
  // Subscription
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing'],
      default: 'active'
    },
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false }
  },
  
  // Security
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  lastLogin: Date,
  lastLoginIp: String,
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ apiKey: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Update timestamp on modify
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Generate API key
userSchema.methods.generateApiKey = function() {
  const apiKey = crypto.randomBytes(32).toString('hex');
  this.apiKey = apiKey;
  this.apiKeyCreatedAt = new Date();
  return apiKey;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.name.first && this.name.last) {
    return `${this.name.first} ${this.name.last}`;
  }
  return this.email;
});

const User = mongoose.model('User', userSchema);

export default User;
