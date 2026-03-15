class GestorReprogramacion {
  static #SELECTOR_BANNER = '#banner-reprogramacion';
  static #SELECTOR_TEXTO = '#texto-reprogramacion';
  static #SELECTOR_PROXIMA_FECHA = '#proxima-cita-fecha';
  static #SELECTOR_PROXIMA_HORA = '#proxima-cita-hora';
  static #CLASE_OCULTO = 'banner-reprogramacion--oculto';
  static #TEXTO_REPROG =
    'Selecciona un nuevo día y horario para reprogramar tu cita';
  static #HORAS_MIN = 24;

  static iniciar() {
    const citaId = EstadoPaciente.obtener('citaACancelar');
    if (!citaId) return;

    const fechaTexto = document.querySelector(
      this.#SELECTOR_PROXIMA_FECHA,
    )?.textContent;
    const horaTexto = document.querySelector(
      this.#SELECTOR_PROXIMA_HORA,
    )?.textContent;

    if (!this.#verificarLimite24h(fechaTexto, horaTexto)) {
      MensajesFachada.mostrar(
        'No es posible reprogramar con menos de 24 horas de anticipación',
        'error',
      );
      return;
    }

    EstadoPaciente.establecer('modoReprogramacion', true);
    EstadoPaciente.establecer('citaAReprogramar', citaId);

    const banner = document.querySelector(this.#SELECTOR_BANNER);
    const textoReprog = document.querySelector(this.#SELECTOR_TEXTO);
    banner.classList.remove(this.#CLASE_OCULTO);
    textoReprog.textContent = this.#TEXTO_REPROG;
  }

  static salir() {
    EstadoPaciente.establecer('modoReprogramacion', false);
    EstadoPaciente.establecer('citaAReprogramar', null);

    const banner = document.querySelector(this.#SELECTOR_BANNER);
    banner.classList.add(this.#CLASE_OCULTO);
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

    return horasRestantes >= this.#HORAS_MIN;
  }
}
