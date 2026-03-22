class RenderizadorCalendarioPsicologo {
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
  static #CLASE_VACIO = 'calendario__dia--vacio';
  static #CLASE_HOY = 'calendario__dia--hoy';
  static #CLASE_CON_CITAS = 'calendario__dia--con-citas';

  static #contenedor = null;
  static #tituloMes = null;
  static #fechaActual = null;
  static #citasDelMes = {};

  static inicializar() {
    this.#contenedor = document.querySelector(this.#SELECTOR_CONTENEDOR);
    this.#tituloMes = document.querySelector(this.#SELECTOR_TITULO);
    this.#fechaActual = new Date();
    this.#agregarEventosNavegacion();
    this.#cargarYRenderizar();
  }

  static async #cargarYRenderizar() {
    try {
      const psicologoId = EstadoPsicologo.obtener('psicologoId');
      if (!psicologoId) return;

      const anio = this.#fechaActual.getFullYear();
      const mes = this.#fechaActual.getMonth();

      const primerDia = new Date(anio, mes, 1);
      const ultimoDia = new Date(anio, mes + 1, 0);
      const fechaInicio = FormateadorFecha.aISO(primerDia);
      const fechaFin = FormateadorFecha.aISO(ultimoDia);

      const citas = await RepositorioCitasPsicologo.obtenerPorPeriodo(
        psicologoId,
        fechaInicio,
        fechaFin,
      );

      this.#citasDelMes = {};
      citas.forEach((cita) => {
        const fecha = cita.bloques_horario?.fecha;
        if (fecha) {
          if (!this.#citasDelMes[fecha]) {
            this.#citasDelMes[fecha] = [];
          }
          this.#citasDelMes[fecha].push(cita);
        }
      });

      this.#renderizar();
    } catch (error) {
      console.error('Error al cargar calendario:', error);
    }
  }

  static #renderizar() {
    if (!this.#tituloMes || !this.#contenedor) {
      console.warn('Elementos del calendario no encontrados. Fragment podría no estar cargado.');
      return;
    }

    const anio = this.#fechaActual.getFullYear();
    const mes = this.#fechaActual.getMonth();

    this.#tituloMes.textContent = `${this.#NOMBRES_MESES[mes]} ${anio}`;

    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicioSemana = primerDia.getDay();

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
      const tieneCitas = this.#citasDelMes[fechaISO]?.length > 0;

      let clases = 'calendario__dia';

      if (fechaDia.getTime() === hoy.getTime()) {
        clases += ` ${this.#CLASE_HOY}`;
      }
      if (tieneCitas) {
        clases += ` ${this.#CLASE_CON_CITAS}`;
      }

      html += `<button class="${clases}" data-fecha="${fechaISO}">${dia}</button>`;
    }

    this.#contenedor.innerHTML = html;
    this.#agregarEventosDias();
  }

  static #agregarEventosDias() {
    this.#contenedor
      .querySelectorAll(`button.${this.#CLASE_CON_CITAS}`)
      .forEach((dia) => {
        dia.addEventListener('click', () => this.#mostrarCitasDia(dia));
      });
  }

  static async #mostrarCitasDia(elemento) {
    const fecha = elemento.dataset.fecha;
    const citasDelDia = this.#citasDelMes[fecha] || [];

    if (citasDelDia.length > 0) {
      RenderizadorCitas.renderizar(citasDelDia);
    }
  }

  static #agregarEventosNavegacion() {
    const btnAnterior = document.getElementById('btn-mes-anterior');
    const btnSiguiente = document.getElementById('btn-mes-siguiente');

    btnAnterior?.addEventListener('click', () => {
      this.#fechaActual.setMonth(this.#fechaActual.getMonth() - 1);
      this.#cargarYRenderizar();
    });

    btnSiguiente?.addEventListener('click', () => {
      this.#fechaActual.setMonth(this.#fechaActual.getMonth() + 1);
      this.#cargarYRenderizar();
    });
  }
}
