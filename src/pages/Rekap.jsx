import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getKelasData, getTanggal, getAbsenData } from '../utils/store'
import { exportToWord } from '../utils/wordExporter'
import ThemeToggle from '../components/ThemeToggle'
import './Rekap.css'

const BULAN = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const KET_LABEL = { s:'Sakit', i:'Izin', a:'Alpa', d:'Dispensasi' }

export default function Rekap() {
  const navigate  = useNavigate()
  const kelasList = getKelasData()
  const tanggal   = getTanggal()
  const absenMap  = getAbsenData()
  const [exporting, setExporting] = useState(false)

  if (!kelasList || !tanggal) {
    navigate('/dashboard'); return null
  }

  // Build summary rows
  const rows = kelasList.map(kelas => {
    const kelasAbsen = absenMap[kelas.nama] || {}
    const tidakHadir = kelas.siswa.filter(s => kelasAbsen[s.id]?.tidakHadir)
    const hadir      = kelas.jumlahTotal - tidakHadir.length
    const tidakHadirText = tidakHadir.map(s => `${s.nama} (${kelasAbsen[s.id]?.ket || 'a'})`).join(', ') || '—'
    return { kelas, hadir, tidakHadir, tidakHadirText }
  })

  const totalSiswa   = kelasList.reduce((s, k) => s + k.jumlahTotal, 0)
  const totalHadir   = rows.reduce((s, r) => s + r.hadir, 0)
  const totalAbsent  = rows.reduce((s, r) => s + r.tidakHadir.length, 0)

  async function handleExport() {
    setExporting(true)
    try {
      await exportToWord({ kelasList, absenMap, tanggal })
    } catch(e) {
      alert('Gagal export: ' + e.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="rekap-root">
      {/* Navbar */}
      <nav className="rekap-nav">
        <button className="nav-back" onClick={() => navigate('/absen')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Kembali
        </button>
        <div className="nav-center">
          <span className="nav-date">{tanggal.namaHari}, {tanggal.tanggal} {BULAN[tanggal.bulan]} {tanggal.tahun}</span>
        </div>
        <div className="nav-right">
          <ThemeToggle />
          <button className={`nav-export ${exporting ? 'loading' : ''}`} onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <><span className="exp-spinner"/> Membuat file...</>
            ) : (
              <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>Export Word</>
            )}
          </button>
        </div>
      </nav>

      <main className="rekap-main">
        <div className="rekap-header">
          <div>
            <h1 className="rekap-title">Preview Rekap</h1>
            <p className="rekap-sub">REKAP ABSEN PEMBINAAN KELAS X &nbsp;·&nbsp; {tanggal.namaHari}, {tanggal.tanggal} {BULAN[tanggal.bulan]} {tanggal.tahun}</p>
          </div>
          {/* Summary cards */}
          <div className="summary-row">
            <div className="sum-card">
              <span className="sum-num">{totalSiswa}</span>
              <span className="sum-label">Total Siswa</span>
            </div>
            <div className="sum-card green">
              <span className="sum-num">{totalHadir}</span>
              <span className="sum-label">Hadir</span>
            </div>
            <div className="sum-card red">
              <span className="sum-num">{totalAbsent}</span>
              <span className="sum-label">Tidak Hadir</span>
            </div>
          </div>
        </div>

        {/* Preview tabel */}
        <div className="table-wrap">
          <table className="rekap-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Jurusan</th>
                <th>Jml Siswa</th>
                <th>Jml Siswi</th>
                <th>Jml Keseluruhan</th>
                <th>Jml Hadir</th>
                <th>Tidak Hadir</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={r.tidakHadir.length > 0 ? 'has-absent' : ''}>
                  <td className="center">{i + 1}</td>
                  <td>{r.kelas.nama}</td>
                  <td className="center">{r.kelas.jumlahSiswa}</td>
                  <td className="center">{r.kelas.jumlahSiswi}</td>
                  <td className="center">{r.kelas.jumlahTotal}</td>
                  <td className="center hadir">{r.hadir}</td>
                  <td className="absent-cell">{r.tidakHadirText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Export button bawah */}
        <div className="rekap-footer">
          <button className={`btn-export ${exporting ? 'loading' : ''}`} onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <><span className="exp-spinner"/> Membuat file Word...</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>Download Rekap (.docx)</>
            )}
          </button>
          <p className="export-hint">File akan otomatis terunduh ke komputer Anda</p>
        </div>
      </main>
    </div>
  )
}
