import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getKelasData, getTanggal, getAbsenData, saveAbsenData } from '../utils/store'
import { logout } from '../utils/auth'
import ThemeToggle from '../components/ThemeToggle'
import Absen1112 from '../components/Absen1112'
import './Absen.css'

const KET_OPTIONS = [
  { value: 's', label: 'Sakit' },
  { value: 'i', label: 'Izin' },
  { value: 'a', label: 'Alpa' },
  { value: 'd', label: 'Dispensasi' },
]
const BULAN = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export default function Absen() {
  const navigate  = useNavigate()
  const kelasList = getKelasData()
  const tanggal   = getTanggal()

  useEffect(() => { if (!kelasList || !tanggal) navigate('/dashboard') }, [])

  const [tab,          setTab]          = useState('x')      // 'x' | '1112'
  const [activeIdx,    setActiveIdx]    = useState(0)
  const [search,       setSearch]       = useState('')
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [absenMap,     setAbsenMap]     = useState(() => getAbsenData() || {})
  const searchRef = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault(); searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!kelasList || !tanggal) return null

  const kelas     = kelasList[activeIdx]
  const kelasName = kelas.nama

  const filtered = useMemo(() => {
    if (!search.trim()) return kelas.siswa
    return kelas.siswa.filter(s => s.nama.toLowerCase().includes(search.trim().toLowerCase()))
  }, [kelas, search])

  const kelasAbsen      = absenMap[kelasName] || {}
  const tidakHadirCount = kelas.siswa.filter(s => kelasAbsen[s.id]?.tidakHadir).length
  const hadirCount      = kelas.jumlahTotal - tidakHadirCount
  const isDone          = (k) => absenMap[k.nama] !== undefined

  function toggleSiswa(siswaId) {
    setAbsenMap(prev => {
      const cur      = prev[kelasName] || {}
      const curSiswa = cur[siswaId] || { tidakHadir: false, ket: 's' }
      const updated  = { ...cur, [siswaId]: { ...curSiswa, tidakHadir: !curSiswa.tidakHadir, ket: curSiswa.ket || 's' } }
      const next     = { ...prev, [kelasName]: updated }
      saveAbsenData(next); return next
    })
  }

  function setKet(siswaId, ket) {
    setAbsenMap(prev => {
      const cur     = prev[kelasName] || {}
      const updated = { ...cur, [siswaId]: { ...(cur[siswaId] || { tidakHadir: true }), ket } }
      const next    = { ...prev, [kelasName]: updated }
      saveAbsenData(next); return next
    })
  }

  return (
    <div className="absen-root">
      <nav className="absen-nav">
        <button className="nav-back" onClick={() => navigate('/dashboard')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Dashboard
        </button>
        {/* Tab switch */}
        <div className="nav-tabs">
          <button className={`nav-tab ${tab === 'x' ? 'active' : ''}`} onClick={() => setTab('x')}>
            Kelas X
          </button>
          <button className={`nav-tab ${tab === '1112' ? 'active' : ''}`} onClick={() => setTab('1112')}>
            Kelas XI / XII
          </button>
        </div>
        <div className="nav-right">
          <ThemeToggle />
          <button className="nav-selesai" onClick={() => navigate('/rekap')}>
            Lihat Rekap
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── TAB: Kelas XI/XII ─────────────────────────── */}
      {tab === '1112' && (
        <div className="absen-panel" style={{overflow:'auto'}}>
          <Absen1112 />
        </div>
      )}

      {/* ── TAB: Kelas X ─────────────────────────────── */}
      {tab === 'x' && (
        <div className="absen-body">
          {/* Mobile sidebar toggle */}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            Pilih Kelas
            <span className="toggle-progress">{kelasList.filter(k => isDone(k)).length}/{kelasList.length} selesai</span>
          </button>

          {/* Sidebar */}
          <aside className={`absen-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <p className="sidebar-label">Daftar Kelas</p>
            <div className="sidebar-list">
              {kelasList.map((k, i) => (
                <button
                  key={i}
                  className={`sidebar-item ${i === activeIdx ? 'active' : ''} ${isDone(k) ? 'done' : ''}`}
                  onClick={() => { setActiveIdx(i); setSearch(''); setSidebarOpen(false) }}
                >
                  <span className="sidebar-dot">
                    {isDone(k)
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      : <span className="dot-empty"/>}
                  </span>
                  <span className="sidebar-kelas">{k.nama}</span>
                  <span className="sidebar-total">{k.jumlahTotal}</span>
                </button>
              ))}
            </div>
            <div className="sidebar-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(kelasList.filter(k => isDone(k)).length / kelasList.length) * 100}%` }}/>
              </div>
              <span className="progress-text">{kelasList.filter(k => isDone(k)).length} / {kelasList.length} kelas</span>
            </div>
          </aside>

          {/* Main panel */}
          <main className="absen-panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-kelas">{kelasName}</h2>
                <p className="panel-sub">{kelas.jumlahTotal} siswa terdaftar</p>
              </div>
              <div className="counter-row">
                <div className="counter-item"><span className="counter-num">{kelas.jumlahTotal}</span><span className="counter-label">Total</span></div>
                <div className="counter-divider"/>
                <div className="counter-item green"><span className="counter-num">{hadirCount}</span><span className="counter-label">Hadir</span></div>
                <div className="counter-divider"/>
                <div className="counter-item red"><span className="counter-num">{tidakHadirCount}</span><span className="counter-label">Tidak Hadir</span></div>
              </div>
            </div>

            <div className="search-wrap">
              <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input ref={searchRef} type="text" className="search-input"
                placeholder='Cari nama siswa... (tekan "/" untuk fokus)'
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
            </div>

            <div className="siswa-list">
              {filtered.length === 0
                ? <div className="siswa-empty">Tidak ada siswa ditemukan</div>
                : filtered.map(siswa => {
                    const state      = kelasAbsen[siswa.id] || { tidakHadir: false, ket: 's' }
                    const tidakHadir = state.tidakHadir
                    return (
                      <div key={siswa.id} className={`siswa-row ${tidakHadir ? 'absent' : ''}`}>
                        <button className={`siswa-check ${tidakHadir ? 'checked' : ''}`} onClick={() => toggleSiswa(siswa.id)}>
                          {tidakHadir && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </button>
                        <span className="siswa-nama">{siswa.nama}</span>
                        <span className="siswa-jk">{siswa.jk}</span>
                        {tidakHadir ? (
                          <div className="ket-wrap">
                            {KET_OPTIONS.map(opt => (
                              <button key={opt.value} className={`ket-btn ${state.ket === opt.value ? 'active' : ''}`} onClick={() => setKet(siswa.id, opt.value)}>
                                {opt.value}
                              </button>
                            ))}
                          </div>
                        ) : <span className="ket-placeholder">—</span>}
                      </div>
                    )
                  })
              }
            </div>

            <div className="panel-nav">
              <button className="pnav-btn" onClick={() => { setActiveIdx(i => i-1); setSearch('') }} disabled={activeIdx === 0}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Sebelumnya
              </button>
              <span className="pnav-info">{activeIdx+1} / {kelasList.length}</span>
              {activeIdx < kelasList.length - 1
                ? <button className="pnav-btn next" onClick={() => { setActiveIdx(i => i+1); setSearch('') }}>
                    Berikutnya <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                : <button className="pnav-btn next finish" onClick={() => setTab('1112')}>
                    Lanjut XI/XII <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
              }
            </div>
          </main>
        </div>
      )}
    </div>
  )
}
