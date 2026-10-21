import { getDb, fullCounts } from '../lib/db.js'
import { checkAuth } from '../lib/auth.js'

// Lightweight check: when was the last push, from which device, how many rows.
// `counts` lists every table of TABLES, 0 for one a pre-v2 snapshot did not carry.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!checkAuth(req, res)) return

  const db = await getDb()
  const meta = await db.collection('meta').findOne({ _id: 'snapshot' })
  return res.status(200).json({
    ok: true,
    meta: meta ? { ...meta, counts: fullCounts(meta.counts) } : null,
  })
}
