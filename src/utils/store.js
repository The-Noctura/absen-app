const KEYS = {
  KELAS_X:     'absen_kelas_x',
  KELAS_1112:  'absen_kelas_1112',   // dari Excel, bisa null/[]
  TANGGAL:     'absen_tanggal',
  ABSEN_X:     'absen_data_x',
  ABSEN_1112:  'absen_data_1112',    // [{ id, nama, kelas, ket }]
}

const get  = (key) => { try { return JSON.parse(sessionStorage.getItem(key)) } catch { return null } }
const save = (key, val) => sessionStorage.setItem(key, JSON.stringify(val))

// Kelas X
export const saveKelasData  = (list) => save(KEYS.KELAS_X, list)
export const getKelasData   = ()     => get(KEYS.KELAS_X)

// Kelas XI/XII (dari Excel — bisa array kosong jika tidak ada)
export const saveKelas1112  = (list) => save(KEYS.KELAS_1112, list)
export const getKelas1112   = ()     => get(KEYS.KELAS_1112)

// Tanggal
export const saveTanggal    = (obj)  => save(KEYS.TANGGAL, obj)
export const getTanggal     = ()     => get(KEYS.TANGGAL)

// Absen kelas X
export const saveAbsenData  = (map)  => save(KEYS.ABSEN_X, map)
export const getAbsenData   = ()     => get(KEYS.ABSEN_X) || {}

// Absen kelas XI/XII — array of { id, nama, kelas, ket }
export const saveAbsen1112  = (arr)  => save(KEYS.ABSEN_1112, arr)
export const getAbsen1112   = ()     => get(KEYS.ABSEN_1112) || []

export const clearSession   = ()     => Object.values(KEYS).forEach(k => sessionStorage.removeItem(k))
