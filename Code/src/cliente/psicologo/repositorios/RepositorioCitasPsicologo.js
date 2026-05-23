import { supabase } from '../../compartido/config/ClienteSupabase.js';

const DURACION_CACHE = 300000;

export class RepositorioCitasPsicologo {
  static _citasCache = new Map();
  static _historialCache = new Map();

  static _esCacheValido(ts) { return Date.now() - ts < DURACION_CACHE; }

  static async obtenerPorPeriodo(psicologoId, fechaInicio, fechaFin) {
    const clave = `${psicologoId}:${fechaInicio}:${fechaFin}`;
    const cached = this._citasCache.get(clave);
    if (cached && this._esCacheValido(cached.ts)) return cached.datos;

    const { data } = await supabase
      .from('citas')
      .select('id, estado, pacientes(id, nombre, apellido, correo, telefono, bloqueado), bloques_horario(fecha, hora_inicio, hora_fin)')
      .eq('psicologo_id', psicologoId)
      .eq('estado', 'confirmada')
      .gte('bloques_horario.fecha', fechaInicio)
      .lte('bloques_horario.fecha', fechaFin)
      .order('bloques_horario(fecha)', { ascending: true });

    const datos = (data || []).filter((c) => c.bloques_horario);
    this._citasCache.set(clave, { datos, ts: Date.now() });
    return datos;
  }

  static async cancelarConNotificacion(citaId) {
    const { data: cita } = await supabase.from('citas').select('paciente_id, psicologo_id').eq('id', citaId).single();
    const { error } = await supabase.rpc('cancelar_cita_y_liberar_bloque', { p_cita_id: citaId, p_cancelada_por: 'psicologo' });
    if (!error && cita) {
      await supabase.from('notificaciones').insert({ destinatario_tipo: 'paciente', destinatario_id: cita.paciente_id, cita_id: citaId, tipo: 'cancelacion', canal: 'email', enviado: false }).catch(() => {});
      this._invalidarCache(cita.psicologo_id);
    }
    return !error;
  }

  static async crearNotificacionNuevoTurno(psicologoId, citaId) {
    if (!psicologoId || !citaId) return false;
    await supabase.from('notificaciones').insert({ destinatario_tipo: 'psicologo', destinatario_id: psicologoId, cita_id: citaId, tipo: 'nuevo_turno', canal: 'email', enviado: false }).catch(() => {});
    return true;
  }

  static async obtenerHistorialPacientes(psicologoId) {
    const cached = this._historialCache.get(psicologoId);
    if (cached && this._esCacheValido(cached.ts)) return cached.datos;

    const { data } = await supabase
      .from('citas')
      .select('id, estado, pacientes(id, nombre, apellido, correo, bloqueado), bloques_horario(fecha, hora_inicio)')
      .eq('psicologo_id', psicologoId)
      .order('bloques_horario(fecha)', { ascending: false });

    const datos = this._procesarHistorial(data || []);
    this._historialCache.set(psicologoId, { datos, ts: Date.now() });
    return datos;
  }

  static invalidarCacheHistorial(psicologoId) { this._historialCache.delete(psicologoId); }

  static _procesarHistorial(citas) {
    const porPaciente = {};
    citas.forEach((c) => {
      if (!c.pacientes || !c.bloques_horario) return;
      const pid = c.pacientes.id;
      if (!porPaciente[pid]) porPaciente[pid] = { paciente: c.pacientes, citas: [] };
      porPaciente[pid].citas.push({ id: c.id, estado: c.estado, fecha: c.bloques_horario.fecha, hora: c.bloques_horario.hora_inicio });
    });
    return Object.values(porPaciente);
  }

  static _invalidarCache(psicologoId) {
    for (const k of this._citasCache.keys()) if (k.startsWith(psicologoId)) this._citasCache.delete(k);
    this._historialCache.delete(psicologoId);
  }
}
