const getSupabase = require('../util/supabaseClient');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

exports.getUserCollection = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const supabase = getSupabase();

  // request exact count from Supabase so we can return number of collections
  const { data, error, count } = await supabase
    .from('collections')
    .select('*', { count: 'exact' })
    .eq('user_id', id);

  if (error) {
    return next(new AppError(error.message, 404));
  }

  res.status(200).json({
    status: 'success',
    results:
      typeof count === 'number' ? count : Array.isArray(data) ? data.length : 0,
    data
  });
});

exports.createUserCollection = catchAsync(async (req, res, next) => {
  const { title, description } = req.body || {};

  const supabase = getSupabase();

  // use req.user.id directly (set by auth middleware)
  const user_id = req.user && req.user.id;
  if (!user_id) return next(new AppError('Not authenticated', 401));

  const { data, error } = await supabase
    .from('collections')
    .insert([{ title, description, user_id }])
    .select()
    .maybeSingle();

  if (error)
    return next(
      new AppError(error.message || 'Failed to create collection', 500)
    );

  res.status(201).json({
    status: 'success',
    data
  });
});

exports.updateUserCollection = catchAsync(async (req, res, next) => {
  const cid = req.params.cid;
  const { title, description } = req.body || {};

  if (!cid) return next(new AppError('Collection id is required', 400));
  if (typeof title === 'undefined' && typeof description === 'undefined')
    return next(new AppError('No updatable fields provided', 400));

  const supabase = getSupabase();

  const updates = {};
  if (typeof title !== 'undefined') updates.title = title;
  if (typeof description !== 'undefined') updates.description = description;

  const { data, error } = await supabase
    .from('collections')
    .update(updates)
    .eq('id', cid)
    .select()
    .maybeSingle();
  if (error)
    return next(
      new AppError(error.message || 'Failed to update collection', 500)
    );
  if (!data) return next(new AppError('Collection not found', 404));

  res.status(200).json({ status: 'success', data });
});

exports.deleteUserCollection = catchAsync(async (req, res, next) => {
  const cid = req.params.cid;

  if (!cid) return next(new AppError('Collection id is required', 400));

  const supabase = getSupabase();

  // Delete the collection (cascade will handle folders and APIs)
  const { data, error } = await supabase
    .from('collections')
    .delete()
    .eq('id', cid)
    .eq('user_id', req.user.id)
    .select()
    .maybeSingle();

  if (error)
    return next(
      new AppError(error.message || 'Failed to delete collection', 500)
    );
  if (!data)
    return next(new AppError('Collection not found or unauthorized', 404));

  res.status(200).json({
    status: 'success',
    message: 'Collection deleted successfully',
    data
  });
});
