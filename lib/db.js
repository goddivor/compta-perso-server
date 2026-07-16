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

export const TABLES = ['accounts', 'categories', 'transactions', 'forecast_sessions']
