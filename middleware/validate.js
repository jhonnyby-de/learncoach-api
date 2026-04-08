/**
 * Joi Validation Middleware
 * Validates request body against a Joi schema
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = source === 'body' ? req.body : 
                          source === 'query' ? req.query : 
                          source === 'params' ? req.params : req.body;
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Replace request data with validated value
    if (source === 'body') req.body = value;
    else if (source === 'query') req.query = value;
    else if (source === 'params') req.params = value;

    next();
  };
};

export default { validate };
