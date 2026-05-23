import { supabase } from '../../compartido/config/ClienteSupabase.js';

const TABLA = 'notificaciones';

export class RepositorioNotificaciones {
  static async obtenerTodas(psicologoId, limite = 20) {
    const { data } = await supabase.from(TABLA).select('id, tipo, enviado, creado_en').eq('destinatario_tipo', 'psicologo').eq('destinatario_id', psicologoId).order('creado_en', { ascending: false }).limit(limite);
    return data || [];
  }

  static async marcarComoLeida(notifId) {
    const { error } = await supabase.from(TABLA).update({ enviado: true }).eq('id', notifId);
    return !error;
  }

  static async marcarTodasLeidas(psicologoId) {
    const { error } = await supabase.from(TABLA).update({ enviado: true }).eq('destinatario_tipo', 'psicologo').eq('destinatario_id', psicologoId).eq('enviado', false);
    return !error;
  }

  static async obtenerConteoNoLeidas(psicologoId) {
    const { count } = await supabase.from(TABLA).select('id', { count: 'exact', head: true }).eq('destinatario_tipo', 'psicologo').eq('destinatario_id', psicologoId).eq('enviado', false);
    return count || 0;
  }

  static suscribirseNuevasNotificaciones(psicologoId, callback) {
    try {
      const channel = supabase.channel(`notif-psicologo-${psicologoId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLA }, (payload) => {
          if (payload.new?.destinatario_tipo === 'psicologo' && payload.new.destinatario_id === psicologoId) callback(payload.new);
        })
        .subscribe();
      return () => channel.unsubscribe();
    } catch { return () => {}; }
  }
}
