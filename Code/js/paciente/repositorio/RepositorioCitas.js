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
      const errorMsg = resultado.error.message || resultado.error.details || JSON.stringify(resultado.error);
      const statusCode = resultado.error.code || '';
      
      if (statusCode.includes('409') || errorMsg.includes('unique') || errorMsg.includes('duplicate') || errorMsg.includes('violates')) {
        console.warn('Error 409: Bloque ya reservado');
        throw new Error('Este bloque ya fue reservado por otro usuario');
      }
      
      console.error('Error al crear cita:', errorMsg);
      throw new Error('Error al crear cita: ' + errorMsg);
    }

    this.#citasCache = null;
    const citaId = resultado.data?.[0]?.id || null;
    
    if (citaId) {
      try {
        await RepositorioBloques.marcarReservado(bloqueId);
      } catch (e) {
        console.warn('No se pudo marcar bloque:', e.message);
      }
      
      await this.crearNotificacionPsicologo(profesionalId, 'nueva_cita', citaId);
    }

    return citaId;
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
    const { data: cita } = await clienteSupabase
      .from(this.#TABLA_CITAS)
      .select('paciente_id, psicologo_id')
      .eq('id', citaId)
      .single();

    const resultado = await clienteSupabase.rpc(this.#RPC_CANCELAR, {
      p_cita_id: citaId,
      p_cancelada_por: 'paciente',
    });

    if (!resultado.error && cita) {
      await this.crearNotificacionPsicologo(cita.psicologo_id, 'cancelada_por_paciente', citaId);
    }

    return !resultado.error;
  }

  static async crearNotificacion(pacienteId, tipo, citaId) {
    try {
      const payload = {
        destinatario_tipo: 'paciente',
        destinatario_id: pacienteId,
        cita_id: citaId,
        tipo: tipo,
        canal: 'email',
        enviado: false,
      };

      const resultado = await clienteSupabase
        .from(this.#TABLA_NOTIF)
        .insert(payload);

      if (resultado.error) {
        if (resultado.error.code === '23505' || resultado.error.status === 403 || resultado.error.status === 400 || resultado.error.code === '42501') {
          console.warn(`No se pudo crear notificación paciente (${resultado.error.status || resultado.error.code}), continuando...`);
          return true;
        }
      }

      return true;
    } catch (error) {
      console.warn('Error creando notificación (no crítico):', error.message);
      return true;
    }
  }

  static async crearNotificacionPsicologo(psicologoId, tipo, citaId) {
    try {
      const payload = {
        destinatario_tipo: 'psicologo',
        destinatario_id: psicologoId,
        cita_id: citaId,
        tipo: tipo,
        canal: 'email',
        enviado: false,
      };

      const resultado = await clienteSupabase
        .from(this.#TABLA_NOTIF)
        .insert(payload);

      if (resultado.error) {
        if (resultado.error.code === '23505') {
          return true;
        }
        if (resultado.error.status === 403 || resultado.error.status === 400 || resultado.error.code === '42501') {
          console.warn(`No se pudo crear notificación psicólogo (${resultado.error.status || resultado.error.code}), continuando...`);
          return true;
        }
        console.warn('Error al crear notificación psicólogo:', resultado.error);
        return true;
      }

      return true;
    } catch (error) {
      console.warn('Error creando notificación (no crítico):', error.message);
      return true;
    }
  }
}
