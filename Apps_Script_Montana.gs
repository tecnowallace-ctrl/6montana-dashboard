/*****************************************************************
 *  BACKEND MONTANA - Apps Script (actualizado)
 *  Lee DB_Cierres y DB_Gastos y los envia al dashboard.
 *  Posiciones de columna ajustadas al Excel actual (jun 2026).
 *
 *  COMO ACTUALIZARLO:
 *  1. Abre tu hoja de Google -> Extensiones -> Apps Script.
 *  2. Borra TODO el codigo viejo y pega este completo.
 *  3. Guarda (icono de diskette).
 *  4. Implementar -> Administrar implementaciones -> (editar la que ya tienes)
 *     -> Version: Nueva version -> Implementar.
 *  5. Listo. El dashboard tomara los datos corregidos.
 *****************************************************************/

function doGet(e) {
  var out = { cierres: getCierres(), gastos: getGastos() };
  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

// Convierte una fecha a texto YYYY-MM-DD
function fechaTxt(v) {
  if (v instanceof Date && !isNaN(v.getTime())) {
    // Utilities.formatDate es la forma mas confiable en Apps Script
    return Utilities.formatDate(v, Session.getScriptTimeZone() || 'America/Bogota', 'yyyy-MM-dd');
  }
  var s = String(v || '').trim();
  // ya viene como 2026-05-01
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[1] + '-' + m[2] + '-' + m[3];
  // viene como "Fri May 01 2026" u otro: intentar con Date
  var d = new Date(s);
  if (!isNaN(d.getTime())) {
    return Utilities.formatDate(d, Session.getScriptTimeZone() || 'America/Bogota', 'yyyy-MM-dd');
  }
  return s.slice(0, 10);
}

/* ===================== DB_CIERRES ===================== */
function getCierres() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DB_Cierres');
  var data = sh.getDataRange().getValues();
  var res = [];
  for (var i = 1; i < data.length; i++) {   // fila 0 = encabezado
    var r = data[i];
    var fecha = fechaTxt(r[1]);              // B  Fecha de Venta
    if (!fecha) continue;
    res.push({
      fecha:            fecha,
      dia:              r[2],                // C  Día
      encargado:        r[3],                // D  Encargado
      clientes:         r[5],                // F  PX Total Clientes
      alm_local:        r[6],                // G  Ejecutivos LOCAL
      alm_dom:          r[7],                // H  Ejecutivos DOMICILIO
      qr:               r[8],                // I  QR Bancolombia
      nequi:            r[9],                // J  Nequi
      datafono:         r[10],               // K  Datafono
      daviplata:        r[11],               // L  Daviplata
      obs:              r[12],               // M  Observaciones
      venta_bruta:      r[13],               // N  Venta Bruta Total
      propinas:         r[14],               // O  Propinas
      ipoconsumo:       r[16],               // Q  Ipoconsumo 8%
      canal_bonos:      r[17],               // R  Canal Bonos
      canal_eventos:    r[19],               // T  Canal Evento Salon
      canal_decoracion: r[22],               // W  Canal Decoracion
      canal_tq:         r[24],               // Y  Canal Despachos TQ
      venta_neta:       r[27],               // AB VENTA NETA DIA
      efectivo:         r[28],               // AC Efectivo en Caja
      ejecutivos:       r[31],               // AF Cantidad de Ejecutivos vendidos
      clientes_totales: r[33],               // AH Clientes Totales
      ticket_carta:     r[34]                // AI Ticket Promedio Carta
    });
  }
  return res;
}

/* ===================== DB_GASTOS ===================== */
function getGastos() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DB_Gastos');
  var data = sh.getDataRange().getValues();
  var res = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    var fecha = fechaTxt(r[2]);              // C  Fecha del Gasto
    if (!fecha) continue;
    res.push({
      fecha:              fecha,
      tipo:               r[4],              // E  Tipo de gasto
      proveedor:          r[5],              // F  Proveedor
      producto:           r[7],              // H  Insumo / Producto
      valor:              r[8],              // I  Valor Pagado
      metodo:             r[9],              // J  Metodo de pago
      cortesia_producto:  r[25],             // Z  Producto entregado (cortesia)
      cortesia_costo:     r[26]              // AA Costo del producto (cortesia)
    });
  }
  return res;
}
