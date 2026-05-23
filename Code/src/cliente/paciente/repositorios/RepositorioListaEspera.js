import { supabase } from '../../compartido/config/ClienteSupabase.js';

const TABLA = 'lista_espera';

export class RepositorioListaEspera {
  static async anadirAEspera(pacienteId, psicologoId, fecha) {
    const { data, error } = await supabase.from(TABLA).insert({ paciente_id: pacienteId, psicologo_id: psicologoId, fecha, notificado: false }).select('id');
    if (error) return error.code === '23505';
    return !!data?.[0]?.id;
  }

  static async obtenerPosicion(pacienteId, psicologoId, fecha) {
    const { data } = await supabase.from(TABLA).select('id, paciente_id, creado_en').eq('psicologo_id', psicologoId).eq('fecha', fecha).eq('notificado', false).order('creado_en', { ascending: true });
    if (!Array.isArray(data)) return null;
    const pos = data.findIndex((r) => r.paciente_id === pacienteId);
    return pos >= 0 ? pos + 1 : null;
  }

  static async estaEnEspera(pacienteId, psicologoId, fecha) {
    const { data } = await supabase.from(TABLA).select('id').eq('paciente_id', pacienteId).eq('psicologo_id', psicologoId).eq('fecha', fecha).eq('notificado', false).limit(1);
    return Array.isArray(data) && data.length > 0;
  }
}
