import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, VerticalAlign, PageBreak
} from 'docx'
import { saveAs } from 'file-saver'

const BULAN = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const FONT  = 'Times New Roman'

// Page: A4, margin 1440 DXA
const PAGE_W = 11906
const MARGIN = 1440

// Tabel 1 — lebar kolom persis dari dokumen asli (sum = 9951)
const T1_W   = 9951
const T1_COL = [558, 2211, 1398, 1398, 1541, 1399, 1446]

// Tabel 2 — lebar kolom dari dokumen asli (sum = 6397)
const T2_W   = 6397
const T2_COL = [611, 1827, 2057, 1902]

const borderSingle = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
const allBorders   = { top: borderSingle, bottom: borderSingle, left: borderSingle, right: borderSingle }
const cellMargin   = { top: 60, bottom: 60, left: 100, right: 100 }

// Tabel 3 — UKS (sama struktur dengan tabel 2)
const T3_W   = 6397
const T3_COL = [611, 1827, 2057, 1902]

function makeCell(text, width, align = AlignmentType.LEFT, bold = false) {
  return new TableCell({
    width:         { size: width, type: WidthType.DXA },
    borders:       allBorders,
    margins:       cellMargin,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: align,
      children:  [new TextRun({ text: String(text ?? ''), bold, size: 20, font: FONT })]
    })]
  })
}

// ── Tabel 1: Kelas X ─────────────────────────────────────
function buildTable1(kelasList, absenMap) {
  const headerRow = new TableRow({
    children: [
      makeCell('No',                          T1_COL[0], AlignmentType.CENTER, true),
      makeCell('Jurusan',                     T1_COL[1], AlignmentType.CENTER, true),
      makeCell('Jumlah Siswa',                T1_COL[2], AlignmentType.CENTER, true),
      makeCell('Jumlah Siswi',                T1_COL[3], AlignmentType.CENTER, true),
      makeCell('Jumlah Keseluruhan',          T1_COL[4], AlignmentType.CENTER, true),
      makeCell('Jumlah Siswa / i Hadir',      T1_COL[5], AlignmentType.CENTER, true),
      makeCell('Siswa / i yang Tidak Hadir',  T1_COL[6], AlignmentType.CENTER, true),
    ]
  })

  const dataRows = kelasList.map((kelas, idx) => {
    const kelasAbsen     = absenMap[kelas.nama] || {}
    const tidakHadirList = kelas.siswa
      .filter(s => kelasAbsen[s.id]?.tidakHadir)
      .map(s => `${s.nama} (${kelasAbsen[s.id]?.ket || 'a'})`)
    const hadirCount     = kelas.jumlahTotal - tidakHadirList.length
    const tidakHadirText = tidakHadirList.join(', ') || '-'

    return new TableRow({
      children: [
        makeCell(String(idx+1),              T1_COL[0], AlignmentType.CENTER),
        makeCell(kelas.nama,                 T1_COL[1], AlignmentType.BOTH),
        makeCell(String(kelas.jumlahSiswa),  T1_COL[2], AlignmentType.BOTH),
        makeCell(String(kelas.jumlahSiswi),  T1_COL[3], AlignmentType.BOTH),
        makeCell(String(kelas.jumlahTotal),  T1_COL[4], AlignmentType.BOTH),
        makeCell(String(hadirCount),         T1_COL[5], AlignmentType.BOTH),
        makeCell(tidakHadirText,             T1_COL[6], AlignmentType.BOTH),
      ]
    })
  })

  return new Table({ width: { size: T1_W, type: WidthType.DXA }, columnWidths: T1_COL, rows: [headerRow, ...dataRows] })
}

// ── Tabel 2: Kelas XI/XII ────────────────────────────────
function buildTable2(rows1112) {
  const headerRow = new TableRow({
    children: [
      makeCell('NO',          T2_COL[0], AlignmentType.CENTER, true),
      makeCell('NAMA',        T2_COL[1], AlignmentType.CENTER, true),
      makeCell('KELAS',       T2_COL[2], AlignmentType.CENTER, true),
      makeCell('KETERANGAN',  T2_COL[3], AlignmentType.CENTER, true),
    ]
  })

  const dataRows = rows1112.map((row, idx) => new TableRow({
    children: [
      makeCell(String(idx+1), T2_COL[0], AlignmentType.CENTER),
      makeCell(row.nama,      T2_COL[1], AlignmentType.BOTH),
      makeCell(row.kelas,     T2_COL[2], AlignmentType.BOTH),
      makeCell(row.ket || 'HADIR', T2_COL[3], AlignmentType.CENTER),
    ]
  }))

  return new Table({ width: { size: T2_W, type: WidthType.DXA }, columnWidths: T2_COL, rows: [headerRow, ...dataRows] })
}

function heading(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing:   { after: 0 },
    children:  [new TextRun({ text, bold: true, size: 32, font: FONT })]
  })
}
function subheading(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing:   { after: 240 },
    children:  [new TextRun({ text, bold: true, size: 32, font: FONT })]
  })
}
function pageBreak() {
  return new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true })
}


// ── Tabel 3: UKS ─────────────────────────────────────────
function buildTable3(rowsUKS) {
  const headerRow = new TableRow({
    children: [
      makeCell('NO',          T3_COL[0], AlignmentType.CENTER, true),
      makeCell('NAMA',        T3_COL[1], AlignmentType.CENTER, true),
      makeCell('KELAS',       T3_COL[2], AlignmentType.CENTER, true),
      makeCell('KETERANGAN',  T3_COL[3], AlignmentType.CENTER, true),
    ]
  })
  const dataRows = rowsUKS.map((row, idx) => new TableRow({
    children: [
      makeCell(String(idx+1), T3_COL[0], AlignmentType.CENTER),
      makeCell(row.nama,      T3_COL[1], AlignmentType.BOTH),
      makeCell(row.kelas,     T3_COL[2], AlignmentType.BOTH),
      makeCell(row.ket || 'HADIR', T3_COL[3], AlignmentType.CENTER),
    ]
  }))
  return new Table({ width: { size: T3_W, type: WidthType.DXA }, columnWidths: T3_COL, rows: [headerRow, ...dataRows] })
}

// ── Export ───────────────────────────────────────────────
export async function exportToWord({ kelasList, absenMap, tanggal, absen1112, absenUKS }) {
  const tanggalStr   = `${tanggal.namaHari}, ${tanggal.tanggal} ${BULAN[tanggal.bulan]} ${tanggal.tahun}`
  const rows1112     = (absen1112 || []).filter(r => r.included !== false && r.nama.trim())
  const rowsUKS      = (absenUKS  || []).filter(r => r.nama.trim())

  const table1 = buildTable1(kelasList, absenMap)
  const table2 = buildTable2(rows1112)
  const table3 = buildTable3(rowsUKS)

  const children = [
    heading('REKAP ABSEN PEMBINAAN KELAS X'),
    subheading(tanggalStr),
    table1,
    pageBreak(),
    heading('REKAP ABSEN PEMBINAAN KELAS XI - XII'),
    subheading(tanggalStr),
    table2,
    pageBreak(),
    heading('REKAP ABSEN SISWA/I YANG BERADA DI UKS'),
    subheading(tanggalStr),
    table3,
  ]

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size:   { width: PAGE_W, height: 16838 },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
        }
      },
      children
    }]
  })

  const blob     = await Packer.toBlob(doc)
  const fileName = `Rekap_Absen_${tanggal.tanggal}_${BULAN[tanggal.bulan]}_${tanggal.tahun}.docx`
  saveAs(blob, fileName)
}
