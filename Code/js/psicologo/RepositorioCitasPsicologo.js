class RepositorioCitasPsicologo {
  static async obtenerPorPeriodo(psicologoId, fechaInicio, fechaFin) {
    const resultado = await clienteSupabase
      .from('citas')
      .select(
        'id, estado, pacientes(id, nombre, apellido, correo, telefono, bloqueado), bloques_horario(fecha, hora_inicio, hora_fin)',
      )
      .eq('psicologo_id', psicologoId)
      .eq('estado', 'confirmada')
      .gte('bloques_horario.fecha', fechaInicio)
      .lte('bloques_horario.fecha', fechaFin)
      .order('bloques_horario(fecha)', { ascending: true })
      .order('bloques_horario(hora_inicio)', { ascending: true });

    if (!resultado.data) return [];
    return resultado.data.filter((c) => c.bloques_horario);
  }

  static async cancelar(citaId) {
    const resultado = await clienteSupabase.rpc(
      'cancelar_cita_y_liberar_bloque',
      {
        p_cita_id: citaId,
        p_cancelada_por: 'psicologo',
      },
    );
    return !resultado.error;
  }

  static async obtenerPacienteId(citaId) {
    const resultado = await clienteSupabase
      .from('citas')
      .select('paciente_id')
      .eq('id', citaId)
      .single();
    return resultado.data ? resultado.data.paciente_id : null;
  }

  static async crearNotificacion(pacienteId, citaId) {
    try {
      await clienteSupabase.from('notificaciones').insert({
        destinatario_tipo: 'paciente',
        destinatario_id: pacienteId,
        cita_id: citaId,
        tipo: 'cancelacion',
        canal: 'email',
      });
    } catch (_) {}
  }

  static async obtenerHistorialPacientes(psicologoId) {
    const resultado = await clienteSupabase
      .from('citas')
      .select(
        'id, estado, pacientes(id, nombre, apellido, correo, bloqueado), bloques_horario(fecha, hora_inicio)',
      )
      .eq('psicologo_id', psicologoId)
      .order('bloques_horario(fecha)', { ascending: false });

    if (!resultado.data) return [];

    const porPaciente = {};
    resultado.data.forEach((cita) => {
      if (!cita.pacientes || !cita.bloques_horario) return;
      const pid = cita.pacientes.id;
      if (!porPaciente[pid]) {
        porPaciente[pid] = {
          paciente: cita.pacientes,
          citas: [],
        };
      }
      porPaciente[pid].citas.push({
        id: cita.id,
        estado: cita.estado,
        fecha: cita.bloques_horario.fecha,
        hora: cita.bloques_horario.hora_inicio,
      });
    });

    return Object.values(porPaciente);
  }
}
