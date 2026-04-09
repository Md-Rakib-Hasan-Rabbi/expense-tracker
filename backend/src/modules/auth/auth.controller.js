const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const env = require('../../config/env');
const User = require('../users/user.model');
const RefreshToken = require('./refresh-token.model');
const Category = require('../categories/category.model');
const Account = require('../accounts/account.model');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../../common/utils/tokens');

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: env.refreshCookieMaxAgeMs,
    path: '/api/v1/auth',
  };
}

async function persistRefreshToken({ userId, refreshToken, userAgent }) {
  const decoded = jwt.decode(refreshToken);
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + env.refreshCookieMaxAgeMs);

  await RefreshToken.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt,
    deviceInfo: userAgent || null,
  });
}

async function issueAuthTokens(res, user, userAgent) {
  const payload = { sub: user._id.toString(), email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await persistRefreshToken({ userId: user._id, refreshToken, userAgent });
  res.cookie(env.refreshCookieName, refreshToken, getRefreshCookieOptions());

  return accessToken;
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, currency, timezone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    currency: currency ? currency.toUpperCase() : 'USD',
    timezone: timezone || 'UTC',
  });

  await Category.insertMany([
    { userId: user._id, name: 'Food', type: 'expense', isDefault: true, iconKey: 'utensils', colorToken: 'emerald' },
    { userId: user._id, name: 'Transport', type: 'expense', isDefault: true, iconKey: 'car', colorToken: 'blue' },
    { userId: user._id, name: 'Bills', type: 'expense', isDefault: true, iconKey: 'receipt', colorToken: 'orange' },
    { userId: user._id, name: 'Salary', type: 'income', isDefault: true, iconKey: 'wallet', colorToken: 'green' },
  ]);

  await Account.create({
    userId: user._id,
    name: 'Cash Wallet',
    type: 'cash',
    openingBalance: 0,
    currentBalance: 0,
  });

  const accessToken = await issueAuthTokens(res, user, req.headers['user-agent']);

  res.status(201).json({
    success: true,
    data: {
      user: user.toSafeObject(),
      accessToken,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const accessToken = await issueAuthTokens(res, user, req.headers['user-agent']);

  res.status(200).json({
    success: true,
    data: {
      user: user.toSafeObject(),
      accessToken,
    },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[env.refreshCookieName];
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token missing');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (_error) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const tokenDoc = await RefreshToken.findOne({
    tokenHash,
    userId: payload.sub,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) {
    throw new ApiError(401, 'Refresh token not recognized');
  }

  tokenDoc.revokedAt = new Date();
  await tokenDoc.save();

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  const accessToken = await issueAuthTokens(res, user, req.headers['user-agent']);

  res.status(200).json({
    success: true,
    data: {
      accessToken,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[env.refreshCookieName];
  if (refreshToken) {
    await RefreshToken.updateOne(
      { tokenHash: hashToken(refreshToken), revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  }

  res.clearCookie(env.refreshCookieName, getRefreshCookieOptions());

  res.status(200).json({
    success: true,
    data: {
      message: 'Logged out successfully',
    },
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
};
