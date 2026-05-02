import { useTheme } from '../context/ThemeContext'
import './ThemeToggle.css'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button className="theme-toggle" onClick={toggle} title={isDark ? 'Tema terang' : 'Tema gelap'}>
      <div className={`toggle-track ${isDark ? 'dark' : 'light'}`}>
        <span className="toggle-icon sun">☀️</span>
        <span className="toggle-icon moon">🌙</span>
        <div className="toggle-thumb"/>
      </div>
    </button>
  )
}
