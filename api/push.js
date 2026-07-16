import { getDb, TABLES } from '../lib/db.js'
import { checkAuth } from '../lib/auth.js'

// Replaces the cloud snapshot with the client's full local data.
// Body: { device: string, data: { accounts: [], categories: [], transactions: [], forecast_sessions: [] } }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!checkAuth(req, res)) return

  const { device, data } = req.body || {}
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Missing data payload' })
  }
  for (const t of TABLES) {
    if (!Array.isArray(data[t])) {
      return res.status(400).json({ error: `data.${t} must be an array` })
    }
  }

  const db = await getDb()
  const counts = {}

  for (const t of TABLES) {
    const col = db.collection(t)
    await col.deleteMany({})
    if (data[t].length) {
      // Keep SQLite integer ids in `id`; let Mongo generate its own _id
      await col.insertMany(data[t].map(row => ({ ...row })))
    }
    counts[t] = data[t].length
  }

  const meta = {
    _id: 'snapshot',
    pushed_at: new Date().toISOString(),
    device: device || 'unknown',
    counts,
  }
  await db.collection('meta').replaceOne({ _id: 'snapshot' }, meta, { upsert: true })

  return res.status(200).json({ ok: true, meta })
}
