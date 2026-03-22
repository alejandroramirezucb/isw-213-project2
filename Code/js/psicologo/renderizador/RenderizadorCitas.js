class RenderizadorCitas {
  static #tituloPeriodo = null;
  static #fechaActual = null;
  static #totalCitas = null;
  static #siguienteCita = null;
  static #lista = null;
  static #sinCitas = null;

  static inicializar() {
    this.#tituloPeriodo = document.getElementById('titulo-periodo');
    this.#fechaActual = document.getElementById('fecha-actual');
    this.#totalCitas = document.getElementById('total-citas-dia');
    this.#siguienteCita = document.getElementById('siguiente-cita-hora');
    this.#lista = document.getElementById('lista-citas-panel');
    this.#sinCitas = document.getElementById('sin-citas-panel');
  }

  static calcularFechas(periodo) {
    const hoy = new Date();
    const fechaInicio = FormateadorFecha.aISO(hoy);
    let fechaFin = fechaInicio;

    if (periodo === 'semana') {
      const finSemana = new Date(hoy);
      finSemana.setDate(hoy.getDate() + (6 - hoy.getDay()));
      fechaFin = FormateadorFecha.aISO(finSemana);
    }

    return { inicio: fechaInicio, fin: fechaFin };
  }

  static actualizarTitulo(periodo, fechas) {
    if (!this.#tituloPeriodo || !this.#fechaActual) {
      console.warn('Elementos titulo/fecha no encontrados. Fragment podría no estar cargado.');
      return;
    }

    if (periodo === 'semana') {
      this.#tituloPeriodo.textContent = 'Citas de la Semana';
      this.#fechaActual.textContent = `${FormateadorFecha.aTextoCorto(new Date(fechas.inicio + 'T00:00:00'))} - ${FormateadorFecha.aTextoCorto(new Date(fechas.fin + 'T00:00:00'))}`;
    } else {
      this.#tituloPeriodo.textContent = 'Citas de Hoy';
      this.#fechaActual.textContent = FormateadorFecha.aTextoCorto(new Date());
    }
  }

  static actualizarResumen(citas, esHoy) {
    if (!this.#totalCitas || !this.#siguienteCita) {
      console.warn('Elementos resumen no encontrados. Fragment podría no estar cargado.');
      return;
    }

    this.#totalCitas.textContent = citas.length;

    if (esHoy && citas.length > 0) {
      const ahora = new Date();
      const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

      const siguienteCita = citas.find(
        (c) => c.bloques_horario.hora_inicio.substring(0, 5) > horaActual,
      );
      this.#siguienteCita.textContent = siguienteCita
        ? `${FormateadorFecha.aTextoCorto(new Date(siguienteCita.bloques_horario.fecha + 'T00:00:00'))} - ${FormateadorHora.formatear(siguienteCita.bloques_horario.hora_inicio)}`
        : 'Ninguna';
    } else {
      this.#siguienteCita.textContent =
        citas.length > 0
          ? `${FormateadorFecha.aTextoCorto(new Date(citas[0].bloques_horario.fecha + 'T00:00:00'))} - ${FormateadorHora.formatear(citas[0].bloques_horario.hora_inicio)}`
          : '--:--';
    }
  }

  static renderizar(citas) {
    if (!this.#lista || !this.#sinCitas) {
      console.warn('Elementos lista/sinCitas no encontrados. Fragment podría no estar cargado.');
      return;
    }

    if (citas.length === 0) {
      this.#lista.innerHTML = '';
      this.#sinCitas.classList.remove('mensaje-vacio--oculto');
      return;
    }

    this.#sinCitas.classList.add('mensaje-vacio--oculto');

    let html = '';
    citas.forEach((cita) => {
      html += `<article class="cita-item" data-cita-id="${cita.id}">
        <div class="cita-item__info">
          <span class="cita-item__fecha">${FormateadorFecha.aTextoCorto(new Date(cita.bloques_horario.fecha + 'T00:00:00'))}</span>
          <span class="cita-item__hora">${FormateadorHora.formatear(cita.bloques_horario.hora_inicio)}</span>
          <span class="cita-item__paciente">${cita.pacientes.nombre} ${cita.pacientes.apellido}</span>
        </div>
        <span class="cita-item__estado cita-item__estado--confirmada">Confirmada</span>
      </article>`;
    });

    this.#lista.innerHTML = html;
    this.#agregarEventos();
  }

  static #agregarEventos() {
    this.#lista
      .querySelectorAll('.cita-item')
      .forEach((item) =>
        item.addEventListener('click', () =>
          GestorDetalleCita.mostrar(item.dataset.citaId),
        ),
      );
  }

  static async cargarPeriodo(periodo) {
    const psicologoId = EstadoPsicologo.obtener('psicologoId');
    const fechas = this.calcularFechas(periodo);

    this.actualizarTitulo(periodo, fechas);

    const citas = await RepositorioCitasPsicologo.obtenerPorPeriodo(
      psicologoId,
      fechas.inicio,
      fechas.fin,
    );
    EstadoPsicologo.establecer('citasCargadas', citas);

    this.actualizarResumen(citas, periodo === 'hoy');
    this.renderizar(citas);
  }
}
