import { supabase } from '../../compartido/config/ClienteSupabase.js';

const TABLA = 'bloques_horario';
const RPC_LIBERAR = 'liberar_bloques_expirados';
const RPC_BLOQUEAR_TEMP = 'bloquear_bloque_temporal';
const MIN_BLOQUEO = 5;

export class RepositorioBloques {
  static async obtenerDisponibilidadMes(anio, mes) {
    const inicio = `${anio}-${String(mes + 1).padStart(2, '0')}-01`;
    const fin = `${anio}-${String(mes + 1).padStart(2, '0')}-${new Date(anio, mes + 1, 0).getDate()}`;
    const { data } = await supabase
      .from(TABLA)
      .select('fecha')
      .eq('estado', 'disponible')
      .gte('fecha', inicio)
      .lte('fecha', fin);
    return (data || []).reduce((acc, b) => {
      acc[b.fecha] = true;
      return acc;
    }, {});
  }

  static async obtenerPorFecha(fecha) {
    await supabase.rpc(RPC_LIBERAR);
    const { data: bloques } = await supabase
      .from(TABLA)
      .select('*')
      .eq('fecha', fecha)
      .order('hora_inicio');
    if (!bloques?.length) return [];
    const bloqueIds = bloques.map((b) => b.id);
    let reservados = new Set();
    if (bloqueIds.length > 0) {
      const { data: citas } = await supabase
        .from('citas')
        .select('bloque_id')
        .in('bloque_id', bloqueIds)
        .eq('estado', 'confirmada');
      reservados = new Set((citas || []).map((c) => c.bloque_id));
    }
    return bloques.map((b) =>
      reservados.has(b.id) && b.estado !== 'bloqueado_temporal'
        ? { ...b, estado: 'reservado' }
        : b,
    );
  }

  static async obtenerTodosPorFecha(fecha) {
    const { data } = await supabase
      .from(TABLA)
      .select('id, psicologo_id, fecha, hora_inicio, hora_fin, estado')
      .eq('fecha', fecha)
      .order('hora_inicio');
    return data || [];
  }

  static async bloquearTemporal(bloqueId) {
    const { error } = await supabase.rpc(RPC_BLOQUEAR_TEMP, {
      p_bloque_id: bloqueId,
      p_minutos: MIN_BLOQUEO,
    });
    return !error;
  }

  static async liberarTemporal(bloqueId) {
    await supabase
      .from(TABLA)
      .update({ estado: 'disponible', bloqueado_hasta: null })
      .eq('id', bloqueId)
      .eq('estado', 'bloqueado_temporal');
  }

  static async marcarReservado(bloqueId) {
    const { error } = await supabase
      .from(TABLA)
      .update({ estado: 'reservado', bloqueado_hasta: null })
      .eq('id', bloqueId)
      .eq('estado', 'bloqueado_temporal');
    return !error;
  }

  static async obtenerProfesional(bloqueId) {
    const { data, error } = await supabase
      .from(TABLA)
      .select('psicologo_id, estado')
      .eq('id', bloqueId)
      .single();
    if (error) throw new Error('Bloque no encontrado');
    if (data?.estado !== 'bloqueado_temporal')
      throw new Error('El bloque no está disponible');
    return data;
  }
}
