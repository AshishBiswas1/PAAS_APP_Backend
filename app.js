const express = require('express');
const cors = require('cors');
const paasRouter = require('./router/paasRouter');
const AppError = require('./util/appError');
const dotenv = require('dotenv');

dotenv.config({ path: 'Config.env'});

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

// Primary route for the PAAS API
app.use('/api/paas', paasRouter)

// health
app.get('/health', (req, res) => res.json({ ok: true }))

// catch unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404))
})

// global error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  })
})

module.exports = app
