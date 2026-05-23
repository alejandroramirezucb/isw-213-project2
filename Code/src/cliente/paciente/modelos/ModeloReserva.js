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
      return this._dispatch('paciente:mensaje', {
        texto: 'No es posible agendar. Comuníquese con administración.',
        tipo: 'error',
      });
    }

    try {
      const exito = await this._repositorioBloques.bloquearTemporal(bloqueId);
      if (!exito) {
        this._dispatch('paciente:mensaje', {
          texto: 'Este horario ya no está disponible',
          tipo: 'error',
        });
        document.dispatchEvent(
          new CustomEvent('paciente:bloqueNoDisponible', { detail: { fecha } }),
        );
        return;
      }

      this._bloqueId = bloqueId;
      this._fecha = fecha;
      document.dispatchEvent(
        new CustomEvent('paciente:bloqueReservado', {
          detail: { bloqueId, fecha },
        }),
      );
    } catch (e) {
      this._dispatch('paciente:mensaje', {
        texto: 'Error al seleccionar horario',
        tipo: 'error',
      });
      document.dispatchEvent(
        new CustomEvent('paciente:bloqueNoDisponible', { detail: { fecha } }),
      );
    }
  }

  async confirmar(esReprogramacion = false, citaAnterior = null) {
    if (this._confirmando) return;
    if (!this._bloqueId || !this._pacienteId) {
      return this._dispatch('paciente:mensaje', {
        texto: 'Error: datos de reserva incompletos',
        tipo: 'error',
      });
    }
    if (this._usuario?.pacientes?.bloqueado) {
      this._dispatch('paciente:mensaje', {
        texto: 'No es posible agendar en este momento',
        tipo: 'error',
      });
      return document.dispatchEvent(
        new CustomEvent('paciente:reservaCerrarModal'),
      );
    }

    this._confirmando = true;
    try {
      if (esReprogramacion && citaAnterior) {
        await this._repositorioCitas.cancelar(citaAnterior);
      }

      const bloque = await this._repositorioBloques
        .obtenerProfesional(this._bloqueId)
        .catch(async (err) => {
          await this._repositorioBloques.liberarTemporal(this._bloqueId);
          throw err;
        });

      if (!bloque?.psicologo_id) throw new Error('Bloque no válido');

      let citaId;
      try {
        citaId = await this._repositorioCitas.crear(
          this._pacienteId,
          bloque.psicologo_id,
          this._bloqueId,
        );
      } catch (e) {
        await this._repositorioBloques.liberarTemporal(this._bloqueId);
        throw e;
      }

      if (!citaId) throw new Error('Error al crear cita');

      await Promise.allSettled([
        this._repositorioCitas.crearNotificacion(
          this._pacienteId,
          'confirmacion_reserva',
          citaId,
        ),
        this._repositorioCitasPsicologo.crearNotificacionNuevoTurno(
          bloque.psicologo_id,
          citaId,
        ),
      ]);

      this._dispatch('paciente:mensaje', {
        texto: esReprogramacion
          ? 'Cita reprogramada exitosamente'
          : 'Cita reservada exitosamente',
        tipo: 'exito',
      });
      document.dispatchEvent(
        new CustomEvent('paciente:reservaConfirmada', {
          detail: { esReprogramacion, fecha: this._fecha },
        }),
      );
    } catch (e) {
      this._dispatch('paciente:mensaje', {
        texto: this._mapearError(e.message),
        tipo: 'error',
      });
      document.dispatchEvent(
        new CustomEvent('paciente:reservaError', {
          detail: { fecha: this._fecha },
        }),
      );
    } finally {
      this._confirmando = false;
    }
  }

  async cerrarModal(reservaExitosa = false) {
    const fecha = this._fecha;
    if (this._bloqueId && !reservaExitosa) {
      await this._repositorioBloques
        .liberarTemporal(this._bloqueId)
        .catch(() => {});
    }
    this._bloqueId = null;
    document.dispatchEvent(
      new CustomEvent('paciente:reservaCerrarModal', {
        detail: { fecha: reservaExitosa ? null : fecha },
      }),
    );
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
