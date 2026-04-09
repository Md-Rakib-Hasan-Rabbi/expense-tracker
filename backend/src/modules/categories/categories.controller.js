const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const Category = require('./category.model');

const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ userId: req.user.id }).sort({ type: 1, name: 1 });

  res.status(200).json({
    success: true,
    data: categories,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({
    ...req.body,
    userId: req.user.id,
  });

  res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.status(200).json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.status(200).json({
    success: true,
    data: { message: 'Category deleted successfully' },
  });
});

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
