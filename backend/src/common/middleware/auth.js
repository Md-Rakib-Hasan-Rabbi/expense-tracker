const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/tokens');

function authRequired(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (_error) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = authRequired;
