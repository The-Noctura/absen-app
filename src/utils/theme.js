const KEY = 'absen_theme'

export function getTheme() {
  return localStorage.getItem(KEY) || 'dark'
}

export function setTheme(theme) {
  localStorage.setItem(KEY, theme)
  document.documentElement.setAttribute('data-theme', theme)
}

export function initTheme() {
  const theme = getTheme()
  document.documentElement.setAttribute('data-theme', theme)
  return theme
}
