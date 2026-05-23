import { supabase } from '../../compartido/config/ClienteSupabase.js';
import { FormateadorFecha } from '../../compartido/formateadores/FormateadorFecha.js';

export class ModeloCalendario {
  constructor(repositorioBloques, repositorioCitas) {
    this._repositorioBloques = repositorioBloques;
    this._repositorioCitas = repositorioCitas;
    this._fechaActual = new Date();
    this._pacienteId = null;
    this._citasPorFecha = {};
  }

  inicializar(pacienteId) {
    this._pacienteId = pacienteId;
  }

  getFechaActual() { return this._fechaActual; }
  getCitasPorFecha() { return this._citasPorFecha; }

  navegar(incremento) {
    this._fechaActual.setMonth(this._fechaActual.getMonth() + incremento);
    return this.renderizarMes();
  }

  async renderizarMes() {
    const anio = this._fechaActual.getFullYear();
    const mes = this._fechaActual.getMonth();

    const [disponibilidad, citas] = await Promise.all([
      this._repositorioBloques.obtenerDisponibilidadMes(anio, mes),
      this._repositorioCitas.obtenerPorFiltro(this._pacienteId, 'proximas'),
    ]);

    this._citasPorFecha = this._agruparPorFecha(citas);

    document.dispatchEvent(new CustomEvent('paciente:calendarioRenderizar', {
      detail: { anio, mes, disponibilidad, citasPorFecha: this._citasPorFecha },
    }));
  }

  async seleccionarFecha(fecha) {
    const bloques = await this._repositorioBloques.obtenerPorFecha(fecha);
    let psicologoId = bloques.length > 0 ? bloques[0].psicologo_id : null;
    if (!psicologoId) psicologoId = await this._resolverPsicologo(fecha);

    document.dispatchEvent(new CustomEvent('paciente:bloquesDisponibles', {
      detail: { bloques, fecha, psicologoId, citasDelDia: this._citasPorFecha[fecha] || [] },
    }));
  }

  async _resolverPsicologo(fecha) {
    try {
      const bloquesTodos = await this._repositorioBloques.obtenerTodosPorFecha(fecha);
      if (bloquesTodos?.length) return bloquesTodos[0].psicologo_id;
    } catch (_) {}
    try {
      const { data } = await supabase.from('psicologos').select('id').limit(1);
      if (data?.length) return data[0].id;
    } catch (_) {}
    return null;
  }

  _agruparPorFecha(citas) {
    return citas.reduce((acumulador, cita) => {
      const fecha = cita.bloques_horario?.fecha;
      if (!fecha) return acumulador;
      if (!acumulador[fecha]) acumulador[fecha] = [];
      acumulador[fecha].push(cita);
      return acumulador;
    }, {});
  }
}
