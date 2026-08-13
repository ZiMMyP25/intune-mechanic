import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const devEvents = []

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => { body += chunk })
    request.on('end', () => { try { resolve(JSON.parse(body || '{}')) } catch (error) { reject(error) } })
  })
}

function send(response, status, value, headers = {}) {
  response.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers })
  response.end(value == null ? '' : JSON.stringify(value))
}

function demoData(days) {
  const daily = Array.from({ length: Math.min(days, 30) }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - Math.min(days, 30) + index + 1)
    return { date: date.toISOString().slice(0, 10), label: date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }), visits: 22 + ((index * 11) % 29), conversions: 1 + ((index * 3) % 5) }
  })
  const liveViews = new Set(devEvents.filter((item) => item.type === 'page_view').map((item) => item.sessionId)).size
  const visits = daily.reduce((sum, item) => sum + item.visits, 0) + liveViews
  const conversions = daily.reduce((sum, item) => sum + item.conversions, 0)
  return {
    configured: true,
    totals: { visits, bookingStarts: Math.round(visits * .19), conversions, clicks: Math.round(visits * 1.42) },
    daily,
    sections: [
      { name: 'car-services', count: Math.round(visits * .72), share: 29.4, intentCount: 118 }, { name: 'car-repairs', count: Math.round(visits * .58), share: 23.7, intentCount: 96 }, { name: 'about', count: Math.round(visits * .39), share: 15.9, intentCount: 34 }, { name: 'info-centre', count: Math.round(visits * .33), share: 13.5, intentCount: 28 }, { name: 'contact', count: Math.round(visits * .28), share: 11.4, intentCount: 82 }, { name: 'night-reviews', count: Math.round(visits * .15), share: 6.1, intentCount: 17 },
    ],
    actions: [
      { name: 'Book a service', count: Math.round(visits * .26), share: 28.2 }, { name: 'Call now', count: Math.round(visits * .22), share: 23.9 }, { name: 'Book this service', count: Math.round(visits * .19), share: 20.7 }, { name: 'Talk through your service', count: Math.round(visits * .13), share: 14.1 }, { name: 'Ask us', count: Math.round(visits * .12), share: 13.1 },
    ],
    sources: [
      { name: 'Google', count: Math.round(visits * .49), share: 49 }, { name: 'Direct', count: Math.round(visits * .28), share: 28 }, { name: 'Facebook / Instagram', count: Math.round(visits * .13), share: 13 }, { name: 'Referral', count: Math.round(visits * .1), share: 10 },
    ],
    devices: [
      { name: 'mobile', count: Math.round(visits * .67), share: 67 }, { name: 'desktop', count: Math.round(visits * .27), share: 27 }, { name: 'tablet', count: Math.round(visits * .06), share: 6 },
    ],
    hours: [],
  }
}

function analyticsDevApi() {
  return {
    name: 'analytics-dev-api',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url, 'http://localhost')
        if (!url.pathname.startsWith('/api/')) return next()
        if (url.pathname === '/api/analytics/event' && request.method === 'POST') {
          try { devEvents.push(await readBody(request)); send(response, 204, null) } catch { send(response, 400, { error: 'Invalid event' }) }
          return
        }
        if (url.pathname === '/api/owner/login' && request.method === 'POST') {
          try {
            const body = await readBody(request)
            if (body.password !== 'V3gipwfzu') return send(response, 401, { error: 'Invalid credentials' })
            return send(response, 200, { ok: true }, { 'set-cookie': 'ihmm_owner=dev-owner; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800' })
          } catch { return send(response, 400, { error: 'Invalid request' }) }
        }
        if (url.pathname === '/api/owner/logout' && request.method === 'POST') return send(response, 200, { ok: true }, { 'set-cookie': 'ihmm_owner=; Path=/; HttpOnly; Max-Age=0' })
        if (url.pathname === '/api/owner/analytics' && request.method === 'GET') {
          if (!request.headers.cookie?.includes('ihmm_owner=dev-owner')) return send(response, 401, { error: 'Unauthorized' })
          return send(response, 200, demoData(Math.min(90, Math.max(7, Number(url.searchParams.get('days')) || 30))))
        }
        next()
      })
    },
  }
}

export default defineConfig({ plugins: [react(), analyticsDevApi()] })
