import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  Star,
  X,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const BUSINESS = Object.freeze({
  name: 'In-House Mobile Mechanics',
  phoneDisplay: '0407 088 849',
  phoneHref: 'tel:0407088849',
  email: 'inhousemobilemechanics@gmail.com',
  licence: 'MVRL62688',
})

const services = [
  {
    title: 'Scheduled servicing',
    number: '01',
    copy: 'Manufacturer-aligned maintenance using genuine or guaranteed new parts, completed at your home or workplace.',
    image: '/assets/service-day-maintenance.png',
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
    image: '/assets/service-brakes-complete.png',
    detail: 'Brakes · Clutches · Starting & charging',
  },
  {
    title: 'Breakdown support',
    number: '04',
    copy: 'After-hours call-out support may be available by arrangement when the day does not go to plan.',
    image: '/assets/intune-hero.png',
    detail: 'Availability varies · Additional charges may apply',
  },
]

const carServices = [
  {
    number: '01',
    slug: 'logbook-servicing',
    title: 'Logbook servicing',
    modalTitleLines: ['Logbook', 'servicing'],
    summary: 'Scheduled maintenance completed to the manufacturer’s service schedule and specifications, at your home or workplace.',
    image: '/assets/service-day-maintenance.png',
    benefits: [
      'Manufacturer-specified servicing',
      'Your service logbook updated and stamped',
      'Engine oil and oil filter changed',
      'Comprehensive safety and under-bonnet inspection',
      'Quality parts, oils and fluids',
    ],
    assessment: 'We inspect the vehicle, confirm the logbook service that is required then complete a full safety and under bonnet inspection.',
    note: 'Independent servicing does not automatically void your new car warranty when manufacturer requirements are followed.',
  },
  {
    number: '02',
    slug: 'basic-servicing',
    title: 'Basic servicing',
    modalTitleLines: ['Basic', 'servicing'],
    summary: 'Practical routine maintenance designed around your vehicle’s condition, usage and service history.',
    image: '/assets/service-day-basic.png',
    benefits: ['Oil and filter service', 'Safety and fluid checks', 'Clear condition report'],
    assessment: 'We inspect the vehicle and carry out a thorough safety check before servicing begins.',
  },
  {
    number: '03',
    slug: 'pink-slip-esafety-check',
    title: 'Service & eSafety Check/Pink Slip',
    modalTitleLines: ['Service & eSafety', 'Check/Pink Slip'],
    summary: "Simply tell us you want a 'pink-slip' inspection whenever you book a service or repair.",
    image: '/assets/service-day-brakes-inspection.png',
    benefits: ['Mobile inspection', 'Clear defect advice', 'Efficient next steps'],
    callout: "Simply tell us you want a 'pink-slip' inspection whenever you book a service or repair.",
    assessment: 'We complete the eSafety check throughout the service, checking the vehicle for roadworthiness.',
    findings: "If we find a defect, we clearly explain what's required and discuss your repair options before proceeding.",
    completion: 'Approved repairs are completed, the eSafety check is finalised and, once roadworthy, the vehicle is passed and the job is complete.',
  },
  {
    number: '04',
    slug: 'pre-purchase-inspections',
    title: 'Pre-purchase inspections',
    modalTitleLines: ['Pre-purchase', 'inspections'],
    summary: 'An independent mechanical assessment to help you understand a vehicle before you commit to buying it.',
    image: '/assets/service-prepurchase-inspection.png',
    benefits: [
      'Comprehensive vehicle condition assessment',
      'Mechanical inspection & road test',
      'Diagnostic scan where appropriate',
      'Detailed videos covering the entire vehicle',
      'Plain English findings & honest advice',
    ],
    note: 'All findings are discussed with you by your mechanic once the inspection is complete.',
    assessment: 'We inspect the vehicle thoroughly, assessing its mechanical condition and identifying any visible or potential issues.',
    findings: 'We clearly explain our findings, highlight any concerns and help you understand what they could mean before you buy.',
    completion: 'We send clear videos of our findings followed by a call to explain everything and provide honest advice on the vehicle.',
  },
  {
    number: '05',
    slug: 'after-hours',
    title: 'After Hours Call Outs',
    modalTitleLines: ['After Hours', 'Call Outs'],
    summary: 'After hours mobile mechanic support when the day does not go to plan, subject to parts availability and job requirement.',
    image: '/assets/after-hours-call-out.png',
    benefits: ['After-hours support by arrangement', 'On-site diagnosis and clear advice'],
    note: 'After-hours call-outs may be available by arrangement. Additional charges may apply; availability and conditions are confirmed before attendance.',
  },
]

const repairGroups = [
  {
    number: '01',
    title: 'Stopping & control',
    modalTitleLines: ['Stopping', '& control'],
    summary: 'Safety-critical systems inspected and repaired with a focus on predictable, confident and safe road behaviour.',
    image: '/assets/service-brakes-complete.png',
    flipImage: true,
    items: ['Brakes', 'Suspension', 'Steering Repair'],
    includedGroups: [
      { points: ['Pads, shoes, rotors, calipers, and related components'] },
      { points: ['Shocks, springs, bushes, ball joints and related components'] },
      { points: ['Tie rods, rack ends, steering racks and related components'] },
    ],
  },
  {
    number: '02',
    title: 'Starting & charging',
    modalTitleLines: ['Starting', '& charging'],
    summary: 'We test the battery and charging system, confirm the correct replacement, then register or relearn the Battery Management System where required to protect charging performance and battery life.',
    image: '/assets/service-battery-charging-voltage-clips.png',
    items: ['Battery & charging test', 'Battery replacement to correct specification', 'Registration / relearning where required', 'Starter motor/alternator replacement'],
  },
  {
    number: '03',
    title: 'Engine Cooling',
    modalTitleLines: ['Engine', 'Cooling'],
    summary: 'Preventative and corrective repairs that protect the engine from heat, wear and avoidable breakdowns.',
    image: '/assets/service-engine-cooling-radiator.png',
    items: ['Cooling system inspection & leak testing', 'Cooling system flush', 'Radiator and fan replacement', 'Water pump, thermostat & all related components'],
  },
  {
    number: '04',
    title: 'Fuel & ignition',
    modalTitleLines: ['Fuel', '& ignition'],
    summary: 'Fault-finding and repairs for systems that affect starting, performance, fuel use and emissions.',
    image: '/assets/service-diagnostics.png',
    items: ['Fuel System', 'Ignition System', 'Exhaust Repair'],
    includedGroups: [
      { points: ['Fuel pump, injectors, filters & system faults'] },
      { points: ['Spark plugs, ignition coils, leads & ignition faults'] },
      { points: ['Exhaust leaks, catalytic converters, DPF faults and more'] },
    ],
  },
  {
    number: '05',
    title: 'Major mechanical',
    modalTitleLines: ['Major', 'mechanical'],
    summary: 'Experienced assessment for more involved driveline, engine and comfort-system repairs.',
    image: '/assets/service-major-mechanical-clutch.png',
    items: ['Clutch & Flywheel Repairs', 'Timing belt replacement', 'Head Gasket / Engine Repair', 'And much more'],
  },
]

const infoTopics = [
  { slug: 'service-on-time', title: 'Why servicing your car on time matters', copy: 'Regular servicing helps identify wear early, maintain efficiency and reduce the chance of a small issue becoming an expensive repair.' },
  { slug: 'preventative-maintenance', title: 'Why preventative maintenance is important', copy: 'Fluids, filters, belts and safety systems work together. Planned maintenance protects the whole vehicle, not just one component.' },
  { slug: 'battery-warning-signs', title: 'Warning signs your battery may need replacing', copy: 'Slow cranking, electrical warnings and unreliable starting can point to battery or charging-system trouble. Testing separates the cause from the symptom.' },
  { slug: 'brake-maintenance', title: 'Why brake maintenance matters', copy: 'Changes in pedal feel, noise, vibration or stopping distance deserve prompt attention. Early inspection can protect adjoining components too.' },
  { slug: 'logbook-service', title: 'What happens during a logbook service', copy: 'The vehicle is serviced against its scheduled requirements, with the relevant inspections, fluids, parts and service-record updates completed.' },
  { slug: 'pre-purchase-checks', title: 'Do you provide a warranty on your work?', copy: 'Yes, all labour performed and parts supplied and installed by us are covered by a 12-month or 20,000-kilometre warranty, whichever occurs first.' },
  { slug: 'vehicle-maintenance-basics', title: 'What areas do you service?', copy: 'We service most of Sydney metro and surrounding suburbs, covering areas across the Northern Beaches, Eastern Suburbs, Inner West, Hills District, Western Sydney, South-Western Sydney, Sutherland Shire and beyond.' },
]

const bookingServiceOptions = [
  ...carServices.map((service) => service.title),
  ...repairGroups.flatMap((group) => group.items).filter((option) => !['Registration / relearning where required', 'Correct battery specification'].includes(option)),
  'After-hours call-out',
]

const capabilityCarouselItems = [0, 1, 2, 3]

function optimizedImage(image, width = 1600) {
  if (!image.startsWith('/assets/')) return image
  const filename = image.split('/').pop()
  const name = filename.slice(0, filename.lastIndexOf('.'))
  return `/assets/optimized/${name}-${width}.webp`
}

function responsiveImageSet(image) {
  if (!image.startsWith('/assets/')) return `url('${image}')`
  const filename = image.split('/').pop()
  const name = filename.slice(0, filename.lastIndexOf('.'))
  return `image-set(url('/assets/optimized/${name}-768.webp') 1x, url('/assets/optimized/${name}-1600.webp') 2x)`
}

const signalServiceGroups = [
  { title: 'Mechanical repairs', items: ['All mechanical repairs', 'Overheating problems'] },
  { title: 'Log book servicing', items: ['Dealer and log book services', 'Manufacturer warranty protected'] },
  { title: 'Starting & charging', items: ['Batteries', 'Alternators', 'Starter motors'] },
  { title: 'Brakes & clutch', items: ['Brake repairs', 'Clutch repairs', '12-month parts and labour warranty'] },
  { title: 'Diagnostics & breakdowns', items: ['Engine diagnostic services', 'After-hours support by arrangement'] },
  { title: 'Inspections & compliance', items: ['Mobile pink slips', 'Pre-purchase inspections', 'Fully licensed workshop'] },
]

const signalMarqueeServices = signalServiceGroups.flatMap(({ title, items }) => [title, ...items])

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
  { quote: 'Professional, tidy and incredibly knowledgeable. It is dealership-level service without leaving home.', name: 'James P.', vehicle: 'Volkswagon Golf GTI' },
  { quote: 'A friend recommended Peter after I’d had enough of dealers. He was easy, tidy and fairly priced—he’s now my go-to mechanic.', name: 'Nick P.', vehicle: 'Mazda 2' },
  { quote: 'Peter was professional and helpful when my battery went flat. He got me going again at a reasonable price, and I’d use him again.', name: 'Alicia', vehicle: 'Honda Civic' },
  { quote: "I had an excellent experience with in house mobile mechanics. Everything was smooth from start to finish. Friendly, professional, and great value. I'd happily recommend them.", name: 'Abdullah R.', vehicle: 'Audi Q5', rating: 5 },
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
          <img src={optimizedImage(services[0].image)} alt="Mobile mechanic servicing a vehicle" />
          <div className="service-hero-overlay" />
          <div className="service-hero-copy"><span>01</span><h3>Workshop precision.<br />Driveway convenience.</h3><a href="#booking">Make time for your car <ArrowDownRight size={18} /></a></div>
        </div>
        <div className="service-side-card light-card"><span>12 MO</span><strong>Parts & labour warranty</strong><p>Confidence built into every job.</p></div>
        <div className="service-side-card red-card"><span>24 / 7</span><strong>Breakdown support</strong><p>When your plans change suddenly.</p></div>
        <div className="service-side-card photo-card"><img src={optimizedImage('/assets/service-diagnostics.png')} alt="Vehicle diagnostic equipment" /><span>Clear diagnosis</span></div>
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
        <article className="proof-card proof-large"><img src={optimizedImage('/assets/service-scheduled.png')} alt="A mobile mechanic completing a scheduled oil service at a customer's home" /><div className="proof-scrim" /><div className="proof-card-copy"><span>Built around your day</span><strong>Keep your morning.<br />We will bring the workshop.</strong></div></article>
        <article className="proof-card proof-quote"><span className="quote-mark">“</span><p>Professional, tidy and incredibly knowledgeable. It is dealership-level service without leaving home.</p><strong>James W.</strong><small>Mercedes-Benz C-Class</small></article>
        <article className="proof-card proof-image"><img src={optimizedImage('/assets/service-diagnostics.png')} alt="Professional vehicle diagnostics carried out by a mobile mechanic" /></article>
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
          <div className="review-portrait"><img src={optimizedImage('/assets/signal-story-mechanic.png')} alt="An In-House mobile mechanic beside his workshop van" /><span>In-house care, outside the workshop</span></div>
          <div className="review-copy"><span className="quote-mark">“</span><blockquote key={review.quote}>{review.quote}</blockquote><div className="review-person"><strong>{review.name}</strong>{review.rating ? <span className="review-rating" role="img" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: review.rating }, (_, starIndex) => <Star key={starIndex} aria-hidden="true" />)}</span> : null}{review.vehicle || review.source ? <span>{review.vehicle || review.source}</span> : null}</div><div className="review-controls"><button onClick={previous} aria-label="Previous review"><ArrowLeft size={18} /></button><span>0{index + 1} <i>/</i> 0{reviews.length}</span><button onClick={next} aria-label="Next review"><ArrowRight size={18} /></button></div></div>
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
    <header className="signal-hero" id="top">
      <div className="signal-hero-copy"><h1>Precision<br />servicing.<br /><em>Wherever<br />you park.</em></h1><p>Premium mobile maintenance and diagnostics, brought to your driveway.</p><div><a className="signal-button" href="#booking">Book a service</a><a className="signal-button outline" href="mailto:inhousemobilemechanics@gmail.com">Ask Peter</a></div></div>
      <div className="signal-hero-image" aria-label="Mobile mechanic servicing a vehicle" />
    </header>

    <section className="signal-services" id="services">
       <div className="signal-shell"><h2><span>/</span> Services</h2><div className="signal-service-grid">{services.slice(0, 3).map((service, index) => <article className={`signal-service-card ${activeService === index ? 'active' : ''}`} key={service.title} onMouseEnter={() => setActiveService(index)}><div className="signal-service-image"><img src={optimizedImage(service.image)} alt={service.title} /><span>0{index + 1}</span></div><div className="signal-service-body"><h3>{service.title}</h3><p>{service.copy}</p><a href="#booking">Learn more <ArrowRight size={15} /></a></div></article>)}</div></div>
    </section>

    <section className="signal-service-catalog" id="service-catalog" aria-label="Complete service offering">
      <div className="signal-shell signal-catalog-layout">
        <div className="signal-catalog-intro"><span>Everything Peter brings</span><h2>The full workshop,<br /><em>at your curb.</em></h2><p>Manufacturer-warranty servicing using genuine or guaranteed new parts, backed by clear advice and a 12-month parts and labour warranty.</p><a href="#booking">Choose your service <ArrowDownRight size={17} /></a></div>
        <div className="signal-bucket-grid">{signalServiceGroups.map((group, index) => <article className={`signal-bucket ${activeBucket === index ? 'active' : ''}`} key={group.title} role="button" tabIndex="0" aria-pressed={activeBucket === index} onMouseEnter={() => setActiveBucket(index)} onFocus={() => setActiveBucket(index)} onClick={() => setActiveBucket(index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveBucket(index) } }}><div className="signal-bucket-top"><span>0{index + 1}</span><ArrowDownRight size={18} /></div><h3>{group.title}</h3><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul><div className="signal-bucket-line" /></article>)}</div>
      </div>
      <div className="signal-catalog-marquee" aria-hidden="true"><div className="signal-catalog-marquee-track">{[...signalMarqueeServices, ...signalMarqueeServices].map((service, index) => <span className="signal-catalog-marquee-item" key={`${service}-${index}`}>{service}<i>•</i></span>)}</div></div>
    </section>

    <section className="signal-story" id="story">
       <div className="signal-story-photo"><img src={optimizedImage('/assets/signal-story-mechanic.png')} alt="Smiling In-House mobile mechanic with his arms folded" /></div>
      <div className="signal-story-copy"><h2>The story behind <em>In-House</em></h2><p>I’m Peter, a qualified mechanic who believes car care should be simpler, more convenient and a whole lot more personal.</p><p>No queues. No unnecessary upsells. Just honest advice, quality workmanship and the convenience of having your car serviced at home or work.</p><div className="signal-signature">Peter</div></div>
    </section>

    <section className="signal-review" id="reviews">
      <div className="signal-quote-mark">“</div><blockquote>{signalReview.quote}</blockquote><div className="signal-review-person"><strong>— {signalReview.name}</strong>{signalReview.rating ? <span className="review-rating" role="img" aria-label={`${signalReview.rating} out of 5 stars`}>{Array.from({ length: signalReview.rating }, (_, starIndex) => <Star key={starIndex} aria-hidden="true" />)}</span> : null}{signalReview.vehicle || signalReview.source ? <span>{signalReview.vehicle || signalReview.source}</span> : null}</div><div className="signal-review-controls"><button onClick={() => setReviewIndex((reviewIndex + reviews.length - 1) % reviews.length)} aria-label="Previous Signal Red review"><ArrowLeft size={18} /></button><button onClick={() => setReviewIndex((reviewIndex + 1) % reviews.length)} aria-label="Next Signal Red review"><ArrowRight size={18} /></button></div>
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
  const [suburbsOpen, setSuburbsOpen] = useState(false)
  const [offersOpen, setOffersOpen] = useState(false)
  const suburbsButtonRef = useRef(null)
  const offersButtonRef = useRef(null)
  const restoreOffersMenuRef = useRef(false)
  const close = () => setOpen(false)
  const links = [
    ['Home', '#night-top'],
    ['Car Services', '#car-services'],
    ['Car Repairs', '#car-repairs'],
    ['About Us', '#about'],
    ['FAQ', '#info-centre'],
    ['Contact Us', '#booking'],
    ['Suburbs Covered', null],
  ]

  const openSuburbs = () => {
    close()
    setSuburbsOpen(true)
  }

  const closeSuburbs = () => {
    setSuburbsOpen(false)
    window.setTimeout(() => suburbsButtonRef.current?.focus(), 0)
  }

  const openOffers = () => {
    restoreOffersMenuRef.current = open
    close()
    setOffersOpen(true)
  }

  const closeOffers = useCallback(() => {
    setOffersOpen(false)
    if (restoreOffersMenuRef.current) setOpen(true)
    window.setTimeout(() => offersButtonRef.current?.focus(), 0)
  }, [])

  return <>
    <nav className={`night-nav ${open ? 'is-open' : ''}`}>
      <div className="night-nav-links">{links.map(([label, href]) => href
        ? <a href={href} onClick={close} key={label}>{label}</a>
        : <button className="night-nav-link-button" ref={suburbsButtonRef} type="button" onClick={openSuburbs} key={label}>{label}</button>)}<button className="night-nav-link-button night-nav-offers" ref={offersButtonRef} type="button" onClick={openOffers}>Offers</button><a className="night-mobile-call" href={BUSINESS.phoneHref} onClick={close}>Call now · {BUSINESS.phoneDisplay}</a></div>
      <button className="night-menu" onClick={() => setOpen(!open)} aria-label="Toggle Night Shift navigation" aria-expanded={open}>{open ? <X size={22} /> : <Menu size={22} />}</button>
    </nav>
    {suburbsOpen ? <NightSuburbsModal onClose={closeSuburbs} /> : null}
    {offersOpen ? <NightOffersModal onClose={closeOffers} /> : null}
  </>
}

function NightSuburbsModal({ onClose }) {
  const closeRef = useRef(null)
  const suburbs = ['Northern Beaches', 'Eastern Suburbs', 'Inner West', 'Hills District', 'Western Sydney', 'South-Western Sydney', 'Sutherland Shire', 'and beyond.']

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        event.preventDefault()
        closeRef.current?.focus()
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return <div className="night-suburbs-modal" role="dialog" aria-modal="true" aria-labelledby="night-suburbs-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <article className="night-suburbs-card">
      <button className="night-suburbs-close" ref={closeRef} type="button" onClick={onClose} aria-label="Close suburbs modal"><X size={21} /></button>
      <span className="night-suburbs-eyebrow">Sydney service area</span>
      <h2 id="night-suburbs-title">We service most of Sydney metro and surrounding suburbs</h2>
      <p>Covering areas across the:</p>
      <ul>{suburbs.map((suburb) => <li key={suburb}>{suburb}</li>)}</ul>
    </article>
  </div>
}

function NightOfferingModal({ offering, onClose }) {
  const modalRef = useRef(null)
  const closingRef = useRef(false)
  const offeringGroups = offering.includedGroups || [{ points: offering.benefits || offering.items }]
  const notice = offering.callout || offering.note || 'The exact scope, parts and pricing are confirmed after inspection and before approved work begins.'

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: .35 })
      .fromTo('.night-offering-card', { y: 70, scale: .86, rotationY: -22, opacity: 0 }, { y: 0, scale: 1, rotationY: 0, opacity: 1, duration: .8 }, 0)
      .fromTo('.night-offering-image', { scale: 1.18 }, { scale: 1, duration: 1.1 }, .08)
      .fromTo('.night-offering-media img', { filter: 'grayscale(1) brightness(.55)' }, { filter: 'grayscale(.15) brightness(.82)', duration: 1.1 }, .08)
      .from('.night-offering-content > *', { y: 22, opacity: 0, stagger: .055, duration: .55 }, .22)
  }, { scope: modalRef })

  const closeModal = () => {
    if (closingRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onClose()
      return
    }
    closingRef.current = true
    const select = gsap.utils.selector(modalRef)
    gsap.timeline({ onComplete: onClose })
      .to(select('.night-offering-card'), { y: 32, scale: .92, rotationY: 12, opacity: 0, duration: .42, ease: 'power3.in' })
      .to(modalRef.current, { opacity: 0, duration: .28, ease: 'power2.in' }, '-=.24')
  }

  return <div className={`night-offering-modal ${offering.kind === 'Car repair' ? 'is-repair-modal' : 'is-service-modal'}`} ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="night-offering-title" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}>
    <article className="night-offering-card">
      <button className="night-offering-close" type="button" onClick={closeModal} aria-label="Close" autoFocus><X size={21} /></button>
      <div className={`night-offering-media ${offering.flipImage ? 'is-flipped' : ''}`}>
         <div className="night-offering-image"><img src={optimizedImage(offering.image)} srcSet={offering.image.startsWith('/assets/') ? `${optimizedImage(offering.image, 768)} 768w, ${optimizedImage(offering.image, 1600)} 1600w` : undefined} sizes="(max-width: 620px) 100vw, 50vw" alt={`${offering.title} mobile mechanic service`} decoding="async" /></div>
         <div><strong>At home.<br />At work.<br />On your terms.</strong></div>
      </div>
      <div className="night-offering-content">
         <span className="night-offering-eyebrow">{offering.kind}</span>
        <h2 id="night-offering-title">{offering.modalTitleLines ? offering.modalTitleLines.map((line, index) => <span className="night-offering-title-line" key={line}>{index > 0 ? ' ' : ''}{line}</span>) : offering.title}</h2>
         <div className="night-offering-details">
          <section className="night-offering-inclusions" aria-labelledby="night-offering-inclusions-heading">
            <h3 id="night-offering-inclusions-heading">What’s included</h3>
            {offeringGroups.map((group) => <div className="night-offering-inclusion-group" key={group.title || group.points.join('-')}>
              {group.title ? <h4>{group.title}</h4> : null}
              <ul>{group.points.map((point) => <li key={point}><Check size={17} /> <span>{point}</span></li>)}</ul>
            </div>)}
          </section>
          <section className="night-offering-process" aria-labelledby="night-offering-process-heading">
            <h3 id="night-offering-process-heading">How the visit works</h3>
             <div><strong>Assess <span>on-site</span></strong><p>{offering.assessment || 'We inspect the vehicle, confirm the symptoms and establish the right scope.'}</p></div>
             <div><strong>Explain <span>the findings</span></strong><p>{offering.findings || 'You receive clear advice, priorities and approval-ready options before work proceeds.'}</p></div>
             <div><strong>Complete <span>with care</span></strong><p>{offering.completion || 'Approved work is completed professionally, followed by final checks and a clear handover.'}</p></div>
          </section>
        </div>
          <aside><ShieldCheck size={19} /><p>{notice}</p></aside>
        <div className="night-offering-actions"><a href="#booking" onClick={onClose}>Request this service <ArrowRight size={18} /></a></div>
      </div>
    </article>
  </div>
}

function NightCarServices({ onSelectOffering }) {
  const [activeService, setActiveService] = useState(0)

  return <section className="night-day-services" id="car-services">
    <div className="night-day-services-head">
      <div><span>Car Services</span><h2>Workshop care.<br /><em>Mobile Convenience.</em></h2></div>
      <div><p>Professional servicing and inspections at home or work, with direct communication and no waiting room.</p><a href="#booking"><span className="night-service-link-wide">Enquire about a service</span><span className="night-service-link-mobile">Talk through your service</span><ArrowRight size={16} /></a></div>
    </div>
    <div className="night-service-rail night-day-service-rail">
      {carServices.map((service, index) => <article className={`night-service-panel night-day-service-panel ${activeService === index ? 'active' : ''}`} id={`service-${service.slug}`} key={service.slug} onMouseEnter={() => setActiveService(index)} onFocus={() => setActiveService(index)} onClick={() => { setActiveService(index); onSelectOffering({ ...service, kind: 'Car service' }) }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveService(index); onSelectOffering({ ...service, kind: 'Car service' }) } }} tabIndex="0" role="button" aria-haspopup="dialog" aria-label={`View ${service.title} details`} style={{ '--night-panel-image': `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.9)), ${responsiveImageSet(service.image)}` }}>
        <span>{service.number}</span>
        <div>
          <h3>{service.title}</h3>
          <p>{service.summary}</p>
          <div className="night-panel-actions">
            <a className="night-panel-book" href="#booking" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>Book now <ArrowDownRight size={16} /></a>
            <button className="night-panel-more-info" type="button" onClick={(event) => { event.stopPropagation(); onSelectOffering({ ...service, kind: 'Car service' }) }} onKeyDown={(event) => event.stopPropagation()}>More info <ArrowRight size={16} /></button>
          </div>
        </div>
      </article>)}
    </div>
  </section>
}

function NightCarRepairs({ onSelectOffering }) {
  const [activeRepair, setActiveRepair] = useState(1)

  return <section className="night-services night-repairs" id="car-repairs">
    <div className="night-section-head"><h2>Car repairs.<br /><em>Made mobile.</em></h2><p>Choose a repair category to open the bay. We test, explain and recommend the right next step before work begins.</p></div>
     <div className="night-service-rail">{repairGroups.map((group, index) => <article className={`night-service-panel ${group.featured ? 'featured' : ''} ${group.flipImage ? 'image-flipped' : ''} ${activeRepair === index ? 'active' : ''}`} key={group.title} onMouseEnter={() => setActiveRepair(index)} onFocus={() => setActiveRepair(index)} onClick={() => { setActiveRepair(index); onSelectOffering({ ...group, kind: 'Car repair' }) }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveRepair(index); onSelectOffering({ ...group, kind: 'Car repair' }) } }} tabIndex="0" role="button" aria-haspopup="dialog" aria-label={`View ${group.title} details`} style={{ '--night-panel-image': group.flipImage ? 'none' : `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.9)), ${responsiveImageSet(group.image)}`, '--night-flipped-image': `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.9)), ${responsiveImageSet(group.image)}` }}>
       {group.flipImage ? <i className="night-service-panel-image" aria-hidden="true" /> : null}<span>{group.number}</span><div><h3>{group.title}</h3><p>{group.summary}</p><div className="night-panel-actions"><a className="night-panel-book" href="#booking" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>Book now <ArrowDownRight size={16} /></a><button className="night-panel-more-info" type="button" onClick={(event) => { event.stopPropagation(); onSelectOffering({ ...group, kind: 'Car repair' }) }} onKeyDown={(event) => event.stopPropagation()}>More info <ArrowRight size={16} /></button></div></div>
    </article>)}</div>
  </section>
}

function NightCapabilityStrip() {
  const marqueeRef = useRef(null)
  const marqueeTween = useRef(null)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    marqueeTween.current = gsap.to('.night-capability-track', {
      xPercent: -50,
      duration: 30,
      ease: 'none',
      repeat: -1,
    })

    return () => {
      marqueeTween.current = null
    }
  }, { scope: marqueeRef })

  useEffect(() => {
    const marquee = marqueeRef.current
    const tween = marqueeTween.current
    if (!marquee || !tween) return undefined

    let inView = true
    const syncPlayback = () => {
      if (inView && !document.hidden) tween.resume()
      else tween.pause()
    }
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      syncPlayback()
    }, { threshold: 0 }) : null
    observer?.observe(marquee)
    document.addEventListener('visibilitychange', syncPlayback)
    syncPlayback()

    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
    }
  }, [])

  const easeMarqueeTo = (timeScale) => {
    if (!marqueeTween.current) return
    gsap.to(marqueeTween.current, { timeScale, duration: .7, ease: 'power3.out', overwrite: true })
  }

  return <section className="night-capability" aria-labelledby="night-capability-carousel-heading">
    <div className="night-capability-intro">
      <h2 id="night-capability-carousel-heading">All makes.<br /><em>All models.</em></h2>
    </div>
    <div
      className="night-capability-marquee"
      ref={marqueeRef}
      onPointerEnter={() => easeMarqueeTo(.18)}
      onPointerLeave={() => easeMarqueeTo(1)}
      aria-label="Vehicle categories serviced"
    >
      <div className="night-capability-track">
        {[0, 1].map((loop) => <ul className="night-capability-group" key={loop} aria-hidden={loop === 1}>
          {capabilityCarouselItems.map((item) => <li className="night-capability-item" key={`${loop}-${item}`}>
            <span aria-hidden="true" />Servicing and repairs for all makes and models, including hybrids
          </li>)}
        </ul>)}
      </div>
    </div>
  </section>
}

function NightAbout() {
  return <section className="night-story" id="about">
    <div className="night-story-heading"><span>About Us</span><h2>Proper care.<br /><em>Built around you.</em></h2><p>In-House Mobile Mechanics is an owner-operated business with more than 20 years in the automotive trade. Since 2006, we’ve worked across generations of vehicles and most makes and models, bringing broad knowledge and diagnostic capability to every job. From routine servicing to complex repairs, we provide practical solutions, fair pricing and honest advice, including the right specialist referral when a job falls outside our scope.</p><a href={BUSINESS.phoneHref}>Speak directly with us <ArrowRight size={16} /></a></div>
    <div className="night-stack">
       <article className="night-stack-card image"><img src={optimizedImage('/assets/about-qualified-expertise.png')} srcSet={`${optimizedImage('/assets/about-qualified-expertise.png', 768)} 768w, ${optimizedImage('/assets/about-qualified-expertise.png', 1600)} 1600w`} sizes="(max-width: 620px) 100vw, 50vw" alt="Mechanic's gloved hands holding a vehicle inspection clipboard" loading="lazy" decoding="async" /><div><strong>Qualified expertise.</strong></div></article>
      <article className="night-stack-card bone"><strong>Direct communication.</strong><p>You deal directly with the mechanic working on your vehicle. From the first conversation to the final handover.</p><span>Home or workplace · Clear advice · Meticulous workmanship</span></article>
      <article className="night-stack-card red"><strong>Honest advice.<br />Quality workmanship.<br />Experienced mechanics.</strong></article>
    </div>
  </section>
}

function NightInfoCentre() {
  return <section className="night-info" id="info-centre">
    <div className="night-info-head"><span>Frequently Asked Questions</span><h2>Know your car.<br /><em>Choose with confidence.</em></h2><p>Clear automotive guidance, built to help you understand maintenance, warning signs and what good service should include.</p></div>
     <div className="night-info-list">{infoTopics.map((topic, index) => <article className="night-info-row" id={`info-${topic.slug}`} key={topic.slug}><span>{String(index + 1).padStart(2, '0')}</span><h3>{topic.title}</h3><p>{topic.copy}</p><a href="#contact" aria-label={`Ask us about ${topic.title}`}>Ask us <ArrowRight size={16} /></a></article>)}</div>
  </section>
}

function NightOffersModal({ onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        event.preventDefault()
        closeRef.current?.focus()
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return <div className="night-offers-modal" role="dialog" aria-modal="true" aria-labelledby="night-offers-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <article className="night-offers-card">
      <button className="night-offers-close" ref={closeRef} type="button" onClick={onClose} aria-label="Close offers modal"><X size={21} /></button>
      <span className="night-offers-eyebrow">Current offer</span>
      <h2 id="night-offers-title">Refer <em>&amp; Save</em></h2>
      <p className="night-offers-lede">Refer a friend or family member and you both save $50.</p>
      <div className="night-offers-savings" aria-label="Referral savings">
        <div><span>When they book their first service with us</span><strong>$50 <small>off</small></strong><p>For your friend or family member</p></div>
        <div><span>On your next service</span><strong>$50 <small>off</small></strong><p>For you</p></div>
      </div>
      <p className="night-offers-note">Referral must be mentioned at time of booking.</p>
    </article>
  </div>
}

function NightEnquiryForm({ onSent }) {
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now())

  const submit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      vehicle: formData.get('vehicle'),
      service: formData.get('service'),
      registration: formData.get('registration'),
      comments: formData.get('comments'),
      website: formData.get('website'),
      formStartedAt,
    }
    setStatus('sending')
    setErrorMessage('')
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'We could not send your enquiry.')
      onSent()
    } catch (error) {
      setStatus('error')
      setErrorMessage(error.name === 'AbortError' ? 'The request took too long. Please try again or call Peter on 0407 088 849.' : error.message || 'We could not send your enquiry. Please try again or call Peter on 0407 088 849.')
    } finally {
      window.clearTimeout(timeout)
    }
  }

  return <form className="night-booking-form" onSubmit={submit} aria-busy={status === 'sending'}>
    <div className="night-field-grid">
      <label>Name<input required name="name" autoComplete="name" placeholder="Full name" /></label>
      <label>Phone<input required name="phone" type="tel" autoComplete="tel" placeholder="Mobile number" /></label>
      <label>Email<input required name="email" type="email" autoComplete="email" placeholder="you@example.com" /></label>
      <label>Vehicle<input required name="vehicle" placeholder="Make, model, year" /></label>
      <label>Service or repair<select required name="service" defaultValue=""><option value="" disabled>Select service or repair</option>{bookingServiceOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
      <label>Vehicle Registration<input name="registration" placeholder="Registration number" /></label>
      <label className="night-field-wide">Additional comments<textarea name="comments" rows="5" placeholder="Tell us how we can help." /></label>
      <label className="night-field-trap" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" /></label>
    </div>
    {errorMessage ? <p className="night-booking-error" role="alert">{errorMessage}</p> : null}
    <button className="night-submit" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send inquiry'} <ArrowRight size={18} /></button>
  </form>
}

function NightShiftPage() {
  const nightScope = useRef(null)
  const spotlightRef = useRef(null)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [reviewDirection, setReviewDirection] = useState('next')
  const [sent, setSent] = useState(false)
  const [selectedOffering, setSelectedOffering] = useState(null)
  const manifesto = 'Professional car care should move around your life, not force your life to move around it.'

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReviewDirection('next')
      setReviewIndex((current) => (current + 1) % reviews.length)
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [reviewIndex])

  const changeReview = (direction) => {
    setReviewDirection(direction)
    setReviewIndex((current) => (current + (direction === 'next' ? 1 : reviews.length - 1)) % reviews.length)
  }

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
      .from('.night-hero h1, .night-hero-lede, .night-hero-actions', { y: 42, opacity: 0, duration: .9, stagger: .12 }, '-=.35')

    gsap.to('.night-hero-bg', { scale: 1.1, yPercent: 7, ease: 'none', scrollTrigger: { id: 'night-hero-parallax', trigger: '.night-hero', start: 'top top', end: 'bottom top', scrub: 1 } })
    gsap.from('.night-repairs .night-service-panel', { y: 110, rotationX: -10, stagger: .12, scrollTrigger: { id: 'night-services-in', trigger: '.night-repairs .night-service-rail', start: 'top 84%', end: 'top 48%', scrub: 1 } })
    gsap.to('.night-manifesto span', { opacity: 1, stagger: .08, scrollTrigger: { id: 'night-words', trigger: '.night-manifesto', start: 'top 78%', end: 'bottom 38%', scrub: 1 } })
    nightMedia.add('(min-width: 901px)', () => ScrollTrigger.create({ id: 'night-story-pin', trigger: '.night-story', start: () => (window.innerHeight < 850 ? 'top -230px' : 'top -100px'), end: 'bottom bottom', pin: '.night-story-heading', pinSpacing: true }))
    gsap.utils.toArray('.night-stack-card').forEach((card, index) => gsap.from(card, { y: 170, scale: .86, opacity: .25, rotation: index % 2 ? 3 : -3, scrollTrigger: { id: `night-stack-${index}`, trigger: card, start: 'top 93%', end: 'top 58%', scrub: 1 } }))
    gsap.from('.night-review-inner', { y: 90, opacity: 0, scrollTrigger: { id: 'night-review', trigger: '.night-review', start: 'top 80%', end: 'top 48%', scrub: 1 } })
    gsap.from('.night-info-row', { y: 55, opacity: 0, stagger: .08, scrollTrigger: { id: 'night-info-in', trigger: '.night-info-list', start: 'top 86%', end: 'top 45%', scrub: 1 } })
    return () => nightMedia.revert()
  }, { scope: nightScope })

  return <main className="night-page" ref={nightScope}>
    <div className="night-spotlight" ref={spotlightRef} aria-hidden="true" />
    <NightNavigation />

    <header className="night-hero" id="night-top">
      <div className="night-hero-bg" aria-hidden="true" />
      <div className="night-hero-shade" aria-hidden="true" />
      <div className="night-hero-content">
        <img className="night-hero-logo" src="/assets/inhouse-logo-transparent.png" alt="In-House Mobile Mechanics" />
        <h1>Your workshop.<br />Wherever you stop.</h1>
        <p className="night-hero-lede">Professional mobile servicing and repairs for all makes and models. We come to your home or workplace.</p>
        <div className="night-hero-actions"><a className="night-button red" href={BUSINESS.phoneHref}><Phone size={17} /> Call now</a><a className="night-button outline" href="#booking">Book Online <ArrowDownRight size={18} /></a></div>
      </div>
    </header>

    <NightCarServices onSelectOffering={setSelectedOffering} />
    <NightCapabilityStrip />
    <NightCarRepairs onSelectOffering={setSelectedOffering} />

    <section className="night-manifesto-wrap"><p className="night-manifesto">{manifesto.split(' ').map((word, index) => <span key={`${word}-${index}`}>{word} </span>)}</p></section>

    <NightAbout />

     <section className="night-review" id="night-reviews"><div className="night-review-inner"><div className="night-review-nav"><span>Client reviews</span><div><button onClick={() => changeReview('previous')} aria-label="Previous review"><ArrowLeft size={18} /></button><button onClick={() => changeReview('next')} aria-label="Next review"><ArrowRight size={18} /></button></div></div><div className={`night-review-slide is-${reviewDirection}`} key={reviews[reviewIndex].quote} aria-live="polite"><blockquote>“{reviews[reviewIndex].quote}”</blockquote><p>{reviews[reviewIndex].name} <span className="night-review-vehicle" aria-label={`${reviews[reviewIndex].vehicle}, ${reviews[reviewIndex].rating ?? 5} star review`}>{reviews[reviewIndex].vehicle}{Array.from({ length: reviews[reviewIndex].rating ?? 5 }, (_, index) => <Star key={index} aria-hidden="true" />)}</span></p></div></div></section>

    <NightInfoCentre />

    <section className="night-booking" id="contact">
      <span className="night-booking-anchor" id="booking" aria-hidden="true" />
      <div className="night-booking-copy"><span>Contact Us</span><h2>Make the<br />workshop come<br />to you.</h2><p>Tell us what you need and we’ll be in touch to confirm availability, access and the right next step.</p><div className="night-contact-links"><a href={BUSINESS.phoneHref}><Phone size={16} /> {BUSINESS.phoneDisplay}</a><a href={`mailto:${BUSINESS.email}`}><Mail size={16} /> Email us</a></div><small>After-hours call-outs may be available by arrangement. Additional charges may apply; availability and conditions are confirmed before attendance.</small></div>
       {sent ? <div className="night-booking-success" role="status" aria-live="polite"><Check size={34} /><h3>Request received.</h3><p>We’ll be in touch shortly to discuss your inquiry.</p><button onClick={() => setSent(false)}>Make another request</button></div> : <NightEnquiryForm onSent={() => setSent(true)} />}
    </section>

    <footer className="night-footer"><img src="/assets/inhouse-logo-transparent.png" alt="In-House Mobile Mechanics" /><div className="night-footer-nav"><div className="night-footer-links"><a href="#car-services">Car Services</a><a href="#car-repairs">Car Repairs</a><a href="#about">About Us</a><a href="#info-centre">FAQ</a><a href="#booking">Book Online</a></div><span className="night-footer-service-area">Servicing Sydney metro &amp; surrounding areas</span></div><p className="night-footer-details"><a href={BUSINESS.phoneHref}>{BUSINESS.phoneDisplay}</a><a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a><span>ABN 32 656 800 641</span><span>{BUSINESS.licence}</span><span>MVTC189147</span></p></footer>
     <a className="night-sticky-call" href={BUSINESS.phoneHref}><Phone size={18} /><span>Call now</span><strong>After hours available</strong></a>
    {selectedOffering ? <NightOfferingModal offering={selectedOffering} onClose={() => setSelectedOffering(null)} /> : null}
  </main>
}

export default function App() {
  return <NightShiftPage />
}
