/* globals CustomEvent */

export class ModeloReserva {
  constructor(repositorioCitas, repositorioBloques, repositorioCitasPsicologo) {
    this._repositorioCitas = repositorioCitas;
    this._repositorioBloques = repositorioBloques;
    this._repositorioCitasPsicologo = repositorioCitasPsicologo;
    this._pacienteId = null;
    this._usuario = null;
    this._bloqueId = null;
    this._fecha = null;
    this._confirmando = false;
  }

  inicializar(pacienteId, usuario) {
    this._pacienteId = pacienteId;
    this._usuario = usuario;
  }

  getBloqueId() {
    return this._bloqueId;
  }
  getFecha() {
    return this._fecha;
  }

  async seleccionarBloque(bloqueId, fecha) {
    if (this._usuario?.pacientes?.bloqueado) {
      return this._enviarMensajeError(
        'No es posible agendar. Comuníquese con administración.',
      );
    }

    try {
      const exito = await this._repositorioBloques.bloquearTemporal(bloqueId);
      if (!exito) {
        this._enviarMensajeError('Este horario ya no está disponible');
        this._dispatch('paciente:bloqueNoDisponible', { fecha });
        return;
      }

      this._bloqueId = bloqueId;
      this._fecha = fecha;
      this._dispatch('paciente:bloqueReservado', { bloqueId, fecha });
    } catch {
      this._enviarMensajeError('Error al seleccionar horario');
      this._dispatch('paciente:bloqueNoDisponible', { fecha });
    }
  }

  async confirmar(esReprogramacion = false, citaAnterior = null) {
    if (this._confirmando) return;
    if (!this._datosReservaValidos()) return;

    this._confirmando = true;
    try {
      if (esReprogramacion && citaAnterior) {
        await this._repositorioCitas.cancelar(citaAnterior);
      }
      const bloque = await this._obtenerBloqueProfesional();
      const citaId = await this._crearCita(bloque.psicologo_id);
      await this._notificarNuevoTurno(bloque.psicologo_id, citaId);
      this._anunciarReservaExitosa(esReprogramacion);
    } catch (e) {
      this._anunciarReservaFallida(e);
    } finally {
      this._confirmando = false;
    }
  }

  _datosReservaValidos() {
    if (!this._bloqueId || !this._pacienteId) {
      this._enviarMensajeError('Error: datos de reserva incompletos');
      return false;
    }
    if (this._usuario?.pacientes?.bloqueado) {
      this._enviarMensajeError('No es posible agendar en este momento');
      this._dispatch('paciente:reservaCerrarModal');
      return false;
    }
    return true;
  }

  async _obtenerBloqueProfesional() {
    const bloque = await this._repositorioBloques
      .obtenerProfesional(this._bloqueId)
      .catch(async (err) => {
        await this._repositorioBloques.liberarTemporal(this._bloqueId);
        throw err;
      });
    if (!bloque?.psicologo_id) throw new Error('Bloque no válido');
    return bloque;
  }

  async _crearCita(psicologoId) {
    let citaId;
    try {
      citaId = await this._repositorioCitas.crear(
        this._pacienteId,
        psicologoId,
        this._bloqueId,
      );
    } catch (e) {
      await this._repositorioBloques.liberarTemporal(this._bloqueId);
      throw e;
    }
    if (!citaId) throw new Error('Error al crear cita');
    return citaId;
  }

  async _notificarNuevoTurno(psicologoId, citaId) {
    await Promise.allSettled([
      this._repositorioCitas.crearNotificacion(
        this._pacienteId,
        'confirmacion_reserva',
        citaId,
      ),
      this._repositorioCitasPsicologo.crearNotificacionNuevoTurno(
        psicologoId,
        citaId,
      ),
    ]);
  }

  _anunciarReservaExitosa(esReprogramacion) {
    this._dispatch('paciente:mensaje', {
      texto: esReprogramacion
        ? 'Cita reprogramada exitosamente'
        : 'Cita reservada exitosamente',
      tipo: 'exito',
    });
    this._dispatch('paciente:reservaConfirmada', {
      esReprogramacion,
      fecha: this._fecha,
    });
  }

  _anunciarReservaFallida(e) {
    this._enviarMensajeError(this._mapearError(e.message));
    this._dispatch('paciente:reservaError', { fecha: this._fecha });
  }

  async cerrarModal(reservaExitosa = false) {
    const fecha = this._fecha;
    if (this._bloqueId && !reservaExitosa) {
      await this._repositorioBloques
        .liberarTemporal(this._bloqueId)
        .catch(() => {});
    }
    this._bloqueId = null;
    this._dispatch('paciente:reservaCerrarModal', {
      fecha: reservaExitosa ? null : fecha,
    });
  }

  _enviarMensajeError(texto) {
    this._dispatch('paciente:mensaje', { texto, tipo: 'error' });
  }

  _mapearError(msg) {
    if (msg?.includes('bloque ya fue reservado'))
      return 'Este horario ya está reservado. Intenta con otro.';
    if (msg?.includes('duplicate'))
      return 'Este horario ya fue tomado. Intenta con otro.';
    if (msg?.includes('disponible'))
      return 'El horario no está disponible. Intenta con otro.';
    return 'Error al reservar la cita. Por favor intenta de nuevo.';
  }

  _dispatch(evento, detail) {
    document.dispatchEvent(new CustomEvent(evento, { detail }));
  }
}
