const ApiError = require('../utils/ApiError');

function errorHandler(err, _req, res, _next) {
  let normalizedError = err;

  if (err?.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(', ');
    normalizedError = new ApiError(409, `Duplicate value for field(s): ${fields || 'unknown'}`);
  }

  if (err?.name === 'CastError') {
    normalizedError = new ApiError(400, 'Invalid identifier format');
  }

  const isTrusted = normalizedError instanceof ApiError;
  const statusCode = isTrusted ? normalizedError.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message: isTrusted ? normalizedError.message : 'Internal server error',
      details: isTrusted ? normalizedError.details : undefined,
    },
  });
}

module.exports = errorHandler;
