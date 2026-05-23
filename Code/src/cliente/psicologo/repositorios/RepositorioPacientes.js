import { supabase } from '../../compartido/config/ClienteSupabase.js';

export class RepositorioPacientes {
  static async actualizarBloqueo(pacienteId, bloqueado) {
    const { error } = await supabase.from('pacientes').update({ bloqueado }).eq('id', pacienteId);
    return !error;
  }
}
