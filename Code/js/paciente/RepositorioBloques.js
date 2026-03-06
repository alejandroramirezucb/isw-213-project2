class RepositorioBloques {
  static async obtenerDisponibilidadMes(anio, mes) {
    const fechaInicio = `${anio}-${String(mes + 1).padStart(2, '0')}-01`;
    const ultimoDia = new Date(anio, mes + 1, 0).getDate();
    const fechaFin = `${anio}-${String(mes + 1).padStart(2, '0')}-${ultimoDia}`;

    const resultado = await clienteSupabase
      .from('bloques_horario')
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
    await clienteSupabase.rpc('liberar_bloques_expirados');

    const resultado = await clienteSupabase
      .from('bloques_horario')
      .select('*')
      .eq('fecha', fecha)
      .in('estado', ['disponible', 'bloqueado_temporal'])
      .order('hora_inicio');

    return resultado.data || [];
  }

  static async bloquearTemporal(bloqueId) {
    const resultado = await clienteSupabase.rpc('bloquear_bloque_temporal', {
      p_bloque_id: bloqueId,
      p_minutos: 5,
    });
    return !resultado.error;
  }

  static async liberarTemporal(bloqueId) {
    await clienteSupabase
      .from('bloques_horario')
      .update({ estado: 'disponible', bloqueado_hasta: null })
      .eq('id', bloqueId)
      .eq('estado', 'bloqueado_temporal');
  }

  static async marcarReservado(bloqueId) {
    const resultado = await clienteSupabase
      .from('bloques_horario')
      .update({ estado: 'reservado', bloqueado_hasta: null })
      .eq('id', bloqueId);
    return !resultado.error;
  }

  static async obtenerProfesional(bloqueId) {
    const resultado = await clienteSupabase
      .from('bloques_horario')
      .select('psicologo_id')
      .eq('id', bloqueId)
      .single();
    return resultado.data;
  }
}
