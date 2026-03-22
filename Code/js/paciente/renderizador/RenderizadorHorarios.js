class RenderizadorHorarios {
  static #SELECTOR_SECCION = '#seccion-horarios';
  static #SELECTOR_LISTA = '#lista-horarios';
  static #SELECTOR_VACIO = '#sin-horarios';
  static #SELECTOR_RESUMEN_FECHA = '#resumen-fecha';
  static #SELECTOR_RESUMEN_HORA = '#resumen-hora';
  static #SELECTOR_TITULO_MODAL = '#titulo-modal-reserva';
  static #SELECTOR_TEXTO_CONF = '#texto-confirmacion-reserva';

  static #CLASE_OCULTO = 'horarios--oculto';
  static #CLASE_BOTON_BLOQUEADO = 'horarios__boton--bloqueado';
  static #CLASE_BOTON_SELECT = 'horarios__boton--seleccionado';
  static #CLASE_VACIO_OCULTO = 'horarios__vacio--oculto';

  static #seccion = null;
  static #lista = null;
  static #vacio = null;
  static #resumenFecha = null;
  static #resumenHora = null;
  static #tituloModal = null;
  static #textoConf = null;

  static inicializar() {
    this.#seccion = document.querySelector(this.#SELECTOR_SECCION);
    this.#lista = document.querySelector(this.#SELECTOR_LISTA);
    this.#vacio = document.querySelector(this.#SELECTOR_VACIO);
    this.#resumenFecha = document.querySelector(this.#SELECTOR_RESUMEN_FECHA);
    this.#resumenHora = document.querySelector(this.#SELECTOR_RESUMEN_HORA);
    this.#tituloModal = document.querySelector(this.#SELECTOR_TITULO_MODAL);
    this.#textoConf = document.querySelector(this.#SELECTOR_TEXTO_CONF);
  }

  static async cargar(fecha) {
    if (!this.#seccion || !this.#lista || !this.#vacio) {
      console.warn('Elementos de horarios no encontrados. Fragment podría no estar cargado.');
      return;
    }

    this.#seccion.classList.remove(this.#CLASE_OCULTO);
    this.#lista.innerHTML = '<p class="cargando">Cargando horarios...</p>';

    const bloques = await RepositorioBloques.obtenerPorFecha(fecha);

    if (bloques.length === 0) {
      this.#lista.innerHTML = '';
      this.#vacio.classList.remove(this.#CLASE_VACIO_OCULTO);
      return;
    }

    this.#vacio.classList.add(this.#CLASE_VACIO_OCULTO);

    let html = '';
    bloques.forEach((bloque) => {
      const hora = FormateadorFachada.formatearHora(bloque.hora_inicio);
      const estaBloqueado = bloque.estado === 'bloqueado_temporal';
      const clases = `horarios__boton${
        estaBloqueado ? ` ${this.#CLASE_BOTON_BLOQUEADO}` : ''
      }`;
      const deshabilitado = estaBloqueado ? ' disabled' : '';

      html += `<button class="${clases}" data-bloque-id="${bloque.id}"${deshabilitado}>${hora}</button>`;
    });

    this.#lista.innerHTML = html;
    this.#agregarEventos();
  }

  static #agregarEventos() {
    this.#lista
      .querySelectorAll(`.horarios__boton:not(.${this.#CLASE_BOTON_BLOQUEADO})`)
      .forEach((btn) => {
        btn.addEventListener('click', () => this.#seleccionarHorario(btn));
      });
  }

  static async #seleccionarHorario(boton) {
    const usuario = EstadoPaciente.obtener('usuario');

    if (usuario?.pacientes?.bloqueado) {
      mostrarMensaje(
        'No es posible agendar en este momento, comuníquese directamente con administración.',
        'error',
      );
      return;
    }

    const bloqueId = boton.dataset.bloqueId;

    const exito = await RepositorioBloques.bloquearTemporal(bloqueId);
    if (!exito) {
      mostrarMensaje('Este horario ya no está disponible', 'error');
      await this.cargar(EstadoPaciente.obtener('fechaSeleccionada'));
      return;
    }

    EstadoPaciente.establecer('bloqueSeleccionado', bloqueId);

    this.#lista.querySelectorAll('.horarios__boton').forEach((b) => {
      b.classList.remove(this.#CLASE_BOTON_SELECT);
    });
    boton.classList.add(this.#CLASE_BOTON_SELECT);

    const fechaSel = EstadoPaciente.obtener('fechaSeleccionada');
    if (this.#resumenFecha) {
      this.#resumenFecha.textContent = FormateadorFachada.formatearFecha(
        new Date(fechaSel + 'T00:00:00'),
      );
    } else {
      console.warn('Elemento resumenFecha no encontrado.');
    }

    if (this.#resumenHora) {
      this.#resumenHora.textContent = boton.textContent;
    } else {
      console.warn('Elemento resumenHora no encontrado.');
    }

    const esReprogramacion = EstadoPaciente.obtener('modoReprogramacion');
    if (this.#tituloModal && this.#textoConf) {
      if (esReprogramacion) {
        this.#tituloModal.textContent = 'Confirmar Reprogramación';
        this.#textoConf.textContent =
          '¿Deseas reprogramar tu cita a este nuevo horario?';
      } else {
        this.#tituloModal.textContent = 'Confirmar Reserva';
        this.#textoConf.textContent = '¿Deseas confirmar esta cita?';
      }
    } else {
      console.warn('Elementos de modal no encontrados.');
    }

    NavigacionFachada.abrirModal('modal-reserva');
  }
}
