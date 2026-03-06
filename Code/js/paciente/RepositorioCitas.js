class RepositorioCitas {
  static async crear(pacienteId, profesionalId, bloqueId) {
    const resultado = await clienteSupabase.from('citas').insert({
      paciente_id: pacienteId,
      psicologo_id: profesionalId,
      bloque_id: bloqueId,
      estado: 'confirmada',
    });
    return resultado.data || !resultado.error;
  }

  static async obtenerProxima(pacienteId) {
    const hoy = Fachada.obtenerFechaISO(new Date());

    const resultado = await clienteSupabase
      .from('citas')
      .select('id, estado, bloques_horario(fecha, hora_inicio, hora_fin)')
      .eq('paciente_id', pacienteId)
      .eq('estado', 'confirmada')
      .gte('bloques_horario.fecha', hoy)
      .order('bloques_horario(fecha)', { ascending: true })
      .limit(1);

    if (resultado.data?.length > 0 && resultado.data[0].bloques_horario) {
      return resultado.data[0];
    }
    return null;
  }

  static async obtenerPorFiltro(pacienteId, filtro) {
    const hoy = Fachada.obtenerFechaISO(new Date());

    let query = clienteSupabase
      .from('citas')
      .select(
        'id, estado, creado_en, bloques_horario(fecha, hora_inicio, hora_fin)',
      )
      .eq('paciente_id', pacienteId);

    if (filtro === 'proximas') {
      query = query
        .eq('estado', 'confirmada')
        .gte('bloques_horario.fecha', hoy);
    } else if (filtro === 'pasadas') {
      query = query
        .in('estado', ['completada', 'confirmada'])
        .lt('bloques_horario.fecha', hoy);
    } else if (filtro === 'canceladas') {
      query = query.eq('estado', 'cancelada');
    }

    const resultado = await query.order('bloques_horario(fecha)', {
      ascending: filtro === 'proximas',
    });
    return resultado.data || [];
  }

  static async cancelar(citaId) {
    const resultado = await clienteSupabase.rpc(
      'cancelar_cita_y_liberar_bloque',
      {
        p_cita_id: citaId,
        p_cancelada_por: 'paciente',
      },
    );
    return !resultado.error;
  }

  static async crearNotificacion(pacienteId, tipo, citaId) {
    try {
      await clienteSupabase.from('notificaciones').insert({
        destinatario_tipo: 'paciente',
        destinatario_id: pacienteId,
        cita_id: citaId,
        tipo: tipo,
        canal: 'email',
      });
    } catch (_) {}
  }
}
