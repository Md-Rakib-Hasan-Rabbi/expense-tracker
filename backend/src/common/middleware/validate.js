const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');

function validate(schema) {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new ApiError(400, 'Validation failed', error.issues));
      }
      return next(error);
    }
  };
}

module.exports = validate;
