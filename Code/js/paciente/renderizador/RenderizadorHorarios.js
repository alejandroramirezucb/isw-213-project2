class RenderizadorHorarios {
  static #SELECTOR_SECCION = '#seccion-horarios';
  static #SELECTOR_LISTA = '#lista-horarios';
  static #SELECTOR_VACIO = '#sin-horarios';
  static #SELECTOR_CONTENEDOR_ESPERA = '#contenedor-lista-espera';
  static #SELECTOR_BTN_ESPERA = '#btn-lista-espera';
  static #SELECTOR_RESUMEN_FECHA = '#resumen-fecha';
  static #SELECTOR_RESUMEN_HORA = '#resumen-hora';
  static #SELECTOR_TITULO_MODAL = '#titulo-modal-reserva';
  static #SELECTOR_TEXTO_CONF = '#texto-confirmacion-reserva';
  static #SELECTOR_CITAS_DEL_DIA = '#citas-del-dia';
  static #SELECTOR_LISTA_CITAS_DEL_DIA = '#lista-citas-del-dia';

  static #CLASE_OCULTO = 'horarios--oculto';
  static #CLASE_BOTON_BLOQUEADO = 'horarios__boton--bloqueado';
  static #CLASE_BOTON_SELECT = 'horarios__boton--seleccionado';
  static #CLASE_VACIO_OCULTO = 'horarios__vacio--oculto';
  static #CLASE_ESPERA_OCULTA = 'lista-espera--oculta';
  static #CLASE_CITAS_OCULTAS = 'citas-del-dia--oculto';

  static #seccion = null;
  static #lista = null;
  static #vacio = null;
  static #contenedorEspera = null;
  static #btnEspera = null;
  static #resumenFecha = null;
  static #resumenHora = null;
  static #tituloModal = null;
  static #textoConf = null;
  static #citasDelDia = null;
  static #listaCitasDelDia = null;

  static inicializar() {
    this.#seccion = document.querySelector(this.#SELECTOR_SECCION);
    this.#lista = document.querySelector(this.#SELECTOR_LISTA);
    this.#vacio = document.querySelector(this.#SELECTOR_VACIO);
    this.#contenedorEspera = document.querySelector(this.#SELECTOR_CONTENEDOR_ESPERA);
    this.#btnEspera = document.querySelector(this.#SELECTOR_BTN_ESPERA);
    this.#resumenFecha = document.querySelector(this.#SELECTOR_RESUMEN_FECHA);
    this.#resumenHora = document.querySelector(this.#SELECTOR_RESUMEN_HORA);
    this.#tituloModal = document.querySelector(this.#SELECTOR_TITULO_MODAL);
    this.#textoConf = document.querySelector(this.#SELECTOR_TEXTO_CONF);
    this.#citasDelDia = document.querySelector(this.#SELECTOR_CITAS_DEL_DIA);
    this.#listaCitasDelDia = document.querySelector(this.#SELECTOR_LISTA_CITAS_DEL_DIA);
  }

  static async cargar(fecha) {
    if (!this.#seccion || !this.#lista || !this.#vacio) {
      console.warn('Elementos de horarios no encontrados. Fragment podría no estar cargado.');
      return;
    }

    this.#seccion.classList.remove(this.#CLASE_OCULTO);
    this.#lista.innerHTML = '<p class="cargando">Cargando horarios...</p>';

    this.#mostrarCitasDelDia(fecha);

    const bloques = await RepositorioBloques.obtenerPorFecha(fecha);

    if (bloques.length === 0) {
      this.#lista.innerHTML = '';
      this.#vacio.classList.remove(this.#CLASE_VACIO_OCULTO);
      if (this.#contenedorEspera) {
        this.#contenedorEspera.classList.remove(this.#CLASE_ESPERA_OCULTA);
        this.#agregarEventoListaEspera(fecha);
      }
      return;
    }

    this.#vacio.classList.add(this.#CLASE_VACIO_OCULTO);
    if (this.#contenedorEspera) {
      this.#contenedorEspera.classList.add(this.#CLASE_ESPERA_OCULTA);
    }

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
      MensajesFachada.mostrar(
        'No es posible agendar en este momento, comuníquese directamente con administración.',
        'error',
      );
      return;
    }

    const bloqueId = boton.dataset.bloqueId;

    const exito = await RepositorioBloques.bloquearTemporal(bloqueId);
    if (!exito) {
      MensajesFachada.mostrar('Este horario ya no está disponible', 'error');
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

  static #agregarEventoListaEspera(fecha) {
    if (!this.#btnEspera) return;

    const btnClon = this.#btnEspera.cloneNode(true);
    this.#btnEspera.parentNode.replaceChild(btnClon, this.#btnEspera);
    this.#btnEspera = btnClon;

    this.#btnEspera.addEventListener('click', async () => {
      const usuario = EstadoPaciente.obtener('usuario');
      if (!usuario) {
        MensajesFachada.mostrar('Debes iniciar sesión para unirte a la lista de espera', 'error');
        return;
      }

      const psicologoId = EstadoPaciente.obtener('psicologoId');
      if (!psicologoId) {
        MensajesFachada.mostrar('Error: No se pudo identificar el psicólogo', 'error');
        return;
      }

      const gestor = new GestorListaEspera(usuario.paciente_id, psicologoId);
      const fechaFormato = FormateadorFachada.formatearFecha(new Date(fecha + 'T00:00:00'));
      
      await gestor.mostrarModalListaEspera(fecha, fechaFormato);
    });
  }

  static #mostrarCitasDelDia(fecha) {
    if (!this.#citasDelDia || !this.#listaCitasDelDia) return;

    const citasPorFecha = EstadoPaciente.obtener('citasPorFecha');
    const citasDelDia = citasPorFecha?.[fecha] || [];

    if (citasDelDia.length === 0) {
      this.#citasDelDia.classList.add(this.#CLASE_CITAS_OCULTAS);
      return;
    }

    this.#citasDelDia.classList.remove(this.#CLASE_CITAS_OCULTAS);

    let html = '';
    citasDelDia.forEach((cita) => {
      const bloque = cita.bloques_horario;
      if (!bloque) return;

      const hora = FormateadorFachada.formatearHora(bloque.hora_inicio);
      const psicologoNombre = cita.psicologo?.usuario?.nombre || 'Psicólogo';

      html += `
        <div class="cita-item">
          <div class="cita-item__contenido">
            <p class="cita-item__hora">${hora}</p>
            <p class="cita-item__psicologo">Con ${psicologoNombre}</p>
          </div>
          <span class="cita-item__estado">${cita.estado}</span>
        </div>
      `;
    });

    this.#listaCitasDelDia.innerHTML = html;
  }
}
