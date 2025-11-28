const getSupabase = require("../util/supabaseClient");
const catchAsync = require("../util/catchAsync");
const AppError = require("../util/appError");

exports.createEnvironment = catchAsync(async (req, res, next) => {
  const title = req.body.title;

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("environment")
    .insert([{ title, user_id: req.user.id }])
    .select()
    .maybeSingle();

  if (error) {
    return next(
      new AppError(error.message || "Could not create the environment!", 400)
    );
  }

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.addEnvVariable = catchAsync(async (req, res, next) => {
  const { key, value } = req.body;
  const env_id = req.params.id;

  if (!key || !value) {
    return next(
      new AppError("Please give the data of env_variable name and its value")
    );
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("env_variable")
    .insert([{ env_id, key, value }])
    .select()
    .maybeSingle();

  if (error) {
    return next(
      new AppError(error.message || "Could not create the env Variables")
    );
  }

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getEnvVariables = catchAsync(async (req, res, next) => {
  const env_id = req.params.id;

  if (!env_id) {
    return next(new AppError("Please select an Environment!", 400));
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("env_variable")
    .select("*")
    .eq("env_id", env_id);

  if (error) {
    return next(
      new AppError(
        error.message ||
          "Could not find the env_variables for the environment collection!",
        404
      )
    );
  }

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getEnvCollecttion = catchAsync(async (req, res, next) => {
  const user_id = req.params.id;

  if (!user_id) {
    return next(new AppError("Please give the user!", 400));
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("environment")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    return next(
      new AppError(
        error.message || "Could not find the environment collection!",
        404
      )
    );
  }

  res.status(200).json({
    status: "success",
    data,
  });
});
