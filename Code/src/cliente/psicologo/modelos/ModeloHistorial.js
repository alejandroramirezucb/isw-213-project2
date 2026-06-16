/* globals CustomEvent */

import { FormateadorFecha } from '../../compartido/formateadores/FormateadorFecha.js';
import { FormateadorHora } from '../../compartido/formateadores/FormateadorHora.js';

export class ModeloHistorial {
  constructor(repositorioCitas, repositorioPacientes) {
    this._repositorioCitas = repositorioCitas;
    this._repositorioPacientes = repositorioPacientes;
    this._psicologoId = null;
  }

  inicializar(psicologoId) {
    this._psicologoId = psicologoId;
  }

  filtrarPorEstado(citas, estado) {
    const resultado = [];
    for (let i = 0; i < citas.length; i++) {
      if (citas[i].estado === estado) {
        resultado.push(citas[i]);
      }
    }
    return resultado;
  }

  async cargar(busqueda = '') {
    const historial = await this._repositorioCitas.obtenerHistorialPacientes(
      this._psicologoId,
    );
    const filtrado = busqueda
      ? historial.filter((item) =>
          `${item.paciente.nombre} ${item.paciente.apellido}`
            .toLowerCase()
            .includes(busqueda.toLowerCase()),
        )
      : historial;
    document.dispatchEvent(
      new CustomEvent('psicologo:historialCargado', {
        detail: { historial: filtrado },
      }),
    );
  }

  async toggleBloqueo(pacienteId, bloqueadoActual) {
    const exito = await this._repositorioPacientes.actualizarBloqueo(
      pacienteId,
      !bloqueadoActual,
    );
    if (exito) {
      this._repositorioCitas.invalidarCacheHistorial(this._psicologoId);
      document.dispatchEvent(
        new CustomEvent('psicologo:mensaje', {
          detail: {
            texto: `Paciente ${!bloqueadoActual ? 'bloqueado' : 'desbloqueado'} exitosamente`,
            tipo: 'exito',
          },
        }),
      );
      document.dispatchEvent(new CustomEvent('psicologo:bloqueoActualizado'));
    } else {
      document.dispatchEvent(
        new CustomEvent('psicologo:mensaje', {
          detail: {
            texto: 'Error al actualizar estado del paciente',
            tipo: 'error',
          },
        }),
      );
    }
  }

  exportarPdf(item) {
    const pdfLib = window.jspdf;
    if (!pdfLib?.jsPDF) {
      return document.dispatchEvent(
        new CustomEvent('psicologo:mensaje', {
          detail: { texto: 'No se pudo generar el PDF', tipo: 'error' },
        }),
      );
    }
    const { jsPDF } = pdfLib;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const m = 15;

    doc.setFillColor(66, 133, 244);
    doc.rect(0, 0, W, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('HISTORIAL DE CITAS', m, 20);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(
      `Paciente: ${item.paciente.nombre} ${item.paciente.apellido}`,
      m,
      32,
    );
    doc.text(`Correo: ${item.paciente.correo}`, m, 38);

    const rows = item.citas.map((c) => [
      FormateadorFecha.aTexto(new Date(c.fecha + 'T00:00:00')),
      FormateadorHora.formatear(c.hora),
      c.estado.charAt(0).toUpperCase() + c.estado.slice(1),
    ]);

    if (doc.autoTable) {
      doc.autoTable({
        startY: 55,
        head: [['Fecha', 'Hora', 'Estado']],
        body: rows,
        margin: { left: m, right: m },
        headStyles: {
          fillColor: [66, 133, 244],
          textColor: 255,
          halign: 'center',
        },
        bodyStyles: { halign: 'center' },
      });
    }

    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generado: ${new Date().toLocaleString()}`, W / 2, H - 10, {
      align: 'center',
    });
    doc.save(`historial_${item.paciente.apellido}_${item.paciente.nombre}.pdf`);
  }
}
