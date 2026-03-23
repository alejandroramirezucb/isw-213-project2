class RepositorioNotificaciones {
  static #TABLA = 'notificaciones';

  static async obtenerNoLeidas(psicologoId) {
    try {
      const resultado = await clienteSupabase
        .from(this.#TABLA)
        .select('id, tipo, creado_en, cita_id')
        .eq('destinatario_tipo', 'psicologo')
        .eq('destinatario_id', psicologoId)
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

  static async obtenerTodas(psicologoId, limite = 20) {
    try {
      const resultado = await clienteSupabase
        .from(this.#TABLA)
        .select('id, tipo, enviado, creado_en, cita_id')
        .eq('destinatario_tipo', 'psicologo')
        .eq('destinatario_id', psicologoId)
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

  static async marcarTodasLeidas(psicologoId) {
    try {
      const resultado = await clienteSupabase
        .from(this.#TABLA)
        .update({ enviado: true })
        .eq('destinatario_tipo', 'psicologo')
        .eq('destinatario_id', psicologoId)
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

  static async obtenerConteoNoLeidas(psicologoId) {
    try {
      const resultado = await clienteSupabase
        .from(this.#TABLA)
        .select('id', { count: 'exact', head: true })
        .eq('destinatario_tipo', 'psicologo')
        .eq('destinatario_id', psicologoId)
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

  static suscribirseNuevasNotificaciones(psicologoId, callback) {
    try {
      const channel = clienteSupabase
        .channel(`notificaciones-psicologo-${psicologoId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: this.#TABLA,
          },
          (payload) => {
            if (payload.new && payload.new.destinatario_tipo === 'psicologo' && payload.new.destinatario_id === psicologoId) {
              callback(payload.new);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Suscrito a notificaciones del psicólogo ${psicologoId}`);
          }
        });
      
      return () => {
        channel.unsubscribe();
      };
    } catch (error) {
      console.error('Error en suscripción de notificaciones:', error);
      return () => {};
    }
  }
}
