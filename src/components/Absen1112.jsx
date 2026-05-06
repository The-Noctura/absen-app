import { useState, useEffect } from 'react'
import { getKelas1112, getAbsen1112, saveAbsen1112 } from '../utils/store'
import './Absen1112.css'

let idCounter = 1
const newRow = (nama='', kelas='') => ({
  id: `manual-${idCounter++}`,
  nama,
  kelas,
  ket: 'HADIR'
})

export default function Absen1112() {
  const kelas1112Excel = getKelas1112() || []
  const hasExcel       = kelas1112Excel.length > 0

  // Mode Excel: checklist siswa, ket editable default HADIR
  // Mode Manual: tambah baris bebas
  const [rows, setRows] = useState(() => {
    const saved = getAbsen1112()
    if (saved && saved.length > 0) return saved
    if (hasExcel) {
      // Dari Excel: semua siswa, defaultnya hadir (included = true)
      return kelas1112Excel.flatMap(k =>
        k.siswa.map(s => ({ id: s.id, nama: s.nama, kelas: k.nama, ket: 'HADIR', included: true }))
      )
    }
    return [newRow()]
  })

  useEffect(() => { saveAbsen1112(rows) }, [rows])

  function updateRow(id, field, value) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  function addRow()    { setRows(prev => [...prev, newRow()]) }
  function removeRow(id) { setRows(prev => prev.filter(r => r.id !== id)) }
  function toggleIncluded(id) { setRows(prev => prev.map(r => r.id === id ? { ...r, included: !r.included } : r)) }

  const includedCount = rows.filter(r => r.included !== false).length

  return (
    <div className="a1112-root">
      <div className="a1112-header">
        <div>
          <h2 className="a1112-title">Kelas XI / XII</h2>
          <p className="a1112-sub">
            {hasExcel
              ? `${kelas1112Excel.length} kelas dari Excel · centang siswa yang hadir`
              : 'Input manual · tambah siswa yang hadir'}
          </p>
        </div>
        <div className="a1112-badge">{includedCount} hadir</div>
      </div>

      <div className="a1112-mode-tag">
        {hasExcel
          ? <span className="mode-tag excel">📊 Mode Excel</span>
          : <span className="mode-tag manual">✎ Mode Manual</span>}
      </div>

      {/* Table */}
      <div className="a1112-table-wrap">
        <table className="a1112-table">
          <thead>
            <tr>
              {hasExcel && <th style={{width:40}}>✓</th>}
              <th>Nama</th>
              <th>Kelas</th>
              <th style={{width:160}}>Keterangan</th>
              {!hasExcel && <th style={{width:40}}></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const included = row.included !== false
              return (
                <tr key={row.id} className={!included ? 'excluded' : ''}>
                  {hasExcel && (
                    <td>
                      <button
                        className={`check-btn ${included ? 'checked' : ''}`}
                        onClick={() => toggleIncluded(row.id)}
                      >
                        {included && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>
                    </td>
                  )}
                  <td>
                    {hasExcel
                      ? <span className="cell-text">{row.nama}</span>
                      : <input className="cell-input" value={row.nama} placeholder="Nama siswa" onChange={e => updateRow(row.id, 'nama', e.target.value)} />
                    }
                  </td>
                  <td>
                    {hasExcel
                      ? <span className="cell-text muted">{row.kelas}</span>
                      : <input className="cell-input" value={row.kelas} placeholder="contoh: XI - TKJ 1" onChange={e => updateRow(row.id, 'kelas', e.target.value)} />
                    }
                  </td>
                  <td>
                    <input
                      className={`cell-input ket-input ${row.ket === 'HADIR' ? 'ket-hadir' : ''}`}
                      value={row.ket}
                      onChange={e => updateRow(row.id, 'ket', e.target.value.toUpperCase())}
                    />
                  </td>
                  {!hasExcel && (
                    <td>
                      <button className="remove-btn" onClick={() => removeRow(row.id)} disabled={rows.length === 1}>✕</button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!hasExcel && (
        <button className="add-row-btn" onClick={addRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Siswa
        </button>
      )}
    </div>
  )
}
