const getSupabase = require('./../util/supabaseClient');
const AppError = require('./../util/appError');
const catchAsync = require('./../util/catchAsync');

exports.getMe = catchAsync(async (req, res, next) => {
	// req.user should be populated by authController.protect and represent the
	// application user row from the `users` table.
	if (!req.user) return next(new AppError('User not found', 404));

	res.status(200).json({
		status: 'success',
		// do not expose token in API responses
		data: (function () {
			try {
				const out = Object.assign({}, req.user);
				if (out && Object.prototype.hasOwnProperty.call(out, 'token')) delete out.token;
				return out;
			} catch (e) {
				return req.user;
			}
		})()
	});

});

exports.updateMe = catchAsync(async (req, res, next) => {
	if (!req.user) return next(new AppError('Not authenticated', 401));

	const supabase = getSupabase();

	// Only allow certain fields to be updated via this endpoint
	const allowed = ['name', 'email'];
	const updates = {};
	for (const key of allowed) {
		if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
	}

	if (Object.keys(updates).length === 0) return next(new AppError('No updatable fields provided', 400));

	// Prefer using the app user's primary id if available, otherwise fall back to email
	const filter = {};
	if (req.user.id) filter.id = req.user.id;
	else if (req.user.email) filter.email = req.user.email;
	else return next(new AppError('Unable to identify user for update', 500));

	const query = supabase.from('users').update(updates).select().limit(1);
	if (filter.id) query.eq('id', filter.id);
	else query.eq('email', filter.email);

	const { data, error } = await query.maybeSingle();
	if (error) return next(new AppError(error.message || 'Failed to update user', 500));

	// Do not expose token in the response
	let out = data;
	try {
		if (out && Object.prototype.hasOwnProperty.call(out, 'token')) {
			const copy = Object.assign({}, out);
			delete copy.token;
			out = copy;
		}
	} catch (e) {
		// ignore and return original data if something unexpected happens
	}

	res.status(200).json({ status: 'success', data: out });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
	if (!req.user) return next(new AppError('Not authenticated', 401));

	const supabase = getSupabase();

	const filter = {};
	if (req.user.id) filter.id = req.user.id;
	else if (req.user.email) filter.email = req.user.email;
	else return next(new AppError('Unable to identify user for delete', 500));

	// soft-delete: set `isactive` to false instead of removing the row
	const query = supabase.from('users').update({ isactive: false }).select().limit(1);
	if (filter.id) query.eq('id', filter.id);
	else query.eq('email', filter.email);

	const { data, error } = await query.maybeSingle();
	if (error) return next(new AppError(error.message || 'Failed to deactivate user', 500));

	res.status(204).json({ status: 'success'});
});