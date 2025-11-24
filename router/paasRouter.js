const express = require('express')
const { proxyRequest, status } = require('../controllers/requestController')

const router = express.Router()

// POST /api/paas/request
router.post('/request', proxyRequest)

// POST /api/paas/proxy - simple proxy endpoint that accepts { url, method?, headers?, body? }
router.post('/proxy', proxyRequest)

// simple status route
router.get('/status', status)

module.exports = router
