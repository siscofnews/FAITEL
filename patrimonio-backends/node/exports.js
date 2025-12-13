const PDFDocument = require('pdfkit')
const ExcelJS = require('exceljs')

function generateProtocolPDF(movement) {
  const doc = new PDFDocument({ size: 'A4' })
  doc.text(`Protocolo: ${movement.protocol_code}`)
  doc.text(`Bem: ${movement.asset_name} (${movement.asset_code})`)
  doc.text(`Quantidade: ${movement.quantity}`)
  doc.text(`Destino: ${movement.destination}`)
  return doc
}

async function exportAssetsExcel(assets) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Patrimonio')
  ws.addRow(['Codigo','Nome','Categoria','Qtde','Valor Unit','Valor Total','Igreja','Status'])
  assets.forEach(a => ws.addRow([a.code,a.name,a.category,a.quantity,a.unit_value,a.total_value,a.church_name,a.status]))
  return wb
}

module.exports = { generateProtocolPDF, exportAssetsExcel }

