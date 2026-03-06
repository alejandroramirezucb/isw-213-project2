class GestorReservas {
  static #confirmando = false;

  static async confirmar() {
    if (this.#confirmando) return;
    this.#confirmando = true;

    const bloqueId = EstadoPaciente.obtener('bloqueSeleccionado');
    const pacienteId = EstadoPaciente.obtener('pacienteId');
    const usuario = EstadoPaciente.obtener('usuario');

    if (!bloqueId || !pacienteId) {
      this.#confirmando = false;
      return;
    }

    if (usuario.pacientes?.bloqueado) {
      Fachada.mostrarMensaje('No es posible agendar en este momento', 'error');
      this.#confirmando = false;
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
        'confirmacion',
        null,
      );

      if (esReprogramacion) {
        Fachada.mostrarMensaje('Cita reprogramada exitosamente', 'exito');
        GestorReprogramacion.salir();
      } else {
        Fachada.mostrarMensaje('Cita reservada exitosamente', 'exito');
      }

      this.cerrarModal(true);
      this.#confirmando = false;

      const fechaSel = EstadoPaciente.obtener('fechaSeleccionada');
      await RenderizadorHorarios.cargar(fechaSel);
      await GestorProximaCita.cargar();
    } catch (error) {
      Fachada.mostrarMensaje('Error al reservar la cita', 'error');
      this.#confirmando = false;
      await RepositorioBloques.liberarTemporal(bloqueId);
    }
  }

  static async cerrarModal(reservaExitosa = false) {
    Fachada.cerrarModal('modal-reserva');

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
