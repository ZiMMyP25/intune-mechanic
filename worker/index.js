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

function json(value, init = {}) {
  return new Response(JSON.stringify(value), { ...init, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...(init.headers || {}) } })
}

function clean(value, max = 100) {
  return typeof value === 'string' ? value.trim().replace(/[\u0000-\u001f]/g, '').slice(0, max) : ''
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

async function createSession(env) {
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 8
  const payload = `${expires}.${crypto.randomUUID()}`
  const sig = await signature(payload, env.OWNER_SESSION_SECRET || `ihmm-owner-${env.OWNER_ANALYTICS_PASSWORD || 'V3gipwfzu'}`)
  return `${payload}.${sig}`
}

async function isAuthenticated(request, env) {
  const token = cookieValue(request, 'ihmm_owner')
  const parts = token.split('.')
  if (parts.length !== 3 || Number(parts[0]) < Date.now() / 1000) return false
  const payload = `${parts[0]}.${parts[1]}`
  return parts[2] === await signature(payload, env.OWNER_SESSION_SECRET || `ihmm-owner-${env.OWNER_ANALYTICS_PASSWORD || 'V3gipwfzu'}`)
}

async function ensureSchema(db) {
  await db.batch(schemaStatements.map((statement) => db.prepare(statement)))
}

function hostFromReferrer(referrer) {
  try { return new URL(referrer).hostname.replace(/^www\./, '') || 'Direct' } catch { return 'Direct' }
}

async function recordEvent(request, env) {
  if (!env.DB) return new Response(null, { status: 204 })
  let body
  try { body = await request.json() } catch { return json({ error: 'Invalid event' }, { status: 400 }) }
  const allowed = new Set(['page_view', 'section_view', 'click', 'booking_start', 'booking_submit'])
  const type = clean(body.type, 30)
  const sessionId = clean(body.sessionId, 64)
  if (!allowed.has(type) || !sessionId) return json({ error: 'Invalid event' }, { status: 400 })
  await ensureSchema(env.DB)
  await env.DB.prepare(`INSERT INTO analytics_events (session_id,event_type,section_id,target,label,path,referrer_host,device_type,created_at) VALUES (?,?,?,?,?,?,?,?,?)`)
    .bind(sessionId, type, clean(body.section, 60) || null, clean(body.target, 60) || null, clean(body.label, 100) || null, clean(body.path, 120) || '/', hostFromReferrer(body.referrer), ['mobile','tablet','desktop'].includes(body.device) ? body.device : 'other', Math.floor(Date.now() / 1000)).run()
  return new Response(null, { status: 204 })
}

async function login(request, env) {
  let password = ''
  try { password = String((await request.json()).password || '') } catch { return json({ error: 'Invalid request' }, { status: 400 }) }
  const expectedHash = await signature(env.OWNER_ANALYTICS_PASSWORD || 'V3gipwfzu', 'ihmm-password-check')
  const providedHash = await signature(password, 'ihmm-password-check')
  if (providedHash !== expectedHash) return json({ error: 'Invalid credentials' }, { status: 401 })
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
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/api/analytics/event' && request.method === 'POST') return recordEvent(request, env)
    if (url.pathname === '/api/owner/login' && request.method === 'POST') return login(request, env)
    if (url.pathname === '/api/owner/logout' && request.method === 'POST') return json({ ok: true }, { headers: { 'set-cookie': 'ihmm_owner=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0' } })
    if (url.pathname === '/api/owner/analytics' && request.method === 'GET') return analytics(request, env)
    const response = await env.ASSETS.fetch(request)
    if (response.status !== 404 || request.method !== 'GET') return response
    if (!request.headers.get('accept')?.includes('text/html')) return response
    const indexRequest = new Request(new URL('/index.html', request.url), request)
    const indexResponse = await env.ASSETS.fetch(indexRequest)
    if (url.pathname === '/owner-insights') {
      const headers = new Headers(indexResponse.headers)
      headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
      headers.set('Cache-Control', 'no-store')
      return new Response(indexResponse.body, { status: indexResponse.status, headers })
    }
    return indexResponse
  },
}

export default worker
