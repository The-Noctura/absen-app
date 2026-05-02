import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign, HeadingLevel
} from 'docx'
import { saveAs } from 'file-saver'

const BULAN = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

// A4, margin 2cm semua sisi
// A4 = 11906 DXA, margin 2cm = 1134 DXA x2 = 2268, content = 9638 DXA
const PAGE_W   = 11906
const MARGIN   = 1134
const CONTENT  = PAGE_W - MARGIN * 2  // 9638

// Lebar kolom tabel (total = CONTENT)
// No | Jurusan | Siswa | Siswi | Keseluruhan | Hadir | Tidak Hadir
const COL_W = [480, 2100, 1100, 1100, 1300, 1100, 2458] // sum = 9638

const borderNone = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const borderSingle = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
const allBorders = { top: borderSingle, bottom: borderSingle, left: borderSingle, right: borderSingle }
const cellMargin = { top: 60, bottom: 60, left: 100, right: 100 }

function headerCell(text, width, center = true) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: allBorders,
    shading: { fill: 'D9D9D9', type: ShadingType.CLEAR },
    margins: cellMargin,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text, bold: true, size: 20, font: 'Arial' })]
    })]
  })
}

function dataCell(text, width, center = false) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: allBorders,
    margins: cellMargin,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text: String(text ?? ''), size: 20, font: 'Arial' })]
    })]
  })
}

export async function exportToWord({ kelasList, absenMap, tanggal }) {
  const tanggalStr = `${tanggal.namaHari}, ${tanggal.tanggal} ${BULAN[tanggal.bulan]} ${tanggal.tahun}`

  // Build tabel rows
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('No', COL_W[0]),
      headerCell('Jurusan', COL_W[1]),
      headerCell('Jml Siswa', COL_W[2]),
      headerCell('Jml Siswi', COL_W[3]),
      headerCell('Jml Keseluruhan', COL_W[4]),
      headerCell('Jml Hadir', COL_W[5]),
      headerCell('Tidak Hadir', COL_W[6]),
    ]
  })

  const dataRows = kelasList.map((kelas, idx) => {
    const kelasAbsen = absenMap[kelas.nama] || {}

    // Siswa tidak hadir: sort by nama, format "Nama (ket)"
    const tidakHadirList = kelas.siswa
      .filter(s => kelasAbsen[s.id]?.tidakHadir)
      .map(s => `${s.nama} (${kelasAbsen[s.id]?.ket || 'a'})`)

    const tidakHadirCount = tidakHadirList.length
    const hadirCount      = kelas.jumlahTotal - tidakHadirCount
    const tidakHadirText  = tidakHadirList.join(', ') || '-'

    return new TableRow({
      children: [
        dataCell(String(idx + 1), COL_W[0], true),
        dataCell(kelas.nama, COL_W[1]),
        dataCell(String(kelas.jumlahSiswa), COL_W[2], true),
        dataCell(String(kelas.jumlahSiswi), COL_W[3], true),
        dataCell(String(kelas.jumlahTotal), COL_W[4], true),
        dataCell(String(hadirCount), COL_W[5], true),
        dataCell(tidakHadirText, COL_W[6]),
      ]
    })
  })

  const table = new Table({
    width: { size: CONTENT, type: WidthType.DXA },
    columnWidths: COL_W,
    rows: [headerRow, ...dataRows]
  })

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_W, height: 16838 },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
        }
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 0 },
          children: [new TextRun({ text: 'REKAP ABSEN PEMBINAAN KELAS X', bold: true, size: 24, font: 'Arial' })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [new TextRun({ text: tanggalStr, bold: true, size: 24, font: 'Arial' })]
        }),
        table,
      ]
    }]
  })

  const blob = await Packer.toBlob(doc)
  const fileName = `Rekap_Absen_${tanggal.tanggal}_${BULAN[tanggal.bulan]}_${tanggal.tahun}.docx`
  saveAs(blob, fileName)
}
