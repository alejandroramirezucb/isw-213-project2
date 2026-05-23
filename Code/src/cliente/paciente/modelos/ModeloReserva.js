export class ModeloReserva {
  constructor(repositorioCitas, repositorioBloques, repositorioCitasPsicologo) {
    this._repositorioCitas = repositorioCitas;
    this._repositorioBloques = repositorioBloques;
    this._repositorioCitasPsicologo = repositorioCitasPsicologo;
    this._pacienteId = null;
    this._usuario = null;
    this._bloqueId = null;
    this._fecha = null;
  }

  inicializar(pacienteId, usuario) {
    this._pacienteId = pacienteId;
    this._usuario = usuario;
  }

  getBloqueId() { return this._bloqueId; }
  getFecha() { return this._fecha; }

  async seleccionarBloque(bloqueId, fecha) {
    if (this._usuario?.pacientes?.bloqueado) {
      return this._dispatch('paciente:mensaje', { texto: 'No es posible agendar. Comuníquese con administración.', tipo: 'error' });
    }

    const exito = await this._repositorioBloques.bloquearTemporal(bloqueId);
    if (!exito) {
      this._dispatch('paciente:mensaje', { texto: 'Este horario ya no está disponible', tipo: 'error' });
      document.dispatchEvent(new CustomEvent('paciente:bloqueNoDisponible', { detail: { fecha } }));
      return;
    }

    this._bloqueId = bloqueId;
    this._fecha = fecha;
    document.dispatchEvent(new CustomEvent('paciente:bloqueReservado', { detail: { bloqueId, fecha } }));
  }

  async confirmar(esReprogramacion = false, citaAnterior = null) {
    if (!this._bloqueId || !this._pacienteId) {
      return this._dispatch('paciente:mensaje', { texto: 'Error: datos de reserva incompletos', tipo: 'error' });
    }
    if (this._usuario?.pacientes?.bloqueado) {
      this._dispatch('paciente:mensaje', { texto: 'No es posible agendar en este momento', tipo: 'error' });
      return document.dispatchEvent(new CustomEvent('paciente:reservaCerrarModal'));
    }

    try {
      if (esReprogramacion && citaAnterior) {
        await this._repositorioCitas.cancelar(citaAnterior);
      }

      const bloque = await this._repositorioBloques.obtenerProfesional(this._bloqueId).catch(async () => {
        await this._repositorioBloques.liberarTemporal(this._bloqueId);
        throw new Error('El horario no está disponible');
      });

      if (!bloque?.psicologo_id) throw new Error('Bloque no válido');

      let citaId;
      try {
        citaId = await this._repositorioCitas.crear(this._pacienteId, bloque.psicologo_id, this._bloqueId);
      } catch (e) {
        await this._repositorioBloques.liberarTemporal(this._bloqueId);
        throw e.message?.includes('bloque ya fue reservado') ? new Error('RACE_CONDITION') : e;
      }

      if (!citaId) throw new Error('Error al crear cita');

      await this._repositorioCitas.crearNotificacion(this._pacienteId, 'confirmacion_reserva', citaId);
      await this._repositorioCitasPsicologo.crearNotificacionNuevoTurno(bloque.psicologo_id, citaId);

      this._dispatch('paciente:mensaje', {
        texto: esReprogramacion ? 'Cita reprogramada exitosamente' : 'Cita reservada exitosamente',
        tipo: 'exito',
      });
      document.dispatchEvent(new CustomEvent('paciente:reservaConfirmada', {
        detail: { esReprogramacion, fecha: this._fecha },
      }));
    } catch (e) {
      this._dispatch('paciente:mensaje', { texto: this._mapearError(e.message), tipo: 'error' });
      document.dispatchEvent(new CustomEvent('paciente:reservaError', { detail: { fecha: this._fecha } }));
    }
  }

  async cerrarModal(reservaExitosa = false) {
    const fecha = this._fecha;
    if (this._bloqueId && !reservaExitosa) {
      await this._repositorioBloques.liberarTemporal(this._bloqueId);
    }
    this._bloqueId = null;
    document.dispatchEvent(new CustomEvent('paciente:reservaCerrarModal', {
      detail: { fecha: reservaExitosa ? null : fecha },
    }));
  }

  _mapearError(msg) {
    if (msg === 'RACE_CONDITION') return 'Este horario fue tomado justo ahora. Intenta con otro.';
    if (msg?.includes('duplicate')) return 'Este horario ya fue tomado. Intenta con otro.';
    return 'Error al reservar la cita';
  }

  _dispatch(evento, detail) {
    document.dispatchEvent(new CustomEvent(evento, { detail }));
  }
}
