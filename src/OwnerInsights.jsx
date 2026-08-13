import React, { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDown, ArrowUp, BarChart3, CalendarDays, Eye, LogOut, MousePointerClick, RefreshCw, ShieldCheck, Smartphone, Target } from 'lucide-react'
import './owner-insights.css'

const sectionNames = {
  'night-top': 'Home hero',
  'car-services': 'Car Services',
  'car-repairs': 'Car Repairs',
  about: 'About Us',
  'night-reviews': 'Customer reviews',
  'info-centre': 'Frequently Asked Questions',
  contact: 'Contact & booking',
}

const emptyData = { totals: { visits: 0, bookingStarts: 0, conversions: 0, clicks: 0 }, daily: [], sections: [], actions: [], sources: [], devices: [], hours: [], configured: true }

function number(value) { return new Intl.NumberFormat('en-AU').format(value || 0) }
function percent(value) { return `${Number(value || 0).toFixed(1)}%` }

function Login({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/owner/login', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }) })
      if (!response.ok) throw new Error('The password was not recognised.')
      onSuccess()
    } catch (reason) {
      setError(reason.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className="owner-login">
    <section className="owner-login-panel">
      <div className="owner-login-mark"><ShieldCheck size={28} /><span>In-House<br />Mobile Mechanics</span></div>
      <p>Private reporting</p>
      <h1>Owner<br />Insights</h1>
      <p className="owner-login-copy">Website performance, customer intent and the actions that lead to more bookings.</p>
      <form onSubmit={submit}>
        <label htmlFor="owner-password">Owner password</label>
        <input id="owner-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" autoFocus required />
        {error && <div className="owner-login-error" role="alert">{error}</div>}
        <button disabled={busy}>{busy ? 'Checking…' : 'Open dashboard'} <ArrowDown size={17} /></button>
      </form>
      <small>This page is intentionally unlisted. Analytics contain no form contents or customer contact details.</small>
    </section>
  </main>
}

function Metric({ label, value, sub, icon: Icon }) {
  return <article className="owner-metric"><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div><Icon size={22} /></article>
}

function TrendChart({ daily }) {
  const points = useMemo(() => {
    const values = daily.map((item) => item.visits)
    const max = Math.max(...values, 1)
    return daily.map((item, index) => `${daily.length === 1 ? 50 : index * (100 / (daily.length - 1))},${92 - (item.visits / max) * 78}`).join(' ')
  }, [daily])
  return <section className="owner-panel owner-trend">
    <div className="owner-panel-head"><div><span>Performance</span><h2>Visits & conversions</h2></div><div className="owner-key"><i /> Visits <i className="red" /> Requests</div></div>
    {daily.length ? <div className="owner-chart-wrap"><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Website visits over time"><g className="owner-chart-grid">{[20,40,60,80].map((y) => <line x1="0" y1={y} x2="100" y2={y} key={y} />)}</g><polyline points={points} /></svg><div className="owner-chart-labels">{daily.filter((_, i) => i % Math.max(1, Math.ceil(daily.length / 6)) === 0).map((item) => <span key={item.date}>{item.label}</span>)}</div></div> : <Empty label="Visits will appear after the first tracked session." />}
  </section>
}

function Empty({ label }) { return <div className="owner-empty"><Activity size={22} /><span>{label}</span></div> }

function Ranking({ title, eyebrow, rows, type }) {
  return <section className="owner-panel owner-ranking"><div className="owner-panel-head"><div><span>{eyebrow}</span><h2>{title}</h2></div></div>
    {rows.length ? <ol>{rows.slice(0, 7).map((row, index) => <li key={`${row.name}-${index}`}><b>{String(index + 1).padStart(2, '0')}</b><div><strong>{type === 'section' ? (sectionNames[row.name] || row.name) : row.name}</strong><span><i style={{ width: `${Math.max(5, row.share)}%` }} /></span></div><em>{number(row.count)}<small>{type === 'section' ? `${number(row.intentCount)} high-intent` : percent(row.share)}</small></em></li>)}</ol> : <Empty label="No activity in this date range." />}
  </section>
}

function Breakdown({ data }) {
  const total = data.reduce((sum, item) => sum + item.count, 0) || 1
  return <section className="owner-panel owner-breakdown"><div className="owner-panel-head"><div><span>Audience</span><h2>Device mix</h2></div></div><div className="owner-donut" style={{ '--mobile': `${((data.find((x) => x.name === 'mobile')?.count || 0) / total) * 360}deg`, '--tablet': `${(((data.find((x) => x.name === 'mobile')?.count || 0) + (data.find((x) => x.name === 'tablet')?.count || 0)) / total) * 360}deg` }}><strong>{number(total)}</strong><span>visits</span></div><ul>{data.map((item) => <li key={item.name}><span>{item.name}</span><strong>{percent(item.count / total * 100)}</strong></li>)}</ul></section>
}

function Signals({ data }) {
  const mobile = data.devices.find((item) => item.name === 'mobile')?.count || 0
  const visits = data.totals.visits || 1
  const topAction = data.actions[0]?.name || 'No click leader yet'
  const conversion = data.totals.conversions / visits * 100
  return <section className="owner-signals"><div><span>Business signals</span><h2>What to act on</h2></div><article><Target /><strong>{conversion >= 4 ? 'Healthy booking intent' : 'Conversion opportunity'}</strong><p>{percent(conversion)} of visits currently produce a booking request. Keep the booking path short and prominent.</p></article><article><Smartphone /><strong>{percent(mobile / visits * 100)} mobile audience</strong><p>Prioritise tap-friendly calls, short forms and fast-loading service imagery.</p></article><article><MousePointerClick /><strong>Top action: {topAction}</strong><p>Use the strongest-performing action consistently where customers are most engaged.</p></article></section>
}

export default function OwnerInsights() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(30)
  const [data, setData] = useState(emptyData)

  useEffect(() => {
    document.title = 'Owner Insights | In-House Mobile Mechanics'
    const robots = document.querySelector('meta[name="robots"]')
    if (robots) robots.setAttribute('content', 'noindex,nofollow,noarchive')
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/owner/analytics?days=${range}`, { credentials: 'same-origin' })
      if (response.status === 401) { setAuthenticated(false); return }
      if (!response.ok) throw new Error('Analytics could not be loaded.')
      setData(await response.json())
      setAuthenticated(true)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [range])
  const logout = async () => { await fetch('/api/owner/logout', { method: 'POST', credentials: 'same-origin' }); setAuthenticated(false) }
  if (!authenticated && !loading) return <Login onSuccess={load} />
  if (!authenticated) return <main className="owner-loading">Loading private reporting…</main>

  const visitToStart = data.totals.visits ? data.totals.bookingStarts / data.totals.visits * 100 : 0
  const startToSubmit = data.totals.bookingStarts ? data.totals.conversions / data.totals.bookingStarts * 100 : 0
  return <main className="owner-dashboard">
    <aside><div className="owner-brand"><BarChart3 /><span>In-House<br />Owner reporting</span></div><nav><a className="active" href="#overview"><Eye /> Overview</a><a href="#engagement"><MousePointerClick /> Engagement</a><a href="#signals"><Target /> Business signals</a></nav><div className="owner-privacy"><ShieldCheck /><span>Anonymous analytics only</span></div></aside>
    <div className="owner-main">
      <header><div><span>Private dashboard</span><h1>Owner Insights</h1></div><div className="owner-controls"><label><CalendarDays /><select value={range} onChange={(event) => setRange(Number(event.target.value))}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label><button onClick={load} aria-label="Refresh analytics"><RefreshCw /></button><button className="signout" onClick={logout}><LogOut /> Sign out</button></div></header>
      {!data.configured && <div className="owner-notice">Analytics storage is not configured on this deployment. Add the D1 binding to start collecting durable data.</div>}
      <section className="owner-metrics" id="overview"><Metric label="Visits" value={number(data.totals.visits)} sub={`Last ${range} days`} icon={Eye} /><Metric label="Booking intent" value={number(data.totals.bookingStarts)} sub={`${percent(visitToStart)} of visits`} icon={MousePointerClick} /><Metric label="Confirmed requests" value={number(data.totals.conversions)} sub={`${percent(startToSubmit)} of form starts`} icon={Target} /><Metric label="Tracked clicks" value={number(data.totals.clicks)} sub="Calls, bookings & navigation" icon={Activity} /></section>
      <div className="owner-grid" id="engagement"><TrendChart daily={data.daily} /><section className="owner-panel owner-funnel"><div className="owner-panel-head"><div><span>Journey</span><h2>Conversion funnel</h2></div></div><div className="owner-funnel-steps"><div><span>Website visits</span><strong>{number(data.totals.visits)}</strong><em>100%</em></div><div><span>Booking form started</span><strong>{number(data.totals.bookingStarts)}</strong><em>{percent(visitToStart)}</em></div><div><span>Request submitted</span><strong>{number(data.totals.conversions)}</strong><em>{percent(data.totals.visits ? data.totals.conversions / data.totals.visits * 100 : 0)}</em></div></div></section><Ranking title="Section engagement" eyebrow="What people explore" rows={data.sections} type="section" /><Ranking title="Top actions" eyebrow="What people click" rows={data.actions} /><section className="owner-panel owner-sources"><div className="owner-panel-head"><div><span>Acquisition</span><h2>Traffic sources</h2></div></div>{data.sources.length ? <table><thead><tr><th>Source</th><th>Visits</th><th>Share</th></tr></thead><tbody>{data.sources.map((item) => <tr key={item.name}><td>{item.name}</td><td>{number(item.count)}</td><td>{percent(item.share)}</td></tr>)}</tbody></table> : <Empty label="Traffic sources will appear after visits arrive." />}</section><Breakdown data={data.devices} /></div>
      <div id="signals"><Signals data={data} /></div>
      <footer>Privacy-first reporting · No names, contact details, form contents or full IP addresses are collected.</footer>
    </div>
  </main>
}
