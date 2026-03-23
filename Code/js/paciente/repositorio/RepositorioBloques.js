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
    // 1. Liberar bloques expirados
    await clienteSupabase.rpc(this.#RPC_LIBERAR);

    // 2. Obtener todos los bloques de esa fecha
    const { data: bloques, error: errorBloques } = await clienteSupabase
      .from(this.#TABLA)
      .select('*')
      .eq('fecha', fecha)
      .order('hora_inicio');

    if (errorBloques || !bloques) {
      console.error('Error obteniendo bloques:', errorBloques);
      return [];
    }

    // 3. Obtener todas las citas CONFIRMADAS para esos bloques
    const bloqueIds = bloques.map((b) => b.id);
    const { data: citas, error: errorCitas } = await clienteSupabase
      .from('citas')
      .select('bloque_id, estado')
      .in('bloque_id', bloqueIds)
      .eq('estado', 'confirmada');

    if (errorCitas) {
      console.error('Error obteniendo citas:', errorCitas);
    }

    // 4. Crear un mapa de bloques reservados
    const bloquesReservados = new Set(
      (citas || []).map((cita) => cita.bloque_id)
    );

    // 5. Marcar bloques como reservado si tienen citas confirmadas
    return bloques.map((bloque) => {
      if (bloquesReservados.has(bloque.id) && bloque.estado !== 'bloqueado_temporal') {
        return {
          ...bloque,
          estado: 'reservado',
        };
      }
      return bloque;
    });
  }

  static async obtenerTodosPorFecha(fecha) {
    const { data: bloques, error } = await clienteSupabase
      .from(this.#TABLA)
      .select('id, psicologo_id, fecha, hora_inicio, hora_fin, estado')
      .eq('fecha', fecha)
      .order('hora_inicio');

    if (error || !bloques || bloques.length === 0) {
      console.warn('No hay bloques para la fecha:', fecha);
      return [];
    }

    return bloques;
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
