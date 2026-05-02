const SESSION_KEY = 'absen_auth'

export async function login(username, password) {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (data.success) {
      sessionStorage.setItem(SESSION_KEY, data.token)
      return { success: true }
    }
    return { success: false, error: data.error }
  } catch {
    // Fallback for local dev without API
    if (username === 'admin' && password === 'absen2025') {
      sessionStorage.setItem(SESSION_KEY, 'absen-session-ok')
      return { success: true }
    }
    return { success: false, error: 'Username atau password salah' }
  }
}

export function isAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === 'absen-session-ok'
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}
