const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const supabase = require('../../config/supabase');
const { mapCategory, throwIfSupabaseError } = require('../../common/utils/supabaseHelpers');

const listCategories = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', req.user.id)
    .order('type', { ascending: true })
    .order('name', { ascending: true });

  throwIfSupabaseError(error, 'Failed to list categories');

  res.status(200).json({
    success: true,
    data: (data || []).map(mapCategory),
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const payload = {
    user_id: req.user.id,
    name: req.body.name,
    type: req.body.type,
    icon_key: req.body.iconKey || 'tag',
    color_token: req.body.colorToken || 'slate',
    is_archived: req.body.isArchived || false,
  };

  const { data, error } = await supabase.from('categories').insert(payload).select('*').single();

  throwIfSupabaseError(error, 'Failed to create category');

  res.status(201).json({ success: true, data: mapCategory(data) });
});

const updateCategory = asyncHandler(async (req, res) => {
  const payload = {
    ...(req.body.name !== undefined ? { name: req.body.name } : {}),
    ...(req.body.type !== undefined ? { type: req.body.type } : {}),
    ...(req.body.iconKey !== undefined ? { icon_key: req.body.iconKey } : {}),
    ...(req.body.colorToken !== undefined ? { color_token: req.body.colorToken } : {}),
    ...(req.body.isArchived !== undefined ? { is_archived: req.body.isArchived } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('*')
    .maybeSingle();

  throwIfSupabaseError(error, 'Failed to update category');

  if (!data) {
    throw new ApiError(404, 'Category not found');
  }

  res.status(200).json({ success: true, data: mapCategory(data) });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('id')
    .maybeSingle();

  throwIfSupabaseError(error, 'Failed to delete category');

  if (!data) {
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
