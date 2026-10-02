import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AnalyticsTracker } from './analytics'
import './styles.css'

const OwnerInsights = lazy(() => import('./OwnerInsights'))
const isOwnerInsights = window.location.pathname === '/owner-insights' || window.location.pathname === '/owner-insights/'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{isOwnerInsights ? <Suspense fallback={<main className="owner-loading">Loading private reporting…</main>}><OwnerInsights /></Suspense> : <><AnalyticsTracker /><App /></>}</React.StrictMode>,
)
