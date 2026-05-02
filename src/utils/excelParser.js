import * as XLSX from 'xlsx'

export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        if (rows.length === 0) {
          reject(new Error('File Excel kosong atau format tidak sesuai')); return
        }

        const getKey = (obj, patterns) =>
          Object.keys(obj).find(k => patterns.some(p => k.trim().toLowerCase().includes(p)))

        const kelasMaps = {}
        rows.forEach((row, idx) => {
          const kelasKey = getKey(row, ['kelas'])
          const namaKey  = getKey(row, ['nama'])
          const jkKey    = getKey(row, ['jenis','jk','gender','kelamin'])

          const kelas = String(row[kelasKey] || '').trim()
          const nama  = String(row[namaKey]  || '').trim()
          const jk    = jkKey ? String(row[jkKey] || 'L').trim().toUpperCase() : 'L'

          if (!kelas || !nama) return
          if (!kelasMaps[kelas]) kelasMaps[kelas] = { nama: kelas, siswa: [] }
          kelasMaps[kelas].siswa.push({ id: `siswa-${idx}`, nama, jk: jk === 'P' ? 'P' : 'L' })
        })

        if (!Object.keys(kelasMaps).length) {
          reject(new Error('Tidak ada data kelas yang valid')); return
        }

        const kelasList = Object.values(kelasMaps).map(k => ({
          ...k,
          jumlahSiswa : k.siswa.filter(s => s.jk === 'L').length,
          jumlahSiswi : k.siswa.filter(s => s.jk === 'P').length,
          jumlahTotal : k.siswa.length,
        }))

        resolve(kelasList)
      } catch (err) {
        reject(new Error('Gagal membaca file: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsArrayBuffer(file)
  })
}
