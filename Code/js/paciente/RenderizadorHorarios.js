class RenderizadorHorarios {
  static #seccion = null;
  static #lista = null;
  static #vacio = null;

  static inicializar() {
    this.#seccion = document.getElementById('seccion-horarios');
    this.#lista = document.getElementById('lista-horarios');
    this.#vacio = document.getElementById('sin-horarios');
  }

  static async cargar(fecha) {
    this.#seccion.classList.remove('horarios--oculto');
    this.#lista.innerHTML = '<p class="cargando">Cargando horarios...</p>';

    const bloques = await RepositorioBloques.obtenerPorFecha(fecha);

    if (bloques.length === 0) {
      this.#lista.innerHTML = '';
      this.#vacio.classList.remove('horarios__vacio--oculto');
      GestorListaEspera.mostrarBoton(fecha);
      return;
    }

    this.#vacio.classList.add('horarios__vacio--oculto');
    GestorListaEspera.ocultarBoton();

    let html = '';
    bloques.forEach((bloque) => {
      const hora = Fachada.formatearHora(bloque.hora_inicio);
      const bloqueado = bloque.estado === 'bloqueado_temporal';
      const clases =
        'horarios__boton' + (bloqueado ? ' horarios__boton--bloqueado' : '');
      html += `<button class="${clases}" data-bloque-id="${bloque.id}"${bloqueado ? ' disabled' : ''}>${hora}</button>`;
    });

    this.#lista.innerHTML = html;
    this.#agregarEventos();
  }

  static #agregarEventos() {
    this.#lista
      .querySelectorAll('.horarios__boton:not(.horarios__boton--bloqueado)')
      .forEach((btn) =>
        btn.addEventListener('click', () => this.#seleccionarHorario(btn)),
      );
  }

  static async #seleccionarHorario(boton) {
    const usuario = EstadoPaciente.obtener('usuario');
    if (usuario.pacientes?.bloqueado) {
      Fachada.mostrarMensaje(
        'No es posible agendar en este momento, comuníquese directamente con administración.',
        'error',
      );
      return;
    }

    const bloqueId = boton.dataset.bloqueId;
    const exito = await RepositorioBloques.bloquearTemporal(bloqueId);

    if (!exito) {
      Fachada.mostrarMensaje('Este horario ya no está disponible', 'error');
      await this.cargar(EstadoPaciente.obtener('fechaSeleccionada'));
      return;
    }

    EstadoPaciente.establecer('bloqueSeleccionado', bloqueId);

    this.#lista.querySelectorAll('.horarios__boton').forEach((b) => {
      b.classList.remove('horarios__boton--seleccionado');
    });
    boton.classList.add('horarios__boton--seleccionado');

    const fechaSel = EstadoPaciente.obtener('fechaSeleccionada');
    document.getElementById('resumen-fecha').textContent =
      Fachada.formatearFecha(new Date(fechaSel + 'T00:00:00'));
    document.getElementById('resumen-hora').textContent = boton.textContent;

    const esReprogramacion = EstadoPaciente.obtener('modoReprogramacion');
    const tituloModal = document.getElementById('titulo-modal-reserva');
    const textoConfirmacion = document.getElementById(
      'texto-confirmacion-reserva',
    );

    if (esReprogramacion) {
      tituloModal.textContent = 'Confirmar Reprogramación';
      textoConfirmacion.textContent =
        '¿Deseas reprogramar tu cita a este nuevo horario?';
    } else {
      tituloModal.textContent = 'Confirmar Reserva';
      textoConfirmacion.textContent = '¿Deseas confirmar esta cita?';
    }

    Fachada.abrirModal('modal-reserva');
  }
}
