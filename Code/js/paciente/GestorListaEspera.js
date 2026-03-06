class GestorListaEspera {
  static async inscribir() {
    const pacienteId = EstadoPaciente.obtener('pacienteId');
    const fecha = EstadoPaciente.obtener('fechaSeleccionada');
    if (!pacienteId || !fecha) return;

    const exito = await RepositorioListaEspera.inscribir(pacienteId, fecha);

    if (exito) {
      Fachada.mostrarMensaje(
        'Te notificaremos si se libera un turno para este día',
        'exito',
      );
      this.#actualizarBoton(true);
    } else {
      Fachada.mostrarMensaje(
        'Ya estás en la lista de espera para este día',
        'info',
      );
    }
  }

  static async mostrarBoton(fecha) {
    const contenedor = document.getElementById('contenedor-lista-espera');
    if (!contenedor) return;

    const pacienteId = EstadoPaciente.obtener('pacienteId');
    if (!pacienteId) {
      contenedor.classList.add('lista-espera--oculta');
      return;
    }

    const yaInscrito = await RepositorioListaEspera.verificarInscripcion(
      pacienteId,
      fecha,
    );

    contenedor.classList.remove('lista-espera--oculta');
    this.#actualizarBoton(yaInscrito);
  }

  static ocultarBoton() {
    const contenedor = document.getElementById('contenedor-lista-espera');
    if (contenedor) contenedor.classList.add('lista-espera--oculta');
  }

  static #actualizarBoton(inscrito) {
    const btn = document.getElementById('btn-lista-espera');
    if (!btn) return;

    if (inscrito) {
      btn.textContent = 'Ya estás en la lista de espera';
      btn.disabled = true;
    } else {
      btn.textContent = 'Avisarme si se libera un turno';
      btn.disabled = false;
    }
  }
}
