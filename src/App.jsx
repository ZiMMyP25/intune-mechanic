import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Mail,
  Menu,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const services = [
  {
    title: 'Scheduled servicing',
    number: '01',
    copy: 'Manufacturer-aligned maintenance using genuine or guaranteed new parts, completed at your home or workplace.',
    image: '/assets/service-scheduled.png',
    detail: 'Log book servicing · Warranty-safe care',
  },
  {
    title: 'Diagnostics',
    number: '02',
    copy: 'Dealer-level fault finding and clear explanations before any work begins. No guessing. No unnecessary parts.',
    image: '/assets/service-diagnostics.png',
    detail: 'Engine lights · Electrical faults · Scan tools',
  },
  {
    title: 'Brakes & batteries',
    number: '03',
    copy: 'Safety-critical systems inspected, tested and restored with meticulous attention to the details that matter.',
    image: '/assets/service-brakes-batteries.png',
    detail: 'Brakes · Clutches · Starting & charging',
  },
  {
    title: 'Breakdown support',
    number: '04',
    copy: 'When the day goes sideways, Peter brings the workshop to the roadside with calm, capable support.',
    image: '/assets/intune-hero.png',
    detail: '24/7 breakdowns · Pre-purchase inspections',
  },
]

const signalServiceGroups = [
  { title: 'Mechanical repairs', items: ['All mechanical repairs', 'Overheating problems'] },
  { title: 'Log book servicing', items: ['Dealer and log book services', 'Manufacturer warranty protected'] },
  { title: 'Starting & charging', items: ['Batteries', 'Alternators', 'Starter motors'] },
  { title: 'Brakes & clutch', items: ['Brake repairs', 'Clutch repairs', '12-month parts and labour warranty'] },
  { title: 'Diagnostics & breakdowns', items: ['Engine diagnostic services', '24/7 breakdown service'] },
  { title: 'Inspections & compliance', items: ['Mobile pink slips', 'Pre-purchase inspections', 'Fully licensed workshop'] },
]

const signalMarqueeServices = signalServiceGroups.flatMap(({ title, items }) => [title, ...items])

const pageStyles = [
  { id: 'atelier', name: 'In-House Atelier', note: 'New premium direction' },
  { id: 'signal', name: 'Signal Red', note: 'High-contrast workshop' },
  { id: 'night', name: 'Night Shift', note: 'Cinematic after-dark' },
]

const appointmentDays = [
  { label: 'Thu', date: '06 Aug', value: '2026-08-06' },
  { label: 'Fri', date: '07 Aug', value: '2026-08-07' },
  { label: 'Sat', date: '08 Aug', value: '2026-08-08' },
  { label: 'Mon', date: '10 Aug', value: '2026-08-10' },
  { label: 'Tue', date: '11 Aug', value: '2026-08-11' },
]

const appointmentTimes = ['8:00 am', '9:30 am', '11:00 am', '1:00 pm', '3:30 pm']

const appointmentMonthLabel = new Intl.DateTimeFormat('en-AU', { month: 'long', year: 'numeric' })
const appointmentWeekdayLabel = new Intl.DateTimeFormat('en-AU', { weekday: 'short' })
const appointmentShortMonthLabel = new Intl.DateTimeFormat('en-AU', { month: 'short' })

function signalAppointmentDays(monthOffset) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + monthOffset
  const date = new Date(year, month, monthOffset === 0 ? now.getDate() + 1 : 1)
  const days = []

  while (days.length < 5) {
    if (date.getDay() !== 0) {
      days.push({
        label: appointmentWeekdayLabel.format(date),
        date: `${date.getDate()} ${appointmentShortMonthLabel.format(date)}`,
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      })
    }
    date.setDate(date.getDate() + 1)
  }

  return days
}

const reviews = [
  { quote: 'Peter is professional, tidy and incredibly knowledgeable. It is dealership-level service without leaving home.', name: 'James W.', vehicle: 'Mercedes-Benz C-Class' },
  { quote: 'Clear advice, excellent work and absolutely no pressure. My car has never felt better.', name: 'Sarah M.', vehicle: 'Subaru Forester' },
  { quote: 'The rare kind of service you recommend without hesitation. Thoughtful from booking to handover.', name: 'Daniel K.', vehicle: 'Audi Q5' },
]

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="In-House Mobile Mechanics home">
      <img src="/assets/inhouse-logo-transparent.png" alt="In-House Mobile Mechanics" />
    </a>
  )
}

function Navigation() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav className={`navigation ${open ? 'is-open' : ''}`}>
      <div className="nav-inner">
        <Logo />
        <div className="nav-links">
          <a href="#services" onClick={close}>Services</a>
          <a href="#standard" onClick={close}>The standard</a>
          <a href="#reviews" onClick={close}>Reviews</a>
          <a className="nav-mobile-book" href="#booking" onClick={close}>Book Peter</a>
        </div>
        <a className="button button-red nav-book" href="#booking" onClick={close}>Book Peter <ArrowDownRight size={17} /></a>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  )
}

function StyleSwitcher({ theme, setTheme }) {
  const [open, setOpen] = useState(false)
  const current = pageStyles.find((style) => style.id === theme) || pageStyles[0]

  return (
    <div className={`style-switcher ${open ? 'is-open' : ''}`}>
      <button className="style-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Choose page style">
        <span className="style-trigger-dot" />
        <span><small>Page style</small><strong>{current.name}</strong></span>
        <span className="style-count">{pageStyles.findIndex((style) => style.id === current.id) + 1}/{pageStyles.length}</span>
        <ChevronDown size={15} />
      </button>
      <div className="style-options" role="menu">
        {pageStyles.map((style, index) => (
          <button key={style.id} className={current.id === style.id ? 'selected' : ''} onClick={() => { setTheme(style.id); setOpen(false) }} role="menuitem">
            <span className="style-number">0{index + 1}</span>
            <span><strong>{style.name}</strong><small>{style.note}</small></span>
            {current.id === style.id && <Check size={15} />}
          </button>
        ))}
      </div>
    </div>
  )
}

function Hero() {
  return (
    <header className="hero" id="top">
      <div className="hero-backdrop" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-media-wrap">
        <div className="hero-media" />
        <div className="hero-media-caption"><span>Peter Philippou</span><span>Mobile mechanic · Sydney</span></div>
      </div>
      <div className="hero-content">
        <p className="eyebrow">In-House Mobile Mechanics <span>·</span> MVRL62688</p>
        <h1>Serious care.<br /><em>Without the waiting room.</em></h1>
        <p className="hero-copy">Premium servicing and diagnostics, brought to your driveway by a mechanic who takes the time to do it properly.</p>
        <div className="hero-actions">
          <a className="button button-red" href="#booking">Book a service <ArrowDownRight size={18} /></a>
          <a className="text-link" href="#standard">See the standard <ArrowRight size={17} /></a>
        </div>
      </div>
      <div className="hero-footer">
        <span><span className="status-dot" /> Serving Sydney and surrounds</span>
        <span className="hero-scroll">Scroll to explore <ChevronDown size={16} /></span>
      </div>
    </header>
  )
}

function ServiceBento() {
  const [active, setActive] = useState(0)

  return (
    <section className="section services-section" id="services">
      <div className="section-intro shell">
        <div>
          <p className="eyebrow dark">The full workshop, at your curb</p>
          <h2>Every detail.<br /><em>Considered.</em></h2>
        </div>
        <p className="section-lede">From a routine service to an urgent diagnosis, Peter brings the equipment, experience and straight answers with him.</p>
      </div>
      <div className="service-bento shell">
        <div className="service-hero-card">
          <img src={services[0].image} alt="Mobile mechanic servicing a vehicle" />
          <div className="service-hero-overlay" />
          <div className="service-hero-copy"><span>01</span><h3>Workshop precision.<br />Driveway convenience.</h3><a href="#booking">Make time for your car <ArrowDownRight size={18} /></a></div>
        </div>
        <div className="service-side-card light-card"><span>12 MO</span><strong>Parts & labour warranty</strong><p>Confidence built into every job.</p></div>
        <div className="service-side-card red-card"><span>24 / 7</span><strong>Breakdown support</strong><p>When your plans change suddenly.</p></div>
        <div className="service-side-card photo-card"><img src="/assets/service-diagnostics.png" alt="Vehicle diagnostic equipment" /><span>Clear diagnosis</span></div>
        <div className="service-side-card light-card warranty-card"><span>GENUINE</span><strong>Or guaranteed new parts</strong><p>Care that protects your vehicle and its warranty.</p></div>
      </div>
      <div className="service-accordion shell" aria-label="Explore services">
        <div className="accordion-heading"><p className="eyebrow dark">Explore the work</p><p>Hover or select a service</p></div>
        <div className="accordion-list">
          {services.map((service, index) => (
            <button className={`service-slice ${active === index ? 'active' : ''}`} key={service.title} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)}>
              <div className="slice-top"><span>{service.number}</span><ChevronRight size={18} /></div>
              <h3>{service.title}</h3>
              <div className="slice-detail"><p>{service.copy}</p><span>{service.detail}</span><a href="#booking" onClick={(event) => event.stopPropagation()}>Book this service <ArrowDownRight size={16} /></a></div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function StandardSection() {
  const words = useMemo(() => 'No waiting rooms. No unnecessary upsells. Just considered advice, meticulous workmanship and a mechanic who knows your name.'.split(' '), [])

  return (
    <section className="standard-section" id="standard">
      <div className="standard-pin shell">
        <p className="eyebrow">The In-House standard</p>
        <h2>A better way<br />to <em>look after</em><br />your car.</h2>
        <div className="standard-signature"><img src="/assets/inhouse-logo-transparent.png" alt="In-House Mobile Mechanics" /><p>Peter Philippou<br /><span>Licensed mobile mechanic</span></p></div>
      </div>
      <div className="standard-rail">
        <article className="proof-card proof-large"><img src="/assets/service-scheduled.png" alt="A mobile mechanic completing a scheduled oil service at a customer's home" /><div className="proof-scrim" /><div className="proof-card-copy"><span>Built around your day</span><strong>Keep your morning.<br />We will bring the workshop.</strong></div></article>
        <article className="proof-card proof-quote"><span className="quote-mark">“</span><p>Professional, tidy and incredibly knowledgeable. It is dealership-level service without leaving home.</p><strong>James W.</strong><small>Mercedes-Benz C-Class</small></article>
        <article className="proof-card proof-image"><img src="/assets/service-diagnostics.png" alt="Professional vehicle diagnostics carried out by a mobile mechanic" /></article>
        <div className="word-reveal" aria-label={words.join(' ')}>{words.map((word, index) => <span key={`${word}-${index}`}>{word}&nbsp;</span>)}</div>
      </div>
    </section>
  )
}

function Reviews() {
  const [index, setIndex] = useState(0)
  const review = reviews[index]
  const next = () => setIndex((index + 1) % reviews.length)
  const previous = () => setIndex((index + reviews.length - 1) % reviews.length)

  return (
    <section className="reviews" id="reviews">
      <div className="reviews-inner shell">
        <div className="reviews-heading"><p className="eyebrow dark">A considered experience</p><h2>Good work<br /><em>travels.</em></h2></div>
        <div className="review-stage">
          <div className="review-portrait"><img src="/assets/signal-story-mechanic.png" alt="An In-House mobile mechanic beside his workshop van" /><span>In-house care, outside the workshop</span></div>
          <div className="review-copy"><span className="quote-mark">“</span><blockquote key={review.quote}>{review.quote}</blockquote><div className="review-person"><strong>{review.name}</strong><span>{review.vehicle}</span></div><div className="review-controls"><button onClick={previous} aria-label="Previous review"><ArrowLeft size={18} /></button><span>0{index + 1} <i>/</i> 0{reviews.length}</span><button onClick={next} aria-label="Next review"><ArrowRight size={18} /></button></div></div>
        </div>
      </div>
    </section>
  )
}

function Booking() {
  const [day, setDay] = useState(appointmentDays[1].value)
  const [time, setTime] = useState(appointmentTimes[1])
  const [service, setService] = useState('Scheduled servicing')
  const [sent, setSent] = useState(false)

  if (sent) {
    return <section className="booking-section" id="booking"><div className="booking-success shell"><div className="success-icon"><Check size={24} /></div><p className="eyebrow dark">Request received</p><h2>Peter will be<br /><em>in touch shortly.</em></h2><p>Your preferred time is {appointmentDays.find((item) => item.value === day)?.date} at {time}. We will confirm the visit and access details with you directly.</p><button className="button button-dark" onClick={() => setSent(false)}>Make another request <ArrowRight size={17} /></button></div></section>
  }

  return (
    <section className="booking-section" id="booking">
      <div className="shell booking-layout">
        <div className="booking-copy"><p className="eyebrow dark">Make time for your car</p><h2>Pick a time.<br /><em>We will come to you.</em></h2><p>Choose a preferred appointment and Peter will personally confirm the timing, access and what your vehicle needs.</p><div className="booking-contact"><a href="tel:0407088849"><Phone size={16} /> 0407 088 849</a><a href="mailto:inhousemobilemechanics@gmail.com"><Mail size={16} /> Email Peter</a></div></div>
        <form className="booking-form" onSubmit={(event) => { event.preventDefault(); setSent(true) }}>
          <div className="form-section"><div className="form-label"><CalendarDays size={17} /><span>Preferred day</span></div><div className="day-options">{appointmentDays.map((item) => <button type="button" key={item.value} className={day === item.value ? 'selected' : ''} onClick={() => setDay(item.value)}><small>{item.label}</small><strong>{item.date.split(' ')[0]}</strong><span>{item.date.split(' ')[1]}</span></button>)}</div></div>
          <div className="form-section"><div className="form-label"><Clock3 size={17} /><span>Preferred time</span></div><div className="time-options">{appointmentTimes.map((item) => <button type="button" key={item} className={time === item ? 'selected' : ''} onClick={() => setTime(item)}>{item}</button>)}</div></div>
          <div className="form-section form-details"><label>Your name<input required name="name" placeholder="Full name" /></label><label>Email address<input required type="email" name="email" placeholder="you@example.com" /></label><label>Vehicle and service<select value={service} onChange={(event) => setService(event.target.value)} name="service"><option>Scheduled servicing</option><option>Diagnostics</option><option>Brakes & batteries</option><option>Breakdown support</option><option>Pre-purchase inspection</option></select></label></div>
          <button className="button button-red full-button" type="submit">Request {appointmentDays.find((item) => item.value === day)?.date} at {time} <ArrowRight size={18} /></button><small className="form-note"><ShieldCheck size={15} /> No commitment until Peter confirms the appointment.</small>
        </form>
      </div>
    </section>
  )
}

function Footer() {
  return <footer><div className="footer-cta shell"><div><p className="eyebrow">In-House Mobile Mechanics</p><h2>Better care.<br /><em>Less disruption.</em></h2></div><a className="button button-red" href="#booking">Book Peter <ArrowDownRight size={18} /></a></div><div className="footer-base shell"><Logo /><div className="footer-links"><a href="#services">Services</a><a href="#standard">The standard</a><a href="#reviews">Reviews</a></div><div className="footer-details"><span>Peter Philippou · MVRL62688</span><a href="tel:0407088849">0407 088 849</a><a href="mailto:inhousemobilemechanics@gmail.com">inhousemobilemechanics@gmail.com</a></div><span className="copyright">© 2026 In-House Mobile Mechanics</span></div></footer>
}

function SignalNavigation() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return <nav className={`signal-nav ${open ? 'is-open' : ''}`}>
    <a href="#top" className="signal-logo" aria-label="In-House Mobile Mechanics home"><img src="/assets/inhouse-logo.jpeg" alt="In-House Mobile Mechanics" /></a>
    <div className="signal-nav-links"><a href="#services" onClick={close}>Services</a><a href="#story" onClick={close}>Why mobile</a><a href="#reviews" onClick={close}>Reviews</a><a className="signal-mobile-book" href="#booking" onClick={close}>Book a service</a></div>
    <a className="signal-button signal-nav-cta" href="#booking" onClick={close}>Book a service</a>
    <button className="signal-menu" onClick={() => setOpen(!open)} aria-label="Toggle Signal Red navigation" aria-expanded={open}>{open ? <X size={22} /> : <Menu size={22} />}</button>
  </nav>
}

function SignalRedPage({ theme, setTheme }) {
  const signalScope = useRef(null)
  const [activeService, setActiveService] = useState(0)
  const [activeBucket, setActiveBucket] = useState(0)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
  const signalDays = useMemo(() => signalAppointmentDays(monthOffset), [monthOffset])
  const selectedMonth = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  }, [monthOffset])
  const [day, setDay] = useState(() => signalAppointmentDays(0)[0].value)
  const [time, setTime] = useState(appointmentTimes[1])
  const [sent, setSent] = useState(false)
  const signalReview = reviews[reviewIndex]

  useEffect(() => {
    setDay(signalDays[0].value)
  }, [signalDays])

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const media = gsap.matchMedia()
    media.add('(min-width: 901px)', () => {
      ScrollTrigger.create({ id: 'signal-catalog-pin', trigger: '.signal-service-catalog', start: 'top 100px', end: 'bottom bottom', pin: '.signal-catalog-intro', pinSpacing: false })
      gsap.utils.toArray('.signal-bucket').forEach((bucket, index) => {
        gsap.from(bucket, { x: index % 2 === 0 ? -72 : 72, y: 42, scale: .92, opacity: .18, ease: 'none', scrollTrigger: { id: `signal-bucket-${index}`, trigger: bucket, start: 'top 92%', end: 'top 58%', scrub: 1 } })
      })
    })
    media.add('(max-width: 900px)', () => {
      gsap.utils.toArray('.signal-bucket').forEach((bucket, index) => {
        gsap.from(bucket, { y: 34, opacity: 0, duration: .55, delay: index * .04, scrollTrigger: { id: `signal-mobile-bucket-${index}`, trigger: bucket, start: 'top 92%' } })
      })
    })
    return () => media.revert()
  }, { scope: signalScope })

  return <main className="signal-page" ref={signalScope}>
    <SignalNavigation />
    <StyleSwitcher theme={theme} setTheme={setTheme} />
    <header className="signal-hero" id="top">
      <div className="signal-hero-copy"><h1>Precision<br />servicing.<br /><em>Wherever<br />you park.</em></h1><p>Premium mobile maintenance and diagnostics, brought to your driveway.</p><div><a className="signal-button" href="#booking">Book a service</a><a className="signal-button outline" href="mailto:inhousemobilemechanics@gmail.com">Ask Peter</a></div></div>
      <div className="signal-hero-image" aria-label="Mobile mechanic servicing a vehicle" />
    </header>

    <section className="signal-services" id="services">
      <div className="signal-shell"><h2><span>/</span> Services</h2><div className="signal-service-grid">{services.slice(0, 3).map((service, index) => <article className={`signal-service-card ${activeService === index ? 'active' : ''}`} key={service.title} onMouseEnter={() => setActiveService(index)}><div className="signal-service-image"><img src={service.image} alt={service.title} /><span>0{index + 1}</span></div><div className="signal-service-body"><h3>{service.title}</h3><p>{service.copy}</p><a href="#booking">Learn more <ArrowRight size={15} /></a></div></article>)}</div></div>
    </section>

    <section className="signal-service-catalog" id="service-catalog" aria-label="Complete service offering">
      <div className="signal-shell signal-catalog-layout">
        <div className="signal-catalog-intro"><span>Everything Peter brings</span><h2>The full workshop,<br /><em>at your curb.</em></h2><p>Manufacturer-warranty servicing using genuine or guaranteed new parts, backed by clear advice and a 12-month parts and labour warranty.</p><a href="#booking">Choose your service <ArrowDownRight size={17} /></a></div>
        <div className="signal-bucket-grid">{signalServiceGroups.map((group, index) => <article className={`signal-bucket ${activeBucket === index ? 'active' : ''}`} key={group.title} role="button" tabIndex="0" aria-pressed={activeBucket === index} onMouseEnter={() => setActiveBucket(index)} onFocus={() => setActiveBucket(index)} onClick={() => setActiveBucket(index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveBucket(index) } }}><div className="signal-bucket-top"><span>0{index + 1}</span><ArrowDownRight size={18} /></div><h3>{group.title}</h3><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul><div className="signal-bucket-line" /></article>)}</div>
      </div>
      <div className="signal-catalog-marquee" aria-hidden="true"><div className="signal-catalog-marquee-track">{[...signalMarqueeServices, ...signalMarqueeServices].map((service, index) => <span className="signal-catalog-marquee-item" key={`${service}-${index}`}>{service}<i>•</i></span>)}</div></div>
    </section>

    <section className="signal-story" id="story">
      <div className="signal-story-photo"><img src="/assets/signal-story-mechanic.png" alt="Smiling In-House mobile mechanic with his arms folded" /></div>
      <div className="signal-story-copy"><h2>The story behind <em>In-House</em></h2><p>I’m Peter, a qualified mechanic who believes car care should be simpler, more convenient and a whole lot more personal.</p><p>No queues. No unnecessary upsells. Just honest advice, quality workmanship and the convenience of having your car serviced at home or work.</p><div className="signal-signature">Peter</div></div>
    </section>

    <section className="signal-review" id="reviews">
      <div className="signal-quote-mark">“</div><blockquote>{signalReview.quote}</blockquote><div className="signal-review-person"><strong>— {signalReview.name}</strong><span>{signalReview.vehicle}</span></div><div className="signal-review-controls"><button onClick={() => setReviewIndex((reviewIndex + reviews.length - 1) % reviews.length)} aria-label="Previous Signal Red review"><ArrowLeft size={18} /></button><button onClick={() => setReviewIndex((reviewIndex + 1) % reviews.length)} aria-label="Next Signal Red review"><ArrowRight size={18} /></button></div>
    </section>

    <section className="signal-booking" id="booking">
      <div className="signal-booking-slash" aria-hidden="true" />
      <div className="signal-shell signal-booking-inner">
        <h2>Book a service</h2>
        {sent ? <div className="signal-success"><Check size={30} /><h3>Request received.</h3><p>Peter will confirm {signalDays.find((item) => item.value === day)?.date} at {time} with you shortly.</p><button className="signal-button" onClick={() => setSent(false)}>Make another request</button></div> : <form onSubmit={(event) => { event.preventDefault(); setSent(true) }}>
          <div className="signal-details"><label>Full name<input name="name" placeholder="Your full name" required /></label><label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label><label>Vehicle<input name="vehicle" placeholder="Make, model, year" required /></label><label>Service<select name="service" defaultValue=""><option value="" disabled>Select a service</option><option>Scheduled servicing</option><option>Diagnostics</option><option>Brakes & batteries</option><option>Breakdown support</option></select></label><label className="wide">Additional notes<textarea name="notes" placeholder="Anything we should know?" rows="4" /></label></div>
          <div className="signal-date"><div className="signal-date-heading"><h3>Select a date</h3><div className="signal-month-picker"><button type="button" onClick={() => setMonthOffset((offset) => Math.max(0, offset - 1))} disabled={monthOffset === 0} aria-label="Previous month"><ArrowLeft size={14} /></button><span>{appointmentMonthLabel.format(selectedMonth)}</span><button type="button" onClick={() => setMonthOffset((offset) => Math.min(11, offset + 1))} disabled={monthOffset === 11} aria-label="Next month"><ArrowRight size={14} /></button></div></div><div className="signal-date-options">{signalDays.map((item) => <button type="button" key={item.value} className={day === item.value ? 'selected' : ''} onClick={() => setDay(item.value)}><small>{item.label}</small><strong>{item.date.split(' ')[0]}</strong><span>{item.date.split(' ')[1]}</span></button>)}</div></div>
          <div className="signal-time"><h3>Select a time</h3><div>{appointmentTimes.map((item) => <button type="button" key={item} className={time === item ? 'selected' : ''} onClick={() => setTime(item)}>{item}</button>)}</div></div>
          <button className="signal-button signal-submit" type="submit">Continue to review</button>
        </form>}
      </div>
    </section>

    <section className="signal-enquiry"><div><h3>Have a question?</h3><p>Send an enquiry and Peter will get back to you.</p></div><a className="signal-button outline-light" href="mailto:inhousemobilemechanics@gmail.com">Send enquiry <Mail size={16} /></a></section>
    <footer className="signal-footer"><div><h2>Your car deserves<br /><em>better than<br />a waiting room.</em></h2><div><a className="signal-button light" href="#booking">Book a service</a><a className="signal-button outline-light" href="tel:0407088849">Ask Peter</a></div><img className="signal-footer-logo" src="/assets/inhouse-logo-footer.png" alt="In-House Mobile Mechanics" /></div><span>Peter Philippou · MVRL62688 · 0407 088 849</span></footer>
  </main>
}

function NightNavigation() {
  const [open, setOpen] = useState(false)
  return <nav className={`night-nav ${open ? 'is-open' : ''}`}>
    <div className="night-nav-links"><a href="#night-services">Services</a><a href="#night-story">How it works</a><a className="night-mobile-book" href="#booking">Book service</a></div>
    <div className="night-nav-actions"><a href="#booking">Book service</a></div>
    <button className="night-menu" onClick={() => setOpen(!open)} aria-label="Toggle Night Shift navigation" aria-expanded={open}>{open ? <X size={22} /> : <Menu size={22} />}</button>
  </nav>
}

function NightShiftPage({ theme, setTheme }) {
  const nightScope = useRef(null)
  const spotlightRef = useRef(null)
  const [activeService, setActiveService] = useState(0)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [day, setDay] = useState(appointmentDays[1].value)
  const [time, setTime] = useState(appointmentTimes[1])
  const [sent, setSent] = useState(false)
  const manifesto = 'Great car care should move around your life, not force your life to move around it.'

  useEffect(() => {
    const spotlight = spotlightRef.current
    if (!spotlight || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const moveX = gsap.quickTo(spotlight, 'x', { duration: .8, ease: 'power3' })
    const moveY = gsap.quickTo(spotlight, 'y', { duration: .8, ease: 'power3' })
    const move = (event) => { moveX(event.clientX); moveY(event.clientY) }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const nightMedia = gsap.matchMedia()
    const intro = gsap.timeline({ defaults: { ease: 'power4.out' } })
    intro.from('.night-nav', { y: -36, opacity: 0, duration: .9 })
      .from('.night-hero h1, .night-hero-actions, .night-scroll-cue', { y: 42, opacity: 0, duration: .9, stagger: .12 }, '-=.35')

    gsap.to('.night-hero-bg', { scale: 1.1, yPercent: 7, ease: 'none', scrollTrigger: { id: 'night-hero-parallax', trigger: '.night-hero', start: 'top top', end: 'bottom top', scrub: 1 } })
    gsap.from('.night-service-panel', { y: 110, rotationX: -10, stagger: .12, scrollTrigger: { id: 'night-services-in', trigger: '.night-service-rail', start: 'top 84%', end: 'top 48%', scrub: 1 } })
    gsap.to('.night-manifesto span', { opacity: 1, stagger: .08, scrollTrigger: { id: 'night-words', trigger: '.night-manifesto', start: 'top 78%', end: 'bottom 38%', scrub: 1 } })
    nightMedia.add('(min-width: 901px)', () => ScrollTrigger.create({ id: 'night-story-pin', trigger: '.night-story', start: 'top 90px', end: 'bottom bottom', pin: '.night-story-heading', pinSpacing: false }))
    gsap.utils.toArray('.night-stack-card').forEach((card, index) => gsap.from(card, { y: 170, scale: .86, opacity: .25, rotation: index % 2 ? 3 : -3, scrollTrigger: { id: `night-stack-${index}`, trigger: card, start: 'top 93%', end: 'top 58%', scrub: 1 } }))
    gsap.from('.night-review-inner', { y: 90, opacity: 0, scrollTrigger: { id: 'night-review', trigger: '.night-review', start: 'top 80%', end: 'top 48%', scrub: 1 } })
    return () => nightMedia.revert()
  }, { scope: nightScope })

  return <main className="night-page" ref={nightScope}>
    <div className="night-spotlight" ref={spotlightRef} aria-hidden="true" />
    <NightNavigation />
    <StyleSwitcher theme={theme} setTheme={setTheme} />

    <header className="night-hero" id="night-top">
      <div className="night-hero-bg" aria-hidden="true" />
      <div className="night-hero-shade" aria-hidden="true" />
      <div className="night-hero-content">
        <img className="night-hero-logo" src="/assets/inhouse-logo.jpeg" alt="In-House Mobile Mechanics" />
        <h1>Your workshop.<br />Wherever you stop.</h1>
        <div className="night-hero-actions"><a className="night-button red" href="#booking">Book In-House <ArrowRight size={18} /></a><a className="night-button outline" href="#night-services">Explore services <ArrowDownRight size={18} /></a></div>
      </div>
      <a className="night-scroll-cue" href="#night-services">Scroll to discover <ChevronDown size={16} /></a>
    </header>

    <section className="night-services" id="night-services">
      <div className="night-section-head"><h2>Certified expertise.<br /><em>Zero disruption.</em></h2><p>Four workshop disciplines. One mobile standard. Hover to open the bay.</p></div>
      <div className="night-service-rail">{services.map((service, index) => <article className={`night-service-panel ${activeService === index ? 'active' : ''}`} key={service.title} onMouseEnter={() => setActiveService(index)} onFocus={() => setActiveService(index)} tabIndex="0" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.9)), url(${service.image})` }}><span>{service.number}</span><div><h3>{service.title}</h3><p>{service.copy}</p><a href="#booking">Book this service <ArrowRight size={16} /></a></div></article>)}</div>
    </section>

    <section className="night-manifesto-wrap"><p className="night-manifesto">{manifesto.split(' ').map((word, index) => <span key={`${word}-${index}`}>{word} </span>)}</p><div className="night-inline-image"><img src="/assets/service-diagnostics.png" alt="Professional vehicle diagnostics" /></div></section>

    <section className="night-story" id="night-story">
      <div className="night-story-heading"><h2>The mechanic<br />comes to <em>you.</em></h2><p>Peter brings dealer-level equipment, clear advice and meticulous workmanship to your driveway or workplace.</p><a href="tel:0407088849">Talk to Peter <ArrowRight size={16} /></a></div>
      <div className="night-stack">
        <article className="night-stack-card image"><img src="/assets/signal-story-mechanic.png" alt="Peter from In-House Mobile Mechanics" /><div><strong>A familiar face.</strong><span>The same qualified mechanic, every visit.</span></div></article>
        <article className="night-stack-card bone"><strong>Warranty-safe care.</strong><p>Manufacturer-aligned servicing with genuine or guaranteed new parts.</p><span>12-month parts and labour warranty</span></article>
        <article className="night-stack-card red"><strong>Straight answers.</strong><p>No waiting-room theatre. No unnecessary upsells. Just a clear diagnosis before work begins.</p><a href="#booking">Choose a time <ArrowDownRight size={18} /></a></article>
      </div>
    </section>

    <section className="night-review" id="night-reviews"><div className="night-review-inner"><div className="night-review-nav"><span>Client notes</span><div><button onClick={() => setReviewIndex((reviewIndex + reviews.length - 1) % reviews.length)} aria-label="Previous review"><ArrowLeft size={18} /></button><button onClick={() => setReviewIndex((reviewIndex + 1) % reviews.length)} aria-label="Next review"><ArrowRight size={18} /></button></div></div><blockquote>“{reviews[reviewIndex].quote}”</blockquote><p>{reviews[reviewIndex].name} <span>{reviews[reviewIndex].vehicle}</span></p></div></section>

    <section className="night-booking" id="booking">
      <div className="night-booking-copy"><h2>Make the<br />workshop come<br />to you.</h2><p>Select a preferred day and time. Peter will confirm the appointment personally.</p></div>
      {sent ? <div className="night-booking-success"><Check size={34} /><h3>You’re on the list.</h3><p>Peter will confirm {appointmentDays.find((item) => item.value === day)?.date} at {time} shortly.</p><button onClick={() => setSent(false)}>Make another request</button></div> : <form className="night-booking-form" onSubmit={(event) => { event.preventDefault(); setSent(true) }}><div className="night-field-grid"><label>Name<input required placeholder="Full name" /></label><label>Email<input required type="email" placeholder="you@example.com" /></label><label>Vehicle<input required placeholder="Make, model, year" /></label><label>Service<select defaultValue=""><option value="" disabled>Select service</option>{services.map((service) => <option key={service.title}>{service.title}</option>)}</select></label></div><div className="night-picker"><span>Preferred day</span><div>{appointmentDays.map((item) => <button type="button" className={day === item.value ? 'selected' : ''} key={item.value} onClick={() => setDay(item.value)}><small>{item.label}</small><strong>{item.date}</strong></button>)}</div></div><div className="night-picker times"><span>Preferred time</span><div>{appointmentTimes.map((item) => <button type="button" className={time === item ? 'selected' : ''} key={item} onClick={() => setTime(item)}>{item}</button>)}</div></div><button className="night-submit" type="submit">Request the visit <ArrowRight size={18} /></button></form>}
    </section>

    <footer className="night-footer"><img src="/assets/inhouse-logo-transparent.png" alt="In-House Mobile Mechanics" /><div><a href="#night-services">Services</a><a href="#night-story">How it works</a><a href="#booking">Book service</a></div><p>Peter Philippou · MVRL62688 · 0407 088 849</p></footer>
  </main>
}

export default function App() {
  const scope = useRef(null)
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('inhouse-page-style')
    return pageStyles.some((style) => style.id === savedTheme) ? savedTheme : 'atelier'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('inhouse-page-style', theme)
    if (theme === 'signal' || theme === 'night') ScrollTrigger.getAll().filter((trigger) => !String(trigger.vars.id || '').startsWith(`${theme}-`)).forEach((trigger) => trigger.kill())
    ScrollTrigger.refresh()
  }, [theme])

  useGSAP(() => {
    if (theme === 'signal' || theme === 'night') return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
    intro.from('.navigation', { y: -30, opacity: 0, duration: 0.8 })
      .from('.hero-content > *', { y: 32, opacity: 0, duration: 0.9, stagger: 0.1 }, '-=0.35')
      .from('.hero-media-wrap', { clipPath: 'inset(0 0 0 100%)', duration: 1.3 }, '-=0.75')

    gsap.utils.toArray('.service-bento > *').forEach((card, index) => {
      gsap.from(card, { y: 70 + index * 12, opacity: 0, scale: 0.94, scrollTrigger: { trigger: card, start: 'top 88%', end: 'top 54%', scrub: 1 } })
    })
    gsap.from('.standard-pin', { y: 80, opacity: 0, scrollTrigger: { trigger: '.standard-section', start: 'top 78%', end: 'top 32%', scrub: 1 } })
    gsap.utils.toArray('.proof-card').forEach((card, index) => {
      gsap.from(card, { y: 110 + index * 18, scale: 0.84, opacity: 0.2, scrollTrigger: { trigger: card, start: 'top 92%', end: 'top 55%', scrub: 1 } })
    })
    gsap.to('.word-reveal span', { opacity: 1, stagger: 0.07, scrollTrigger: { trigger: '.word-reveal', start: 'top 82%', end: 'bottom 48%', scrub: 1 } })
    gsap.from('.review-stage', { y: 80, opacity: 0, scrollTrigger: { trigger: '.reviews', start: 'top 78%', end: 'top 42%', scrub: 1 } })
    gsap.to('.hero-media', { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
  }, { scope, dependencies: [theme], revertOnUpdate: true })

  if (theme === 'signal') return <SignalRedPage theme={theme} setTheme={setTheme} />
  if (theme === 'night') return <NightShiftPage theme={theme} setTheme={setTheme} />
  return <main className="site" ref={scope}><Navigation /><StyleSwitcher theme={theme} setTheme={setTheme} /><Hero /><ServiceBento /><StandardSection /><Reviews /><Booking /><Footer /></main>
}
