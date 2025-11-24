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

  const respText = await resp.text()
  const outHeaders = {}
  resp.headers.forEach((v, k) => { outHeaders[k] = v })

  res.json({
    status: resp.status,
    statusText: resp.statusText,
    timeMs: t1 - t0,
    headers: outHeaders,
    body: respText
  })
})

