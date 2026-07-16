export function checkAuth(req, res) {
  const token = process.env.SYNC_TOKEN
  if (!token) {
    res.status(500).json({ error: 'SYNC_TOKEN env var is missing' })
    return false
  }
  const header = req.headers.authorization || ''
  if (header !== `Bearer ${token}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}
