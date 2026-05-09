import { useState, useMemo, useRef, useEffect } from 'react'
import { getKelasData, getKelas1112, getAbsenUKS, saveAbsenUKS } from '../utils/store'
import './AbsenUKS.css'

let idCounter = 1
const newManualRow = () => ({ id: `uks-${idCounter++}`, nama: '', kelas: '', ket: 'HADIR', source: 'manual' })

export default function AbsenUKS() {
  const kelasX    = getKelasData()   || []
  const kelas1112 = getKelas1112()   || []

  // Gabungkan semua siswa dari semua kelas sebagai search pool
  const allSiswa = useMemo(() => {
    const list = []
    kelasX.forEach(k => k.siswa.forEach(s => list.push({ ...s, kelas: k.nama })))
    kelas1112.forEach(k => k.siswa.forEach(s => list.push({ ...s, kelas: k.nama })))
    return list
  }, [])

  const [rows,       setRows]       = useState(() => getAbsenUKS() || [newManualRow()])
  const [query,      setQuery]      = useState('')
  const [showDrop,   setShowDrop]   = useState(false)
  const searchRef = useRef()
  const dropRef   = useRef()

  useEffect(() => { saveAbsenUKS(rows) }, [rows])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!dropRef.current?.contains(e.target) && e.target !== searchRef.current) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Filter siswa berdasarkan query, exclude yang sudah ada
  const existingIds = new Set(rows.filter(r => r.siswaId).map(r => r.siswaId))
  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    return allSiswa
      .filter(s => s.nama.toLowerCase().includes(query.toLowerCase()) && !existingIds.has(s.id))
      .slice(0, 8)
  }, [query, rows])

  function addFromSearch(siswa) {
    const row = { id: `uks-${idCounter++}`, siswaId: siswa.id, nama: siswa.nama, kelas: siswa.kelas, ket: 'HADIR', source: 'excel' }
    setRows(prev => {
      // Hapus baris manual kosong terakhir jika ada dan hanya 1
      const cleaned = prev.length === 1 && !prev[0].nama.trim() ? [] : prev
      return [...cleaned, row]
    })
    setQuery(''); setShowDrop(false)
    searchRef.current?.focus()
  }

  function addManual()      { setRows(prev => [...prev, newManualRow()]) }
  function removeRow(id)    { setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : [newManualRow()]) }
  function updateRow(id, field, value) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const validRows = rows.filter(r => r.nama.trim())

  return (
    <div className="uks-root">
      <div className="uks-header">
        <div>
          <h2 className="uks-title">UKS / Siswa Sakit</h2>
          <p className="uks-sub">Siswa yang berada di UKS saat pembinaan — semua kelas</p>
        </div>
        <div className="uks-badge">{validRows.length} siswa</div>
      </div>

      {/* Search dari Excel */}
      <div className="uks-search-wrap" ref={dropRef}>
        <div className="uks-search-box">
          <svg className="uks-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={searchRef}
            className="uks-search-input"
            placeholder="Cari nama siswa dari data Excel..."
            value={query}
            onChange={e => { setQuery(e.target.value); setShowDrop(true) }}
            onFocus={() => query && setShowDrop(true)}
          />
          {query && <button className="uks-search-clear" onClick={() => { setQuery(''); setShowDrop(false) }}>✕</button>}
        </div>

        {/* Dropdown suggestions */}
        {showDrop && suggestions.length > 0 && (
          <div className="uks-dropdown">
            {suggestions.map(s => (
              <button key={s.id} className="uks-suggestion" onClick={() => addFromSearch(s)}>
                <span className="sug-nama">{s.nama}</span>
                <span className="sug-kelas">{s.kelas}</span>
              </button>
            ))}
          </div>
        )}
        {showDrop && query && suggestions.length === 0 && (
          <div className="uks-dropdown">
            <div className="uks-no-result">
              Tidak ditemukan di Excel —
              <button className="uks-add-manual-inline" onClick={() => { addManual(); setQuery(''); setShowDrop(false) }}>
                tambah manual
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabel */}
      <div className="uks-table-wrap">
        <table className="uks-table">
          <thead>
            <tr>
              <th style={{width:40}}>No</th>
              <th>Nama</th>
              <th>Kelas</th>
              <th style={{width:160}}>Keterangan</th>
              <th style={{width:40}}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} className={row.source === 'excel' ? 'from-excel' : 'from-manual'}>
                <td className="center">{i + 1}</td>
                <td>
                  {row.source === 'excel'
                    ? <span className="cell-text">{row.nama}</span>
                    : <input className="cell-input" value={row.nama} placeholder="Nama siswa" onChange={e => updateRow(row.id, 'nama', e.target.value)} />
                  }
                </td>
                <td>
                  {row.source === 'excel'
                    ? <span className="cell-text muted">{row.kelas}</span>
                    : <input className="cell-input" value={row.kelas} placeholder="contoh: X - Mesin 1" onChange={e => updateRow(row.id, 'kelas', e.target.value)} />
                  }
                </td>
                <td>
                  <input
                    className={`cell-input ket-input ${row.ket === 'HADIR' ? 'ket-hadir' : ''}`}
                    value={row.ket}
                    onChange={e => updateRow(row.id, 'ket', e.target.value.toUpperCase())}
                  />
                </td>
                <td>
                  <button className="remove-btn" onClick={() => removeRow(row.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tombol tambah manual */}
      <button className="add-manual-btn" onClick={addManual}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Tambah Manual
      </button>
    </div>
  )
}
