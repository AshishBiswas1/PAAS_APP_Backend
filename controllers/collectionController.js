const getSupabase = require('../util/supabaseClient');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

exports.getUserCollection = catchAsync(async (req, res, next) => {
    const id = req.params.id;

    const supabase = getSupabase();

    // request exact count from Supabase so we can return number of collections
    const { data, error, count } = await supabase.from('collections').select('*', { count: 'exact' }).eq('user_id', id);

    if(error) {
        return next(new AppError(error.message, 404));
    }

    res.status(200).json({
        status: 'success',
        results: typeof count === 'number' ? count : (Array.isArray(data) ? data.length : 0),
        data
    });
});

exports.createUserCollection = catchAsync(async (req, res, next) => {
    const { title, description } = req.body || {};

    const supabase = getSupabase();

    // use req.user.id directly (set by auth middleware)
    const user_id = req.user && req.user.id;
    if (!user_id) return next(new AppError('Not authenticated', 401));

    const { data, error } = await supabase.from('collections').insert([{ title, description, user_id }]).select().maybeSingle();

    if (error) return next(new AppError(error.message || 'Failed to create collection', 500));

    res.status(201).json({ 
        status: 'success',
        data 
    });
});