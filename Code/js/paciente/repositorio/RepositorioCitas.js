class RepositorioCitas {
  static #TABLA_CITAS = 'citas';
  static #TABLA_NOTIF = 'notificaciones';
  static #RPC_CANCELAR = 'cancelar_cita_y_liberar_bloque';
  static #ESTADO_CONFIRMADA = 'confirmada';
  static #ESTADO_CANCELADA = 'cancelada';
  static #ESTADO_COMPLETADA = 'completada';
  static #citasCache = null;
  static #tiempoUltimoCacheCitas = 0;
  static #DURACION_CACHE = 30000;

  static async crear(pacienteId, profesionalId, bloqueId) {
    const resultado = await clienteSupabase
      .from(this.#TABLA_CITAS)
      .insert({
        paciente_id: pacienteId,
        psicologo_id: profesionalId,
        bloque_id: bloqueId,
        estado: this.#ESTADO_CONFIRMADA,
      })
      .select('id');

    if (resultado.error) {
      console.error(
        'Error al crear cita:',
        resultado.error.message ||
          resultado.error.details ||
          JSON.stringify(resultado.error),
      );
      return null;
    }

    this.#citasCache = null;
    return resultado.data?.[0]?.id || null;
  }

  static async obtenerProxima(pacienteId) {
    const hoy = FormateadorFecha.aISO(new Date());

    const resultado = await clienteSupabase
      .from(this.#TABLA_CITAS)
      .select('id, estado, bloques_horario(fecha, hora_inicio, hora_fin)')
      .eq('paciente_id', pacienteId)
      .eq('estado', this.#ESTADO_CONFIRMADA)
      .gte('bloques_horario.fecha', hoy)
      .order('bloques_horario(fecha)', { ascending: true })
      .limit(1);

    return resultado.data?.length > 0 && resultado.data[0].bloques_horario
      ? resultado.data[0]
      : null;
  }

  static async obtenerPorFiltro(pacienteId, filtro) {
    const hoy = FormateadorFecha.aISO(new Date());
    const ahora = Date.now();

    if (filtro !== 'proximas') {
      this.#citasCache = null;
    }

    if (
      this.#citasCache &&
      ahora - this.#tiempoUltimoCacheCitas < this.#DURACION_CACHE
    ) {
      return this.#filtrarCitasLocal(pacienteId, filtro, hoy);
    }

    let query = clienteSupabase
      .from(this.#TABLA_CITAS)
      .select(
        'id, estado, creado_en, bloques_horario(fecha, hora_inicio, hora_fin), paciente_id',
      )
      .eq('paciente_id', pacienteId);

    if (filtro === 'proximas') {
      query = query
        .eq('estado', this.#ESTADO_CONFIRMADA)
        .gte('bloques_horario.fecha', hoy);
    } else if (filtro === 'pasadas') {
      query = query
        .eq('estado', this.#ESTADO_COMPLETADA)
        .lte('bloques_horario.fecha', hoy);
    } else if (filtro === 'canceladas') {
      query = query.eq('estado', this.#ESTADO_CANCELADA);
    }

    const resultado = await query.order('bloques_horario(fecha)', {
      ascending: filtro === 'proximas',
    });

    if (filtro === 'proximas') {
      this.#citasCache = resultado.data || [];
      this.#tiempoUltimoCacheCitas = ahora;
    }

    return resultado.data || [];
  }

  static #filtrarCitasLocal(pacienteId, filtro, hoy) {
    return this.#citasCache.filter((cita) => {
      if (cita.paciente_id !== pacienteId) return false;

      if (filtro === 'proximas')
        return (
          cita.estado === this.#ESTADO_CONFIRMADA &&
          cita.bloques_horario?.fecha >= hoy
        );
      if (filtro === 'pasadas')
        return (
          cita.estado === this.#ESTADO_COMPLETADA &&
          cita.bloques_horario?.fecha < hoy
        );
      if (filtro === 'canceladas')
        return cita.estado === this.#ESTADO_CANCELADA;
      return true;
    });
  }

  static async cancelar(citaId) {
    const resultado = await clienteSupabase.rpc(this.#RPC_CANCELAR, {
      p_cita_id: citaId,
      p_cancelada_por: 'paciente',
    });
    return !resultado.error;
  }

  static async crearNotificacion(pacienteId, tipo, citaId) {
    try {
      const payload = {
        destinatario_tipo: 'paciente',
        destinatario_id: pacienteId,
        cita_id: citaId,
        tipo: tipo,
        canal: 'sistema',
        enviado: false,
      };

      const resultado = await clienteSupabase
        .from(this.#TABLA_NOTIF)
        .insert(payload)
        .select();

      if (resultado.error) {
        if (resultado.error.code === '23505') {
          return true;
        }
      }

      return !resultado.error;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }
}
