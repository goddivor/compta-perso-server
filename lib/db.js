import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) throw new Error('MONGODB_URI env var is missing')

// Reuse the client across serverless invocations (Vercel keeps the module warm)
let clientPromise = globalThis._mongoClientPromise
if (!clientPromise) {
  clientPromise = new MongoClient(uri).connect()
  globalThis._mongoClientPromise = clientPromise
}

export async function getDb() {
  const client = await clientPromise
  return client.db(process.env.MONGODB_DB || 'compta-perso')
}

// v1 tables: every snapshot carries them, so a push without one is rejected.
export const CORE_TABLES = ['accounts', 'categories', 'transactions', 'forecast_sessions']

// v2 tables (additive): an old client's snapshot does not carry them, so a missing one is read
// as an empty array. `profile` is a singleton row (country_iso2, currency, created_at);
// `fee_rules` rows are (id, account_id, name, kind, value, tiers JSON text, position).
export const OPTIONAL_TABLES = ['profile', 'fee_rules']

export const TABLES = [...CORE_TABLES, ...OPTIONAL_TABLES]

// Row counts for every table, 0 where a snapshot pushed before v2 has none recorded.
export function fullCounts(counts) {
  const out = {}
  for (const t of TABLES) out[t] = Number.isInteger(counts?.[t]) ? counts[t] : 0
  return out
}
