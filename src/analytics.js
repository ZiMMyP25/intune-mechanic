import { useEffect } from 'react'

const endpoint = '/api/analytics/event'
let recordedPageLoad = false

function deviceType() {
  if (window.innerWidth < 700) return 'mobile'
  if (window.innerWidth < 1024) return 'tablet'
  return 'desktop'
}

function eventDetails(element) {
  const link = element?.closest?.('a, button')
  if (!link) return null
  const href = link.getAttribute('href') || ''
  const label = (link.getAttribute('aria-label') || link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100)
  let target = 'button'
  if (href.startsWith('tel:')) target = 'phone'
  else if (href.startsWith('mailto:')) target = 'email'
  else if (href === '#booking') target = 'booking'
  else if (href.startsWith('#')) target = href.slice(1)
  return { target, label }
}

function send(payload) {
  const body = JSON.stringify(payload)
  if (navigator.sendBeacon && navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }))) {
    return
  }
  fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {})
}

export function AnalyticsTracker() {
  useEffect(() => {
    if (window.location.pathname === '/owner-insights' || navigator.doNotTrack === '1') return undefined

    let sessionId
    try {
      sessionId = sessionStorage.getItem('ihmm-analytics-session') || crypto.randomUUID()
      sessionStorage.setItem('ihmm-analytics-session', sessionId)
    } catch {
      sessionId = crypto.randomUUID()
    }
    const base = { sessionId, path: window.location.pathname, device: deviceType(), referrer: document.referrer }
    if (!recordedPageLoad) {
      send({ ...base, type: 'page_view' })
      recordedPageLoad = true
    }

    const seenSections = new Set()
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < .35 || seenSections.has(entry.target.id)) return
          seenSections.add(entry.target.id)
          send({ ...base, type: 'section_view', section: entry.target.id })
        })
      }, { threshold: [.35] }) : null
    document.querySelectorAll('main section[id], main header[id]').forEach((section) => observer?.observe(section))

    const click = (event) => {
      const details = eventDetails(event.target)
      if (details) send({ ...base, type: 'click', section: event.target.closest('section[id], header[id]')?.id || '', ...details })
    }
    const focus = (event) => {
      if (!event.target.closest('.night-booking-form, .booking-form, form')) return
      send({ ...base, type: 'booking_start', target: 'booking-form', label: 'Booking form started' })
      document.removeEventListener('focusin', focus)
    }
    document.addEventListener('click', click)
    document.addEventListener('focusin', focus)
    return () => {
      observer?.disconnect()
      document.removeEventListener('click', click)
      document.removeEventListener('focusin', focus)
    }
  }, [])

  return null
}
