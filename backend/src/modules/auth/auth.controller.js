const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const env = require('../../config/env');
const supabase = require('../../config/supabase');
const { mapUser, throwIfSupabaseError } = require('../../common/utils/supabaseHelpers');
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
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : new Date(Date.now() + env.refreshCookieMaxAgeMs).toISOString();

  const { error } = await supabase.from('refresh_tokens').insert({
    user_id: userId,
    token_hash: hashToken(refreshToken),
    expires_at: expiresAt,
    device_info: userAgent || null,
  });

  throwIfSupabaseError(error, 'Failed to persist refresh token');
}

async function issueAuthTokens(res, user, userAgent) {
  const payload = { sub: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await persistRefreshToken({ userId: user.id, refreshToken, userAgent });
  res.cookie(env.refreshCookieName, refreshToken, getRefreshCookieOptions());

  return accessToken;
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, currency, timezone } = req.body;

  const { data: existing, error: existingError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  throwIfSupabaseError(existingError, 'Failed to verify email uniqueness');

  if (existing) {
    throw new ApiError(409, 'Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { data: userRow, error: createError } = await supabase
    .from('users')
    .insert({
      name,
      email,
      password_hash: passwordHash,
      currency: currency ? currency.toUpperCase() : 'BDT',
      timezone: timezone || 'Asia/Dhaka',
      settings: { theme: 'system' },
    })
    .select('*')
    .single();

  throwIfSupabaseError(createError, 'Failed to create user');

  const { error: categoriesError } = await supabase.from('categories').insert([
    { user_id: userRow.id, name: 'Food', type: 'expense', is_default: true, icon_key: 'utensils', color_token: 'emerald' },
    { user_id: userRow.id, name: 'Transport', type: 'expense', is_default: true, icon_key: 'car', color_token: 'blue' },
    { user_id: userRow.id, name: 'Bills', type: 'expense', is_default: true, icon_key: 'receipt', color_token: 'orange' },
    { user_id: userRow.id, name: 'Salary', type: 'income', is_default: true, icon_key: 'wallet', color_token: 'green' },
  ]);
  throwIfSupabaseError(categoriesError, 'Failed to create default categories');

  const { error: accountError } = await supabase.from('accounts').insert({
    user_id: userRow.id,
    name: 'Cash Wallet',
    type: 'cash',
    opening_balance: 0,
    current_balance: 0,
  });
  throwIfSupabaseError(accountError, 'Failed to create default account');

  const user = mapUser(userRow);
  const accessToken = await issueAuthTokens(res, user, req.headers['user-agent']);

  res.status(201).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { data: userRow, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  throwIfSupabaseError(error, 'Failed to authenticate user');

  if (!userRow) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, userRow.password_hash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const user = mapUser(userRow);
  const accessToken = await issueAuthTokens(res, user, req.headers['user-agent']);

  res.status(200).json({
    success: true,
    data: {
      user,
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
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);

  const { data: tokenRow, error: tokenError } = await supabase
    .from('refresh_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .eq('user_id', payload.sub)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  throwIfSupabaseError(tokenError, 'Failed to verify refresh token');

  if (!tokenRow) {
    throw new ApiError(401, 'Refresh token not recognized');
  }

  const { error: revokeError } = await supabase
    .from('refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', tokenRow.id);
  throwIfSupabaseError(revokeError, 'Failed to revoke refresh token');

  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', payload.sub)
    .maybeSingle();

  throwIfSupabaseError(userError, 'Failed to load user');

  if (!userRow) {
    throw new ApiError(401, 'User no longer exists');
  }

  const user = mapUser(userRow);
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
    const { error } = await supabase
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('token_hash', hashToken(refreshToken))
      .is('revoked_at', null);

    throwIfSupabaseError(error, 'Failed to revoke refresh token');
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
