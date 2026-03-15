class RenderizadorCalendario {
  static #NOMBRES_MESES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  static #SELECTOR_CONTENEDOR = '#calendario-dias';
  static #SELECTOR_TITULO = '#calendario-mes';
  static #SELECTOR_FECHA_SELECT = '#fecha-seleccionada';
  static #CLASE_VACIO = 'calendario__dia--vacio';
  static #CLASE_HOY = 'calendario__dia--hoy';
  static #CLASE_PASADO = 'calendario__dia--pasado';
  static #CLASE_SIN_DISP = 'calendario__dia--sin-disponibilidad';
  static #CLASE_SELECCIONADO = 'calendario__dia--seleccionado';

  static #contenedor = null;
  static #tituloMes = null;
  static #fechaSelectElement = null;

  static inicializar() {
    this.#contenedor = document.querySelector(this.#SELECTOR_CONTENEDOR);
    this.#tituloMes = document.querySelector(this.#SELECTOR_TITULO);
    this.#fechaSelectElement = document.querySelector(
      this.#SELECTOR_FECHA_SELECT,
    );
  }

  static async renderizar() {
    const fechaActual = EstadoPaciente.obtener('fechaActual');
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();

    this.#tituloMes.textContent = `${this.#NOMBRES_MESES[mes]} ${anio}`;

    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicioSemana = primerDia.getDay();

    const disponibilidad = await RepositorioBloques.obtenerDisponibilidadMes(
      anio,
      mes,
    );

    let html = '';
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = 0; i < diaInicioSemana; i++) {
      html += `<button class="calendario__dia ${this.#CLASE_VACIO}"></button>`;
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaDia = new Date(anio, mes, dia);
      fechaDia.setHours(0, 0, 0, 0);
      const fechaISO = FormateadorFecha.aISO(fechaDia);

      let clases = 'calendario__dia';
      const esPasado = fechaDia < hoy;

      if (fechaDia.getTime() === hoy.getTime()) {
        clases += ` ${this.#CLASE_HOY}`;
      }
      if (esPasado) {
        clases += ` ${this.#CLASE_PASADO}`;
      }
      if (!disponibilidad[fechaISO] && !esPasado) {
        clases += ` ${this.#CLASE_SIN_DISP}`;
      }

      const deshabilitado = esPasado ? ' disabled' : '';
      html += `<button class="${clases}" data-fecha="${fechaISO}"${deshabilitado}>${dia}</button>`;
    }

    this.#contenedor.innerHTML = html;
    this.#agregarEventos();
  }

  static #agregarEventos() {
    this.#contenedor
      .querySelectorAll(
        `.calendario__dia:not(.${this.#CLASE_VACIO}):not(.${this.#CLASE_PASADO})`,
      )
      .forEach((dia) => {
        dia.addEventListener('click', () => this.#seleccionarDia(dia));
      });
  }

  static async #seleccionarDia(elemento) {
    const fecha = elemento.dataset.fecha;

    this.#contenedor.querySelectorAll('.calendario__dia').forEach((d) => {
      d.classList.remove(this.#CLASE_SELECCIONADO);
    });

    elemento.classList.add(this.#CLASE_SELECCIONADO);
    EstadoPaciente.establecer('fechaSeleccionada', fecha);

    if (this.#fechaSelectElement) {
      this.#fechaSelectElement.textContent =
        FormateadorFachada.formatearFechaCorta(new Date(fecha + 'T00:00:00'));
    }

    await RenderizadorHorarios.cargar(fecha);
  }
}
