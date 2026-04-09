const RecurringRule = require('../modules/recurring/recurring-rule.model');
const Transaction = require('../modules/transactions/transaction.model');
const Account = require('../modules/accounts/account.model');

function incrementNextRun(current, frequency) {
  const next = new Date(current);
  if (frequency === 'weekly') next.setUTCDate(next.getUTCDate() + 7);
  if (frequency === 'monthly') next.setUTCMonth(next.getUTCMonth() + 1);
  if (frequency === 'yearly') next.setUTCFullYear(next.getUTCFullYear() + 1);
  return next;
}

async function runRecurringRules() {
  const now = new Date();
  const rules = await RecurringRule.find({
    isActive: true,
    nextRunAt: { $lte: now },
    $or: [{ endDate: null }, { endDate: { $gte: now } }],
  });

  for (const rule of rules) {
    await Transaction.create({
      userId: rule.userId,
      accountId: rule.accountId,
      categoryId: rule.categoryId,
      type: rule.type,
      amount: rule.amount,
      transactionDate: now,
      note: `Auto-generated from recurring rule: ${rule.title}`,
      source: 'recurring',
      recurringRuleId: rule._id,
    });

    const account = await Account.findOne({ _id: rule.accountId, userId: rule.userId });
    if (account) {
      const delta = rule.type === 'income' ? rule.amount : -rule.amount;
      account.currentBalance = Number((account.currentBalance + delta).toFixed(2));
      await account.save();
    }

    rule.nextRunAt = incrementNextRun(rule.nextRunAt, rule.frequency);
    await rule.save();
  }
}

module.exports = runRecurringRules;
