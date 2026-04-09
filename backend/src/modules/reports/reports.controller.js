const asyncHandler = require('../../common/utils/asyncHandler');
const mongoose = require('mongoose');
const Transaction = require('../transactions/transaction.model');

const summary = asyncHandler(async (req, res) => {
  const from = new Date(req.query.from);
  const to = new Date(req.query.to);
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const result = await Transaction.aggregate([
    {
      $match: {
        userId,
        transactionDate: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const income = result.find((item) => item._id === 'income')?.total || 0;
  const expense = result.find((item) => item._id === 'expense')?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      income,
      expense,
      net: income - expense,
      range: { from, to },
    },
  });
});

const categoryBreakdown = asyncHandler(async (req, res) => {
  const from = new Date(req.query.from);
  const to = new Date(req.query.to);
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const result = await Transaction.aggregate([
    {
      $match: {
        userId,
        type: 'expense',
        transactionDate: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: '$categoryId',
        total: { $sum: '$amount' },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $project: {
        _id: 0,
        categoryId: '$category._id',
        categoryName: '$category.name',
        iconKey: '$category.iconKey',
        colorToken: '$category.colorToken',
        total: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.status(200).json({ success: true, data: result });
});

const monthlyTrend = asyncHandler(async (req, res) => {
  const months = Number(req.query.months || 12);
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1, 0, 0, 0));
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const result = await Transaction.aggregate([
    {
      $match: {
        userId,
        transactionDate: { $gte: from, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$transactionDate' },
          month: { $month: '$transactionDate' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        type: '$_id.type',
        total: 1,
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  res.status(200).json({ success: true, data: result });
});

module.exports = {
  summary,
  categoryBreakdown,
  monthlyTrend,
};
