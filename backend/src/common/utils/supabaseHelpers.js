const ApiError = require('./ApiError');

function throwIfSupabaseError(error, fallbackMessage = 'Database operation failed') {
  if (error) {
    const message = error.message || fallbackMessage;
    throw new ApiError(500, message);
  }
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    email: row.email,
    name: row.name,
    currency: row.currency,
    timezone: row.timezone,
    settings: row.settings || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    iconKey: row.icon_key,
    colorToken: row.color_token,
    isDefault: row.is_default,
    isArchived: row.is_archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAccount(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    openingBalance: row.opening_balance,
    currentBalance: row.current_balance,
    isArchived: row.is_archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapJoinedCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    type: row.type,
    iconKey: row.icon_key,
    colorToken: row.color_token,
  };
}

function mapJoinedAccount(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    type: row.type,
  };
}

function mapTransaction(row) {
  if (!row) return null;

  return {
    id: row.id,
    _id: row.id,
    userId: row.user_id,
    accountId: row.account ? mapJoinedAccount(row.account) : row.account_id,
    categoryId: row.category ? mapJoinedCategory(row.category) : row.category_id,
    type: row.type,
    amount: row.amount,
    transactionDate: row.transaction_date,
    note: row.note,
    tags: row.tags || [],
    merchant: row.merchant,
    source: row.source,
    recurringRuleId: row.recurring_rule_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBudget(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    userId: row.user_id,
    categoryId: row.category ? mapJoinedCategory(row.category) : row.category_id,
    period: row.period,
    monthKey: row.month_key,
    limitAmount: row.limit_amount,
    alertThresholdPercent: row.alert_threshold_percent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRecurringRule(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    userId: row.user_id,
    title: row.title,
    amount: row.amount,
    type: row.type,
    accountId: row.account ? mapJoinedAccount(row.account) : row.account_id,
    categoryId: row.category ? mapJoinedCategory(row.category) : row.category_id,
    frequency: row.frequency,
    startDate: row.start_date,
    endDate: row.end_date,
    nextRunAt: row.next_run_at,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = {
  throwIfSupabaseError,
  mapUser,
  mapCategory,
  mapAccount,
  mapTransaction,
  mapBudget,
  mapRecurringRule,
};
