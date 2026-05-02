import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [kelasList, setKelasList] = useState([])
  const [tanggal, setTanggal] = useState({ hari: '', tanggal: '', bulan: '', tahun: '' })
  const [absenData, setAbsenData] = useState({})

  function updateAbsenKelas(namaKelas, tidakHadir) {
    setAbsenData(prev => ({ ...prev, [namaKelas]: tidakHadir }))
  }

  return (
    <AppContext.Provider value={{ kelasList, setKelasList, tanggal, setTanggal, absenData, updateAbsenKelas }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
