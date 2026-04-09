const supabase = require('../config/supabase');
const { throwIfSupabaseError } = require('../common/utils/supabaseHelpers');

function incrementNextRun(current, frequency) {
  const next = new Date(current);
  if (frequency === 'weekly') next.setUTCDate(next.getUTCDate() + 7);
  if (frequency === 'monthly') next.setUTCMonth(next.getUTCMonth() + 1);
  if (frequency === 'yearly') next.setUTCFullYear(next.getUTCFullYear() + 1);
  return next;
}

async function runRecurringRules() {
  const now = new Date();
  const { data: rules, error: rulesError } = await supabase
    .from('recurring_rules')
    .select('*')
    .eq('is_active', true)
    .lte('next_run_at', now.toISOString())
    .or(`end_date.is.null,end_date.gte.${now.toISOString()}`);

  throwIfSupabaseError(rulesError, 'Failed to load recurring rules');

  for (const rule of rules || []) {
    const { error: insertTxError } = await supabase.from('transactions').insert({
      user_id: rule.user_id,
      account_id: rule.account_id,
      category_id: rule.category_id,
      type: rule.type,
      amount: rule.amount,
      transaction_date: now.toISOString(),
      note: `Auto-generated from recurring rule: ${rule.title}`,
      source: 'recurring',
      recurring_rule_id: rule.id,
    });

    throwIfSupabaseError(insertTxError, 'Failed to insert recurring transaction');

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('current_balance')
      .eq('id', rule.account_id)
      .eq('user_id', rule.user_id)
      .maybeSingle();

    throwIfSupabaseError(accountError, 'Failed to load account for recurring update');

    if (account) {
      const delta = rule.type === 'income' ? rule.amount : -rule.amount;
      const updatedBalance = Number((Number(account.current_balance) + Number(delta)).toFixed(2));

      const { error: balanceError } = await supabase
        .from('accounts')
        .update({ current_balance: updatedBalance, updated_at: now.toISOString() })
        .eq('id', rule.account_id)
        .eq('user_id', rule.user_id);

      throwIfSupabaseError(balanceError, 'Failed to update account balance for recurring rule');
    }

    const nextRunAt = incrementNextRun(rule.next_run_at, rule.frequency);
    const { error: updateRuleError } = await supabase
      .from('recurring_rules')
      .update({ next_run_at: nextRunAt.toISOString(), updated_at: now.toISOString() })
      .eq('id', rule.id)
      .eq('user_id', rule.user_id);

    throwIfSupabaseError(updateRuleError, 'Failed to update next recurring execution');
  }
}

module.exports = runRecurringRules;
