const getSupabase = require("../util/supabaseClient");
const catchAsync = require("../util/catchAsync");
const AppError = require("../util/appError");

exports.saveApi = catchAsync(async (req, res, next) => {
  const {
    f_id,
    url,
    headers,
    body,
    method,
    response,
    res_status,
    statusmessage,
  } = req.body;

  if (!url) {
    return next(new AppError("Please provide the api URL!", 400));
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("api")
    .insert([
      {
        folder_id: f_id,
        user_id: req.user.id,
        url,
        headers,
        body,
        method,
        response,
        res_statuscode: res_status,
        statusmessage,
      },
    ])
    .select()
    .maybeSingle();

  if (error) {
    return next(new AppError(error.message || "Api could not be saved!", 400));
  }

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getUserapi = catchAsync(async (req, res, next) => {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("api")
    .select("*")
    .eq("user_id", req.user.id);

  if (error) {
    return next(
      new AppError(error.message || "Could not find api for the user")
    );
  }

  res.status(200).json({
    status: "success",
    data,
  });
});
