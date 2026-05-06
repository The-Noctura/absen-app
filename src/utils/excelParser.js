import * as XLSX from 'xlsx'

function isKelas11_12(namaKelas) {
  const upper = namaKelas.toUpperCase()
  return upper.includes('XI') || upper.includes('XII') ||
         upper.includes('11') || upper.includes('12')
}

export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data     = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet    = workbook.Sheets[workbook.SheetNames[0]]
        const rows     = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        if (!rows.length) { reject(new Error('File Excel kosong')); return }

        const getKey = (obj, patterns) =>
          Object.keys(obj).find(k => patterns.some(p => k.trim().toLowerCase().includes(p)))

        const kelasX    = {}
        const kelas1112 = {}

        rows.forEach((row, idx) => {
          const kelasKey = getKey(row, ['kelas'])
          const namaKey  = getKey(row, ['nama'])
          const jkKey    = getKey(row, ['jenis','jk','gender','kelamin'])

          const kelas = String(row[kelasKey] || '').trim()
          const nama  = String(row[namaKey]  || '').trim()
          const jk    = jkKey ? String(row[jkKey] || 'L').trim().toUpperCase() : 'L'

          if (!kelas || !nama) return

          if (isKelas11_12(kelas)) {
            if (!kelas1112[kelas]) kelas1112[kelas] = { nama: kelas, siswa: [] }
            kelas1112[kelas].siswa.push({ id: `s1112-${idx}`, nama, jk: jk === 'P' ? 'P' : 'L' })
          } else {
            if (!kelasX[kelas]) kelasX[kelas] = { nama: kelas, siswa: [] }
            kelasX[kelas].siswa.push({ id: `sx-${idx}`, nama, jk: jk === 'P' ? 'P' : 'L' })
          }
        })

        const buildList = (map) => Object.values(map).map(k => ({
          ...k,
          jumlahSiswa : k.siswa.filter(s => s.jk === 'L').length,
          jumlahSiswi : k.siswa.filter(s => s.jk === 'P').length,
          jumlahTotal : k.siswa.length,
        }))

        const kelasXList    = buildList(kelasX)
        const kelas1112List = buildList(kelas1112) // bisa kosong []

        if (!kelasXList.length && !kelas1112List.length) {
          reject(new Error('Tidak ada data kelas yang valid')); return
        }

        resolve({ kelasXList, kelas1112List })
      } catch (err) {
        reject(new Error('Gagal membaca file: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsArrayBuffer(file)
  })
}
