const AppError = require('../util/appError')

// send full error in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack
  })
}

// send minimal error in production
const sendErrorProd = (err, res) => {
  // operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } else {
    // programming or unknown error: don't leak details
    console.error('UNEXPECTED ERROR 💥', err)
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred'
    })
  }
}

module.exports = (err, req, res, next) => {
  // ensure defaults
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  // Handle common parsing errors (invalid JSON body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    err = new AppError('Invalid JSON payload', 400)
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  } else {
    // In production make a shallow copy so we don't accidentally modify original
    let error = Object.assign({}, err)
    // preserve message and statusCode
    error.message = err.message
    error.statusCode = err.statusCode
    error.status = err.status

    sendErrorProd(error, res)
  }
}
