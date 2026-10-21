import { getDb, TABLES, CORE_TABLES, OPTIONAL_TABLES } from '../lib/db.js'
import { checkAuth } from '../lib/auth.js'

// Replaces the cloud snapshot with the client's full local data.
// Body: { device: string, data: { accounts: [], categories: [], transactions: [], forecast_sessions: [],
//                                profile?: [], fee_rules?: [] } }
// profile and fee_rules are optional: a client older than v2 omits them and the snapshot then
// holds none (last push wins, so the cloud stays one consistent snapshot).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!checkAuth(req, res)) return

  const { device, data } = req.body || {}
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Missing data payload' })
  }
  for (const t of CORE_TABLES) {
    if (!Array.isArray(data[t])) {
      return res.status(400).json({ error: `data.${t} must be an array` })
    }
  }
  for (const t of OPTIONAL_TABLES) {
    if (data[t] !== undefined && data[t] !== null && !Array.isArray(data[t])) {
      return res.status(400).json({ error: `data.${t} must be an array when present` })
    }
  }

  const db = await getDb()
  const counts = {}

  for (const t of TABLES) {
    const rows = Array.isArray(data[t]) ? data[t] : []
    const col = db.collection(t)
    await col.deleteMany({})
    if (rows.length) {
      // Keep SQLite integer ids in `id`; let Mongo generate its own _id
      await col.insertMany(rows.map(row => ({ ...row })))
    }
    counts[t] = rows.length
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
