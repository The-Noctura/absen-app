export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = req.body

  const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin'
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'absen2025'

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.status(200).json({ success: true, token: 'absen-session-ok' })
  }

  return res.status(401).json({ success: false, error: 'Username atau password salah' })
}
