class EstadoPsicologo {
  static #estado = {
    usuario: null,
    psicologoId: null,
    citaSeleccionada: null,
    citasCargadas: [],
  };

  static obtener(clave) {
    return this.#estado[clave];
  }

  static establecer(clave, valor) {
    this.#estado[clave] = valor;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EstadoPsicologo;
}
