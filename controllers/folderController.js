const getSupabase = require('../util/supabaseClient');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

exports.addFolder = catchAsync(async (req, res, next) => {
    const {col_id, name, description} = req.body;

    const supabase = getSupabase();

    const {data, error} = await supabase.from('folders').insert([{col_id, user_id: req.user.id, name, description}]).select().maybeSingle();

    if(error) {
        return next(new AppError(error.message || 'The folder could not be created', 40));
    }

    res.status(200).json({
        status: 'success',
        data
    });
});
exports.getCollectionFolder = catchAsync(async (req, res, next) => {
    const cid = req.params.id;

    const supabase = getSupabase();

    const {data, error} = await supabase.from('folders').select('*').eq('col_id', cid).eq('user_id', req.user.id);

    if(error) {
        return next(new AppError(error.message || 'Folder beloging to thae collection not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data
    });
});