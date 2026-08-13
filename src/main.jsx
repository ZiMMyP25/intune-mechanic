import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import OwnerInsights from './OwnerInsights'
import { AnalyticsTracker } from './analytics'
import './styles.css'

const isOwnerInsights = window.location.pathname === '/owner-insights'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{isOwnerInsights ? <OwnerInsights /> : <><AnalyticsTracker /><App /></>}</React.StrictMode>,
)
