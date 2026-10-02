const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    section_id TEXT,
    target TEXT,
    label TEXT,
    path TEXT NOT NULL,
    referrer_host TEXT,
    device_type TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_analytics_events_created_type ON analytics_events(created_at, event_type)`,
  `CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id)`,
]

const encoder = new TextEncoder()
let schemaPromise

const ENQUIRY_TO = 'inhousemobilemechanics@gmail.com'
const ENQUIRY_DEFAULT_FROM = 'In-House Mobile Mechanics <enquiries@inhousemobilemechanics.com.au>'
const ENQUIRY_RATE_WINDOW_SECONDS = 10 * 60
const ENQUIRY_RATE_LIMIT = 5
// This is deliberately bounded and best-effort per isolate; the form's honeypot,
// timing check, input limits, and same-origin check remain effective without a DB binding.
const enquiryAttempts = new Map()

function json(value, init = {}) {
  return new Response(JSON.stringify(value), { ...init, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...(init.headers || {}) } })
}

function withSecurityHeaders(response, extra = {}) {
  const headers = new Headers(response.headers)
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), geolocation=(), microphone=()')
  Object.entries(extra).forEach(([name, value]) => headers.set(name, value))
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

function requestError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

async function readRequestBody(request, maxBytes) {
  const contentLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > maxBytes) throw requestError('Request body too large', 413)

  const reader = request.body?.getReader()
  if (!reader) return ''
  const chunks = []
  let total = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxBytes) throw requestError('Request body too large', 413)
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const bytes = new Uint8Array(total)
  let offset = 0
  chunks.forEach((chunk) => {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  })
  return new TextDecoder().decode(bytes)
}

async function readJson(request, maxBytes) {
  try {
    return JSON.parse(await readRequestBody(request, maxBytes) || '{}')
  } catch (error) {
    if (error.status) throw error
    throw requestError('Invalid JSON', 400)
  }
}

function clean(value, max = 100) {
  return typeof value === 'string' ? value.trim().replace(/[\u0000-\u001f]/g, '').slice(0, max) : ''
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function validateEnquiry(body) {
  const fields = {
    name: clean(body.name, 100),
    phone: clean(body.phone, 40),
    email: clean(body.email, 254).toLowerCase(),
    vehicle: clean(body.vehicle, 120),
    service: clean(body.service, 120),
    registration: clean(body.registration, 40),
    comments: clean(body.comments, 2000),
  }
  const errors = []
  if (fields.name.length < 2) errors.push('Please enter your name.')
  if (!/^[+()\d\s.-]{6,40}$/.test(fields.phone) || fields.phone.replace(/\D/g, '').length < 6) errors.push('Please enter a valid phone number.')
  if (fields.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errors.push('Please enter a valid email address.')
  if (!fields.vehicle) errors.push('Please enter your vehicle.')
  if (!fields.service) errors.push('Please select a service or repair.')
  return { fields, error: errors[0] || '' }
}

function enquiryEmail(fields) {
  const subject = `[Website enquiry] ${fields.service} — ${fields.name}`.slice(0, 180)
  const rows = [
    ['Name', fields.name],
    ['Phone', fields.phone],
    ['Email', fields.email],
    ['Vehicle', fields.vehicle],
    ['Service or repair', fields.service],
    ['Vehicle registration', fields.registration || 'Not provided'],
    ['Additional comments', fields.comments || 'None provided'],
  ]
  const html = `<h1>New website enquiry</h1><p>A customer submitted the enquiry form on inhousemobilemechanics.com.au.</p><table style="border-collapse:collapse"><tbody>${rows.map(([label, value]) => `<tr><th style="padding:8px 16px 8px 0;text-align:left;vertical-align:top">${escapeHtml(label)}</th><td style="padding:8px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('')}</tbody></table>`
  const text = ['New website enquiry', '', 'A customer submitted the enquiry form on inhousemobilemechanics.com.au.', '', ...rows.map(([label, value]) => `${label}: ${value}`)].join('\n')
  return { subject, html, text }
}

async function enquiryRateKey(request) {
  const ip = request.headers.get('CF-Connecting-IP')
  if (!ip) return ''
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`enquiry-rate:${ip}`))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function enquiryRateLimited(request) {
  const key = await enquiryRateKey(request)
  if (!key) return false
  const now = Date.now()
  const windowMs = ENQUIRY_RATE_WINDOW_SECONDS * 1000
  for (const [storedKey, attempt] of enquiryAttempts) {
    if (now - attempt.startedAt >= windowMs) enquiryAttempts.delete(storedKey)
  }
  if (enquiryAttempts.size >= 2000 && !enquiryAttempts.has(key)) enquiryAttempts.delete(enquiryAttempts.keys().next().value)
  const attempt = enquiryAttempts.get(key)
  if (!attempt || now - attempt.startedAt >= windowMs) {
    enquiryAttempts.set(key, { startedAt: now, count: 1 })
    return false
  }
  if (attempt.count >= ENQUIRY_RATE_LIMIT) return true
  attempt.count += 1
  return false
}

async function sendEnquiryEmail(fields, env) {
  if (!env.RESEND_API_KEY) throw requestError('Email delivery is not configured.', 503)
  const { subject, html, text } = enquiryEmail(fields)
  let response
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        from: env.RESEND_FROM || ENQUIRY_DEFAULT_FROM,
        to: [ENQUIRY_TO],
        reply_to: fields.email,
        subject,
        html,
        text,
      }),
      signal: AbortSignal.timeout(15000),
    })
  } catch (error) {
    console.error(JSON.stringify({ message: 'Resend request failed', error: error instanceof Error ? error.message : String(error) }))
    throw requestError('Email delivery is temporarily unavailable.', 502)
  }
  let result = {}
  try { result = await response.json() } catch { /* Resend normally returns JSON; status still determines the result. */ }
  if (!response.ok || typeof result?.id !== 'string' || !result.id) {
    console.error(JSON.stringify({ message: 'Resend rejected enquiry email', status: response.status, error: result?.name || result?.message || 'unknown' }))
    throw requestError('Email delivery is temporarily unavailable.', 502)
  }
  return result
}

async function enquiry(request, env) {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Invalid origin' }, { status: 403 })
  let body
  try { body = await readJson(request, 16 * 1024) } catch (error) { return json({ error: error.message }, { status: error.status || 400 }) }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Invalid enquiry' }, { status: 400 })
  if (clean(body.website, 100)) return json({ ok: true }, { status: 202 })
  const startedAt = Number(body.formStartedAt)
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < 900) return json({ error: 'Please take a moment to complete the form.' }, { status: 400 })
  const { fields, error } = validateEnquiry(body)
  if (error) return json({ error }, { status: 400 })
  if (await enquiryRateLimited(request)) return json({ error: 'Too many enquiries from this connection. Please try again in a few minutes.' }, { status: 429, headers: { 'retry-after': String(ENQUIRY_RATE_WINDOW_SECONDS) } })
  try {
    await sendEnquiryEmail(fields, env)
    return json({ ok: true })
  } catch (sendError) {
    return json({ error: sendError.message || 'Email delivery is temporarily unavailable.' }, { status: sendError.status || 502 })
  }
}

function cookieValue(request, name) {
  return request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) || ''
}

function toBase64Url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

async function signature(value, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return toBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))))
}

async function secureEqual(left, right) {
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(left)),
    crypto.subtle.digest('SHA-256', encoder.encode(right)),
  ])
  return crypto.subtle.timingSafeEqual(leftHash, rightHash)
}

function ownerAuthConfigured(env) {
  return Boolean(env.OWNER_ANALYTICS_PASSWORD && env.OWNER_SESSION_SECRET)
}

async function createSession(env) {
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 8
  const payload = `${expires}.${crypto.randomUUID()}`
  const sig = await signature(payload, env.OWNER_SESSION_SECRET)
  return `${payload}.${sig}`
}

async function isAuthenticated(request, env) {
  if (!ownerAuthConfigured(env)) return false
  const token = cookieValue(request, 'ihmm_owner')
  const parts = token.split('.')
  const expires = Number(parts[0])
  if (parts.length !== 3 || !Number.isFinite(expires) || expires < Date.now() / 1000) return false
  const payload = `${parts[0]}.${parts[1]}`
  return secureEqual(parts[2], await signature(payload, env.OWNER_SESSION_SECRET))
}

async function ensureSchema(db) {
  if (!schemaPromise) {
    schemaPromise = db.batch(schemaStatements.map((statement) => db.prepare(statement))).catch((error) => {
      schemaPromise = undefined
      throw error
    })
  }
  await schemaPromise
}

function hostFromReferrer(referrer) {
  try { return new URL(referrer).hostname.replace(/^www\./, '') || 'Direct' } catch { return 'Direct' }
}

async function recordEvent(request, env, ctx) {
  if (!env.DB) return new Response(null, { status: 204 })
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Invalid origin' }, { status: 403 })
  let body
  try { body = await readJson(request, 4096) } catch (error) { return json({ error: error.message }, { status: error.status || 400 }) }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Invalid event' }, { status: 400 })
  const allowed = new Set(['page_view', 'section_view', 'click', 'booking_start', 'booking_submit'])
  const type = clean(body.type, 30)
  const sessionId = clean(body.sessionId, 64)
  if (!allowed.has(type) || !sessionId) return json({ error: 'Invalid event' }, { status: 400 })
  ctx.waitUntil((async () => {
    try {
      await ensureSchema(env.DB)
      await env.DB.prepare(`INSERT INTO analytics_events (session_id,event_type,section_id,target,label,path,referrer_host,device_type,created_at) VALUES (?,?,?,?,?,?,?,?,?)`)
        .bind(sessionId, type, clean(body.section, 60) || null, clean(body.target, 60) || null, clean(body.label, 100) || null, clean(body.path, 120) || '/', hostFromReferrer(body.referrer), ['mobile','tablet','desktop'].includes(body.device) ? body.device : 'other', Math.floor(Date.now() / 1000)).run()
    } catch (error) {
      console.error(JSON.stringify({ message: 'analytics event could not be recorded', error: error instanceof Error ? error.message : String(error) }))
    }
  })())
  return new Response(null, { status: 204 })
}

async function login(request, env) {
  if (!ownerAuthConfigured(env)) return json({ error: 'Owner authentication is not configured.' }, { status: 503 })
  let password
  try { password = String((await readJson(request, 2048)).password || '') } catch (error) { return json({ error: error.message }, { status: error.status || 400 }) }
  if (!await secureEqual(password, env.OWNER_ANALYTICS_PASSWORD)) return json({ error: 'Invalid credentials' }, { status: 401 })
  const token = await createSession(env)
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  return json({ ok: true }, { headers: { 'set-cookie': `ihmm_owner=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${secure}` } })
}

function rows(result) { return result?.results || [] }
function ranked(items) {
  const total = items.reduce((sum, item) => sum + Number(item.count), 0) || 1
  return items.map((item) => ({ ...item, count: Number(item.count), share: Number(item.count) / total * 100 }))
}

async function analytics(request, env) {
  if (!(await isAuthenticated(request, env))) return json({ error: 'Unauthorized' }, { status: 401 })
  if (!env.DB) return json({ configured: false, totals: { visits: 0, bookingStarts: 0, conversions: 0, clicks: 0 }, daily: [], sections: [], actions: [], sources: [], devices: [], hours: [] })
  try {
    await ensureSchema(env.DB)
    const days = Math.min(90, Math.max(7, Number(new URL(request.url).searchParams.get('days')) || 30))
    const since = Math.floor(Date.now() / 1000) - days * 86400
    const [totalsResult, dailyResult, sectionsResult, actionsResult, sourcesResult, devicesResult] = await Promise.all([
      env.DB.prepare(`SELECT COUNT(DISTINCT CASE WHEN event_type='page_view' THEN session_id END) visits, SUM(event_type='booking_start') bookingStarts, SUM(event_type='booking_submit') conversions, SUM(event_type='click') clicks FROM analytics_events WHERE created_at>=?`).bind(since).first(),
      env.DB.prepare(`SELECT date(created_at,'unixepoch') date, COUNT(DISTINCT CASE WHEN event_type='page_view' THEN session_id END) visits, SUM(event_type='booking_submit') conversions FROM analytics_events WHERE created_at>=? GROUP BY date ORDER BY date`).bind(since).all(),
      env.DB.prepare(`SELECT section_id name, COUNT(DISTINCT CASE WHEN event_type='section_view' THEN session_id END) count, SUM(CASE WHEN event_type='click' AND target IN ('booking','phone','email') THEN 1 ELSE 0 END) intentCount FROM analytics_events WHERE created_at>=? AND section_id IS NOT NULL GROUP BY section_id HAVING count>0 ORDER BY count DESC`).bind(since).all(),
      env.DB.prepare(`SELECT COALESCE(NULLIF(label,''), target, 'Unknown action') name, COUNT(*) count FROM analytics_events WHERE created_at>=? AND event_type='click' GROUP BY name ORDER BY count DESC`).bind(since).all(),
      env.DB.prepare(`SELECT COALESCE(NULLIF(referrer_host,''),'Direct') name, COUNT(DISTINCT session_id) count FROM analytics_events WHERE created_at>=? AND event_type='page_view' GROUP BY name ORDER BY count DESC`).bind(since).all(),
      env.DB.prepare(`SELECT device_type name, COUNT(DISTINCT session_id) count FROM analytics_events WHERE created_at>=? AND event_type='page_view' GROUP BY device_type ORDER BY count DESC`).bind(since).all(),
    ])
    const totals = { visits: Number(totalsResult?.visits || 0), bookingStarts: Number(totalsResult?.bookingStarts || 0), conversions: Number(totalsResult?.conversions || 0), clicks: Number(totalsResult?.clicks || 0) }
    return json({ configured: true, totals, daily: rows(dailyResult).map((item) => ({ ...item, visits: Number(item.visits), conversions: Number(item.conversions), label: new Date(`${item.date}T00:00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) })), sections: ranked(rows(sectionsResult)).map((item) => ({ ...item, intentCount: Number(item.intentCount || 0) })), actions: ranked(rows(actionsResult)), sources: ranked(rows(sourcesResult)), devices: ranked(rows(devicesResult)), hours: [] })
  } catch (error) {
    console.error(JSON.stringify({ message: 'analytics query failed', error: error instanceof Error ? error.message : String(error) }))
    return json({ error: 'Analytics unavailable' }, { status: 503 })
  }
}

async function ownerShell(request, env) {
  const indexRequest = new Request(new URL('/index.html', request.url), request)
  const indexResponse = await env.ASSETS.fetch(indexRequest)
  return withSecurityHeaders(indexResponse, { 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Cache-Control': 'no-store' })
}

function staticResponse(response, request) {
  const url = new URL(request.url)
  const headers = {}
  if (request.method === 'GET' && response.status === 200) {
    if (/^\/assets\/[^/]+-[\w-]+\.(?:js|css)$/.test(url.pathname)) headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    else if (url.pathname.startsWith('/assets/')) headers['Cache-Control'] = 'public, max-age=86400, stale-while-revalidate=604800'
    else if (url.pathname === '/index.html' || request.headers.get('accept')?.includes('text/html')) headers['Cache-Control'] = 'no-cache'
  }
  return withSecurityHeaders(response, headers)
}

const worker = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (url.pathname === '/api/enquiry') {
      if (request.method !== 'POST') return withSecurityHeaders(json({ error: 'Method not allowed' }, { status: 405, headers: { allow: 'POST' } }))
      return withSecurityHeaders(await enquiry(request, env))
    }
    if (url.pathname === '/api/analytics/event' && request.method === 'POST') return withSecurityHeaders(await recordEvent(request, env, ctx))
    if (url.pathname === '/api/owner/login' && request.method === 'POST') return withSecurityHeaders(await login(request, env))
    if (url.pathname === '/api/owner/logout' && request.method === 'POST') return withSecurityHeaders(json({ ok: true }, { headers: { 'set-cookie': 'ihmm_owner=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0' } }))
    if (url.pathname === '/api/owner/analytics' && request.method === 'GET') return withSecurityHeaders(await analytics(request, env))
    if (request.method === 'GET' && (url.pathname === '/owner-insights' || url.pathname === '/owner-insights/')) return ownerShell(request, env)
    const response = await env.ASSETS.fetch(request)
    if (response.status !== 404 || request.method !== 'GET') return staticResponse(response, request)
    if (!request.headers.get('accept')?.includes('text/html')) return staticResponse(response, request)
    const indexRequest = new Request(new URL('/index.html', request.url), request)
    return staticResponse(await env.ASSETS.fetch(indexRequest), indexRequest)
  },
}

export { enquiry }
export default worker
