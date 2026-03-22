class RepositorioCitasPsicologo {
  static #citasCache = new Map();
  static #historialesCache = new Map();
  static #DURACION_CACHE = 300000; 

  static #obtenerClaveCache(psicologoId, fechaInicio, fechaFin) {
    return `${psicologoId}:${fechaInicio}:${fechaFin}`;
  }

  static #esCacheValido(timestamp) {
    return Date.now() - timestamp < this.#DURACION_CACHE;
  }

  static async obtenerPorPeriodo(psicologoId, fechaInicio, fechaFin) {
    const clave = this.#obtenerClaveCache(psicologoId, fechaInicio, fechaFin);
    const cached = this.#citasCache.get(clave);

    if (cached && this.#esCacheValido(cached.timestamp)) {
      return cached.datos;
    }

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

    const datos = resultado.data
      ? resultado.data.filter((c) => c.bloques_horario)
      : [];
    this.#citasCache.set(clave, { datos, timestamp: Date.now() });
    return datos;
  }

  static async cancelarConNotificacion(citaId) {
    const datos = await this.#obtenerDatosCita(citaId);
    if (!datos) return false;

    const resultado = await clienteSupabase.rpc(
      'cancelar_cita_y_liberar_bloque',
      {
        p_cita_id: citaId,
        p_cancelada_por: 'psicologo',
      },
    );

    if (!resultado.error && datos.pacienteId) {
      await this.crearNotificacion(datos.pacienteId, citaId);
      this.#invalidarCacheCompleto(datos.psicologoId);
    }

    return !resultado.error;
  }

  static async #obtenerDatosCita(citaId) {
    const resultado = await clienteSupabase
      .from('citas')
      .select('paciente_id, psicologo_id')
      .eq('id', citaId)
      .single();

    return resultado.data
      ? {
          pacienteId: resultado.data.paciente_id,
          psicologoId: resultado.data.psicologo_id,
        }
      : null;
  }

  static async crearNotificacion(pacienteId, citaId) {
    try {
      await clienteSupabase.from('notificaciones').insert({
        destinatario_tipo: 'paciente',
        destinatario_id: pacienteId,
        cita_id: citaId,
        tipo: 'cancelacion',
        canal: 'sistema',
        enviado: false,
      });
    } catch (_) {}
  }

  static async obtenerHistorialPacientes(psicologoId) {
    const cached = this.#historialesCache.get(psicologoId);
    if (cached && this.#esCacheValido(cached.timestamp)) {
      return cached.datos;
    }

    const resultado = await clienteSupabase
      .from('citas')
      .select(
        'id, estado, pacientes(id, nombre, apellido, correo, bloqueado), bloques_horario(fecha, hora_inicio)',
      )
      .eq('psicologo_id', psicologoId)
      .order('bloques_horario(fecha)', { ascending: false });

    const datos = this.#procesarHistorial(resultado.data || []);
    this.#historialesCache.set(psicologoId, { datos, timestamp: Date.now() });
    return datos;
  }

  static #procesarHistorial(citasData) {
    const porPaciente = {};
    citasData.forEach((cita) => {
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

  static #invalidarCacheCompleto(psicologoId) {
    for (const clave of this.#citasCache.keys()) {
      if (clave.startsWith(psicologoId)) {
        this.#citasCache.delete(clave);
      }
    }
    this.#historialesCache.delete(psicologoId);
  }

  static #limpiarCache() {
    this.#citasCache.clear();
    this.#historialesCache.clear();
  }
}
