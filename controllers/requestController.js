const AppError = require('../util/appError')
const catchAsync = require('../util/catchAsync')

function validateUrl(raw) {
  if (!raw || typeof raw !== 'string') return false

  try {
    const u = new URL(raw)
    if (!['http:', 'https:'].includes(u.protocol)) return false
    return true
  } catch (e) {
    return false
  }
}

exports.status = (req, res) => res.json({ ok: true })

exports.proxyRequest = catchAsync(async (req, res, next) => {
  const { method = 'GET', url, headers = {}, body } = req.body || {}

  if (!validateUrl(url)) return next(new AppError('Invalid or disallowed URL', 400))

  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'UPDATE']
  const mRaw = String(method || 'GET').toUpperCase()
  if (!allowedMethods.includes(mRaw)) return next(new AppError('HTTP method not allowed', 400))

  // Forward the exact method received (including non-standard 'UPDATE') so
  // test servers that expect a custom verb receive it. fetch supports custom methods.
  const init = { method: mRaw, headers: {} }
  Object.entries(headers || {}).forEach(([k, v]) => {
    const key = String(k)
    if (['connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailers','transfer-encoding','upgrade'].includes(key.toLowerCase())) return
    init.headers[key] = v
  })

  if (mRaw !== 'GET' && mRaw !== 'HEAD' && mRaw !== 'OPTIONS' && body != null) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body)
    if (!init.headers['Content-Type']) init.headers['Content-Type'] = 'application/json'
  }

  const t0 = Date.now()
  const resp = await fetch(url, init)
  const t1 = Date.now()
  // Read and parse response body: prefer JSON when available, otherwise fall back to text
  const outHeaders = {}
  resp.headers.forEach((v, k) => { outHeaders[k] = v })

  let parsedBody
  const contentType = (resp.headers.get('content-type') || '').toLowerCase()
  if (contentType.includes('application/json') || contentType.includes('+json')) {
    try {
      parsedBody = await resp.json()
    } catch (e) {
      // If JSON parsing fails unexpectedly, fall back to text
      parsedBody = await resp.text()
    }
  } else {
    const txt = await resp.text()
    try {
      parsedBody = JSON.parse(txt)
    } catch (e) {
      parsedBody = txt
    }
  }

  res.json({
    status: resp.status,
    statusText: resp.statusText,
    timeMs: t1 - t0,
    headers: outHeaders,
    body: parsedBody
  })
})

