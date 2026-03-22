class RepositorioNotificaciones {
  static #TABLA = 'notificaciones';

  static async obtenerNoLeidas(pacienteId) {
    try {
      const resultado = await clienteSupabase
        .from(this.#TABLA)
        .select('id, tipo, creado_en, cita_id')
        .eq('destinatario_tipo', 'paciente')
        .eq('destinatario_id', pacienteId)
        .eq('enviado', false)
        .order('creado_en', { ascending: false });

      if (resultado.error) {
        console.error('Supabase error:', resultado.error);
        return [];
      }

      return resultado.data || [];
    } catch (error) {
      console.error('Error obtaining unread notifications:', error);
      return [];
    }
  }

  static async obtenerTodas(pacienteId, limite = 20) {
    try {
      const resultado = await clienteSupabase
        .from(this.#TABLA)
        .select('id, tipo, enviado, creado_en, cita_id')
        .eq('destinatario_tipo', 'paciente')
        .eq('destinatario_id', pacienteId)
        .order('creado_en', { ascending: false })
        .limit(limite);

      if (resultado.error) {
        console.error('Supabase error:', resultado.error);
        return [];
      }

      return resultado.data || [];
    } catch (error) {
      console.error('Error obtaining all notifications:', error);
      return [];
    }
  }

  static async marcarComoLeida(notificacionId) {
    try {
      const resultado = await clienteSupabase
        .from(this.#TABLA)
        .update({ enviado: true })
        .eq('id', notificacionId);

      return !resultado.error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  static async marcarTodasLeidasDelPaciente(pacienteId) {
    try {
      const resultado = await clienteSupabase
        .from(this.#TABLA)
        .update({ enviado: true })
        .eq('destinatario_tipo', 'paciente')
        .eq('destinatario_id', pacienteId)
        .eq('enviado', false);

      if (resultado.error) {
        console.error('Supabase error:', resultado.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }

  static async obtenerConteoNoLeidas(pacienteId) {
    try {
      const resultado = await clienteSupabase
        .from(this.#TABLA)
        .select('id', { count: 'exact', head: true })
        .eq('destinatario_tipo', 'paciente')
        .eq('destinatario_id', pacienteId)
        .eq('enviado', false);

      if (resultado.error) {
        console.error('Supabase error:', resultado.error);
        return 0;
      }

      return resultado.count || 0;
    } catch (error) {
      console.error('Error obtaining unread count:', error);
      return 0;
    }
  }
}
