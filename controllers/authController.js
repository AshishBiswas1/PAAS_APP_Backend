const getSupabase = require('./../util/supabaseClient');
const AppError = require('./../util/appError');
const catchAsync = require('./../util/catchAsync');
const { status } = require('./requestController');

exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body || {}

    if (!email || !password) return next(new AppError('Email and password are required', 400))
    if (typeof password !== 'string' || password.length < 6) return next(new AppError('Password must be at least 6 characters', 400))

    const supabase = getSupabase()

    // Use Supabase Auth to sign up the user. v2 client exposes auth.signUp
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name }
        }
    })

    if (error) return next(new AppError(error.message || 'Signup failed', 400))

    // Do not return sensitive information. Supabase returns user and session info in data.
    res.status(201).json({
        status: 'success',
        data
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return next(new AppError('Please provide the email and password!', 400));
    }

    const supabase = getSupabase();

    // Use Supabase Auth to sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) return next(new AppError(error.message || 'Login failed', 400));

    const token = data.session.access_token;
    const user = data.user;

    // store the latest token for this user by updating the users table
    await supabase.from('users').update({ token }).eq('email', email);
    res.status(200).json({
        status: 'success',
        token,
        user
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    const auth = req.headers.authorization || '';
    if (auth && auth.startsWith('Bearer ')) token = auth.split(' ')[1];
    // also support cookie named 'paas_token' if present
    if (!token && req.headers.cookie) {
        const match = req.headers.cookie.match(/paas_token=([^;\s]+)/);
        if (match) token = match[1];
    }

    if (!token) return next(new AppError('You are not logged in. Please provide a token.', 401));

    const supabase = getSupabase();

    // First, try to find the application user by token in our custom `users` table
    let appUser = null;
    try {
        const { data: rows, error: qErr } = await supabase.from('users').select('*').eq('token', token).limit(1).maybeSingle();
        if (qErr) throw qErr;
        appUser = rows || null;
    } catch (e) {
        console.error('Error querying users table by token:', e.message || e);
    }

    if (!appUser) {
        const { data: userData, error } = await supabase.auth.getUser(token);
        if (error || !userData || !userData.user) return next(new AppError('Invalid or expired token', 401));

        try {
            const { data: rows2, error: qErr2 } = await supabase.from('users').select('*').eq('email', userData.user.email).limit(1).maybeSingle();
            if (qErr2) throw qErr2;
            appUser = rows2 || null;
        } catch (e) {
            console.error('Error querying users table by email:', e.message || e);
        }

        if (!appUser) {
            try {
                const insertRec = { email: userData.user.email, supabase_user_id: userData.user.id, token };
                const { data: inserted, error: insErr } = await supabase.from('users').insert(insertRec).select().maybeSingle();
                if (!insErr) appUser = inserted || null;
            } catch (e) {
                console.error('Failed to create app user row:', e.message || e);
            }
        }
    }

    if (!appUser) return next(new AppError('Invalid or expired token (no matching user)', 401));

    req.user = appUser;
    next();
});

// restrictTo middleware: restrict by roles stored on user metadata (user.user_metadata.role)
exports.restrictTo = (...allowedRoles) => (req, res, next) => {
    if (!req.user) return next(new AppError('Not authenticated', 401));
    // prefer role column on custom users table, fall back to user_metadata or role
    const userRole = req.user.role|| 'user';
    if (!allowedRoles.includes(userRole)) return next(new AppError('You do not have permission to perform this action', 403));
    next();
};