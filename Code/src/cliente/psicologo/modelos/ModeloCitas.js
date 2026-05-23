import { FormateadorFecha } from '../../compartido/formateadores/FormateadorFecha.js';

export class ModeloCitasPsicologo {
  constructor(repositorio) {
    this._repositorio = repositorio;
    this._psicologoId = null;
    this._citasCargadas = [];
    this._citaSeleccionadaId = null;
  }

  inicializar(psicologoId) { this._psicologoId = psicologoId; }
  getCitasCargadas() { return this._citasCargadas; }

  async cargarPeriodo(periodo) {
    const fechas = this._calcularFechasPeriodo(periodo);
    const citas = await this._repositorio.obtenerPorPeriodo(this._psicologoId, fechas.inicio, fechas.fin);
    this._citasCargadas = citas;
    document.dispatchEvent(new CustomEvent('psicologo:citasCargadas', {
      detail: { citas, periodo, fechas },
    }));
  }

  async cargarMes(anio, mes) {
    const mesFormateado = String(mes + 1).padStart(2, '0');
    const ultimoDiaMes = new Date(anio, mes + 1, 0).getDate();
    const fechaInicio = `${anio}-${mesFormateado}-01`;
    const fechaFin = `${anio}-${mesFormateado}-${String(ultimoDiaMes).padStart(2, '0')}`;

    const citas = await this._repositorio.obtenerPorPeriodo(this._psicologoId, fechaInicio, fechaFin);
    document.dispatchEvent(new CustomEvent('psicologo:citasMesCargadas', {
      detail: { citas, anio, mes },
    }));
  }

  mostrarDetalle(citaId) {
    const cita = this._citasCargadas.find((cita) => cita.id === citaId);
    if (!cita) return;
    this._citaSeleccionadaId = citaId;
    document.dispatchEvent(new CustomEvent('psicologo:detalleAbierto', { detail: { cita } }));
  }

  async cancelarCita() {
    if (!this._citaSeleccionadaId) return;
    const exito = await this._repositorio.cancelarConNotificacion(this._citaSeleccionadaId);
    if (exito) {
      document.dispatchEvent(new CustomEvent('psicologo:mensaje', {
        detail: { texto: 'Cita cancelada. Se notificó al paciente.', tipo: 'exito' },
      }));
      document.dispatchEvent(new CustomEvent('psicologo:citaCancelada'));
    } else {
      document.dispatchEvent(new CustomEvent('psicologo:mensaje', {
        detail: { texto: 'Error al cancelar la cita', tipo: 'error' },
      }));
    }
  }

  _calcularFechasPeriodo(periodo) {
    const hoy = new Date();
    const fechaInicio = FormateadorFecha.aISO(hoy);
    if (periodo === 'semana') {
      const finDeSemana = new Date(hoy);
      finDeSemana.setDate(hoy.getDate() + (6 - hoy.getDay()));
      return { inicio: fechaInicio, fin: FormateadorFecha.aISO(finDeSemana) };
    }
    return { inicio: fechaInicio, fin: fechaInicio };
  }
}
