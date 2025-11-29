const getSupabase = require('../util/supabaseClient');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

exports.createEnvironment = catchAsync(async (req, res, next) => {
  const title = req.body.title;

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('environment')
    .insert([{ title, user_id: req.user.id }])
    .select()
    .maybeSingle();

  if (error) {
    return next(
      new AppError(error.message || 'Could not create the environment!', 400)
    );
  }

  res.status(200).json({
    status: 'success',
    data
  });
});

exports.addEnvVariable = catchAsync(async (req, res, next) => {
  const { key, value } = req.body;
  const env_id = req.params.id;

  if (!key || !value) {
    return next(
      new AppError('Please give the data of env_variable name and its value')
    );
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('env_variable')
    .insert([{ env_id, key, value }])
    .select()
    .maybeSingle();

  if (error) {
    return next(
      new AppError(error.message || 'Could not create the env Variables')
    );
  }

  res.status(200).json({
    status: 'success',
    data
  });
});

exports.getEnvVariables = catchAsync(async (req, res, next) => {
  const env_id = req.params.id;

  if (!env_id) {
    return next(new AppError('Please select an Environment!', 400));
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('env_variable')
    .select('*')
    .eq('env_id', env_id);

  if (error) {
    return next(
      new AppError(
        error.message ||
          'Could not find the env_variables for the environment collection!',
        404
      )
    );
  }

  res.status(200).json({
    status: 'success',
    data
  });
});

exports.getEnvCollecttion = catchAsync(async (req, res, next) => {
  const user_id = req.params.id;

  if (!user_id) {
    return next(new AppError('Please give the user!', 400));
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('environment')
    .select('*')
    .eq('user_id', user_id);

  if (error) {
    return next(
      new AppError(
        error.message || 'Could not find the environment collection!',
        404
      )
    );
  }

  res.status(200).json({
    status: 'success',
    data
  });
});

exports.updateEnvVariable = catchAsync(async (req, res, next) => {
  const varId = req.params.id;
  const { key, value } = req.body;

  if (!varId) return next(new AppError('Missing variable id', 400));
  if (!key && !value)
    return next(new AppError('Please provide key or value to update', 400));

  const supabase = getSupabase();

  // fetch variable to confirm ownership via env
  const { data: existing, error: fetchErr } = await supabase
    .from('env_variable')
    .select('*')
    .eq('id', varId)
    .maybeSingle();

  if (fetchErr)
    return next(
      new AppError(fetchErr.message || 'Could not fetch variable', 500)
    );
  if (!existing) return next(new AppError('Env variable not found', 404));

  const { data: envRow, error: envErr } = await supabase
    .from('environment')
    .select('*')
    .eq('id', existing.env_id)
    .maybeSingle();

  if (envErr)
    return next(
      new AppError(envErr.message || 'Could not fetch environment', 500)
    );
  if (!envRow) return next(new AppError('Environment not found', 404));
  if (envRow.user_id !== req.user.id)
    return next(new AppError('Not authorized', 403));

  const payload = {};
  if (key) payload.key = key;
  if (value) payload.value = value;

  const { data, error } = await supabase
    .from('env_variable')
    .update(payload)
    .eq('id', varId)
    .select()
    .maybeSingle();

  if (error)
    return next(
      new AppError(error.message || 'Could not update variable', 500)
    );

  res.status(200).json({ status: 'success', data });
});

exports.deleteEnvVariable = catchAsync(async (req, res, next) => {
  const varId = req.params.id;
  if (!varId) return next(new AppError('Missing variable id', 400));

  const supabase = getSupabase();

  const { data: existing, error: fetchErr } = await supabase
    .from('env_variable')
    .select('*')
    .eq('id', varId)
    .maybeSingle();

  if (fetchErr)
    return next(
      new AppError(fetchErr.message || 'Could not fetch variable', 500)
    );
  if (!existing) return next(new AppError('Env variable not found', 404));

  const { data: envRow, error: envErr } = await supabase
    .from('environment')
    .select('*')
    .eq('id', existing.env_id)
    .maybeSingle();

  if (envErr)
    return next(
      new AppError(envErr.message || 'Could not fetch environment', 500)
    );
  if (!envRow) return next(new AppError('Environment not found', 404));
  if (envRow.user_id !== req.user.id)
    return next(new AppError('Not authorized', 403));

  const { data, error } = await supabase
    .from('env_variable')
    .delete()
    .eq('id', varId)
    .select()
    .maybeSingle();

  if (error)
    return next(
      new AppError(error.message || 'Could not delete variable', 500)
    );

  res.status(200).json({ status: 'success', data });
});
