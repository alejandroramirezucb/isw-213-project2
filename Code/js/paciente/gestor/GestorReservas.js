class GestorReservas {
  static #MODAL_ID = 'modal-reserva';

  static async confirmar() {
    const datos = this.#obtenerDatos();

    if (!this.#validarDatos(datos)) return;
    if (!this.#validarPaciente(datos)) return;

    try {
      await this.#procesarReserva(datos);
      // Éxito: cerrar modal
      this.cerrarModal();
    } catch (error) {
      console.error('Error en confirmación de reserva:', error);
      
      // Mostrar mensaje de error al usuario
      if (error.message === 'RACE_CONDITION') {
        MensajesFachada.mostrar('Este horario fue tomado por otro usuario justo ahora. Intenta con otro horario.', 'error');
      } else if (error.message?.includes('El horario no está disponible')) {
        MensajesFachada.mostrar('Este horario no está disponible. Intenta con otro horario.', 'error');
      } else if (error.message?.includes('duplicate')) {
        MensajesFachada.mostrar('Este horario fue tomado por otro usuario. Intenta con otro horario.', 'error');
      } else {
        MensajesFachada.mostrar('Error al reservar la cita', 'error');
      }
      
      // Recargar horarios para mostrar disponibilidad actualizada
      try {
        const fechaSeleccionada = EstadoPaciente.obtener('fechaSeleccionada');
        if (fechaSeleccionada) {
          await RenderizadorHorarios.cargar(fechaSeleccionada);
        }
      } catch (reloadError) {
        console.warn('No se pudieron recargar los horarios:', reloadError);
      }
    }
  }

  static #obtenerDatos() {
    return {
      bloqueId: EstadoPaciente.obtener('bloqueSeleccionado'),
      pacienteId: EstadoPaciente.obtener('pacienteId'),
      usuario: EstadoPaciente.obtener('usuario'),
      esReprogramacion: EstadoPaciente.obtener('modoReprogramacion'),
      citaAnterior: EstadoPaciente.obtener('citaAReprogramar'),
      fechaSeleccionada: EstadoPaciente.obtener('fechaSeleccionada'),
    };
  }

  static #validarDatos(datos) {
    if (!datos.bloqueId || !datos.pacienteId) {
      MensajesFachada.mostrar('Error: datos de reserva incompletos', 'error');
      return false;
    }
    return true;
  }

  static #validarPaciente(datos) {
    if (datos.usuario?.pacientes?.bloqueado) {
      MensajesFachada.mostrar('No es posible agendar en este momento', 'error');
      this.cerrarModal();
      return false;
    }
    return true;
  }

  static async #procesarReserva(datos) {
    if (datos.esReprogramacion && datos.citaAnterior) {
      await RepositorioCitas.cancelar(datos.citaAnterior);
    }

    let bloque;
    try {
      bloque = await RepositorioBloques.obtenerProfesional(datos.bloqueId);
    } catch (error) {
      await RepositorioBloques.liberarTemporal(datos.bloqueId);
      throw new Error('El horario no está disponible');
    }

    if (!bloque?.psicologo_id) {
      throw new Error('Bloque no válido o profesional no encontrado');
    }

    let citaCreada;
    try {
      citaCreada = await RepositorioCitas.crear(
        datos.pacienteId,
        bloque.psicologo_id,
        datos.bloqueId,
      );
    } catch (error) {
      await RepositorioBloques.liberarTemporal(datos.bloqueId);
      
      if (error.message?.includes('bloque ya fue reservado') || error.message?.includes('duplicate')) {
        throw new Error('RACE_CONDITION');
      }
      throw error;
    }
    
    if (!citaCreada) throw new Error('Error al crear cita');

    // Nota: RepositorioCitas.crear() ya marca el bloque como reservado
    
    await RepositorioCitas.crearNotificacion(
      datos.pacienteId,
      'confirmacion_reserva',
      citaCreada,
    );

    await RepositorioCitasPsicologo.crearNotificacionNuevoTurno(
      bloque.psicologo_id,
      citaCreada,
    );

    this.#mostrarMensajeExito(datos.esReprogramacion);
    this.cerrarModal(true);

    await RenderizadorHorarios.cargar(datos.fechaSeleccionada);
    await GestorProximaCita.cargar();
  }

  static #mostrarMensajeExito(esReprogramacion) {
    if (esReprogramacion) {
      MensajesFachada.mostrar('Cita reprogramada exitosamente', 'exito');
      GestorReprogramacion.salir();
    } else {
      MensajesFachada.mostrar('Cita reservada exitosamente', 'exito');
    }
  }

  static async cerrarModal(reservaExitosa = false) {
    NavigacionFachada.cerrarModal(this.#MODAL_ID);

    const bloqueId = EstadoPaciente.obtener('bloqueSeleccionado');
    if (!bloqueId) return;

    if (!reservaExitosa) {
      await RepositorioBloques.liberarTemporal(bloqueId);
      EstadoPaciente.reiniciarBloque();

      const fechaSel = EstadoPaciente.obtener('fechaSeleccionada');
      if (fechaSel) {
        await RenderizadorHorarios.cargar(fechaSel);
      }
    }
  }
}
