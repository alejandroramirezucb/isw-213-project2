class GestorProximaCita {
  static #SELECTOR_CONTENEDOR = '#proxima-cita';
  static #SELECTOR_FECHA = '#proxima-cita-fecha';
  static #SELECTOR_HORA = '#proxima-cita-hora';
  static #CLASE_OCULTO = 'tarjeta-cita--oculta';

  static #contenedor = null;

  static inicializar() {
    this.#contenedor = document.querySelector(this.#SELECTOR_CONTENEDOR);
  }

  static async cargar() {
    const pacienteId = EstadoPaciente.obtener('pacienteId');
    const cita = await RepositorioCitas.obtenerProxima(pacienteId);

    if (cita) {
      this.#contenedor.classList.remove(this.#CLASE_OCULTO);

      document.querySelector(this.#SELECTOR_FECHA).textContent =
        FormateadorFecha.aTextoCorto(
          new Date(cita.bloques_horario.fecha + 'T00:00:00'),
        );
      document.querySelector(this.#SELECTOR_HORA).textContent = FormateadorHora.formatear(
        cita.bloques_horario.hora_inicio,
      );

      EstadoPaciente.establecer('citaACancelar', cita.id);
    } else {
      this.#contenedor.classList.add(this.#CLASE_OCULTO);
      EstadoPaciente.establecer('citaACancelar', null);
    }
  }
}
