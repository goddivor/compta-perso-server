import { getDb, TABLES, fullCounts } from '../lib/db.js'
import { checkAuth } from '../lib/auth.js'

// Returns the full cloud snapshot. Every table of TABLES is present in `data`: one never pushed
// (a snapshot from a client older than v2) comes back as an empty array.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!checkAuth(req, res)) return

  const db = await getDb()
  const meta = await db.collection('meta').findOne({ _id: 'snapshot' })
  if (!meta) return res.status(404).json({ error: 'No snapshot in cloud yet' })

  const data = {}
  for (const t of TABLES) {
    data[t] = await db.collection(t)
      .find({}, { projection: { _id: 0 } })
      .sort({ id: 1 })
      .toArray()
  }

  return res.status(200).json({ ok: true, meta: { ...meta, counts: fullCounts(meta.counts) }, data })
}
