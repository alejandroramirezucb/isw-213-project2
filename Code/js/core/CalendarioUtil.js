class CalendarioUtil {
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

  static obtenerNombreMes(mesIndex) {
    return this.#NOMBRES_MESES[mesIndex];
  }

  static renderizarMes(fechaActual, citasDelMes = {}, opciones = {}) {
    const {
      selectorContenedor = '#calendario-dias',
      selectorTitulo = '#calendario-mes',
      claseDia = 'calendario__dia',
      claseVacio = 'calendario__dia--vacio',
      claseHoy = 'calendario__dia--hoy',
      claseConCitas = 'calendario__dia--con-citas',
      soloLeer = false,
    } = opciones;

    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();

    const tituloElement = document.querySelector(selectorTitulo);
    if (tituloElement) {
      tituloElement.textContent = `${this.#NOMBRES_MESES[mes]} ${anio}`;
    }

    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicioSemana = primerDia.getDay();

    let html = '';
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = 0; i < diaInicioSemana; i++) {
      html += `<div class="${claseDia} ${claseVacio}"></div>`;
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaDia = new Date(anio, mes, dia);
      fechaDia.setHours(0, 0, 0, 0);
      const fechaISO = FormateadorFecha.aISO(fechaDia);
      const citasDelDia = citasDelMes[fechaISO] || [];

      let clase = claseDia;

      if (fechaDia.getTime() === hoy.getTime()) {
        clase += ` ${claseHoy}`;
      }

      if (citasDelDia.length > 0) {
        clase += ` ${claseConCitas}`;
      }

      const indicadores =
        citasDelDia.length > 0
          ? `<div class="calendario__indicadores">
          ${citasDelDia.map(() => `<span class="calendario__punto"></span>`).join('')}
        </div>`
          : '';

      html += `<div class="${clase}" data-fecha="${fechaISO}">
        <span class="${claseDia}__numero">${dia}</span>
        ${indicadores}
      </div>`;
    }

    const contenedor = document.querySelector(selectorContenedor);
    if (contenedor) {
      contenedor.innerHTML = html;
    }

    return html;
  }

  static obtenerIntervaloMes(fecha) {
    const anio = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);

    return {
      inicio: FormateadorFecha.aISO(primerDia),
      fin: FormateadorFecha.aISO(ultimoDia),
    };
  }
}

window.CalendarioUtil = CalendarioUtil;
