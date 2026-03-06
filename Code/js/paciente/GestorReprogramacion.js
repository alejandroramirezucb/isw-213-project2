class GestorReprogramacion {
  static iniciar() {
    const citaId = EstadoPaciente.obtener('citaACancelar');
    if (!citaId) return;

    const fechaTexto =
      document.getElementById('proxima-cita-fecha')?.textContent;
    const horaTexto = document.getElementById('proxima-cita-hora')?.textContent;

    if (!this.#verificarLimite24h(fechaTexto, horaTexto)) {
      Fachada.mostrarMensaje(
        'No es posible reprogramar con menos de 24 horas de anticipación',
        'error',
      );
      return;
    }

    EstadoPaciente.establecer('modoReprogramacion', true);
    EstadoPaciente.establecer('citaAReprogramar', citaId);

    const banner = document.getElementById('banner-reprogramacion');
    const textoReprog = document.getElementById('texto-reprogramacion');
    banner.classList.remove('banner-reprogramacion--oculto');
    textoReprog.textContent =
      'Selecciona un nuevo día y horario para reprogramar tu cita';
  }

  static salir() {
    EstadoPaciente.establecer('modoReprogramacion', false);
    EstadoPaciente.establecer('citaAReprogramar', null);

    const banner = document.getElementById('banner-reprogramacion');
    banner.classList.add('banner-reprogramacion--oculto');
  }

  static #verificarLimite24h(fechaTexto, horaTexto) {
    if (!fechaTexto || !horaTexto) return false;

    const ahora = new Date();
    const meses = FormateadorFecha.MESES;
    const partes = fechaTexto.split(' de ');
    if (partes.length < 2) return true;

    const dia = parseInt(partes[0]);
    const mesIndex = meses.indexOf(partes[1]);
    if (mesIndex === -1) return true;

    const anio = ahora.getFullYear();
    const horaPartes = horaTexto.split(':');
    const fechaCita = new Date(
      anio,
      mesIndex,
      dia,
      parseInt(horaPartes[0]),
      parseInt(horaPartes[1]),
    );

    const diferenciaMs = fechaCita.getTime() - ahora.getTime();
    const horasRestantes = diferenciaMs / (1000 * 60 * 60);

    return horasRestantes >= 24;
  }
}
