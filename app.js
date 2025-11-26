const express = require('express');
const cors = require('cors');
const paasRouter = require('./router/paasRouter');
const userRouter = require('./router/userRouter');
const collectionRouter = require('./router/collectionRouter');
const AppError = require('./util/appError');
const globalErrorHandler = require('./controllers/errorController');
const dotenv = require('dotenv');
const morgan = require('morgan')

dotenv.config({ path: 'Config.env'});

const app = express();

if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors())
app.use(express.json({ limit: '1mb' }))

// Primary route for the PAAS API
app.use('/api/paas', paasRouter)
app.use('/api/paas/user', userRouter);
app.use('/api/paas/collection', collectionRouter);

// health
app.get('/health', (req, res) => res.json({ ok: true }))

// catch unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404))
})

// global error handler
app.use(globalErrorHandler);

module.exports = app
