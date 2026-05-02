import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './utils/auth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Absen from './pages/Absen'
import Rekap from './pages/Rekap'
import './styles/global.css'

function RequireAuth({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"     element={<Login />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/absen"     element={<RequireAuth><Absen /></RequireAuth>} />
        <Route path="/rekap"     element={<RequireAuth><Rekap /></RequireAuth>} />
        <Route path="*"          element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
