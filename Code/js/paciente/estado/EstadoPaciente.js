class EstadoPaciente {
  static #estado = {
    usuario: null,
    pacienteId: null,
    fechaActual: new Date(),
    fechaSeleccionada: null,
    bloqueSeleccionado: null,
    citaACancelar: null,
    citaAReprogramar: null,
    modoReprogramacion: false,
  };

  static obtener(clave) {
    return this.#estado[clave];
  }

  static establecer(clave, valor) {
    this.#estado[clave] = valor;
  }

  static reiniciarBloque() {
    this.#estado.bloqueSeleccionado = null;
  }
}
