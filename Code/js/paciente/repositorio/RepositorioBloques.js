class RepositorioBloques {
  static #TABLA = 'bloques_horario';
  static #RPC_LIBERAR = 'liberar_bloques_expirados';
  static #RPC_BLOQUEAR_TEMP = 'bloquear_bloque_temporal';
  static #DURACION_BLOQUEO_MIN = 5;

  static async obtenerDisponibilidadMes(anio, mes) {
    const fechaInicio = `${anio}-${String(mes + 1).padStart(2, '0')}-01`;
    const ultimoDia = new Date(anio, mes + 1, 0).getDate();
    const fechaFin = `${anio}-${String(mes + 1).padStart(2, '0')}-${ultimoDia}`;

    const resultado = await clienteSupabase
      .from(this.#TABLA)
      .select('fecha')
      .eq('estado', 'disponible')
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);

    const disponibilidad = {};
    if (resultado.data) {
      resultado.data.forEach((bloque) => {
        disponibilidad[bloque.fecha] = true;
      });
    }
    return disponibilidad;
  }

  static async obtenerPorFecha(fecha) {
    await clienteSupabase.rpc(this.#RPC_LIBERAR);

    const resultado = await clienteSupabase
      .from(this.#TABLA)
      .select('*')
      .eq('fecha', fecha)
      .in('estado', ['disponible', 'bloqueado_temporal'])
      .order('hora_inicio');

    return resultado.data || [];
  }

  static async bloquearTemporal(bloqueId) {
    const resultado = await clienteSupabase.rpc(this.#RPC_BLOQUEAR_TEMP, {
      p_bloque_id: bloqueId,
      p_minutos: this.#DURACION_BLOQUEO_MIN,
    });
    return !resultado.error;
  }

  static async liberarTemporal(bloqueId) {
    await clienteSupabase
      .from(this.#TABLA)
      .update({ estado: 'disponible', bloqueado_hasta: null })
      .eq('id', bloqueId)
      .eq('estado', 'bloqueado_temporal');
  }

  static async marcarReservado(bloqueId) {
    const resultado = await clienteSupabase
      .from(this.#TABLA)
      .update({ estado: 'reservado', bloqueado_hasta: null })
      .eq('id', bloqueId)
      .eq('estado', 'bloqueado_temporal');
    return !resultado.error;
  }

  static async obtenerProfesional(bloqueId) {
    const resultado = await clienteSupabase
      .from(this.#TABLA)
      .select('psicologo_id, estado')
      .eq('id', bloqueId)
      .single();
    
    if (resultado.error) {
      throw new Error('Bloque no encontrado');
    }
    
    if (resultado.data?.estado !== 'bloqueado_temporal') {
      throw new Error('El bloque no está disponible o ya fue ocupado por otro usuario');
    }
    
    return resultado.data;
  }
}
