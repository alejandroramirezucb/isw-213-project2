import { supabase } from '../../compartido/config/ClienteSupabase.js';
import { RepositorioBloques } from './RepositorioBloques.js';
import { FormateadorFecha } from '../../compartido/formateadores/FormateadorFecha.js';

const TABLA = 'citas';
const DURACION_CACHE = 30000;

let citasCache = null;
let tiempoCache = 0;

export class RepositorioCitas {
  static async crear(pacienteId, profesionalId, bloqueId) {
    const { data, error } = await supabase
      .from(TABLA)
      .insert({ paciente_id: pacienteId, psicologo_id: profesionalId, bloque_id: bloqueId, estado: 'confirmada' })
      .select('id');

    if (error) {
      const msg = error.message || '';
      if (error.code?.includes('409') || msg.includes('unique') || msg.includes('duplicate') || msg.includes('violates')) {
        throw new Error('Este bloque ya fue reservado por otro usuario');
      }
      throw new Error('Error al crear cita: ' + msg);
    }

    citasCache = null;
    const citaId = data?.[0]?.id ?? null;
    if (citaId) await RepositorioBloques.marcarReservado(bloqueId).catch(() => {});
    return citaId;
  }

  static async obtenerProxima(pacienteId) {
    const hoy = FormateadorFecha.aISO(new Date());
    const { data } = await supabase
      .from(TABLA)
      .select('id, estado, bloques_horario(fecha, hora_inicio, hora_fin)')
      .eq('paciente_id', pacienteId)
      .eq('estado', 'confirmada')
      .gte('bloques_horario.fecha', hoy)
      .order('bloques_horario(fecha)', { ascending: true })
      .limit(1);
    return data?.length > 0 && data[0].bloques_horario ? data[0] : null;
  }

  static async obtenerPorFiltro(pacienteId, filtro) {
    const hoy = FormateadorFecha.aISO(new Date());
    const ahora = Date.now();
    if (filtro !== 'proximas') citasCache = null;

    if (citasCache && ahora - tiempoCache < DURACION_CACHE) {
      return citasCache.filter((c) => {
        if (c.paciente_id !== pacienteId) return false;
        if (filtro === 'proximas') return c.estado === 'confirmada' && c.bloques_horario?.fecha >= hoy;
        if (filtro === 'pasadas') return c.estado === 'completada' && c.bloques_horario?.fecha < hoy;
        if (filtro === 'canceladas') return c.estado === 'cancelada';
        return true;
      });
    }

    let query = supabase.from(TABLA)
      .select('id, estado, creado_en, bloques_horario(fecha, hora_inicio, hora_fin), paciente_id')
      .eq('paciente_id', pacienteId);

    if (filtro === 'proximas') query = query.eq('estado', 'confirmada').gte('bloques_horario.fecha', hoy);
    else if (filtro === 'pasadas') query = query.eq('estado', 'completada').lte('bloques_horario.fecha', hoy);
    else if (filtro === 'canceladas') query = query.eq('estado', 'cancelada');

    const { data } = await query.order('bloques_horario(fecha)', { ascending: filtro === 'proximas' });

    if (filtro === 'proximas') {
      citasCache = data || [];
      tiempoCache = ahora;
    }
    return data || [];
  }

  static async cancelar(citaId) {
    const { error } = await supabase.rpc('cancelar_cita_y_liberar_bloque', { p_cita_id: citaId, p_cancelada_por: 'paciente' });
    citasCache = null;
    return !error;
  }

  static async crearNotificacion(pacienteId, tipo, citaId) {
    try {
      await supabase.from('notificaciones').insert({ destinatario_tipo: 'paciente', destinatario_id: pacienteId, cita_id: citaId, tipo, canal: 'email', enviado: false });
    } catch (_) {}
    return true;
  }
}
