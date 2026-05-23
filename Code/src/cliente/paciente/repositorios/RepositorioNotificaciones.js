import { supabase } from '../../compartido/config/ClienteSupabase.js';

const TABLA = 'notificaciones';

export class RepositorioNotificaciones {
  static async obtenerTodas(pacienteId, limite = 20) {
    const { data } = await supabase.from(TABLA).select('id, tipo, enviado, creado_en, cita_id').eq('destinatario_tipo', 'paciente').eq('destinatario_id', pacienteId).order('creado_en', { ascending: false }).limit(limite);
    return data || [];
  }

  static async marcarComoLeida(notificacionId) {
    const { error } = await supabase.from(TABLA).update({ enviado: true }).eq('id', notificacionId);
    return !error;
  }

  static async marcarTodasLeidasDelPaciente(pacienteId) {
    const { error } = await supabase.from(TABLA).update({ enviado: true }).eq('destinatario_tipo', 'paciente').eq('destinatario_id', pacienteId).eq('enviado', false);
    return !error;
  }

  static async obtenerConteoNoLeidas(pacienteId) {
    const { count } = await supabase.from(TABLA).select('id', { count: 'exact', head: true }).eq('destinatario_tipo', 'paciente').eq('destinatario_id', pacienteId).eq('enviado', false);
    return count || 0;
  }
}
