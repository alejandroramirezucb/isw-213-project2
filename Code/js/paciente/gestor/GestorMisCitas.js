class GestorMisCitas {
  static #SELECTOR_LISTA = '#lista-mis-citas';
  static #SELECTOR_VACIO = '#sin-citas';
  static #CLASE_VACIO_OCULTO = 'mensaje-vacio--oculto';

  static #lista = null;
  static #vacio = null;
  static #filtroActual = 'proximas';

  static inicializar() {
    this.#lista = document.querySelector(this.#SELECTOR_LISTA);
    this.#vacio = document.querySelector(this.#SELECTOR_VACIO);
  }

  static async cargar(filtro = 'proximas') {
    this.#filtroActual = filtro;
    const pacienteId = EstadoPaciente.obtener('pacienteId');
    const citas = await RepositorioCitas.obtenerPorFiltro(pacienteId, filtro);

    if (citas.length === 0) {
      this.#lista.innerHTML = '';
      this.#vacio.classList.remove(this.#CLASE_VACIO_OCULTO);
      return;
    }

    this.#vacio.classList.add(this.#CLASE_VACIO_OCULTO);

    let html = '';
    citas.forEach((cita) => {
      if (!cita.bloques_horario) return;

      const estadoClase = `cita-item__estado--${cita.estado}`;
      const estadoTexto =
        cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1);

      html += `<article class="cita-item" data-cita-id="${cita.id}" data-estado="${cita.estado}">
        <div class="cita-item__info">
          <span class="cita-item__fecha">${FormateadorFecha.aTextoCorto(
            new Date(cita.bloques_horario.fecha + 'T00:00:00'),
          )}</span>
          <span class="cita-item__hora">${FormateadorHora.formatear(
            cita.bloques_horario.hora_inicio,
          )}</span>
        </div>
        <span class="cita-item__estado ${estadoClase}">${estadoTexto}</span>
      </article>`;
    });

    this.#lista.innerHTML = html;
    this.#agregarEventos(citas);
  }

  static #agregarEventos(citas) {
    this.#lista.querySelectorAll('.cita-item').forEach((elemento) => {
      elemento.addEventListener('click', () => {
        const citaId = elemento.dataset.citaId;
        const cita = citas.find((c) => c.id === citaId);

        if (cita && this.#filtroActual === 'proximas') {
          EstadoPaciente.establecer('citaACancelar', citaId);
          GestorCancelacion.mostrarModal();
        }
      });
    });
  }
}
