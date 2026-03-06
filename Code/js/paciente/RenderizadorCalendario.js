class RenderizadorCalendario {
  static #contenedor = null;
  static #tituloMes = null;

  static inicializar() {
    this.#contenedor = document.getElementById('calendario-dias');
    this.#tituloMes = document.getElementById('calendario-mes');
  }

  static async renderizar() {
    const fechaActual = EstadoPaciente.obtener('fechaActual');
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();

    this.#tituloMes.textContent = `${FormateadorFecha.MESES[mes]} ${anio}`;

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
      html +=
        '<button class="calendario__dia calendario__dia--vacio"></button>';
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaDia = new Date(anio, mes, dia);
      fechaDia.setHours(0, 0, 0, 0);
      const fechaISO = Fachada.obtenerFechaISO(fechaDia);

      let clases = 'calendario__dia';
      const esPasado = fechaDia < hoy;

      if (fechaDia.getTime() === hoy.getTime())
        clases += ' calendario__dia--hoy';
      if (esPasado) clases += ' calendario__dia--pasado';
      if (!disponibilidad[fechaISO] && !esPasado)
        clases += ' calendario__dia--sin-disponibilidad';

      html += `<button class="${clases}" data-fecha="${fechaISO}"${esPasado ? ' disabled' : ''}>${dia}</button>`;
    }

    this.#contenedor.innerHTML = html;
    this.#agregarEventos();
  }

  static #agregarEventos() {
    this.#contenedor
      .querySelectorAll(
        '.calendario__dia:not(.calendario__dia--vacio):not(.calendario__dia--pasado)',
      )
      .forEach((dia) =>
        dia.addEventListener('click', () => this.#seleccionarDia(dia)),
      );
  }

  static async #seleccionarDia(elemento) {
    const fecha = elemento.dataset.fecha;

    this.#contenedor.querySelectorAll('.calendario__dia').forEach((d) => {
      d.classList.remove('calendario__dia--seleccionado');
    });
    elemento.classList.add('calendario__dia--seleccionado');

    EstadoPaciente.establecer('fechaSeleccionada', fecha);
    document.getElementById('fecha-seleccionada').textContent =
      Fachada.formatearFechaCorta(new Date(fecha + 'T00:00:00'));

    await RenderizadorHorarios.cargar(fecha);
  }
}
