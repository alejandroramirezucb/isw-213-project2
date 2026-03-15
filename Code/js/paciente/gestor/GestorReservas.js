class GestorReservas {
  static #MODAL_ID = 'modal-reserva';

  static async confirmar() {
    const bloqueId = EstadoPaciente.obtener('bloqueSeleccionado');
    const pacienteId = EstadoPaciente.obtener('pacienteId');
    const usuario = EstadoPaciente.obtener('usuario');

    if (!bloqueId || !pacienteId) {
      MensajesFachada.mostrar('Error: datos de reserva incompletos', 'error');
      return;
    }

    if (usuario?.pacientes?.bloqueado) {
      MensajesFachada.mostrar('No es posible agendar en este momento', 'error');
      this.cerrarModal();
      return;
    }

    try {
      const esReprogramacion = EstadoPaciente.obtener('modoReprogramacion');

      if (esReprogramacion) {
        const citaAnterior = EstadoPaciente.obtener('citaAReprogramar');
        if (citaAnterior) {
          await RepositorioCitas.cancelar(citaAnterior);
        }
      }

      const bloque = await RepositorioBloques.obtenerProfesional(bloqueId);

      if (!bloque || !bloque.psicologo_id) {
        throw new Error('Bloque no válido o profesional no encontrado');
      }

      const citaCreada = await RepositorioCitas.crear(
        pacienteId,
        bloque.psicologo_id,
        bloqueId,
      );
      if (!citaCreada) throw new Error('Error al crear cita');

      const bloqueActualizado =
        await RepositorioBloques.marcarReservado(bloqueId);
      if (!bloqueActualizado) throw new Error('Error al actualizar bloque');

      await RepositorioCitas.crearNotificacion(
        pacienteId,
        'confirmacion_reserva',
        citaCreada,
      );

      if (esReprogramacion) {
        MensajesFachada.mostrar('Cita reprogramada exitosamente', 'exito');
        GestorReprogramacion.salir();
      } else {
        MensajesFachada.mostrar('Cita reservada exitosamente', 'exito');
      }

      this.cerrarModal(true);

      const fechaSel = EstadoPaciente.obtener('fechaSeleccionada');
      await RenderizadorHorarios.cargar(fechaSel);
      await GestorProximaCita.cargar();
    } catch (error) {
      MensajesFachada.mostrar('Error al reservar la cita', 'error');
      await RepositorioBloques.liberarTemporal(bloqueId);
    }
  }

  static async cerrarModal(reservaExitosa = false) {
    NavigacionFachada.cerrarModal(this.#MODAL_ID);

    const bloqueId = EstadoPaciente.obtener('bloqueSeleccionado');

    if (bloqueId && !reservaExitosa) {
      await RepositorioBloques.liberarTemporal(bloqueId);
      EstadoPaciente.reiniciarBloque();

      const fechaSel = EstadoPaciente.obtener('fechaSeleccionada');
      if (fechaSel) {
        await RenderizadorHorarios.cargar(fechaSel);
      }
    }

    if (!reservaExitosa) {
      EstadoPaciente.reiniciarBloque();
    }
  }
}
