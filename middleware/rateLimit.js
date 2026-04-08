import rateLimit from 'express-rate-limit';

/**
 * General API Rate Limiter
 * Default: 1000 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT_MAX) || 1000,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    retryAfter: Math.ceil((parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

/**
 * Strict Rate Limiter for authentication endpoints
 * 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Create custom rate limiter based on user tier
 */
export const createTieredLimiter = (tier) => {
  const limits = {
    free: { windowMs: 15 * 60 * 1000, max: 100 },      // 100 per 15 min
    basic: { windowMs: 15 * 60 * 1000, max: 1000 },    // 1000 per 15 min
    pro: { windowMs: 15 * 60 * 1000, max: 10000 },     // 10000 per 15 min
    enterprise: { windowMs: 15 * 60 * 1000, max: 100000 } // 100k per 15 min
  };

  const config = limits[tier] || limits.free;

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    keyGenerator: (req) => {
      return req.user?.apiKey || req.userId || req.ip;
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

export default { apiLimiter, authLimiter, createTieredLimiter };
