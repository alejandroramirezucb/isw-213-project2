import { FormateadorFecha } from '../../compartido/formateadores/FormateadorFecha.js';

export class ModeloCitas {
  constructor(repositorioCitas) {
    this._repositorioCitas = repositorioCitas;
    this._pacienteId = null;
  }

  inicializar(pacienteId) { this._pacienteId = pacienteId; }

  async cargarProximaCita() {
    const cita = await this._repositorioCitas.obtenerProxima(this._pacienteId);
    document.dispatchEvent(new CustomEvent('paciente:proximaCitaCargada', { detail: { cita } }));
    return cita;
  }

  async cargarMisCitas(filtro = 'proximas') {
    const citas = await this._repositorioCitas.obtenerPorFiltro(this._pacienteId, filtro);
    document.dispatchEvent(new CustomEvent('paciente:citasCargadas', { detail: { citas, filtro } }));
  }

  async exportarPdf(citas, usuario) {
    if (!citas?.length) {
      return document.dispatchEvent(new CustomEvent('paciente:mensaje', { detail: { texto: 'No hay citas para exportar', tipo: 'error' } }));
    }
    const pdfLib = window.jspdf;
    if (!pdfLib?.jsPDF) {
      return document.dispatchEvent(new CustomEvent('paciente:mensaje', { detail: { texto: 'No se pudo generar el PDF (biblioteca no cargada)', tipo: 'error' } }));
    }

    const { jsPDF } = pdfLib;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const m = 15;
    const nombre = usuario?.pacientes ? `${usuario.pacientes.nombre} ${usuario.pacientes.apellido}` : 'Paciente';

    doc.setFillColor(66, 133, 244);
    doc.rect(0, 0, W, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24); doc.setFont(undefined, 'bold');
    doc.text('HISTORIAL DE CITAS', m, 20);
    doc.setFontSize(11); doc.setFont(undefined, 'normal');
    doc.text(`Paciente: ${nombre}`, m, 32);
    doc.text(`Exportado: ${new Date().toLocaleDateString('es-ES')}`, m, 38);

    const rows = citas
      .filter((c) => c.bloques_horario)
      .map((c) => [
        FormateadorFecha.aTextoCorto(new Date(c.bloques_horario.fecha + 'T00:00:00')),
        `${c.bloques_horario.hora_inicio.substring(0, 5)} - ${c.bloques_horario.hora_fin.substring(0, 5)}`,
        c.estado.charAt(0).toUpperCase() + c.estado.slice(1),
      ]);

    if (doc.autoTable) {
      doc.autoTable({ startY: 55, head: [['Fecha', 'Horario', 'Estado']], body: rows, margin: { left: m, right: m }, headStyles: { fillColor: [66, 133, 244], textColor: 255, halign: 'center' }, bodyStyles: { halign: 'center' } });
    }

    doc.setFontSize(9); doc.setTextColor(128, 128, 128);
    doc.text(`Generado: ${new Date().toLocaleString()}`, W / 2, H - 10, { align: 'center' });
    doc.save('historial-citas.pdf');
    document.dispatchEvent(new CustomEvent('paciente:mensaje', { detail: { texto: 'PDF descargado exitosamente', tipo: 'exito' } }));
  }
}
