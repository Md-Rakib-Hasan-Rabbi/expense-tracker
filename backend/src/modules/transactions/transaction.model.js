const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    transactionDate: {
      type: Date,
      required: true,
      index: true,
    },
    note: {
      type: String,
      default: '',
      maxlength: 500,
    },
    tags: {
      type: [String],
      default: [],
    },
    merchant: {
      type: String,
      default: '',
      maxlength: 120,
    },
    source: {
      type: String,
      enum: ['manual', 'import', 'recurring'],
      default: 'manual',
    },
    recurringRuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringRule',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ userId: 1, transactionDate: -1 });
transactionSchema.index({ userId: 1, categoryId: 1, transactionDate: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
