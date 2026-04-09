const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    period: {
      type: String,
      enum: ['monthly'],
      default: 'monthly',
    },
    monthKey: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
      index: true,
    },
    limitAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    alertThresholdPercent: {
      type: Number,
      default: 80,
      min: 1,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ userId: 1, categoryId: 1, monthKey: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
