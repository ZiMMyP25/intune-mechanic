export const analyticsSchema = [
  `CREATE TABLE IF NOT EXISTS analytics_events (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, event_type TEXT NOT NULL, section_id TEXT, target TEXT, label TEXT, path TEXT NOT NULL, referrer_host TEXT, device_type TEXT NOT NULL, created_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_analytics_events_created_type ON analytics_events(created_at, event_type)`,
  `CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id)`,
]
