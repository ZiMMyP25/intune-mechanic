import assert from 'node:assert/strict'
import test from 'node:test'
import worker from './index.js'

const validEnquiry = {
  name: 'Alex Customer',
  phone: '0407 088 849',
  email: 'alex@example.com',
  vehicle: '2020 Toyota Corolla',
  service: 'Scheduled servicing',
  registration: 'ABC123',
  comments: 'Please call after 3pm.',
  formStartedAt: Date.now() - 2000,
}

function enquiryRequest(body = validEnquiry, headers = {}) {
  return new Request('https://example.com/api/enquiry', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

function testContext() {
  return { waitUntil() {} }
}

test('valid enquiry sends to the configured inbox and preserves reply-to', async () => {
  const originalFetch = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options })
    return Response.json({ id: 'email-id-123' })
  }
  try {
    const response = await worker.fetch(enquiryRequest(validEnquiry, { Origin: 'https://example.com' }), {
      RESEND_API_KEY: 're_test_key',
      RESEND_FROM: 'In-House Mobile Mechanics <enquiries@example.com>',
    }, testContext())
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { ok: true })
    assert.equal(calls.length, 1)
    assert.equal(calls[0].url, 'https://api.resend.com/emails')
    const sent = JSON.parse(calls[0].options.body)
    assert.deepEqual(sent.to, ['inhousemobilemechanics@gmail.com'])
    assert.equal(sent.reply_to, validEnquiry.email)
    assert.equal(sent.from, 'In-House Mobile Mechanics <enquiries@example.com>')
    assert.match(sent.text, /2020 Toyota Corolla/)
    assert.match(sent.html, /Alex Customer/)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('invalid input and cross-origin requests are rejected before sending', async () => {
  const originalFetch = globalThis.fetch
  let calls = 0
  globalThis.fetch = async () => { calls += 1; return Response.json({ id: 'unexpected' }) }
  try {
    const invalid = await worker.fetch(enquiryRequest({ ...validEnquiry, email: 'not-an-email' }), { RESEND_API_KEY: 're_test_key' }, testContext())
    assert.equal(invalid.status, 400)
    assert.match((await invalid.json()).error, /valid email/i)
    const crossOrigin = await worker.fetch(enquiryRequest(validEnquiry, { Origin: 'https://attacker.example' }), { RESEND_API_KEY: 're_test_key' }, testContext())
    assert.equal(crossOrigin.status, 403)
    assert.equal(calls, 0)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('honeypot submissions are acknowledged without sending an email', async () => {
  const originalFetch = globalThis.fetch
  let calls = 0
  globalThis.fetch = async () => { calls += 1; return Response.json({ id: 'unexpected' }) }
  try {
    const response = await worker.fetch(enquiryRequest({ ...validEnquiry, website: 'spam link' }), { RESEND_API_KEY: 're_test_key' }, testContext())
    assert.equal(response.status, 202)
    assert.deepEqual(await response.json(), { ok: true })
    assert.equal(calls, 0)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('delivery failures do not claim that an enquiry was sent', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => Response.json({ message: 'bad sender' }, { status: 422 })
  try {
    const response = await worker.fetch(enquiryRequest({ ...validEnquiry, email: 'failure@example.com' }), { RESEND_API_KEY: 're_test_key' }, testContext())
    assert.equal(response.status, 502)
    assert.deepEqual(await response.json(), { error: 'Email delivery is temporarily unavailable.' })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('a response without a Resend message id is treated as a delivery failure', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => Response.json({})
  try {
    const response = await worker.fetch(enquiryRequest({ ...validEnquiry, email: 'missing-id@example.com' }), { RESEND_API_KEY: 're_test_key' }, testContext())
    assert.equal(response.status, 502)
    assert.deepEqual(await response.json(), { error: 'Email delivery is temporarily unavailable.' })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('submissions from one Cloudflare connection are rate limited in the Worker isolate', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => Response.json({ id: 'email-id-456' })
  try {
    const env = { RESEND_API_KEY: 're_test_key' }
    const headers = { 'CF-Connecting-IP': '203.0.113.7' }
    for (let count = 0; count < 5; count += 1) {
      const response = await worker.fetch(enquiryRequest({ ...validEnquiry, email: `customer-${count}@example.com` }, headers), env, testContext())
      assert.equal(response.status, 200)
    }
    const limited = await worker.fetch(enquiryRequest({ ...validEnquiry, email: 'customer-six@example.com' }, headers), env, testContext())
    assert.equal(limited.status, 429)
    assert.equal(limited.headers.get('retry-after'), '600')
  } finally {
    globalThis.fetch = originalFetch
  }
})
