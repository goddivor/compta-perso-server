// Returns the sync configuration (API URL + token) so apps can self-configure
// with a single tap. Protected by a build-time key embedded in the app
// binaries (never committed — the app repos are public).
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const configKey = process.env.CONFIG_KEY
  const syncToken = process.env.SYNC_TOKEN
  if (!configKey || !syncToken) {
    return res.status(500).json({ error: 'CONFIG_KEY or SYNC_TOKEN env var is missing' })
  }

  if ((req.headers['x-config-key'] || '') !== configKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return res.status(200).json({
    ok: true,
    api_url: `${proto}://${host}`,
    token: syncToken,
  })
}
