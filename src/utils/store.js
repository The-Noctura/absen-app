const KEYS = {
  KELAS: 'absen_kelas_data',
  TANGGAL: 'absen_tanggal',
  ABSEN: 'absen_data',
}

// ── Kelas (data siswa dari Excel) ──────────────────────────
export function saveKelasData(kelasList) {
  sessionStorage.setItem(KEYS.KELAS, JSON.stringify(kelasList))
}
export function getKelasData() {
  try { return JSON.parse(sessionStorage.getItem(KEYS.KELAS)) || null }
  catch { return null }
}

// ── Tanggal rekap ──────────────────────────────────────────
export function saveTanggal(obj) {
  sessionStorage.setItem(KEYS.TANGGAL, JSON.stringify(obj))
}
export function getTanggal() {
  try { return JSON.parse(sessionStorage.getItem(KEYS.TANGGAL)) || null }
  catch { return null }
}

// ── Data absen per kelas ───────────────────────────────────
// absenMap: { [namaKelas]: [ { id, nama, jk, tidakHadir, ket } ] }
export function saveAbsenData(absenMap) {
  sessionStorage.setItem(KEYS.ABSEN, JSON.stringify(absenMap))
}
export function getAbsenData() {
  try { return JSON.parse(sessionStorage.getItem(KEYS.ABSEN)) || {} }
  catch { return {} }
}

// ── Clear all ─────────────────────────────────────────────
export function clearSession() {
  Object.values(KEYS).forEach(k => sessionStorage.removeItem(k))
}
