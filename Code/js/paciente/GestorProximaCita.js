class GestorProximaCita {
  static #contenedor = null;

  static inicializar() {
    this.#contenedor = document.getElementById('proxima-cita');
  }

  static async cargar() {
    const pacienteId = EstadoPaciente.obtener('pacienteId');
    const cita = await RepositorioCitas.obtenerProxima(pacienteId);

    if (cita) {
      this.#contenedor.classList.remove('tarjeta-cita--oculta');
      document.getElementById('proxima-cita-fecha').textContent =
        Fachada.formatearFechaCorta(
          new Date(cita.bloques_horario.fecha + 'T00:00:00'),
        );
      document.getElementById('proxima-cita-hora').textContent =
        Fachada.formatearHora(cita.bloques_horario.hora_inicio);
      EstadoPaciente.establecer('citaACancelar', cita.id);
    } else {
      this.#contenedor.classList.add('tarjeta-cita--oculta');
      EstadoPaciente.establecer('citaACancelar', null);
    }
  }
}
