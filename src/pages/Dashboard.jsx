import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseExcel } from '../utils/excelParser'
import { saveKelasData, saveTanggal, getKelasData, getTanggal } from '../utils/store'
import { logout } from '../utils/auth'
import './Dashboard.css'

const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const HARI  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']

function todayValues() {
  const n = new Date()
  return { tanggal: n.getDate(), bulan: n.getMonth()+1, tahun: n.getFullYear() }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const fileInputRef = useRef()

  const [kelasList,    setKelasList]    = useState(() => getKelasData())
  const [uploading,    setUploading]    = useState(false)
  const [uploadError,  setUploadError]  = useState('')
  const [dragOver,     setDragOver]     = useState(false)
  const [fileName,     setFileName]     = useState('')

  const today = todayValues()
  const [tanggal, setTanggal] = useState(() => getTanggal()?.tanggal || today.tanggal)
  const [bulan,   setBulan]   = useState(() => getTanggal()?.bulan   || today.bulan)
  const [tahun,   setTahun]   = useState(() => getTanggal()?.tahun   || today.tahun)

  const namaHari = HARI[new Date(tahun, bulan-1, tanggal).getDay()]

  const handleFile = useCallback(async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['xlsx','xls','csv'].includes(ext)) {
      setUploadError('Format file harus .xlsx, .xls, atau .csv'); return
    }
    setUploading(true); setUploadError('')
    try {
      const result = await parseExcel(file)
      setKelasList(result); saveKelasData(result); setFileName(file.name)
    } catch(err) {
      setUploadError(err.message)
    } finally { setUploading(false) }
  }, [])

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }

  function handleMulai() {
    if (!kelasList) { setUploadError('Upload data siswa terlebih dahulu'); return }
    saveTanggal({ tanggal, bulan, tahun, namaHari })
    navigate('/absen')
  }

  const totalSiswa = kelasList?.reduce((s,k) => s+k.jumlahTotal, 0) || 0

  return (
    <div className="dash-root">
      <nav className="dash-nav">
        <div className="nav-brand">
          <span className="nav-icon">📋</span>
          <span className="nav-title">Rekap Absen</span>
        </div>
        <button className="nav-logout" onClick={() => { logout(); navigate('/login') }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Keluar
        </button>
      </nav>

      <main className="dash-main">
        <div className="dash-header">
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-sub">Persiapkan data sebelum mengisi absen</p>
        </div>

        <div className="dash-grid">

          {/* SECTION A */}
          <section className="dash-card">
            <div className="card-head">
              <div className="card-num">01</div>
              <div>
                <h2 className="card-title">Data Siswa</h2>
                <p className="card-desc">Upload file Excel berisi daftar nama siswa</p>
              </div>
            </div>

            <div className="format-hint">
              <span className="hint-tag">Format kolom wajib:</span>
              <div className="hint-cols">
                <span className="hint-col">Kelas</span>
                <span className="hint-col">Nama</span>
                <span className="hint-col hint-optional">Jenis_Kelamin (L/P)</span>
              </div>
            </div>

            <div
              className={`drop-zone ${dragOver ? 'drag-over' : ''} ${kelasList ? 'has-file' : ''}`}
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{display:'none'}} onChange={e => handleFile(e.target.files[0])} />
              {uploading ? (
                <div className="drop-loading"><div className="drop-spinner"/><span>Membaca file...</span></div>
              ) : kelasList ? (
                <div className="drop-success">
                  <div className="drop-icon success">✓</div>
                  <div>
                    <p className="drop-success-title">{fileName || 'File tersimpan'}</p>
                    <p className="drop-success-sub">{kelasList.length} kelas · {totalSiswa} siswa terdeteksi</p>
                  </div>
                  <span className="drop-change">Ganti</span>
                </div>
              ) : (
                <div className="drop-empty">
                  <div className="drop-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p className="drop-label">Klik atau drag & drop file Excel</p>
                  <p className="drop-formats">.xlsx · .xls · .csv</p>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="upload-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {uploadError}
              </div>
            )}

            {kelasList && (
              <div className="preview-wrap">
                <p className="preview-label">Kelas terdeteksi ({kelasList.length} kelas):</p>
                <div className="preview-table-wrap">
                  <table className="preview-table">
                    <thead><tr><th>Kelas</th><th>L</th><th>P</th><th>Total</th></tr></thead>
                    <tbody>
                      {kelasList.map((k,i) => (
                        <tr key={i}>
                          <td>{k.nama}</td>
                          <td>{k.jumlahSiswa}</td>
                          <td>{k.jumlahSiswi}</td>
                          <td><strong>{k.jumlahTotal}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* SECTION B */}
          <section className="dash-card">
            <div className="card-head">
              <div className="card-num">02</div>
              <div>
                <h2 className="card-title">Tanggal Rekap</h2>
                <p className="card-desc">Tentukan tanggal pelaksanaan pembinaan</p>
              </div>
            </div>

            <div className="hari-preview">
              <span className="hari-label">Hari</span>
              <span className="hari-val">{namaHari}</span>
              <span className="hari-auto">otomatis</span>
            </div>

            <div className="tanggal-grid">
              <div className="t-field">
                <label className="t-label">Tanggal</label>
                <input type="number" className="t-input" min="1" max="31" value={tanggal} onChange={e => setTanggal(Number(e.target.value))} />
              </div>
              <div className="t-field">
                <label className="t-label">Bulan</label>
                <select className="t-input t-select" value={bulan} onChange={e => setBulan(Number(e.target.value))}>
                  {BULAN.map((b,i) => <option key={i} value={i+1}>{b}</option>)}
                </select>
              </div>
              <div className="t-field">
                <label className="t-label">Tahun</label>
                <input type="number" className="t-input" min="2020" max="2099" value={tahun} onChange={e => setTahun(Number(e.target.value))} />
              </div>
            </div>

            <div className="date-preview">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>{namaHari}, {tanggal} {BULAN[bulan-1]} {tahun}</span>
            </div>

            <button className={`btn-mulai ${!kelasList ? 'disabled' : ''}`} onClick={handleMulai} disabled={!kelasList}>
              {!kelasList ? 'Upload data siswa dulu' : (
                <>Mulai Isi Absen
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>

            {kelasList && (
              <p className="mulai-hint">Akan mengisi absen untuk <strong>{kelasList.length} kelas</strong></p>
            )}
          </section>

        </div>
      </main>
    </div>
  )
}
