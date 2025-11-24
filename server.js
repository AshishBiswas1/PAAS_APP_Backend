const dotenv = require('dotenv')
dotenv.config()

const app = require('./app')

const PORT = process.env.PORT || 8000

const server = app.listen(PORT, () => {
  console.log(`PAAS App backend listening on port ${PORT}`)
})

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION', err)
  server.close(() => process.exit(1))
})
